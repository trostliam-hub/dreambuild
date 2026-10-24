/* Echte Browser-Interaktion, simulierte API; virtuelle Zeit für den echten 35-s-Abstand. */
import {createRequire} from 'node:module';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {createServer} from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const {chromium} = createRequire(import.meta.url)('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(path.join(root,'index.html'),'utf8').replace(/const KI_GUIDE_URL = "[^"]*";/,'const KI_GUIDE_URL = "https://queue.example/guide";');
const server = createServer((req,res) => {
  const file = path.resolve(root,'.' + new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root + path.sep) || !existsSync(file) || !statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.writeHead(200,{'Content-Type':file.endsWith('.js')?'text/javascript':file.endsWith('.html')?'text/html':'application/octet-stream'});
  res.end(readFileSync(file));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url = `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await chromium.launch();
let checks=0;
try{
  for(const [language,width] of [['de',390],['en',320]]){
    const ctx=await browser.newContext({viewport:{width,height:844},serviceWorkers:'block'});
    await ctx.route('**/*',r=>r.request().url().startsWith(new URL(url).origin + '/') || r.request().url()==='https://queue.example/guide' ? r.continue():r.abort());
    await ctx.addInitScript(s=>{localStorage.setItem('mtb.einstieg2','1');localStorage.setItem('mtb.tour','1');localStorage.setItem('mtb.sprache',s);localStorage.setItem('mtb.guide','');},language);
    const page=await ctx.newPage(), calls=[], held=[], errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.clock.install({time:new Date('2026-10-24T12:00:00Z')});
    await page.route('**/index.html',r=>r.fulfill({contentType:'text/html',body:html}));
    await page.route('https://queue.example/guide',r=>new Promise(resolve=>{
      calls.push(r.request().postDataJSON());
      held.push(async (status=200,answer='- Kurz erklärt.\n- Nächster Schritt.',error='rate')=>{
        await r.fulfill({status,contentType:'application/json',headers:{'Retry-After':'7'},body:JSON.stringify(status===200?{answer,linkIds:[]}:{error})});resolve();
      });
    }));
    const send=async q=>{await page.locator('#g-in').fill(q);await page.locator('#g-form button').click();assert.equal(await page.locator('#g-in').inputValue(),'');};
    const arrived=async n=>{await page.waitForFunction(()=>gKiLaeuft);await assertPoll(()=>calls.length===n);};
    const finish=async (...args)=>{await held.shift()(...args);await page.waitForFunction(()=>!gKiLaeuft);};
    const advance=async ms=>{await page.clock.fastForward(ms);};
    await page.goto(url);await page.evaluate(()=>{oeffneGuide();window.queueCount=guideZaehlen;guideZaehlen=()=>true;});
    await page.locator('#g-ki').check();
    await send('Was bedeutet SAG?');await arrived(1);
    await send('Was bedeutet LSC?');await send('Was bedeutet HSC?');
    assert.equal(calls.length,1);assert.equal(await page.locator('.g-wartet').count(),2);
    await page.evaluate(()=>{schliesse();oeffneGuide();});
    assert.equal(await page.locator('.g-m.du').count(),3);checks++;
    await finish(200,'- SAG ist das Einsinken beim Aufsitzen.\n- <img src=x onerror=alert(1)>');
    assert.equal(await page.locator('.g-punkte li').count(),2);assert.equal(await page.locator('#g-liste img').count(),0);
    const positions = await page.evaluate(()=>({list:document.querySelector('#g-liste').getBoundingClientRect().top,answer:document.querySelector('.g-punkte').getBoundingClientRect().top}));
    assert.ok(positions.answer>=positions.list,'Die fertige Antwort muss trotz weiterer Wartefragen sichtbar sein.');
    assert.match(await page.locator('.g-punkte').innerText(),/<img/);
    await advance(34000);assert.equal(calls.length,1);await advance(1000);await arrived(2);
    assert.equal(calls[1].question,'Was bedeutet LSC?');assert.equal(calls[1].history[0].content,'Was bedeutet SAG?');
    await finish();await advance(35000);await arrived(3);
    assert.equal(calls[2].question,'Was bedeutet HSC?');assert.equal(calls[2].history.length,4);
    await finish();assert.equal(await page.locator('.g-wartet,.g-tippt').count(),0);
    assert.deepEqual(await page.locator('.g-m').evaluateAll(nodes=>nodes.slice(1).map(n=>n.classList.contains('du')?'du':'bot')),['du','bot','du','bot','du','bot']);checks++;
    // Globales Limit: Kopf bleibt vorne; nur unbezahlte Rate-Ablehnung wird begrenzt neu versucht.
    await advance(35000);await send('Was ist Zugstufe?');await arrived(4);await send('Was ist Druckstufe?');
    await finish(429);assert.match(await page.locator('#g-liste').innerText(),/automatisch|automatically/);
    await advance(6000);assert.equal(calls.length,4);await advance(1000);await arrived(5);
    assert.equal(calls[4].question,'Was ist Zugstufe?');await finish();await advance(35000);await arrived(6);
    assert.equal(calls[5].question,'Was ist Druckstufe?');await finish();checks++;
    // Providerfehler wird nicht erneut bezahlt; nächste Frage läuft trotzdem weiter.
    await advance(35000);await send('Frage zum Reifen');await arrived(7);await send('Frage zur Kette');
    await finish(502,'','provider');await advance(35000);await arrived(8);
    assert.equal(calls[7].question,'Frage zur Kette');await finish();checks++;
    // Opt-out während Fetch und während Pause: kein späteres Senden, auch nach erneutem Einschalten.
    await advance(35000);await send('Frage zur Kassette');await arrived(9);await send('Private Folgefrage');
    await page.locator('#g-ki').uncheck();await finish();await advance(70000);
    assert.equal(calls.length,9);assert.equal(await page.evaluate(()=>gKiVerlauf.length),0);
    await page.locator('#g-ki').check();await send('Neue freigegebene Frage');await arrived(10);
    assert.equal(calls[9].history,undefined);await finish();await send('Frage in der Pause');
    await page.locator('#g-ki').uncheck();await advance(35000);assert.equal(calls.length,10);
    await page.locator('#g-ki').check();checks++;
    // Aufbauwechsel am selben Rad: keinen alten Kontext als aktuellen Aufbau senden.
    await send('Erste Frage zum Aufbau');await arrived(11);await send('Alte wartende Aufbaufrage');
    await page.evaluate(()=>{build.gabel=build.gabel==='g-pike'?'g-zeb':'g-pike';});await finish();
    assert.equal(await page.evaluate(()=>gFragen.length),0);assert.equal(calls.length,11);
    assert.match(await page.locator('#g-liste').innerText(),/nicht gesendet|not sent/);
    await advance(35000);await send('Frage zum neuen Aufbau');await arrived(12);assert.equal(calls[11].history,undefined);await finish();checks++;
    // Themenreset unterbricht keine laufende Antwort, verwirft aber ältere wartende Fragen.
    await advance(35000);await send('Noch eine Frage');await arrived(13);await send('Altes Thema in Warteschlange');
    await send(language==='de'?'Anderes Thema':'New topic');await finish();await advance(35000);
    assert.equal(calls.length,13);assert.equal(await page.evaluate(()=>gKiVerlauf.length),0);checks++;
    // Akuter Schaden wird sofort beantwortet; alte wartende Reparaturfrage darf Schaden nicht löschen.
    await send('Wie pflege ich die Bremse?');await arrived(14);await send('Wie wechsle ich Bremsbeläge?');
    await send(language==='de'?'Mein Bremskolben ist rausgefallen':'My brake piston popped out');
    assert.match(await page.locator('.g-m.bot').last().innerText(),language==='de'?/nicht weiterfahren/:/do not ride/);
    assert.equal(calls.length,14);await finish(200,'- VERALTETE-REPARATUR');await advance(35000);
    assert.doesNotMatch(await page.locator('#g-liste').innerText(),/VERALTETE-REPARATUR/);
    assert.ok(await page.locator('.g-m.bot').last().evaluate(el=>{
      const a=el.getBoundingClientRect(), b=document.querySelector('#g-liste').getBoundingClientRect();return a.top>=b.top && a.top<b.bottom;
    }),'Soforthilfe muss auch nach Abschluss der alten Antwort sichtbar bleiben.');
    assert.equal(calls.length,14);assert.equal(await page.evaluate(()=>gSchadensfall.kind),'piston');checks++;
    // Auch lokale Antworten bleiben bei schnell aufeinanderfolgenden Eingaben erhalten.
    await page.locator('#g-ki').uncheck();await send(language==='de'?'Anderes Thema':'New topic');
    await send('Was bedeutet SAG?');await send('Was bedeutet Zugstufe?');
    await advance(420);await advance(420);
    assert.equal(await page.locator('.g-bl.g-wartet,.g-tippt').count(),0);assert.equal(calls.length,14);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    assert.deepEqual(errors,[]);checks++;
    await ctx.close();
  }
  console.log(`GUIDE-QUEUE: ${checks} Prüfungen bestanden (FIFO, virtuelle 35 s, DE/EN, 390/320 px)`);
}finally{await browser.close();await new Promise(r=>server.close(r));}
async function assertPoll(fn){for(let i=0;i<100;i++){if(fn())return;await new Promise(r=>setTimeout(r,20));}assert.ok(fn(),'API-Aufruf fehlt oder doppelt');}
