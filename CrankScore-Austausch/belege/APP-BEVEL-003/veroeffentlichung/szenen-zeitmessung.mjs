/* Nachstellen: Einfuehrungs-Test unter CPU-Drosselung, mehrfach. Aufruf: node szenen.mjs <wurzel> <drossel> <laeufe> */
import { createRequire } from 'module';
import { execSync } from 'child_process';
import http from 'http'; import fs from 'fs'; import path from 'path';
const require = createRequire(import.meta.url);
const pw = require(execSync('npm root -g').toString().trim() + '/playwright');
const [,, wurzel, drossel = '1', laeufe = '3'] = process.argv;
const TYP = {'.html':'text/html; charset=utf-8', '.js':'text/javascript', '.json':'application/json', '.png':'image/png', '.webp':'image/webp', '.woff2':'font/woff2'};
const server = http.createServer((q, a) => { const p = path.join(wurzel, decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
  if(!p.startsWith(wurzel) || !fs.existsSync(p) || fs.statSync(p).isDirectory()){ a.writeHead(404); a.end(); return; }
  a.writeHead(200, {'Content-Type':TYP[path.extname(p)] || 'application/octet-stream'}); fs.createReadStream(p).pipe(a); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const URL0 = `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await pw.chromium.launch();
const ctx = await browser.newContext({viewport:{width:390, height:844}});
await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
const seite = await ctx.newPage();
const cdp = await ctx.newCDPSession(seite); await cdp.send('Emulation.setCPUThrottlingRate', {rate:+drossel});
const bereit = () => seite.waitForFunction(() => typeof zeichne === 'function' && typeof finderRechnen === 'function' && !!document.querySelector('#aufbau .grp'));
const ev = (f, a) => seite.evaluate(f, a);
for(let n = 0; n < +laeufe; n++){
  try{
    await seite.goto(URL0); await ev(() => { localStorage.clear(); localStorage.setItem('mtb.sprache', 'de'); }); await seite.reload();
    await seite.waitForSelector('[data-lsstart]'); await seite.click('[data-lsstart]');
    await seite.waitForSelector('#szenen .sz');
    const r1 = await ev(() => ({punkte:document.querySelectorAll('#szenen .sz-punkte i').length, weg:!!document.querySelector('[data-szweg]'), ei:!!document.querySelector('#modal .ei'), fokus:document.activeElement && document.activeElement.dataset.szweiter, aktiv:document.activeElement && document.activeElement.outerHTML.slice(0, 80)}));
    await seite.keyboard.press('ArrowRight'); await seite.keyboard.press('ArrowRight');
    const r2 = await ev(() => ({szene:szene.i, titel:document.querySelector('#sz-h').textContent}));
    await ev(() => { window.__z = {}; const t0 = performance.now(); window.__t0 = t0;
      new MutationObserver(() => { const t = Math.round(performance.now() - t0); if(!window.__z.ei && document.querySelector('#modal .ei')) window.__z.ei = t; if(!window.__z.weg && !document.querySelector('#szenen .sz')) window.__z.weg = t; }).observe(document.body, {childList:true, subtree:true});
      let letzt = performance.now(); window.__luecke = 0; const f = () => { const j = performance.now(); window.__luecke = Math.max(window.__luecke, Math.round(j - letzt)); letzt = j; if(j - t0 < 600) requestAnimationFrame(f); }; requestAnimationFrame(f); });
    await seite.keyboard.press('Escape'); await seite.waitForTimeout(500);
    console.log('  nach Escape (Seitenzeit):', JSON.stringify(await ev(() => ({...window.__z, groessteBildLuecke:window.__luecke, jetzt:Math.round(performance.now() - window.__t0)}))));
    const r3 = await ev(() => ({gesehen:localStorage.getItem('mtb.szenen'), weg:!document.querySelector('#szenen .sz'), ei:!!document.querySelector('#modal .ei')}));
    await ev(() => { localStorage.setItem('mtb.einstieg2', '1'); }); await seite.reload(); await bereit(); await seite.waitForTimeout(500);
    const r4 = await ev(() => ({szenen:!!document.querySelector('#szenen .sz')}));
    await ev(() => { oeffneMenu(); $('modal').querySelector('[data-szenen]').click(); }); await seite.waitForTimeout(500);
    const r5 = await ev(() => ({wieder:!!document.querySelector('#szenen .sz')}));
    await ev(() => document.querySelector('[data-szweg]').click()); await seite.waitForTimeout(400);
    const ok = r1.punkte === 3 && r1.weg && !r1.ei && r1.fokus === '1' && r2.szene === 2 && /Klarer Plan/.test(r2.titel) && r3.gesehen === '1' && r3.weg && r3.ei && !r4.szenen && r5.wieder;
    console.log(drossel + 'x #' + n + ' ' + (ok ? 'ok' : 'FEHL ' + JSON.stringify({r1, r2, r3, r4, r5})));
  }catch(e){ console.log(drossel + 'x #' + n + ' AUSNAHME ' + e.message.slice(0, 300)); }
}
await browser.close(); server.close();
