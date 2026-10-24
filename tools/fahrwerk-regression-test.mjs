/* Gezielte F01–F04-Regressionen. Nur isolierte Daten und lokale GETs.
 * Optional: CRANKSCORE_SOURCE_ROOT, CRANKSCORE_LIVE_URL, CRANKSCORE_SCREENSHOTS.
 * Aus dem Scratch ausfuehrbar; nach tools/ kopiert ebenfalls ohne Pfadanpassung. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(process.env.CRANKSCORE_SOURCE_ROOT||(fs.existsSync(path.join(dir,'../index.html'))?path.join(dir,'..'):path.join(dir,'../../crankscore')));
const {chromium}=createRequire(path.join(root,'package.json'))('playwright');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.webmanifest':'application/manifest+json'};
const server=process.env.CRANKSCORE_LIVE_URL?null:http.createServer((q,r)=>{const f=path.resolve(root,'.'+new URL(q.url,'http://local').pathname);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){r.writeHead(404);return r.end();}r.setHeader('Content-Type',mime[path.extname(f)]||'application/octet-stream');r.end(fs.readFileSync(f));});
if(server)await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=process.env.CRANKSCORE_LIVE_URL||`http://127.0.0.1:${server.address().port}/index.html`,origin=new URL(url).origin;
const browser=await chromium.launch(process.platform==='win32'?{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}:{});
let count=0,failed=0;const results=[];
const ev=(p,f,arg)=>p.evaluate(f,arg);
async function fresh(){
 const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',locale:'de-DE',serviceWorkers:'block'}),errors=[],posts=[];
 await ctx.route('**/*',r=>new URL(r.request().url()).origin===origin&&r.request().method()==='GET'?r.continue():(posts.push(r.request().url()),r.abort()));
 const page=await ctx.newPage();page.setDefaultTimeout(8000);page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url);await ev(page,()=>{localStorage.clear();for(const k of ['einstieg2','szenen','tour','start'])localStorage.setItem('mtb.'+k,'1');localStorage.setItem('mtb.sprache','de');});await page.reload();
 await page.waitForFunction(()=>typeof suTeilAktualisieren==='function');
 await ev(page,()=>{
  schliesse();schliesseStartseite();pro={key:'isolated',inst:'i',status:'aktiv',geprueft:Date.now()};wechsle('real');
  build.rahmen='f-spindrift';build.gabel=findeTeil('gabel','g-zeb').id;build.daempfer=findeTeil('daempfer','d-sd').id;plan.fahrer=100;
  delete build.fw;fwPruef();Object.assign(fwInfo(),{gj:2027,dj:2027,fertig:true,fragenVersion:FW_FRAGEN_VERSION,stil:{gelaende:'ruppig',tempo:'zuegig',spruenge:'klein',gefuehl:'mittel',bergauf:'egal'}});
  fwInfo().besucht=Object.fromEntries(obSchritte().map(n=>[n,true]));fwPruef();fedModus='allround';suAuf.clear();suErstGezeigt.clear();suElWahl='gabel';view='aufbau';sichern();zeichne();
 });
 return{ctx,page,errors,posts};
}
async function reload(page){await page.reload();await page.waitForFunction(()=>typeof suDaten==='function');await ev(page,()=>{pro={key:'isolated',inst:'i',status:'aktiv',geprueft:Date.now()};view='aufbau';});}
async function swap(page,slot,id){return ev(page,({slot,id})=>{build[slot]=id;fwPruef();fwInfo().fertig=true;fwInfo().gj=2027;fwInfo().dj=2027;sichern();const f=federRechnen(),d=suDaten(f);return{key:suKey(f),g:suPsi('gabel',f.gabel,d),d:suPsi('daempfer',f.daempfer,d)};},{slot,id});}
async function test(name,fn){count++;const s=await fresh();try{const evidence=await fn(s.page);assert.deepEqual(s.errors,[],'Browserfehler');assert.deepEqual(s.posts,[],'Unerlaubte externe Requests');results.push({name,ok:true,evidence});console.log('  ok   '+name);}catch(e){failed++;results.push({name,ok:false,error:e.stack});console.log('  FEHL '+name+'\n       '+e.stack);if(process.env.CRANKSCORE_SCREENSHOTS){fs.mkdirSync(process.env.CRANKSCORE_SCREENSHOTS,{recursive:true});await s.page.screenshot({path:path.join(process.env.CRANKSCORE_SCREENSHOTS,`f01-${count}.png`)});}}finally{await s.ctx.close();}}
try{
 await test('F01 Rueckwechsel behaelt letzten Gabeldruck und speichert ihn vor Reload',async p=>{
  const ids=await ev(p,()=>{const f=federRechnen(),d=suDaten(f);suPsiSetzen(f,d,'gabel',f.gabel,102);return{a:build.daempfer,b:findeTeil('daempfer','d-sdcoil').id};});
  assert.equal((await swap(p,'daempfer',ids.b)).g,102);await ev(p,()=>{const f=federRechnen();suPsiSetzen(f,suDaten(f),'gabel',f.gabel,110);});
  assert.equal((await swap(p,'daempfer',ids.a)).g,110);await reload(p);assert.equal(await ev(p,()=>{const f=federRechnen();return suPsi('gabel',f.gabel,suDaten(f));}),110);
 });
 await test('F01 Spiegelbildlicher Gabelwechsel behaelt aktuellen Daempferdruck',async p=>{
  const ids=await ev(p,()=>{const f=federRechnen(),d=suDaten(f);suPsiSetzen(f,d,'daempfer',f.daempfer,180);return{a:build.gabel,b:findeTeil('gabel','g-lyrik').id};});
  assert.equal((await swap(p,'gabel',ids.b)).d,180);await ev(p,()=>{const f=federRechnen();suPsiSetzen(f,suDaten(f),'daempfer',f.daempfer,190);});
  assert.equal((await swap(p,'gabel',ids.a)).d,190);
 });
 await test('F01 Alle Fahrprofile: psi, Feintuning, SAG, Haken und Baseline nur am unveraenderten Teil',async p=>{
  const ids=await ev(p,()=>{const f=federRechnen(),d=suDaten(f);for(const [i,m]of FMODI.entries()){const P=d.prof[m];P.psi={gabel:100+i,daempfer:170+i};P.off={'gabel|Zugstufe':i+1,'daempfer|Zugstufe':i+4};P.sag.gabel={mm:31+i,t:i+1};P.fertig['gabel:sag']=true;P.gesp={t:10+i,psi:{gabel:100+i,daempfer:170+i},off:{'gabel|Zugstufe':i+1,'daempfer|Zugstufe':i+4}};}suSichern();return{a:build.daempfer,b:findeTeil('daempfer','d-sdcoil').id};});
  await swap(p,'daempfer',ids.b);await ev(p,()=>{const d=suDaten();for(const [i,m]of FMODI.entries()){const P=d.prof[m];P.psi.gabel=120+i;P.off['gabel|Zugstufe']=i+8;P.sag.gabel={mm:34+i,t:30+i};P.fertig['gabel:sag']=false;P.gesp={t:30+i,psi:{gabel:120+i},off:{'gabel|Zugstufe':i+8}};}suSichern();});
  await swap(p,'daempfer',ids.a);const got=await ev(p,()=>FMODI.map(m=>suDaten().prof[m]));for(const [i,P]of got.entries()){assert.equal(P.psi.gabel,120+i);assert.equal(P.psi.daempfer,170+i);assert.equal(P.off['gabel|Zugstufe'],i+8);assert.equal(P.off['daempfer|Zugstufe'],i+4);assert.equal(P.sag.gabel.mm,34+i);assert.equal(P.fertig['gabel:sag'],false);assert.equal(P.gesp.psi.gabel,120+i);assert.equal(P.gesp.psi.daempfer,170+i);assert.equal(P.gesp.off['daempfer|Zugstufe'],i+4);}
 });
 await test('F01 Bewusstes Leeren gewinnt gegen alten Paarstand und bleibt nach Reload leer',async p=>{
  const ids=await ev(p,()=>{const f=federRechnen(),d=suDaten(f);for(const m of FMODI){const P=d.prof[m];P.psi.gabel=102;P.alt={gabel:1.1};P.off['gabel|Zugstufe']=2;P.sag.gabel={mm:30};P.fertig['gabel:sag']=true;P.gesp={t:1,psi:{gabel:102},off:{'gabel|Zugstufe':2}};}suSichern();return{a:build.daempfer,b:findeTeil('daempfer','d-sdcoil').id};});await swap(p,'daempfer',ids.b);
  await ev(p,()=>{const d=suDaten();for(const m of FMODI){const P=d.prof[m];delete P.psi.gabel;delete P.alt?.gabel;delete P.off['gabel|Zugstufe'];delete P.sag.gabel;delete P.fertig['gabel:sag'];P.gesp=null;}suLog(d,{typ:'empfehlung'});suSichern();});await swap(p,'daempfer',ids.a);await reload(p);
  const got=await ev(p,()=>FMODI.map(m=>suDaten().prof[m]));for(const P of got){assert.equal(P.psi.gabel,undefined);assert.equal(P.alt?.gabel,undefined);assert.equal(P.off['gabel|Zugstufe'],undefined);assert.equal(P.sag.gabel,undefined);assert.equal(P.fertig['gabel:sag'],undefined);assert.equal(P.gesp,null);}
 });
 await test('F01 Varianten-IDs mit | und Reload vor erstem Setup-Aufruf bleiben richtig zugeordnet',async p=>{
  const ids=await ev(p,()=>{const f=federRechnen(),d=suDaten(f);suPsiSetzen(f,d,'gabel',f.gabel,102);return{a:build.daempfer,b:findeTeil('daempfer','d-sdcoil').id,g:build.gabel};});assert.ok(ids.a.includes('|')&&ids.b.includes('|')&&ids.g.includes('|'));
  await swap(p,'daempfer',ids.b);await ev(p,()=>{const f=federRechnen();suPsiSetzen(f,suDaten(f),'gabel',f.gabel,110);view='aufbau';sichern();});await reload(p);assert.equal((await swap(p,'daempfer',ids.a)).g,110);
 });
 await test('F01 Basis-/Alias-ID wird beim Reload-Seed zum kanonischen Paar aufgeloest',async p=>{
  const ids=await ev(p,()=>{build.gabel='g-zeb';build.daempfer='d-sd';fwPruef();fwInfo().gj=fwInfo().dj=2027;fwInfo().fertig=true;const f=federRechnen(),d=suDaten(f);suPsiSetzen(f,d,'gabel',f.gabel,102);return{a:'d-sd',b:findeTeil('daempfer','d-sdcoil').id};});await swap(p,'daempfer',ids.b);await ev(p,()=>{const f=federRechnen();suPsiSetzen(f,suDaten(f),'gabel',f.gabel,110);view='aufbau';sichern();});await reload(p);assert.equal((await swap(p,'daempfer',ids.a)).g,110);
 });
 await test('F01 Verschiedene Raeder teilen keine aktuellen Bauteilwerte',async p=>{
  const ids=await ev(p,()=>{const f=federRechnen();suPsiSetzen(f,suDaten(f),'gabel',f.gabel,102);const a=aktivId[modus];profilNeu(a);const b=aktivId[modus];const f2=federRechnen();suPsiSetzen(f2,suDaten(f2),'gabel',f2.gabel,150);return{a,b,shock:findeTeil('daempfer','d-sdcoil').id};});await swap(p,'daempfer',ids.shock);
  await ev(p,id=>profilWechseln(id),ids.a);assert.equal(await ev(p,()=>{const f=federRechnen();return suPsi('gabel',f.gabel,suDaten(f));}),102);
  await ev(p,id=>profilWechseln(id),ids.b);assert.equal(await ev(p,()=>{const f=federRechnen();return suPsi('gabel',f.gabel,suDaten(f));}),150);
 });
 await test('F01 Aktive Tests: Quelle unveraendert, nur Ziel-Test des uebernommenen Elements endet',async p=>{
  const got=await ev(p,()=>{const f=federRechnen(),a=suDaten(f),aid=build.daempfer;suP(a).psi.gabel=102;a.test={k:'gabel|Zugstufe',p:'allround',best:1,cur:2};a.tr={stand:'test',p:'allround',c:{art:'knopf',slot:'daempfer',key:'daempfer|Zugstufe',vorher:3,neu:4}};a.log.push({typ:'notiz',txt:'A bleibt',t:1});suSichern();build.daempfer=findeTeil('daempfer','d-sdcoil').id;fwPruef();const b=suDaten(federRechnen());suP(b).psi.gabel=125;b.tr={stand:'test',p:'allround',c:{art:'psi',slot:'gabel',vorher:110,neu:125}};b.test={k:'daempfer|Zugstufe',p:'allround',best:2,cur:3};b.log.push({typ:'notiz',txt:'B bleibt',t:2});const source=JSON.stringify(b),other=JSON.stringify(a.tr);build.daempfer=aid;fwPruef();const dest=suDaten(federRechnen());const step1={psi:suP(dest).psi.gabel,test:dest.test,tr:JSON.stringify(dest.tr),sourceSame:JSON.stringify(b)===source,note:dest.log.some(e=>e.txt==='A bleibt')};dest.tr={stand:'test',p:'allround',c:{art:'psi',slot:'gabel',vorher:102,neu:104}};dest.test={k:'daempfer|Zugstufe',p:'allround',best:3,cur:4};suTeilAktualisieren(dest,b,'gabel');return{...step1,other,step2tr:dest.tr,step2test:dest.test.k,sourceStillSame:JSON.stringify(b)===source};});
  assert.equal(got.psi,110);assert.equal(got.test,null);assert.equal(got.tr,got.other);assert.equal(got.sourceSame,true);assert.equal(got.note,true);assert.equal(got.step2tr,null);assert.equal(got.step2test,'daempfer|Zugstufe');assert.equal(got.sourceStillSame,true);
 });
 await test('F02 475-lbs-Feder bleibt in Setup-Karte und lokalem Guide der aktuelle Wert',async p=>{
  const data=await ev(p,()=>{build.daempfer=findeTeil('daempfer','d-sdcoil').id;fwPruef();Object.assign(fwInfo(),{dj:2025,df:475,fertig:true});const f=federRechnen();oeffneTrailKarte();return{actual:f.daempfer.federIst,recommended:f.daempfer.rate,guide:gFederung().h};});assert.equal(data.actual,475);assert.notEqual(data.recommended,475);assert.match(data.guide,/475 lbs\/in/);const rear=p.locator('#ad-pop .trk-sek').last();assert.match(await rear.innerText(),/475\s*lbs/);assert.doesNotMatch(await rear.innerText(),new RegExp(data.recommended+'\\s*lbs'));return data;
 });
 await test('F03 SAG10psi erzeugt keinen Wert unter10, zentrale Uebernahme weist8psi ab',async p=>{
  const data=await ev(p,()=>{const f=federRechnen(),d=suDaten(f);suPsiSetzen(f,d,'gabel',f.gabel,10);suSagSetzen('gabel',5);oeffneSagWizard('gabel');sagW.i=4;zeigeSheet(sagWizardHtml());return{html:fxSagHtml('gabel',f.gabel,d),buttons:[...document.querySelectorAll('#modal [data-supsi]')].map(b=>+b.dataset.supsi.split('|')[1])};});assert.doesNotMatch(data.html,/<b>8 psi<\/b>|Auf 8 psi/);assert.ok(data.buttons.every(x=>x>=10));assert.equal(await ev(p,()=>{const f=federRechnen(),d=suDaten(f);suPsiSetzen(f,d,'gabel',f.gabel,8);return suPsi('gabel',f.gabel,d);}),10);return data.buttons;
 });
 await test('F04 Gewogenes Rad und eigene Montur:130kg loesen120kg-Laufradgrenze aus',async p=>{
  const got=await ev(p,()=>{plan.fahrer=95;build.radKg=25;fprofil.montur={teile:[],eigen:10};build.laufraeder='w-dtm1900';const r=bewerte(build),x=r.funde.find(x=>/Systemgewicht über|System weight above/i.test(x.titel));return{actual:systemKg()+build.radKg,max:findeTeil('laufraeder',build.laufraeder).maxSys,title:x?.titel,text:x?.text};});assert.equal(got.actual,130);assert.equal(got.max,120);assert.ok(got.title);assert.match(got.text,/130 kg/);assert.match(got.text,/25 kg/);assert.match(got.text,/10 kg/);return got;
 });
}finally{await browser.close();if(server)await new Promise(r=>{server.close(r);server.closeAllConnections();});if(process.env.CRANKSCORE_TEST_RESULTS)fs.writeFileSync(process.env.CRANKSCORE_TEST_RESULTS,JSON.stringify(results,null,2));}
console.log(`FAHRWERK-REGRESSION: ${count-failed} von ${count} bestanden`);if(failed)process.exitCode=1;
