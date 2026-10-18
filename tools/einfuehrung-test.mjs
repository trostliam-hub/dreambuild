/* Interaktive Einfuehrung: echte Bedienwege, Datenerhalt und kleine Displays.
 * Aufruf: node tools/einfuehrung-test.mjs
 * CRANKSCORE_SOURCE_ROOT: anderer lokaler Checkout (z. B. parallel bearbeitete App).
 * CRANKSCORE_LIVE_URL: vorhandener Server; CRANKSCORE_SCREENSHOTS: optionaler Ausgabeordner.
 * Windows nutzt vorhandenes Chrome, andere Systeme Playwright-Chromium.
 * CRANKSCORE_BROWSER_CHANNEL kann einen anderen installierten Kanal waehlen.
 * Jeder Lauf verwendet einen eigenen Browserkontext, keine echten Nutzerdaten.
 */
import {createRequire} from 'node:module';
import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {isDeepStrictEqual} from 'node:util';

const require=createRequire(import.meta.url);
let pw; try{pw=require('playwright');}catch{pw=require(path.join(execSync('npm root -g').toString().trim(),'playwright'));}
const root=path.resolve(process.env.CRANKSCORE_SOURCE_ROOT||path.join(path.dirname(fileURLToPath(import.meta.url)),'..'));
const live=process.env.CRANKSCORE_LIVE_URL;
const server=live?null:http.createServer((q,r)=>{
  let f;try{f=path.resolve(root,'.'+decodeURIComponent(q.url.split('?')[0]||'/index.html'));}catch{r.writeHead(400);r.end();return;}
  if(f===root)f=path.join(root,'index.html');
  if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){r.writeHead(404);r.end();return;}
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
  r.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);
});
if(server)await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=live||`http://127.0.0.1:${server.address().port}/index.html`;
const browser=await pw.chromium.launch({channel:process.env.CRANKSCORE_BROWSER_CHANNEL||(process.platform==='win32'?'chrome':undefined)});
const ctx=await browser.newContext({viewport:{width:390,height:844},locale:'en-US',timezoneId:'UTC',reducedMotion:'reduce',serviceWorkers:'block'});
await ctx.route('**/*',r=>{
  if(!r.request().url().startsWith(new URL(url).origin))return r.abort();
  if(live)return r.continue();
  /* Lokale Testdateien direkt liefern: der isolierte Lauf braucht weder
     Netzwerkfreigaben noch einen externen Browser- oder Bilddienst. */
  let f;try{f=path.resolve(root,'.'+decodeURIComponent(new URL(r.request().url()).pathname));}catch{return r.fulfill({status:400,body:''});}
  if(f===root)f=path.join(root,'index.html');
  if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile())return r.fulfill({status:404,body:''});
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.woff2':'font/woff2','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml'};
  return r.fulfill({status:200,contentType:types[path.extname(f)]||'application/octet-stream',body:fs.readFileSync(f)});
});
const page=await ctx.newPage(),errors=[];
page.setDefaultTimeout(8000);page.on('pageerror',e=>errors.push(e.message));
const ev=(f,a)=>page.evaluate(f,a),click=s=>page.locator(s).click();
const ids=['ohne','mit','plan','fahrwerk','guide','merken'];
const scene=()=>page.locator('#szenen [data-szene]').getAttribute('data-szene');
const point=i=>click(`#szenen [data-szpunkt="${i}"]`);
const ended=()=>page.waitForFunction(()=>!document.querySelector('#szenen .sz'));
const fresh=async({lang='de',light=false,motion='reduce'}={})=>{
  await page.emulateMedia({reducedMotion:motion});await page.setViewportSize({width:390,height:844});
  await page.goto(url);await ev(lang=>{localStorage.clear();for(const k of ['einstieg2','tour','szenen','start'])localStorage.setItem('mtb.'+k,'1');localStorage.setItem('mtb.sprache',lang);},lang);
  await page.reload();await page.waitForFunction(()=>typeof oeffneSzenen==='function'&&typeof zeichne==='function');await page.waitForLoadState('networkidle');
  await ev(({lang,light})=>{schliesse();schliesseStartseite();sprache=lang;setzeDesign(light);view='aufbau';zeichne();window.__introDone=0;},{lang,light});
};
const open=()=>ev(()=>oeffneSzenen(()=>{window.__introDone++;}));
const state=()=>ev(()=>{const clone=v=>JSON.parse(JSON.stringify(v)),parse=v=>{try{return JSON.parse(v);}catch{return v;}};
  return {build:clone(build),builds:clone(builds),plan:clone(plan),profile:clone(profile),setup:clone(setupAlle),wishlist:clone(wunschListe()),
    saved:Object.fromEntries(Object.keys(localStorage).filter(k=>/^mtb\./.test(k)&&k!=='mtb.szenen').sort().map(k=>[k,parse(localStorage.getItem(k))]))};});
/* Inhalt vollstaendig vergleichen, JSON-Schluesselreihenfolge ist bedeutungslos.
   Kleine Feldpfade bleiben auch im gekuerzten CI-Bericht lesbar. */
const sameState=(actual,expected)=>{
  if(isDeepStrictEqual(actual,expected))return;
  const changes=[],short=v=>{const s=JSON.stringify(v);return s===undefined?'undefined':s.length>140?s.slice(0,140)+'…':s;};
  const walk=(a,b,p)=>{if(isDeepStrictEqual(a,b))return;if(a&&b&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b)){
    for(const k of new Set([...Object.keys(a),...Object.keys(b)]))walk(a[k],b[k],p+'['+JSON.stringify(k)+']');
    if(Array.isArray(a)&&a.length!==b.length)changes.push(p+'.length: '+b.length+' → '+a.length);
  }else changes.push(p+': '+short(b)+' → '+short(a));};walk(actual,expected,'state');assert.fail('Gespeicherte Daten veraendert: '+changes.slice(0,12).join('; ')+(changes.length>12?`; weitere ${changes.length-12} Felder`:''));
};
const seed=()=>ev(()=>{
  wechsle('real');build.rahmen='f-spindrift';build.gabel='g-zeb';build.bremsen='b-xt';plan.fahrer=83;
  fwInfo().df=475;fwInfo().gj=2025;wunschListe().push({id:'intro-test-wunsch',slot:'bremsen',teil:'b-xt',stufe:'gemerkt',notiz:'Demo darf das nicht ersetzen'});
  /* Das Menue initialisiert Ablehnungen sonst erst spaeter via upNein().
     Eine bestehende Ablehnung ist echtes Testdatum und muss ebenfalls bleiben. */
  upNein().gabel=basisVon(build.gabel);
  const d=suDaten();suP(d).psi.gabel=67;suP(d).off['gabel|Zugstufe']=1;suLog(d,{typ:'notiz',text:'Vor der Einfuehrung'});zeichne();suSichern();sichern();
});
const screenshot=async name=>{if(process.env.CRANKSCORE_SCREENSHOTS){fs.mkdirSync(process.env.CRANKSCORE_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.CRANKSCORE_SCREENSHOTS,`einfuehrung-${name}.png`),animations:'disabled'});}};
let count=0,failed=0;
const test=async(name,f)=>{count++;try{await f();console.log('  ok   '+name);}catch(e){failed++;console.log('  FEHL '+name+'\n       '+e.stack);}};

try{
  await test('Sechs Szenen erklaeren die Funktionen und schliessen mit genau einem Aufruf ab',async()=>{
    await fresh();await open();const seen=[],headings=[],texts=[];
    for(let i=0;i<6;i++){
      seen.push(await scene());headings.push(await page.locator('#sz-h').textContent());texts.push(await page.locator('#szenen .sz').textContent());
      assert.equal(await page.locator('#szenen [data-szpunkt]').count(),6);assert.equal(await page.locator('#szenen [data-szweg]').isVisible(),true);
      assert.doesNotMatch(texts[i],/undefined|NaN/);await click('#szenen [data-szweiter]');
    }
    await ended();assert.deepEqual(seen,ids);assert.equal(new Set(headings).size,6);assert.match(texts.join(' '),/Adapter/);assert.match(texts.join(' '),/Fahrwerk/);assert.match(texts.join(' '),/Guide/);assert.match(texts.join(' '),/Wunschliste/);assert.match(texts.join(' '),/Einkauf/);
    assert.equal(await ev(()=>window.__introDone),1);assert.equal(await ev(()=>localStorage.getItem('mtb.szenen')),'1');
  });
  await test('Vor, zurueck und direkte Fortschrittspunkte oeffnen die angewaehlte Szene',async()=>{
    await fresh();await open();await click('#szenen [data-szweiter]');assert.equal(await scene(),'mit');await click('#szenen [data-szzurueck]');assert.equal(await scene(),'ohne');
    for(const i of [5,2,4,1,3,0]){await point(i);assert.equal(await scene(),ids[i]);
      const b=page.locator(`#szenen [data-szpunkt="${i}"]`);assert.equal(await b.evaluate(e=>e.tagName),'BUTTON');
      assert.ok((await b.getAttribute('aria-label'))?.trim(),'Fortschrittspunkt braucht einen Namen');
      assert.ok(await b.evaluate(e=>e.getAttribute('aria-current')==='step'||e.getAttribute('aria-current')==='true'||e.getAttribute('aria-pressed')==='true'),'Aktive Szene muss semantisch markiert sein');
    }
    await click('#szenen [data-szweg]');await ended();
  });
  await test('Adapter-Demo wechselt 180/203 mm und +23 mm ohne Rad, Plan, Profile, Setup oder Wunschliste zu veraendern',async()=>{
    await fresh();await seed();const before=await state();await open();await point(1);
    const demo='#szenen [data-szdemo="adapter"]',adapter='#szenen [data-szadapter]';assert.equal(await page.locator(demo).count(),1);
    assert.match(await page.locator(adapter).textContent(),/Direktmontage|direct mount|Kein Adapter|No adapter/i);assert.match(await page.locator('#szenen').textContent(),/180\s*mm/);
    await click(demo);assert.match(await page.locator(adapter).textContent(),/\+\s*23\s*mm/);assert.match(await page.locator('#szenen').textContent(),/203\s*mm/);sameState(await state(),before);
    await click(demo);assert.match(await page.locator(adapter).textContent(),/Direktmontage|direct mount|Kein Adapter|No adapter/i);sameState(await state(),before);
    await screenshot('adapter-180');await click(demo);await screenshot('adapter-203');await click('#szenen [data-szweg]');await ended();sameState(await state(),before);
  });
  await test('Ueberspringen und wiederholtes Schliessen rufen den Abschluss nur einmal auf',async()=>{
    await fresh({motion:'no-preference'});await open();await click('#szenen [data-szweg]');await ev(()=>{szenenEnde();szenenEnde();});await ended();assert.equal(await ev(()=>window.__introDone),1);
    await open();await point(5);await click('#szenen [data-szweiter]');await ev(()=>szenenEnde());await ended();assert.equal(await ev(()=>window.__introDone),2);
    await ev(()=>oeffneSzenen(null));await click('#szenen [data-szweg]');await ended();assert.equal(await ev(()=>document.body.style.position),'');
  });
  await test('Tastatur bleibt im Dialog; Pfeile navigieren, Escape schliesst genau einmal',async()=>{
    await fresh();await open();assert.equal(await ev(()=>!!document.activeElement.closest('#szenen')),true);
    const focusable='#szenen button:visible:not([disabled]), #szenen a[href]:visible';
    await page.locator(focusable).last().focus();await page.keyboard.press('Tab');assert.equal(await ev(()=>!!document.activeElement.closest('#szenen')),true);assert.equal(await page.locator(focusable).first().evaluate(e=>e===document.activeElement),true);
    await page.locator(focusable).first().focus();await page.keyboard.press('Shift+Tab');assert.equal(await page.locator(focusable).last().evaluate(e=>e===document.activeElement),true);
    await point(3);await page.locator(focusable).first().focus();
    for(let i=1;i<=await page.locator(focusable).count();i++){await page.keyboard.press('Tab');assert.equal(await page.locator(focusable).nth(i%await page.locator(focusable).count()).evaluate(e=>e===document.activeElement),true,'Alle Bedienelemente und Quellenlinks muessen per Tab erreichbar sein');}
    await point(0);
    await page.keyboard.press('ArrowRight');assert.equal(await scene(),'mit');await page.keyboard.press('ArrowLeft');assert.equal(await scene(),'ohne');await page.keyboard.press('ArrowLeft');assert.equal(await scene(),'ohne');
    await point(5);await page.keyboard.press('ArrowRight');assert.equal(await scene(),'merken');await page.keyboard.press('Escape');await ended();assert.equal(await ev(()=>window.__introDone),1);
  });
  await test('320/390/1280 px und kurze Hoehen: Weiter bleibt in allen Szenen sichtbar und anklickbar',async()=>{
    await fresh();
    for(const {width,height} of [{width:320,height:568},{width:390,height:667},{width:1280,height:568}]){
      await page.setViewportSize({width,height});await open();
      for(let i=0;i<6;i++){
        assert.equal(await scene(),ids[i]);const b=await page.locator('#szenen [data-szweiter]').boundingBox();assert.ok(b&&b.x>=0&&b.y>=0&&b.x+b.width<=width+1&&b.y+b.height<=height+1,`Weiter ausserhalb ${width}x${height}/${ids[i]}: ${JSON.stringify(b)}`);
        assert.equal(await page.locator('#szenen [data-szweiter]').evaluate(e=>{const b=e.getBoundingClientRect();return !!document.elementFromPoint(b.x+b.width/2,b.y+b.height/2)?.closest('[data-szweiter]');}),true,'Weiter wird verdeckt');
        assert.equal(await ev(()=>document.documentElement.scrollWidth>innerWidth+1||$('szenen').scrollWidth>innerWidth+1),false,`Horizontaler Ueberstand ${width}/${ids[i]}`);
        if(i===3)await screenshot(`${width}x${height}-fahrwerk`);await click('#szenen [data-szweiter]');
      }await ended();
    }
  });
  await test('Deutsch/Englisch und OLED/Hell zeigen lesbare lokalisierte Szenen',async()=>{
    for(const lang of ['de','en'])for(const light of [false,true]){
      await fresh({lang,light});await open();
      for(let i=0;i<6;i++){
        await point(i);const t=await page.locator('#szenen .sz').textContent();assert.doesNotMatch(t,/undefined|NaN/);
        assert.equal((await page.locator('#szenen [data-szweg]').textContent()).trim(),lang==='de'?'Überspringen':'Skip');
        const colors=await page.locator('#sz-h').evaluate(e=>({text:getComputedStyle(e).color,background:getComputedStyle(document.querySelector('#szenen')).backgroundColor}));assert.notEqual(colors.text,colors.background);
        if(lang==='en')assert.doesNotMatch(t,/Überspringen|Zurück|Wunschliste|Los geht's/);
      }await screenshot(`${lang}-${light?'hell':'oled'}`);await click('#szenen [data-szweg]');await ended();
    }
  });
  await test('Bewegung reduzieren entfernt die Introanimationen in jeder Szene',async()=>{
    await fresh({motion:'reduce'});await open();
    for(let i=0;i<6;i++){
      await point(i);const moving=await page.locator('#szenen').evaluate(e=>[e,...e.querySelectorAll('*')].filter(n=>{const c=getComputedStyle(n);return c.animationName!=='none'&&c.animationDuration.split(',').some(v=>parseFloat(v)>0);}).map(n=>n.className));
      assert.deepEqual(moving,[],`Animation trotz reduced-motion in ${ids[i]}`);
    }await click('#szenen [data-szweg]');await ended();
  });
  await test('Szenen sind als Beispiele gekennzeichnet; echte Fotos haben Alttext und Herstellerquelle',async()=>{
    await fresh();await open();let photos=0;
    for(let i=0;i<6;i++){
      await point(i);assert.match(await page.locator('#szenen .sz').textContent(),/Beispiel|Demo/i,`Beispielhinweis ${ids[i]}`);
      assert.equal(await page.locator('#szenen .szb, #szenen .il-gabel, #szenen .il-daempfer, #szenen .il-rad, #szenen canvas').count(),0);
      const images=page.locator('#szenen .sz-foto img, #szenen .fw-foto img'),imgs=await images.evaluateAll(es=>es.map(e=>({src:e.getAttribute('src'),alt:e.alt,local:new URL(e.src).origin===location.origin,background:e.dataset.photoBackground})));
      photos+=imgs.length;for(let j=0;j<imgs.length;j++){
        const img=imgs[j];assert.ok(img.alt.trim(),'Foto braucht Alttext');
        assert.ok(/\.(?:jpe?g|png|webp)(?:[?#]|$)/i.test(img.src)||img.src.startsWith('blob:')&&img.background==='schwarz','Fotodatei oder Schwarz-Darstellung eines Herstellerfotos statt Ersatzzeichnung: '+img.src);
        assert.doesNotMatch(img.src,/^data:|placeholder|generated|claude/i);if(img.local){await images.nth(j).evaluate(e=>e.decode());assert.ok(await images.nth(j).evaluate(e=>e.naturalWidth>0),'Foto laesst sich nicht decodieren');}
      }
      if(imgs.length){const sources=page.locator('#szenen [data-szquelle]');assert.ok(await sources.count(),'Fotoquelle fehlt');for(const a of await sources.all()){assert.equal(await a.isVisible(),true);assert.match(await a.getAttribute('href'),/^https:\/\//);assert.ok((await a.textContent()).trim());}}
    }assert.ok(photos>0,'Einführung zeigt kein echtes Foto');await click('#szenen [data-szweg]');await ended();
  });
  await test('Erneut ansehen startet bei Szene 1 und behaelt gespeicherte Daten; keine JavaScript-Fehler',async()=>{
    await fresh();await seed();const before=await state();await ev(()=>{oeffneMenu();$('modal').querySelector('[data-szenen]').click();});await page.waitForSelector('#szenen .sz');assert.equal(await scene(),'ohne');await point(4);await click('#szenen [data-szweg]');await ended();
    await ev(()=>{schliesse();oeffneSzenen(null);});assert.equal(await scene(),'ohne');assert.equal(await page.locator('#szenen [data-szpunkt="0"]').getAttribute('aria-current'),'step');assert.equal(await page.locator('#szenen [data-szpunkt]').count(),6);await click('#szenen [data-szweg]');await ended();sameState(await state(),before);assert.deepEqual(errors,[]);
  });
}finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
console.log(`EINFUEHRUNG: ${count-failed} von ${count} Prüfungen bestanden.`);
if(failed)process.exitCode=1;
