/* Sprachpruefung fuer CrankScore: Deutsch und Englisch in allen Ansichten.
 *
 * Laedt index.html in Chromium, ruft je Sprache alle Ansichten, Blaetter,
 * Schritte und Modi auf, dazu jede Guide-Antwort, jeden Befund aus den
 * Kompatibilitaetsfaellen und die Texte des Katalogs (Steckplaetze,
 * Ausfuehrungen), und sammelt alle sichtbaren Texte sowie aria-label, title,
 * placeholder und alt. Geprueft wird:
 *   - Englisch: keine deutschen Woerter (Umlaute/ß, deutsche Funktionswoerter)
 *   - Deutsch: keine englischen Saetze (englische Funktionswoerter),
 *     Anrede mit "du" (kein Sie/Ihr/Ihnen), keine Ersatzschreibung ae/oe/ue
 *   - Zahlen und Preise im Format der Sprache (1,5 kg / 1.5 kg; 1.500 € / €1,500)
 *   - keine Reste wie undefined, NaN, [object, kein Leerzeichen vor Satzzeichen
 *   - abgeschnittene Texte auf 390 px Breite (Handy; SPRACHE_BREITE=320 fuer das kleinste)
 * Marken- und Modellnamen aus dem Katalog werden vorher herausgenommen.
 *
 * Aufruf:   node tools/sprach-test.mjs [--bericht datei.json]   (npm run test:sprache)
 * Ergebnis: letzte Zeile "SPRACHE: x Funde in n Texten", Exit-Code 1 bei Funden.
 */
import { createRequire } from 'module';
import { execSync } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const require = createRequire(import.meta.url);
let pw;
try{ pw = require('playwright'); }
catch(e){ pw = require(execSync('npm root -g').toString().trim() + '/playwright'); }

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BREITE = +(process.env.SPRACHE_BREITE || 390);
const BERICHT = (() => { const i = process.argv.indexOf('--bericht'); return i > 0 ? process.argv[i + 1] : null; })();
const TYP = {'.html':'text/html; charset=utf-8', '.js':'text/javascript', '.json':'application/json', '.png':'image/png', '.woff2':'font/woff2', '.webmanifest':'application/manifest+json'};
const server = http.createServer((q, a) => {
  const p = path.join(wurzel, decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
  if(!p.startsWith(wurzel) || !fs.existsSync(p) || fs.statSync(p).isDirectory()){ a.writeHead(404); a.end(); return; }
  a.writeHead(200, {'Content-Type':TYP[path.extname(p)] || 'application/octet-stream'}); fs.createReadStream(p).pipe(a);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const URL0 = `http://127.0.0.1:${server.address().port}/index.html`;
const { FAELLE } = await import(pathToFileURL(path.join(wurzel, 'tools/kompat-faelle.mjs')));

const PRO = "pro = {key:'x', inst:'i', status:'aktiv', geprueft:Date.now()};";
const FED = "plan.fahrer = 80; sichern(); fprofil.montur = {teile:['halbschale']}; FFRAGEN.forEach(f => { fprofil[f.k] = fprofil[f.k] || f.o[1][0]; }); build.fw = Object.assign(build.fw || {}, {fertig:true}); sichern();";
/* Ansichten: [Name, Code, Modi] -- Code laeuft nach schliesse() im Seitenkontext */
const SZENEN = [
  ['aufbau', "view='aufbau'; zeichne(); vorschlaegeZeichnen()", 'alle'],
  ['pruefung', "view='befunde'; zeichne(); vorschlaegeZeichnen()", 'alle'],
  ['upgrades', "view='upgrades'; zeichne(); vorschlaegeZeichnen()", 'alle'],
  ['kaufen', "view='deals'; zeichne()", 'alle'],
  ['setup-frei', "pro = {}; view='setup'; zeichne()", 'traum'],
  ['setup-ohne-gewicht', PRO + "plan.fahrer = 0; view='setup'; zeichne()", 'traum'],
  ['setup', PRO + FED + "view='setup'; zeichne()", 'alle'],
  ['setup-karten', PRO + FED + "for(const [s, x] of suElemente(federRechnen())) for(const it of suItems(s, x, suDaten(federRechnen()))) suAuf.add('fwk-' + it.key.replace(/\\W/g, '-')); suAuf.add('alle'); suAuf.add('prof-erkl'); suAuf.add('w-quellen'); view='setup'; zeichne()", 'traum'],
  ['setup-karten-daempfer', PRO + FED + "suElWahl='daempfer'; for(const [s, x] of suElemente(federRechnen())) for(const it of suItems(s, x, suDaten(federRechnen()))) suAuf.add('fwk-' + it.key.replace(/\\W/g, '-')); view='setup'; zeichne()", 'traum'],
  ...['downhill', 'spruenge'].map(m => ['setup-profil-' + m, PRO + FED + `fedModus='${m}'; suAuf.add('prof-erkl'); view='setup'; zeichne()`, 'traum']),
  ...['start', 'gewicht', 'rad', 'gabel', 'daempfer', 'einsteller', 'fahrer', 'stil', 'gefuehl', 'profil', 'aktuell', 'probleme', 'ende'].map(n => ['setup-angaben-' + n, PRO + "plan.fahrer = 80; view='setup'; zeichne(); obOeffnen('" + n + "')", 'traum']),
  ...[0, 1, 2, 3, 4, 5].map(i => ['sag-' + i, PRO + FED + "view='setup'; zeichne(); oeffneSagWizard('gabel'); sagW.i=" + i + "; zeigeSheet(sagWizardHtml())", 'traum']),
  ['sag-aus-test', PRO + FED + "view='setup'; zeichne(); oeffneSagWizard(null, true); sagW.i=5; zeigeSheet(sagWizardHtml())", 'traum'],
  ['test-start', PRO + FED + "view='setup'; zeichne(); oeffneTest()", 'traum'],
  ...['hart', 'durch', 'sackt', 'kickt', 'grip', 'unruhig', 'wippt', 'ungenutzt'].map(sym => ['test-' + sym, PRO + FED + `view='setup'; zeichne(); oeffneTest(); trW={st:'vorschlag', el:'gabel', sym:'${sym}', antw:{sag:'ja', packing:'nein', grip:'hart'}, ki:0}; fwNeu()`, 'traum']),
  ['test-frage', PRO + FED + "view='setup'; zeichne(); oeffneTest(); trW={st:'frage', el:'gabel', sym:'hart', frage:'packing', antw:{}}; fwNeu()", 'traum'],
  ['test-laeuft', PRO + FED + "view='setup'; zeichne(); oeffneTest(); trW={st:'vorschlag', el:'gabel', sym:'hart', antw:{sag:'ja', packing:'nein'}, ki:0}; fwNeu(); const k=document.querySelector('[data-trgo]'); if(k) k.click()", 'traum'],
  ['test-ok', PRO + FED + "view='setup'; zeichne(); oeffneTest(); trW={st:'ok', gut:false}; fwNeu()", 'traum'],
  ['vergleich', PRO + FED + "view='setup'; zeichne(); oeffneVergleich()", 'traum'],
  ['vergleich-einzeln', PRO + FED + "view='setup'; zeichne(); suVglArt='einzel'; oeffneVergleich()", 'traum'],
  ['trailkarte', PRO + FED + "view='setup'; zeichne(); oeffneTrailKarte()", 'traum'],
  ['menue', "oeffneMenu()", 'traum'],
  ['menue-betreiber', "linkVerwaltung = true; oeffneMenu()", 'traum'],
  ['pro-feder', "pro = {}; oeffnePro('feder')", 'traum'],
  ['pro-raeder', "pro = {}; oeffnePro('raeder')", 'traum'],
  ['pro-menu', "pro = {}; oeffnePro('menu')", 'traum'],
  ['pro-aktiv', PRO + "oeffnePro('menu')", 'traum'],
  ['groesse', "koerper.groesse = 182; koerper.schritt = 86; kSichern(); oeffneFit()", 'traum'],
  ['guide', PRO + "oeffneGuide()", 'traum'],
  ['bauziel-0', "oeffneWiz(0)", 'alle'],
  ...[1, 2, 3].map(i => ['bauziel-' + i, "oeffneWiz(" + i + ")", 'traum']),
  ['bauziel-ergebnis', "plan.budget = 3500; sichern(); wizErgebnis = null; oeffneWiz(4)", 'traum', 2500],
  ['bauziel-knapp', "plan.budget = 900; sichern(); wizErgebnis = null; oeffneWiz(4)", 'traum', 2500],
  ['bauziel-kombi', "sel = ['xc', 'dh']; kombiModus = true; oeffneWiz(0)", 'traum'],
  ['score', "oeffneScoreHilfe()", 'alle'],
  ['spick', "oeffneSpick()", 'traum'],
  ['begriffe', "oeffneBegriffe()", 'traum'],
  ['raeder', "oeffneProfile()", 'alle'],
  ['impressum', "oeffneRecht('impressum')", 'traum'],
  ['datenschutz', "oeffneRecht('datenschutz')", 'traum'],
  ['betreiber-pin', "oeffneBetreiberPin()", 'traum'],
  ['startseite', "oeffneStartseite()", 'traum'],
  ...['hallo', 'ziel', 'erfahrung', 'charakter', 'koerper', 'masse', 'fit', 'fertig'].map(s => ['einstieg-' + s, `oeffneEinstieg('voll'); ei.ziel='traum'; ei.schritt = eiSchritte().indexOf('${s}'); eiZeigen()`, 'traum']),
  ['einstieg-fertig-real', "oeffneEinstieg('voll'); ei.ziel='real'; ei.schritt = eiSchritte().indexOf('fertig'); eiZeigen()", 'traum'],
  ...['koerper', 'masse', 'fit'].map(s => ['fahrerprofil-leer-' + s, `koerper.groesse = 0; koerper.schulter = 0; koerper.schritt = 0; koerper.spann = 0; plan.fahrer = 0; oeffneEinstieg('fahrer'); ei.schritt = eiSchritte().indexOf('${s}'); eiZeigen()`, 'traum']),
  ...['koerper', 'masse', 'fit'].map(s => ['fahrerprofil-' + s, `koerper.groesse = 182; plan.fahrer = 80; oeffneEinstieg('fahrer'); ei.schritt = eiSchritte().indexOf('${s}'); eiZeigen()`, 'traum']),
  ...['rahmen', 'gabel', 'daempfer', 'laufraeder', 'reifenVR', 'reifenHR', 'bremsen', 'kurbel', 'kettenblatt', 'kassette', 'schaltwerk', 'schalthebel', 'kette', 'lenker', 'vorbau', 'stuetze', 'sattel', 'pedale', 'griffe', 'steuersatz', 'innenlager', 'rahmenlager'].map(s => ['teile-' + s, `oeffneSlot('${s}')`, 'alle']),
  ...['rahmen', 'gabel', 'bremsen', 'laufraeder'].map(s => ['detail-' + s, `oeffneDetail('${s}', build['${s}'] || katalog(quelleOf(slotOf('${s}')))[0].id)`, 'traum']),
  ['detail-kaufen', "oeffneDetail('gabel', build.gabel, true)", 'traum'],
  ['eigenes-teil', "oeffneEigen('gabel')", 'traum'],
  ['adapter-guide-bremse', "oeffneAdapterGuide('bremse')", 'traum'],
  ['adapter-guide-achse', "oeffneAdapterGuide('achse')", 'traum'],
  ['adapter-guide-lager', "oeffneAdapterGuide('lager')", 'traum'],
  ['adapter-guide-steuersatz', "oeffneAdapterGuide('steuersatz')", 'traum'],
  ['update', "zeigeUpdate()", 'traum'],
  ['sicherung', "zeigeSheet(sicherungVorschauHtml(sicherungPruefen(JSON.stringify(sicherungErstellen(false)))))", 'traum'],
  ['rundgang', "view='aufbau'; zeichne(); tourStart()", 'traum'],
  ['leer', "setzeBau(leerBau(), true); view='aufbau'; zeichne(); vorschlaegeZeichnen()", 'alle'],
  ['leer-pruefung', "setzeBau(leerBau(), true); view='befunde'; zeichne()", 'alle'],
  ['markt-preis', "markt.preis = 1800; markt.zustand = markt.zustand || 'gut'; sichern(); view='aufbau'; zeichne()", 'markt']
];

const browser = await pw.chromium.launch();
const funde = [], alleTexte = new Map(), jsFehler = [];

for(const spr of ['de', 'en']){
  const ctx = await browser.newContext({viewport:{width:BREITE, height:844}});
  await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
  const seite = await ctx.newPage();
  seite.on('pageerror', e => jsFehler.push(spr + ': ' + e.message));
  await seite.goto(URL0);
  await seite.evaluate(s => { localStorage.clear(); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); localStorage.setItem('mtb.sprache', s); }, spr);
  await seite.reload();
  await seite.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp'));
  const ausnahmen = await seite.evaluate(() => {
    const n = new Set();
    for(const s of SLOTS){ for(const t of katalog(quelleOf(s))){ if(t.n) n.add(String(t.n)); if(t.m) n.add(String(t.m)); if(t.nb) n.add(String(t.nb)); } }
    (typeof SHOPS !== 'undefined' ? SHOPS : []).forEach(s => s.name && n.add(s.name));
    return [...n].filter(x => x.length > 2).sort((a, b) => b.length - a.length);
  });
  const sammeln = async (szene) => seite.evaluate(() => {
    const aus = [], sicht = e => { const s = getComputedStyle(e); return e.getClientRects().length && s.visibility !== 'hidden' && s.display !== 'none'; };
    const wurzeln = [document.body];
    /* Texte in Elementen mit eigenem lang-Attribut (etwa englische Videotitel
       im deutschen Text) sind gewollt fremdsprachig: art 'fremd' */
    const seitenSprache = document.documentElement.lang;
    const geh = (el, fremd) => {
      if(/^(SCRIPT|STYLE|TEMPLATE|svg|NOSCRIPT)$/i.test(el.tagName)) return;
      const l = el.getAttribute && el.getAttribute('lang');
      if(l) fremd = l.slice(0, 2) !== seitenSprache;
      for(const a of ['aria-label', 'title', 'placeholder', 'alt', 'aria-valuetext']){ const v = el.getAttribute && el.getAttribute(a); if(v && v.trim()) aus.push({t:v.trim(), art:a}); }
      for(const k of el.childNodes){
        if(k.nodeType === 3){ const t = k.textContent.replace(/\s+/g, ' ').trim(); if(t && /[A-Za-zÄÖÜäöüß]/.test(t)) aus.push({t:t, art:fremd ? 'fremd' : 'text'}); }
        else if(k.nodeType === 1) geh(k, fremd);
      }
    };
    wurzeln.forEach(w => geh(w, false));
    /* abgeschnitten: sichtbares Element mit Text, dessen Inhalt breiter ist als es selbst */
    const ab = [];
    document.querySelectorAll('body *').forEach(e => {
      /* das Laufband der Startseite ist absichtlich breiter als sein Rahmen */
      if(!sicht(e) || !e.textContent.trim() || e.children.length > 3 || e.closest('.ls-lauf')) return;
      const s = getComputedStyle(e);
      if((s.overflowX === 'hidden' || s.overflow === 'hidden' || s.textOverflow === 'ellipsis') && e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0)
        ab.push(((typeof e.className === 'string' && e.className.split(' ')[0]) || e.tagName) + ': ' + e.textContent.trim().replace(/\s+/g, ' ').slice(0, 80));
    });
    return {texte:aus, abgeschnitten:ab};
  });
  const merke = (szene, texte) => { for(const x of texte){ const k = spr + '|' + x.t; if(!alleTexte.has(k)) alleTexte.set(k, {spr, szene, art:x.art, t:x.t}); } };

  for(const modus of ['traum', 'real', 'markt']){
    for(const [name, code, modi, warte] of SZENEN){
      if(modi !== 'alle' && modi !== modus) continue;
      await seite.evaluate(m => { try{ schliesse(); schliesseStartseite(); }catch(e){} try{ if(typeof tourEnde === 'function') tourEnde(); }catch(e){}
        if(modus !== m){ wechsle(m); } view = 'aufbau'; zeichne(); }, modus).catch(e => jsFehler.push(spr + ' wechsel: ' + e.message));
      const ok = await seite.evaluate(c => { try{ (0, eval)(c); return true; }catch(e){ return 'Ausnahme: ' + e.message; } }, code);
      if(ok !== true){ jsFehler.push(`${spr}/${modus}/${name}: ${ok}`); continue; }
      await seite.waitForTimeout(warte || 120);
      const r = await sammeln(name);
      merke(`${modus}/${name}`, r.texte);
      for(const a of r.abgeschnitten) funde.push({spr, szene:`${modus}/${name}`, art:`abgeschnitten (${BREITE} px)`, t:a});
      await seite.evaluate(() => { try{ schliesse(); }catch(e){} try{ if(typeof tourEnde === 'function') tourEnde(); }catch(e){} const p = document.getElementById('ad-pop'); if(p) p.innerHTML = ''; });
      /* frischer Stand fuer die naechste Ansicht */
      await seite.evaluate(m => { try{ if(modus !== m) wechsle(m); }catch(e){} }, modus);
    }
    await seite.evaluate(() => { localStorage.removeItem('mtb.builds'); localStorage.removeItem('mtb.profile'); });
    await seite.reload(); await seite.waitForFunction(() => typeof zeichne === 'function');
  }
  /* Rundgang: alle Stationen */
  const tourTexte = await seite.evaluate(() => { try{ return tourStationen().flatMap(s => [s.h, s.t]).map(t => ({t:String(t).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').replace(/ ([,.;:!?])(?= |$)/g, '$1').trim(), art:'rundgang'})); }catch(e){ return []; } });
  merke('rundgang', tourTexte);
  /* Guide: jede Antwort, Knoepfe und Vorschlaege */
  const guideTexte = await seite.evaluate(PRO => { (0, eval)(PRO); const out = [];
    for(const e of GUIDE){ try{ const titel = gTitel(e.id); out.push({t:titel, art:'guide-titel'});
      const a = gAntwort(titel, e.id) || {}; if(a.html) out.push({t:a.html, art:'guide-antwort:' + e.id});
      for(const ak of (a.ak || [])){ const x = gAktInfo(ak); if(x) out.push({t:x[0], art:'guide-knopf'}); }
      for(const c of (a.chips || [])) if(c.t) out.push({t:c.t, art:'guide-vorschlag'}); }catch(err){ out.push({t:'AUSNAHME ' + e.id + ': ' + err.message, art:'fehler'}); } }
    for(const q of ['Welche Gabel passt?', 'Was ist Boost?', 'Wie viel Luft in die Gabel?', 'Was fehlt zur 100?', 'Shimano XT quietscht', 'Lohnt sich ein Upgrade?', 'Ist das Angebot fair?', 'Was kostet das Rad?', 'zu schwer', 'Welche Rahmengröße brauche ich?', 'Fox 36', 'Schwalbe', 'What fork fits?', 'my brakes squeal', 'xyzzy']){
      try{ const a = gAntwort(q) || {}; if(a.html) out.push({t:a.html, art:'guide-frei:' + q}); for(const ak of (a.ak || [])){ const x = gAktInfo(ak); if(x) out.push({t:x[0], art:'guide-knopf'}); } }catch(err){ out.push({t:'AUSNAHME frei ' + q + ': ' + err.message, art:'fehler'}); } }
    try{ out.push({t:gHalloText(), art:'guide-hallo'}); }catch(e){}
    return out.map(x => ({t:String(x.t).replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').replace(/ ([,.;:!?])(?= |$)/g, '$1').trim(), art:x.art})); }, PRO);
  merke('guide', guideTexte);
  /* Befunde aus allen Kompatibilitaetsfaellen */
  const befundTexte = await seite.evaluate(faelle => { const out = [];
    const teilId = (slot, x) => { if(!x) return null; const [basisId, wahl] = Array.isArray(x) ? x : [x, null];
      const basis = K[quelleOf(slotOf(slot))].find(t => t.id === basisId); if(!basis) return null; if(!basis.v) return basis.id;
      return basis.id + '|' + basis.v.map(d => { const w = wahl && wahl[d.k] != null ? d.o.find(o => String(o.w) === String(wahl[d.k])) : d.o[d.d]; return slug((w || d.o[d.d]).w); }).join('~'); };
    const altSel = sel, altJahr = jahrWahl[modus], altF = plan.fahrer;
    for(const f of faelle){ try{ const b = f.startrad ? {...START} : leerBau(); for(const sl in f.teile || {}) b[sl] = teilId(sl, f.teile[sl]);
      sel = f.sel || ['trail']; jahrWahl[modus] = f.jahr || AKTUELL; plan.fahrer = f.fahrer || 0;
      const flach = h => String(h).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').replace(/ ([,.;:!?])(?= |$)/g, '$1').trim();
      for(const x of pruefe(b)){ out.push({t:x.titel, art:'befund-titel'}); out.push({t:flach(x.text), art:'befund-text'});
        if(x.ad){ try{ out.push({t:flach(adZeile(x.ad)), art:'adapter-zeile'}); }catch(e){} }
        try{ out.push({t:stufeTxt(x), art:'befund-stufe'}); }catch(e){} }
      try{ const r = bewerte(b); out.push({t:flach(urteil(r)), art:'urteil'}); }catch(e){} }catch(e){ out.push({t:'AUSNAHME befund: ' + e.message, art:'fehler'}); } }
    sel = altSel; jahrWahl[modus] = altJahr; plan.fahrer = altF;
    return out; }, FAELLE.map(f => ({teile:f.teile, sel:f.sel, jahr:f.jahr, fahrer:f.fahrer, startrad:f.startrad})));
  merke('befunde', befundTexte);
  /* Katalog: Steckplaetze, Gruppen, Ausfuehrungen, Optionen */
  const katalogTexte = await seite.evaluate(() => { const out = [];
    for(const s of SLOTS){ out.push({t:s.label, art:'slot'}); if(s.was) out.push({t:s.was, art:'slot-was'});
      for(const t of katalog(quelleOf(s))){ for(const d of (t.v || [])){ out.push({t:dimName(d.k), art:'ausfuehrung'}); for(const o of d.o){ if(o.n) out.push({t:String(o.n), art:'option'}); if(o.h) out.push({t:String(o.h), art:'option-hinweis'}); } }
        try{ for(const c of specsVon(s.k, t)) out.push({t:String(c), art:'spec'}); }catch(e){} } }
    for(const g of GRUPPEN){ out.push({t:g.name, art:'gruppe'}); out.push({t:g.t, art:'gruppe-text'}); }
    return out; }).catch(e => [{t:'AUSNAHME katalog ' + e.message, art:'fehler'}]);
  merke('katalog', katalogTexte);
  await ctx.close();

  /* Pruefen */
  const FEST = ['Performance Elite', 'Select+', 'Select', 'Ultimate', 'Performance', 'Factory', 'Lock-on', 'Push-on', 'Race Day', 'Rhythm', 'Grip2', 'Merchant of Record', 'Händlerbund', 'Eichhornstraße', 'IS'];
  const ohneNamen = t => { let x = ' ' + t + ' '; for(const n of ausnahmen.concat(FEST)) if(x.includes(n)) x = x.split(n).join(' '); return x; };
  const DE_WORT = /(^|[^\p{L}\p{N}-])(und|oder|nicht|mit|für|fuer|ist|sind|der|die|das|den|dem|des|ein|eine|einen|einem|einer|auf|zum|zur|vom|beim|noch|auch|nur|wenn|dann|weil|aber|bei|nach|über|wird|werden|kann|können|dein|deine|deinen|deinem|deiner|dich|dir|wir|uns|hier|jetzt|alle|alles|mehr|weniger|schon|sehr|gibt|ohne|gegen|bis|Teile|Rad|Räder|Gabel|Dämpfer|Bremse|Bremsen|Laufrad|Laufräder|Reifen|Rahmen|Kurbel|Lenker|Vorbau|Sattel|Stütze|Kette|Kassette|Schaltwerk|Pedale|Griffe|Prüfung|Einstellungen|Weiter|Zurück|Fertig|Schließen|Abbrechen|Speichern|Löschen|Ändern|Wählen|Preis|Gewicht|Passform|Einsatz|Größe|Klicks|Druckstufe|Zugstufe|Federweg)(?=$|[^\p{L}\p{N}-])/u;
  const UMLAUT = /[äöüÄÖÜß]/;
  const EN_WORT = /(^|[^\p{L}\p{N}-])(the|and|with|your|you|you're|is|are|of|to|for|this|that|it|on|at|by|from|can|not|yes|here|now|only|if|then|but|when|what|which|how|why|choose|back|next|done|save|delete|cancel|close|open|add|remove|show|hide|edit|enter|select|loading|please|again|bike|bikes|fork|shock|wheel|wheels|tyre|tyres|tire|frame|price|weight|settings|check)(?=$|[^\p{L}\p{N}-])/iu;
  const SIE = /(^|[^\p{L}])(Ihr|Ihre|Ihren|Ihrem|Ihrer|Ihres|Ihnen)(?=$|[^\p{L}])|\p{Ll}[,]?\s(Sie)(?=$|[^\p{L}])|(^|[^\p{L}])(Sie)\s(können|müssen|sollten|haben|finden|sehen|wählen|bitte|möchten|erhalten)(?=$|[^\p{L}])/u;
  const ERSATZ = /(^|[^\p{L}])(fuer|ueber|zurueck|pruef|groess|waehl|aender|naech|moegl|koenn|muess|oeffn|hoeh|laeng|spaet|frueh|daempf|gruen|rueck|wuensch|fuehr|kuerz|schaetz|zaehl|haeng|stueck|maess|schluess|gehoer|aufloes|loes|loesch|faehr|rueckw|ausfuehr|ungefaehr|naehe|staerk|haerte|waere|hae|aeh)\p{L}*/iu;
  const RESTE = /\b(undefined|NaN|Infinity)\b|\[object|\$\{/;
  for(const [, x] of alleTexte){
    if(x.spr !== spr) continue;
    const t = ohneNamen(x.t);
    const probe = (art, re) => { const m = t.match(re); if(m) funde.push({spr, szene:x.szene, art, wort:(m[2] || m[3] || m[5] || m[0]).trim(), t:x.t.slice(0, 220), quelle:x.art}); };
    probe('Reste im Text', RESTE);
    /* auf dem Rohtext: ohneNamen reisst Luecken, wo ein Name vor dem Satzzeichen steht */
    if(/[\p{L}\d)]\s+[,.;:!?](?=\s|$)/u.test(x.t)) funde.push({spr, szene:x.szene, art:'Leerzeichen vor Satzzeichen', wort:x.t.match(/\S*\s+[,.;:!?](?=\s|$)/u)[0], t:x.t.slice(0, 220), quelle:x.art});
    if(x.art === 'fremd') continue;
    if(spr === 'en'){
      if(UMLAUT.test(t)) funde.push({spr, szene:x.szene, art:'Umlaut im Englischen', wort:(t.match(/\S*[äöüÄÖÜß]\S*/) || [''])[0], t:x.t.slice(0, 220), quelle:x.art});
      else probe('deutsches Wort im Englischen', DE_WORT);
      probe('Zahlformat (Komma) im Englischen', /\d,\d{1,2}\s?(kg|mm|cm|bar|psi|Nm|Wh|%|°|″|m\b)/);
      probe('Euro vorne fehlt im Englischen', /\d\s€(?!\d)/);
      probe('Prozent mit Leerzeichen im Englischen', /\d\s%/);
    } else {
      probe('englisches Wort im Deutschen', EN_WORT);
      probe('Sie-Anrede', SIE);
      probe('ae/oe/ue statt Umlaut', ERSATZ);
      probe('Zahlformat (Punkt) im Deutschen', /\d\.\d{1,2}\s?(kg|mm|cm|m|bar|psi|Nm|Wh|%|°|″)(?![\p{L}])/u);
      probe('Euro vorne im Deutschen', /€\d/);
      probe('Prozent ohne Leerzeichen im Deutschen', /\d%/);
    }
  }
}
await browser.close(); server.close();

/* Bericht: je Art und Wort zusammengefasst */
const gruppen = new Map();
for(const f of funde){ const k = f.spr + ' · ' + f.art + (f.wort ? ' · ' + f.wort : ''); if(!gruppen.has(k)) gruppen.set(k, []); gruppen.get(k).push(f); }
const zeilen = [...gruppen].sort((a, b) => b[1].length - a[1].length);
for(const [k, l] of zeilen){
  console.log(`\n${k} (${l.length})`);
  for(const f of l.slice(0, 4)) console.log(`   [${f.szene}${f.quelle ? ' · ' + f.quelle : ''}] ${f.t}`);
}
if(jsFehler.length) console.log('\nJS-Fehler:\n  ' + [...new Set(jsFehler)].slice(0, 30).join('\n  '));
if(BERICHT) fs.writeFileSync(BERICHT, JSON.stringify({funde, texte:[...alleTexte.values()]}, null, 1));
console.log(`\nSPRACHE: ${funde.length} Funde in ${alleTexte.size} Texten${jsFehler.length ? `, ${jsFehler.length} JS-Fehler` : ''}.`);
process.exit(funde.length || jsFehler.length ? 1 : 0);
