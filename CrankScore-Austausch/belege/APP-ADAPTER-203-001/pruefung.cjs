const {chromium}=require('../../../node_modules/playwright');
const fs=require('fs'),out=__dirname,url=process.argv[2]||'http://127.0.0.1:8766/index.html';
(async()=>{const browser=await chromium.launch(url.startsWith('https://')&&process.env.HTTPS_PROXY?{proxy:{server:process.env.HTTPS_PROXY}}:{});const cases=[];
for(const theme of ['hell','oled'])for(const width of [320,390,1280])for(const lang of ['de','en']){
 const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',serviceWorkers:'block'});await ctx.route('**/*',r=>r.request().url().startsWith(new URL(url).origin)?r.continue():r.abort());
 await ctx.addInitScript(({theme,lang})=>{localStorage.setItem('mtb.design',theme);localStorage.setItem('mtb.sprache',lang);for(const k of ['mtb.einstieg2','mtb.tour','mtb.szenen'])localStorage.setItem(k,'1');},{theme,lang});
 const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(url);await p.waitForFunction(()=>typeof zeichne==='function');
 const result=await p.evaluate(()=>{build.rahmen='f-stumpy';build.gabel='g-pike';build.bremsen=null;sichern();view='aufbau';zeichne();
   const b=rohTeil('bremsen','b-xt'),i=b.v.findIndex(x=>x.k==='Scheiben'),w=findeTeil('bremsen','b-xt').wahl.slice();w[i]=b.v[i].o.findIndex(x=>x.s.sV===203&&x.s.sH===180);const v=varianteNachIndex(b,w);uebernehmen('bremsen',v.id,'liste');
   const a=bewerte(build).adapter.filter(x=>x.art==='bremse'&&x.wo==='gabel');return {toast:$('toast').textContent,adapter:a.map(x=>({name:adName(x),size:x.grafik.scheibe,price:x.p,weight:x.g})),version:APP_VERSION};});
 await p.reload();await p.waitForFunction(()=>typeof zeichne==='function');await p.evaluate(()=>{view='aufbau';zeichne();});
 await p.evaluate(()=>document.querySelector('#aufbau .slot[data-slot="bremsen"]').scrollIntoView({block:'center'}));await p.waitForTimeout(250);
 result.persist=await p.evaluate(()=>{const e=document.querySelector('#aufbau .slot[data-slot="bremsen"] .slot-ad'),r=e&&e.getBoundingClientRect();return {hint:e?e.textContent:'',overflow:document.documentElement.scrollWidth>innerWidth,clip:r&&(r.left<0||r.right>innerWidth),ad:bewerte(build).adapter.filter(x=>x.art==='bremse'&&x.wo==='gabel').length};});
 if(width===390&&lang==='de')await p.screenshot({path:out+`/${url.startsWith('https://')?'live':'lokal'}-${theme}.png`});
 const expected=lang==='de'?'Montagehinweis: Für die 203-mm-Scheibe vorn gehört der Adapter zwischen Gabel und Bremssattel':'Fitting note: the 203 mm rotor (front) needs the adapter between the fork and brake caliper';
 result.ok=result.toast.includes(expected)&&result.persist.hint.includes(expected)&&result.persist.ad===1&&result.adapter.length===1&&result.adapter[0].size===203&&result.adapter[0].price>0&&!result.persist.overflow&&!result.persist.clip&&!errors.length;
 cases.push({theme,width,lang,...result,errors});await ctx.close();
}
await browser.close();const report={ok:cases.every(x=>x.ok),cases};fs.writeFileSync(out+`/${url.startsWith('https://')?'live':'lokal'}-pruefung.json`,JSON.stringify(report,null,2));console.log(cases.filter(x=>!x.ok));console.log('ADAPTER203:',cases.filter(x=>x.ok).length,'von',cases.length,'bestanden');process.exit(report.ok?0:1);
})().catch(e=>{console.error(e);process.exit(1)});
