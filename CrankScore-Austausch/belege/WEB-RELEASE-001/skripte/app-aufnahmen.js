/* Echte App-Aufnahmen fuer crankscore.de aus dem veroeffentlichten Stand (main, Version 20261011-1532).
   node app-aufnahmen.js [nur-szene]  ->  app-shots/roh/<szene>-<sprache>-<design>.png */
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs = require('fs'); const AUFBAU = fs.readFileSync(__dirname + '/spindrift-aufbau.js', 'utf8');
const sheetZu = (text) => `const sb=document.querySelector('#modal .sheet-b'); const z=[...sb.querySelectorAll('*')].find(e => e.children.length < 3 && /${text}/.test(e.textContent)); if(z) sb.scrollTop = z.getBoundingClientRect().top - sb.getBoundingClientRect().top + sb.scrollTop - 12;`;
const REAL = "wechsle('real'); build.rahmen='f-stumpy'; build.gabel='g-pike'; build.bremsen='b-xt'; sichern(); zeichne();";
const SZ = {
  uebersicht: [390, AUFBAU + "spindriftAufbau(); view='aufbau'; zeichne(); window.scrollTo(0,0)"],
  desktop: [1440, AUFBAU + "spindriftAufbau(); view='aufbau'; zeichne(); window.scrollTo(0,0)"],
  pruefung: [390, "build.kassette='ka-nx'; sichern(); pruefOffen=true; view='aufbau'; zeichne(); const e=document.querySelector('#pruef'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 96)"],
  finden: [390, "view='aufbau'; zeichne(); oeffneSlot('bremsen')"],
  vergleich: [390, REAL + "oeffneSlot('bremsen', {ziel:'kraft'}); document.querySelector('#fi [data-vergleich]').click()"],
  paket: [390, REAL + "oeffneSlot('bremsen', {ziel:'kraft'}); document.querySelector('#fi [data-vergleich]').click(); setTimeout(() => { " + sheetZu('Was der Wechsel umfasst|What the switch includes') + " }, 300)"],
  wunsch: [390, REAL + "merken('stuetze', 'st-oneup'); merken('gabel', 'g-lyrik'); merken('bremsen', 'b-mt4'); const l = wunschListe(); l.find(w => w.slot === 'gabel').stufe = 'einkauf'; wunschTesten(l.find(w => w.slot === 'bremsen').id); view = 'wunsch'; zeichne(); window.scrollTo(0,0)"],
  einkauf: [390, AUFBAU + "spindriftAufbau(); view='deals'; zeichne(); window.scrollTo(0,0)"],
};
(async () => { const b = await chromium.launch(); const nur = process.argv[2]; const fehler = [];
  for (const [name, [W, code]] of Object.entries(SZ)) { if (nur && nur !== name) continue;
    for (const spr of ['de', 'en']) for (const des of ['hell', 'oled']) {
      const ctx = await b.newContext({ viewport: { width: W, height: W < 800 ? 844 : 900 }, hasTouch: W < 800, isMobile: W < 800, deviceScaleFactor: W < 800 ? 2 : 1.5, reducedMotion: 'reduce' });
      await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
      const p = await ctx.newPage(); p.on('pageerror', e => fehler.push(name + ': ' + e.message));
      await p.goto('http://127.0.0.1:8780/index.html');
      await p.evaluate(([d, s]) => { localStorage.clear(); localStorage.setItem('mtb.design', d); localStorage.setItem('mtb.sprache', s); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); localStorage.setItem('mtb.szenen', '1'); }, [des, spr]);
      await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp'));
      await p.evaluate(() => document.fonts.ready);
      try { await p.evaluate(code); } catch (e) { fehler.push(name + ' ' + spr + ' ' + des + ': ' + e.message.split('\n')[0]); }
      await p.waitForTimeout(name === 'wunsch' ? 5000 : 1000);
      await p.screenshot({ path: `${__dirname}/app-shots/roh/${name}-${spr}-${des === 'oled' ? 'dunkel' : 'hell'}.png` });
      await ctx.close(); }
  }
  await b.close(); console.log('fertig', JSON.stringify(fehler)); })();
