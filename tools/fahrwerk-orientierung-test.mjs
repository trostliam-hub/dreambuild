/* Fahrwerk-Orientierung: Teilwahl, Fortschritt, echte Fotos und Datenerhalt.
 * Aufruf: node tools/fahrwerk-orientierung-test.mjs
 * CRANKSCORE_SOURCE_ROOT: anderer Checkout; CRANKSCORE_LIVE_URL: laufender Server.
 * CRANKSCORE_SCREENSHOTS: optionaler Belegordner; CRANKSCORE_BROWSER_CHANNEL: Browserkanal.
 * Ausschliesslich isolierte Testprofile; externe Requests und API-Aufrufe werden blockiert.
 */
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
const live=process.env.CRANKSCORE_LIVE_URL;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const fileFor=url=>{const f=path.resolve(root,'.'+decodeURIComponent(new URL(url,'http://localhost').pathname));return f===root?path.join(root,'index.html'):f;};
const allowed=f=>f.startsWith(root+path.sep)&&fs.existsSync(f)&&fs.statSync(f).isFile();
const server=live?null:http.createServer((q,r)=>{
  let f;try{f=fileFor(q.url);}catch{r.writeHead(400);r.end();return;}
  if(!allowed(f)){r.writeHead(404);r.end();return;}
  r.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);
});
if(server)await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=live||`http://127.0.0.1:${server.address().port}/index.html`,origin=new URL(url).origin;
const browser=await pw.chromium.launch({channel:process.env.CRANKSCORE_BROWSER_CHANNEL||(process.platform==='win32'?'chrome':undefined)});
const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',serviceWorkers:'block'}),posts=[];
await ctx.route('**/*',r=>{
  if(!['GET','HEAD'].includes(r.request().method())){posts.push(r.request().url());return r.abort();}
  if(new URL(r.request().url()).origin!==origin)return r.abort();
  if(live)return r.continue();
  /* Direkt aus dem gewaehlten Checkout: lokale Tests brauchen keine Netzwerkfreigabe. */
  let f;try{f=fileFor(r.request().url());}catch{return r.fulfill({status:400,body:''});}
  if(!allowed(f))return r.fulfill({status:404,body:''});
  return r.fulfill({status:200,contentType:mime[path.extname(f)]||'application/octet-stream',body:fs.readFileSync(f)});
});
const page=await ctx.newPage(),errors=[];
page.setDefaultTimeout(8000);page.on('pageerror',e=>errors.push(e.message));
const ev=(f,a)=>page.evaluate(f,a),click=s=>page.locator(s).click();
const choose=slot=>click(`#setup [data-fwel="${slot}"]`);
const card=(slot,art)=>`#setup .fw-teile #fwk-${slot}-${art}`;
const toggle=(slot,art)=>click(`${card(slot,art)} > [data-fwk]`);
const openCard=async(slot,art)=>{const b=page.locator(`${card(slot,art)} > [data-fwk]`);if(await b.getAttribute('aria-expanded')!=='true')await b.click();};
const screenshot=async name=>{if(process.env.CRANKSCORE_SCREENSHOTS){fs.mkdirSync(process.env.CRANKSCORE_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.CRANKSCORE_SCREENSHOTS,`fahrwerk-orientierung-${name}.png`),animations:'disabled'});}};
const fresh=async()=>{
  await page.setViewportSize({width:390,height:844});await page.goto(url);
  await ev(()=>{localStorage.clear();for(const k of ['einstieg2','tour','szenen','start'])localStorage.setItem('mtb.'+k,'1');localStorage.setItem('mtb.sprache','de');});
  await page.reload();await page.waitForFunction(()=>typeof suErstGezeigt!=='undefined'&&typeof fwErsterBesuch==='function');
  await ev(()=>{
    schliesse();schliesseStartseite();pro={key:'test',inst:'i',status:'aktiv',geprueft:Date.now()};wechsle('real');
    build.rahmen='f-spindrift';build.gabel='g-zeb';const t=katalog(quelleOf(slotOf('daempfer'))).find(t=>t.id==='d-sdcoil');
    if(!t)throw new Error('Super-Deluxe-Coil-Testmodell fehlt');build.daempfer=besteVariante('daempfer',t,build).id;plan.fahrer=80;
    delete build.fw;fwPruef();const fw=fwInfo();fw.fertig=true;fw.fragenVersion=FW_FRAGEN_VERSION;fw.gj=2027;fw.dj=2025;fw.df=475;
    fw.besucht=Object.fromEntries(obSchritte().filter(n=>!['start','ende'].includes(n)).map(n=>[n,true]));
    fw.stil={gelaende:'ruppig',tempo:'zuegig',spruenge:'klein',gefuehl:'mittel',bergauf:'egal'};
    suAuf.clear();suErstGezeigt.clear();suElWahl='gabel';fedModus='allround';sichern();view='setup';zeichne();
  });
  await page.waitForSelector('#setup .fw-teile .fw-el');
};
const finish=slot=>ev(slot=>{
  const f=federRechnen(),d=suDaten(f),P=suP(d),x=f[slot];
  for(const st of suSchritte(f,d,slot))if(!['sag','test'].includes(st.key))P.fertig[st.key]=true;
  suSagSetzen(slot,x.modi[fedModus].sagMm);suLog(d,{typ:'tr',txt:'Isolierte Testfahrt abgeschlossen'});suSichern();setupZeichnen();
},slot);
const state=()=>ev(()=>({build:JSON.stringify(build),plan:JSON.stringify(plan),profiles:JSON.stringify(profile),setup:JSON.stringify(setupAlle),wishlist:JSON.stringify(wunschListe()),saved:Object.fromEntries(Object.keys(localStorage).filter(k=>k.startsWith('mtb.')).sort().map(k=>[k,localStorage.getItem(k)]))}));
let count=0,failed=0;
const test=async(name,f)=>{count++;try{await f();console.log('  ok   '+name);}catch(e){failed++;console.log('  FEHL '+name+'\n       '+e.stack);}};

try{
  await test('Gabel/Daempfer zuerst waehlen: Auswahl steht vor Fortschritt und zeigt genau ein Teil',async()=>{
    await fresh();const order=await page.locator('#setup').evaluate(e=>{const a=e.querySelector('.fw-elw'),b=e.querySelector('.fw-weiter');return !!(a&&b&&(a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING));});assert.equal(order,true);
    assert.equal(await page.locator('#setup [data-fwel]').count(),2);assert.equal(await page.locator('#setup .fw-teile .fw-el').count(),1);
    assert.equal(await page.locator('#setup [data-fwel="gabel"]').getAttribute('aria-pressed'),'true');assert.match(await page.locator('#setup .fw-teile .fw-el-kopf').textContent(),/ZEB/);
    await page.locator('#setup [data-fwel="daempfer"]').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#setup [data-fwel="daempfer"]').getAttribute('aria-pressed'),'true');assert.match(await page.locator('#setup .fw-teile .fw-el-kopf').textContent(),/Super Deluxe Coil/);
    assert.equal(await page.locator('#setup .fw-teile [id^="fwk-gabel-"]').count(),0);assert.equal(await page.locator('#setup [data-fwel="daempfer"]').evaluate(e=>e===document.activeElement),true);
  });
  await test('Fortschritt und Abschluss gehoeren zum ausgewaehlten Teil; die andere Federung bleibt offen',async()=>{
    await fresh();assert.match(await page.locator('#setup .fw-weiter-t small').textContent(),/Gabel.*0 erledigt/);
    await click('#setup .fw-weiter [data-fwok="gabel:luft"]');assert.match(await page.locator('#setup .fw-weiter-t small').textContent(),/Gabel.*1 erledigt/);assert.equal(await page.locator('#setup .fw-weiter [data-fwzu]').getAttribute('data-fwzu'),'gabel|gabel:sag');
    await choose('daempfer');assert.match(await page.locator('#setup .fw-weiter-t small').textContent(),/Dämpfer.*0 erledigt/);assert.equal(await page.locator('#setup .fw-weiter [data-fwzu]').getAttribute('data-fwzu'),'daempfer|daempfer:feder');
    await choose('gabel');await finish('gabel');assert.equal((await page.locator('#setup .fw-weiter.fertig b').textContent()).trim(),'Gabel eingestellt');
    await choose('daempfer');assert.equal(await page.locator('#setup .fw-weiter.fertig').count(),0);assert.match(await page.locator('#setup .fw-weiter-t b').textContent(),/Feder hinten prüfen/);
    await click('#setup .fw-weiter [data-fwok="daempfer:feder"]');assert.equal(await page.locator('#setup .fw-weiter [data-fwzu]').getAttribute('data-fwzu'),'daempfer|daempfer:sag');await click('#setup .fw-weiter [data-fwzu]');assert.equal(await page.locator(`${card('daempfer','sag')} > [data-fwk]`).getAttribute('aria-expanded'),'true');
    await finish('daempfer');assert.equal((await page.locator('#setup .fw-weiter.fertig b').textContent()).trim(),'Dämpfer eingestellt');await choose('gabel');assert.match(await page.locator('#setup .fw-weiter.fertig').textContent(),/Gabel eingestellt/);
  });
  await test('Erste Luft-/Federkarte oeffnet nur einmal; bewusstes Schliessen bleibt nach Render und Teilwechsel erhalten',async()=>{
    await fresh();assert.equal(await page.locator('#setup .fw-teile .fw-k.offen').count(),1);assert.equal(await page.locator(`${card('gabel','luft')} > [data-fwk]`).getAttribute('aria-expanded'),'true');
    await toggle('gabel','luft');await ev(()=>fwNeu());assert.equal(await page.locator('#setup .fw-teile .fw-k.offen').count(),0);
    await choose('daempfer');assert.equal(await page.locator('#setup .fw-teile .fw-k.offen').count(),1);assert.equal(await page.locator(`${card('daempfer','feder')} > [data-fwk]`).getAttribute('aria-expanded'),'true');
    await toggle('daempfer','feder');await ev(()=>setupZeichnen());assert.equal(await page.locator('#setup .fw-teile .fw-k.offen').count(),0);await choose('gabel');assert.equal(await page.locator('#setup .fw-teile .fw-k.offen').count(),0);await choose('daempfer');assert.equal(await page.locator('#setup .fw-teile .fw-k.offen').count(),0);
  });
  await test('Coil-SAG misst zwischen Befestigungsaugen, markiert beide Messpunkte und braucht keinen O-Ring',async()=>{
    await fresh();await choose('daempfer');await openCard('daempfer','sag');const c=page.locator(card('daempfer','sag')),text=await c.textContent();
    assert.match(text,/Befestigungsaugen/);assert.doesNotMatch(text,/O[- ]?Ring|Gummiring|Luftkammer|Dämpferpumpe/i);assert.equal(await c.locator('.fw-ort .fw-zielpunkt').count(),2);assert.equal(await c.locator('.fw-ort svg image').count(),1);assert.match(await c.locator('.fw-ort svg image').getAttribute('href'),/^(?:bilder\/fahrwerk\/|blob:)/);
    assert.match(await c.locator('.fw-direkt').textContent(),/ohne.*mit dir/);await c.locator('[data-fwsag="daempfer"]').click();assert.equal(await page.locator('.fw-sagwz').count(),1);assert.doesNotMatch(await page.locator('.fw-sagwz').textContent(),/O[- ]?Ring|Luftkammer|Dämpferpumpe/i);await ev(()=>schliesse());
  });
  await test('LSC und HSC sind direkt erreichbar und zeigen verschiedene korrekt bezeichnete Einsteller',async()=>{
    await fresh();
    for(const slot of ['gabel','daempfer']){
      await choose(slot);
      for(const art of ['LSC','HSC']){
        const c=page.locator(card(slot,art)),b=c.locator(':scope > [data-fwk]');assert.equal(await b.isVisible(),true);assert.equal(await b.evaluate(e=>!!e.closest('details:not([open])')),false);
        await b.focus();await page.keyboard.press('Enter');assert.equal(await b.getAttribute('aria-expanded'),'true');assert.equal(await c.locator(`[data-fwart="${art.toLowerCase()}"]`).count(),1);assert.match(await c.locator('.fw-ort figcaption b').textContent(),new RegExp('^'+art+':'));
        assert.equal(await c.locator('[data-fwklick]').count(),2);assert.match(await c.locator('.fw-direkt').textContent(),/Gezählt ab|Mitte/);
      }
      const l=await page.locator(`${card(slot,'LSC')} .fw-ort`).textContent(),h=await page.locator(`${card(slot,'HSC')} .fw-ort`).textContent();assert.notEqual(l,h);
      if(slot==='gabel'){assert.match(l,/kleine innere Knopf/);assert.match(h,/große schwarze Außenring/);}else{assert.match(l,/gerändelten Außenrand/);assert.match(h,/seitliche.*3-mm-Inbus/);}
    }
  });
  await test('Echtes Bild vor Wert und Anleitung, volle Breite/230–260 px ohne Ueberstand bei320/390/1280',async()=>{
    await fresh();
    for(const width of [320,390,1280]){
      await page.setViewportSize({width,height:844});
      for(const [slot,art] of [['gabel','luft'],['gabel','HSC'],['daempfer','feder'],['daempfer','sag']]){
        await choose(slot);await openCard(slot,art);const c=page.locator(card(slot,art));
        const box=await c.evaluate(e=>{const ort=e.querySelector('.fw-ort'),figure=ort.querySelector('figure'),media=figure?.querySelector('.fw-nah-link')||figure?.querySelector('img'),control=e.querySelector('.fw-st,[data-fwsag]'),how=e.querySelector('.fw-direkt');
          const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom};};return{ort:rect(ort),figure:figure&&rect(figure),media:media&&rect(media),control:control&&rect(control),how:rect(how),real:!!figure?.querySelector('img,svg image'),placeholder:!!ort.querySelector('.il,canvas'),outside:document.documentElement.scrollWidth>innerWidth+1};});
        assert.equal(box.real,true,`Kein echtes Foto ${width}/${slot}/${art}`);assert.equal(box.placeholder,false);assert.ok(box.media.height>=229&&box.media.height<=261,JSON.stringify(box));assert.ok(box.figure.width>=box.ort.width-4&&box.figure.width<=box.ort.width+1,JSON.stringify(box));assert.ok(box.media.width>=box.ort.width-4,JSON.stringify(box));
        assert.ok(box.ort.bottom<=box.control.y+1,`Bild steht nicht vor Wert ${width}/${slot}/${art}`);assert.ok(box.control.bottom<=box.how.y+1,`Anleitung steht nicht nach Wert ${width}/${slot}/${art}`);assert.equal(box.outside,false,`Horizontaler Ueberstand ${width}/${slot}/${art}`);assert.ok(box.media.x>=0&&box.media.x+box.media.width<=width+1,JSON.stringify(box));
        if(art==='sag'){await c.locator('.fw-ort').scrollIntoViewIfNeeded();await screenshot(`${width}-coil-sag`);}
      }
    }
  });
  await test('475-lbs-Feder, Messung, Notizen und Feintuning bleiben bei Auswahl, Bildansicht und Reload erhalten; keine API',async()=>{
    await fresh();await ev(()=>{const f=federRechnen(),d=suDaten(f),k=suKnoepfe('daempfer',f.daempfer,d).find(k=>k.art==='zug');suP(d).off[k.key]=1;suP(d).psi.gabel=145;suLog(d,{typ:'notiz',text:'475 lbs behalten'});suSagSetzen('daempfer',20);suGrundSpeichern(f,d);wunschListe().push({id:'orientierung-wunsch',slot:'bremsen',teil:'b-xt',stufe:'gemerkt'});suSichern();sichern();setupZeichnen();});const before=await state();
    for(const slot of ['daempfer','gabel','daempfer'])await choose(slot);await openCard('daempfer','feder');assert.equal(await page.locator(`${card('daempfer','feder')} [data-fwin="df"]`).inputValue(),'475');
    const picture=page.locator(`${card('daempfer','feder')} .fw-ort .fw-nah-link`).first();await picture.click();await page.waitForSelector('#produktbild-dialog[open]');await click('[data-pb-close]');await ev(()=>fwNeu());assert.deepEqual(await state(),before);
    await page.reload();await page.waitForFunction(()=>typeof fwErsterBesuch==='function');await ev(()=>{pro={key:'test',inst:'i',status:'aktiv',geprueft:Date.now()};view='setup';zeichne();});await choose('daempfer');assert.equal(await ev(()=>federRechnen().daempfer.federIst),475);assert.deepEqual(await state(),before);assert.deepEqual(posts,[]);assert.deepEqual(errors,[]);
  });
}finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
console.log(`FAHRWERK-ORIENTIERUNG: ${count-failed} von ${count} Prüfungen bestanden.`);
if(failed)process.exitCode=1;
