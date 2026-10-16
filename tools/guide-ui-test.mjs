import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
const {chromium} = createRequire(import.meta.url)('playwright');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const server = createServer((req,res) => { res.writeHead(200, {'Content-Type':'text/html'}); res.end(html); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await chromium.launch();
let checks = 0;
try{
  for(const [language,width] of [['de',390], ['en',320]]){
    const context = await browser.newContext({viewport:{width,height:844}, serviceWorkers:'block'});
    const page = await context.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    let enabled = false, calls = 0, status = 200, payload;
    await page.route('**/index.html', r => r.fulfill({contentType:'text/html', body:enabled ? html.replace('const KI_GUIDE_URL = "";', 'const KI_GUIDE_URL = "https://guide.example/guide";') : html}));
    await page.route('https://guide.example/guide', r => {
      calls++; payload = r.request().postDataJSON();
      return r.fulfill({status, contentType:'application/json', body:JSON.stringify(status === 200 ? {answer:'<img src=x onerror=alert(1)>\nSAG erklärt.'} : {error:'quota'})});
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
    assert.deepEqual(Object.keys(payload).sort(), ['parts','question']);
    assert.equal(calls, 1); checks++;
    status = 429;
    await page.locator('#g-in').fill('Was bedeutet LSC?'); await page.locator('#g-form button').click();
    await page.waitForFunction(() => !gKiLaeuft && !gVerlauf[gVerlauf.length - 1].tippt);
    assert.match(await page.locator('#g-liste').innerText(), /Kontingent|allowance/); checks++;
    await page.locator('#g-ki').uncheck();
    await page.locator('#g-in').fill('Was bedeutet SAG?'); await page.locator('#g-form button').click();
    await page.waitForFunction(() => !gWarte);
    assert.equal(calls, 2); assert.deepEqual(errors, []); checks++;
    await context.close();
  }
  console.log(`GUIDE-UI: ${checks} Prüfungen bestanden (DE/EN, 390/320 px, simulierte API)`);
}finally{ await browser.close(); await new Promise(r => server.close(r)); }
