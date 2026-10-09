/* Funktion der neuen Score-Elemente: node funktion.js <port> */
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const [,, port] = process.argv; let fehl = 0;
const ok = (n, b, x) => { console.log(`${b ? 'OK  ' : 'FEHL'} ${n}${x ? ' — ' + x : ''}`); if(!b) fehl++; };
(async () => { const b = await chromium.launch();
  for(const W of [390, 1280]){
  const ctx = await b.newContext({viewport:{width:W, height:860}, hasTouch:W < 800});
  const p = await ctx.newPage(); const fehler = []; p.on('pageerror', e => fehler.push(e.message));
  await p.goto(`http://127.0.0.1:${port}/index.html`);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); localStorage.setItem('mtb.leit', 'aus'); });
  await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp'));
  await p.waitForTimeout(1500);
  const z = await p.evaluate(() => ({zahl:document.getElementById('score').textContent, gesamt:bewerte(build).gesamt, ring:getComputedStyle(document.getElementById('ring')).strokeDashoffset, soll:(263.9 * (1 - bewerte(build).gesamt / 100)).toFixed(1), status:document.getElementById('score-status').textContent.trim()}));
  ok(`${W}: Zahl im Ring = Gesamtscore, Ring passend gefuellt`, z.zahl === String(z.gesamt) && Math.abs(parseFloat(z.ring) - parseFloat(z.soll)) < 1, JSON.stringify(z));
  ok(`${W}: Statushinweis "alles passt"`, /Maße passen|dimensions fit/.test(z.status), z.status);
  // Konflikt + Budget + fehlendes Teil
  await p.evaluate(() => { const r = katalog(quelleOf(slotOf('rahmen'))).find(t => t.daempfer); build.rahmen = r.id;
    katalog(quelleOf(slotOf('daempfer'))).find(t => { build.daempfer = t.id; return pruefe(build).some(x => x.level === 'fehler' && (x.slots || []).indexOf('daempfer') >= 0); }); plan.budget = 3000; build.pedale = null; sichern(); zeichne(); });
  await p.waitForTimeout(400);
  const pills = await p.evaluate(() => [...document.querySelectorAll('#score-status .st')].map(e => ({k:e.className, t:e.textContent.trim(), tag:e.tagName, view:e.dataset.view || '', slot:e.dataset.slot || ''})));
  ok(`${W}: vier Statushinweise`, pills.length === 4, JSON.stringify(pills.map(x => x.t)));
  ok(`${W}: jeder Hinweis hat ein Zeichen und Text`, pills.every(x => x.t.length > 3));
  for(const [i, soll] of [[0, () => view === 'befunde'], [2, () => view === 'upgrades']]){
    await p.evaluate(() => { view = 'aufbau'; zeichne(); });
    await p.click(`#score-status .st:nth-child(${i + 1})`); await p.waitForTimeout(300);
    ok(`${W}: Klick auf "${pills[i].t}"`, await p.evaluate(`(${soll.toString()})()`), await p.evaluate(() => view));
  }
  await p.evaluate(() => { view = 'aufbau'; zeichne(); });
  await p.click('#score-status .st-offen'); await p.waitForTimeout(400);
  ok(`${W}: Klick auf fehlendes Teil oeffnet die Auswahl`, await p.evaluate(() => !!document.querySelector('#modal .sheet') && /Pedal|pedal/i.test(document.querySelector('#modal .sheet').textContent)));
  await p.evaluate(() => schliesse()); await p.waitForTimeout(300);
  // Teilekarte
  const pkt = await p.evaluate(() => [...document.querySelectorAll('.tk-pkt')].filter(e => !e.hidden).map(e => ({g:e.dataset.zugruppe, k:e.className, l:e.getAttribute('aria-label')})));
  ok(`${W}: Teilekarte hat Punkte mit Status im Namen`, pkt.length >= 8 && pkt.every(x => x.l && x.l.length > 5), JSON.stringify(pkt.slice(0, 3)));
  ok(`${W}: Konfliktpunkt an der Federung`, pkt.some(x => /stoerung/.test(x.k)));
  const ziel = pkt.find(x => /stoerung/.test(x.k)).g;
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.click(`.tk-pkt[data-zugruppe="${ziel}"]`); await p.waitForTimeout(900);
  const lage = await p.evaluate(g => { const e = [...document.querySelectorAll('#aufbau .grp-kopf')].find(b => b.dataset.thema === g); return e ? Math.round(e.getBoundingClientRect().top) : null; }, ziel);
  ok(`${W}: Klick auf Teilekarten-Punkt bringt die Gruppe nach oben`, lage !== null && lage >= 0 && lage < 400, `Gruppe ${ziel}, top ${lage}`);
  // Score-Hilfe
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(200);
  await p.evaluate(() => document.querySelector('.rg-gesamt').click()); await p.waitForTimeout(400);
  ok(`${W}: Tipp auf den Gesamtring oeffnet die Erklaerung`, await p.evaluate(() => !!document.querySelector('#modal .sheet')));
  ok(`${W}: keine Skriptfehler`, fehler.length === 0, fehler.join(' | '));
  await ctx.close(); }
  await b.close(); console.log(fehl ? `FUNKTION: ${fehl} Fehler` : 'FUNKTION: alles OK'); process.exit(fehl ? 1 : 0); })();
