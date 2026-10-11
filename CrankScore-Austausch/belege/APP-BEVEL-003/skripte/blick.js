/* Schneller Blick: node blick.js <port> <ordner> <praefix> [szenen-json] -- Hauptansicht 390 dunkel/hell und Desktop hell, ganzseitig; meldet Konsolenfehler */
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const [,, port, out, pre, extra] = process.argv;
const SZ = extra ? JSON.parse(extra) : [
  ['390-dunkel', 390, 'oled', 'de', "view='aufbau'; zeichne(); window.scrollTo(0,0)", true],
  ['390-hell', 390, 'hell', 'de', "view='aufbau'; zeichne(); window.scrollTo(0,0)", true],
  ['desk-hell', 1280, 'hell', 'de', "view='aufbau'; zeichne(); window.scrollTo(0,0)", true],
  ['desk-dunkel', 1280, 'oled', 'de', "view='aufbau'; zeichne(); window.scrollTo(0,0)", false]];
(async () => { const b = await chromium.launch(); const fehler = [];
  for(const [name, W, des, spr, code, ganz] of SZ){
    const ctx = await b.newContext({viewport:{width:W, height:W < 800 ? 844 : 900}, hasTouch:W < 800, deviceScaleFactor:W < 800 ? 2 : 1, reducedMotion:'reduce'});
    await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
    const p = await ctx.newPage();
    p.on('pageerror', e => fehler.push(name + ': ' + e.message)); p.on('console', m => { if(m.type() === 'error' && !/Failed to load resource|404/.test(m.text())) fehler.push(name + ': ' + m.text()); });
    await p.goto(`http://127.0.0.1:${port}/index.html`);
    await p.evaluate(([d, s]) => { localStorage.clear(); localStorage.setItem('mtb.design', d); localStorage.setItem('mtb.sprache', s); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); localStorage.setItem('mtb.szenen', '1'); }, [des, spr]);
    await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp'), null, {timeout:15000}).catch(e => fehler.push(name + ': kein Aufbau'));
    try{ await p.evaluate(code); }catch(e){ fehler.push(name + ' Code: ' + e.message.split('\n')[0]); }
    await p.waitForTimeout(600);
    await p.screenshot({path:`${out}/${pre}-${name}.png`, fullPage:!!ganz});
    await ctx.close();
  }
  console.log('Fehler:', JSON.stringify(fehler)); await b.close(); })();
