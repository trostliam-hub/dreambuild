/* U01/U02/U03 und echter Offlinecache. Nur synthetische Browserdaten.
 * Aufruf: node tools/ui-offline-regression-test.mjs
 * Optional: CRANKSCORE_SOURCE_ROOT, CRANKSCORE_BROWSER_CHANNEL,
 * CRANKSCORE_TEST_MATCH (Teil des Testnamens), CRANKSCORE_TEST_OUTPUT.
 * Keine fremden Netzaufrufe, keine POST-/API-/Kaufanfragen. */
import {createRequire} from 'node:module';
import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(process.env.CRANKSCORE_SOURCE_ROOT||path.join(here,'..'));
const require=createRequire(import.meta.url);
let pw;try{pw=require(path.join(root,'node_modules','playwright'));}catch{try{pw=require('playwright');}catch{pw=require(path.join(execSync('npm root -g').toString().trim(),'playwright'));}}
const output=process.env.CRANKSCORE_TEST_OUTPUT?path.resolve(process.env.CRANKSCORE_TEST_OUTPUT):null;
if(output)fs.mkdirSync(output,{recursive:true});
// Dateien zu Laufbeginn einlesen: keine Mischfassung bei parallelen Source-Edits.
const source=Object.fromEntries(['index.html','mtb-sw.js'].map(f=>[f,fs.readFileSync(path.join(root,f))]));
const report={root,sourceHashes:Object.fromEntries(Object.entries(source).map(([f,s])=>[f,crypto.createHash('sha256').update(s).digest('hex')])),cases:[],errors:[],blocked:[]};
const requests=[],photo='/bilder/fahrwerk/fox-dhx-lsc.jpg';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2'};
const server=http.createServer((q,r)=>{
 const u=new URL(q.url,'http://localhost');requests.push({url:u.pathname+u.search,method:q.method});
 if(!['GET','HEAD'].includes(q.method)){r.writeHead(405).end();return;}
 if(u.pathname==='/audit-image.html'){r.writeHead(200,{'Content-Type':mime['.html']});r.end('<!doctype html><html lang="de"><title>Isolierte Fotoprüfung</title><body style="background:#000;color:#fff"><p>Identisches Herstellerfoto</p><img id="testfoto" src="'+photo+'" width="291" height="582" alt="FOX DHX Druckstufeneinsteller"></body></html>');return;}
 let f,name;try{name=decodeURIComponent(u.pathname).replace(/^\/+/, '')||'index.html';f=path.resolve(root,name);}catch{r.writeHead(400).end();return;}
 if(!f.startsWith(root+path.sep)){r.writeHead(403).end();return;}
 const body=source[name]??(fs.existsSync(f)&&fs.statSync(f).isFile()?fs.readFileSync(f):null);
 if(!body){r.writeHead(404).end();return;}
 r.writeHead(200,{'Content-Type':mime[path.extname(name)]||'application/octet-stream','Cache-Control':'public, max-age=600'});r.end(q.method==='HEAD'?undefined:body);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port,url=origin+'/index.html';
const browser=await pw.chromium.launch({channel:process.env.CRANKSCORE_BROWSER_CHANNEL||(process.platform==='win32'?'chrome':undefined)});
let count=0,failed=0,pageForFailure=null;
const selected=name=>!process.env.CRANKSCORE_TEST_MATCH||name.includes(process.env.CRANKSCORE_TEST_MATCH);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,label,timeout=10000){const end=Date.now()+timeout;while(Date.now()<end){const value=await fn();if(value)return value;await sleep(40);}throw new Error('Zeitüberschreitung: '+label);}
async function test(name,fn){
 if(!selected(name))return;
 count++;try{const detail=await fn();report.cases.push({name,ok:true,detail});console.log('  ok   '+name);}
 catch(e){failed++;const item={name,ok:false,error:e.stack};if(output&&pageForFailure&&!pageForFailure.isClosed())try{item.screenshot=path.join(output,'fehler-'+count+'.png');await pageForFailure.screenshot({path:item.screenshot});}catch{}report.cases.push(item);console.log('  FEHL '+name+'\n       '+e.stack);}
}
async function isolated(options){
 const c=await browser.newContext({serviceWorkers:'block',locale:'en-US',timezoneId:'UTC',reducedMotion:'reduce',...options});
 await c.route('**/*',r=>{const q=r.request(),u=new URL(q.url());if(u.origin===origin&&['GET','HEAD'].includes(q.method()))return r.continue();report.blocked.push({url:u.href,method:q.method()});return r.abort();});
 await c.addInitScript(()=>{if(location.protocol!=='http:')return;for(const k of ['einstieg2','szenen','tour','start'])localStorage.setItem('mtb.'+k,'1');});
 const p=await c.newPage();p.setDefaultTimeout(7000);p.on('pageerror',e=>report.errors.push({url:p.url(),message:e.message}));return {c,p};
}
async function seed(p,cfg){
 await p.goto(url);await p.evaluate(({lang,theme})=>{localStorage.clear();for(const k of ['einstieg2','szenen','tour','start'])localStorage.setItem('mtb.'+k,'1');localStorage.setItem('mtb.sprache',lang);localStorage.setItem('mtb.design',theme);},cfg);await p.reload();
 await p.waitForFunction(()=>typeof zeichne==='function'&&!!document.querySelector('#aufbau .grp'));
 return p.evaluate(()=>{
  schliesse();schliesseStartseite();wechsle('real');setzeBau(JSON.parse(JSON.stringify(START)),true);
  // Pro ist nur ein lokaler UI-Testzustand, wird nicht lizenziert/aktiviert.
  pro={key:'isolated-ui-audit',inst:'none',status:'aktiv',geprueft:Date.now()};
  const t=kandidaten('bremsen',build).find(t=>t.basisId==='b-mt7'||t.id==='b-mt7');if(!t)throw new Error('MT7-Testvariante fehlt');
  const w={id:'ui-wunsch-1',slot:'bremsen',teil:t.id,ziel:'kraft',budget:400,zeit:1792850400000,stufe:'einkauf'};
  aktivesProfil().wuensche=[w,{id:'ui-wunsch-frei',slot:'gabel',teil:null,frei:{n:'Eigene Wunschgabel',l:'https://example.invalid/wunsch'},ziel:'passend',budget:120,zeit:1792850400001,stufe:'gemerkt'}];
  const other=profilLeer(modus);other.name='Zweites synthetisches Rad';other.wuensche=[{...w,budget:222}];profile[modus].push(other);window.auditOtherId=other.id;
  view='wunsch';zeichne();if(!sichern())throw new Error('Testzustand nicht gespeichert');
  return{entry:JSON.parse(JSON.stringify(w)),other:JSON.parse(JSON.stringify(other)),build:JSON.parse(JSON.stringify(build)),profileId:aktivId[modus]};
 });
}
const wish=p=>p.evaluate(()=>JSON.parse(JSON.stringify(wunschListe().find(w=>w.id==='ui-wunsch-1'))));
const raw=p=>p.evaluate(()=>Object.fromEntries(Object.keys(localStorage).sort().filter(k=>k.startsWith('mtb.')).map(k=>[k,localStorage.getItem(k)])));
const open=p=>p.locator('[data-wfinder="ui-wunsch-1"]').click();
const save=p=>p.locator('#modal [data-wzielsave]').click();
const bodyRects=p=>p.evaluate(()=>({mini:$('mini').getBoundingClientRect().toJSON(),tab:document.querySelector('.tabs [data-view="aufbau"]').getBoundingClientRect().toJSON(),name:$('mini-p').getBoundingClientRect().toJSON()}));
try{
 for(const cfg of [{width:390,lang:'de',theme:'oled'},{width:320,lang:'en',theme:'hell'},{width:1280,lang:'de',theme:'hell'}]){
  const {c,p}=await isolated({viewport:{width:cfg.width,height:844}});pageForFailure=p;const label=cfg.width+'/'+cfg.lang+'/'+cfg.theme;
  try{
   await test('U01 '+label+' Fahrwerkvergleich öffnet beide und einzelne Einstellungen',async()=>{
    await seed(p,cfg);await p.evaluate(()=>{setzeBau(leerBau(),true);build.rahmen='f-spindrift';build.gabel=kandidaten('gabel',build).find(t=>t.basisId==='g-zeb').id;build.daempfer=kandidaten('daempfer',build).find(t=>t.basisId==='d-sdcoil').id;plan.fahrer=80;build.fw={gj:2027,dj:2025,df:475,rj:2025,fertig:true,fragenVersion:FW_FRAGEN_VERSION,zustand:'gut',werkzeug:'vorhanden',rid:build.rahmen,gid:build.gabel,did:build.daempfer};view='aufbau';zeichne();});
    await p.locator('.tabs [data-view="setup"]').click();await p.locator('[data-fwvgl]').click();assert.equal(await p.locator('#modal .fw-vgl').count(),1);
    const before=await p.locator('#modal .fw-vgl').innerText();assert.match(before,cfg.lang==='en'?/fork/i:/gabel/i);assert.match(before,cfg.lang==='en'?/shock/i:/dämpfer/i);
    assert.equal(await p.locator('#modal .fw-v thead th').count(),4);const toggle=p.locator('#modal [data-fwvglart="einzel"]');assert.equal(await toggle.count(),1,'Einzelvergleich-Schalter fehlt');await toggle.click();assert.equal(await p.locator('#modal .fw-vgl').count(),1);assert.equal(await p.locator('#modal .fw-v thead th').count(),5);return{before,after:(await p.locator('#modal .fw-vgl').innerText()).slice(0,500)};
   });
   await test('U02 '+label+' Ziel und Dezimalbudget speichern und neu laden',async()=>{
    const before=await seed(p,cfg);await open(p);await p.locator('#wz-ziel').selectOption('ersatz');await p.locator('#wz-budget').fill(cfg.lang==='de'?'750,25':'750.25');await p.locator('#wz-budget').press('Enter');
    assert.equal(await p.locator('#wz-budget').count(),0);const expected={...before.entry,ziel:'ersatz',budget:750.25};assert.deepEqual(await wish(p),expected);
    assert.deepEqual(await p.evaluate(()=>build),before.build);assert.deepEqual(await p.evaluate(()=>profile.real.find(q=>q.id===window.auditOtherId)),before.other);
    await p.reload();await p.waitForFunction(()=>typeof wunschListe==='function');assert.deepEqual(await wish(p),expected);return expected;
   });
   await test('U02 '+label+' Abbrechen und Escape erhalten Wunsch und Speicher',async()=>{
    const before=await seed(p,cfg),stored=await raw(p);
    for(const escape of [false,true]){await open(p);await p.locator('#wz-ziel').selectOption('ersatz');await p.locator('#wz-budget').fill('875');if(escape)await p.keyboard.press('Escape');else await p.locator('#modal .sheet-f [data-zu]').click();assert.equal(await p.locator('#wz-budget').count(),0);assert.deepEqual(await wish(p),before.entry);assert.deepEqual(await raw(p),stored);}
   });
   await test('U02 '+label+' Ungültiges Budget bleibt offen und unverändert',async()=>{
    const before=await seed(p,cfg),stored=await raw(p);await open(p);
    for(const value of ['kaputt','-1','50000.01']){await p.locator('#wz-budget').fill(value);await save(p);assert.equal(await p.locator('#wz-budget').getAttribute('aria-invalid'),'true');assert.equal(await p.locator('#wz-budget').inputValue(),value);assert.deepEqual(await wish(p),before.entry);assert.deepEqual(await raw(p),stored);}
   });
   await test('U02 '+label+' Leere Angaben entfernen Ziel und Budget',async()=>{
    const before=await seed(p,cfg);await open(p);await p.locator('#wz-ziel').selectOption('');await p.locator('#wz-budget').fill('');await save(p);const expected={...before.entry,ziel:'',budget:0};assert.deepEqual(await wish(p),expected);await open(p);assert.equal(await p.locator('#wz-budget').inputValue(),'');assert.equal(await p.locator('#wz-ziel').inputValue(),'');return expected;
   });
   await test('U02 '+label+' Später Speicherfehler setzt bereits geschriebenes Profil zurück',async()=>{
    const before=await seed(p,cfg),stored=await raw(p);await open(p);await p.locator('#wz-ziel').selectOption('ersatz');await p.locator('#wz-budget').fill('777');
    await p.evaluate(()=>{window.auditStorageSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='mtb.plan')throw new DOMException('Nur simuliert: Speicher voll','QuotaExceededError');return window.auditStorageSet.call(this,k,v);};});
    try{await save(p);assert.deepEqual(await wish(p),before.entry);assert.deepEqual(await raw(p),stored);assert.equal(await p.locator('#wz-budget').inputValue(),'777');assert.equal(await p.locator('#modal [data-wzielsave]').count(),1);assert.match(await p.locator('#toast').innerText(),cfg.lang==='en'?/could not be saved/i:/nicht gespeichert/i);}
    finally{await p.evaluate(()=>{Storage.prototype.setItem=window.auditStorageSet;delete window.auditStorageSet;});}
    await save(p);assert.deepEqual(await wish(p),{...before.entry,ziel:'ersatz',budget:777});await p.reload();await p.waitForFunction(()=>typeof wunschListe==='function');assert.equal((await wish(p)).budget,777);
   });
   await test('U02 '+label+' Radwechsel kann gleichnamigen Wunsch eines anderen Rads nicht ändern',async()=>{
    const before=await seed(p,cfg);await open(p);await p.locator('#wz-budget').fill('999');await p.evaluate(()=>profilWechseln(window.auditOtherId));
    if(await p.locator('#modal [data-wzielsave]').count())await save(p);
    const actual=await p.evaluate(originalId=>({original:profile.real.find(q=>q.id===originalId).wuensche[0],other:aktivesProfil().wuensche[0]}),before.profileId);assert.deepEqual(actual.original,before.entry);assert.deepEqual(actual.other,before.other.wuensche[0]);
    await p.reload();await p.waitForFunction(()=>typeof profile!=='undefined');assert.deepEqual(await p.evaluate(originalId=>profile.real.find(q=>q.id===originalId).wuensche[0],before.profileId),before.entry);
   });
   if(cfg.width===390)await test('U02 Freies Wunschprodukt behält Link, Namen, Stufe und Identität',async()=>{
    await seed(p,cfg);const before=await p.evaluate(()=>JSON.parse(JSON.stringify(wunschListe()[1])));await p.locator('[data-wfinder="ui-wunsch-frei"]').click();await p.locator('#wz-ziel').selectOption('guenstig');await p.locator('#wz-budget').fill('550,50');await save(p);assert.deepEqual(await p.evaluate(()=>wunschListe()[1]),{...before,ziel:'guenstig',budget:550.5});
   });
   if(cfg.width===390)await test('U02 Moduswechsel kann ursprünglichen Wunsch nicht verändern',async()=>{
    const before=await seed(p,cfg);await open(p);await p.locator('#wz-budget').fill('999');await p.evaluate(()=>wechsle('traum'));
    if(await p.locator('#modal [data-wzielsave]').count())await save(p);
    assert.deepEqual(await p.evaluate(originalId=>profile.real.find(q=>q.id===originalId).wuensche[0],before.profileId),before.entry);
   });
  }finally{await c.close();pageForFailure=null;}
 }
 for(const width of [1024,1280]){
  const {c,p}=await isolated({viewport:{width,height:844}});pageForFailure=p;
  try{await test('U03 '+width+' Kompakter Desktopkopf hält langen Radnamen neben Navigation',async()=>{
   await seed(p,{width,lang:'de',theme:'hell'});await p.evaluate(()=>{aktivesProfil().name='Specialized Stumpjumper Alloy – Werkstatt';view='aufbau';zeichne();window.scrollTo(0,350);});await p.waitForFunction(()=>document.body.classList.contains('klein'));
   const r=await bodyRects(p);assert.ok(r.mini.width>0);assert.ok(r.mini.right<=r.tab.left+0.5,'Radkopf überlappt Aufbau: '+JSON.stringify(r));assert.ok(r.name.right<=r.mini.right+0.5);return r;
  });}finally{await c.close();pageForFailure=null;}
 }
 if(['Worker Updateprobe mit no-store erzeugt keine neuen Cacheeinträge','Worker Statisches Foto aus Cache ohne erneuten Netzabruf anzeigen','Worker Offlineindex funktioniert kanonisch und mit neuem Queryparameter'].some(selected)){
 const {c,p}=await isolated({serviceWorkers:'allow',viewport:{width:390,height:844}});pageForFailure=p;
 try{
  await p.goto(url);await p.waitForFunction(()=>navigator.serviceWorker.controller?.state==='activated'&&typeof serverVersion==='function',null,{timeout:30000});
  const snapshot=()=>p.evaluate(async()=>{const name=(await caches.keys()).find(k=>k==='dreambuild-'+APP_VERSION||k==='crankscore-'+APP_VERSION),cache=await caches.open(name),keys=(await cache.keys()).map(r=>r.url);return{name,total:keys.length,pruef:keys.filter(u=>new URL(u).pathname.endsWith('/mtb-sw.js')&&new URL(u).searchParams.has('pruef')),canonical:!!await cache.match(new URL('index.html',location.href)),photo:!!await cache.match(new URL('/bilder/fahrwerk/fox-dhx-lsc.jpg',location.href))};});
  await until(async()=>{const s=await snapshot();return s.canonical&&s.photo;},'Offlinebasis',30000);await sleep(400);
  await test('Worker Updateprobe mit no-store erzeugt keine neuen Cacheeinträge',async()=>{
   const worker=c.serviceWorkers()[0];await worker.evaluate(()=>{self.auditRequestModes=[];self.addEventListener('fetch',e=>{if(new URL(e.request.url).searchParams.has('pruef'))self.auditRequestModes.push({url:e.request.url,cache:e.request.cache,mode:e.request.mode});});});
   const before=await snapshot(),netBefore=requests.filter(q=>q.url.startsWith('/mtb-sw.js?pruef=')).length;
   const versions=await p.evaluate(async()=>{const a=[];for(let i=0;i<10;i++){a.push(await serverVersion());await new Promise(r=>setTimeout(r,5));}return a;});await sleep(150);const after=await snapshot(),netAfter=requests.filter(q=>q.url.startsWith('/mtb-sw.js?pruef=')).length;
   const detail={before,after,netBefore,netAfter,versions,modes:await worker.evaluate(()=>self.auditRequestModes)};report.workerProbes=detail;assert.ok(versions.every(Boolean));assert.equal(netAfter-netBefore,10);assert.equal(after.pruef.length,before.pruef.length);assert.equal(after.total,before.total);
   // Routing setzt Chromium-Requests auf cache:'reload'. Den allgemeinen
   // no-store-Zweig zusätzlich ohne Routing prüfen: reine lokale Fotoseite,
   // kein ausgeführter Appcode und damit keine KI-/Lizenz-/Kaufaktion.
   const native=await browser.newContext({serviceWorkers:'allow'});
   try{const np=await native.newPage();await np.goto(origin+'/audit-image.html');await np.evaluate(()=>navigator.serviceWorker.register('mtb-sw.js'));await np.waitForFunction(()=>navigator.serviceWorker.controller?.state==='activated');const nw=native.serviceWorkers()[0];
    await nw.evaluate(()=>{self.auditNativeModes=[];self.addEventListener('fetch',e=>{if(new URL(e.request.url).searchParams.has('auditNoStore'))self.auditNativeModes.push(e.request.cache);});});
    const nk=()=>np.evaluate(async()=>{const name=(await caches.keys()).find(k=>/^(dreambuild|crankscore)-/.test(k)),cache=await caches.open(name);return(await cache.keys()).map(k=>k.url);});const nativeBefore=await nk();
    const status=await np.evaluate(async()=>{const r=await fetch('guide-safety.js?auditNoStore=1',{cache:'no-store'});await r.text();return r.status;});await sleep(100);const nativeAfter=await nk(),nativeModes=await nw.evaluate(()=>self.auditNativeModes);detail.native={status,modes:nativeModes,before:nativeBefore.length,after:nativeAfter.length};assert.equal(status,200);assert.deepEqual(nativeModes,['no-store']);assert.deepEqual(nativeAfter,nativeBefore);
   }finally{await native.close();}return detail;
  });
  await test('Worker Statisches Foto aus Cache ohne erneuten Netzabruf anzeigen',async()=>{
   const before=requests.filter(q=>q.url===photo).length,shots=[];assert.equal((await snapshot()).photo,true);
   for(let i=0;i<2;i++){const imagePage=await c.newPage();try{const session=await c.newCDPSession(imagePage);await session.send('Network.enable');await session.send('Network.setCacheDisabled',{cacheDisabled:true});await imagePage.goto(origin+'/audit-image.html');await imagePage.locator('#testfoto').evaluate(i=>i.decode());const loaded=await imagePage.locator('#testfoto').evaluate(i=>({complete:i.complete,width:i.naturalWidth,height:i.naturalHeight,controller:navigator.serviceWorker.controller?.state}));assert.equal(loaded.complete,true);assert.ok(loaded.width>0&&loaded.height>0);assert.equal(loaded.controller,'activated');await sleep(150);shots.push({...loaded,network:requests.filter(q=>q.url===photo).length});}finally{await imagePage.close();}}
   const after=requests.filter(q=>q.url===photo).length;assert.equal(after,before);return{before,after,shots};
  });
  await test('Worker Offlineindex funktioniert kanonisch und mit neuem Queryparameter',async()=>{
   assert.equal((await snapshot()).canonical,true);await new Promise((resolve,reject)=>{server.close(e=>e?reject(e):resolve());server.closeAllConnections();});await c.setOffline(true);
   await p.reload({waitUntil:'domcontentloaded'});await p.waitForFunction(()=>typeof zeichne==='function'&&!!document.querySelector('#aufbau .grp'));
   const canonical=await p.evaluate(()=>({url:location.href,version:APP_VERSION,core:!!document.querySelector('#aufbau .grp')}));await p.goto(url+'?audit=1',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>typeof zeichne==='function'&&!!document.querySelector('#aufbau .grp'));
   const query=await p.evaluate(()=>({url:location.href,version:APP_VERSION,core:!!document.querySelector('#aufbau .grp')}));assert.equal(query.version,canonical.version);assert.equal(query.core,true);assert.equal(query.url,url+'?audit=1');return{canonical,query};
  });
 }finally{await c.close();pageForFailure=null;}
 }
 await test('Isolation: keine JavaScriptfehler und keine fremden oder schreibenden Netzaufrufe',async()=>{assert.deepEqual(report.errors,[]);assert.deepEqual(report.blocked,[]);assert.ok(requests.every(q=>['GET','HEAD'].includes(q.method)));return{requests:requests.length};});
}finally{
 await browser.close();if(server.listening)await new Promise(r=>server.close(r));report.summary={count,failed,passed:count-failed};if(output)fs.writeFileSync(path.join(output,'ui-offline-regression.json'),JSON.stringify(report,null,2));
}
console.log(`UI-OFFLINE: ${count-failed} von ${count} Prüfungen bestanden.`);
if(failed||!count)process.exitCode=1;
