const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto('http://127.0.0.1:8766/werkzeuge/vorschau.html'); await p.waitForFunction(() => document.getElementById('logo').children.length > 0);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
  await p.screenshot({ path: process.argv[2] }); await b.close(); })();
