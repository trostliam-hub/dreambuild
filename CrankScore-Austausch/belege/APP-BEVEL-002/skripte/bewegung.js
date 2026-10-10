/* Bewegung und Tastatur (BEVEL-002): node bewegung.js <port> */
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
(async () => { const b = await chromium.launch(); let fehl = 0; const ok = (n, x, i) => { console.log((x ? '  ok   ' : '  FEHL ') + n + (x ? '' : '  ' + JSON.stringify(i))); if(!x) fehl++; };
  for(const rm of ['no-preference', 'reduce']){
    const ctx = await b.newContext({viewport:{width:390, height:844}, reducedMotion:rm}); const p = await ctx.newPage(); const f = []; p.on('pageerror', e => f.push(e.message));
    await p.goto(`http://127.0.0.1:${process.argv[2]}/index.html`);
    await p.evaluate(() => { localStorage.clear(); localStorage.setItem('mtb.einstieg2', '1'); localStorage.setItem('mtb.tour', '1'); localStorage.setItem('mtb.szenen', '1'); localStorage.setItem('mtb.sprache', 'de'); });
    await p.reload(); await p.waitForFunction(() => typeof zeichne === 'function' && !!document.querySelector('#aufbau .grp'));
    const r = await p.evaluate(async () => { const w = ms => new Promise(x => setTimeout(x, ms)); const an = el => el ? getComputedStyle(el).animationName : 'fehlt';
      pruefOffen = false; zeichne(); pruefUmschalten(true); const pruef = an($('pf-inhalt'));
      oeffneSlot('bremsen', {ziel:'leicht'}); await w(50); const k = document.querySelector('#modal [data-merken]'); k.click(); const merk = an(k);
      const sheet = an(document.querySelector('#modal .sheet')); schliesse(); await w(300);
      oeffneSzenen(null); await w(30); const sz = an($('szenen')), szi = an(document.querySelector('.sz-inhalt')), ring = (szeneZeigen(1), an(document.querySelector('.sz-wert'))); szenenEnde(); await w(300);
      uebernehmen('griffe', katalog('griffe')[1].id, 'test'); await w(30); const frisch = an(document.querySelector('#aufbau .slot.frisch'));
      return {pruef, merk, sheet, sz, szi, ring, frisch}; });
    if(rm === 'reduce') ok('reduzierte Bewegung: keine Ein- und Ausflüge (Prüfung, Merken, Szenen, Ring)', ['pruef', 'merk', 'sz', 'szi', 'ring'].every(x => r[x] === 'none'), r);
    else ok('normale Bewegung: Prüfung klappt weich auf, Merken pulst, Szenen gleiten, Ring zählt', r.pruef === 'pf-auf' && r.merk === 'merk-puls' && r.sz === 'sz-auf' && r.szi === 'sz-rein' && r.ring === 'sz-ring', r);
    ok(rm + ': Teiletausch hebt das neue Teil hervor', r.frisch !== 'fehlt', r);
    /* Tastatur: Teil-Zeile -> Enter oeffnet Blatt -> Escape schliesst, Fokus zurueck */
    await p.evaluate(() => { schliesse(); window.scrollTo(0, 0); });
    await p.focus('#aufbau [data-slot="bremsen"]'); await p.keyboard.press('Enter'); await p.waitForTimeout(350);
    const offen = await p.evaluate(() => !!document.querySelector('#modal .sheet') && document.querySelector('#modal .sheet').contains(document.activeElement));
    await p.keyboard.press('Escape'); await p.waitForTimeout(400);
    const zurueck = await p.evaluate(() => !document.querySelector('#modal .sheet') && document.activeElement && document.activeElement.dataset.slot === 'bremsen');
    ok(rm + ': Enter öffnet das Teileblatt mit Fokus darin, Escape schließt, Fokus kehrt zur Zeile zurück', offen && zurueck, {offen, zurueck});
    const ring = await p.evaluate(() => { const e = document.querySelector('#aufbau [data-slot="bremsen"]'); e.focus(); const s = getComputedStyle(e); return s.outlineStyle !== 'none' || s.boxShadow !== 'none'; });
    ok(rm + ': sichtbarer Fokusrahmen an der Teilezeile', ring);
    ok(rm + ': keine Seitenfehler', !f.length, f);
    await ctx.close();
  }
  console.log(`\nBEWEGUNG: ${fehl ? fehl + ' Fehler' : 'alles bestanden'}`); await b.close(); })();
