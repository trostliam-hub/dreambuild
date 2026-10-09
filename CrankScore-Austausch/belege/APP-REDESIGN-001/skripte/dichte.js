/* Erster Bildschirm: node dichte.js <port> -- wo beginnt das Wichtige, wie viel ist ohne Scrollen sichtbar (Handy 390x844, Desktop 1280x860) */
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const [,, port] = process.argv;
(async () => { const b = await chromium.launch(); const erg = {};
  for(const [g, vp] of [['handy', {width:390, height:844}], ['desktop', {width:1280, height:860}]]){
    const p = await (await b.newContext({viewport:vp, isMobile:g === 'handy', hasTouch:g === 'handy', reducedMotion:'reduce'})).newPage();
    await p.goto(`http://127.0.0.1:${port}/index.html`);
    await p.evaluate(() => { localStorage.clear(); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); localStorage.setItem('mtb.sprache', 'de'); });
    await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp')); await p.waitForTimeout(700);
    const sicht = sel => p.evaluate(sel => { const unten = (() => { const t = document.querySelector('.tabs'); return t && getComputedStyle(t).position === 'fixed' ? t.getBoundingClientRect().top : innerHeight; })();
      const els = [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().height);
      const erst = els[0] ? Math.round(els[0].getBoundingClientRect().top) : null;
      return {erst, sichtbar:els.filter(e => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= unten; }).length}; }, sel);
    const r = {};
    r.scoreRing = await sicht('.rg-gesamt');
    r.erstesTeil = await sicht('#aufbau .slot');
    await p.evaluate(() => oeffneSlot('gabel')); await p.waitForTimeout(600);
    r.teilewahl = await p.evaluate(() => { const sh = document.querySelector('#modal .sheet').getBoundingClientRect(); const els = [...document.querySelectorAll('#modal .opt')];
      return {erst:els[0] ? Math.round(els[0].getBoundingClientRect().top) : null, sichtbar:els.filter(e => { const q = e.getBoundingClientRect(); return q.top >= sh.top && q.bottom <= Math.min(sh.bottom, innerHeight); }).length}; });
    await p.evaluate(() => schliesse()); await p.waitForTimeout(300);
    await p.evaluate(() => { view = 'upgrades'; zeichne(); vorschlaegeZeichnen && vorschlaegeZeichnen(); window.scrollTo(0, 0); }); await p.waitForTimeout(400);
    r.upgrades = await sicht('#upgrades .up');
    await p.evaluate(() => { pro = {key:'x', inst:'i', status:'aktiv', geprueft:Date.now()}; plan.fahrer = 80; view = 'setup'; zeichne(); window.scrollTo(0, 0); }); await p.waitForTimeout(400);
    r.fahrwerkWert = await sicht('#setup .fw-k, #setup .su-wert');
    erg[g] = r; console.log(g, JSON.stringify(r));
  }
  await b.close(); })();
