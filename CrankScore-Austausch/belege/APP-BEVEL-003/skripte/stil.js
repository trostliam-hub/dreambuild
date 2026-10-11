const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const [,, port, W, code] = process.argv;
(async () => { const b = await chromium.launch(); const p = await b.newPage({viewport:{width:+W, height:844}});
  await p.goto(`http://127.0.0.1:${port}/index.html`);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('mtb.einstieg2','1'); localStorage.setItem('mtb.tour','1'); localStorage.setItem('mtb.szenen','1'); localStorage.setItem('mtb.sprache','de'); });
  await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp'));
  console.log(JSON.stringify(await p.evaluate(code), null, 1)); await b.close(); })();
