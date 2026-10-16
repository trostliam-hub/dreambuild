import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync, mkdtempSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {Miniflare, Response} from 'miniflare';

const origin = 'https://trostliam-hub.github.io';
const base = fileURLToPath(new URL('./.wrangler/tests/', import.meta.url));
mkdirSync(base, {recursive:true});
const valid = {question:'Was ist SAG?', parts:['RockShox ZEB Ultimate'], context:'Score: 92/100', resources:[{id:'r0',title:'Fahrwerk',description:'Fahrwerksrechner der App'}]};
const completed = data => ({status:'completed', output:[{type:'message', content:[{type:'output_text', text:JSON.stringify(data)}]}]});
const complete = completed({answer:'SAG ist der Negativfederweg.',linkIds:['r0']});

async function fixture(t, overrides = {}){
  const calls = [], persisted = mkdtempSync(base + 'case-');
  let providerStatus = 200, response = complete, mf;
  const options = {
    name:'guide-test', modules:true, scriptPath:fileURLToPath(new URL('./worker.mjs', import.meta.url)),
    compatibilityDate:'2026-07-01', durableObjects:{GUIDE_QUOTA:{className:'GuideQuota', useSQLite:true}},
    durableObjectsPersist:persisted, unsafeInspectDurableObjects:true,
    bindings:{GUIDE_ORIGIN:origin, GUIDE_MONTHLY_REQUESTS:'1000', OPENAI_API_KEY:'test-key-not-valid', ...overrides},
    outboundService:async req => {
      calls.push({url:req.url, method:req.method, authorization:req.headers.get('Authorization'), body:await req.json()});
      return new Response(JSON.stringify(response), {status:providerStatus, headers:{'Content-Type':'application/json'}});
    }
  };
  mf = new Miniflare(options);
  t.after(async () => mf.dispose());
  const send = (data = valid, init = {}) => mf.dispatchFetch('https://guide.example/guide', {
    method:'POST', headers:{Origin:origin, 'Content-Type':'application/json'}, body:JSON.stringify(data), ...init
  });
  const storage = () => mf.unsafeGetDurableObjectStorage('guide-test', 'GuideQuota', {name:'global-budget-v1'});
  return {calls, send, storage,
    get: () => mf.dispatchFetch('https://guide.example/'),
    provider(status, body = complete){providerStatus = status; response = body;},
    async restart(){ await mf.dispose(); mf = new Miniflare(options); },
    async unlock(){await (await storage()).exec('UPDATE quota SET next_at = 0');}
  };
}

test('Ohne Schlüssel, bei 0 oder falschem Kontingent bleibt die API gesperrt', async t => {
  for(const overrides of [{OPENAI_API_KEY:''}, {GUIDE_MONTHLY_REQUESTS:'0'}, {GUIDE_MONTHLY_REQUESTS:'1001'}, {GUIDE_MONTHLY_REQUESTS:'NaN'}]){
    const f = await fixture(t, overrides);
    assert.equal((await (await f.get()).json()).ready, false);
    assert.equal((await f.send()).status, 503);
    assert.equal(f.calls.length, 0);
  }
});

test('Origin, Methode, JSON und Byte-/Textgrenzen vor kostenpflichtigem Aufruf', async t => {
  const f = await fixture(t);
  assert.equal((await f.send(valid, {headers:{Origin:'https://fremd.example', 'Content-Type':'application/json'}})).status, 403);
  assert.equal((await f.send(valid, {method:'GET', body:undefined})).status, 405);
  const preflight = await f.send(valid, {method:'OPTIONS', body:undefined});
  assert.equal(preflight.status, 204); assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), origin);
  assert.equal((await f.send(valid, {headers:{Origin:origin}})).status, 415);
  assert.equal((await f.send(valid, {body:'{' })).status, 400);
  for(const data of [null, {...valid, question:' '}, {...valid, question:'x'.repeat(201)}, {...valid, parts:Array(25).fill('x')}, {...valid, parts:[123]}])
    assert.equal((await f.send(data)).status, 400);
  assert.equal((await f.send({...valid, parts:Array(24).fill('界'.repeat(100)), extra:'x'.repeat(5000)})).status, 413);
  assert.equal((await f.send({...valid, context:'x'.repeat(2001)})).status, 400);
  assert.equal((await f.send({...valid, resources:[...valid.resources,...valid.resources]})).status, 400);
  assert.equal(f.calls.length, 0);
});

test('Fester OpenAI-Aufruf, keine Client-Werkzeuge oder Schlüssel in der Antwort', async t => {
  const f = await fixture(t);
  const result = await f.send({...valid, model:'teuer', tools:[{type:'web_search'}], apiKey:'unerlaubt'});
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), {answer:'SAG ist der Negativfederweg.',linkIds:['r0']});
  assert.equal(result.headers.get('Cache-Control'), 'no-store');
  const call = f.calls[0];
  assert.equal(call.url, 'https://api.openai.com/v1/responses'); assert.equal(call.method, 'POST');
  assert.equal(call.body.model, 'gpt-6-luna'); assert.equal(call.body.store, false);
  assert.equal(call.body.max_output_tokens, 800); assert.equal(call.body.tools, undefined);
  assert.equal(call.body.reasoning.effort, 'none'); assert.equal(call.body.text.format.strict, true);
  assert.deepEqual(JSON.parse(call.body.input), valid);
  assert.equal(call.authorization, 'Bearer test-key-not-valid');
});

test('Parallele Anfragen und Worker-Neustart können gemeinsames Monatslimit nicht umgehen', async t => {
  const f = await fixture(t, {GUIDE_MONTHLY_REQUESTS:'1'});
  const replies = await Promise.all(Array.from({length:12}, () => f.send()));
  assert.equal(replies.filter(r => r.status === 200).length, 1);
  assert.equal(replies.filter(r => r.status === 429).length, 11);
  assert.equal(f.calls.length, 1);
  await f.restart();
  assert.equal((await f.send()).status, 429); assert.equal(f.calls.length, 1);
  assert.equal((await (await f.storage()).exec('SELECT count FROM quota'))[0].count, 1);
});

test('Drossel bleibt bei Neustart erhalten; Tageslimit und Monatswechsel', async t => {
  const f = await fixture(t);
  assert.equal((await f.send()).status, 200);
  await f.restart();
  const rate = await f.send();
  assert.equal(rate.status, 429); assert.equal((await rate.json()).error, 'rate');
  assert.ok(Number(rate.headers.get('Retry-After')) > 0); assert.equal(f.calls.length, 1);
  const store = await f.storage();
  await store.exec('UPDATE quota SET next_at = 0, daily_count = 100');
  assert.equal((await f.send()).status, 429);
  await store.exec("UPDATE quota SET day = '2000-01-01', daily_count = 100");
  assert.equal((await f.send()).status, 200);
  assert.equal((await store.exec('SELECT count FROM quota'))[0].count, 2);
  await store.exec("UPDATE quota SET next_at = 0, month = '2000-01', day = '2000-01-01', count = 1000, daily_count = 100");
  assert.equal((await f.send()).status, 200);
  assert.equal((await store.exec('SELECT count FROM quota'))[0].count, 1);
  await store.exec("UPDATE quota SET next_at = 0, month = '2999-01', day = '2999-01-01'");
  assert.equal((await f.send()).status, 503); assert.equal(f.calls.length, 3);
});

test('Providerfehler zählen, geben keine Geheimnisse aus und lösen keine Wiederholungen aus', async t => {
  const f = await fixture(t, {GUIDE_MONTHLY_REQUESTS:'1'});
  f.provider(401, {error:'test-key-not-valid'});
  const result = await f.send();
  assert.equal(result.status, 502); assert.deepEqual(await result.json(), {error:'provider'});
  assert.equal((await f.send()).status, 429); assert.equal(f.calls.length, 1);
});

test('Unvollständige oder leere Modellantworten werden nicht als Erfolg gezeigt', async t => {
  const f = await fixture(t);
  f.provider(200, {status:'incomplete', output:[]});
  assert.equal((await f.send()).status, 502);
  await f.unlock(); f.provider(200, {status:'completed', output:[]});
  assert.equal((await f.send()).status, 502); assert.equal(f.calls.length, 2);
});

test('Erfundene Links, doppelte IDs und fremde URLs werden nicht übernommen', async t => {
  const f = await fixture(t);
  f.provider(200, completed({answer:'Hier findest du die Einstellung.',linkIds:['r0','r0','https://fremd.example','r7']}));
  const result = await f.send({...valid, resources:[{...valid.resources[0],url:'https://nicht-an-openai.example'}]});
  assert.deepEqual(await result.json(), {answer:'Hier findest du die Einstellung.',linkIds:['r0']});
  assert.deepEqual(JSON.parse(f.calls[0].body.input),valid);
  await f.unlock(); f.provider(200, completed({answer:'x'.repeat(1801),linkIds:[]}));
  assert.equal((await f.send()).status,502);
});
