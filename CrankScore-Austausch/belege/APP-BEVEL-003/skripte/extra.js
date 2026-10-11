const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const [,, port, out] = process.argv;
const SZ = [
 ['x-null', "wechsle('real'); build.rahmen='f-stumpy'; build.gabel='g-pike'; build.bremsen='b-xt'; sichern(); zeichne(); oeffneSlot('bremsen', {ziel:'sparen'}); finder.marken=['Trickstuff']; finder.budgetAn=true; finder.budget=300; oeffneSlot('bremsen')"],
 ['x-sparen', "wechsle('real'); build.rahmen='f-stumpy'; build.gabel='g-pike'; build.bremsen='b-xt'; sichern(); zeichne(); oeffneSlot('bremsen', {ziel:'sparen'})"],
 ['x-vergleich', "wechsle('real'); build.rahmen='f-stumpy'; build.gabel='g-pike'; build.bremsen='b-xt'; sichern(); zeichne(); oeffneSlot('bremsen', {ziel:'kraft'}); document.querySelector('#fi [data-vergleich]').click()"],
 ['x-wunsch', "wechsle('real'); build.rahmen='f-stumpy'; build.gabel='g-pike'; build.bremsen='b-xt'; sichern(); merken('gabel','g-lyrik'); merken('bremsen','b-mt4'); const l=wunschListe(); l.find(w=>w.slot==='gabel').stufe='einkauf'; wunschTesten(l.find(w=>w.slot==='bremsen').id); view='wunsch'; zeichne(); window.scrollTo(0,0)"]];
(async () => { const b = await chromium.launch();
  for(const [name, code] of SZ){
    const ctx = await b.newContext({viewport:{width:390, height:844}, hasTouch:true, deviceScaleFactor:2, reducedMotion:'reduce'});
    const p = await ctx.newPage(); await p.goto(`http://127.0.0.1:${port}/index.html`);
    await p.evaluate(() => { localStorage.clear(); localStorage.setItem('mtb.design', 'oled'); localStorage.setItem('mtb.sprache', 'de'); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); localStorage.setItem('mtb.szenen', '1'); });
    await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp'));
    await p.evaluate(code); await p.waitForTimeout(600); await p.screenshot({path:`${out}/${name}.png`}); await ctx.close(); }
  await b.close(); console.log('ok'); })();
