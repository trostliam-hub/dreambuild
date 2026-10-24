import {createRequire} from 'node:module';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {createServer} from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const {chromium} = createRequire(import.meta.url)('playwright');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const types = {'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2'};
const server = createServer((req,res) => {
  const file = path.resolve(root, '.' + new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root + path.sep) || !existsSync(file) || !statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream'}); res.end(readFileSync(file));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await chromium.launch();
let checks = 0;
try{
  for(const [language,width] of [['de',390], ['en',320]]){
    const context = await browser.newContext({viewport:{width,height:844}, serviceWorkers:'block'});
    await context.route('**/*', r => r.request().url().startsWith(new URL(url).origin + '/') || r.request().url() === 'https://guide.example/guide' ? r.continue() : r.abort());
    const page = await context.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    let enabled = false, calls = 0, status = 200, payload, error = 'quota';
    await page.route('**/index.html', r => r.fulfill({contentType:'text/html', body:html.replace('const G_KI_PAUSE_MS = 35000;', 'const G_KI_PAUSE_MS = 0;').replace(/const KI_GUIDE_URL = "[^"]*";/, 'const KI_GUIDE_URL = "' + (enabled ? 'https://guide.example/guide' : '') + '";')}));
    await page.route('https://guide.example/guide', r => {
      calls++; payload = r.request().postDataJSON();
      return r.fulfill({status, contentType:'application/json', headers:{'Retry-After':'1','Access-Control-Expose-Headers':'Retry-After'}, body:JSON.stringify(status === 200 ? {answer:'<img src=x onerror=alert(1)>\nSAG erklärt.',linkIds:['r0','r0','https://evil.example', payload.resources.find(x => /Fahrwerk|suspension setup/.test(x.title))?.id]} : {error})});
    });
    await page.goto(url);
    await page.evaluate(s => {localStorage.setItem('mtb.einstieg2','1');localStorage.setItem('mtb.tour','1');localStorage.setItem('mtb.sprache',s);}, language);
    await page.reload();
    await page.evaluate(() => oeffneGuide());
    assert.equal(await page.locator('#g-ki').count(), 0); checks++;
    enabled = true; await page.reload();
    await page.evaluate(() => oeffneGuide());
    assert.equal(await page.locator('#g-ki').isChecked(), false); assert.equal(calls, 0); checks++;
    await page.locator('#g-ki').check();
    await page.locator('#g-in').fill('Was bedeutet SAG?'); await page.locator('#g-form button').click();
    await page.waitForFunction(() => !gKiLaeuft && gVerlauf.some(x => (x.html || '').includes('SAG erklärt.')));
    assert.equal(await page.locator('#g-liste img').count(), 0);
    assert.deepEqual(Object.keys(payload).sort(), ['context','language','parts','question','resources']);
    assert.ok(payload.context.includes('Score:'));
    assert.ok(payload.resources.every(x => Object.keys(x).sort().join(',') === 'description,id,title'));
    assert.ok(!JSON.stringify(payload).includes('lizenz'));
    assert.equal(await page.locator('#g-liste a[href="https://evil.example"]').count(),0);
    const knownLinks = await page.evaluate(() => gKiKontext('Was bedeutet SAG?').resources.filter(r => r.url).map(r => r.url));
    const renderedLinks = await page.locator('#g-liste a').evaluateAll(nodes => nodes.map(n => n.href));
    assert.ok(renderedLinks.length > 0 && renderedLinks.every(href => knownLinks.includes(href)));
    assert.equal(new Set(renderedLinks).size, renderedLinks.length);
    assert.ok(await page.locator('#g-liste [data-gakt="view:setup"]').count());
    assert.equal(calls, 1); checks++;
    status = 429;
    await page.locator('#g-in').fill('Was bedeutet LSC?'); await page.locator('#g-form button').click();
    await page.waitForFunction(() => !gKiLaeuft && !gVerlauf[gVerlauf.length - 1].tippt);
    assert.match(await page.locator('#g-liste').innerText(), /Kontingent|allowance/); checks++;
    error = 'rate';
    await page.locator('#g-in').fill('Was bedeutet HSC?'); await page.locator('#g-form button').click();
    await page.waitForFunction(() => !gKiLaeuft && !gQueueTimer && !gFragen.length);
    assert.match(await page.locator('#g-liste').innerText(), /weiter ausgelastet|still busy/); checks++;
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false);
    const oldBuild = await page.evaluate(() => JSON.stringify(build));
    await page.locator('#g-liste [data-gakt="view:setup"]').click();
    assert.equal(await page.evaluate(() => view),'setup');
    assert.equal(await page.evaluate(() => JSON.stringify(build)),oldBuild); checks++;
    await page.evaluate(() => oeffneGuide());
    await page.locator('#g-ki').uncheck();
    await page.locator('#g-in').fill('Was bedeutet SAG?'); await page.locator('#g-form button').click();
    await page.waitForFunction(() => !gWarte);
    assert.equal(calls, 5); assert.deepEqual(errors, []); checks++;
    const product = await page.evaluate(() => {
      build.gabel = 'g-pike';
      live.teile = {}; ANGEBOTE.clear();
      live.seiten = {'g-pike':[{s:'Testshop',l:'https://shop.example/pike',d:new Date().toISOString(),k:1,v:ausfWerte(findeTeil('gabel',build.gabel))}]};
      koerper.notiz = 'PRIVATE-BODY-MARKER'; pro.key = 'PRIVATE-LICENCE-MARKER';
      gVerlauf.push({wer:'du',text:'PRIVATE-HISTORY-MARKER'});
      const ctx = gKiKontext('Zeig mir den Link zur Pike Gabel');
      return {payload:ctx.payload,resources:ctx.resources,rendered:gKiVerweise(ctx.resources.map(r=>r.id),ctx.resources),
        setup:gKiKontext('Gib mir den RockShox-Setup-Link aus der App').resources,
        fox:gKiKontext('Gib mir den Fox Setup Link').resources};
    });
    assert.ok(product.payload.parts.some(p => /Pike/.test(p)));
    assert.ok(product.resources.some(r => r.url === 'https://shop.example/pike'),JSON.stringify(product.resources));
    assert.match(product.rendered.html,/href="https:\/\/shop.example\/pike"/);
    assert.ok(product.resources.some(r => r.action?.startsWith('such:gabel:')));
    assert.ok(!JSON.stringify(product.payload).includes('PRIVATE-'));
    assert.ok(!JSON.stringify(product.payload).includes('https://shop.example'));
    assert.ok(product.setup.some(r => r.url?.includes('trailhead.rockshox.com')));
    assert.ok(product.fox.some(r => r.url?.includes('ridefox.com')));
    assert.ok(!product.fox.some(r => /rockshox|sram\.com/.test(r.url || '')));
    checks++;
    // Feste Soforthilfe läuft vor Katalogtreffern, KI und Tagesgrenze, auch ohne Rad.
    await page.evaluate(() => { setzeBau(leerBau(),true); gSchadensfall=null; });
    const send = async text => { await page.locator('#g-in').fill(text); await page.locator('#g-form button').click(); await page.waitForFunction(() => !gKiLaeuft && !gWarte); };
    const noCalls = calls, stand = await page.evaluate(() => JSON.stringify(build));
    await page.locator('#g-ki').check();
    await send(language === 'de' ? 'Mir ist ein Bremskolben rausgefallen was tun?' : 'My brake piston popped out');
    let last = await page.locator('.g-m.bot').last().innerText();
    assert.match(last,language === 'de' ? /nicht weiterfahren/ : /do not ride/);
    assert.doesNotMatch(last,/20[–-]30|6[–-]8|Rahmen eintragen|add.*frame/i);
    assert.equal(calls,noCalls); checks++;
    await send(language === 'de' ? 'Es ist eine Shimano XT M8120' : 'I have a Shimano XT M8120');
    assert.match(await page.locator('.g-m.bot').last().innerText(),/Shimano XT M8120/);
    assert.doesNotMatch(await page.locator('.g-m.bot').last().innerText(),/Für Es ist|For I have/);
    await send(language === 'de' ? 'Kann ich trotzdem weiterfahren?' : 'Can I ride anyway?');
    assert.match(await page.locator('.g-m.bot').last().innerText(),language === 'de' ? /nicht weiterfahren/ : /do not ride/);
    assert.equal(calls,noCalls); checks++;
    await page.evaluate(() => { window.auditGuideCount=guideZaehlen; guideZaehlen=()=>false; });
    await send(language === 'de' ? 'Meine Bremse verliert Öl' : 'My brake is leaking');
    assert.match(await page.locator('.g-m.bot').last().innerText(),language === 'de' ? /nicht weiterfahren/ : /do not ride/);
    await page.evaluate(() => { guideZaehlen=window.auditGuideCount; });
    assert.equal(calls,noCalls); assert.equal(await page.evaluate(() => JSON.stringify(build)),stand); checks++;
    // Normale Wartung / neue Themen lösen den aktiven Schaden ab.
    const local = await page.evaluate(() => ({blocked:gAntwort('Wie wechsle ich Bremsbeläge?'),general:gAntwort('Was bedeutet SAG?'),normal:gAntwort('Wie wechsle ich Bremsbeläge?'),state:gSchadensfall,
      db8:(build.bremsen='b-db8',gBremse([])),unknown:gBremse(gWorte('SRAM')),named:gBremse(gWorte('SRAM Code')),address:gBremse(gWorte('Guide wie kann ich Shimano entlüften'))}));
    assert.match(local.blocked.id,/^sicher-/); assert.equal(local.address.m,'Shimano');
    assert.doesNotMatch(local.normal.id,/^sicher-/); assert.equal(local.state,null);
    assert.equal(local.db8.oel,'min'); assert.doesNotMatch(JSON.stringify(local.db8.fl),/DOT/);
    assert.equal(local.unknown.oel,null); assert.equal(local.named.oel,'dot'); checks++;
    // Nur tatsächlich beantwortete KI-Fragen, begrenzt auf zwei Paare; kein globaler Chatverlauf.
    status=200; await page.evaluate(() => { gKiVerlauf=[]; });
    for(const question of ['Es knackt beim Treten','Vorne am Lenker','Nur wenn ich stehe','Nach dem Regen']) await send(question);
    assert.equal(payload.history.length,4);
    assert.equal(payload.history.filter(m=>m.role==='user').length,2);
    assert.ok(payload.history.some(m=>m.content==='Vorne am Lenker'));
    assert.ok(!payload.history.some(m=>m.content==='Es knackt beim Treten'));
    assert.ok(payload.history.every(m=>m.content.length<=500));
    assert.ok(!JSON.stringify(payload).includes('PRIVATE-')); checks++;
    await page.locator('#g-ki').uncheck();
    assert.equal(await page.evaluate(() => gKiVerlauf.length),0);
    await page.locator('#g-ki').check();
    await send('Noch eine Frage zum Knacken'); assert.equal(payload.history,undefined);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false);
    assert.deepEqual(errors,[]); checks++;
    await context.close();
  }
  console.log(`GUIDE-UI: ${checks} Prüfungen bestanden (DE/EN, 390/320 px, simulierte API)`);
}finally{ await browser.close(); await new Promise(r => server.close(r)); }
