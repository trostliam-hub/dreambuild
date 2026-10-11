/* Erststart wie ein neuer Nutzer: node erststart.js <port> <ordner> [hell|oled] -- klickt immer "Überspringen"/"Weiter" und protokolliert jeden Schritt */
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const [,, port, out, des] = process.argv;
(async () => { const b = await chromium.launch();
  const ctx = await b.newContext({viewport:{width:390, height:844}, hasTouch:true, deviceScaleFactor:2, locale:'de-DE', colorScheme: des === 'hell' ? 'light' : 'dark'});
  await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:${port}/index.html`); await p.waitForTimeout(1500);
  for(let i = 0; i < 9; i++){
    await p.screenshot({path:`${out}/erst-${i}.png`});
    const info = await p.evaluate(() => {
      const sicht = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
      const h = [...document.querySelectorAll('h1,h2,h3')].filter(sicht).map(e => e.textContent.trim().slice(0, 60)).slice(0, 4);
      const k = [...document.querySelectorAll('button,a.btn')].filter(sicht).map(e => e.textContent.trim().replace(/\s+/g, ' ').slice(0, 30)).filter(Boolean).slice(0, 12);
      return {h, k};
    });
    console.log(i, JSON.stringify(info));
    const sel = ['xpath=//button[normalize-space()="Kostenlos starten"]', 'xpath=//button[contains(normalize-space(),"Überspringen")]', 'xpath=//a[contains(normalize-space(),"Überspringen")]', 'xpath=//button[contains(normalize-space(),"Später")]'];
    let weiter = null; for(const q of sel){ const e = await p.$(q); if(e && await e.isVisible()){ weiter = e; console.log('  klicke', q.split('"')[1]); break; } }
    if(!weiter){ console.log('kein Überspringen mehr'); break; }
    await weiter.click(); await p.waitForTimeout(900);
  }
  await b.close(); })();
