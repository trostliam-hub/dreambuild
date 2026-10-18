/* Modell- und jahrsichere Herstellerdetails; ausschließlich isolierte Browserdaten.
 * Optional: CRANKSCORE_SOURCE_ROOT für den integrierten Checkout.
 * Aufruf: node tools/fahrwerk-fotos-test.mjs */
import {createRequire} from 'node:module';
import {execSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
let pw;try{pw=require('playwright');}catch{pw=require(execSync('npm root -g').toString().trim()+'/playwright');}
const root=path.resolve(process.env.CRANKSCORE_SOURCE_ROOT || path.join(path.dirname(fileURLToPath(import.meta.url)),'..'));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.webp':'image/webp'};
const server=http.createServer((q,r)=>{
  const f=path.resolve(root,'.'+decodeURIComponent(q.url.split('?')[0]));
  if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){r.writeHead(404);r.end();return;}
  r.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url='http://127.0.0.1:'+server.address().port+'/index.html';
const browser=await pw.chromium.launch(),ctx=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',reducedMotion:'reduce'});
/* Die Textprüfungen sind deutsch; die App-Sprache darf nicht von der CI-Browserlocale abhängen. */
await ctx.addInitScript(()=>localStorage.setItem('mtb.sprache','de'));
await ctx.route('**/*',r=>r.request().url().startsWith(new URL(url).origin)?r.continue():r.abort());
const page=await ctx.newPage(),errors=[],results=[];
page.setDefaultTimeout(8000);page.on('pageerror',e=>errors.push(e.message));
const test=async(name,fn)=>{try{await fn();results.push({name,ok:true});console.log('OK   '+name);}catch(e){results.push({name,ok:false});console.log('FEHL '+name+'\n      '+e.message);}};
await page.goto(url);await page.waitForFunction(()=>typeof suNahFotos==='function');
await page.evaluate(()=>{
  localStorage.clear();localStorage.setItem('mtb.sprache','de');['einstieg2','szenen','tour','start'].forEach(k=>localStorage.setItem('mtb.'+k,'1'));
  schliesseStartseite();schliesse();
  const variante=(slot,id,key,value)=>{
    const b=K[slot].find(t=>t.id===id),w=b.v.map(v=>v.d),i=b.v.findIndex(v=>v.k===key);w[i]=b.v[i].o.findIndex(o=>o.n===value);return varianteNachIndex(b,w);
  };
  window.fotoProbe=(id,slot,jahr,art,ka,au)=>{
    build.fw={gj:jahr,dj:jahr};
    const t=ka?variante(slot,id,'Kartusche',ka):au?variante(slot,id,'Ausführung',au):findeTeil(slot,id);
    const x={t,coil:/Coil|DHX/.test(t.n)};
    const html=suEinstellBild(slot,x,{zeig:art?[art]:[]}),dom=new DOMParser().parseFromString(html,'text/html');
    return {html,nah:dom.querySelectorAll('.fw-nahfoto').length,datei:dom.querySelector('.fw-nah-link')?.getAttribute('href')||'',
      punkt:[...dom.querySelectorAll('.fw-zielpunkt')].map(c=>[Number(c.getAttribute('cx')),Number(c.getAttribute('cy'))]),
      schema:!!dom.querySelector('.il,.rs,.brad,canvas'),modell:dom.querySelector('figure')?.dataset.fwmodell,
      ganz:dom.querySelector('.fw-modellfoto img')?.getAttribute('src')||'',fehlt:!!dom.querySelector('.fw-foto-fehlt'),text:dom.body.textContent};
  };
});
try{
  await test('Charger 3.2 / LinearXL 2027: Ventil, Zug, SAG, HSC, LSC und ABO haben getrennte echte Ziele',async()=>{
    const r=await page.evaluate(()=>['g-zeb','g-lyrik'].map(id=>Object.fromEntries(['luft','zug','oring','lsc','hsc','bo'].map(a=>[a,fotoProbe(id,'gabel',2027,a,'Charger 3.2 RC2')]))));
    for(const modell of r){for(const a of Object.keys(modell)){assert.equal(modell[a].nah,1,a);assert.equal(modell[a].punkt.length,1);assert.equal(modell[a].schema,false);assert.match(modell[a].datei,/rs-nah-gabel-/);}
      assert.notDeepEqual(modell.lsc.punkt,modell.hsc.punkt);assert.match(modell.lsc.text,/kleine innere/);assert.match(modell.hsc.text,/große schwarze Außenring/);}
  });
  await test('Falsches Jahr, Kartusche, Modell und Ausführung bekommen keine neuen Gabelmarker',async()=>{
    const r=await page.evaluate(()=>[fotoProbe('g-zeb','gabel',2026,'lsc','Charger 3.2 RC2'),fotoProbe('g-zeb','gabel',0,'lsc','Charger 3.2 RC2'),
      fotoProbe('g-lyrik','gabel',2025,'lsc','Charger 3.1 RC2'),fotoProbe('g-boxxer','gabel',2027,'lsc','Charger 3 RC2'),fotoProbe('g-zebsel','gabel',2027,'zug')]);
    for(const b of r){assert.equal(b.nah,0);assert.equal(b.punkt.length,0);assert.equal(b.schema,false);}
  });
  await test('Super Deluxe Luft D1 Ultimate 2027: keine Coil- oder B1-Verwechslung, HSC und LSC getrennt',async()=>{
    const r=await page.evaluate(()=>({werte:Object.fromEntries(['luft','zug','oring','lsc','hsc','hebel'].map(a=>[a,fotoProbe('d-sd','daempfer',2027,a,'','Ultimate')])),
      alt:fotoProbe('d-sd','daempfer',2025,'hsc','','Ultimate'),select:fotoProbe('d-sd','daempfer',2027,'hsc','','Select')}));
    for(const a of Object.keys(r.werte)){assert.equal(r.werte[a].nah,1,a);assert.match(r.werte[a].datei,/rs-nah-daempfer-/);assert.match(r.werte[a].text,/D1/);}
    assert.notDeepEqual(r.werte.lsc.punkt,r.werte.hsc.punkt);assert.equal(r.alt.nah,0);assert.equal(r.select.nah,0);
  });
  await test('Super Deluxe Coil B1 2023–2026: nur seine drei Originale, Federaufdruck und beide SAG-Augen',async()=>{
    const r=await page.evaluate(()=>[2023,2024,2025,2026].map(j=>Object.fromEntries(['feder','zug','lsc','hsc','hebel','oring','bo'].map(a=>[a,fotoProbe('d-sdcoil','daempfer',j,a,'','Ultimate')]))));
    for(const m of r){for(const a of ['feder','zug','lsc','hsc','hebel','oring']){assert.equal(m[a].nah,1,a);assert.match(m[a].datei,/rs-sdcoil-(front|side|3q)-detail\.png$/);}
      assert.notDeepEqual(m.lsc.punkt,m.hsc.punkt);assert.notEqual(m.lsc.datei,m.hsc.datei);assert.equal(m.oring.punkt.length,2);
      assert.match(m.oring.text,/Befestigungsaugen/);assert.equal(m.bo.nah,0);assert.match(m.feder.text,/vorhandene Feder/);}
  });
  await test('Vivid Coil, altes/neues B1-Jahr und eigene Teile erhalten keine geliehenen Coil-Marker',async()=>{
    const r=await page.evaluate(()=>{
      const arten=['feder','oring','lsc','hsc','bo'],vivid=arten.map(a=>fotoProbe('d-vividcoil','daempfer',2025,a,'','Ultimate'));
      build.fw={dj:2025};const t={...findeTeil('daempfer','d-sd230'),eigen:true};
      return {vivid,jahre:[2022,2027,0].map(j=>fotoProbe('d-sdcoil','daempfer',j,'hsc','','Ultimate')),
        eigen:suNahFotos('daempfer',{t,coil:true},{zeig:['feder','hsc']})};
    });
    for(const b of [...r.vivid,...r.jahre]){assert.equal(b.nah,0);assert.equal(b.punkt.length,0);assert.equal(b.schema,false);}
    assert.equal(r.eigen,'');for(const b of r.vivid)assert.doesNotMatch(b.html,/rs-sdcoil|rs-nah-coil/);
  });
  await test('FOX 2025: konkrete DHX/DHX2/Float X/X2-Details, kein falsches Jahr oder falsche Feder',async()=>{
    const r=await page.evaluate(()=>['d-dhx','d-dhx2','d-floatx','d-x2'].map(id=>({id,zug:fotoProbe(id,'daempfer',2025,'zug','','Factory'),
      lsc:fotoProbe(id,'daempfer',2025,'lsc','','Factory'),hsc:fotoProbe(id,'daempfer',2025,'hsc','','Factory'),
      alt:fotoProbe(id,'daempfer',2024,'lsc','','Factory'),neu:fotoProbe(id,'daempfer',2026,'lsc','','Factory'),feder:fotoProbe(id,'daempfer',2025,'feder','','Factory')})));
    for(const b of r){assert.equal(b.lsc.nah,1,b.id);assert.equal(b.alt.nah,0);assert.equal(b.neu.nah,0);assert.equal(b.feder.nah,0);assert.doesNotMatch(b.feder.html,/rs-nah-coil|rs-sdcoil/);
      assert.match(b.lsc.datei,new RegExp('fox-'+({'d-dhx':'dhx','d-dhx2':'dhx2','d-floatx':'floatx','d-x2':'x2'}[b.id])));
      if(['d-dhx2','d-x2'].includes(b.id)){assert.equal(b.hsc.nah,1);assert.notDeepEqual(b.lsc.punkt,b.hsc.punkt);assert.equal(b.zug.nah,1);}}
  });
  await test('Leere Markerauswahl zeigt das eigene Gesamtmodell, fehlende Generation bleibt ehrlich leer',async()=>{
    const r=await page.evaluate(()=>({gabel:fotoProbe('g-zeb','gabel',2027,'','Charger 3.2 RC2'),coil:fotoProbe('d-sdcoil','daempfer',2025,'','','Ultimate'),
      foxAlt:fotoProbe('g-fox36','gabel',2025,'zug','GRIP2')}));
    assert.equal(r.gabel.nah,0);assert.match(r.gabel.ganz,/g-zeb\.png$/);assert.equal(r.coil.nah,0);assert.match(r.coil.ganz,/d-sdcoil--ultimate\.png$/);
    assert.equal(r.foxAlt.nah,0);assert.equal(r.foxAlt.fehlt,true);assert.equal(r.foxAlt.schema,false);
  });
  await test('320/390/1280px: volle Breite, schwarze Fläche, 220–300px, SVG erhält Seitenverhältnis',async()=>{
    for(const width of [320,390,1280]){
      await page.setViewportSize({width,height:844});
      const r=await page.evaluate(()=>{
        const alt=document.querySelector('#foto-pruefung');if(alt)alt.remove();
        const host=document.createElement('section');host.id='foto-pruefung';host.style.cssText='width:min(100%,560px);padding:0 12px;box-sizing:border-box;background:#000';
        host.innerHTML=fotoProbe('d-sdcoil','daempfer',2025,'hsc','','Ultimate').html;document.body.append(host);
        const link=host.querySelector('.fw-nah-link'),svg=link.querySelector('svg'),image=svg.querySelector('image'),b=link.getBoundingClientRect();
        return {width:b.width,height:b.height,svgh:svg.getBoundingClientRect().height,schwarz:getComputedStyle(link).backgroundColor,
          aspect:svg.getAttribute('preserveAspectRatio'),w:Number(image.getAttribute('width')),h:Number(image.getAttribute('height')),
          ueber:host.scrollWidth>host.clientWidth+1};
      });
      assert.equal(r.ueber,false);assert.ok(r.width>=width-30 || width>560);assert.ok(r.height>=220&&r.height<=300);assert.equal(r.svgh,r.height);
      assert.equal(r.schwarz,'rgb(0, 0, 0)');assert.equal(r.aspect,'xMidYMid meet');assert.equal(r.w,1007);assert.equal(r.h,1200);
    }
    await page.setViewportSize({width:390,height:844});
  });
  await test('Antippen vergrößert das richtige Original; Bildfunktionen verändern keine Nutzerdaten',async()=>{
    await page.evaluate(()=>{const host=document.querySelector('#foto-pruefung');host.innerHTML=fotoProbe('d-sdcoil','daempfer',2025,'hsc','','Ultimate').html;});
    await page.locator('#foto-pruefung .fw-nah-link').scrollIntoViewIfNeeded();
    await page.locator('#foto-pruefung .fw-nah-link').click();
    await page.waitForFunction(()=>document.querySelector('#produktbild-dialog')?.open);
    const b=await page.locator('#produktbild-dialog .pb-flaeche img').getAttribute('src');assert.match(b,/rs-sdcoil-front-detail\.png$|^blob:/);
    await page.locator('#produktbild-dialog [data-pb-close]').click();
    const r=await page.evaluate(()=>{
      const vorher=JSON.stringify({build,profile,setupAlle,fprofil,plan});
      for(const art of ['luft','zug','lsc','hsc','feder','oring'])suEinstellBild('daempfer',{t:findeTeil('daempfer','d-sd230'),coil:true},{zeig:[art]});
      return vorher===JSON.stringify({build,profile,setupAlle,fprofil,plan});
    });assert.equal(r,true);
  });
}finally{
  const ok=results.every(r=>r.ok)&&results.length===9&&!errors.length;
  if(errors.length)console.log('JS-Fehler: '+errors.join('; '));
  console.log('FAHRWERK-FOTOS: '+results.filter(r=>r.ok).length+' von '+results.length+' Prüfungen bestanden.');
  await browser.close();server.close();process.exitCode=ok?0:1;
}
