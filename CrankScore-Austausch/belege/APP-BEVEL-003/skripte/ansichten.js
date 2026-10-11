/* Ansichten aufnehmen: node ansichten.js <port> <ordner> <praefix> -- Hauptansicht ganzseitig + Befund-Szenen */
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const [,, port, out, pre] = process.argv;
const SZ = [
  ['aufbau-390-dunkel', 390, 'oled', 'de', "view='aufbau'; zeichne(); window.scrollTo(0,0)", true],
  ['aufbau-390-hell', 390, 'hell', 'de', "view='aufbau'; zeichne(); window.scrollTo(0,0)", true],
  ['aufbau-desktop-hell', 1280, 'hell', 'de', "view='aufbau'; zeichne(); window.scrollTo(0,0)", true],
  ['aufbau-desktop-dunkel', 1280, 'oled', 'de', "view='aufbau'; zeichne(); window.scrollTo(0,0)", true],
  ['aufbau-390-en', 390, 'oled', 'en', "view='aufbau'; zeichne(); window.scrollTo(0,0)", true],
  ['finder-bremse', 390, 'oled', 'de', "view='aufbau'; zeichne(); oeffneSlot('bremsen', {tab:'finden'})", false],
  ['finder-kraft-marke', 390, 'oled', 'de', "view='aufbau'; zeichne(); finder.marken=['Hope']; oeffneSlot('bremsen', {ziel:'kraft'})", false],
  ['finder-leicht-250', 390, 'oled', 'de', "view='aufbau'; zeichne(); finder.budgetAn=true; finder.budget=250; oeffneSlot('bremsen', {ziel:'leicht'}); const e=document.querySelector('#fi-erg'); if(e) document.querySelector('#modal .sheet-b').scrollTop = e.offsetTop - 120", false],
  ['vergleich-cura2', 390, 'oled', 'de', "view='aufbau'; zeichne(); finder.slot='bremsen'; finder.ziel='leicht'; oeffneVergleich('bremsen', 'b-cura2')", false],
  ['einkauf', 390, 'oled', 'de', "view='deals'; zeichne(); window.scrollTo(0,0)", true],
  ['einkauf-xt', 390, 'oled', 'de', "build.bremsen='b-xt'; view='deals'; zeichne(); const z=[...document.querySelectorAll('#deals button, #deals [data-detail]')].find(x => /XT M8120/.test(x.textContent)); if(z) z.click(); else oeffneDetail('bremsen','b-xt')", false],
  ['pruefung-zu', 390, 'oled', 'de', "view='aufbau'; pruefOffen=false; zeichne(); const e=document.querySelector('#pruef'); if(e) window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 160)", false],
];
(async () => { const b = await chromium.launch();
  for(const [name, W, des, spr, code, ganz] of SZ){
    const ctx = await b.newContext({viewport:{width:W, height:W < 800 ? 844 : 900}, hasTouch:W < 800, deviceScaleFactor: W < 800 ? 2 : 1, reducedMotion:'reduce'});
    await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
    const p = await ctx.newPage();
    await p.goto(`http://127.0.0.1:${port}/index.html`);
    await p.evaluate(([d, s]) => { localStorage.clear(); localStorage.setItem('mtb.design', d); localStorage.setItem('mtb.sprache', s); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); localStorage.setItem('mtb.szenen', '1'); }, [des, spr]);
    await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp'));
    try{ await p.evaluate(code); }catch(e){ console.log(name, 'Fehler', e.message.split('\n')[0]); }
    await p.waitForTimeout(700);
    await p.screenshot({path:`${out}/${pre}-${name}.png`, fullPage:!!ganz});
    await ctx.close();
  }
  await b.close(); console.log('fertig'); })();
