const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const [,, port] = process.argv;
(async () => { const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1280, height:860}});
  await p.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
  await p.goto(`http://127.0.0.1:${port}/index.html`);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); });
  await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp'));
  for(const weg of ['escape', 'x']){
    await p.evaluate(() => document.querySelector('#aufbau [data-slot="gabel"]').focus());
    await p.keyboard.press('Enter'); await p.waitForTimeout(500);
    if(weg === 'escape') await p.keyboard.press('Escape'); else { await p.evaluate(() => document.querySelector('#modal [data-zu]').focus()); await p.keyboard.press('Enter'); }
    await p.waitForTimeout(600);
    console.log(weg, await p.evaluate(() => { const e = document.activeElement; return e ? e.tagName + ' ' + (e.getAttribute('data-slot') || e.className || e.id) + ' | gabel im DOM: ' + document.querySelector('#aufbau [data-slot="gabel"]').isConnected : 'nichts'; }));
  }
  await b.close(); })();
