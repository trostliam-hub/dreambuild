import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createGuide, openQuota} from '../guide-api/guide.mjs';

const origin = 'https://trostliam-hub.github.io';
const request = (data = {question:'Was bedeutet SAG?', parts:['RockShox ZEB']}, extra = {}) =>
  new Request('https://guide.example/guide', {method:'POST', headers:{Origin:origin, 'Content-Type':'application/json', ...extra}, body:JSON.stringify(data)});
const output = () => Response.json({status:'completed', output:[{type:'reasoning'}, {type:'message', content:[{type:'output_text', text:'SAG erklärt.'}]}]});

test('Monatsgrenze bleibt über Neustart erhalten; paralleler Prozess gesperrt', () => {
  const dir = mkdtempSync(join(tmpdir(), 'guide-test-')), file = join(dir, 'quota.json');
  try{
    let q = openQuota(file, 1);
    assert.throws(() => openQuota(file, 1));
    assert.equal(q.reserve(new Date('2026-10-16')), true);
    assert.equal(q.reserve(new Date('2026-10-16')), false);
    q.close(); q = openQuota(file, 1);
    assert.equal(q.reserve(new Date('2026-10-17')), false);
    assert.equal(q.reserve(new Date('2026-11-01')), true);
    assert.equal(q.reserve(new Date('2026-10-17')), false);
    q.close();
    writeFileSync(file, 'defekt'); assert.throws(() => openQuota(file, 1));
  }finally{ rmSync(dir, {recursive:true, force:true}); }
});

test('Standard 0 löst keine kostenpflichtige Anfrage aus', async () => {
  let calls = 0;
  const guide = createGuide({key:'test-only', origin, quota:{reserve:() => false}, fetchApi:async () => { calls++; return output(); }});
  assert.equal((await guide(request())).status, 429); assert.equal(calls, 0);
});

test('Validierung und Origin vor Kontingent und API', async () => {
  let reservations = 0;
  const guide = createGuide({key:'test-only', origin, quota:{reserve:() => { reservations++; return true; }}});
  assert.equal((await guide(request(undefined, {Origin:'https://other.example'}))).status, 403);
  assert.equal((await guide(request({question:'a'.repeat(201), parts:[]}))).status, 400);
  assert.equal((await guide(request({question:'ok', parts:['a'.repeat(101)]}))).status, 400);
  assert.equal((await guide(request({question:'ok', parts:Array(25).fill('x')}))).status, 400);
  assert.equal((await guide(request(null))).status, 400);
  assert.equal(reservations, 0);
});

test('Nur feste API, Modell, Ausgabelimit; kein Providerverlauf oder Schlüssel im Ergebnis', async () => {
  const guide = createGuide({key:'test-only', origin, quota:{reserve:() => true}, fetchApi:async (url, options) => {
    assert.equal(url, 'https://api.openai.com/v1/responses');
    const body = JSON.parse(options.body);
    assert.equal(body.store, false); assert.equal(body.model, 'gpt-6-luna'); assert.equal(body.max_output_tokens, 800);
    assert.equal(body.tools, undefined); assert.equal(body.previous_response_id, undefined);
    assert.deepEqual(JSON.parse(body.input), {question:'Was bedeutet SAG?', parts:['RockShox ZEB']});
    return output();
  }});
  const response = await guide(request());
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin);
  assert.deepEqual(await response.json(), {answer:'SAG erklärt.'});
  assert.equal((await guide(request())).status, 429);
});

test('Parallele Fragen und Providerfehler erzeugen keinen automatischen zweiten API-Aufruf', async () => {
  let resolve, calls = 0, reserved = 0;
  const guide = createGuide({key:'test-only', origin, quota:{reserve:() => { reserved++; return true; }}, fetchApi:() => {
    calls++; return new Promise(r => { resolve = r; });
  }});
  const first = guide(request());
  await new Promise(r => setTimeout(r, 0));
  assert.equal((await guide(request(undefined, {'x-guide-peer':'other'}))).status, 429);
  resolve(new Response('PRIVATE PROVIDER ERROR', {status:500}));
  const result = await first;
  assert.equal(result.status, 502); assert.deepEqual(await result.json(), {error:'provider'});
  assert.equal(calls, 1); assert.equal(reserved, 1);
});
