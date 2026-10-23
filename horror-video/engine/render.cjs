// Rendert Frames per Headless-Chromium und pipet sie in ffmpeg.
// node render.cjs <timeline.json> segment <start> <end> <out.mp4>
// node render.cjs <timeline.json> stills <outDir> <frame,frame,...>
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const ROOT = __dirname;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.ttf': 'font/ttf', '.json': 'application/json' };
const [tlPath, mode, a1, a2, a3] = process.argv.slice(2);

(async () => {
  const srv = http.createServer((req, res) => {
    const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!p.startsWith(ROOT) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
  }).listen(0);
  const port = srv.address().port;
  const browser = await chromium.launch({ args: ['--disable-gpu-vsync', '--force-color-profile=srgb'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('PAGEERROR', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await page.goto(`http://127.0.0.1:${port}/engine.html`);
  await page.evaluate(() => window.enginePromise);
  const tl = JSON.parse(fs.readFileSync(tlPath, 'utf8'));
  await page.evaluate(t => window.setTimeline(t), tl);
  const shot = async (i) => { await page.evaluate(n => window.renderFrame(n), i); return page.screenshot({ type: mode === 'stills' ? 'png' : 'jpeg', quality: mode === 'stills' ? undefined : 95, clip: { x: 0, y: 0, width: 1080, height: 1920 } }); };

  if (mode === 'stills') {
    fs.mkdirSync(a1, { recursive: true });
    for (const f of a2.split(',').map(Number)) fs.writeFileSync(path.join(a1, `f${String(f).padStart(5, '0')}.png`), await shot(f));
  } else {
    const start = +a1, end = +a2, out = a3;
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let i = start; i < end; i++) {
      const buf = await shot(i);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if ((i - start) % 150 === 0) console.log(`[${path.basename(out)}] ${i - start}/${end - start} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await browser.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
