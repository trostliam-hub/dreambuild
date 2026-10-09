/* Kontrast aller sichtbaren Texte: node kontrast.js <port>
 * Schrift gegen den tatsaechlichen Hintergrund (erste deckende Flaeche darunter),
 * WCAG: 4,5:1, grosse Schrift (>= 24 px oder >= 18,66 px fett) 3:1. */
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const [,, port] = process.argv;
(async () => {
  const b = await chromium.launch(); let alle = 0, schlecht = [];
  for(const des of ['hell', 'oled']) for(const W of [390, 1280]){
    const ctx = await b.newContext({viewport:{width:W, height:900}, reducedMotion:'reduce'});
    await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
    const p = await ctx.newPage();
    await p.goto(`http://127.0.0.1:${port}/index.html`);
    await p.evaluate(d => { localStorage.clear(); localStorage.setItem('mtb.design', d); localStorage.setItem('mtb.sprache', 'de'); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); }, des);
    await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp'));
    await p.evaluate(() => { pro = {key:'x', inst:'i', status:'aktiv', geprueft:Date.now()}; plan.fahrer = 80; sichern(); zeichne(); });
    const szenen = [['aufbau', () => { view = 'aufbau'; zeichne(); }], ['befunde', () => { view = 'befunde'; zeichne(); }], ['upgrades', () => { view = 'upgrades'; zeichne(); vorschlaegeZeichnen(); }],
      ['deals', () => { view = 'deals'; zeichne(); }], ['setup', () => { view = 'setup'; zeichne(); }],
      ['konflikt', () => { wechsle('real'); const r = katalog(quelleOf(slotOf('rahmen'))).find(t => t.daempfer); Object.assign(build, JSON.parse(JSON.stringify(profile.traum[0].build))); build.rahmen = r.id;
        katalog(quelleOf(slotOf('daempfer'))).find(t => { build.daempfer = t.id; return pruefe(build).some(x => x.level === 'fehler' && (x.slots || []).indexOf('daempfer') >= 0); }); view = 'aufbau'; zeichne(); }],
      ['teilewahl', () => oeffneSlot('daempfer')], ['vergleich', () => { schliesse(); wechsle('traum'); view = 'upgrades'; zeichne(); vorschlaegeZeichnen(); document.querySelector('#upgrades .up-vgl').click(); }],
      ['radwahl', () => { schliesse(); oeffneRadwahl(); }]];
    for(const [n, f] of szenen){
      await p.evaluate(`(${f.toString()})()`); await p.waitForTimeout(350);
      const r = await p.evaluate(() => {
        const rgb = s => { const m = s.match(/rgba?\(([^)]+)\)/); if(!m) return null; const v = m[1].split(',').map(x => parseFloat(x)); return {r:v[0], g:v[1], b:v[2], a:v.length > 3 ? v[3] : 1}; };
        const lum = c => { const f = x => { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b); };
        const misch = (o, u) => ({r:o.r * o.a + u.r * (1 - o.a), g:o.g * o.a + u.g * (1 - o.a), b:o.b * o.a + u.b * (1 - o.a), a:1});
        const grund = el => { const schichten = []; for(let e = el; e; e = e.parentElement){ const c = rgb(getComputedStyle(e).backgroundColor); if(c && c.a > 0){ schichten.push(c); if(c.a >= .99) break; } }
          let u = rgb(getComputedStyle(document.documentElement).backgroundColor) || {r:0, g:0, b:0, a:1};
          for(let i = schichten.length - 1; i >= 0; i--) u = misch(schichten[i], u); return u; };
        const out = []; let n = 0;
        const wurzel = document.querySelector('#modal .sheet') || document.body;
        wurzel.querySelectorAll('*').forEach(e => {
          if(e.closest('svg') || ![...e.childNodes].some(t => t.nodeType === 3 && t.textContent.trim())) return;
          const r = e.getBoundingClientRect(); if(!r.width || !r.height || r.bottom < 0 || r.top > innerHeight) return;
          const s = getComputedStyle(e); if(s.visibility === 'hidden' || +s.opacity < .9 || s.display === 'none') return;
          let o = e; while(o && o !== document.body){ if(+getComputedStyle(o).opacity < .9) return; o = o.parentElement; }
          if(e.closest('.feed-gross, img, .ls, #startseite, .scrim:not(:has(.sheet))') || (e.closest('#modal') === null && document.querySelector('#modal .sheet'))) return;
          const f = rgb(s.color); if(!f) return; const u = grund(e), fg = misch(f, u);
          const k = (Math.max(lum(fg), lum(u)) + .05) / (Math.min(lum(fg), lum(u)) + .05);
          const gr = parseFloat(s.fontSize), fett = +s.fontWeight >= 700, gross = gr >= 24 || (gr >= 18.66 && fett);
          n++; if(k < (gross ? 3 : 4.5)) out.push({t:e.textContent.trim().slice(0, 40), k:Math.round(k * 100) / 100, c:e.className && typeof e.className === 'string' ? e.className.split(' ')[0] : e.tagName, gr});
        });
        return {n, out};
      });
      alle += r.n; for(const x of r.out) schlecht.push({des, W, n, ...x});
    }
    await ctx.close();
  }
  const uniq = {}; for(const x of schlecht){ const k = x.des + '|' + x.c + '|' + x.t; if(!uniq[k]) uniq[k] = x; }
  for(const x of Object.values(uniq)) console.log(`${x.des} ${x.W} ${x.n}: ${x.c} "${x.t}" ${x.k}:1 (${x.gr}px)`);
  console.log(`KONTRAST: ${schlecht.length} Unterschreitungen in ${alle} Texten (${Object.keys(uniq).length} verschiedene)`);
  await b.close();
})();
