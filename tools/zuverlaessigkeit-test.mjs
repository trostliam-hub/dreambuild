/* Zuverlaessigkeit: Datenrettung, Guide-Limit, bestaetigte Abmeldung und Offline-Update.
 * Isolierte Browserdaten und simulierte Schnittstellen, keine echten API-Aufrufe.
 * Optional: CRANKSCORE_SOURCE_ROOT, CRANKSCORE_LIVE_URL, CRANKSCORE_BROWSER_CHANNEL,
 * CRANKSCORE_TEST_MATCH zum gezielten Wiederholen einer Testgruppe. */
import {createRequire} from 'node:module';
import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
let pw;try{pw=require('playwright');}catch{pw=require(path.join(execSync('npm root -g').toString().trim(),'playwright'));}
const root=path.resolve(process.env.CRANKSCORE_SOURCE_ROOT||path.join(path.dirname(fileURLToPath(import.meta.url)),'..')),live=process.env.CRANKSCORE_LIVE_URL;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2'};
const resource=u=>{const f=path.resolve(root,'.'+decodeURIComponent(new URL(u,'http://localhost').pathname));return f===root?path.join(root,'index.html'):f;};
const valid=f=>f.startsWith(root+path.sep)&&fs.existsSync(f)&&fs.statSync(f).isFile();
const server=live?null:http.createServer((q,r)=>{let f;try{f=resource(q.url);}catch{r.writeHead(400);r.end();return;}if(!valid(f)){r.writeHead(404);r.end();return;}r.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
if(server)await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=live||`http://127.0.0.1:${server.address().port}/index.html`,origin=new URL(url).origin;
const browser=await pw.chromium.launch({channel:process.env.CRANKSCORE_BROWSER_CHANNEL||(process.platform==='win32'?'chrome':undefined)}),ctx=await browser.newContext({serviceWorkers:'block',locale:'en-US',timezoneId:'UTC',reducedMotion:'reduce'});
const navigations=[],external=[];
await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.searchParams.get('v')==='audit-future'){navigations.push(u.href);return r.abort();}if(u.origin!==origin){external.push(u.href);return r.abort();}if(live)return r.continue();let f;try{f=resource(u.href);}catch{return r.fulfill({status:400,body:''});}if(!valid(f))return r.fulfill({status:404,body:''});return r.fulfill({contentType:mime[path.extname(f)]||'application/octet-stream',body:fs.readFileSync(f)});});
const page=await ctx.newPage(),errors=[];page.setDefaultTimeout(8000);page.on('pageerror',e=>errors.push(e.message));
const ev=(f,a)=>page.evaluate(f,a);
const fresh=async()=>{await page.goto(url);await ev(()=>{localStorage.clear();for(const k of ['einstieg2','szenen','tour','start'])localStorage.setItem('mtb.'+k,'1');localStorage.setItem('mtb.sprache','de');});await page.reload();await page.waitForLoadState('networkidle');await page.waitForFunction(()=>typeof laden==='function');};
const seed=()=>ev(()=>{pro={key:'isolated-test',inst:'fake-instance',status:'aktiv',geprueft:Date.now()};wechsle('real');build.rahmen='f-spindrift';aktivesProfil().name='Erstes Rad';wunschListe().push({id:'w1',slot:'bremsen',teil:'b-xt',stufe:'gemerkt'});sichern();profilNeu();build.rahmen='f-stumpy';aktivesProfil().name='Zweites Rad';wunschListe().push({id:'w2',slot:'gabel',teil:'g-pike',stufe:'gemerkt'});upNein().gabel='g-pike';zeichne();sichern();return profile.real.map(p=>({id:p.id,name:p.name,rahmen:p.build.rahmen,wuensche:p.wuensche}));});
const saved=()=>ev(()=>profile.real.map(p=>({id:p.id,name:p.name,rahmen:p.build.rahmen,wuensche:p.wuensche})));
let count=0,failed=0;
const test=async(name,f)=>{if(process.env.CRANKSCORE_TEST_MATCH&&!name.includes(process.env.CRANKSCORE_TEST_MATCH))return;count++;try{await f();console.log('  ok   '+name);}catch(e){failed++;console.log('  FEHL '+name+'\n       '+e.stack);}};
try{
 await test('Kaputtes optionales JSON isolieren: alle Raeder und Wuensche laden, Fehler benennen, weiter speichern',async()=>{
  for(const key of ['mtb.links','mtb.feed','mtb.zu','mtb.eigene','mtb.plan','mtb.markt','mtb.jahr','mtb.betreiber','mtb.aff','mtb.fotos']){
   await fresh();const before=await seed();await ev(k=>localStorage.setItem(k,'{'),key);await page.reload();await page.waitForLoadState('networkidle');assert.deepEqual(await saved(),before,key);assert.equal(await ev(k=>ladeDefekte.has(k),key),true);assert.equal(await ev(()=>ladeProfilSchutz),false);
   await page.waitForFunction(()=>!$('toast').hidden&&/Nicht vollständig lesbar/.test($('toast').textContent));assert.match(await page.locator('#toast').textContent(),/Radprofile wurden trotzdem geladen/);assert.equal(await ev(()=>sichern()),true);assert.equal(await ev(()=>JSON.parse(localStorage.getItem('mtb.profile')).liste.real.length),2);
  }
 });
 await test('Beschaedigte Profile: lesbare Raeder behalten und Originaldaten nicht mit Rettungsstand ueberschreiben',async()=>{
  await fresh();const before=await seed();const raw=await ev(()=>{const q=JSON.parse(localStorage.getItem('mtb.profile'));q.liste.real.push(null);q.aktiv.real='missing-profile';const raw=JSON.stringify(q);localStorage.setItem('mtb.profile',raw);return raw;});await page.reload();await page.waitForLoadState('networkidle');assert.deepEqual(await saved(),before);assert.equal(await ev(()=>ladeProfilSchutz),true);assert.equal(await ev(()=>{speicherFehlerT=0;return sichern();}),false);assert.match(await page.locator('#toast').textContent(),/Radprofile sind geschützt/);assert.equal(await ev(()=>localStorage.getItem('mtb.profile')),raw);
  await ev(()=>localStorage.setItem('mtb.profile','{'));await page.reload();await page.waitForLoadState('networkidle');assert.equal(await ev(()=>sichern()),false);assert.equal(await ev(()=>localStorage.getItem('mtb.profile')),'{');assert.equal(await ev(()=>MODI.every(m=>profile[m].length>0)),true);
  await fresh();const good=await seed();const locked=await ev(()=>{const raw=localStorage.getItem('mtb.profile'),original=Storage.prototype.getItem;Storage.prototype.getItem=function(k){if(k==='mtb.profile')throw new DOMException('Lesen gesperrt','SecurityError');return original.call(this,k);};try{laden();}finally{Storage.prototype.getItem=original;}return{raw,protected:ladeProfilSchutz,save:sichern(),after:localStorage.getItem('mtb.profile')};});assert.equal(locked.protected,true);assert.equal(locked.save,false);assert.equal(locked.after,locked.raw);await page.reload();await page.waitForLoadState('networkidle');assert.deepEqual(await saved(),good);
 });
 await test('Alte Einzelaufbauten migrieren weiterhin ohne Profile oder Fotoverlust',async()=>{
  await fresh();await ev(()=>{localStorage.removeItem('mtb.profile');localStorage.setItem('mtb.builds',JSON.stringify({traum:{rahmen:'f-stumpy'},real:{rahmen:'f-spindrift'},markt:{rahmen:'f-roscoe'}}));localStorage.setItem('mtb.fotos',JSON.stringify({real:'data:image/png;base64,AAAA'}));});await page.reload();await page.waitForLoadState('networkidle');const r=await ev(()=>({rahmen:MODI.map(m=>profile[m][0].build.rahmen),foto:localStorage.getItem(fotoFach(profile.real[0].id)),schutz:ladeProfilSchutz}));assert.deepEqual(r,{rahmen:['f-stumpy','f-spindrift','f-roscoe'],foto:'data:image/png;base64,AAAA',schutz:false});
 });
 await test('Foto-/Profil-Speicherfehler bei Migration: Originalquelle behalten, Kopien zuruecknehmen und spaeter korrekt zuordnen',async()=>{
  for(const target of ['foto','profil']){
   await fresh();const r=await ev(target=>{const raw=JSON.stringify({real:'data:image/png;base64,AAAA'});localStorage.removeItem('mtb.profile');localStorage.setItem('mtb.fotos',raw);const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(target==='foto'?k.startsWith('mtb.foto.'):k==='mtb.profile')throw new DOMException('Speicher voll','QuotaExceededError');return original.call(this,k,v);};try{laden();const save=sichern();return{raw,source:localStorage.getItem('mtb.fotos'),profile:localStorage.getItem('mtb.profile'),copies:Object.keys(localStorage).filter(k=>k.startsWith('mtb.foto.')),open:ladeMigrationOffen,protected:ladeProfilSchutz,visible:fotos.real,save};}finally{Storage.prototype.setItem=original;}},target);
   assert.equal(r.source,r.raw);assert.equal(r.profile,null);assert.deepEqual(r.copies,[]);assert.equal(r.open,true);assert.equal(r.protected,true);assert.equal(r.visible,'data:image/png;base64,AAAA');assert.equal(r.save,false);
   const held=await ev(()=>{const save=sichern();return{save,source:localStorage.getItem('mtb.fotos'),profile:localStorage.getItem('mtb.profile'),copies:Object.keys(localStorage).filter(k=>k.startsWith('mtb.foto.'))};});assert.equal(held.save,false);assert.equal(held.source,r.raw);assert.equal(held.profile,null);assert.deepEqual(held.copies,[]);
   await page.reload();await page.waitForLoadState('networkidle');const ready=await ev(()=>({source:localStorage.getItem('mtb.fotos'),photo:localStorage.getItem(fotoFach(profile.real[0].id)),id:profile.real[0].id,saved:JSON.parse(localStorage.getItem('mtb.profile')).liste.real[0].id,open:ladeMigrationOffen}));assert.equal(ready.source,null);assert.equal(ready.photo,'data:image/png;base64,AAAA');assert.equal(ready.id,ready.saved);assert.equal(ready.open,false);
  }
 });
 await test('Free-Tageslimit gilt vor KI-Aufruf und gemeinsam mit lokalem Guide; Pro bleibt unbegrenzt',async()=>{
  await fresh();
  const r=await ev(async()=>{
   let calls=0;window.auditGuideCalls=()=>calls;
   window.fetch=async()=>{calls++;return new Response(JSON.stringify({answer:'Nur simulierte Antwort',linkIds:[]}),{status:200});};
   pro={};localStorage.setItem('mtb.guidezahl',JSON.stringify({tag:heuteTag(),n:8}));oeffneGuide();
   guideFrage('Was ist SAG?');await new Promise(r=>setTimeout(r,450));
   gKi=true;guideFrage('Was ist LSC?');while(gKiLaeuft)await new Promise(r=>setTimeout(r,1));
   const first={calls,n:guideZahl()};guideFrage('Was ist HSC?');await new Promise(r=>setTimeout(r,450));
   return{first,blocked:{calls,n:guideZahl(),text:$('g-liste').textContent}};
  });
  assert.deepEqual(r.first,{calls:1,n:10});assert.equal(r.blocked.calls,1);assert.equal(r.blocked.n,10);assert.match(r.blocked.text,/freien Fragen aufgebraucht/);
  // Pro hebt das lokale Tageslimit auf, behält aber die globale KI-Pause bei.
  // Echte Zeitgrenze nicht entfernen: im Browser bis hinter die 35-s-Pause vorspulen.
  await page.clock.install();await page.clock.fastForward(35000);
  const proCalls=await ev(async()=>{
   pro={key:'isolated-test',inst:'i',status:'aktiv',geprueft:Date.now()};guideFrage('Was ist Zugstufe?');
   while(gKiLaeuft||gFragen.length||gWarte)await new Promise(r=>setTimeout(r,1));return window.auditGuideCalls();
  });
  assert.equal(proCalls,2);
  await fresh();const limited=await ev(async()=>{let calls=0;window.fetch=async()=>{calls++;return new Response(JSON.stringify({answer:'Simuliert',linkIds:[]}),{status:200});};pro={};localStorage.setItem('mtb.guidezahl',JSON.stringify({tag:heuteTag(),n:9}));const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='mtb.guidezahl')throw new DOMException('Speicher voll','QuotaExceededError');return original.call(this,k,v);};try{oeffneGuide();gKi=true;guideFrage('Was ist SAG?');while(gKiLaeuft)await new Promise(r=>setTimeout(r,1));guideFrage('Was ist LSC?');await new Promise(r=>setTimeout(r,450));return{calls,n:guideZahl(),text:$('g-liste').textContent,stored:JSON.parse(localStorage.getItem('mtb.guidezahl')).n};}finally{Storage.prototype.setItem=original;}});assert.equal(limited.calls,1);assert.equal(limited.n,10);assert.equal(limited.stored,9);assert.match(limited.text,/freien Fragen aufgebraucht/);
 });
 await test('Offline oder abgelehnte Abmeldung behaelt Schluessel und Instanz, bestaetigte Abmeldung entfernt sie',async()=>{
  await fresh();const r=await ev(async()=>{const original={key:'isolated-test-key',inst:'fake-instance',status:'aktiv',geprueft:Date.now()};pro={...original};proSichern();window.fetch=async()=>{throw new Error('offline');};await proEntfernen();const offline=JSON.parse(localStorage.getItem('mtb.pro')),offlineText=$('toast').textContent;window.fetch=async()=>new Response(JSON.stringify({deactivated:false,error:'activation not found'}),{status:200});await proEntfernen();const refused=JSON.parse(localStorage.getItem('mtb.pro'));window.fetch=async()=>new Response(JSON.stringify({deactivated:true}),{status:200});await proEntfernen();return{original,offline,offlineText,refused,success:JSON.parse(localStorage.getItem('mtb.pro')),busy:proLaeuft};});assert.deepEqual(r.offline,r.original);assert.deepEqual(r.refused,r.original);assert.match(r.offlineText,/Code bleibt/);assert.deepEqual(r.success,{});assert.equal(r.busy,false);
 });
 await test('Worker bereinigt nur eigene alte Caches und aktiviert bei Installationsfehler nicht',async()=>{
  const src=fs.readFileSync(path.join(root,'mtb-sw.js'),'utf8'),listeners={},deleted=[],current=/var CACHE = '([^']+)'/.exec(src)[1];let activated=false;
  vm.runInNewContext(src,{self:{location:{origin},addEventListener:(n,f)=>listeners[n]=f,clients:{claim:async()=>{}},skipWaiting:async()=>{activated=true;}},caches:{keys:async()=>[current,'dreambuild-old','crankscore-old','other-app-notes'],delete:async k=>{deleted.push(k);return true;},open:async()=>({addAll:async()=>{throw new Error('offline');}})},Request:class{constructor(u,o){this.url=u;this.options=o;}}});let p;listeners.activate({waitUntil:x=>p=x});await p;assert.deepEqual(deleted.sort(),['crankscore-old','dreambuild-old']);listeners.install({waitUntil:x=>p=x});await assert.rejects(p,/offline/);assert.equal(activated,false);
 });
 await test('Fehlgeschlagenes Update oder ungueltige Versionsantwort erhaelt Offlinecache und aktuelle Seite',async()=>{
  for(const invalid of [false,true]){await fresh();const r=await ev(async invalid=>{const deleted=[];window.fetch=async()=>new Response(invalid?'<html>Portal</html>':"var CACHE = 'dreambuild-audit-future';",{status:200});Object.defineProperty(window,'caches',{configurable:true,value:{keys:async()=>['dreambuild-previous','other-app-notes'],delete:async k=>deleted.push(k)}});Object.defineProperty(navigator,'serviceWorker',{configurable:true,value:{getRegistration:async()=>({update:async()=>{throw new Error('offline');}})}});const old=location.href;await appAktualisieren();return{deleted,url:location.href,old,toast:$('toast').textContent};},invalid);assert.deepEqual(r.deleted,[]);assert.equal(r.url,r.old);assert.match(r.toast,/bisherige App bleibt erhalten/);}
 });
 await test('Bereites Update navigiert erst nach bestaetigtem Offlinecache und loescht keinen fremden Cache',async()=>{
  await fresh();const updates=[];await page.exposeFunction('auditUpdate',x=>updates.push(x));const requested=page.waitForRequest(r=>new URL(r.url()).searchParams.get('v')==='audit-future'),blocked=page.waitForEvent('requestfailed',{predicate:r=>new URL(r.url()).searchParams.get('v')==='audit-future'});await ev(()=>{window.fetch=async()=>new Response("var CACHE = 'dreambuild-audit-future';",{status:200});const worker=new EventTarget();worker.state='installing';let ready=false;Object.defineProperty(window,'caches',{configurable:true,value:{keys:async()=>ready?['dreambuild-audit-future','other-app-notes']:['other-app-notes'],delete:async k=>auditUpdate('delete:'+k),open:async()=>({match:async()=>new Response('Ready')})}});Object.defineProperty(navigator,'serviceWorker',{configurable:true,value:{getRegistration:async()=>({update:async()=>{await auditUpdate('updated');setTimeout(async()=>{ready=true;worker.state='activated';await auditUpdate('activated');worker.dispatchEvent(new Event('statechange'));},40);},installing:worker,waiting:null})}});setTimeout(appAktualisieren,50);});await requested;await blocked;assert.deepEqual(updates,['updated','activated']);assert.equal(navigations.length,1);assert.deepEqual(errors,[]);
 });
 if(!live)await test('Echter Service Worker: offline aktualisieren und neu laden erhaelt Rad, Kernansicht sowie eigenen und fremden Cache',async()=>{
  const offlineCtx=await browser.newContext({serviceWorkers:'allow',locale:'en-US',timezoneId:'UTC',reducedMotion:'reduce'}),offlineErrors=[];
  try{
   await offlineCtx.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
   const p=await offlineCtx.newPage();p.on('pageerror',e=>offlineErrors.push(e.message));
   await p.goto(new URL('manifest.webmanifest',url).href);
   await p.evaluate(async()=>{for(const k of ['einstieg2','szenen','tour','start'])localStorage.setItem('mtb.'+k,'1');localStorage.setItem('mtb.sprache','de');const foreign=await caches.open('other-app-audit');await foreign.put('audit-note.txt',new Response('Fremder Inhalt bleibt'));const old=await caches.open('dreambuild-audit-old');await old.put('audit-old.txt',new Response('Alter eigener Inhalt'));});
   await p.goto(url);
   await p.waitForFunction(()=>navigator.serviceWorker.controller?.state==='activated'&&typeof APP_VERSION!=='undefined',null,{timeout:30000});
   /* Async-Praedikate in waitForFunction werden nicht erneut auf false geprueft.
      Deshalb Cache-I/O ausdruecklich in Node abwarten und bis zum Erfolg pollen. */
   const deadline=Date.now()+30000;let cacheReady=false;
   while(Date.now()<deadline){cacheReady=await p.evaluate(async()=>{if((await caches.keys()).includes('dreambuild-audit-old'))return false;const cache=await caches.open('dreambuild-'+APP_VERSION);return !!await cache.match(new URL('index.html',location.href).href);});if(cacheReady)break;await new Promise(r=>setTimeout(r,100));}
   assert.equal(cacheReady,true,'Installation und Bereinigung der echten Offlinecaches nicht abgeschlossen');
   await p.waitForFunction(()=>typeof zeichne==='function'&&!!document.querySelector('#aufbau .grp'));
   const stored=await p.evaluate(()=>{wechsle('real');build.rahmen='f-spindrift';aktivesProfil().name='Offline-Pruefrad';zeichne();const ok=sichern();return{ok,id:aktivesProfil().id,version:APP_VERSION};});assert.equal(stored.ok,true);
   const before=await p.evaluate(()=>caches.keys());assert.ok(before.includes('other-app-audit'));assert.ok(before.includes('dreambuild-'+stored.version));const workerState=await offlineCtx.serviceWorkers()[0].evaluate(async()=>({cache:CACHE,keys:await caches.keys(),scope:self.registration.scope}));assert.equal(before.includes('dreambuild-audit-old'),false,'Alter eigener Cache nach Worker-Aktivierung: '+JSON.stringify({before,workerState}));
   /* Auch Worker-Netzwerk wirklich unterbrechen: aeltere Playwright-Versionen
      wenden context.setOffline nicht auf jeden Worker-Netzwerkpfad an. */
   await new Promise((resolve,reject)=>{server.close(e=>e?reject(e):resolve());server.closeAllConnections();});
   await offlineCtx.setOffline(true);
   const oldUrl=p.url();await p.evaluate(()=>appAktualisieren());assert.equal(p.url(),oldUrl);assert.match(await p.locator('#toast').textContent(),/Kein Netz/);
   await p.reload({waitUntil:'domcontentloaded'});
   await p.waitForFunction(()=>typeof aktivesProfil==='function'&&aktivesProfil().name==='Offline-Pruefrad'&&!!document.querySelector('#aufbau .grp'));
   const after=await p.evaluate(async()=>{const names=await caches.keys(),own=await caches.open('dreambuild-'+APP_VERSION),foreign=await caches.open('other-app-audit');return{id:aktivesProfil().id,name:aktivesProfil().name,rahmen:build.rahmen,heading:$('mini-p').textContent,view:!$('aufbau').hidden,names,own:!!await own.match(new URL('index.html',location.href).href),foreign:await (await foreign.match('audit-note.txt')).text(),saved:JSON.parse(localStorage.getItem('mtb.profile')).liste.real.find(p=>p.id===aktivId.real).name};});
   assert.equal(after.id,stored.id);assert.equal(after.name,'Offline-Pruefrad');assert.equal(after.saved,after.name);assert.equal(after.rahmen,'f-spindrift');assert.equal(after.heading,after.name);assert.equal(after.view,true);assert.equal(after.own,true);assert.ok(after.names.includes('dreambuild-'+stored.version));assert.ok(after.names.includes('other-app-audit'));assert.equal(after.names.includes('dreambuild-audit-old'),false,'Alter eigener Cache nach Offline-Reload: '+JSON.stringify(after.names));assert.equal(after.foreign,'Fremder Inhalt bleibt');assert.deepEqual(offlineErrors,[]);
  }finally{await offlineCtx.close();}
 });else console.log('  SKIP Echter lokaler Service-Worker-Lauf: bei CRANKSCORE_LIVE_URL wird der lokale Installationsfall ausgelassen.');
}finally{await browser.close();if(server?.listening)await new Promise(r=>server.close(r));}
console.log(`ZUVERLAESSIGKEIT: ${count-failed} von ${count} Prüfungen bestanden.`);
if(failed)process.exitCode=1;
