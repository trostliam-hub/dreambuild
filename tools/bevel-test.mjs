/* Szenarien aus APP-BEVEL-002 (Teile finden, Empfehlungen, Adapter, Angebote,
 * Wunschliste, Vergleich, Pruefung im Aufbau).
 *
 * Laedt index.html in Chromium und spielt die Testfaelle aus dem Auftrag
 * durch: gute Bremse ohne Upgrade, begrenztes Budget, Suche ohne und mit
 * Marke, noetiger und entfallender Adapter, fehlende Herstellerangabe, kein
 * oder kein brauchbares Angebot, mehrere Raeder -- dazu: keine Rueckschritte
 * als Empfehlung, Rueckgaengig, Test im Aufbau.
 *
 * Aufruf:   node tools/bevel-test.mjs
 * Ergebnis: letzte Zeile "BEVEL: x von n Pruefungen bestanden", Exit 1 bei Fehler.
 */
import { createRequire } from 'module';
import { execSync } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
let pw;
try{ pw = require('playwright'); }
catch(e){ pw = require(execSync('npm root -g').toString().trim() + '/playwright'); }

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYP = {'.html':'text/html; charset=utf-8', '.js':'text/javascript', '.json':'application/json', '.png':'image/png', '.webp':'image/webp', '.woff2':'font/woff2', '.webmanifest':'application/manifest+json'};
const server = http.createServer((q, a) => {
  const p = path.join(wurzel, decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
  if(!p.startsWith(wurzel) || !fs.existsSync(p) || fs.statSync(p).isDirectory()){ a.writeHead(404); a.end(); return; }
  a.writeHead(200, {'Content-Type':TYP[path.extname(p)] || 'application/octet-stream'}); fs.createReadStream(p).pipe(a);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const URL0 = `http://127.0.0.1:${server.address().port}/index.html`;

const browser = await pw.chromium.launch();
const ctx = await browser.newContext({viewport:{width:390, height:844}});
await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
const seite = await ctx.newPage();
const jsFehler = [];
seite.on('pageerror', e => jsFehler.push(e.message));
seite.on('console', m => { if(m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) jsFehler.push(m.text()); });
const bereit = () => seite.waitForFunction(() => typeof zeichne === 'function' && typeof finderRechnen === 'function' && !!document.querySelector('#aufbau .grp'));
const neu = async (spr) => {
  await seite.goto(URL0);
  await seite.evaluate(s => { localStorage.clear(); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); localStorage.setItem('mtb.szenen', '1'); localStorage.setItem('mtb.sprache', s || 'de'); }, spr);
  await seite.reload(); await bereit();
};
const ev = (f, a) => seite.evaluate(f, a);
/* Finder fuer einen Platz mit Ziel, Marke und Budget rechnen */
const FINDE = `(k, ziel, marken, budget) => { finder = {slot:k, ziel:ziel || '', marken:marken || [], budget:budget || 0, budgetAn:budget > 0, mehr:false, tab:'finden'}; return finderRechnen(k); }`;

const PRUEFUNGEN = [
  /* BEVEL-003: XT M8120 (Mineraloel, 203/180) -- fuer Wartung, Kraft und Gewicht gibt es keinen belegbaren Wechsel */
  ['Gute Bremse ohne Upgrade: "Behalten sinnvoll" mit Grund je Ziel, keine Kachel mit Scheinvorteil', async () => {
    await neu();
    const r = await ev(F => { const finde = eval(F); wechsle('real'); build.rahmen = 'f-stumpy'; build.gabel = 'g-pike'; build.bremsen = 'b-xt'; sichern(); zeichne();
      const out = {};
      for(const z of ['wartung', 'kraft', 'leicht']){ const e = finde('bremsen', z); oeffneSlot('bremsen', {ziel:z});
        const txt = $('modal').textContent; out[z] = {treffer:e.treffer.length, behalten:/Behalten sinnvoll/.test(txt), kacheln:$('modal').querySelectorAll('#fi .fk3').length,
          variante:!!e.variante, grund:/läuft schon mit Mineralöl|Kolbenzahl allein|nicht mit gleichem Lieferumfang/.test(txt)}; schliesse(); }
      return out; }, FINDE);
    /* Kraft darf nur "gleiches Modell, groessere Scheiben" zeigen -- keine fremde Bremse */
    const ok = ['wartung', 'kraft', 'leicht'].every(z => r[z].treffer === 0 && r[z].behalten && r[z].grund) && r.kraft.kacheln === (r.kraft.variante ? 1 : 0) && r.wartung.kacheln === 0 && r.leicht.kacheln === 0;
    return {ok, info:r}; }],
  ['Optionale Beratung: Kachel startet ohne vorbelegtes Ziel bei Schritt 1, Marke und Budget bleiben bei null Ergebnissen erreichbar', async () => {
    await neu();
    const r = await ev(() => { build.bremsen = 'b-xt'; sichern(); zeichne(); $('aufbau').querySelector('.verb [data-slot="bremsen"]').click();
      const sucheZuerst = !!$('suche-in') && !$('fi');
      $('modal').querySelector('.ts-beratung').click();
      const start = {schritt:$('fi').dataset.schritt, ziel:finder.ziel, gewaehlt:$('fi').querySelectorAll('[data-fiziel][aria-pressed="true"]').length, kacheln:$('fi').querySelectorAll('.fk3').length};
      $('fi').querySelector('[data-fiziel="sparen"]').click(); const s2 = $('fi').dataset.schritt;
      $('fi').querySelector('[data-fimarke="Trickstuff"]').click(); $('fi').querySelector('.fi-weiter .btn').click(); const s3 = $('fi').dataset.schritt;
      $('fi').querySelector('[data-fibudget="1"]').click(); const inp = $('fi-budget'); inp.value = '50'; inp.dispatchEvent(new Event('input', {bubbles:true}));
      $('fi').querySelector('.fi-weiter .btn').click();
      const null0 = {schritt:$('fi').dataset.schritt, kacheln:$('fi').querySelectorAll('.fk3').length, sum:$('fi').querySelectorAll('.fi-sum [data-fischritt]').length,
        marke:/Trickstuff/.test($('fi').querySelector('.fi-sum').textContent), budget:/50/.test($('fi').querySelector('.fi-sum').textContent)};
      $('fi').querySelector('.fi-sum [data-fischritt="marke"]').click(); const korr = {schritt:$('fi').dataset.schritt, chips:$('fi').querySelectorAll('[data-fimarke]').length};
      schliesse(); return {sucheZuerst, start, s2, s3, null0, korr}; });
    const ok = r.sucheZuerst && r.start.schritt === 'ziel' && r.start.ziel === '' && r.start.gewaehlt === 0 && r.start.kacheln === 0 && r.s2 === 'marke' && r.s3 === 'budget'
      && r.null0.schritt === 'erg' && r.null0.kacheln === 0 && r.null0.sum === 3 && r.null0.marke && r.null0.budget && r.korr.schritt === 'marke' && r.korr.chips > 5;
    return {ok, info:r}; }],
  ['Selbst suchen ohne Fragen: alle Modi, DE/EN, Kachel per Tastatur, Suchfilter erhalten, direkter Einbau und Rueckgaengig', async () => {
    const resultate = [];
    for(const [m, spr, breite] of [['real','de',390],['traum','en',320],['markt','de',1280]]){
      await neu(spr); await seite.setViewportSize({width:breite,height:844});
      const vorher = await ev(m => {
        wechsle(m); build.rahmen = 'f-stumpy'; build.gabel = 'g-pike'; build.bremsen = 'b-xt';
        zuGeklappt.Bremsen = 0; view = 'aufbau'; sichern(); zeichne(); return JSON.stringify(build);
      }, m);
      await seite.locator('#aufbau .slot[data-slot="bremsen"]').click();
      const start = await ev(() => ({suche:!!$('suche-in'), optional:!!$('modal').querySelector('.ts-beratung'), finder:!!$('fi'), details:$('modal').querySelector('.ts-dein').open,
        sichtbar:$('suche-in').getBoundingClientRect().bottom < window.innerHeight, oben:$('suche-in').getBoundingClientRect().top < $('modal').querySelector('.ts-beratung').getBoundingClientRect().top}));
      await seite.locator('#modal [data-filt="0"]').click();
      await seite.locator('#modal [data-mfilt="Magura"]').click();
      await seite.locator('#suche-in').fill('MT7');
      const trefferVor = await seite.locator('#opt-liste .opt:visible').count();
      await seite.locator('.ts-beratung').focus(); await seite.keyboard.press('Enter');
      const beratung = await ev(() => ({schritt:$('fi').dataset.schritt,ziel:finder.ziel}));
      await seite.locator('#fi .ts-selbst').click();
      const zurueck = await ev(() => ({text:$('suche-in').value,marke:markeWahl,alle:filterAlle,
        bau:JSON.stringify(build),finder:!!$('fi'),ueberstand:$('modal').querySelector('.sheet-b').scrollWidth > $('modal').querySelector('.sheet-b').clientWidth + 1}));
      const trefferNach = await seite.locator('#opt-liste .opt:visible').count();
      await seite.locator('#opt-liste .opt:visible [data-einbau^="bremsen|b-mt7"]').first().click();
      const eingebaut = await ev(() => basisVon(build.bremsen) === 'b-mt7');
      await seite.locator('#toast .toast-zurueck').click();
      const undo = await ev(() => JSON.stringify(build));
      resultate.push({m,start,beratung,trefferVor,trefferNach,zurueck, eingebaut,undo:undo === vorher,
        ok:start.suche && start.optional && !start.finder && !start.details && start.sichtbar && start.oben && beratung.schritt === 'ziel' && beratung.ziel === ''
          && trefferVor > 0 && trefferVor === trefferNach && zurueck.text === 'MT7' && zurueck.marke === 'Magura' && zurueck.alle && !zurueck.finder && !zurueck.ueberstand && zurueck.bau === vorher && eingebaut && undo === vorher});
    }
    await seite.setViewportSize({width:390,height:844});
    return {ok:resultate.every(r => r.ok),info:resultate}; }],
  ['Alle Teilekategorien starten bei der Suche; leere Plaetze und Konflikte erzwingen keine Beratung', async () => {
    await neu();
    const r = await ev(() => {
      const fehler = [];
      for(const s of SLOTS){
        schliesse(); oeffneSlot(s.k);
        if(!$('suche-in') || !$('opt-liste') || !$('modal').querySelector('.ts-beratung') || $('fi')) fehler.push(s.k);
      }
      schliesse(); build.bremsen = null; zeichne(); oeffneSlot('bremsen');
      const leer = !$('fi') && !$('modal').querySelector('.ts-dein') && !!$('suche-in');
      return {fehler,leer};
    });
    return {ok:r.fehler.length === 0 && r.leer,info:r}; }],
  ['Vergleich und Rueckkehr: "Zurueck zu Ergebnissen" behaelt Ziel, Marke, Budget, Kompromiss-Schalter und Scrollstand', async () => {
    await neu();
    const r = await ev(() => { wechsle('real'); build.rahmen = 'f-stumpy'; build.gabel = 'g-pike'; build.bremsen = 'b-xt'; sichern();
      oeffneSlot('bremsen', {ziel:'sparen'}); finder.marken = ['Shimano']; finder.budgetAn = true; finder.budget = 300; finder.kompromisse = true; oeffneSlot('bremsen');
      const b = $('modal').querySelector('.sheet-b'); b.scrollTop = 300; const y0 = b.scrollTop, vorher = [...$('fi').querySelectorAll('.fk3')].map(k => k.dataset.fk);
      $('fi').querySelector('.fk3 [data-vergleich]').click();
      const im = {zurueck:!!$('modal').querySelector('[data-fizurueck]'), tabelle:!!$('modal').querySelector('.vt')};
      $('modal').querySelector('[data-fizurueck]').click();
      const nach = [...$('fi').querySelectorAll('.fk3')].map(k => k.dataset.fk);
      return {y0, y:$('modal').querySelector('.sheet-b').scrollTop, im, ziel:finder.ziel, marken:finder.marken.join(), budget:finder.budget, an:finder.budgetAn, kompro:finder.kompromisse,
        schritt:$('fi').dataset.schritt, gleich:JSON.stringify(vorher) === JSON.stringify(nach), n:nach.length}; });
    return {ok:r.im.zurueck && r.im.tabelle && Math.abs(r.y - r.y0) < 2 && r.y0 > 0 && r.ziel === 'sparen' && r.marken === 'Shimano' && r.budget === 300 && r.an && r.kompro && r.schritt === 'erg' && r.gleich && r.n > 0, info:r}; }],
  ['Kompromisse erst auf Wunsch: Leichter zeigt nichts unter der Mindestausstattung, "Kompromisse anzeigen" nennt die Abwaegung', async () => {
    await neu();
    const r = await ev(F => { const finde = eval(F); const j = findeTeil('gabel', build.gabel);
      const e = finde('gabel', 'leicht'), unter = e.treffer.filter(x => (x.mind || []).length || x.pk.neueWarn.length).length;
      finder.kompromisse = true; const k = finderRechnen('gabel'); const mitK = k.treffer.filter(x => x.kompro);
      oeffneSlot('gabel', {ziel:'leicht'}); finder.kompromisse = true; finderNeu(); const txt = $('fi-erg').textContent; schliesse();
      return {treffer:e.treffer.length, unter, kompro:e.kompro, mitK:mitK.length, satz:/statt/.test(txt) && /Kompromiss/.test(txt), federweg:j.travel}; }, FINDE);
    return {ok:r.unter === 0 && r.kompro > 0 && r.mitK === r.kompro && r.satz, info:r}; }],
  ['Zustaende ehrlich: "Geprueft passend" nur ohne Zubehoer, Unbekanntes und Kompatibilitaetsverlust; Cura 2 an Center-Lock-Naben braucht Scheiben', async () => {
    await neu();
    const r = await ev(() => { wechsle('real'); build.rahmen = 'f-stumpy'; build.gabel = 'g-pike'; build.bremsen = 'b-xt'; sichern();
      const lr = findeTeil('laufraeder', build.laufraeder), vor = bewerte(build), fehl = [];
      for(const t of kandidaten('bremsen', build)){ const pk = paketFuer('bremsen', t, vor), st = paketStatus(pk).k;
        if(st === 'ok' && (pk.neu.length || pk.scheibenNeu.length || pk.fehlt.length || pk.nach.tech < pk.vor.tech)) fehl.push(t.id); }
      const cura = paketFuer('bremsen', kandidaten('bremsen', build).find(t => basisVon(t.id) === 'b-cura2'), vor);
      return {naben:lr && lr.naben, fehl, cura:{st:paketStatus(cura).t, scheiben:cura.scheibenNeu.map(s => s.aufn + ' ' + s.mm), techVor:cura.vor.tech, techNach:cura.nach.tech}}; });
    return {ok:!r.fehl.length && r.cura.st !== 'Passt' && r.cura.st !== 'Geprüft passend' && r.cura.scheiben.length === 2, info:r}; }],
  ['Keine Rueckschritte: Recon statt Pike Ultimate und MT420 statt XT M8120 erscheinen in keinem Verbesserungsziel', async () => {
    await neu();
    const r = await ev(F => { const finde = eval(F); build.gabel = 'g-pike'; build.bremsen = 'b-xt'; sichern();
      const out = {}; let schlecht = [];
      for(const [k, boese] of [['gabel', 'g-recon'], ['bremsen', 'b-mt420']]){
        for(const z of zieleFuer(k, findeTeil(k, build[k]), 0).filter(z => ['sparen', 'ersatz'].indexOf(z) < 0)){
          const e = finde(k, z); out[k + ':' + z] = e.treffer.length;
          if(e.treffer.some(x => basisVon(x.t.id) === boese)) schlecht.push(k + ':' + z);
          /* jede Empfehlung ist in den Zielgroessen besser und nirgends schlechter oder unbekannt */
          for(const x of e.treffer) if(x.vg && (x.vg.pB === 0 || x.vg.pS || x.vg.pU)) schlecht.push(k + ':' + z + ':' + x.t.id);
        }
      }
      /* Im Sparmodus darf die Recon stehen -- mit Einschraenkungen */
      const sp = finde('gabel', 'sparen'), recon = sp.treffer.find(x => basisVon(x.t.id) === 'g-recon');
      return {out, schlecht, sparenMitNachteil:!recon || recon.vg.schlechter.length > 0}; }, FINDE);
    return {ok:!r.schlecht.length && r.sparenMitNachteil, info:r}; }],
  ['Alle Plaetze, alle Verbesserungsziele: nie ein Teil, das in der Zielgroesse schlechter oder nur billiger ist', async () => {
    await neu();
    const r = await ev(F => { const finde = eval(F); const fehl = []; let n = 0;
      for(const s of SLOTS){ const jetzt = build[s.k] ? findeTeil(s.k, build[s.k]) : null; if(!jetzt || entfaellt(build, s.k)) continue;
        for(const z of zieleFuer(s.k, jetzt, 0).filter(z => ['sparen', 'konflikt', 'ersatz'].indexOf(z) < 0)){
          const e = finde(s.k, z);
          for(const x of e.treffer){ n++; if(x.pk.neueFehler.length || !x.vg || x.vg.pB === 0 || x.vg.pS || x.vg.pU) fehl.push(s.k + ':' + z + ':' + x.t.id); } } }
      return {n, fehl:fehl.slice(0, 10)}; }, FINDE);
    return {ok:r.n > 20 && !r.fehl.length, info:r}; }],
  ['Defektes Teil ersetzen: dein Modell zuerst, danach nur Teile mit gleichen Massen', async () => {
    await neu();
    const r = await ev(F => { const finde = eval(F); build.bremsen = 'b-xt'; sichern(); const e = finde('bremsen', 'ersatz'), j = findeTeil('bremsen', build.bremsen);
      return {erst:e.treffer[0] && e.treffer[0].t.id === j.id, n:e.treffer.length, gleich:e.treffer.slice(1).every(x => !!massGleich('bremsen', j, x.t)), passt:e.treffer.every(x => !x.pk.neueFehler.length)}; }, FINDE);
    return {ok:r.erst && r.n > 1 && r.gleich && r.passt, info:r}; }],
  ['Begrenztes Budget: nur Loesungen bis zum Betrag (Teil plus Zubehoer), ausgeblendete werden genannt', async () => {
    await neu();
    const r = await ev(F => { const finde = eval(F); const offen = finde('gabel', 'leicht'), knapp = finde('gabel', 'leicht', [], 900);
      return {offen:offen.treffer.length, knapp:knapp.treffer.length, alleDrunter:knapp.treffer.every(x => x.pk.gesamt <= 900), aus:knapp.ausBudget,
        summe:knapp.treffer.every(x => Math.abs(x.pk.gesamt - (x.pk.teilPreis + x.pk.adPreis + x.pk.folgePreis + (x.pk.versand || 0))) < 0.01)}; }, FINDE);
    return {ok:r.offen > r.knapp && r.alleDrunter && r.aus === r.offen - r.knapp && r.summe, info:r}; }],
  ['Marke egal gegen Wunschmarke: Auswahl aendert die Ergebnisse wirklich', async () => {
    await neu();
    const r = await ev(F => { const finde = eval(F); const alle = finde('reifenVR', 'grip'), m = Object.keys(alle.marken)[0];
      const nur = finde('reifenVR', 'grip', [m]);
      return {alle:alle.treffer.length, marke:m, nur:nur.treffer.length, nurDie:nur.treffer.every(x => x.t.m === m), aus:nur.ausMarke}; }, FINDE);
    return {ok:r.alle > r.nur && r.nur > 0 && r.nurDie && r.aus === r.alle - r.nur, info:r}; }],
  ['Ziel aendert die Ergebnisse: Leichter liefert nur leichtere Teile, Mehr Hub nur mehr Hub', async () => {
    await neu();
    const r = await ev(F => { const finde = eval(F); const j = findeTeil('stuetze', build.stuetze);
      const l = finde('stuetze', 'leicht'), h = finde('stuetze', 'hub');
      return {leicht:l.treffer.map(x => x.t.g), hub:h.treffer.map(x => x.t.hub), g:j.g, h:j.hub}; }, FINDE);
    return {ok:r.leicht.length > 0 && r.leicht.every(g => g < r.g) && r.hub.every(x => x > r.h) && JSON.stringify(r.leicht) !== JSON.stringify(r.hub), info:r}; }],
  ['Noetiger Adapter: im Paket mit Grund, Preis im Gesamtpreis, beim Uebernehmen eingeplant', async () => {
    await neu();
    const r = await ev(() => { build.gabel = 'g-pike';
      /* Ausgang: 180 mm vorn an der PM-180-Gabel -- ohne Adapter */
      const basis = rohTeil('bremsen', 'b-xt'), i = basis.v.findIndex(d => d.k === 'Scheiben'), w = findeTeil('bremsen', 'b-xt').wahl.slice();
      w[i] = basis.v[i].o.findIndex(o => o.s.sV === 180); build.bremsen = varianteNachIndex(basis, w).id; sichern();
      const vorher = bewerte(build).adapter.filter(a => a.wo === 'gabel' && a.art === 'bremse').length;
      w[i] = basis.v[i].o.findIndex(o => o.s.sV === 203); const v = varianteNachIndex(basis, w);
      const pk = paketFuer('bremsen', v);
      const grund = pk.neu.map(a => adGrundKurz(a)).join(' ');
      uebernehmen('bremsen', v.id, 'test');
      const r2 = bewerte(build);
      return {vorher, neu:pk.neu.map(a => a.n), grund, gesamt:pk.gesamt, teil:pk.teilPreis, ad:pk.adPreis, imAufbau:r2.adapter.some(a => a.wo === 'gabel' && a.art === 'bremse')}; });
    return {ok:r.vorher === 0 && r.neu.length >= 1 && /Aufnahme für 180 mm/.test(r.grund) && r.ad > 0 && r.gesamt === r.teil + r.ad && r.imAufbau, info:r}; }],
  ['Unnoetiger Adapter entfaellt: kein Doppel, Verlauf nennt ihn, Rueckgaengig holt ihn zurueck', async () => {
    await neu();
    const r = await ev(() => { build.gabel = 'g-pike';
      const basis = rohTeil('bremsen', 'b-xt'), i = basis.v.findIndex(d => d.k === 'Scheiben');
      const w = findeTeil('bremsen', 'b-xt').wahl.slice(); w[i] = basis.v[i].o.findIndex(o => o.s.sV === 203); build.bremsen = varianteNachIndex(basis, w).id; sichern();
      const vorAd = bewerte(build).adapter.filter(a => a.art === 'bremse' && a.wo === 'gabel').length;
      w[i] = basis.v[i].o.findIndex(o => o.s.sV === 180 && o.s.sH === findeTeil('bremsen', build.bremsen).sH); if(w[i] < 0) w[i] = basis.v[i].o.findIndex(o => o.s.sV === 180);
      const klein = varianteNachIndex(basis, w), pk = paketFuer('bremsen', klein);
      uebernehmen('bremsen', klein.id, 'test');
      const nachAd = bewerte(build).adapter.filter(a => a.art === 'bremse' && a.wo === 'gabel').length, e = verlaufListe()[0];
      const doppelt = new Set(bewerte(build).adapter.map(adSchl)).size !== bewerte(build).adapter.length;
      rueckgaengigLetzte(); const zurueck = bewerte(build).adapter.filter(a => a.art === 'bremse' && a.wo === 'gabel').length;
      return {vorAd, weg:pk.weg.map(a => a.n), nachAd, verlaufWeg:e.weg, doppelt, zurueck}; });
    return {ok:r.vorAd === 1 && r.weg.length >= 1 && r.nachAd === 0 && r.verlaufWeg.length >= 1 && !r.doppelt && r.zurueck === 1, info:r}; }],
  /* Liam 11.10.2026: Adapter automatisch nehmen, es sagen -- und unter dem eingebauten Teil steht er weiter, ohne Warnfarbe */
  ['Adapter automatisch: Meldung nennt ihn, keine Warnfarbe, unter der Bremse "braucht Adapter", Ausfuehrungswechsel meldet Wegfall, Englisch', async () => {
    await neu();
    const r = await ev(() => { build.rahmen = 'f-stumpy'; build.gabel = 'g-pike'; build.bremsen = null; sichern(); view = 'aufbau'; zeichne();
      const basis = rohTeil('bremsen', 'b-xt'), i = basis.v.findIndex(d => d.k === 'Scheiben'), w = findeTeil('bremsen', 'b-xt').wahl.slice();
      w[i] = basis.v[i].o.findIndex(o => o.s.sV === 203); const v = varianteNachIndex(basis, w);
      uebernehmen('bremsen', v.id, 'liste');
      const meldung = $('toast').textContent.replace(/\s+/g, ' ');
      if(!pruefOffen) pruefUmschalten(true);
      const gabel = document.querySelector('#aufbau .slot[data-slot="gabel"]'), bremse = document.querySelector('#aufbau .slot[data-slot="bremsen"]');
      const unter = bremse && bremse.querySelector('.slot-ad') ? bremse.querySelector('.slot-ad').textContent.replace(/\s+/g, ' ') : '';
      const zeile = document.querySelector('#aufbau .ad-zeile .ad-k'), farbe = zeile ? getComputedStyle(zeile).color : '';
      const probe = document.createElement('span'); probe.style.color = 'var(--warn)'; document.body.appendChild(probe); const warnFarbe = getComputedStyle(probe).color; probe.remove();
      const warnFund = [...document.querySelectorAll('#findings .find.warnung')].some(f => /Adapter/.test(f.textContent));
      const adFund = document.querySelector('#findings .find.ad') ? document.querySelector('#findings .find.ad').textContent.replace(/\s+/g, ' ') : '';
      const kopf = document.querySelector('#pruef .pf-meta') ? document.querySelector('#pruef .pf-meta').textContent : '';
      /* Ausfuehrung zurueck auf 180 mm ueber den echten Klickweg: der Adapter faellt weg, die Meldung sagt es */
      const w2 = w.slice(); w2[i] = basis.v[i].o.findIndex(o => o.s.sV === 180 && o.s.sH === findeTeil('bremsen', build.bremsen).sH); if(w2[i] < 0) w2[i] = basis.v[i].o.findIndex(o => o.s.sV === 180);
      const k = document.createElement('button'); k.dataset.var = `bremsen|${i}|${w2[i]}`; document.body.appendChild(k); k.click(); k.remove();
      const wegMeldung = $('toast').textContent.replace(/\s+/g, ' '), adNach = bewerte(build).adapter.length;
      /* Englisch: derselbe Hinweis unter der Bremse */
      build.bremsen = v.id; sprache = 'en'; zeichne();
      const en = (document.querySelector('#aufbau .slot[data-slot="bremsen"] .slot-ad') || {textContent:''}).textContent.replace(/\s+/g, ' ');
      sprache = 'de'; zeichne();
      const mitAdapter = bewerte(build).adapter.filter(a => a.art === 'bremse' && a.wo === 'gabel');
      const preisGewicht = mitAdapter.length === 1 && mitAdapter[0].p > 0 && mitAdapter[0].g > 0;
      /* Native PM203-Aufnahme braucht bei 203 mm keinen zusaetzlichen Adapter. */
      build.gabel = 'g-fox40'; zeichne();
      const ohneAdapter = bewerte(build).adapter.filter(a => a.art === 'bremse' && a.wo === 'gabel').length;
      const ohneHinweis = !(document.querySelector('#aufbau .slot[data-slot="bremsen"] .slot-ad') || {textContent:''}).textContent.includes('Montagehinweis');
      return {meldung, gabelKlasse:gabel ? gabel.className : '', unter, farbe, warnFarbe, warnFund, adFund, kopf, wegMeldung, adNach, en, preisGewicht, ohneAdapter, ohneHinweis}; });
    const ok = /Adapter vorn automatisch dazugenommen: Shimano SM-MA-F203P\/PM/.test(r.meldung) && !/warnung|fehler/.test(r.gabelKlasse) && !!r.farbe && r.farbe !== r.warnFarbe
      && /Braucht Adapter vorn: Shimano SM-MA-F203P\/PM — automatisch dabei/.test(r.unter) && !r.warnFund && /Automatisch dabei/.test(r.adFund) && /automatisch dabei/.test(r.kopf)
      && /Adapter vorn entfällt: Shimano SM-MA-F203P\/PM/.test(r.wegMeldung) && r.adNach === 0 && /Needs an adapter \(front\): Shimano SM-MA-F203P\/PM — included automatically/.test(r.en);
    const montageOk = /Montagehinweis: Für die 203-mm-Scheibe vorn gehört der Adapter zwischen Gabel und Bremssattel/.test(r.meldung)
      && /Montagehinweis: Für die 203-mm-Scheibe vorn/.test(r.unter) && /Montagehinweis/.test(r.adFund)
      && /Fitting note: the 203 mm rotor \(front\) needs the adapter between the fork and brake caliper/.test(r.en)
      && r.preisGewicht && r.ohneAdapter === 0 && r.ohneHinweis;
    return {ok:ok && montageOk, info:r}; }],
  ['Scheibenwechsel 203/203 → 220/203 → 180/180: Adapterwechsel je Seite, keine Doppel, Reload (DE/EN, Mein Rad/Traumrad)', async () => {
    const resultate = [];
    for(const [spr, modusTest, breite] of [['de', 'real', 390], ['en', 'traum', 320]]){
      await neu(spr); await seite.setViewportSize({width:breite, height:844});
      const selector = await ev(m => {
        wechsle(m); build.rahmen = 'f-stumpy'; build.gabel = 'g-pike'; build.angaben = {'f-stumpy|max':{max:203}};
        const b = rohTeil('bremsen', 'b-xt'), i = b.v.findIndex(d => d.k === 'Scheiben'), w = findeTeil('bremsen', 'b-xt').wahl.slice();
        w[i] = b.v[i].o.findIndex(o => o.s.sV === 203 && o.s.sH === 203); build.bremsen = varianteNachIndex(b, w).id;
        sichern(); zeichne(); oeffneSlot('bremsen', {tab:'alle'});
        return {gross:`bremsen|${i}|${b.v[i].o.findIndex(o => o.s.sV === 220 && o.s.sH === 203)}`, klein:`bremsen|${i}|${b.v[i].o.findIndex(o => o.s.sV === 180 && o.s.sH === 180)}`};
      }, modusTest);
      await seite.locator('#modal .ts-dein > summary').click();
      await seite.locator('#modal [data-varauf="bremsen"]').click();
      await seite.locator(`#modal [data-var="${selector.gross}"]`).click();
      const gross = await ev(() => ({
        ads:bewerte(build).adapter.filter(a => a.art === 'bremse').map(a => ({id:a.id, n:a.n, mm:a.grafik.scheibe})),
        meldung:$('toast').textContent, html:$('modal').querySelector('.brems-ad-auto').textContent,
        overflow:$('modal').querySelector('.sheet-b').scrollWidth > $('modal').querySelector('.sheet-b').clientWidth + 1,
        bremsen:build.bremsen
      }));
      await seite.reload(); await bereit();
      const geladen = await ev(() => ({id:build.bremsen, ads:bewerte(build).adapter.filter(a => a.art === 'bremse').map(a => a.n), einkauf:einkaufHtml(bewerte(build))}));
      await ev(() => oeffneSlot('bremsen', {tab:'alle'}));
      await seite.locator('#modal .ts-dein > summary').click();
      await seite.locator('#modal [data-varauf="bremsen"]').click();
      await seite.locator(`#modal [data-var="${selector.klein}"]`).click();
      const klein = await ev(() => ({ads:bewerte(build).adapter.filter(a => a.art === 'bremse').length, meldung:$('toast').textContent, html:$('modal').querySelector('.brems-ad-auto').textContent}));
      const ok = gross.ads.length === 2 && gross.ads.find(a => a.id === 'brems-v').mm === 220 && gross.ads.find(a => a.id === 'brems-h').mm === 203
        && /SM-MA-F203P\/PM → Shimano SM-MA-F220P\/PM/.test(gross.meldung)
        && (spr === 'de' ? /Adapter vorn automatisch gewechselt/.test(gross.meldung) && !/Adapter hinten/.test(gross.meldung) : /Adapter changed automatically \(front\)/.test(gross.meldung) && !/\(rear\)/.test(gross.meldung))
        && /220 mm/.test(gross.html) && /203 mm/.test(gross.html) && !gross.overflow
        && geladen.id === gross.bremsen && geladen.ads.every(n => gross.ads.some(a => a.n === n))
        && (modusTest !== 'traum' || geladen.ads.every(n => geladen.einkauf.includes(n)))
        && klein.ads === 0 && (spr === 'de' ? (klein.html.match(/Kein Adapter nötig/g) || []).length === 2 && /Adapter vorn entfällt/.test(klein.meldung) && /Adapter hinten entfällt/.test(klein.meldung)
          : (klein.html.match(/No adapter needed/g) || []).length === 2 && /no longer needed \(front\)/.test(klein.meldung) && /no longer needed \(rear\)/.test(klein.meldung));
      resultate.push({ok, spr, gross, geladen, klein});
    }
    await seite.setViewportSize({width:390, height:844});
    return {ok:resultate.every(r => r.ok), info:resultate}; }],
  ['Bremsenmarke bei gleicher Scheibengroesse wechseln: neuer Artikel wird gemeldet, bezahlt und mit Rueckgaengig wiederhergestellt', async () => {
    await neu();
    const id = await ev(() => {
      build.rahmen = 'f-stumpy'; build.gabel = 'g-pike'; build.bremsen = 'b-xt'; sichern(); zeichne();
      oeffneSlot('bremsen', {tab:'alle'});
      return kandidaten('bremsen', build).find(t => basisVon(t.id) === 'b-mt7').id;
    });
    const vorher = await ev(id => {
      const pk = paketFuer('bremsen', id);
      return {id:build.bremsen, ad:bewerte(build).adapter.find(a => a.id === 'brems-v').n, neu:pk.neu.map(a => a.n), weg:pk.weg.map(a => a.n), weiter:pk.weiter.map(a => a.n), preis:pk.adPreis};
    }, id);
    await seite.locator(`#modal [data-einbau="bremsen|${id}"]`).click();
    const nach = await ev(() => ({ad:bewerte(build).adapter.find(a => a.id === 'brems-v').n, meldung:$('toast').textContent, verlauf:verlaufListe()[0]}));
    await seite.locator('#toast .toast-zurueck').click();
    const zurueck = await ev(() => ({id:build.bremsen, ad:bewerte(build).adapter.find(a => a.id === 'brems-v').n}));
    return {ok:/Shimano/.test(vorher.ad) && vorher.neu.some(n => /Magura QM44/.test(n)) && vorher.weg.includes(vorher.ad) && !vorher.weiter.includes(vorher.ad) && vorher.preis > 0
      && /Magura QM44/.test(nach.ad) && /Adapter vorn automatisch gewechselt/.test(nach.meldung) && nach.verlauf.neu.includes(nach.ad)
      && zurueck.id === vorher.id && zurueck.ad === vorher.ad, info:{vorher, nach, zurueck}}; }],
  ['Gabel und Rahmen wechseln: Adapter werden aus der neuen Aufnahme abgeleitet', async () => {
    await neu();
    const r = await ev(() => {
      build.rahmen = 'f-stumpy'; build.gabel = 'g-pike'; build.bremsen = 'b-xt'; sichern(); zeichne();
      uebernehmen('gabel', 'g-zeb', 'test');
      const g = bewerte(build).adapter.find(a => a.id === 'brems-v'), meldung = $('toast').textContent;
      rueckgaengigLetzte(); const zurueck = bewerte(build).adapter.find(a => a.id === 'brems-v');
      uebernehmen('rahmen', 'f-oiz', 'test');
      const h = bewerte(build).adapter.find(a => a.id === 'brems-h');
      return {g:g && g.grafik, meldung, zurueck:zurueck && zurueck.grafik, h:h && h.grafik};
    });
    return {ok:r.g && r.g.nativ === 200 && r.g.scheibe === 203 && /Adapter vorn automatisch gewechselt/.test(r.meldung)
      && r.zurueck.nativ === 180 && r.h && r.h.aufnahme === 'FM', info:r}; }],
  ['Adapteruebersicht: unbekannte und unzulaessige Masse bleiben offen bzw. unpassend; native Aufnahme ohne Adapter; Felgenbremse ohne Disc-Hinweis', async () => {
    await neu();
    const r = await ev(() => {
      build.rahmen = 'f-stumpy'; build.gabel = 'g-recon'; build.bremsen = 'b-xt'; build.angaben = {};
      const lesen = () => { zeichne(); oeffneSlot('bremsen', {tab:'alle'}); return $('modal').querySelector('[data-bremsadapter="gabel"]').textContent; };
      const offen = lesen();
      build.gabel = 'g-pike'; const b = rohTeil('bremsen', 'b-xt'), w = findeTeil('bremsen', 'b-xt').wahl.slice(), i = b.v.findIndex(d => d.k === 'Scheiben');
      w[i] = b.v[i].o.findIndex(o => o.s.sV === 220 && o.s.sH === 203); build.bremsen = varianteNachIndex(b, w).id;
      build.angaben['g-pike|max'] = {max:200}; const zuGross = lesen();
      build.gabel = 'g-fox40'; build.bremsen = 'b-xt'; const direkt = lesen();
      w[i] = b.v[i].o.findIndex(o => o.s.sV === 180 && o.s.sH === 180); build.bremsen = varianteNachIndex(b, w).id; const zuKlein = lesen();
      const felge = bremsAdapterHtml({mount:'Felge'}, bewerte(build));
      return {offen, zuGross, direkt, zuKlein, felge};
    });
    return {ok:/Adapterbedarf offen/.test(r.offen) && /Ein Adapter löst das nicht/.test(r.zuGross) && /Kein Adapter nötig/.test(r.direkt)
      && /Ein Adapter löst das nicht/.test(r.zuKlein) && r.felge === '', info:r}; }],
  /* BEVEL-003 Abschnitt 5: die im Audit angebotene 220/203 ausdruecklich -- vorn belegt (Pike ab 2023: 220 mm),
     hinten am Stumpjumper Alloy nicht belegt: "Noch zu pruefen" mit Frage, keine bestaetigte Passform */
  ['Adapter konkret und Freigabe 220/203: Artikel je Position, unbelegte Freigabe wird erfragt statt bestaetigt', async () => {
    await neu();
    const r = await ev(() => { wechsle('real'); build.rahmen = 'f-stumpy'; build.gabel = 'g-pike'; build.bremsen = 'b-xt'; build.angaben = {}; sichern();
      const basis = rohTeil('bremsen', 'b-xt'), i = basis.v.findIndex(d => d.k === 'Scheiben'), w = findeTeil('bremsen', 'b-xt').wahl.slice();
      w[i] = basis.v[i].o.findIndex(o => o.s.sV === 220 && o.s.sH === 203); const v = varianteNachIndex(basis, w);
      const pk = paketFuer('bremsen', v), st = paketStatus(pk).t;
      const ad = pk.neu.map(a => a.pos + ': ' + a.n), frage = pk.fehlt.map(f => f.frage && f.frage.k);
      build.angaben['f-stumpy|max'] = {max:203}; const mit203 = paketStatus(paketFuer('bremsen', v)).t;
      build.angaben['f-stumpy|max'] = {max:200}; const mit200 = paketFuer('bremsen', v).neueFehler.map(f => f.titel);
      jahrWahl[modus] = 2021; build.angaben = {}; const alt = bewerte({...build, bremsen:v.id}).funde.filter(f => f.fehlt).map(f => f.fehlt); jahrWahl[modus] = null;
      return {st, ad, frage, mit203, mit200, alt, gesamt:pk.gesamt, bleibt:pk.bleibt, scheiben:pk.scheibenNeu.length}; });
    const ok = r.st === 'Noch zu prüfen' && r.ad.some(a => /^hinten: Shimano SM-MA-F203P\/PM/.test(a)) && r.ad.some(a => /^vorn: Shimano SM-MA-F220P\/PM/.test(a))
      && r.frage.indexOf('rahmen|max') >= 0 && r.mit203 === 'Passend mit Zubehör' && r.mit200.some(t => /hinten zu groß/.test(t))
      && r.alt.some(x => /vorn für 220/.test(x)) && r.bleibt && r.scheiben === 2;
    return {ok, info:r}; }],
  ['Fehlende Angabe: Hinweis mit gezielter Frage, kein Abzug, Antwort rechnet den Adapter', async () => {
    await neu();
    const r = await ev(() => { build.gabel = 'g-recon'; build.bremsen = 'b-xt'; sichern(); zeichne();
      const f = bewerte(build).funde.find(x => x.frage && x.frage.k === 'gabel');
      /* BEVEL-003: fehlende Angaben stehen im zugeklappten Pruefungsbereich, nicht mehr am Score */
      pruefUmschalten(false); const ohne = bewerte(build).tech, datenbasis = ($('pruef').querySelector('.pf-offen') || {textContent:''}).textContent;
      oeffneAngabe('gabel'); const knoepfe = $('modal').querySelectorAll('[data-angabe]').length; schliesse();
      angabeSetzen('gabel', 'PM', 160);
      const nach = bewerte(build), ad = nach.adapter.filter(a => a.wo === 'gabel' && a.art === 'bremse'), weg = !nach.funde.some(x => x.frage && x.frage.k === 'gabel');
      angabeSetzen('gabel', '', 0); const wieder = bewerte(build).funde.some(x => x.frage && x.frage.k === 'gabel');
      return {frage:!!f, fehlt:f && f.fehlt, ohneAbzug:ohne === 100 || !bewerte(build).funde.filter(x => !x.fehlt).length || true, tech:ohne, datenbasis:/Bremsaufnahme vorn/.test(datenbasis), knoepfe, ad:ad.map(a => a.n), weg, wieder}; });
    return {ok:r.frage && r.datenbasis && r.knoepfe >= 6 && r.ad.length === 1 && r.weg && r.wieder, info:r}; }],
  ['Fehlende Angabe zaehlt nicht als Abzug: Score gleich mit und ohne den Hinweis', async () => {
    await neu();
    const r = await ev(() => { build.gabel = 'g-recon'; sichern(); const a = bewerte(build);
      const ohneHinweis = a.funde.filter(f => !f.fehlt).reduce((t, f) => t - (f.adapter ? ABZUG.adapter : ABZUG[f.level]), 100);
      return {tech:a.tech, rechnung:Math.max(0, Math.min(100, Math.round(ohneHinweis))), fehlt:a.funde.filter(f => f.fehlt).length}; });
    return {ok:r.fehlt >= 1 && r.tech === r.rechnung, info:r}; }],
  ['Angebote: ohne gepruefte Quelle kein "Zum Produkt"; nicht lieferbar, veraltet, Einzelbremse und kaputter Link zaehlen nicht', async () => {
    await neu();
    const r = await ev(() => { const t = findeTeil('bremsen', 'b-xt'), frisch = new Date().toISOString(), alt = new Date(Date.now() - 5 * 864e5).toISOString();
      const probe = (teile, stand) => { live.teile = teile; live.stand = stand; ANGEBOTE.clear(); return {html:zumProduktHtml(t, true), link:!!produktLink(t)}; };
      const o = {s:'Testshop', p:329, u:399, v:0, l:'https://shop.example/xt-set', b:'', n:'Shimano XT BR-M8120 Set', a:1};
      const leer = probe({}, null);
      const aus = probe({'b-xt':[{...o, a:0}]}, frisch);
      const ok = probe({'b-xt':[{...o, z:'set'}]}, frisch);
      const veraltet = probe({'b-xt':[o]}, alt);
      const einzel = probe({'b-xt':[{...o, z:'vorn'}]}, frisch);
      const kaputt = probe({'b-xt':[{...o, k:0}]}, frisch);
      const ohneHttps = probe({'b-xt':[{...o, l:'http://shop.example/x'}]}, frisch);
      live.teile = {}; live.stand = null; ANGEBOTE.clear();
      return {leer, aus, ok, veraltet, einzel, kaputt, ohneHttps}; });
    const kein = x => !x.link && /Derzeit kein geprüftes Angebot/.test(x.html);
    return {ok:kein(r.leer) && kein(r.aus) && r.ok.link && /Zum Produkt/.test(r.ok.html) && /Anzeige/.test(r.ok.html) && kein(r.veraltet) && kein(r.einzel) && kein(r.kaputt) && kein(r.ohneHttps), info:r}; }],
  /* BEVEL-003 Abschnitt 4: Einzelbremsen vorn + hinten desselben Shops bilden den Satz; gepruefte Produktseite ohne Preis */
  ['Produktseite und Gesamtkosten: Satz aus vorn + hinten mit Versand, gepruefte Seite ohne Preisbehauptung, Einzelbremse allein zaehlt nicht', async () => {
    await neu();
    const r = await ev(() => { wechsle('real'); build.rahmen = 'f-stumpy'; build.gabel = 'g-pike'; build.bremsen = 'b-deore'; sichern();
      const t = findeTeil('bremsen', 'b-xt'), frisch = new Date().toISOString(), heute = frisch.slice(0, 10);
      const o = {s:'Testshop', u:null, b:'', a:1, k:1};
      live.teile = {'b-xt':[{...o, p:169, v:3.95, l:'https://shop.example/xt-vorn', n:'Shimano XT BR-M8120 Vorderrad', z:'vorn'}, {...o, p:175, v:3.95, l:'https://shop.example/xt-hinten', n:'Shimano XT BR-M8120 Hinterrad', z:'hinten'}]};
      live.stand = frisch; live.seiten = {}; ANGEBOTE.clear();
      const g = gepruefteAngebote(t)[0], pl = produktLink(t), html = zumProduktHtml(t), her = preisHerkunft(t), pk = paketFuer('bremsen', t);
      const paar = {p:g && g.p, v:g && g.v, z:g && g.z, l2:!!(pl && pl.l2), knoepfe:/Zum Produkt · vorn/.test(html) && /Hinten/.test(html), her, gesamt:pk.gesamt, teil:pk.teilPreis, ad:pk.adPreis, versand:pk.versand};
      live.teile = {'b-xt':[{...o, p:169, v:0, l:'https://shop.example/xt-vorn', n:'Shimano XT BR-M8120 Vorderrad', z:'vorn'}]}; ANGEBOTE.clear();
      const einzeln = !produktLink(t);
      live.teile = {}; live.seiten = {'b-xt':[{s:'Rose', l:'https://shop.example/vorn', z:'vorn', d:heute, k:1}, {s:'Rose', l:'https://shop.example/hinten', z:'hinten', d:heute, k:1}]}; ANGEBOTE.clear();
      const ps = produktLink(t), shtml = zumProduktHtml(t), sher = preisHerkunft(t);
      const seite = {art:ps && ps.art, stand:/Seite geprüft am/.test(shtml) && /Preis nicht live/.test(shtml), richt:/nicht live gelesen/.test(sher), preisRicht:preisVon(t) === t.p};
      live.seiten = {'b-xt':[{s:'Rose', l:'https://shop.example/vorn', z:'vorn', d:heute, k:0}, {s:'Rose', l:'https://shop.example/hinten', z:'hinten', d:heute, k:1}]};
      const durchgefallen = !produktLink(t);
      live.seiten = {}; live.stand = null; ANGEBOTE.clear();
      return {paar, einzeln, seite, durchgefallen}; });
    const p = r.paar;
    const ok = p.p === 344 && p.v === 3.95 && p.z === 'paar' && p.l2 && p.knoepfe && /zusammengerechnet/.test(p.her) && /kein vollständiger Marktvergleich/.test(p.her) && /ohne Scheiben/.test(p.her)
      && p.teil === 344 && Math.abs(p.gesamt - (344 + p.ad + 3.95)) < 0.01 && r.einzeln && r.seite.art === 'seite' && r.seite.stand && r.seite.richt && r.seite.preisRicht && r.durchgefallen;
    return {ok, info:r}; }],
  ['Keine Suchlinks als Produktlink: Listen und Einkauf zeigen nur geprueftes Angebot oder nichts', async () => {
    await neu();
    const r = await ev(() => { aff.an = Object.fromEntries(SHOPS.map(s => [s.id, true])); live.teile = {}; ANGEBOTE.clear();
      view = 'deals'; zeichne(); const ek = $('einkauf').querySelectorAll('a.such').length;
      oeffneSlot('bremsen', {tab:'alle'}); const liste = $('modal').querySelectorAll('#opt-liste a.such').length;
      oeffneSlot('bremsen', {tab:'finden'}); const finder = $('modal').querySelectorAll('.fk a.such').length; schliesse();
      oeffneDetail('bremsen', build.bremsen); const detail = $('modal').querySelectorAll('a.such').length, beschriftet = /führt zur Suche, nicht zu einer geprüften Produktseite/.test($('modal').textContent); schliesse();
      return {ek, liste, finder, detail, beschriftet}; });
    return {ok:!r.ek && !r.liste && !r.finder && r.detail === 0, info:r}; }],
  ['Mehrere Raeder: Wunschliste je Rad getrennt, bleibt nach Neuladen', async () => {
    await neu();
    await ev(() => { pro = {key:'x', inst:'i', status:'aktiv', geprueft:Date.now()}; const a = aktivId[modus]; merken('bremsen', 'b-mt4'); profilNeu(); merken('gabel', 'g-recon'); merken('sattel', (katalog('sattel')[0] || {}).id); profilWechseln(a); });
    const vor = await ev(() => ({n:profile.traum.map(p => (p.wuensche || []).length), aktiv:wunschListe().map(w => w.teil)}));
    await seite.reload(); await bereit();
    const nach = await ev(() => ({n:profile.traum.map(p => (p.wuensche || []).length), aktiv:wunschListe().map(w => w.teil)}));
    return {ok:JSON.stringify(vor.n) === JSON.stringify([1, 2]) && JSON.stringify(vor) === JSON.stringify(nach) && nach.aktiv[0] === 'b-mt4', info:{vor, nach}}; }],
  ['Wunschliste: im Aufbau testen und zurueck, auf die Einkaufsliste, als verbaut uebernehmen mit Verlauf', async () => {
    await neu();
    const r = await ev(() => { wechsle('real'); build.rahmen = 'f-stumpy'; build.gabel = 'g-pike'; build.bremsen = 'b-xt'; sichern();
      merken('bremsen', 'b-mt4'); const w = wunschListe()[0];
      wunschTesten(w.id); const test = {bau:basisVon(build.bremsen), banner:!!document.querySelector('.test-banner')};
      testBeenden(); const zurueck = basisVon(build.bremsen);
      view = 'wunsch'; zeichne(); $('wunschliste').querySelector(`[data-wkauf="${w.id}"]`).click();
      view = 'deals'; zeichne(); const imEinkauf = /Magura MT4/.test($('einkauf').textContent);
      /* BEVEL-003: "als montiert uebernehmen" zeigt erst das Paket, dort wird uebernommen */
      view = 'wunsch'; zeichne(); $('wunschliste').querySelector(`[data-wverbaut="${w.id}"]`).click();
      const paket = !!$('modal').querySelector('.vt-paket'), knopf = ($('modal').querySelector('[data-ersetzen]') || {textContent:''}).textContent.trim();
      $('modal').querySelector('[data-ersetzen]').click();
      return {test, zurueck, imEinkauf, paket, knopf, verbaut:basisVon(build.bremsen), weg:!wunschListe().length, verlauf:verlaufListe()[0] && verlaufListe()[0].quelle}; });
    return {ok:r.test.bau === 'b-mt4' && r.test.banner && r.zurueck === 'b-xt' && r.imEinkauf && r.paket && /montiert/.test(r.knopf) && r.verbaut === 'b-mt4' && r.weg && r.verlauf === 'wunsch', info:r}; }],
  /* BEVEL-003 Abschnitt 6: Test ist Vorschau -- gespeichert bleibt das echte Teil, auch ueber Neuladen und Radwechsel */
  ['Test nie als verbaut: Speicher haelt das echte Teil, Neuladen zeigt den Test wieder, anderes Rad unberuehrt, Einkauf nur Wuensche', async () => {
    await neu();
    const a = await ev(() => { wechsle('real'); build.rahmen = 'f-stumpy'; build.gabel = 'g-pike'; build.bremsen = 'b-xt'; sichern();
      const radA = aktivId.real; merken('bremsen', 'b-mt4'); const w = wunschListe()[0]; wunschTesten(w.id);
      const gespeichert = JSON.parse(localStorage.getItem('mtb.profile')).liste.real.find(p => p.id === radA).build.bremsen;
      const imSpeicherBuilds = JSON.parse(localStorage.getItem('mtb.builds')).real.bremsen;
      return {radA, gespeichert, imSpeicherBuilds, imAufbau:basisVon(build.bremsen), kopf:$('mini-a').textContent}; });
    await seite.reload(); await bereit();
    const b = await ev(radA => { const nachLaden = {bau:basisVon(build.bremsen), banner:!!document.querySelector('.test-banner'), kopf:$('mini-a').textContent};
      profilNeu(); build.rahmen = 'f-stumpy'; build.bremsen = 'b-deore'; sichern(); const radB = {bau:build.bremsen, banner:!!document.querySelector('.test-banner')};
      profilWechseln(radA); const zurueckA = basisVon(build.bremsen);
      merken('gabel', 'g-lyrik'); wunschListe().find(x => x.slot === 'gabel').stufe = 'einkauf'; wunschListe().find(x => x.slot === 'bremsen').stufe = 'einkauf'; sichern();
      view = 'deals'; zeichne(); const ek = $('einkauf').textContent;
      testBeenden(); const ende = basisVon(build.bremsen);
      return {nachLaden, radB, zurueckA, ende, einkauf:{rahmen:/Stumpjumper/.test(ek), gabel:/Lyrik/.test(ek), hinweis:/schon verbaut ist, steht hier nicht/.test(ek)}}; }, a.radA);
    const ok = a.gespeichert === 'b-xt' && String(a.imSpeicherBuilds).split('|')[0] === 'b-xt' && a.imAufbau === 'b-mt4' && /Test läuft/.test(a.kopf)
      && b.nachLaden.bau === 'b-mt4' && b.nachLaden.banner && /Test läuft/.test(b.nachLaden.kopf) && b.radB.bau === 'b-deore' && !b.radB.banner
      && b.zurueckA === 'b-mt4' && b.ende === 'b-xt' && !b.einkauf.rahmen && b.einkauf.gabel && b.einkauf.hinweis;
    return {ok, info:{a, b}}; }],
  ['Vorher/nachher: Tabelle auf gleicher Grundlage mit Ziel, Gesamtkosten, Zubehoer und Unbekanntem', async () => {
    await neu();
    const r = await ev(() => { build.gabel = 'g-recon'; build.bremsen = 'b-deore2'; sichern(); finder.slot = 'bremsen'; finder.ziel = 'kraft';
      oeffneVergleich('bremsen', 'b-xt'); const m = $('modal');
      const kopf = [...m.querySelectorAll('.vt thead th')].map(e => e.textContent.trim()), zeilen = [...m.querySelectorAll('.vt tbody tr')].map(e => e.textContent.trim());
      const txt = m.textContent; schliesse();
      /* BEVEL-003: 2 gegen 4 Kolben in beide Richtungen nur "andere Bauart", nie besser oder schlechter */
      build.bremsen = 'b-xt'; sichern(); oeffneVergleich('bremsen', 'b-deore2'); const rueck = [...$('modal').querySelectorAll('.vt tbody tr')].map(e => e.textContent.trim()); schliesse();
      const bauart = l => (l.find(z => /^Bauart/.test(z)) || '');
      return {kopf, hin:bauart(zeilen), rueck:bauart(rueck), ziel:/Ziel: Mehr Bremskraft/.test(txt), kosten:/Kosten des Wechsels/.test(txt), fehlend:/Fehlende Angaben/.test(txt), gewicht:/nicht vergleichbar/.test(txt)}; });
    const neutral = z => /andere Bauart/.test(z) && !/besser|schlechter/.test(z);
    return {ok:r.kopf.length === 4 && neutral(r.hin) && neutral(r.rueck) && r.ziel && r.kosten && r.fehlend && r.gewicht, info:r}; }],
  /* BEVEL-003: Reihenfolge Rad -> Score -> Pruefung -> "Verbessern" -> Teile (Rahmen zuerst) */
  ['Pruefung im Aufbau: unter Rad und Score, vor "Verbessern" und dem Rahmen, aufklappbar per Tastatur, Zustand bleibt', async () => {
    await neu();
    await ev(() => { pruefOffen = false; try{ localStorage.setItem('mtb.pruef', 'zu'); }catch(e){} view = 'aufbau'; zeichne(); });
    const kopf = await seite.$('#pruef .pf-kopf'); await kopf.focus(); await seite.keyboard.press('Enter'); await seite.waitForTimeout(200);
    const r = await ev(() => { const p = $('pruef'), a = $('aufbau');
      const teile = ['.radbild', '#seite', '#pruef', '.verb', '.grp'].map(q => a.querySelector(q));
      const vor = (x, y) => !!x && !!y && !!(x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING);
      const rahmen = a.querySelector('.grp [data-slot="rahmen"]');
      return {da:teile.map(x => !!x), reihe:teile.every((x, i) => i === 0 || vor(teile[i - 1], x)), rahmenZuerst:!!rahmen && a.querySelector('.grp').contains(rahmen),
        offen:p.querySelector('.pf-kopf').getAttribute('aria-expanded'), inhalt:!$('pf-inhalt').hidden, gespeichert:localStorage.getItem('mtb.pruef')}; });
    return {ok:r.da.every(Boolean) && r.reihe && r.rahmenZuerst && r.offen === 'true' && r.inhalt && r.gespeichert === 'auf', info:r}; }],
  ['Radbild: kein fremdes Rad -- eigenes Foto, Spindrift-Modell nur beim Spindrift, sonst Geometrie oder Platzhalter', async () => {
    await neu();
    const r = await ev(() => { const art = () => ($('aufbau').querySelector('.radbild') || {className:''}).className.replace('radbild', '').trim();
      build.rahmen = 'f-spindrift'; zeichne(); const sp = art();
      build.rahmen = 'f-stumpy'; zeichne(); const geo = art();
      build.rahmen = null; zeichne(); const leer = art();
      wechsle('real'); fotos.real = 'data:image/gif;base64,R0lGODlhAQABAAAAACw='; zeichne(); const foto = art();
      return {sp, geo, leer, foto}; });
    return {ok:r.sp === 'render' && r.geo === 'geo' && r.leer === 'leer' && r.foto === 'foto', info:r}; }],
  ['Englisch: Finder, Vergleich und Wunschliste ohne deutsche Reste', async () => {
    await neu('en');
    const r = await ev(() => { oeffneSlot('bremsen', {ziel:'leicht'}); const a = $('modal').textContent;
      const e = finderRechnen('bremsen'); if(e.treffer[0]) oeffneVergleich('bremsen', e.treffer[0].t.id); const b = $('modal').textContent; schliesse();
      if(e.treffer[0]) merken('bremsen', e.treffer[0].t.id); view = 'wunsch'; zeichne(); const c = $('wunschliste').textContent;
      view = 'aufbau'; pruefOffen = true; zeichne(); const d = $('pruef').textContent + $('aufbau').querySelector('.radbild').textContent;
      const de = /\b(Leichter|Merken|Vergleichen|Gemerkt|Passt mit|Richtpreis|statt|Einschätzung|Wunschliste|Prüfung|Keine Konflikte|Zubehör|Teil eintragen)\b/;
      return {a:de.test(a) ? a.match(de)[0] : '', b:de.test(b) ? b.match(de)[0] : '', c:de.test(c) ? c.match(de)[0] : '', d:de.test(d) ? d.match(de)[0] : ''}; });
    return {ok:!r.a && !r.b && !r.c && !r.d, info:r}; }],
  ['Einfuehrung: sechs Szenen vor der Einrichtung, ueberspringbar, nur einmal, per Tastatur, erneut ueber die Hilfe', async () => {
    await seite.goto(URL0); await ev(() => { localStorage.clear(); localStorage.setItem('mtb.sprache', 'de'); }); await seite.reload();
    await seite.waitForSelector('[data-lsstart]'); await seite.click('[data-lsstart]');
    await seite.waitForSelector('#szenen .sz');
    const r1 = await ev(() => ({punkte:document.querySelectorAll('#szenen .sz-punkte i').length, weg:!!document.querySelector('[data-szweg]'), ei:!!document.querySelector('#modal .ei'), fokus:document.activeElement && document.activeElement.dataset.szweiter}));
    await seite.keyboard.press('ArrowRight'); await seite.keyboard.press('ArrowRight');
    const r2 = await ev(() => ({szene:szene.i, titel:document.querySelector('#sz-h').textContent}));
    /* Die Einrichtung liegt sofort unter den ausblendenden Szenen; danach
       verschwindet die Szenen-Ebene. Gewartet wird auf den Zustand, nicht auf
       eine feste Zeit -- ohne Grafikkarte (CI) dauert ein Bild bis 300 ms. */
    await seite.keyboard.press('Escape');
    const r3a = await ev(() => ({ei:!!document.querySelector('#modal .ei'), gesperrt:document.body.style.position === 'fixed'}));
    await seite.waitForFunction(() => !document.querySelector('#szenen .sz'), null, {timeout:5000}).catch(() => {});
    const r3 = await ev(() => ({gesehen:localStorage.getItem('mtb.szenen'), weg:!document.querySelector('#szenen .sz'), ei:!!document.querySelector('#modal .ei'), gesperrt:document.body.style.position === 'fixed'}));
    await ev(() => { localStorage.setItem('mtb.einstieg2', '1'); }); await seite.reload(); await bereit(); await seite.waitForTimeout(500);
    const r4 = await ev(() => ({szenen:!!document.querySelector('#szenen .sz')}));
    await ev(() => { oeffneMenu(); $('modal').querySelector('[data-szenen]').click(); });
    await seite.waitForFunction(() => !!document.querySelector('#szenen .sz'), null, {timeout:5000}).catch(() => {});
    const r5 = await ev(() => ({wieder:!!document.querySelector('#szenen .sz')}));
    /* Ohne Folgeschritt gibt das Ende die Seite frei; Tasten waehrend des Ausblendens wirken nicht mehr */
    await ev(() => document.querySelector('[data-szweg]') && document.querySelector('[data-szweg]').click());
    await seite.keyboard.press('ArrowRight');
    await seite.waitForFunction(() => !document.querySelector('#szenen .sz'), null, {timeout:5000}).catch(() => {});
    const r6 = await ev(() => ({weg:!document.querySelector('#szenen .sz'), frei:document.body.style.position === '', modal:!!$('modal').firstElementChild}));
    const r = {r1, r2, r3a, r3, r4, r5, r6};
    return {ok:r1.punkte === 6 && r1.weg && !r1.ei && r1.fokus === '1' && r2.szene === 2 && /Klarer Plan/.test(r2.titel) && r3a.ei && r3a.gesperrt
      && r3.gesehen === '1' && r3.weg && r3.ei && r3.gesperrt && !r4.szenen && r5.wieder && r6.weg && r6.frei && !r6.modal, info:r}; }],
];

let bestanden = 0, gelaufen = 0;
for(const [name, fn] of PRUEFUNGEN){
  let e;
  try{ e = await fn(); }catch(err){ e = {ok:false, info:'Ausnahme: ' + err.message}; }
  gelaufen++;
  if(e.ok){ bestanden++; console.log('  ok   ' + name); }
  else console.log('  FEHL ' + name + '\n         ' + JSON.stringify(e.info).slice(0, 900));
}
if(jsFehler.length) console.log('JS-Fehler in der Seite:\n  ' + [...new Set(jsFehler)].join('\n  '));
const ok = bestanden === PRUEFUNGEN.length && gelaufen === PRUEFUNGEN.length && !jsFehler.length;
console.log(`\nBEVEL: ${bestanden} von ${PRUEFUNGEN.length} Prüfungen bestanden${jsFehler.length ? `, ${jsFehler.length} JS-Fehler` : ''}.`);
await browser.close(); server.close();
process.exit(ok ? 0 : 1);
