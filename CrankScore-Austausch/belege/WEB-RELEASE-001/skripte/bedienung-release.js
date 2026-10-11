// Bedienung der neuen Startseite (Release-Ueberarbeitung 11.10.): Menue, Tastatur, Fragen, Teilen, Design, Bilder,
// reduzierte Bewegung, Anker, Release-Schalter. node bedienung-release.js [port-release]
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const U = 'http://127.0.0.1:8766/'; let n = 0; const ok = (b, t) => { console.log((b ? 'OK     ' : 'FEHLER ') + t); if (!b) n++; };
(async () => {
  const b = await chromium.launch(); const fehler = [];
  // ── Handy: Menue ──
  let c = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  let p = await c.newPage(); p.on('pageerror', e => fehler.push(e.message)); p.on('console', m => { if (['error', 'warning'].includes(m.type())) fehler.push(m.text()); });
  await p.goto(U, { waitUntil: 'networkidle' });
  let z = await p.evaluate(() => ({ menue: getComputedStyle(document.getElementById('menue-knopf')).display, kopfKnopf: getComputedStyle(document.querySelector('.kopf .knopf')).display, nav: getComputedStyle(document.querySelector('.nav')).display }));
  ok(z.menue !== 'none' && z.kopfKnopf === 'none' && z.nav === 'none', 'Handy: Menü-Knopf sichtbar, Navigation und Kopf-Knopf im Menü ' + JSON.stringify(z));
  await p.click('#menue-knopf'); await p.waitForTimeout(300);
  z = await p.evaluate(() => ({ offen: document.getElementById('menue').open, exp: document.getElementById('menue-knopf').getAttribute('aria-expanded'), fokusIn: document.getElementById('menue').contains(document.activeElement) }));
  ok(z.offen && z.exp === 'true' && z.fokusIn, 'Menü öffnet, Fokus im Menü ' + JSON.stringify(z));
  let raus = 0; for (let i = 0; i < 20; i++) { await p.keyboard.press('Tab'); const drin = await p.evaluate(() => { const a = document.activeElement; return !a || a === document.body || document.getElementById('menue').contains(a); }); if (!drin) raus++; }
  ok(raus === 0, 'Tab bleibt im Menü (20 Schritte)');
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  z = await p.evaluate(() => ({ offen: document.getElementById('menue').open, fokus: document.activeElement.id }));
  ok(!z.offen && z.fokus === 'menue-knopf', 'Esc schließt, Fokus zurück auf den Menü-Knopf ' + JSON.stringify(z));
  await p.click('#menue-knopf'); await p.waitForTimeout(250); await p.click('.menue .segment button[data-sprache="de"]'); await p.waitForFunction(() => document.documentElement.lang === 'de');
  z = await p.evaluate(() => ({ offen: document.getElementById('menue').open, link: document.querySelector('.menue-liste a').textContent, app: document.querySelector('.menue-app').textContent }));
  ok(z.offen && z.link === 'So funktioniert’s' && z.app === 'Kommt bald', 'Sprache im Menü: bleibt offen, alles deutsch ' + JSON.stringify(z));
  await p.click('.menue .segment button[data-design-wahl="dunkel"]'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => document.documentElement.getAttribute('data-design')) === 'dunkel', 'Design im Menü: dunkel');
  await p.click('.menue-liste a[href="#preise"]'); await p.waitForTimeout(900);
  z = await p.evaluate(() => ({ offen: document.getElementById('menue').open, top: Math.round(document.getElementById('preise').getBoundingClientRect().top), kopf: document.getElementById('kopf').getBoundingClientRect().bottom }));
  ok(!z.offen && z.top >= z.kopf - 2 && z.top < z.kopf + 60, 'Menü-Link schließt und springt unter die Kopfzeile ' + JSON.stringify(z));
  // Kommt bald -> Frage q0 offen
  await p.evaluate(() => scrollTo(0, 0)); await p.click('.held .knopf[data-app]'); await p.waitForTimeout(900);
  z = await p.evaluate(() => ({ q0: document.getElementById('q0').open, hash: location.hash, sicht: document.getElementById('q0').getBoundingClientRect().top < innerHeight }));
  ok(z.q0 && z.hash === '#q0' && z.sicht, '„Kommt bald“ öffnet „Wann erscheint CrankScore?“ ' + JSON.stringify(z));
  // Bilder im dunklen Design: dunkle Aufnahme sichtbar und geladen, deutsche Fassung
  await p.evaluate(() => document.querySelector('.held-bild').scrollIntoView({ block: 'center', behavior: 'instant' })); await p.waitForTimeout(800);
  z = await p.evaluate(() => { const d = document.querySelector('.held-bild .nur-dunkel img'), h = document.querySelector('.held-bild .nur-hell img');
    return { d: d.currentSrc, dok: d.complete && d.naturalWidth > 0, hSicht: h.getClientRects().length, dSicht: d.getClientRects().length }; });
  ok(/\/de\/dunkel\//.test(z.d) && z.dok && z.hSicht === 0 && z.dSicht > 0, 'dunkles Design: dunkle deutsche App-Aufnahme geladen, helle verborgen ' + z.d.replace(U, ''));
  await c.close();

  // ── Desktop: Tastatur, Navigation, Fragen, Teilen ──
  c = await b.newContext({ viewport: { width: 1440, height: 900 } }); p = await c.newPage(); p.on('pageerror', e => fehler.push(e.message));
  await p.goto(U, { waitUntil: 'networkidle' });
  await p.keyboard.press('Tab'); z = await p.evaluate(() => ({ t: document.activeElement.textContent, sicht: document.activeElement.getBoundingClientRect().top >= 0 }));
  ok(z.t === 'Skip to content' && z.sicht, 'erster Tab: „Skip to content“ sichtbar');
  await p.keyboard.press('Enter'); await p.waitForTimeout(300); await p.keyboard.press('Tab');
  ok(await p.evaluate(() => document.getElementById('inhalt').contains(document.activeElement)), 'Sprung zum Inhalt: nächster Tab landet im Inhalt');
  // alle Tab-Stopps haben einen sichtbaren Fokusrahmen
  await p.goto(U, { waitUntil: 'networkidle' });
  let ohneRahmen = [], stopps = 0;
  for (let i = 0; i < 80; i++) { await p.keyboard.press('Tab'); const r = await p.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return null; const s = getComputedStyle(a);
      return { t: (a.textContent || a.getAttribute('aria-label') || a.tagName).trim().slice(0, 30), o: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2 }; });
    if (!r) break; stopps++; if (!r.o) ohneRahmen.push(r.t); }
  ok(stopps >= 39 && ohneRahmen.length === 0, `Tastatur: ${stopps} Tab-Stopps, alle mit Fokusrahmen ` + JSON.stringify(ohneRahmen.slice(0, 5)));
  // Frage per Tastatur oeffnen
  await p.focus('#fragen details:nth-of-type(2) summary'); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => document.querySelector('#fragen details:nth-of-type(2)').open), 'Frage öffnet per Enter');
  // aktive Navigation
  await p.evaluate(() => document.getElementById('beispiel').scrollIntoView({ behavior: 'instant' })); await p.waitForTimeout(400);
  ok(await p.evaluate(() => (document.querySelector('.nav a[aria-current]') || {}).hash) === '#beispiel', 'Navigation markiert den sichtbaren Abschnitt (aria-current)');
  // alle Anker auf der Seite fuehren zu vorhandenen Zielen
  z = await p.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href')).filter(h => h.length > 1 && !document.getElementById(h.slice(1))));
  ok(z.length === 0, 'alle Sprunglinks haben ein Ziel ' + JSON.stringify(z));
  // Teilen: Zwischenablage erlaubt -> "Link copied"; verboten -> Meldung
  await c.grantPermissions(['clipboard-read', 'clipboard-write']);
  await p.evaluate(() => { navigator.share = undefined; }); await p.click('#teilen'); await p.waitForTimeout(200);
  ok(await p.$eval('#teilen span', e => e.textContent) === 'Link copied', 'Teilen kopiert den Link');
  await p.evaluate(() => { navigator.clipboard.writeText = () => Promise.reject(new Error('nein')); }); await p.waitForTimeout(2300); await p.click('#teilen'); await p.waitForTimeout(300);
  ok(/Couldn’t copy/.test(await p.$eval('.meldung', e => e.textContent)), 'Teilen ohne Zwischenablage: Meldung erscheint');
  // Sprunglinks zu den Rechtsseiten
  for (const [sel, h1] of [['footer a[href="impressum.html"]', 'Legal notice'], ['footer a[href="datenschutz.html"]', 'Privacy policy']]) {
    await p.goto(U); await p.click(sel); await p.waitForLoadState('load'); ok(await p.$eval('h1', e => e.textContent) === h1, 'Fuß-Link führt zu ' + h1); }
  await c.close();

  // ── weniger Bewegung ──
  c = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' }); p = await c.newPage(); await p.goto(U, { waitUntil: 'networkidle' });
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } });
  z = await p.evaluate(() => ({ laufend: document.getAnimations().filter(a => a.playState === 'running').length, unsichtbar: [...document.querySelectorAll('[data-zeige]')].filter(e => getComputedStyle(e).opacity !== '1').length, glatt: getComputedStyle(document.documentElement).scrollBehavior }));
  ok(z.laufend === 0 && z.unsichtbar === 0 && z.glatt === 'auto', 'weniger Bewegung: keine laufenden Animationen, alles sofort sichtbar, kein weiches Scrollen ' + JSON.stringify(z));
  await c.close();

  // ── ohne Bewegungswunsch: Inhalte erscheinen beim Scrollen, Dauer 300 ms ──
  c = await b.newContext({ viewport: { width: 1280, height: 900 } }); p = await c.newPage(); await p.goto(U, { waitUntil: 'networkidle' });
  z = await p.evaluate(async () => { const e = document.querySelector('#ablauf [data-zeige]'); const vor = getComputedStyle(e).opacity; e.scrollIntoView({ block: 'center', behavior: 'instant' });
    await new Promise(r => setTimeout(r, 60)); const a = e.getAnimations()[0]; return { vor, dauer: a ? a.effect.getTiming().duration : 0 }; });
  ok(z.vor === '0' && z.dauer === 300, 'Erscheinen: vorher unsichtbar, Animation 300 ms ' + JSON.stringify(z));
  await c.close();

  // ── Release-Schalter (Kopie mit gesetzter appAdresse) ──
  if (process.argv[2]) {
    c = await b.newContext({ viewport: { width: 1440, height: 900 } }); p = await c.newPage(); await p.goto('http://127.0.0.1:' + process.argv[2] + '/');
    z = await p.evaluate(() => ({ knoepfe: [...document.querySelectorAll('a[data-app]')].map(a => a.textContent + '>' + a.getAttribute('href')), q0: document.getElementById('q0').hidden,
      bald: [...document.querySelectorAll('[data-vor-release]')].every(e => e.hidden), nach: [...document.querySelectorAll('[data-nach-release]')].every(e => !e.hidden && e.getClientRects().length), h2: document.getElementById('schluss-titel').innerText }));
    ok(z.knoepfe.every(k => /^Open the app>https:\/\/app\.beispiel\.invalid\/$/.test(k)) && z.q0 && z.bald && z.nach && z.h2 === 'Ready to plan your build?', 'Release: alle Knöpfe „Open the app“ mit Adresse, Vorab-Inhalte weg ' + JSON.stringify(z));
    await c.close();
  }
  ok(fehler.length === 0, 'keine Konsolenfehler ' + JSON.stringify(fehler));
  await b.close(); console.log(n ? n + ' Fehler' : 'alles OK');
})();
