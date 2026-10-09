/* Ladezeit: node laden.js <port> -- Handy 390, CPU 4x gedrosselt, Netz "schnelles 3G"-aehnlich; Median aus 5 Laeufen */
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const [,, port] = process.argv;
(async () => { const b = await chromium.launch(); const r = [];
  for(let i = 0; i < 5; i++){
    const ctx = await b.newContext({viewport:{width:390, height:844}, isMobile:true, hasTouch:true, serviceWorkers:'block'}); const p = await ctx.newPage();
    const c = await ctx.newCDPSession(p); await c.send('Emulation.setCPUThrottlingRate', {rate:4});
    await c.send('Network.enable'); await c.send('Network.emulateNetworkConditions', {offline:false, latency:150, downloadThroughput:1.6e6/8*4, uploadThroughput:750e3/8});
    await p.route('**/*', q => q.request().url().startsWith('http://127.0.0.1') ? q.continue() : q.abort());
    await p.addInitScript(() => { try{ localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); }catch(e){} });
    const t0 = Date.now(); await p.goto(`http://127.0.0.1:${port}/index.html`, {waitUntil:'load'});
    await p.waitForFunction(() => !!document.querySelector('#aufbau .grp'));
    const m = await p.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; const fcp = performance.getEntriesByName('first-contentful-paint')[0];
      return {dcl:Math.round(n.domContentLoadedEventEnd), load:Math.round(n.loadEventEnd), fcp:fcp ? Math.round(fcp.startTime) : null, bytes:n.transferSize}; });
    m.bereit = Date.now() - t0; r.push(m); await ctx.close(); }
  const med = k => r.map(x => x[k]).sort((a, b) => a - b)[2];
  console.log(JSON.stringify({fcp:med('fcp'), dcl:med('dcl'), load:med('load'), bereit:med('bereit'), html_bytes:r[0].bytes}));
  await b.close(); })();
