/* APP-FAHRWERK-EINFACH: echte Klickwege, Modellwerte und Datenerhalt.
 * Optional: CRANKSCORE_SOURCE_ROOT fuer einen lokalen anderen Checkout,
 * CRANKSCORE_LIVE_URL fuer einen bereits laufenden Server.
 * Ausschliesslich isolierter Browserkontext, keine echten Nutzerdaten. */
import {createRequire} from 'node:module';
import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
let pw; try {pw=require('playwright');} catch {pw=require(execSync('npm root -g').toString().trim()+'/playwright');}
const root=path.resolve(process.env.CRANKSCORE_SOURCE_ROOT||path.join(path.dirname(fileURLToPath(import.meta.url)),'..'));
const server=http.createServer((q,r)=>{
  const f=path.resolve(root,'.'+decodeURIComponent(q.url.split('?')[0]));
  if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){r.writeHead(404);r.end();return;}
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
  r.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=process.env.CRANKSCORE_LIVE_URL||`http://127.0.0.1:${server.address().port}/index.html`;
const browser=await pw.chromium.launch();
const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',serviceWorkers:'block'});
await ctx.route('**/*',r=>r.request().url().startsWith(new URL(url).origin)?r.continue():r.abort());
const page=await ctx.newPage(),errors=[];
page.setDefaultTimeout(8000);page.on('pageerror',e=>errors.push(e.message));
const ev=(f,a)=>page.evaluate(f,a),click=s=>page.locator(s).click();
const frage=()=>page.locator('[data-obschritt]').getAttribute('data-obschritt');
const next=()=>click('[data-fwobw]'),wahl=v=>click(`[data-fwwk="${v}"]`);
const neu=async({fully=false,coil=false}={})=>{
  await page.setViewportSize({width:390,height:844});await page.goto(url);
  await ev(()=>{localStorage.clear();for(const k of ['einstieg2','tour','szenen','start'])localStorage.setItem('mtb.'+k,'1');localStorage.setItem('mtb.sprache','de');});
  await page.reload();await page.waitForFunction(()=>typeof fwErsterBesuch==='function');
  await ev(({fully,coil})=>{
    pro={key:'test',inst:'i',status:'aktiv',geprueft:Date.now()};wechsle('real');
    build.rahmen=fully?'f-spindrift':'f-roscoe';build.gabel=fully?'g-zeb':'g-pike';
    if(fully){const t=katalog(quelleOf(slotOf('daempfer'))).find(t=>t.id===(coil?'d-sdcoil':'d-sd'));if(!t)throw new Error('Passender Testdaempfer fehlt');build.daempfer=besteVariante('daempfer',t,build).id;}else delete build.daempfer;
    delete build.fw;plan.fahrer=80;view='aufbau';sichern();zeichne();
  },{fully,coil});
};
const fertig=async()=>ev(()=>{
  const fw=fwInfo();fw.fertig=true;fw.fragenVersion=FW_FRAGEN_VERSION;fw.gj=2025;fw.dj=2025;
  fw.besucht=Object.fromEntries(obSchritte().filter(n=>!['start','ende'].includes(n)).map(n=>[n,true]));
  fw.stil={gelaende:'ruppig',tempo:'zuegig',spruenge:'klein',gefuehl:'mittel',bergauf:'egal'};
  fwPruef();sichern();view='setup';zeichne();
});
const neuLaden=async()=>{await page.reload();await page.waitForFunction(()=>typeof fwErsterBesuch==='function');await ev(()=>{pro={key:'test',inst:'i',status:'aktiv',geprueft:Date.now()};view='aufbau';zeichne();});};
let count=0,failed=0;
const test=async(name,f)=>{count++;try{await f();console.log('  ok   '+name);}catch(e){failed++;console.log('  FEHL '+name+'\n       '+e.stack);}};
try{
  await test('Ohne Rad zuerst zum Aufbau statt Gewicht, Pro oder Fahrwerkfragen',async()=>{
    await neu();await ev(()=>{build={};plan.fahrer=0;pro={};sichern();zeichne();});await click('.tabs [data-view="setup"]');
    assert.equal(await page.locator('.fw-ob').count(),0);assert.equal(await page.locator('#setup .fw-k').count(),0);assert.equal(await page.locator('#setup [data-fahrerprofil]').count(),0);
    assert.equal(await page.locator('#setup [data-fwaufbau="rahmen"]').count(),1);await click('#setup [data-fwaufbau="rahmen"]');
    assert.equal(await ev(()=>view),'aufbau');assert.ok(await page.locator('#modal [data-suche]').count());
  });
  await test('Fehlender Daempfer wird am Rad ergaenzt, direkter Fragenaufruf zeigt keine falschen Werte',async()=>{
    await neu({fully:true});await ev(()=>{delete build.daempfer;sichern();zeichne();});await click('.tabs [data-view="setup"]');
    assert.equal(await page.locator('.fw-ob').count(),0);assert.equal(await page.locator('#setup [data-fwaufbau="daempfer"]').count(),1);
    await ev(()=>obOeffnen('start'));assert.equal(await page.locator('.fw-ob').count(),0);await click('#setup [data-fwaufbau="daempfer"]');
    assert.equal(await ev(()=>view),'aufbau');assert.ok(await page.locator('#modal [data-suche]').count());
  });
  await test('Erst im Fahrwerk-Tab, Teile bestaetigen und unterbrochene Fragen fortsetzen',async()=>{
    await neu();await ev(()=>{plan.fahrer=0;sichern();zeichne();});assert.equal(await page.locator('.fw-ob').count(),0);
    await click('.tabs [data-view="setup"]');assert.equal(await frage(),'start');await next();assert.equal(await frage(),'gabel');await wahl('gj|2025');await next();
    assert.equal(await frage(),'gewicht');await click('[data-fwfahrer]');assert.equal(await page.locator('.ei').count(),1);
    await ev(()=>eiSetze('fahrer',82));await click('[data-eiskip]');assert.equal(await frage(),'gewicht');assert.match(await page.locator('.fw-aus-profil').textContent(),/82 kg/);
    await next();assert.equal(await frage(),'fahrer');await wahl('ff:gelaende|ruppig');await click('#modal [data-zu]');await neuLaden();
    await click('.tabs [data-view="setup"]');assert.equal(await page.locator('.fw-ob').count(),0);await click('.fw-fragen [data-fwob]');assert.equal(await frage(),'fahrer');
    assert.equal(await page.locator('[data-fwwk="ff:gelaende|ruppig"]').getAttribute('aria-pressed'),'true');assert.equal(await ev(()=>plan.fahrer),82);
  });
  await test('Sechs persoenliche Fragen beim Fully ohne SAG-Ziele, Maximaldruck oder Klickzaehlpflicht',async()=>{
    await neu({fully:true});await click('.tabs [data-view="setup"]');const gesehen=[];
    for(let i=0;i<12;i++){
      const n=await frage();gesehen.push(n);assert.equal(await page.locator('[data-fwin^="vorgabe:"]').count(),0);assert.equal(await page.locator('[data-fwin="fwH"]').count(),0);assert.equal(await page.locator('[data-fwin^="akt:"]').count(),0);
      if(n==='ende'){await click('[data-fwobfertig]');break;}
      if(n==='gabel')await wahl('gj|2025');if(n==='daempfer')await wahl('dj|2025');if(n==='gewicht')await click('[data-fmont="fullface"]');
      if(n==='fahrer')await wahl('ff:gelaende|ruppig');if(n==='stil'){await wahl('ff:tempo|zuegig');await wahl('ff:spruenge|klein');}
      if(n==='gefuehl'){await wahl('ff:gefuehl|mittel');await click('[data-fwwn="ff:bergauf"]');}await next();
    }
    assert.deepEqual(gesehen,['start','gabel','daempfer','gewicht','fahrer','stil','gefuehl','ende']);assert.equal(await page.locator('.fw-ob').count(),0);assert.ok(await page.locator('#setup .fw-k').count());
    assert.ok(await ev(()=>build.fw.fertig&&obOffen().length===0));await neuLaden();assert.equal(await ev(()=>fAngabe('gelaende')),'ruppig');
  });
  await test('Keine stillen Antworten: unbekannt ist moeglich, falsche Federzahl sperrt Weiter',async()=>{
    await neu();await ev(()=>obOeffnen('stil'));await next();assert.equal(await frage(),'stil');assert.ok(await page.locator('.fw-frage-fehler:visible').count());
    await click('[data-fwwn="ff:tempo"]');await click('[data-fwwn="ff:spruenge"]');await next();assert.equal(await frage(),'gefuehl');
    await neu({fully:true,coil:true});await ev(()=>obOeffnen('daempfer'));await page.locator('[data-fwin="df"]').fill('2000');await next();
    assert.equal(await frage(),'daempfer');assert.equal(await page.locator('[data-fwin="df"]').getAttribute('aria-invalid'),'true');
    await page.locator('[data-fwin="df"]').fill('475');await next();assert.equal(await frage(),'gewicht');assert.equal(await ev(()=>build.fw.df),475);
  });
  await test('Modellwerte automatisch: alte manuelle SAG-/Druckvorgaben ersetzen keine Herstellergrenze',async()=>{
    await neu();const r=await ev(()=>{
      build.fw={gj:2025,vorgaben:{gabel:{sag:29,max:400}}};const f=federRechnen(),d=suDaten(f);suP(d).psi.gabel=500;
      const a={max:suMax('gabel',f.gabel),sag:FMODI.map(p=>f.gabel.modi[p].sag),druecke:FMODI.map(p=>f.gabel.modi[p].psi),wert:suPsi('gabel',f.gabel,d)};
      build.fw.vorgaben.gabel={sag:10,max:20};const b=federRechnen();a.maxDanach=suMax('gabel',b.gabel);a.sagDanach=FMODI.map(p=>b.gabel.modi[p].sag);
      build.fw.gj=2020;a.unbekannt=fwModellVorgaben('gabel',findeTeil('gabel',build.gabel));return a;
    });
    assert.equal(r.max,163);assert.equal(r.maxDanach,163);assert.deepEqual(r.sag,r.sagDanach);assert.ok(r.sag.every(v=>v>=15&&v<=25));assert.ok(r.druecke.every(v=>v==null||v<=163));assert.ok(r.wert==null||r.wert<=163);assert.equal(r.unbekannt.max,null);
  });
  await test('475-lbs-Feder bleibt statt 500 und beeinflusst SAG sowie Zugstufen-Startwert',async()=>{
    await neu({fully:true,coil:true});await fertig();const r=await ev(()=>{
      for(let kg=50;kg<=120;kg++){plan.fahrer=kg;if(federRechnen().daempfer.rate===500)break;}
      const fw=fwInfo();fw.df=500;const a=federRechnen(),d=suDaten(a),ka=suKnoepfe('daempfer',a.daempfer,d).find(k=>k.art==='zug');
      suP(d).off[ka.key]=2;suLog(d,{typ:'notiz',text:'Feder behalten'});suGrundSpeichern(a,d);fw.df=475;
      const b=federRechnen(),kb=suKnoepfe('daempfer',b.daempfer,d).find(k=>k.art==='zug');
      const out={soll:b.daempfer.federSoll,ist:b.daempfer.federIst,sagA:a.daempfer.federSag,sagB:b.daempfer.federSag,zugA:knopfRel(ka.basis[2]),zugB:knopfRel(kb.basis[2]),fein:suP(d).off[ka.key],notiz:d.log.find(z=>z.text==='Feder behalten').text};
      suSichern();sichern();suElWahl='daempfer';suKarteZeigen('daempfer','daempfer:feder');return out;
    });
    assert.equal(r.soll,500);assert.equal(r.ist,475);assert.ok(r.sagB>r.sagA);assert.ok(r.zugB<r.zugA);assert.equal(r.fein,2);assert.equal(r.notiz,'Feder behalten');
    assert.match(await page.locator('#fwk-daempfer-feder .fw-kw').textContent(),/475/);assert.equal(await page.locator('[data-fwin="df"]').inputValue(),'475');
    await page.locator('[data-fwin="df"]').fill('450');await page.locator('[data-fwin="df"]').blur();assert.equal(await ev(()=>federRechnen().daempfer.federIst),450);
    await page.locator('[data-fwin="df"]').fill('475');await page.locator('[data-fwin="df"]').blur();await neuLaden();assert.equal(await ev(()=>federRechnen().daempfer.federIst),475);assert.ok(await ev(()=>suDaten().log.some(z=>z.text==='Feder behalten')));
  });
  await test('Feder- und Gewichtsaenderung entwerten nur Messung, Notizen und Feintuning bleiben',async()=>{
    await neu({fully:true,coil:true});await fertig();const r=await ev(()=>{
      build.fw.df=475;let f=federRechnen();const d=suDaten(f),k=suKnoepfe('daempfer',f.daempfer,d).find(k=>k.art==='zug');suP(d).off[k.key]=1;suLog(d,{typ:'notiz',text:'Nicht loeschen'});suSagSetzen('daempfer',20);
      const vor=fxMess('daempfer',f.daempfer,d);build.fw.df=500;f=federRechnen();const feder=fxMess('daempfer',f.daempfer,d);build.fw.df=475;plan.fahrer=95;
      return {vor,feder,gewicht:fxMess('daempfer',federRechnen().daempfer,d),fein:suP(d).off[k.key],messung:suP(d).sag.daempfer.mm,notiz:d.log.some(z=>z.text==='Nicht loeschen')};
    });assert.deepEqual(r,{vor:20,feder:null,gewicht:null,fein:1,messung:20,notiz:true});
  });
  await test('Bestehende beantwortete Setups bleiben offen, nur fehlende Antworten werden nachgefragt',async()=>{
    await neu();await ev(()=>{build.fw={fertig:true,fragenVersion:2,gj:2025};FFRAGEN.forEach(f=>fprofil[f.k]=f.o[1][0]);const d=suDaten();suP(d).psi.gabel=78;suLog(d,{typ:'notiz',text:'Behalten'});suSichern();sichern();zeichne();});
    await click('.tabs [data-view="setup"]');assert.equal(await page.locator('.fw-ob').count(),0);assert.ok(await page.locator('#setup .fw-k').count());
    assert.deepEqual(await ev(()=>({offen:obOffen(),psi:suP(suDaten()).psi.gabel,notiz:suDaten().log[0].text})),{offen:[],psi:78,notiz:'Behalten'});
    await ev(()=>{schliesse();fprofil={};build.fw={fertig:true,fragenVersion:2,gj:2025};fwErsterBesuch();});assert.equal(await frage(),'fahrer');
  });
  await test('Fahrstil gilt pro Rad, neue Gabel verwirft nur ihre eigenen Daten',async()=>{
    await neu();const r=await ev(()=>{
      fprofil.tempo='ruhig';obSetzen('ff:tempo','schnell');const a=JSON.parse(JSON.stringify(build));build={...build,fw:{stil:{tempo:'zuegig'}}};const b=fAngabe('tempo');build=a;
      const vor=fAngabe('tempo');build.fw.vorgaben={gabel:{sag:20,max:100},daempfer:{sag:30}};build.fw.gf=45;build.fw.df=475;fwPruef();build.gabel='g-pikesel';fwPruef();
      return {b,vor,global:fprofil.tempo,g:build.fw.vorgaben.gabel,h:build.fw.vorgaben.daempfer.sag,gf:build.fw.gf,df:build.fw.df,fertig:build.fw.fertig};
    });assert.deepEqual(r,{b:'zuegig',vor:'schnell',global:'ruhig',g:undefined,h:30,gf:undefined,df:475,fertig:false});
    const n=await ev(()=>{const p=profilLeer('real');p.build={rahmen:'f-roscoe',gabel:'g-pike'};profile.real.push(p);view='setup';radWechseln('real',p.id);return $('modal').querySelector('[data-obschritt]')?.dataset.obschritt;});assert.equal(n,'start');
  });
  await test('Hardtail ohne Daempferfragen, Coil ohne Luftfelder, Free ohne persoenliche Werte',async()=>{
    await neu();assert.equal(await ev(()=>obSchritte().includes('daempfer')),false);await neu({fully:true,coil:true});await ev(()=>obOeffnen('daempfer'));
    assert.equal(await page.locator('[data-fwin="df"]').count(),1);assert.equal(await page.locator('[data-fwin$=":max"], [data-fwin$=":psi"]').count(),0);
    await ev(()=>{schliesse();pro={};view='aufbau';zeigeBereich('setup');});assert.equal(await page.locator('.fw-ob').count(),0);assert.equal(await page.locator('#setup .fw-k').count(),0);
  });
  await test('Defekt sperrt Werte, separater Zustandsdialog macht nach Pruefung wieder weiter',async()=>{
    await neu();await fertig();await ev(()=>{build.fw.zustand='pruefen';zeichne();});assert.equal(await page.locator('#setup .fw-k').count(),0);
    await click('#setup [data-fwob="vorbereitung"]');assert.equal(await frage(),'vorbereitung');await wahl('zustand|ok');await wahl('werkzeug|da');await next();
    assert.equal(await page.locator('.fw-ob').count(),0);assert.ok(await page.locator('#setup .fw-k').count());assert.equal(await ev(()=>build.fw.zustand),'ok');
  });
  await test('Einrichtung erneut: aktuelle Funktionen und Fahrerfragen ohne Verlust des bestehenden Rads',async()=>{
    await neu();await fertig();await ev(()=>{suP(suDaten()).psi.gabel=81;upNein()['test-erhalten']=1;suSichern();zeichne();sichern();});
    const vorher=await ev(()=>JSON.stringify({profile,setupAlle,build,wunsch:localStorage.getItem('mtb.wunsch')}));await ev(()=>oeffneMenu());await click('[data-einstiegneu]');const szenen=[];
    for(let i=0;i<8&&await page.locator('#szenen .sz').count();i++){szenen.push(await page.locator('[data-szene]').getAttribute('data-szene'));await click('[data-szweiter]');}
    assert.deepEqual(szenen,['ohne','mit','plan','fahrwerk','guide','merken']);assert.equal(await page.locator('.fw-ob').count(),0);assert.deepEqual(await ev(()=>eiSchritte()),['erfahrung','charakter','koerper','masse','fit','ziel']);
    for(let i=0;i<5;i++)await click('[data-eiweiter]');await click('[data-eiwahl="ziel|behalten"]');await page.waitForFunction(()=>!document.querySelector('.ei'));
    assert.deepEqual(JSON.parse(await ev(()=>JSON.stringify({profile,setupAlle,build,wunsch:localStorage.getItem('mtb.wunsch')}))),JSON.parse(vorher));
  });
  await test('Deutsch/Englisch, OLED/Hell und 320/390/1280 px: Fragen und Hauptansicht ohne Ueberstand',async()=>{
    await neu({fully:true,coil:true});
    for(const [width,spr,hell]of [[320,'de',false],[390,'de',true],[1280,'en',false]]){
      await page.setViewportSize({width,height:844});await ev(({spr,hell})=>{sprache=spr;setzeDesign(hell);},{spr,hell});const steps=await ev(()=>obSchritte());
      for(const n of steps){await ev(n=>obOeffnen(n),n);assert.ok(await page.locator('.sheet-f button:visible').count());assert.equal(await ev(()=>{const e=$('modal').querySelector('.sheet-b');return e.scrollWidth>e.clientWidth+1;}),false,`${width}/${spr}/${n}`);assert.doesNotMatch(await page.locator('.fw-ob').textContent(),/undefined|NaN/);}
      await ev(()=>schliesse());await fertig();assert.equal(await ev(()=>document.documentElement.scrollWidth>innerWidth+1),false,`setup/${width}/${spr}`);assert.doesNotMatch(await page.locator('#setup').textContent(),/undefined|NaN/);
      if(process.env.CRANKSCORE_SCREENSHOTS)await page.screenshot({path:path.join(process.env.CRANKSCORE_SCREENSHOTS,`fahrwerk-einfach-${width}-${spr}.png`),animations:'disabled'});
      await ev(()=>oeffneSzenen(null));for(let i=0;i<6;i++){await ev(i=>szeneZeigen(i),i);assert.equal(await ev(()=>document.documentElement.scrollWidth>innerWidth+1),false,`intro/${width}/${i}`);const b=await page.locator('[data-szweiter]').boundingBox();assert.ok(b&&b.y+b.height<=844,`intro next/${width}/${i}`);}await click('[data-szweg]');
    }
  });
  await test('SAG-Anleitung betrifft nur das ausgewaehlte Teil, Stahlfeder ohne Pumpe oder Luftkammer',async()=>{
    await neu({fully:true,coil:true});await fertig();await ev(()=>{build.fw.df=475;sagW={i:1,slot:'daempfer',zurueck:false};zeigeSheet(sagWizardHtml());});const texte=[];
    for(let i=0;i<6;i++){await ev(i=>{sagW.i=i;zeigeSheet(sagWizardHtml());},i);texte.push(await page.locator('.fw-sagwz').textContent());}
    assert.doesNotMatch(texte.join(' '),/Dämpferpumpe|Luftkammer|O-Ring|aufgepumpt|nach dem Pumpen|Startdruck einstellen/);assert.match(texte.join(' '),/Befestigung|Abstand|Augen|Mittelpunkt/);
    await ev(()=>{sagW={i:3,slot:'gabel',zurueck:false};zeigeSheet(sagWizardHtml());});assert.doesNotMatch(await page.locator('.fw-sagwz').textContent(),/Dämpfer.*sitzend/);
  });
  await test('Nur Fotos des gewaehlten Modells, keine Schema-Ersatzbilder bei unbekanntem Teil',async()=>{
    await neu();await fertig();await ev(()=>{build.fw.gj=2027;suKarteZeigen('gabel','gabel:luft');});const model=await ev(()=>basisVon(build.gabel));
    const fotos=await page.locator('#setup [data-fwmodell]').evaluateAll(es=>es.map(e=>e.dataset.fwmodell));assert.ok(fotos.length);assert.ok(fotos.every(m=>m===model));
    assert.equal(await page.locator('#setup .il-gabel, #setup .il-daempfer, #setup .il-rad, #setup .il-sag').count(),0);
    const r=await ev(()=>({fremd:suEinstellBild('gabel',{t:{id:'unbekannt',n:'Mein eigenes Modell',eigen:true}},{}),schemas:[ilGabel(),ilDaempfer(),ilRad(),ilSag()].join('')}));
    assert.equal(r.schemas,'');assert.doesNotMatch(r.fremd,/<img|<svg/);assert.match(r.fremd,/kein Foto/);await ev(()=>obOeffnen('gabel'));assert.equal(await page.locator('.fw-ob .il').count(),0);
  });
  await test('Naechster Schritt oeffnet die richtige Karte und erreicht Messung und Testfahrt',async()=>{
    await neu();await fertig();await click('.fw-weiter [data-fwzu]');assert.equal(await page.locator('#fwk-gabel-luft [data-fwpsiin]').isVisible(),true);
    await ev(()=>{const f=federRechnen(),d=suDaten(f);suP(d).fertig['gabel:luft']=true;suSichern();setupZeichnen();});await click('.fw-weiter [data-fwzu]');assert.equal(await page.locator('#fwk-gabel-sag [data-fwsag]').isVisible(),true);
    await ev(()=>{const f=federRechnen(),d=suDaten(f);suSagSetzen('gabel',f.gabel.modi[fedModus].sagMm);for(const s of suSchritte(f,d))if(!['sag','test'].includes(s.key))suP(d).fertig[s.key]=true;suSichern();setupZeichnen();});
    assert.match(await page.locator('.fw-weiter').textContent(),/Testfahrt/);await click('.fw-weiter [data-fwtest]');assert.equal(await page.locator('.fw-trwz').count(),1);
  });
  await test('Hersteller-Druckreihen unterscheiden Jahr und Federweg, offene Gewichtsgrenzen ohne Extrapolation',async()=>{
    await neu(); const r=await ev(()=>{
      const rows=[['g-pike','pike',2023,120,80],['g-pike','pike',2025,140,75],['g-lyrik','lyrik',2025,140,85],['g-zeb','zeb',2025,190,50],['g-lyrik','linearxl',2027,160,136.5],['g-zeb','linearxl',2027,180,119.5]];
      const result=rows.map(([id,tab,year,travel,expected])=>{const g={...findeTeil('gabel',id),travel},a=fwDruckTabelle(g,{tab,eigen:true},year); return {expected,psi:fwDruckAus(a,170),lower:fwDruckAus(a,129),upper:fwDruckAus(a,211)};});
      const sc=fwDruckTabelle(findeTeil('gabel','g-fox32sc'),{tab:'fox32',eigen:true},2025);
      return {result,sc:fwDruckAus(sc,125),unbekannt:fwDruckTabelle(findeTeil('gabel','g-fox36slf'),{tab:'fox36',eigen:true},2025),offen:modusZelle(['Zugstufe','',{zug:true,n:10,pos:3,ab:'offen'}])};
    });
    for(const z of r.result){assert.equal(z.psi,z.expected);assert.equal(z.lower,null);assert.equal(z.upper,null);}assert.equal(r.sc,65);assert.equal(r.unbekannt,null);assert.equal(r.offen[0],'7');
  });
  assert.equal(errors.length,0,errors.join('\n'));
}catch(e){failed++;console.log('JS-Fehler: '+e.stack);}finally{await browser.close();server.close();}
console.log(`FAHRWERK-FRAGEN: ${count-failed} von ${count} Prüfungen bestanden.`);
if(failed)process.exitCode=1;
