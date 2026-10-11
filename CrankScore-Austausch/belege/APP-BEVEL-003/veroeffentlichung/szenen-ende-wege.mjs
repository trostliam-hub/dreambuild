/* Szenen-Ende ueber alle Wege: Escape, Ueberspringen, Los geht's; normal und reduzierte Bewegung */
import { createRequire } from 'module'; import { execSync } from 'child_process';
import http from 'http'; import fs from 'fs'; import path from 'path';
const require = createRequire(import.meta.url);
const pw = require(execSync('npm root -g').toString().trim() + '/playwright');
const [,, wurzel, ordner] = process.argv;
const TYP = {'.html':'text/html; charset=utf-8', '.js':'text/javascript', '.json':'application/json', '.png':'image/png', '.webp':'image/webp', '.woff2':'font/woff2'};
const server = http.createServer((q, a) => { const p = path.join(wurzel, decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
  if(!p.startsWith(wurzel) || !fs.existsSync(p) || fs.statSync(p).isDirectory()){ a.writeHead(404); a.end(); return; }
  a.writeHead(200, {'Content-Type':TYP[path.extname(p)] || 'application/octet-stream'}); fs.createReadStream(p).pipe(a); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const URL0 = `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await pw.chromium.launch(); const fehler = [];
for(const bewegung of ['no-preference', 'reduce']) for(const weg of ['escape', 'ueberspringen', 'losgehts']){
  const ctx = await browser.newContext({viewport:{width:390, height:844}, reducedMotion:bewegung});
  await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
  const seite = await ctx.newPage(); seite.on('pageerror', e => fehler.push(e.message));
  const ev = (f, a) => seite.evaluate(f, a);
  await seite.goto(URL0); await ev(() => { localStorage.clear(); localStorage.setItem('mtb.sprache', 'de'); }); await seite.reload();
  await seite.waitForSelector('[data-lsstart]'); await seite.click('[data-lsstart]'); await seite.waitForSelector('#szenen .sz');
  if(weg === 'escape') await seite.keyboard.press('Escape');
  else if(weg === 'ueberspringen') await seite.click('[data-szweg]');
  else { await seite.click('[data-szweiter]'); await seite.click('[data-szweiter]'); await seite.click('[data-szweiter]'); }
  const sofort = await ev(() => { const ei = document.querySelector('#modal .ei'), sz = $('szenen');
    return {ei:!!ei, eiDeckend:ei ? getComputedStyle(ei).opacity : null, eiAnim:ei ? getComputedStyle(ei).animationName : null, szenen:sz ? (sz.classList.contains('weg') ? 'blendet aus' : 'steht') : 'weg',
      klickDurch:sz ? getComputedStyle(sz).pointerEvents : null, gesperrt:document.body.style.position === 'fixed', fokusInEi:!!(ei && ei.contains(document.activeElement))}; });
  if(bewegung === 'no-preference' && weg === 'escape'){ await seite.waitForTimeout(90); await seite.screenshot({path:`${ordner}/uebergang-mitte.png`}); }
  await seite.waitForFunction(() => !document.querySelector('#szenen .sz'), null, {timeout:5000}).catch(() => {});
  const danach = await ev(() => ({szenenWeg:!document.querySelector('#szenen .sz'), ei:!!document.querySelector('#modal .ei'), gesperrt:document.body.style.position === 'fixed', gesehen:localStorage.getItem('mtb.szenen')}));
  console.log(bewegung.padEnd(13), weg.padEnd(14), JSON.stringify(sofort), '->', JSON.stringify(danach));
  if(bewegung === 'no-preference' && weg === 'escape') await seite.screenshot({path:`${ordner}/uebergang-ende.png`});
  await ctx.close();
}
console.log('JS-Fehler:', fehler.length ? fehler : 'keine');
await browser.close(); server.close();
