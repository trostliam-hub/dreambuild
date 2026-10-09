/* Randfaelle und Tastatur: node rand.js <port> <ausordner>
   Leerzustand, lange Namen, fehlende Angaben, Fehler (Guide ohne Netz), Laden (Assistent),
   Tastatur (Fokus sichtbar, Blatt per Enter auf, Escape zu, Fokus zurueck), je DE/EN, 320 und 1280 px. */
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs = require('fs'); const [,, port, out] = process.argv; fs.mkdirSync(out, {recursive:true});
let fehl = 0; const ok = (n, b, x) => { console.log(`${b ? 'OK  ' : 'FEHL'} ${n}${x ? ' — ' + x : ''}`); if(!b) fehl++; };
const LANG_RAD = 'Specialized Stumpjumper EVO Expert Carbon Mullet Custom 2026';
const LANG_TEIL = 'RockShox ZEB Ultimate Charger 3.1 RC2 Custom Tuned 190 mm';
(async () => { const b = await chromium.launch();
  for(const [breite, hoehe] of [[320, 700], [1280, 860]]) for(const spr of ['de', 'en']){
    const tag = `${breite} ${spr}`;
    const ctx = await b.newContext({viewport:{width:breite, height:hoehe}, deviceScaleFactor:1, isMobile:breite < 800, hasTouch:breite < 800, reducedMotion:'reduce'});
    await ctx.route('**/*', r => r.request().url().startsWith('http://127.0.0.1') ? r.continue() : r.abort());
    const p = await ctx.newPage(); const konsole = []; p.on('pageerror', e => konsole.push(e.message));
    await p.goto(`http://127.0.0.1:${port}/index.html`);
    await p.evaluate(s => { localStorage.clear(); localStorage.setItem('mtb.sprache', s); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); localStorage.setItem('mtb.design', 'hell'); }, spr);
    await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp'));
    const kaputt = () => p.evaluate(() => { const t = document.body.innerText; const m = t.match(/\b(NaN|undefined|null|\[object Object\])\b/); return m ? t.slice(Math.max(0, m.index - 40), m.index + 30).replace(/\s+/g, ' ') : ''; });
    const ueber = () => p.evaluate(() => { const aus = []; const rollt = el => { for(let q = el.parentElement; q && q !== document.body; q = q.parentElement){ if(/(auto|scroll|hidden|clip)/.test(getComputedStyle(q).overflowX)) return true; } return false; };
      document.querySelectorAll('body *').forEach(e => { if(e instanceof SVGElement || !e.getClientRects().length) return; const s = getComputedStyle(e); if(s.visibility === 'hidden' || s.display === 'none') return;
        if(e.closest('[aria-hidden="true"], [hidden]')) return; const r = e.getBoundingClientRect(); if(r.width < 2) return;
        if(Math.max(r.right - innerWidth, -r.left) > 1 && !rollt(e)) aus.push((e.className || e.tagName) + ': ' + (e.innerText || '').slice(0, 30)); }); return aus.slice(0, 4); });

    /* 1 Leerzustand: Mein Rad ohne Teile */
    const leer = await p.evaluate(() => { wechsle('real'); view = 'aufbau'; zeichne();
      return {l:document.querySelector('.rg-gesamt > .rg-l').textContent, v:document.getElementById('score').textContent.trim(), leer:document.querySelector('.bar-in').classList.contains('leer'),
        naechst:!!document.querySelector('#coach-platz .leit-cta, #coach-platz .btn')}; });
    ok(`${tag} Leerzustand: Ring sagt es klar und zeigt den naechsten Schritt`, /Noch kein Score|No score yet/.test(leer.l) && leer.leer && leer.naechst, JSON.stringify(leer));
    for(const v of ['aufbau', 'befunde', 'upgrades', 'deals']){ await p.evaluate(x => { view = x; zeichne(); }, v); await p.waitForTimeout(150);
      const k = await kaputt(); ok(`${tag} Leerzustand ${v}: kein NaN/undefined`, !k, k); }
    if(breite === 320) await p.screenshot({path:`${out}/${breite}-${spr}-leer.png`});

    /* 2 Lange Namen: Rad und eigenes Teil (je am Eingabelimit) */
    await p.evaluate(() => { wechsle('traum'); view = 'aufbau'; zeichne(); });
    await p.evaluate(n => { aktivesProfil().name = n; sichern(); zeichne(); }, LANG_RAD.slice(0, 60));
    await p.evaluate(() => oeffneEigen('gabel')); await p.waitForTimeout(300);
    await p.fill('#eg-n', LANG_TEIL); await p.fill('#eg-p', '1234'); await p.fill('#eg-g', '');
    await p.click('[data-eigenspeichern]'); await p.waitForTimeout(400);
    const eingebaut = await p.evaluate(() => { const t = findeTeil('gabel', build.gabel); return t ? t.n : ''; });
    ok(`${tag} Eigenes Teil mit langem Namen eingebaut`, eingebaut.length >= 50, eingebaut);
    for(const [n, f] of [['aufbau', () => { view = 'aufbau'; zeichne(); }], ['einkauf', () => { view = 'deals'; zeichne(); }], ['pruefung', () => { view = 'befunde'; zeichne(); }],
      ['teilewahl', () => oeffneSlot('gabel')], ['detail', () => oeffneDetail('gabel', build.gabel, true)], ['radwahl', () => oeffneRadwahl()], ['profile', () => oeffneProfile()]]){
      await p.evaluate(() => { try{ schliesse(); }catch(e){} }); await p.waitForTimeout(120);
      await p.evaluate(f); await p.waitForTimeout(350);
      const u = await ueber(), k = await kaputt();
      ok(`${tag} Lange Namen ${n}: nichts steht ueber, kein NaN`, !u.length && !k, (u.join(' | ') + ' ' + k).trim());
      if(breite === 320 && ['aufbau', 'detail', 'radwahl'].includes(n)) await p.screenshot({path:`${out}/${breite}-${spr}-lang-${n}.png`});
    }
    await p.evaluate(() => { try{ schliesse(); }catch(e){} });
    /* Chip des Rads kuerzt mit Auslassung statt umzubrechen */
    const chip = await p.evaluate(() => { const c = [...document.querySelectorAll('#profile button')].find(x => x.offsetParent && /Stumpjumper EVO/.test(x.textContent)); if(!c) return null;
      const s = getComputedStyle(c.querySelector('span') || c); return {w:Math.round(c.getBoundingClientRect().width), h:Math.round(c.getBoundingClientRect().height), max:innerWidth}; });
    ok(`${tag} Rad-Chip mit langem Namen bleibt einzeilig und im Bild`, chip && chip.h <= 48 && chip.w <= chip.max, JSON.stringify(chip));

    /* 3 Fehlende Angaben: Teil ohne Gewicht -> kein "0 g" als Messwert, kein NaN */
    const ohneG = await p.evaluate(() => { view = 'deals'; zeichne(); const z = [...document.querySelectorAll('#panel *, #deals *')].find(e => e.children.length === 0 && /ZEB Ultimate Charger/.test(e.textContent));
      const zeile = z ? z.closest('.ek-r, .ek-z, li, .row, div') : null; return zeile ? zeile.innerText.replace(/\s+/g, ' ') : ''; });
    ok(`${tag} Teil ohne Gewicht: Einkaufszeile ohne NaN`, ohneG && !/NaN|undefined/.test(ohneG), ohneG.slice(0, 90));
    const gew = await p.evaluate(() => { view = 'aufbau'; zeichne(); return [...document.querySelectorAll('.kz-z')].map(e => e.innerText.replace(/\s+/g, ' ')).join(' | '); });
    ok(`${tag} Gewicht mit fehlender Angabe: ehrlich gekennzeichnet`, !/NaN/.test(gew), gew);

    /* 4 Fehler: Guide ohne Netz -> verstaendliche Meldung, Eingabe bleibt nutzbar */
    await p.evaluate(() => oeffneGuide()); await p.waitForTimeout(300);
    await p.fill('#g-in', spr === 'de' ? 'Welche Gabel passt zu meinem Rahmen?' : 'Which fork fits my frame?'); await p.press('#g-in', 'Enter');
    await p.waitForTimeout(3500);
    const gd = await p.evaluate(() => { const b = [...document.querySelectorAll('#modal .g-msg, #modal [class*="g-b"], #modal .sheet-b > div, #modal .sheet-b p')].map(e => e.innerText).filter(Boolean);
      return {letzte:(b[b.length - 1] || '').replace(/\s+/g, ' ').slice(0, 140), eingabe:!!document.getElementById('g-in') && !document.getElementById('g-in').disabled}; });
    ok(`${tag} Guide ohne Netz: Antwort statt Absturz, Eingabe frei`, gd.letzte.length > 10 && gd.eingabe && !konsole.length, JSON.stringify(gd));
    await p.evaluate(() => schliesse());

    /* 5 Laden: Assistent zeigt beim Rechnen einen klaren Zwischenstand */
    const lade = await p.evaluate(async () => { plan.budget = 4000; sichern(); wizErgebnis = null; oeffneWiz(4); const h = document.querySelector('#modal .sheet-h h3').innerText;
      await new Promise(r => setTimeout(r, 3000)); const h2 = document.querySelector('#modal .sheet-h h3').innerText; schliesse(); return {erst:h.replace(/\s+/g, ' '), dann:h2.replace(/\s+/g, ' ')}; });
    ok(`${tag} Laden: erst "Rechne", dann Ergebnis`, /Rechne|Working out/.test(lade.erst) && !/Rechne|Working out/.test(lade.dann), JSON.stringify(lade));

    /* 6 Tastatur (nur Desktop): sichtbarer Fokus, Blatt auf/zu, Fokus zurueck */
    if(breite > 800){
      await p.evaluate(() => { view = 'aufbau'; zeichne(); window.scrollTo(0, 0); document.activeElement && document.activeElement.blur(); });
      let ohne = [], n = 0;
      for(let i = 0; i < 45; i++){ await p.keyboard.press('Tab'); await p.waitForTimeout(25);
        const f = await p.evaluate(() => { const e = document.activeElement; if(!e || e === document.body) return null; const s = getComputedStyle(e);
          const sicht = (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || (s.boxShadow && s.boxShadow !== 'none');
          return {sicht, n:(e.getAttribute('aria-label') || e.innerText || e.tagName).replace(/\s+/g, ' ').slice(0, 30)}; });
        if(f){ n++; if(!f.sicht) ohne.push(f.n); } }
      ok(`${tag} Tastatur: jeder fokussierte Knopf hat einen sichtbaren Fokusrahmen (${n} geprueft)`, !ohne.length, ohne.slice(0, 6).join(' | '));
      await p.evaluate(() => document.querySelector('#aufbau [data-slot="gabel"]').focus());
      await p.keyboard.press('Enter'); await p.waitForTimeout(500);
      const auf = await p.evaluate(() => ({offen:!!document.querySelector('#modal .sheet'), fokusDrin:!!document.activeElement.closest('#modal')}));
      ok(`${tag} Tastatur: Enter am Teil oeffnet das Blatt, Fokus im Blatt`, auf.offen && auf.fokusDrin, JSON.stringify(auf));
      const sum = await p.evaluate(() => { const s = document.querySelector('#modal details.was-das > summary'); if(!s) return 'fehlt'; s.focus(); return 'ok'; });
      if(sum === 'ok'){ await p.keyboard.press('Enter'); await p.waitForTimeout(150); }
      const offenD = await p.evaluate(() => { const d = document.querySelector('#modal details.was-das'); return d ? d.open : null; });
      ok(`${tag} Tastatur: "Was ist das?" klappt per Enter auf`, offenD === true, String(offenD));
      await p.keyboard.press('Escape'); await p.waitForTimeout(500);
      const zu = await p.evaluate(() => ({zu:!document.querySelector('#modal .sheet'), zurueck:document.activeElement && document.activeElement.getAttribute('data-slot')}));
      ok(`${tag} Tastatur: Escape schliesst, Fokus zurueck am Teil`, zu.zu && zu.zurueck === 'gabel', JSON.stringify(zu));
    }
    ok(`${tag} Keine Fehler in der Konsole`, !konsole.length, konsole.slice(0, 3).join(' | '));
    await ctx.close(); }
  await b.close(); console.log(fehl ? `RAND: ${fehl} Fehler` : 'RAND: alles OK'); process.exit(fehl ? 1 : 0); })();
