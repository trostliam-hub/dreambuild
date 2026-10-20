/* Bedienung: benannte Sheet-Dialoge, begrenzter Tastaturfokus, ehrliche Bildfehler
 * und lesbare Einkaufszeilen. Ausschließlich isolierte Testdaten; keine API.
 * Optional: CRANKSCORE_SOURCE_ROOT und CRANKSCORE_SCREENSHOTS.
 * Aufruf: node tools/bedienung-test.mjs */
import {createRequire} from 'node:module';
import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
let pw;try{pw=require('playwright');}catch{pw=require(path.join(execSync('npm root -g').toString().trim(),'playwright'));}
const root=path.resolve(process.env.CRANKSCORE_SOURCE_ROOT||path.join(path.dirname(fileURLToPath(import.meta.url)),'..'));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.webmanifest':'application/manifest+json'};
const fileFor=u=>path.resolve(root,'.'+decodeURIComponent(new URL(u,'http://localhost').pathname));
const serve=r=>{let f;try{f=fileFor(r.request().url());}catch{return r.fulfill({status:400,body:''});}
  if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile())return r.fulfill({status:404,body:''});
  return r.fulfill({contentType:mime[path.extname(f)]||'application/octet-stream',body:fs.readFileSync(f)});};
const server=http.createServer((q,r)=>{const f=fileFor(q.url);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){r.writeHead(404);r.end();return;}
  r.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f));});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port,url=origin+'/index.html';
const browser=await pw.chromium.launch({channel:process.platform==='win32'?'chrome':undefined});
const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'en-US',serviceWorkers:'block',reducedMotion:'reduce'});
await ctx.addInitScript(()=>{localStorage.clear();for(const k of ['einstieg2','tour','szenen','start'])localStorage.setItem('mtb.'+k,'1');localStorage.setItem('mtb.sprache','de');});
await ctx.route('**/*',r=>new URL(r.request().url()).origin===origin&&['GET','HEAD'].includes(r.request().method())?serve(r):r.abort());
const page=await ctx.newPage(),errors=[],posts=[],results=[];
/* Auch bei vorgeschaltetem lokalen Test-Adapter kommt die Datei aus SOURCE_ROOT. */
await page.route(origin+'/**',r=>['GET','HEAD'].includes(r.request().method())?serve(r):r.abort());
page.setDefaultTimeout(8000);page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))posts.push(r.url());});
const ev=(f,a)=>page.evaluate(f,a),frames=()=>ev(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
const fresh=async()=>{await page.setViewportSize({width:390,height:844});await page.goto(url);await page.waitForFunction(()=>typeof blattDialogAktiv==='function');await page.waitForLoadState('networkidle');await ev(()=>{schliesseStartseite();schliesse();});};
const language=async s=>ev(s=>{schliesse();setzeSprache(s);},s);
const screenshot=async name=>{if(process.env.CRANKSCORE_SCREENSHOTS){fs.mkdirSync(process.env.CRANKSCORE_SCREENSHOTS,{recursive:true});await page.waitForLoadState('networkidle');await ev(()=>document.fonts.ready.then(()=>true));await frames();await page.screenshot({path:path.join(process.env.CRANKSCORE_SCREENSHOTS,'bedienung-'+name+'.png'),animations:'disabled'});}};
const test=async(name,f)=>{try{await f();results.push({name,ok:true});console.log('OK   '+name);}catch(e){results.push({name,ok:false});console.log('FEHL '+name+'\n      '+e.stack);}};
const state=()=>ev(()=>JSON.stringify({build,profile,plan,koerper,fprofil,setupAlle}));
const fixture=()=>ev(()=>{schliesse();pro={key:'test',inst:'i',status:'aktiv',geprueft:Date.now()};wechsle('real');plan.fahrer=80;
  build.rahmen='f-spindrift';build.gabel='g-zeb|charger3.2rc2~180';build.daempfer='d-sdcoil|ultimate~230x65m';build.bremsen=null;
  build.fw={gj:2027,dj:2025,df:475,fertig:true,fragenVersion:FW_FRAGEN_VERSION,rid:build.rahmen,gid:build.gabel,did:build.daempfer};
  suAuf.clear();suErstGezeigt.clear();suElWahl='daempfer';view='setup';zeichne();});
try{
  for(const s of ['de','en'])await test('Zugängliche Dialognamen für Suche, Detail, Vergleich, Profil und Guide ('+s+')',async()=>{
    await fresh();await language(s);
    for(const action of [()=>oeffneMenu(),()=>oeffneSlot('bremsen'),()=>oeffneDetail('bremsen','b-mt7',true),()=>oeffneVergleich('gabel','g-fox38'),()=>oeffneGuide()]){
      await ev(action);assert.equal(await page.getByRole('dialog',{name:/\S/}).count(),1);
      const r=await ev(()=>{const d=$('modal').querySelector('[role="dialog"]'),id=d.getAttribute('aria-labelledby');return {id,found:!!document.getElementById(id),focus:!!document.activeElement.closest('#modal')};});
      assert.equal(r.found,true);assert.equal(r.focus,true);assert.ok(r.id);
    }
  });
  await test('Tab bleibt vorwärts und rückwärts im sichtbaren Sheet; Escape gibt den Auslöser zurück',async()=>{
    await fresh();await page.locator('#btn-menu').focus();await page.keyboard.press('Enter');
    const close=page.locator('#modal [data-zu]'),last=page.locator('#bt-form-menu button');
    await close.focus();await page.keyboard.press('Shift+Tab');assert.equal(await last.evaluate(e=>e===document.activeElement),true);
    await page.keyboard.press('Tab');assert.equal(await close.evaluate(e=>e===document.activeElement),true);
    for(let i=0;i<35;i++){await page.keyboard.press('Tab');assert.equal(await ev(()=>!!document.activeElement.closest('#modal .sheet')),true);}
    await page.keyboard.press('Escape');await page.waitForFunction(()=>!$('modal').firstElementChild&&document.activeElement.id==='btn-menu');
  });
  await test('Inhaltwechsel aktualisiert den Namen und erhält den logisch selben Tastaturfokus',async()=>{
    await fresh();await page.locator('#btn-menu').focus();await page.keyboard.press('Enter');
    await page.locator('#modal [data-sprache="en"]').focus();await page.keyboard.press('Enter');
    assert.equal(await page.getByRole('dialog',{name:/App.*profile/}).count(),1);
    assert.equal(await page.locator('#modal [data-sprache="en"]').evaluate(e=>e===document.activeElement&&e.tabIndex>=0),true);
    await page.locator('#modal [data-design="hell"]').click();await ev(()=>oeffneMenu());
    assert.equal(await page.locator('#modal [data-design="hell"]').evaluate(e=>e.tabIndex>=0),true);
  });
  await test('Verdeckte/gesperrte Ziele werden übersprungen, Hintergrund kann keinen Fokus behalten',async()=>{
    await fresh();await page.locator('#btn-menu').focus();await page.keyboard.press('Enter');
    await ev(()=>{const s=$('modal').querySelector('.sheet-b');s.insertAdjacentHTML('beforeend','<button hidden id="hidden-test">unsichtbar</button><button disabled id="disabled-test">gesperrt</button><button id="inert-test" inert>inert</button>');});
    await page.locator('#bt-form-menu button').focus();await page.keyboard.press('Tab');assert.equal(await page.locator('#modal [data-zu]').evaluate(e=>e===document.activeElement),true);
    await ev(()=>$('mini').focus());assert.equal(await ev(()=>!!document.activeElement.closest('#modal .sheet')),true);
  });
  await test('Nativer Foto-Dialog und Einführung behalten ihre eigene Fokusführung',async()=>{
    await fresh();await ev(()=>oeffneDetail('bremsen','b-mt7',true));await page.locator('#modal [data-produktfoto]').click();
    await page.waitForFunction(()=>document.querySelector('#produktbild-dialog')?.open);await page.locator('[data-pb-close]').focus();await page.keyboard.press('Shift+Tab');
    assert.equal(await ev(()=>!!document.activeElement.closest('#produktbild-dialog')),true);await page.keyboard.press('Tab');assert.equal(await page.locator('[data-pb-close]').evaluate(e=>e===document.activeElement),true);
    await page.locator('[data-pb-close]').click();await ev(()=>oeffneSzenen());
    assert.equal(await ev(()=>!!document.activeElement.closest('#szenen')),true);await page.keyboard.press('Tab');assert.equal(await ev(()=>!!document.activeElement.closest('#szenen')),true);
    await ev(()=>{szenenEnde();schliesse();});
  });
  for(const s of ['de','en'])await test('404-Nahfoto: keine falschen Zeiger, Beschreibung und Original-/Quellenlink bleiben ('+s+')',async()=>{
    await fresh();await language(s);await page.route('**/bilder/fahrwerk/rs-sdcoil-3q-detail.png',r=>r.fulfill({status:404,body:''}));
    await fixture();const before=await state();
    await page.waitForSelector('#fwk-daempfer-feder .fw-nah-fehler .fw-foto-fehler:not([hidden])');
    const r=await page.locator('#fwk-daempfer-feder .fw-ort').evaluate(e=>({pointer:!!e.querySelector('.fw-fotopointer'),svg:!!e.querySelector('svg'),text:e.textContent,
      original:e.querySelector('.fw-nah-link').getAttribute('href'),quelle:e.querySelector('figcaption a').getAttribute('href'),bg:getComputedStyle(e.querySelector('.fw-nah-link')).backgroundColor}));
    assert.equal(r.pointer,false);assert.equal(r.svg,false);assert.match(r.text,s==='de'?/konnte nicht geladen/:/could not be loaded/);
    assert.match(r.text,s==='de'?/Härte auf der Stahlfeder/:/rate is printed/);assert.match(r.original,/rs-sdcoil-3q-detail\.png$/);assert.match(r.quelle,/sram\.com/);assert.equal(r.bg,'rgb(0, 0, 0)');
    assert.equal(await state(),before);await screenshot('foto-404-'+s);
    await page.locator('#fwk-daempfer-feder .fw-nah-link').click();await page.waitForFunction(()=>document.querySelector('#produktbild-dialog')?.open);
    await page.waitForSelector('#produktbild-dialog .pb-fehler:not([hidden])');await page.locator('[data-pb-close]').click();
    await page.unroute('**/bilder/fahrwerk/rs-sdcoil-3q-detail.png');
  });
  await test('Erfolgreiches Nahfoto bleibt unverzerrt, markiert und ohne Fehlermeldung',async()=>{
    await fresh();await fixture();await page.waitForLoadState('networkidle');const r=await page.locator('#fwk-daempfer-feder .fw-nah-link').evaluate(e=>({svg:!!e.querySelector('svg'),pointer:!!e.querySelector('.fw-zielpunkt'),errorVisible:!e.querySelector('.fw-foto-fehler').hidden,aspect:e.querySelector('svg').getAttribute('preserveAspectRatio')}));
    assert.deepEqual(r,{svg:true,pointer:true,errorVisible:false,aspect:'xMidYMid meet'});
  });
  await test('Einkauf 320/390/1280px in beiden Sprachen/Designs: Textbreite, Umbruch und stabile Beträge',async()=>{
    await fresh();await fixture();await ev(()=>{wunschListe().splice(0);wunschListe().push({id:'isoliert',slot:'bremsen',teil:'b-mt7',ziel:'',budget:0,zeit:0,stufe:'einkauf'});view='deals';zeichne();});
    const before=await state(),preis=(await page.locator('.ek-r .p').textContent()).replace(/\D/g,'');
    for(const width of [320,390,1280])for(const s of ['de','en'])for(const light of [false,true]){
      await page.setViewportSize({width,height:844});await ev(({s,light})=>{setzeSprache(s);setzeDesign(light);view='deals';zeichne();},{s,light});await frames();
      const r=await page.locator('.ek').first().evaluate(e=>{const b=e.getBoundingClientRect(),l=e.firstElementChild.getBoundingClientRect(),r=e.querySelector('.ek-r').getBoundingClientRect(),range=document.createRange();range.selectNodeContents(document.querySelector('.ek-summe>b'));return {w:b.width,l:l.width,r:r.width,unter:r.top>=l.bottom-1,ueber:document.documentElement.scrollWidth>innerWidth+1,sumLines:range.getClientRects().length};});
      assert.equal(r.ueber,false);if(width<601){assert.ok(r.l>=r.w-1);assert.ok(r.r>=r.w-1);assert.equal(r.unter,true);assert.equal(r.sumLines,1);}
      assert.equal((await page.locator('.ek-r .p').textContent()).replace(/\D/g,''),preis);if(width===320&&s==='de'&&!light)await screenshot('einkauf-320');
    }
    assert.equal(await state(),before);
  });
}finally{
  if(errors.length)console.log('JS-Fehler: '+errors.join('; '));if(posts.length)console.log('Unerwartete POST-Aufrufe: '+posts.join('; '));
  console.log('BEDIENUNG: '+results.filter(r=>r.ok).length+' von '+results.length+' Prüfungen bestanden.');
  await browser.close();server.close();process.exitCode=results.length===10&&results.every(r=>r.ok)&&!errors.length&&!posts.length?0:1;
}
