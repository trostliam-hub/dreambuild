/* APP-FAHRWERK-PERSOENLICH: echte Klickwege, Wiederaufnahme und Datenerhalt. */
import {createRequire} from 'node:module';
import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require(execSync('npm root -g').toString().trim() + '/playwright'); }
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const server = http.createServer((q, r) => {
  const f = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  if(!f.startsWith(root) || !fs.existsSync(f) || !fs.statSync(f).isFile()){ r.writeHead(404); r.end(); return; }
  const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png'};
  r.writeHead(200, {'Content-Type':types[path.extname(f)] || 'application/octet-stream'}); fs.createReadStream(f).pipe(r);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = process.env.CRANKSCORE_LIVE_URL || `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await pw.chromium.launch();
const ctx = await browser.newContext({viewport:{width:390,height:844}, reducedMotion:'reduce', serviceWorkers:'block'});
await ctx.route('**/*', r => r.request().url().startsWith(new URL(url).origin) ? r.continue() : r.abort());
const page = await ctx.newPage(), errors = [];
page.on('pageerror', e => errors.push(e.message));
const ev = (f,a) => page.evaluate(f,a);
const click = sel => page.locator(sel).click();
const frage = () => page.locator('[data-obschritt]').getAttribute('data-obschritt');
const next = () => click('[data-fwobw]');
const wahl = v => click(`[data-fwwk="${v}"]`);
const neu = async () => {
  await page.goto(url);
  await ev(() => { localStorage.clear(); for(const k of ['einstieg2','tour','szenen','start']) localStorage.setItem('mtb.'+k,'1'); localStorage.setItem('mtb.sprache','de'); });
  await page.reload();
  await page.waitForFunction(() => typeof fwErsterBesuch === 'function');
  await ev(() => {
    pro = {key:'test',inst:'i',status:'aktiv',geprueft:Date.now()};
    wechsle('real'); build.rahmen = 'f-stumpy'; build.gabel = 'g-pike'; delete build.daempfer; delete build.fw;
    plan.fahrer = 80; view = 'aufbau'; sichern(); zeichne();
  });
};
let count = 0, failed = 0;
const test = async (name, f) => { count++; try { await f(); console.log('  ok   '+name); } catch(e){ failed++; console.log('  FEHL '+name+'\n       '+e.stack); } };
try {
  await test('Erst im Fahrwerk-Tab, Gewicht bearbeiten und unterbrochene Fragen fortsetzen', async () => {
    await neu(); await ev(() => { plan.fahrer = 0; sichern(); zeichne(); });
    assert.equal(await page.locator('.fw-ob').count(),0);
    await click('.tabs [data-view="setup"]'); assert.equal(await frage(),'start'); await next();
    assert.equal(await frage(),'gewicht'); await click('[data-fwfahrer]');
    assert.equal(await page.locator('.ei').count(),1);
    await ev(() => eiSetze('fahrer',82)); await click('[data-eiskip]');
    assert.equal(await frage(),'gewicht'); assert.match(await page.locator('.fw-aus-profil').textContent(),/82 kg/);
    await next(); await wahl('gr|L'); await click('#modal [data-zu]');
    await page.reload(); await page.waitForFunction(() => typeof fwErsterBesuch === 'function');
    await ev(() => { pro = {key:'test',inst:'i',status:'aktiv',geprueft:Date.now()}; });
    await click('.tabs [data-view="setup"]'); assert.equal(await page.locator('.fw-ob').count(),0);
    await click('.fw-fragen [data-fwob]'); assert.equal(await frage(),'rad');
    assert.equal(await page.locator('[data-fwwk="gr|L"]').getAttribute('aria-pressed'),'true');
    assert.equal(await ev(() => plan.fahrer),82);
  });
  await test('Vollstaendiger Fragenweg speichert Antworten und endet in persoenlichen Einstellungen', async () => {
    await neu(); await click('.tabs [data-view="setup"]');
    for(let i=0; i<20; i++){
      const n = await frage();
      if(n === 'ende'){ await click('[data-fwobfertig]'); break; }
      if(n === 'gewicht') await click('[data-fmont="fullface"]');
      if(n === 'rad') await wahl('gr|M');
      if(n === 'gabel') await wahl('gj|2025');
      if(n === 'fahrer') await wahl('ff:gelaende|ruppig');
      if(n === 'stil'){ await wahl('ff:tempo|zuegig'); await wahl('ff:spruenge|klein'); }
      if(n === 'gefuehl') await wahl('ff:gefuehl|mittel');
      if(n === 'abstimmung'){
        await page.locator('[data-fwin="vorgabe:gabel:sag"]').fill('20');
        await page.locator('[data-fwin="vorgabe:gabel:max"]').fill('120');
      }
      if(n === 'vorbereitung'){ await wahl('zustand|ok'); await wahl('werkzeug|da'); }
      await next();
    }
    assert.equal(await page.locator('.fw-ob').count(),0);
    assert.ok(await page.locator('#setup .fw-k').count());
    assert.ok(await ev(() => build.fw.fertig && obOffen().length === 0));
    const r = await ev(() => ({stil:build.fw.stil, sag:federRechnen().gabel.modi.allround.sag, gewicht:systemKg()}));
    assert.equal(r.stil.gelaende,'ruppig'); assert.equal(r.sag,20); assert.ok(r.gewicht > 80);
    await page.reload(); await page.waitForFunction(() => typeof fAngabe === 'function');
    assert.equal(await ev(() => fAngabe('gelaende')),'ruppig');
  });
  await test('Keine stillen Antworten: Wahl oder unbekannt, fehlerhafte Zahlen sperren Weiter', async () => {
    await neu(); await ev(() => obOeffnen('stil')); await next(); assert.equal(await frage(),'stil');
    assert.ok(await page.locator('.fw-frage-fehler:visible').count());
    await click('[data-fwwn="ff:tempo"]'); await click('[data-fwwn="ff:spruenge"]'); await next();
    assert.equal(await frage(),'gefuehl');
    await ev(() => obOeffnen('abstimmung')); await page.locator('[data-fwin="vorgabe:gabel:max"]').fill('900');
    await next(); assert.equal(await frage(),'abstimmung');
    assert.equal(await page.locator('[data-fwin="vorgabe:gabel:max"]').getAttribute('aria-invalid'),'true');
    await click('[data-fwwn="vorgaben"]'); await next(); assert.equal(await frage(),'aktuell');
  });
  await test('Hersteller-SAG und Druckgrenzen gelten in jedem Profil, gespeicherte Druecke bleiben begrenzt', async () => {
    await neu();
    const r = await ev(() => {
      build.fw = {gj:2025,vorgaben:{gabel:{sag:19.5,max:55}}}; const f = federRechnen(), d = suDaten(f);
      suP(d).psi.gabel = 500;
      const a = {ziele:FMODI.map(p => f.gabel.modi[p].sag), druecke:FMODI.map(p => f.gabel.modi[p].psi), wert:suPsi('gabel',f.gabel,d), max:suMax('gabel',f.gabel)};
      build.fw.vorgaben.gabel.max = 400; a.hoeher = suMax('gabel',f.gabel); a.belegt = f.gabel.max;
      build.fw.vorgaben.gabel.sag = 90; a.kaputt = fwSagZiel('gabel'); return a;
    });
    assert.deepEqual(r.ziele,[19.5,19.5,19.5]); assert.ok(r.druecke.every(v => v === null || v <= 55));
    assert.ok(r.wert === null || r.wert <= 55); assert.equal(r.max,55); assert.equal(r.hoeher,r.belegt); assert.equal(r.kaputt,null);
    const coil = await ev(() => {
      build.rahmen='f-spindrift'; build.gabel='g-zeb';
      const t=katalog(quelleOf(slotOf('daempfer'))).find(t => /Super Deluxe Coil/.test(t.n));
      build.daempfer=besteVariante('daempfer',t,build).id;
      build.fw={fwH:180,vorgaben:{daempfer:{sag:25}}}; const a=federRechnen().daempfer;
      build.fw.vorgaben.daempfer.sag=30; const b=federRechnen().daempfer;
      return {coil:a.coil, rateA:a.rateExakt, rateB:b.rateExakt, mm:b.modi.allround.sagMm, hub:b.t.hub, psi:b.psi};
    });
    assert.ok(coil.coil && coil.rateA>coil.rateB); assert.equal(coil.mm,Math.round(coil.hub*0.3*10)/10); assert.equal(coil.psi,null);
  });
  await test('Neue SAG-Messung wird bei Gewichtsaenderung ungueltig, Notizen und Feintuning bleiben', async () => {
    await neu();
    const r = await ev(() => {
      build.fw = {gj:2025}; const f = federRechnen(), d = suDaten(f); suP(d).psi.gabel = 75; suP(d).off['gabel|LSC'] = 1;
      suSagSetzen('gabel',28); const vorher = fxMess('gabel',f.gabel,d); plan.fahrer = 95;
      return {vorher, nachher:fxMess('gabel',federRechnen().gabel,d), druck:suP(d).psi.gabel, klick:suP(d).off['gabel|LSC'], messung:suP(d).sag.gabel.mm};
    });
    assert.deepEqual(r,{vorher:28,nachher:null,druck:75,klick:1,messung:28});
  });
  await test('Bestehende Setups fragen nur neue Abschnitte nach und behalten alle Einstellwerte', async () => {
    await neu(); await ev(() => { build.fw = {fertig:true,gj:2025}; FFRAGEN.forEach(f => fprofil[f.k]=f.o[1][0]); const d = suDaten(); suP(d).psi.gabel = 78; suLog(d,{typ:'notiz',text:'Behalten'}); suSichern(); sichern(); zeichne(); });
    await click('.tabs [data-view="setup"]'); assert.equal(await frage(),'abstimmung');
    const r = await ev(() => ({offen:obOffen(),psi:suP(suDaten()).psi.gabel,notiz:suDaten().log[0].text}));
    assert.deepEqual(r.offen,['abstimmung','vorbereitung']); assert.equal(r.psi,78); assert.equal(r.notiz,'Behalten');
    await ev(() => { schliesse(); fprofil={}; build.fw={fertig:true,gj:2025}; fwErsterBesuch(); });
    assert.equal(await frage(),'fahrer');
  });
  await test('Fahrstil gilt pro Rad; neue Komponenten verwerfen nur ihre eigenen Vorgaben', async () => {
    await neu();
    const r = await ev(() => {
      fprofil.tempo = 'ruhig'; obSetzen('ff:tempo','schnell'); const a = JSON.parse(JSON.stringify(build));
      build = {...build,fw:{stil:{tempo:'zuegig'}}}; const b = fAngabe('tempo'); build = a;
      const vor = fAngabe('tempo'); build.fw.vorgaben = {gabel:{sag:20,max:100},daempfer:{sag:30}};
      fwPruef(); build.gabel = 'g-lyrik'; fwPruef();
      return {b,vor,global:fprofil.tempo,g:build.fw.vorgaben.gabel,h:build.fw.vorgaben.daempfer.sag,fertig:build.fw.fertig};
    });
    assert.equal(r.b,'zuegig'); assert.equal(r.vor,'schnell'); assert.equal(r.global,'ruhig'); assert.equal(r.g,undefined); assert.equal(r.h,30); assert.equal(r.fertig,false);
    const neuerTab = await ev(() => {
      const p=profilLeer('real'); p.build={rahmen:'f-stumpy',gabel:'g-pike'}; profile.real.push(p);
      view='setup'; radWechseln('real',p.id); return $('modal').querySelector('[data-obschritt]')?.dataset.obschritt;
    });
    assert.equal(neuerTab,'start');
  });
  await test('Hardtail ohne Daempferfragen, Coil ohne Luftdruckfelder, Free ohne persoenliche Werte', async () => {
    await neu();
    const r = await ev(() => {
      const hardtail = !obSchritte().includes('daempfer');
      build.gabel = 'g-z1coil'; obOeffnen('gabel'); const feder = !!$('modal').querySelector('[data-fwin="gf"]');
      obOeffnen('abstimmung'); const luft = !!$('modal').querySelector('[data-fwin$=":max"]');
      schliesse(); pro = {}; view = 'aufbau'; zeigeBereich('setup');
      return {hardtail,feder,luft,fragen:!!$('modal').querySelector('.fw-ob'),werte:!!$('setup').querySelector('.fw-k')};
    });
    assert.deepEqual(r,{hardtail:true,feder:true,luft:false,fragen:false,werte:false});
  });
  await test('Gemeldeter Defekt fuehrt zuerst zur Pruefung statt zu Pump- und Klickanweisungen', async () => {
    await neu();
    const r = await ev(() => { build.fw = {fertig:true,fragenVersion:FW_FRAGEN_VERSION,gj:2025,zustand:'pruefen'}; view='setup'; zeichne();
      return {hinweis:$('setup').textContent.includes('Ursache prüfen lassen'),werte:!!$('setup').querySelector('.fw-k'),edit:!!$('setup').querySelector('[data-fwob="vorbereitung"]')}; });
    assert.deepEqual(r,{hinweis:true,werte:false,edit:true});
  });
  await test('Einrichtung erneut: aktuelle Funktionen, alle Fahrerfragen, bestehendes Rad ohne Datenverlust', async () => {
    await neu(); await ev(() => { build.fw={fertig:true,gj:2025,fragenVersion:FW_FRAGEN_VERSION}; suP(suDaten()).psi.gabel=81; upNein()['test-erhalten']=1; suSichern(); zeichne(); sichern(); });
    const vorher = await ev(() => JSON.stringify({profile,setupAlle,build,wunsch:localStorage.getItem('mtb.wunsch')}));
    await ev(() => oeffneMenu()); await click('[data-einstiegneu]');
    const szenen = [];
    for(let i=0;i<8 && await page.locator('#szenen .sz').count();i++){
      szenen.push(await page.locator('[data-szene]').getAttribute('data-szene')); await click('[data-szweiter]');
    }
    assert.deepEqual(szenen,['ohne','mit','plan','fahrwerk','guide','merken']);
    assert.equal(await page.locator('.fw-ob').count(),0);
    const steps = await ev(() => eiSchritte()); assert.deepEqual(steps,['erfahrung','charakter','koerper','masse','fit','ziel']);
    for(let i=0;i<5;i++) await click('[data-eiweiter]');
    await click('[data-eiwahl="ziel|behalten"]');
    await page.waitForFunction(() => !document.querySelector('.ei'));
    assert.equal(await page.locator('.ei').count(),0);
    assert.deepEqual(JSON.parse(await ev(() => JSON.stringify({profile,setupAlle,build,wunsch:localStorage.getItem('mtb.wunsch')}))),JSON.parse(vorher));
  });
  await test('Deutsch/Englisch, OLED/Hell und 320/390/1280 px: jede Frage bedienbar ohne Ueberstand', async () => {
    await neu();
    for(const [width,spr,hell] of [[320,'de',false],[390,'de',true],[1280,'en',false]]){
      await page.setViewportSize({width,height:844});
      await ev(({spr,hell}) => { sprache=spr; setzeDesign(hell); },{spr,hell});
      const steps = await ev(() => obSchritte());
      for(const n of steps){
        await ev(n => obOeffnen(n),n);
        assert.equal(await page.locator('.sheet-f button:visible').count() > 0,true);
        assert.equal(await ev(() => {const el=$('modal').querySelector('.sheet-b');return el.scrollWidth>el.clientWidth+1;}),false,`${width}/${spr}/${n}`);
        assert.doesNotMatch(await page.locator('.fw-ob').textContent(),/undefined|NaN/);
      }
      if(process.env.CRANKSCORE_SCREENSHOTS){
        await ev(() => obOeffnen('stil'));
        await page.screenshot({path:path.join(process.env.CRANKSCORE_SCREENSHOTS,`fahrwerk-fragen-${width}-${spr}.png`),animations:'disabled'});
        await ev(() => {schliesse(); oeffneMenu();});
        await page.screenshot({path:path.join(process.env.CRANKSCORE_SCREENSHOTS,`einrichtung-neu-${width}-${spr}.png`),animations:'disabled'});
      }
      await ev(() => {schliesse(); oeffneSzenen(null);});
      for(let i=0;i<6;i++){
        await ev(i => szeneZeigen(i),i);
        assert.equal(await ev(() => document.documentElement.scrollWidth>innerWidth+1),false,`intro/${width}/${i}`);
        const b=await page.locator('[data-szweiter]').boundingBox(); assert.ok(b && b.y+b.height<=844,`intro next/${width}/${i}`);
        if(i===3 && process.env.CRANKSCORE_SCREENSHOTS) await page.screenshot({path:path.join(process.env.CRANKSCORE_SCREENSHOTS,`einfuehrung-fahrwerk-${width}-${spr}.png`),animations:'disabled'});
      }
      await click('[data-szweg]');
    }
  });
  assert.equal(errors.length,0,errors.join('\n'));
} catch(e){ failed++; console.log('JS-Fehler: '+e.stack); }
finally { await browser.close(); server.close(); }
console.log(`FAHRWERK-FRAGEN: ${count-failed} von ${count} Prüfungen bestanden.`);
if(failed) process.exitCode=1;
