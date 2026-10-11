/* Teilewechsel durchklicken: node finder.js <port> <breite> <ordner> <praefix> [de|en] [hell|dunkel]
   Rad: Stumpjumper, Pike, XT M8120 (wie im Audit). Bildschirmfotos je Schritt. */
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs = require('fs');
const [,, port, W, ordner, pre, spr = 'de', design = 'dunkel'] = process.argv;
fs.mkdirSync(ordner, {recursive:true});
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:+W, height:+W < 600 ? 844 : 900}, deviceScaleFactor:2});
  const fehler = [];
  p.on('pageerror', e => fehler.push(e.message));
  p.on('console', m => { if(m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) fehler.push(m.text()); });
  await p.goto(`http://127.0.0.1:${port}/index.html`);
  await p.evaluate(([s, d]) => { localStorage.clear(); localStorage.setItem('mtb.einstieg2','1'); localStorage.setItem('mtb.tour','1'); localStorage.setItem('mtb.szenen','1'); localStorage.setItem('mtb.sprache', s); localStorage.setItem('mtb.design', d === 'hell' ? 'hell' : 'oled'); }, [spr, design]);
  await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp'));
  await p.evaluate(() => { wechsle('real'); build.rahmen = 'f-stumpy'; build.gabel = 'g-pike'; build.bremsen = 'b-xt'; sichern(); view = 'aufbau'; zeichne(); });
  const foto = async n => { await p.waitForTimeout(450); const s = await p.$('#modal .sheet'); if(s) await s.screenshot({path:`${ordner}/${pre}-${n}.png`}); else await p.screenshot({path:`${ordner}/${pre}-${n}.png`}); };
  const info = async () => p.evaluate(() => ({schritt:(document.querySelector('#fi') || {dataset:{}}).dataset.schritt, ziel:finder.ziel, kacheln:document.querySelectorAll('#fi .fk3').length,
    text:(document.querySelector('#fi .fi-schritt') || {textContent:''}).textContent.replace(/\s+/g, ' ').slice(0, 300)}));
  const log = [];
  await p.click('#aufbau .verb [data-slot="bremsen"]'); await foto('1-ziel'); log.push(['ziel', await info()]);
  await p.click('#fi [data-fiziel="kraft"]'); await foto('2-marke'); log.push(['marke', await info()]);
  await p.click('#fi .fi-weiter .btn'); await foto('3-budget'); log.push(['budget', await info()]);
  await p.click('#fi .fi-weiter .btn'); await foto('4-erg-kraft'); log.push(['erg kraft', await info()]);
  await p.click('#fi .fi-sum [data-fischritt="ziel"]'); await p.click('#fi [data-fiziel="wartung"]'); await foto('5-erg-wartung'); log.push(['erg wartung', await info()]);
  await p.click('#fi .fi-sum [data-fischritt="ziel"]'); await p.click('#fi [data-fiziel="leicht"]'); await foto('6-erg-leicht'); log.push(['erg leicht', await info()]);
  await p.click('#fi .fi-sum [data-fischritt="ziel"]'); await p.click('#fi [data-fiziel="sparen"]'); await foto('7-erg-sparen'); log.push(['erg sparen', await info()]);
  /* Vergleich und Rueckweg: Scrollstand und Auswahl bleiben */
  await p.evaluate(() => { const b = document.querySelector('#modal .sheet-b'); b.scrollTop = 380; });
  const y0 = await p.evaluate(() => document.querySelector('#modal .sheet-b').scrollTop);
  await p.evaluate(() => document.querySelectorAll('#fi .fk3 [data-vergleich]')[1].click());
  await foto('7b-vergleich'); log.push(['vergleich', await p.evaluate(() => ({zurueck:!!document.querySelector('[data-fizurueck]'), titel:document.querySelector('#modal .sheet-h h3').textContent,
    text:document.querySelector('#modal .sheet-b').textContent.replace(/\s+/g, ' ').slice(0, 900)}))]);
  await p.click('[data-fizurueck]'); await p.waitForTimeout(300);
  log.push(['zurueck', await p.evaluate(y0 => ({y0, y:document.querySelector('#modal .sheet-b').scrollTop, schritt:document.querySelector('#fi').dataset.schritt, ziel:finder.ziel, kacheln:document.querySelectorAll('#fi .fk3').length}), y0)]);
  /* Marke + Budget mit null Treffern: Auswahl bleibt da */
  await p.click('#fi .fi-sum [data-fischritt="marke"]'); await p.click('#fi [data-fimarke="Trickstuff"]'); await p.click('#fi .fi-weiter .btn');
  await foto('8-null'); log.push(['null treffer', await info()]);
  const knoepfe = await p.evaluate(() => ({sum:document.querySelectorAll('#fi .fi-sum button').length, egal:!!document.querySelector('#fi .fi-erg [data-fimarke=""]')}));
  log.push(['null knoepfe', knoepfe]);
  console.log(JSON.stringify({log, fehler}, null, 1));
  await b.close();
})();
