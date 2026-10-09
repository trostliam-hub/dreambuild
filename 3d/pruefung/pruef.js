/* GLB-Pruefung: im Ordner 3d/ einen statischen Server starten (python3 -m http.server 8790), hier
   `npm install three@0.169.0` ausfuehren, dann: node pruef.js 8790 <ausgabeordner>
   Laedt ../modell/spindrift-5-al.glb mit three.js + DRACOLoader, meldet Ladezeit, Meshes, Clips und Konsolenfehler
   und speichert Bilder in Ruhe, eingefedert (0,733 s) und gerollt (3 s). */
let pw; try{ pw = require('playwright'); }catch(e){ pw = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright'); }
const { chromium } = pw;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1000, height: 620 } });
  const fehler = [];
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') fehler.push(m.type() + ': ' + m.text()); });
  p.on('pageerror', e => fehler.push('pageerror: ' + e.message));
  const port = process.argv[2], aus = process.argv[3];
  for (const [blick, bg, zeiten] of [["seite", "hell", [0, 0.733, 3.0]], ["dreiviertel", "dunkel", [0, 0.733]]]) {
    await p.goto(`http://127.0.0.1:${port}/pruefung/ansicht.html?blick=${blick}&bg=${bg}&glb=../modell/spindrift-5-al.glb`);
    await p.waitForFunction(() => window.fertig || window.fehler, null, { timeout: 120000 });
    console.log(blick, bg, JSON.stringify(await p.evaluate(() => window.info || window.fehler)));
    for (const t of zeiten) {
      await p.evaluate(t => window.zeige(t), t);
      await p.screenshot({ path: `${aus}/glb-${blick}-${bg}-t${t}.png` });
    }
  }
  console.log('Konsole:', fehler.length ? fehler.join('\n') : 'keine Fehler/Warnungen');
  await b.close();
})();
