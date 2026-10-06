/* Alle Tests fuer CrankScore in einem Aufruf: npm test
 *
 * 1. Syntax aller eingebetteten Skripte in index.html
 * 2. Kompatibilitaet (tools/kompat-test.mjs): jeder Fall aus kompat-faelle.mjs
 *    und kompat-raeder.mjs muss gelaufen UND bestanden sein
 * 3. Setup und Speicher (tools/setup-test.mjs)
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
  const bestanden = m ? +m[1] : 0, gelaufen = m ? +m[2] : 0, fehl = aus.split('\n').filter(z => /^\s*FEHL|JS-Fehler|Error:/.test(z)).slice(0, 20);
  return {exit:r.status, bestanden, gelaufen, erwartet, fehl, ausgabe:aus.slice(-4000), ok:r.status === 0 && m && bestanden === gelaufen && (erwartet == null || gelaufen === erwartet)};
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
if(process.env.CRANKSCORE_TEST_FEHLER === '1') teil('Gate-Probe', false, {zeile:'absichtlich fehlgeschlagen (CRANKSCORE_TEST_FEHLER=1)'});

bericht.ok = gesamtOk; bericht.dauerSek = Math.round((Date.now() - start) / 1000); bericht.zeit = new Date().toISOString();
fs.writeFileSync(path.join(wurzel, 'test-ergebnis.json'), JSON.stringify(bericht, null, 2));
for(const t of bericht.teile) if(!t.ok && t.fehl && t.fehl.length) console.log(`\n${t.name}:\n  ` + t.fehl.join('\n  '));
console.log(`\n${gesamtOk ? 'ALLE TESTS BESTANDEN' : 'TESTS FEHLGESCHLAGEN'} · Revision ${bericht.revision.slice(0, 7)}${bericht.aenderungen ? ' (mit lokalen Änderungen)' : ''} · ${bericht.dauerSek} s · Bericht: test-ergebnis.json`);
process.exit(gesamtOk ? 0 : 1);
