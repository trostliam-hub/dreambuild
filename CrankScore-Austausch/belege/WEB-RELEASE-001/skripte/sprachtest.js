// Sprache auf allen Seiten (Standard Englisch seit 2026-10-08): erster Besuch, Wahl, Speicherung, Seitenwechsel,
// Titel/Beschreibung, Bilder, Meldungen, Menue, Fehler, ohne JavaScript, Bots
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const U = 'http://127.0.0.1:8766/'; let n = 0; const ok = (b, t) => { console.log((b ? 'OK     ' : 'FEHLER ') + t); if (!b) n++; };
const warte = (p, sp) => p.waitForFunction(sp => document.documentElement.lang === sp && !document.querySelector('.laedt') && !document.documentElement.classList.contains('sprache-lade'), sp, { timeout: 5000 });
(async () => {
  const b = await chromium.launch();
  // Erster Besuch mit deutschem Browser: trotzdem Englisch
  const c = await b.newContext({ locale: 'de-DE', viewport: { width: 1280, height: 900 } }); const p = await c.newPage();
  const f = []; p.on('pageerror', e => f.push(e.message)); p.on('console', m => { if (['error', 'warning'].includes(m.type())) f.push(m.type() + ': ' + m.text()); });
  const geladen = []; p.on('request', r => { if (/texte\.js/.test(r.url())) geladen.push(r.url()); });
  const stand = () => p.evaluate(() => ({ lang: document.documentElement.lang, titel: document.title, h1: (document.querySelector('h1') || {}).textContent,
    desc: (document.querySelector('meta[name=description]') || {}).content, bild: (document.querySelector('img[data-bild]') || {}).currentSrc || '',
    gedrueckt: [...document.querySelectorAll('button[data-sprache][aria-pressed=true]')].map(x => x.dataset.sprache).join(), versteckt: document.documentElement.classList.contains('sprache-lade'),
    speicher: localStorage.getItem('cs.sprache') }));
  await p.goto(U, { waitUntil: 'networkidle' }); let z = await stand();
  ok(z.lang === 'en' && /^Your bike\./.test(z.h1) && /Plan your mountain bike/.test(z.titel) && /checks the dimensions/.test(z.desc) && /\/en\//.test(z.bild) && !z.versteckt && z.speicher === null && geladen.length === 0,
    'Erster Besuch (Browser deutsch): Englisch, ohne Nachladen, nichts gespeichert: ' + z.titel);
  await p.click('.kopf button[data-sprache="de"]'); await warte(p, 'de'); z = await stand();
  ok(z.lang === 'de' && /^Dein Rad\./.test(z.h1) && /Mountainbike planen/.test(z.titel) && /prüft Maße/.test(z.desc) && /\/de\//.test(z.bild) && z.gedrueckt === 'de,de,de' && z.speicher === 'de', 'Umschalten auf Deutsch, gespeichert: ' + z.titel);
  const menue = await p.evaluate(() => [...document.querySelectorAll('.menue-liste a')].map(a => a.textContent).join('|') + ' / ' + document.getElementById('menue-knopf').getAttribute('aria-label'));
  ok(/^So funktioniert’s\|Funktionen\|Beispiel/.test(menue) && /Menü öffnen$/.test(menue), 'Menü deutsch: ' + menue);
  await p.reload({ waitUntil: 'networkidle' }); await warte(p, 'de'); z = await stand();
  ok(z.lang === 'de' && /^Dein Rad\./.test(z.h1), 'nach Neuladen weiter Deutsch (gespeichert)');
  await p.click('a[href="impressum.html"]'); await p.waitForLoadState('load'); await warte(p, 'de'); z = await stand();
  const h1 = await p.$eval('.recht-hinweis', e => getComputedStyle(e).display);
  ok(z.lang === 'de' && z.h1 === 'Impressum' && h1 === 'none', 'Impressum übernimmt Deutsch, Hinweis zur englischen Fassung ausgeblendet');
  await p.click('.kopf button[data-sprache="en"]'); await warte(p, 'en'); z = await stand();
  const hinweis = await p.$eval('.recht-hinweis', e => [e.textContent, getComputedStyle(e).display]);
  ok(z.h1 === 'Legal notice' && /German version is legally binding/.test(hinweis[0]) && hinweis[1] !== 'none' && z.speicher === 'en', 'Impressum englisch, Hinweis „German version is legally binding“ sichtbar');
  await p.click('footer a[href="datenschutz.html"]'); await p.waitForLoadState('load'); z = await stand();
  const link = await p.$eval('a[href*="docs.github.com"]', e => e.href);
  ok(z.lang === 'en' && z.h1 === 'Privacy policy' && /docs\.github\.com\/en\//.test(link), 'Datenschutz englisch, GitHub-Link auf englische Fassung');
  await p.click('.kopf button[data-sprache="de"]'); await warte(p, 'de');
  const link2 = await p.$eval('a[href*="docs.github.com"]', e => e.href);
  ok(await p.evaluate(() => document.querySelector('h1').textContent) === 'Datenschutz' && /docs\.github\.com\/de\//.test(link2), 'Datenschutz deutsch, GitHub-Link auf deutsche Fassung');
  await p.click('a.zurueck'); await p.waitForLoadState('load'); await warte(p, 'de'); z = await stand();
  ok(z.lang === 'de' && /^Dein Rad\./.test(z.h1), 'zurück zur Startseite, weiter Deutsch');
  // zweiter Tab zieht mit
  const p2 = await c.newPage(); await p2.goto(U); await warte(p2, 'de'); await p.click('.kopf button[data-sprache="en"]'); await warte(p, 'en'); await p2.waitForTimeout(300);
  ok(await p2.evaluate(() => document.documentElement.lang) === 'en', 'anderer Tab wechselt mit');
  // Teilen-Meldung nach Klick in beiden Sprachen
  await c.grantPermissions(['clipboard-read', 'clipboard-write']);
  for (const sp of ['de', 'en']) { await p.click(`.kopf button[data-sprache="${sp}"]`); await warte(p, sp); await p.click('#teilen'); await p.waitForTimeout(150);
    const t = await p.$eval('#teilen span', e => e.textContent); ok(t === (sp === 'de' ? 'Link kopiert' : 'Link copied'), `Teilen-Meldung ${sp}: ${t}`); await p.waitForTimeout(2300); }
  ok(f.length === 0, 'keine Konsolenfehler oder Warnungen ' + JSON.stringify(f));
  await c.close();
  // Deutsch laesst sich nicht laden → Meldung auf Deutsch, Seite bleibt Englisch
  let c2 = await b.newContext({ locale: 'en-GB' }); let q = await c2.newPage(); await q.route('**/texte.js*', r => r.abort()); await q.goto(U, { waitUntil: 'networkidle' });
  await q.click('.kopf button[data-sprache="de"]'); await q.waitForTimeout(500);
  z = await q.evaluate(() => ({ lang: document.documentElement.lang, gedrueckt: document.querySelector('.kopf button[data-sprache="en"]').getAttribute('aria-pressed'), meldung: document.querySelector('.meldung').textContent, speicher: localStorage.getItem('cs.sprache') }));
  ok(z.lang === 'en' && z.gedrueckt === 'true' && /^Deutsch konnte gerade nicht geladen werden/.test(z.meldung) && z.speicher === null, 'Deutsch nicht ladbar → Meldung auf Deutsch, bleibt Englisch, nichts gespeichert');
  await c2.close();
  // Englischer Browser, Bot, ohne JavaScript: alle Englisch
  for (const [name, opt] of [['englischer Browser', { locale: 'en-US' }], ['Googlebot', { locale: 'en-US', userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }], ['deutscher Bot', { locale: 'de-DE', userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1)' }]]) {
    c2 = await b.newContext(opt); q = await c2.newPage(); await q.goto(U + 'datenschutz.html');
    ok(await q.evaluate(() => document.documentElement.lang + '|' + document.querySelector('h1').textContent) === 'en|Privacy policy', name + ': Englisch'); await c2.close(); }
  c2 = await b.newContext({ javaScriptEnabled: false, locale: 'de-DE' }); q = await c2.newPage();
  for (const s of ['', 'impressum.html', 'datenschutz.html']) { await q.goto(U + s); const r = await q.evaluate(() => [document.documentElement.lang, document.querySelector('h1').textContent, document.title, getComputedStyle(document.querySelector('.sprache')).display]);
    ok(r[0] === 'en' && r[1].length > 3 && r[2].length > 10 && r[3] === 'none', `ohne JavaScript ${s || 'index.html'}: Englisch „${r[1]}“, Sprachwahl versteckt`); }
  await c2.close(); await b.close(); console.log(n ? n + ' Fehler' : 'alles OK');
})();
