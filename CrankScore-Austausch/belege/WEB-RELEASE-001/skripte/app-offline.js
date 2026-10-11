// Offline-Aussage der App pruefen: laden, Service Worker abwarten, offline neu laden
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
(async () => { const b = await chromium.launch(); const c = await b.newContext(); const p = await c.newPage();
  await p.goto('http://127.0.0.1:8780/index.html');
  const sw = await p.evaluate(async () => { if(!('serviceWorker' in navigator)) return 'kein SW'; const r = await navigator.serviceWorker.ready; return r.active ? r.active.scriptURL : 'nicht aktiv'; });
  await p.waitForTimeout(4000);
  await c.setOffline(true);
  let ok = false, fehler = '';
  try { await p.reload({ waitUntil: 'load' }); ok = await p.evaluate(() => typeof zeichne === 'function'); } catch (e) { fehler = e.message.split('\n')[0]; }
  console.log(JSON.stringify({ sw, offlineNeuGeladen: ok, fehler, titel: ok ? await p.title() : '' }));
  await b.close(); })();
