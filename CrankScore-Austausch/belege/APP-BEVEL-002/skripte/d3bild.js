/* 3D-Betrachter am Desktop fotografieren: node d3bild.js <port> <ziel-praefix> -- hell und dunkel, nur die Zeichenflaeche */
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
(async () => {
  const b = await chromium.launch({args:['--use-gl=swiftshader', '--enable-unsafe-swiftshader']});
  for(const des of ['hell', 'oled']){
    const p = await b.newPage({viewport:{width:1280, height:900}, deviceScaleFactor:2});
    await p.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
    await p.goto(`http://127.0.0.1:${process.argv[2]}/index.html`);
    await p.evaluate(d => { localStorage.clear(); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); localStorage.setItem('mtb.szenen', '1'); localStorage.setItem('mtb.sprache', 'de'); localStorage.setItem('mtb.design', d); }, des);
    await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp'));
    await p.evaluate(() => { build.rahmen = 'f-spindrift'; zeichne(); oeffne3D(); });
    await p.waitForFunction(() => document.querySelector('#d3.da, #d3.aus'), null, {timeout:60000});
    await p.waitForTimeout(800);
    const c = await p.$('#d3'); await c.screenshot({path:`${process.argv[3]}-${des}.png`});
    await p.close();
  }
  await b.close();
})();
