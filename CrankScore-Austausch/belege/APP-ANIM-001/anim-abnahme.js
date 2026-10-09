// Abnahme APP-ANIM-001: alle Animationspunkte aus Codex' Auftrag, Chromium (Playwright)
// Aufruf: node anim-abnahme.js <ausgabeordner>   (Server :8770 laeuft ueber ms.sh)
// Voraussetzung: im Repo-Ordner "python3 -m http.server 8770 --bind 127.0.0.1" starten; Playwright mit Chromium global installiert.
// Stand der Pruefung: Commit 0b595f5, Chromium 141.0.7390.37, 08.10.2026. Ausgabe: anim-abnahme-lauf.txt
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs = require('fs');
const OUT = process.argv[2] || '.';
const URL = 'http://127.0.0.1:8770/index.html';
const erg = [];
const notiz = (bereich, cfg, ok, text) => { erg.push({bereich, cfg, ok, text}); console.log(`${ok ? 'OK  ' : 'FEHL'} [${cfg}] ${bereich}: ${text}`); };
const s = ms => new Promise(r => setTimeout(r, ms));
const TH = d => d === 'hell' ? 'light' : 'oled';

const CFG = [
  {name:'Desktop 1280x800', ctx:{viewport:{width:1280, height:800}}, mobil:false},
  {name:'Handy 390x844 Touch', ctx:{viewport:{width:390, height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true}, mobil:true},
  {name:'Handy ohne View Transitions (Safari-Fallback emuliert)', ctx:{viewport:{width:390, height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true}, mobil:true, ohneVT:true},
  {name:'Desktop ohne View Transitions (Safari-Fallback emuliert)', ctx:{viewport:{width:1280, height:800}}, mobil:false, ohneVT:true},
  {name:'Handy Bewegung reduzieren', ctx:{viewport:{width:390, height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true, reducedMotion:'reduce'}, mobil:true, reduziert:true},
];

(async () => {
  const b = await chromium.launch();
  // Hilfsseite zum Auswerten von Bildschirmfotos (mittlere Helligkeit, Anteil fast weisser Pixel)
  const hp = await b.newPage();
  const bildwert = async buf => hp.evaluate(async b64 => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data; let sum = 0, n = 0, weiss = 0;
    for(let i = 0; i < d.length; i += 4 * 7){ const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; sum += l; n++; if(l > 250) weiss++; }
    return {l: Math.round(sum / n), w: Math.round(weiss / n * 1000) / 10};
  }, buf.toString('base64'));

  for(const cfg of CFG){
    const ctx = await b.newContext(cfg.ctx);
    if(cfg.ohneVT) await ctx.addInitScript(() => { delete Document.prototype.startViewTransition; });
    await ctx.addInitScript(() => {
      window.__vt = 0;
      if(Document.prototype.startViewTransition){ const o = Document.prototype.startViewTransition; Document.prototype.startViewTransition = function(){ window.__vt++; return o.apply(this, arguments); }; }
      document.addEventListener('DOMContentLoaded', () => { window.__themeBeimLaden = document.documentElement.dataset.theme || 'oled'; window.__metaBeimLaden = (document.querySelector('meta[name="theme-color"]') || {}).content; });
    });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if(m.type() === 'error' && !/status of 404/.test(m.text())) errs.push('console: ' + m.text()); });
    p.on('response', r => { if(r.status() >= 400 && !/\/(preise|preisverlauf)\.json$/.test(r.url())) errs.push(r.status() + ' ' + r.url()); });
    const cdp = await ctx.newCDPSession(p); await cdp.send('Animation.enable');
    await p.goto(URL);
    await p.evaluate(() => { localStorage.clear(); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); });
    await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function'); await p.waitForTimeout(900);
    const tap = async (x, y) => cfg.mobil ? p.touchscreen.tap(x, y) : p.mouse.click(x, y);
    const mitte = async sel => p.evaluate(sel => { const el = [...document.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight; }); if(!el) return null; const r = el.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; }, sel);
    const menueAuf = async () => { await p.evaluate(() => { oeffneMenu(); }); await p.waitForTimeout(450); await p.evaluate(() => document.querySelector('#modal .seg').scrollIntoView({block:'center'})); await p.waitForTimeout(100); };
    const ruhe = async () => p.waitForFunction(() => !designVT && !document.documentElement.classList.contains('design-wechsel'), null, {timeout: 4000}).then(() => true, () => false);
    const zustand = () => p.evaluate(() => ({theme: document.documentElement.dataset.theme || 'oled', speicher: localStorage.getItem('mtb.design'), meta: document.querySelector('meta[name="theme-color"]').content,
      seg: (document.querySelector('.seg') || {dataset:{}}).dataset.wahl, pressed: [...document.querySelectorAll('[data-design]')].filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.dataset.design).join(',')}));
    const C = cfg.name;
    console.log(`\n===== ${C}`);
    const vtDa = await p.evaluate(() => typeof document.startViewTransition === 'function');
    notiz('Ausgangslage', C, cfg.ohneVT ? !vtDa : true, `View Transitions im Browser: ${vtDa ? 'ja' : 'nein'}`);

    // 1) Hell -> Dunkel und Dunkel -> Hell, echtes Antippen im Menue
    for(const [ziel, richtung] of [['hell', 'Dunkel -> Hell'], ['oled', 'Hell -> Dunkel']]){
      await menueAuf();
      const k = await mitte(`.seg [data-design="${ziel}"]`);
      if(cfg.reduziert || cfg.ohneVT){
        // Ohne View Transition: Farben direkt messen (Fallback-Uebergaenge laufen auf den Elementen)
        await p.evaluate(() => { window.__probe = []; const karte = document.querySelector('#modal .sheet') || document.body; const f = () => { window.__probe.push([performance.now(), getComputedStyle(document.body).backgroundColor, getComputedStyle(karte).backgroundColor, getComputedStyle(karte).color]); if(window.__probe.length < 40) requestAnimationFrame(f); }; requestAnimationFrame(f); });
        await tap(k.x, k.y);
        const direkt = await p.evaluate(() => document.documentElement.dataset.theme || 'oled');
        await p.waitForTimeout(700);
        const pr = await p.evaluate(() => window.__probe);
        const lum = c => { const m = c.match(/[\d.]+/g).map(Number); return Math.round(0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]); };
        const L = pr.map(x => lum(x[2])), B = pr.map(x => lum(x[1]));
        const auf = ziel === 'hell';
        const mono = a => a.every((v, i) => i === 0 || (auf ? v >= a[i - 1] - 1 : v <= a[i - 1] + 1));
        const zw = new Set(L).size;
        const klasseWeg = await p.evaluate(() => !document.documentElement.classList.contains('design-wechsel'));
        const tz = pr.map(x => x[0]); const ab = tz.slice(1).map((t, i) => Math.round(t - tz[i])); const iEnde = L.findIndex(v => v === L[L.length - 1]); const bilder = Math.max(0, iEnde); const ersterFrame = ab[0], laengster = Math.max(...ab.slice(0, Math.max(1, iEnde)));
        if(cfg.reduziert){
          notiz(`Designwechsel ${richtung}`, C, direkt === TH(ziel) && zw <= 2 && await p.evaluate(() => window.__vt === 0), `sofort umgeschaltet (Theme direkt nach dem Tipp: ${direkt}), Zwischenwerte Blatt-Hintergrund: ${zw - 1}, View Transitions gestartet: ${await p.evaluate(() => window.__vt)}`);
        } else {
          notiz(`Designwechsel ${richtung}`, C, mono(L) && mono(B) && zw >= 4 && klasseWeg, `Farbuebergang: Blatt ${[...new Set(L)].join('>')}, Seite ${[...new Set(B)].join('>')}; stetig ohne Aufblitzen: ${mono(L) && mono(B)}; Uebergangsklasse danach entfernt: ${klasseWeg}; Bilder bis zum Ziel: ${bilder}, Bildabstaende ms: ${ab.slice(0, Math.max(1, iEnde)).join(' ')}`);
        }
      } else {
        // Mit View Transition: Bildschirmfotos in Zeitlupe (Wiedergabe 5 %), mittlere Helligkeit je Bild
        const vorher = await bildwert(await p.screenshot());
        await cdp.send('Animation.setPlaybackRate', {playbackRate: 0.05});
        await tap(k.x, k.y);
        const reihe = [];
        for(let i = 0; i < 9; i++){ await p.waitForTimeout(650); reihe.push(await bildwert(await p.screenshot())); }
        await cdp.send('Animation.setPlaybackRate', {playbackRate: 1});
        await ruhe(); await p.waitForTimeout(200);
        const nachher = await bildwert(await p.screenshot({path: `${OUT}/abnahme-${cfg.mobil ? 'handy' : 'desktop'}-${ziel}.png`}));
        const werte = [vorher, ...reihe, nachher];
        const auf = ziel === 'hell';
        const L = werte.map(x => x.l);
        const mono = L.every((v, i) => i === 0 || (auf ? v >= L[i - 1] - 2 : v <= L[i - 1] + 2));
        const lo = Math.min(vorher.l, nachher.l) - 2, hi = Math.max(vorher.l, nachher.l) + 2;
        const imRahmen = L.every(v => v >= lo && v <= hi);
        const weissMax = Math.max(...werte.map(x => x.w)), weissEnde = Math.max(vorher.w, nachher.w);
        const zw = reihe.filter(x => x.l > lo + 4 && x.l < hi - 4).length;
        notiz(`Designwechsel ${richtung}`, C, mono && imRahmen && weissMax <= weissEnde + 1 && zw >= 3 && await p.evaluate(() => window.__vt > 0),
          `Helligkeit je Bild ${L.join(' > ')}; stetig: ${mono}; nie heller/dunkler als Anfang und Ende: ${imRahmen}; weisse Flaeche max ${weissMax} % (Endzustaende ${vorher.w}/${nachher.w} %); Zwischenbilder: ${zw}`);
      }
      const z = await zustand();
      notiz(`Endzustand ${richtung}`, C, z.theme === TH(ziel) && z.speicher === (ziel === 'hell' ? 'hell' : 'oled') && z.seg === ziel && z.pressed === ziel && z.meta === (ziel === 'hell' ? '#f2f2f7' : '#000000'), JSON.stringify(z));
      await p.evaluate(() => schliesse()); await p.waitForTimeout(300);
    }

    // 2) Schnelles Umschalten: 7 echte Tipps im Abstand von 50 ms, von beiden Startzustaenden
    for(const folge of [['hell', 'oled', 'hell', 'oled', 'hell', 'oled', 'hell'], ['oled', 'hell', 'oled', 'hell', 'oled', 'hell', 'oled']]){
      await menueAuf();
      const kn = {hell: await mitte('.seg [data-design="hell"]'), oled: await mitte('.seg [data-design="oled"]')};
      const t0 = Date.now();
      for(const d of folge){ await tap(kn[d].x, kn[d].y); await p.waitForTimeout(50); }
      const ruhig = await ruhe(); const dauer = Date.now() - t0;
      const z = await zustand(); const letzt = folge[folge.length - 1];
      const offen = await p.evaluate(() => !!document.querySelector('#modal .seg'));
      notiz(`Schnell umschalten (7x, Ende ${letzt})`, C, ruhig && z.theme === TH(letzt) && z.speicher === letzt && z.seg === letzt && z.pressed === letzt && offen,
        `zur Ruhe gekommen: ${ruhig} nach ${dauer} ms; ${JSON.stringify(z)}; Menue noch offen: ${offen}`);
      await p.evaluate(() => schliesse()); await p.waitForTimeout(300);
    }

    // 3) Antippen waehrend der Ueberblendung: Navigation und Schliessen gehen nicht verloren
    if(!cfg.reduziert){
      const tabSel = cfg.mobil ? '[data-view="befunde"]' : '[data-view="setup"]', tabZiel = cfg.mobil ? 'befunde' : 'setup';
      for(const warte of [30, 150]){
        await p.evaluate(() => { view = 'aufbau'; zeichne(); }); await p.waitForTimeout(400);
        const t = await mitte(tabSel);
        await p.evaluate(() => setzeDesign(document.documentElement.dataset.theme !== 'light'));
        await p.waitForTimeout(warte); await tap(t.x, t.y); await p.waitForTimeout(200);
        const v = await p.evaluate(() => view); await ruhe();
        notiz(`Tab antippen ${warte} ms nach Start der Ueberblendung`, C, v === tabZiel, `Ansicht danach: ${v}`);
      }
      await p.evaluate(() => { view = 'aufbau'; zeichne(); }); await p.waitForTimeout(400);
      await menueAuf();
      const k = await mitte(`.seg [data-design="${await p.evaluate(() => document.documentElement.dataset.theme === 'light' ? 'oled' : 'hell')}"]`);
      const zu = await mitte('#modal [data-zu]');
      await tap(k.x, k.y); await p.waitForTimeout(80); await tap(zu.x, zu.y); await p.waitForTimeout(450); await ruhe();
      const offen = await p.evaluate(() => !!document.querySelector('#modal .scrim'));
      notiz('Schliessen waehrend der Ueberblendung', C, !offen, `Menue danach offen: ${offen}`);
    }

    // 4) Dialoge (Blaetter) und Hinweise
    await p.evaluate(() => { view = 'aufbau'; zeichne(); }); await p.waitForTimeout(300);
    const ein = await p.evaluate(async () => { oeffneMenu(); await new Promise(r => requestAnimationFrame(r));
      const sh = document.querySelector('#modal .sheet'), sc = document.querySelector('#modal .scrim');
      const an = [...sh.getAnimations(), ...sc.getAnimations()].map(a => ({n: a.animationName || 'transition', d: Math.round(a.effect.getTiming().duration), props: [...new Set(a.effect.getKeyframes().flatMap(k => Object.keys(k).filter(x => !['offset', 'easing', 'composite', 'computedOffset'].includes(x))))]}));
      return an; });
    const einMax = Math.max(0, ...ein.map(a => a.d));
    notiz('Blatt erscheint', C, cfg.reduziert ? einMax <= 150 : (einMax >= 200 && einMax <= 320), `Animationen: ${JSON.stringify(ein)}`);
    await p.waitForTimeout(450);
    const zuK = await mitte('#modal [data-zu]');
    await tap(zuK.x, zuK.y);
    const weg = await p.evaluate(() => { const g = document.querySelector('#modal-weg .scrim'); return {modalLeer: document.getElementById('modal').innerHTML === '', geist: !!g, inert: g ? g.closest('#modal-weg').inert || g.inert || !!g.closest('[inert]') : null, weg: g ? g.classList.contains('weg') : null, d: g ? Math.max(0, ...[...g.getAnimations(), ...g.querySelector('.sheet').getAnimations()].map(a => Math.round(a.effect.getTiming().duration))) : 0}; });
    // App sofort wieder bedienbar: direkt nach dem Schliessen einen Tab antippen
    const tab2 = await mitte(cfg.mobil ? '[data-view="befunde"]' : '[data-view="setup"]');
    await tap(tab2.x, tab2.y); await p.waitForTimeout(60);
    const sofortBedienbar = await p.evaluate(v => view === v, cfg.mobil ? 'befunde' : 'setup');
    await p.waitForTimeout(300);
    const geistDanach = await p.evaluate(() => document.querySelectorAll('#modal-weg .scrim').length);
    notiz('Blatt schliesst', C, weg.modalLeer && (cfg.reduziert ? !weg.geist : (weg.geist && weg.inert && weg.weg && weg.d <= 200)) && sofortBedienbar && geistDanach === 0,
      `${JSON.stringify(weg)}; Tab direkt danach getippt und angenommen: ${sofortBedienbar}; Rest nach 300 ms: ${geistDanach}`);
    const doppel = await p.evaluate(async () => { oeffneMenu(); await new Promise(r => setTimeout(r, 40)); schliesse(); oeffneMenu(); const n = document.querySelectorAll('.scrim').length; const ohne = !!document.querySelector('#modal .scrim.ohne-ein'); schliesse(); await new Promise(r => setTimeout(r, 320)); return {scrimsBeimNeuOeffnen: n, uebernimmtAbdunklung: ohne, resteDanach: document.querySelectorAll('.scrim').length}; });
    notiz('Blatt auf-zu-auf schnell', C, doppel.resteDanach === 0 && (cfg.reduziert || doppel.uebernimmtAbdunklung), JSON.stringify(doppel));
    const toast = await p.evaluate(async () => { zeigeToast('Test', 300); const t = document.getElementById('toast'); await new Promise(r => setTimeout(r, 340)); const w = t.classList.contains('weg'); const d = Math.max(0, ...t.getAnimations().map(a => Math.round(a.effect.getTiming().duration))); await new Promise(r => setTimeout(r, 300)); return {blendetAus: w, dauer: d, danachVersteckt: t.hidden}; });
    notiz('Hinweis (Toast) blendet aus', C, toast.blendetAus && toast.danachVersteckt && toast.dauer <= 200, JSON.stringify(toast));

    // 5) Moduswechsel (Traumrad / Mein Rad / Gebraucht): Einflug, nur transform/opacity, kein Layoutsprung, nichts bleibt unsichtbar
    await p.evaluate(() => { view = 'aufbau'; zeichne(); window.scrollTo(0, 0); }); await p.waitForTimeout(700);
    for(const m of ['real', 'traum']){
      const mk = await mitte(`.modus [data-modus="${m}"]`);
      if(!mk){ notiz(`Moduswechsel nach ${m}`, C, false, 'Umschalter nicht sichtbar'); continue; }
      const kopfVor = await p.evaluate(() => { const r = document.querySelector('.modus').getBoundingClientRect(); return [Math.round(r.top), Math.round(r.height)].join('/'); });
      await p.evaluate(() => { window.__props = new Set(); window.__laeuft = true; const f = () => { document.getAnimations().forEach(a => { if(!a.effect) return; const t = a.effect.target, d = Math.round(a.effect.getTiming().duration); const ziel = t ? (t.tagName.toLowerCase() + (t.id ? '#' + t.id : '') + (typeof t.className === 'string' && t.className ? '.' + t.className.split(' ')[0] : '')) : '?'; a.effect.getKeyframes().forEach(k => Object.keys(k).forEach(x => { if(!['offset', 'easing', 'composite', 'computedOffset'].includes(x)) window.__props.add(x + '|' + d + '|' + ziel); })); }); if(window.__laeuft) requestAnimationFrame(f); }; requestAnimationFrame(f); });
      await tap(mk.x, mk.y); await p.waitForTimeout(80);
      const einflug = await p.evaluate(() => document.body.classList.contains('einflug'));
      await p.waitForTimeout(720);
      const r = await p.evaluate(() => { window.__laeuft = false; const rr = document.querySelector('.modus').getBoundingClientRect();
        return {modus, props: [...window.__props], kopf: [Math.round(rr.top), Math.round(rr.height)].join('/'), unsichtbar: [...document.querySelectorAll('.grp,.leit,.urteil,.panel > .card,.mk,.slot')].filter(e => e.offsetParent && +getComputedStyle(e).opacity < 0.99).length,
          pille: getComputedStyle(document.querySelector('.modus-in'), '::before').transitionDuration}; });
      const props = {}; r.props.forEach(x => { const [n, d, z] = x.split('|'); (props[n] = props[n] || {d: new Set(), z: new Set()}); props[n].d.add(+d); props[n].z.add(z); });
      const LAYOUT = ['width', 'height', 'top', 'left', 'right', 'bottom', 'margin', 'marginTop', 'padding', 'fontSize', 'inset', 'maxHeight', 'gridTemplateRows'];
      const layoutAnim = Object.keys(props).filter(n => LAYOUT.includes(n));
      const maxD = Math.max(0, ...Object.values(props).flatMap(v => [...v.d]));
      const nurTO = layoutAnim.length === 0 && (cfg.reduziert ? maxD <= 150 : maxD <= 600);
      r.props = Object.entries(props).map(([n, v]) => `${n} (${[...v.d].join('/')} ms an ${[...v.z].slice(0, 3).join(', ')}${v.z.size > 3 ? ' +' + (v.z.size - 3) : ''})`);
      notiz(`Moduswechsel nach ${m}`, C, r.modus === m && (cfg.reduziert ? !einflug : einflug) && nurTO && r.kopf === kopfVor && r.unsichtbar === 0,
        `Modus ${r.modus}; Einflug: ${einflug}; animierte Eigenschaften: ${r.props.join('; ') || 'keine'}; Layout-Eigenschaften animiert: ${layoutAnim.join(', ') || 'keine'}; Umschalter vorher/nachher ${kopfVor} -> ${r.kopf}; danach unsichtbar: ${r.unsichtbar}; Pille gleitet: ${r.pille}`);
    }

    // 6) Score: zaehlt hoch, Ring pulsiert, Ansicht wird nicht neu aufgebaut
    await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function'); await p.waitForTimeout(900);
    await p.evaluate(() => { view = 'aufbau'; zeichne(); }); await p.waitForTimeout(800);
    const sc = await p.evaluate(async () => {
      const el = document.getElementById('score'), vor = el.textContent;
      const karten = [...document.querySelectorAll('.grp')];
      // Teile tauschen: je Platz das erste bzw. letzte Katalogteil, damit sich die Wertung sicher aendert
      const wahl = (s, letzt) => { const l = katalog(quelleOf(s)) || []; return l.length ? l[letzt ? l.length - 1 : 0].id : null; };
      const probe = []; const ziel0 = +el.dataset.w || 0;
      for(const letzt of [false, true]){
        for(const s of SLOTS) if(!entfaellt(build, s.k)) { const id = wahl(s, letzt); if(id) build[s.k] = id; }
        if(+bewerte(build).gesamt !== ziel0) break;
      }
      sichern(); zeichne();
      const ziel = +el.dataset.w;
      const ring = el.closest('.ring-wrap');
      const puls = ring ? ring.classList.contains('puls') : null;
      await new Promise(r => { const t0 = performance.now(); const f = t => { probe.push(el.textContent); if(t - t0 < 600) requestAnimationFrame(f); else r(); }; requestAnimationFrame(f); });
      const gleich = document.getElementById('score') === el && el.isConnected; const kartenGleich = karten.filter(k => k.isConnected).length;
      const einflugAn = document.body.classList.contains('einflug');
      const kartenAnim = karten.filter(k => k.isConnected && k.getAnimations().length).length;
      return {vor, ziel, werte: [...new Set(probe)], puls, gleich, kartenGleich, einflugAn, kartenAnim, karten: karten.length};
    });
    const zwischen = sc.werte.filter(v => v !== sc.vor && v !== String(sc.ziel)).length;
    const lo = Math.min(+sc.vor, sc.ziel), hi = Math.max(+sc.vor, sc.ziel); const imBereich = sc.werte.every(v => +v >= lo && +v <= hi);
    notiz('Score aendert sich', C, (cfg.reduziert ? zwischen === 0 : (zwischen >= 3 && sc.puls)) && sc.werte[sc.werte.length - 1] === String(sc.ziel) && !sc.einflugAn && sc.kartenAnim === 0 && sc.gleich && imBereich,
      `${sc.vor} -> ${sc.ziel}, angezeigt: ${sc.werte.slice(0, 12).join(' ')}${sc.werte.length > 12 ? ' …' : ''}; Ring-Puls: ${sc.puls}; alle Werte zwischen alt und neu: ${imBereich}; Score-Element bleibt dasselbe: ${sc.gleich}; Gruppenkarten im DOM neu gezeichnet: ${sc.karten - sc.kartenGleich} von ${sc.karten}; Einflug ausgeloest: ${sc.einflugAn}; Karten mit Animation: ${sc.kartenAnim} von ${sc.karten}`);

    // 7) Endlos laufende Animationen und bei "Bewegung reduzieren" nichts Grosses
    await p.waitForTimeout(1500);
    const endlos = await p.evaluate(() => document.getAnimations().filter(a => a.effect && a.effect.getTiming().iterations === Infinity && a.playState === 'running').map(a => (a.animationName || 'transition') + '@' + (a.effect.target && (a.effect.target.id || a.effect.target.className)))) ;
    notiz('Endlos laufende Animationen', C, cfg.reduziert ? endlos.length === 0 : true, endlos.length ? endlos.join(', ') : 'keine');

    // 8) Neu laden: gespeichertes Design steht vor dem ersten Bild
    for(const d of ['hell', 'oled']){
      await p.evaluate(d => { localStorage.setItem('mtb.design', d); }, d);
      await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function');
      const lad = await p.evaluate(() => ({beimLaden: window.__themeBeimLaden, meta: window.__metaBeimLaden, scheme: getComputedStyle(document.documentElement).colorScheme}));
      const soll = d === 'hell' ? 'light' : 'oled';
      notiz(`Neu laden (${d})`, C, lad.beimLaden === soll && lad.meta === (d === 'hell' ? '#f2f2f7' : '#000000'), `Theme schon bei DOMContentLoaded: ${lad.beimLaden}; Statusleiste: ${lad.meta}; color-scheme: ${lad.scheme}`);
      await p.waitForTimeout(500);
    }

    notiz('Fehler in der Konsole', C, errs.length === 0, errs.length ? errs.join(' | ') : 'keine');
    await ctx.close();
  }
  await b.close();
  fs.writeFileSync(`${OUT}/anim-abnahme.json`, JSON.stringify(erg, null, 1));
  const fehl = erg.filter(e => !e.ok);
  console.log(`\nGESAMT: ${erg.length - fehl.length} von ${erg.length} Pruefpunkten bestanden`);
  process.exit(fehl.length ? 1 : 0);
})();
