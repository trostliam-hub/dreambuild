// Zustaende der App erkunden: node app-erkunden.js "<code>" [warten]
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
(async () => { const b = await chromium.launch();
  const ctx = await b.newContext({viewport:{width:390, height:844}, hasTouch:true, deviceScaleFactor:2, reducedMotion:'reduce'});
  await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
  const p = await ctx.newPage(); const f = []; p.on('pageerror', e => f.push(e.message));
  await p.goto('http://127.0.0.1:8780/index.html');
  await p.evaluate(sp => { localStorage.clear(); localStorage.setItem('mtb.design', 'hell'); localStorage.setItem('mtb.sprache', sp); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); localStorage.setItem('mtb.szenen', '1'); }, process.env.SPR || 'de');
  await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp'));
  try { await p.evaluate(process.argv[2]); } catch (e) { console.log('Fehler', e.message.split('\n')[0]); }
  await p.waitForTimeout(+(process.argv[3] || 600));
  const t = await p.evaluate(() => { const m = document.querySelector('#modal.on .sheet, #modal .sheet'); const e = (m && m.offsetParent) ? m : document.querySelector('main') || document.body; return e.innerText; });
  console.log(t.replace(/\n{2,}/g, '\n').slice(0, +(process.argv[4] || 4000)));
  if (process.argv[5]) await p.screenshot({ path: process.argv[5] });
  console.log('FEHLER:', JSON.stringify(f)); await b.close(); })();
