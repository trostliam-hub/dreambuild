/* Kompatibilitaets-Tests fuer CrankScore.
 *
 * Laedt index.html in einem echten Browser (Playwright, Chromium) und prueft
 * jede Regel gegen feste Testfaelle: welche Befunde rot (Fehler), gelb
 * (Warnung) oder nur Hinweis sein muessen -- und welche NICHT auftauchen
 * duerfen. So faellt jede Aenderung an Katalog oder Regelwerk auf, die ein
 * bekanntes Ergebnis kippt.
 *
 * Aufruf:   node tools/kompat-test.mjs
 * Braucht:  Playwright mit Chromium (npm i playwright && npx playwright install chromium)
 *
 * Ampel wie in der App: rot = level "fehler", gelb = "warnung",
 * Hinweise ("hinweis") bleiben gruen.
 */
import { createRequire } from 'module';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { FAELLE } from './kompat-faelle.mjs';
import { RAEDER } from './kompat-raeder.mjs';

const require = createRequire(import.meta.url);
let pw;
try{ pw = require('playwright'); }
catch(e){ pw = require(execSync('npm root -g').toString().trim() + '/playwright'); }

const wurzel = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const browser = await pw.chromium.launch();
const seite = await browser.newPage();
const jsFehler = [];
seite.on('pageerror', e => jsFehler.push(e.message));
await seite.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
await seite.goto('file://' + path.join(wurzel, 'index.html'));
await seite.evaluate(() => { try{ localStorage.setItem('mtb.sprache', 'de'); }catch(e){} });
await seite.reload();
await seite.waitForFunction(() => typeof pruefe === 'function' && typeof K === 'object');

const ergebnisse = await seite.evaluate(faelle => {
  sprache = 'de';
  /* Teil-Id mit gewaehlter Ausfuehrung: {Nabenbreite:"150x12"} -> "w-hope|...~150x12~..." */
  const teilId = (slot, x) => {
    if(!x) return null;
    const [basisId, wahl] = Array.isArray(x) ? x : [x, null];
    const q = quelleOf(slotOf(slot)), basis = K[q].find(t => t.id === basisId);
    if(!basis) throw new Error(`Teil ${basisId} gibt es nicht (${slot})`);
    if(!basis.v) return basis.id;
    return basis.id + '|' + basis.v.map(d => {
      const w = wahl && wahl[d.k] != null ? d.o.find(o => String(o.w) === String(wahl[d.k])) : d.o[d.d];
      if(!w) throw new Error(`${basisId}: Ausführung ${d.k}=${wahl[d.k]} gibt es nicht`);
      return slug(w.w);
    }).join('~');
  };
  const out = [];
  for(const f of faelle){
    try{
      /* patch: Werte eines Katalogteils fuer diesen Fall ueberschreiben (Normen,
         die kein Rahmen im Katalog hat, etwa T47) -- danach zurueck */
      const alt = [];
      for(const sl in f.patch || {}){
        const [id, werte] = f.patch[sl], t = K[quelleOf(slotOf(sl))].find(x => x.id === id);
        alt.push([t, Object.fromEntries(Object.keys(werte).map(k => [k, t[k]]))]);
        Object.assign(t, werte);
      }
      if(alt.length) VARIANTEN.clear();          /* Ausfuehrungen neu aus dem geaenderten Teil bilden */
      /* startrad: das Rad, mit dem die App startet -- es muss immer gruen sein */
      const b = f.startrad ? {...START} : leerBau();
      for(const s in f.teile || {}) b[s] = teilId(s, f.teile[s]);
      sel = f.sel || ['trail']; jahrWahl[modus] = f.jahr || AKTUELL; plan.fahrer = f.fahrer || 0;
      const bef = pruefe(b);
      const rot = bef.filter(x => x.level === 'fehler').map(x => x.titel);
      const gelb = bef.filter(x => x.level === 'warnung').map(x => x.titel);
      const hin = bef.filter(x => x.level === 'hinweis').map(x => x.titel);
      const probleme = [];
      for(const t of f.rot || []) if(!rot.includes(t)) probleme.push(`fehlt ROT „${t}“`);
      for(const t of f.gelb || []) if(!gelb.includes(t)) probleme.push(`fehlt GELB „${t}“`);
      for(const t of f.hinweis || []) if(!hin.includes(t)) probleme.push(`fehlt HINWEIS „${t}“`);
      for(const t of f.nicht || []) if(rot.includes(t) || gelb.includes(t) || hin.includes(t)) probleme.push(`darf nicht kommen: „${t}“`);
      if(f.ampel){
        const ampel = rot.length ? 'rot' : gelb.filter(t => !(f.ignoriere || []).includes(t)).length ? 'gelb' : 'gruen';
        if(ampel !== f.ampel) probleme.push(`Ampel ${ampel} statt ${f.ampel} (rot: ${rot.join(' | ') || '–'} · gelb: ${gelb.join(' | ') || '–'})`);
      }
      /* Komplettrad: vollstaendig, nichts Rotes, und gelb nur, was erwartet ist */
      if(f.rad){
        if(gelb.includes('Aufbau unvollständig')) probleme.push('Aufbau unvollständig: ' + (bef.find(x => x.titel === 'Aufbau unvollständig').text.replace(/<[^>]+>/g, '')));
        for(const t of gelb) if(!(f.gelb || []).includes(t)) probleme.push(`unerwartet GELB „${t}“`);
        for(const t of rot) probleme.push(`ROT „${t}“`);
      }
      for(const [t, w] of alt) Object.assign(t, w);
      if(alt.length) VARIANTEN.clear();
      out.push({name:f.name, ok:!probleme.length, probleme, rot, gelb});
    }catch(e){ out.push({name:f.name, ok:false, probleme:['Ausnahme: ' + e.message], rot:[], gelb:[]}); }
  }
  return out;
}, FAELLE.concat(RAEDER.map(r => ({...r, rad:true}))));

let fehl = 0;
for(const e of ergebnisse){
  if(e.ok) console.log('  ok   ' + e.name);
  else { fehl++; console.log('  FEHL ' + e.name + '\n         ' + e.probleme.join('\n         ')); }
}
if(jsFehler.length){ fehl++; console.log('JS-Fehler in der Seite:\n  ' + jsFehler.join('\n  ')); }
console.log(`\n${ergebnisse.length - fehl} von ${ergebnisse.length} Fällen bestanden (davon ${RAEDER.length} komplette Testräder).`);
await browser.close();
process.exit(fehl ? 1 : 0);
