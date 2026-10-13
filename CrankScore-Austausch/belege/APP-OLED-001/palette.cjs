const {chromium} = require('../../../node_modules/playwright');
const fs = require('fs');
const out = __dirname;
const url = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const lum = hex => {const v=hex.replace('#','').match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4); return .2126*v[0]+.7152*v[1]+.0722*v[2];};
const contrast = (a,b) => (Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
(async()=>{
 const browser=await chromium.launch(url.startsWith('http://127') || !process.env.HTTPS_PROXY ? {} : {proxy:{server:process.env.HTTPS_PROXY}}); const report={url,zeit:new Date().toISOString(),faelle:[],kontraste:[]};
 for(const [d,fg,button,ring] of [['hell','#14171B','#14171B','#6E7976'],['oled','#FFFFFF','#FFFFFF','#8B9794']]){
  const surfaces=d==='hell'?['#f2f0ec','#fdfcfa','#f6f4f0','#e9e6e0','#E9E6E0']:['#000000','#1f2226','#262a2f','#30343a'];
  for(const bg of surfaces) report.kontraste.push({d,art:'Akzenttext',fg,bg,ratio:contrast(fg,bg),min:4.5});
  report.kontraste.push({d,art:'Buttontext',fg:d==='hell'?'#ffffff':'#14171b',bg:button,ratio:contrast(d==='hell'?'#ffffff':'#14171b',button),min:4.5});
  for(const bg of surfaces.slice(0,4)) report.kontraste.push({d,art:'Kleiner Ring',fg:ring,bg,ratio:contrast(ring,bg),min:3});
  for(const width of [390,1280]){
   const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}); const p=await ctx.newPage(); const errors=[]; p.on('pageerror',e=>errors.push(e.message));
   await ctx.route('**/*',r=>r.request().url().startsWith(new URL(url).origin)?r.continue():r.abort());
   await p.goto(url); await p.evaluate(d=>{localStorage.setItem('mtb.design',d);localStorage.setItem('mtb.einstieg2','1');localStorage.setItem('mtb.tour','1');localStorage.setItem('mtb.sprache','de');},d);await p.reload();
   await p.waitForFunction(()=>typeof zeichne==='function');
   await p.evaluate(()=>{wechsle('traum');view='aufbau';sichern();zeichne();});
   const state=await p.evaluate(()=>{const css=getComputedStyle(document.documentElement);const prop=n=>css.getPropertyValue(n).trim(); return {theme:document.documentElement.dataset.theme,akzent:prop('--anod'),button:prop('--akzent-flaeche'),weich:prop('--anod-soft'),ring:prop('--ring-gesamt'),klein:[prop('--ring-pass'),prop('--ring-eins')],glow:getComputedStyle(document.querySelector('.rg-kreis')).filter,stroke:getComputedStyle(document.querySelector('#ring')).stroke,kleineStrokes:['#ring-tech','#ring-char'].map(q=>getComputedStyle(document.querySelector(q)).stroke),overflow:document.documentElement.scrollWidth>innerWidth,version:APP_VERSION,background:getComputedStyle(document.body).backgroundColor,htmlBackground:getComputedStyle(document.documentElement).backgroundColor,themeColor:document.querySelector('meta[name="theme-color"]').content};});
   await p.evaluate(()=>{upNein();sichern();oeffneMenu();schliesse();});
   const before=await p.evaluate(()=>JSON.stringify({profile,aktivId,setupAlle,plan}));
   await p.evaluate(()=>{oeffneMenu();});
   const themeButton=p.locator('[data-design="'+(d==='hell'?'oled':'hell')+'"]');
   if(await themeButton.count()){await themeButton.first().click();await p.waitForTimeout(400);await p.locator('[data-design="'+d+'"]').first().click();await p.waitForTimeout(400);}
   await p.evaluate(()=>schliesse());
   const after=await p.evaluate(()=>JSON.stringify({profile,aktivId,setupAlle,plan}));
   await p.screenshot({path:out+`/${url.startsWith('http://127')?'lokal':'live'}-${d}-${width}.png`});
   await p.evaluate(()=>{pro={key:'test',inst:'test',status:'aktiv',geprueft:Date.now()};view='setup';zeichne();});
   await p.screenshot({path:out+`/${url.startsWith('http://127')?'lokal':'live'}-fahrwerk-${d}-${width}.png`});
   const paletteOk=state.akzent.toUpperCase()===fg.toUpperCase()&&state.button.toUpperCase()===button.toUpperCase()&&state.ring.toUpperCase()===fg.toUpperCase()&&state.klein.every(x=>x.toUpperCase()===ring.toUpperCase());
   const backgroundOk=state.background===(d==='hell'?'rgb(242, 240, 236)':'rgb(0, 0, 0)')&&state.htmlBackground===state.background&&state.themeColor===(d==='hell'?'#f2f0ec':'#000000');
   report.faelle.push({d,width,backgroundOk,...state,errors,datenErhalten:before===after,paletteOk});await ctx.close();
  }
 }
 report.ok=report.kontraste.every(x=>x.ratio>=x.min)&&report.faelle.every(x=>!x.errors.length&&!x.overflow&&x.glow==='none'&&x.datenErhalten&&x.paletteOk&&x.backgroundOk);
 fs.writeFileSync(out+`/${url.startsWith('http://127')?'lokal':'live'}-palette.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();process.exit(report.ok?0:1);
})().catch(e=>{console.error(e);process.exit(1);});
