/* Abschliessende Live-Gegenprobe, ausschliesslich isolierte synthetische Daten.
 * Erst nach bestaetigter Veroeffentlichung ausfuehren.
 * Pflicht: CRANKSCORE_EXPECT_VERSION (exakter neuer APP_VERSION-Stempel).
 * Optional: CRANKSCORE_LIVE_OUTPUT, CRANKSCORE_SOURCE_ROOT, CRANKSCORE_LIVE_URL.
 * Keine echten KI-, Lizenz-, Kauf- oder sonstigen API-Anfragen. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(process.env.CRANKSCORE_SOURCE_ROOT||path.join(here,'../../..'));
const expected=process.env.CRANKSCORE_EXPECT_VERSION;
if(!expected||!/^\d{8}-\d{4}$/.test(expected))throw new Error('Erst nach Veroeffentlichung: CRANKSCORE_EXPECT_VERSION auf den exakten neuen Versionsstempel setzen.');
const url=process.env.CRANKSCORE_LIVE_URL||'https://trostliam-hub.github.io/dreambuild/index.html',base=new URL(url),folder=new URL('.',base).pathname;
const output=path.resolve(process.env.CRANKSCORE_LIVE_OUTPUT||path.join(here,'live-pruefung'));
fs.mkdirSync(output,{recursive:true});
const {chromium}=createRequire(path.join(root,'package.json'))('playwright');
const browser=await chromium.launch(process.platform==='win32'?{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}:{});
const report={url,expected,started:new Date().toISOString(),checks:[],versions:[],blocked:[],errors:[],screenshots:[]};
let count=0,failed=0;
const ev=(p,f,a)=>p.evaluate(f,a);
const clone=v=>JSON.parse(JSON.stringify(v));
async function version(p,response){const v=await ev(p,()=>APP_VERSION);assert.equal(v,expected,'Die Onlineversion entspricht noch nicht der freigegebenen Veroeffentlichung');const item={version:v};if(response)item.sha256=crypto.createHash('sha256').update(await response.body()).digest('hex');report.versions.push(item);}
async function ready(p){await p.waitForFunction(()=>typeof fwPruef==='function'&&typeof wunschListe==='function');await version(p);}
async function reload(p){await p.reload({waitUntil:'domcontentloaded'});await ready(p);await ev(p,()=>{pro={key:'synthetic-live-ui-only',inst:'none',status:'aktiv',geprueft:Date.now()};view='aufbau';});}
async function shot(p,name){await ev(p,()=>document.fonts?.ready);const file=path.join(output,name+'.png');await p.screenshot({path:file,animations:'disabled'});report.screenshots.push(file);return file;}
async function layout(p,label){const r=await ev(p,()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,body:document.body.scrollWidth}));assert.ok(r.scroll<=r.width&&r.body<=r.width,`${label}: horizontales Ueberstehen ${JSON.stringify(r)}`);}
async function test(name,fn,p){count++;try{const detail=await fn();await layout(p,name);report.checks.push({name,ok:true,detail});console.log('  ok   '+name);}catch(e){failed++;report.checks.push({name,ok:false,error:e.stack});console.log('  FEHL '+name+'\n       '+e.stack);try{await shot(p,'fehler-'+count);}catch{}}}
async function protectedState(p,meta){return ev(p,meta=>({
 active:aktivId[modus],name:aktivesProfil().name,plan:JSON.parse(JSON.stringify(plan)),koerper:JSON.parse(JSON.stringify(koerper)),fprofil:JSON.parse(JSON.stringify(fprofil)),
 other:JSON.parse(JSON.stringify(profile.real.find(x=>x.id===meta.otherId))),wishes:JSON.parse(JSON.stringify(wunschListe())),
 notes:Object.entries(setupAlle).flatMap(([key,d])=>(d.log||[]).filter(e=>e.typ==='notiz').map(e=>({key,...e})))
}),meta);}
async function seed(p,cfg){
 const response=await p.goto(url,{waitUntil:'domcontentloaded'});await ready(p);await version(p,response);
 await ev(p,cfg=>{localStorage.clear();for(const k of ['einstieg2','szenen','tour','start'])localStorage.setItem('mtb.'+k,'1');localStorage.setItem('mtb.sprache',cfg.lang);localStorage.setItem('mtb.design',cfg.theme);},cfg);
 await reload(p);
 return ev(p,()=>{
  schliesse();schliesseStartseite();wechsle('real');setzeBau(leerBau(),true);
  build.rahmen='f-spindrift';build.gabel='g-zeb';build.daempfer=findeTeil('daempfer','d-sd').id;
  plan.fahrer=100;plan.budget=2400;koerper.groesse=182;fprofil.montur={teile:[],eigen:5};
  aktivesProfil().name='Synthetische Live-Pruefung';aktivesProfil().nein={};
  const w={id:'live-wunsch-budget',slot:'bremsen',teil:findeTeil('bremsen','b-mt7').id,ziel:'kraft',budget:400,zeit:1792850400000,stufe:'einkauf'};
  aktivesProfil().wuensche=[w,{id:'live-wunsch-frei',slot:'gabel',teil:null,frei:{n:'Synthetische eigene Gabel',l:'https://example.invalid/kein-aufruf'},ziel:'passend',budget:120,zeit:1792850400001,stufe:'gemerkt'}];
  const other=profilLeer('real');other.name='Zweites synthetisches Rad';other.nein={};other.wuensche=[{...w,budget:222}];profile.real.push(other);
  delete build.fw;fwPruef();Object.assign(fwInfo(),{gj:2027,dj:2027,fertig:true,fragenVersion:FW_FRAGEN_VERSION,zustand:'gut',werkzeug:'vorhanden',stil:{gelaende:'ruppig',tempo:'zuegig',spruenge:'klein',gefuehl:'mittel',bergauf:'egal'}});fwInfo().besucht=Object.fromEntries(obSchritte().map(x=>[x,true]));fwPruef();fedModus='allround';
  const f=federRechnen(),d=suDaten(f);suPsiSetzen(f,d,'gabel',f.gabel,102);suLog(d,{typ:'notiz',txt:'ISOLATED-LIVE-SETUP-NOTE'});suSichern();kSichern();fSichern();view='aufbau';sichern();zeichne();
  return{rad:aktivId.real,otherId:other.id,a:build.daempfer,b:findeTeil('daempfer','d-sdcoil').id};
 });
}
async function swap(p,id){return ev(p,id=>{build.daempfer=id;fwPruef();fwInfo().dj=2027;fwInfo().fertig=true;sichern();const f=federRechnen(),d=suDaten(f);return suPsi('gabel',f.gabel,d);},id);}
try{
 for(const cfg of [{lang:'de',width:390,theme:'oled'},{lang:'en',width:320,theme:'hell'}]){
  const ctx=await browser.newContext({viewport:{width:cfg.width,height:844},locale:cfg.lang==='de'?'de-DE':'en-US',timezoneId:'UTC',serviceWorkers:'block',reducedMotion:'reduce'});
  await ctx.route('**/*',r=>{const q=r.request(),u=new URL(q.url());
   // Nur statische Dateien dieses App-Verzeichnisses duerfen das Netzwerk erreichen.
   if(u.origin===base.origin&&u.pathname.startsWith(folder)&&['GET','HEAD'].includes(q.method())&&/\.(?:html|js|json|webmanifest|woff2?|png|jpe?g|webp|svg|glb)$/i.test(u.pathname))return r.continue();
   report.blocked.push({method:q.method(),url:u.href});return r.abort();
  });
  const p=await ctx.newPage();p.setDefaultTimeout(12000);const errors=[];p.on('pageerror',e=>{errors.push(e.message);report.errors.push({screen:cfg.width+'/'+cfg.lang,message:e.message});});
  const label=cfg.width+'/'+cfg.lang;
  try{
   const meta=await seed(p,cfg),before=await protectedState(p,meta),wanted=clone(before);
   await test('F01 '+label+' Rueckwechsel und Reload erhalten110psi',async()=>{
    assert.equal(await swap(p,meta.b),102);await ev(p,()=>{const f=federRechnen();suPsiSetzen(f,suDaten(f),'gabel',f.gabel,110);view='aufbau';sichern();});
    await reload(p);assert.equal(await swap(p,meta.a),110);await reload(p);const psi=await ev(p,()=>{const f=federRechnen();return suPsi('gabel',f.gabel,suDaten(f));});assert.equal(psi,110);assert.deepEqual(await protectedState(p,meta),wanted);return{psi};
   },p);
   await test('F02 '+label+' Eingebaute475lbs erscheinen in Setup-Karte und Guide',async()=>{
    await swap(p,meta.b);await ev(p,()=>{fwInfo().dj=2025;fwInfo().df=475;fwInfo().fertig=true;view='aufbau';sichern();zeichne();});
    await p.locator('.tabs [data-view="setup"]').click();await p.locator('#setup [data-fwel="daempfer"]').click();
    const data=await ev(p,()=>{const f=federRechnen();return{own:f.daempfer.federIst,recommended:f.daempfer.rate,guide:gFederung().h};});assert.equal(data.own,475);assert.notEqual(data.recommended,475);assert.match(data.guide,/475 lbs\/in/);
    await p.locator('#setup [data-fxtrail]').click();const text=await p.locator('#ad-pop .trk-sek').last().innerText();assert.match(text,/475\s*lbs/);assert.doesNotMatch(text,new RegExp(data.recommended+'\\s*lbs'));await layout(p,label+' Setup-Karte');
    await p.locator('#ad-pop .adp-zu').click();assert.deepEqual(await protectedState(p,meta),wanted);return data;
   },p);
   await test('U01 '+label+' Echter Vergleichsklick oeffnet Fahrwerkdialog',async()=>{
    await p.locator('#setup [data-fwvgl]').click();assert.equal(await p.locator('#modal .fw-vgl').count(),1);let text=await p.locator('#modal .fw-vgl').innerText();assert.match(text,cfg.lang==='en'?/Fork/:/Gabel/);assert.match(text,cfg.lang==='en'?/Shock/:/Dämpfer/);assert.equal(await p.locator('#modal .fw-v thead th').count(),4);
    const spring=p.locator('#modal tr').filter({has:p.locator('th[scope="row"]',{hasText:/^(Feder|Spring)$/})});
    assert.deepEqual(await spring.locator('td').allTextContents(),['475 lbs','475 lbs','475 lbs']);
    await layout(p,label+' Fahrwerkvergleich');await shot(p,`fahrwerkvergleich-${cfg.width}-${cfg.lang}`);
    await p.locator('#modal [data-fwvglart="einzel"]').click();assert.equal(await p.locator('#modal .fw-v thead th').count(),5);assert.equal((await spring.locator('td').allTextContents())[1],'475 lbs');await layout(p,label+' Einzelvergleich');
    await p.locator('#modal .sheet-h [data-zu]').click();assert.deepEqual(await protectedState(p,meta),wanted);return{columns:4,singleColumns:5};
   },p);
   await test('U02 '+label+' Wunschbudget400→750 per Dialog speichern und reloaden',async()=>{
    await p.locator('.tabs [data-view="wunsch"]').click();await p.locator('[data-wfinder="live-wunsch-budget"]').click();assert.equal(await p.locator('#wz-budget').inputValue(),'400');
    await p.locator('#wz-budget').fill('750');await layout(p,label+' Budgetdialog');await shot(p,`budgetdialog-${cfg.width}-${cfg.lang}`);
    await p.locator('#modal [data-wzielsave]').click();assert.equal(await p.locator('#wz-budget').count(),0);wanted.wishes[0].budget=750;
    assert.deepEqual(await protectedState(p,meta),wanted);await reload(p);assert.deepEqual(await protectedState(p,meta),wanted);
    await ev(p,()=>{view='wunsch';zeichne();});await p.locator('[data-wfinder="live-wunsch-budget"]').click();assert.equal(await p.locator('#wz-budget').inputValue(),'750');await p.locator('#modal .sheet-h [data-zu]').click();return{before:400,after:750};
   },p);
   await test('DATEN '+label+' Testfelder erhalten, keine JS-Fehler und kein API-Aufruf',async()=>{
    assert.deepEqual(await protectedState(p,meta),wanted);assert.deepEqual(errors,[]);assert.deepEqual(report.blocked,[],'Unerwarteter externer oder nichtstatischer Request wurde blockiert');assert.equal(await ev(p,()=>navigator.serviceWorker?.controller||null),null);return{profile:meta.rad,otherProfile:meta.otherId,bodyFieldsPreserved:true,setupNote:true,wishes:2};
   },p);
  }finally{await ctx.close();}
 }
}catch(e){failed++;report.fatal=e.stack;console.error(e.stack);}
finally{await browser.close();report.finished=new Date().toISOString();report.count=count;report.failed=failed;fs.writeFileSync(path.join(output,'ergebnis.json'),JSON.stringify(report,null,2));}
console.log(`LIVE-OPTIMIERUNG: ${report.checks.filter(x=>x.ok).length} von ${count} bestanden${report.fatal?' (Vorpruefung abgebrochen)':''}`);console.log('Bericht: '+path.join(output,'ergebnis.json'));if(failed)process.exitCode=1;
