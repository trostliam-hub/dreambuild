/* Seitenansicht aus radGeo fuer mehrere Rahmen: node geo.js <port> <out.png> */
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const [,, port, out] = process.argv;
(async () => { const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:1400, height:1000}});
  const fehler = []; p.on('pageerror', e => fehler.push(e.message));
  await p.goto(`http://127.0.0.1:${port}/index.html`);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); localStorage.setItem('mtb.leit', 'aus'); });
  await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp'));
  const info = await p.evaluate(() => {
    const rs = katalog(quelleOf(slotOf('rahmen'))).filter(r => r.geo && r.geo.rs);
    const pick = [];
    const want = [r => r.id === 'f-spindrift', r => !r.daempfer && r.lrV === '29', r => !r.daempfer && r.lrV === '26', r => r.daempfer && (r.maxGabel || 0) >= 200, r => r.daempfer && (r.maxGabel || 0) <= 120, r => r.daempfer && (r.maxGabel || 0) === 150, r => r.lrH === '27.5' && r.lrV === '29'];
    want.forEach(f => { const r = rs.find(x => f(x) && pick.indexOf(x) < 0); if(r) pick.push(r); });
    const res = [];
    pick.forEach(r => { const b = {rahmen:r.id};
      const g = katalog(quelleOf(slotOf('gabel'))).find(x => x.travel && x.travel <= (r.maxGabel || 160) && x.travel >= (r.maxGabel || 160) - 20);
      if(g) b.gabel = g.id;
      const gx = radGeo(b);
      res.push({id:r.id, n:r.n, geo:r.geo, gx:gx, svg:gx ? radSvg({geo:gx}) : ''}); });
    document.body.innerHTML = '<div id="w" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;background:#fff">' + res.map(x => `<div style="border:1px solid #ccc;font:12px sans-serif"><div>${x.n} ${x.gx ? `reach ${x.gx.reach} stack ${x.gx.stack} lw ${x.gx.lw}` : 'kein geo'}</div><div style="height:260px">${x.svg}</div></div>`).join('') + '</div>';
    document.querySelectorAll('#w svg').forEach(s => { s.style.width = '100%'; s.style.height = '100%'; });
    return res.map(x => ({id:x.id, n:x.n, geo:x.geo, gx:x.gx && {reach:x.gx.reach, stack:x.gx.stack, lrV:x.gx.lrV, lrH:x.gx.lrH, ht:x.gx.ht, fw:x.gx.fw}}));
  });
  console.log(JSON.stringify(info, null, 1));
  await p.waitForTimeout(500);
  await p.screenshot({path:out, fullPage:true});
  console.log('Fehler:', fehler);
  await b.close(); })();
