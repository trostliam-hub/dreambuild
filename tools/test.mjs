/* Alle Tests fuer CrankScore in einem Aufruf: npm test
 *
 * 1. Syntax aller eingebetteten Skripte in index.html
 * 2. Kompatibilitaet (tools/kompat-test.mjs): jeder Fall aus kompat-faelle.mjs
 *    und kompat-raeder.mjs muss gelaufen UND bestanden sein
 * 3. Setup und Speicher (tools/setup-test.mjs)
 * 4. Ein Weg je Aufgabe (tools/wege-test.mjs)
 * 5. Sprache (tools/sprach-test.mjs): alle Ansichten auf Deutsch und Englisch,
 *    keine Funde (Sprachmischung, Zahlformate, Reste, abgeschnittene Texte)
 * 6. Szenarien APP-BEVEL-002 (tools/bevel-test.mjs)
 * 7. Preis-Skript offline (tools/preise-test.py)
 *
 * Schreibt test-ergebnis.json (Revision, Zahlen, Fehler) und endet mit
 * Exit-Code 1, sobald etwas fehlschlaegt oder weniger Tests liefen als
 * erwartet. CRANKSCORE_TEST_FEHLER=1 erzwingt einen Fehlschlag (Gate-Probe).
 */
import { spawnSync, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const start = Date.now();
const git = c => { try{ return execSync('git ' + c, {cwd:wurzel, stdio:['ignore', 'pipe', 'ignore']}).toString().trim(); }catch(e){ return ''; } };
const bericht = {revision:git('rev-parse HEAD') || 'unbekannt', aenderungen:!!git('status --porcelain -- index.html tools'), node:process.version, teile:[]};
try{ bericht.playwright = JSON.parse(fs.readFileSync(path.join(wurzel, 'node_modules/playwright/package.json'), 'utf8')).version; }catch(e){ bericht.playwright = 'global/unbekannt'; }
let gesamtOk = true;
const teil = (name, ok, details) => { bericht.teile.push({name, ok, ...details}); if(!ok) gesamtOk = false; console.log(`${ok ? 'OK  ' : 'FEHL'} ${name}${details.zeile ? ' — ' + details.zeile : ''}`); };

/* 1. Syntax */
{
  const h = fs.readFileSync(path.join(wurzel, 'index.html'), 'utf8'), re = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;
  let m, n = 0; const fehler = [];
  while((m = re.exec(h))){ n++; try{ new Function(m[1]); }catch(e){ fehler.push(`Skript ${n}: ${e.message}`); } }
  teil('Syntax index.html', n >= 2 && !fehler.length, {zeile:`${n} Skripte${fehler.length ? ', ' + fehler.join('; ') : ''}`, erwartet:2, gelaufen:n});
}
/* Laeuft ein Teiltest, wird seine Schlusszeile gelesen: "x von n" */
const lauf = (datei, muster, erwartet) => {
  const r = spawnSync(process.execPath, [path.join(wurzel, 'tools', datei)], {cwd:wurzel, encoding:'utf8', env:process.env, maxBuffer:64e6});
  const aus = (r.stdout || '') + (r.stderr || ''), m = aus.match(muster);
  /* Zu jeder FEHL-Zeile auch die eingerueckte Befundzeile darunter -- so steht
     im Log, welche Teilpruefung scheiterte, ohne den Bericht herunterzuladen */
  const zl = aus.split('\n'), fehl = zl.flatMap((z, i) => /^\s*FEHL|JS-Fehler|Error:/.test(z) ? [z].concat(/^\s*FEHL/.test(z) && /^\s{6,}\S/.test(zl[i + 1] || '') ? [zl[i + 1].slice(0, 600)] : []) : []).slice(0, 30);
  const bestanden = m ? +m[1] : 0, gelaufen = m ? +m[2] : 0;
  return {exit:r.status, bestanden, gelaufen, erwartet, fehl, ausgabe:aus.slice(r.status === 0 ? -4000 : -64000), ok:r.status === 0 && m && bestanden === gelaufen && (erwartet == null || gelaufen === erwartet)};
};
/* 2. Kompatibilitaet: erwartete Zahl aus den Falllisten selbst */
{
  const { FAELLE } = await import(pathToFileURL(path.join(wurzel, 'tools/kompat-faelle.mjs')));
  const { RAEDER } = await import(pathToFileURL(path.join(wurzel, 'tools/kompat-raeder.mjs')));
  const erwartet = FAELLE.length + RAEDER.length, r = lauf('kompat-test.mjs', /(\d+) von (\d+) Fällen bestanden/, erwartet);
  teil('Kompatibilität', r.ok, {zeile:`${r.bestanden} von ${r.gelaufen} bestanden, erwartet ${erwartet}, Exit ${r.exit}`, ...r});
}
/* 3. Setup und Speicher */
{
  const r = lauf('setup-test.mjs', /SETUP: (\d+) von (\d+) Prüfungen bestanden/, null);
  teil('Setup und Speicher', r.ok, {zeile:`${r.bestanden} von ${r.gelaufen} bestanden, Exit ${r.exit}`, ...r});
}
/* 4. Ein Weg je Aufgabe */
{
  const r = lauf('fahrwerk-fragen-test.mjs', /FAHRWERK-FRAGEN: (\d+) von (\d+) Prüfungen bestanden/, 18);
  teil('Persönliche Fahrwerkfragen und Einrichtung', r.ok, {zeile:`${r.bestanden} von ${r.gelaufen} bestanden, Exit ${r.exit}`, ...r});
}
{
  const r = lauf('wege-test.mjs', /WEGE: (\d+) von (\d+) Prüfungen bestanden/, null);
  teil('Ein Weg je Aufgabe', r.ok, {zeile:`${r.bestanden} von ${r.gelaufen} bestanden, Exit ${r.exit}`, ...r});
}
/* 5. Sprache: Schlusszeile "SPRACHE: x Funde in n Texten", bestanden nur ohne Funde */
{
  const r = spawnSync(process.execPath, [path.join(wurzel, 'tools', 'sprach-test.mjs')], {cwd:wurzel, encoding:'utf8', env:process.env, maxBuffer:64e6});
  const aus = (r.stdout || '') + (r.stderr || ''), m = aus.match(/SPRACHE: (\d+) Funde in (\d+) Texten/);
  const funde = m ? +m[1] : null, texte = m ? +m[2] : 0;
  /* weniger als 5000 Texte hiesse: Ansichten wurden gar nicht erreicht */
  const ok = r.status === 0 && funde === 0 && texte >= 5000;
  teil('Sprache Deutsch/Englisch', ok, {zeile:m ? `${funde} Funde in ${texte} Texten, Exit ${r.status}` : `keine Schlusszeile, Exit ${r.status}`,
    exit:r.status, funde, texte, fehl:ok ? [] : aus.split('\n').filter(z => z.trim()).slice(-25), ausgabe:aus.slice(-4000)});
}
/* 6. Szenarien aus APP-BEVEL-002: Finder, Empfehlungen, Adapter, Angebote, Wunschliste */
{
  const r = lauf('bevel-test.mjs', /BEVEL: (\d+) von (\d+) Prüfungen bestanden/, null);
  teil('Teile finden, Adapter, Wunschliste (BEVEL-002)', r.ok, {zeile:`${r.bestanden} von ${r.gelaufen} bestanden, Exit ${r.exit}`, ...r});
}
/* 7. Preis-Skript offline: Feed als Datei, kein Netz */
{
  const r = spawnSync('python3', [path.join(wurzel, 'tools', 'preise-test.py')], {cwd:wurzel, encoding:'utf8', env:{...process.env, PREIS_LINKS_PRUEFEN:'0'}});
  const aus = (r.stdout || '') + (r.stderr || ''), m = aus.match(/PREISE: (\d+) Fehler/), ok = r.status === 0 && m && m[1] === '0';
  teil('Preis-Skript offline', !!ok, {zeile:m ? `${m[1]} Fehler, Exit ${r.status}` : `keine Schlusszeile, Exit ${r.status}`, exit:r.status, fehl:ok ? [] : aus.split('\n').filter(z => /FEHL|Error/.test(z)).slice(0, 20), ausgabe:aus.slice(-3000)});
}
if(process.env.CRANKSCORE_TEST_FEHLER === '1') teil('Gate-Probe', false, {zeile:'absichtlich fehlgeschlagen (CRANKSCORE_TEST_FEHLER=1)'});

/* 8. Produktbilder: echte Auswahlwege, OLED/Hellmodus, Zoom und Datenerhalt. */
{
  const r = lauf('foto-test.mjs', /FOTOS: (\d+) von (\d+) Prüfungen bestanden/, 14);
  teil('Produktfotos und Großansicht', r.ok, {zeile:`${r.bestanden} von ${r.gelaufen} bestanden, Exit ${r.exit}`, ...r});
}

/* 9. KI-Guide: freiwillige Nutzung, sicherer Kontext und echte App-Verweise. */
{
  const r = spawnSync(process.execPath, [path.join(wurzel, 'tools', 'guide-ui-test.mjs')], {cwd:wurzel, encoding:'utf8', env:process.env, maxBuffer:64e6});
  const aus = (r.stdout || '') + (r.stderr || ''), m = aus.match(/GUIDE-UI: (\d+) Prüfungen bestanden/);
  const ok = r.status === 0 && m && +m[1] === 28;
  teil('KI-Guide Deutsch/Englisch', !!ok, {zeile:m ? `${m[1]} Prüfungen bestanden, Exit ${r.status}` : `keine Schlusszeile, Exit ${r.status}`, exit:r.status, fehl:ok ? [] : aus.split('\n').filter(Boolean).slice(-20), ausgabe:aus.slice(-4000)});
}

/* Feste Schadenshilfe: echte Sprach-/Routingfälle ohne Modellaufruf. */
{
  const r = spawnSync(process.execPath, ['--test',path.join(wurzel,'tools','guide-safety-test.mjs')], {cwd:wurzel, encoding:'utf8',env:process.env});
  const aus=(r.stdout || '')+(r.stderr || ''), ok=r.status===0 && /(?:pass|passed)\s+24\b|24\s+pass/.test(aus);
  teil('Guide-Soforthilfe ohne KI',ok,{zeile:'24 Fälle, Exit '+r.status,ausgabe:aus,exit:r.status});
}

{
  const r = lauf('einfuehrung-test.mjs', /EINFUEHRUNG: (\d+) von (\d+) Prüfungen bestanden/, 10);
  teil('Einführung und interaktive Vorschau', r.ok, {zeile:`${r.bestanden} von ${r.gelaufen} bestanden, Exit ${r.exit}`, ...r});
}
{
  const r = lauf('fahrwerk-fotos-test.mjs', /FAHRWERK-FOTOS: (\d+) von (\d+) Prüfungen bestanden/, 9);
  teil('Fahrwerkfotos und Einsteller', r.ok, {zeile:`${r.bestanden} von ${r.gelaufen} bestanden, Exit ${r.exit}`, ...r});
}
{
  const r = lauf('fahrwerk-orientierung-test.mjs', /FAHRWERK-ORIENTIERUNG: (\d+) von (\d+) Prüfungen bestanden/, 7);
  teil('Fahrwerk: Orientierung und Datenerhalt', r.ok, {zeile:`${r.bestanden} von ${r.gelaufen} bestanden, Exit ${r.exit}`, ...r});
}
/* Qualitaetsrunde: echte Bedienwege, Datenrettung und Offline-Updates. */
{
  const r = lauf('bedienung-test.mjs', /BEDIENUNG: (\d+) von (\d+) Prüfungen bestanden/, 10);
  teil('Dialogfokus, Bildausfall und schmaler Einkauf', r.ok, {zeile:`${r.bestanden} von ${r.gelaufen} bestanden, Exit ${r.exit}`, ...r});
}
{
  const r = lauf('zuverlaessigkeit-test.mjs', /ZUVERLAESSIGKEIT: (\d+) von (\d+) Prüfungen bestanden/, 10);
  teil('Datenrettung, Guide-Limit und Offline-Update', r.ok, {zeile:`${r.bestanden} von ${r.gelaufen} bestanden, Exit ${r.exit}`, ...r});
}
{
  const r = lauf('qualitaet-ux-test.mjs', /QUALITAET-UX: (\d+) von (\d+) Prüfungen bestanden/, 8);
  teil('Verständliche Preise, Prüfung und Hilfe', r.ok, {zeile:`${r.bestanden} von ${r.gelaufen} bestanden, Exit ${r.exit}`, ...r});
}
/* APP-CLAUDE-AUDIT-001: Werte beim Teilewechsel und Testfahrt im richtigen Profil */
{
  const r = lauf('fahrwerk-erhalt-test.mjs', /FAHRWERK-ERHALT: (\d+) von (\d+) bestanden/, 10);
  teil('Fahrwerk: Werte beim Teilewechsel, Testfahrt je Profil', r.ok, {zeile:`${r.bestanden} von ${r.gelaufen} bestanden, Exit ${r.exit}`, ...r});
}
{
  const r = lauf('audit-test.mjs', /AUDIT: (\d+) von (\d+) bestanden/, 18);
  teil('Datenprüfung, Radkopie, Tastaturfokus, Fahrwerk- und Hilfetexte', r.ok, {zeile:`${r.bestanden} von ${r.gelaufen} bestanden, Exit ${r.exit}`, ...r});
}
bericht.ok = gesamtOk; bericht.dauerSek = Math.round((Date.now() - start) / 1000); bericht.zeit = new Date().toISOString();
fs.writeFileSync(path.join(wurzel, 'test-ergebnis.json'), JSON.stringify(bericht, null, 2));
for(const t of bericht.teile) if(!t.ok && t.fehl && t.fehl.length) console.log(`\n${t.name}:\n  ` + t.fehl.join('\n  '));
console.log(`\n${gesamtOk ? 'ALLE TESTS BESTANDEN' : 'TESTS FEHLGESCHLAGEN'} · Revision ${bericht.revision.slice(0, 7)}${bericht.aenderungen ? ' (mit lokalen Änderungen)' : ''} · ${bericht.dauerSek} s · Bericht: test-ergebnis.json`);
process.exit(gesamtOk ? 0 : 1);
