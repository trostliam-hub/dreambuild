/* Nachbesserungen aus APP-CLAUDE-AUDIT-001, CS-03 bis CS-07.
 * Aufruf: node tools/audit-test.mjs
 * Ausschliesslich isolierte synthetische Testdaten; externe Requests werden blockiert.
 * Datenfaelle vergleichen den gesamten gespeicherten Stand vorher/nachher, nicht nur Rueckgabewerte.
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
const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'de-DE',timezoneId:'Europe/Berlin',reducedMotion:'reduce',serviceWorkers:'block',acceptDownloads:true});
await ctx.route('**/*',r=>new URL(r.request().url()).origin===origin&&['GET','HEAD'].includes(r.request().method())?r.continue():r.abort());
const page=await ctx.newPage(),errors=[];
page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));
const ev=(f,a)=>page.evaluate(f,a);
const bereit=()=>page.waitForFunction(()=>typeof suDaten==='function'&&typeof sicherungPruefen==='function'&&!!document.querySelector('#aufbau'));
const neuLaden=async()=>{await page.reload();await bereit();};
/* Gesamter gespeicherter Stand, sortiert */
const alles=()=>ev(()=>Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])));
const toast=()=>ev(()=>$('toast').hidden?'':$('toast').textContent);

const leer=async()=>{
  await page.goto(url);
  await ev(()=>{localStorage.clear();for(const k of ['einstieg2','tour','szenen','start'])localStorage.setItem('mtb.'+k,'1');localStorage.setItem('mtb.sprache','de');});
  await neuLaden();
};
/* Echter Nutzerstand: Rad mit Namen, Wunsch, Foto, 475-lbs-Feder, Fahrwerkwerten und Notiz */
const FOTO='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const fuellen=async()=>{
  await leer();
  await ev(FOTO=>{
    schliesse();schliesseStartseite();wechsle('real');
    build.rahmen='f-spindrift';build.gabel='g-zeb';
    const t=katalog(quelleOf(slotOf('daempfer'))).find(t=>t.id==='d-sdcoil');build.daempfer=besteVariante('daempfer',t,build).id;plan.fahrer=80;
    delete build.fw;fwPruef();const fw=fwInfo();fw.fertig=true;fw.fragenVersion=FW_FRAGEN_VERSION;fw.gj=2027;fw.dj=2025;fw.df=475;
    fw.besucht=Object.fromEntries(obSchritte().filter(n=>!['start','ende'].includes(n)).map(n=>[n,true]));
    fw.stil={gelaende:'ruppig',tempo:'zuegig',spruenge:'klein',gefuehl:'mittel',bergauf:'egal'};
    aktivesProfil().name='Wichtiger Altstand';wunschListe().push({id:'w-alt',slot:'gabel',teil:'g-pike',stufe:'gemerkt'});
    fotos.real=FOTO;fedModus='allround';sichern();
    const d=suDaten();suP(d,'allround').psi.gabel=102;suP(d,'allround').off['gabel|Zugstufe']=2;suLog(d,{typ:'notiz',txt:'Hausrunde, trocken'});suSichern();
  },FOTO);
};
/* Sicherung ueber die echte Dateiauswahl laden; Ergebnis: Hinweis oder Vorschau */
const dateiLaden=async text=>{
  await ev(()=>{const t=$('toast');t.hidden=true;t.textContent='';schliesse();});
  const [fc]=await Promise.all([page.waitForEvent('filechooser'),ev(()=>sicherungWaehlen())]);
  await fc.setFiles({name:'crankscore-sicherung.json',mimeType:'application/json',buffer:Buffer.from(text)});
  await page.waitForFunction(()=>!$('toast').hidden||!!document.querySelector('#modal [data-sicherung="anwenden"]'));
  return {toast:await toast(),vorschau:!!await page.$('#modal [data-sicherung="anwenden"]')};
};
const ersetzen=async()=>{await Promise.all([page.waitForEvent('load'),page.click('#modal [data-sicherung="anwenden"]')]);await bereit();};
const sicherungMit=aendern=>ev(a=>{const s=sicherungErstellen(true);(new Function('s','pr',a))(s,s.daten['mtb.profile']?JSON.parse(s.daten['mtb.profile']):null);return JSON.stringify(s);},aendern);

let count=0,failed=0;
async function test(name,fn){count++;const e0=errors.length;
  try{await fn();if(errors.length>e0)throw new Error('JS-Fehler: '+errors.slice(e0).join(' | '));console.log('  ok   '+name);}
  catch(e){failed++;console.log('  FEHL '+name+'\n       '+String(e.message||e).split('\n').slice(0,6).join('\n       '));}}

/* ── CS-03: Sicherung und Start pruefen die Struktur ── */
await test('CS-03 Sicherung mit unlesbarem Rad wird abgelehnt, kein mtb.*-Eintrag aendert sich',async()=>{
  await fuellen();const vorher=await alles();
  for(const [fall,js] of [['Rad null (Audit)','pr.liste.real=[null];s.daten["mtb.profile"]=JSON.stringify(pr);'],
      ['Profil fehlt','delete pr.liste.markt;s.daten["mtb.profile"]=JSON.stringify(pr);'],
      ['Einsatz als Zahl','pr.liste.traum[0].sel=42;s.daten["mtb.profile"]=JSON.stringify(pr);'],
      ['Wuensche als Text','pr.liste.real[0].wuensche="x";s.daten["mtb.profile"]=JSON.stringify(pr);'],
      ['Aufbauten als Liste','s.daten["mtb.builds"]="[1,2]";']]){
    const r=await dateiLaden(await sicherungMit(js));
    assert.ok(!r.vorschau,fall+': keine Vorschau zum Ersetzen');assert.match(r.toast,/beschädigt/,fall+': verstaendliche Ablehnung');
    assert.deepEqual(await alles(),vorher,fall+': Speicher unveraendert');
  }
  await neuLaden();
  const r=await ev(()=>({name:aktivesProfil('real').name,w:wunschListe(aktivesProfil('real')).length,schutz:ladeProfilSchutz}));
  assert.deepEqual(r,{name:'Wichtiger Altstand',w:1,schutz:false});
});

await test('CS-03 Sicherung mit unlesbarem Setup wird abgelehnt; fehlende Teile (Audit-Fall) werden ergaenzt, Export laeuft',async()=>{
  await fuellen();const vorher=await alles();
  for(const setup of [{'r|g|d':{log:'kaputt'}},{'r|g|d':5},{'r|g|d':{prof:{allround:{psi:[]}}}},{'r|g|d':{log:[null]}}]){
    const r=await dateiLaden(await sicherungMit(`s.daten["mtb.setup"]=${JSON.stringify(JSON.stringify(setup))};`));
    assert.ok(!r.vorschau&&/beschädigt/.test(r.toast),'abgelehnt: '+JSON.stringify(setup));assert.deepEqual(await alles(),vorher);
  }
  const r=await dateiLaden(await sicherungMit(`s.daten["mtb.setup"]=JSON.stringify({"bad-key":{prof:{}}});`));
  assert.ok(r.vorschau,'Audit-Fall: nur fehlende Teile, wird angenommen');await ersetzen();
  const nach=await ev(()=>{let fehler='';try{sicherungSpeichern();}catch(e){fehler=e.message;}return {fehler,setup:JSON.parse(localStorage.getItem('mtb.setup')),name:aktivesProfil('real').name,schutz:ladeProfilSchutz};});
  assert.equal(nach.fehler,'','Export wirft nicht');assert.ok(!('bad-key' in nach.setup),'leerer Eintrag wird beim Sichern entfernt');
  assert.equal(nach.name,'Wichtiger Altstand');assert.equal(nach.schutz,false);
});

await test('CS-03 Start mit Einsatz als Text: Oberflaeche vollstaendig, Einsatz bleibt (Audit-Fall)',async()=>{
  for(const sel of ['trail','enduro']){
    await fuellen();
    await ev(sel=>{const q=JSON.parse(localStorage.getItem('mtb.profile'));const p=q.liste.traum[0];p.sel=sel;p.name='';p.build={};localStorage.setItem('mtb.profile',JSON.stringify(q));},sel);
    await neuLaden();
    const r=await ev(()=>{wechsle('traum');zeichne();sichern();return {gruppen:document.querySelectorAll('#aufbau .grp').length,schutz:ladeProfilSchutz,
      sel:JSON.parse(localStorage.getItem('mtb.profile')).liste.traum[0].sel,real:aktivesProfil('real').name};});
    assert.ok(r.gruppen>0,'Aufbaugruppen sichtbar');assert.equal(r.schutz,false);assert.deepEqual(r.sel,[sel]);assert.equal(r.real,'Wichtiger Altstand');
  }
});

await test('CS-03 Start mit unlesbarem Einsatz: Rettungsschutz greift, Original bleibt unveraendert',async()=>{
  await fuellen();
  await ev(()=>{const q=JSON.parse(localStorage.getItem('mtb.profile'));q.liste.traum[0].sel={x:1};localStorage.setItem('mtb.profile',JSON.stringify(q));});
  const roh=await ev(()=>localStorage.getItem('mtb.profile'));await neuLaden();await page.waitForTimeout(700);
  const r=await ev(()=>{sichern();return {schutz:ladeProfilSchutz,gleich:localStorage.getItem('mtb.profile'),gruppen:document.querySelectorAll('#aufbau .grp').length};});
  assert.equal(r.schutz,true);assert.equal(r.gleich,roh,'Original nicht ueberschrieben');assert.ok(r.gruppen>0);
  assert.match(await toast(),/Radprofile/);
});

await test('CS-03 Start mit unlesbaren Setup-Eintraegen: Lesbares nutzbar, Unlesbares unveraendert aufbewahrt, Export und Wiederladen gehen',async()=>{
  await fuellen();
  const kaputt={'x|y|z':{log:'kaputt',prof:{allround:{psi:{gabel:1}}}},'q':7};
  await ev(k=>{const s=JSON.parse(localStorage.getItem('mtb.setup'));Object.assign(s,k);localStorage.setItem('mtb.setup',JSON.stringify(s));},kaputt);
  await neuLaden();await page.waitForTimeout(700);
  assert.match(await toast(),/Fahrwerk-Setup/,'Hinweis beim Start');
  const r=await ev(()=>{const d=suDaten();let fehler='';try{sicherungSpeichern();}catch(e){fehler=e.message;}
    const s=sicherungErstellen(true),p=sicherungPruefen(JSON.stringify(s));
    return {psi:suP(d,'allround').psi.gabel,notiz:d.log.some(e=>e.txt==='Hausrunde, trocken'),fehler,import:p.fehler||'ok',
      rest:JSON.parse(localStorage.getItem('mtb.setuprest')),setup:Object.keys(JSON.parse(localStorage.getItem('mtb.setup')))};});
  assert.equal(r.psi,102);assert.ok(r.notiz);assert.equal(r.fehler,'');assert.equal(r.import,'ok','Sicherung davon laesst sich wieder laden');
  const eintraege=Object.values(r.rest);assert.equal(eintraege.length,1);assert.deepEqual(eintraege[0].eintraege,kaputt,'Unlesbares unveraendert aufbewahrt');
  assert.ok(!r.setup.includes('q')&&!r.setup.includes('x|y|z'));
  await neuLaden();await page.waitForTimeout(700);
  assert.doesNotMatch(await toast(),/Fahrwerk-Setup/,'zweiter Start ohne Hinweis');
  assert.equal(Object.keys(await ev(()=>JSON.parse(localStorage.getItem('mtb.setuprest')))).length,1,'keine doppelte Aufbewahrung');
});

await test('CS-03 Setup-Datei ganz unlesbar: Original aufbewahrt, App laeuft; ohne Platz bleibt sie unangetastet',async()=>{
  await fuellen();await ev(()=>localStorage.setItem('mtb.setup','{kaputt'));await neuLaden();
  const r=await ev(()=>{const d=suDaten();return {rest:Object.values(JSON.parse(localStorage.getItem('mtb.setuprest')))[0],log:d.log.length,setup:localStorage.getItem('mtb.setup')};});
  assert.deepEqual(r.rest,{text:'{kaputt'});assert.equal(r.log,0);assert.equal(r.setup,'{}');
  /* Speicher voll: Aufbewahren scheitert -> mtb.setup bleibt, wie es war, auch nach Aenderungen */
  await ev(()=>{localStorage.removeItem('mtb.setuprest');localStorage.setItem('mtb.setup','{kaputt');});
  await page.addInitScript(()=>{if(sessionStorage.getItem('voll')!=='1')return;const o=Storage.prototype.setItem;
    Storage.prototype.setItem=function(k,v){if(k==='mtb.setuprest')throw new DOMException('voll','QuotaExceededError');return o.call(this,k,v);};});
  await ev(()=>sessionStorage.setItem('voll','1'));await neuLaden();
  const v=await ev(()=>{const d=suDaten();suP(d).psi.gabel=99;suSichern();return {setup:localStorage.getItem('mtb.setup'),schutz:setupSchutz};});
  await ev(()=>sessionStorage.removeItem('voll'));
  assert.equal(v.setup,'{kaputt','unlesbares Original nicht ueberschrieben');assert.equal(v.schutz,true);
});

await test('CS-03 gueltige Sicherung mit Foto, Wunsch, 475 lbs und Notiz: Rundreise ueber die Oberflaeche ohne Verlust',async()=>{
  await fuellen();await ev(()=>{sichern();suSichern();});const vorher=await alles();
  const text=await ev(()=>JSON.stringify(sicherungErstellen(true)));
  await ev(()=>{aktivesProfil('real').name='Geaendert';fotos.real=null;const d=suDaten();d.log=[];suSichern();sichern();});
  const r=await dateiLaden(text);assert.ok(r.vorschau,'gueltige Sicherung zeigt Vorschau');await ersetzen();
  const nach=await alles();
  for(const k of Object.keys(vorher)) assert.equal(nach[k],vorher[k],'unveraendert nach Rundreise: '+k);
  const z=await ev(()=>({df:builds.real.fw&&builds.real.fw.df,foto:!!fotos.real,w:wunschListe(aktivesProfil('real')).length,notiz:suDaten().log.some(e=>e.txt==='Hausrunde, trocken')}));
  assert.deepEqual(z,{df:475,foto:true,w:1,notiz:true});
});

await test('CS-03 bekannte aeltere Sicherungsformen werden weiter angenommen',async()=>{
  await leer();
  const r=await ev(()=>{const alt={format:SICHERUNG_FORMAT,version:1,app:'20261001-1200',fotos:false,daten:{
      'mtb.builds':JSON.stringify({traum:{rahmen:'f-spindrift'}}),'mtb.sel':'["enduro"]','mtb.plan':'{}','mtb.fahrer':'80',
      'mtb.setup':JSON.stringify({'g-zeb|-':{log:[{typ:'notiz',txt:'alt',t:1}],off:{'gabel|Zugstufe':2},psi:{gabel:90},standard:{t:1,off:{}},sag:{gabel:30},fertig:{'gabel|Zugstufe':true}},
        'p1|g-zeb|-':{log:[],prof:{allround:{psi:{gabel:95},off:{},gesp:null}}}})}};
    const s=sicherungPruefen(JSON.stringify(alt));return s.fehler||s.vorschau.setup;});
  assert.equal(r,2,'Altformen ohne Profilliste und ohne Messfaecher werden angenommen (2 Setups)');
});

/* ── CS-04: Radkopie bei echter Speicherknappheit (kein geworfener Mockfehler) ── */
const grossesFoto=()=>ev(()=>{pro={key:'isoliert',inst:'i',status:'aktiv',geprueft:Date.now()};
  const c=document.createElement('canvas');c.width=c.height=600;const x=c.getContext('2d'),d=x.createImageData(600,600);let z=17;
  for(let i=0;i<d.data.length;i+=4){z=(z*1664525+1013904223)>>>0;d.data[i]=z&255;d.data[i+1]=(z>>>8)&255;d.data[i+2]=(z>>>16)&255;d.data[i+3]=255;}
  x.putImageData(d,0,0);fotos.real=c.toDataURL('image/jpeg',.85);sichern();return {id:aktivId.real,len:fotos.real.length};});
/* Speicher bis auf "rest" Zeichen fuellen (Fuellwert ausserhalb von mtb.*) */
const fuellenBis=rest=>ev(rest=>{let lo=0,hi=6*1024*1024;localStorage.removeItem('test.fueller');
  while(hi-lo>500){const n=(lo+hi)>>1;try{localStorage.setItem('test.fueller','x'.repeat(n));lo=n;}catch(e){hi=n;}}
  localStorage.setItem('test.fueller','x'.repeat(Math.max(0,lo-rest)));return lo;},rest);
/* Ohne Fuellwert; ein leeres Anzeigefeld "nein" (abgelehnte Vorschlaege, legt die Aufbau-Ansicht beim Zeichnen an)
   zaehlt nicht als Aenderung -- alles andere muss Zeichen fuer Zeichen gleich sein */
const ohneFueller=o=>{const c={...o};delete c['test.fueller'];
  if(c['mtb.profile']){const q=JSON.parse(c['mtb.profile']);for(const m in q.liste)for(const p of q.liste[m])if(p.nein&&!Object.keys(p.nein).length)delete p.nein;c['mtb.profile']=JSON.stringify(q);}
  return c;};
const kopierenKlick=async id=>{await ev(()=>{schliesse();oeffneProfile();});await page.click(`#modal [data-profkopie="${id}"]`);};

await test('CS-04 Radkopie bei vollem Speicher: Kopie sichtbar ohne Foto, Original unveraendert, Foto spaeter uebernehmbar',async()=>{
  await fuellen();const o=await grossesFoto();assert.ok(o.len>100000,'grosses Foto');
  await fuellenBis(40000);await ev(()=>{$('toast').hidden=true;speicherFehlerT=0;});
  await kopierenKlick(o.id);
  assert.match(await toast(),/ohne Foto/,'verstaendliche Meldung');
  const r=await ev(id=>{const st=JSON.parse(localStorage.getItem('mtb.profile')).liste.real,k=st.find(p=>p.id===aktivId.real);
    return {neu:aktivId.real!==id,gespeichert:!!k,markiert:k&&k.fotoVon,origFoto:localStorage.getItem(fotoFach(id)),kopieFoto:localStorage.getItem(fotoFach(aktivId.real)),
      liste:(profUmbenennen=null,oeffneProfile(),$('modal').textContent.includes('Foto fehlt noch'))};},o.id);
  assert.ok(r.neu&&r.gespeichert,'Kopie gespeichert und offen');assert.equal(r.markiert,o.id,'Teilkopie markiert');
  assert.equal(r.origFoto.length,o.len,'Original behaelt sein Foto');assert.equal(r.kopieFoto,null,'kein halbes Foto');assert.ok(r.liste,'Radliste zeigt die Teilkopie');
  await neuLaden();await ev(()=>{schliesse();view='aufbau';zeichne();});
  assert.ok(await page.$('#aufbau [data-fotovon]'),'nach Neuladen: Knopf zum Uebernehmen');
  await page.click('#aufbau [data-fotovon]');assert.match(await toast(),/passt noch nicht/,'ohne Platz: ehrliche Meldung');
  await ev(()=>localStorage.removeItem('test.fueller'));
  await page.click('#aufbau [data-fotovon]');assert.match(await toast(),/übernommen/);
  await neuLaden();
  const n=await ev(id=>({kopie:!!fotos.real,markiert:!!aktivesProfil('real').fotoVon,orig:(localStorage.getItem(fotoFach(id))||'').length}),o.id);
  assert.deepEqual(n,{kopie:true,markiert:false,orig:o.len});
});

await test('CS-04 Kopie passt gar nicht: nichts angelegt, Speicher unveraendert, keine verwaisten Eintraege',async()=>{
  await fuellen();const o=await grossesFoto();
  await fuellenBis(300);const vorher=ohneFueller(await alles());
  await kopierenKlick(o.id);
  assert.match(await toast(),/nichts angelegt/);
  const r=await ev(()=>({n:profile.real.length,akt:aktivId.real,umb:!!document.querySelector('#modal .prof-in')}));
  assert.equal(r.n,1);assert.equal(r.akt,o.id);assert.equal(r.umb,false,'kein Umbenennen-Feld fuer eine nicht angelegte Kopie');
  const nach=ohneFueller(await alles());
  for(const k of new Set([...Object.keys(vorher),...Object.keys(nach)])) {const a=vorher[k]||'',b=nach[k]||'';let i=0;while(i<a.length&&a[i]===b[i])i++;
    assert.ok(nach[k]===vorher[k],'unveraendert: '+k+' ab Zeichen '+i+'\n vorher: '+a.slice(Math.max(0,i-80),i+120)+'\n nachher: '+b.slice(Math.max(0,i-80),i+120));}
  await ev(()=>localStorage.removeItem('test.fueller'));await neuLaden();
  assert.equal(await ev(()=>profile.real.length),1);
});

if(errors.length){count++;failed++;console.log('  FEHL JS-Fehler: '+[...new Set(errors)].join(' | '));}
console.log(`\nAUDIT: ${count-failed} von ${count} bestanden.`);
await browser.close();server.close();
process.exit(failed?1:0);
