const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const [,, port, out, design = 'dunkel', spr = 'de'] = process.argv;
(async () => { const b = await chromium.launch(); const p = await b.newPage({viewport:{width:390, height:844}, hasTouch:true});
  const f = []; p.on('pageerror', e => f.push(e.message));
  await p.goto(`http://127.0.0.1:${port}/index.html`);
  await p.evaluate(([d, s]) => { localStorage.clear(); localStorage.setItem('mtb.sprache', s); localStorage.setItem('mtb.design', d); }, [design, spr]);
  await p.reload();
  await p.waitForSelector('[data-lsstart]'); await p.click('[data-lsstart]');
  await p.waitForSelector('#szenen .sz');
  for(let i = 0; i < 3; i++){ await p.waitForTimeout(950); await p.screenshot({path:`${out}-${i + 1}.png`}); if(i < 2) await p.click('[data-szweiter]'); }
  await p.click('[data-szweiter]'); await p.waitForTimeout(700);
  console.log(await p.evaluate(() => ({gesehen:localStorage.getItem('mtb.szenen'), szenen:!!document.querySelector('#szenen'), einstieg:!!document.querySelector('#modal .ei')})));
  console.log('Fehler', f); await b.close(); })();
