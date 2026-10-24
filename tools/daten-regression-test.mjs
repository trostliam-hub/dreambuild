/**
 * Isolierte Regressionen D01-D06 (Audit 24.10.2026).
 * Keine externen API-/Kauf-/Lizenzaufrufe; ausschliesslich synthetische Daten.
 * node tools/daten-regression-test.mjs [optional --group=D03]
 * CRANKSCORE_SOURCE_ROOT optional; index.html wird einmal als Snapshot gelesen.
 */
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import os from 'node:os';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const root=path.resolve(process.env.CRANKSCORE_SOURCE_ROOT || process.env.SOURCE_ROOT || path.join(path.dirname(fileURLToPath(import.meta.url)),'..'));
const out=process.env.CRANKSCORE_TEST_OUTPUT || fs.mkdtempSync(path.join(os.tmpdir(),'crankscore-daten-'));
fs.mkdirSync(out,{recursive:true});
const frozen=fs.readFileSync(path.join(root,'index.html'));
const source={root,commit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),sha256:crypto.createHash('sha256').update(frozen).digest('hex'),bytes:frozen.length};
const {chromium}=createRequire(path.join(root,'package.json'))('playwright');
const server=http.createServer((q,r)=>{
  const pathname=decodeURIComponent(new URL(q.url,'http://localhost').pathname);
  const f=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){r.writeHead(404);r.end();return;}
  r.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff2':'font/woff2','.webmanifest':'application/manifest+json'})[path.extname(f)]||'application/octet-stream');
  r.end(f===path.join(root,'index.html')?frozen:fs.readFileSync(f));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url='http://127.0.0.1:'+server.address().port+'/index.html',origin=new URL(url).origin;
const browser=await chromium.launch({channel:process.env.CRANKSCORE_BROWSER_CHANNEL || (process.platform==='win32'?'chrome':undefined)});
let context,page,errors=[],blocked=0;
const results=[],groups=new Map();
const PHOTO='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const RAM_PHOTO=PHOTO+'#nur-im-ram';
const ev=(f,a)=>page.evaluate(f,a);
const json=v=>JSON.parse(JSON.stringify(v));
const eq=(a,b,msg)=>assert.deepStrictEqual(a,b,msg);
const ok=(v,msg)=>assert.ok(v,msg);
const groupFilter=process.argv.find(s=>s.startsWith('--group='))?.split('=')[1];

async function fresh({width=390,lang='de'}={}){
  if(context) await context.close();
  context=await browser.newContext({viewport:{width,height:844},locale:'en-US',timezoneId:'UTC',serviceWorkers:'block',reducedMotion:'reduce',acceptDownloads:true});
  await context.route('**/*',r=>{if(new URL(r.request().url()).origin===origin)return r.continue();blocked++;return r.abort();});
  page=await context.newPage();page.setDefaultTimeout(8000);errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);
  await ev(lang=>{localStorage.clear();for(const k of ['einstieg2','tour','szenen','start'])localStorage.setItem('mtb.'+k,'1');localStorage.setItem('mtb.sprache',lang);},lang);
  await page.reload();await ready();
  await ev(()=>{wechsle('real');setzeBau(JSON.parse(JSON.stringify(START)),true);aktivesProfil().name='Isoliertes Auditrad';upNein();suP(suDaten()).psi.gabel=102;suLog(suDaten(),{typ:'notiz',txt:'Auditnotiz behalten'});suSichern();sichern();zeichne();upNein();sichern();});
  errors=[];
}
async function ready(){await page.waitForFunction(()=>typeof sicherungPruefen==='function'&&typeof suDaten==='function'&&typeof zeichne==='function');}
async function reload(){await ev(()=>{if(window.__auditStorage){Storage.prototype.setItem=__auditStorage.set;Storage.prototype.removeItem=__auditStorage.remove;delete window.__auditStorage;}});await page.reload();await ready();}
async function raw(){return ev(()=>Object.fromEntries(Object.keys(localStorage).filter(k=>k.startsWith('mtb.')&&!['mtb.frisch','mtb.updweg'].includes(k)).sort().map(k=>[k,localStorage.getItem(k)])));}
async function memory(){return ev(()=>{
  profilZurueck();const setup={};for(const[k,d]of Object.entries(setupAlle))if(!suLeer(d))setup[k]=d;
  // Ein nachgeladenes Rad ergaenzt fehlende optionale Slots mit null. Semantisch
  // vergleichen: weder diese Standardwerte noch leere Setup-Huellen sind Verlust.
  const bau=b=>({...leerBau(),...b}),ps={},bs={};
  for(const m of MODI){ps[m]=profile[m].map(p=>({...p,build:bau(p.build)}));bs[m]=bau(builds[m]);}
  return JSON.parse(JSON.stringify({profile:ps,aktivId,build:bau(build),builds:bs,eigene,fotos,setup}));
});}
async function fault(spec){await ev(spec=>{
  const state={set:Storage.prototype.setItem,remove:Storage.prototype.removeItem,stage:0,hits:[]};window.__auditStorage=state;speicherFehlerT=0;
  Storage.prototype.setItem=function(k,v){
    if(spec.rollbackOwn&&k==='mtb.profile'){state.stage=1;state.hits.push('set:'+k);throw new DOMException('Audit gesperrt','QuotaExceededError');}
    if((spec.set||[]).includes(k)||spec.rollbackOwn&&state.stage&&k==='mtb.eigene'||spec.onlyExistingPhotos&&k.startsWith('mtb.foto.')&&!spec.onlyExistingPhotos.includes(k)){state.hits.push('set:'+k);throw new DOMException('Audit gesperrt','QuotaExceededError');}
    return state.set.call(this,k,v);
  };
  Storage.prototype.removeItem=function(k){if((spec.remove||[]).includes(k)){state.hits.push('remove:'+k);throw new DOMException('Audit gesperrt','QuotaExceededError');}return state.remove.call(this,k);};
},spec);}
async function faultInfo(){return ev(()=>({hits:window.__auditStorage?.hits||[],toast:$('toast').textContent}));}
async function unFault(){await ev(()=>{if(window.__auditStorage){Storage.prototype.setItem=__auditStorage.set;Storage.prototype.removeItem=__auditStorage.remove;delete window.__auditStorage;}});}
async function seedProfiles(){
  return ev(photo=>{
    const first=aktivId.real;fotos.real=photo;suP(suDaten()).psi.gabel=102;suLog(suDaten(),{typ:'notiz',txt:'Erstes Rad behalten'});suSichern();sichern();
    localStorage.setItem('mtb.topcap.'+first+'.gabel',photo);localStorage.setItem('mtb.topcap.'+first+'.daempfer',photo);
    profilNeu(first);const second=aktivId.real;aktivesProfil().name='Zweites Auditrad';sichern();profilWechseln(first);upNein();sichern();suSichern();
    return {first,second};
  },PHOTO);
}
async function importFile(text,accepted=false){
  const fc=page.waitForEvent('filechooser');await ev(()=>{schliesse();$('toast').hidden=true;sicherungNeu=null;sicherungWaehlen();});
  await(await fc).setFiles({name:'audit-synthetische-sicherung.json',mimeType:'application/json',buffer:Buffer.from(text)});
  await page.waitForFunction(()=>!!sicherungNeu||!$('toast').hidden);
  const preview=await page.locator('[data-sicherung="anwenden"]').count();
  if(!accepted)return {preview,toast:await ev(()=>$('toast').textContent)};
  ok(preview===1,'Gueltiger Import muss bestaetigbare Vorschau zeigen');
  await Promise.all([page.waitForEvent('load'),page.locator('[data-sicherung="anwenden"]').click()]);await ready();
  return {preview};
}
async function backupMutation(kind){
  return ev(kind=>{
    const s=sicherungErstellen(true),pr=JSON.parse(s.daten['mtb.profile']);
    const clone=()=>({...rohTeil('griffe','gr-ge1'),id:'x-bad',eigen:true});
    if(kind==='wish-id')pr.liste.real[0].wuensche=[{id:'w"><img src=x onerror="window.__auditXss=1"><i data-x="',slot:'griffe',frei:{n:'Harmloser Auditmarker',l:''},stufe:'gemerkt'}];
    if(kind==='profile-id'){const id='p"><img src=x onerror="window.__profileXss=1"><i data-x="';pr.liste.real[0].id=id;pr.aktiv.real=id;}
    if(kind==='duplicate-id'){pr.liste.real[0].id=pr.liste.traum[0].id;pr.aktiv.real=pr.liste.real[0].id;}
    if(kind==='null-custom')s.daten['mtb.eigene']=JSON.stringify({gabel:[null]});
    if(kind==='null-options'){const t=clone();t.v=[{k:'Durchmesser',o:null,d:0}];s.daten['mtb.eigene']=JSON.stringify({griffe:[t]});pr.liste.real[0].build.griffe=t.id;}
    if(kind==='text-price'){const t=clone();t.p='keineZahl';s.daten['mtb.eigene']=JSON.stringify({griffe:[t]});pr.liste.real[0].build.griffe=t.id;}
    if(kind==='unknown-slot')pr.liste.real[0].wuensche=[{id:'w-slot',slot:'unknown-slot',frei:{n:'Harmlos',l:''},stufe:'einkauf'}];
    if(kind==='javascript-link')pr.liste.real[0].wuensche=[{id:'w-link',slot:'griffe',frei:{n:'Harmlos',l:'javascript:window.__linkXss=1'},stufe:'einkauf'}];
    s.daten['mtb.profile']=JSON.stringify(pr);return JSON.stringify(s);
  },kind);
}
async function ownForm(slot='griffe'){
  await ev(slot=>oeffneEigen(slot),slot);
  await page.locator('#eg-n').fill(slot==='gabel'?'Auditgabel mit Varianten':'Auditgriffe');
  await page.locator('#eg-m').fill('Synthetischer Audit');await page.locator('#eg-p').fill('25');await page.locator('#eg-g').fill('130');
  if(slot==='gabel'){const value=await page.locator('#eg-v option').evaluateAll(els=>els.find(e=>e.value==='g-pike'||e.value.startsWith('g-pike|'))?.value);ok(value,'Pike-Vorlage fuer gueltige Massvarianten vorhanden');await page.locator('#eg-v').selectOption(value);}
}
async function seedOwn(mode='real',all=false){
  return ev(({mode,all})=>{
    wechsle(mode);setzeBau(JSON.parse(JSON.stringify(START)),true);
    const id='x-audit-shopping',part={...rohTeil('griffe','gr-ge1'),id,n:'Auditgriffe',eigen:true};eigene.griffe=[part];INDEX={};
    const modes=all?MODI:[mode];const trials={};
    for(const m of modes){
      const p=aktivesProfil(m),w={id:'w-audit-'+m,slot:'griffe',teil:id,ziel:'',budget:0,zeit:Date.now(),stufe:'einkauf'};p.wuensche=[w];
      if(all){const old=m==='markt'?id:'gr-ge1',target=m==='markt'?'gr-ge2':id;p.test={slot:'griffe',von:old,zu:target,wid:w.id};p.build.griffe=target;builds[m]=p.build;if(m===modus)build=p.build;trials[m]={old,target};}
    }
    view='wunsch';upNein();sichern();zeichne();upNein();sichern();return {id,trials};
  },{mode,all});
}
async function run(group,name,fn){
  if(groupFilter&&group!==groupFilter)return;
  const started=Date.now();let result={group,name,ok:false};
  try{result.info=await fn();eq(errors,[],'Keine JavaScript-Laufzeitfehler');result.ok=true;}
  catch(e){result.error=e.stack||String(e);result.browserErrors=[...errors];try{await page.screenshot({path:path.join(out,'regression-fehler-'+group+'-'+(results.length+1)+'.png'),fullPage:false});}catch{}}
  result.ms=Date.now()-started;results.push(result);groups.set(group,(groups.has(group)?groups.get(group):true)&&result.ok);
  console.log((result.ok?'PASS ':'FAIL ')+group+' '+name+(result.ok?'':'\n'+result.error));
}
try{
  // D01: echte Importdateien, Ablehnung vor jeder Mutation.
  for(const kind of ['wish-id','profile-id'])await run('D01',kind+' wird vor Speichern verworfen',async()=>{
    await fresh({width:320});const text=await backupMutation(kind),before=await raw();const r=await importFile(text);
    eq(r.preview,0,'Kein Ersetzen fuer ungueltige IDs');ok(/beschädigt|damaged/i.test(r.toast),'Verstaendliche Ablehnung');eq(await raw(),before,'Ablehnung laesst alle gespeicherten Rohwerte unveraendert');
    eq(await ev(()=>({wish:window.__auditXss||0,profile:window.__profileXss||0})),{wish:0,profile:0});
    return {noMutation:true,noMarker:true};
  });
  await run('D01','Doppelte Profil-IDs im Import abgelehnt',async()=>{
    await fresh();const text=await backupMutation('duplicate-id'),before=await raw(),r=await importFile(text);
    eq(r.preview,0);ok(/doppelte|duplicate/i.test(r.toast),'Konkreter Hinweis auf doppelte Kennungen');eq(await raw(),before);return {rejected:true};
  });
  await run('D01','Lokaler Start: doppelte und unsichere IDs isoliert, Original geschuetzt',async()=>{
    await fresh();const bad=await ev(()=>{
      const pr=JSON.parse(localStorage.getItem('mtb.profile')),same=pr.liste.traum[0].id;
      pr.liste.real[0].id=same;pr.aktiv.real=same;
      pr.liste.markt[0].id='p"><img src=x onerror="window.__profileXss=1"><i data-x="';pr.aktiv.markt=pr.liste.markt[0].id;
      pr.liste.traum[0].wuensche=[{id:'w-invalid',slot:'unknown-slot',frei:{n:'Harmlos',l:''},stufe:'einkauf'}];
      const text=JSON.stringify(pr);localStorage.setItem('mtb.profile',text);return text;
    });
    await reload();const state=await ev(()=>({ids:MODI.flatMap(m=>profile[m].map(p=>p.id)),schutz:ladeProfilSchutz,defekt:ladeDefekte.has('mtb.profile'),marker:window.__profileXss||0,wishes:MODI.flatMap(m=>profile[m].flatMap(p=>p.wuensche||[])),raw:localStorage.getItem('mtb.profile')}));
    eq(state.raw,bad,'Rohdaten zur Rettung unveraendert');eq(state.schutz,true);eq(state.defekt,true);eq(state.marker,0);
    eq(new Set(state.ids).size,state.ids.length,'Keine Foto-/Setup-Aliase durch doppelte Kennungen');ok(state.ids.every(id=>/^[A-Za-z0-9_-]{1,120}$/.test(id)));
    ok(state.wishes.every(w=>w.slot!=='unknown-slot'),'Unlesbare Wuensche gelangen nicht zur Darstellung');return {safeIds:state.ids.length,protected:true};
  });

  // D02: Fehlgeschlagene Anlage darf weder Katalog noch aktuelles Teil veraendern.
  for(const key of ['mtb.eigene','mtb.profile'])await run('D02','Eigenes Teil: setItem '+key,async()=>{
    await fresh();await ownForm();const before=await raw(),ram=await memory();await fault({set:[key]});await page.locator('[data-eigenspeichern="griffe"]').click();
    const info=await faultInfo();ok(info.hits.length>0,'Fehler wurde tatsaechlich injiziert');ok(/nicht angelegt|not created/i.test(info.toast),'Kein Erfolgstoast');
    eq(await memory(),ram,'RAM nach Abbruch unveraendert');eq(await raw(),before,'Persistenz nach Abbruch unveraendert');await reload();eq(await memory(),ram,'Alter Bau nach Reload unveraendert');
    return info;
  });
  await run('D02','Rollback selbst gesperrt: ehrliche Warnung und RAM erhalten',async()=>{
    await fresh();await ownForm();const ram=await memory(),registry=await ev(()=>localStorage.getItem('mtb.eigene'));
    await fault({rollbackOwn:true});await page.locator('[data-eigenspeichern="griffe"]').click();const info=await faultInfo();
    ok(info.hits.some(h=>h==='set:mtb.profile')&&info.hits.some(h=>h==='set:mtb.eigene'),'Vorwaertsfehler und Rueckschreibfehler erreicht');
    eq(await memory(),ram,'RAM bleibt alter Stand trotz gesperrtem Rollback');ok(/Zurücksetzen.*nicht vollständig|restoring could not finish/i.test(info.toast),'Unvollstaendiger Rollback wird ausdruecklich gemeldet');
    ok(await ev(()=>localStorage.getItem('mtb.eigene'))!==registry,'Synthetisch erzwungener Rest im Speicher nachgewiesen');return info;
  });

  // D03: Rad / Kopie und Bilder / Setup muessen gemeinsam bestehen bleiben.
  for(const copy of [false,true])for(const key of copy?['mtb.profile','mtb.setup']:['mtb.profile'])await run('D03',(copy?'Kopie':'Neues Rad')+': '+key+' gesperrt',async()=>{
    await fresh();await seedProfiles();const before=await raw(),ram=await memory();await fault({set:[key]});
    const returned=await ev(copy=>profilNeu(copy?aktivId.real:undefined),copy);eq(returned,false);const info=await faultInfo();ok(info.hits.length);
    eq(await memory(),ram,'Profile, Aktiv-ID, Bau, Foto und Setup im RAM erhalten');eq(await raw(),before,'Alle persistenten Rohwerte zurueckgesetzt');await reload();eq(await memory(),ram,'Profile, Foto und Setup nach Reload erhalten');
    return info;
  });
  for(const kind of ['profile-set','setup-set','photo-remove','gabel-topcap-remove','daempfer-topcap-remove'])await run('D03','Rad loeschen: '+kind,async()=>{
    await fresh();const ids=await seedProfiles(),ram=await memory(),before=await raw();
    const spec=kind==='profile-set'?{set:['mtb.profile']}:kind==='setup-set'?{set:['mtb.setup']}:kind==='photo-remove'?{remove:['mtb.foto.'+ids.first]}:{remove:['mtb.topcap.'+ids.first+'.'+(kind.startsWith('gabel')?'gabel':'daempfer')]};
    await fault(spec);const returned=await ev(id=>profilLoeschen(id),ids.first);eq(returned,false);const info=await faultInfo();ok(info.hits.length);
    eq(await memory(),ram,'Geloeschtes und aktives Profil im RAM zurueck');eq(await raw(),before,'Foto, beide Topcaps, Setup und Profile atomar erhalten');await reload();eq(await memory(),ram,'Gleiches Rad und alle Daten nach Reload');
    return info;
  });

  // Gesonderte RAM-Foto-Grenze: vorheriger Fotospeicherfehler wird nicht still verschlimmert.
  for(const operation of ['new-fail','copy-fail','inactive-delete-fail','inactive-delete-success'])await run('FOTO','RAM-Foto bleibt bei '+operation,async()=>{
    await fresh();const ids=await seedProfiles();await ev(photo=>{fotos.real=photo;},RAM_PHOTO);const ram=await memory();
    if(operation!=='inactive-delete-success')await fault({set:['mtb.profile']});
    const returned=await ev(({operation,ids})=>operation.startsWith('inactive')?profilLoeschen(ids.second):profilNeu(operation==='copy-fail'?ids.first:undefined),{operation,ids});
    eq(returned,operation==='inactive-delete-success');eq(await ev(()=>fotos.real),RAM_PHOTO,'Neuestes nur im RAM vorhandenes Foto bleibt sichtbar');eq(await ev(()=>aktivId.real),ids.first);
    if(operation!=='inactive-delete-success')eq(await memory(),ram,'Restlicher RAM ebenfalls unveraendert');
    else {eq(await ev(()=>localStorage.getItem(fotoFach(aktivId.real))),RAM_PHOTO,'Erfolg speichert neueres aktives Foto statt altem Diskfoto');eq(await ev(()=>profile.real.length),1);}
    return {operation,photoRetained:true};
  });
  for(const copy of [false,true])await run('FOTO','Neueres RAM-Foto vor erfolgreichem '+(copy?'Kopieren':'Anlegen')+' sichern',async()=>{
    await fresh();const ids=await seedProfiles();await ev(photo=>{fotos.real=photo;},RAM_PHOTO);
    eq(await ev(copy=>profilNeu(copy?aktivId.real:undefined),copy),true);const newId=await ev(()=>aktivId.real);ok(newId!==ids.first);
    eq(await ev(id=>localStorage.getItem(fotoFach(id)),ids.first),RAM_PHOTO,'Altes Rad speichert das neuere Foto vor Wechsel');
    if(copy)eq(await ev(()=>fotos.real),RAM_PHOTO,'Kopie zeigt das neuere Foto');
    else eq(await ev(()=>fotos.real),null,'Leeres neues Rad bekommt kein fremdes Foto');
    await reload();await ev(id=>profilWechseln(id),ids.first);eq(await ev(()=>fotos.real),RAM_PHOTO,'Originalfoto nach Reload erhalten');
    if(copy){await ev(id=>profilWechseln(id),newId);eq(await ev(()=>fotos.real),RAM_PHOTO,'Kopiertes Foto nach Reload erhalten');}
    return {newId,originalPhotoRetained:true,copy};
  });
  for(const copy of [false,true])await run('FOTO','Altes Fotofach gesperrt: '+(copy?'Kopie':'Neues Rad')+' atomar abbrechen',async()=>{
    await fresh();const ids=await seedProfiles();await ev(photo=>{fotos.real=photo;},RAM_PHOTO);const ram=await memory(),before=await raw();
    await fault({set:['mtb.foto.'+ids.first]});eq(await ev(copy=>profilNeu(copy?aktivId.real:undefined),copy),false);
    const info=await faultInfo();ok(info.hits.length);eq(await memory(),ram);eq(await raw(),before);return info;
  });
  await run('FOTO','CS04 Kopie ohne Fotoplatz markiert und Foto spaeter wiederherstellbar',async()=>{
    await fresh();const ids=await seedProfiles();await fault({onlyExistingPhotos:[ids.first,ids.second].map(id=>'mtb.foto.'+id)});
    eq(await ev(id=>profilNeu(id),ids.first),true);const copyId=await ev(()=>aktivId.real),info=await faultInfo();
    ok(info.hits.includes('set:mtb.foto.'+copyId));ok(/ohne Foto/.test(info.toast),'Teilkopie ehrlich gemeldet');
    eq(await ev(()=>aktivesProfil().fotoVon),ids.first);eq(await ev(()=>fotos.real),null);eq(await ev(id=>localStorage.getItem(fotoFach(id)),ids.first),PHOTO);
    await unFault();await reload();eq(await ev(()=>aktivesProfil().fotoVon),ids.first,'Teilkopie bleibt nach Reload markiert');
    await ev(()=>fotoVomOriginal());eq(await ev(()=>fotos.real),PHOTO);eq(await ev(()=>aktivesProfil().fotoVon),undefined);await reload();eq(await ev(()=>fotos.real),PHOTO);
    return {copyId,photoRecovered:true};
  });

  // D04: Originale unlesbare Datensaetze, keine neue breite Angriffssuche.
  for(const kind of ['null-custom','null-options','text-price','unknown-slot','javascript-link'])await run('D04',kind+' abgelehnt ohne Datenaustausch',async()=>{
    await fresh();const text=await backupMutation(kind),before=await raw();const r=await importFile(text);
    eq(r.preview,0,'Kaputte Unterstruktur zeigt keinen Ersetzen-Knopf');eq(await raw(),before,'Kein Schluessel durch abgelehnte Sicherung ersetzt');ok(r.toast.length>0);
    return {rejected:true,toast:r.toast};
  });
  await run('IMPORT-OK','Gueltige eigene Gabel mit Massvarianten exportieren/importieren',async()=>{
    await fresh({width:320});const ids=await seedProfiles();await ownForm('gabel');await page.locator('[data-eigenspeichern="gabel"]').click();
    const seed=await ev(()=>{
      const t=rohTeil('gabel',basisVon(build.gabel));if(!t?.eigen||!t.v?.length)throw new Error('Eigene Gabel hat keine Massvarianten');
      const w=t.v.map(d=>d.d||0);w[0]=Math.min(1,t.v[0].o.length-1);build.gabel=varianteNachIndex(t,w).id;
      merken('griffe','gr-ge1');suP(suDaten()).psi.gabel=110;suLog(suDaten(),{typ:'notiz',txt:'Importnotiz behalten'});upNein();suSichern();sichern();zeichne();sichern();
      return {part:JSON.parse(JSON.stringify(findeTeil('gabel',build.gabel))),text:JSON.stringify(sicherungErstellen(true))};
    });
    const expected=await memory();await ev(()=>{build.griffe=null;aktivesProfil().name='Vor Import abweichend';sichern();});
    await importFile(seed.text,true);const actual=await memory();
    eq(actual,expected,'Valider Import erhaelt Profile/Varianten/Wuensche/Fotos/Setups semantisch');eq(await ev(()=>({defekte:[...ladeDefekte],schutz:ladeProfilSchutz})),{defekte:[],schutz:false},'Kein Rettungsschutz nach gueltigem Import');
    eq(await ev(()=>findeTeil('gabel',build.gabel)),seed.part,'Varianten-ID und gewaehlte Masse korrekt wieder lesbar');ok(actual.profile.real.some(p=>p.id===ids.second),'Zweites Rad bleibt erhalten');
    return {profiles:actual.profile.real.length,customId:seed.part.id,variants:seed.part.v.length};
  });

  // D05: echte Loeschen-/Einkauf-Klickwege in allen Modi.
  for(const mode of ['real','traum','markt'])await run('D05','Eigenes Teil loeschen, Einkauf intakt: '+mode,async()=>{
    await fresh({width:mode==='markt'?320:390});await seedOwn(mode);
    // Einkaufstufe wird bewusst per echtem Knopf an-/ausgeschaltet.
    await page.locator('[data-wkauf]').click();await page.locator('[data-wkauf]').click();
    await ev(()=>oeffneDetail('griffe','x-audit-shopping'));await page.locator('[data-eigenweg]').click();await page.locator('.tabs [data-view="deals"]').click();
    const r=await ev(()=>({wish:wunschListe()[0],registered:!!findeTeil('griffe','x-audit-shopping'),html:wunschKaufHtml()}));
    eq(r.registered,false);eq(r.wish.teil,undefined);eq(r.wish.frei,{n:'Auditgriffe',l:''});eq(r.wish.stufe,'einkauf');ok(/Auditgriffe/.test(r.html)&&/Preis offen|Price pending/.test(r.html),'Freier Wunsch bleibt erkennbar und ohne erfundenen Preis');
    await reload();eq(await ev(()=>wunschListe()[0]),r.wish,'Umgewandelter Wunsch nach Reload erhalten');return {mode,wish:r.wish};
  });
  for(const key of ['mtb.eigene','mtb.profile'])await run('D05','Eigenes Loeschen mit Tests/Wuenschen: '+key+' gesperrt',async()=>{
    await fresh();await seedOwn('real',true);const before=await raw(),ram=await memory();await fault({set:[key]});
    await ev(()=>oeffneDetail('griffe','x-audit-shopping'));await page.locator('[data-eigenweg]').click();const info=await faultInfo();
    ok(info.hits.length);eq(await memory(),ram,'Bauten, Vorschautests, Wuensche und Register im RAM zurueck');eq(await raw(),before,'Alle Aufbauten atomar zurueckgesetzt');await reload();eq(await memory(),ram,'Vorschautests und Wuensche nach Reload erhalten');
    return info;
  });
  await run('D05','Erfolgreiches Loeschen beendet betroffene Vorschautests aller Modi',async()=>{
    await fresh();const seed=await seedOwn('real',true);eq(await ev(()=>eigenLoeschen('griffe','x-audit-shopping')),true);
    const r=await ev(()=>MODI.map(m=>({m,id:aktivesProfil(m).build.griffe,test:aktivesProfil(m).test,wish:aktivesProfil(m).wuensche[0],working:builds[m].griffe})));
    for(const x of r){eq(x.test,undefined,'Veralteter Test beendet');eq(x.id,x.m==='markt'?null:seed.trials[x.m].old,'Echtes altes Teil bzw. null statt geloeschtem Teil');eq(x.working,x.id,'Aktiver Arbeitsbau stimmt');eq(x.wish.teil,undefined);eq(x.wish.frei.n,'Auditgriffe');}
    const ram=await memory();await reload();eq(await memory(),ram);return r;
  });

  // D06: tatsaechliche Downloadbytes und ehrliche Erfolg-/Fehlermeldung.
  for(const key of ['mtb.setup','mtb.profile',null])await run('D06','Backup: '+(key?'setItem '+key+' gesperrt':'vollstaendiger Erfolg'),async()=>{
    await fresh();const setupKey=await ev(()=>{const d=suDaten();suP(d).psi.gabel=110;return suKey(federRechnen());});
    if(key)await fault({set:[key]});
    const waiting=page.waitForEvent('download');await ev(()=>sicherungSpeichern());const download=await waiting,stream=await download.createReadStream(),chunks=[];for await(const chunk of stream)chunks.push(chunk);
    const backup=JSON.parse(Buffer.concat(chunks).toString('utf8')),psi=JSON.parse(backup.daten['mtb.setup'])[setupKey].prof[await ev(()=>fedModus)].psi.gabel,info=await faultInfo();
    eq(psi,key==='mtb.setup'?102:110,'Dateiinhalt entspricht tatsaechlich gesichertem Setup');
    if(key){ok(info.hits.length);ok(/Änderungen fehlen|changes are missing/.test(info.toast),'Veraltete/unsichere Sicherung wird deutlich benannt');}
    else {ok(/Sicherung .*gespeichert/.test(info.toast),'Vollstaendiger Erfolg wird bestaetigt');ok(!/fehlen|missing/.test(info.toast));}
    return {psi,bytes:Buffer.concat(chunks).length,...info};
  });
}finally{
  if(context)await context.close();await browser.close();await new Promise(r=>server.close(r));
  const passed=results.filter(r=>r.ok).length,groupCount=groups.size,groupPassed=[...groups.values()].filter(Boolean).length;
  const summary={source,method:'Isolierter Chrome; einmaliger HTML-Snapshot; externe Requests blockiert; synthetische lokale Daten; echte Dateiimporte/Downloads und relevante Klickwege.',executed:results.length,passed,failed:results.length-passed,groups:groupCount,groupsPassed:groupPassed,blockedExternalRequests:blocked,results};
  const dest=path.join(out,process.env.RESULT_NAME||'regression-ergebnisse.json');fs.writeFileSync(dest,JSON.stringify(summary,null,2));
  console.log('ERGEBNISDATEI: '+dest);
  console.log('DATEN-REGRESSION: '+passed+' von '+results.length+' Pruefungen bestanden; '+groupPassed+' von '+groupCount+' Gruppen bestanden');
  if(passed!==results.length||!results.length)process.exitCode=1;
}

