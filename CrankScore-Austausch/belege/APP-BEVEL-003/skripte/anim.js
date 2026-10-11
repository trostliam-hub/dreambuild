/* Animationsnachweis (BEVEL-003 §8): node anim.js <port> <ordner> <0|1 reduziert>
   Je Fall: laufende Animationen (Name, Dauer) direkt nach dem Ausloesen, ein Messwert ueber die Zeit
   und eine Bildfolge. Bei reduzierter Bewegung muss es keine Zwischenzustaende geben. */
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const [,, port, ordner, ruhig] = process.argv;
const T = [0, 40, 80, 120, 160, 220, 300, 420];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({viewport:{width:390, height:844}, deviceScaleFactor:1, reducedMotion:ruhig === '1' ? 'reduce' : 'no-preference', hasTouch:true});
  const p = await ctx.newPage(); const fehler = []; p.on('pageerror', e => fehler.push(e.message));
  await p.goto(`http://127.0.0.1:${port}/index.html`);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('mtb.einstieg2','1'); localStorage.setItem('mtb.tour','1'); localStorage.setItem('mtb.szenen','1'); localStorage.setItem('mtb.sprache','de'); localStorage.setItem('mtb.design','oled'); });
  await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp'));
  await p.evaluate(() => { wechsle('real'); build.rahmen = 'f-stumpy'; build.gabel = 'g-pike'; build.bremsen = 'b-xt'; sichern(); pruefOffen = false; zeichne(); });
  const anims = () => p.evaluate(() => document.getAnimations().filter(a => a.playState === 'running' || a.playState === 'pending').map(a => {
    const t = a.effect && a.effect.getTiming ? a.effect.getTiming() : {}; const tg = a.effect && a.effect.target;
    return {name:a.animationName || a.transitionProperty || a.constructor.name, dauer:t.duration, verz:t.delay, ziel:(tg && (tg.className && tg.className.baseVal != null ? tg.className.baseVal : tg.className || tg.tagName)) + (a.effect.pseudoElement || '')}; }));
  const fall = async (name, vorbereiten, ausloesen, messen, clip) => {
    await p.evaluate(vorbereiten); await p.waitForTimeout(500);
    const t0 = Date.now(); await p.evaluate(ausloesen);
    const laufend = await anims(); const werte = [];
    for(const t of T){ const w = t - (Date.now() - t0); if(w > 0) await p.waitForTimeout(w);
      werte.push({t:Date.now() - t0, w:await p.evaluate(messen)});
      try{ await p.screenshot({path:`${ordner}/${ruhig === '1' ? 'ruhig' : 'bew'}-${name}-${String(t).padStart(3, '0')}.png`, clip:clip || {x:0, y:0, width:390, height:844}}); }catch(e){} }
    return {name, laufend:laufend.slice(0, 8), werte};
  };
  const out = [];
  out.push(await fall('theme', () => {}, () => setzeDesign(true), () => getComputedStyle(document.body).backgroundColor + ' vt:' + (!!designVT), {x:0, y:0, width:390, height:420}));
  out.push(await fall('dialog', () => { schliesse(); }, () => oeffneSlot('bremsen', {tab:'finden'}), () => { const s = document.querySelector('#modal .sheet'), sc = document.querySelector('#modal .scrim');
    return s ? getComputedStyle(s).transform + ' scrim:' + getComputedStyle(sc).opacity : 'zu'; }));
  out.push(await fall('teilewechsel', () => {}, () => document.querySelector('#fi [data-fiziel="sparen"]').click(), () => { const x = document.querySelector('#fi .fi-schritt'); return x ? getComputedStyle(x).opacity + ' ' + getComputedStyle(x).transform : '-'; }));
  out.push(await fall('ergebnisse', () => {}, () => { document.querySelector('#fi .fi-weiter .btn').click(); document.querySelector('#fi .fi-weiter .btn').click(); },
    () => [...document.querySelectorAll('#fi .fk3')].slice(0, 3).map(k => (+getComputedStyle(k).opacity).toFixed(2)).join('/')));
  out.push(await fall('merken', () => {}, () => document.querySelector('#fi .fk3 [data-merken]').click(), () => { const k = document.querySelector('#fi .fk3 [data-merken]'); return getComputedStyle(k).transform; }));
  out.push(await fall('pruefung', () => { schliesse(); view = 'aufbau'; zeichne(); pruefUmschalten(false); document.getElementById('pruef').scrollIntoView({block:'start'}); window.scrollBy(0, -80); },
    () => pruefUmschalten(true), () => { const i = document.getElementById('pf-inhalt'); return i ? getComputedStyle(i).opacity + ' ' + getComputedStyle(i).transform + ' h' + Math.round(i.getBoundingClientRect().height) : '-'; }));
  require('fs').writeFileSync(`${ordner}/${ruhig === '1' ? 'ruhig' : 'bew'}.json`, JSON.stringify({out, fehler}, null, 1));
  console.log(JSON.stringify(out.map(o => ({name:o.name, n:o.laufend.length, laufend:o.laufend.map(a => a.name + ':' + a.dauer + (a.verz ? '+' + a.verz : '')).slice(0, 4), erst:o.werte[0].w, mitte:o.werte[3].w, ende:o.werte[7].w})), null, 0), fehler);
  await b.close();
})();
