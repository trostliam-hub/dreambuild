/* BEVEL-002 Abnahme: node abnahme.js <port> [breiten] [kurz]
 * Fuer jede Ansicht und jedes Blatt (Aufbau mit Pruefung zu/offen, Konflikt,
 * Wunschliste, Einkauf, Fahrwerk, Finder, Alle Teile, Kategorie, Vergleich,
 * Wunsch eintragen, Angabe, 3D-Rueckfall, Einfuehrung) in DE/EN und hell/dunkel:
 *  - Ueberstand: Seite breiter als das Fenster, Elemente rechts ausserhalb
 *  - Kontrast: sichtbare Texte gegen ihren tatsaechlichen Hintergrund (WCAG AA)
 *  - Tippflaechen: Knoepfe der neuen Bausteine mindestens 40 px hoch (Handy)
 *  - Konsole: Seitenfehler und console.error (ohne fehlende preise.json)
 */
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const [,, port, breitenArg, kurz] = process.argv;
const BREITEN = (breitenArg || '280,320,390,1280').split(',').map(Number);
const SZENEN = [
  ['aufbau', "schliesse(); view='aufbau'; pruefOffen=false; zeichne()"],
  ['aufbau-pruefung-offen', "schliesse(); view='aufbau'; pruefOffen=true; zeichne(); vorschlaegeZeichnen()"],
  ['konflikt', "schliesse(); wechsle('real'); const r = katalog(quelleOf(slotOf('rahmen'))).find(t => t.daempfer); build.rahmen = r.id; build.gabel = 'g-recon'; build.bremsen = 'b-xt'; katalog(quelleOf(slotOf('daempfer'))).find(t => { build.daempfer = t.id; return pruefe(build).some(x => x.level === 'fehler' && (x.slots || []).indexOf('daempfer') >= 0); }); view='aufbau'; pruefOffen=true; zeichne(); vorschlaegeZeichnen()"],
  ['konflikt-zu', "schliesse(); view='aufbau'; pruefOffen=false; zeichne()"],
  ['spindrift', "schliesse(); wechsle('traum'); build.rahmen='f-spindrift'; view='aufbau'; zeichne()"],
  ['wunsch-leer', "schliesse(); view='wunsch'; zeichne()"],
  ['wunsch', "schliesse(); merken('bremsen','b-mt4'); merken('gabel','g-recon'); const w = wunschListe()[1]; w.stufe='einkauf'; verlaufListe().unshift({zeit:Date.now(), slot:'bremsen', von:'Shimano XT', zu:'Magura MT4', neu:['Post-Mount-Adapter +23 mm'], weg:[], folge:[], vorher:{bremsen:build.bremsen}}); view='wunsch'; zeichne()"],
  ['einkauf', "schliesse(); view='deals'; zeichne()"],
  ['fahrwerk', "schliesse(); view='setup'; zeichne()"],
  ['test-banner', "schliesse(); wunschTesten(wunschListe()[0].id)"],
  ['finder-bremse', "testBeenden(true); schliesse(); oeffneSlot('bremsen', {tab:'finden'})"],
  ['finder-budget-marke', "finder.budgetAn=true; finder.budget=300; finder.marken=['Shimano']; oeffneSlot('bremsen')"],
  ['finder-sparen', "oeffneSlot('gabel', {ziel:'sparen'})"],
  ['finder-konflikt', "schliesse(); wechsle('real'); view='aufbau'; zeichne(); oeffneSlot('daempfer')"],
  ['finder-leer', "schliesse(); wechsle('traum'); build.griffe=null; zeichne(); oeffneSlot('griffe', {tab:'finden'})"],
  ['alle-teile', "oeffneSlot('reifenVR', {tab:'alle'})"],
  ['kategorie', "oeffneFinderStart()"],
  ['vergleich', "schliesse(); finder.slot='bremsen'; finder.ziel='kraft'; oeffneVergleich('bremsen', 'b-xtr4')"],
  ['wunsch-neu', "oeffneWunschNeu()"],
  ['angabe', "schliesse(); build.gabel='g-recon'; zeichne(); oeffneAngabe('gabel')"],
  ['detail', "oeffneDetail('bremsen', build.bremsen)"],
  ['d3-rueckfall', "schliesse(); build.rahmen='f-spindrift'; zeichne(); oeffne3D(); d3Fallback($('d3'), tx('Dieses Gerät zeigt kein 3D (WebGL ist aus). Das Bild zeigt dasselbe Modell.', 'This device can\\'t show 3D (WebGL is off). The image shows the same model.'))"],
  ['szene-1', "schliesse(); oeffneSzenen(null)"],
  ['szene-2', "szeneZeigen(1)"],
  ['szene-3', "szeneZeigen(2)"],
];
const PRUEF = () => {
  const vw = document.documentElement.clientWidth, out = {ueber:[], kontrast:[], klein:[], n:0};
  if(document.documentElement.scrollWidth > vw + 1) out.ueber.push({sel:'Seite', w:document.documentElement.scrollWidth});
  const wurzel = document.querySelector('#szenen .sz') || document.querySelector('#modal .sheet') || document.body;
  const sichtbar = e => { const s = getComputedStyle(e); if(s.display === 'none' || s.visibility === 'hidden') return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  /* Ueberstand: Element ragt rechts aus dem Fenster, ohne dass ein Vorfahr waagerecht scrollt oder abschneidet */
  wurzel.querySelectorAll('*').forEach(e => {
    if(!sichtbar(e) || e.closest('svg')) return;
    const r = e.getBoundingClientRect(); if(r.right <= vw + 1 && r.left >= -1) return;
    for(let p = e.parentElement; p && p !== document.body; p = p.parentElement){ const s = getComputedStyle(p); if(/(auto|scroll|hidden|clip)/.test(s.overflowX)) return; }
    out.ueber.push({sel:(e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : e.tagName), t:(e.textContent || '').trim().slice(0, 30), r:Math.round(r.right), l:Math.round(r.left)});
  });
  /* Kontrast */
  const rgb = s => { const m = s.match(/rgba?\(([^)]+)\)/); if(!m) return null; const v = m[1].split(',').map(x => parseFloat(x)); return {r:v[0], g:v[1], b:v[2], a:v.length > 3 ? v[3] : 1}; };
  const lum = c => { const f = x => { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b); };
  const misch = (o, u) => ({r:o.r * o.a + u.r * (1 - o.a), g:o.g * o.a + u.g * (1 - o.a), b:o.b * o.a + u.b * (1 - o.a), a:1});
  const grund = el => { const sch = []; for(let e = el; e; e = e.parentElement){ const c = rgb(getComputedStyle(e).backgroundColor); if(c && c.a > 0){ sch.push(c); if(c.a >= .99) break; } }
    let u = rgb(getComputedStyle(document.body).backgroundColor) || {r:0, g:0, b:0, a:1}; for(let i = sch.length - 1; i >= 0; i--) u = misch(sch[i], u); return u; };
  wurzel.querySelectorAll('*').forEach(e => {
    if(e.closest('svg, img, .scrim:not(:has(.sheet)), .brad-b') || ![...e.childNodes].some(t => t.nodeType === 3 && t.textContent.trim())) return;
    if(!sichtbar(e)) return; const r = e.getBoundingClientRect(); if(r.bottom < 0 || r.top > innerHeight) return;
    for(let o = e; o && o !== document.body; o = o.parentElement) if(+getComputedStyle(o).opacity < .9) return;
    if(e.disabled || e.closest('[disabled]')) return;
    const s = getComputedStyle(e), f = rgb(s.color); if(!f) return; const u = grund(e), fg = misch(f, u);
    const k = (Math.max(lum(fg), lum(u)) + .05) / (Math.min(lum(fg), lum(u)) + .05), gr = parseFloat(s.fontSize), gross = gr >= 24 || (gr >= 18.66 && +s.fontWeight >= 700);
    out.n++; if(k < (gross ? 3 : 4.5)) out.kontrast.push({c:(e.className && typeof e.className === 'string' ? e.className.split(' ')[0] : e.tagName), t:e.textContent.trim().slice(0, 36), k:Math.round(k * 100) / 100});
  });
  /* Tippflaechen der neuen Bausteine */
  if(vw < 800) wurzel.querySelectorAll('.fk button, .fk a.btn, .fi-chips button, .ts-in button, .wl-akt button, .vt-akt .btn, .rb-finder, .pf-kopf, .pf-k .btn, .fs, .sz button, .tb-akt button, .dt-akt button, .rb-akt .btn, .test-banner button').forEach(e => {
    if(!sichtbar(e)) return; const r = e.getBoundingClientRect(); if(r.height < 39.5) out.klein.push({c:e.className.split(' ')[0] || e.tagName, t:e.textContent.trim().slice(0, 24), h:Math.round(r.height)}); });
  return out;
};
(async () => {
  const b = await chromium.launch();
  const sum = {ueber:0, kontrast:0, klein:0, texte:0, fehler:0, laeufe:0}, funde = {};
  for(const spr of ['de', 'en']) for(const des of (kurz ? ['oled'] : ['hell', 'oled'])) for(const W of BREITEN){
    const ctx = await b.newContext({viewport:{width:W, height:W < 800 ? 844 : 900}, hasTouch:W < 800, reducedMotion:'reduce'});
    await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
    const p = await ctx.newPage(); const fehler = [];
    p.on('pageerror', e => fehler.push(e.message)); p.on('console', m => { if(m.type() === 'error' && !/Failed to load resource|404/.test(m.text())) fehler.push(m.text()); });
    await p.goto(`http://127.0.0.1:${port}/index.html`);
    await p.evaluate(([d, s]) => { localStorage.clear(); localStorage.setItem('mtb.design', d); localStorage.setItem('mtb.sprache', s); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); localStorage.setItem('mtb.szenen', '1'); }, [des, spr]);
    await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp'));
    await p.evaluate(() => { pro = {key:'x', inst:'i', status:'aktiv', geprueft:Date.now()}; plan.fahrer = 80; sichern(); });
    for(const [n, code] of SZENEN){
      try{ await p.evaluate(code); }catch(e){ fehler.push(n + ': ' + e.message.split('\n')[0]); continue; }
      await p.waitForTimeout(160);
      const r = await p.evaluate(PRUEF); sum.laeufe++; sum.texte += r.n;
      for(const [art, liste] of [['ueber', r.ueber], ['kontrast', r.kontrast], ['klein', r.klein]]) for(const x of liste){
        sum[art]++; const k = art + '|' + n + '|' + (x.c || x.sel) + '|' + (x.t || '');
        if(!funde[k]) funde[k] = {art, n, spr, des, W, ...x}; }
    }
    for(const f of fehler){ sum.fehler++; const k = 'fehler|' + f; if(!funde[k]) funde[k] = {art:'fehler', spr, des, W, t:f}; }
    await ctx.close();
  }
  for(const x of Object.values(funde)) console.log(JSON.stringify(x));
  console.log(`ABNAHME: ${sum.laeufe} Ansichten, ${sum.texte} Texte · Ueberstand ${sum.ueber} · Kontrast ${sum.kontrast} · zu kleine Tippflaechen ${sum.klein} · Fehler ${sum.fehler}`);
  await b.close();
})();
