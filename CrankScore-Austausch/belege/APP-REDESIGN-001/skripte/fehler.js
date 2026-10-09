/* Fehler- und Ladezustaende: Pro-Code (leer, falsch, ohne Netz), Update-Suche ohne Netz */
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const [,, port, out] = process.argv; require('fs').mkdirSync(out, {recursive:true});
(async () => { const b = await chromium.launch();
  for(const spr of ['de', 'en']){
  const p = await b.newPage({viewport:{width:390, height:844}, deviceScaleFactor:2});
  await p.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
  const err = []; p.on('pageerror', e => err.push(e.message));
  await p.goto(`http://127.0.0.1:${port}/index.html`);
  await p.evaluate(s => { localStorage.clear(); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); localStorage.setItem('mtb.design', 'hell'); localStorage.setItem('mtb.sprache', s); }, spr);
  await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp'));
  for(const [n, code] of [['leer', ''], ['falsch', 'abc'], ['netz', 'ABCDEFGH-1234-5678-9ABC-DEF012345678']]){
    await p.evaluate(() => { proMeldung = ''; oeffnePro('menu'); }); await p.waitForTimeout(300);
    const da = await p.$('#pro-in'); if(!da){ console.log(spr, n, 'kein Eingabefeld (Pro nicht im Verkauf)'); continue; }
    await p.fill('#pro-in', code); await p.click('#pro-in ~ button[type="submit"], form button[type="submit"]'); await p.waitForTimeout(n === 'netz' ? 2500 : 400);
    const m = await p.evaluate(() => { const h = document.querySelector('#modal .pro-hin'); return h ? h.innerText : '(keine Meldung)'; });
    console.log(spr, n, '->', m.replace(/\s+/g, ' ').slice(0, 160));
    if(n === 'netz') await p.screenshot({path:`${out}/${spr}-pro-ohne-netz.png`});
  }
  await p.evaluate(() => schliesse());
  console.log(spr, 'Konsole:', err.join(' | ') || 'keine'); await p.close(); }
  await b.close(); })();
