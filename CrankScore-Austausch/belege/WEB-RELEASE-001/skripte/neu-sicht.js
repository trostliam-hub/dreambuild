// Ganze Startseite fotografieren: node neu-sicht.js <breite> <sprache> <hell|dunkel> <datei> [seite]
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
(async () => {
  const [w, sp, d, ziel, seite] = process.argv.slice(2);
  const b = await chromium.launch(); const f = [];
  const c = await b.newContext({ viewport: { width: +w, height: +w < 800 ? 844 : 900 }, deviceScaleFactor: +w < 800 ? 2 : 1, isMobile: +w < 800, hasTouch: +w < 800, colorScheme: d === 'dunkel' ? 'dark' : 'light', reducedMotion: 'reduce' });
  await c.addInitScript(sp => { try { if (!sessionStorage.__sp) { if (sp === 'de') localStorage.setItem('cs.sprache', 'de'); sessionStorage.__sp = 1; } } catch (e) {} }, sp);
  const p = await c.newPage(); p.on('pageerror', e => f.push(e.message)); p.on('console', m => { if (['error', 'warning'].includes(m.type())) f.push(m.text()); });
  await p.goto('http://127.0.0.1:8766/' + (seite || ''));
  await p.waitForFunction(sp => document.documentElement.lang === sp && !document.documentElement.classList.contains('sprache-lade'), sp);
  await p.evaluate(async () => { await document.fonts.ready; for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); } scrollTo(0, 0); });
  await p.waitForTimeout(800);
  await p.screenshot({ path: ziel, fullPage: true });
  console.log(JSON.stringify({ h: await p.evaluate(() => document.documentElement.scrollHeight), qs: await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), f }));
  await b.close();
})();
