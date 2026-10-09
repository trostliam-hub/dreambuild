/* Kopfbreite: node kopf.js <port> -- passt "XC + Downhill" neben Logo und Knoepfe? */
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const [,, port] = process.argv;
(async () => { const b = await chromium.launch();
  for(const W of [320, 361, 375, 399, 400, 412, 430, 820, 1280]) for(const spr of ['de', 'en']){
    const ctx = await b.newContext({viewport:{width:W, height:700}, reducedMotion:'reduce'});
    await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
    const p = await ctx.newPage();
    await p.goto(`http://127.0.0.1:${port}/index.html`);
    await p.evaluate(s => { localStorage.clear(); localStorage.setItem('mtb.sprache', s); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); }, spr);
    await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp'));
    const r = await p.evaluate(() => { sel = ['xc', 'dh']; zeichne();
      const e = document.getElementById('disz-n'); return {t:e.textContent, ab:e.scrollWidth - e.clientWidth, logo:getComputedStyle(document.querySelector('.brand-logo')).display}; }).catch(e => ({err:e.message}));
    console.log(W, spr, JSON.stringify(r));
    await ctx.close(); }
  await b.close(); })();
