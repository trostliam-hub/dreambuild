'use strict';
// Orte bei Nacht für True-Crime-Shorts: house_ext (Haus von außen), church_ext (kleine Backsteinkirche),
// phone_booth (Telefonzelle im Regen), police_lights (Festnahme mit Blaulicht).
// Alles in einer IIFE, nur SCENES.* wird gesetzt. Statische Ebenen werden gecacht, Licht wird in einem
// Viertel-Auflösungs-Puffer gesammelt und additiv aufgetragen (billig und weich).
(() => {
  // ---------- Grundlagen ----------
  const PAD = 200, LW = W + 2 * PAD, LH = H + 2 * PAD, TAU = Math.PI * 2;
  const rnd = (i, s = 0) => hash(i * 1.618 + s * 9.737 + .123);
  const tv = (v, d = null) => v === true ? 0 : (typeof v === 'number' && isFinite(v) ? v : d);
  const num = (v, d) => typeof v === 'number' && isFinite(v) ? v : d;
  const mkCv = (w, h) => { const cv = document.createElement('canvas'); cv.width = Math.ceil(w); cv.height = Math.ceil(h); return cv; };
  const BIG = new Map(), SPR = new Map();
  function layer(key, draw) { // statische Vollbild-Ebene inkl. Rand (-200..W+200), LRU-Cache
    let cv = BIG.get(key);
    if (cv) { BIG.delete(key); BIG.set(key, cv); return cv; }
    if (BIG.size >= 8) BIG.delete(BIG.keys().next().value);
    cv = mkCv(LW, LH); const g = cv.getContext('2d'); g.translate(PAD, PAD); draw(g); BIG.set(key, cv); return cv;
  }
  function visRect(c, m = 6) { // sichtbarer Bereich in Szenenkoordinaten (für beschnittene Blits)
    const t = c.getTransform().inverse(); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [sx, sy] of [[0, 0], [W, 0], [0, H], [W, H]]) { const x = t.a * sx + t.c * sy + t.e, y = t.b * sx + t.d * sy + t.f; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    return [Math.max(-PAD, Math.floor(x0 - m)), Math.max(-PAD, Math.floor(y0 - m)), Math.min(W + PAD, Math.ceil(x1 + m)), Math.min(H + PAD, Math.ceil(y1 + m))];
  }
  function blit(c, cv, ya = -PAD, yb = H + PAD) { // nur sichtbare Zeilen/Spalten kopieren
    const [x0, y0, x1, y1] = visRect(c), Y0 = Math.max(y0, ya), Y1 = Math.min(y1, yb); if (Y1 <= Y0 || x1 <= x0) return;
    c.drawImage(cv, x0 + PAD, Y0 + PAD, x1 - x0, Y1 - Y0, x0, Y0, x1 - x0, Y1 - Y0);
  }
  function fillVis(c, col) { const [x0, y0, x1, y1] = visRect(c); c.fillStyle = col; c.fillRect(x0, y0, x1 - x0, y1 - y0); }
  function sprite(key, w, h, draw) { let cv = SPR.get(key); if (!cv) { if (SPR.size > 80) SPR.clear(); cv = mkCv(w, h); draw(cv.getContext('2d'), w, h); SPR.set(key, cv); } return cv; }
  const poly = (g, pts) => { g.beginPath(); pts.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); };

  // Licht-Puffer (1/4 Auflösung, additiv)
  const LS = .25; let lbCv = null, lbG = null, LBB = [1e9, 1e9, -1e9, -1e9];
  const lbAdd = (x0, y0, x1, y1) => { LBB[0] = Math.min(LBB[0], x0); LBB[1] = Math.min(LBB[1], y0); LBB[2] = Math.max(LBB[2], x1); LBB[3] = Math.max(LBB[3], y1); };
  function lightBegin() {
    if (!lbCv) { lbCv = mkCv(LW * LS, LH * LS); lbG = lbCv.getContext('2d'); }
    const g = lbG; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, lbCv.width, lbCv.height);
    g.setTransform(LS, 0, 0, LS, PAD * LS, PAD * LS); g.globalCompositeOperation = 'lighter'; LBB = [1e9, 1e9, -1e9, -1e9]; return g;
  }
  function lightEnd(c, a = 1) { const v = visRect(c, 12), x0 = Math.max(v[0], Math.floor(LBB[0])), y0 = Math.max(v[1], Math.floor(LBB[1])), x1 = Math.min(v[2], Math.ceil(LBB[2])), y1 = Math.min(v[3], Math.ceil(LBB[3]));
    if (x1 <= x0 || y1 <= y0) return; c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = a; c.imageSmoothingEnabled = true;
    c.drawImage(lbCv, (x0 + PAD) * LS, (y0 + PAD) * LS, (x1 - x0) * LS, (y1 - y0) * LS, x0, y0, x1 - x0, y1 - y0); c.restore(); }
  function glowAt(c, x, y, r, col, a) { if (a <= .002) return; c.save(); c.globalCompositeOperation = 'lighter'; spot(c, x, y, r, col, a); c.restore(); } // kleiner Glanz direkt
  function coneSpr(key, x0, y0, w0, x1, y1, w1, col, fall = .08) { // vorgerenderter weicher Lichtkegel (Viertelauflösung)
    const bx = Math.min(x0 - w0 / 2, x1 - w1 / 2) - 60, bw = Math.max(x0 + w0 / 2, x1 + w1 / 2) + 60 - bx, by = y0 - 40, bh = y1 - y0 + 90;
    const spr = sprite('cone' + key, bw * LS, bh * LS, g => { g.scale(LS, LS); g.translate(-bx, -by); g.filter = 'blur(4px)'; g.globalCompositeOperation = 'lighter';
      for (const k of [1, .8, .6, .42, .26]) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, col.replace('A', .2)); gr.addColorStop(.55, col.replace('A', .2 * (.35 + .65 * fall))); gr.addColorStop(1, col.replace('A', .2 * fall)); g.fillStyle = gr;
        poly(g, [[x0 - w0 * k / 2, y0], [x0 + w0 * k / 2, y0], [x1 + w1 * k / 2, y1], [x1 - w1 * k / 2, y1]]); g.fill(); } });
    return (g, a) => { if (a <= .002) return; if (g === lbG) lbAdd(bx, by, bx + bw, by + bh); g.save(); g.globalAlpha = Math.min(1, a); g.drawImage(spr, bx, by, bw, bh); g.restore(); };
  }
  function espot(g, x, y, rx, ry, col, a) { if (a <= .002) return; if (g === lbG) lbAdd(x - rx, y - ry, x + rx, y + ry); g.save(); g.translate(x, y); g.scale(1, ry / rx); spot(g, 0, 0, rx, col, a); g.restore(); }
  // Debug: p._perf = true schreibt die Zeichenzeit der Szene (inkl. Flush) als console.error
  const PERF = (p, name, t0, c) => { if (!p._perf) return; c.getImageData(0, 0, 1, 1); console.error(`PERF ${name} ${(performance.now() - t0).toFixed(1)}ms`); };
  function beam(g, x, y, ang, len, spread, col, a) { // Lichtstrahl (Taschenlampe, Scheinwerfer)
    if (a <= .002) return;
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len, nx = -Math.sin(ang), ny = Math.cos(ang), sp = spread * len;
    if (g === lbG) lbAdd(Math.min(x, ex) - sp, Math.min(y, ey) - sp, Math.max(x, ex) + sp, Math.max(y, ey) + sp);
    const gr = g.createLinearGradient(x, y, ex, ey); gr.addColorStop(0, col.replace('A', a * .45)); gr.addColorStop(.35, col.replace('A', a * .2)); gr.addColorStop(1, col.replace('A', 0)); g.fillStyle = gr;
    for (const k of [1, .55, .25]) { const s = spread * k * len; poly(g, [[x + nx * 4, y + ny * 4], [ex + nx * s, ey + ny * s], [ex - nx * s, ey - ny * s], [x - nx * 4, y - ny * 4]]); g.fill(); }
  }
  // Blaulicht: [rot, blau] 0..1 – Doppelblitze + weiche Grundwelle
  function strobe(t, ph = 0) {
    const P = 1.05, u = (((t + ph) % P) + P) % P;
    const pl = a => { const d = u - a; return d >= 0 && d < .13 ? Math.min(1, Math.sin(d / .13 * Math.PI) * 1.6) : 0; };
    const wv = .5 + .5 * Math.cos(u / P * TAU);
    return [Math.max(pl(0), pl(.18)) * .78 + .22 * wv, Math.max(pl(.52), pl(.7)) * .78 + .22 * (1 - wv)];
  }
  function lampLevel(gt, seed, on = true) { // Straßenlampe: leises Atmen + gelegentliches Stottern
    if (!on) return 0; let f = .9 + .06 * noise(gt * 2.3, seed) + .04 * noise(gt * 9, seed + 1);
    if (noise(gt * .45, seed + 4) > .5) f *= flicker(gt, seed + 2, 19) > .5 ? 1 : .3;
    return f;
  }
  const WARM = 'rgba(255,178,104,A)', COLD = 'rgba(170,192,225,A)', FLUO = 'rgba(196,226,236,A)', REDL = 'rgba(255,36,32,A)', BLUEL = 'rgba(46,96,255,A)', WHITEL = 'rgba(230,236,248,A)';

  // ---------- Himmel, Wolken, Bäume ----------
  function drawSky(g, o) { // o: {top, mid, bot, hz (Horizont-y), stars, moon: [x,y,r]}
    const gr = g.createLinearGradient(0, -PAD, 0, o.hz); gr.addColorStop(0, o.top); gr.addColorStop(.55, o.mid); gr.addColorStop(1, o.bot);
    g.fillStyle = gr; g.fillRect(-PAD, -PAD, LW, o.hz + PAD); g.fillStyle = o.bot; g.fillRect(-PAD, o.hz - 1, LW, LH);
    for (let i = 0; i < (o.stars || 0); i++) { const x = -PAD + rnd(i, 1) * LW, y = -PAD + rnd(i, 2) * (o.hz * .65 + PAD), a = (.12 + .45 * rnd(i, 3)) * (1 - clamp(y / o.hz));
      g.fillStyle = `rgba(205,215,235,${a})`; const s = rnd(i, 4) > .9 ? 3 : 2; g.fillRect(x, y, s, s); }
    if (o.moon) { const [mx, my, mr] = o.moon; spot(g, mx, my, mr * 9, 'rgba(150,168,200,A)', .13); spot(g, mx, my, mr * 2.6, 'rgba(185,198,222,A)', .22);
      g.fillStyle = '#c3cad6'; g.beginPath(); g.arc(mx, my, mr, 0, TAU); g.fill();
      g.fillStyle = 'rgba(110,120,140,.35)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(mx + (rnd(i, 7) - .5) * mr * 1.2, my + (rnd(i, 8) - .5) * mr * 1.2, mr * (.1 + .16 * rnd(i, 9)), 0, TAU); g.fill(); } }
  }
  function cloudSpr(k) {
    return sprite('cloud' + k, 1000, 360, (g, w, h) => {
      g.filter = 'blur(14px)';
      for (let i = 0; i < 24; i++) { const u = rnd(i, k * 3 + 1), b = Math.sin(u * Math.PI); const x = 130 + u * 740, y = 235 - b * (50 + 60 * rnd(i, k + 7)) + (rnd(i, k + 2) - .5) * 36, r = 30 + 95 * b * (.5 + .5 * rnd(i, k + 4));
        const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(.6, 'rgba(255,255,255,.25)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
      g.filter = 'none'; g.globalCompositeOperation = 'source-in';
      const tg = g.createLinearGradient(0, 80, 0, 320); tg.addColorStop(0, '#6c7890'); tg.addColorStop(1, '#262d3a'); g.fillStyle = tg; g.fillRect(0, 0, w, h);
    });
  }
  function clouds(c, gt, o) { // o: {y0, y1, n, speed, alpha, seed}
    const seed = o.seed || 0;
    for (let i = 0; i < o.n; i++) {
      const spr = cloudSpr(i % 3), sc = .75 + .8 * rnd(i, seed + 1), w = 1000 * sc, h = 360 * sc * (.65 + .35 * rnd(i, seed + 5));
      const span = LW + w, v = (o.speed || 14) * (.6 + .8 * rnd(i, seed + 2));
      const x = -PAD - w + ((rnd(i, seed + 3) * span + gt * v) % span), y = lerp(o.y0, o.y1, rnd(i, seed + 4));
      if (o.vr && (x > o.vr[2] || x + w < o.vr[0] || y + h / 2 < o.vr[1] || y - h / 2 > o.vr[3])) continue;
      c.globalAlpha = (o.alpha || .5) * (.45 + .55 * rnd(i, seed + 9)); c.drawImage(spr, x, y - h / 2, w, h);
    }
    c.globalAlpha = 1;
  }
  // Wolken in halber Auflösung (transparenter Puffer), nach unten weich ausgeblendet (f0..f1), damit sie über dem
  // gebackenen Himmel und hinter Dächern/Bäumen liegen, ohne eigene Himmelsebene.
  const SS = .5; let sbCv = null, sbG = null;
  function cloudLayer(c, cl, gt, f0, f1) {
    const vr = visRect(c, 8), y1 = Math.min(vr[3], f1), w = vr[2] - vr[0], h = y1 - vr[1]; if (h <= 0 || w <= 0) return;
    if (!sbCv) { sbCv = mkCv(LW * SS, LH * SS); sbG = sbCv.getContext('2d'); }
    const g = sbG, sx = (vr[0] + PAD) * SS, sy = (vr[1] + PAD) * SS, sw = w * SS, sh = h * SS;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.clearRect(sx - 2, sy - 2, sw + 4, sh + 4);
    g.setTransform(SS, 0, 0, SS, PAD * SS, PAD * SS); g.save(); g.beginPath(); g.rect(vr[0], vr[1], w, h); g.clip();
    clouds(g, gt, { ...cl, vr: [vr[0], vr[1], vr[2], y1] });
    g.globalAlpha = 1; g.globalCompositeOperation = 'destination-in'; const gr = g.createLinearGradient(0, f0, 0, f1); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(vr[0], vr[1], w, h);
    g.restore(); c.drawImage(sbCv, sx, sy, sw, sh, vr[0], vr[1], w, h);
  }
  const TW = 1700, TH = 1500; // Baum-Sprite (Fuß unten Mitte)
  function treeSpr(seed, col, snow) { // kahler Winterbaum
    return sprite(`tree${seed}${col}${snow ? 's' : ''}`, TW, TH, (g, w, h) => {
      g.lineCap = 'round'; let cnt = 0; const bb = [w, h, 0, 0];
      const br = (x, y, a, len, wd, dep) => {
        const x2 = x + Math.sin(a) * len, y2 = y - Math.cos(a) * len, bend = (rnd(cnt++, seed) - .5) * len * .28;
        bb[0] = Math.min(bb[0], x2 - wd - 30); bb[1] = Math.min(bb[1], y2 - wd - 30); bb[2] = Math.max(bb[2], x2 + wd + 30);
        const mx = (x + x2) / 2 + Math.cos(a) * bend, my = (y + y2) / 2 + Math.sin(a) * bend;
        g.strokeStyle = col; g.lineWidth = wd; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(mx, my, x2, y2); g.stroke();
        if (snow && wd > 2.5 && Math.abs(a) > .25) { g.strokeStyle = 'rgba(175,185,200,.55)'; g.lineWidth = wd * .4; g.beginPath(); g.moveTo(x, y - wd * .35); g.quadraticCurveTo(mx, my - wd * .35, x2, y2 - wd * .35); g.stroke(); }
        if (dep <= 0 || len < 7) return;
        const n = rnd(cnt++, seed + 3) > .62 ? 3 : 2;
        for (let i = 0; i < n; i++) { const sp = (i - (n - 1) / 2) * (.55 + .35 * rnd(cnt++, seed + 1)) + (rnd(cnt++, seed + 5) - .5) * .35;
          br(x2, y2, a * .85 + sp, len * (.66 + .14 * rnd(cnt++, seed + 2)), Math.max(1.2, wd * .64), dep - 1); }
      };
      br(w / 2, h, (rnd(1, seed) - .5) * .08, 300 + 60 * rnd(2, seed), 44, 8);
      g.canvas._bb = [Math.max(0, bb[0]), Math.max(0, bb[1]), Math.min(w, bb[2]), h];
    });
  }
  function drawTree(c, gt, x, y, sc, seed, col, snow) {
    const s = treeSpr(seed, col, snow), sw = Math.sin(gt * .7 + seed) * .010 + noise(gt * .45, seed) * .008;
    c.save(); c.translate(x, y); c.transform(1, 0, -sw, 1, 0, 0); treeAt(c, s, 0, 0, sc); c.restore();
  }
  function treeAt(g, s, x, y, sc) { const [a, b2, e, f] = s._bb || [0, 0, TW, TH]; g.drawImage(s, a, b2, e - a, f - b2, x + (a - TW / 2) * sc, y + (b2 - TH) * sc, (e - a) * sc, (f - b2) * sc); }

  // ---------- Partikel ----------
  function rainDraw(c, gt, o = {}) {
    const n = o.n || 200, sp = o.speed || 2300, len = o.len || 70, sl = o.slant != null ? o.slant : .1, sd = o.seed || 0;
    const x0 = o.x0 != null ? o.x0 : -PAD, x1 = o.x1 != null ? o.x1 : W + PAD, y0 = o.y0 != null ? o.y0 : -PAD, y1 = o.y1 != null ? o.y1 : H + PAD, span = y1 - y0 + len;
    c.save(); c.strokeStyle = o.col || 'rgba(185,200,222,.28)'; c.lineWidth = o.lw || 2; c.lineCap = 'round'; c.beginPath();
    for (let i = 0; i < n; i++) {
      const r3 = rnd(i, sd + 3), v = sp * (.75 + .5 * r3);
      const yy = y0 - len + ((rnd(i, sd + 2) * span + gt * v) % span), xx = x0 - span * sl * .5 + rnd(i, sd + 1) * (x1 - x0) + (yy - y0) * sl, L = len * (.6 + .7 * r3);
      c.moveTo(xx, yy); c.lineTo(xx + L * sl, yy + L);
    }
    c.stroke(); c.restore();
  }
  function splashDraw(c, gt, o) {
    const n = o.n || 40; c.save(); c.strokeStyle = o.col || 'rgba(190,205,225,.4)'; c.lineWidth = o.lw || 2; c.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const per = .45 + .6 * rnd(i, 31), cyc = gt / per + rnd(i, 32), k = cyc - Math.floor(cyc); if (k > .3) continue;
      const id = Math.floor(cyc), u = k / .3, x = o.x0 + rnd(i * 7 + id, 33) * (o.x1 - o.x0), yv = rnd(i * 5 + id, 34), y = o.y0 + yv * (o.y1 - o.y0), s = lerp(o.s0 || .6, o.s1 || 1.4, yv);
      c.globalAlpha = (1 - u) * (o.a || 1); c.beginPath(); c.ellipse(x, y, (3 + 16 * u) * s, (1 + 4.5 * u) * s, 0, 0, TAU); c.stroke();
      if (u < .6) { c.beginPath(); c.moveTo(x - 3 * s, y - 2); c.lineTo(x - 7 * s, y - (6 + 14 * u) * s); c.moveTo(x + 3 * s, y - 2); c.lineTo(x + 8 * s, y - (5 + 12 * u) * s); c.stroke(); }
    }
    c.restore();
  }
  function snowDraw(c, gt, o = {}) {
    const n = o.n || 240; c.save(); c.fillStyle = o.col || 'rgb(228,232,242)';
    for (const L of [0, 1]) {
      c.beginPath(); const m = Math.round(L ? n * .3 : n);
      for (let i = 0; i < m; i++) {
        const s = L ? 2.8 + 2.4 * rnd(i, 41) : 1.2 + 1.4 * rnd(i, 42), v = (L ? 135 : 62) * (.7 + .6 * rnd(i, 43)), span = LH + 40;
        const yy = -PAD - 20 + ((rnd(i, 44 + L) * span + gt * v) % span);
        let xx = rnd(i, 46 + L) * LW + Math.sin(gt * (.5 + rnd(i, 47)) + i) * 22 + gt * (L ? 22 : 12); xx = -PAD + ((xx % LW) + LW) % LW;
        c.moveTo(xx + s, yy); c.arc(xx, yy, s, 0, TAU);
      }
      c.globalAlpha = (L ? .85 : .5) * (o.a || 1); c.fill();
    }
    c.restore();
  }

  // ---------- Menschliche Silhouette (keine Gesichter) ----------
  // x,y = Fußpunkt, h = Körperhöhe px. o: dir (1 = schaut nach rechts), phase (Gehzyklus rad) + walkAmt, lean (rad, vorgebeugt),
  // arms: 'down'|'swing'|'behind'|'phone'|'flash'|'reach'|'pockets', hands: [[bx,by,bend],[...]] (Körperraum), handAbs: [x,y] (Welt, vordere Hand),
  // hat: 'cap'|'brim'|'hood', coat: 'long'|'short'|'none', width, color, rim: {col, side (Welt ±1), w} oder Array, alpha
  const ARMS = {
    down: [[.04, .045, 1], [-.025, .04, 1]],
    pockets: [[.075, -.02, 1], [.01, -.02, 1]],
    behind: [[-.11, -.04, 1], [-.12, -.03, 1]],
    phone: [[.04, -.405, 1], [-.025, .04, 1]],
    flash: [[.33, -.19, 1], [.05, .03, 1]],
    reach: [[.31, -.15, 1], [-.025, .04, 1]],
  };
  function ik(sx, sy, tx, ty, l1, l2, bend) {
    let dx = tx - sx, dy = ty - sy, D = Math.hypot(dx, dy) || 1e-6; const mx = (l1 + l2) * .999;
    if (D > mx) { dx *= mx / D; dy *= mx / D; D = mx; }
    const A = Math.acos(clamp((l1 * l1 + D * D - l2 * l2) / (2 * l1 * D), -1, 1)), a = Math.atan2(dy, dx) + bend * A;
    return [[sx + Math.cos(a) * l1, sy + Math.sin(a) * l1], [sx + dx, sy + dy]];
  }
  function person(c, x, y, h, o = {}) {
    const d = o.dir || 1, lean = o.lean || 0, ph = o.phase, wk = ph == null ? 0 : (o.walkAmt != null ? o.walkAmt : 1);
    let hip = [0, -.5]; const legs = [];
    for (let s = 0; s < 2; s++) {
      const psi = (ph || 0) + s * Math.PI, st = o.stance != null ? o.stance : .045;
      const th = .4 * Math.sin(psi) * wk + (s ? st : -st) * (1 - wk) + (o.legLean || 0);
      const bend = .8 * Math.max(0, Math.cos(psi + .5)) * wk + (o.knee || 0);
      const kn = [hip[0] + Math.sin(th) * .25, hip[1] + Math.cos(th) * .25], sa = th - bend;
      legs.push({ kn, an: [kn[0] + Math.sin(sa) * .25, kn[1] + Math.cos(sa) * .25], sa });
    }
    const drop = -.022 - Math.max(legs[0].an[1], legs[1].an[1]);
    hip = [hip[0], hip[1] + drop]; legs.forEach(l => { l.kn[1] += drop; l.an[1] += drop; });
    const cl = Math.cos(lean), sl = Math.sin(lean);
    const B = (bx, by) => [hip[0] + bx * cl - by * sl, hip[1] + bx * sl + by * cl];
    const tw = o.width || .2, coat = o.coat === 'short' ? .045 : (o.coat === 'none' ? .0 : .2);
    const sh = B(.005, -.29), L1 = .165, L2 = .172;
    let arms;
    if (o.arms === 'swing' || (o.arms == null && ph != null)) {
      arms = [0, 1].map(s => { const psi = (ph || 0) + s * Math.PI, a = -.45 * Math.sin(psi) * wk + lean, e = [sh[0] + Math.sin(a) * L1, sh[1] + Math.cos(a) * L1], a2 = a + .25 + .25 * wk * Math.max(0, -Math.sin(psi));
        return [e, [e[0] + Math.sin(a2) * L2, e[1] + Math.cos(a2) * L2]]; });
    } else {
      const pre = ARMS[o.arms] || ARMS.down;
      arms = [0, 1].map(s => { const t = (o.hands && o.hands[s]) || pre[s]; let tp = B(t[0], t[1]);
        if (s === 0 && o.handAbs) tp = [(o.handAbs[0] - x) / (h * d), (o.handAbs[1] - y) / h];
        if (s === 1 && o.handAbs2) tp = [(o.handAbs2[0] - x) / (h * d), (o.handAbs2[1] - y) / h];
        return ik(sh[0], sh[1], tp[0], tp[1], L1, L2, t[2] != null ? t[2] : 1); });
    }
    const hc = B(.014 + (o.headX || 0), -.43 + (o.headY || 0));
    const Wp = q => [x + q[0] * h * d, y + q[1] * h];
    const draw = (col, ox, oy) => {
      c.fillStyle = col; c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round';
      const M = q => { const w = Wp(q); return [w[0] + ox, w[1] + oy]; };
      const line = (pts, lw) => { c.lineWidth = lw * h; c.beginPath(); pts.forEach((q, i) => { const m = M(q); i ? c.lineTo(m[0], m[1]) : c.moveTo(m[0], m[1]); }); c.stroke(); };
      legs.forEach(l => { line([hip, l.kn, l.an], .074); line([l.an, [l.an[0] + Math.cos(l.sa) * .07, l.an[1] - Math.sin(l.sa) * .07 + .004]], .042); });
      const T = [[-tw * .42, .03], [-tw * .4, -.1], [-tw * .5, -.245], [-tw * .32, -.305], [-.02, -.335], [.03, -.335], [tw * .34, -.305], [tw * .52, -.245], [tw * .47, -.15], [tw * .43, -.05], [tw * .45, .03]];
      const hem = coat > .02 ? [[tw * .5 + .012, coat], [-tw * .5 - .012, coat]] : [];
      c.beginPath(); [...T, ...hem].forEach((q, i) => { const m = M(B(q[0], q[1])); i ? c.lineTo(m[0], m[1]) : c.moveTo(m[0], m[1]); }); c.closePath(); c.fill();
      line([B(.005, -.32), B(.012, -.38)], .055);
      const hm = M(hc); c.beginPath(); c.ellipse(hm[0], hm[1], .052 * h, .066 * h, lean * d, 0, TAU); c.fill();
      arms.forEach(([e, hn]) => { line([sh, e, hn], .056); const m = M(hn); c.beginPath(); c.arc(m[0], m[1], .03 * h, 0, TAU); c.fill(); });
      if (o.hat) {
        const Hp = (ox2, oy2) => M([hc[0] + ox2 * cl - oy2 * sl, hc[1] + ox2 * sl + oy2 * cl]);
        const P = pts => { c.beginPath(); pts.forEach((q, i) => { const m = Hp(q[0], q[1]); i ? c.lineTo(m[0], m[1]) : c.moveTo(m[0], m[1]); }); c.closePath(); c.fill(); };
        if (o.hat === 'cap') { P([[-.054, -.03], [-.062, -.095], [.066, -.101], [.058, -.03]]); P([[.02, -.042], [.118, -.03], [.112, -.02], [.02, -.024]]); }
        else if (o.hat === 'brim') { P([[-.05, -.04], [-.044, -.11], [.048, -.112], [.055, -.04]]); P([[-.1, -.038], [.105, -.042], [.1, -.03], [-.096, -.026]]); }
        else if (o.hat === 'hood') { const m = Hp(-.006, -.004); c.beginPath(); c.ellipse(m[0], m[1], .068 * h, .08 * h, lean * d, 0, TAU); c.fill(); }
      }
    };
    if (!o.dry) { c.save(); if (o.alpha != null) c.globalAlpha *= o.alpha;
      const rims = o.rim ? (Array.isArray(o.rim) ? o.rim : [o.rim]) : [];
      for (const r of rims) { if (!r || !r.col) continue; const w = (r.w || .011) * h; draw(r.col, (r.side || 1) * w, -w * .35); }
      draw(o.color || '#05070a', 0, 0);
      c.restore(); }
    return { hand: Wp(arms[0][1]), elbow: Wp(arms[0][0]), hand2: Wp(arms[1][1]), head: Wp(hc), back: Wp(B(-.09, -.16)), hip: Wp(hip), shoulder: Wp(sh) };
  }
  // Silhouette von hinten (symmetrisch). arms: Mischung {down, behind, up, hands} (Gewichte), lean 0..1 (beugt sich nach vorn/weg),
  // stance (Beinabstand), coat 'long', color, armCol (etwas heller, damit Arme vor dem Rücken lesbar sind), rim wie person(), cuffs
  const BACK_ARMS = { down: [[.152, -.63], [.15, -.47]], behind: [[.175, -.6], [.03, -.5]], up: [[.24, -.8], [.27, -.95]], hands: [[.2, -.69], [.16, -.84]] };
  function personBack(c, x, y, h, o = {}) {
    const k = clamp(o.lean || 0), st = o.stance != null ? o.stance : .05, sway = o.sway || 0;
    const shY = -.785 + .07 * k, hdY = -.905 + .115 * k, nkY = -.835 + .08 * k;
    const mix = o.arms || { down: 1 }; let el = [0, 0], hn = [0, 0], tot = 0;
    for (const key in mix) { const w = mix[key], a = BACK_ARMS[key]; if (!a || !w) continue; el[0] += a[0][0] * w; el[1] += a[0][1] * w; hn[0] += a[1][0] * w; hn[1] += a[1][1] * w; tot += w; }
    if (tot <= 0) { el = BACK_ARMS.down[0]; hn = BACK_ARMS.down[1]; } else { el = [el[0] / tot, el[1] / tot + .03 * k]; hn = [hn[0] / tot, hn[1] / tot + .015 * k]; }
    const P = (px, py) => [x + (px + (py < -.5 ? sway * (-.5 - py) : 0)) * h, y + py * h];
    const draw = (col, ox, oy, armCol) => {
      c.lineCap = 'round'; c.lineJoin = 'round';
      const M = q => { const m = P(q[0], q[1]); return [m[0] + ox, m[1] + oy]; };
      const line = (pts, lw, cl) => { c.strokeStyle = cl; c.lineWidth = lw * h; c.beginPath(); pts.forEach((q, i) => { const m = M(q); i ? c.lineTo(m[0], m[1]) : c.moveTo(m[0], m[1]); }); c.stroke(); };
      c.fillStyle = col;
      for (const s of [-1, 1]) { line([[s * .05, -.49], [s * (.058 + st * .55), -.26], [s * (.06 + st), -.03]], .08, col); const f = M([s * (.068 + st), -.016]); c.beginPath(); c.ellipse(f[0], f[1], .04 * h, .019 * h, 0, 0, TAU); c.fill(); }
      const hem = o.coat === 'long' ? -.27 : -.44;
      const T = [[-.097, -.47], [-.09, -.6], [-.118, shY + .075], [-.13, shY + .02], [-.105, shY - .012], [-.036, nkY], [.036, nkY], [.105, shY - .012], [.13, shY + .02], [.118, shY + .075], [.09, -.6], [.097, -.47], [.112, hem], [-.112, hem]];
      c.beginPath(); T.forEach((q, i) => { const m = M(q); i ? c.lineTo(m[0], m[1]) : c.moveTo(m[0], m[1]); }); c.closePath(); c.fill();
      line([[0, nkY + .015], [0, hdY + .035]], .062, col);
      const hm = M([0, hdY]); c.beginPath(); c.ellipse(hm[0], hm[1], .056 * h, .067 * h, 0, 0, TAU); c.fill();
      if (o.hat === 'cap') { c.beginPath(); const a = M([-.062, hdY - .035]), b2 = M([.062, hdY - .035]), t1 = M([.07, hdY - .1]), t0 = M([-.07, hdY - .1]); c.moveTo(...a); c.lineTo(...b2); c.lineTo(...t1); c.lineTo(...t0); c.closePath(); c.fill(); }
      for (const s of [-1, 1]) { const ac = armCol || col; line([[s * .118, shY + .03], [s * el[0], el[1]], [s * hn[0], hn[1]]], .06, ac); c.fillStyle = ac; const m = M([s * hn[0], hn[1]]); c.beginPath(); c.arc(m[0], m[1], .03 * h, 0, TAU); c.fill(); c.fillStyle = col; }
    };
    c.save(); if (o.alpha != null) c.globalAlpha *= o.alpha;
    const rims = o.rim ? (Array.isArray(o.rim) ? o.rim : [o.rim]) : [];
    for (const r of rims) { if (!r || !r.col) continue; const w = (r.w || .009) * h; draw(r.col, (r.side || 1) * w, -w * .35); }
    draw(o.color || '#05070a', 0, 0, o.armCol);
    if (o.cuffs) { const m = P(0, hn[1]); c.strokeStyle = `rgba(205,215,230,${.85 * o.cuffs})`; c.lineWidth = .012 * h; c.beginPath(); c.moveTo(m[0] - .035 * h, m[1] - .004 * h); c.lineTo(m[0] + .035 * h, m[1] + .004 * h); c.stroke(); }
    c.restore();
    return { shoulderL: P(-.12, shY + .03), shoulderR: P(.12, shY + .03), elbowL: P(-el[0], el[1]), elbowR: P(el[0], el[1]), hands: P(0, hn[1]), back: P(0, -.62), head: P(0, hdY) };
  }
  // Figur-Parameter → Zustand {x, y, h, dir, phase, walkAmt, a}
  function figState(f, lt, def) {
    if (!f) return null; const at = tv(f.at, 0), until = tv(f.until), fade = num(f.fade, .35);
    if (lt < at) return null; if (until != null && lt >= until + fade) return null;
    let a = fade > 0 ? clamp(prog(lt, at, at + fade)) : 1; if (until != null && lt > until) a *= 1 - clamp((lt - until) / Math.max(.01, fade));
    const h = num(f.h, def.h) * H, y = num(f.y, def.y) * H, x0 = num(f.x, def.x) * W; let dir = f.flip ? -1 : 1;
    const X = t => { if (Array.isArray(f.move)) { const [t0, t1, tx] = f.move; return lerp(x0, num(tx, .5) * W, E.inOut(prog(t, t0, t1))); }
      if (f.pose === 'walk') return x0 + (f.flip ? -1 : 1) * num(f.speed, .03) * W * Math.max(0, t - at); return x0; };
    const x = X(lt);
    if (Array.isArray(f.move) && num(f.move[2], .5) * W !== x0) dir = num(f.move[2], .5) * W > x0 ? 1 : -1;
    const v = Math.abs(X(lt + .05) - X(lt - .05)) / .1, walkAmt = clamp(v / (h * .45));
    const phase = walkAmt > .02 ? Math.abs(x - x0) / (h * .8) * TAU : null;
    return { x, y, h, dir, phase, walkAmt, a, f };
  }
  // ---------- Auto im Profil ----------
  // x = Mitte, y = Boden, L = Länge px. o: dir, color, head (0..1), tail (0..1), police: [r,b], wheel (Drehwinkel), snow
  function car(c, x, y, L, o = {}) {
    const d = o.dir || 1, P = (u, v) => [x + u * L * d, y + v * L];
    const path = pts => { c.beginPath(); pts.forEach((q, i) => { const m = P(q[0], q[1]); i ? c.lineTo(m[0], m[1]) : c.moveTo(m[0], m[1]); }); c.closePath(); };
    c.save();
    // Schatten unter dem Auto
    c.fillStyle = 'rgba(0,0,0,.55)'; c.beginPath(); c.ellipse(x, y - 2, L * .52, L * .018, 0, 0, TAU); c.fill();
    const body = [[.5, -.05], [.507, -.1], [.497, -.152], [.47, -.172], [.22, -.188], [.17, -.193], [.07, -.262], [-.16, -.268], [-.26, -.2], [-.46, -.196], [-.497, -.178], [-.507, -.11], [-.5, -.05]];
    c.fillStyle = o.color || '#0b0e14'; path(body); c.fill();
    if (o.police) { c.fillStyle = o.panel || '#3a414b'; path([[.17, -.168], [-.255, -.172], [-.255, -.072], [.17, -.072]]); c.fill();
      c.fillStyle = 'rgba(0,0,0,.35)'; path([[.17, -.1], [-.255, -.1], [-.255, -.072], [.17, -.072]]); c.fill(); }
    // obere Kante leicht heller (Himmelsreflex)
    c.strokeStyle = 'rgba(150,165,190,.16)'; c.lineWidth = Math.max(1.5, L * .004); c.beginPath(); const s0 = P(.47, -.172), s1 = P(.17, -.192), s2 = P(.07, -.262), s3 = P(-.16, -.268), s4 = P(-.26, -.2), s5 = P(-.46, -.196);
    c.moveTo(...s0); c.lineTo(...s1); c.lineTo(...s2); c.lineTo(...s3); c.lineTo(...s4); c.lineTo(...s5); c.stroke();
    // Fenster
    c.fillStyle = o.glass || '#121821'; path([[.152, -.19], [.065, -.254], [-.152, -.259], [-.24, -.199]]); c.fill();
    c.fillStyle = 'rgba(150,170,200,.1)'; path([[.11, -.19], [.06, -.24], [.0, -.24], [.04, -.19]]); c.fill();
    c.fillStyle = o.color || '#0b0e14'; path([[-.045, -.19], [-.03, -.26], [-.055, -.26], [-.07, -.19]]); c.fill();
    // Zierleiste, Stoßstangen, Türfugen
    c.strokeStyle = 'rgba(120,135,155,.35)'; c.lineWidth = Math.max(1.5, L * .0035); c.beginPath(); c.moveTo(...P(.48, -.135)); c.lineTo(...P(-.49, -.14)); c.stroke();
    c.fillStyle = '#2e343d'; path([[.47, -.09], [.509, -.09], [.509, -.064], [.47, -.064]]); c.fill(); path([[-.47, -.094], [-.509, -.094], [-.509, -.066], [-.47, -.066]]); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = Math.max(1, L * .0025); c.beginPath(); for (const u of [.165, -.05, -.255]) { c.moveTo(...P(u, -.185)); c.lineTo(...P(u, -.06)); } c.stroke();
    // Räder
    for (const wu of [.31, -.3]) { const w = P(wu, -.066); c.fillStyle = '#020304'; c.beginPath(); c.arc(w[0], w[1], .079 * L, Math.PI, TAU); c.fill();
      c.fillStyle = '#060709'; c.beginPath(); c.arc(w[0], w[1], .066 * L, 0, TAU); c.fill();
      c.fillStyle = '#2a3039'; c.beginPath(); c.arc(w[0], w[1], .033 * L, 0, TAU); c.fill();
      c.strokeStyle = '#11151b'; c.lineWidth = L * .006; c.beginPath(); for (let k = 0; k < 3; k++) { const a = (o.wheel || 0) * d + k * TAU / 3; c.moveTo(w[0], w[1]); c.lineTo(w[0] + Math.cos(a) * .03 * L, w[1] + Math.sin(a) * .03 * L); } c.stroke(); }
    // Lichter
    const hl = o.head || 0, tl = o.tail || 0;
    c.fillStyle = hl > .05 ? `rgba(245,242,230,${.4 + .6 * hl})` : '#262b33'; { const m = P(.497, -.131); c.beginPath(); c.ellipse(m[0], m[1], L * .011, L * .012, 0, 0, TAU); c.fill(); }
    c.fillStyle = tl > .05 ? `rgba(255,${40 + 30 * tl},${40 + 20 * tl},${.5 + .5 * tl})` : '#2a0c0e'; path([[-.49, -.155], [-.508, -.155], [-.508, -.122], [-.49, -.122]]); c.fill();
    if (o.snow) { c.fillStyle = '#5b636f'; path([[.065, -.262], [-.155, -.268], [-.15, -.276], [.06, -.27]]); c.fill(); path([[.47, -.172], [.2, -.188], [.2, -.194], [.46, -.178]]); c.fill(); }
    let ret = { head: P(.505, -.13), tail: P(-.505, -.138), barR: P(-.085, -.281), barB: P(.0, -.281), roof: P(-.04, -.27) };
    if (o.police) {
      const [r, b] = o.police;
      c.fillStyle = '#15191f'; path([[-.135, -.268], [.05, -.268], [.045, -.292], [-.13, -.292]]); c.fill();
      c.fillStyle = `rgb(${70 + 185 * r | 0},${18 + 70 * r * r | 0},${18 + 60 * r * r | 0})`; path([[-.125, -.272], [-.045, -.272], [-.045, -.289], [-.125, -.289]]); c.fill();
      c.fillStyle = `rgb(${25 + 90 * b * b | 0},${45 + 120 * b | 0},${110 + 145 * b | 0})`; path([[-.035, -.272], [.04, -.272], [.04, -.289], [-.035, -.289]]); c.fill();
      if (o.label !== false) { const m = P(-.04, -.112); const fs = Math.round(L * .036); txt(c, o.label || 'POLICE', m[0], m[1], `700 ${fs}px Oswald`, 'rgba(10,13,18,.85)', 'center', 'middle', Math.round(fs * .12)); }
    }
    c.restore();
    return ret;
  }
  function carState(q, lt, def) { // Auto fährt ein (at), hält bei x, fährt optional weg (leave)
    if (!q) return null; const X = num(q.x, def.x) * W, from = q.from || def.from || 'right', at = tv(q.at), dur = num(q.dur, 2.6);
    const sx = from === 'left' ? -PAD - 700 : W + PAD + 700; let dir = q.dir || (from === 'left' ? 1 : -1);
    const pos = t => { let x = X; if (at != null) { if (t < at) return sx; x = lerp(sx, X, E.out(prog(t, at, at + dur))); }
      const lv = tv(q.leave); if (lv != null && t > lv) x = lerp(X, X + dir * (W + 2 * PAD + 800), E.in(prog(t, lv, lv + 2.6))); return x; };
    const x = pos(lt), v = (pos(lt + .04) - pos(lt - .04)) / .08;
    if (at != null && lt < at) return null;
    const braking = at != null && lt > at + dur * .35 && lt < at + dur + .3;
    return { x, v, dir, braking, wheel: x / (num(q.L, def.L) * .033) };
  }

  // ---------- Häuser (Haus von außen) ----------
  function siding(g, x, y, w, h, base, step = 15) {
    g.fillStyle = base; g.fillRect(x, y, w, h);
    g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 2; g.beginPath(); for (let yy = y + step; yy < y + h; yy += step) { g.moveTo(x, yy); g.lineTo(x + w, yy); } g.stroke();
    g.strokeStyle = 'rgba(200,215,235,.03)'; g.beginPath(); for (let yy = y + step + 2; yy < y + h; yy += step) { g.moveTo(x, yy); g.lineTo(x + w, yy); } g.stroke();
  }
  function brick(g, x, y, w, h, base) {
    g.fillStyle = base; g.fillRect(x, y, w, h); let r = 0;
    for (let yy = y; yy < y + h; yy += 11, r++) for (let xx = x - (r % 2) * 15; xx < x + w; xx += 30) { const v = rnd(xx * .13 + yy * .7, 5); if (v > .55) { g.fillStyle = v > .8 ? 'rgba(255,190,180,.035)' : 'rgba(0,0,0,.12)'; g.fillRect(Math.max(x, xx), yy, Math.min(29, x + w - Math.max(x, xx)), Math.min(10, y + h - yy)); } }
    g.strokeStyle = 'rgba(0,0,0,.38)'; g.lineWidth = 1.6; g.beginPath(); r = 0;
    for (let yy = y; yy < y + h; yy += 11, r++) { g.moveTo(x, yy); g.lineTo(x + w, yy); for (let xx = x + (r % 2) * 15; xx < x + w; xx += 30) { g.moveTo(xx, yy); g.lineTo(xx, Math.min(y + h, yy + 11)); } }
    g.stroke();
  }
  function roofPoly(g, pts, col, snow) {
    g.fillStyle = snow ? '#4b535f' : col; poly(g, pts); g.fill();
    g.save(); poly(g, pts); g.clip(); const ys = pts.map(q => q[1]), y0 = Math.min(...ys), y1 = Math.max(...ys);
    g.strokeStyle = snow ? 'rgba(255,255,255,.05)' : 'rgba(190,205,230,.035)'; g.lineWidth = 2; g.beginPath(); for (let y = y0 + 10; y < y1; y += 16) { g.moveTo(-PAD, y); g.lineTo(W + PAD, y); } g.stroke();
    if (snow) { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(225,232,242,.25)'); gr.addColorStop(1, 'rgba(0,0,0,.18)'); g.fillStyle = gr; g.fillRect(-PAD, y0, LW, y1 - y0); }
    else { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(120,140,170,.07)'); gr.addColorStop(1, 'rgba(0,0,0,.2)'); g.fillStyle = gr; g.fillRect(-PAD, y0, LW, y1 - y0); }
    g.restore();
  }
  function mullions(g, w, col) { g.fillStyle = col; const n = w.panes || 2; for (let i = 1; i < n; i++) g.fillRect(w.x + w.w * i / n - 3, w.y, 6, w.h); if (!w.noBar) g.fillRect(w.x, w.y + w.h * .5 - 3, w.w, 6); }
  function winDark(g, w) {
    if (w.sh) { g.fillStyle = '#0f1319'; g.fillRect(w.x - 34, w.y - 4, 26, w.h + 8); g.fillRect(w.x + w.w + 8, w.y - 4, 26, w.h + 8);
      g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 2; g.beginPath(); for (let yy = w.y + 4; yy < w.y + w.h; yy += 8) { g.moveTo(w.x - 31, yy); g.lineTo(w.x - 11, yy); g.moveTo(w.x + w.w + 11, yy); g.lineTo(w.x + w.w + 31, yy); } g.stroke(); }
    g.fillStyle = '#2b323c'; g.fillRect(w.x - 7, w.y - 7, w.w + 14, w.h + 14);
    const gr = g.createLinearGradient(w.x, w.y, w.x + w.w * .7, w.y + w.h); gr.addColorStop(0, '#18202b'); gr.addColorStop(.55, '#090c12'); gr.addColorStop(1, '#0c1017'); g.fillStyle = gr; g.fillRect(w.x, w.y, w.w, w.h);
    g.fillStyle = 'rgba(130,150,180,.07)'; poly(g, [[w.x, w.y + w.h * .25], [w.x + w.w * .35, w.y], [w.x + w.w * .55, w.y], [w.x, w.y + w.h * .6]]); g.fill();
    g.fillStyle = 'rgba(20,22,28,.9)'; g.fillRect(w.x + 2, w.y + 2, w.w * .2, w.h - 4); g.fillRect(w.x + w.w * .8 - 2, w.y + 2, w.w * .2, w.h - 4); // Vorhänge
    mullions(g, w, '#272e38');
    g.fillStyle = '#353d48'; g.fillRect(w.x - 12, w.y + w.h + 6, w.w + 24, 8);
  }
  function winLit(c, w, k, kind, lt, gt, pass) { // beleuchtetes Fenster (Overlay)
    if (k <= 0) return;
    let core, edge;
    if (kind === 'red') { core = [255, 64, 50]; edge = [120, 12, 12]; }
    else if (kind === 'tv') { const f = .55 + .45 * (noise(Math.floor(gt * 6) * .9, w.x) * .5 + .5); core = [110 + 80 * f | 0, 140 + 70 * f | 0, 230 + 25 * f | 0]; edge = [25, 38, 80]; }
    else { core = [255, 200, 128]; edge = [160, 84, 34]; }
    c.save(); c.beginPath(); c.rect(w.x, w.y, w.w, w.h); c.clip();
    const g = c.createRadialGradient(w.x + w.w / 2, w.y + w.h * .8, 0, w.x + w.w / 2, w.y + w.h * .6, Math.max(w.w, w.h) * .85);
    g.addColorStop(0, `rgba(${core},${k})`); g.addColorStop(1, `rgba(${edge},${k})`); c.fillStyle = g; c.fillRect(w.x, w.y, w.w, w.h);
    // Gardine: dünne Falten + seitliche Vorhänge
    c.strokeStyle = `rgba(${edge.map(v => v * .7 | 0)},${.35 * k})`; c.lineWidth = 2; c.beginPath(); for (let xx = w.x + 6; xx < w.x + w.w; xx += 9) { c.moveTo(xx, w.y); c.lineTo(xx + 2, w.y + w.h); } c.stroke();
    c.fillStyle = `rgba(${edge.map(v => v * .5 | 0)},${.9 * k})`;
    for (const sd of [0, 1]) { const x0 = sd ? w.x + w.w : w.x, ww = w.w * .22 * (sd ? -1 : 1); c.beginPath(); c.moveTo(x0, w.y); c.lineTo(x0 + ww, w.y); c.quadraticCurveTo(x0 + ww * .7, w.y + w.h * .5, x0 + ww * 1.15, w.y + w.h); c.lineTo(x0, w.y + w.h); c.closePath(); c.fill(); }
    if (pass != null && lt >= pass && lt < pass + 1.7) { // Schatten zieht hinter der Gardine vorbei
      const u = E.inOut((lt - pass) / 1.7), sx = lerp(w.x - w.w * .35, w.x + w.w * 1.35, u), hh = w.h * 1.1;
      c.fillStyle = `rgba(14,8,6,${.82 * k})`; c.beginPath(); c.ellipse(sx, w.y + w.h - hh * .62, hh * .14, hh * .17, 0, 0, TAU); c.fill();
      c.beginPath(); c.ellipse(sx, w.y + w.h + hh * .05, hh * .36, hh * .46, 0, Math.PI, TAU); c.fill(); }
    mullions(c, w, 'rgba(26,22,20,.92)');
    c.restore();
  }
  function doorDraw(g, dr, col = '#141920') {
    g.fillStyle = '#2b323c'; g.fillRect(dr.x - 9, dr.y - 9, dr.w + 18, dr.h + 9);
    g.fillStyle = col; g.fillRect(dr.x, dr.y, dr.w, dr.h);
    g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 3; g.strokeRect(dr.x + 12, dr.y + dr.h * .45, dr.w - 24, dr.h * .45);
    g.fillStyle = '#0a0d12'; for (let i = 0; i < 3; i++) g.fillRect(dr.x + 14 + i * (dr.w - 28) / 3 + 2, dr.y + 16 + i * 14, (dr.w - 28) / 3 - 4, 30);
    g.fillStyle = '#5a5f66'; g.beginPath(); g.arc(dr.x + dr.w - 14, dr.y + dr.h * .55, 4, 0, TAU); g.fill();
  }
  function bush(g, x, y, r, snow) {
    for (let i = 0; i < 5; i++) { const bx = x + (i - 2) * r * .5, by = y - r * (.5 + .35 * Math.sin(i * 1.3 + 1)), br = r * (.55 + .25 * rnd(i + x, 3));
      g.fillStyle = i % 2 ? '#080b0e' : '#0a0e11'; g.beginPath(); g.arc(bx, by, br, 0, TAU); g.fill();
      if (snow) { g.fillStyle = 'rgba(160,170,185,.45)'; g.beginPath(); g.ellipse(bx, by - br * .55, br * .7, br * .3, 0, Math.PI, TAU); g.fill(); } }
  }
  function plate(g, x, y, s, fs) { // Hausnummernschild
    if (!s) return; g.font = `600 ${fs}px Oswald`; g.letterSpacing = '3px'; const tw = g.measureText(s).width; g.letterSpacing = '0px';
    const w = Math.max(fs * 1.6, tw + fs * .8), h = fs * 1.3;
    rr(g, x - w / 2 - 3, y - h / 2 - 3, w + 6, h + 6, 6); g.fillStyle = '#3c434e'; g.fill();
    rr(g, x - w / 2, y - h / 2, w, h, 5); g.fillStyle = '#0c0f14'; g.fill();
    txt(g, s, x, y + fs * .04, `600 ${fs}px Oswald`, '#e9ebef', 'center', 'middle', 3);
  }
  function porchLamp(g, x, y) { g.fillStyle = '#20252d'; g.fillRect(x - 5, y - 4, 10, 30); g.fillStyle = '#3a3226'; rr(g, x - 10, y - 18, 20, 30, 4); g.fill(); }
  const HOUSE = {
    ranch: {
      gy: 1130, focus: [560, 1010], nb: [[-250, 60, 1102], null],
      wins: [{ x: 140, y: 952, w: 108, h: 82, sh: 1 }, { x: 292, y: 952, w: 108, h: 82, sh: 1 }, { x: 428, y: 936, w: 172, h: 108, panes: 3, noBar: 1 }],
      door: { x: 632, y: 926, w: 84, h: 204 }, porch: [778, 950], plate: [778, 1018, 40], walk: [632, 716], drive: [862, 1062], lit: [2, 0],
      draw(g, o) {
        const GY = this.gy, sn = o.snow;
        siding(g, 830, 896, 262, GY - 896, '#171c24'); siding(g, 100, 886, 730, GY - 886, '#1c222b');
        brick(g, 100, 1050, 730, GY - 1050, '#251b1d'); g.fillStyle = '#2d343e'; g.fillRect(100, 1045, 730, 6);
        g.fillStyle = '#1e242d'; g.fillRect(862, 936, 200, GY - 936); g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 3;
        g.beginPath(); for (let k = 1; k < 4; k++) { g.moveTo(862, 936 + k * 48.5); g.lineTo(1062, 936 + k * 48.5); } g.stroke();
        g.fillStyle = '#0b0e13'; for (let k = 0; k < 4; k++) g.fillRect(874 + k * 48, 950, 36, 18);
        g.fillStyle = '#2b323c'; g.fillRect(854, 928, 216, 9);
        roofPoly(g, [[64, 896], [292, 748], [884, 748], [1124, 896]], '#151a22', sn);
        g.strokeStyle = sn ? '#c3cad4' : '#2a313b'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(64, 894); g.lineTo(292, 748); g.lineTo(884, 748); g.lineTo(1124, 894); g.stroke();
        brick(g, 340, 694, 48, 84, '#211819'); g.fillStyle = '#2a2f37'; g.fillRect(334, 688, 60, 9);
        g.fillStyle = sn ? '#9aa3b0' : '#272d36'; g.fillRect(60, 884, 1068, 14); if (sn) { g.fillStyle = '#c7ced8'; g.fillRect(60, 880, 1068, 5); }
        const sg = g.createLinearGradient(0, 898, 0, 965); sg.addColorStop(0, 'rgba(0,0,0,.6)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sg; g.fillRect(100, 898, 992, 67);
        this.wins.forEach(w => winDark(g, w)); doorDraw(g, this.door);
        porchLamp(g, this.porch[0], this.porch[1]);
        bush(g, 195, GY + 4, 46, sn); bush(g, 345, GY + 4, 44, sn); bush(g, 520, GY + 2, 36, sn); bush(g, 800, GY + 4, 30, sn);
      },
    },
    suburb: {
      gy: 1130, focus: [560, 990], nb: [[-260, 120, 1100], [975, 1320, 1098]],
      wins: [{ x: 330, y: 790, w: 64, h: 72, noBar: 1 }, { x: 688, y: 790, w: 64, h: 72, noBar: 1 }, { x: 218, y: 962, w: 110, h: 96, sh: 1 }, { x: 398, y: 962, w: 110, h: 96, sh: 1 }, { x: 760, y: 962, w: 104, h: 96, sh: 1 }],
      door: { x: 562, y: 930, w: 84, h: 200 }, porch: [672, 966], plate: [705, 1016, 34], walk: [562, 646], drive: null, lit: [3, 1],
      draw(g, o) {
        const GY = this.gy, sn = o.snow;
        siding(g, 170, 900, 740, GY - 900, '#1d232d', 13);
        roofPoly(g, [[140, 912], [190, 690], [890, 690], [940, 912]], '#141920', sn);
        g.strokeStyle = sn ? '#c3cad4' : '#2a313b'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(140, 910); g.lineTo(190, 690); g.lineTo(890, 690); g.lineTo(940, 910); g.stroke();
        brick(g, 214, 610, 54, 100, '#211819'); g.fillStyle = '#2a2f37'; g.fillRect(208, 604, 66, 9);
        for (const dx of [300, 658]) { // Gauben
          siding(g, dx, 770, 124, 112, '#1b212a', 12);
          roofPoly(g, [[dx - 14, 778], [dx + 62, 716], [dx + 138, 778]], '#0b0e13', sn);
          g.fillStyle = sn ? '#9aa3b0' : '#262c35'; poly(g, [[dx - 16, 778], [dx + 62, 714], [dx + 140, 778], [dx + 132, 784], [dx + 62, 724], [dx - 8, 784]]); g.fill();
        }
        g.fillStyle = sn ? '#9aa3b0' : '#272d36'; g.fillRect(136, 905, 808, 12);
        const sg = g.createLinearGradient(0, 916, 0, 975); sg.addColorStop(0, 'rgba(0,0,0,.55)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sg; g.fillRect(170, 916, 740, 60);
        this.wins.forEach(w => winDark(g, w)); doorDraw(g, this.door, '#1a1214');
        g.fillStyle = '#262c35'; g.fillRect(540, 916, 128, 12);
        porchLamp(g, this.porch[0], this.porch[1]);
        bush(g, 270, GY + 4, 44, sn); bush(g, 455, GY + 4, 42, sn); bush(g, 810, GY + 4, 44, sn);
      },
    },
    twostory: {
      gy: 1130, focus: [540, 940], nb: [[-250, 200, 1098], [890, 1320, 1096]],
      wins: [{ x: 508, y: 566, w: 64, h: 64, noBar: 1 }, { x: 300, y: 754, w: 82, h: 104 }, { x: 499, y: 754, w: 82, h: 104 }, { x: 698, y: 754, w: 82, h: 104 }, { x: 296, y: 974, w: 112, h: 100, sh: 1 }, { x: 672, y: 974, w: 112, h: 100, sh: 1 }],
      door: { x: 500, y: 962, w: 80, h: 168 }, porch: [470, 990], plate: [625, 1012, 30], walk: [500, 580], drive: null, lit: [2, 4],
      draw(g, o) {
        const GY = this.gy, sn = o.snow;
        siding(g, 250, 700, 580, GY - 700, '#1c222b', 15);
        siding(g, 268, 712, 544, 0, '#1c222b');
        g.fillStyle = '#1a2029'; poly(g, [[262, 712], [540, 492], [818, 712]]); g.fill();
        g.save(); poly(g, [[262, 712], [540, 492], [818, 712]]); g.clip(); siding(g, 250, 480, 580, 240, '#1a2029', 15); g.restore();
        g.fillStyle = sn ? '#59616d' : '#141920'; poly(g, [[212, 716], [540, 452], [868, 716], [826, 716], [540, 490], [254, 716]]); g.fill();
        g.strokeStyle = sn ? '#c3cad4' : '#2a313b'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(212, 716); g.lineTo(540, 452); g.lineTo(868, 716); g.stroke();
        if (sn) { g.fillStyle = '#b8c0cb'; poly(g, [[212, 716], [540, 452], [868, 716], [858, 716], [540, 462], [222, 716]]); g.fill(); }
        g.fillStyle = '#272d36'; g.fillRect(236, 708, 608, 10);
        const sg = g.createLinearGradient(0, 718, 0, 770); sg.addColorStop(0, 'rgba(0,0,0,.5)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sg; g.fillRect(250, 718, 580, 52);
        this.wins.forEach(w => winDark(g, w));
        // Veranda
        const pg = g.createLinearGradient(0, 935, 0, 1130); pg.addColorStop(0, 'rgba(0,0,0,.55)'); pg.addColorStop(1, 'rgba(0,0,0,.15)'); g.fillStyle = pg; g.fillRect(250, 935, 580, 195);
        doorDraw(g, this.door, '#16131a');
        g.fillStyle = sn ? '#6a727e' : '#10141a'; poly(g, [[222, 942], [240, 906], [840, 906], [858, 942]]); g.fill(); if (sn) { g.fillStyle = '#b8c0cb'; g.fillRect(238, 902, 604, 6); }
        g.fillStyle = '#2a313b'; g.fillRect(222, 940, 636, 8);
        g.fillStyle = '#262c35'; for (const px of [244, 444, 622, 822]) g.fillRect(px, 948, 16, GY - 948);
        g.fillStyle = '#1f252d'; g.fillRect(230, 1112, 620, 20);
        g.strokeStyle = '#232a33'; g.lineWidth = 6; g.beginPath(); for (const [a, bb] of [[260, 444], [638, 822]]) { g.moveTo(a, 1062); g.lineTo(bb, 1062); } g.stroke();
        g.lineWidth = 4; g.beginPath(); for (const [a, bb] of [[260, 444], [638, 822]]) for (let xx = a + 14; xx < bb; xx += 18) { g.moveTo(xx, 1062); g.lineTo(xx, 1112); } g.stroke();
        porchLamp(g, this.porch[0], this.porch[1]);
        bush(g, 210, GY + 4, 40, sn); bush(g, 870, GY + 4, 40, sn);
      },
    },
  };
  function neighborHouse(g, x0, x1, gy, sn, seed) { // gedämpftes Nachbarhaus (weiter hinten)
    const w = x1 - x0, wt = gy - 128;
    siding(g, x0, wt, w, 128, '#12161d', 12);
    roofPoly(g, [[x0 - 26, wt + 6], [x0 + w * .22, wt - 86], [x1 - w * .22, wt - 86], [x1 + 26, wt + 6]], '#0a0c11', sn);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x0, wt, w, 128);
    for (let i = 0; i < 3; i++) { const wx = x0 + 30 + i * (w - 60) / 3, lit = rnd(i, seed) > .72;
      g.fillStyle = lit ? 'rgba(190,140,80,.45)' : '#0b0e13'; g.fillRect(wx, wt + 34, 52, 44); if (lit) spot(g, wx + 26, wt + 56, 90, 'rgba(255,170,90,A)', .08); }
  }
  function groundStreet(g, o) { // Rasen, Gehweg, Bordstein, Straße
    const sn = o.snow, GY = o.gy;
    const lg = g.createLinearGradient(0, GY, 0, 1290); lg.addColorStop(0, sn ? '#262c35' : '#0c1013'); lg.addColorStop(1, sn ? '#323943' : '#12171b'); g.fillStyle = lg; g.fillRect(-PAD, GY, LW, 1290 - GY);
    g.lineWidth = 2; for (let i = 0; i < 1800; i++) { const x = -PAD + rnd(i, 51) * LW, yv = rnd(i, 52), y = GY + 4 + yv * (1286 - GY), l = 3 + yv * 9;
      g.strokeStyle = sn ? `rgba(200,210,225,${.04 + .05 * rnd(i, 53)})` : (rnd(i, 54) > .5 ? 'rgba(70,80,72,.16)' : 'rgba(0,0,0,.25)'); g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd(i, 55) - .5) * 4, y - l); g.stroke(); }
    g.fillStyle = sn ? '#3f4651' : '#1d222a'; g.fillRect(-PAD, 1290, LW, 38);
    g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 2; g.beginPath(); for (let x = -PAD; x < W + PAD; x += 120) { g.moveTo(x, 1290); g.lineTo(x - (x - 540) * .06, 1328); } g.stroke();
    g.fillStyle = sn ? '#59616d' : '#2a3038'; g.fillRect(-PAD, 1328, LW, 8); g.fillStyle = sn ? '#2a3039' : '#15191f'; g.fillRect(-PAD, 1336, LW, 14);
    const sg = g.createLinearGradient(0, 1350, 0, H + PAD); sg.addColorStop(0, sn ? '#1d222a' : '#0d1016'); sg.addColorStop(1, sn ? '#14181e' : '#07090c'); g.fillStyle = sg; g.fillRect(-PAD, 1350, LW, H + PAD - 1350);
    for (let i = 0; i < 2200; i++) { g.fillStyle = rnd(i, 61) > .5 ? 'rgba(160,170,190,.045)' : 'rgba(0,0,0,.2)'; const y = 1352 + rnd(i, 62) * (H + PAD - 1352); g.fillRect(-PAD + rnd(i, 63) * LW, y, 2 + (y - 1350) / 400, 2); }
    if (sn) { g.fillStyle = 'rgba(0,0,0,.25)'; for (const ty of [1520, 1600, 1780, 1860]) g.fillRect(-PAD, ty, LW, 34); }
    g.fillStyle = sn ? 'rgba(120,110,70,.25)' : 'rgba(120,108,62,.28)'; for (let x = -PAD + 40; x < W + PAD; x += 230) g.fillRect(x, 1740, 130, 10);
  }

  // ---------- Polizei-Absperrband ----------
  function tapeSpr() {
    return sprite('tape', 2600, 48, (g, w, h) => {
      g.fillStyle = '#c9a42a'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(0, 0, w, 4); g.fillRect(0, h - 4, w, 4);
      g.font = '700 28px Oswald'; g.fillStyle = '#121212'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.letterSpacing = '3px';
      const s = 'POLICE LINE  ·  DO NOT CROSS'; let x = 24; while (x < w) { g.fillText(s, x, h / 2 + 1); x += g.measureText(s).width + 70; } g.letterSpacing = '0px';
    });
  }
  function drawTape(c, A, B, k, gt, seed, tint) {
    if (k <= 0) return; const spr = tapeSpr(), N = 30, L = Math.hypot(B[0] - A[0], B[1] - A[1]), ux = (B[0] - A[0]) / L, uy = (B[1] - A[1]) / L, nx = -uy, ny = ux;
    const vis = k * L, settle = 1 - k;
    const pt = s => { const u = s / L, wv = Math.sin(u * 13 - gt * 5.5 + seed) * (3 + 26 * settle * u) + Math.sin(u * 5 + gt * 1.7 + seed) * 5, sag = Math.sin(u * Math.PI) * 30 * (.4 + .6 * k);
      return [A[0] + ux * s + nx * wv, A[1] + uy * s + ny * wv + sag]; };
    for (let j = 0; j < N; j++) {
      const s0 = vis * j / N, s1 = vis * (j + 1) / N, p0 = pt(s0), p1 = pt(s1), ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]), sl = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
      const tw = .55 + .45 * Math.cos(s0 / L * 9 + gt * 2.4 + seed), th = 44 * Math.max(.12, Math.abs(tw));
      c.save(); c.translate(p0[0], p0[1]); c.rotate(ang); c.drawImage(spr, (s0 % 2500), 0, Math.max(1, s1 - s0), 48, 0, -th / 2, sl + 1.2, th);
      c.fillStyle = `rgba(0,0,0,${(1 - Math.abs(tw)) * .55 + .12})`; c.fillRect(0, -th / 2, sl + 1.2, th);
      if (tint) { c.globalCompositeOperation = 'lighter'; c.fillStyle = tint; c.fillRect(0, -th / 2, sl + 1.2, th); } c.restore();
    }
  }

  // ---------- Straßenlampe (Holzmast mit Peitschenleuchte) ----------
  function lampPost(c, px, base, top, headX, headY, lvl, snow) {
    c.fillStyle = '#161a20'; c.fillRect(px - 9, top, 18, base - top);
    c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(px + 2, top, 7, base - top);
    c.fillStyle = '#1b2027'; c.fillRect(px - 70, top + 26, 140, 10); // Querträger
    c.fillStyle = '#2f3540'; for (const ix of [-60, -30, 30, 60]) c.fillRect(px + ix - 3, top + 14, 6, 13);
    c.strokeStyle = '#262c35'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(px, headY + 2); c.quadraticCurveTo(px - 20, headY - 26, headX + 40, headY - 8); c.stroke();
    c.fillStyle = '#323843'; c.beginPath(); c.ellipse(headX + 6, headY - 4, 56, 16, -.05, 0, TAU); c.fill();
    if (snow) { c.strokeStyle = 'rgba(160,170,185,.8)'; c.lineWidth = 4; c.beginPath(); c.ellipse(headX + 6, headY - 6, 52, 13, -.05, Math.PI * 1.12, Math.PI * 1.88); c.stroke(); }
    c.fillStyle = lvl > .05 ? `rgba(225,236,250,${.35 + .65 * lvl})` : '#20262e'; c.beginPath(); c.ellipse(headX, headY + 8, 38, 8, -.05, 0, TAU); c.fill();
  }
  function wires(c, gt, pts, col = 'rgba(5,7,10,.9)') {
    c.save(); c.strokeStyle = col; c.lineWidth = 3;
    pts.forEach((q, i) => { const sg = q[4] + Math.sin(gt * .8 + i * 1.7) * 3; c.beginPath(); c.moveTo(q[0], q[1]); c.quadraticCurveTo((q[0] + q[2]) / 2, (q[1] + q[3]) / 2 + sg * 2, q[2], q[3]); c.stroke(); });
    c.restore();
  }

  // ===================== 1) HOUSE_EXT =====================
  SCENES.house_ext = (c, lt, b, gt) => {
    const p = b.p || {}, T0 = performance.now();
    const style = HOUSE[p.style] ? p.style : 'ranch', HS = HOUSE[style], GY = HS.gy;
    const snow = !!p.snow, rain = !!p.rain, dark = clamp(num(p.dark, 0)), tree = p.tree !== false, lamp = p.lamp !== false, nbs = p.neighbors !== false;
    const label = p.label != null ? String(p.label) : '';
    c.save();
    if (Array.isArray(p.dolly)) { const k = E.inOut(prog(lt, num(p.dolly[0], 0), num(p.dolly[1], 6))), s = lerp(1, num(p.dolly[2], 1.15), k), f = HS.focus; c.translate(f[0], f[1]); c.scale(s, s); c.translate(-f[0], -f[1]); }
    // Himmel, ferne Baumreihe, Nachbarn, Boden, Haus (statisch, gecacht); Wolken darüber, unten ausgeblendet
    blit(c, layer(`hx_${style}|${label}|${snow ? 1 : 0}|${nbs ? 1 : 0}|${rain ? 1 : 0}`, g => {
      drawSky(g, rain ? { top: '#040509', mid: '#0b0f16', bot: '#1a2029', hz: 960, stars: 0 } : { top: '#03050a', mid: '#0a0f19', bot: '#1f2734', hz: 960, stars: 90, moon: [800, 400, 30] });
      for (let i = 0; i < 13; i++) treeAt(g, treeSpr(20 + (i % 4), '#121924', snow), -PAD + i * 120 + rnd(i, 72) * 60, 905, .17 + .1 * rnd(i, 71));
      const hz = g.createLinearGradient(0, 640, 0, 905); hz.addColorStop(0, 'rgba(32,40,54,0)'); hz.addColorStop(1, 'rgba(32,40,54,.55)'); g.fillStyle = hz; g.fillRect(-PAD, 640, LW, 265);
      g.fillStyle = '#111720'; g.fillRect(-PAD, 900, LW, GY + 20 - 900);
      if (nbs) HS.nb.forEach((q, i) => { if (q) neighborHouse(g, q[0], q[1], q[2], snow, i + 3); });
      groundStreet(g, { gy: GY, snow });
      g.fillStyle = snow ? '#3a414b' : '#1a1f26'; const wk = HS.walk; poly(g, [[wk[0] - 6, GY + 12], [wk[1] + 6, GY + 12], [wk[1] + 30, 1290], [wk[0] - 30, 1290]]); g.fill();
      if (HS.drive) { g.fillStyle = snow ? '#363d47' : '#181c23'; const dv = HS.drive; poly(g, [[dv[0], GY], [dv[1], GY], [dv[1] + 70, 1290], [dv[0] - 40, 1290]]); g.fill(); g.fillRect(dv[0] - 40, 1290, dv[1] - dv[0] + 110, 46); }
      HS.draw(g, { snow });
      g.fillStyle = '#2a3039'; g.fillRect(wk[0] - 18, GY, wk[1] - wk[0] + 36, 12);
      plate(g, HS.plate[0], HS.plate[1], label, HS.plate[2]);
      g.fillStyle = '#14181e'; g.fillRect(452, 1252, 8, 76); rr(g, 430, 1226, 52, 30, 8); g.fillStyle = '#1e232b'; g.fill(); if (snow) { g.fillStyle = '#9aa3b0'; g.fillRect(432, 1222, 48, 6); }
    }));
    cloudLayer(c, { y0: 130, y1: 440, n: rain ? 8 : 6, speed: rain ? 22 : 13, alpha: rain ? .62 : .5, seed: 3 }, gt, style === 'twostory' ? 350 : 400, style === 'twostory' ? 448 : 498);
    // Fenster, Tür, Verandalampe
    const lampX = 830, lampY = 588, lampG = [812, 1300], lvl = lamp ? lampLevel(gt, 3) : 0;
    const wins = HS.wins, wq = new Array(wins.length).fill(null);
    if (Array.isArray(p.windows)) p.windows.forEach(q => { if (q && (q.i | 0) >= 0 && (q.i | 0) < wins.length) wq[q.i | 0] = q; }); else HS.lit.forEach(i => { wq[i] = { i }; });
    const wk = wq.map((q, i) => { if (!q) return 0; const on = tv(q.on), off = tv(q.off); let k = on == null ? 1 : clamp(prog(lt, on, on + .1)) * (lt < on + .35 ? (flicker(gt, 7 + i, 26) > .5 ? 1 : .35) : 1);
      if (off != null && lt >= off) k *= 1 - clamp((lt - off) / .07); return k * num(q.dim, 1); });
    wins.forEach((w, i) => { if (wk[i] > 0) winLit(c, w, wk[i], wq[i].red ? 'red' : (wq[i].tv ? 'tv' : 'warm'), lt, gt, tv(wq[i].pass)); });
    const dq = typeof p.door === 'number' ? { open: p.door } : (p.door || null), dr = HS.door, dOpen = dq ? (tv(dq.open) != null ? E.inOut(prog(lt, tv(dq.open), tv(dq.open) + num(dq.dur, 1.4))) : clamp(num(dq.ajar, 0))) : 0;
    if (dOpen > 0) {
      const lk = dq.light === 'warm' ? 1 : dq.light === 'red' ? 2 : 0;
      const ig = c.createLinearGradient(0, dr.y, 0, dr.y + dr.h); ig.addColorStop(0, lk === 1 ? '#6a4522' : lk === 2 ? '#5a0a0a' : '#020203'); ig.addColorStop(1, lk === 1 ? '#2a1608' : lk === 2 ? '#1c0202' : '#000');
      c.fillStyle = ig; c.fillRect(dr.x, dr.y, dr.w, dr.h);
      const ow = dr.w * (1 - dOpen * .8); c.fillStyle = '#10141a'; c.fillRect(dr.x, dr.y, ow, dr.h); c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(dr.x + ow - 4, dr.y, 4, dr.h);
    }
    const porchOn = p.porch !== false && !(tv(p.porchOff) != null && lt >= tv(p.porchOff));
    const porchLvl = porchOn ? .85 + .15 * noise(gt * 4, 8) : 0;
    if (porchOn) { c.fillStyle = `rgba(255,214,150,${.85 * porchLvl})`; rr(c, HS.porch[0] - 7, HS.porch[1] - 14, 14, 22, 3); c.fill(); }
    if (tree) drawTree(c, gt, style === 'ranch' ? 30 : 60, 1238, .98, 5, '#05070b', snow);
    const fs = figState(p.figure, lt, { x: .5, y: .665, h: .125 });
    const cq = p.car ? carState(p.car, lt, { x: .62, L: 560, from: 'right' }) : null, carGY = 1425, hlOn = cq && p.car.headlights !== false;
    const police = tv(p.police), polK = police != null ? clamp(prog(lt, police, police + .35)) : 0, [sr, sb] = strobe(gt);
    if (dark > 0) fillVis(c, `rgba(0,0,0,${dark * .62})`);
    // ---- Licht (ein Durchgang) ----
    const g = lightBegin();
    wins.forEach((w, i) => { const k = wk[i]; if (k <= 0) return; const col = wq[i].red ? REDL : (wq[i].tv ? 'rgba(110,150,255,A)' : WARM), cx = w.x + w.w / 2;
      espot(g, cx, w.y + w.h / 2, w.w * 1.25, w.h * 1.2, col, .5 * k); if (w.y + w.h > 900) espot(g, cx, GY + 70, w.w * 1.1, 60, col, .3 * k);
      espot(g, cx, 1560 + (w.y - 900) * .2, w.w * .5, 240, col, (rain ? .2 : .13) * k); });
    if (dOpen > 0 && dq.light && dq.light !== 'dark') { const col = dq.light === 'red' ? REDL : WARM; espot(g, dr.x + dr.w / 2, dr.y + dr.h * .6, 140, 200, col, .4 * dOpen); espot(g, dr.x + dr.w / 2, GY + 60, 120, 50, col, .45 * dOpen); }
    if (porchOn) { espot(g, HS.porch[0], HS.porch[1] - 10, 150, 130, WARM, .36 * porchLvl); espot(g, HS.porch[0], HS.porch[1] + 8, 44, 40, 'rgba(255,230,190,A)', .4 * porchLvl); }
    if (lvl > 0) { espot(g, lampG[0], lampG[1], 470, 110, COLD, .5 * lvl); espot(g, lampG[0], 1080, 360, 260, COLD, .12 * lvl); espot(g, lampG[0] - 20, 1680, 110, 420, COLD, (rain ? .24 : .15) * lvl);
      coneSpr('hx', lampX, lampY + 10, 50, lampG[0] - 30, 1310, 820, COLD)(g, .9 * lvl * (rain ? 1.25 : 1)); }
    if (hlOn) { const hp = [cq.x + cq.dir * 282, carGY - 72]; espot(g, hp[0] + cq.dir * 340, carGY + 30, 380, 70, 'rgba(255,240,210,A)', .45); beam(g, hp[0], hp[1], cq.dir > 0 ? .05 : Math.PI - .05, 700, .09, 'rgba(240,236,220,A)', .35);
      espot(g, cq.x - cq.dir * 282, carGY + 200, 40, 160, REDL, .15); }
    if (polK > 0) {
      espot(g, 120, 1420, 1250, 950, REDL, .5 * sr * polK); espot(g, 980, 1420, 1250, 950, BLUEL, .55 * sb * polK);
      espot(g, 540, 1000, 700, 260, sr > sb ? REDL : BLUEL, .25 * Math.max(sr, sb) * polK);
      wins.forEach((w, i) => { if (wk[i] < .5) espot(g, w.x + w.w / 2, w.y + w.h / 2, w.w * .7, w.h * .7, sr > sb ? REDL : BLUEL, .35 * Math.max(sr, sb) * polK); });
      espot(g, 200, 1650, 500, 500, REDL, .3 * sr * polK); espot(g, 880, 1650, 500, 500, BLUEL, .3 * sb * polK); }
    if (rain) espot(g, 540, 1500, 900, 300, 'rgba(120,140,170,A)', .06);
    lightEnd(c);
    // Auto + Figur (nach Tiefe sortiert, Figur bleibt als dunkle Silhouette)
    const drawFig = () => {
      if (!fs) return;
      const shadow = (sx, sy, a) => { if (a <= .01) return; c.save(); c.translate(fs.x, fs.y); c.transform(1, 0, -sx, -sy, 0, 0); person(c, 0, 0, fs.h, { dir: fs.dir, phase: fs.phase, walkAmt: fs.walkAmt, color: '#000', alpha: a * fs.a, coat: fs.f.coat, hat: fs.f.hat, arms: fs.f.arms }); c.restore(); };
      if (lvl > .05) { const vx = fs.x - lampG[0], vy = fs.y - lampG[1], den = Math.max(160, 700 - fs.h), fall = clamp(1 - Math.hypot(vx, vy * 2) / 1300); shadow(vx / den, vy / den * .55 - .12, .55 * lvl * fall); }
      if (porchOn && fs.y > GY) { const vx = fs.x - HS.porch[0], vy = fs.y - GY, d = Math.hypot(vx, vy), k = clamp(1 - d / 650); shadow(clamp(vx / 170, -1.2, 1.2), clamp(vy / 170, .3, 1.0), .42 * porchLvl * k); }
      const side = Math.sign(lampX - fs.x) || 1, near = clamp(1 - Math.abs(lampX - fs.x) / 900);
      const rims = [{ col: `rgba(160,180,210,${(.2 + .45 * near) * lvl})`, side, w: .01 }];
      if (polK > 0) rims.push({ col: sr > sb ? `rgba(255,50,45,${.7 * sr * polK})` : `rgba(60,110,255,${.7 * sb * polK})`, side: sr > sb ? -1 : 1, w: .012 });
      person(c, fs.x, fs.y, fs.h, { dir: fs.dir, phase: fs.phase, walkAmt: fs.walkAmt, alpha: fs.a, rim: rims, coat: fs.f.coat, hat: fs.f.hat, arms: fs.f.arms, color: '#040507' });
    };
    const drawCar = () => { if (!cq) return; const ci = car(c, cq.x, carGY, 560, { dir: cq.dir, head: hlOn ? 1 : 0, tail: cq.braking ? 1 : .55, wheel: cq.wheel, snow, color: '#0a0d12' });
      if (hlOn) glowAt(c, ci.head[0], ci.head[1], 70, 'rgba(255,245,225,A)', .75); glowAt(c, ci.tail[0], ci.tail[1], 46, REDL, cq.braking ? .7 : .4); };
    if (fs && fs.y > carGY) { drawCar(); drawFig(); } else { drawFig(); drawCar(); }
    if (lamp) { wires(c, gt, [[870, 408, -PAD - 60, 470, 40], [1010, 408, W + PAD, 440, 20], [880, 408, -PAD - 60, 520, 55], [1000, 408, W + PAD, 470, 22]]); lampPost(c, 940, 1322, 380, lampX, lampY, lvl, snow);
      glowAt(c, lampX, lampY + 8, 120, 'rgba(225,235,250,A)', .55 * lvl); }
    const tape = tv(p.tape);
    if (tape != null && lt >= tape) { const k1 = E.out(prog(lt, tape, tape + 1.0)), k2 = E.out(prog(lt, tape + .35, tape + 1.4)), tint = polK > 0 ? (sr > sb ? `rgba(255,40,40,${.25 * sr * polK})` : `rgba(50,90,255,${.25 * sb * polK})`) : null;
      drawTape(c, [-PAD + 20, 1196], [W + PAD - 20, 1268], k1, gt, 1, tint); drawTape(c, [-PAD + 20, 1318], [W + PAD - 20, 1236], k2, gt, 4, tint); }
    if (rain) { rainDraw(c, gt, { n: 150, speed: 1700, len: 46, lw: 1.5, col: 'rgba(170,185,210,.18)', seed: 1, slant: .08 });
      c.save(); poly(c, [[lampX - 30, lampY], [lampX + 30, lampY], [lampG[0] + 420, 1320], [lampG[0] - 440, 1320]]); c.clip(); rainDraw(c, gt, { n: 110, speed: 2100, len: 60, lw: 2, col: `rgba(215,228,245,${.45 * lvl})`, seed: 5, slant: .08 }); c.restore();
      rainDraw(c, gt, { n: 60, speed: 2600, len: 90, lw: 2.6, col: 'rgba(190,205,228,.26)', seed: 9, slant: .1 });
      splashDraw(c, gt, { n: 46, x0: -100, x1: W + 100, y0: 1352, y1: 1900, col: 'rgba(180,195,220,.4)', s0: .7, s1: 1.6 }); }
    if (snow) snowDraw(c, gt, { n: 230 });
    c.restore();
    PERF(p, 'house_ext', T0, c);
  };

  // ===================== 2) CHURCH_EXT =====================
  function lancet(g, x, top, w, bot) { g.beginPath(); g.moveTo(x, bot); g.lineTo(x, top + w * .8); g.quadraticCurveTo(x, top + w * .18, x + w / 2, top); g.quadraticCurveTo(x + w, top + w * .18, x + w, top + w * .8); g.lineTo(x + w, bot); g.closePath(); }
  function splitLabel(s) { s = String(s).trim(); if (s.length <= 15 || !s.includes(' ')) return [s];
    let best = null; for (let i = 0; i < s.length; i++) if (s[i] === ' ' && (best == null || Math.abs(i - s.length / 2) < Math.abs(best - s.length / 2))) best = i;
    return [s.slice(0, best), s.slice(best + 1)]; }
  SCENES.church_ext = (c, lt, b, gt) => {
    const p = b.p || {}, T0 = performance.now();
    const snow = !!p.snow, lit = p.lit !== false, cross = p.cross !== false, label = p.label != null ? String(p.label) : 'CHRIST LUTHERAN CHURCH', sub = p.sub ? String(p.sub) : '';
    const GY = 1150, dark = clamp(num(p.dark, 0));

    blit(c, layer(`ch|${label}|${sub}|${snow ? 1 : 0}`, g => {
      drawSky(g, { top: '#03050a', mid: '#0a0e17', bot: '#18202b', hz: 1000, stars: 70 });
      for (let i = 0; i < 12; i++) treeAt(g, treeSpr(30 + (i % 4), '#111822', snow), -PAD + i * 130 + rnd(i, 82) * 60, 1005, .19 + .12 * rnd(i, 81));
      const hz = g.createLinearGradient(0, 760, 0, 1005); hz.addColorStop(0, 'rgba(32,40,54,0)'); hz.addColorStop(1, 'rgba(32,40,54,.5)'); g.fillStyle = hz; g.fillRect(-PAD, 760, LW, 245);
      g.fillStyle = '#0e131b'; g.fillRect(-PAD, 1000, LW, 160);
      treeAt(g, treeSpr(41, '#080b10', snow), 1090, 1160, .44);
      // Gemeindehaus rechts (Flachdach)
      brick(g, 806, 962, 520, GY - 962, '#1f1819'); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(806, 962, 520, GY - 962);
      g.fillStyle = snow ? '#aab2bd' : '#262c35'; g.fillRect(798, 948, 540, 16);
      for (let i = 0; i < 4; i++) { g.fillStyle = '#2b323c'; g.fillRect(842 + i * 96, 1004, 66, 74); g.fillStyle = '#0a0d12'; g.fillRect(847 + i * 96, 1009, 56, 64); g.fillStyle = 'rgba(130,150,180,.06)'; g.fillRect(847 + i * 96, 1009, 20, 64); }
      // Boden: Rasenstreifen + Parkplatz
      g.fillStyle = snow ? '#2c323b' : '#0e1215'; g.fillRect(-PAD, GY, LW, 70);
      const pg = g.createLinearGradient(0, 1220, 0, H + PAD); pg.addColorStop(0, snow ? '#252b33' : '#11151b'); pg.addColorStop(1, snow ? '#171b21' : '#07090c'); g.fillStyle = pg; g.fillRect(-PAD, 1220, LW, H + PAD - 1220);
      g.fillStyle = snow ? '#3d444e' : '#1c2128'; g.fillRect(-PAD, 1214, LW, 10);
      for (let i = 0; i < 2400; i++) { g.fillStyle = rnd(i, 91) > .5 ? 'rgba(160,170,190,.045)' : 'rgba(0,0,0,.22)'; const y = 1226 + rnd(i, 92) * (H + PAD - 1226); g.fillRect(-PAD + rnd(i, 93) * LW, y, 2 + (y - 1226) / 400, 2); }
      g.strokeStyle = snow ? 'rgba(220,226,236,.12)' : 'rgba(215,220,230,.2)'; g.lineWidth = 6; g.beginPath();
      for (let x = 560; x < W + PAD + 300; x += 165) { g.moveTo(x, 1262); g.lineTo(x - 210, 1560); } g.stroke();
      g.beginPath(); g.moveTo(420, 1262); g.lineTo(W + PAD, 1262); g.lineWidth = 4; g.stroke();
      // Turm
      brick(g, 150, 700, 142, GY - 700, '#2a1d1e'); g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(150, 700, 30, GY - 700);
      g.fillStyle = '#383c44'; g.fillRect(142, 690, 158, 14); g.fillRect(142, 846, 158, 8);
      g.fillStyle = '#07090c'; lancet(g, 192, 724, 58, 836); g.fill(); g.strokeStyle = '#1c2027'; g.lineWidth = 4; g.beginPath(); for (let yy = 760; yy < 836; yy += 12) { g.moveTo(194, yy); g.lineTo(248, yy - 4); } g.stroke();
      g.fillStyle = '#2b2f37'; lancet(g, 196, 896, 50, 1016); g.fill(); g.fillStyle = '#0a0d12'; lancet(g, 202, 904, 38, 1010); g.fill();
      // Spitze
      g.fillStyle = snow ? '#4a525e' : '#0d1015'; poly(g, [[140, 696], [221, 436], [302, 696]]); g.fill();
      g.save(); poly(g, [[140, 696], [221, 436], [302, 696]]); g.clip(); g.strokeStyle = 'rgba(190,205,230,.04)'; g.lineWidth = 2; g.beginPath(); for (let yy = 450; yy < 696; yy += 14) { g.moveTo(100, yy); g.lineTo(340, yy); } g.stroke();
      g.fillStyle = 'rgba(0,0,0,.35)'; poly(g, [[221, 436], [302, 696], [221, 696]]); g.fill(); if (snow) { g.fillStyle = 'rgba(220,228,238,.25)'; poly(g, [[140, 696], [221, 436], [200, 696]]); g.fill(); } g.restore();
      // Kirchenschiff
      brick(g, 292, 840, 516, GY - 840, '#2b1e1f');
      g.save(); poly(g, [[292, 842], [550, 612], [808, 842]]); g.clip(); brick(g, 292, 600, 516, 250, '#281c1d'); g.restore();
      g.fillStyle = snow ? '#5b636f' : '#0c0f14'; poly(g, [[272, 850], [550, 594], [828, 850], [800, 850], [550, 626], [300, 850]]); g.fill();
      if (snow) { g.fillStyle = '#c3cad4'; poly(g, [[272, 850], [550, 594], [828, 850], [818, 850], [550, 604], [282, 850]]); g.fill(); }
      g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(292, 850, 516, 30);
      // Rosette
      g.fillStyle = '#2f333b'; g.beginPath(); g.arc(550, 742, 52, 0, TAU); g.fill(); g.fillStyle = '#0a0d12'; g.beginPath(); g.arc(550, 742, 44, 0, TAU); g.fill();
      g.strokeStyle = '#2a2e36'; g.lineWidth = 4; g.beginPath(); for (let k = 0; k < 8; k++) { const a = k * TAU / 8; g.moveTo(550, 742); g.lineTo(550 + Math.cos(a) * 44, 742 + Math.sin(a) * 44); } g.stroke(); g.beginPath(); g.arc(550, 742, 16, 0, TAU); g.stroke();
      // Fenster links/rechts
      for (const wx of [362, 678]) { g.fillStyle = '#34383f'; lancet(g, wx - 8, 878, 76, 1088); g.fill(); g.fillStyle = '#0a0d12'; lancet(g, wx, 888, 60, 1080); g.fill(); g.strokeStyle = '#262a31'; g.lineWidth = 4; g.beginPath(); g.moveTo(wx + 30, 896); g.lineTo(wx + 30, 1080); g.moveTo(wx, 990); g.lineTo(wx + 60, 990); g.stroke(); }
      // Portal + Stufen
      g.fillStyle = '#3a3d44'; lancet(g, 482, 930, 136, 1150); g.fill(); g.fillStyle = '#120d0e'; lancet(g, 494, 944, 112, 1150); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 4; g.beginPath(); g.moveTo(550, 960); g.lineTo(550, 1150); g.stroke(); g.fillStyle = '#4a4d55'; g.fillRect(538, 1050, 6, 22); g.fillRect(556, 1050, 6, 22);
      for (let k = 0; k < 3; k++) { g.fillStyle = snow ? ['#59616c', '#505862', '#474e58'][k] : ['#262a31', '#22262d', '#1d2127'][k]; g.fillRect(468 - k * 12, GY + k * 10, 164 + k * 24, 11); }
      bush(g, 330, GY + 6, 40, snow); bush(g, 760, GY + 6, 40, snow); bush(g, 860, GY + 6, 36, snow);
      // Schild (Monumentschild mit Ziegelsockel)
      brick(g, 176, 1312, 468, 40, '#241a1b'); g.fillStyle = snow ? '#b4bcc7' : '#30353d'; g.fillRect(170, 1306, 480, 8);
      g.fillStyle = '#2a2f37'; rr(g, 186, 1170, 448, 140, 6); g.fill();
      g.fillStyle = '#090b0f'; rr(g, 196, 1180, 428, 120, 4); g.fill();
      if (snow) { g.fillStyle = '#c3cad4'; rr(g, 184, 1160, 452, 14, 6); g.fill(); }
      g.strokeStyle = 'rgba(235,238,244,.22)'; g.lineWidth = 2; g.strokeRect(206, 1190, 408, 100);
      const L = splitLabel(label.toUpperCase()); let fs = 56; g.letterSpacing = '4px'; for (const l of L) { g.font = `600 ${fs}px Oswald`; const w = g.measureText(l).width; if (w > 380) fs = Math.floor(fs * 380 / w); } g.letterSpacing = '0px';
      const lh = fs * 1.08, total = L.length * lh + (sub ? 34 : 0), y0 = 1240 - total / 2 + lh * .5;
      L.forEach((l, i) => txt(g, l, 410, y0 + i * lh, `600 ${fs}px Oswald`, '#f1f2f5', 'center', 'middle', 4));
      if (sub) { g.fillStyle = 'rgba(255,60,60,.7)'; g.fillRect(330, y0 + L.length * lh - lh * .5 + 4, 160, 2); txt(g, sub.toUpperCase(), 410, y0 + L.length * lh - lh * .5 + 26, '600 22px Oswald', '#c9ccd3', 'center', 'middle', 3); }
      // Strahler vor dem Schild
      g.fillStyle = '#1a1e24'; for (const sx of [250, 570]) { rr(g, sx - 12, 1360, 24, 16, 4); g.fill(); }
    }));
    cloudLayer(c, { y0: 110, y1: 400, n: 6, speed: 12, alpha: .5, seed: 11 }, gt, 330, 432);
    // Fenster (warm)
    const wv = .9 + .1 * noise(gt * 3.5, 4);
    if (lit) { c.save(); lancet(c, 678, 888, 60, 1080); c.clip(); const gr = c.createLinearGradient(0, 888, 0, 1080); gr.addColorStop(0, 'rgba(255,205,135,.95)'); gr.addColorStop(1, 'rgba(200,110,45,.95)'); c.fillStyle = gr; c.globalAlpha = wv; c.fillRect(670, 880, 80, 210);
      const cols = ['rgba(150,30,25,.55)', 'rgba(40,60,120,.45)', 'rgba(210,150,50,.35)', 'rgba(90,20,20,.5)']; for (let k = 0; k < 10; k++) { c.fillStyle = cols[k % 4]; c.fillRect(678 + (k % 2) * 30, 900 + Math.floor(k / 2) * 38, 30, 38); }
      c.strokeStyle = 'rgba(20,14,10,.85)'; c.lineWidth = 3; c.beginPath(); for (let yy = 900; yy < 1080; yy += 38) { c.moveTo(678, yy); c.lineTo(738, yy + 6); } c.moveTo(708, 888); c.lineTo(708, 1080); c.stroke(); c.restore();
      c.strokeStyle = '#262a31'; c.lineWidth = 4; c.beginPath(); c.moveTo(678, 990); c.lineTo(738, 990); c.stroke(); }
    // Parkplatzlampe
    const PX = 962, lvl = p.lamp === false ? 0 : lampLevel(gt, 13), headX = 880, headY = 566;
    const fs = figState(p.figure, lt, { x: .74, y: .74, h: .16 });
    const cq = p.car ? carState(p.car, lt, { x: .66, L: 600, from: 'right' }) : null, carGY = 1500, hlOn = cq && p.car.headlights !== false;
    if (dark > 0) fillVis(c, `rgba(0,0,0,${dark * .62})`);
    // Licht (ein Durchgang)
    const g = lightBegin();
    if (lit) { espot(g, 708, 985, 120, 170, WARM, .5 * wv); espot(g, 708, GY + 40, 120, 40, WARM, .25 * wv); }
    espot(g, 410, 1300, 300, 130, 'rgba(225,232,245,A)', .22); espot(g, 410, 1240, 250, 70, 'rgba(225,232,245,A)', .12); // Strahler aufs Schild
    if (lvl > 0) { espot(g, 860, 1500, 460, 130, COLD, .5 * lvl); espot(g, 860, 1180, 420, 300, COLD, .1 * lvl); coneSpr('ch', headX, 578, 90, 860, 1510, 760, COLD, .06)(g, .85 * lvl); }
    espot(g, 550, 1150, 120, 26, 'rgba(255,190,120,A)', .12);
    if (cross) espot(g, 221, 392, 90, 90, REDL, .3 + .08 * Math.sin(gt * 1.3));
    if (hlOn) { const hp = [cq.x + cq.dir * 303, carGY - 78]; espot(g, hp[0] + cq.dir * 380, carGY + 20, 420, 80, 'rgba(255,240,210,A)', .45); beam(g, hp[0], hp[1], cq.dir > 0 ? .04 : Math.PI - .04, 760, .1, 'rgba(240,236,220,A)', .35);
      espot(g, hp[0] + cq.dir * 300, 1250, 420, 160, 'rgba(255,240,210,A)', .1); }
    if (p.rain) espot(g, 540, 1500, 900, 300, 'rgba(120,140,170,A)', .06);
    lightEnd(c);
    if (cross) { c.save(); c.fillStyle = '#0a0c10'; c.strokeStyle = 'rgba(255,60,55,.55)'; c.lineWidth = 2; c.strokeRect(216, 354, 10, 84); c.strokeRect(198, 376, 46, 10); c.fillRect(216, 354, 10, 84); c.fillRect(198, 376, 46, 10); c.restore(); }
    // Mast + Leuchte
    c.fillStyle = '#14181e'; c.fillRect(PX - 8, 560, 16, 1530 - 560); c.fillStyle = '#1a1e25'; c.fillRect(PX - 18, 1510, 36, 22);
    c.fillStyle = '#1b2027'; c.fillRect(headX + 20, 560, PX - headX - 20, 8); c.fillStyle = '#252b33'; rr(c, headX - 46, 548, 92, 24, 4); c.fill();
    if (snow) { c.fillStyle = '#aab2bd'; c.fillRect(headX - 44, 543, 88, 6); }
    c.fillStyle = lvl > .05 ? `rgba(225,236,250,${.35 + .65 * lvl})` : '#20262e'; c.fillRect(headX - 40, 570, 80, 6);
    glowAt(c, headX, 576, 120, 'rgba(225,235,250,A)', .55 * lvl);
    // Figur + Auto
    const drawFig = () => { if (!fs) return; const vx = fs.x - headX, den = Math.max(200, 900 - fs.h);
      if (lvl > .05) { c.save(); c.translate(fs.x, fs.y); c.transform(1, 0, -vx / den, -(fs.y - 1500) / den * .5 + .12, 0, 0); person(c, 0, 0, fs.h, { dir: fs.dir, phase: fs.phase, walkAmt: fs.walkAmt, color: '#000', alpha: .5 * lvl * fs.a, coat: fs.f.coat, hat: fs.f.hat, arms: fs.f.arms }); c.restore(); }
      person(c, fs.x, fs.y, fs.h, { dir: fs.dir, phase: fs.phase, walkAmt: fs.walkAmt, alpha: fs.a, rim: { col: `rgba(170,190,220,${.5 * lvl})`, side: Math.sign(headX - fs.x) || 1, w: .01 }, coat: fs.f.coat, hat: fs.f.hat, arms: fs.f.arms, color: '#040507' }); };
    const drawCar = () => { if (!cq) return; const ci = car(c, cq.x, carGY, 600, { dir: cq.dir, head: hlOn ? 1 : 0, tail: cq.braking ? 1 : .55, wheel: cq.wheel, snow });
      if (hlOn) glowAt(c, ci.head[0], ci.head[1], 74, 'rgba(255,245,225,A)', .75); glowAt(c, ci.tail[0], ci.tail[1], 48, REDL, cq.braking ? .7 : .4); };
    if (fs && fs.y > carGY) { drawCar(); drawFig(); } else { drawFig(); drawCar(); }
    if (snow) snowDraw(c, gt, { n: 230 });
    if (p.rain) { rainDraw(c, gt, { n: 160, speed: 1800, len: 50, lw: 1.5, col: 'rgba(170,185,210,.2)', seed: 2 }); rainDraw(c, gt, { n: 60, speed: 2600, len: 90, lw: 2.5, col: 'rgba(190,205,228,.25)', seed: 8 });
      splashDraw(c, gt, { n: 40, x0: -100, x1: W + 100, y0: 1230, y1: 1900, col: 'rgba(180,195,220,.38)', s0: .7, s1: 1.6 }); }
    PERF(p, 'church_ext', T0, c);
  };

  // ===================== 3) PHONE_BOOTH =====================
  const BX = 330, BW = 420, BT = 418, BH0 = 502, BB = 1336; // Zelle: Kasten 418..502, Körper 502..1336
  const BOX = BX - 70, BOY = BT - 30, BOW = BW + 140, BOH = BB - BT + 60; let boCv = null;
  SCENES.phone_booth = (c, lt, b, gt) => {
    const p = b.p || {}, T0 = performance.now();
    const rain = p.rain !== false, flick = p.flicker !== false, street = p.street ? String(p.street) : '', sign = p.sign != null ? String(p.sign) : 'PHONE';
    // Licht der Zelle
    const at = tv(p.at); let f = 1;
    if (at != null) f = lt < at ? .05 : (lt < at + .7 ? (flicker(gt, 51, 24) > .5 ? 1 : .1) * (.4 + .6 * prog(lt, at, at + .7)) : 1);
    const pw = f;
    if (flick && (at == null || lt >= at + .7)) { if (noise(gt * .6, 52) > .38) f *= flicker(gt, 53, 17) > .5 ? 1 : .22; f *= .94 + .06 * noise(gt * 40, 54); }
    const fq = p.figure === false ? null : (p.figure || {}), fat = fq ? tv(fq.at, 0) : 0;
    if (fq && fat > 0 && lt >= fat - .2 && lt < fat + .35) f *= flicker(gt, 55, 30) > .5 ? 1 : .08; // Figur erscheint im Flackern
    const fh = (at != null && lt < at + .7 ? Math.max(.06, pw) : 1) * (.92 + .08 * noise(gt * 1.5, 56)); // Leuchtkasten
    // Hintergrund: Himmel, Wolken, Häuserecke
    blit(c, layer(`pb|${street}`, g => {
      drawSky(g, { top: '#020306', mid: '#070a10', bot: '#121820', hz: 700, stars: 0 });
      // fernes Gebäude hinter der Zelle (Gasse), dann Ladenfront links und Haus rechts
      g.fillStyle = '#0d1117'; g.fillRect(300, 536, 520, 810); g.fillStyle = '#12171e'; g.fillRect(296, 530, 528, 10);
      for (let r = 0; r < 6; r++) for (let q = 0; q < 5; q++) { const lit = rnd(r * 5 + q, 161) > .9; g.fillStyle = lit ? 'rgba(150,110,70,.4)' : '#080a0e'; g.fillRect(322 + q * 100, 566 + r * 120, 44, 62); }
      const fg = g.createLinearGradient(0, 900, 0, 1340); fg.addColorStop(0, 'rgba(20,26,34,0)'); fg.addColorStop(1, 'rgba(20,26,34,.6)'); g.fillStyle = fg; g.fillRect(300, 900, 520, 440);
      g.fillStyle = '#0b0e13'; g.fillRect(-PAD, 470, 330 + PAD, 900); brick(g, -PAD, 470, 330 + PAD, 900, '#120e10'); g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(-PAD, 470, 330 + PAD, 900);
      g.fillStyle = '#1a1e24'; g.fillRect(-PAD, 460, 340 + PAD, 14);
      for (const wx of [-150, 40]) { g.fillStyle = '#1c2027'; g.fillRect(wx, 560, 170, 210); g.fillStyle = '#07090c'; g.fillRect(wx + 8, 568, 154, 194); g.fillStyle = 'rgba(120,140,170,.05)'; g.fillRect(wx + 8, 568, 50, 194); }
      g.fillStyle = '#1a1e24'; g.fillRect(-PAD, 940, 330 + PAD, 26); g.fillStyle = '#07090c'; g.fillRect(-120, 990, 400, 350); g.fillStyle = 'rgba(120,140,170,.04)'; g.fillRect(-120, 990, 120, 350);
      g.fillStyle = '#0d1015'; g.fillRect(780, 520, 600, 860); brick(g, 780, 520, 600, 860, '#110d0f'); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(780, 520, 600, 860);
      for (let r = 0; r < 2; r++) for (let q = 0; q < 2; q++) { const wx = 840 + q * 190, wy = 590 + r * 230; g.fillStyle = '#1b1f26'; g.fillRect(wx, wy, 120, 160); const lit = r === 0 && q === 0;
        g.fillStyle = lit ? 'rgba(150,105,60,.55)' : '#07090c'; g.fillRect(wx + 7, wy + 7, 106, 146); if (lit) { g.fillStyle = 'rgba(40,24,14,.8)'; g.fillRect(wx + 7, wy + 7, 30, 146); spot(g, wx + 60, wy + 80, 160, 'rgba(255,170,90,A)', .08); } }
      g.fillStyle = '#15191f'; poly(g, [[770, 1040], [1300, 1040], [1300, 1080], [800, 1100]]); g.fill(); g.fillStyle = '#07090c'; g.fillRect(820, 1110, 260, 230);
      // Gehweg, Bordstein, Straße (nass)
      const sw = g.createLinearGradient(0, 1340, 0, 1440); sw.addColorStop(0, '#15191f'); sw.addColorStop(1, '#1b2028'); g.fillStyle = sw; g.fillRect(-PAD, 1340, LW, 100);
      g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 2; g.beginPath(); for (let x = -PAD; x < W + PAD; x += 140) { g.moveTo(x, 1340); g.lineTo(x - (x - 540) * .08, 1440); } g.moveTo(-PAD, 1388); g.lineTo(W + PAD, 1388); g.stroke();
      g.fillStyle = '#2a3038'; g.fillRect(-PAD, 1440, LW, 9); g.fillStyle = '#101318'; g.fillRect(-PAD, 1449, LW, 16);
      const st = g.createLinearGradient(0, 1465, 0, H + PAD); st.addColorStop(0, '#0b0e13'); st.addColorStop(1, '#050608'); g.fillStyle = st; g.fillRect(-PAD, 1465, LW, H + PAD - 1465);
      for (let i = 0; i < 1800; i++) { g.fillStyle = rnd(i, 101) > .5 ? 'rgba(160,170,190,.04)' : 'rgba(0,0,0,.2)'; const y = 1466 + rnd(i, 102) * (H + PAD - 1466); g.fillRect(-PAD + rnd(i, 103) * LW, y, 2 + (y - 1466) / 400, 2); }
      g.fillStyle = '#12161b'; g.fillRect(150, 470, 14, 972); g.fillStyle = '#181c22'; g.fillRect(144, 1420, 26, 24); // Ampelmast (unten)
      // Straßenschild
      if (street) { g.fillStyle = '#14181e'; g.fillRect(866, 600, 12, 842); g.font = '700 30px Oswald'; g.letterSpacing = '3px'; const tw = Math.min(230, g.measureText(street.toUpperCase()).width + 34); g.letterSpacing = '0px';
        rr(g, 872 - tw / 2, 584, tw, 50, 6); g.fillStyle = '#173226'; g.fill(); g.strokeStyle = '#c9d2cc'; g.lineWidth = 2; rr(g, 876 - tw / 2, 588, tw - 8, 42, 4); g.stroke();
        txt(g, street.toUpperCase(), 872, 610, '700 30px Oswald', '#e4ebe6', 'center', 'middle', 3); }
    }));
    cloudLayer(c, { y0: 80, y1: 400, n: 5, speed: 24, alpha: .4, seed: 21 }, gt, 380, 458);
    // Ampel links (vor den Wolken)
    c.fillStyle = '#12161b'; c.fillRect(150, 370, 14, 102); c.fillStyle = '#14181e'; rr(c, 176, 386, 70, 190, 10); c.fill(); c.fillStyle = '#1b2027'; c.fillRect(164, 430, 14, 10);
    for (let k = 0; k < 3; k++) { c.fillStyle = '#0a0c10'; c.beginPath(); c.arc(211, 422 + k * 58, 22, 0, TAU); c.fill(); c.fillStyle = '#14181e'; c.fillRect(185, 398 + k * 58, 52, 8); }
    // Ampel: Rot
    const red = .85 + .15 * noise(gt * 2, 61);
    c.fillStyle = `rgba(255,50,42,${red})`; c.beginPath(); c.arc(211, 422, 18, 0, TAU); c.fill();
    // ---- Zelle in Offscreen (für Spiegelung) ----
    if (!boCv) boCv = mkCv(BOW, BOH);
    const o = boCv.getContext('2d'); o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, BOW, BOH); o.translate(-BOX, -BOY);
    // Innenraum dunkel
    o.fillStyle = '#0b0f14'; o.fillRect(BX + 18, BH0, BW - 36, BB - BH0 - 10);
    // Innenraum hell (Neonröhre)
    o.save(); o.globalAlpha = clamp(f);
    const ig = o.createLinearGradient(0, BH0, 0, BB); ig.addColorStop(0, '#c2d3dc'); ig.addColorStop(.45, '#8a9ba8'); ig.addColorStop(1, '#3d4852'); o.fillStyle = ig; o.fillRect(BX + 18, BH0, BW - 36, BB - BH0 - 10);
    o.fillStyle = 'rgba(0,0,0,.22)'; poly(o, [[BX + 18, BH0], [BX + 46, BH0 + 30], [BX + 46, BB - 30], [BX + 18, BB - 10]]); o.fill(); poly(o, [[BX + BW - 18, BH0], [BX + BW - 46, BH0 + 30], [BX + BW - 46, BB - 30], [BX + BW - 18, BB - 10]]); o.fill();
    o.fillStyle = 'rgba(0,0,0,.3)'; o.fillRect(BX + 18, BB - 40, BW - 36, 30);
    o.restore();
    // Telefon
    const PX = 600, PY = 770;
    o.fillStyle = '#1f252c'; rr(o, PX - 2, PY - 6, 114, 238, 8); o.fill(); o.fillStyle = '#39414b'; rr(o, PX + 8, PY + 6, 94, 214, 6); o.fill();
    o.fillStyle = '#12161b'; o.fillRect(PX + 70, PY + 22, 20, 6); o.fillRect(PX + 22, PY + 30, 34, 24);
    o.fillStyle = '#20262d'; for (let r = 0; r < 4; r++) for (let q = 0; q < 3; q++) { o.fillRect(PX + 24 + q * 22, PY + 82 + r * 22, 16, 15); }
    o.fillStyle = '#12161b'; o.fillRect(PX + 30, PY + 182, 50, 20);
    o.fillStyle = '#262c34'; o.fillRect(PX - 50, PY + 248, 200, 14); o.fillStyle = '#1a1e24'; o.fillRect(PX - 40, PY + 262, 140, 30);
    o.fillStyle = 'rgba(0,0,0,.25)'; o.fillRect(PX - 50, PY + 262, 200, 40);
    // Figur
    const fs = fq && lt >= fat ? { a: fat > 0 ? clamp(prog(lt, fat, fat + .12)) : 1 } : null;
    const rcv = fq ? (fq.hold ? 1 : (tv(p.receiver) != null ? prog(lt, tv(p.receiver), tv(p.receiver) + 1.2) : 0)) : 0;
    const cradle = [PX - 8, PY + 60]; let handset = null;
    const FX = num(fq && fq.x, .43) * W, FY = BB - 8, FH = num(fq && fq.h, .32) * H;
    if (fs) {
      const ear = [FX + .03 * FH, FY - .935 * FH], held = [ear[0] + .045 * FH, ear[1] + .072 * FH]; let hand = null;
      if (rcv > 0) { const k1 = E.inOut(clamp(rcv / .4)), k2 = E.inOut(clamp((rcv - .4) / .6));
        const rest = [FX + .06 * FH, FY - .48 * FH], grab = [cradle[0] + 4, cradle[1] + 40]; hand = rcv < .4 ? [lerp(rest[0], grab[0], k1), lerp(rest[1], grab[1], k1)] : [lerp(grab[0], held[0], k2), lerp(grab[1], held[1], k2)]; }
      const nod = rcv >= 1 ? Math.sin(gt * 1.7) * .006 : 0, sway = noise(gt * .5, 62) * .02;
      const r = person(o, FX, FY, FH, { dir: 1, lean: .04 + sway + nod * 2, arms: hand ? 'down' : (fq.arms || 'down'), handAbs: hand, color: '#06080b', alpha: fs.a, coat: 'long', hat: fq.hat, width: .21 });
      if (hand) handset = rcv < .4 ? [cradle[0], cradle[1] + 40, 0] : [r.hand[0], r.hand[1], k2Ang(rcv)];
    }
    function k2Ang(k) { return lerp(0, -.5, E.inOut(clamp((k - .4) / .6))); }
    // Hörer + Kabel
    const hs = handset || [cradle[0], cradle[1] + 40, 0], up = handset && hs[2] !== 0, bot = [hs[0] - 50 * Math.sin(hs[2]), hs[1] + 50 * Math.cos(hs[2])];
    o.save(); o.strokeStyle = '#1a1f25'; o.lineWidth = 5; o.beginPath(); o.moveTo(PX + 4, PY + 190); const sagY = Math.max(PY + 215, bot[1] + 70); o.quadraticCurveTo((PX + bot[0]) / 2 - 10, sagY, bot[0], bot[1]); o.stroke();
    o.translate(hs[0], hs[1]); o.rotate(hs[2]); o.fillStyle = up ? '#10141a' : '#15191e';
    o.beginPath(); o.roundRect(-9, -52, 18, 104, 8); o.roundRect(-15, -58, 26, 26, 8); o.roundRect(-15, 32, 26, 26, 8); o.fill();
    if (up) { o.strokeStyle = `rgba(175,200,215,${.25 + .3 * f})`; o.lineWidth = 2; o.stroke(); } o.restore();
    // Röhre
    o.save(); o.globalAlpha = clamp(f); o.fillStyle = '#f2fbff'; o.fillRect(BX + 60, BH0 + 8, BW - 120, 10); o.restore(); o.fillStyle = 'rgba(30,36,44,.9)'; o.fillRect(BX + 50, BH0 + 2, BW - 100, 6);
    // Glas + Rahmen
    o.fillStyle = 'rgba(160,190,210,.05)'; o.fillRect(BX + 18, BH0, BW - 36, BB - BH0);
    o.fillStyle = 'rgba(200,220,235,.06)'; for (const [x0, w0] of [[BX + 60, 60], [BX + 250, 30]]) { poly(o, [[x0, BH0], [x0 + w0, BH0], [x0 + w0 - 140, BB - 140], [x0 - 140, BB - 140]]); o.fill(); }
    const drops = 70; o.fillStyle = 'rgba(210,225,240,.22)'; o.beginPath();
    for (let i = 0; i < drops; i++) { const x = BX + 26 + rnd(i, 111) * (BW - 52); let y = BH0 + 20 + rnd(i, 112) * (BB - BH0 - 140); if (i % 3 === 0) y = BH0 + 20 + ((rnd(i, 113) * 760 + gt * (40 + 60 * rnd(i, 114))) % 760); o.moveTo(x + 3, y); o.ellipse(x, y, 2.5, 3.5, 0, 0, TAU); }
    o.fill(); o.strokeStyle = 'rgba(200,215,232,.12)'; o.lineWidth = 2; o.beginPath(); for (let i = 0; i < drops; i += 3) { const x = BX + 26 + rnd(i, 111) * (BW - 52), y = BH0 + 20 + ((rnd(i, 113) * 760 + gt * (40 + 60 * rnd(i, 114))) % 760); o.moveTo(x, y - 6); o.lineTo(x, y - 40 - 30 * rnd(i, 115)); } o.stroke();
    const fr = '#353d48', frL = `rgba(${150 + 60 * f | 0},${170 + 60 * f | 0},${185 + 50 * f | 0},.5)`;
    o.fillStyle = fr; o.fillRect(BX, BH0, 20, BB - BH0); o.fillRect(BX + BW - 20, BH0, 20, BB - BH0); o.fillRect(BX + BW / 2 - 6, BH0, 12, BB - BH0);
    o.fillStyle = frL; o.fillRect(BX + 17, BH0, 3, BB - BH0); o.fillRect(BX + BW - 20, BH0, 3, BB - BH0);
    o.fillStyle = fr; o.fillRect(BX, 870, BW, 12); o.fillRect(BX, 1210, BW, 10);
    o.fillStyle = '#252b34'; o.fillRect(BX + 20, 1220, BW / 2 - 26, BB - 1220); o.fillRect(BX + BW / 2 + 6, 1220, BW / 2 - 26, BB - 1220);
    o.fillStyle = 'rgba(0,0,0,.3)'; o.fillRect(BX + 20, 1290, BW - 40, BB - 1290);
    o.fillStyle = '#5a636e'; o.fillRect(BX + BW / 2 - 26, 1000, 8, 70); o.fillRect(BX + BW / 2 + 18, 1000, 8, 70);
    o.fillStyle = '#1c2129'; o.fillRect(BX - 6, BB, BW + 12, 14);
    // Leuchtkasten
    o.fillStyle = '#2b323c'; o.fillRect(BX - 8, BT - 12, BW + 16, 14); o.fillStyle = '#252b34'; o.fillRect(BX, BT, BW, BH0 - BT);
    const lg = o.createLinearGradient(0, BT + 10, 0, BH0 - 10); lg.addColorStop(0, `rgba(232,242,248,${fh})`); lg.addColorStop(1, `rgba(170,192,210,${fh})`); o.fillStyle = lg; o.fillRect(BX + 14, BT + 12, BW - 28, BH0 - BT - 22);
    txt(o, sign.toUpperCase(), BX + BW / 2, (BT + BH0) / 2 + 2, '700 58px Oswald', '#141c26', 'center', 'middle', 14);
    // auf die Hauptfläche + Spiegelung
    c.drawImage(boCv, BOX, BOY);
    // Spiegelung auf nassem Pflaster: gespiegelt, gestaucht, in breiten Streifen leicht versetzt + dunkle Wellenlinien
    c.save(); const sl = 50, RS = .72, RY = BB + 14;
    for (let yy = 0; yy < 600; yy += sl) { const srcH = sl / RS, srcY = BB + 14 - BOY - (yy + sl) / RS; if (srcY < 0) break;
      const dx = Math.sin(yy * .04 + gt * 2.6) * (2 + yy * .012); c.globalAlpha = .36 * (1 - yy / 600) * (1 - yy / 600);
      c.save(); c.translate(BOX + dx, RY + yy + sl); c.scale(1, -1); c.drawImage(boCv, 0, srcY, BOW, srcH, 0, 0, BOW, sl); c.restore(); }
    c.restore();
    c.save(); c.strokeStyle = 'rgba(5,7,10,.55)'; c.lineWidth = 3; c.beginPath();
    for (let k = 0; k < 16; k++) { const yy = RY + 14 + ((k * 37 + gt * 22) % 590), w = 60 + 140 * rnd(k, 151), x = BX + rnd(k + Math.floor((k * 37 + gt * 22) / 590) * 7, 152) * BW; c.moveTo(x - w / 2, yy); c.lineTo(x + w / 2, yy); }
    c.stroke(); c.restore();
    // ---- Licht ----
    const g = lightBegin();
    espot(g, 540, (BT + BH0) / 2, 330, 110, FLUO, .4 * fh); espot(g, 540, 860, 420, 520, FLUO, .14 * f);
    coneSpr('pb', 540, BB + 4, BW - 20, 540, 1450, BW + 300, FLUO, .12)(g, 1.4 * f);
    espot(g, 540, 1650, 230, 300, FLUO, .14 * f); espot(g, 540, (BT + BH0) / 2 + 1150, 200, 70, FLUO, .12 * fh);
    espot(g, 211, 422, 120, 120, REDL, .55 * red); espot(g, 211, 422, 34, 34, 'rgba(255,120,110,A)', .7 * red); espot(g, 218, 1700, 70, 330, REDL, .3 * red); espot(g, 218, 1470, 120, 40, REDL, .2 * red);
    espot(g, 1000, 690, 120, 100, WARM, .12);
    lightEnd(c);
    // Regen
    if (rain) {
      rainDraw(c, gt, { n: 170, speed: 1800, len: 50, lw: 1.5, col: 'rgba(160,178,205,.2)', seed: 31, slant: .06 });
      c.save(); c.beginPath(); c.rect(BX - 220, BT - 120, BW + 440, BB - BT + 360); c.clip(); rainDraw(c, gt, { n: 150, speed: 2100, len: 64, lw: 2, col: `rgba(210,232,240,${.18 + .3 * f})`, seed: 33, slant: .06, x0: BX - 260, x1: BX + BW + 260, y0: BT - 140, y1: BB + 240 }); c.restore();
      rainDraw(c, gt, { n: 70, speed: 2700, len: 100, lw: 2.8, col: 'rgba(190,205,228,.24)', seed: 37, slant: .08 });
      splashDraw(c, gt, { n: 30, x0: -60, x1: W + 60, y0: 1350, y1: 1440, col: 'rgba(190,210,225,.4)', s0: .6, s1: .9 });
      splashDraw(c, gt, { n: 44, x0: -100, x1: W + 100, y0: 1475, y1: 1950, col: 'rgba(175,190,215,.35)', s0: .9, s1: 1.7 });
      splashDraw(c, gt, { n: 10, x0: BX, x1: BX + BW, y0: BT - 14, y1: BT - 8, col: 'rgba(210,225,240,.4)', s0: .5, s1: .6 });
    }
    glowAt(c, 540, BH0 + 13, 200, 'rgba(235,250,255,A)', .3 * f); glowAt(c, 211, 422, 60, 'rgba(255,120,110,A)', .45 * red);
    PERF(p, 'phone_booth', T0, c);
  };

  // ===================== 4) POLICE_LIGHTS =====================
  SCENES.police_lights = (c, lt, b, gt) => {
    const p = b.p || {}, T0 = performance.now();
    const street = p.street !== false, house = p.house !== false, rain = !!p.rain, flash = p.flashlights !== false;
    const nCars = clamp(Math.round(num(p.cars, 2)), 0, 3), nOff = clamp(Math.round(num(p.officers, 3)), 0, 4);
    const suspect = p.arrest !== false, arrestT = suspect ? tv(p.arrest, -1) : null;
    blit(c, layer(`pl|${street ? 1 : 0}|${house ? 1 : 0}`, g => {
      drawSky(g, { top: '#020307', mid: '#070a11', bot: '#131a24', hz: 900, stars: 30 });
      for (let i = 0; i < 12; i++) treeAt(g, treeSpr(60 + (i % 4), '#0e141c', false), -PAD + i * 130 + rnd(i, 122) * 60, 1060, .26 + .14 * rnd(i, 121));
      const hz = g.createLinearGradient(0, 760, 0, 1060); hz.addColorStop(0, 'rgba(30,38,52,0)'); hz.addColorStop(1, 'rgba(30,38,52,.45)'); g.fillStyle = hz; g.fillRect(-PAD, 760, LW, 300);
      g.fillStyle = '#0a0e14'; g.fillRect(-PAD, 1000, LW, 80);
      if (house) {
        siding(g, 300, 740, 500, 330, '#121720', 14);
        g.fillStyle = '#10151d'; poly(g, [[312, 752], [550, 592], [788, 752]]); g.fill();
        g.save(); poly(g, [[312, 752], [550, 592], [788, 752]]); g.clip(); siding(g, 300, 580, 500, 180, '#10151d', 14); g.restore();
        g.fillStyle = '#0b0e14'; poly(g, [[270, 752], [550, 562], [830, 752], [790, 752], [550, 594], [310, 752]]); g.fill();
        g.strokeStyle = '#1e242d'; g.lineWidth = 4; g.beginPath(); g.moveTo(270, 752); g.lineTo(550, 562); g.lineTo(830, 752); g.stroke();
        g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(300, 752, 500, 318);
        for (const [wx, wy, lit] of [[352, 790, 0], [652, 790, 1], [352, 930, 0], [652, 930, 0]]) { g.fillStyle = '#20262e'; g.fillRect(wx - 6, wy - 6, 108, 96); g.fillStyle = lit ? 'rgba(200,140,75,.75)' : '#080b10'; g.fillRect(wx, wy, 96, 84);
          if (lit) { g.fillStyle = 'rgba(60,32,14,.8)'; g.fillRect(wx, wy, 22, 84); g.fillRect(wx + 74, wy, 22, 84); } g.fillStyle = '#20262e'; g.fillRect(wx + 45, wy, 6, 84); }
        g.fillStyle = '#20262e'; g.fillRect(504, 920, 92, 150); g.fillStyle = '#0a0c11'; g.fillRect(512, 928, 76, 142);
        g.fillStyle = '#1a1f26'; g.fillRect(280, 900, 540, 14);
      }
      g.fillStyle = '#0c1013'; g.fillRect(-PAD, 1070, LW, 70);
      g.fillStyle = street ? '#1a1f26' : '#0c1013'; g.fillRect(-PAD, 1140, LW, 30); if (street) { g.fillStyle = '#262c34'; g.fillRect(-PAD, 1170, LW, 7); }
      const sg = g.createLinearGradient(0, 1177, 0, H + PAD); sg.addColorStop(0, '#0d1016'); sg.addColorStop(1, '#050608'); g.fillStyle = sg; g.fillRect(-PAD, 1177, LW, H + PAD - 1177);
      for (let i = 0; i < 2200; i++) { g.fillStyle = rnd(i, 131) > .5 ? 'rgba(160,170,190,.045)' : 'rgba(0,0,0,.2)'; const y = 1180 + rnd(i, 132) * (H + PAD - 1180); g.fillRect(-PAD + rnd(i, 133) * LW, y, 2 + (y - 1180) / 400, 2); }
      if (street) { g.fillStyle = 'rgba(120,108,62,.28)'; for (let x = -PAD + 60; x < W + PAD; x += 240) g.fillRect(x, 1600, 140, 10); }
      for (let i = 0; i < 7; i++) { const x = -100 + rnd(i, 141) * (W + 200), y = 1420 + rnd(i, 142) * 480, rx = 120 + 160 * rnd(i, 143); g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x, y, rx, rx * .12, 0, 0, TAU); g.fill(); }
    }));
    cloudLayer(c, { y0: 100, y1: 420, n: 5, speed: 15, alpha: .38, seed: 41 }, gt, 370, 458);
    // Autos: A vorn (Festnahme vor der hellen Fahrertür), B links hinten, C rechts hinten
    const CARS = [{ x: 700, y: 1318, L: 880, dir: -1, ph: 0, head: 1 }, { x: 10, y: 1212, L: 600, dir: 1, ph: .43 }, { x: 1150, y: 1204, L: 580, dir: -1, ph: .21 }].slice(0, nCars);
    const SB = CARS.map(q => strobe(gt, q.ph));
    const red = SB.reduce((a, s) => Math.max(a, s[0]), 0), blue = SB.reduce((a, s) => Math.max(a, s[1]), 0);
    const dom = red > blue ? 'r' : 'b', domA = Math.max(red, blue);
    const carInfo = [];
    [2, 1, 0].forEach(i => { const q = CARS[i]; if (!q) return; carInfo[i] = car(c, q.x, q.y, q.L, { dir: q.dir, police: SB[i], head: q.head || 0, tail: .5, panel: '#454c57' }); });
    // Personen vorab berechnen (Taschenlampen-Strahlen brauchen die Hände)
    const SX = 640, SY = 1352, SH = 330;
    let ak = 1, susO = null, sus = null;
    if (suspect) {
      ak = arrestT < 0 ? 1 : E.inOut(prog(lt, arrestT, arrestT + .75));
      const strug = ak >= 1 ? noise(gt * 2.4, 71) * .012 : 0, push = arrestT >= 0 && lt > arrestT ? Math.exp(-(lt - arrestT) * 5) * Math.sin((lt - arrestT) * 14) * .01 : 0;
      susO = { x: SX + lerp(-12, 0, ak), y: lerp(SY + 22, SY, ak), h: SH * lerp(1.02, 1, ak), o: { lean: lerp(0, .9, ak), stance: lerp(.04, .1, ak), sway: strug + push, arms: { hands: 1 - ak, behind: ak }, cuffs: ak > .85 ? 1 : 0, armCol: '#11141a', color: '#040506' } };
    }
    const OFF = [
      { x: suspect ? SX - 132 + 12 * ak : 470, y: 1346, h: 336, dir: 1, kind: suspect ? 'hold' : 'flash', tgt: [640, 1180] },
      { x: 905, y: 1362, h: 342, dir: -1, kind: 'flash', tgt: [646, 1190] },
      { x: 150, y: 1290, h: 296, dir: 1, kind: 'flash', tgt: [610, 1245] },
      { x: 1012, y: 1168, h: 200, dir: -1, kind: 'flash', tgt: [700, 880] },
    ].slice(0, nOff);
    const offO = OFF.map((q, i) => { const sway = noise(gt * .6, 80 + i) * .02, wob = noise(gt * 1.1, 90 + i) * .05;
      if (q.kind === 'hold' && susO) return { q, o: { dir: 1, lean: .1 + .06 * ak + sway, hat: 'cap', coat: 'short', color: '#05070a', width: .21 }, hold: true };
      return { q, wob, o: { dir: q.dir, lean: sway, arms: flash ? 'flash' : 'down', hat: 'cap', coat: 'short', color: '#05070a', width: .21, hands: flash ? [[.31, -.17 + wob, 1], [.05, .03, 1]] : null } }; });
    const beams = [];
    offO.forEach(e => { if (e.hold || !flash) return; const r = person(c, e.q.x, e.q.y, e.q.h, { ...e.o, dry: true }), tgt = e.q.tgt, ang = Math.atan2(tgt[1] - r.hand[1], tgt[0] - r.hand[0]) + e.wob * .5;
      e.ang = ang; beams.push([r.hand[0], r.hand[1], ang, e.q.h, Math.hypot(tgt[0] - r.hand[0], tgt[1] - r.hand[1])]); });
    // ---- Licht (ein Durchgang): Wäsche, Lichtbalken, rotierende Strahlen, Scheinwerfer, Taschenlampen ----
    const g = lightBegin();
    CARS.forEach((q, i) => { const [r, bl] = SB[i], ci = carInfo[i], sc = q.L / 880, bx = ci.roof[0], by = ci.roof[1];
      espot(g, bx - 280 * sc, by + 110, 1100 * sc, 700 * sc, REDL, .4 * r); espot(g, bx + 280 * sc, by + 110, 1100 * sc, 700 * sc, BLUEL, .46 * bl);
      if (house) { espot(g, 420, 840, 520, 320, REDL, .22 * r * sc); espot(g, 690, 840, 520, 320, BLUEL, .24 * bl * sc); }
      if (street) { espot(g, ci.barR[0], q.y + 360, 50 * sc, 480 * sc, REDL, .55 * r); espot(g, ci.barB[0], q.y + 360, 50 * sc, 480 * sc, BLUEL, .6 * bl);
        espot(g, ci.barR[0], q.y + 120, 160 * sc, 60 * sc, REDL, .3 * r); espot(g, ci.barB[0], q.y + 120, 160 * sc, 60 * sc, BLUEL, .32 * bl); }
      espot(g, ci.barR[0], ci.barR[1], 200 * sc, 110 * sc, REDL, .8 * r); espot(g, ci.barB[0], ci.barB[1], 200 * sc, 110 * sc, BLUEL, .85 * bl);
      for (const [pos, col, a0, ofs] of [[ci.barR, REDL, r, 0], [ci.barB, BLUEL, bl, Math.PI]]) { const th = gt * 4.2 + q.ph * 9 + ofs, cs = Math.cos(th), sn = Math.sin(th);
        beam(g, pos[0], pos[1], cs > 0 ? .07 : Math.PI - .07, 1000 * Math.abs(cs) * sc + 80, .035 + .1 * Math.max(0, sn), col, (.22 + .3 * a0) * (.35 + .65 * Math.abs(cs)));
        if (sn > .85) espot(g, pos[0], pos[1], 400 * sc, 150 * sc, col, .45 * (sn - .85) / .15); }
      if (q.head) { const hp = ci.head; beam(g, hp[0], hp[1], q.dir > 0 ? .05 : Math.PI - .05, 900, .1, 'rgba(240,236,220,A)', .5); espot(g, hp[0] + q.dir * 380, q.y + 20, 420, 60, 'rgba(240,236,220,A)', .35);
        if (street) espot(g, hp[0], q.y + 280, 40, 300, 'rgba(240,236,220,A)', .22); } });
    if (house) { espot(g, 700, 832, 70, 60, WARM, .35); espot(g, 550, 912, 60, 30, WARM, .2); }
    beams.forEach(([x, y, ang, h, dist]) => { const L = Math.max(380, dist * 1.5); beam(g, x, y, ang, L, .07, WHITEL, .6);
      espot(g, x + Math.cos(ang) * dist, y + Math.sin(ang) * dist, 80, 70, WHITEL, .22); });
    espot(g, 540, 1960, 900, 240, dom === 'r' ? REDL : BLUEL, .14 * domA);
    lightEnd(c);
    // Personen (bleiben dunkle Silhouetten mit Kantenlicht)
    const rimC = (k = 1) => dom === 'r' ? `rgba(255,55,48,${.6 * red * k})` : `rgba(70,120,255,${.6 * blue * k})`;
    if (susO) sus = personBack(c, susO.x, susO.y, susO.h, { ...susO.o, rim: [{ col: rimC(), side: 1, w: .008 }, { col: `rgba(215,222,236,${flash && nOff > 1 ? .4 : 0})`, side: -1, w: .007 }] });
    offO.forEach((e, i) => { const q = e.q, rim = [{ col: rimC(.8), side: q.dir > 0 ? 1 : -1, w: .008 }];
      if (e.hold) { person(c, q.x, q.y, q.h, { ...e.o, rim, handAbs: [sus.shoulderL[0] + 8, sus.shoulderL[1] + 6], handAbs2: [sus.elbowL[0] + 6, sus.elbowL[1] + 4] }); return; }
      const r = person(c, q.x, q.y, q.h, { ...e.o, rim });
      if (flash) { const ang = e.ang; c.save(); c.strokeStyle = '#1d2229'; c.lineCap = 'round'; c.lineWidth = q.h * .035; c.beginPath(); c.moveTo(r.hand[0] - Math.cos(ang) * q.h * .03, r.hand[1] - Math.sin(ang) * q.h * .03); c.lineTo(r.hand[0] + Math.cos(ang) * q.h * .06, r.hand[1] + Math.sin(ang) * q.h * .06); c.stroke(); c.restore();
        glowAt(c, r.hand[0] + Math.cos(ang) * q.h * .065, r.hand[1] + Math.sin(ang) * q.h * .065, q.h * .09, WHITEL, .9); } });
    CARS.forEach((q, i) => { const ci = carInfo[i], [r, bl] = SB[i], sc = q.L / 880; glowAt(c, ci.barR[0], ci.barR[1], 60 * sc, 'rgba(255,140,130,A)', .6 * r); glowAt(c, ci.barB[0], ci.barB[1], 60 * sc, 'rgba(140,180,255,A)', .6 * bl);
      if (q.head) glowAt(c, ci.head[0], ci.head[1], 46 * sc, 'rgba(255,250,235,A)', .55); glowAt(c, ci.tail[0], ci.tail[1], 40 * sc, REDL, .45); });
    if (rain) { rainDraw(c, gt, { n: 170, speed: 1800, len: 52, lw: 1.5, col: 'rgba(170,185,210,.2)', seed: 41 }); rainDraw(c, gt, { n: 70, speed: 2600, len: 95, lw: 2.6, col: 'rgba(190,205,228,.25)', seed: 43 });
      splashDraw(c, gt, { n: 50, x0: -100, x1: W + 100, y0: 1380, y1: 1950, col: dom === 'r' ? 'rgba(230,150,150,.35)' : 'rgba(150,170,240,.35)', s0: .8, s1: 1.7 }); }
    // Datumszeile (Schreibmaschine)
    if (p.text) { const q = typeof p.text === 'string' ? { s: p.text } : p.text, s = String(q.s || ''), at = tv(q.at, .4), cps = num(q.cps, 16), y = num(q.y, 430);
      if (s && lt >= at) { const n = Math.min(s.length, Math.floor((lt - at) * cps)), fsz = num(q.size, 54), font = `400 ${fsz}px Elite`;
        c.save(); c.font = font; c.letterSpacing = '5px'; const tw = Math.min(c.measureText(s).width, 860); c.letterSpacing = '0px';
        const bg = c.createLinearGradient(0, y - 90, 0, y + 46); bg.addColorStop(0, 'rgba(0,0,0,0)'); bg.addColorStop(.5, 'rgba(0,0,0,.6)'); bg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = bg; c.fillRect(-PAD, y - 90, LW, 136);
        glow(c, 'rgba(255,40,40,.35)', 14); txt(c, s.slice(0, n), 540 - tw / 2, y, font, '#eef0f4', 'left', 'alphabetic', 5); noGlow(c);
        c.font = font; c.letterSpacing = '5px'; const cw = c.measureText(s.slice(0, n)).width; c.letterSpacing = '0px';
        if (n < s.length || (gt % 1) < .55) { c.fillStyle = n < s.length ? '#ff3a3a' : 'rgba(255,58,58,.85)'; c.fillRect(540 - tw / 2 + cw + 6, y - fsz * .74, fsz * .4, fsz * .85); }
        const t1 = at + s.length / cps, uk = n >= s.length ? E.out(prog(lt, t1, t1 + .5)) : 0; if (uk > 0) { c.fillStyle = 'rgba(255,40,40,.85)'; c.fillRect(540 - tw / 2 * uk, y + 20, tw * uk, 3); }
        c.restore(); } }
    PERF(p, 'police_lights', T0, c);
  };
})();
