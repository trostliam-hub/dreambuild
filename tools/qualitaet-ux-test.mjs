/* QUALITAET-UX: Verhalten, ehrliche Hinweise und Datenerhalt.
 * SOURCE_ROOT liest optional einen anderen lokalen Checkout; LIVE_URL kann
 * einen schon laufenden Testserver angeben. SCREENSHOTS ist optional.
 * Isolierte Browserdaten; externe Dienste und KI-API bleiben blockiert. */
import {createRequire} from 'node:module';
import {execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
let pw;try{pw=require('playwright');}catch{pw=require(execSync('npm root -g').toString().trim()+'/playwright');}
const root=path.resolve(process.env.SOURCE_ROOT||process.env.CRANKSCORE_SOURCE_ROOT||path.join(path.dirname(fileURLToPath(import.meta.url)),'..'));
const server=http.createServer((q,r)=>{
  const f=path.resolve(root,'.'+decodeURIComponent(q.url.split('?')[0]));
  if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){r.writeHead(404);r.end();return;}
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.woff2':'font/woff2','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'};
  r.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=process.env.LIVE_URL||process.env.CRANKSCORE_LIVE_URL||`http://127.0.0.1:${server.address().port}/index.html`;
const screenshots=process.env.SCREENSHOTS||process.env.CRANKSCORE_SCREENSHOTS;
const browser=await pw.chromium.launch();
const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'en-US',timezoneId:'UTC',serviceWorkers:'block',reducedMotion:'reduce'});
await ctx.route('**/*',r=>r.request().url().startsWith(new URL(url).origin)?r.continue():r.abort());
const page=await ctx.newPage(),errors=[];page.setDefaultTimeout(8000);page.on('pageerror',e=>errors.push(e.message));
const ev=(f,a)=>page.evaluate(f,a),click=s=>page.locator(s).click();
const close=async()=>{if(await page.locator('#modal [data-zu]').count())await click('#modal [data-zu]');};
const tab=v=>click(`.tabs [data-view="${v}"]`);
const neu=async({lang='de',width=390,empty=false,mode='real'}={})=>{
  await page.setViewportSize({width,height:844});await page.goto(url);
  await ev(lang=>{localStorage.clear();for(const k of ['einstieg2','tour','szenen','start'])localStorage.setItem('mtb.'+k,'1');localStorage.setItem('mtb.sprache',lang);},lang);
  await page.reload();await page.waitForFunction(()=>typeof wunschHtml==='function');
  await ev(({empty,mode})=>{wechsle(mode);setzeBau(empty?leerBau():JSON.parse(JSON.stringify(START)),true);plan.fahrer=0;view='aufbau';upNein()['ux-erhalten']=1;sichern();zeichne();},{empty,mode});
};
const bauStand=()=>ev(()=>JSON.parse(JSON.stringify({build:{...Object.fromEntries(SLOTS.map(s=>[s.k,build[s.k]||null])),fw:build.fw||null},score:bewerte(build).gesamt,preis:bewerte(build).preis,adapter:bewerte(build).adapter})));
const snapshot=()=>ev(()=>{
  const bau=b=>({...Object.fromEntries(SLOTS.map(s=>[s.k,b[s.k]||null])),fw:b.fw||null,radKg:b.radKg||null,radTyp:b.radTyp||null});
  return JSON.parse(JSON.stringify({build:bau(build),sel,plan,jahr:jahrWahl[modus],modus,aktiv:aktivId[modus],wunsch:wunschListe(),ablehnungen:upNein(),koerper,fprofil,setupAlle,
    raeder:MODI.map(m=>[m,profile[m].map(p=>({id:p.id,name:p.name,build:bau(p.build||{}),jahr:p.jahr,wunsch:p.wunsch||[]}))])}));
});
const upgradeMerken=async()=>{
  await tab('aufbau');await click('#aufbau .slot[data-slot="bremsen"]');await click('.ts-beratung');await click('[data-fiziel="kraft"]');
  await click('.btn[data-fischritt="budget"]');await click('.btn[data-fischritt="erg"]');
  assert.equal(await page.locator('#fi [data-merken]').count(),1,'Die Fixture muss genau die Rotor-Variante vorschlagen');
  await click('#fi [data-merken]');await close();await tab('wunsch');
};
const preisPruefen=async(container,lang)=>{
  const text=await container.innerText();assert.match(text,/220/);assert.match(text,/203/);
  assert.match(text,lang==='de'?/Zubehör/i:/accessor/i);
  assert.match(text,lang==='de'?/ab\s+41\s*€/:/from\s+€?\s*41/i,'Bekannte Kosten als Untergrenze kennzeichnen');
  assert.match(text,lang==='de'?/Scheibenpreis.*fehlt|Scheiben.*zusätzlich|ohne.*Scheiben/i:/rotor.*not included|rotor.*also needed|excl.*rotor/i,'Offene Scheibenkosten sichtbar benennen');
  assert.match(text,lang==='de'?/Bremse.*bleibt/:/brake.*stays/i,'Vorhandene Bremse wird nicht neu gekauft');
};
const keinUeberstand=async(label)=>assert.equal(await ev(()=>document.documentElement.scrollWidth>innerWidth+1),false,label);
let count=0,failed=0;
const test=async(name,f)=>{count++;try{await f();console.log('  ok   '+name);}catch(e){failed++;console.log('  FEHL '+name+'\n       '+e.stack);}};
try{
  await test('Wunschliste trennt 41 Euro Zubehoer von vorhandener Bremse und offenen Scheibenkosten',async()=>{
    for(const [lang,width]of [['de',320],['en',390]]){
      await neu({lang,width});const vor=await bauStand();await upgradeMerken();
      await preisPruefen(page.locator('#wunschliste .wl').first(),lang);
      const pk=await ev(()=>paketFuer('bremsen',wunschTeil(wunschListe()[0])));
      assert.equal(pk.bleibt,true);assert.equal(pk.gesamt,41);assert.equal(pk.scheibenNeu.length,2);
      assert.deepEqual(await bauStand(),vor,'Merken darf den verbauten Aufbau nicht aendern');await keinUeberstand('Wunschliste '+width+'/'+lang);
    }
  });
  await test('Einkauf trennt Zubehoer und offene Preise, ohne die vorhandene Bremse erneut zu verkaufen',async()=>{
    for(const [lang,width]of [['de',390],['en',320]]){
      await neu({lang,width});await upgradeMerken();const vor=await bauStand();await click('[data-wkauf]');await tab('deals');
      await preisPruefen(page.locator('#einkauf .wk'),lang);
      assert.equal(await page.locator('#einkauf .wk .ek-r a[href]').count(),0,'Keine Kauf-Links zur vorhandenen Bremse');
      assert.equal(await page.locator('#einkauf .wk [data-vergleich]').count(),1);
      await click('#einkauf .wk [data-vergleich]');assert.equal(await page.locator('#modal .vt').count(),1);
      assert.match(await page.locator('#modal').innerText(),/220/);assert.match(await page.locator('#modal').innerText(),/203/);
      await close();assert.deepEqual(await bauStand(),vor,'Zubehoer ansehen darf kein Upgrade uebernehmen');await keinUeberstand('Einkauf '+width+'/'+lang);
      await neu({lang,width});const freiVor=await bauStand();await tab('wunsch');await click('[data-wunschneu]');
      await page.locator('#wn-slot').selectOption('griffe');await page.locator('#wn-text').fill('https://example.com/teil');await click('[data-wunschspeichern]');
      assert.equal(await page.locator('#wunschliste [data-wl]').count(),1);await click('#wunschliste [data-wkauf]');await tab('deals');
      const frei=page.locator('#einkauf .wk .ek'),summe=page.locator('#einkauf .wk .ek-summe');
      assert.equal(await frei.count(),1);assert.equal(await frei.locator('a[href="https://example.com/teil"]').count(),1,'Gespeicherter Link bleibt erreichbar');
      assert.match(await frei.innerText(),lang==='de'?/Preis.*offen/i:/price.*pending/i,'Freier Eintrag hat einen unbekannten statt erfundenen Preis');
      assert.match(await summe.innerText(),lang==='de'?/Preis.*offen/i:/price.*pending/i,'Eine Einkaufsliste ohne bekannten Preis bleibt offen');
      assert.doesNotMatch(await frei.innerText()+await summe.innerText(),/(?:€\s*0(?:[.,]00)?|\b0(?:[.,]00)?\s*€)/,'Kein erfundener Nullpreis');
      assert.deepEqual(await bauStand(),freiVor,'Ein freier Kaufwunsch veraendert weder Aufbau noch Preisberechnung');await keinUeberstand('Freier Einkauf '+width+'/'+lang);
    }
  });
  await test('Vollstaendiges Rad ohne Fahrerangaben bleibt ausdruecklich nur teilweise geprueft',async()=>{
    for(const lang of ['de','en']){
      await neu({lang});const vor=await bauStand();
      const r=await ev(()=>({offen:ungeprueft(bewerte(build)),wertung:gWertung(),befunde:gBefunde()}));
      assert.ok(r.offen.length>=2);assert.ok(r.offen.some(s=>/Systemgewicht|system weight/i.test(s)));
      const leit=await page.locator('#coach-platz').innerText();
      assert.doesNotMatch(leit,/Dein Rad ist geprüft|Your bike is checked|alles passt zusammen|it all fits together/i);
      assert.match(leit,/offen|Prüfung|missing|checks|check/i);
      for(const h of [r.wertung.h,r.befunde.h]){
        assert.match(h,/Nicht geprüft|Not checked/i);assert.match(h,/Systemgewicht|system weight/i);
        assert.match(h,/Rahmengröße|frame size/i);
      }
      assert.deepEqual(await bauStand(),vor,'Hinweise und lokale Guide-Antworten veraendern keinen Score oder Aufbau');
    }
  });
  await test('Ablesehilfe ist vom leeren eigenen Rad, Gebrauchtrad und Profil per Klick erreichbar',async()=>{
    for(const [lang,mode,width]of [['de','real',320],['en','markt',390]]){
      await neu({lang,mode,width,empty:true});const vor=await bauStand();
      assert.equal(await page.locator('#coach-platz [data-spick]').count(),1);await click('#coach-platz [data-spick]');
      assert.ok(await page.locator('#modal .spick-z').count()>=8);assert.match(await page.locator('#modal').innerText(),/Modell|model/i);await close();
      await page.locator('.top button').last().click();assert.equal(await page.locator('#modal [data-spick]').count(),1);await click('#modal [data-spick]');
      assert.ok(await page.locator('#modal .spick-z').count()>=8);await close();assert.deepEqual(await bauStand(),vor);
    }
  });
  await test('Adapter in ungewahlten Kandidaten werden erst beim Uebernehmen geplant, Browsen bleibt ohne Mutation',async()=>{
    for(const lang of ['de','en']){
      await neu({lang});const vor=await bauStand();assert.equal(vor.adapter.length,0);
      await click('#aufbau .slot[data-slot="bremsen"]');await page.locator('#suche-in').fill('SLX M7120');
      const opt=page.locator('#opt-liste .opt:visible').filter({hasText:/203\/180/}).first();const text=await opt.innerText();
      assert.match(text,/Adapter|adapter/);assert.match(text,/Übernehmen|when.*select|when.*add|when.*apply|on.*select/i);
      assert.doesNotMatch(text,/schon in deinem Aufbau|already.*your build|already.*included/i);
      await close();assert.deepEqual(await bauStand(),vor);await neuLaden();assert.deepEqual(await bauStand(),vor);
    }
  });
  await test('Wartungsberatung hat eine nutzbare Auswahl ohne pauschale Unbedenklichkeitszusage',async()=>{
    for(const lang of ['de','en']){
      await neu({lang,width:320});const vor=await bauStand();await click('#aufbau .slot[data-slot="bremsen"]');await click('.ts-beratung');
      const w=page.locator('[data-fiziel="wartung"]'),text=await w.innerText();assert.match(text,/Mineralöl|mineral oil/i);
      assert.doesNotMatch(text,/greift.*(?:Haut|Lack).*nicht|doesn.t.*attack|harmless|unschädlich|unbedenklich/i);
      await w.click();assert.equal(await page.locator('#fi').getAttribute('data-schritt'),'marke');await close();assert.deepEqual(await bauStand(),vor);
    }
  });
  await test('Radwechsel benennt die vorhandene Verwaltung, Umbenennen bleibt per Klick erreichbar',async()=>{
    for(const [lang,width]of [['de',320],['en',1280]]){
      await neu({lang,width});const vor=await snapshot();await click('[data-radwahl]');
      assert.equal(await page.locator('#modal [data-profile]').count(),1);assert.doesNotMatch(await page.locator('#modal').innerText(),/Stift|pencil/i);
      await click('#modal [data-profile]');assert.ok(await page.locator('#modal [data-profumb]').count());await page.locator('#modal [data-profumb]').first().click();
      assert.equal(await page.locator('#modal [data-profname]').count(),1);await close();assert.deepEqual(await snapshot(),vor);
    }
  });
  await test('Lesen, Navigation und Neuladen erhalten Wunschliste, Setup, Ablehnungen und Radprofile',async()=>{
    await neu({lang:'de',width:390});await upgradeMerken();await click('[data-wkauf]');
    await ev(()=>{const fw=fwInfo();fw.gj=2025;const d=suDaten();suP(d).psi.gabel=78;suLog(d,{typ:'notiz',text:'UX-Datenerhalt'});suSichern();upNein()['ux-erhalten']=1;sichern();});
    const vor=await snapshot();
    for(const [width,lang]of [[320,'de'],[390,'de'],[1280,'en']]){
      await page.setViewportSize({width,height:844});await ev(lang=>{sprache=lang;localStorage.setItem('mtb.sprache',lang);zeichne();},lang);
      await tab('deals');await keinUeberstand('Einkauf '+width+'/'+lang);await tab('wunsch');await keinUeberstand('Wunschliste '+width+'/'+lang);
      await tab('aufbau');await click('#aufbau .slot[data-slot="bremsen"]');await page.locator('#suche-in').fill('zz-kein-modell');
      assert.equal(await page.locator('#opt-liste .opt:visible').count(),0);assert.equal(await page.locator('#modal [data-eigenneu]').count()>0||await page.getByRole('button',{name:/Eigenes Teil anlegen|Add your own part/i}).count()>0,true);
      await close();if(screenshots)await page.screenshot({path:path.join(screenshots,`qualitaet-ux-${width}-${lang}.png`),animations:'disabled'});
    }
    assert.deepEqual(await snapshot(),vor);await neuLaden();assert.deepEqual(await snapshot(),vor,'Semantischer Datenerhalt nach Reload');
  });
  assert.equal(errors.length,0,errors.join('\n'));
}catch(e){failed++;console.log('JS-Fehler: '+e.stack);}finally{await browser.close();server.close();}
console.log(`QUALITAET-UX: ${count-failed} von ${count} Prüfungen bestanden.`);
if(failed)process.exitCode=1;
async function neuLaden(){await page.reload();await page.waitForFunction(()=>typeof zeichne==='function');}
