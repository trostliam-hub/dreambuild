'use strict';
// Szenen „Hof 1922“ (Hinterkaifeck): einsamer Einödhof, Wohnhaus und Stadel unter einem langen Dach, Wald dahinter.
// farm_snow, footprints, attic, barn, kitchen_old, investigators_old – alle Parameter: SCENE_REF_tc_farm.md
(() => {
  const RX = -200, RY = -200, RW = W + 400, RH = H + 400; // Zeichenfläche inkl. Rand für Zoom/Shake
  const mod = (a, m) => ((a % m) + m) % m;
  const num = (v, d) => (typeof v === 'number' && isFinite(v)) ? v : d;
  // „true|t“-Parameter: true = von Anfang an (0), Zahl = ab Sekunde t, false = aus, fehlt = d
  const tOn = (v, d = null) => v === true ? 0 : typeof v === 'number' ? v : v === false ? null : d;
  const obj = v => (v && typeof v === 'object' && !Array.isArray(v)) ? v : {};

  // ---------- Ebenen-Cache (statische Hintergründe) ----------
  const LAYERS = new Map();
  function layer(key, draw, rect) { // Ebene in Szenen-Koordinaten; ohne rect = ganze Fläche inkl. Rand (LRU, max. 10)
    let cv = LAYERS.get(key);
    if (cv) { LAYERS.delete(key); LAYERS.set(key, cv); return cv; }
    const [x, y, w, h] = rect || [RX, RY, RW, RH];
    cv = document.createElement('canvas'); cv.width = Math.ceil(w); cv.height = Math.ceil(h); cv.ox = x; cv.oy = y;
    const g = cv.getContext('2d'); g.translate(-x, -y); draw(g);
    LAYERS.set(key, cv); if (LAYERS.size > 10) LAYERS.delete(LAYERS.keys().next().value);
    return cv;
  }
  function visRect(c) { // sichtbarer Ausschnitt in Szenen-Koordinaten (Kamera-Zoom/-Shake berücksichtigt), auf den Rand begrenzt
    const m = c.getTransform().inverse(); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [px, py] of [[0, 0], [W, 0], [0, H], [W, H]]) { const x = m.a * px + m.c * py + m.e, y = m.b * px + m.d * py + m.f; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    x0 = Math.max(RX, Math.floor(x0) - 4); y0 = Math.max(RY, Math.floor(y0) - 4); x1 = Math.min(RX + RW, Math.ceil(x1) + 4); y1 = Math.min(RY + RH, Math.ceil(y1) + 4);
    return [x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0)];
  }
  const blit = (c, cv) => { const [x, y, w, h] = visRect(c); c.drawImage(cv, x - RX, y - RY, w, h, x, y, w, h); };
  const fillVis = (c, style) => { const [x, y, w, h] = visRect(c); c.fillStyle = style; c.fillRect(x, y, w, h); };

  // ---------- Sprites ----------
  const SPR = {};
  function sprite(name) {
    if (SPR[name]) return SPR[name];
    const s = document.createElement('canvas'), g = s.getContext('2d');
    if (name === 'smoke') {
      s.width = s.height = 128;
      for (let i = 0; i < 11; i++) { const x = 64 + (hash(i * 3.1) - .5) * 46, y = 64 + (hash(i * 5.7) - .5) * 46, r = 20 + hash(i * 1.3) * 22;
        const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.32)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
    } else {
      s.width = s.height = 64; const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      if (name === 'flake') { gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.28, 'rgba(255,255,255,.85)'); gr.addColorStop(.55, 'rgba(255,255,255,.16)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); }
      else { const col = name === 'warm' ? '255,200,140' : '255,255,255'; gr.addColorStop(0, `rgba(${col},1)`); gr.addColorStop(.4, `rgba(${col},.42)`); gr.addColorStop(1, `rgba(${col},0)`); }
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    }
    return SPR[name] = s;
  }

  // ---------- Atmosphäre ----------
  function snowfall(c, t, o = {}) { // deterministischer Schneefall, Tiefe steuert Größe/Tempo
    const n = o.n || 180, x0 = o.x0 != null ? o.x0 : RX, x1 = o.x1 != null ? o.x1 : W - RX, y0 = o.y0 != null ? o.y0 : RY, y1 = o.y1 != null ? o.y1 : H - RY;
    const s0 = o.s0 || 2, s1 = o.s1 || 9, v0 = o.v0 || 45, v1 = o.v1 || 170, wind = o.wind != null ? o.wind : .3, A = o.alpha != null ? o.alpha : .8, sd = o.seed || 0;
    const spr = sprite('flake'), wx = x1 - x0, hy = y1 - y0;
    for (let i = 0; i < n; i++) {
      const d = hash(i * 3.17 + sd * 11.3), e = d * d, r = lerp(s0, s1, e), v = lerp(v0, v1, d);
      const y = y0 + mod(hash(i * 7.31 + sd) * hy + t * v, hy);
      const x = x0 + mod(hash(i * 1.93 + sd * 5) * wx + t * v * wind + Math.sin(t * (.5 + d * .9) + i * 1.7) * (8 + 22 * d), wx);
      c.globalAlpha = A * (.3 + .7 * d); c.drawImage(spr, x - r, y - r, r * 2, r * 2);
    }
    c.globalAlpha = 1;
  }
  function smokePlume(c, lt, ts, x, y, s = 1, o = {}) { // aufsteigender Rauch aus weichen Wolken
    const N = o.n || 16, L = o.life || 7, spr = sprite('smoke'), rise = o.rise || 30, drift = o.drift != null ? o.drift : 12, A = o.alpha || .3, sd = o.seed || 0;
    for (let j = 0; j < N; j++) {
      let a = lt - (ts + j * L / N); if (a < 0) continue; a = mod(a, L);
      const k = a / L, wob = noise(a * .45 + j * 1.7, j + sd) * 16 * Math.min(1, a * .6);
      const px = x + (a * drift + a * a * .8 + wob) * s, py = y - (a * rise + a * a * 1.1) * s;
      const r = (9 + a * 12) * s, al = A * Math.min(1, a * 2.2) * (1 - k) * (1 - k * .3);
      c.globalAlpha = al; c.drawImage(spr, px - r, py - r, r * 2, r * 2);
    }
    c.globalAlpha = 1;
  }
  let MK = null; const MS = .25;
  function darkMask(c, d, lights) { // Dunkelheit (halbe Auflösung) mit weichen Lichtlöchern
    if (!MK) { MK = document.createElement('canvas'); MK.width = Math.ceil(RW * MS); MK.height = Math.ceil(RH * MS); }
    const g = MK.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, MK.width, MK.height);
    g.fillStyle = `rgba(0,0,0,${clamp(d)})`; g.fillRect(0, 0, MK.width, MK.height);
    g.setTransform(MS, 0, 0, MS, -RX * MS, -RY * MS); g.globalCompositeOperation = 'destination-out';
    for (const L of lights) {
      if (!L || !(L.a > 0) || !(L.r > 1)) continue;
      const gr = g.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r);
      gr.addColorStop(0, `rgba(0,0,0,${clamp(L.a)})`); gr.addColorStop(L.m || .4, `rgba(0,0,0,${clamp(L.a) * .62})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.save(); g.translate(L.x, L.y); g.scale(1, L.sy || 1); g.translate(-L.x, -L.y); g.fillRect(L.x - L.r, L.y - L.r, 2 * L.r, 2 * L.r); g.restore();
    }
    g.globalCompositeOperation = 'source-over'; g.setTransform(1, 0, 0, 1, 0, 0);
    // Nächster-Nachbar-Vergrößerung: die Maske ist so weich, dass keine Stufen sichtbar werden – und halb so teuer wie bilinear
    const [x, y, w, h] = visRect(c); c.imageSmoothingEnabled = false; c.drawImage(MK, (x - RX) * MS, (y - RY) * MS, w * MS, h * MS, x, y, w, h); c.imageSmoothingEnabled = true;
  }
  function addGlow(c, x, y, r, rgb, a, sy = 1) { // additives Licht
    if (!(a > 0) || !(r > 0)) return;
    c.save(); c.globalCompositeOperation = 'lighter'; c.translate(x, y); c.scale(1, sy); spot(c, 0, 0, r, `rgba(${rgb},A)`, clamp(a)); c.restore();
  }
  function poly(c, pts) { c.beginPath(); pts.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.closePath(); }
  function beam(c, a, b, w0, w1, col) { // Balken als Trapez zwischen zwei Bildpunkten
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    c.fillStyle = col; c.beginPath(); c.moveTo(a[0] + nx * w0 / 2, a[1] + ny * w0 / 2); c.lineTo(b[0] + nx * w1 / 2, b[1] + ny * w1 / 2);
    c.lineTo(b[0] - nx * w1 / 2, b[1] - ny * w1 / 2); c.lineTo(a[0] - nx * w0 / 2, a[1] - ny * w0 / 2); c.closePath(); c.fill();
  }
  function hull(pts) { // konvexe Hülle (Andrew)
    const P = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const p of P) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  function shadowSprite(hh) { // weiche, dunkle Gestalt (Schultern + Kopf), einmal unscharf vorgerendert
    const key = 'shadow' + Math.round(hh); if (SPR[key]) return SPR[key];
    const bl = 22, s = document.createElement('canvas'); s.width = Math.ceil(hh * .4 + bl * 4); s.height = Math.ceil(hh + bl * 4);
    const g = s.getContext('2d'), x = s.width / 2, yb = s.height - bl * 2;
    g.shadowColor = '#000'; g.shadowBlur = bl; g.shadowOffsetX = 5000; g.translate(-5000, 0); g.fillStyle = '#000'; g.beginPath();
    g.moveTo(x - hh * .13, yb); g.quadraticCurveTo(x - hh * .17, yb - hh * .45, x - hh * .175, yb - hh * .68); g.quadraticCurveTo(x - hh * .16, yb - hh * .77, x - hh * .055, yb - hh * .8);
    g.lineTo(x - hh * .04, yb - hh * .83); g.ellipse(x, yb - hh * .895, hh * .062, hh * .078, 0, Math.PI * .68, Math.PI * .32 + Math.PI * 2, false);
    g.lineTo(x + hh * .055, yb - hh * .8); g.quadraticCurveTo(x + hh * .16, yb - hh * .77, x + hh * .175, yb - hh * .68); g.quadraticCurveTo(x + hh * .17, yb - hh * .45, x + hh * .13, yb); g.closePath(); g.fill();
    return SPR[key] = s;
  }
  function lanternBody(c, x, y, s, fl, ang = 0) { // Sturmlaterne; (x,y) = Mitte des Glases, s = Maßstab (1 ≈ 90 px hoch)
    c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
    c.strokeStyle = '#211b17'; c.lineWidth = 3.5; c.beginPath(); c.arc(0, -44, 15, Math.PI, 0); c.stroke();
    c.fillStyle = '#29221d'; c.beginPath(); c.moveTo(-21, -27); c.lineTo(21, -27); c.lineTo(11, -42); c.lineTo(-11, -42); c.closePath(); c.fill();
    const g = c.createRadialGradient(0, 3, 2, 0, 3, 30); g.addColorStop(0, `rgba(255,240,195,${.95 * fl})`); g.addColorStop(.5, `rgba(255,172,82,${.8 * fl})`); g.addColorStop(1, `rgba(120,60,25,${.55 * fl + .15})`);
    c.fillStyle = g; c.beginPath(); c.ellipse(0, 1, 17, 27, 0, 0, 7); c.fill();
    c.fillStyle = `rgba(255,252,230,${fl})`; c.beginPath(); c.ellipse(0, 5, 3.6, 9 * (.8 + .2 * fl), 0, 0, 7); c.fill();
    c.strokeStyle = 'rgba(36,29,24,.95)'; c.lineWidth = 2.6; c.beginPath(); for (const xx of [-16, 0, 16]) { c.moveTo(xx, -26); c.lineTo(xx * .92, 28); } c.stroke();
    c.fillStyle = '#29221d'; c.fillRect(-21, 26, 42, 7); c.beginPath(); c.ellipse(0, 33, 21, 5, 0, 0, 7); c.fill();
    c.restore();
  }
  function motes(c, gt, cx, cy, R, n, sd, a0 = .55) { // Staub im Licht, nur nahe der Lichtquelle sichtbar
    const spr = sprite('warm');
    for (let i = 0; i < n; i++) {
      const ox = (hash(i * 2.7 + sd) - .5) * 2 * R, oy = (hash(i * 4.1 + sd) - .5) * 2 * R;
      const x = cx + ox + noise(gt * .15 + i, i + sd) * 60, y = cy + mod(oy + gt * (6 + 10 * hash(i * 1.1)) + R, 2 * R) - R + Math.sin(gt * .4 + i) * 10;
      const dd = Math.hypot(x - cx, y - cy) / R; if (dd >= 1) continue;
      const tw = .6 + .4 * Math.sin(gt * (1 + hash(i)) * 2 + i), r = 1.6 + 3.2 * hash(i * 9.1);
      c.globalAlpha = a0 * Math.pow(1 - dd, 1.6) * tw; c.drawImage(spr, x - r * 2, y - r * 2, r * 4, r * 4);
    }
    c.globalAlpha = 1;
  }
  function labelText(c, s, x, y, a, o = {}) { // ruhiges Ortslabel mit feinen Linien
    if (!s || a <= 0) return;
    const col = o.col || '#e3e8f1', ls = o.ls != null ? o.ls : 6, fam = o.fam || 'Elite', maxW = o.maxW || 760;
    c.save(); c.globalAlpha = a; c.font = `400 44px ${fam}`; c.letterSpacing = ls + 'px'; let tw = c.measureText(s).width;
    let fs = Math.max(22, Math.min(44, Math.floor(44 * maxW / tw)));
    for (let i = 0; i < 12; i++) { c.font = `400 ${fs}px ${fam}`; tw = c.measureText(s).width; if (tw <= maxW || fs <= 22) break; fs -= 2; }
    const font = `400 ${fs}px ${fam}`; c.letterSpacing = '0px';
    glow(c, 'rgba(0,0,0,.9)', 18); txt(c, s, x, y, font, col, 'center', 'alphabetic', ls); noGlow(c);
    c.strokeStyle = o.line || 'rgba(220,228,240,.45)'; c.lineWidth = 2; const L = Math.min(90, 400 - tw / 2);
    if (L > 20) { c.beginPath(); c.moveTo(x - tw / 2 - 24 - L, y - 14); c.lineTo(x - tw / 2 - 24, y - 14); c.moveTo(x + tw / 2 + 24, y - 14); c.lineTo(x + tw / 2 + 24 + L, y - 14); c.stroke(); }
    c.restore();
  }

  // ---------- Fichten, kahler Baum ----------
  const tiers = h => Math.max(4, Math.round(h < 200 ? h / 16 : 12 + (h - 200) / 40));
  function spruce(g, x, y, h, w, sd) { // Pfad einer Fichte (ohne beginPath/fill)
    const T = tiers(h), th = h * .88 / T;
    g.moveTo(x, y - h);
    for (let i = 1; i <= T; i++) { const k = i / T, ww = w * .5 * (.1 + .9 * k) * (.8 + .4 * hash(sd + i)), yy = y - h + h * .1 + th * i;
      g.lineTo(x + ww * .38, yy - th * .62); g.lineTo(x + ww, yy + th * .12 * hash(sd + i * 2.3)); }
    g.lineTo(x + w * .04, y + 2); g.lineTo(x - w * .04, y + 2);
    for (let i = T; i >= 1; i--) { const k = i / T, ww = w * .5 * (.1 + .9 * k) * (.8 + .4 * hash(sd + i + 50)), yy = y - h + h * .1 + th * i;
      g.lineTo(x - ww, yy + th * .12 * hash(sd + i * 3.1)); g.lineTo(x - ww * .38, yy - th * .62); }
    g.closePath();
  }
  function spruceSnow(g, x, y, h, w, sd) { // helle Schneekanten auf einzelnen Ästen
    const T = tiers(h), th = h * .88 / T;
    g.beginPath();
    for (let i = 2; i <= T; i++) { const k = i / T, yy = y - h + h * .1 + th * i;
      for (const s of [1, -1]) { if (hash(sd + i * 7 + s) < .62) continue; const ww = w * .5 * (.1 + .9 * k) * (.8 + .4 * hash(sd + i + (s < 0 ? 50 : 0)));
        g.moveTo(x + s * ww * .45, yy - th * .52); g.lineTo(x + s * ww * .78, yy - th * .12); } }
    g.stroke();
  }
  const fnc = v => typeof v === 'function' ? v : () => v;
  function forestRow(g, x0, x1, base, h0, h1, col, sd, step, snow, wk = .38) {
    const B = fnc(base), H0 = fnc(h0), H1 = fnc(h1), S = fnc(step), trees = [];
    for (let x = x0, i = 0; x < x1 && i < 400; i++) {
      const h = lerp(H0(x), H1(x), hash(sd + i * 1.37)), w = h * (wk + .1 * hash(sd + i * 2.1));
      trees.push([x, B(x) + hash(sd + i * 4.4) * 6, h, w, sd + i * 9.1]); x += S(x) * (.45 + .7 * hash(sd + i * 3.3));
    }
    g.fillStyle = col; g.beginPath(); for (const t of trees) spruce(g, ...t); g.fill();
    if (snow) { g.strokeStyle = snow; g.lineCap = 'round'; for (const t of trees) { g.lineWidth = Math.max(1, t[2] * .011); spruceSnow(g, ...t); } }
    return trees;
  }
  function bareTree(g, x, y, len, ang, wd, dep, sd) {
    const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len, bend = (hash(sd) - .5) * len * .25;
    g.lineWidth = wd; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo((x + x2) / 2 + bend, (y + y2) / 2 - bend * .3, x2, y2); g.stroke();
    if (dep <= 0) return;
    const n = hash(sd * 1.3) > .55 ? 3 : 2;
    for (let i = 0; i < n; i++) { const a = ang + (i - (n - 1) / 2) * (.48 + hash(sd + i) * .3) + (hash(sd + i * 7) - .5) * .4 - .05;
      bareTree(g, x2, y2, len * (.6 + hash(sd + i * 3) * .2), a, wd * .64, dep - 1, sd * 1.7 + i * 13.3 + 1); }
  }

  // ---------- Der Hof: Wohnhaus + Stadel unter einem Dach, Giebelseite sichtbar ----------
  function rawGeo(X, Y, w) {
    const wh = w * .22, rise = w * .19, dx = -w * .19, dy = -w * .045, res = .44, ww = w * .05, wH = wh * .24;
    const win = [];
    for (const yy of [Y - wh * .32, Y - wh * .74]) for (const fx of [.08, .19, .3]) win.push({ x: X + w * fx - ww / 2, y: yy - wH / 2, w: ww, h: wH });
    for (const fx of [.51, .9]) win.push({ x: X + w * fx - ww * .4, y: Y - wh * .6, w: ww * .8, h: wH * .55 });
    const rY = Y + dy / 2 - wh - rise, rX = X + dx / 2;
    return { X, Y, w, wh, rise, dx, dy, res, win, rX, rY,
      door: { x: X + w * .365, y: Y - wh * .55, w: w * .055, h: wh * .55 },
      barn: { x: X + w * .6, y: Y - wh * .8, w: w * .2, h: wh * .8 },
      chim: { x: rX + w * .2, y: rY } };
  }
  function farmGeo(X, Y, w, mirror = true) { // mirror: Giebel rechts (Standard)
    const G = rawGeo(X, Y, w); if (!mirror) return { ...G, raw: G, mir: null };
    const cx = X + w / 2, mr = r => ({ ...r, x: 2 * cx - r.x - r.w });
    return { ...G, raw: G, mir: cx, win: G.win.map(mr), door: mr(G.door), barn: mr(G.barn), chim: { x: 2 * cx - G.chim.x, y: G.chim.y } };
  }
  function inFarm(c, G, f) { c.save(); if (G.mir != null) { c.translate(2 * G.mir, 0); c.scale(-1, 1); } f(); c.restore(); }
  function barnDoorDraw(g, G, gap, K) {
    const b = G.barn, hw = b.w / 2, lw = Math.max(1, G.w * .0025);
    g.fillStyle = K.frame; g.fillRect(b.x - lw * 2, b.y - lw * 2, b.w + lw * 4, b.h + lw * 2);
    g.fillStyle = K.inside; g.fillRect(b.x, b.y, b.w, b.h);
    const lv = hw * (1 - clamp(gap) * .86);
    for (const [x0, s] of [[b.x, 1], [b.x + b.w, -1]]) {
      const xl = s > 0 ? x0 : x0 - lv;
      g.fillStyle = K.barnDoor; g.fillRect(xl, b.y, lv, b.h);
      g.strokeStyle = K.board; g.lineWidth = lw; g.beginPath();
      for (let k = 1; k < 4; k++) { const x = xl + lv * k / 4; g.moveTo(x, b.y); g.lineTo(x, b.y + b.h); }
      g.moveTo(xl, b.y + b.h * .12); g.lineTo(xl + lv, b.y + b.h * .12); g.moveTo(xl, b.y + b.h * .88); g.lineTo(xl + lv, b.y + b.h * .88);
      g.moveTo(xl, b.y + b.h * .88); g.lineTo(xl + lv, b.y + b.h * .12); g.stroke();
    }
  }
  function farmDraw(g, G, K) {
    const { X, Y, w, wh, dx, dy, rX, rY } = G, ov = w * .02, lw = Math.max(1, w * .0025), rw = w * G.res;
    // Giebelwand
    g.fillStyle = K.gable; g.beginPath(); g.moveTo(X, Y); g.lineTo(X, Y - wh); g.lineTo(rX, rY); g.lineTo(X + dx, Y + dy - wh); g.lineTo(X + dx, Y + dy); g.closePath(); g.fill();
    if (K.gableWin) { g.fillStyle = K.win; for (const [fx, fy] of [[.3, .45], [.7, .45]]) g.fillRect(X + dx * fx - w * .011, Y + dy * fx - wh * fy - w * .013, w * .02, w * .026);
      g.fillRect(rX - w * .01, rY + G.rise * .5, w * .018, w * .022); }
    // Traufseite: Wohnteil verputzt, Stadel aus Brettern
    g.fillStyle = K.wall; g.fillRect(X, Y - wh, rw, wh);
    g.fillStyle = K.barn; g.fillRect(X + rw, Y - wh, w - rw, wh);
    g.strokeStyle = K.board; g.lineWidth = lw; g.beginPath();
    for (let x = X + rw + w * .014; x < X + w; x += w * .014) { g.moveTo(x, Y - wh); g.lineTo(x, Y); } g.stroke();
    g.fillStyle = K.trim; g.fillRect(X, Y - wh * .53, rw, Math.max(1.5, wh * .025));
    g.fillStyle = K.edge; g.fillRect(X + rw - lw, Y - wh, lw * 2.5, wh);
    G.win.forEach((r, i) => {
      if (K.shutter && i < 6) { g.fillStyle = K.shutter; g.fillRect(r.x - r.w * .55, r.y - r.h * .04, r.w * .42, r.h * 1.08); g.fillRect(r.x + r.w * 1.13, r.y - r.h * .04, r.w * .42, r.h * 1.08); }
      g.fillStyle = K.frame; g.fillRect(r.x - r.w * .12, r.y - r.h * .1, r.w * 1.24, r.h * 1.2);
      g.fillStyle = K.win; g.fillRect(r.x, r.y, r.w, r.h);
      if (K.glint) { g.fillStyle = K.glint; g.fillRect(r.x + r.w * .55, r.y + r.h * .08, r.w * .3, r.h * .3); }
    });
    const d = G.door; g.fillStyle = K.frame; g.fillRect(d.x - lw * 1.5, d.y - lw * 2, d.w + lw * 3, d.h + lw * 2); g.fillStyle = K.door; g.fillRect(d.x, d.y, d.w, d.h);
    barnDoorDraw(g, G, 0, K);
    const sh = g.createLinearGradient(0, Y - wh, 0, Y - wh * .75); sh.addColorStop(0, 'rgba(0,0,0,.55)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sh; g.fillRect(X, Y - wh, w, wh * .25);
    // Dach (verschneit)
    const rf = g.createLinearGradient(0, rY, 0, Y - wh); rf.addColorStop(0, K.roof[0]); rf.addColorStop(1, K.roof[1]);
    g.fillStyle = rf; g.beginPath(); g.moveTo(X - ov, Y - wh + ov * .4); g.lineTo(X + w + ov, Y - wh + ov * .4); g.lineTo(rX + w + ov * .4, rY - ov * .2); g.lineTo(rX - ov * .4, rY - ov * .2); g.closePath(); g.fill();
    if (K.roofLine) { g.strokeStyle = K.roofLine; g.lineWidth = lw; g.beginPath(); for (let k = .2; k < .95; k += .18) { const y0 = lerp(Y - wh, rY, k), x0 = lerp(X, rX, k); g.moveTo(x0 + w * .01, y0); g.lineTo(x0 + w - w * .01, y0); } g.stroke(); }
    g.strokeStyle = K.snowEdge; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = w * .016;
    g.beginPath(); g.moveTo(X + dx - ov, Y + dy - wh + ov * .4); g.lineTo(rX - ov * .4, rY - ov * .2); g.lineTo(X - ov, Y - wh + ov * .4); g.lineTo(X + w + ov, Y - wh + ov * .4); g.stroke();
    if (K.ice) { g.fillStyle = K.ice; g.beginPath(); const ey = Y - wh + ov * .4 + w * .007;
      for (let i = 0; i < 48; i++) { if (hash(i * 9.1) < .35) continue; const x = X + w * (.01 + i / 48 * .98) + hash(i * 3.3) * w * .01, L = w * (.006 + hash(i * 1.7) * .022);
        g.moveTo(x - w * .003, ey); g.lineTo(x + w * .003, ey); g.lineTo(x, ey + L); } g.fill(); }
    const ch = G.chim, cw = w * .03, chH = w * .06;
    g.fillStyle = K.chim; g.fillRect(ch.x - cw / 2, ch.y - chH, cw, chH + w * .02);
    g.fillStyle = K.snowEdge; rr(g, ch.x - cw * .65, ch.y - chH - w * .008, cw * 1.3, w * .012, w * .005); g.fill();
    if (K.drift) { g.fillStyle = K.drift; g.beginPath(); g.moveTo(X + dx - ov, Y + dy + w * .02); g.lineTo(X + dx - ov, Y + dy - wh * .05);
      for (let i = 0; i <= 30; i++) g.lineTo(X + w * i / 30, Y - wh * (.04 + .045 * hash(i * 2.7)) + (i === 0 ? 0 : 0));
      g.lineTo(X + w + ov * 2, Y + w * .02); g.closePath(); g.fill(); }
  }
  const K_NIGHT = { gable: '#121825', wall: '#232b3b', barn: '#181e2a', board: 'rgba(5,7,12,.55)', trim: '#2c3547', edge: '#10141d', shutter: '#141a26', frame: '#2f384a',
    win: '#070a10', glint: 'rgba(120,140,180,.16)', door: '#0f131b', barnDoor: '#1b212d', roof: ['#c3d0e6', '#7d91b2'], roofLine: 'rgba(60,75,105,.16)', snowEdge: '#dde6f4',
    ice: 'rgba(200,220,245,.7)', chim: '#1c2230', drift: '#6c7fa0', inside: '#010203', gableWin: true };
  const K_FAR = { gable: '#0a0f19', wall: '#121826', barn: '#0e131e', board: 'rgba(0,0,0,.35)', trim: '#151c2b', edge: '#0a0e16', shutter: null, frame: '#161d2b',
    win: '#05070b', glint: null, door: '#080b11', barnDoor: '#111723', roof: ['#7d8eac', '#55647f'], roofLine: null, snowEdge: '#93a3bf', ice: null, chim: '#0e131d', drift: '#46557a', inside: '#000', gableWin: false };
  const K_DAWN = { gable: '#4c525a', wall: '#5f656d', barn: '#4a4f57', board: 'rgba(20,22,26,.3)', trim: '#686e76', edge: '#40454c', shutter: '#464b52', frame: '#6b7178',
    win: '#262a30', glint: null, door: '#30343a', barnDoor: '#43484f', roof: ['#d0d3d6', '#acb0b5'], roofLine: 'rgba(90,95,100,.18)', snowEdge: '#e2e4e6',
    ice: 'rgba(225,228,232,.55)', chim: '#4a4f56', drift: '#a8acb1', inside: '#16181c', gableWin: true };

  // ---------- Fußabdrücke ----------
  // Stiefelumriss: (v längs −.5 Ferse … .5 Spitze, halbe Breite)
  const BOOT = [[.5, 0], [.47, .24], [.4, .4], [.29, .49], [.15, .5], [0, .45], [-.12, .36], [-.22, .38], [-.33, .42], [-.43, .37], [-.48, .24], [-.5, 0]];
  const SOLE = [[.5, 0], [.47, .24], [.4, .4], [.29, .49], [.15, .5], [0, .45], [-.1, .35]], HEEL = [[-.25, .37], [-.33, .42], [-.43, .37], [-.48, .24], [-.5, 0]];
  function smoothClosed(c, pts) {
    const n = pts.length; c.moveTo((pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2);
    for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; c.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); }
    c.closePath();
  }
  function footPath(c, P, X, Z, ang, L, Wd, k = 1, split = false) { // Abdruck auf einer Bodenebene, P(X,Z) → Bildpunkt; split = Absatz getrennt
    const cs = Math.cos(ang), sn = Math.sin(ang), pt = (u, v) => P(X + (u * Wd * cs + v * L * sn) * k, Z + (-u * Wd * sn + v * L * cs) * k);
    const ring = list => { const a = list.map(([v, hw]) => pt(hw, v)); for (let i = list.length - 1; i >= 0; i--) if (list[i][1] > 0) a.push(pt(-list[i][1], list[i][0])); return a; };
    c.beginPath(); for (const list of split ? [SOLE, HEEL] : [BOOT]) smoothClosed(c, ring(list));
  }
  function puff(c, x, y, s, age, sd, rx = 60) { // Pulverschnee stiebt beim Auftreten: Wölkchen + Spritzer vom Rand
    if (age < 0 || age > 1.1) return; const spr = sprite('flake'), soft = sprite('soft'), k = age / 1.1;
    const cr = (50 + 130 * E.out(k)) * s; c.globalAlpha = .5 * (1 - k) * Math.min(1, age * 8); c.drawImage(soft, x - cr, y - cr * .62 - 20 * s * E.out(k), cr * 2, cr * 1.1);
    for (let j = 0; j < 20; j++) {
      const ang = hash(sd + j * 5.3) * Math.PI * 2, ox = Math.cos(ang) * rx * s * .55, oy = Math.sin(ang) * rx * s * .3;
      const a = -Math.PI * (.12 + .76 * hash(sd + j * 1.7)), v = (90 + 170 * hash(sd + j * 3.1)) * s, sgn = Math.cos(ang) >= 0 ? 1 : -1;
      const px = x + ox + sgn * Math.abs(Math.cos(a)) * v * age * 1.1, py = y + oy + Math.sin(a) * v * age * .9 + 380 * s * age * age, r = (4 + 6 * hash(sd + j)) * s * (1 + age * .6);
      c.globalAlpha = .85 * (1 - k); c.drawImage(spr, px - r, py - r, 2 * r, 2 * r);
    }
    c.globalAlpha = 1;
  }

  // =====================================================================
  // 1) farm_snow – Totale bei Nacht: Hof, Schneefeld, Wald, Mond
  // =====================================================================
  const FS = { mx: 790, my: 430 };
  const fsEdge = x => 1010 + Math.max(0, 205 - x) * .95; // Waldrand links (Fußlinie)
  const fsG = () => farmGeo(212, 1010, 592);
  function moonDraw(g, mx, my, r) {
    let gr = g.createRadialGradient(mx, my, r * .8, mx, my, r * 11); gr.addColorStop(0, 'rgba(175,195,235,.3)'); gr.addColorStop(.25, 'rgba(120,145,200,.1)'); gr.addColorStop(1, 'rgba(80,100,160,0)');
    g.fillStyle = gr; g.fillRect(mx - r * 11, my - r * 11, r * 22, r * 22);
    gr = g.createRadialGradient(mx - r * .25, my - r * .25, r * .1, mx, my, r); gr.addColorStop(0, '#f6f8fb'); gr.addColorStop(1, '#cdd6e5');
    g.fillStyle = gr; g.beginPath(); g.arc(mx, my, r, 0, 7); g.fill();
    g.fillStyle = 'rgba(140,152,178,.26)'; for (const [ox, oy, rr0] of [[-.28, -.16, .26], [.2, .24, .18], [.32, -.32, .12], [-.1, .4, .14], [-.44, .2, .1]]) { g.beginPath(); g.arc(mx + ox * r, my + oy * r, rr0 * r, 0, 7); g.fill(); }
  }
  function farmSnowStatic(g, G, moon, forest) {
    const sk = g.createLinearGradient(0, RY, 0, 975);
    sk.addColorStop(0, '#02040a'); sk.addColorStop(.5, '#081120'); sk.addColorStop(.85, '#15223a'); sk.addColorStop(1, '#25344f');
    g.fillStyle = sk; g.fillRect(RX, RY, RW, 1300);
    for (let i = 0; i < 170; i++) { const x = RX + hash(i * 2.13) * RW, y = RY + hash(i * 5.71) * 1050, a = (.12 + .55 * hash(i * 9.1)) * clamp(1 - (y - 300) / 700, .12, 1);
      g.fillStyle = `rgba(215,225,250,${a})`; const s = hash(i * 3.3) > .92 ? 2.6 : 1.5; g.fillRect(x, y, s, s); }
    if (moon) moonDraw(g, FS.mx, FS.my, 48);
    g.fillStyle = '#0f192a'; g.beginPath(); g.moveTo(RX, 990); for (let x = RX; x <= W - RX; x += 40) g.lineTo(x, 900 + Math.sin(x * .005) * 22 + Math.sin(x * .013 + 2) * 9); g.lineTo(W - RX, 990); g.fill();
    if (forest) {
      forestRow(g, RX, W - RX, x => 935 + Math.sin(x * .007) * 8, 50, 110, '#0b1322', 11, 22);
      forestRow(g, RX, W - RX, x => 975 + Math.sin(x * .006 + 1) * 6, 190, 330, '#050a13', 23, 30, 'rgba(120,140,178,.11)');
    }
    // Schneefeld
    const sn = g.createLinearGradient(0, 966, 0, H - RY);
    sn.addColorStop(0, '#5d6f91'); sn.addColorStop(.14, '#44557a'); sn.addColorStop(.42, '#29354f'); sn.addColorStop(.7, '#18202f'); sn.addColorStop(1, '#0b0f19');
    g.fillStyle = sn; g.beginPath(); g.moveTo(RX, 972); for (let x = RX; x <= W - RX; x += 60) g.lineTo(x, 968 + Math.sin(x * .01) * 3); g.lineTo(W - RX, H - RY); g.lineTo(RX, H - RY); g.closePath(); g.fill();
    for (const [x, y, rx, ry, a, col] of [[640, 1090, 620, 34, .07, '170,192,232'], [260, 1270, 760, 60, .05, '170,192,232'], [820, 1420, 820, 90, .04, '160,185,228'],
      [420, 1160, 700, 26, .18, '0,0,0'], [700, 1330, 900, 50, .14, '0,0,0']]) {
      g.save(); g.translate(x, y); g.scale(1, ry / rx); if (col !== '0,0,0') g.globalCompositeOperation = 'lighter'; spot(g, 0, 0, rx, `rgba(${col},A)`, a); g.restore(); }
    inFarm(g, G, () => farmDraw(g, G.raw, K_NIGHT));
    // Zaun rechts im Vordergrund
    g.strokeStyle = '#090d15'; g.lineCap = 'round';
    const fpost = []; for (let i = 0; i < 7; i++) { const k = i / 6, x = lerp(1180, 860, Math.pow(k, .8)), y = lerp(1470, 1040, Math.pow(k, .75)), h = lerp(120, 34, k); fpost.push([x, y, h]); }
    for (const [x, y, h] of fpost) { g.lineWidth = Math.max(3, h * .11); g.beginPath(); g.moveTo(x, y); g.lineTo(x + h * .04, y - h); g.stroke(); }
    for (const fy of [.42, .78]) { g.lineWidth = 3.5; g.beginPath(); fpost.forEach(([x, y, h], i) => { const yy = y - h * fy; i ? g.lineTo(x, yy) : g.moveTo(x, yy); }); g.stroke(); }
    g.fillStyle = '#b9c6dc'; for (const [x, y, h] of fpost) { rr(g, x - h * .08, y - h - h * .05, h * .2, h * .08, 3); g.fill(); }
    // Waldrand links (näher als der Hof)
    if (forest) {
      const sh = g.createLinearGradient(0, 1000, 0, 1500); sh.addColorStop(0, 'rgba(0,0,0,.32)'); sh.addColorStop(1, 'rgba(0,0,0,.05)');
      g.fillStyle = sh; g.beginPath(); g.moveTo(205, 1010); g.lineTo(RX, fsEdge(RX)); g.lineTo(RX, fsEdge(RX) + 40); g.lineTo(255, 1030); g.closePath(); g.fill();
      forestRow(g, RX, 120, x => fsEdge(x) - 30, x => 300 + (205 - x) * .5, x => 380 + (205 - x) * .6, '#060b15', 47, 34, null, .36); // hintere Reihe
      forestRow(g, RX, 190, x => fsEdge(x), x => 320 + (205 - x) * .6, x => 400 + (205 - x) * .7, '#03060c', 41, x => 34 + (205 - x) * .1, 'rgba(150,170,210,.09)', .38);
    }
    // trockene Halme im Vordergrund (statischer Teil)
    g.strokeStyle = '#05080e'; g.lineCap = 'round';
    for (let i = 0; i < 36; i++) { const side = i % 2, x = side ? lerp(820, 1180, hash(i * 3.1)) : lerp(-120, 260, hash(i * 3.1)), y = 1680 + hash(i * 5.3) * 240, L = 40 + hash(i * 7.7) * 100, a = -Math.PI / 2 + (hash(i * 2.2) - .5) * .6;
      g.lineWidth = 1.5 + hash(i) * 2.5; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * L * .5, y + Math.sin(a) * L * .5, x + Math.cos(a) * L + (hash(i * 9) - .5) * 30, y + Math.sin(a) * L); g.stroke(); }
    // kahler Baum rechts vor dem Giebel
    g.strokeStyle = '#05080e'; g.lineCap = 'round'; bareTree(g, 1012, 1190, 250, -Math.PI / 2 - .1, 22, 6, 3.7);
    g.fillStyle = '#6b7ea0'; g.beginPath(); g.ellipse(1012, 1192, 60, 9, 0, 0, 7); g.fill();
  }
  function parseLit(v) { // [0,1] oder [{i, on, off}]
    if (v === false || v == null) return [];
    return (Array.isArray(v) ? v : [v]).map(e => typeof e === 'number' ? { i: e, on: null, off: null } : { i: e.i | 0, on: e.on != null ? e.on : null, off: e.off != null ? e.off : null });
  }
  function windowGlow(c, r, a, gt, i, spill, snowY) {
    if (a <= 0) return;
    const f = (.86 + .14 * noise(gt * 2.6, i * 5.3)) * a;
    c.save();
    const g = c.createLinearGradient(0, r.y, 0, r.y + r.h); g.addColorStop(0, `rgba(255,214,140,${f})`); g.addColorStop(1, `rgba(236,140,60,${f})`);
    glow(c, `rgba(255,170,80,${.9 * f})`, 26); c.fillStyle = g; c.fillRect(r.x, r.y, r.w, r.h); noGlow(c);
    c.fillStyle = `rgba(30,18,10,${.85})`; c.fillRect(r.x + r.w / 2 - 1.2, r.y, 2.4, r.h); c.fillRect(r.x, r.y + r.h * .45, r.w, 2.4);
    c.restore();
    addGlow(c, r.x + r.w / 2, r.y + r.h / 2, r.w * 2.4, '255,160,70', .22 * f);
    if (spill) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .28 * f; const sx = r.x + r.w / 2, sy = snowY + 14;
      const gg = c.createRadialGradient(sx, sy, 0, sx, sy, r.w * 2.6); gg.addColorStop(0, 'rgba(255,170,90,1)'); gg.addColorStop(1, 'rgba(255,170,90,0)');
      c.translate(sx, sy); c.scale(1, .22); c.translate(-sx, -sy); c.fillStyle = gg; c.fillRect(sx - r.w * 2.6, sy - r.w * 2.6, r.w * 5.2, r.w * 5.2); c.restore(); }
  }
  function tinyFigure(c, x, y, h, t, col = '#020306', rim = 'rgba(165,185,220,.5)') { // kleine dunkle Gestalt (Mantel), keine Details
    const sw = noise(t * .6, 4) * h * .01;
    c.save(); c.fillStyle = col;
    c.beginPath(); c.moveTo(x - h * .07, y); c.lineTo(x - h * .05, y - h * .3); c.quadraticCurveTo(x - h * .16 + sw, y - h * .34, x - h * .13 + sw, y - h * .7);
    c.quadraticCurveTo(x - h * .1 + sw, y - h * .8, x + sw, y - h * .8); c.quadraticCurveTo(x + h * .1 + sw, y - h * .8, x + h * .13 + sw, y - h * .7);
    c.quadraticCurveTo(x + h * .16 + sw, y - h * .34, x + h * .05, y - h * .3); c.lineTo(x + h * .07, y); c.closePath(); c.fill();
    c.beginPath(); c.ellipse(x + sw * 1.2, y - h * .885, h * .062, h * .075, 0, 0, 7); c.fill();
    if (rim) { c.strokeStyle = rim; c.lineWidth = Math.max(1, h * .018); c.beginPath(); c.moveTo(x + h * .13 + sw, y - h * .7); c.quadraticCurveTo(x + h * .16 + sw, y - h * .34, x + h * .07, y - h * .05); c.stroke();
      c.beginPath(); c.arc(x + sw * 1.2, y - h * .885, h * .068, -1.2, .6); c.stroke(); }
    c.restore();
  }
  SCENES.farm_snow = (c, lt, b, gt) => {
    const p = b.p || {};
    const moon = p.moon !== false, forest = p.forest !== false, dark = clamp(num(p.dark, .15));
    const G = fsG();
    blit(c, layer(`farm|${moon}|${forest}`, g => farmSnowStatic(g, G, moon, forest)));
    // Sterne funkeln, Wolkenfetzen ziehen am Mond vorbei
    for (let i = 0; i < 28; i++) { const x = RX + hash(i * 4.7 + 1) * RW, y = RY + 120 + hash(i * 8.3 + 2) * 720, a = Math.pow(clamp(noise(gt * 1.3, i * 3.1) * .5 + .5), 3) * .9;
      c.fillStyle = `rgba(230,236,255,${a})`; c.fillRect(x - 1, y - 1, 2.6, 2.6); }
    const sp = sprite('soft');
    if (moon) { addGlow(c, FS.mx, FS.my, 240, '150,175,225', .06 + .03 * noise(gt * .4, 7));
      for (let i = 0; i < 4; i++) { const cx = mod(gt * (8 + i * 3) + i * 430, 1700) - 300, cy = 340 + i * 64 + Math.sin(gt * .1 + i) * 10;
        c.globalAlpha = .08 + .05 * hash(i); c.drawImage(sp, cx - 360, cy - 24, 720, 48); } c.globalAlpha = 1; }
    // Kaminrauch
    const sm = p.smoke === undefined ? true : p.smoke, ts = sm === true ? -30 : (typeof sm === 'number' ? sm : null);
    if (ts != null) smokePlume(c, lt, ts, G.chim.x, G.chim.y - G.w * .068, 1.1, { alpha: .26, rise: 26, drift: 10 });
    // Bodennebel
    for (let i = 0; i < 6; i++) { const mx = mod(gt * (5 + i * 2) + i * 330, 1800) - 350, my = 982 + i * 16; c.globalAlpha = .06; c.drawImage(sp, mx - 420, my - 34, 840, 68); }
    c.globalAlpha = 1;
    // Stadeltor
    const bd = p.barnDoor; let gap = 0;
    if (typeof bd === 'number') gap = clamp(bd); else if (bd === true) gap = .5; else if (Array.isArray(bd)) gap = lerp(num(bd[2], 0), num(bd[3], 1), E.inOut(prog(lt, num(bd[0], 0), num(bd[1], 1))));
    if (gap > 0) inFarm(c, G, () => barnDoorDraw(c, G.raw, gap, K_NIGHT));
    // Spuren vom Waldrand zur Haustür
    if (p.footprints) {
      const q = obj(p.footprints), n = clamp(Math.round(num(q.n, 9)), 1, 14), at = num(q.at, -99), dt = num(q.dt, .38);
      const P0 = [200, 1082], P1 = [300, 1112], P2 = [G.door.x + G.door.w / 2, G.Y + 8];
      const bz = u => [lerp(lerp(P0[0], P1[0], u), lerp(P1[0], P2[0], u), u), lerp(lerp(P0[1], P1[1], u), lerp(P1[1], P2[1], u), u)];
      for (let i = 0; i < n; i++) {
        const ti = at + i * dt; if (lt < ti) break;
        const k = E.out(prog(lt, ti, ti + .22)), u = (i + .5) / n, [x, y] = bz(u), [x2, y2] = bz(Math.min(1, u + .01));
        const s = clamp((y - 958) / 118, .38, 1.4), ang = Math.atan2(y2 - y, x2 - x), side = i % 2 ? 1 : -1;
        const px = x - Math.sin(ang) * side * 5 * s, py = y + Math.cos(ang) * side * 5 * s;
        c.save(); c.translate(px, py); c.rotate(ang); c.scale(s, s * .42);
        c.fillStyle = `rgba(190,206,235,${.3 * k})`; c.beginPath(); c.ellipse(0, 3.5, 13, 8, 0, 0, 7); c.fill();
        c.fillStyle = `rgba(12,19,34,${.85 * k})`; c.beginPath(); c.ellipse(0, 0, 11 * lerp(.6, 1, k), 6.5, 0, 0, 7); c.fill(); c.restore();
      }
    }
    // Gestalt am Waldrand
    const fg = p.figure;
    if (fg) { const q = obj(fg), at = num(q.at, 0), un = q.until != null ? q.until : null;
      if (lt >= at && (un == null || lt < un + .6)) { const a = clamp(prog(lt, at, at + .6)) * (un != null ? 1 - clamp(prog(lt, un, un + .6)) : 1);
        const x = num(q.x, 172), y = q.y != null ? q.y : fsEdge(x) + 8, h = num(q.h, 82);
        c.globalAlpha = a * .35; c.drawImage(sp, x - h * 1.6, y - h * .9, h * 3.2, h * 1.2); c.globalAlpha = a;
        tinyFigure(c, x, y, h, gt); c.globalAlpha = 1; } }
    // Dunkelheit
    if (dark > 0) fillVis(c, `rgba(1,3,8,${dark})`);
    // erleuchtete Fenster
    for (const L of parseLit(p.lit !== undefined ? p.lit : [1])) { const r = G.win[L.i]; if (!r) continue;
      let a = L.on != null ? clamp(prog(lt, L.on, L.on + .25)) : 1; if (L.off != null && lt >= L.off) a *= 1 - clamp(prog(lt, L.off, L.off + .12));
      windowGlow(c, r, a, gt, L.i, L.i < 3 || L.i > 5, G.Y); }
    // Laterne wandert am Hof entlang
    if (p.lantern) {
      const q = obj(p.lantern), x0 = num(q.x0, 300), x1 = num(q.x1, 820), t0 = num(q.t0, 0), t1 = num(q.t1, 8);
      const k = prog(lt, t0, t1), kk = .65 * k + .35 * E.inOut(k), moving = lt > t0 && lt < t1;
      const x = lerp(x0, x1, kk), y = num(q.y, G.Y - 30) - (moving ? Math.abs(Math.sin(lt * 4.2)) * 3 : 0) + Math.sin(gt * 2) * 1.5, fl = .85 + .15 * noise(gt * 7, 9);
      const sw = (moving ? Math.sin(lt * 4.2) * .25 : Math.sin(gt * 1.5) * .08);
      addGlow(c, x, y - 20, 200, '255,160,80', .26 * fl); addGlow(c, x, G.Y + 16, 230, '255,150,70', .34 * fl, .16);
      lanternBody(c, x, y, .19, fl, sw); addGlow(c, x, y, 70, '255,200,130', .6 * fl); addGlow(c, x, y, 18, '255,240,210', .9 * fl);
    }
    // Halme wiegen sich (Spitzen)
    c.strokeStyle = 'rgba(4,7,12,.9)'; c.lineCap = 'round';
    for (let i = 0; i < 26; i++) { const side = i % 2, x = side ? lerp(820, 1120, hash(i * 4.1 + 7)) : lerp(-60, 260, hash(i * 4.1 + 7)), y = 1700 + hash(i * 6.3) * 200, L = 90 + hash(i * 8.7) * 130;
      const a = -Math.PI / 2 + (hash(i * 2.9) - .5) * .5 + Math.sin(gt * (.8 + hash(i) * .6) + i) * .06;
      c.lineWidth = 2 + hash(i * 1.1) * 2; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * L * .55 + 6, y + Math.sin(a) * L * .55, x + Math.cos(a) * L, y + Math.sin(a) * L); c.stroke();
      if (hash(i * 5.5) > .5) { c.beginPath(); c.ellipse(x + Math.cos(a) * L, y + Math.sin(a) * L, 3, 9, a + Math.PI / 2, 0, 7); c.fillStyle = 'rgba(4,7,12,.9)'; c.fill(); } }
    // Schnee + Glitzern
    if (p.snow !== false) { snowfall(c, gt, { n: 200, s0: 1.4, s1: 7, v0: 35, v1: 150, alpha: .85 - dark * .4 }); snowfall(c, gt, { n: 14, s0: 12, s1: 22, v0: 160, v1: 230, alpha: .25, seed: 3 }); }
    for (let i = 0; i < 46; i++) { const x = RX + 200 + hash(i * 6.1) * (RW - 400), y = 1010 + Math.pow(hash(i * 2.9), 1.4) * 640, a = Math.pow(clamp(noise(gt * 1.1 + i, i * 2.3)), 6) * 1.4;
      if (a > .02) { c.fillStyle = `rgba(235,242,255,${clamp(a)})`; c.fillRect(x - 1, y - 1, 2.4, 2.4); } }
    if (p.label) { const q = typeof p.label === 'object' ? p.label : { text: p.label }, at = num(q.at, .2);
      labelText(c, String(q.text || ''), 540, num(q.y, 1330), clamp(prog(lt, at, at + .8)) * (q.until != null ? 1 - clamp(prog(lt, q.until, q.until + .5)) : 1)); }
  };

  // =====================================================================
  // 2) footprints – tiefe Nahaufnahme über dem Schnee, Spur führt zum Hof
  // =====================================================================
  const FP = { hz: 540, vx: 530, fx: 1100, ky: 950, z0: 1.36, st: .6 };
  const fpP = (X, Z) => [FP.vx + FP.fx * X / Z, FP.hz + FP.ky / Z];
  const fpPath = Z => .14 * Math.sin(Z * .55 + .4) - .07;
  const fpG = () => farmGeo(FP.vx - .6075 * 240, FP.hz + 10, 240);
  function fpStatic(g, farm) {
    const sk = g.createLinearGradient(0, RY, 0, FP.hz); sk.addColorStop(0, '#02040a'); sk.addColorStop(.55, '#091325'); sk.addColorStop(1, '#22314e');
    g.fillStyle = sk; g.fillRect(RX, RY, RW, FP.hz - RY + 6);
    for (let i = 0; i < 90; i++) { const x = RX + hash(i * 2.9) * RW, y = RY + hash(i * 6.3) * (FP.hz - RY - 120); g.fillStyle = `rgba(210,222,250,${.1 + .4 * hash(i * 7.7)})`; g.fillRect(x, y, 1.6, 1.6); }
    spot(g, 880, 250, 600, 'rgba(150,175,225,A)', .22);
    for (let i = 0; i < 7; i++) { g.save(); g.translate(RX + hash(i * 3.1) * RW, 140 + i * 50); g.scale(1, .08); spot(g, 0, 0, 420 + hash(i) * 300, 'rgba(4,7,14,A)', .5); g.restore(); }
    g.fillStyle = '#0d1626'; g.beginPath(); g.moveTo(RX, FP.hz + 4); for (let x = RX; x <= W - RX; x += 30) g.lineTo(x, FP.hz - 22 + Math.sin(x * .008) * 10); g.lineTo(W - RX, FP.hz + 4); g.fill();
    forestRow(g, RX, W - RX, FP.hz + 3, 30, 78, '#060b15', 31, 13);
    if (farm) { const G = fpG(); inFarm(g, G, () => farmDraw(g, G.raw, K_FAR)); }
    const sn = g.createLinearGradient(0, FP.hz, 0, H - RY);
    sn.addColorStop(0, '#6a7c9e'); sn.addColorStop(.06, '#52648a'); sn.addColorStop(.28, '#36476a'); sn.addColorStop(.55, '#1f2a44'); sn.addColorStop(1, '#0a0f1c');
    g.fillStyle = sn; g.fillRect(RX, FP.hz + 5, RW, H - RY);
    g.save(); g.globalCompositeOperation = 'lighter'; g.translate(820, FP.hz + 60); g.scale(1, .16); spot(g, 0, 0, 700, 'rgba(120,145,200,A)', .16); g.restore(); // Mondglanz
    // Verwehungen: weiche Buckel mit Lichtkante, Größe nach Tiefe
    for (let i = 0; i < 120; i++) {
      const Z = .75 + Math.pow(hash(i * 2.3), 1.6) * 16, X = (hash(i * 5.9) - .5) * 1.4 * Z, [x, y] = fpP(X, Z); if (y > H + 100) continue;
      const rx = (120 + 160 * hash(i * 3.7)) / Z, ry = rx * (.12 + .1 * hash(i * 8.1)) * (FP.ky / FP.fx) * 1.6 / Math.sqrt(Z);
      g.save(); g.translate(x, y); g.scale(1, ry / rx); spot(g, 0, 2, rx, 'rgba(4,8,18,A)', .16); g.globalCompositeOperation = 'lighter'; spot(g, 0, -rx * .45, rx * .8, 'rgba(150,172,215,A)', .07); g.restore();
    }
    for (let i = 0; i < 900; i++) { const Z = .7 + Math.pow(hash(i * 1.7), 2.2) * 14, X = (hash(i * 4.3) - .5) * 1.5 * Z, [x, y] = fpP(X, Z), s = Math.max(.8, 2.2 / Z);
      g.fillStyle = hash(i * 6.6) > .5 ? `rgba(200,215,240,${.07 + .08 * hash(i)})` : `rgba(5,9,18,${.1 + .1 * hash(i)})`; g.fillRect(x, y, s, s); }
    // Zaun links, führt zum Hof
    const posts = []; for (let i = 0; i < 11; i++) { const Z = 1.35 * Math.pow(1.38, i), [x, y] = fpP(-1.45 + i * .01, Z); posts.push([x, y, 1.15 * FP.ky / Z * .62, Z]); }
    g.strokeStyle = '#070b14'; g.lineCap = 'round';
    for (const [x, y, h, Z] of posts) { g.lineWidth = Math.max(1.5, 60 / Z); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 8 / Z, y - h); g.stroke(); }
    for (const fy of [.45, .82]) { g.beginPath(); posts.forEach(([x, y, h, Z], i) => { g.lineWidth = Math.max(1, 14 / Z); i ? g.lineTo(x, y - h * fy) : g.moveTo(x, y - h * fy); }); g.lineWidth = 7; g.stroke(); }
    g.fillStyle = '#9fb0cf'; for (const [x, y, h, Z] of posts) { rr(g, x - 34 / Z, y - h - 14 / Z, 80 / Z, Math.max(2, 20 / Z), 8 / Z); g.fill(); }
    // Halme, die aus dem Schnee ragen
    g.strokeStyle = '#060a12';
    for (let i = 0; i < 60; i++) { const Z = .9 + Math.pow(hash(i * 3.9), 1.5) * 9, X = (hash(i * 7.3) - .5) * 2.6 * Z, [x, y] = fpP(X, Z); if (Math.abs(x - fpP(fpPath(Z), Z)[0]) < 130 / Z) continue;
      const n = 2 + Math.floor(hash(i * 2.1) * 4); for (let j = 0; j < n; j++) { const L = (60 + 90 * hash(i * 5 + j)) / Z, a = -Math.PI / 2 + (hash(i * 9 + j) - .5) * .9;
        g.lineWidth = Math.max(1, 5 / Z); g.beginPath(); g.moveTo(x + j * 6 / Z, y); g.quadraticCurveTo(x + Math.cos(a) * L * .5, y + Math.sin(a) * L * .5, x + Math.cos(a) * L + (j - 1) * 6 / Z, y + Math.sin(a) * L); g.stroke(); } }
    const fg = g.createLinearGradient(0, 1430, 0, 1780); fg.addColorStop(0, 'rgba(6,9,18,0)'); fg.addColorStop(1, 'rgba(6,9,18,.88)');
    g.fillStyle = fg; g.beginPath(); g.moveTo(RX, 1640); g.quadraticCurveTo(260, 1430, 640, 1540); g.quadraticCurveTo(960, 1630, W - RX, 1500); g.lineTo(W - RX, H - RY); g.lineTo(RX, H - RY); g.closePath(); g.fill();
  }
  function snowPrint(c, X, Z, ang, k) { // Mulde: hintere Innenwand im Schatten, Grund heller, vorne eine Lichtkante
    if (k <= 0) return;
    const L = .3, Wd = .12, kk = lerp(.7, 1, k), [, y0] = fpP(X, Z + L * .55), [, y1] = fpP(X, Z - L * .55);
    c.fillStyle = `rgba(4,8,18,${.16 * k})`; footPath(c, fpP, X, Z, ang, L, Wd, 1.3); c.fill(); // weicher Schattenhof
    c.save(); c.translate(0, 8 / Z); c.fillStyle = `rgba(205,220,248,${.3 * k})`; footPath(c, fpP, X, Z, ang, L, Wd, 1.0); c.fill(); c.restore(); // Lichtkante am vorderen Rand
    const gr = c.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, `rgba(7,12,26,${.95 * k})`); gr.addColorStop(.5, `rgba(20,30,54,${.92 * k})`); gr.addColorStop(1, `rgba(46,62,96,${.9 * k})`);
    c.fillStyle = gr; footPath(c, fpP, X, Z, ang, L, Wd, kk); c.fill();
    if (Z < 3.2) { const cs = Math.cos(ang), sn = Math.sin(ang), r = Math.max(1, 3.2 / Z); c.fillStyle = `rgba(4,7,16,${.5 * k})`; // Nagelschuh: Reihe von Nagelabdrücken
      for (const [v, u] of [[.38, .28], [.38, -.28], [.26, .36], [.26, -.36], [.12, .34], [.12, -.34], [.3, 0], [.16, 0], [-.36, .26], [-.36, -.26], [-.44, 0]]) {
        const [x, y] = fpP(X + (u * Wd * cs + v * L * sn) * kk, Z + (-u * Wd * sn + v * L * cs) * kk); c.fillRect(x - r, y - r * .5, r * 2, r); } }
  }
  SCENES.footprints = (c, lt, b, gt) => {
    const p = b.p || {};
    const farm = p.farm !== false, lan = p.lantern !== false;
    const n = clamp(Math.round(num(p.n, 8)), 1, 14), t0 = num(p.t0, .3), t1 = num(p.t1, 3);
    blit(c, layer('fp|' + farm, g => fpStatic(g, farm)));
    const sp = sprite('soft');
    for (let i = 0; i < 3; i++) { const cx = mod(gt * (7 + i * 3) + i * 520, 1700) - 300; c.globalAlpha = .07; c.drawImage(sp, cx - 380, 200 + i * 80 - 20, 760, 40); }
    c.globalAlpha = 1;
    if (farm) { const G = fpG();
      if (lan) { windowGlow(c, G.win[1], 1, gt, 1, false, G.Y);
        const lx = G.door.x + G.door.w * 1.6 + Math.sin(gt * 1.3) * 2.2, ly = G.Y - 20 + Math.cos(gt * 1.3) * .8, fl = .85 + .15 * noise(gt * 7, 2);
        addGlow(c, lx, ly, 90, '255,160,80', .32 * fl); addGlow(c, lx, FP.hz + 14, 150, '255,150,70', .25 * fl, .14);
        c.fillStyle = `rgba(255,232,190,${fl})`; c.beginPath(); c.arc(lx, ly, 2.6, 0, 7); c.fill(); }
      for (let i = 0; i < 4; i++) { const mx = mod(gt * (6 + i * 2) + i * 400, 1700) - 300; c.globalAlpha = .07; c.drawImage(sp, mx - 400, FP.hz - 10 + i * 6, 800, 40); }
      c.globalAlpha = 1; }
    // Glitzern im Schnee
    for (let i = 0; i < 70; i++) { const Z = .7 + Math.pow(hash(i * 3.3), 2) * 10, X = (hash(i * 7.1) - .5) * 7, [x, y] = fpP(X, Z), a = Math.pow(clamp(noise(gt * .9 + i * .37, i)), 7) * 1.6;
      if (a > .03) { const r = 3 + 6 / Z; c.globalAlpha = clamp(a); c.drawImage(sp, x - r, y - r, 2 * r, 2 * r); } }
    c.globalAlpha = 1;
    const { z0, st } = FP;
    // Rückspur (nur wenn back: true) – liegt schon da, leicht verweht
    if (p.back) for (let i = n - 1; i >= 0; i--) { const Z = z0 + .3 + i * st, side = i % 2 ? 1 : -1, X = fpPath(Z) + .46 + side * .1; snowPrint(c, X, Z, Math.PI + side * .1, .6); }
    // roter Ring um den leeren Schnee, wo die Rückspur sein müsste
    const rt = tOn(p.ring);
    if (rt != null && lt >= rt && !p.back) {
      const k = E.back(prog(lt, rt, rt + .45)), Zr = z0 + st * 2.2, Xr = fpPath(Zr) + .46, R = .34 * lerp(1.3, 1, clamp(k)), pul = .5 + .5 * Math.sin((lt - rt) * 4.5);
      const [cx, cy] = fpP(Xr, Zr), ry = (fpP(Xr, Zr - R)[1] - fpP(Xr, Zr + R)[1]) / 2, rx = FP.fx * R / Zr;
      c.save(); c.globalAlpha = clamp(prog(lt, rt, rt + .25));
      c.save(); c.globalCompositeOperation = 'lighter'; c.translate(cx, cy); c.scale(1, ry / rx); spot(c, 0, 0, rx * 1.15, RED, .14 + .08 * pul); c.restore();
      c.beginPath(); for (let i = 0; i <= 56; i++) { const a = i / 56 * Math.PI * 2, q = fpP(Xr + Math.cos(a) * R, Zr + Math.sin(a) * R); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }
      c.strokeStyle = '#ff3030'; c.lineWidth = 7; glow(c, 'rgba(255,40,40,1)', 22 + 12 * pul); c.stroke(); c.lineWidth = 3; c.strokeStyle = '#ffb0a8'; c.stroke(); noGlow(c); c.restore();
    }
    // die Spur: Abdruck für Abdruck vom Betrachter weg zum Hof
    const P = [];
    for (let i = 0; i < n; i++) { const Z = z0 + i * st, ti = n > 1 ? lerp(t0, t1, i / (n - 1)) : t0, side = i % 2 ? 1 : -1;
      const X = fpPath(Z) + side * .1, dX = (fpPath(Z + .01) - fpPath(Z - .01)) / .02; P.push({ Z, X, ti, ang: Math.atan(dX) + side * .09 }); }
    for (let i = n - 1; i >= 0; i--) { const q = P[i]; if (lt >= q.ti) snowPrint(c, q.X, q.Z, q.ang, E.out(prog(lt, q.ti, q.ti + .18))); }
    for (const q of P) { const [x, y] = fpP(q.X, q.Z); puff(c, x, y - 6 / q.Z, 1.25 / q.Z, lt - q.ti, q.Z * 13, 120); }
    if (p.snow !== false) { snowfall(c, gt, { n: 170, s0: 1.5, s1: 6, v0: 38, v1: 120, alpha: .75 }); snowfall(c, gt, { n: 20, s0: 14, s1: 34, v0: 150, v1: 240, alpha: .2, seed: 5 }); }
  };

  // =====================================================================
  // 3) attic – Dachboden: Sparren in Perspektive, Heu, Laterne, Staub
  // =====================================================================
  const AX = 540, AY = 720, AF = 700;
  const ap = (X, Y, Z) => [AX + AF * X / Z, AY - AF * Y / Z];
  const A = { fl: -1.5, knee: -1.1, ridge: 2.0, half: 2.8, back: 8.2, near: .7, raft: [1.25, 2.05, 2.85, 3.65, 4.45, 5.25, 6.05, 6.85, 7.65] };
  const roofPt = (s, sd) => [sd * A.half * (1 - s), A.knee + (A.ridge - A.knee) * s];
  const aFloor = (X, Z) => ap(X, A.fl, Z);
  const HATCH = { x0: -1.05, x1: -.25, zn: 1.9, zf: 2.6 };
  function hayPile(g, cx, cy, rx, ry, sd, col = ['#5d4d33', '#21180f']) {
    const gr = g.createLinearGradient(0, cy - ry, 0, cy + ry * .2); gr.addColorStop(0, col[0]); gr.addColorStop(1, col[1]);
    g.fillStyle = gr; g.beginPath(); g.moveTo(cx - rx, cy + ry * .12);
    for (let i = 0; i <= 24; i++) { const k = i / 24, x = cx - rx + 2 * rx * k, y = cy - ry * Math.pow(Math.sin(k * Math.PI), .8) * (.82 + .28 * hash(sd + i)); g.lineTo(x, y); }
    g.lineTo(cx + rx, cy + ry * .12); g.closePath(); g.fill();
    g.lineWidth = Math.max(1, rx * .006); g.strokeStyle = 'rgba(205,180,125,.32)'; g.beginPath();
    for (let i = 0; i < 110; i++) { const k = hash(sd + i * 1.3), x = cx - rx + 2 * rx * k, top = cy - ry * Math.sin(k * Math.PI) * .88, y = lerp(top, cy, Math.pow(hash(sd + i * 2.7), 1.5) * .9);
      const a = (hash(sd + i * 5.1) - .5) * 2.6, L = rx * (.04 + .09 * hash(sd + i * 7.3)); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L * .55); }
    g.stroke();
  }
  function atticStatic(g, hay) {
    g.fillStyle = '#0a0705'; g.fillRect(RX, RY, RW, RH);
    const Zn = A.near, Zb = A.back;
    for (const sd of [-1, 1]) { // Dachflächen mit Latten, Lichtritzen zwischen den Ziegeln
      const e0 = roofPt(0, sd), r0 = roofPt(1, sd);
      poly(g, [ap(e0[0], e0[1], Zn), ap(r0[0], r0[1], Zn), ap(r0[0], r0[1], Zb), ap(e0[0], e0[1], Zb)]); g.fillStyle = '#140e0a'; g.fill();
      for (let s = .03; s < 1; s += .052) { const q = roofPt(s, sd); beam(g, ap(q[0], q[1], Zn), ap(q[0], q[1], Zb), AF * .035 / Zn, AF * .035 / Zb, '#2a1e15'); }
      for (let i = 0; i < 46; i++) { const s = hash(i * 3.1 + sd) * .95, Z = 1.2 + hash(i * 5.3 + sd) * 6.5, q = roofPt(s, sd), [x, y] = ap(q[0], q[1], Z);
        g.fillStyle = `rgba(150,172,215,${.25 + .35 * hash(i * 7.7)})`; g.fillRect(x, y, Math.max(1.2, 5 / Z), Math.max(1.2, 3 / Z)); }
    }
    // Giebelwand hinten mit kleinem Fenster
    const back = [[-A.half, A.fl], [-A.half, A.knee], [0, A.ridge], [A.half, A.knee], [A.half, A.fl]].map(q => ap(q[0], q[1], Zb));
    poly(g, back); g.fillStyle = '#1d150f'; g.fill();
    g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 1.5; g.beginPath();
    for (let X = -A.half + .22; X < A.half; X += .22) { const yt = A.knee + (A.ridge - A.knee) * (1 - Math.abs(X) / A.half), a = ap(X, A.fl, Zb), bb = ap(X, yt, Zb); g.moveTo(a[0], a[1]); g.lineTo(bb[0], bb[1]); } g.stroke();
    const w0 = ap(-.46, .58, Zb), w1 = ap(.46, -.26, Zb);
    g.fillStyle = '#0e0a07'; g.fillRect(w0[0] - 7, w0[1] - 7, w1[0] - w0[0] + 14, w1[1] - w0[1] + 14);
    const wg = g.createLinearGradient(0, w0[1], 0, w1[1]); wg.addColorStop(0, '#5d6f93'); wg.addColorStop(1, '#3b4a68'); g.fillStyle = wg; g.fillRect(w0[0], w0[1], w1[0] - w0[0], w1[1] - w0[1]);
    g.fillStyle = '#0e0a07'; g.fillRect((w0[0] + w1[0]) / 2 - 2.5, w0[1], 5, w1[1] - w0[1]); g.fillRect(w0[0], (w0[1] + w1[1]) / 2 - 2.5, w1[0] - w0[0], 5);
    // Boden
    const fl = [aFloor(-A.half, Zn), aFloor(A.half, Zn), aFloor(A.half, Zb), aFloor(-A.half, Zb)];
    const fgr = g.createLinearGradient(0, aFloor(0, Zb)[1], 0, H); fgr.addColorStop(0, '#1b130c'); fgr.addColorStop(1, '#2c2016'); poly(g, fl); g.fillStyle = fgr; g.fill();
    for (let i = 0; i <= 20; i++) { const X = -A.half + i * .28; beam(g, aFloor(X, Zn), aFloor(X, Zb), AF * .012 / Zn, AF * .012 / Zb, '#0f0a07');
      if (i < 20) for (let j = 0; j < 2; j++) { const Z = 1 + hash(i * 3.7 + j * 11) * 6.5, a = aFloor(X, Z), bb = aFloor(X + .28, Z); g.strokeStyle = 'rgba(10,7,5,.8)'; g.lineWidth = Math.max(1, 5 / Z); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(bb[0], bb[1]); g.stroke(); }
      if (i < 20 && i % 3 === 1) { g.strokeStyle = 'rgba(90,66,44,.25)'; g.lineWidth = 1; g.beginPath(); const a = aFloor(X + .14, Zn), bb = aFloor(X + .14, Zb); g.moveTo(a[0], a[1]); g.lineTo(bb[0], bb[1]); g.stroke(); } }
    for (const sd of [-1, 1]) { poly(g, [ap(sd * A.half, A.fl, Zn), ap(sd * A.half, A.knee, Zn), ap(sd * A.half, A.knee, Zb), ap(sd * A.half, A.fl, Zb)]); g.fillStyle = '#18110c'; g.fill(); }
    // Pfetten + First laufen in die Tiefe
    for (const sd of [-1, 1]) { const q = roofPt(.52, sd); beam(g, ap(q[0], q[1], Zn), ap(q[0], q[1], Zb), AF * .2 / Zn, AF * .2 / Zb, '#2c2017'); }
    beam(g, ap(0, A.ridge - .05, Zn), ap(0, A.ridge - .05, Zb), AF * .2 / Zn, AF * .2 / Zb, '#2c2017');
    if (hay) { const [lx, ly] = aFloor(-2.15, 4.2); hayPile(g, lx, ly, 260, 150, 3);
      const [rx, ry] = aFloor(2.1, 5.2); hayPile(g, rx, ry, 170, 95, 9);
      const [nx, ny] = aFloor(2.5, 2.2); hayPile(g, nx, ny, 360, 240, 17);
      g.strokeStyle = 'rgba(190,165,110,.3)'; g.lineWidth = 1.5; g.beginPath();
      for (let i = 0; i < 70; i++) { const X = (hash(i * 4.3) - .5) * 4.6, Z = 1.2 + hash(i * 6.1) * 6, [x, y] = aFloor(X, Z), a = hash(i * 8.8) * Math.PI, L = 30 / Z; g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L * .3); } g.stroke(); }
    // Sparrenpaare von hinten nach vorn
    A.raft.slice().reverse().forEach((Z, j) => {
      const wd = AF * .17 / Z, col = '#3d2c1f', hi = 'rgba(120,88,58,.35)';
      for (const sd of [-1, 1]) { const e = roofPt(0, sd), r = roofPt(1, sd), a = ap(e[0], e[1], Z), bb = ap(r[0], r[1], Z); beam(g, a, bb, wd, wd, col);
        g.strokeStyle = hi; g.lineWidth = Math.max(1, wd * .12); g.beginPath(); g.moveTo(a[0], a[1] + wd * .4); g.lineTo(bb[0], bb[1] + wd * .4); g.stroke();
        beam(g, ap(sd * A.half, A.fl, Z), ap(sd * A.half, A.knee, Z), wd, wd, '#33251a'); }
      const cy = .9, cx = A.half * (A.ridge - cy) / (A.ridge - A.knee);
      beam(g, ap(-cx, cy, Z), ap(cx, cy, Z), wd * .85, wd * .85, '#35271b');
      g.strokeStyle = hi; g.lineWidth = Math.max(1, wd * .1); g.beginPath(); const c0 = ap(-cx, cy, Z), c1 = ap(cx, cy, Z); g.moveTo(c0[0], c0[1] + wd * .36); g.lineTo(c1[0], c1[1] + wd * .36); g.stroke();
      if (j % 2 === 0) beam(g, ap(0, cy, Z), ap(0, A.ridge, Z), wd * .8, wd * .8, '#33251a');
    });
    // Luke im Boden (geschlossen, Grundform)
    const H0 = HATCH, hp = [aFloor(H0.x0, H0.zn), aFloor(H0.x1, H0.zn), aFloor(H0.x1, H0.zf), aFloor(H0.x0, H0.zf)];
    poly(g, hp); g.strokeStyle = '#070504'; g.lineWidth = 5; g.stroke();
  }
  function hatchDraw(c, op, gt) {
    const { x0, x1, zn, zf } = HATCH, Y = A.fl, P = (X, Z, Yy = Y) => ap(X, Yy, Z);
    const hole = [P(x0, zn), P(x1, zn), P(x1, zf), P(x0, zf)], fl = .9 + .1 * noise(gt * 5, 77);
    if (op > 0) {
      poly(c, hole); c.fillStyle = '#060302'; c.fill();
      const [cx, cy] = P((x0 + x1) / 2, (zn + zf) / 2), gr = c.createRadialGradient(cx, cy + 20, 10, cx, cy, 230);
      gr.addColorStop(0, `rgba(255,222,160,${fl})`); gr.addColorStop(1, `rgba(190,100,40,${.9 * fl})`);
      c.save(); c.globalAlpha = clamp(op * 1.6); c.fillStyle = gr; c.fill(); c.restore();
      poly(c, [P(x0, zf), P(x1, zf), P(x1, zf, Y - .14), P(x0, zf, Y - .14)]); c.fillStyle = '#1c120a'; c.fill();
      c.save(); poly(c, hole); c.clip(); c.strokeStyle = 'rgba(20,12,6,.9)'; c.lineCap = 'butt'; // Leiter nach unten
      for (const X of [x0 + .2, x1 - .2]) { const a = P(X, zf - .06, Y), bb = P(X, zf - .2, Y - 1.2); c.lineWidth = 9; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(bb[0], bb[1]); c.stroke(); }
      for (const d of [.25, .6, .95]) { const a = P(x0 + .2, zf - .06 - .14 * d, Y - d), bb = P(x1 - .2, zf - .06 - .14 * d, Y - d); c.lineWidth = 6; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(bb[0], bb[1]); c.stroke(); }
      c.restore();
    }
    if (op <= 0) hatchLid(c, 0, gt);
  }
  let BEAM = null;
  function hatchBeam() { // weicher Lichtschacht über der offenen Luke, einmal vorgerendert (Ebenen mit abnehmender Breite)
    if (BEAM) return BEAM;
    const { x0, x1, zn, zf } = HATCH, [, hy] = aFloor((x0 + x1) / 2, (zn + zf) / 2), L = [];
    for (const [s, a] of [[1.05, .03], [.9, .04], [.75, .05], [.6, .06], [.45, .07]]) { const pts = [], cxw = (x0 + x1) / 2, hw = (x1 - x0) / 2 * s, zc = (zn + zf) / 2, hz = (zf - zn) / 2 * s;
      for (const X of [cxw - hw, cxw + hw]) for (const Z of [zc - hz, zc + hz]) for (const Yy of [A.fl, A.fl + 2.1]) pts.push(ap(X, Yy, Z)); L.push([hull(pts), a]); }
    const all = L[0][0], bx = Math.floor(Math.min(...all.map(q => q[0]))) - 2, by = Math.floor(Math.min(...all.map(q => q[1]))) - 2;
    const cv = document.createElement('canvas'); cv.width = Math.ceil(Math.max(...all.map(q => q[0]))) - bx + 4; cv.height = Math.ceil(Math.max(...all.map(q => q[1]))) - by + 4;
    const g = cv.getContext('2d'); g.translate(-bx, -by); g.globalCompositeOperation = 'lighter'; g.filter = 'blur(14px)';
    for (const [pts, a] of L) { const g2 = g.createLinearGradient(0, hy, 0, hy - 560); g2.addColorStop(0, `rgba(255,180,100,${a})`); g2.addColorStop(.55, `rgba(255,180,100,${a * .4})`); g2.addColorStop(1, 'rgba(255,180,100,0)');
      poly(g, pts); g.fillStyle = g2; g.fill(); }
    return BEAM = { cv, x: bx, y: by };
  }
  function hatchLid(c, op, gt) { // Deckel klappt um die hintere Kante hoch; offen: dunkle Platte, von unten warm angestrahlt
    const { x0, x1, zn, zf } = HATCH, Y = A.fl, P = (X, Z, Yy = Y) => ap(X, Yy, Z), fl = .9 + .1 * noise(gt * 5, 77);
    const phi = op * 1.85, d = zf - zn, zN = zf - d * Math.cos(phi), yN = Y + d * Math.sin(phi);
    const lid = [P(x0, zf), P(x1, zf), P(x1, zN, yN), P(x0, zN, yN)];
    poly(c, lid);
    if (op > 0) { const lg = c.createLinearGradient(0, lid[0][1], 0, lid[3][1]), w = clamp(op * 1.4) * fl;
      lg.addColorStop(0, `rgb(${Math.round(lerp(26, 92, w))},${Math.round(lerp(18, 56, w))},${Math.round(lerp(12, 30, w))})`); lg.addColorStop(.35, '#1d140d'); lg.addColorStop(1, '#100b07'); c.fillStyle = lg; }
    else c.fillStyle = '#2e2117';
    c.fill(); c.strokeStyle = '#070504'; c.lineWidth = 3; c.stroke();
    c.lineWidth = 2; c.beginPath(); for (const u of [.25, .5, .75]) { const a = P(lerp(x0, x1, u), zf), bb = P(lerp(x0, x1, u), zN, yN); c.moveTo(a[0], a[1]); c.lineTo(bb[0], bb[1]); } c.stroke();
    if (op > 0) { c.save(); c.strokeStyle = `rgba(255,170,90,${.55 * clamp(op * 2) * fl})`; glow(c, 'rgba(255,150,70,.9)', 14); c.lineWidth = 2.5; // Kanten fangen das Licht
      c.beginPath(); c.moveTo(lid[0][0], lid[0][1]); c.lineTo(lid[3][0], lid[3][1]); c.moveTo(lid[1][0], lid[1][1]); c.lineTo(lid[2][0], lid[2][1]); c.stroke(); c.restore(); }
    const ring = P((x0 + x1) / 2, lerp(zf, zN, .85), lerp(Y, yN, .85)); c.strokeStyle = '#0c0806'; c.lineWidth = 4; c.beginPath(); c.ellipse(ring[0], ring[1], 16, 7, 0, 0, 7); c.stroke();
  }
  SCENES.attic = (c, lt, b, gt) => {
    const p = b.p || {};
    const hay = p.hay !== false, dark = clamp(num(p.dark, .8));
    const st = layer('attic|' + hay, g => atticStatic(g, hay));
    blit(c, st);
    // Luke
    const hatchOn = p.hatch !== false, hop = typeof p.hatch === 'number' ? E.inOut(prog(lt, p.hatch, p.hatch + 1.3)) : p.hatch === true ? 1 : 0;
    if (hatchOn) hatchDraw(c, hop, gt);
    // Diele knarrt: Brett senkt sich (Ausschnitt der statischen Ebene wird verschoben)
    const BD = { x0: .56, x1: .84, z0: 2.5, z1: 3.5 };
    const creaks = (Array.isArray(p.creak) ? p.creak : (typeof p.creak === 'number' ? [p.creak] : [])).filter(t => typeof t === 'number');
    let dip = 0; for (const tc of creaks) { const u = lt - tc; if (u >= 0 && u < .5) dip = Math.max(dip, Math.sin(u / .5 * Math.PI)); }
    if (dip > 0) { const q = [aFloor(BD.x0, BD.z0), aFloor(BD.x1, BD.z0), aFloor(BD.x1, BD.z1), aFloor(BD.x0, BD.z1)];
      c.save(); poly(c, q); c.clip(); c.fillStyle = '#050302'; c.fill(); c.drawImage(st, RX, RY + dip * 7); c.restore();
      c.strokeStyle = `rgba(0,0,0,${.85 * dip})`; c.lineWidth = 4; poly(c, q); c.stroke(); }
    // Staubspuren auf den Dielen
    if (p.footsteps) {
      const q = obj(p.footsteps), n = clamp(Math.round(num(q.n, 10)), 1, 20), f0 = num(q.t0, .3), f1 = num(q.t1, 4), inward = q.dir !== 'out';
      const A0 = [.95, 6.9], A1 = [-.3, 2.8], ang = Math.atan2(A1[0] - A0[0], A1[1] - A0[1]) + (inward ? 0 : Math.PI);
      for (let i = 0; i < n; i++) { const u = n > 1 ? i / (n - 1) : 0, k0 = inward ? u : 1 - u, ti = lerp(f0, f1, u); if (lt < ti) continue;
        const a = E.out(prog(lt, ti, ti + .35)), side = (i % 2 ? 1 : -1), X = lerp(A0[0], A1[0], k0) + side * .1, Z = lerp(A0[1], A1[1], k0);
        c.fillStyle = `rgba(150,132,104,${.14 * a})`; footPath(c, aFloor, X, Z, ang + side * .08, .34, .14, 1.35); c.fill(); // aufgewirbelter Staub
        c.fillStyle = `rgba(185,165,132,${.62 * a})`; footPath(c, aFloor, X, Z, ang + side * .08, .34, .14, lerp(.8, 1, a), true); c.fill(); }
    }
    // dunkle Form am Rand des Lichts (weich, vorgerendert)
    if (p.shadow) { const q = obj(p.shadow), at = num(q.at, 0); if (lt >= at) {
      const a = E.inOut(prog(lt, at, at + 1.6)) * (q.until != null ? 1 - clamp(prog(lt, q.until, q.until + 1)) : 1);
      const sh = E.inOut(prog(lt, at + .6, at + 3.4)) * num(q.shift, -45), x = num(q.x, 800) + sh + noise(gt * .5, 61) * 4, yb = num(q.y, 1040), hh = clamp(num(q.h, 430), 60, 1200);
      const spr = shadowSprite(hh), bl = 22; c.save(); c.globalAlpha = .92 * a; c.translate(x, yb); c.transform(1, 0, sh * .0012 + noise(gt * .3, 62) * .01, 1, 0, 0);
      c.drawImage(spr, -spr.width / 2, -(spr.height - bl * 2)); c.restore(); } }
    // Laterne am Seil
    const lan = p.lantern === false ? null : { x: 420, y: 610, at: 0, swing: true, ...obj(p.lantern) };
    let lx = 0, ly = 0, lk = 0, fl = 1;
    if (lan) {
      lk = lt >= lan.at ? (lan.at > 0 ? E.out(prog(lt, lan.at, lan.at + .5)) * (lt < lan.at + .35 ? .5 + .5 * flicker(gt, 12, 20) : 1) : 1) : 0;
      const th = (lan.swing !== false ? .15 : .02) * Math.sin(gt * 1.9) + .015 * noise(gt * .6, 3), Lr = 210, px = lan.x, py = lan.y - Lr;
      lx = px + Math.sin(th) * Lr; ly = py + Math.cos(th) * Lr; fl = .88 + .12 * noise(gt * 8, 19);
      c.strokeStyle = '#1a120c'; c.lineWidth = 3; c.beginPath(); c.moveTo(px - Math.sin(th) * 380, py - 380); c.lineTo(lx, ly - 52); c.stroke();
      lanternBody(c, lx, ly, .95, lk * fl, -th);
    }
    // Dunkelheit mit Lichtlöchern
    const wx = AX, wy = ap(0, .16, A.back)[1];
    darkMask(c, dark, [lan && lk > 0 ? { x: lx, y: ly + 30, r: 760 * (.96 + .04 * fl), a: .97 * lk, m: .35 } : null,
      lan && lk > 0 ? { x: lx, y: aFloor(0, 3.2)[1], r: 520, a: .5 * lk, sy: .4 } : null,
      { x: wx, y: wy, r: 170, a: .55 }, { x: wx, y: aFloor(0, 6.2)[1], r: 240, a: .35, sy: .4 },
      hop > 0 ? { x: aFloor((HATCH.x0 + HATCH.x1) / 2, (HATCH.zn + HATCH.zf) / 2)[0], y: aFloor((HATCH.x0 + HATCH.x1) / 2, (HATCH.zn + HATCH.zf) / 2)[1] - 80, r: 600 * hop, a: .95 * hop } : null]);
    // Mondlicht durchs Giebelfenster
    const w0 = ap(-.46, .58, A.back), w1 = ap(.46, -.26, A.back);
    c.save(); c.globalCompositeOperation = 'lighter';
    const fz = aFloor(0, 5.6)[1], gg = c.createLinearGradient(0, w0[1], 0, fz);
    gg.addColorStop(0, 'rgba(120,145,200,.09)'); gg.addColorStop(1, 'rgba(120,145,200,0)');
    for (const s of [1, .8, .6]) { poly(c, [[wx + (w0[0] - wx) * s, w0[1]], [wx + (w1[0] - wx) * s, w0[1]], [wx + 95 * s, fz], [wx - 95 * s, fz]]); c.fillStyle = gg; c.fill(); }
    c.restore();
    addGlow(c, wx, aFloor(0, 5.9)[1], 150, '130,155,210', .14, .3);
    addGlow(c, wx, wy, 110, '140,165,220', .16);
    motes(c, gt, wx, aFloor(0, 5.8)[1] - 90, 170, 20, 5, .4);
    // Licht aus der Luke: weicher Lichtschacht nach oben
    if (hop > 0) { const { x0, x1, zn, zf } = HATCH, [hx, hy] = aFloor((x0 + x1) / 2, (zn + zf) / 2), bm = hatchBeam();
      c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = hop; c.drawImage(bm.cv, bm.x, bm.y); c.restore();
      addGlow(c, hx, hy, 240, '255,170,90', .2 * hop, .55); motes(c, gt, hx, hy - 240, 210, 26, 9, .6 * hop);
      hatchLid(c, hop, gt); }
    // Laternenschein
    if (lan && lk > 0) { addGlow(c, lx, ly, 420, '255,160,80', .2 * lk * fl); addGlow(c, lx, ly, 90, '255,205,140', .45 * lk * fl);
      addGlow(c, lx, aFloor(0, 3.2)[1], 300, '255,150,70', .08 * lk, .35); motes(c, gt, lx, ly + 60, 360, 70, 1, .6 * lk); }
    // Staub rieselt von den Balken
    for (const tc of creaks) { const u = lt - tc; if (u < 0 || u > 3.4) continue; const spr = sprite('warm'), [sx, sy] = ap((BD.x0 + BD.x1) / 2, .9, 3.65), fy = aFloor(.7, 3)[1];
      const lit = lan && lk > 0 ? clamp(1.25 - Math.hypot(sx - lx, sy - ly) / 600) * lk : .25;
      c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,215,165,1)'; c.lineCap = 'round';
      for (let j = 0; j < 46; j++) { const de = hash(j * 1.9 + tc) * .7, a = u - de; if (a < 0) continue; // Staub rieselt in Fäden vom Kehlbalken
        const v = 60 + 120 * hash(j * 2.3), y = sy + 8 + a * v + a * a * 90; if (y > fy) continue;
        const x = sx + (hash(j * 3.7 + tc) - .5) * 150 + noise(a * .8 + j, j) * 10 * a, L = 2 + (v + a * 180) * .03, r = .8 + 1.4 * hash(j * 5.5);
        c.globalAlpha = .45 * lit * clamp(1 - a / 3); c.lineWidth = r * 1.8; c.beginPath(); c.moveTo(x, y - L); c.lineTo(x, y); c.stroke(); }
      c.globalAlpha = clamp(.22 * lit * (1 - u / 2.2)); c.drawImage(sprite('soft'), sx - 110 - u * 40, sy - 12 + u * 30, 220 + u * 80, 60 + u * 70); // Staubschleier
      const [bx, by] = aFloor((BD.x0 + BD.x1) / 2, (BD.z0 + BD.z1) / 2); c.globalAlpha = clamp(.3 * lit * (1 - u / 1.2)); c.drawImage(sprite('soft'), bx - 80 - u * 60, by - 30 - u * 30, 160 + u * 120, 50 + u * 30); // aus den Fugen
      c.restore(); }
  };

  // =====================================================================
  // 4) barn – Stadel innen bei Nacht: Tor, Kühe, Heu, Laterne
  // =====================================================================
  const BX = 540, BY = 800, BF = 760;
  const bp = (X, Y, Z) => [BX + BF * X / Z, BY - BF * Y / Z];
  const B = { fl: -1.6, ce: 1.5, hw: 3.0, back: 4.6, door: .82, dtop: .85, near: .75 };
  function barnOutside(g) { // Blick durchs Tor: Schneefeld im Mondlicht
    const d0 = bp(-B.door, B.dtop, B.back), d1 = bp(B.door, B.fl, B.back);
    const sk = g.createLinearGradient(0, d0[1], 0, BY); sk.addColorStop(0, '#0a1222'); sk.addColorStop(1, '#22314c'); g.fillStyle = sk; g.fillRect(d0[0], d0[1], d1[0] - d0[0], BY - d0[1] + 4);
    for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(220,230,255,${.2 + .4 * hash(i * 2.2)})`; g.fillRect(d0[0] + hash(i * 3.3) * (d1[0] - d0[0]), d0[1] + hash(i * 5.5) * 80, 1.6, 1.6); }
    forestRow(g, d0[0] - 20, d1[0] + 20, BY + 2, 16, 40, '#060b14', 51, 9);
    const sn = g.createLinearGradient(0, BY, 0, d1[1]); sn.addColorStop(0, '#6f82a6'); sn.addColorStop(1, '#92a4c6'); g.fillStyle = sn; g.fillRect(d0[0], BY + 2, d1[0] - d0[0], d1[1] - BY);
    g.strokeStyle = 'rgba(60,75,105,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(BX - 30, d1[1]); g.quadraticCurveTo(BX - 10, BY + 60, BX + 40, BY + 6); g.moveTo(BX + 40, d1[1]); g.quadraticCurveTo(BX + 30, BY + 60, BX + 52, BY + 6); g.stroke();
  }
  function barnStatic(g, hay) {
    g.fillStyle = '#0c0907'; g.fillRect(RX, RY, RW, RH);
    const Zn = B.near, Zb = B.back;
    poly(g, [bp(-B.hw, B.ce, Zn), bp(B.hw, B.ce, Zn), bp(B.hw, B.ce, Zb), bp(-B.hw, B.ce, Zb)]); g.fillStyle = '#17100b'; g.fill();
    for (let X = -B.hw; X <= B.hw; X += .3) beam(g, bp(X, B.ce, Zn), bp(X, B.ce, Zb), BF * .02 / Zn, BF * .02 / Zb, 'rgba(0,0,0,.5)');
    for (const sd of [-1, 1]) {
      poly(g, [bp(sd * B.hw, B.fl, Zn), bp(sd * B.hw, B.ce, Zn), bp(sd * B.hw, B.ce, Zb), bp(sd * B.hw, B.fl, Zb)]); g.fillStyle = '#20170f'; g.fill();
      g.strokeStyle = 'rgba(0,0,0,.5)'; for (let Z = Zn; Z < Zb; Z += .2) { const a = bp(sd * B.hw, B.fl, Z), bb = bp(sd * B.hw, B.ce, Z); g.lineWidth = Math.max(1, BF * .012 / Z); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(bb[0], bb[1]); g.stroke(); }
    }
    const bl = bp(-B.hw, B.fl, Zb), tr = bp(B.hw, B.ce, Zb);
    g.fillStyle = '#1d150e'; g.fillRect(bl[0], tr[1], tr[0] - bl[0], bl[1] - tr[1]);
    g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 2; g.beginPath(); for (let X = -B.hw + .2; X < B.hw; X += .2) { const a = bp(X, B.fl, Zb), bb = bp(X, B.ce, Zb); g.moveTo(a[0], a[1]); g.lineTo(bb[0], bb[1]); } g.stroke();
    g.strokeStyle = 'rgba(110,80,52,.12)'; g.lineWidth = 1; g.beginPath(); for (let X = -B.hw + .1; X < B.hw; X += .2) { const a = bp(X, B.fl, Zb), bb = bp(X, B.ce, Zb); g.moveTo(a[0], a[1]); g.lineTo(bb[0], bb[1]); } g.stroke();
    // Torrahmen
    const d0 = bp(-B.door, B.dtop, Zb), d1 = bp(B.door, B.fl, Zb), fw = 26;
    g.fillStyle = '#2b1f15'; g.fillRect(d0[0] - fw, d0[1] - fw, d1[0] - d0[0] + fw * 2, fw); g.fillRect(d0[0] - fw, d0[1] - fw, fw, d1[1] - d0[1] + fw); g.fillRect(d1[0], d0[1] - fw, fw, d1[1] - d0[1] + fw);
    // Boden aus gestampfter Erde mit Stroh
    const fl = [bp(-B.hw, B.fl, Zn), bp(B.hw, B.fl, Zn), bp(B.hw, B.fl, Zb), bp(-B.hw, B.fl, Zb)], fg = g.createLinearGradient(0, bl[1], 0, H);
    fg.addColorStop(0, '#1d160f'); fg.addColorStop(1, '#2a2016'); poly(g, fl); g.fillStyle = fg; g.fill();
    g.lineWidth = 1.6; g.strokeStyle = 'rgba(175,150,100,.28)'; g.beginPath();
    for (let i = 0; i < 160; i++) { const X = (hash(i * 4.3) - .5) * 5.6, Z = .9 + Math.pow(hash(i * 6.1), .8) * 3.6, [x, y] = bp(X, B.fl, Z), a = hash(i * 8.8) * Math.PI, L = 30 / Z; g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L * .3); } g.stroke();
    // Querbalken + Wandständer
    for (const Z of [1.5, 2.6, 3.7]) { beam(g, bp(-B.hw, B.ce - .1, Z), bp(B.hw, B.ce - .1, Z), BF * .22 / Z, BF * .22 / Z, '#2f2218');
      g.strokeStyle = 'rgba(120,88,58,.25)'; g.lineWidth = Math.max(1, BF * .02 / Z); const a = bp(-B.hw, B.ce - .2, Z), bb = bp(B.hw, B.ce - .2, Z); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(bb[0], bb[1]); g.stroke();
      for (const sd of [-1, 1]) beam(g, bp(sd * B.hw * .985, B.fl, Z), bp(sd * B.hw * .985, B.ce, Z), BF * .2 / Z, BF * .2 / Z, '#291d14'); }
    // Heugabel an der Rückwand
    const f0 = bp(-1.25, B.fl, Zb - .05), f1 = bp(-1.08, .35, Zb - .05); g.strokeStyle = '#0d0907'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(f0[0], f0[1]); g.lineTo(f1[0], f1[1]); g.stroke();
    g.lineWidth = 3; g.beginPath(); for (const o of [-12, 0, 12]) { g.moveTo(f1[0] - 14, f1[1] + 4); g.lineTo(f1[0] + o, f1[1] - 2); g.lineTo(f1[0] + o * 1.1, f1[1] - 46); } g.stroke();
    if (hay) {
      const [hx, hy] = bp(1.75, B.fl, 2.2); hayPile(g, hx, hy, 300, 230, 21);
      const [h2, y2] = bp(2.2, B.fl, 4.0); hayPile(g, h2, y2, 190, 120, 27);
      g.strokeStyle = 'rgba(175,150,100,.35)'; g.lineWidth = 2; g.beginPath(); // Heu hängt vom Boden über die Kante
      for (let i = 0; i < 90; i++) { const X = (hash(i * 2.3) - .5) * 6, [x, y] = bp(X, B.ce, 1.75), L = 30 + 70 * hash(i * 4.4); g.moveTo(x, y); g.quadraticCurveTo(x + (hash(i) - .5) * 30, y + L * .5, x + (hash(i * 7) - .5) * 40, y + L); } g.stroke();
    }
  }
  function cowDraw(c, x, y, s, t, sd, flip, rim) { // Kuh im Profil, Blick nach rechts; (x,y) = Brust am Boden; s = px je Einheit (Rumpf = 100)
    c.save(); c.translate(x, y); c.scale(flip ? -s : s, s);
    // Proportionen: Rumpf 100 Einheiten (≈1,6 m), Widerrist 86 hoch, Kopf ≈ 30 lang
    const nod = Math.sin(t * .7 + sd * 2) * .05 + noise(t * .4, sd + 3) * .06, pale = '#5e5448', HX = 7, HY = -74;
    const body = (col, marks) => {
      c.fillStyle = col; c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); // Rumpf mit Beinen als eine Silhouette
      c.moveTo(-8, -86); c.bezierCurveTo(-30, -82, -55, -81, -78, -88); c.quadraticCurveTo(-92, -89, -100, -84); c.quadraticCurveTo(-104, -76, -101, -62);
      c.bezierCurveTo(-100, -50, -97, -36, -96, -24); c.lineTo(-94, -6); c.lineTo(-95, 0); c.lineTo(-88, 0); c.lineTo(-88, -8); c.quadraticCurveTo(-87, -22, -84, -30);
      c.quadraticCurveTo(-80, -38, -74, -40); c.bezierCurveTo(-55, -35, -30, -34, -12, -38); c.lineTo(-9, -6); c.lineTo(-9, 0); c.lineTo(-2, 0); c.lineTo(-2, -8);
      c.quadraticCurveTo(-1, -30, 2, -42); c.quadraticCurveTo(5, -52, 5, -60); c.lineTo(8, -74); c.quadraticCurveTo(2, -84, -8, -86); c.closePath(); c.fill();
      c.lineWidth = 6; c.beginPath(); c.moveTo(-16, -36); c.lineTo(-15, -1); c.moveTo(-80, -36); c.quadraticCurveTo(-79, -18, -82, -1); c.stroke(); // hintere Beine
      c.beginPath(); c.ellipse(-70, -37, 7, 5, 0, 0, 7); c.fill(); // Euter
      if (marks) { c.fillStyle = '#2c241d'; c.beginPath(); c.ellipse(-56, -68, 8, 6, -.25, 0, 7); c.ellipse(-30, -60, 6, 4.5, .3, 0, 7); c.fill(); c.fillStyle = col; } // Fleckvieh-Flecken
      const sw = Math.sin(t * 1.3 + sd) * 3 + noise(t * .8, sd) * 2.5; c.lineWidth = 2.2; c.beginPath(); c.moveTo(-101, -82); c.quadraticCurveTo(-105, -60, -104 + sw * .5, -34); c.stroke();
      c.beginPath(); c.ellipse(-104 + sw * .5, -30, 2.6, 5.5, 0, 0, 7); c.fill();
      c.save(); c.translate(HX, HY); c.rotate(nod); // Kopf (nickt): kurz, tief, stumpfes breites Maul
      const head = () => { c.beginPath(); c.moveTo(-7, 0); c.quadraticCurveTo(1, -6, 10, -4); c.quadraticCurveTo(14, 2, 19, 11); c.quadraticCurveTo(23, 17, 22, 21);
        c.quadraticCurveTo(20, 25, 15, 25); c.quadraticCurveTo(9, 25, 5, 21); c.quadraticCurveTo(0, 16, -5, 14); c.lineTo(-8, 8); c.closePath(); };
      head(); c.fill();
      if (marks) { c.fillStyle = '#2c241d'; head(); c.fill(); c.fillStyle = pale; c.beginPath(); c.moveTo(5, -5); c.quadraticCurveTo(11, -4, 14, 2); c.quadraticCurveTo(18, 10, 21, 16);
        c.quadraticCurveTo(22, 20, 19, 20); c.quadraticCurveTo(14, 13, 9, 5); c.quadraticCurveTo(6, 0, 5, -5); c.fill();
        c.fillStyle = '#120b06'; c.beginPath(); c.ellipse(20, 20.5, 2.2, 1.8, .5, 0, 7); c.fill(); c.fillStyle = col; } // helle Blesse, Nüster
      const ear = mod(t + sd * 3, 4.3) < .25 ? .45 : 0; c.beginPath(); c.ellipse(-5, 1, 7.5, 2.7, .12 + ear, 0, 7); c.fill(); // Ohr steht seitlich ab
      c.lineWidth = 2.6; c.beginPath(); c.moveTo(1, -4); c.quadraticCurveTo(2, -10, 7, -12); c.stroke(); // kurzes Horn
      c.restore();
    };
    if (rim) { c.save(); c.translate(1, -1); body(rim, false); c.restore(); }
    body('#140c07', true);
    c.restore();
    const mx = HX + Math.cos(nod) * 21 - Math.sin(nod) * 21, my = HY + Math.sin(nod) * 21 + Math.cos(nod) * 21;
    return [x + (flip ? -mx : mx) * s, y + my * s];
  }
  function frontFigure(c, x, y, h, t, col, rim) { // Gestalt frontal: Hut, Mantel, Arme etwas abgesetzt – gegen helles Licht
    const sw = noise(t * .5, 8) * h * .006, X = v => x + v * h, Y = v => y - v * h, s = v => x + v * h + sw;
    const path = () => { c.beginPath();
      // Beine
      c.moveTo(X(-.075), Y(0)); c.lineTo(X(-.065), Y(.3)); c.lineTo(X(.065), Y(.3)); c.lineTo(X(.075), Y(0)); c.lineTo(X(.02), Y(0)); c.lineTo(X(.008), Y(.22)); c.lineTo(X(-.008), Y(.22)); c.lineTo(X(-.02), Y(0)); c.closePath();
      // Mantel + Schultern
      c.moveTo(X(-.15), Y(.28)); c.lineTo(s(-.13), Y(.62)); c.quadraticCurveTo(s(-.14), Y(.77), s(-.06), Y(.795)); c.lineTo(s(-.03), Y(.83)); c.lineTo(s(.03), Y(.83)); c.lineTo(s(.06), Y(.795));
      c.quadraticCurveTo(s(.14), Y(.77), s(.13), Y(.62)); c.lineTo(X(.15), Y(.28)); c.closePath();
      // Arme (leicht abgesetzt, Licht scheint zwischen Arm und Körper durch)
      for (const d of [-1, 1]) { c.moveTo(s(d * .12), Y(.775)); c.quadraticCurveTo(s(d * .215), Y(.74), X(d * .205), Y(.43)); c.quadraticCurveTo(X(d * .185), Y(.39), X(d * .158), Y(.42));
        c.quadraticCurveTo(s(d * .152), Y(.6), s(d * .118), Y(.7)); c.closePath(); }
      // Kopf + Hut
      c.moveTo(s(.058), Y(.9)); c.ellipse(s(0), Y(.9), h * .058, h * .07, 0, 0, Math.PI * 2);
      c.moveTo(s(.11), Y(.952)); c.ellipse(s(0), Y(.952), h * .11, h * .016, 0, 0, Math.PI * 2);
      c.moveTo(s(-.065), Y(.95)); c.lineTo(s(-.058), Y(1.02)); c.quadraticCurveTo(s(0), Y(1.0), s(.058), Y(1.02)); c.lineTo(s(.065), Y(.95)); c.closePath(); };
    c.save(); path(); if (rim) { glow(c, rim, h * .035); c.fillStyle = col; c.fill('nonzero'); glow(c, rim, h * .012); } c.fillStyle = col; c.fill('nonzero'); noGlow(c);
    c.restore();
  }
  SCENES.barn = (c, lt, b, gt) => {
    const p = b.p || {};
    const hay = p.hay !== false, animals = p.animals !== false, dark = clamp(num(p.dark, .75));
    blit(c, layer('barn|' + hay, g => barnStatic(g, hay)));
    // Tor: Spalt / Aufschwingen
    let gap = clamp(num(p.doorGap, .22));
    const swT = tOn(p.swing);
    if (swT != null && lt >= swT) { const to = clamp(num(p.swingTo, .9)), u = lt - swT, du = num(p.swingDur, 1.6);
      const k = u < du ? E.inOut(u / du) : 1, wob = u > du * .7 ? Math.exp(-(u - du * .7) * 3) * Math.sin((u - du * .7) * 9) * .04 : 0; gap = lerp(gap, to, k) + wob; }
    gap = clamp(gap);
    const d0 = bp(-B.door, B.dtop, B.back), d1 = bp(B.door, B.fl, B.back), th = gap * 1.4;
    if (gap > 0) {
      c.save(); c.beginPath(); c.rect(d0[0], d0[1], d1[0] - d0[0], d1[1] - d0[1]); c.clip();
      const ol = layer('barnOut', barnOutside, [d0[0] - 4, d0[1] - 4, d1[0] - d0[0] + 8, d1[1] - d0[1] + 8]); c.drawImage(ol, ol.ox, ol.oy);
      snowfall(c, gt, { n: 50, x0: d0[0] - 40, x1: d1[0] + 40, y0: d0[1] - 20, y1: d1[1], s0: 1.2, s1: 4.5, v0: 30, v1: 90, alpha: .8, seed: 8 });
      c.restore();
    }
    for (const sd of [-1, 1]) { // Torflügel schwingen nach außen
      const hx = sd * B.door, free = [sd * B.door - sd * B.door * Math.cos(th), B.back + B.door * Math.sin(th)];
      const pts = [bp(hx, B.fl, B.back), bp(hx, B.dtop, B.back), bp(free[0], B.dtop, free[1]), bp(free[0], B.fl, free[1])];
      poly(c, pts); c.fillStyle = '#1a120c'; c.fill(); c.strokeStyle = '#0a0705'; c.lineWidth = 2; c.stroke();
      c.strokeStyle = 'rgba(0,0,0,.55)'; c.lineWidth = 2; c.beginPath();
      for (let k = 1; k < 5; k++) { const u = k / 5, X = lerp(hx, free[0], u), Z = lerp(B.back, free[1], u), a = bp(X, B.fl, Z), bb = bp(X, B.dtop, Z); c.moveTo(a[0], a[1]); c.lineTo(bb[0], bb[1]); }
      const q1 = bp(hx, B.fl + .25, B.back), q2 = bp(free[0], B.dtop - .25, free[1]); c.moveTo(q1[0], q1[1]); c.lineTo(q2[0], q2[1]); c.stroke();
    }
    // Gestalt im Tor
    const fg = p.figure; let figOn = 0, figX = BX, figH = 300;
    if (fg) { const q = obj(fg), at = num(q.at, 0), un = q.until != null ? q.until : null;
      figOn = lt >= at ? clamp(prog(lt, at, at + .5)) * (un != null ? 1 - clamp(prog(lt, un, un + .5)) : 1) : 0; figX = num(q.x, BX); figH = num(q.h, 300);
      if (figOn > 0) { c.save(); c.globalAlpha = figOn; frontFigure(c, figX, d1[1] + 4, figH, gt, '#030304', 'rgba(175,195,235,.55)'); c.restore(); } }
    // Kühe
    const steam = [];
    if (animals) {
      // Stall rechts: Kuh hinter der Trennwand, Kopf zur Stallgasse
      steam.push([cowDraw(c, 900, 1138, 3.4, gt, 2, true, 'rgba(130,95,60,.3)'), .8, 2]);
      const pw = [bp(1.25, B.fl, 2.75), bp(1.25, -.75, 2.75), bp(B.hw, -.75, 2.75), bp(B.hw, B.fl, 2.75)]; poly(c, pw); c.fillStyle = '#21170f'; c.fill();
      c.strokeStyle = 'rgba(0,0,0,.55)'; c.lineWidth = 2; c.beginPath(); for (let k = 1; k < 4; k++) { const y = lerp(B.fl, -.75, k / 4), a = bp(1.25, y, 2.75), bb = bp(B.hw, y, 2.75); c.moveTo(a[0], a[1]); c.lineTo(bb[0], bb[1]); } c.stroke();
      beam(c, bp(1.25, B.fl, 2.75), bp(1.25, -.35, 2.75), 18, 18, '#2c2016');
      // Stall links: Kuh vorn, Kopf über dem Trog
      steam.push([cowDraw(c, 200, 1205, 4.0, gt, 7, false, 'rgba(160,110,62,.32)'), 1, 7]);
      const tr = [bp(-1.05, B.fl, 2.2), bp(-1.05, -1.1, 2.2), bp(-1.05, -1.1, 3.6), bp(-1.05, B.fl, 3.6)]; poly(c, tr); c.fillStyle = '#1e150e'; c.fill(); // Futtertrog
      beam(c, bp(-1.05, -1.1, 2.2), bp(-1.05, -1.1, 3.6), 12, 8, '#33251a');
    }
    const lan = p.lantern === false ? null : { x: 300, y: 650, at: 0, ...obj(p.lantern) };
    let lk = 0, fl = 1;
    if (lan) { lk = lt >= lan.at ? (lan.at > 0 ? E.out(prog(lt, lan.at, lan.at + .45)) * (lt < lan.at + .4 ? .45 + .55 * flicker(gt, 31, 22) : 1) : 1) : 0; fl = .88 + .12 * noise(gt * 8, 44);
      const th = Math.sin(gt * 1.1) * .035 + noise(gt * .5, 6) * .02, ropeTop = bp(0, B.ce - .1, 2.6)[1], L = lan.y - ropeTop - 50;
      const lx = lan.x + Math.sin(th) * L * .25; c.strokeStyle = '#120c08'; c.lineWidth = 3; c.beginPath(); c.moveTo(lan.x, ropeTop); c.lineTo(lx, lan.y - 50); c.stroke();
      lan.x = lx; lanternBody(c, lan.x, lan.y, .78, lk * fl, -th * .5); }
    // Mondlicht fällt durch den Spalt auf den Boden
    const hwS = B.door * clamp((1 - Math.cos(th)) * 1.25), shaft = [bp(-hwS, B.fl, B.back), bp(hwS, B.fl, B.back), bp(hwS * 1.5 + .1, B.fl, 1.15), bp(-hwS * 1.5 - .1, B.fl, 1.15)];
    darkMask(c, dark, [lan && lk > 0 ? { x: lan.x, y: lan.y + 20, r: 700 * (.96 + .04 * fl), a: .97 * lk, m: .35 } : null,
      lan && lk > 0 ? { x: lan.x + 60, y: bp(0, B.fl, 2.6)[1], r: 520, a: .5 * lk, sy: .45 } : null,
      gap > 0 ? { x: BX, y: d1[1] - 120, r: 420 * Math.sqrt(gap), a: .8 } : null, gap > 0 ? { x: BX, y: d1[1] + 260, r: 520 * Math.sqrt(gap), a: .45, sy: .5 } : null]);
    if (gap > 0) {
      c.save(); c.globalCompositeOperation = 'lighter'; const sg = c.createLinearGradient(0, d1[1], 0, H); sg.addColorStop(0, `rgba(140,165,215,${.3 * Math.sqrt(gap)})`); sg.addColorStop(1, 'rgba(140,165,215,0)');
      poly(c, shaft); c.fillStyle = sg; c.fill();
      const vb = [[d0[0] + (1 - hwS / B.door) * (d1[0] - d0[0]) / 2, d0[1]], [d1[0] - (1 - hwS / B.door) * (d1[0] - d0[0]) / 2, d0[1]], shaft[2], shaft[3]];
      const vg = c.createLinearGradient(0, d0[1], 0, H); vg.addColorStop(0, `rgba(140,165,215,${.07 * Math.sqrt(gap)})`); vg.addColorStop(1, 'rgba(140,165,215,0)'); poly(c, vb); c.fillStyle = vg; c.fill(); c.restore();
      if (figOn > 0) { c.save(); poly(c, shaft); c.clip(); c.globalAlpha = .8 * figOn; const fx = figX, fy = d1[1];
        c.fillStyle = '#000'; c.beginPath(); c.moveTo(fx - figH * .08, fy); c.lineTo(fx + figH * .08, fy); c.lineTo(fx + (fx - BX) * 2.2 + figH * .38, H + 100); c.lineTo(fx + (fx - BX) * 2.2 - figH * .38, H + 100); c.closePath();
        const sgr = c.createLinearGradient(0, fy, 0, H); sgr.addColorStop(0, 'rgba(0,0,0,1)'); sgr.addColorStop(1, 'rgba(0,0,0,.2)'); c.fillStyle = sgr; c.fill(); c.restore(); }
      // Schnee weht herein
      const spr = sprite('flake'); for (let i = 0; i < 18; i++) { const u = mod(gt * .5 + hash(i * 3.1), 1), x = BX + (hash(i * 5.3) - .5) * (d1[0] - d0[0]) * hwS / B.door + u * (hash(i * 7.1) - .5) * 300, y = d1[1] - 60 + u * 260 + Math.sin(u * 9 + i) * 12;
        c.globalAlpha = .6 * Math.sin(u * Math.PI); c.drawImage(spr, x - 4, y - 4, 8, 8); } c.globalAlpha = 1;
    }
    // Laternenschein + Atemdampf
    if (lan && lk > 0) { addGlow(c, lan.x, lan.y, 380, '255,160,80', .2 * lk * fl); addGlow(c, lan.x, lan.y, 80, '255,205,140', .45 * lk * fl); motes(c, gt, lan.x, lan.y + 60, 330, 50, 4, .5 * lk); }
    const spr = sprite('soft');
    for (const [[mx, my], s, sd] of steam) { const lit = lan && lk > 0 ? clamp(1 - Math.hypot(mx - lan.x, my - lan.y) / 800) * lk : 0, la = .12 + .38 * lit, dir = mx > BX ? -1 : 1;
      for (let j = 0; j < 3; j++) { const per = 3.4, a = mod(gt + sd * .7 - j * .14, per); if (a > 2.2) continue;
        const x = mx + dir * a * 30 * s * (j === 1 ? 1.1 : 1), y = my - a * 16 * s + 8 * s, r = (8 + a * 22) * s; c.globalAlpha = la * (1 - a / 2.2) * Math.min(1, a * 5); c.drawImage(spr, x - r, y - r, 2 * r, 2 * r); } }
    c.globalAlpha = 1;
  };

  // =====================================================================
  // 5) kitchen_old – Bauernküche: Tisch, Kachelofen, Fenster mit Schnee, Kerze
  // =====================================================================
  const KI = { win: [600, 400, 260, 360], glass: [624, 424, 212, 312], stove: [70, 470, 340, 710], candle: [560, 1182], keys: [512, 655] };
  function kitchenStatic(g, o) {
    const wg = g.createLinearGradient(0, 160, 0, 1200); wg.addColorStop(0, '#29251f'); wg.addColorStop(1, '#201c17');
    g.fillStyle = wg; g.fillRect(RX, 150, RW, 1070);
    for (let i = 0; i < 46; i++) { const x = RX + hash(i * 3.7) * RW, y = 180 + hash(i * 5.1) * 1000, r = 40 + hash(i * 2.2) * 170;
      spot(g, x, y, r, hash(i) > .5 ? 'rgba(0,0,0,A)' : 'rgba(130,118,100,A)', .05 + .05 * hash(i * 9)); }
    g.fillStyle = '#15100c'; g.fillRect(RX, RY, RW, 360); // Decke
    g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 2; g.beginPath(); for (let x = RX; x < W - RX; x += 90) { g.moveTo(x, RY); g.lineTo(x + (x - 540) * .08, 150); } g.stroke();
    g.fillStyle = '#261b13'; g.fillRect(RX, 112, RW, 58); g.fillStyle = 'rgba(120,88,58,.2)'; g.fillRect(RX, 164, RW, 5); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(RX, 170, RW, 14);
    g.fillStyle = '#110d0a'; g.fillRect(RX, 1205, RW, 1000); // Boden
    g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 2; g.beginPath(); for (let i = -8; i <= 8; i++) { g.moveTo(540 + i * 110, 1205); g.lineTo(540 + i * 360, H - RY); } g.stroke();
    g.fillStyle = '#19130e'; g.fillRect(RX, 1186, RW, 22);
    // Wandbrett über dem Fenster
    g.fillStyle = '#2c2017'; g.fillRect(580, 330, 300, 12); g.fillStyle = '#1a130d'; for (const x of [600, 850]) g.fillRect(x, 342, 10, 26);
    g.fillStyle = '#3a342c'; g.beginPath(); g.moveTo(628, 330); g.quadraticCurveTo(612, 296, 632, 276); g.lineTo(654, 276); g.quadraticCurveTo(674, 296, 658, 330); g.closePath(); g.fill(); g.fillRect(633, 268, 20, 9);
    g.fillStyle = '#4a4438'; g.beginPath(); g.ellipse(735, 316, 42, 14, 0, Math.PI, 0); g.fill();
    for (const x of [800, 832]) { g.fillStyle = '#5a5446'; g.beginPath(); g.ellipse(x, 296, 14, 34, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(70,90,120,.5)'; g.lineWidth = 3; g.stroke(); }
    // Fensternische
    const [wx, wy, ww, wh] = KI.win, [gx, gy, gw, gh] = KI.glass;
    g.fillStyle = '#3a342d'; g.fillRect(wx, wy, ww, wh);
    g.fillStyle = '#2c2721'; g.beginPath(); g.moveTo(wx, wy); g.lineTo(gx, gy); g.lineTo(gx, gy + gh); g.lineTo(wx, wy + wh); g.fill();
    g.fillStyle = '#433c34'; g.beginPath(); g.moveTo(wx + ww, wy); g.lineTo(gx + gw, gy); g.lineTo(gx + gw, gy + gh); g.lineTo(wx + ww, wy + wh); g.fill();
    g.fillStyle = '#24201b'; g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx + ww, wy); g.lineTo(gx + gw, gy); g.lineTo(gx, gy); g.fill();
    const og = g.createLinearGradient(0, gy, 0, gy + gh); og.addColorStop(0, '#08101f'); og.addColorStop(.62, '#1a2842'); og.addColorStop(.64, '#4b5c7c'); og.addColorStop(1, '#5e7192');
    g.fillStyle = o.win === 'dark' ? '#05080f' : og; g.fillRect(gx, gy, gw, gh);
    if (o.win !== 'dark') { g.save(); g.beginPath(); g.rect(gx, gy, gw, gh); g.clip(); forestRow(g, gx - 30, gx + gw + 30, gy + gh * .63, 18, 46, '#050910', 61, 10);
      g.fillStyle = '#0b1220'; g.fillRect(gx + gw * .52, gy + gh * .5, gw * .3, gh * .14); g.beginPath(); g.moveTo(gx + gw * .48, gy + gh * .5); g.lineTo(gx + gw * .67, gy + gh * .4); g.lineTo(gx + gw * .86, gy + gh * .5); g.fill();
      g.fillStyle = '#7d90b2'; g.beginPath(); g.moveTo(gx + gw * .48, gy + gh * .5); g.lineTo(gx + gw * .67, gy + gh * .4); g.lineTo(gx + gw * .86, gy + gh * .5); g.lineTo(gx + gw * .84, gy + gh * .505); g.lineTo(gx + gw * .67, gy + gh * .415); g.lineTo(gx + gw * .5, gy + gh * .505); g.fill(); g.restore(); }
    g.fillStyle = '#30261d'; g.fillRect(wx - 22, wy + wh, ww + 44, 22); g.fillStyle = 'rgba(150,120,85,.25)'; g.fillRect(wx - 22, wy + wh, ww + 44, 4);
    // Schlüsselbrett
    const [kx, ky] = KI.keys; g.fillStyle = '#35271b'; rr(g, kx - 62, ky - 16, 124, 30, 5); g.fill(); g.fillStyle = 'rgba(140,105,70,.25)'; g.fillRect(kx - 58, ky - 14, 116, 3);
    g.strokeStyle = '#141110'; g.lineWidth = 4; g.lineCap = 'round'; for (const ox of [-34, 0, 34]) { g.beginPath(); g.moveTo(kx + ox, ky + 4); g.lineTo(kx + ox, ky + 22); g.quadraticCurveTo(kx + ox + 7, ky + 26, kx + ox + 8, ky + 18); g.stroke(); }
    // Wanduhr rechts
    g.fillStyle = '#20170f'; rr(g, 900, 330, 112, 92, 14); g.fill(); g.fillRect(926, 418, 60, 210); g.fillStyle = '#0d0a07'; g.fillRect(934, 440, 44, 170);
    g.fillStyle = '#9a917e'; g.beginPath(); g.arc(956, 375, 34, 0, 7); g.fill(); g.strokeStyle = '#2a2119'; g.lineWidth = 3; g.stroke();
    g.strokeStyle = '#1b150f'; g.lineWidth = 4; g.beginPath(); g.moveTo(956, 375); g.lineTo(943, 357); g.moveTo(956, 375); g.lineTo(975, 381); g.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.fillStyle = '#2a2119'; g.fillRect(956 + Math.cos(a) * 27 - 1.5, 375 + Math.sin(a) * 27 - 1.5, 3, 3); }
    // Eckbank hinter dem Tisch
    g.fillStyle = '#2a1e15'; g.fillRect(380, 960, 1000, 170); g.fillStyle = 'rgba(0,0,0,.45)'; for (let y = 990; y < 1130; y += 34) g.fillRect(380, y, 1000, 3);
    g.fillStyle = '#33251a'; g.fillRect(372, 948, 1010, 18);
    // Kachelofen
    if (o.stove) { const [sx, sy, sw, sh] = KI.stove;
      g.fillStyle = '#151817'; g.fillRect(sx + 10, sy + 40, sw - 20, sh - 40);
      g.fillStyle = '#2b3430'; rr(g, sx - 18, sy, sw + 36, 46, 10); g.fill(); g.fillStyle = 'rgba(150,170,160,.18)'; g.fillRect(sx - 14, sy + 4, sw + 28, 6);
      const rows = 7, cols = 4, tw = (sw - 20) / cols, th = (sh - 200) / rows;
      for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) { const x = sx + 10 + q * tw, y = sy + 52 + r * th;
        const tg = g.createRadialGradient(x + tw * .42, y + th * .38, 2, x + tw / 2, y + th / 2, tw * .72); tg.addColorStop(0, '#44524c'); tg.addColorStop(1, '#242c29');
        g.fillStyle = tg; rr(g, x + 3, y + 3, tw - 6, th - 6, 7); g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3; g.stroke();
        g.strokeStyle = 'rgba(170,195,180,.14)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 8, y + th - 10); g.lineTo(x + 8, y + 9); g.lineTo(x + tw - 10, y + 9); g.stroke();
        g.fillStyle = `rgba(255,220,170,${.16 + .14 * hash(r * 7 + q)})`; g.beginPath(); g.ellipse(x + tw * .68, y + th * .3, 7, 3.5, -.5, 0, 7); g.fill(); } // Glanz der Glasur
      g.fillStyle = '#1a1d1c'; g.fillRect(sx + 4, sy + sh - 150, sw - 8, 150); g.fillStyle = '#262a28'; g.fillRect(sx - 6, sy + sh - 156, sw + 12, 14);
      g.fillStyle = '#0b0c0c'; rr(g, sx + 104, sy + sh - 118, 120, 78, 6); g.fill(); g.strokeStyle = '#2c2f2e'; g.lineWidth = 3; g.stroke();
      g.fillStyle = '#3a3d3c'; g.fillRect(sx + 196, sy + sh - 84, 22, 8);
      // Ofenrohr
      g.fillStyle = '#1d1a17'; g.fillRect(sx + 205, 290, 44, sy - 290 + 4); g.fillRect(sx + 205, 290, 150, 44); g.beginPath(); g.arc(sx + 227, 312, 22, Math.PI, Math.PI * 1.5); g.fill();
      g.fillStyle = 'rgba(190,150,105,.2)'; g.fillRect(sx + 236, 334, 6, sy - 334); g.fillRect(sx + 227, 296, 120, 5); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(sx + 207, 334, 8, sy - 334);
      g.fillStyle = '#2a2622'; g.fillRect(sx + 201, sy - 14, 52, 12); g.fillRect(sx + 201, 400, 52, 8); // Rohrmuffen
      g.fillStyle = '#1d1b18'; g.beginPath(); g.ellipse(sx + 360, 312, 12, 30, 0, 0, 7); g.fill(); g.fillStyle = '#2a2622'; g.fillRect(sx + 222, 360, 34, 10); }
    // Tisch
    const tg = g.createLinearGradient(0, 1120, 0, 1400); tg.addColorStop(0, '#2e2118'); tg.addColorStop(1, '#3d2c1f');
    g.fillStyle = tg; g.beginPath(); g.moveTo(330, 1120); g.lineTo(1330, 1120); g.lineTo(1480, 1400); g.lineTo(190, 1400); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 3; g.beginPath(); for (const y of [1182, 1252, 1328]) { const k = (y - 1120) / 280; g.moveTo(lerp(330, 190, k), y); g.lineTo(lerp(1330, 1480, k), y); } g.stroke();
    g.strokeStyle = 'rgba(110,80,55,.16)'; g.lineWidth = 1.4; g.beginPath();
    for (let i = 0; i < 26; i++) { const y = 1128 + hash(i * 3.3) * 266, k = (y - 1120) / 280, x0 = lerp(330, 190, k) + hash(i * 5.1) * 600; g.moveTo(x0, y); g.bezierCurveTo(x0 + 120, y + 3, x0 + 240, y - 3, x0 + 380, y + 1); } g.stroke();
    g.fillStyle = '#20170f'; g.fillRect(150, 1400, 1400, 44); g.fillStyle = 'rgba(130,95,60,.2)'; g.fillRect(190, 1400, 1290, 4);
    g.fillStyle = '#140f0b'; g.fillRect(222, 1444, 48, 800);
    // Brot auf dem Brett
    if (o.bread) { g.fillStyle = '#3e2c1c'; rr(g, 240, 1214, 210, 50, 12); g.fill(); g.fillStyle = 'rgba(140,105,70,.25)'; g.fillRect(248, 1216, 194, 4); g.fillStyle = '#3e2c1c'; rr(g, 200, 1228, 50, 18, 8); g.fill();
      const lg = g.createRadialGradient(330, 1188, 8, 345, 1210, 100); lg.addColorStop(0, '#9a6c44'); lg.addColorStop(1, '#4a2f1b');
      g.fillStyle = lg; g.beginPath(); g.ellipse(340, 1212, 92, 50, 0, Math.PI * 1.02, Math.PI * 1.98); g.lineTo(432, 1232); g.lineTo(248, 1232); g.closePath(); g.fill();
      g.fillStyle = '#b89c74'; g.beginPath(); g.ellipse(430, 1214, 16, 30, 0, 0, 7); g.fill();
      g.strokeStyle = 'rgba(40,24,12,.6)'; g.lineWidth = 3; g.beginPath(); for (const ox of [-40, -10, 20]) { g.moveTo(340 + ox - 10, 1180); g.lineTo(340 + ox + 14, 1196); } g.stroke();
      g.strokeStyle = '#8c8c90'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(300, 1286); g.lineTo(420, 1270); g.stroke(); g.strokeStyle = '#1a120c'; g.lineWidth = 9; g.beginPath(); g.moveTo(420, 1270); g.lineTo(476, 1263); g.stroke(); }
    if (o.plate) { g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(486, 1352, 118, 40, 0, 0, 7); g.fill();
      g.fillStyle = '#a9a294'; g.beginPath(); g.ellipse(480, 1342, 116, 40, 0, 0, 7); g.fill(); g.strokeStyle = '#51617d'; g.lineWidth = 3; g.beginPath(); g.ellipse(480, 1342, 104, 34, 0, 0, 7); g.stroke();
      g.fillStyle = '#958e80'; g.beginPath(); g.ellipse(480, 1344, 66, 21, 0, 0, 7); g.fill();
      g.strokeStyle = '#7d7d82'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(560, 1330); g.lineTo(640, 1372); g.stroke(); g.fillStyle = '#7d7d82'; g.beginPath(); g.ellipse(548, 1324, 16, 9, .45, 0, 7); g.fill(); }
    if (o.candle) { const [cx, cy] = KI.candle; g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(cx + 6, cy + 8, 56, 16, 0, 0, 7); g.fill();
      g.fillStyle = '#5e4a28'; g.beginPath(); g.ellipse(cx, cy, 50, 15, 0, 0, 7); g.fill(); g.fillStyle = '#7d6534'; g.beginPath(); g.ellipse(cx, cy - 4, 44, 12, 0, 0, 7); g.fill();
      g.fillStyle = '#4c3b1f'; g.fillRect(cx - 20, cy - 26, 40, 22); g.fillStyle = '#d6cdb8'; g.fillRect(cx - 14, cy - 140, 28, 116);
      g.fillStyle = '#e8e0cc'; g.beginPath(); g.ellipse(cx, cy - 140, 14, 4, 0, 0, 7); g.fill(); g.fillStyle = '#cfc5ae'; rr(g, cx + 6, cy - 138, 7, 46, 3); g.fill(); rr(g, cx - 12, cy - 136, 5, 24, 2); g.fill();
      g.strokeStyle = '#1a1410'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy - 141); g.lineTo(cx + 1, cy - 152); g.stroke(); }
  }
  function keyShape(c, x, y, s) { // alter Bartschlüssel, hängt an (x,y)
    c.save(); c.translate(x, y); c.scale(s, s);
    c.strokeStyle = '#4a453e'; c.lineWidth = 5; c.beginPath(); c.arc(0, 12, 11, 0, 7); c.stroke();
    c.fillStyle = '#4a453e'; c.fillRect(-3, 22, 6, 62); c.fillRect(0, 70, 16, 14); c.fillStyle = '#1e1b18'; c.fillRect(6, 74, 5, 10);
    c.strokeStyle = 'rgba(190,180,160,.35)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-1, 24); c.lineTo(-1, 80); c.stroke();
    c.restore();
  }
  function keyGhost(c, s) { // ausgesparte, hellere Wandfläche in Schlüsselform
    c.save(); c.scale(s, s); c.strokeStyle = 'rgba(190,175,150,1)'; c.lineWidth = 9; c.beginPath(); c.arc(0, 12, 11, 0, 7); c.stroke();
    c.fillStyle = 'rgba(190,175,150,1)'; c.fillRect(-5, 20, 10, 66); c.fillRect(-2, 68, 20, 18); c.restore();
  }
  function newspaper(c, x, y, w, h, rot, title, sub, a) {
    c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot);
    glow(c, 'rgba(0,0,0,.6)', 24); c.fillStyle = '#cbc3ae'; c.fillRect(-w / 2, -h / 2, w, h); noGlow(c);
    const pg = c.createLinearGradient(0, -h / 2, 0, h / 2); pg.addColorStop(0, 'rgba(255,250,235,.12)'); pg.addColorStop(1, 'rgba(60,45,25,.18)'); c.fillStyle = pg; c.fillRect(-w / 2, -h / 2, w, h);
    c.fillStyle = 'rgba(90,70,40,.35)'; c.fillRect(-w / 2, h / 2 - 3, w, 3); // Falz
    let fs = 44; c.font = `400 ${fs}px Fraktur`; let tw = c.measureText(title).width; const maxW = w - 30;
    let lines = [title]; if (tw > maxW) { fs = Math.floor(44 * maxW / tw); if (fs < 32) { const ws = title.split(' '); if (ws.length > 1) { const cut = Math.ceil(ws.length / 2); lines = [ws.slice(0, cut).join(' '), ws.slice(cut).join(' ')]; c.font = '400 44px Fraktur'; fs = Math.min(42, Math.floor(44 * maxW / Math.max(...lines.map(l => c.measureText(l).width)))); } } }
    let ty = -h / 2 + 14 + fs * .9;
    for (const l of lines) { txt(c, l, 0, ty, `400 ${fs}px Fraktur`, '#16120d'); ty += fs * 1.02; }
    c.fillStyle = '#2a241c'; c.fillRect(-w / 2 + 14, ty - fs * .55, w - 28, 2.5); c.fillRect(-w / 2 + 14, ty - fs * .55 + 6, w - 28, 1.2);
    if (sub) txt(c, sub, 0, ty - fs * .55 + 22, '400 13px OldStd', '#3a3226');
    const top = ty - fs * .55 + (sub ? 32 : 18), colW = (w - 28 - 18) / 4;
    for (let q = 0; q < 4; q++) for (let r = 0; top + r * 11 < h / 2 - 10; r++) { const lw = colW * (r % 7 === 6 ? .55 : .92 - .1 * hash(q * 31 + r));
      c.fillStyle = r === 0 ? 'rgba(30,24,18,.6)' : 'rgba(50,42,32,.32)'; c.fillRect(-w / 2 + 14 + q * (colW + 6), top + r * 11, lw, r === 0 ? 6 : 3.5); }
    c.restore();
  }
  SCENES.kitchen_old = (c, lt, b, gt) => {
    const p = b.p || {};
    const o = { stove: p.stove !== false, bread: p.bread !== false, plate: p.plate !== false, candle: p.candle !== false, win: p.window === 'dark' ? 'dark' : 'snow' };
    const dark = clamp(num(p.dark, .6));
    blit(c, layer(`kit|${o.stove}|${o.bread}|${o.plate}|${o.candle}|${o.win}`, g => kitchenStatic(g, o)));
    const [gx, gy, gw, gh] = KI.glass;
    if (o.win === 'snow') { c.save(); c.beginPath(); c.rect(gx, gy, gw, gh); c.clip(); snowfall(c, gt, { n: 70, x0: gx - 30, x1: gx + gw + 30, y0: gy - 20, y1: gy + gh + 10, s0: 1.4, s1: 5.5, v0: 30, v1: 95, alpha: .85, seed: 12 }); c.restore(); }
    // Fensterkreuz + Eisblumen
    c.fillStyle = '#1c150f'; c.fillRect(gx - 6, gy - 6, gw + 12, 10); c.fillRect(gx - 6, gy + gh - 4, gw + 12, 10); c.fillRect(gx - 6, gy, 10, gh); c.fillRect(gx + gw - 4, gy, 10, gh);
    c.fillRect(gx + gw / 2 - 5, gy, 10, gh); c.fillRect(gx, gy + gh * .45 - 5, gw, 10);
    c.save(); c.globalCompositeOperation = 'lighter'; for (const [fx, fy] of [[gx + 6, gy + gh - 6], [gx + gw - 6, gy + gh - 6], [gx + 6, gy + 6]]) spot(c, fx, fy, 60, 'rgba(170,190,225,A)', .2); c.restore();
    // Pendel der Wanduhr
    const pa = Math.sin(gt * Math.PI) * .2, px = 956 + Math.sin(pa) * 140, py = 440 + Math.cos(pa) * 140;
    c.strokeStyle = '#5a4a30'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(956, 440); c.lineTo(px, py); c.stroke(); c.fillStyle = '#7a6538'; c.beginPath(); c.arc(px, py, 13, 0, 7); c.fill();
    // Schlüssel am Brett
    const kh = p.keyHook === false ? null : { keys: 2, ...obj(p.keyHook) }, [kx, ky] = KI.keys;
    if (kh) { const nK = clamp(Math.round(num(kh.keys, 2)), 0, 3), em = typeof kh.empty === 'number' ? kh.empty : (kh.empty === true ? -1 : null);
      const ka = em == null ? 1 : lt < em ? 1 : (1 - clamp(prog(lt, em, em + .22))) * (lt < em + .22 ? flicker(gt, 17, 30) : 1);
      if (ka > 0) for (let i = 0; i < nK; i++) { const ox = [-34, 0, 34][i]; c.save(); c.globalAlpha = ka; c.translate(kx + ox + 6, ky + 20); c.rotate(Math.sin(gt * 1.3 + i * 2) * .035); keyShape(c, 0, 0, .9); c.restore(); }
      if (em != null && lt >= em) { const k = E.back(prog(lt, em + .1, em + .55)), pul = .5 + .5 * Math.sin((lt - em) * 4.5);
        c.save(); c.globalAlpha = .09 * clamp(prog(lt, em, em + .6));
        for (let i = 0; i < nK; i++) { const ox = [-34, 0, 34][i]; c.save(); c.translate(kx + ox + 6, ky + 20); keyGhost(c, .9); c.restore(); } c.restore(); // hellere Wand, wo die Schlüssel hingen
        if (k > 0) { const s = lerp(1.3, 1, clamp(k)); c.save(); c.globalAlpha = clamp(k * 1.5); c.strokeStyle = '#ff3030'; c.lineWidth = 7; glow(c, 'rgba(255,40,40,1)', 22 + 10 * pul);
          c.beginPath(); c.ellipse(kx, ky + 44, 86 * s, 84 * s, 0, 0, 7); c.stroke(); c.lineWidth = 2.5; c.strokeStyle = '#ffb0a8'; c.stroke(); noGlow(c); c.restore(); } } }
    // Zeitung
    const np = p.newspaper;
    if (np) { const q = typeof np === 'string' ? { title: np } : obj(np), at = num(q.at, -1), title = q.title || 'Münchner Neueste Nachrichten';
      if (lt >= at) { const k = E.out(prog(lt, at, at + .55)); newspaper(c, 776, 1272 - (1 - k) * 40, 330, 226, -.05 + (1 - k) * .06, title, q.sub || q.date || '', clamp(k * 1.4)); } }
    // Dunkelheit
    const [cx, cy] = KI.candle, fl = .85 + .15 * noise(gt * 9, 3) + .05 * Math.sin(gt * 23), flx = cx + noise(gt * 4, 8) * 3, fly = cy - 170;
    const [sx, sy, sw, sh] = KI.stove, fdx = sx + 164, fdy = sy + sh - 80, fire = .75 + .25 * noise(gt * 3, 14);
    darkMask(c, dark, [o.candle ? { x: flx, y: fly + 60, r: 820 * (.95 + .05 * fl), a: .96, m: .32 } : null, o.candle ? { x: cx + 120, y: 1260, r: 520, a: .55, sy: .5 } : null,
      { x: gx + gw / 2, y: gy + gh / 2, r: 300, a: o.win === 'dark' ? .2 : .5 }, o.stove ? { x: fdx, y: fdy, r: 260, a: .5 * fire } : null]);
    // Licht: Kerze, Ofenglut, kaltes Fensterlicht
    if (o.candle) { addGlow(c, flx, fly, 460, '255,165,85', .2 * fl); addGlow(c, flx, fly, 70, '255,210,150', .55 * fl);
      c.save(); c.translate(flx, fly + 8); const fh = 30 * (.85 + .2 * fl);
      const fg = c.createRadialGradient(0, -fh * .3, 1, 0, -fh * .3, fh); fg.addColorStop(0, 'rgba(255,252,235,1)'); fg.addColorStop(.5, 'rgba(255,200,110,.95)'); fg.addColorStop(1, 'rgba(255,120,40,0)');
      c.fillStyle = fg; c.beginPath(); c.moveTo(0, -fh * 1.15 + noise(gt * 6, 5) * 3); c.quadraticCurveTo(fh * .36, -fh * .3, 0, fh * .2); c.quadraticCurveTo(-fh * .36, -fh * .3, 0, -fh * 1.15); c.fill();
      c.fillStyle = 'rgba(120,150,255,.55)'; c.beginPath(); c.ellipse(0, 4, 3.2, 5, 0, 0, 7); c.fill(); c.restore(); }
    if (o.stove) { c.save(); c.strokeStyle = `rgba(255,140,50,${.9 * fire})`; glow(c, 'rgba(255,120,40,1)', 18); c.lineWidth = 3; c.strokeRect(sx + 106, sy + sh - 116, 116, 74); noGlow(c); c.restore();
      addGlow(c, fdx, fdy + 40, 190, '255,130,50', .16 * fire, .5); }
    addGlow(c, gx + gw / 2, gy + gh * .7, 220, '120,145,200', o.win === 'dark' ? .04 : .09);
    // Rauch kräuselt aus dem Rohr (nach der Dunkelheit, damit er im Kerzenlicht sichtbar bleibt)
    const smt = tOn(p.smoke);
    if (o.stove && smt != null) { const t0 = p.smoke === true ? -20 : smt, ox = sx + 227, oy = sy - 6; // undichte Stelle am Rohransatz
      smokePlume(c, lt, t0, ox + 8, oy, .8, { alpha: .3, rise: 19, drift: 15, life: 5.5, n: 16, seed: 2 });
      smokePlume(c, lt, t0 + .5, ox - 6, oy + 4, .65, { alpha: .22, rise: 24, drift: -9, life: 4.5, n: 10, seed: 5 });
      c.save(); c.strokeStyle = 'rgba(205,198,186,.22)'; c.lineWidth = 3; c.lineCap = 'round'; const u = lt - t0; // feine Rauchfäden kräuseln sich
      if (u > 0) for (let k = 0; k < 3; k++) { c.beginPath(); for (let i = 0; i <= 22; i++) { const v = i / 22, yy = oy - v * 125 * Math.min(1, u / 1.6), xx = ox + 4 + Math.sin(v * 8 + gt * 1.7 + k * 2.1) * 16 * v + (k - 1) * 8 + v * v * 46;
        i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.globalAlpha = clamp(u) * (.7 + .3 * Math.sin(gt + k)); c.stroke(); } c.restore(); }
  };

  // =====================================================================
  // 6) investigators_old – graue Morgendämmerung, Ermittler, Plattenkamera
  // =====================================================================
  const invG = () => farmGeo(270, 905, 500);
  function invStatic(g, farm) {
    const sk = g.createLinearGradient(0, RY, 0, 915); sk.addColorStop(0, '#272e38'); sk.addColorStop(.45, '#4a525d'); sk.addColorStop(.85, '#848a92'); sk.addColorStop(1, '#a3a6aa');
    g.fillStyle = sk; g.fillRect(RX, RY, RW, 1140);
    g.save(); g.translate(780, 880); g.scale(1, .1); g.globalCompositeOperation = 'lighter'; spot(g, 0, 0, 900, 'rgba(120,95,70,A)', .35); g.restore();
    for (let i = 0; i < 12; i++) { const y = 150 + i * 62 + hash(i) * 40, x = RX + hash(i * 3.3) * RW; g.save(); g.translate(x, y); g.scale(1, .09 + hash(i * 5) * .06);
      spot(g, 0, 0, 450 + hash(i * 7) * 420, hash(i * 2) > .45 ? 'rgba(34,40,48,A)' : 'rgba(165,170,176,A)', .3); g.restore(); }
    forestRow(g, RX, W - RX, x => 902 + Math.sin(x * .006) * 6, 40, 90, '#59606a', 7, 20);
    forestRow(g, RX, W - RX, x => 912 + Math.sin(x * .004 + 2) * 5, 70, 150, '#4b525c', 13, 24, 'rgba(200,205,210,.18)');
    const sn = g.createLinearGradient(0, 905, 0, H - RY); sn.addColorStop(0, '#abafb4'); sn.addColorStop(.22, '#90959b'); sn.addColorStop(.6, '#666c74'); sn.addColorStop(1, '#3b4047');
    g.fillStyle = sn; g.fillRect(RX, 908, RW, H - RY - 908);
    if (farm) { const G = invG(); inFarm(g, G, () => farmDraw(g, G.raw, K_DAWN));
      g.save(); g.globalAlpha = .35; g.fillStyle = '#a6aaaf'; g.fillRect(RX, 880, RW, 60); g.restore(); }
    // zertrampelte Spuren
    for (let i = 0; i < 160; i++) { const k = hash(i * 2.9), x = lerp(120, 980, hash(i * 6.7)) + (k - .5) * 80, y = lerp(930, 1400, Math.pow(k, .8)), s = (y - 880) / 420;
      g.fillStyle = `rgba(55,60,68,${.2 + .15 * hash(i)})`; g.beginPath(); g.ellipse(x, y, 9 * s, 3.5 * s, (hash(i * 4.4) - .5) * .8, 0, 7); g.fill(); }
    g.lineCap = 'round'; for (const [lw, a] of [[60, .06], [34, .08], [16, .08]]) { g.strokeStyle = `rgba(70,76,86,${a})`; g.lineWidth = lw; g.beginPath(); g.moveTo(470, 1520); g.quadraticCurveTo(560, 1110, 612, 912); g.stroke(); }
    for (let i = 0; i < 40; i++) { const k = hash(i * 7.3), y = lerp(925, 1500, k * k), x = lerp(612, 470, k * k) + (hash(i * 3.1) - .5) * 40 * (1 + k), s = (y - 880) / 420;
      g.fillStyle = 'rgba(50,55,63,.3)'; g.beginPath(); g.ellipse(x, y, 8 * s, 3 * s, (hash(i) - .5) * .5, 0, 7); g.fill(); }
    // Zaun
    g.strokeStyle = '#30343a'; const fp = []; for (let i = 0; i < 7; i++) { const k = i / 6, x = lerp(1170, 880, Math.pow(k, .8)), y = lerp(1460, 960, Math.pow(k, .75)), h = lerp(140, 40, k); fp.push([x, y, h]); }
    for (const [x, y, h] of fp) { g.lineWidth = Math.max(3, h * .1); g.beginPath(); g.moveTo(x, y); g.lineTo(x - h * .05, y - h); g.stroke(); }
    for (const fy of [.4, .78]) { g.lineWidth = 3; g.beginPath(); fp.forEach(([x, y, h], i) => { const yy = y - h * fy; i ? g.lineTo(x, yy) : g.moveTo(x, yy); }); g.stroke(); }
    g.fillStyle = '#d3d6d9'; for (const [x, y, h] of fp) { rr(g, x - h * .1, y - h - h * .05, h * .18, h * .07, 3); g.fill(); }
  }
  function coatMan(c, x, y, h, t, o = {}) { // Ermittler um 1922 im Profil: Hut, langer Mantel (Silhouette)
    const d = o.dir || 1, col = o.col || '#16191e', sd = o.seed || 0;
    c.save(); c.translate(x, y); c.scale(d * h, h);
    const sway = noise(t * .5, sd) * .006, br = Math.sin(t * 1.6 + sd) * .003, hem = k => noise(t * 1.4 + k * 3, sd + k) * .012;
    c.fillStyle = col; c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round';
    c.lineWidth = .048; c.beginPath(); c.moveTo(.015, -.3); c.lineTo(.03, -.02); c.moveTo(-.035, -.3); c.lineTo(-.045, -.02); c.stroke();
    c.beginPath(); c.ellipse(.05, -.012, .05, .014, 0, 0, 7); c.ellipse(-.03, -.012, .045, .013, 0, 0, 7); c.fill();
    c.beginPath(); c.moveTo(-.06 + sway, -.79); c.quadraticCurveTo(-.112 + sway, -.765, -.106 + sway * .5, -.62); c.quadraticCurveTo(-.118, -.45, -.132 + hem(1), -.265);
    c.lineTo(.108 + hem(2), -.28); c.quadraticCurveTo(.088, -.45, .082 + sway * .5, -.6); c.quadraticCurveTo(.092 + sway, -.72, .045 + sway, -.8); c.closePath(); c.fill();
    const hx = .006 + sway, hy = -.865 + br;
    c.beginPath(); c.ellipse(hx, hy, .047, .056, 0, 0, 7); c.fill();
    c.beginPath(); c.moveTo(hx + .038, hy - .012); c.lineTo(hx + .058, hy + .014); c.lineTo(hx + .04, hy + .022); c.fill();
    c.beginPath(); c.moveTo(-.062 + sway, -.795); c.lineTo(-.05 + sway, -.855); c.lineTo(.028 + sway, -.82); c.lineTo(.05 + sway, -.78); c.closePath(); c.fill();
    c.beginPath(); c.ellipse(hx - .004, hy - .045, .09, .011, 0, 0, 7); c.fill();
    c.beginPath(); c.moveTo(hx - .048, hy - .045); c.lineTo(hx - .043, hy - .112); c.quadraticCurveTo(hx - .012, hy - .096, hx + .002, hy - .108); c.quadraticCurveTo(hx + .022, hy - .122, hx + .043, hy - .11); c.lineTo(hx + .047, hy - .045); c.closePath(); c.fill();
    c.lineWidth = .048; const arm = (...pts) => { c.beginPath(); pts.forEach((q, i) => i ? c.lineTo(q[0] + sway, q[1]) : c.moveTo(q[0] + sway, q[1])); c.stroke(); };
    const pose = o.pose || 'hands'; let tray = null, note = null;
    if (pose === 'notebook') { arm([-.03, -.74], [-.005, -.6], [.1, -.625]); const wr = o.write ? Math.sin(t * 13) * .007 : 0;
      arm([-.05, -.74], [-.01, -.58], [.112 + wr, -.648 + Math.sin(t * 7) * .003]); note = [.085 + sway, -.672]; }
    else if (pose === 'flash') { arm([-.01, -.75], [.05, -.9], [.08, -1.01]); arm([-.04, -.74], [.02, -.6], [.15, -.6]);
      c.lineWidth = .014; c.beginPath(); c.moveTo(.08 + sway, -1.0); c.lineTo(.08 + sway, -1.1); c.stroke(); c.lineWidth = .016; c.beginPath(); c.moveTo(.02 + sway, -1.105); c.lineTo(.15 + sway, -1.105); c.stroke(); tray = [.085 + sway, -1.12]; }
    else if (pose === 'point') arm([-.02, -.74], [.1, -.77], [.24, -.8]);
    else arm([-.025, -.74], [-.01, -.56], [.02, -.47]);
    c.restore();
    if (note) { c.save(); c.translate(x + d * note[0] * h, y + note[1] * h); c.rotate(d * -.12); c.fillStyle = '#d9d4c6'; c.fillRect(d > 0 ? 0 : -h * .07, -h * .012, h * .07, h * .05);
      c.fillStyle = 'rgba(60,60,60,.5)'; for (let i = 0; i < 3; i++) c.fillRect(d > 0 ? h * .008 : -h * .062, -h * .002 + i * h * .012, h * .05, 1.5); c.restore(); }
    return { face: [x + d * (.06 + sway) * h, y + (-.86) * h], tray: tray ? [x + d * tray[0] * h, y + tray[1] * h] : null };
  }
  function boxCamera(c, x, y, h, d = 1) { // Plattenkamera auf Holzstativ; y = Boden, h = Stativhöhe
    const col = '#16191e', ty = y - h;
    c.save(); c.strokeStyle = col; c.lineWidth = h * .028; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, ty); c.lineTo(x - h * .34, y); c.moveTo(x, ty); c.lineTo(x + h * .3, y + h * .01); c.moveTo(x, ty); c.lineTo(x + h * .06, y + h * .04); c.stroke();
    c.translate(x, ty); c.scale(d, 1); c.fillStyle = col;
    rr(c, -h * .17, -h * .27, h * .25, h * .26, h * .015); c.fill();
    c.beginPath(); c.moveTo(h * .08, -h * .255); c.lineTo(h * .26, -h * .21); c.lineTo(h * .26, -h * .07); c.lineTo(h * .08, -h * .02); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(120,125,132,.45)'; c.lineWidth = 1.5; c.beginPath(); for (let k = 1; k < 5; k++) { const xx = lerp(h * .08, h * .26, k / 5); c.moveTo(xx, lerp(-h * .255, -h * .21, k / 5)); c.lineTo(xx, lerp(-h * .02, -h * .07, k / 5)); } c.stroke();
    c.fillStyle = col; c.fillRect(h * .26, -h * .175, h * .08, h * .07); c.fillStyle = 'rgba(160,140,100,.5)'; c.fillRect(h * .33, -h * .17, h * .012, h * .06);
    c.fillStyle = col; c.beginPath(); c.moveTo(-h * .17, -h * .27); c.quadraticCurveTo(-h * .28, -h * .1, -h * .25, h * .12); c.lineTo(-h * .15, h * .06); c.lineTo(-h * .15, -h * .02); c.closePath(); c.fill();
    c.restore();
  }
  SCENES.investigators_old = (c, lt, b, gt) => {
    const p = b.p || {};
    const farm = p.farm !== false, nF = clamp(Math.round(num(p.figures, 3)), 0, 3);
    blit(c, layer('inv|' + farm, g => invStatic(g, farm)));
    const sp = sprite('soft');
    for (let i = 0; i < 4; i++) { const cx = mod(gt * (6 + i * 2) + i * 470, 1800) - 350; c.globalAlpha = .1; c.drawImage(sp, cx - 420, 260 + i * 90 - 24, 840, 48); }
    if (farm) { const G = invG(); const bdg = clamp(num(p.barnDoor, .2)); if (bdg > 0) inFarm(c, G, () => barnDoorDraw(c, G.raw, bdg, K_DAWN)); }
    for (let i = 0; i < 6; i++) { const mx = mod(gt * (7 + i * 2) + i * 350, 1800) - 350; c.globalAlpha = .12; c.drawImage(sp, mx - 440, 910 + i * 14 - 40, 880, 80); }
    c.globalAlpha = 1;
    // Figuren
    const cam = p.camera === false ? null : { x: 330, flash: [], ...obj(p.camera) };
    const flashes = !cam ? [] : (Array.isArray(cam.flash) ? cam.flash : [cam.flash]).filter(v => typeof v === 'number');
    const faces = []; let tray = null;
    const slots = [];
    if (cam) slots.push({ x: cam.x - 112, y: 1310, h: 520, pose: 'flash', dir: 1, seed: 1 });
    slots.push({ x: 585, y: 1345, h: 545, pose: p.notebook === false ? 'hands' : 'notebook', dir: 1, seed: 2, write: true });
    slots.push({ x: 805, y: 1235, h: 445, pose: 'hands', dir: -1, seed: 3 });
    if (!cam) slots.unshift({ x: 250, y: 1300, h: 505, pose: 'hands', dir: 1, seed: 4 });
    const figs = slots.slice(0, nF).sort((a, bb) => a.y - bb.y);
    for (const f of figs) { c.fillStyle = 'rgba(40,44,50,.28)'; c.beginPath(); c.ellipse(f.x + f.dir * f.h * .02, f.y, f.h * .16, f.h * .022, 0, 0, 7); c.fill();
      const r = coatMan(c, f.x, f.y, f.h, gt, f); faces.push([r.face, f.h, f.seed, f.dir]); if (r.tray) tray = r.tray;
      if (cam && f.pose === 'flash') boxCamera(c, cam.x, 1318, 300, 1); }
    if (cam && !figs.some(f => f.pose === 'flash')) boxCamera(c, cam.x, 1318, 300, 1);
    // Atem in der Kälte
    for (const [[fx, fy], h, sd, d] of faces) for (let j = 0; j < 2; j++) { const per = 3.8, a = mod(gt + sd * 1.3 - j * .15, per); if (a > 2) continue;
      const x = fx + d * a * 22, y = fy - a * 14, r = (6 + a * 18) * h / 500; c.globalAlpha = .28 * (1 - a / 2) * Math.min(1, a * 5); c.drawImage(sp, x - r, y - r, 2 * r, 2 * r); }
    c.globalAlpha = 1;
    // Magnesiumrauch nach dem Blitz
    if (tray) { c.fillStyle = '#c9c4b8'; c.fillRect(tray[0] - 20, tray[1] - 3, 40, 4);
      for (const f of flashes) { const u = lt - f; if (u < 0 || u > 5) continue; smokePlume(c, u, 0, tray[0], tray[1] - 6, 1.1, { n: 12, life: 4, alpha: .45 * (1 - u / 5), rise: 30, drift: 10, seed: f * 3 });
        if (u < .5) addGlow(c, tray[0], tray[1], 300, '255,250,235', .9 * (1 - u / .5)); } }
    if (p.snow !== false) snowfall(c, gt, { n: 110, s0: 1.4, s1: 5, v0: 30, v1: 90, alpha: .7, wind: .4, seed: 21 });
    // Schrift-Label (Schreibmaschine)
    const lb = p.label; if (lb) { const q = typeof lb === 'string' ? { text: lb } : obj(lb), text = String(q.text || 'APRIL 4, 1922'), at = num(q.at, .3);
      if (lt >= at) { const nC = Math.min(text.length, Math.floor((lt - at) / .07) + 1), s = text.slice(0, nC);
        c.save(); c.font = '400 66px Elite'; c.letterSpacing = '4px'; const tw = c.measureText(text).width; c.letterSpacing = '0px';
        const x0 = 540 - tw / 2; glow(c, 'rgba(0,0,0,.75)', 22); txt(c, s, x0, 470, '400 66px Elite', '#efece4', 'left', 'alphabetic', 4); noGlow(c);
        c.font = '400 66px Elite'; c.letterSpacing = '4px'; const sw = c.measureText(s).width; c.letterSpacing = '0px';
        if (nC < text.length || (lt * 2) % 1 < .5) { c.fillStyle = '#efece4'; c.fillRect(x0 + sw + 4, 478, 30, 5); }
        c.restore(); } }
    // Blitz: 0,2 s grelles Weiß, dann Nachglühen
    for (const f of flashes) { const u = lt - f; if (u < 0 || u > .9) continue;
      const a = u < .2 ? 1 - Math.pow(u / .2, 2) * .25 : .75 * Math.exp(-(u - .2) * 7); fillVis(c, `rgba(255,253,248,${clamp(a)})`); }
  };

})();
