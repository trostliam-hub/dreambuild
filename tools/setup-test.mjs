/* Setup- und Speicher-Tests fuer CrankScore (Pruefbericht 06.10.2026).
 *
 * Laedt index.html ueber einen kleinen lokalen Server in Chromium und prueft
 * je Befund das verlangte Verhalten: Speicherung je Radprofil (05), SAG je
 * Fahrprofil (06), Speicherfehler (07), Datensicherung (08), Pro-Zeitpruefung
 * (09), Fahrwerkswerte nur mit Herstellerdaten (11-22) und einen Durchlauf
 * ueber alle Gabeln und Daempfer ohne erfundene Werte.
 *
 * Aufruf:   node tools/setup-test.mjs      (oder: npm run test:setup)
 * Ergebnis: letzte Zeile "SETUP: x von n Pruefungen bestanden", Exit-Code 1
 *           bei einem Fehler oder wenn nicht alle n Pruefungen gelaufen sind.
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
const TYP = {'.html':'text/html; charset=utf-8', '.js':'text/javascript', '.json':'application/json', '.png':'image/png', '.woff2':'font/woff2', '.webmanifest':'application/manifest+json'};
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
const neu = async () => {
  await seite.goto(URL0);
  await seite.evaluate(() => { localStorage.clear(); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); localStorage.setItem('mtb.sprache', 'de'); });
  await seite.reload(); await seite.waitForFunction(() => typeof federRechnen === 'function' && typeof suDaten === 'function');
};
const ev = (f, a) => seite.evaluate(f, a);
const PRO = () => { pro = {key:'x', inst:'i', status:'aktiv', geprueft:Date.now()}; };

/* Jede Pruefung: [Name, async () => {ok, info}] */
const PRUEFUNGEN = [
  ['09 Pro: Zukunftsdatum und fehlende Instanz gelten nicht', async () => {
    const r = await ev(() => { const t = (g, inst) => { pro = {key:'x', inst, status:'aktiv', geprueft:g}; return istPro(); };
      return {jetzt:t(Date.now(), 'i'), morgen:t(Date.now() + 864e5, 'i'), ohneInst:t(Date.now(), undefined), vor15:t(Date.now() - 15 * 864e5, 'i'), kaputt:t('abc', 'i')}; });
    return {ok:r.jetzt && !r.morgen && !r.ohneInst && !r.vor15 && !r.kaputt, info:r}; }],
  ['05 Setup je Radprofil, Kopie und Loeschen', async () => {
    const r = await ev(PRO => { eval('(' + PRO + ')()'); plan.fahrer = 80; build.fw = {gj:2025, fertig:true}; sichern();
      const f = federRechnen(), dA = suDaten(f); suP(dA).psi.gabel = 91; suSichern();
      const idA = aktivId[modus], keyA = suKey(f); profilNeu(idA);
      const f2 = federRechnen(), dB = suDaten(f2), kopie = suP(dB).psi.gabel, keyB = suKey(f2); suP(dB).psi.gabel = 70; suSichern();
      const a = setupAlle[keyA].prof.allround.psi.gabel, idB = aktivId[modus]; profilLoeschen(idB);
      return {verschieden:keyA !== keyB, kopie, a, bWeg:!setupAlle[keyB], aDa:!!setupAlle[keyA]}; }, PRO.toString());
    return {ok:r.verschieden && r.kopie === 91 && r.a === 91 && r.bWeg && r.aDa, info:r}; }],
  ['06 SAG je Fahrprofil und Druck', async () => {
    const r = await ev(PRO => { eval('(' + PRO + ')()'); fedModus = 'downhill'; const f = federRechnen(), x = f.gabel; suSagSetzen('gabel', 30);
      const dh = fxMess('gabel', x, suDaten()); fedModus = 'allround'; const ar = fxMess('gabel', x, suDaten());
      fedModus = 'downhill'; const d = suDaten(); suPsiSetzen(f, d, 'gabel', x, suPsi('gabel', x, d) + 5); const nach = fxMess('gabel', x, suDaten()); fedModus = 'allround';
      return {dh, ar, nach}; }, PRO.toString());
    return {ok:r.dh === 30 && r.ar === null && r.nach === null, info:r}; }],
  ['07 Speicher voll wird gemeldet, Foto bleibt', async () => {
    const r = await ev(() => { const o = Storage.prototype.setItem;
      Storage.prototype.setItem = function(k, v){ if(/^mtb\.(builds|profile|foto)/.test(k)) throw new DOMException('voll', 'QuotaExceededError'); return o.call(this, k, v); };
      speicherFehlerT = 0; const ok = sichern(); const toast = $('toast').hidden ? '' : $('toast').textContent;
      fotos[modus] = 'data:image/png;base64,AAAA'; speicherFehlerT = 0; const okF = sichern(); const fotoDa = !!fotos[modus];
      Storage.prototype.setItem = o; fotos[modus] = null; sichern(); return {ok, toast:/fehlgeschlagen/.test(toast), okF, fotoDa}; });
    return {ok:r.ok === false && r.toast && r.okF === false && r.fotoDa, info:r}; }],
  ['08 Sicherung: Rundlauf ohne Verlust', async () => {
    const vorher = await ev(PRO => { eval('(' + PRO + ')()'); plan.fahrer = 77; koerper.erfahrung = 'viel'; kSichern(); fprofil.tempo = 'schnell'; fSichern();
      build.fw = {gj:2025, gf:45, fertig:true}; profile.real.push({...profilLeer('real'), name:'Testrad'}); sichern();
      const f = federRechnen(), d = suDaten(f); suP(d).psi.gabel = 88; suLog(d, {typ:'notiz', txt:'Hausrunde'}); suSichern();
      fotos[modus] = 'data:image/png;base64,QUJD'; sichern();
      const s = sicherungErstellen(true); window.__s = JSON.stringify(s);
      return {profile:localStorage.getItem('mtb.profile'), setup:localStorage.getItem('mtb.setup'), fahrer:localStorage.getItem('mtb.fahrer'), koerper:localStorage.getItem('mtb.koerper'),
        fprofil:localStorage.getItem('mtb.fprofil'), foto:Object.keys(s.daten).some(k => /^mtb\.foto\./.test(k)), lizenz:'mtb.pro' in s.daten}; }, PRO.toString());
    const text = await ev(() => window.__s);
    await neu();
    const nach = await ev(t => { const s = sicherungPruefen(t); if(s.fehler) return {fehler:s.fehler}; const ok = sicherungAnwenden(s); return {ok, vorschau:s.vorschau}; }, text);
    await seite.reload(); await seite.waitForFunction(() => typeof suDaten === 'function');
    const jetzt = await ev(() => ({profile:localStorage.getItem('mtb.profile'), setup:localStorage.getItem('mtb.setup'), fahrer:localStorage.getItem('mtb.fahrer'), koerper:localStorage.getItem('mtb.koerper'),
      fprofil:localStorage.getItem('mtb.fprofil'), planFahrer:plan.fahrer, real:profile.real.map(p => p.name), foto:Object.keys(localStorage).some(k => /^mtb\.foto\./.test(k))}));
    const gleich = ['profile', 'setup', 'fahrer', 'koerper', 'fprofil'].every(k => vorher[k] === jetzt[k]);
    return {ok:gleich && nach.ok && jetzt.planFahrer === 77 && jetzt.real.includes('Testrad') && jetzt.foto && vorher.foto && !vorher.lizenz,
      info:{gleich, nach:nach.vorschau ? {raeder:nach.vorschau.raeder, setup:nach.vorschau.setup, notizen:nach.vorschau.notizen} : nach, real:jetzt.real}}; }],
  ['08 Sicherung: kaputte, fremde und zu neue Dateien abgelehnt', async () => {
    const r = await ev(() => ({kein:!!sicherungPruefen('nicht json').fehler, fremd:!!sicherungPruefen('{"a":1}').fehler,
      neu:!!sicherungPruefen(JSON.stringify({format:SICHERUNG_FORMAT, version:99, daten:{'mtb.fahrer':'80'}})).fehler,
      kaputt:!!sicherungPruefen(JSON.stringify({format:SICHERUNG_FORMAT, version:1, daten:{'mtb.profile':'{kaputt'}})).fehler,
      lizenz:(() => { const s = sicherungPruefen(JSON.stringify({format:SICHERUNG_FORMAT, version:1, daten:{'mtb.fahrer':'80', 'mtb.pro':'{"key":"x"}', 'boese':'1'}})); return !s.fehler && !('mtb.pro' in s.daten) && s.ignoriert.length === 2; })()}));
    return {ok:Object.values(r).every(Boolean), info:r}; }],
  ['08 Sicherung: Speicher voll beim Laden laesst alten Stand stehen', async () => {
    const r = await ev(() => { const altP = localStorage.getItem('mtb.profile'), altF = localStorage.getItem('mtb.fahrer');
      const s = sicherungPruefen(JSON.stringify({format:SICHERUNG_FORMAT, version:1, daten:{'mtb.fahrer':'55', 'mtb.profile':JSON.stringify({v:1, modus:'traum', aktiv:{}, liste:{traum:[], real:[], markt:[]}}), 'mtb.plan':'{}'}}));
      const o = Storage.prototype.setItem; let n = 0;
      Storage.prototype.setItem = function(k, v){ if(sicherungLaeuft && ++n === 2) throw new DOMException('voll', 'QuotaExceededError'); return o.call(this, k, v); };
      const ok = sicherungAnwenden(s); Storage.prototype.setItem = o;
      return {ok, profilGleich:localStorage.getItem('mtb.profile') === altP, fahrerGleich:localStorage.getItem('mtb.fahrer') === altF}; });
    return {ok:r.ok === false && r.profilGleich && r.fahrerGleich, info:r}; }],
  ['11/13 Gabeldruck nur im Tabellenbereich und mit Baujahr', async () => {
    await neu();
    const r = await ev(PRO => { eval('(' + PRO + ')()'); const mit = (kg, j) => { build.gabel = 'g-pike'; plan.fahrer = kg; build.fw = {fertig:true}; if(j !== undefined) build.fw.gj = j; const g = federRechnen().gabel; return [g.psi, g.quellen.psi.art]; };
      return {p2025:mit(80, 2025), ohne:mit(80), j2022:mit(80, 2022), kg180:mit(180, 2025), kg35:mit(35, 2025)}; }, PRO.toString());
    return {ok:r.p2025[0] > 0 && r.ohne[0] === null && r.ohne[1] === 'jahrfehlt' && r.j2022[0] === null && r.kg180[0] === null && r.kg180[1] === 'bereich' && r.kg35[0] === null, info:r}; }],
  ['12/16 kein erfundener Maximaldruck', async () => {
    const r = await ev(() => { build.fw = {gj:2024, fertig:true}; plan.fahrer = 80; const fox34 = katalog(quelleOf(slotOf('gabel'))).find(t => /34/.test(t.n) && /^Fox/.test(t.m || t.n));
      build.gabel = fox34.id; const f = federRechnen(); const out = {fox34:f.gabel.max, daempfer:f.daempfer && f.daempfer.max}; build.gabel = 'g-pike'; return out; });
    return {ok:r.fox34 === null && r.daempfer === null, info:r}; }],
  ['14/15 Daempfer: Feder nur mit Federweg, Startdruck nur FOX', async () => {
    const r = await ev(() => { const kat = katalog(quelleOf(slotOf('daempfer'))), alt = build.daempfer;
      const mit = (t, fwH) => { build.daempfer = (t.v ? besteVariante('daempfer', t, build) : t).id; build.fw = {gj:2025, fertig:true}; if(fwH) build.fw.fwH = fwH; const d = federRechnen().daempfer; return {psi:d.psi, rate:d.rate}; };
      const coil = kat.find(t => /Coil/.test(t.n)), rs = kat.find(t => /Deluxe/.test(t.n) && !/Coil/.test(t.n)), fox = kat.find(t => /^Fox/.test(t.m || t.n) && /Float/.test(t.n) && !/Coil/.test(t.n));
      const out = {coilOhne:mit(coil), coilMit:mit(coil, 150), rs:mit(rs), fox:mit(fox)}; build.daempfer = alt; return out; });
    return {ok:r.coilOhne.rate === null && r.coilMit.rate > 0 && r.rs.psi === null && r.fox.psi > 0, info:r}; }],
  ['17 gespeicherter Druck zentral begrenzt', async () => {
    const r = await ev(PRO => { eval('(' + PRO + ')()'); plan.fahrer = 80; build.gabel = 'g-pike'; build.fw = {gj:2025, fertig:true}; const f = federRechnen(), d = suDaten(f);
      suP(d).psi.gabel = 999; const out = {psi:suPsi('gabel', f.gabel, d), rec:f.gabel.modi.allround.psi, ung:suPsiUngueltig('gabel', f.gabel, d)}; delete suP(d).psi.gabel; return out; }, PRO.toString());
    return {ok:r.psi === r.rec && r.ung === 999, info:r}; }],
  ['20 Tokens ohne Bestueckung keine Stueckzahl', async () => {
    const r = await ev(() => { const f = federRechnen(), d = suDaten(f); return {soll:f.daempfer.tokens.soll, wert:String(suWert('daempfer', f.daempfer, d, {art:'tokens'}).w)}; });
    return {ok:r.soll === null && !/\d/.test(r.wert), info:r}; }],
  ['21 harter Konflikt sperrt Einstellwerte', async () => {
    const r = await ev(PRO => { eval('(' + PRO + ')()'); const alt = build.daempfer; build.daempfer = 'd-sidluxe|ultimate~230x65'; view = 'setup'; zeichne();
      const out = {gesperrt:/Aufbau klären/.test($('setup').innerText), werte:!!document.querySelector('#setup .fw-k')}; build.daempfer = alt; zeichne(); return out; }, PRO.toString());
    return {ok:r.gesperrt && !r.werte, info:r}; }],
  ['22 Free-Vorschau ohne Zahlen', async () => {
    const r = await ev(() => { pro = {}; view = 'setup'; zeichne(); const v = document.querySelector('.su-vorschau').innerText; return {ziffern:/\d/.test(v), hinweis:!!document.querySelector('.fw-bsp')}; });
    return {ok:!r.ziffern && r.hinweis, info:r}; }],
  ['Onboarding: jede Frage mit Warum und Weiss-ich-nicht', async () => {
    const r = await ev(PRO => { eval('(' + PRO + ')()'); plan.fahrer = 80; view = 'setup'; zeichne(); const s = obSchritte(), fehlt = [];
      s.forEach((n, i) => { if(n === 'start' || n === 'ende') return; obW = {i, einzeln:false, tipp:null}; zeigeSheet(obHtml());
        const m = $('modal'); if(!m.querySelector('.fw-warum') || !m.querySelector('.fw-wn')) fehlt.push(n); });
      schliesse(); return {schritte:s.length, fehlt}; }, PRO.toString());
    return {ok:r.schritte >= 10 && !r.fehlt.length, info:r}; }],
  ['Alle Gabeln und Daempfer: keine erfundenen Werte, kein undefined/NaN', async () => {
    const r = await ev(PRO => { eval('(' + PRO + ')()'); plan.fahrer = 78; view = 'setup'; const out = {n:0, fehler:[], erfunden:[]};
      for(const spr of ['de', 'en']){ sprache = spr;
        for(const slot of ['gabel', 'daempfer']) for(const t of katalog(quelleOf(slotOf(slot)))){
          for(const jahr of [0, 2018]){
            try{
              build[slot] = (t.v ? besteVariante(slot, t, build) : t).id; build.fw = {fertig:true}; if(jahr) build.fw[slot === 'gabel' ? 'gj' : 'dj'] = jahr; setupAlle = {};
              const f = federRechnen(), x = f[slot]; if(!x) continue;
              if(slot === 'gabel' && !x.coil && x.quellen.psi.art !== 'tab') for(const mo of FMODI) if(x.modi[mo].psi != null) out.erfunden.push(t.id + ' ' + jahr + ' ' + mo);
              if(slot === 'daempfer' && !x.coil && !x.fox && x.psi != null) out.erfunden.push(t.id + ' Daempferdruck ohne Herstellerregel');
              for(const mo of FMODI){ fedModus = mo; suElWahl = slot; const d = suDaten(f);
                for(const it of suItems(slot, x, d)) suAuf.add('fwk-' + it.key.replace(/\W/g, '-'));
                const h = setupHtml().replace(/(data-[a-z]+|class|id|style|aria-[a-z]+)="[^"]*"/g, ''); out.n++; suAuf.clear();
                if(/undefined|NaN|\bnull\b|\[object|Infinity/.test(h)) out.fehler.push(spr + ' ' + t.id + ' ' + mo); }
            }catch(e){ out.fehler.push(t.id + ' Ausnahme ' + e.message); }
          }
        } }
      fedModus = 'allround'; sprache = 'de'; return {n:out.n, fehler:out.fehler.slice(0, 10), erfunden:out.erfunden.slice(0, 10)}; }, PRO.toString());
    return {ok:r.n > 500 && !r.fehler.length && !r.erfunden.length, info:r}; }]
];
/* Absichtlicher Fehlschlag, um das Test-Gate zu beweisen (CRANKSCORE_TEST_FEHLER=1) */
if(process.env.CRANKSCORE_TEST_FEHLER === '1') PRUEFUNGEN.push(['Absichtlicher Fehlschlag (CRANKSCORE_TEST_FEHLER=1)', async () => ({ok:false, info:'Gate-Probe'})]);

await neu();
let bestanden = 0, gelaufen = 0;
for(const [name, fn] of PRUEFUNGEN){
  let e;
  try{ e = await fn(); }catch(err){ e = {ok:false, info:'Ausnahme: ' + err.message}; }
  gelaufen++;
  if(e.ok){ bestanden++; console.log('  ok   ' + name); }
  else console.log('  FEHL ' + name + '\n         ' + JSON.stringify(e.info).slice(0, 600));
}
if(jsFehler.length) console.log('JS-Fehler in der Seite:\n  ' + [...new Set(jsFehler)].join('\n  '));
const ok = bestanden === PRUEFUNGEN.length && gelaufen === PRUEFUNGEN.length && !jsFehler.length;
console.log(`\nSETUP: ${bestanden} von ${PRUEFUNGEN.length} Prüfungen bestanden${jsFehler.length ? `, ${jsFehler.length} JS-Fehler` : ''}.`);
await browser.close(); server.close();
process.exit(ok ? 0 : 1);
