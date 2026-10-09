/* Sechs Ablaeufe messen: node ablaeufe.js <port> <vorher|nachher> <ausgabeordner>
 * Zaehlt Tipps und die Strecke, die man scrollen muss, bis das naechste Ziel
 * sichtbar ist (zwischen Kopfzeile und Tableiste). Handy 390x844 und Desktop 1280x860.
 * Ergebnis: <aus>/ablaeufe-<stand>.json und je Ablauf ein Bild vom Ziel. */
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs = require('fs');
const [,, port, stand, out] = process.argv;
fs.mkdirSync(out, {recursive:true});
const URL0 = `http://127.0.0.1:${port}/index.html`;
const GERAETE = [
  {k:'handy', ctx:{viewport:{width:390, height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true}},
  {k:'desktop', ctx:{viewport:{width:1280, height:860}, deviceScaleFactor:1}}
];

/* Zustand vorbereiten: alle Ablaeufe starten vom Aufbau oben */
async function start(p, art){
  await p.goto(URL0);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('mtb.design', 'hell'); localStorage.setItem('mtb.sprache', 'de');
    localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); });
  await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp'));
  await p.evaluate(art => {
    pro = {key:'x', inst:'i', status:'aktiv', geprueft:Date.now()};
    plan.fahrer = 80;
    if(art === 'konflikt'){
      wechsle('real');
      Object.assign(build, JSON.parse(JSON.stringify(profile.traum[0].build || {})));
      const r = katalog(quelleOf(slotOf('rahmen'))).find(t => t.daempfer); build.rahmen = r.id;
      katalog(quelleOf(slotOf('daempfer'))).find(t => { build.daempfer = t.id; return pruefe(build).some(b => b.level === 'fehler' && (b.slots || []).indexOf('daempfer') >= 0); });
    }
    if(art === 'raeder'){
      const a = aktivId.traum; profilNeu(); const n = profile.traum.find(x => x.id === aktivId.traum); if(n) n.name = 'Enduro-Projekt';
      profilWechseln(a); wechsle('real'); build.rahmen = katalog(quelleOf(slotOf('rahmen')))[3].id; wechsle('traum');
    }
    view = 'aufbau'; sichern(); zeichne(); window.scrollTo(0, 0);
  }, art);
  await p.waitForTimeout(500);
}

async function lauf(p, schritte, geraet){
  const log = []; let tipps = 0, scroll = 0, tippen = 0, sichtbarN = null;
  for(const s of schritte){
    if(s.vor) await p.evaluate(s.vor);
    if(s.art === 'warte'){ await p.waitForTimeout(s.ms || 300); continue; }
    const el = await p.waitForSelector(s.sel, {state:'attached', timeout:4000}).catch(() => null);
    if(!el){ log.push({schritt:s.was, fehler:'nicht gefunden: ' + s.sel}); return {ok:false, tipps, scroll, tippen, log}; }
    /* Wie weit muss man scrollen, bis das Ziel im freien Bereich liegt? */
    const weg = await p.evaluate(e => {
      const r = e.getBoundingClientRect(), kopf = (document.querySelector('.top') || {offsetHeight:0}).offsetHeight;
      const tabs = document.querySelector('.tabs'), tr = tabs && getComputedStyle(tabs).display !== 'none' && getComputedStyle(tabs).position === 'fixed' ? tabs.getBoundingClientRect().top : innerHeight;
      if(e.closest('#modal') || e.closest('.top') || (e.closest('.tabs') && getComputedStyle(e.closest('.tabs')).position !== 'static')) return 0;
      let oben = kopf; const nav = document.querySelector('.tabs'); if(nav && getComputedStyle(nav).position === 'sticky') oben = Math.max(oben, nav.getBoundingClientRect().bottom);
      if(r.top >= oben && r.bottom <= tr) return 0;
      return r.top < oben ? Math.round(oben - r.top) : Math.round(r.bottom - tr);
    }, el);
    if(weg){ scroll += weg; await el.evaluate(e => e.scrollIntoView({block:'center'})); await p.waitForTimeout(250); }
    if(s.art === 'sieh'){
      const n = s.zaehle ? await p.evaluate(q => { const kopf = document.querySelector('.top').offsetHeight, t = document.querySelector('.tabs');
        const unten = t && getComputedStyle(t).position === 'fixed' && getComputedStyle(t).display !== 'none' ? t.getBoundingClientRect().top : innerHeight;
        return [...document.querySelectorAll(q)].filter(e => { const r = e.getBoundingClientRect(); return r.height && r.top >= kopf - 2 && r.bottom <= unten + 2; }).length; }, s.zaehle) : null;
      log.push({schritt:s.was, scroll:weg, sichtbar:n}); if(n != null) sichtbarN = n; continue; }
    if(s.art === 'tippe'){ await el.fill(s.text); tippen++; log.push({schritt:s.was, scroll:weg, eingabe:s.text}); await p.waitForTimeout(300); continue; }
    await el.click(); tipps++; log.push({schritt:s.was, scroll:weg});
    await p.waitForTimeout(s.ms || 450);
  }
  return {ok:true, tipps, scroll, tippen, sichtbar:sichtbarN, log};
}

const tab = (v, g, alt) => ({sel:g === 'handy' || stand === 'nachher' ? `.tabs [data-view="${v}"]` : alt, was:'Bereich ' + v});

/* Ablaeufe je Stand und Geraet */
const ABL = {
  vorher: {
    teil: g => ({art:'start', schritte:[
      {sel:'#aufbau [data-slot="reifenHR"]', was:'Reifen hinten im Aufbau suchen und antippen'},
      {sel:'#modal .opt[data-passt="1"]:not(.sel) [data-einbau]', was:'Anderen Reifen einbauen'}],
      ziel:() => build.reifenHR !== 't-dhr2'}),
    konflikt: g => ({art:'konflikt', schritte:[
      ...(g === 'handy' ? [{sel:'.tabs [data-view="befunde"]', was:'Reiter Prüfung'}] : []),
      {art:'sieh', sel:'#findings .find.fehler', was:'Konflikt lesen', zaehle:'#findings .find'},
      {sel:'#findings .find.fehler [data-slot]', was:'Teil wechseln'},
      {sel:'#modal .opt[data-passt="1"]:not(.sel) [data-einbau]', was:'Passendes Teil einbauen'}],
      ziel:() => !pruefe(build).some(b => b.level === 'fehler' && (b.slots || []).indexOf('daempfer') >= 0)}),
    fahrwerk: g => ({art:'start', schritte:[
      {sel:g === 'handy' ? '.tabs [data-view="setup"]' : '#btn-setup', was:'Setup öffnen'},
      {art:'sieh', sel:'#setup .su-wert, #setup .fw-trail, #setup .kk, #setup h2', was:'Einstellwerte sehen'}],
      ziel:() => view === 'setup'}),
    upgrade: g => ({art:'start', schritte:[
      ...(g === 'handy' ? [{sel:'.tabs [data-view="upgrades"]', was:'Reiter Upgrades'}] : []),
      {art:'sieh', sel:'#upgrades .up', was:'Erstes Upgrade lesen (nur Name, Preis, Punkte)', zaehle:'#upgrades .up'},
      /* Kein Vergleich vorhanden: Umweg ueber den Aufbau und die Suche im Teileblatt */
      ...(g === 'handy' ? [{sel:'.tabs [data-view="aufbau"]', was:'Zurück zum Aufbau'}] : []),
      {sel:'#aufbau [data-slot="reifenHR"]', was:'Bauteil des Upgrades im Aufbau suchen', vor:() => { window.__up = ($('upgrades').querySelector('[data-einbau]') || {}).dataset; }},
      {art:'tippe', sel:'#suche-in', text:'Maxxis Minion', was:'Upgrade im Teileblatt suchen'},
      {sel:'#modal .opt:not([hidden]) [data-detail]', was:'Ansehen (zeigt nur das neue Teil, kein Vergleich)'}],
      ziel:() => !!detailOffen}),
    einkauf: g => ({art:'start', schritte: g === 'handy' ? [
      {sel:'.tabs [data-view="deals"]', was:'Reiter Kaufen'},
      {art:'sieh', sel:'#einkauf .ek', was:'Erste Zeile der Einkaufsliste', zaehle:'#einkauf .ek'}] : [
      {sel:'#einkauf [data-view="deals"]', was:'Seitenleiste bis „Einkaufsliste zeigen“ scrollen und klicken'},
      {art:'sieh', sel:'#einkauf .ek', was:'Erste Zeile der Einkaufsliste', zaehle:'#einkauf .ek'}],
      ziel:() => document.querySelectorAll('#einkauf .ek').length > 3}),
    rad: g => ({art:'raeder', schritte:[
      {art:'warte', vor:() => { view = 'aufbau'; zeichne(); window.scrollTo(0, 1500); }, ms:400},
      {sel:'#profile [data-profil]:not([aria-pressed="true"])', was:'Nach oben scrollen, anderes Traumrad antippen'},
      {sel:'[data-modus="real"]', was:'Mein Rad'}],
      ziel:() => modus === 'real', danach:() => ({ansicht:view})})
  }
  ,
  nachher: {
    teil: g => ({art:'start', schritte:[
      {sel:'.sprung [data-zugruppe="Reifen"]', was:'Sprungleiste: Reifen', ms:700},
      {sel:'#aufbau [data-slot="reifenHR"]', was:'Reifen hinten antippen'},
      {sel:'#modal .opt[data-passt="1"]:not(.sel) [data-einbau]', was:'Anderen Reifen einbauen'}],
      ziel:() => build.reifenHR !== 't-dhr2'}),
    konflikt: g => ({art:'konflikt', schritte:[
      {art:'sieh', sel:'#konflikte .kf', was:'Konflikt neben dem Score lesen', zaehle:'#konflikte .kf'},
      {sel:'#konflikte [data-slot]', was:'Dämpfer wechseln (Grund steht oben im Blatt)'},
      {art:'sieh', sel:'#modal .fund-hier', was:'Grund im Teileblatt'},
      {sel:'#modal .opt[data-passt="1"]:not(.sel) [data-einbau]', was:'Passendes Teil einbauen'}],
      ziel:() => !pruefe(build).some(b => b.level === 'fehler' && (b.slots || []).indexOf('daempfer') >= 0)}),
    fahrwerk: g => ({art:'start', schritte:[
      {sel:'.tabs [data-view="setup"]', was:'Bereich Fahrwerk'},
      {art:'sieh', sel:'#setup .su-wert, #setup .fw-trail, #setup .kk, #setup h2', was:'Einstellwerte sehen'}],
      ziel:() => view === 'setup'}),
    upgrade: g => ({art:'start', schritte:[
      {sel:'.tabs [data-view="upgrades"]', was:'Bereich Upgrades'},
      {art:'sieh', sel:'#upgrades .up', was:'Erstes Upgrade lesen', zaehle:'#upgrades .up'},
      {sel:'#upgrades .up-vgl', was:'Vergleichen'},
      {art:'sieh', sel:'#modal .vg', was:'Verbaut und neu nebeneinander: Preis, Gewicht, Score, Daten'}],
      ziel:() => !!document.querySelector('#modal .vg') && !!document.querySelector('#modal [data-einbau]')}),
    einkauf: g => ({art:'start', schritte:[
      {sel:'.tabs [data-view="deals"]', was:'Bereich Einkauf'},
      {art:'sieh', sel:'#einkauf .ek', was:'Erste Zeile der Einkaufsliste', zaehle:'#einkauf .ek'}],
      ziel:() => document.querySelectorAll('#einkauf .ek').length > 3}),
    rad: g => ({art:'raeder', schritte:[
      {art:'warte', vor:() => { view = 'aufbau'; zeichne(); window.scrollTo(0, 1500); }, ms:500},
      {sel:'#mini', was:'Kopf: Wertung + Radname antippen'},
      {sel:'#modal [data-radwechsel^="traum|"][aria-pressed="false"]', was:'Anderes Traumrad'},
      {sel:'#mini', was:'Kopf antippen'},
      {sel:'#modal [data-radwechsel^="real|"]', was:'Mein Rad'}],
      ziel:() => modus === 'real', danach:() => ({ansicht:view, scroll:Math.round(scrollY)})})
  }
};

(async () => {
  const b = await chromium.launch();
  const erg = {};
  for(const g of GERAETE){
    const ctx = await b.newContext({...g.ctx, reducedMotion:'reduce'});
    await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
    const p = await ctx.newPage();
    p.on('pageerror', e => console.log('pageerror', e.message));
    erg[g.k] = {};
    const defs = ABL[stand];
    for(const [name, f] of Object.entries(defs)){
      const d = f(g.k);
      await start(p, d.art);
      const r = await lauf(p, d.schritte, g.k);
      r.ziel = await p.evaluate(d.ziel);
      if(d.danach) r.danach = await p.evaluate(d.danach);
      await p.waitForTimeout(250);
      await p.screenshot({path:`${out}/${stand}-${g.k}-${name}.png`});
      erg[g.k][name] = r;
      console.log(g.k, name, 'Tipps', r.tipps, 'Scroll', r.scroll, 'Eingaben', r.tippen, 'sichtbar', r.sichtbar, 'Ziel', r.ziel, r.ok ? '' : JSON.stringify(r.log.slice(-1)), r.danach ? JSON.stringify(r.danach) : '');
    }
    await ctx.close();
  }
  fs.writeFileSync(`${out}/ablaeufe-${stand}.json`, JSON.stringify(erg, null, 1));
  await b.close();
})();
