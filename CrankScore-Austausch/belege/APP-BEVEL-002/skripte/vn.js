/* Vorher/Nachher-Aufnahmen: node vn.js <port> <ordner> <vorher|nachher> */
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const [,, port, out, stand] = process.argv, NEU = stand === 'nachher';
const KONFLIKT = "wechsle('real'); const r = katalog(quelleOf(slotOf('rahmen'))).find(t => t.daempfer); build.rahmen = r.id; katalog(quelleOf(slotOf('daempfer'))).find(t => { build.daempfer = t.id; return pruefe(build).some(x => x.level === 'fehler' && (x.slots || []).indexOf('daempfer') >= 0); }); sichern();";
const nachOben = sel => `(() => { const e = document.querySelector('${sel}'); if(!e) return; const k = (document.querySelector('.top') || {offsetHeight:0}).offsetHeight; window.scrollTo(0, e.getBoundingClientRect().top + scrollY - k - 70); })()`;
const AUFN = [
  ['01-aufbau-oben', 390, 'oled', 'de', "view='aufbau'; zeichne(); window.scrollTo(0,0)"],
  ['02-aufbau-radbild', 390, 'oled', 'de', "view='aufbau'; zeichne();" + (NEU ? nachOben('#aufbau .radbild') : nachOben('#aufbau .grp'))],
  ['03-pruefung-konflikt', 390, 'oled', 'de', KONFLIKT + (NEU ? "view='aufbau'; pruefOffen=false; zeichne();" + nachOben('#pruef') : "view='befunde'; zeichne(); vorschlaegeZeichnen(); window.scrollTo(0, 0)")],
  ['04-pruefung-offen', 390, 'oled', 'de', KONFLIKT + (NEU ? "view='aufbau'; pruefOffen=true; zeichne(); vorschlaegeZeichnen();" + nachOben('#pruef') : "view='befunde'; zeichne(); vorschlaegeZeichnen(); window.scrollTo(0, 420)")],
  ['05-teileblatt-bremse', 390, 'oled', 'de', "view='aufbau'; zeichne(); oeffneSlot('bremsen')"],
  ['06-teileblatt-bremse-unten', 390, 'oled', 'de', "view='aufbau'; zeichne(); oeffneSlot('bremsen'); document.querySelector('#modal .sheet-b').scrollTop = 560"],
  ['07-upgrades', 390, 'oled', 'de', NEU ? "view='aufbau'; zeichne(); oeffneSlot('gabel', {ziel:'leicht'}); document.querySelector('#modal .sheet-b').scrollTop = document.querySelector('#fi-erg').offsetTop - 120" : "view='upgrades'; zeichne(); vorschlaegeZeichnen(); window.scrollTo(0,0)"],
  ['08-aufbau-hell', 390, 'hell', 'de', "view='aufbau'; zeichne();" + (NEU ? nachOben('#aufbau .radbild') : nachOben('#aufbau .grp'))],
  ['09-aufbau-en', 390, 'oled', 'en', "view='aufbau'; zeichne();" + (NEU ? nachOben('#aufbau .radbild') : nachOben('#aufbau .grp'))],
  ['10-desktop-hell', 1280, 'hell', 'de', "view='aufbau'; zeichne(); window.scrollTo(0,0)"],
  ['11-desktop-dunkel', 1280, 'oled', 'de', "view='aufbau'; zeichne(); window.scrollTo(0, 300)"],
  ['12-teilezeilen', 390, 'oled', 'de', "view='aufbau'; zeichne();" + nachOben('#aufbau .grp:nth-of-type(3)')],
];
if(NEU) AUFN.push(
  ['20-vergleich', 390, 'oled', 'de', "view='aufbau'; zeichne(); finder.slot='gabel'; finder.ziel='leicht'; const e = (finder = {slot:'gabel', ziel:'leicht', marken:[], budget:0, budgetAn:false, mehr:false, tab:'finden'}, finderRechnen('gabel')); oeffneVergleich('gabel', e.treffer[0].t.id)"],
  ['21-wunschliste', 390, 'oled', 'de', "merken('bremsen','b-mt4'); merken('gabel','g-fox34slf'); wunschListe()[1].stufe='einkauf'; uebernehmen('griffe', katalog('griffe')[2].id, 'test'); schliesse(); view='wunsch'; zeichne(); window.scrollTo(0,0)"],
  ['22-finder-kein-wechsel', 390, 'oled', 'de', "build.bremsen='b-xt'; zeichne(); oeffneSlot('bremsen', {ziel:'einsatz'}); document.querySelector('#modal .sheet-b').scrollTop = document.querySelector('#fi-erg').offsetTop - 260"],
  ['23-angabe-fehlt', 390, 'oled', 'de', "build.gabel='g-recon'; build.bremsen='b-xt'; view='aufbau'; pruefOffen=true; zeichne(); vorschlaegeZeichnen();" + nachOben('#pruef')],
  ['24-kategorie', 390, 'oled', 'de', "view='aufbau'; zeichne(); oeffneFinderStart()"],
  ['25-spindrift-3d', 390, 'hell', 'de', "build.rahmen='f-spindrift'; view='aufbau'; zeichne();" + nachOben('#aufbau .radbild')],
  ['26-test-banner', 390, 'oled', 'de', "merken('bremsen','b-mt4'); wunschTesten(wunschListe()[0].id); window.scrollTo(0, 0);" + nachOben('#aufbau .test-banner')],
  ['27-xc-hardtail', 390, 'hell', 'de', "build.rahmen='f-scout'; view='aufbau'; zeichne();" + nachOben('#aufbau .radbild')]);
(async () => { const b = await chromium.launch();
  for(const [name, W, des, spr, code] of AUFN){
    const ctx = await b.newContext({viewport:{width:W, height:W < 800 ? 844 : 900}, hasTouch:W < 800, reducedMotion:'reduce'});
    await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
    const p = await ctx.newPage();
    await p.goto(`http://127.0.0.1:${port}/index.html`);
    await p.evaluate(([d, s]) => { localStorage.clear(); localStorage.setItem('mtb.design', d); localStorage.setItem('mtb.sprache', s); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); localStorage.setItem('mtb.szenen', '1'); }, [des, spr]);
    await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp'));
    try{ await p.evaluate(code); }catch(e){ console.log(name, 'Fehler', e.message.split('\n')[0]); }
    await p.waitForTimeout(700);
    await p.screenshot({path:`${out}/${name}.png`});
    await ctx.close();
  }
  await b.close(); console.log('fertig', stand); })();
