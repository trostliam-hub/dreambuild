/* Echte Benutzerwege der schwarzen Produktbildansicht: kein Teiletausch
   beim Antippen, Auswahlposition bleibt erhalten, Bedienung per Tastatur,
   Originalfarben und vorhandene Nutzerdaten bleiben erhalten. */
import http from 'http';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {chromium} from 'playwright';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mime = {'.html':'text/html','.js':'text/javascript','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.woff2':'font/woff2','.json':'application/json'};
const server = http.createServer((q, a) => {
  const p = path.resolve(root, '.' + decodeURIComponent(q.url.split('?')[0] === '/' ? '/index.html' : q.url.split('?')[0]));
  if(!p.startsWith(root + '/') || !fs.existsSync(p) || fs.statSync(p).isDirectory()){ a.writeHead(404); a.end(); return; }
  a.writeHead(200, {'Content-Type':mime[path.extname(p)] || 'application/octet-stream'}); fs.createReadStream(p).pipe(a);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch(), ctx = await browser.newContext({viewport:{width:390,height:844}});
const base = `http://127.0.0.1:${server.address().port}`;
await ctx.route('**/*', r => r.request().url().startsWith(base) ? r.continue() : r.abort());
const page = await ctx.newPage(), fehler = [], result = [];
page.on('pageerror', e => fehler.push(e.message));
const test = async (n, f) => { try{ await f(); result.push({name:n,ok:true}); console.log('OK   ' + n); }
  catch(e){ result.push({name:n,ok:false,fehler:e.message}); console.log('FEHL ' + n + '\n      ' + e.message); } };
const check = (v, msg) => { if(!v) throw new Error(msg); };
await page.goto(base);
await page.evaluate(() => {
  localStorage.clear(); ['einstieg2','tour','szenen'].forEach(k => localStorage.setItem('mtb.' + k, '1'));
  localStorage.setItem('mtb.sprache', 'de');
});
await page.reload();
await page.waitForFunction(() => typeof oeffneSlot === 'function' && !!document.querySelector('#aufbau .grp'));
await page.evaluate(() => { build.rahmen = 'f-spindrift'; build.gabel = 'g-domain'; sichern(); zeichne(); oeffneSlot('gabel', {tab:'alle'}); });
await page.waitForSelector('#opt-liste .opt');

await test('Die drei Gabeln aus dem Screenshot haben anklickbare echte Modellfotos', async () => {
  const r = await page.evaluate(() => ['g-selvav','g-durolux','g-domain'].map(id => {
    const t = K.gabel.find(t => t.id === id), b = produktBildInfo(t);
    return !!b && /^https:\/\//.test(b.quelle) && !!document.querySelector('#opt-liste [data-produktfoto="' + b.src + '"]');
  })); check(r.every(Boolean), JSON.stringify(r));
});
const foto = page.locator('#opt-liste [data-produktfoto="bilder/produkte/g-durolux.jpg"]').first();
let vorher;
await test('Foto öffnen erhält Rad, gespeicherte Daten, Filter und Listenposition', async () => {
  await foto.scrollIntoViewIfNeeded();
  vorher = await page.evaluate(() => ({bau:JSON.stringify(build),speicher:JSON.stringify({...localStorage}),y:document.querySelector('#modal .sheet-b').scrollTop,filter:[suchText,markeWahl,filterAlle,sortWahl].join('|')}));
  await foto.click(); await page.waitForSelector('#produktbild-dialog[open]');
  const r = await page.evaluate(() => ({bau:JSON.stringify(build),speicher:JSON.stringify({...localStorage}),y:document.querySelector('#modal .sheet-b').scrollTop,filter:[suchText,markeWahl,filterAlle,sortWahl].join('|')}));
  check(JSON.stringify(r) === JSON.stringify(vorher), 'Teileauswahl oder Daten verändert: ' + JSON.stringify(r));
});
await test('Schwarze Großansicht zeigt das Foto vollständig und setzt Studiohintergrund auf Schwarz', async () => {
  await page.waitForFunction(() => { const i = document.querySelector('.pb-flaeche img'); return i?.naturalWidth > 0 && i.dataset.photoBackground && !i.classList.contains('pb-photo-pending'); });
  const r = await page.evaluate(() => {
    const d = document.querySelector('#produktbild-dialog'), i = d.querySelector('img'), m = d.querySelector('.pb-medien');
    const c = document.createElement('canvas'); c.width = i.naturalWidth; c.height = i.naturalHeight; const x = c.getContext('2d'); x.drawImage(i,0,0);
    return {bg:getComputedStyle(d).backgroundColor,art:i.dataset.photoBackground,alpha:x.getImageData(0,0,1,1).data[3],passt:i.clientHeight <= m.clientHeight && i.clientWidth <= m.clientWidth,masse:[i.clientWidth,i.clientHeight,m.clientWidth,m.clientHeight],flaeche:getComputedStyle(i.parentElement).height};
  }); check(r.bg === 'rgb(0, 0, 0)' && r.art === 'schwarz' && r.alpha === 0 && r.passt, JSON.stringify(r));
});
await test('Vergrößern und Einpassen lassen Auswahl und Bildquelle erhalten', async () => {
  await page.locator('[data-pb-zoom]').click(); check(await page.locator('.pb-medien').evaluate(e => e.scrollWidth > e.clientWidth && e.classList.contains('pb-zoom')), 'Keine vergrößerte Ansicht');
  await page.locator('[data-pb-zoom]').click(); check(await page.locator('.pb-medien').evaluate(e => !e.classList.contains('pb-zoom')), 'Einpassen fehlgeschlagen');
  check(/^https:\/\//.test(await page.locator('.pb-quelle').getAttribute('href')), 'Bildquelle fehlt');
});
await test('Schwarze Darstellung erhält die echten Farben der Produktpixel', async () => {
  const r = await page.evaluate(async () => {
    const i = document.querySelector('.pb-flaeche img'), b = await createImageBitmap(await (await fetch('bilder/produkte/g-durolux.jpg')).blob());
    const c = document.createElement('canvas'); c.width = i.naturalWidth; c.height = i.naturalHeight; const x = c.getContext('2d');
    x.drawImage(b,0,0,c.width,c.height); const roh = x.getImageData(0,0,c.width,c.height).data;
    x.clearRect(0,0,c.width,c.height); x.drawImage(i,0,0); const neu = x.getImageData(0,0,c.width,c.height).data; b.close();
    let farbe = 0, anders = 0; for(let p = 0; p < neu.length; p += 4) if(neu[p+3] === 255){ farbe++; if([0,1,2].some(k => neu[p+k] !== roh[p+k])) anders++; }
    return {farbe,anders};
  }); check(r.farbe > 500 && r.anders === 0, JSON.stringify(r));
});
await test('Tab bleibt in der Bildansicht; Escape schließt nur das Foto', async () => {
  await page.locator('[data-pb-close]').focus(); await page.keyboard.press('Shift+Tab');
  check(await page.locator('.pb-quelle').evaluate(e => document.activeElement === e), 'Fokus verlässt Dialog');
  await page.keyboard.press('Tab'); check(await page.locator('[data-pb-close]').evaluate(e => document.activeElement === e), 'Tab-Schleife fehlt');
  await page.keyboard.press('Escape');
  check(await page.locator('#produktbild-dialog').evaluate(e => !e.open), 'Foto blieb offen');
  const r = await page.evaluate(() => ({slot:offenerSlot,y:document.querySelector('#modal .sheet-b')?.scrollTop,bau:JSON.stringify(build),speicher:JSON.stringify({...localStorage})}));
  check(r.slot === 'gabel' && r.y === vorher.y && r.bau === vorher.bau && r.speicher === vorher.speicher, JSON.stringify(r));
});
await test('Hellmodus behält schwarze Fotos und schwarze Großansicht', async () => {
  await page.evaluate(() => setzeDesign(true)); await foto.click();
  const r = await page.evaluate(() => ({theme:document.documentElement.dataset.theme,bg:getComputedStyle(document.querySelector('.pb-dialog')).backgroundColor,klein:getComputedStyle(document.querySelector('#opt-liste .teilfoto')).backgroundColor}));
  check(r.theme === 'light' && r.bg === 'rgb(0, 0, 0)' && r.klein === 'rgb(0, 0, 0)', JSON.stringify(r));
  await page.locator('[data-pb-close]').click(); await page.evaluate(() => setzeDesign(false));
});
await test('Fotos im Aufbau sind getrennt von der Teileauswahl per Tastatur erreichbar', async () => {
  await page.evaluate(() => { schliesse(); zeichne(); }); await page.waitForTimeout(350);
  const p = page.locator('.slot-bildzeile [data-produktfoto="bilder/produkte/g-domain.png"]').first();
  check(await p.count() === 1 && await p.evaluate(e => !e.closest('.slot') && e.tagName === 'BUTTON'), 'Verschachtelter Teilebutton');
  await p.focus(); await page.keyboard.press('Enter'); await page.waitForSelector('#produktbild-dialog[open]');
  check(await page.locator('#pb-titel').textContent().then(t => t.includes('Domain')), 'Falsches Bild');
  await page.locator('[data-pb-close]').click();
  check(await p.evaluate(e => document.activeElement === e), 'Fokus nicht zurückgegeben');
});
await test('Englische Bildansicht ist übersetzt und eigene Teile bekommen kein fremdes Modellfoto', async () => {
  await page.evaluate(() => { sprache = 'en'; });
  await page.locator('.slot-bildzeile [data-produktfoto="bilder/produkte/g-domain.png"]').first().click();
  check(await page.locator('[data-pb-zoom]').textContent() === 'Zoom in', 'Englischer Zoomtext fehlt');
  check(await page.evaluate(() => !produktBildInfo({...K.gabel.find(t => t.id === 'g-domain'),eigen:true}) && !teilFoto({id:'g-user',n:'My fork',eigen:true})), 'Fremdes Foto für eigenes Teil');
  await page.locator('[data-pb-close]').click();
});
await test('Echte Fahrwerk-Nahaufnahme behält Markierungen und bekommt einen schwarzen Fotohintergrund', async () => {
  await page.evaluate(() => {
    const box = document.createElement('div'); box.id = 'foto-test-nah';
    box.innerHTML = suNahFotos('daempfer',{t:{n:'Fox DHX Coil',m:'Fox'},coil:true},{zeig:['zug']}); document.body.append(box);
  });
  await page.waitForFunction(() => document.querySelector('#foto-test-nah svg image')?.dataset.photoBackground === 'schwarz');
  check(await page.locator('#foto-test-nah svg').evaluate(e => e.querySelectorAll('circle').length === 2 && e.getAttribute('viewBox') === '155 160 300 325'), 'Markierung oder Ausschnitt verändert');
  await page.locator('#foto-test-nah a.fw-nah-link').click();
  await page.waitForSelector('#produktbild-dialog[open]'); check((await page.locator('#pb-titel').textContent()).includes('DHX'), 'Nahaufnahme nicht geöffnet');
  await page.locator('[data-pb-close]').click(); await page.evaluate(() => document.querySelector('#foto-test-nah').remove());
});
await test('Nicht verfügbares Foto lässt sich ohne Datenänderung schließen', async () => {
  const vor = await page.evaluate(() => JSON.stringify(build));
  await page.evaluate(() => { const a = document.createElement('button'); a.id='foto-test-fehler'; a.dataset.produktfoto='bilder/produkte/nicht-vorhanden.png'; document.body.append(a); a.click(); });
  await page.waitForSelector('.pb-fehler:not([hidden])');
  check(await page.locator('.pb-fehler').textContent().then(s => s.includes('unavailable')), 'Keine verständliche Fehlermeldung');
  await page.locator('[data-pb-close]').click(); check(await page.evaluate(() => JSON.stringify(build)) === vor, 'Rad nach Fehler verändert');
  await page.evaluate(() => document.querySelector('#foto-test-fehler').remove());
});
await test('Teileliste → Ansehen → großes Detailfoto bleibt sichtbar und tatsächlich anklickbar', async () => {
  await page.evaluate(() => { sprache = 'de'; oeffneSlot('gabel',{tab:'alle'}); });
  await page.locator('#opt-liste [data-detail^="gabel|g-domain"]').first().click();
  const foto = page.locator('#modal .teilfoto-gross [data-produktfoto]').first();
  await foto.scrollIntoViewIfNeeded();
  const r = await foto.evaluate(a => ({bild:a.clientHeight,figur:a.closest('figure').clientHeight}));
  check(r.figur >= r.bild && r.bild > 100, JSON.stringify(r));
  await foto.click(); await page.waitForSelector('#produktbild-dialog[open]');
  check((await page.locator('#pb-titel').textContent()).includes('Domain'), 'Falsches Detailfoto');
  await page.locator('[data-pb-close]').click(); check(await page.locator('#modal .teilfoto-gross').count() === 1, 'Detail nach Foto verschwunden');
});
await test('Ein Produkt am Bildrand lässt keinen weißen Hintergrund in der Großansicht stehen', async () => {
  await page.evaluate(() => {
    const t = K.kette.find(t => t.id === 'ke-kmcx12'), box = document.createElement('div'); box.id='foto-test-rand';
    box.innerHTML = teilFoto(t); document.body.append(box); box.querySelector('button').click();
  });
  await page.waitForFunction(() => { const i=document.querySelector('.pb-flaeche img');return i?.dataset.photoBackground === 'schwarz' && !i.classList.contains('pb-photo-pending'); });
  const r = await page.evaluate(() => {
    const i=document.querySelector('.pb-flaeche img'),c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;
    const x=c.getContext('2d');x.drawImage(i,0,0);const p=x.getImageData(0,0,c.width,c.height).data;let frei=0,sichtbar=0;
    for(let n=3;n<p.length;n+=4){ if(p[n]===0)frei++;else if(p[n]===255)sichtbar++; }
    return {frei:frei/(p.length/4),sichtbar};
  });check(r.frei>.4 && r.sichtbar>1000,JSON.stringify(r));
  await page.locator('[data-pb-close]').click(); await page.evaluate(() => document.querySelector('#foto-test-rand').remove());
});
await test('Bildbedienung erzeugt keine JavaScript-Fehler', async () => check(!fehler.length, fehler.join('; ')));
await browser.close(); await new Promise(r => server.close(r));
const ok = result.filter(r => r.ok).length;
console.log(`FOTOS: ${ok} von ${result.length} Prüfungen bestanden`);
process.exit(ok === result.length ? 0 : 1);
