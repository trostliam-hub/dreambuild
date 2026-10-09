/* Aufbau ab Score bis erste Teilegruppe: node tk.js <port> <aus> <praefix> -- Mein Rad mit Foto, Traumrad; Handy hell/dunkel, Desktop */
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs = require('fs'); const [,, port, out, pf] = process.argv; fs.mkdirSync(out, {recursive:true});
const FOTO = 'data:image/svg+xml;base64,' + Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="800" height="500" fill="#7d8b6a"/><rect y="330" width="800" height="170" fill="#5b4a3a"/><circle cx="230" cy="330" r="95" fill="none" stroke="#222" stroke-width="14"/><circle cx="560" cy="330" r="95" fill="none" stroke="#222" stroke-width="14"/><path d="M230 330 L360 200 L520 200 L560 330 M360 200 L400 330 L230 330" fill="none" stroke="#c8202f" stroke-width="14"/><text x="400" y="60" font-size="34" text-anchor="middle" fill="#fff" font-family="sans-serif">Foto: eigenes Rad (Testbild)</text></svg>').toString('base64');
(async () => { const b = await chromium.launch(); const fehler = [];
  for(const [g, vp] of [['handy', {width:390, height:844}], ['desktop', {width:1280, height:900}]]) for(const des of ['hell', 'oled']) for(const m of ['real', 'traum']){
    if(g === 'desktop' && des === 'hell' && m === 'real') {} else if(g === 'desktop') continue;
    const ctx = await b.newContext({viewport:vp, deviceScaleFactor:2, reducedMotion:'reduce', isMobile:g === 'handy', hasTouch:g === 'handy'});
    await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
    const p = await ctx.newPage(); p.on('pageerror', e => fehler.push(e.message));
    await p.goto(`http://127.0.0.1:${port}/index.html`);
    await p.evaluate(d => { localStorage.clear(); localStorage.setItem('mtb.design', d); localStorage.setItem('mtb.sprache', 'de'); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); localStorage.setItem('mtb.leit', 'aus'); }, des);
    await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp'));
    await p.evaluate(([m, f]) => { if(m === 'real'){ wechsle('real'); const r = katalog(quelleOf(slotOf('rahmen')))[5]; build.rahmen = r.id; fotos.real = f; sichern(); } view = 'aufbau'; zeichne(); }, [m, FOTO]);
    await p.waitForTimeout(700);
    if(g === 'handy'){
      const box = await p.evaluate(() => { const a = document.querySelector('.bar').getBoundingClientRect(), z = document.querySelector('#aufbau .grp').getBoundingClientRect();
        return {y:a.top + scrollY, h:z.top + scrollY + 120 - (a.top + scrollY)}; });
      await p.addStyleTag({content:'header,.tabs,#sprung{visibility:hidden!important}'});
      await p.screenshot({path:`${out}/${pf}-${g}-${des}-${m}.png`, fullPage:true, clip:{x:0, y:box.y, width:390, height:box.h}});
    } else await p.screenshot({path:`${out}/${pf}-${g}-${des}-${m}.png`});
    await ctx.close(); }
  console.log('Fehler:', fehler.join(' | ') || 'keine'); await b.close(); })();
