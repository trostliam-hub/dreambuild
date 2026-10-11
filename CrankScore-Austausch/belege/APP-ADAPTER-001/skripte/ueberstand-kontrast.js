/* Ueberstand und Kontrast der Adapter-Anzeigen: node pruef.js <wurzel> */
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const [,, wurzel] = process.argv;
const TYP = {'.html':'text/html; charset=utf-8', '.js':'text/javascript', '.json':'application/json', '.png':'image/png', '.webp':'image/webp', '.woff2':'font/woff2'};
const server = http.createServer((q, a) => { const p = path.join(wurzel, decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
  if(!p.startsWith(wurzel) || !fs.existsSync(p) || fs.statSync(p).isDirectory()){ a.writeHead(404); a.end(); return; }
  a.writeHead(200, {'Content-Type':TYP[path.extname(p)] || 'application/octet-stream'}); fs.createReadStream(p).pipe(a); });
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const b = await chromium.launch(); const erg = [];
  for(const breite of [320, 390, 1280]) for(const design of ['hell', 'oled']) for(const spr of ['de', 'en']) for(const mod of ['real', 'traum']){
    const ctx = await b.newContext({viewport:{width:breite, height:800}});
    await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
    const p = await ctx.newPage(); const fehler = []; p.on('pageerror', e => fehler.push(e.message));
    await p.goto(`http://127.0.0.1:${server.address().port}/index.html`);
    await p.evaluate(([d, s]) => { localStorage.clear(); ['einstieg2','tour','szenen'].forEach(k => localStorage.setItem('mtb.' + k, '1')); localStorage.setItem('mtb.sprache', s); localStorage.setItem('mtb.design', d); }, [design, spr]);
    await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp'));
    const r = await p.evaluate(m => { wechsle(m); for(const k in build) build[k] = null; build.rahmen = 'f-stumpy'; build.gabel = 'g-pike';
      /* 203 vorn und hinten: zwei Adapter (vorn Gabel, hinten Rahmen) */
      const basis = rohTeil('bremsen', 'b-xt'), i = basis.v.findIndex(d => d.k === 'Scheiben'), w = findeTeil('bremsen', 'b-xt').wahl.slice();
      const j = basis.v[i].o.findIndex(o => o.s.sV === 203 && o.s.sH === 203); w[i] = j >= 0 ? j : basis.v[i].o.findIndex(o => o.s.sV === 203);
      build.bremsen = varianteNachIndex(basis, w).id; sichern(); view = 'aufbau'; zeichne(); if(!pruefOffen) pruefUmschalten(true);
      const lum = c => { const m = c.match(/[\d.]+/g).map(Number); const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return [.2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]), m[3] == null ? 1 : m[3]]; };
      const hinter = el => { while(el){ const bg = getComputedStyle(el).backgroundColor, im = getComputedStyle(el).backgroundImage; if(im && im !== 'none' && /gradient/.test(im)){ const c = im.match(/rgba?\([^)]+\)/); if(c && lum(c[0])[1] > .5) return c[0]; } if(bg && lum(bg)[1] > .5) return bg; el = el.parentElement; } return getComputedStyle(document.body).backgroundColor; };
      const kontrast = el => { const a = lum(getComputedStyle(el).color)[0], h = lum(hinter(el))[0]; return Math.round((Math.max(a, h) + .05) / (Math.min(a, h) + .05) * 100) / 100; };
      const els = [...document.querySelectorAll('#aufbau .ad-k, #aufbau .slot-ad span, #aufbau .slot-ad b, #findings .find.ad .pill, #findings .find.ad p, #aufbau .ad-t b, #aufbau .ad-r')];
      const min = els.length ? Math.min(...els.map(kontrast)) : null;
      const ueber = [...document.querySelectorAll('#aufbau *')].filter(e => { const q = e.getBoundingClientRect(); return q.width && (q.right > innerWidth + 1 || q.left < -1); }).length;
      return {ad:bewerte(build).adapter.length, slotAd:document.querySelectorAll('#aufbau .slot-ad').length, adFund:document.querySelectorAll('#findings .find.ad').length, min, ueber, scrollX:document.documentElement.scrollWidth > innerWidth}; }, mod);
    erg.push({breite, design, spr, mod, ...r, fehler:fehler.length});
    await ctx.close();
  }
  const schlecht = erg.filter(e => e.ueber || e.scrollX || e.min < 4.5 || e.fehler || e.slotAd < 2 || e.adFund < 2);
  console.log('Faelle', erg.length, 'Probleme', schlecht.length, 'min Kontrast', Math.min(...erg.map(e => e.min)), 'Adapter je Fall', [...new Set(erg.map(e => e.ad))]);
  if(schlecht.length) console.log(JSON.stringify(schlecht, null, 1));
  fs.writeFileSync('pruef-ergebnis.json', JSON.stringify(erg, null, 1));
  await b.close(); server.close();
})();
