/* Exportiert den Teilekatalog der App als JSON (docs/katalog.json).
 *
 * Der Katalog lebt in index.html (Objekt K). Dieses Skript laedt die Seite in
 * Chromium, liest K aus und schreibt jedes Teil mit seinen Normfeldern und
 * Ausfuehrungen (v) heraus -- dieselben Daten, mit denen die Pruefung
 * rechnet. Aufbau und Felder: docs/datenbank.md.
 *
 * Aufruf:  node tools/katalog-export.mjs [ziel.json]
 */
import { createRequire } from 'module';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
let pw;
try{ pw = require('playwright'); }
catch(e){ pw = require(execSync('npm root -g').toString().trim() + '/playwright'); }

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ziel = process.argv[2] || path.join(wurzel, 'docs', 'katalog.json');
const browser = await pw.chromium.launch();
const seite = await browser.newPage();
await seite.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
await seite.goto('file://' + path.join(wurzel, 'index.html'));
await seite.evaluate(() => { try{ localStorage.setItem('mtb.sprache', 'de'); }catch(e){} });
await seite.reload();
await seite.waitForFunction(() => typeof K === 'object' && typeof DID === 'object');

const daten = await seite.evaluate(() => {
  sprache = 'de';
  /* Eignung als Objekt {xc:..}, Ausfuehrungen ohne interne Felder */
  const teil = t => {
    const o = {};
    for(const k of Object.keys(t)){
      if(k === 'v'){
        o.ausfuehrungen = t.v.map(d => ({dimension:d.k, vorgabe:d.o[d.d].w,
          optionen:d.o.map(x => ({wert:x.w, name:x.n, ...(x.s ? {setzt:x.s} : {}), ...(x.p ? {preisDelta:x.p} : {}), ...(x.g ? {gewichtDelta:x.g} : {})}))}));
      } else if(k === 'e') o.eignung = t.e;
      else if(k[0] !== '_' && typeof t[k] !== 'function') o[k] = t[k];
    }
    return o;
  };
  const teile = {};
  for(const slot in K) teile[slot] = K[slot].map(teil);
  return {
    app: 'CrankScore', version: typeof APP_VERSION === 'string' ? APP_VERSION : '', erzeugt: new Date().toISOString().slice(0, 10),
    disziplinen: DID,
    normen: {
      hinterachse: ['135x10', '135x12', '142x12', '148x12', '150x12', '157x12', '116x10'],
      vorderachse: ['100x20', '110x15', '110x20'],
      freilauf: ['HG', 'Micro Spline', 'XD', 'Trial (Ritzel fest)'],
      tretlager: BB_NAME,
      kurbelwelle: ['Hollowtech II', 'DUB', '30 mm', 'ISIS', 'PowerSpline', 'E-MTB'],
      steuerrohr: SS_MASSE.map(([w, rohr, unten, std]) => ({std, rohr, unten})),
      bremsaufnahme: ['PM (Post Mount, nativ 160/180/200/203)', 'FM (Flat Mount)', 'IS (International Standard)'],
      motorwelle: ['ISIS', 'Shimano EP'],
      daempfereinbau: EINBAU
    },
    teile
  };
});
fs.mkdirSync(path.dirname(ziel), {recursive:true});
fs.writeFileSync(ziel, JSON.stringify(daten, null, 1) + '\n');
const n = Object.values(daten.teile).reduce((a, l) => a + l.length, 0);
console.log(`${n} Teile in ${Object.keys(daten.teile).length} Slots -> ${path.relative(wurzel, ziel)}`);
await browser.close();
