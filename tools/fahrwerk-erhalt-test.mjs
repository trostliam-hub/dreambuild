/* Fahrwerk-Datenerhalt bei Teilewechsel und Testfahrt (APP-CLAUDE-AUDIT-001, CS-01/CS-02).
 * Aufruf: node tools/fahrwerk-erhalt-test.mjs
 * Ausschliesslich isolierte synthetische Testprofile; externe Requests werden blockiert.
 * Geprueft wird der gespeicherte Stand nach echtem Neuladen, nicht nur die Anzeige.
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
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const fileFor=u=>{const f=path.resolve(root,'.'+decodeURIComponent(new URL(u,'http://localhost').pathname));return f===root?path.join(root,'index.html'):f;};
const allowed=f=>f.startsWith(root+path.sep)&&fs.existsSync(f)&&fs.statSync(f).isFile();
const server=http.createServer((q,r)=>{let f;try{f=fileFor(q.url);}catch{r.writeHead(400);r.end();return;}
  if(!allowed(f)){r.writeHead(404);r.end();return;}
  r.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=`http://127.0.0.1:${server.address().port}/index.html`,origin=new URL(url).origin;
const browser=await pw.chromium.launch({channel:process.env.CRANKSCORE_BROWSER_CHANNEL||(process.platform==='win32'?'chrome':undefined)});
const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'de-DE',timezoneId:'Europe/Berlin',reducedMotion:'reduce',serviceWorkers:'block'});
await ctx.route('**/*',r=>new URL(r.request().url()).origin===origin&&['GET','HEAD'].includes(r.request().method())?r.continue():r.abort());
const page=await ctx.newPage(),errors=[];
page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));
const ev=(f,a)=>page.evaluate(f,a);
const bereit=()=>page.waitForFunction(()=>typeof suDaten==='function'&&typeof federRechnen==='function'&&!!document.querySelector('#aufbau'));
const neuLaden=async()=>{await ev(()=>{sichern();suSichern();});await page.reload();await bereit();};

/* Rad wie im Audit: Propain Spindrift, ZEB, Super Deluxe Coil mit 475-lbs-Feder, Fahrwerkfragen fertig */
const frisch=async()=>{
  await page.goto(url);
  await ev(()=>{localStorage.clear();for(const k of ['einstieg2','tour','szenen','start'])localStorage.setItem('mtb.'+k,'1');localStorage.setItem('mtb.sprache','de');});
  await page.reload();await bereit();
  await ev(()=>{
    schliesse();schliesseStartseite();wechsle('real');
    build.rahmen='f-spindrift';build.gabel='g-zeb';
    const t=katalog(quelleOf(slotOf('daempfer'))).find(t=>t.id==='d-sdcoil');if(!t)throw new Error('Super-Deluxe-Coil fehlt');
    build.daempfer=besteVariante('daempfer',t,build).id;plan.fahrer=80;
    delete build.fw;fwPruef();const fw=fwInfo();fw.fertig=true;fw.fragenVersion=FW_FRAGEN_VERSION;fw.gj=2027;fw.dj=2025;fw.df=475;
    fw.besucht=Object.fromEntries(obSchritte().filter(n=>!['start','ende'].includes(n)).map(n=>[n,true]));
    fw.stil={gelaende:'ruppig',tempo:'zuegig',spruenge:'klein',gefuehl:'mittel',bergauf:'egal'};
    fedModus='allround';sichern();
  });
};
/* Werte des unveraenderten Elements in zwei Fahrprofilen, Messung, Haken, Grundeinstellung, Notiz */
const werteSetzen=slot=>ev(slot=>{
  const f=federRechnen(),d=suDaten(f),x=f[slot],knopf=slot+'|Zugstufe';
  for(const [p,psi,off] of [['allround',102,2],['downhill',98,3]]){
    const P=suP(d,p);if(!x.coil)P.psi[slot]=psi;P.off[knopf]=off;P.fertig[slot+(x.coil?':feder':':luft')]=true;
    P.gesp={t:Date.now(),off:{[knopf]:off},psi:x.coil?{}:{[slot]:psi}};
  }
  fedModus='allround';suSagSetzen(slot,slot==='gabel'?36:17);
  if(!x.coil)suLog(d,{typ:'psi',slot,alt:130,neu:102});suLog(d,{typ:'knopf',k:knopf,off:2});
  suLog(d,{typ:'notiz',txt:'Paarnotiz: '+slot+' bleibt'});suLog(d,{typ:'tr',txt:'Paar-Testfahrt'});suSichern();
  return {key:suKey(f),eintrag:JSON.parse(JSON.stringify(d))};
},slot);
const tauschen=(slot,id)=>ev(([slot,id])=>{const t=katalog(quelleOf(slotOf(slot))).find(t=>t.id===id);if(!t)throw new Error(id+' fehlt');
  build[slot]=besteVariante(slot,t,build).id;sichern();},[slot,id]);
const stand=slot=>ev(slot=>{const f=federRechnen(),d=suDaten(f),x=f[slot],andere=slot==='gabel'?'daempfer':'gabel';
  const nurAndere=o=>Object.keys(o||{}).filter(k=>k.startsWith(andere+'|')||k.startsWith(andere+':'));
  return {key:suKey(f),prof:Object.fromEntries(FMODI.map(p=>{const P=suP(d,p);return [p,{psi:P.psi[slot]||null,off:P.off[slot+'|Zugstufe']||0,
      sag:P.sag[slot]?P.sag[slot].mm:null,fertig:Object.keys(P.fertig).filter(k=>k.startsWith(slot)),gesp:P.gesp?{off:P.gesp.off[slot+'|Zugstufe']||0,psi:(P.gesp.psi||{})[slot]||null}:null,
      andere:{psi:P.psi[andere]||null,off:nurAndere(P.off),sag:!!P.sag[andere],fertig:nurAndere(P.fertig),gesp:P.gesp?nurAndere(P.gesp.off).length+(P.gesp.psi&&P.gesp.psi[andere]?1:0):0}}];})),
    messGueltig:fxMess(slot,x,d),anzeigePsi:x.coil?null:suPsi(slot,x,d),log:d.log.map(e=>e.typ+':'+(e.k||e.slot||'')),fw:JSON.parse(JSON.stringify(build.fw||{})),
    schluessel:Object.keys(setupAlle)};},slot);

let count=0,failed=0;
const test=async(name,f)=>{count++;try{await f();console.log('  ok   '+name);}catch(e){failed++;console.log('  FEHL '+name+'\n       '+String(e.stack||e).split('\n').slice(0,4).join('\n       '));}};

await test('CS-01 Daempferwechsel: Gabelwerte (Druck, Klicks, Messung, Haken, Grundeinstellung) bleiben in allen Fahrprofilen, nach Neuladen',async()=>{
  await frisch();const vor=await werteSetzen('gabel');
  await tauschen('daempfer','d-sd');await neuLaden();
  const s=await stand('gabel');
  assert.notEqual(s.key,vor.key,'neuer Schluessel erwartet');
  assert.equal(s.prof.allround.psi,102);assert.equal(s.prof.allround.off,2);assert.equal(s.prof.allround.sag,36);
  assert.equal(s.prof.downhill.psi,98);assert.equal(s.prof.downhill.off,3);
  assert.deepEqual(s.prof.allround.fertig,['gabel:luft']);assert.deepEqual(s.prof.allround.gesp,{off:2,psi:102});
  assert.equal(s.anzeigePsi,102,'Anzeige muss den gespeicherten Gabeldruck zeigen, nicht die Empfehlung');
  assert.equal(s.messGueltig,36,'Gabelmessung bleibt gueltig (gleiches Teil, gleicher Druck)');
  for(const p of ['allround','downhill','spruenge']){const a=s.prof[p].andere;assert.deepEqual(a,{psi:null,off:[],sag:false,fertig:[],gesp:0},'neuer Daempfer startet leer ('+p+')');}
  assert.ok(s.log.includes('psi:gabel')&&s.log.includes('knopf:gabel|Zugstufe'),'Gabel-Verlauf uebernommen');
  assert.ok(!s.log.some(e=>e.startsWith('notiz')||e.startsWith('tr')),'Paarnotiz und Paar-Testfahrt nicht kopiert');
  const alt=await ev(k=>JSON.parse(JSON.stringify(setupAlle[k])),vor.key);
  assert.deepEqual(alt,vor.eintrag,'alter Eintrag unveraendert');
  /* Fortsetzen der Fahrwerkfragen (neues Daempferjahr) aendert die Gabelwerte nicht */
  await ev(()=>{const fw=fwInfo();fw.dj=2027;sichern();});await neuLaden();
  const s2=await stand('gabel');assert.equal(s2.prof.allround.psi,102);assert.equal(s2.anzeigePsi,102);
});

await test('CS-01 Gabelwechsel spiegelbildlich: Coil-Daempfer mit 475 lbs behaelt Klicks, Messung und Feder',async()=>{
  await frisch();const vor=await werteSetzen('daempfer');
  await tauschen('gabel','g-lyrik');await neuLaden();
  const s=await stand('daempfer');
  assert.notEqual(s.key,vor.key);
  assert.equal(s.prof.allround.off,2);assert.equal(s.prof.downhill.off,3);assert.equal(s.prof.allround.sag,17);
  assert.deepEqual(s.prof.allround.fertig,['daempfer:feder']);assert.equal(s.fw.df,475,'475-lbs-Feder bleibt Hauptwert');
  assert.equal(s.messGueltig,17);
  for(const p of ['allround','downhill','spruenge']){const a=s.prof[p].andere;assert.deepEqual(a,{psi:null,off:[],sag:false,fertig:[],gesp:0},'neue Gabel startet leer ('+p+')');}
});

await test('CS-01 Reparatur: vor der Korrektur leer angelegter Eintrag bekommt die Gabelwerte einmal, Eigenes bleibt',async()=>{
  await frisch();const vor=await werteSetzen('gabel');
  /* Zustand wie in der Live-App vor der Korrektur: neuer Schluessel nur mit Daempferdaten */
  const neuKey=await ev(()=>{const t=katalog(quelleOf(slotOf('daempfer'))).find(t=>t.id==='d-sd');build.daempfer=besteVariante('daempfer',t,build).id;
    const k=suKey(federRechnen()),P={psi:{daempfer:180},off:{'daempfer|Zugstufe':-1},sag:{},fertig:{'daempfer:luft':true},gesp:null};
    setupAlle[k]={log:[{typ:'psi',slot:'daempfer',alt:200,neu:180,t:Date.now(),p:'allround'}],prof:{allround:P,downhill:{psi:{},off:{},gesp:null},spruenge:{psi:{},off:{},gesp:null}}};
    localStorage.setItem('mtb.setup',JSON.stringify(setupAlle));sichern();return k;});
  await page.reload();await bereit();
  const s=await stand('gabel');assert.equal(s.key,neuKey);
  assert.equal(s.prof.allround.psi,102);assert.equal(s.prof.downhill.psi,98);assert.equal(s.anzeigePsi,102);
  const d=await ev(k=>{suDaten();return JSON.parse(JSON.stringify(setupAlle[k]));},neuKey);
  assert.equal(d.prof.allround.psi.daempfer,180,'eigener Daempferdruck bleibt');assert.equal(d.prof.allround.off['daempfer|Zugstufe'],-1);
  assert.equal(d.erbe,1);
  /* Bewusst auf Empfehlung zurueckgesetzt: bleibt leer, auch nach Neuladen */
  await ev(()=>{const d=suDaten(),P=suP(d);for(const k of Object.keys(P.off))if(k.startsWith('gabel'))delete P.off[k];delete P.psi.gabel;
    for(const p of FMODI){const Q=suP(d,p);delete Q.psi.gabel;for(const k of Object.keys(Q.off))if(k.startsWith('gabel'))delete Q.off[k];delete Q.sag.gabel;for(const k of Object.keys(Q.fertig))if(k.startsWith('gabel'))delete Q.fertig[k];Q.gesp=null;}
    suSichern();});
  await neuLaden();const s2=await stand('gabel');
  assert.equal(s2.prof.allround.psi,null,'zurueckgesetzte Gabel wird nicht erneut befuellt');
  assert.deepEqual(await ev(k=>JSON.parse(JSON.stringify(setupAlle[k])),vor.key),vor.eintrag,'alter Eintrag unveraendert');
});

await test('CS-01 keine Vermischung: zweites Rad mit gleichen Teilen erbt nichts vom ersten',async()=>{
  await frisch();await werteSetzen('gabel');
  await ev(()=>{profilNeu();build.rahmen='f-spindrift';build.gabel='g-zeb';const t=katalog(quelleOf(slotOf('daempfer'))).find(t=>t.id==='d-sd');
    build.daempfer=besteVariante('daempfer',t,build).id;sichern();});
  await neuLaden();const s=await stand('gabel');
  assert.equal(s.prof.allround.psi,null);assert.equal(s.prof.allround.off,0);assert.equal(s.prof.allround.sag,null);
});

await test('CS-01 Radkopie und Loeschen funktionieren weiter',async()=>{
  await frisch();await werteSetzen('gabel');await tauschen('daempfer','d-sd');await neuLaden();
  const r=await ev(()=>{const orig=aktivId[modus];suDaten();suSichern();profilNeu(orig);const kopie=aktivId[modus];
    const kk=Object.keys(setupAlle).filter(k=>k.startsWith(kopie+'|'));const psi=suP(suDaten()).psi.gabel;
    profilLoeschen(kopie);return {kopieSchluessel:kk.length,psi,uebrig:Object.keys(setupAlle).filter(k=>k.startsWith(kopie+'|')).length,
      orig:Object.keys(setupAlle).filter(k=>k.startsWith(orig+'|')).length};});
  assert.ok(r.kopieSchluessel>=2,'Kopie bekommt alle Setup-Eintraege');assert.equal(r.psi,102);
  assert.equal(r.uebrig,0,'Loeschen entfernt die Eintraege der Kopie');assert.ok(r.orig>=2,'Original unberuehrt');
});

/* ── CS-02: Testfahrt bleibt an ihr Ursprungsprofil gebunden ── */
const proUndSetup=()=>ev(()=>{pro={key:'test',inst:'i',status:'aktiv',geprueft:Date.now()};view='setup';zeichne();});
const offIn=(p,key='gabel|Zugstufe')=>ev(([p,key])=>suP(suDaten(),p).off[key]||0,[p,key]);
/* Allround: Testfahrt -> Etwas stimmt nicht -> Gabel -> Kickt -> Vorschlag Zugstufe -> Ist eingestellt - testen (echte Klicks) */
const testfahrtStarten=async()=>{
  await ev(()=>{fedModus='allround';try{localStorage.setItem('mtb.fmodus','allround');}catch(e){}});await proUndSetup();
  await page.click('#setup [data-fwtest]');await page.click('#modal [data-trw="was"]');
  if(await page.$('#modal [data-trel="gabel"]'))await page.click('#modal [data-trel="gabel"]');
  await page.click('#modal [data-trsym="kick"]');
  for(let i=0;i<4&&await page.$('#modal [data-trantw]');i++)await page.click('#modal [data-trantw]');
  const c=await ev(()=>{const f=federRechnen(),d=suDaten(f),k=trKandidaten(f,d,trW.el,trW.sym,trW.antw||{}),i=k.findIndex(c=>c.art==='knopf'&&c.key==='gabel|Zugstufe');
    if(i<0)throw new Error('kein Zugstufen-Vorschlag: '+k.map(c=>c.art+':'+(c.key||c.slot)).join(','));trW.ki=i;trW.st='vorschlag';fwNeu();return {neu:k[i].neu};});
  await page.click('#modal [data-trgo]');
  return c;
};
/* Profilwahl wie ein Nutzer: Sheet schliessen, zugeklappten Bereich mit dem Umschalter oeffnen, Profil antippen */
const profilKlick=async p=>{await page.click('#modal [data-zu]').catch(()=>{});
  const zu=await ev(p=>{const b=document.querySelector(`#setup .fw-prof [data-fmodus="${p}"]`),d=b&&b.closest('details:not([open])');return d?d.dataset.suauf:null;},p);
  if(zu)await page.click(`#setup details[data-suauf="${zu}"] > summary`);
  await page.locator(`#setup .fw-prof [data-fmodus="${p}"]:visible`).first().click();
  assert.equal(await ev(()=>fedModus),p,'Profil gewechselt');};

await test('CS-02 Abbruch nach Profilwechsel und Neuladen stellt nur das Ursprungsprofil zurueck',async()=>{
  await frisch();await ev(()=>{suP(suDaten(),'downhill').off['gabel|Zugstufe']=1;suSichern();});
  const c=await testfahrtStarten();
  assert.equal(await offIn('allround'),c.neu,'Teständerung im Allround');assert.equal(await offIn('downhill'),1);
  await profilKlick('downhill');await neuLaden();await proUndSetup();
  await page.click('#setup [data-fwtest]');
  const kopf=await ev(()=>({modus:fedModus,kopf:document.querySelector('#modal .sheet-h').textContent,soll:modusKurz('allround')}));
  assert.equal(kopf.modus,'allround','Fortsetzen wechselt ins Ursprungsprofil');assert.ok(kopf.kopf.includes(kopf.soll),'Kopf nennt das Ursprungsprofil');
  await page.click('#modal [data-trerg="zurueck"]');
  assert.equal(await offIn('allround'),0,'Allround wieder auf dem Wert vor dem Test');assert.equal(await offIn('downhill'),1,'Downhill unveraendert');
  assert.equal(await ev(()=>suDaten().tr),null,'kein laufender Test mehr');
  await neuLaden();assert.equal(await offIn('allround'),0);assert.equal(await offIn('downhill'),1);
});

await test('CS-02 "Besser" nach Profilwechsel uebernimmt nur im Ursprungsprofil, Protokoll nennt es',async()=>{
  await frisch();await ev(()=>{suP(suDaten(),'downhill').off['gabel|Zugstufe']=1;suSichern();});
  const c=await testfahrtStarten();await profilKlick('spruenge');await proUndSetup();
  await page.click('#setup [data-fwtest]');await page.click('#modal [data-trerg="besser"]');
  assert.equal(await offIn('allround'),c.neu);assert.equal(await offIn('downhill'),1);assert.equal(await offIn('spruenge'),0);
  const e=await ev(()=>{const l=suDaten().log;return l[l.length-1];});assert.equal(e.typ,'tr');assert.equal(e.p,'allround');
});

await test('CS-02 alter Test ohne Profilangabe: eindeutig zugeordnet oder sicher nichts zurueckgestellt',async()=>{
  await frisch();
  const r=await ev(()=>{const d=suDaten(),c={art:'knopf',key:'gabel|Zugstufe',neu:2,vorher:0,slot:'gabel'};
    suP(d,'allround').off['gabel|Zugstufe']=2;suP(d,'downhill').off['gabel|Zugstufe']=1;d.tr={stand:'test',el:'gabel',sym:'kick',antw:{},ki:0,c};
    const eindeutig=trUrsprung(d);suP(d,'downhill').off['gabel|Zugstufe']=2;const mehrdeutig=trUrsprung(d);suSichern();return {eindeutig,mehrdeutig};});
  assert.equal(r.eindeutig,'allround');assert.equal(r.mehrdeutig,null);
  await neuLaden();await ev(()=>{fedModus='downhill';});await proUndSetup();
  await page.click('#setup [data-fwtest]');await page.click('#modal [data-trerg="zurueck"]');
  assert.equal(await offIn('allround'),2,'mehrdeutig: nichts zurueckgestellt');assert.equal(await offIn('downhill'),2);
  assert.match(await ev(()=>$('toast').textContent),/keinem Fahrprofil sicher zuordnen/);
});

await test('CS-02 Teilewechsel waehrend Testfahrt: unbestaetigter Testwert wird nicht vererbt',async()=>{
  await frisch();await ev(()=>{suP(suDaten(),'downhill').off['gabel|Zugstufe']=1;suSichern();});
  const c=await testfahrtStarten();assert.equal(await offIn('allround'),c.neu);
  await page.click('#modal [data-zu]');await tauschen('daempfer','d-sd');await neuLaden();
  assert.equal(await offIn('allround'),0,'neues Paar bekommt den Wert vor dem Test');assert.equal(await offIn('downhill'),1,'bestaetigter Downhill-Wert vererbt');
  assert.equal(await ev(()=>suDaten().tr||null),null,'Testfahrt bleibt beim alten Paar');
});

await test('CS-02 Profi-Knopftest gehoert seinem Startprofil',async()=>{
  await frisch();await ev(()=>{suP(suDaten(),'downhill').off['gabel|Zugstufe']=1;fedModus='allround';suSichern();});await proUndSetup();
  const r=await ev(()=>{suTestStart('gabel|Zugstufe',1,3);const d=suDaten(),t=d.test;const cur=t.cur;
    fedModus='downhill';const html=suTestHtml(federRechnen(),d);
    const anzeigeDh=suKnoepfe('gabel',federRechnen().gabel,d).find(k=>k.key==='gabel|Zugstufe');
    fedModus='allround';suTestEnde(d,true);suSichern();
    return {p:t.p,cur,hinweis:/läuft im Profil/.test(html),dhOff:suP(d,'downhill').off['gabel|Zugstufe']||0,arOff:suP(d,'allround').off['gabel|Zugstufe']||0,
      dhOhneTest:!!anzeigeDh};});
  assert.equal(r.p,'allround');assert.ok(r.hinweis,'anderes Profil zeigt Hinweis statt Testknoepfen');
  assert.equal(r.dhOff,1,'Downhill unberuehrt');assert.equal(r.arOff,0,'bester Wert (Start) im Allround');
});

if(errors.length){count++;failed++;console.log('  FEHL JS-Fehler: '+[...new Set(errors)].join(' | '));}
console.log(`\nFAHRWERK-ERHALT: ${count-failed} von ${count} bestanden.`);
await browser.close();server.close();
process.exit(failed?1:0);
