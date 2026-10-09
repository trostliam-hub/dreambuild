/* Score-Karte und Teilekarte: node score.js <port> <aus> -- Handy und Desktop, hell und dunkel, ohne und mit Konflikt */
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs = require('fs'); const [,, port, out] = process.argv; fs.mkdirSync(out, {recursive:true});
(async () => { const b = await chromium.launch();
  for(const [g, vp] of [['handy', {width:390, height:844}], ['desktop', {width:1280, height:900}]]) for(const des of ['hell', 'oled']) for(const fall of ['ok', 'konflikt']){
    const ctx = await b.newContext({viewport:vp, deviceScaleFactor:2, reducedMotion:'reduce'});
    await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
    const p = await ctx.newPage(); p.on('pageerror', e => console.log('pageerror', e.message));
    await p.goto(`http://127.0.0.1:${port}/index.html`);
    await p.evaluate(d => { localStorage.clear(); localStorage.setItem('mtb.design', d); localStorage.setItem('mtb.sprache', 'de'); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); localStorage.setItem('mtb.leit', 'aus'); }, des);
    await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp'));
    if(fall === 'konflikt') await p.evaluate(() => { const r = katalog(quelleOf(slotOf('rahmen'))).find(t => t.daempfer); build.rahmen = r.id;
      katalog(quelleOf(slotOf('daempfer'))).find(t => { build.daempfer = t.id; return pruefe(build).some(x => x.level === 'fehler' && (x.slots || []).indexOf('daempfer') >= 0); }); plan.budget = 3000; sichern(); zeichne(); });
    await p.waitForTimeout(700);
    if(g === 'handy') await p.addStyleTag({content:'header,.tabs,#sprung,.leit{visibility:hidden!important}'});
    const el = await p.$(g === 'handy' ? '.bar' : '#seite'); await el.screenshot({path:`${out}/${g}-${des}-${fall}.png`});
    await ctx.close(); }
  await b.close(); })();
