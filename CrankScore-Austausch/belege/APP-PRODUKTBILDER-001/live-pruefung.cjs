const fs=require('fs');
const {chromium}=require('/workspace/crankscore-app-images/node_modules/playwright');
const base='https://trostliam-hub.github.io/dreambuild/';
const out='/workspace/app-image-fix-audit/live';fs.mkdirSync(out,{recursive:true});
(async()=>{
  const browser=await chromium.launch({proxy:{server:process.env.HTTPS_PROXY}}), rows=[];
  for(const width of [390,1280])for(const theme of ['oled','hell'])for(const lang of ['de','en']){
    const row={width,theme,lang,checks:[],errors:[]};
    const c=await browser.newContext({viewport:{width,height:844},locale:lang==='de'?'de-DE':'en-GB',serviceWorkers:'block',reducedMotion:'reduce'});
    await c.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
    await c.addInitScript(({theme,lang})=>{['einstieg2','tour','szenen'].forEach(k=>localStorage.setItem('mtb.'+k,'1'));localStorage.setItem('mtb.sprache',lang);localStorage.setItem('mtb.design',theme);},{theme,lang});
    const p=await c.newPage();p.on('pageerror',e=>row.errors.push(e.message));
    const response=await p.goto(base+'index.html?bildpruefung='+Date.now());
    await p.waitForFunction(()=>typeof zeichne==='function'&&!!document.querySelector('#produktbild-dialog'));
    const check=(name,ok,data)=>{row.checks.push({name,ok:!!ok,data});if(!ok)console.log('FAIL',width,theme,lang,name,JSON.stringify(data));};
    const stand=await p.evaluate(()=>({version:APP_VERSION,bilder:Object.keys(PRODUKTBILDER).length,theme:document.documentElement.dataset.theme||'oled'}));
    row.version=stand.version;check('public-current-version',response.status()===200&&stand.version===process.env.PHOTO_EXPECT_VERSION,stand);
    check('public-image-catalog',stand.bilder===688,stand.bilder);
    await p.evaluate(()=>{build.rahmen='f-spindrift';build.gabel='g-domain';sichern();zeichne();oeffneSlot('gabel',{tab:'alle'});});
    for(const [id,query]of [['g-selvav','Selva V'],['g-durolux','Durolux'],['g-domain','Domain']]){
      await p.locator('#suche-in').fill(query);await p.waitForTimeout(100);
      const src=await p.evaluate(id=>produktBildUrl(K.gabel.find(t=>t.id===id)),id);
      const button=p.locator('#opt-liste [data-produktfoto="'+src+'"]').first();
      await button.scrollIntoViewIfNeeded();
      const state=await p.evaluate(()=>({build:JSON.stringify(build),storage:JSON.stringify({...localStorage}),scroll:document.querySelector('#modal .sheet-b').scrollTop,search:document.querySelector('#suche-in').value}));
      await button.click();await p.waitForFunction(()=>{const i=document.querySelector('.pb-flaeche img');return i?.naturalWidth&&i.dataset.photoBackground&&!i.classList.contains('pb-photo-pending');});
      const pic=await p.evaluate(()=>{const d=document.querySelector('.pb-dialog'),i=d.querySelector('img'),m=d.querySelector('.pb-medien');return{black:getComputedStyle(d).backgroundColor,art:i.dataset.photoBackground,fit:i.clientWidth<=m.clientWidth&&i.clientHeight<=m.clientHeight,source:d.querySelector('.pb-quelle').href,meta:document.querySelector('meta[name="theme-color"]').content};});
      check(id+'-real-image-black-view',pic.black==='rgb(0, 0, 0)'&&['transparent','schwarz'].includes(pic.art)&&pic.fit&&/^https:\/\//.test(pic.source)&&pic.meta==='#000000',pic);
      await p.locator('[data-pb-zoom]').click();await p.waitForFunction(()=>document.querySelector('.pb-medien').scrollWidth>document.querySelector('.pb-medien').clientWidth);
      check(id+'-zoom',await p.locator('[data-pb-zoom]').getAttribute('aria-pressed')==='true');
      await p.locator('[data-pb-zoom]').click();
      await p.waitForTimeout(150);
      const fitted=await p.evaluate(()=>{const i=document.querySelector('.pb-flaeche img'),m=document.querySelector('.pb-medien'),r=i.getBoundingClientRect(),b=m.getBoundingClientRect();return{zoom:m.classList.contains('pb-zoom'),image:r.toJSON(),media:b.toJSON(),parent:i.parentElement.getBoundingClientRect().toJSON()};});
      check(id+'-fitted-after-zoom',!fitted.zoom&&fitted.image.width<=fitted.media.width&&fitted.image.x>=fitted.media.x&&fitted.image.right<=fitted.media.right,fitted);
      if(id==='g-domain')await p.screenshot({path:out+`/app-${width}-${theme}-${lang}.png`});
      await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('.pb-dialog').open);
      const after=await p.evaluate(()=>({build:JSON.stringify(build),storage:JSON.stringify({...localStorage}),scroll:document.querySelector('#modal .sheet-b').scrollTop,search:document.querySelector('#suche-in').value}));
      check(id+'-selection-and-data-preserved',JSON.stringify(state)===JSON.stringify(after),after);
    }
    await p.locator('#opt-liste [data-detail^="gabel|g-domain"]').first().click();
    const detail=p.locator('#modal .teilfoto-gross [data-produktfoto]').first();await detail.scrollIntoViewIfNeeded();await detail.click();
    await p.waitForSelector('.pb-dialog[open]');check('public-detail-photo-click',await p.locator('#pb-titel').textContent().then(t=>t.includes('Domain')));
    await p.locator('[data-pb-close]').click();
    await p.evaluate(()=>{schliesse();build.gabel='g-pike';build.bremsen='b-xt|203180';zeichne();});
    const adapter=await p.evaluate(()=>(bewerte(build).adapter||[]).map(x=>({name:x.n,wo:x.wo})));
    check('public-203-adapter-preserved',adapter.some(x=>x.wo==='gabel'&&/203/.test(x.name)),adapter);
    check('public-no-script-error',!row.errors.length,row.errors);rows.push(row);await c.close();console.log('LIVE',width,theme,lang,row.version,row.checks.filter(x=>x.ok).length+'/'+row.checks.length);
  }
  await browser.close();fs.writeFileSync(out+'/browser.json',JSON.stringify(rows,null,2));
  const all=rows.flatMap(r=>r.checks);console.log('LIVE RESULT',all.filter(x=>x.ok).length+'/'+all.length);process.exit(all.every(x=>x.ok)?0:1);
})().catch(e=>{console.error(e);process.exit(1);});
