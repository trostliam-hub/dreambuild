/* Ist-Aufnahme Adapter, gezielt: node ist2.js <wurzel> <ordner> <praefix> */
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const [,, wurzel, ordner, pre = 'ist', design = 'hell', spr = 'de', breite = '390'] = process.argv;
fs.mkdirSync(ordner, {recursive:true});
const TYP = {'.html':'text/html; charset=utf-8', '.js':'text/javascript', '.json':'application/json', '.png':'image/png', '.webp':'image/webp', '.woff2':'font/woff2'};
const server = http.createServer((q, a) => { const p = path.join(wurzel, decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
  if(!p.startsWith(wurzel) || !fs.existsSync(p) || fs.statSync(p).isDirectory()){ a.writeHead(404); a.end(); return; }
  a.writeHead(200, {'Content-Type':TYP[path.extname(p)] || 'application/octet-stream'}); fs.createReadStream(p).pipe(a); });
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const b = await chromium.launch();
  const ctx = await b.newContext({viewport:{width:+breite, height:+breite < 600 ? 844 : 1000}, deviceScaleFactor:2});
  await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
  const p = await ctx.newPage(); const fehler = []; p.on('pageerror', e => fehler.push(e.message));
  await p.goto(`http://127.0.0.1:${server.address().port}/index.html`);
  await p.evaluate(ARGS => { localStorage.clear(); ['einstieg2','tour','szenen'].forEach(k => localStorage.setItem('mtb.' + k, '1')); localStorage.setItem('mtb.sprache', ARGS[1]); localStorage.setItem('mtb.design', ARGS[0] === 'hell' ? 'hell' : 'oled'); }, [design, spr]);
  await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp'));
  for(const mod of ['real', 'traum']){
    /* Rad ohne Bremse, dann die XT ueber den normalen Weg (Teileliste -> einbauen) */
    await p.evaluate(m => { wechsle(m); for(const k in build) build[k] = null; build.rahmen = 'f-stumpy'; build.gabel = 'g-pike'; sichern(); view = 'aufbau'; zeichne(); }, mod);
    await p.waitForTimeout(300);
    await p.evaluate(() => uebernehmen('bremsen', 'b-xt', 'liste'));
    await p.waitForTimeout(250);
    const toast = await p.evaluate(() => { const t = $('toast'); return t && !t.hidden ? t.textContent.replace(/\s+/g, ' ').trim() : ''; });
    console.log(mod, 'Meldung:', toast);
    await p.screenshot({path:`${ordner}/${pre}-${mod}-${design}-${spr}-${breite}-meldung.png`});
    await p.evaluate(() => { $('toast').hidden = true; if(!pruefOffen) pruefUmschalten(); });
    await p.waitForTimeout(350);
    const pf = await p.$('#aufbau .pruef'); if(pf) await pf.screenshot({path:`${ordner}/${pre}-${mod}-${design}-${spr}-${breite}-pruefung.png`});
    for(const g of ['gabel', 'bremsen']){
      const el = await p.evaluateHandle(k => { const s = [...document.querySelectorAll('#aufbau .grp')].find(x => x.querySelector(`[data-slot="${k}"]`)); return s || null; }, g);
      const e = el.asElement(); if(e){ await e.scrollIntoViewIfNeeded(); await e.screenshot({path:`${ordner}/${pre}-${mod}-${design}-${spr}-${breite}-${g}.png`}); }
    }
    console.log(mod, JSON.stringify(await p.evaluate(() => ({pruef:document.querySelector('#aufbau .pruef').textContent.replace(/\s+/g, ' ').trim().slice(0, 600),
      gelb:[...document.querySelectorAll('#aufbau .grp')].filter(g => /warn|gelb|ad\b/.test(g.className)).map(g => g.className)}))));
  }
  console.log('JS-Fehler:', fehler);
  await b.close(); server.close();
})();
