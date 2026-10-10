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
  ['Gute Bremse ohne Upgrade: kein Wechsel vorgeschlagen, klare Aussage', async () => {
    await neu();
    const r = await ev(F => { const finde = eval(F); build.bremsen = 'b-xt'; sichern(); zeichne();
      const e = finde('bremsen', 'einsatz'); oeffneSlot('bremsen', {ziel:'einsatz'});
      const txt = $('modal').textContent; schliesse();
      return {treffer:e.treffer.length, satz:/Dein aktuelles Teil passt gut\. Für dein Ziel sehen wir derzeit keinen überzeugenden Wechsel\./.test(txt)}; }, FINDE);
    return {ok:r.treffer === 0 && r.satz, info:r}; }],
  ['Keine Rueckschritte: Recon statt Pike Ultimate und MT420 statt XT M8120 erscheinen in keinem Verbesserungsziel', async () => {
    await neu();
    const r = await ev(F => { const finde = eval(F); build.gabel = 'g-pike'; build.bremsen = 'b-xt'; sichern();
      const out = {}; let schlecht = [];
      for(const [k, boese] of [['gabel', 'g-recon'], ['bremsen', 'b-mt420']]){
        for(const z of zieleFuer(k, findeTeil(k, build[k]), 0).filter(z => z !== 'sparen')){
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
        for(const z of zieleFuer(s.k, jetzt, 0).filter(z => ['sparen', 'konflikt'].indexOf(z) < 0)){
          const e = finde(s.k, z);
          for(const x of e.treffer){ n++; if(x.pk.neueFehler.length || !x.vg || x.vg.pB === 0 || x.vg.pS || x.vg.pU) fehl.push(s.k + ':' + z + ':' + x.t.id); } } }
      return {n, fehl:fehl.slice(0, 10)}; }, FINDE);
    return {ok:r.n > 20 && !r.fehl.length, info:r}; }],
  ['Begrenztes Budget: nur Loesungen bis zum Betrag (Teil plus Zubehoer), ausgeblendete werden genannt', async () => {
    await neu();
    const r = await ev(F => { const finde = eval(F); const offen = finde('gabel', 'leicht'), knapp = finde('gabel', 'leicht', [], 900);
      return {offen:offen.treffer.length, knapp:knapp.treffer.length, alleDrunter:knapp.treffer.every(x => x.pk.gesamt <= 900), aus:knapp.ausBudget,
        summe:knapp.treffer.every(x => Math.abs(x.pk.gesamt - (x.pk.teilPreis + x.pk.adPreis + x.pk.folgePreis)) < 0.01)}; }, FINDE);
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
  ['Fehlende Angabe: Hinweis mit gezielter Frage, kein Abzug, Antwort rechnet den Adapter', async () => {
    await neu();
    const r = await ev(() => { build.gabel = 'g-recon'; build.bremsen = 'b-xt'; sichern(); zeichne();
      const f = bewerte(build).funde.find(x => x.frage && x.frage.k === 'gabel');
      const ohne = bewerte(build).tech, datenbasis = $('datenbasis').textContent;
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
  ['Keine Suchlinks als Produktlink: Listen und Einkauf zeigen nur geprueftes Angebot oder nichts', async () => {
    await neu();
    const r = await ev(() => { aff.an = Object.fromEntries(SHOPS.map(s => [s.id, true])); live.teile = {}; ANGEBOTE.clear();
      view = 'deals'; zeichne(); const ek = $('einkauf').querySelectorAll('a.such').length;
      oeffneSlot('bremsen', {tab:'alle'}); const liste = $('modal').querySelectorAll('#opt-liste a.such').length;
      oeffneSlot('bremsen', {tab:'finden'}); const finder = $('modal').querySelectorAll('.fk a.such').length; schliesse();
      oeffneDetail('bremsen', build.bremsen); const detail = $('modal').querySelectorAll('a.such').length, beschriftet = /führt zur Suche, nicht zu einer geprüften Produktseite/.test($('modal').textContent); schliesse();
      return {ek, liste, finder, detail, beschriftet}; });
    return {ok:!r.ek && !r.liste && !r.finder && (r.detail === 0 || r.beschriftet), info:r}; }],
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
      view = 'wunsch'; zeichne(); $('wunschliste').querySelector(`[data-wverbaut="${w.id}"]`).click();
      return {test, zurueck, imEinkauf, verbaut:basisVon(build.bremsen), weg:!wunschListe().length, verlauf:verlaufListe()[0] && verlaufListe()[0].quelle}; });
    return {ok:r.test.bau === 'b-mt4' && r.test.banner && r.zurueck === 'b-xt' && r.imEinkauf && r.verbaut === 'b-mt4' && r.weg && r.verlauf === 'wunsch', info:r}; }],
  ['Vorher/nachher: Tabelle auf gleicher Grundlage mit Ziel, Gesamtkosten, Zubehoer und Unbekanntem', async () => {
    await neu();
    const r = await ev(() => { build.gabel = 'g-recon'; build.bremsen = 'b-deore2'; sichern(); finder.slot = 'bremsen'; finder.ziel = 'kraft';
      oeffneVergleich('bremsen', 'b-xt'); const m = $('modal');
      const kopf = [...m.querySelectorAll('.vt thead th')].map(e => e.textContent.trim()), zeilen = [...m.querySelectorAll('.vt tbody th')].map(e => e.textContent.trim());
      const txt = m.textContent; schliesse();
      return {kopf, zeilen, ziel:/Ziel: Mehr Bremskraft/.test(txt), kosten:/Kosten des Wechsels/.test(txt), fehlend:/Fehlende Angaben/.test(txt), besser:/besser/.test(txt)}; });
    return {ok:r.kopf.length === 4 && r.zeilen.some(z => /^Kolben/.test(z)) && r.ziel && r.kosten && r.fehlend && r.besser, info:r}; }],
  ['Pruefung im Aufbau: zwischen Radbild und Rahmen, aufklappbar per Tastatur, Zustand bleibt', async () => {
    await neu();
    await ev(() => { pruefOffen = false; try{ localStorage.setItem('mtb.pruef', 'zu'); }catch(e){} view = 'aufbau'; zeichne(); });
    const kopf = await seite.$('#pruef .pf-kopf'); await kopf.focus(); await seite.keyboard.press('Enter'); await seite.waitForTimeout(200);
    const r = await ev(() => { const p = $('pruef'), kinder = [...$('aufbau').children].map(e => e.className.split(' ')[0]);
      return {reihe:kinder.slice(0, 4), offen:p.querySelector('.pf-kopf').getAttribute('aria-expanded'), inhalt:!$('pf-inhalt').hidden, gespeichert:localStorage.getItem('mtb.pruef')}; });
    return {ok:r.reihe.indexOf('radbild') >= 0 && r.reihe.indexOf('pruef') === r.reihe.indexOf('radbild') + 1 && r.reihe[r.reihe.indexOf('pruef') + 1] === 'grp' && r.offen === 'true' && r.inhalt && r.gespeichert === 'auf', info:r}; }],
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
  ['Einfuehrung: drei Szenen vor der Einrichtung, ueberspringbar, nur einmal, per Tastatur, erneut ueber die Hilfe', async () => {
    await seite.goto(URL0); await ev(() => { localStorage.clear(); localStorage.setItem('mtb.sprache', 'de'); }); await seite.reload();
    await seite.waitForSelector('[data-lsstart]'); await seite.click('[data-lsstart]');
    await seite.waitForSelector('#szenen .sz');
    const r1 = await ev(() => ({punkte:document.querySelectorAll('#szenen .sz-punkte i').length, weg:!!document.querySelector('[data-szweg]'), ei:!!document.querySelector('#modal .ei'), fokus:document.activeElement && document.activeElement.dataset.szweiter}));
    await seite.keyboard.press('ArrowRight'); await seite.keyboard.press('ArrowRight');
    const r2 = await ev(() => ({szene:szene.i, titel:document.querySelector('#sz-h').textContent}));
    await seite.keyboard.press('Escape'); await seite.waitForTimeout(500);
    const r3 = await ev(() => ({gesehen:localStorage.getItem('mtb.szenen'), weg:!document.querySelector('#szenen .sz'), ei:!!document.querySelector('#modal .ei')}));
    await ev(() => { localStorage.setItem('mtb.einstieg2', '1'); }); await seite.reload(); await bereit(); await seite.waitForTimeout(500);
    const r4 = await ev(() => ({szenen:!!document.querySelector('#szenen .sz')}));
    await ev(() => { oeffneMenu(); $('modal').querySelector('[data-szenen]').click(); }); await seite.waitForTimeout(500);
    const r5 = await ev(() => ({wieder:!!document.querySelector('#szenen .sz')}));
    await ev(() => document.querySelector('[data-szweg]').click()); await seite.waitForTimeout(400);
    const r = {r1, r2, r3, r4, r5};
    return {ok:r1.punkte === 3 && r1.weg && !r1.ei && r1.fokus === '1' && r2.szene === 2 && /Klarer Plan/.test(r2.titel) && r3.gesehen === '1' && r3.weg && r3.ei && !r4.szenen && r5.wieder, info:r}; }],
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
