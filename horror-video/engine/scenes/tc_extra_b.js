'use strict';
// Zusatzszenen „Hof 1922“ (Hinterkaifeck), Serie B: torch_glare, engine_shed, school_desk, demolition.
// Alle Parameter: SCENE_REF_tc_extra_b.md. Alles in einer IIFE, nach außen wird nur in SCENES geschrieben.
(() => {
  const RX = -200, RY = -200, RW = W + 400, RH = H + 400; // Zeichenfläche inkl. Rand für Zoom/Shake
  const TAU = Math.PI * 2;
  const mod = (a, m) => ((a % m) + m) % m;
  const num = (v, d) => (typeof v === 'number' && isFinite(v)) ? v : d;
  // „true|t“-Parameter: true = von Anfang an (0), Zahl = ab Sekunde t, false = aus, fehlt = d
  const tOn = (v, d = null) => v === true ? 0 : (typeof v === 'number' && isFinite(v)) ? v : v === false ? null : d;
  const obj = v => (v && typeof v === 'object' && !Array.isArray(v)) ? v : {};

  // ---------- Ebenen-Cache (statische Hintergründe) ----------
  const LAYERS = new Map();
  function layer(key, draw) {
    let cv = LAYERS.get(key);
    if (cv) { LAYERS.delete(key); LAYERS.set(key, cv); return cv; }
    cv = document.createElement('canvas'); cv.width = RW; cv.height = RH;
    const g = cv.getContext('2d'); g.translate(-RX, -RY); draw(g);
    LAYERS.set(key, cv); if (LAYERS.size > 6) LAYERS.delete(LAYERS.keys().next().value);
    return cv;
  }
  // sichtbarer Ausschnitt in Szenen-Koordinaten (aktuelle Kamera-Transformation), auf die Zeichenfläche begrenzt
  function visRect(c, pad = 8) {
    const m = c.getTransform().inverse(); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [x, y] of [[0, 0], [W, 0], [0, H], [W, H]]) { const u = m.a * x + m.c * y + m.e, v = m.b * x + m.d * y + m.f; x0 = Math.min(x0, u); x1 = Math.max(x1, u); y0 = Math.min(y0, v); y1 = Math.max(y1, v); }
    return [Math.max(RX, Math.floor(x0 - pad)), Math.max(RY, Math.floor(y0 - pad)), Math.min(W - RX, Math.ceil(x1 + pad)), Math.min(H - RY, Math.ceil(y1 + pad))];
  }
  function blit(c, cv) { const [x0, y0, x1, y1] = visRect(c); c.drawImage(cv, x0 - RX, y0 - RY, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0); }
  function fillVis(c, style) { const [x0, y0, x1, y1] = visRect(c); c.fillStyle = style; c.fillRect(x0, y0, x1 - x0, y1 - y0); }
  const SMALL = new Map(); // kleine Ebenen (Karten, Sprites mit Inhalt)
  function smallLayer(key, w, h, draw) {
    let cv = SMALL.get(key); if (cv) return cv;
    cv = document.createElement('canvas'); cv.width = Math.ceil(w); cv.height = Math.ceil(h); draw(cv.getContext('2d'), cv.width, cv.height);
    SMALL.set(key, cv); if (SMALL.size > 24) SMALL.delete(SMALL.keys().next().value);
    return cv;
  }

  // ---------- Sprites ----------
  const SPR = {};
  function sprite(name) {
    if (SPR[name]) return SPR[name];
    const s = document.createElement('canvas'), g = s.getContext('2d');
    if (name === 'smoke' || name === 'dust') {
      s.width = s.height = 128; const col = name === 'dust' ? '168,162,154' : '255,255,255';
      for (let i = 0; i < 11; i++) { const x = 64 + (hash(i * 3.1) - .5) * 46, y = 64 + (hash(i * 5.7) - .5) * 46, r = 20 + hash(i * 1.3) * 22;
        const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},.32)`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }
    } else {
      s.width = s.height = 64; const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      if (name === 'flake') { gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.28, 'rgba(255,255,255,.85)'); gr.addColorStop(.55, 'rgba(255,255,255,.16)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); }
      else { const col = name === 'warm' ? '255,200,140' : name === 'red' ? '255,46,36' : name === 'black' ? '0,0,0' : '255,255,255';
        gr.addColorStop(0, `rgba(${col},1)`); gr.addColorStop(.4, `rgba(${col},.42)`); gr.addColorStop(1, `rgba(${col},0)`); }
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    }
    return SPR[name] = s;
  }

  // ---------- Atmosphäre ----------
  function snowfall(c, t, o = {}) { // deterministischer Schneefall; o.boost(x, y) → Zusatzhelligkeit (Licht)
    const n = o.n || 180, x0 = o.x0 != null ? o.x0 : RX, x1 = o.x1 != null ? o.x1 : W - RX, y0 = o.y0 != null ? o.y0 : RY, y1 = o.y1 != null ? o.y1 : H - RY;
    const s0 = o.s0 || 2, s1 = o.s1 || 9, v0 = o.v0 || 45, v1 = o.v1 || 170, wind = o.wind != null ? o.wind : .3, A = o.alpha != null ? o.alpha : .8, sd = o.seed || 0;
    const spr = sprite('flake'), wx = x1 - x0, hy = y1 - y0, bf = o.boost;
    for (let i = 0; i < n; i++) {
      const d = hash(i * 3.17 + sd * 11.3), e = d * d, r = lerp(s0, s1, e), v = lerp(v0, v1, d);
      const y = y0 + mod(hash(i * 7.31 + sd) * hy + t * v, hy);
      const x = x0 + mod(hash(i * 1.93 + sd * 5) * wx + t * v * wind + Math.sin(t * (.5 + d * .9) + i * 1.7) * (8 + 22 * d), wx);
      let a = A * (.3 + .7 * d);
      if (bf) { const k = bf(x, y); if (k > 0) a = Math.min(1, a * (1 + k * 3)); }
      c.globalAlpha = a; c.drawImage(spr, x - r, y - r, r * 2, r * 2);
    }
    c.globalAlpha = 1;
  }
  // radialer Lichtfleck, Füllfläche auf den sichtbaren Bereich beschnitten (spart Füllrate bei großen Radien)
  function spotClip(c, x, y, r, col, a, sy = 1) {
    if (!(a > 0) || !(r > 0)) return;
    const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0));
    const x0 = Math.max(x - r, -80), x1 = Math.min(x + r, W + 80), y0 = Math.max(y - r, y - (y + 80) / sy), y1 = Math.min(y + r, y + (H + 80 - y) / sy);
    if (x1 <= x0 || y1 <= y0) return;
    c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  }
  function addGlow(c, x, y, r, rgb, a, sy = 1) { // additives Licht
    if (!(a > 0) || !(r > 0)) return;
    c.save(); c.globalCompositeOperation = 'lighter'; c.translate(x, y); c.scale(1, sy); c.translate(-x, -y); spotClip(c, x, y, r, `rgba(${rgb},A)`, clamp(a), sy); c.restore();
  }
  function groundGlow(c, sx, sy, rx, ry, rgb, a) { addGlow(c, sx, sy, rx, rgb, a, ry / rx); }
  let MK = null; const MS = .25;
  function darkMask(c, d, lights, col = '0,0,0') { // Dunkelheit (Viertelauflösung) mit weichen Lichtlöchern
    if (!MK) { MK = document.createElement('canvas'); MK.width = Math.ceil(RW * MS); MK.height = Math.ceil(RH * MS); }
    const g = MK.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, MK.width, MK.height);
    g.fillStyle = `rgba(${col},${clamp(d)})`; g.fillRect(0, 0, MK.width, MK.height);
    g.setTransform(MS, 0, 0, MS, -RX * MS, -RY * MS); g.globalCompositeOperation = 'destination-out';
    for (const L of lights) {
      if (!L || !(L.a > 0) || !(L.r > 1)) continue;
      const gr = g.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.r);
      gr.addColorStop(0, `rgba(0,0,0,${clamp(L.a)})`); gr.addColorStop(L.m || .4, `rgba(0,0,0,${clamp(L.a) * .62})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.save(); g.translate(L.x, L.y); g.scale(L.sx || 1, L.sy || 1); g.translate(-L.x, -L.y); g.fillRect(L.x - L.r, L.y - L.r, 2 * L.r, 2 * L.r); g.restore();
    }
    g.globalCompositeOperation = 'source-over'; g.setTransform(1, 0, 0, 1, 0, 0);
    const [x0, y0, x1, y1] = visRect(c, 16);
    c.drawImage(MK, (x0 - RX) * MS, (y0 - RY) * MS, (x1 - x0) * MS, (y1 - y0) * MS, x0, y0, x1 - x0, y1 - y0);
  }
  function smokePlume(c, lt, ts, x, y, s = 1, o = {}) { // aufsteigender Rauch / Staub aus weichen Wolken
    const N = o.n || 16, L = o.life || 7, spr = sprite(o.spr || 'smoke'), rise = o.rise || 30, drift = o.drift != null ? o.drift : 12, A = o.alpha || .3, sd = o.seed || 0;
    for (let j = 0; j < N; j++) {
      let a = lt - (ts + j * L / N); if (a < 0) continue; a = mod(a, L);
      const k = a / L, wob = noise(a * .45 + j * 1.7, j + sd) * 16 * Math.min(1, a * .6);
      const px = x + (a * drift + a * a * .8 + wob) * s, py = y - (a * rise + a * a * 1.1) * s;
      const r = (9 + a * 12) * s, al = A * Math.min(1, a * 2.2) * (1 - k) * (1 - k * .3);
      c.globalAlpha = al; c.drawImage(spr, px - r, py - r, r * 2, r * 2);
    }
    c.globalAlpha = 1;
  }
  function motes(c, gt, cx, cy, R, n, sd, a0 = .55, spr = 'warm', sy = 1) { // Staub im Licht, nur nahe der Lichtquelle sichtbar
    const sp = sprite(spr);
    for (let i = 0; i < n; i++) {
      const ox = (hash(i * 2.7 + sd) - .5) * 2 * R, oy = (hash(i * 4.1 + sd) - .5) * 2 * R;
      const x = cx + ox + noise(gt * .15 + i, i + sd) * 60, y = cy + (mod(oy + gt * (6 + 10 * hash(i * 1.1)) + R, 2 * R) - R) * sy + Math.sin(gt * .4 + i) * 10;
      const dd = Math.hypot((x - cx) / R, (y - cy) / (R * sy)); if (dd >= 1) continue;
      const tw = .6 + .4 * Math.sin(gt * (1 + hash(i)) * 2 + i), r = 1.6 + 3.2 * hash(i * 9.1);
      c.globalAlpha = a0 * Math.pow(1 - dd, 1.6) * tw; c.drawImage(sp, x - r * 2, y - r * 2, r * 4, r * 4);
    }
    c.globalAlpha = 1;
  }
  function poly(c, pts) { c.beginPath(); pts.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.closePath(); }
  function lanternBody(c, x, y, s, fl, ang = 0) { // Sturmlaterne; (x,y) = Mitte des Glases, s = Maßstab (1 ≈ 90 px hoch)
    c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s);
    c.strokeStyle = '#211b17'; c.lineWidth = 3.5; c.beginPath(); c.arc(0, -44, 15, Math.PI, 0); c.stroke();
    c.fillStyle = '#29221d'; c.beginPath(); c.moveTo(-21, -27); c.lineTo(21, -27); c.lineTo(11, -42); c.lineTo(-11, -42); c.closePath(); c.fill();
    const g = c.createRadialGradient(0, 3, 2, 0, 3, 30); g.addColorStop(0, `rgba(255,240,195,${.95 * fl})`); g.addColorStop(.5, `rgba(255,172,82,${.8 * fl})`); g.addColorStop(1, `rgba(120,60,25,${.55 * fl + .15})`);
    c.fillStyle = g; c.beginPath(); c.ellipse(0, 1, 17, 27, 0, 0, TAU); c.fill();
    c.fillStyle = `rgba(255,252,230,${fl})`; c.beginPath(); c.ellipse(0, 5, 3.6, 9 * (.8 + .2 * fl), 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(36,29,24,.95)'; c.lineWidth = 2.6; c.beginPath(); for (const xx of [-16, 0, 16]) { c.moveTo(xx, -26); c.lineTo(xx * .92, 28); } c.stroke();
    c.fillStyle = '#29221d'; c.fillRect(-21, 26, 42, 7); c.beginPath(); c.ellipse(0, 33, 21, 5, 0, 0, TAU); c.fill();
    c.restore();
  }
  // Fichten / kahle Bäume (wie in tc_farm)
  const tiers = h => Math.max(4, Math.round(h < 200 ? h / 16 : 12 + (h - 200) / 40));
  function spruce(g, x, y, h, w, sd) {
    const T = tiers(h), th = h * .88 / T;
    g.moveTo(x, y - h);
    for (let i = 1; i <= T; i++) { const k = i / T, ww = w * .5 * (.1 + .9 * k) * (.8 + .4 * hash(sd + i)), yy = y - h + h * .1 + th * i;
      g.lineTo(x + ww * .38, yy - th * .62); g.lineTo(x + ww, yy + th * .12 * hash(sd + i * 2.3)); }
    g.lineTo(x + w * .04, y + 2); g.lineTo(x - w * .04, y + 2);
    for (let i = T; i >= 1; i--) { const k = i / T, ww = w * .5 * (.1 + .9 * k) * (.8 + .4 * hash(sd + i + 50)), yy = y - h + h * .1 + th * i;
      g.lineTo(x - ww, yy + th * .12 * hash(sd + i * 3.1)); g.lineTo(x - ww * .38, yy - th * .62); }
    g.closePath();
  }
  const fnc = v => typeof v === 'function' ? v : () => v;
  function forestRow(g, x0, x1, base, h0, h1, col, sd, step, wk = .38) {
    const B = fnc(base), H0 = fnc(h0), H1 = fnc(h1), S = fnc(step);
    g.fillStyle = col; g.beginPath();
    for (let x = x0, i = 0; x < x1 && i < 400; i++) {
      const h = lerp(H0(x), H1(x), hash(sd + i * 1.37)), w = h * (wk + .1 * hash(sd + i * 2.1));
      spruce(g, x, B(x) + hash(sd + i * 4.4) * 6, h, w, sd + i * 9.1); x += S(x) * (.45 + .7 * hash(sd + i * 3.3));
    }
    g.fill();
  }
  function bareTree(g, x, y, len, ang, wd, dep, sd) {
    const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len, bend = (hash(sd) - .5) * len * .25;
    g.lineWidth = wd; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo((x + x2) / 2 + bend, (y + y2) / 2 - bend * .3, x2, y2); g.stroke();
    if (dep <= 0) return;
    const n = hash(sd * 1.3) > .55 ? 3 : 2;
    for (let i = 0; i < n; i++) { const a = ang + (i - (n - 1) / 2) * (.48 + hash(sd + i) * .3) + (hash(sd + i * 7) - .5) * .4 - .05;
      bareTree(g, x2, y2, len * (.6 + hash(sd + i * 3) * .2), a, wd * .64, dep - 1, sd * 1.7 + i * 13.3 + 1); }
  }

  // ---------- Text ----------
  function fitFont(c, s, fam, size, maxW, ls, min = 22, wt = 400) {
    let fs = size;
    for (let i = 0; i < 30; i++) { c.font = `${wt} ${fs}px ${fam}`; c.letterSpacing = ls + 'px'; const w = c.measureText(s).width; c.letterSpacing = '0px'; if (w <= maxW || fs <= min) return [fs, w]; fs -= 2; }
    return [fs, maxW];
  }
  // getippte Zeile (Schreibmaschine) mit Cursor; gibt zurück, ob fertig getippt
  function typeLine(c, s, x, y, lt, at, o = {}) {
    if (!s || lt < at) return false;
    const fam = o.fam || 'Elite', ls = o.ls != null ? o.ls : 4, cps = o.cps || 18, col = o.col || '#eeeae0';
    const [fs, tw] = fitFont(c, s, fam, o.size || 60, o.maxW || 800, ls, 22, o.wt || 400), font = `${o.wt || 400} ${fs}px ${fam}`;
    const n = Math.min(s.length, Math.floor((lt - at) * cps) + 1), part = s.slice(0, n), x0 = o.align === 'left' ? x : x - tw / 2;
    c.save(); if (o.alpha != null) c.globalAlpha = o.alpha;
    glow(c, 'rgba(0,0,0,.92)', 22); txt(c, part, x0, y, font, col, 'left', 'alphabetic', ls); noGlow(c);
    if (o.glowCol) { glow(c, o.glowCol, 18); txt(c, part, x0, y, font, col, 'left', 'alphabetic', ls); noGlow(c); }
    const done = n >= s.length, last = o.cursor !== false && (!done || (o.cursorHold != null && lt < at + s.length / cps + o.cursorHold));
    if (last && ((lt * 2.2) % 1 < .6 || !done)) { c.font = font; c.letterSpacing = ls + 'px'; const pw = c.measureText(part).width; c.letterSpacing = '0px';
      c.fillStyle = o.cursorCol || col; c.fillRect(x0 + pw + 4, y + fs * .1, fs * .48, Math.max(3, fs * .07)); }
    c.restore();
    return done ? at + s.length / cps : false;
  }
  // roter Ring mit Glühen (Einblenden mit Überschwingen, pulsiert)
  function redRing(c, x, y, rx, ry, lt, t0, rot = 0) {
    if (lt < t0) return;
    const k = E.back(prog(lt, t0, t0 + .45)), pul = .5 + .5 * Math.sin((lt - t0) * 4.5), s = lerp(1.35, 1, clamp(k));
    c.save(); c.globalAlpha = clamp(prog(lt, t0, t0 + .22));
    c.save(); c.globalCompositeOperation = 'lighter'; c.translate(x, y); c.rotate(rot); c.scale(1, ry / rx); spot(c, 0, 0, rx * 1.25 * s, RED, .1 + .06 * pul); c.restore();
    c.strokeStyle = '#ff3030'; c.lineWidth = 7; glow(c, 'rgba(255,40,40,1)', 22 + 12 * pul);
    c.beginPath(); c.ellipse(x, y, rx * s, ry * s, rot, 0, TAU); c.stroke(); c.lineWidth = 2.5; c.strokeStyle = '#ffb0a8'; c.stroke(); noGlow(c);
    c.restore();
  }

  // =====================================================================
  // 1) torch_glare – Nacht, schmale verschneite Straße am Hof; Taschenlampe blendet direkt in die Kamera
  // =====================================================================
  const TG = { f: 1050, hz: 868, h: 1.9 };
  const tgP = (x, y, z) => [540 + TG.f * x / z, TG.hz + TG.f * (TG.h - y) / z];
  const tgRoad = z => -.25 - .0021 * Math.max(0, z - 7) ** 2; // Straßenmitte (biegt hinten nach links ab)
  const TF = { x0: 1.4, x1: 25, z0: 42, d: 11, wh: 6.2, rh: 10.6, res: 12.6 }; // Hof: Traufseite x0..x1 bei z0, Wohnteil ab x = res
  const TG_MAN = [1.3, 7.6], TG_GOAL = [15.9, 41.3]; // Gestalt am Gatter, Ziel: Haustür
  function tgGround(x, z, R) { const [sx, sy] = tgP(x, 0, z), ry = (tgP(x, 0, Math.max(.6, z - R))[1] - tgP(x, 0, z + R)[1]) / 2; return [sx, sy, TG.f * R / z, Math.max(2, ry)]; }
  function tgFarm(g) {
    const P = tgP, { x0, x1, z0, d, wh, rh, res } = TF, zr = z0 + d / 2, ov = .7;
    // linker Giebel (sehr schräg, schmal)
    poly(g, [P(x0, 0, z0), P(x0, wh, z0), P(x0, rh, zr), P(x0, wh, z0 + d), P(x0, 0, z0 + d)]); g.fillStyle = '#0b101b'; g.fill();
    // Traufseite: Stadel (Bretter) links, Wohnteil (verputzt) rechts
    poly(g, [P(x0, 0, z0), P(res, 0, z0), P(res, wh, z0), P(x0, wh, z0)]); g.fillStyle = '#0f1420'; g.fill();
    poly(g, [P(res, 0, z0), P(x1, 0, z0), P(x1, wh, z0), P(res, wh, z0)]); g.fillStyle = '#151c2b'; g.fill();
    g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 1; g.beginPath();
    for (let x = x0 + .4; x < res; x += .4) { const a = P(x, 0, z0), b = P(x, wh, z0); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); } g.stroke();
    // Stadeltor + Fenster
    poly(g, [P(4.4, 0, z0), P(8.9, 0, z0), P(8.9, 4.4, z0), P(4.4, 4.4, z0)]); g.fillStyle = '#0b0f19'; g.fill();
    g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 1.2; g.beginPath(); { const a = P(6.65, 0, z0), b = P(6.65, 4.4, z0), c1 = P(4.4, .3, z0), c2 = P(6.65, 4.1, z0), c3 = P(8.9, .3, z0), c4 = P(6.65, 4.1, z0); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.moveTo(c1[0], c1[1]); g.lineTo(c2[0], c2[1]); g.moveTo(c3[0], c3[1]); g.lineTo(c4[0], c4[1]); } g.stroke();
    const win = (x, y, w, h, col, shut) => { if (shut) { g.fillStyle = '#111827'; poly(g, [P(x - .55, y - .05, z0), P(x - .1, y - .05, z0), P(x - .1, y + h + .05, z0), P(x - .55, y + h + .05, z0)]); g.fill(); poly(g, [P(x + w + .1, y - .05, z0), P(x + w + .55, y - .05, z0), P(x + w + .55, y + h + .05, z0), P(x + w + .1, y + h + .05, z0)]); g.fill(); }
      poly(g, [P(x - .12, y - .12, z0), P(x + w + .12, y - .12, z0), P(x + w + .12, y + h + .12, z0), P(x - .12, y + h + .12, z0)]); g.fillStyle = '#1c2334'; g.fill();
      poly(g, [P(x, y, z0), P(x + w, y, z0), P(x + w, y + h, z0), P(x, y + h, z0)]); g.fillStyle = col; g.fill(); };
    for (const x of [2.3, 10.4]) win(x, 3.6, .8, .6, '#06080d');
    for (const y of [1.2, 3.9]) for (const x of [14, 17.6, 20.6, 23.4]) win(x, y, .95, 1.2, '#05070c', true);
    poly(g, [P(15.4, 0, z0), P(16.5, 0, z0), P(16.5, 2.2, z0), P(15.4, 2.2, z0)]); g.fillStyle = '#080b12'; g.fill(); // Haustür
    // Schatten unter der Traufe
    const ea = P(x0, wh, z0), eb = P(x0, wh - 1, z0), sh = g.createLinearGradient(0, ea[1], 0, eb[1]); sh.addColorStop(0, 'rgba(0,0,0,.6)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = sh; poly(g, [P(x0, wh, z0), P(x1, wh, z0), P(x1, wh - 1, z0), P(x0, wh - 1, z0)]); g.fill();
    // Dachfläche vorn (verschneit)
    const r0 = P(x0 - ov, wh - .15, z0 - ov), r1 = P(x1 + ov, wh - .15, z0 - ov), r2 = P(x1 + ov, rh, zr), r3 = P(x0 - ov, rh, zr);
    const rf = g.createLinearGradient(0, r3[1], 0, r0[1]); rf.addColorStop(0, '#7486a6'); rf.addColorStop(1, '#4c5b78');
    poly(g, [r0, r1, r2, r3]); g.fillStyle = rf; g.fill();
    g.strokeStyle = 'rgba(40,52,76,.3)'; g.lineWidth = 1; g.beginPath(); for (let k = .25; k < .95; k += .22) { const a = [lerp(r0[0], r3[0], k), lerp(r0[1], r3[1], k)], b = [lerp(r1[0], r2[0], k), lerp(r1[1], r2[1], k)]; g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); } g.stroke();
    // Ortgang + Traufkante mit Schnee
    g.strokeStyle = '#a3b2cd'; g.lineWidth = 3; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(...P(x0 - ov, wh - .15, z0 + d + ov)); g.lineTo(...r3); g.lineTo(...r0); g.lineTo(...r1); g.stroke();
    g.fillStyle = 'rgba(160,180,210,.6)'; for (let i = 0; i < 60; i++) { if (hash(i * 7.7) < .4) continue; const u = i / 60, x = lerp(r0[0], r1[0], u), L = 2 + hash(i * 3.3) * 6;
      g.fillRect(x, lerp(r0[1], r1[1], u) + 1, 1.3, L); }
    // Kamin
    const cx = 18.6, c0 = P(cx - .35, rh - .6, zr - .6), c1 = P(cx + .35, rh + 1.1, zr - .6);
    g.fillStyle = '#121826'; g.fillRect(c0[0], c1[1], c1[0] - c0[0], c0[1] - c1[1]); g.fillStyle = '#a3b2cd'; g.fillRect(c0[0] - 1.5, c1[1] - 2, c1[0] - c0[0] + 3, 3);
    // Schneewehe an der Wand
    g.fillStyle = '#3d4b68'; g.beginPath(); g.moveTo(...P(x0 - 1, 0, z0 - .3));
    for (let i = 0; i <= 24; i++) { const x = lerp(x0 - 1, x1 + 1, i / 24); g.lineTo(...P(x, .25 + .25 * hash(i * 2.7), z0 - .2)); }
    g.lineTo(...P(x1 + 1, 0, z0 - .6)); g.closePath(); g.fill();
  }
  function tgStatic(g, farm) {
    const hz = TG.hz;
    const sk = g.createLinearGradient(0, RY, 0, hz); sk.addColorStop(0, '#02040a'); sk.addColorStop(.55, '#08101f'); sk.addColorStop(.9, '#142038'); sk.addColorStop(1, '#1d2a44');
    g.fillStyle = sk; g.fillRect(RX, RY, RW, hz - RY + 4);
    for (let i = 0; i < 110; i++) { const x = RX + hash(i * 2.13) * RW, y = RY + hash(i * 5.71) * (hz - RY - 100), a = (.08 + .4 * hash(i * 9.1)) * clamp(1 - (y - 200) / 700, .1, 1);
      g.fillStyle = `rgba(215,225,250,${a})`; g.fillRect(x, y, 1.5, 1.5); }
    for (let i = 0; i < 9; i++) { g.save(); g.translate(RX + hash(i * 3.1) * RW, 260 + i * 62 + hash(i) * 40); g.scale(1, .1); spot(g, 0, 0, 500 + hash(i * 7) * 420, 'rgba(3,6,13,A)', .55); g.restore(); }
    g.save(); g.globalCompositeOperation = 'lighter'; g.translate(620, hz); g.scale(1, .18); spot(g, 0, 0, 900, 'rgba(70,90,135,A)', .22); g.restore();
    // Waldsaum am Horizont
    g.fillStyle = '#0c1424'; g.beginPath(); g.moveTo(RX, hz + 6); for (let x = RX; x <= W - RX; x += 30) g.lineTo(x, hz - 16 + Math.sin(x * .008) * 8); g.lineTo(W - RX, hz + 6); g.fill();
    forestRow(g, RX, W - RX, x => hz + 2 + Math.sin(x * .01) * 3, x => x < 420 ? 50 : 26, x => x < 420 ? 120 : 64, '#070c17', 31, 11);
    forestRow(g, RX, 360, x => hz + 14, x => 110 + (360 - x) * .25, x => 190 + (360 - x) * .35, '#04080f', 77, 26);
    // Schneefeld
    const sn = g.createLinearGradient(0, hz, 0, H - RY);
    sn.addColorStop(0, '#4a5a7c'); sn.addColorStop(.06, '#3b4a6a'); sn.addColorStop(.28, '#28344e'); sn.addColorStop(.62, '#161e2e'); sn.addColorStop(1, '#090d16');
    g.fillStyle = sn; g.fillRect(RX, hz + 3, RW, H - RY - hz);
    for (const [x, y, rx, a, col] of [[760, 930, 520, .1, '150,172,215'], [240, 1100, 700, .05, '150,172,215'], [520, 1000, 900, .16, '0,0,0'], [820, 1300, 700, .12, '0,0,0']]) {
      g.save(); g.translate(x, y); g.scale(1, .1); if (col !== '0,0,0') g.globalCompositeOperation = 'lighter'; spot(g, 0, 0, rx, `rgba(${col},A)`, a); g.restore(); }
    if (farm) tgFarm(g);
    // Straße: festgefahrener Schnee mit Wagenspuren, Schneewälle
    const zs = []; for (let z = 1.6; z < 150; z *= 1.06) zs.push(z);
    const edge = (z, s, w) => tgP(tgRoad(z) + s * w, 0, z);
    const band = (s, w0, w1, col, Z = zs) => { g.fillStyle = col; g.beginPath(); Z.forEach((z, i) => { const q = edge(z, s, w0); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); for (let i = Z.length - 1; i >= 0; i--) g.lineTo(...edge(Z[i], s, w1)); g.closePath(); g.fill(); };
    band(1, -1.38, 1.38, '#232d44');
    const fadeIn = (rgb, a) => { const gr = g.createLinearGradient(0, tgP(0, 0, 2.2)[1], 0, tgP(0, 0, 6)[1]); gr.addColorStop(0, `rgba(${rgb},0)`); gr.addColorStop(1, `rgba(${rgb},${a})`); return gr; };
    for (const s of [-1, 1]) { band(s, .52, .68, fadeIn('8,12,22', .24)); band(s, .68, .75, fadeIn('120,138,175', .07)); } // Fahrspuren, nahe der Kamera ausgeblendet
    for (const s of [-1, 1]) { // Schneewall: Schatten zur Fahrbahn, helle Krone
      band(s, 1.22, 1.4, 'rgba(5,8,15,.42)'); band(s, 1.4, 1.75, 'rgba(70,86,120,.16)');
      g.strokeStyle = 'rgba(125,145,185,.42)'; g.lineWidth = 2; g.beginPath(); zs.forEach((z, i) => { const q = tgP(tgRoad(z) + s * 1.62, .24 + .05 * Math.sin(z * 1.7), z); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.stroke(); }
    for (let i = 0; i < 40; i++) { const z = 3 + Math.pow(hash(i * 3.7), 1.3) * 36, x = tgRoad(z) + (i % 2 ? .11 : -.11) + (hash(i * 5.1) - .5) * .2, [sx, sy] = tgP(x, 0, z), s = 1 / z;
      g.fillStyle = 'rgba(8,12,22,.32)'; g.beginPath(); g.ellipse(sx, sy, 95 * s, 26 * s, 0, 0, TAU); g.fill(); }
    // Zaun rechts der Straße mit Gatterlücke
    const posts = [3.4, 5.2, 9.6, 12, 14.8, 18, 21.6, 25.6, 30, 34.5, 39.5].map(z => { const [x, y] = tgP(tgRoad(z) + 2.1, 0, z); return [x, y, TG.f * 1.25 / z, z]; });
    g.strokeStyle = '#060a12'; g.lineCap = 'round';
    for (const [x, y, h, z] of posts) { g.lineWidth = Math.max(2, 140 / z * .1 * 10 / 10); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2 / z, y - h); g.stroke(); }
    for (const fy of [.42, .82]) { g.lineWidth = 3; for (let i = 0; i < posts.length - 1; i++) { if (i === 1) continue; const a = posts[i], b = posts[i + 1]; g.lineWidth = Math.max(1.5, 30 / a[3]); g.beginPath(); g.moveTo(a[0], a[1] - a[2] * fy); g.lineTo(b[0], b[1] - b[2] * fy); g.stroke(); } }
    g.fillStyle = '#8796b4'; for (const [x, y, h, z] of posts) { rr(g, x - 26 / z, y - h - 9 / z, 60 / z, Math.max(2, 16 / z), 6 / z); g.fill(); }
    // Wegkreuz links (Silhouette mit Wetterdach)
    { const z = 15.5, [x, y] = tgP(tgRoad(z) - 2.7, 0, z), s = TG.f / z;
      g.fillStyle = '#04070d'; g.fillRect(x - .1 * s, y - 2.75 * s, .2 * s, 2.75 * s); g.fillRect(x - .62 * s, y - 2.08 * s, 1.24 * s, .17 * s);
      g.beginPath(); g.moveTo(x - .5 * s, y - 2.48 * s); g.lineTo(x, y - 3.0 * s); g.lineTo(x + .5 * s, y - 2.48 * s); g.lineTo(x + .42 * s, y - 2.4 * s); g.lineTo(x, y - 2.82 * s); g.lineTo(x - .42 * s, y - 2.4 * s); g.closePath(); g.fill();
      g.fillRect(x - .32 * s, y - 2.62 * s, .64 * s, .22 * s); // Brettchen unter dem Dach
      g.strokeStyle = '#8796b4'; g.lineWidth = 2.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - .5 * s, y - 2.5 * s); g.lineTo(x, y - 3.02 * s); g.lineTo(x + .5 * s, y - 2.5 * s); g.moveTo(x - .62 * s, y - 2.09 * s); g.lineTo(x + .62 * s, y - 2.09 * s); g.stroke();
      g.fillStyle = 'rgba(70,85,115,.5)'; g.beginPath(); g.ellipse(x, y + 2, .7 * s, .12 * s, 0, 0, TAU); g.fill(); }
    // kahler Baum links vorn
    g.strokeStyle = '#03050a'; g.lineCap = 'round'; { const [x, y] = tgP(-4.6, 0, 11.5); bareTree(g, x, y, 260, -Math.PI / 2 + .06, 24, 6, 5.3); }
    { const [x, y] = tgP(30, 0, 47); bareTree(g, x, y, 95, -Math.PI / 2 - .05, 7, 5, 8.1); }
    // trockene Halme vorn
    g.strokeStyle = '#04070c';
    for (let i = 0; i < 40; i++) { const side = i % 2, x = side ? lerp(860, 1200, hash(i * 3.1)) : lerp(-140, 160, hash(i * 3.1)), y = 1560 + hash(i * 5.3) * 360, L = 50 + hash(i * 7.7) * 120, a = -Math.PI / 2 + (hash(i * 2.2) - .5) * .6;
      g.lineWidth = 1.5 + hash(i) * 2.5; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * L * .5, y + Math.sin(a) * L * .5, x + Math.cos(a) * L + (hash(i * 9) - .5) * 30, y + Math.sin(a) * L); g.stroke(); }
  }
  // Gestalt (Hut, Mantel) in Einheitskoordinaten: Füße bei (0,0), Höhe 1, y nach oben negativ. Von vorn und hinten gleich.
  function coatPath(c, o, t) {
    const ph = o.phase || 0, wk = o.walk || 0, sw = Math.sin(ph) * .008 * wk + noise(t * .6, o.seed || 4) * .004, B = -Math.abs(Math.sin(ph)) * .012 * wk;
    c.beginPath();
    for (const s of [-1, 1]) { const lift = wk * Math.max(0, Math.sin(ph + (s > 0 ? 0 : Math.PI))) * .035, fx = s * .046;
      c.moveTo(s * .02 - .032 + sw * .5, -.33); c.lineTo(s * .02 + .032 + sw * .5, -.33); c.lineTo(fx + .027, -lift); c.lineTo(fx - .027, -lift); c.closePath();
      c.moveTo(fx + .04, -lift - .012); c.ellipse(fx, -lift - .012, .04, .017, 0, 0, TAU); }
    // Mantel: abfallende Schultern, leicht tailliert, ausgestellter Saum, der im Wind schwingt
    const hm = k => noise(t * 1.3 + k * 2.1, (o.seed || 4) + k) * .01 + Math.sin(ph + k) * .008 * wk;
    c.moveTo(-.162 + sw * .6 + hm(1), -.292 + B * .3);
    c.bezierCurveTo(-.15 + sw, -.42 + B, -.118 + sw, -.52 + B, -.122 + sw, -.6 + B);
    c.bezierCurveTo(-.128 + sw, -.69 + B, -.142 + sw, -.745 + B, -.118 + sw, -.776 + B);
    c.quadraticCurveTo(-.09 + sw, -.806 + B, -.048 + sw, -.818 + B);
    c.lineTo(.048 + sw, -.818 + B); c.quadraticCurveTo(.09 + sw, -.806 + B, .118 + sw, -.776 + B);
    c.bezierCurveTo(.142 + sw, -.745 + B, .128 + sw, -.69 + B, .122 + sw, -.6 + B);
    c.bezierCurveTo(.118 + sw, -.52 + B, .15 + sw, -.42 + B, .162 + sw * .6 + hm(2), -.292 + B * .3);
    c.lineTo(.09 + sw * .5 + hm(3), -.276 + B * .3); c.lineTo(.02 + sw * .5, -.286 + B * .3); c.lineTo(-.06 + sw * .5 + hm(4), -.274 + B * .3); c.closePath();
    // hochgeschlagener Kragen
    c.moveTo(-.068 + sw, -.805 + B); c.lineTo(-.058 + sw, -.862 + B); c.quadraticCurveTo(0 + sw, -.85 + B, .058 + sw, -.862 + B); c.lineTo(.068 + sw, -.805 + B); c.closePath();
    const hx = sw * 1.3, hy = -.886 + B;
    c.moveTo(hx + .056, hy); c.ellipse(hx, hy, .056, .066, 0, 0, TAU);
    c.moveTo(hx + .108, hy - .042); c.ellipse(hx, hy - .042, .108, .018, 0, 0, TAU);
    c.moveTo(hx - .062, hy - .042); c.lineTo(hx - .056, hy - .112); c.quadraticCurveTo(hx, hy - .1, hx + .056, hy - .112); c.lineTo(hx + .062, hy - .042); c.closePath();
    return { sw, B };
  }
  function coatArms(c, o, sw, B) { // Arme als Striche; o.raise: rechter Arm schirmt das Gesicht ab, o.hold: Arm hält Lampe vor die Brust
    const ph = o.phase || 0, wk = o.walk || 0, swing = Math.sin(ph) * .05 * wk;
    c.lineWidth = .056; c.lineCap = 'round'; c.lineJoin = 'round';
    const arm = (pts) => { c.beginPath(); pts.forEach((q, i) => i ? c.lineTo(q[0] + sw, q[1] + B) : c.moveTo(q[0] + sw, q[1] + B)); c.stroke(); };
    const r = clamp(o.raise || 0), hd = clamp(o.hold || 0);
    const hand = (q) => { c.beginPath(); c.ellipse(q[0] + sw, q[1] + B, .024, .03, 0, 0, TAU); c.fill(); };
    const lh = [-.15 + swing, -.455 + Math.abs(swing) * .2];
    arm([[-.112, -.77], [-.15 - swing * .3, -.61], lh]); hand([lh[0], lh[1] + .012]);
    if (hd > 0) { const q = [lerp(.15, .07, hd), lerp(-.455, -.615, hd)]; arm([[.112, -.77], [lerp(.15, .168, hd), lerp(-.61, -.64, hd)], q]); hand(q); }
    else { const q = [lerp(.15 - swing, .045, r), lerp(-.455 + Math.abs(swing) * .2, -.9, r)]; arm([[.112, -.77], [lerp(.15 + swing * .3, .212, r), lerp(-.61, -.83, r)], q]); hand([q[0], q[1] + .012 * (1 - r)]); }
  }
  function coatFigure(c, x, y, h, t, o = {}) { // Silhouette mit optionaler Lichtkante (o.rim, o.rimDx in px)
    c.save(); c.translate(x, y); c.scale(h, h);
    if (o.rim) { c.save(); c.translate((o.rimDx || 2.5) / h, (o.rimDy || -1) / h); c.fillStyle = o.rim; c.strokeStyle = o.rim; const r = coatPath(c, o, t); c.fill(); coatArms(c, o, r.sw, r.B); c.restore(); }
    c.fillStyle = o.col || '#020306'; c.strokeStyle = o.col || '#020306'; const r = coatPath(c, o, t); c.fill(); coatArms(c, o, r.sw, r.B);
    c.restore();
  }
  function flare(c, x, y, I, gt, sd = 0, flash = 0) { // Linsenreflex einer Lampe, die in die Kamera leuchtet; flash = kurzer Weißblitz
    if (!(I > .002) && !(flash > 0)) return;
    if (!(I > .002)) { c.save(); c.globalCompositeOperation = 'lighter'; fillVis(c, `rgba(150,165,205,${flash})`); c.restore(); return; }
    const j = 1 + .04 * noise(gt * 9, 3 + sd);
    c.save(); c.globalCompositeOperation = 'lighter';
    if (flash > .01) fillVis(c, `rgba(150,165,205,${clamp(flash)})`);
    spotClip(c, x, y, 700 * Math.sqrt(I), 'rgba(150,170,215,A)', .24 * I);
    spotClip(c, x, y, 380 * Math.sqrt(I) * j, 'rgba(255,238,205,A)', .42 * I);
    spotClip(c, x, y, 150 * j, 'rgba(255,246,228,A)', .85 * I);
    spotClip(c, x, y, 46 * j, 'rgba(255,255,255,A)', Math.min(1, 1.3 * I));
    // Strahlen: langer horizontaler Streifen + feiner Stern
    for (const [len, th, a, col] of [[1500, 5, .5, '190,210,255'], [900, 2.2, .7, '235,240,255']]) {
      const L = len * I * j, gr = c.createLinearGradient(x - L, 0, x + L, 0);
      gr.addColorStop(0, `rgba(${col},0)`); gr.addColorStop(.5, `rgba(${col},${a * I})`); gr.addColorStop(1, `rgba(${col},0)`);
      c.fillStyle = gr; c.fillRect(x - L, y - th / 2, 2 * L, th);
    }
    c.translate(x, y); c.rotate(.35 + noise(gt * .7, 9 + sd) * .05);
    for (let k = 0; k < 6; k++) { c.rotate(Math.PI / 3); const L = (210 + 90 * hash(k + sd)) * I * j, gr = c.createLinearGradient(0, 0, L, 0);
      gr.addColorStop(0, `rgba(255,250,240,${.55 * I})`); gr.addColorStop(1, 'rgba(255,250,240,0)'); c.fillStyle = gr; c.fillRect(0, -1.2, L, 2.4); }
    c.restore();
    // Geisterbilder entlang der Achse durch die Bildmitte
    c.save(); c.globalCompositeOperation = 'lighter';
    const cx = 540, cy = 960;
    for (const [k, r, a, col, hex] of [[.42, 26, .12, '140,200,255', 0], [.75, 70, .06, '255,190,120', 1], [1.25, 40, .09, '170,255,210', 0], [1.6, 120, .045, '140,170,255', 1], [2.05, 22, .12, '255,220,170', 0]]) {
      const gx = x + (cx - x) * k * 1.0, gy = y + (cy - y) * k;
      if (hex) { c.fillStyle = `rgba(${col},${a * I})`; c.beginPath(); for (let i = 0; i < 6; i++) { const an = i / 6 * TAU + .3; i ? c.lineTo(gx + Math.cos(an) * r, gy + Math.sin(an) * r) : c.moveTo(gx + Math.cos(an) * r, gy + Math.sin(an) * r); } c.closePath(); c.fill(); }
      else spot(c, gx, gy, r, `rgba(${col},A)`, a * I * 1.6);
    }
    c.restore();
  }
  SCENES.torch_glare = (c, lt, b, gt) => {
    const p = b.p || {};
    const farm = p.farm !== false, walker = p.walker !== false;
    blit(c, layer('tg|' + farm, g => tgStatic(g, farm)));
    const sp = sprite('soft');
    // Wolkenfetzen, Bodennebel, Sterne funkeln
    for (let i = 0; i < 4; i++) { const cx = mod(gt * (6 + i * 3) + i * 430, 1800) - 350; c.globalAlpha = .06; c.drawImage(sp, cx - 380, 330 + i * 90 - 22, 760, 44); }
    for (let i = 0; i < 6; i++) { const mx = mod(gt * (5 + i * 2) + i * 330, 1800) - 350; c.globalAlpha = .07; c.drawImage(sp, mx - 420, TG.hz + 6 + i * 12 - 30, 840, 60); }
    c.globalAlpha = 1;
    for (let i = 0; i < 20; i++) { const x = RX + hash(i * 4.7 + 1) * RW, y = RY + 150 + hash(i * 8.3 + 2) * 600, a = Math.pow(clamp(noise(gt * 1.2, i * 3.1) * .5 + .5), 3) * .7;
      c.fillStyle = `rgba(230,236,255,${a})`; c.fillRect(x - 1, y - 1, 2.2, 2.2); }
    // ---- Zeitplan der Lampe ----
    const on = tOn(p.on, 1.0), hold = Math.max(0, num(p.hold, 1.0));
    const sw = on == null ? null : (p.swing === false ? null : num(p.swing, on + hold));
    const u = on == null ? -1 : lt - on;
    let env = 0; if (u >= 0) env = u < .05 ? .55 : u < .09 ? .18 : 1 + .3 * Math.exp(-(u - .09) * 5);
    env *= .96 + .04 * noise(gt * 11, 17);
    // Drehung (Lampe schwenkt weg) und Gang zum Hof
    const sk = sw == null ? 0 : E.inOut(prog(lt, sw, sw + .95));
    const go = sw == null ? null : sw + .55, pace = num(p.pace, 2.7);
    const [mx0, mz0] = TG_MAN, gl = Math.hypot(TG_GOAL[0] - mx0, TG_GOAL[1] - mz0), ux = (TG_GOAL[0] - mx0) / gl, uz = (TG_GOAL[1] - mz0) / gl;
    let dist = 0; if (go != null && lt > go) { const tt = lt - go; dist = Math.min(gl, pace * (tt - .35 * (1 - Math.exp(-tt / .35)))); } // sanft anlaufen
    const mx = mx0 + ux * dist, mz = mz0 + uz * dist, walking = go != null && lt > go && dist < gl;
    const ph = walking ? (lt - go) * 2 * Math.PI * .95 : 0;
    const heading = Math.atan2(ux, uz); // Richtung Hof
    const psi = lerp(Math.PI + .06, heading + Math.sin(lt * 1.7) * .1 * clamp((lt - (go || 0)) / 1.5), sk) + (sk > 0 && sk < 1 ? Math.sin(sk * Math.PI) * .25 : 0);
    const bob = walking ? Math.sin(ph * 2) * .05 : 0;
    const face = clamp(sk * 1.6); // 0 = Gesicht zur Kamera, 1 = abgewandt
    const T = [mx + lerp(-.16, .05, face), 1.27 + bob + noise(gt * 1.3, 8) * .012, mz + lerp(-.32, .32, face)];
    const D = [Math.sin(psi), lerp(-.075, -.045, face), Math.cos(psi)]; { const n = Math.hypot(...D); D[0] /= n; D[1] /= n; D[2] /= n; }
    const toC = [-T[0], TG.h - T[1], -T[2]], nc = Math.hypot(...toC);
    const facing = Math.max(0, (D[0] * toC[0] + D[1] * toC[1] + D[2] * toC[2]) / nc);
    const fade = sw == null ? 1 : clamp(1 - (dist - gl + 6) / 6) * clamp(1 - prog(lt, sw + 9, sw + 10)); // erlischt am Hof (bzw. spätestens 9 s nach dem Schwenk)
    const I = env * fade, If = I * Math.pow(facing, 14);
    const [Lx, Ly] = tgP(...T);
    // ---- Licht auf dem Schnee ----
    if (I > 0) {
      const dxz = Math.hypot(D[0], D[2]) || 1, hx = D[0] / dxz, hz = D[2] / dxz;
      { const [sx, sy, rx, ry] = tgGround(mx + hx * 1.6, mz + hz * 1.6, 2.6); groundGlow(c, sx, sy, rx, ry, '255,236,200', .22 * I); }
      const sh = T[1] / -D[1]; // Auftreffpunkt des Kegels
      const gx = T[0] + D[0] * sh, gz = T[2] + D[2] * sh;
      if (gz > 2) { const R = Math.max(1.5, sh * .2), [sx, sy, rx, ry] = tgGround(gx, gz, R); groundGlow(c, sx, sy, rx * 1.2, ry * 1.2, '255,238,205', .36 * I * (1 - facing * .8)); }
      if (If > .01) { // Lampe zur Kamera: der ganze Weg davor wird hell
        const [sx, sy, rx, ry] = tgGround(mx * .5, Math.max(2.4, mz * .5), 3.4); groundGlow(c, sx, sy, rx * 1.4, ry * 1.4, '255,236,205', .42 * If); }
    }
    // Wanderer: Position, Gang, Schatten
    const wz0 = num(p.walkerZ, 3.7), wx = -.55, stopT = on == null ? 99 : on + .12;
    const wz = wz0 + .3 * Math.min(lt, stopT) + (lt > stopT && sw != null ? .25 * clamp(prog(lt, sw + 2.5, sw + 5.5)) : 0);
    const wWalk = Math.max(1 - clamp((lt - stopT) / .3), sw != null ? .45 * clamp((lt - sw - 2.5) / .4) * clamp((sw + 5.5 - lt) / .4) : 0); // bleibt stehen, geht später zögernd ein paar Schritte
    if (walker && If > .02) { // langer Schatten des Wanderers auf die Kamera zu
      const gx = wx - T[0], gz = wz - T[2], gn = Math.hypot(gx, gz) || 1, dx = gx / gn, dz = gz / gn, nx = -dz, nz = dx;
      const far = Math.max(.9, wz - 3.2), sEnd = (wz - far) / Math.max(.2, -dz);
      const q0 = tgP(wx + nx * .2, 0, wz + nz * .2), q1 = tgP(wx - nx * .2, 0, wz - nz * .2), e = [wx + dx * sEnd, wz + dz * sEnd];
      const q2 = tgP(e[0] - nx * .5, 0, Math.max(.8, e[1] - nz * .5)), q3 = tgP(e[0] + nx * .5, 0, Math.max(.8, e[1] + nz * .5));
      const gr = c.createLinearGradient(q0[0], q0[1], (q2[0] + q3[0]) / 2, (q2[1] + q3[1]) / 2); gr.addColorStop(0, `rgba(2,4,9,${.75 * If})`); gr.addColorStop(1, `rgba(2,4,9,${.25 * If})`);
      poly(c, [q0, q1, q2, q3]); c.fillStyle = gr; c.fill();
    }
    // Lichtfleck an der Hauswand, sobald der Kegel sie erreicht
    if (farm && I > 0 && D[2] > .05) { const sW = (TF.z0 - .05 - T[2]) / D[2], hy = T[1] + D[1] * sW, hx = T[0] + D[0] * sW;
      if (hy > -.5 && hx > TF.x0 - 1 && hx < TF.x1 + 1 && sW < 40) { const [sx, sy] = tgP(hx, Math.max(.2, hy), TF.z0), R = TG.f * (.35 + sW * .16) / TF.z0, a = .34 * I * (1 - facing) * clamp(1.4 - sW / 30);
        c.save(); c.beginPath(); const w0 = tgP(TF.x0, 0, TF.z0), w1 = tgP(TF.x1, TF.wh, TF.z0); c.rect(w0[0], w1[1], w1[0] - w0[0], w0[1] - w1[1] + 6); c.clip();
        addGlow(c, sx, sy, R * 1.3, '255,232,195', a); addGlow(c, sx, sy, R * .5, '255,240,215', a * .9); c.restore(); } }
    // ---- Gestalt mit Lampe ----
    const [fx, fy] = tgP(mx, 0, mz), fh = TG.f * 1.8 / mz;
    const vis = on == null || u < 0 ? 0 : clamp(u / .08); // erst das Licht macht die Gestalt sichtbar
    if (I > 0) addGlow(c, Lx, Ly - fh * .05, fh * .9, '210,220,255', .22 * If); // Halo hinter der Gestalt
    // Lichtkegel durch den Schnee (unsichtbar, solange er in die Kamera zeigt): Keil + weiche Volumen
    const cone = I * clamp(1 - Math.pow(facing, 2) * 1.6);
    const coneOut = [];
    if (cone > .01) {
      const pts = [];
      for (let s = .3, i = 0; s < 24 && i < 30; s *= 1.16, i++) { const Q = [T[0] + D[0] * s, T[1] + D[1] * s, T[2] + D[2] * s]; if (Q[2] < 1.6 || Q[1] < 0) break; const [qx, qy] = tgP(...Q); pts.push([qx, qy, Math.min(420, TG.f * (.06 + s * .19) / Q[2]), s]); }
      if (pts.length > 2) {
        const left = [], right = [];
        for (let i = 0; i < pts.length; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1;
          left.push([pts[i][0] - dy / n * pts[i][2], pts[i][1] + dx / n * pts[i][2]]); right.push([pts[i][0] + dy / n * pts[i][2], pts[i][1] - dx / n * pts[i][2]]); }
        const e = pts[pts.length - 1], gr = c.createLinearGradient(Lx, Ly, e[0], e[1]);
        gr.addColorStop(0, `rgba(255,240,212,${.42 * cone})`); gr.addColorStop(.25, `rgba(240,238,236,${.16 * cone})`); gr.addColorStop(1, 'rgba(220,228,245,0)');
        c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = gr;
        for (const [k, a] of [[1.35, .22], [1, .3], [.7, .34], [.38, .4]]) { // gestaffelte Keile = weiche Ränder
          c.globalAlpha = a; c.beginPath(); c.moveTo(Lx, Ly); left.forEach((q, i) => c.lineTo(lerp(pts[i][0], q[0], k), lerp(pts[i][1], q[1], k))); for (let i = right.length - 1; i >= 0; i--) c.lineTo(lerp(pts[i][0], right[i][0], k), lerp(pts[i][1], right[i][1], k)); c.closePath(); c.fill(); }
        for (let i = 2; i < pts.length; i += 3) { const [qx, qy, r, s] = pts[i]; c.globalAlpha = clamp(cone * .14 * (1 - s / 24)); c.drawImage(sp, qx - r * .8, qy - r * .8, r * 1.6, r * 1.6); }
        c.restore(); c.globalAlpha = 1;
        for (const q of pts) coneOut.push(q);
      }
    }
    if (I > 0 && face > .3) addGlow(c, Lx, Ly, TG.f * .9 / T[2], '255,228,185', .3 * I * face); // Streulicht vor dem Körper (Gestalt verdeckt die Lampe)
    c.save(); c.globalAlpha = vis * clamp(fade * 3);
    coatFigure(c, fx, fy, fh, gt, { phase: ph, walk: walking ? 1 : 0, hold: 1 - face, seed: 7, col: '#010204', rim: I > 0 ? `rgba(225,222,215,${.5 * I * (.3 + .7 * face)})` : null, rimDx: face > .5 ? .8 : 1.5, rimDy: -1.6 });
    c.restore();
    // Lampenkopf (nur sichtbar, solange er zur Kamera zeigt)
    if (I > 0 && face < .6) { const r = (TG.f * .045 / T[2]) * (1 + If * .3); c.save(); c.globalAlpha = 1 - face / .6; c.fillStyle = `rgba(255,252,240,${clamp(I)})`; glow(c, 'rgba(255,240,210,1)', 30 * I); c.beginPath(); c.arc(Lx, Ly, r, 0, TAU); c.fill(); noGlow(c); c.restore(); }
    // ---- Wanderer (von hinten) ----
    if (walker) {
      const [wxs, wys] = tgP(wx, 0, wz), wh = TG.f * 1.74 / wz;
      const rz = on == null ? 0 : E.inOut(prog(lt, on + .22, on + .62)) * (1 - E.inOut(prog(lt, (sw == null ? 99 : sw) + .7, (sw == null ? 99 : sw) + 1.8)));
      const wph = lt * 2 * Math.PI * .85;
      const rimA = clamp(.12 + .75 * If + .25 * I * (1 - face));
      coatFigure(c, wxs, wys, wh, gt, { phase: wph, walk: wWalk, raise: rz, seed: 2, col: '#010205', rim: `rgba(${If > .05 ? '235,232,225' : '120,140,180'},${rimA})`, rimDx: 2.5 + If * 2, rimDy: -1.5 });
    }
    // ---- Schnee (leuchtet im Licht) ----
    const boost = I > 0 ? (x, y) => { let k = If * 1.4 * Math.max(0, 1 - Math.hypot(x - Lx, y - Ly) / 520);
      for (let i = 0; i < coneOut.length; i += 2) { const [qx, qy, r] = coneOut[i], d = Math.hypot(x - qx, y - qy); if (d < r) { k += cone * 1.1 * (1 - d / r); break; } }
      return k; } : null;
    if (p.snow !== false) { snowfall(c, gt, { n: 200, s0: 1.4, s1: 7, v0: 35, v1: 150, alpha: .72, boost }); snowfall(c, gt, { n: 14, s0: 12, s1: 24, v0: 160, v1: 230, alpha: .22, seed: 3, boost }); }
    // ---- Linsenreflex + Aufblitzen ----
    const fl = u > .05 && u < .4 ? .3 * Math.exp(-(u - .05) * 14) : 0;
    flare(c, Lx, Ly, If, gt, 0, fl);
  };

  // =====================================================================
  // 2) engine_shed – Motorhäuschen neben dem Stadel: Stationärmotor mit Schwungrad und Riemen, Tür mit Überwurf
  // =====================================================================
  const ES = { vx: 540, vy: 700, wx0: 40, wy0: 250, wx1: 1040, wy1: 1150, door: [70, 480, 310, 1150], lockY: 800,
    fly: [835, 1000, 178], pul: [851, 1015, 70], bedY: 1178, lan: [330, 562], clock: [884, 430, 56], slot: [1112, 372], win: [566, 352, 700, 494],
    eb: [100, 760, 1100, 1370] }; // eb = Ausschnitt der Motor-Ebene
  const esWall = (x, y, k) => [ES.vx + (x - ES.vx) * k, ES.vy + (y - ES.vy) * k]; // Punkt der Rückwand Richtung Kamera verschoben (k > 1)
  function esPal(day) {
    return day ? { wall: ['#5e564c', '#4a433b'], board: 'rgba(20,16,12,.55)', side: '#3e3730', ceil: '#2a251f', floor: ['#3a342d', '#4a433a'], beam: '#3a3028', frame: '#3b3027',
      sky: ['#c9ccd0', '#a9aeb4'], barn: '#77716a', snow: ['#e1e3e5', '#c4c8cc'], glass: '#c9ced3', rim: 'rgba(225,230,236,.55)', iron: '#3c403b', ironD: '#262924', fly: '#33302b', cloth: '#7a7062' }
      : { wall: ['#3a2c21', '#2c2118'], board: 'rgba(8,5,3,.6)', side: '#21180f', ceil: '#140f0b', floor: ['#241b14', '#33271c'], beam: '#2c2016', frame: '#2a1f16',
      sky: ['#070c17', '#111a2b'], barn: '#151b27', snow: ['#3a4865', '#2a3550'], glass: '#14203a', rim: 'rgba(255,190,120,.6)', iron: '#3a3d36', ironD: '#1f211d', fly: '#2c2823', cloth: '#5e5446' };
  }
  function esBack(g, day) { // Rückwand, Seitenwände, Decke, Boden, Türrahmen mit Blick nach draußen, Fenster, Regal, Uhrgehäuse
    const K = esPal(day), { wx0, wy0, wx1, wy1 } = ES;
    g.fillStyle = K.ceil; g.fillRect(RX, RY, RW, wy0 - RY + 2);
    // Seitenwände in Perspektive
    for (const [xe, s] of [[wx0, -1], [wx1, 1]]) { const a = esWall(xe, wy0, 3), b = esWall(xe, wy1, 3); poly(g, [[xe, wy0], [xe, wy1], b, a]); g.fillStyle = K.side; g.fill();
      g.strokeStyle = K.board; g.lineWidth = 3; g.beginPath(); for (let k = 1.12; k < 3; k *= 1.16) { const p0 = esWall(xe, wy0, k), p1 = esWall(xe, wy1, k); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); } g.stroke();
      const sh = g.createLinearGradient(xe, 0, xe + s * 260, 0); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = sh; poly(g, [[xe, wy0], [xe, wy1], b, a]); g.fill(); }
    // Rückwand: senkrechte Bretter mit Maserung, Astlöchern, Fugen
    const wg = g.createLinearGradient(0, wy0, 0, wy1); wg.addColorStop(0, K.wall[1]); wg.addColorStop(.5, K.wall[0]); wg.addColorStop(1, K.wall[1]);
    g.fillStyle = wg; g.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
    for (let x = wx0, i = 0; x < wx1; x += 52, i++) {
      g.fillStyle = `rgba(${hash(i * 3.3) > .5 ? '0,0,0' : '255,230,200'},${.03 + .05 * hash(i * 7.1)})`; g.fillRect(x, wy0, 52, wy1 - wy0);
      g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1.2; g.beginPath();
      for (let k = 0; k < 4; k++) { const xx = x + 8 + k * 11 + hash(i * 5 + k) * 6; g.moveTo(xx, wy0); g.bezierCurveTo(xx + 4, wy0 + 300, xx - 4, wy0 + 600, xx + 2, wy1); } g.stroke();
      if (hash(i * 9.7) > .55) { const ky = wy0 + 80 + hash(i * 2.9) * 760; g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x + 26, ky, 6, 9, 0, 0, TAU); g.fill(); }
      g.fillStyle = K.board; g.fillRect(x - 1.5, wy0, 3, wy1 - wy0);
      if (day && hash(i * 4.4) > .45) { g.fillStyle = `rgba(230,234,240,${.25 + .4 * hash(i)})`; const y0 = wy0 + hash(i * 6.6) * 300, y1 = y0 + 200 + hash(i * 8.8) * 500; g.fillRect(x - .8, y0, 1.6, Math.min(wy1, y1) - y0); }
    }
    // Wandschwelle, Rähm, Deckenbalken
    g.fillStyle = K.beam; g.fillRect(RX, wy0 - 34, RW, 40); g.fillStyle = 'rgba(255,220,180,.08)'; g.fillRect(RX, wy0 + 2, RW, 4);
    for (const x of [140, 420, 700, 980]) { const a = esWall(x - 22, wy0 - 34, 1), b = esWall(x + 22, wy0 - 34, 1), c2 = esWall(x + 22, wy0 - 34, 3), d2 = esWall(x - 22, wy0 - 34, 3); poly(g, [a, b, c2, d2]); g.fillStyle = K.beam; g.fill(); g.fillStyle = 'rgba(0,0,0,.35)'; poly(g, [b, c2, [c2[0] + 12, c2[1]], [b[0] + 4, b[1]]]); g.fill(); }
    g.fillStyle = K.beam; g.fillRect(wx0, wy1 - 22, wx1 - wx0, 24);
    // Boden: Bretter auf die Kamera zu, Ölflecken, Sägemehl
    const fg = g.createLinearGradient(0, wy1, 0, H - RY); fg.addColorStop(0, K.floor[0]); fg.addColorStop(1, K.floor[1]);
    poly(g, [[RX, wy1], [W - RX, wy1], [W - RX, H - RY], [RX, H - RY]]); g.fillStyle = fg; g.fill();
    g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 2; g.beginPath(); for (let i = -12; i <= 12; i++) { const x = ES.vx + i * 70, e = esWall(x, wy1, 3.2); g.moveTo(x, wy1); g.lineTo(e[0], e[1]); } g.stroke();
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1.5; g.beginPath(); for (const k of [1.18, 1.45, 1.9]) { const y = ES.vy + (wy1 - ES.vy) * k; g.moveTo(RX, y); g.lineTo(W - RX, y); } g.stroke();
    for (const [x, y, rx, ry, a] of [[700, 1290, 260, 40, .5], [520, 1230, 120, 18, .4], [880, 1350, 180, 30, .35], [300, 1420, 140, 24, .25]]) { g.fillStyle = `rgba(4,3,2,${a})`; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); }
    g.fillStyle = 'rgba(190,160,110,.07)'; for (let i = 0; i < 300; i++) { const x = RX + hash(i * 3.9) * RW, y = wy1 + 10 + Math.pow(hash(i * 6.1), 1.4) * 900; g.fillRect(x, y, 2 + hash(i) * 3, 1.5); }
    // Tür: Rahmen, Blick nach draußen (Stadelwand, Schnee)
    const [dx0, dy0, dx1, dy1] = ES.door;
    g.save(); g.beginPath(); g.rect(dx0, dy0, dx1 - dx0, dy1 - dy0); g.clip();
    const sk = g.createLinearGradient(0, dy0, 0, dy0 + 160); sk.addColorStop(0, K.sky[0]); sk.addColorStop(1, K.sky[1]); g.fillStyle = sk; g.fillRect(dx0, dy0, dx1 - dx0, 200);
    g.fillStyle = K.barn; g.fillRect(dx0, dy0 + 120, dx1 - dx0, 560); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; g.beginPath(); for (let x = dx0 + 10; x < dx1; x += 26) { g.moveTo(x, dy0 + 120); g.lineTo(x, dy1); } g.stroke();
    g.fillStyle = day ? '#d9dcdf' : '#7584a3'; g.fillRect(dx0, dy0 + 108, dx1 - dx0, 16); // verschneite Traufe gegenüber
    g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(dx0, dy0 + 124, dx1 - dx0, 40);
    const sn = g.createLinearGradient(0, dy1 - 150, 0, dy1); sn.addColorStop(0, K.snow[0]); sn.addColorStop(1, K.snow[1]);
    g.fillStyle = sn; g.beginPath(); g.moveTo(dx0, dy1); g.lineTo(dx0, dy1 - 120); for (let i = 0; i <= 10; i++) g.lineTo(dx0 + (dx1 - dx0) * i / 10, dy1 - 130 + Math.sin(i * 1.3) * 10); g.lineTo(dx1, dy1); g.closePath(); g.fill();
    g.restore();
    g.fillStyle = K.frame; g.fillRect(dx0 - 20, dy0 - 22, dx1 - dx0 + 40, 22); g.fillRect(dx0 - 20, dy0, 20, dy1 - dy0); g.fillRect(dx1, dy0, 20, dy1 - dy0);
    g.fillStyle = 'rgba(255,220,180,.07)'; g.fillRect(dx1, dy0, 3, dy1 - dy0); g.fillRect(dx0 - 20, dy0 - 22, dx1 - dx0 + 40, 3);
    g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(dx0 - 20, dy1 - 6, dx1 - dx0 + 40, 6); // Schwelle
    // Fenster (staubig, mit Spinnweben)
    const [fx0, fy0, fx1, fy1] = ES.win;
    g.fillStyle = K.frame; g.fillRect(fx0 - 14, fy0 - 14, fx1 - fx0 + 28, fy1 - fy0 + 28);
    const gl = g.createLinearGradient(0, fy0, 0, fy1); gl.addColorStop(0, K.glass); gl.addColorStop(1, day ? '#9fa5ac' : '#0c1426'); g.fillStyle = gl; g.fillRect(fx0, fy0, fx1 - fx0, fy1 - fy0);
    g.fillStyle = day ? 'rgba(120,110,95,.35)' : 'rgba(60,50,40,.3)'; for (let i = 0; i < 40; i++) { g.beginPath(); g.arc(fx0 + hash(i * 2.1) * (fx1 - fx0), fy0 + hash(i * 3.7) * (fy1 - fy0), 2 + hash(i) * 7, 0, TAU); g.fill(); }
    g.fillStyle = K.frame; g.fillRect((fx0 + fx1) / 2 - 5, fy0, 10, fy1 - fy0); g.fillRect(fx0, (fy0 + fy1) / 2 - 5, fx1 - fx0, 10);
    g.strokeStyle = day ? 'rgba(235,235,235,.25)' : 'rgba(150,160,180,.18)'; g.lineWidth = 1; g.beginPath(); for (let k = 1; k < 6; k++) { g.moveTo(fx1, fy0 + k * 9); g.lineTo(fx1 - k * 9, fy0); } g.moveTo(fx1, fy0); g.lineTo(fx1 - 50, fy0 + 50); g.stroke();
    g.fillStyle = K.frame; g.fillRect(fx0 - 20, fy1 + 12, fx1 - fx0 + 40, 10);
    // Regal rechts mit Kanistern und Flaschen, Seilrolle
    g.fillStyle = K.beam; g.fillRect(720, 642, 290, 12); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(720, 654, 290, 10); for (const x of [740, 980]) { g.fillStyle = K.beam; g.fillRect(x, 654, 8, 30); }
    const it = [[748, 560, 46, 82, '#3a3a33', 'can'], [806, 590, 28, 52, '#2d3a2c', 'bottle'], [848, 600, 40, 42, '#4a3a2a', 'tin'], [902, 574, 34, 68, '#3d3127', 'bottle'], [950, 596, 46, 46, '#3a3a36', 'tin']];
    for (const [x, y, w, h, col, k] of it) { g.fillStyle = col; if (k === 'bottle') { rr(g, x, y + h * .3, w, h * .7, 6); g.fill(); g.fillRect(x + w * .35, y, w * .3, h * .35); }
      else { rr(g, x, y, w, h, 4); g.fill(); if (k === 'can') { g.fillRect(x + w * .6, y - 12, 8, 14); g.strokeStyle = col; g.lineWidth = 5; g.beginPath(); g.moveTo(x + 6, y); g.quadraticCurveTo(x + w * .3, y - 22, x + w * .55, y); g.stroke(); } }
      g.fillStyle = 'rgba(255,225,190,.1)'; g.fillRect(x + 3, y + 4, 3, h - 8); }
    g.strokeStyle = '#3a2c1e'; g.lineWidth = 7; for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(625, 760 + k * 3, 34 - k * 2, 52 - k * 2, .12, 0, TAU); g.stroke(); } // Seilrolle am Nagel
    g.fillStyle = '#18120c'; g.beginPath(); g.arc(622, 705, 4, 0, TAU); g.fill();
    // Wanduhr: Gehäuse + Zifferblatt (Zeiger dynamisch)
    const [cx, cy, cr] = ES.clock;
    g.fillStyle = '#2e2014'; g.beginPath(); g.arc(cx, cy, cr + 13, 0, TAU); g.fill(); rr(g, cx - 18, cy + cr + 2, 36, 24, 6); g.fill();
    g.strokeStyle = '#7a6340'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, cr + 3, 0, TAU); g.stroke();
    const cf = g.createRadialGradient(cx - 14, cy - 16, 4, cx, cy, cr); cf.addColorStop(0, day ? '#e3dccb' : '#d6cbb0'); cf.addColorStop(1, day ? '#bdb39d' : '#a89b7f');
    g.fillStyle = cf; g.beginPath(); g.arc(cx, cy, cr, 0, TAU); g.fill();
    for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, big = i % 5 === 0, r0 = big ? cr - 11 : cr - 6; g.strokeStyle = '#2a2219'; g.lineWidth = big ? (i % 15 === 0 ? 4 : 2.6) : 1;
      g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.lineTo(cx + Math.cos(a) * (cr - 3), cy + Math.sin(a) * (cr - 3)); g.stroke(); }
    for (const [i, s] of [[0, 'XII'], [3, 'III'], [6, 'VI'], [9, 'IX']]) { const a = i / 12 * TAU - Math.PI / 2; txt(g, s, cx + Math.cos(a) * (cr - 21), cy + Math.sin(a) * (cr - 21) + 4, '700 11px OldStd', '#2a2219'); }
  }
  function esEngine(g, day, kind, tool) { // Motor-Ebene: Fundament, Zylinder, Kühltrichter, hinteres Schwungrad, Werkzeugkiste
    const K = esPal(day), [bx0, by0] = ES.eb; g.translate(-bx0, -by0);
    const rim = K.rim;
    if (kind !== false) {
      // Betonfundament
      poly(g, [[430, 1140], [1000, 1140], [1032, ES.bedY], [398, ES.bedY]]); g.fillStyle = day ? '#6a655c' : '#4a443b'; g.fill();
      g.fillStyle = day ? '#4f4a43' : '#352f28'; g.fillRect(398, ES.bedY, 634, 80); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(398, ES.bedY + 70, 634, 10);
      g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 2; g.beginPath(); g.moveTo(398, ES.bedY); g.lineTo(1032, ES.bedY); for (const x of [470, 640, 905]) { g.moveTo(x, ES.bedY + 8); g.lineTo(x + 18, ES.bedY + 40); g.lineTo(x + 6, ES.bedY + 70); } g.stroke();
      for (const [x, y, rx, a] of [[560, 1160, 90, .55], [760, 1165, 120, .5], [470, 1205, 40, .35]]) { g.fillStyle = `rgba(6,4,2,${a})`; g.beginPath(); g.ellipse(x, y, rx, rx * .16, 0, 0, TAU); g.fill(); }
      // Motorfuß
      g.fillStyle = K.ironD; rr(g, 448, 1096, 470, 54, 8); g.fill(); g.fillStyle = 'rgba(255,220,180,.08)'; g.fillRect(452, 1098, 462, 4);
      for (const x of [470, 590, 880]) { g.fillStyle = '#16140f'; g.fillRect(x - 9, 1138, 18, 12); g.fillStyle = 'rgba(200,180,150,.2)'; g.fillRect(x - 8, 1138, 16, 2); }
      // Kurbelgehäuse (später größtenteils vom Schwungrad verdeckt)
      poly(g, [[728, 942], [808, 926], [858, 968], [866, 1144], [708, 1150]]); g.fillStyle = K.ironD; g.fill();
      // hinteres Schwungrad (versetzt zur Fluchtmitte)
      const [fx, fy, fr] = ES.fly, bx = fx - (fx - ES.vx) * .07, by = fy - (fy - ES.vy) * .07, br = fr * .93;
      g.fillStyle = '#14120f'; g.beginPath(); g.arc(bx, by, br, 0, TAU); g.arc(bx, by, br * .84, 0, TAU, true); g.fill();
      // Auspuff: kurzes Rohr schräg nach hinten in die Wand (Manschette)
      g.strokeStyle = '#231e1a'; g.lineWidth = 26; g.lineCap = 'butt'; g.beginPath(); g.moveTo(452, 912); g.quadraticCurveTo(430, 860, 402, 836); g.stroke();
      g.fillStyle = '#2b2520'; g.beginPath(); g.ellipse(400, 834, 22, 18, .5, 0, TAU); g.fill(); g.fillStyle = '#0e0b09'; g.beginPath(); g.ellipse(397, 831, 12, 10, .5, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(150,80,40,.25)'; g.lineWidth = 4; g.beginPath(); g.moveTo(446, 896); g.quadraticCurveTo(428, 860, 410, 846); g.stroke();
      g.strokeStyle = rim; g.lineWidth = 2; g.beginPath(); g.moveTo(440, 916); g.quadraticCurveTo(420, 866, 392, 842); g.stroke();
      if (kind !== 'cloth') {
        // Zylinder mit Kühlmantel
        const cg = g.createLinearGradient(0, 930, 0, 1052); cg.addColorStop(0, day ? '#596057' : '#4c5249'); cg.addColorStop(.35, K.iron); cg.addColorStop(1, '#151714');
        g.fillStyle = cg; rr(g, 462, 930, 286, 122, 26); g.fill();
        for (const x of [520, 700]) { g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x, 932, 6, 118); g.fillStyle = 'rgba(255,230,200,.07)'; g.fillRect(x + 6, 932, 3, 118); }
        g.fillStyle = 'rgba(0,0,0,.35)'; for (let i = 0; i < 26; i++) { g.beginPath(); g.arc(470 + hash(i * 2.3) * 270, 940 + hash(i * 4.1) * 100, 2 + hash(i) * 5, 0, TAU); g.fill(); } // Rost/Abplatzer
        // Zylinderkopf mit Ventilkasten
        g.fillStyle = K.ironD; rr(g, 436, 920, 38, 142, 6); g.fill(); g.fillStyle = K.iron; rr(g, 440, 898, 66, 30, 5); g.fill();
        g.fillStyle = '#121310'; for (const y of [942, 990, 1038]) { g.beginPath(); g.arc(455, y, 6, 0, TAU); g.fill(); }
        g.strokeStyle = rim; g.lineWidth = 2; g.beginPath(); g.moveTo(441, 899); g.lineTo(505, 899); g.moveTo(437, 922); g.lineTo(437, 1060); g.stroke();
        g.strokeStyle = '#2b2d28'; g.lineWidth = 5; g.beginPath(); g.moveTo(506, 912); g.lineTo(740, 918); g.stroke(); // Stoßstange
        g.fillStyle = K.iron; g.beginPath(); g.moveTo(470, 898); g.lineTo(520, 884); g.lineTo(524, 892); g.lineTo(474, 906); g.fill(); // Kipphebel
        // Kühltrichter (oben offen, Wasser)
        const hg = g.createLinearGradient(480, 0, 730, 0); hg.addColorStop(0, day ? '#565c53' : '#474c43'); hg.addColorStop(.5, K.iron); hg.addColorStop(1, '#1c1e1a');
        poly(g, [[494, 936], [480, 820], [730, 820], [716, 936]]); g.fillStyle = hg; g.fill();
        g.fillStyle = '#0c0d0b'; poly(g, [[484, 822], [726, 822], [714, 806], [496, 806]]); g.fill();
        g.fillStyle = day ? 'rgba(200,205,210,.25)' : 'rgba(255,190,130,.16)'; poly(g, [[500, 812], [640, 812], [636, 809], [504, 809]]); g.fill(); // Glanz auf dem Wasser
        g.fillStyle = K.ironD; poly(g, [[478, 824], [732, 824], [728, 816], [482, 816]]); g.fill();
        g.strokeStyle = rim; g.lineWidth = 2.5; g.beginPath(); g.moveTo(482, 815); g.lineTo(726, 815); g.moveTo(480, 822); g.lineTo(494, 934); g.stroke();
        g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(600, 826, 4, 108);
        // Schmierbüchse (Messing) und Typenschild
        g.fillStyle = '#6e5a32'; rr(g, 560, 896, 22, 10, 3); g.fill(); g.fillStyle = 'rgba(190,200,190,.35)'; rr(g, 563, 872, 16, 24, 3); g.fill(); g.fillStyle = '#8a7240'; rr(g, 558, 866, 26, 8, 3); g.fill();
        g.fillStyle = 'rgba(255,230,170,.5)'; g.fillRect(562, 867, 6, 2);
        g.fillStyle = '#5a4a2c'; rr(g, 610, 970, 70, 34, 4); g.fill(); g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 1; g.strokeRect(614, 974, 62, 26);
        g.fillStyle = 'rgba(30,24,14,.8)'; g.fillRect(620, 980, 50, 4); g.fillRect(620, 988, 36, 3); g.fillRect(620, 994, 44, 3);
      } else {
        // Motor unter staubiger Plane
        const cg = g.createLinearGradient(0, 800, 0, 1110); cg.addColorStop(0, day ? '#8d8374' : '#6d6252'); cg.addColorStop(1, day ? '#5e564b' : '#40382f');
        g.fillStyle = cg; g.beginPath(); g.moveTo(410, 1112);
        g.bezierCurveTo(418, 1010, 430, 920, 446, 884); g.bezierCurveTo(456, 850, 470, 812, 492, 798); g.bezierCurveTo(560, 786, 660, 784, 735, 796);
        g.bezierCurveTo(760, 830, 770, 900, 772, 960); g.lineTo(780, 1104);
        for (let i = 0; i <= 12; i++) { const x = lerp(780, 410, i / 12); g.lineTo(x, 1104 + Math.sin(i * 2.1) * 8 + hash(i * 3.3) * 10); } g.closePath(); g.fill();
        g.strokeStyle = 'rgba(0,0,0,.32)'; g.lineWidth = 3; g.lineCap = 'round';
        for (const [x0, y0, x1, y1, x2, y2] of [[470, 820, 450, 960, 440, 1100], [540, 800, 520, 950, 515, 1100], [640, 796, 655, 940, 640, 1100], [720, 800, 740, 940, 730, 1098], [600, 900, 610, 1000, 590, 1100]]) {
          g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x1, y1, x2, y2); g.stroke(); }
        g.strokeStyle = day ? 'rgba(230,222,205,.22)' : 'rgba(255,200,140,.18)'; g.lineWidth = 2;
        for (const [x0, y0, x1, y1, x2, y2] of [[486, 812, 470, 950, 462, 1100], [560, 796, 545, 940, 540, 1100], [668, 796, 680, 930, 670, 1100]]) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x1, y1, x2, y2); g.stroke(); }
        g.fillStyle = 'rgba(210,200,180,.12)'; for (let i = 0; i < 260; i++) g.fillRect(420 + hash(i * 2.7) * 350, 800 + hash(i * 5.3) * 300, 2, 2);
        g.strokeStyle = rim; g.lineWidth = 2.5; g.beginPath(); g.moveTo(446, 884); g.bezierCurveTo(456, 850, 470, 812, 492, 798); g.bezierCurveTo(560, 786, 660, 784, 735, 796); g.stroke();
      }
    }
    if (tool) { // Werkzeugkiste (offen, mit Griff) und Ölkanne
      g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.ellipse(268, 1342, 160, 18, 0, 0, TAU); g.fill();
      g.fillStyle = '#2f2219'; poly(g, [[146, 1258], [394, 1258], [384, 1336], [154, 1336]]); g.fill(); // Rückwand innen
      // Werkzeuge ragen heraus
      g.strokeStyle = '#3d3d3e'; g.lineCap = 'round'; g.lineWidth = 10; g.beginPath(); g.moveTo(200, 1290); g.lineTo(232, 1196); g.stroke();
      g.lineWidth = 7; g.beginPath(); g.arc(236, 1186, 14, Math.PI * .9, Math.PI * 2.3); g.stroke();
      g.strokeStyle = '#4a3420'; g.lineWidth = 12; g.beginPath(); g.moveTo(300, 1292); g.lineTo(318, 1188); g.stroke(); g.fillStyle = '#333334'; rr(g, 296, 1172, 48, 22, 4); g.fill();
      g.strokeStyle = '#3d3d3e'; g.lineWidth = 6; g.beginPath(); g.moveTo(340, 1295); g.lineTo(368, 1220); g.stroke(); g.strokeStyle = '#5a3d22'; g.lineWidth = 10; g.beginPath(); g.moveTo(262, 1292); g.lineTo(252, 1230); g.stroke();
      g.fillStyle = '#4a3626'; rr(g, 150, 1200, 14, 100, 3); g.fill(); rr(g, 376, 1200, 14, 100, 3); g.fill(); rr(g, 150, 1196, 240, 14, 5); g.fill(); // Stirnbretter + Griff
      const tg = g.createLinearGradient(0, 1262, 0, 1342); tg.addColorStop(0, '#5a4330'); tg.addColorStop(1, '#3a2a1d');
      g.fillStyle = tg; poly(g, [[130, 1262], [410, 1262], [398, 1342], [142, 1342]]); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(134, 1290); g.lineTo(406, 1290); g.moveTo(138, 1316); g.lineTo(402, 1316); g.stroke();
      g.strokeStyle = rim; g.lineWidth = 2; g.beginPath(); g.moveTo(130, 1262); g.lineTo(410, 1262); g.moveTo(150, 1197); g.lineTo(390, 1197); g.stroke();
      // Ölkanne
      g.fillStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.ellipse(470, 1330, 44, 9, 0, 0, TAU); g.fill();
      g.fillStyle = '#3e3a33'; g.beginPath(); g.moveTo(436, 1328); g.lineTo(504, 1328); g.lineTo(486, 1284); g.lineTo(454, 1284); g.closePath(); g.fill();
      g.strokeStyle = '#3e3a33'; g.lineWidth = 5; g.beginPath(); g.moveTo(470, 1286); g.lineTo(470, 1272); g.lineTo(560, 1238); g.stroke();
      g.strokeStyle = rim; g.lineWidth = 1.5; g.beginPath(); g.moveTo(455, 1285); g.lineTo(438, 1326); g.stroke();
    }
  }
  function flywheel(c, x, y, R, th, K, rimCol) { // Speichenrad frontal; th = Drehwinkel
    c.save(); c.translate(x, y);
    const rw = R * .14, r0 = R * .19;
    const gr = c.createLinearGradient(-R, -R, R, R); gr.addColorStop(0, '#4a443c'); gr.addColorStop(.45, K.fly); gr.addColorStop(1, '#100e0c');
    c.fillStyle = gr; c.beginPath(); c.arc(0, 0, R, 0, TAU); c.arc(0, 0, R - rw, 0, TAU, true); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, R - rw * .45, 0, TAU); c.stroke();
    c.fillStyle = gr; c.beginPath();
    for (let k = 0; k < 6; k++) { const a = th + k * TAU / 6, ca = Math.cos(a), sa = Math.sin(a), w0 = R * .065, w1 = R * .04, L = R - rw * .6, bend = R * .05;
      const px = -sa, py = ca; // senkrecht zur Speiche
      c.moveTo(ca * r0 * .8 + px * w0, sa * r0 * .8 + py * w0);
      c.quadraticCurveTo(ca * L * .55 + px * (w0 * .6 + bend), sa * L * .55 + py * (w0 * .6 + bend), ca * L + px * w1, sa * L + py * w1);
      c.lineTo(ca * L - px * w1, sa * L - py * w1);
      c.quadraticCurveTo(ca * L * .55 - px * (w0 * .6 - bend), sa * L * .55 - py * (w0 * .6 - bend), ca * r0 * .8 - px * w0, sa * r0 * .8 - py * w0); c.closePath(); }
    c.fill();
    c.beginPath(); c.arc(0, 0, r0, 0, TAU); c.fill(); c.fillStyle = '#0d0c0a'; c.beginPath(); c.arc(0, 0, r0 * .42, 0, TAU); c.fill();
    c.fillStyle = '#2a2622'; c.save(); c.rotate(th); c.fillRect(-r0 * .1, -r0 * .62, r0 * .2, r0 * .3); c.restore(); // Keil
    c.strokeStyle = rimCol; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, R - 1.5, Math.PI * 1.02, Math.PI * 1.62); c.stroke();
    c.lineWidth = 1.6; c.beginPath(); c.arc(0, 0, r0, Math.PI * 1.05, Math.PI * 1.6); c.stroke();
    c.fillStyle = 'rgba(120,60,30,.22)'; for (let i = 0; i < 10; i++) { const a = th + hash(i * 3.7) * TAU, rd = R - rw * hash(i * 5.1); c.beginPath(); c.arc(Math.cos(a) * rd, Math.sin(a) * rd, 3 + hash(i) * 5, 0, TAU); c.fill(); }
    c.restore();
  }
  // Mechaniker im Profil, nach links über den Motor gebeugt (Einheiten: h = Körperhöhe, Hüfte = Ursprung, y nach unten)
  const MECH = [ // [Hüfte x, y, Schulter dx, dy, Kopf dx, dy, Hand nah dx, dy, Hand fern dx, dy]
    [640, 852, -.26, -.16, -.33, -.165, -.31, .115, -.15, -.04],
    [706, 846, -.24, -.14, -.31, -.15, -.2, -.02, -.29, -.02]];
  function mechBody(c, P, h, t, col, rim, sd) {
    const [hx, hy, sx, sy, kx, ky] = P, X = v => hx + v * h, Y = v => hy + v * h, br = Math.sin(t * 1.9 + sd) * .004;
    const path = () => { c.beginPath();
      // Beine (hinter dem Motor, nur der Vollständigkeit halber)
      c.moveTo(X(-.03), Y(0)); c.lineTo(X(.06), Y(.02)); c.lineTo(X(.07), Y(.5)); c.lineTo(X(.0), Y(.5)); c.closePath();
      // Rumpf: Rücken oben, Brust unten
      c.moveTo(X(.055), Y(.02)); c.bezierCurveTo(X(.06), Y(-.08 + br), X(sx + .1), Y(sy - .075 + br), X(sx + .02), Y(sy - .055 + br));
      c.quadraticCurveTo(X(sx - .03), Y(sy - .04 + br), X(sx - .045), Y(sy + .01 + br));
      c.bezierCurveTo(X(sx - .02), Y(sy + .09), X(-.06), Y(.03), X(-.04), Y(.06)); c.closePath();
      // Kopf + Schirmmütze
      const cx = X(kx), cy = Y(ky + br * 2);
      c.moveTo(cx + h * .055, cy); c.ellipse(cx, cy, h * .055, h * .06, -.5, 0, TAU);
      c.moveTo(cx + h * .05, cy - h * .03); c.ellipse(cx + h * .005, cy - h * .035, h * .062, h * .036, -.45, Math.PI * 1.0, Math.PI * 2.05); c.closePath();
      c.moveTo(cx - h * .04, cy - h * .01); c.lineTo(cx - h * .1, cy + h * .012); c.lineTo(cx - h * .085, cy + h * .025); c.lineTo(cx - h * .03, cy + h * .012); c.closePath(); // Schirm
    };
    c.save(); if (rim) { c.translate(-1.5, -2.5); path(); c.fillStyle = rim; c.fill(); c.translate(1.5, 2.5); } path(); c.fillStyle = col; c.fill(); c.restore();
  }
  function mechArm(c, P, h, t, col, rim, near, work) { // Arm (nah: mit Schraubenschlüssel)
    const [hx, hy, sx, sy, , , nx, ny, fx2, fy2] = P, X = v => hx + v * h, Y = v => hy + v * h;
    const s = [X(sx + .01), Y(sy + .02)], hd = near ? [X(nx), Y(ny)] : [X(fx2), Y(fy2)];
    const wob = near ? work : 0, hdx = hd[0] + Math.sin(wob) * 5, hdy = hd[1] + Math.cos(wob * 2) * 1.5;
    const el = [(s[0] + hdx) / 2 + (near ? -h * .03 : h * .03), (s[1] + hdy) / 2 + h * .01];
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    const draw = (cl, dx, dy) => { c.strokeStyle = cl; c.lineWidth = h * .05; c.beginPath(); c.moveTo(s[0] + dx, s[1] + dy); c.quadraticCurveTo(el[0] + dx, el[1] + dy, hdx + dx, hdy + dy); c.stroke();
      c.fillStyle = cl; c.beginPath(); c.ellipse(hdx + dx, hdy + dy, h * .026, h * .02, .4, 0, TAU); c.fill();
      if (near) { c.save(); c.translate(hdx + dx, hdy + dy); c.rotate(1.05 + Math.sin(wob) * .32); c.fillStyle = cl; c.fillRect(-h * .006, -h * .008, h * .1, h * .016); c.beginPath(); c.arc(h * .105, 0, h * .018, .9, -.9 + TAU); c.lineTo(h * .1, 0); c.closePath(); c.fill(); c.restore(); } };
    if (rim) draw(rim, -1.5, -2.5); draw(col, 0, 0);
    c.restore();
  }
  // Schlüsselbrett-Karte (gecacht)
  function keyBoardCard(n, miss) {
    return smallLayer(`keys|${n}|${miss}`, 700, 380, (g, w, h) => {
      g.fillStyle = 'rgba(0,0,0,.55)'; rr(g, 16, 18, w - 26, h - 26, 10); g.fill();
      g.fillStyle = '#d9d2c1'; rr(g, 8, 8, w - 26, h - 26, 8); g.fill(); // Papierrand
      const pg = g.createLinearGradient(0, 8, 0, h); pg.addColorStop(0, 'rgba(255,250,235,.15)'); pg.addColorStop(1, 'rgba(90,70,40,.22)'); g.fillStyle = pg; rr(g, 8, 8, w - 26, h - 26, 8); g.fill();
      const ix = 30, iy = 30, iw = w - 70, ih = h - 70;
      const bg = g.createRadialGradient(ix + iw * .45, iy + ih * .35, 20, ix + iw / 2, iy + ih / 2, iw * .65); bg.addColorStop(0, '#9b8a70'); bg.addColorStop(1, '#4e4536'); g.fillStyle = bg; g.fillRect(ix, iy, iw, ih); // gekalkte Wand dahinter
      g.fillStyle = 'rgba(60,45,30,.12)'; for (let i = 0; i < 30; i++) { g.beginPath(); g.ellipse(ix + hash(i * 3.1) * iw, iy + hash(i * 5.3) * ih, 20 + hash(i) * 60, 10 + hash(i * 7) * 30, 0, 0, TAU); g.fill(); }
      // Brett
      const by = iy + 56, bh = 54, bx0 = ix + 30, bw = iw - 60;
      g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(bx0 + 6, by + 8, bw, bh);
      const wg = g.createLinearGradient(0, by, 0, by + bh); wg.addColorStop(0, '#6e5236'); wg.addColorStop(1, '#4a3522'); g.fillStyle = wg; rr(g, bx0, by, bw, bh, 6); g.fill();
      g.strokeStyle = 'rgba(30,18,8,.35)'; g.lineWidth = 1.2; g.beginPath(); for (let k = 0; k < 5; k++) { const y = by + 8 + k * 9; g.moveTo(bx0 + 6, y); g.bezierCurveTo(bx0 + bw * .3, y + 3, bx0 + bw * .6, y - 3, bx0 + bw - 6, y + 1); } g.stroke();
      g.fillStyle = 'rgba(255,230,190,.18)'; g.fillRect(bx0 + 4, by + 3, bw - 8, 3);
      const gap = bw / n;
      for (let i = 0; i < n; i++) { const x = bx0 + gap * (i + .5), y = by + bh * .55;
        if (i === miss) { // hellere, ausgesparte Stelle in Schlüsselform
          g.save(); g.translate(x, y + 14); g.globalAlpha = .42; g.strokeStyle = '#ddd2bc'; g.lineWidth = 9; g.beginPath(); g.arc(0, 28, 20, 0, TAU); g.stroke(); g.fillStyle = '#ddd2bc'; g.fillRect(-6, 46, 12, 150); g.fillRect(-2, 160, 34, 36); g.restore();
        } else { // Bartschlüssel
          g.save(); g.translate(x, y + 14); g.rotate((hash(i * 7.3) - .5) * .08);
          g.strokeStyle = '#2a2622'; g.lineWidth = 8; g.beginPath(); g.arc(0, 28, 20, 0, TAU); g.stroke();
          g.fillStyle = '#2a2622'; g.fillRect(-5, 46, 10, 150); g.fillRect(0, 162, 30, 34); g.fillStyle = '#100e0c'; g.fillRect(10, 172, 8, 24);
          g.strokeStyle = 'rgba(200,190,170,.4)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 28, 20, Math.PI * 1.1, Math.PI * 1.7); g.moveTo(-3, 50); g.lineTo(-3, 190); g.stroke(); g.restore(); }
        // Haken
        g.strokeStyle = '#1a1714'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y - 6); g.lineTo(x, y + 14); g.quadraticCurveTo(x + 2, y + 30, x + 14, y + 24); g.stroke();
        g.strokeStyle = 'rgba(210,200,180,.35)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x - 2, y - 4); g.lineTo(x - 2, y + 14); g.stroke();
        g.fillStyle = '#100e0c'; g.beginPath(); g.arc(x, y - 8, 5, 0, TAU); g.fill();
      }
      // Fotokorn + Vignette
      for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${hash(i * 1.7) > .5 ? '255,250,240' : '0,0,0'},${.05 + .05 * hash(i * 3.1)})`; g.fillRect(ix + hash(i * 2.3) * iw, iy + hash(i * 4.9) * ih, 2, 2); }
      const vg = g.createRadialGradient(ix + iw / 2, iy + ih / 2, ih * .3, ix + iw / 2, iy + ih / 2, iw * .62); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)'); g.fillStyle = vg; g.fillRect(ix, iy, iw, ih);
    });
  }
  SCENES.engine_shed = (c, lt, b, gt) => {
    const p = b.p || {};
    const day = p.light === 'day', K = esPal(day);
    const kind = p.engine === false ? false : (p.engine === 'cloth' ? 'cloth' : 'bare'), tool = p.toolbox !== false;
    c.save(); c.translate(580, 760); c.scale(1.08, 1.08); c.translate(-580, -760); // Raum etwas näher (Texte/Einschub bleiben unskaliert)
    blit(c, layer('esB|' + day, g => esBack(g, day)));
    const sp = sprite('soft');
    // ---- Zeitraffer (Uhr) ----
    const ck = p.clock === false ? null : obj(p.clock), ct0 = ck ? num(ck.t0, null) : null, ct1 = ck ? num(ck.t1, ct0 != null ? ct0 + 3 : null) : null;
    const spinOn = ck && ct0 != null && ct1 != null && ct1 > ct0, hours = ck ? num(ck.hours, 4.5) : 0, from = ck ? num(ck.from, 9) : 9;
    const spk = spinOn ? E.inOut(prog(lt, ct0, ct1)) : 0, spinning = spinOn && lt > ct0 && lt < ct1;
    const tl = lt + (spinOn ? spk * hours * 2.2 : 0); // beschleunigte Zeit für Bewegungen
    // ---- Lauf des Motors ----
    // Drehzahl steigt in RT s weich auf WM rad/s; Winkel = Integral davon
    const run = tOn(p.run), RT = 2.5, WM = 7.5, ruT = run == null ? -1 : lt - run, ru = clamp(ruT / RT);
    const flyA = ruT <= 0 ? 0 : ruT < RT ? WM * (Math.pow(ruT, 3) / (RT * RT) - Math.pow(ruT, 4) / (2 * RT * RT * RT)) : WM * (RT / 2 + ruT - RT);
    const shake = ruT > 0 ? (Math.sin(lt * 52) * 1.2 + noise(lt * 30, 4)) * ru : 0;
    // ---- Tür + Überwurf ----
    const [dx0, dy0, dx1, dy1] = ES.door, dW = dx1 - dx0;
    const doorAsked = Array.isArray(p.door) || num(p.door, 0) > 0;
    const lk = p.lock === false ? null : (p.lock == null && doorAsked ? { forced: true } : obj(p.lock)), fT = lk ? tOn(lk.forced, null) : null, forced = fT != null && lt >= fT; // Tür offen ohne lock-Angabe: Schloss schon aufgebrochen
    let gap = clamp(num(p.door, 0)); if (Array.isArray(p.door)) gap = lerp(num(p.door[2], 0), num(p.door[3], 1), E.inOut(prog(lt, num(p.door[0], 0), num(p.door[1], 1))));
    if (lk && !forced) gap = Math.min(gap, .012); // verriegelt: höchstens ein Spalt
    // Tür schwingt nach innen (zur Kamera): freie Kante wandert nach links und wird größer
    const dth = gap * 1.25 + (gap > 0 ? noise(gt * .7, 3) * .006 : 0), kD = 700 / (700 - dW * Math.sin(dth));
    const fe = esWall(dx0 + dW * Math.cos(dth), dy0, kD), fe2 = esWall(dx0 + dW * Math.cos(dth), dy1, kD);
    if (gap > .005) { // Schnee draußen
      c.save(); c.beginPath(); c.rect(dx0, dy0, dx1 - dx0, dy1 - dy0); c.clip();
      snowfall(c, gt, { n: 40, x0: dx0 - 40, x1: dx1 + 40, y0: dy0 - 20, y1: dy1, s0: 1.2, s1: 4.5, v0: 30, v1: 80, alpha: day ? .7 : .55, seed: 14, wind: .5 }); c.restore(); }
    const leaf = [[dx0, dy0], fe, fe2, [dx0, dy1]];
    poly(c, leaf); const lg = c.createLinearGradient(dx0, 0, fe[0], 0); lg.addColorStop(0, day ? '#4b4137' : '#32251a'); lg.addColorStop(1, day ? '#5a4f43' : '#3d2e21'); c.fillStyle = lg; c.fill();
    c.save(); poly(c, leaf); c.clip();
    c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 2; c.beginPath(); for (let k = 1; k < 5; k++) { const u = k / 5, a = [lerp(dx0, fe[0], u), lerp(dy0, fe[1], u)], bb = [lerp(dx0, fe2[0], u), lerp(dy1, fe2[1], u)]; c.moveTo(a[0], a[1]); c.lineTo(bb[0], bb[1]); } c.stroke();
    const ledge = (v, th0) => { const a = [dx0, lerp(dy0, dy1, v)], bb = [fe[0], lerp(fe[1], fe2[1], v)]; c.strokeStyle = day ? '#3a3128' : '#271c13'; c.lineWidth = th0 * lerp(1, kD, .5); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(bb[0], bb[1]); c.stroke(); return [a, bb]; };
    const l1 = ledge(.12, 30), l2 = ledge(.88, 30); ledge(.5, 26);
    c.lineWidth = 24; c.beginPath(); c.moveTo(l2[0][0] + 12, l2[0][1] - 14); c.lineTo(l1[1][0] - 12, l1[1][1] + 14); c.stroke(); // Strebe (Z)
    c.strokeStyle = K.rim.replace(/[\d.]+\)$/, '.25)'); c.lineWidth = 2; c.beginPath(); c.moveTo(l1[0][0], l1[0][1] - 15); c.lineTo(l1[1][0], l1[1][1] - 15); c.stroke();
    c.restore();
    if (gap <= .02) { c.fillStyle = day ? 'rgba(230,234,240,.55)' : 'rgba(120,140,190,.25)'; c.fillRect(dx1 - 2, dy0 + 4, 2.5, dy1 - dy0 - 8); }
    // Überwurf (Haspe) an der freien Kante, Krampe am Rahmen, Vorhängeschloss
    const lockY = ES.lockY, lu = (lockY - dy0) / (dy1 - dy0), fx0 = lerp(fe[0], fe2[0], lu), hp = [fx0 - 40 * (fx0 - dx0) / dW, lerp(fe[1], fe2[1], lu)]; // Gelenk der Haspe auf dem Türblatt
    if (lk) {
      const u = forced ? lt - fT : -1, fresh = fT > 0 && u >= 0 && u < 3;
      // Haspe: geschlossen waagrecht über der Krampe, aufgebrochen hängt sie senkrecht und pendelt aus
      const sw = forced ? (fresh ? Math.exp(-u * 1.6) * Math.sin(u * 7.5) * .55 : 0) + Math.sin(gt * 1.3) * .025 : 0;
      const ang = forced ? Math.PI / 2 - .12 + sw + (fresh ? -1.2 * Math.exp(-u * 9) : 0) : 0;
      if (forced) { // ausgerissene Stelle im Rahmen
        c.fillStyle = day ? '#8a7558' : '#6b5338'; c.beginPath(); c.moveTo(dx1 + 2, lockY - 20); c.lineTo(dx1 + 17, lockY - 12); c.lineTo(dx1 + 14, lockY + 6); c.lineTo(dx1 + 18, lockY + 16); c.lineTo(dx1 + 3, lockY + 22); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(40,25,12,.7)'; c.lineWidth = 1.4; c.beginPath(); for (let k = 0; k < 6; k++) { const y = lockY - 16 + k * 7; c.moveTo(dx1 + 4, y); c.lineTo(dx1 + 14 + hash(k) * 6, y + 3); } c.stroke();
        c.fillStyle = '#0d0a07'; c.fillRect(dx1 + 7, lockY - 9, 3, 5); c.fillRect(dx1 + 7, lockY + 6, 3, 5); // Nagellöcher
      }
      c.save(); c.translate(hp[0], hp[1]); c.scale(1.35, 1.35); c.rotate(ang);
      c.fillStyle = '#2b2723'; rr(c, -6, -9, 64, 18, 4); c.fill(); c.fillStyle = '#16130f'; c.beginPath(); c.arc(0, 0, 6, 0, TAU); c.fill(); // Platte + Gelenk
      c.fillStyle = '#0e0c0a'; rr(c, 36, -5, 14, 10, 2); c.fill(); // Schlitz
      c.strokeStyle = K.rim; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-4, -9); c.lineTo(56, -9); c.stroke();
      // Krampe (bleibt aufgebrochen in der Haspe stecken)
      c.strokeStyle = '#3a3530'; c.lineWidth = 5; c.beginPath(); c.moveTo(39, forced ? -3 : -6); c.lineTo(39, forced ? 10 : 8); c.lineTo(47, forced ? 10 : 8); c.lineTo(47, forced ? -3 : -6); c.stroke();
      // Schloss hängt an der Krampe, pendelt eigenständig
      c.translate(43, forced ? 10 : 8); c.rotate(-ang + (forced ? Math.sin(gt * 1.7 + 1) * .05 + sw * .8 : Math.sin(gt * 1.1) * .02));
      c.strokeStyle = '#4a4640'; c.lineWidth = 6; c.beginPath(); c.arc(0, 14, 12, Math.PI, 0); c.stroke();
      const pg = c.createLinearGradient(-20, 0, 20, 0); pg.addColorStop(0, '#3e3a34'); pg.addColorStop(.4, '#56504a'); pg.addColorStop(1, '#22201c');
      c.fillStyle = pg; rr(c, -20, 14, 40, 36, 7); c.fill(); c.fillStyle = '#0c0b09'; c.beginPath(); c.arc(0, 28, 4, 0, TAU); c.fill(); c.fillRect(-1.5, 28, 3, 11);
      c.strokeStyle = K.rim; c.lineWidth = 1.8; c.beginPath(); c.moveTo(-17, 16); c.lineTo(10, 16); c.stroke();
      c.restore();
      if (fresh && u < .6) { // Splitter fallen
        for (let i = 0; i < 9; i++) { const v = u, x = dx1 + 10 + (hash(i * 2.3) - .5) * 30 + v * (hash(i * 4.1) - .3) * 80, y = lockY + v * 120 + v * v * 900 * (.6 + hash(i) * .6);
          c.fillStyle = day ? 'rgba(170,140,100,.9)' : 'rgba(140,105,70,.9)'; c.fillRect(x, y, 3 + hash(i * 7) * 4, 2); } }
    }
    // ---- Mechaniker (Körper hinter dem Motor) ----
    const mk = p.mechanic === false ? null : (p.mechanic === true || p.mechanic == null ? {} : obj(p.mechanic));
    let mA = 0, mP = MECH[0], mP2 = null, mBl = 0;
    if (mk) { const at = num(mk.at, 0), un = mk.until != null ? num(mk.until, null) : null;
      mA = lt >= at ? (at > 0 ? clamp(prog(lt, at, at + .5)) : 1) * (un != null ? 1 - clamp(prog(lt, un, un + .5)) : 1) : 0; // ohne at: von Anfang an da
      if (spinning) { const q = tl * 1.4, i = Math.floor(q) % 2; mP = MECH[i]; mP2 = MECH[1 - i]; mBl = clamp((q % 1 - .75) / .25); } }
    const hM = 560, mCol = '#070504', mRim = day ? 'rgba(200,205,212,.55)' : 'rgba(255,176,96,.75)', work = tl * 4.4 + Math.sin(tl * 1.1) * 1.5;
    const drawMech = (part) => { if (mA <= 0) return;
      const one = (P, a) => { c.save(); c.globalAlpha = a; if (part === 'body') mechBody(c, P, hM, tl, mCol, mRim, 3); else { mechArm(c, P, hM, tl, mCol, mRim, false, 0); mechArm(c, P, hM, tl, mCol, mRim, true, work); } c.restore(); };
      if (mP2 && mBl > 0) { one(mP, mA * (1 - mBl)); one(mP2, mA * mBl); } else one(mP, mA); };
    drawMech('body');
    // ---- Motor ----
    c.save(); c.translate(shake * .6, shake * .3);
    { const [bx0, by0, bx1, by1] = ES.eb; c.drawImage(smallLayer('esE|' + day + '|' + kind + '|' + tool, bx1 - bx0, by1 - by0, g => esEngine(g, day, kind, tool)), bx0, by0); }
    c.restore();
    if (kind) {
      const [fx, fy, fr] = ES.fly, thW = flyA + (mk && !run ? Math.sin(tl * .6) * .01 : 0);
      c.save(); c.translate(shake, shake * .5);
      // Kurbel + Pleuel hinter dem vorderen Schwungrad (durch die Speichen sichtbar)
      const cp = [fx + Math.cos(thW + 1) * 52, fy + Math.sin(thW + 1) * 52]; c.strokeStyle = '#1b1c18'; c.lineWidth = 22; c.lineCap = 'round'; c.beginPath(); c.moveTo(722, 990); c.lineTo(cp[0], cp[1]); c.stroke();
      c.fillStyle = '#23221e'; c.beginPath(); c.arc(fx, fy, 62, 0, TAU); c.fill();
      flywheel(c, fx, fy, fr, thW, K, K.rim);
      // Riemenscheibe + Flachriemen durch einen Schlitz in der Seitenwand
      const [px, py, pr] = ES.pul, [sx, sy] = ES.slot, dl = Math.hypot(sx - px, sy - py), ux = (sx - px) / dl, uy = (sy - py) / dl, nx = -uy, ny = ux;
      const a1 = Math.atan2(ny, nx), a2 = Math.atan2(-ny, -nx);
      c.save(); c.beginPath(); c.rect(RX, RY, 1060 - RX, RH); c.clip();
      const beltPath = (o) => { c.beginPath(); c.moveTo(sx + nx * (pr * .85 + o), sy + ny * (pr * .85 + o)); c.lineTo(px + nx * (pr + o), py + ny * (pr + o)); c.arc(px, py, pr + o, a1, a2, false); c.lineTo(sx - nx * (pr * .85 + o), sy - ny * (pr * .85 + o)); };
      c.lineJoin = 'round'; c.strokeStyle = '#120c08'; c.lineWidth = 26; beltPath(8); c.stroke(); c.strokeStyle = '#3d2a1c'; c.lineWidth = 20; beltPath(8); c.stroke();
      c.strokeStyle = day ? 'rgba(210,200,185,.4)' : 'rgba(255,180,110,.4)'; c.lineWidth = 2.5; beltPath(-1.5); c.stroke();
      if (ruT > 0) { c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 2; c.setLineDash([3, 22]); c.lineDashOffset = -flyA * pr * .9; beltPath(8); c.stroke(); c.setLineDash([]); } // Nähte laufen mit
      // Riemenschloss läuft mit
      const BL = dl * 2 + Math.PI * pr, pos = mod(flyA * pr * .85 * (fr / pr) * .3 + 140, BL);
      let q; if (pos < dl) q = [sx + nx * pr * .85 + (px + nx * pr - sx - nx * pr * .85) * pos / dl, sy + ny * pr * .85 + (py + ny * pr - sy - ny * pr * .85) * pos / dl];
      else if (pos < dl + Math.PI * pr) { const a = a1 + (pos - dl) / pr; q = [px + Math.cos(a) * pr, py + Math.sin(a) * pr]; }
      else { const v = (pos - dl - Math.PI * pr) / dl; q = [px - nx * pr + (sx - nx * pr * .85 - px + nx * pr) * v, py - ny * pr + (sy - ny * pr * .85 - py + ny * pr) * v]; }
      c.fillStyle = '#8a8378'; c.save(); c.translate(q[0], q[1]); c.rotate(Math.atan2(uy, ux)); c.fillRect(-4, -9, 8, 18); c.restore();
      c.restore();
      c.fillStyle = '#0a0806'; poly(c, [[1046, 300], [1100, 282], [1110, 470], [1052, 484]]); c.fill(); // Schlitz in der Seitenwand
      const pg = c.createLinearGradient(px - pr, py - pr, px + pr, py + pr); pg.addColorStop(0, '#4a443c'); pg.addColorStop(1, '#14110e');
      c.fillStyle = pg; c.beginPath(); c.arc(px, py, pr, 0, TAU); c.fill(); c.fillStyle = '#0f0d0b'; for (let k = 0; k < 4; k++) { const a = thW + k * Math.PI / 2 + .4; c.beginPath(); c.arc(px + Math.cos(a) * pr * .55, py + Math.sin(a) * pr * .55, pr * .17, 0, TAU); c.fill(); }
      c.beginPath(); c.arc(px, py, pr * .2, 0, TAU); c.fill(); c.strokeStyle = K.rim; c.lineWidth = 2.5; c.beginPath(); c.arc(px, py, pr - 1, Math.PI * 1.05, Math.PI * 1.6); c.stroke();
      c.restore();
    }
    drawMech('arms');
    // ---- Laterne (Nacht) ----
    const [lx0, ly0] = ES.lan, fl = .86 + .1 * noise(gt * 8, 44) + .04 * Math.sin(gt * 21) - (spinning ? .2 * Math.abs(noise(tl * 3, 9)) : 0);
    const swa = Math.sin(gt * 1.05) * .04 + noise(gt * .4, 6) * .02 + (run != null ? shake * .004 : 0), lx = lx0 + Math.sin(swa) * 46, ly = ly0;
    c.strokeStyle = '#120c08'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(lx0, 470); c.lineTo(lx, ly - 34); c.stroke(); c.fillStyle = '#18120c'; c.beginPath(); c.arc(lx0, 468, 5, 0, TAU); c.fill();
    lanternBody(c, lx, ly, .78, day ? 0 : fl, -swa * .6);
    // ---- Uhrzeiger ----
    const [ccx, ccy, ccr] = ES.clock, hr = from + hours * spk + (spinOn ? 0 : lt / 3600);
    const hand = (a, L, w, col) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(ccx - Math.cos(a) * L * .18, ccy - Math.sin(a) * L * .18); c.lineTo(ccx + Math.cos(a) * L, ccy + Math.sin(a) * L); c.stroke(); };
    const angM = h0 => mod(h0, 1) * TAU - Math.PI / 2, angH = h0 => mod(h0, 12) / 12 * TAU - Math.PI / 2;
    if (spinning) { const v = hours / Math.max(.1, ct1 - ct0); for (let k = 1; k <= 4; k++) { c.save(); c.globalAlpha = .2 / k * 2; hand(angM(hr - v * .012 * k), ccr * .86, 2.5, '#1f1812'); c.restore(); } }
    hand(angH(hr), ccr * .55, 5, '#1f1812'); hand(angM(hr), ccr * .86, 3, '#1f1812'); c.fillStyle = '#7a6340'; c.beginPath(); c.arc(ccx, ccy, 4.5, 0, TAU); c.fill();
    // ---- Licht / Dunkelheit ----
    const doorOpen = gap > .02 ? { x: (fe[0] + dx1) / 2, y: (dy0 + dy1) / 2 + 80, r: 420 * Math.sqrt(gap), a: day ? .8 : .35, sy: 1.3 } : null;
    const [wx0, wy0, wx1, wy1] = ES.win;
    if (!day) darkMask(c, num(p.dark, .78), [{ x: lx + 40, y: ly + 80, r: 900 * (.95 + .05 * fl), a: .97 * fl, m: .34 }, { x: 620, y: 960, r: 560, a: .45 * fl },
      { x: lx + 220, y: 1300, r: 640, a: .55 * fl, sy: .42 }, { x: ccx, y: ccy, r: 130, a: .5 }, { x: (wx0 + wx1) / 2, y: (wy0 + wy1) / 2, r: 150, a: .3 }, doorOpen]);
    else { const sh = spk * 120; darkMask(c, num(p.dark, .5), [{ x: (wx0 + wx1) / 2, y: 520, r: 520, a: .85, sy: 1.6 }, { x: 640 + sh, y: 1180, r: 700, a: .6, sy: .5 }, { x: 540, y: 820, r: 900, a: .35 }, doorOpen, { x: ccx, y: ccy, r: 140, a: .4 }]); }
    if (!day) { addGlow(c, lx, ly, 380, '255,160,80', .17 * fl); addGlow(c, lx, ly, 80, '255,205,140', .5 * fl); addGlow(c, lx + 200, 1290, 520, '255,150,70', .07 * fl, .3);
      motes(c, gt, lx + 60, ly + 160, 360, 34, 4, .55 * fl); }
    else { // graues Tageslicht: Strahlen durchs Fenster, Staub darin; wandern im Zeitraffer
      const sh = spk * 160; c.save(); c.globalCompositeOperation = 'lighter';
      const gr = c.createLinearGradient(0, wy0, 0, 1350); gr.addColorStop(0, 'rgba(225,230,238,.16)'); gr.addColorStop(1, 'rgba(225,230,238,0)');
      c.fillStyle = gr; c.beginPath(); c.moveTo(wx0, wy0); c.lineTo(wx1, wy0); c.lineTo(wx1 + 260 + sh, 1350); c.lineTo(wx0 - 60 + sh, 1350); c.closePath(); c.fill();
      for (let i = 0; i < 5; i++) { const x = 120 + i * 210 + hash(i * 3.3) * 60, w = 6 + hash(i) * 6, gg = c.createLinearGradient(0, 300, 0, 1300); gg.addColorStop(0, `rgba(225,230,238,${.08 + .05 * hash(i * 5)})`); gg.addColorStop(1, 'rgba(225,230,238,0)');
        c.fillStyle = gg; c.beginPath(); c.moveTo(x, 300 + hash(i * 7) * 200); c.lineTo(x + w, 300 + hash(i * 7) * 200); c.lineTo(x + w * 9 + 120 + sh * .6, 1300); c.lineTo(x + 100 + sh * .6, 1300); c.closePath(); c.fill(); }
      c.restore(); motes(c, gt, 700 + sh * .5, 900, 420, 60, 9, .45, 'soft'); }
    // Mechaniker nach dem Licht erneut als dunkle Silhouette (sonst färbt ihn der Laternenschein braun) – Körper nur oberhalb des Kühltrichters
    if (mA > 0) { c.save(); c.globalAlpha = .82; c.beginPath(); c.rect(RX, RY, RW, 812 - RY); c.rect(RX, 812, 476 - RX, 86); c.clip(); drawMech('body'); c.restore();
      c.save(); c.globalAlpha = .82; drawMech('arms'); c.restore(); }
    if (gap > .02) addGlow(c, (fe[0] + dx1) / 2, dy1 - 60, 220 * Math.sqrt(gap) + 60, day ? '220,226,234' : '110,135,190', (day ? .22 : .12) * Math.sqrt(gap));
    // Staubfäden im Laternenlicht, wenn der Motor läuft
    if (run != null && lt > run && !day) motes(c, gt * 1.6, 700, 900, 300, 30, 13, .35 * ru);
    c.restore();
    // ---- Text „NOTHING TAKEN“ ----
    const tx = p.text; if (tx) { const q = typeof tx === 'string' ? { s: tx } : obj(tx), s = String(q.s || 'NOTHING TAKEN'), at = num(q.at, 1), y = num(q.y, 1352);
      if (q.style === 'stamp') { if (lt >= at) { const k = E.out(prog(lt, at, at + .14)), sc = lerp(1.7, 1, k), [fs, tw] = fitFont(c, s, 'Anton', 96, 780, 6), bw = tw + 80, bh = fs * 1.4;
          const st2 = smallLayer('stamp|' + s + '|' + fs, bw + 20, bh + 20, (g, w, h) => { g.translate(w / 2, h / 2); // Stempel mit abgenutzter Farbe (Abrieb nur im Sprite)
            g.strokeStyle = '#d42a26'; g.lineWidth = 7; rr(g, -tw / 2 - 30, -fs * .62, tw + 60, fs * 1.22, 10); g.stroke(); txt(g, s, 0, fs * .44, `400 ${fs}px Anton`, '#d42a26', 'center', 'alphabetic', 6);
            g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 220; i++) { g.fillStyle = `rgba(0,0,0,${.3 + .5 * hash(i * 1.3)})`; g.fillRect(-w / 2 + hash(i * 2.9) * w, -h / 2 + hash(i * 5.3) * h, 2 + hash(i) * 5, 2 + hash(i * 3) * 3); } });
          c.save(); c.translate(540, y - fs * .35); c.rotate(-.06); c.scale(sc, sc); c.globalAlpha = clamp(k * 1.4) * .92; c.drawImage(st2, -st2.width / 2, -st2.height / 2); c.restore(); } }
      else { const done = typeLine(c, s, 540, y, lt, at, { size: 84, ls: 8, cps: 16, maxW: 800, cursorHold: .9 });
        if (done !== false) { const k = E.out(prog(lt, done + .1, done + .55)), [fs, tw] = fitFont(c, s, 'Elite', 84, 800, 8); c.save(); c.strokeStyle = '#ff3030'; c.lineWidth = 5; glow(c, 'rgba(255,40,40,.9)', 16);
          c.beginPath(); c.moveTo(540 - tw / 2, y + fs * .22); c.lineTo(540 - tw / 2 + tw * k, y + fs * .22); c.stroke(); noGlow(c); c.restore(); } } }
    // ---- Einschub: Schlüsselbrett mit leerem Haken ----
    const kh = p.keyHook; if (kh) { const q = obj(kh), at = num(q.at, 1.2), n = clamp(Math.round(num(q.hooks, 4)), 2, 6), miss = clamp(Math.round(num(q.missing, 1)), 0, n - 1), un = q.until != null ? num(q.until, null) : null;
      if (lt >= at) { const k = E.out(prog(lt, at, at + .6)), ko = un != null ? E.inOut(prog(lt, un, un + .5)) : 0, card = keyBoardCard(n, miss), cw = card.width, chh = card.height;
        fillVis(c, `rgba(0,0,0,${.35 * clamp(k) * (1 - ko)})`);
        const cx = lerp(1500, 545, k) + ko * 1000, cy = num(q.y, 545), rot = lerp(.1, -.025, k) + ko * .1;
        c.save(); c.translate(cx, cy); c.rotate(rot); c.drawImage(card, -cw / 2, -chh / 2);
        const bw = cw - 130, hx = 60 + bw / n * (miss + .5) - cw / 2, hy = 86 + 54 * .55 + 95 - chh / 2;
        redRing(c, hx, hy, 62, 112, lt, at + .7);
        c.restore(); } }
  };

  // =====================================================================
  // 3) school_desk – Dorfschule um 1922, Blick von hinten durch den Mittelgang zur Tafel, ein Platz bleibt leer
  // =====================================================================
  const SC = { f: 880, cx: 540, cy: 690, X: -.3, Y: 1.72, front: 6.8, lw: -2.7, rw: 2.6, ceil: 3.4, seats: [-1.55, -.95, .35, .95], z0: 1.7, dz: 1.0,
    units: [[-1.85, -.65, -.65], [.05, 1.25, .05]], tz: 6.2 }; // units: [x von, x bis, Gangseite]
  const sP = (X, Y, Z) => [SC.cx + SC.f * (X - SC.X) / Z, SC.cy - SC.f * (Y - SC.Y) / Z];
  const scPoly = (g, pts) => poly(g, pts.map(q => sP(q[0], q[1], q[2])));
  const BOARD = { x0: -1.45, x1: 1.55, y0: .92, y1: 2.3 };
  function scRoom(g, win) {
    const { front: Fz, lw, rw, ceil } = SC, nz = .9;
    // Decke, Wände, Boden
    scPoly(g, [[lw, ceil, nz], [rw, ceil, nz], [rw, ceil, Fz], [lw, ceil, Fz]]); g.fillStyle = win ? '#4f4f4e' : '#2c2c2c'; g.fill();
    const cg = g.createLinearGradient(0, RY, 0, sP(0, ceil, Fz)[1]); cg.addColorStop(0, 'rgba(0,0,0,.65)'); cg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = cg; g.fillRect(RX, RY, RW, sP(0, ceil, Fz)[1] - RY);
    const wall = win ? '#74726c' : '#4a4845', wains = win ? '#3b2f25' : '#2a211a';
    scPoly(g, [[lw, 0, Fz], [rw, 0, Fz], [rw, ceil, Fz], [lw, ceil, Fz]]); g.fillStyle = wall; g.fill();
    for (const [x, s] of [[lw, 1], [rw, -1]]) { scPoly(g, [[x, 0, nz], [x, 0, Fz], [x, ceil, Fz], [x, ceil, nz]]); g.fillStyle = win ? (s > 0 ? '#6d6b66' : '#5d5b57') : '#3c3a37'; g.fill(); }
    // Holzvertäfelung unten
    scPoly(g, [[lw, 0, Fz], [rw, 0, Fz], [rw, 1.05, Fz], [lw, 1.05, Fz]]); g.fillStyle = wains; g.fill();
    for (const x of [lw, rw]) { scPoly(g, [[x, 0, nz], [x, 0, Fz], [x, 1.05, Fz], [x, 1.05, nz]]); g.fillStyle = wains; g.fill(); }
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.5; g.beginPath(); for (let X = lw + .3; X < rw; X += .45) { const a = sP(X, 0, Fz), b = sP(X, 1.05, Fz); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); } g.stroke();
    g.fillStyle = win ? '#4a3c2f' : '#2f251d'; scPoly(g, [[lw, 1.05, Fz], [rw, 1.05, Fz], [rw, 1.1, Fz], [lw, 1.1, Fz]]); g.fill();
    const fl = sP(0, 0, Fz)[1], fgr = g.createLinearGradient(0, fl, 0, H - RY); fgr.addColorStop(0, win ? '#3a2f26' : '#241c16'); fgr.addColorStop(1, '#120e0b');
    scPoly(g, [[lw, 0, nz], [rw, 0, nz], [rw, 0, Fz], [lw, 0, Fz]]); g.fillStyle = fgr; g.fill(); g.fillRect(RX, sP(0, 0, nz)[1] - 2, RW, H - RY);
    g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 1.6; g.beginPath(); for (let X = lw; X <= rw; X += .2) { const a = sP(X, 0, Fz), b = sP(X, 0, .7); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); } g.stroke();
    // Fenster: links in der Seitenwand (nur hinten sichtbar) und neben der Tafel
    const sky = (q) => { const gr = g.createLinearGradient(0, q[0][1], 0, q[3][1]); gr.addColorStop(0, win ? '#d3d6d9' : '#1d222b'); gr.addColorStop(1, win ? '#a9afb5' : '#141820'); return gr; };
    if (win) for (const [z0, z1] of [[1.8, 2.9], [3.5, 4.6], [5.2, 6.3]]) {
      const q = [[lw, 3.05, z0], [lw, 3.05, z1], [lw, .95, z1], [lw, .95, z0]].map(v => sP(...v)); poly(g, q); g.fillStyle = sky([q[0], q[1], q[2], q[3]]); g.fill();
      g.strokeStyle = '#3e3a33'; g.lineWidth = 5; g.beginPath(); const m0 = sP(lw, 3.05, (z0 + z1) / 2), m1 = sP(lw, .95, (z0 + z1) / 2); g.moveTo(m0[0], m0[1]); g.lineTo(m1[0], m1[1]);
      for (const y of [1.65, 2.35]) { const a = sP(lw, y, z0), b = sP(lw, y, z1); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); } g.stroke(); poly(g, q); g.lineWidth = 8; g.stroke(); }
    { const q = [[-2.42, 2.95, Fz], [-1.82, 2.95, Fz], [-1.82, 1.0, Fz], [-2.42, 1.0, Fz]].map(v => sP(...v)); g.fillStyle = '#2f2a24'; g.fillRect(q[0][0] - 9, q[0][1] - 9, q[1][0] - q[0][0] + 18, q[2][1] - q[0][1] + 18);
      poly(g, q); g.fillStyle = sky(q); g.fill();
      if (win) { g.fillStyle = 'rgba(70,78,88,.55)'; g.beginPath(); g.moveTo(q[3][0], q[3][1] - 40); for (let i = 0; i <= 8; i++) g.lineTo(lerp(q[3][0], q[2][0], i / 8), q[3][1] - 46 - 18 * hash(i * 3.1) - (i === 4 ? 40 : 0)); g.lineTo(q[2][0], q[2][1]); g.lineTo(q[3][0], q[3][1]); g.fill(); } // Dächer, Kirchturm
      g.strokeStyle = '#2f2a24'; g.lineWidth = 6; g.beginPath(); g.moveTo((q[0][0] + q[1][0]) / 2, q[0][1]); g.lineTo((q[0][0] + q[1][0]) / 2, q[2][1]); for (const k of [.33, .66]) { g.moveTo(q[0][0], lerp(q[0][1], q[3][1], k)); g.lineTo(q[1][0], lerp(q[0][1], q[3][1], k)); } g.stroke(); }
    // Tafel mit Rahmen, Kreideablage, verwischten Resten
    const b0 = sP(BOARD.x0, BOARD.y1, Fz), b1 = sP(BOARD.x1, BOARD.y0, Fz);
    g.fillStyle = '#3a2c20'; g.fillRect(b0[0] - 12, b0[1] - 12, b1[0] - b0[0] + 24, b1[1] - b0[1] + 24);
    const bg = g.createLinearGradient(b0[0], b0[1], b1[0], b1[1]); bg.addColorStop(0, '#26302b'); bg.addColorStop(1, '#1a211e'); g.fillStyle = bg; g.fillRect(b0[0], b0[1], b1[0] - b0[0], b1[1] - b0[1]);
    for (let i = 0; i < 14; i++) { g.save(); g.translate(b0[0] + hash(i * 3.3) * (b1[0] - b0[0]), b0[1] + hash(i * 5.9) * (b1[1] - b0[1])); g.scale(1, .35); spot(g, 0, 0, 40 + hash(i) * 70, 'rgba(200,205,200,A)', .05 + .05 * hash(i * 7)); g.restore(); }
    g.fillStyle = '#3a2c20'; g.fillRect(b0[0] - 16, b1[1] + 8, b1[0] - b0[0] + 32, 7); g.fillStyle = '#d9d6cc'; g.fillRect(b0[0] + 40, b1[1] + 4, 14, 4); g.fillRect(b0[0] + 70, b1[1] + 5, 9, 3);
    g.fillStyle = 'rgba(220,220,212,.25)'; g.fillRect(b1[0] - 60, b1[1] + 2, 34, 7); // Schwamm
    // Kreuz über der Tafel, Landkarte, Ofen in der Ecke
    { const [x, y] = sP(1.05, 2.78, Fz), s = SC.f / Fz; g.fillStyle = '#1c1611'; g.fillRect(x - .035 * s, y - .28 * s, .07 * s, .5 * s); g.fillRect(x - .16 * s, y - .17 * s, .32 * s, .065 * s);
      g.strokeStyle = 'rgba(60,70,50,.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - .05 * s, y - .25 * s); g.quadraticCurveTo(x - .2 * s, y - .33 * s, x - .28 * s, y - .28 * s); g.moveTo(x - .05 * s, y - .22 * s); g.quadraticCurveTo(x - .18 * s, y - .2 * s, x - .25 * s, y - .15 * s); g.stroke(); }
    { const q0 = sP(1.78, 2.42, Fz), q1 = sP(2.48, 1.32, Fz); g.fillStyle = '#2a2219'; g.fillRect(q0[0] - 4, q0[1] - 8, q1[0] - q0[0] + 8, 8); g.fillRect(q0[0] - 4, q1[1], q1[0] - q0[0] + 8, 6);
      g.fillStyle = win ? '#b4aa90' : '#5d5748'; g.fillRect(q0[0], q0[1], q1[0] - q0[0], q1[1] - q0[1]);
      g.fillStyle = win ? 'rgba(110,130,95,.55)' : 'rgba(60,70,52,.6)'; g.beginPath(); g.moveTo(q0[0] + 12, q0[1] + 20); for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; g.lineTo((q0[0] + q1[0]) / 2 + Math.cos(a) * (28 + hash(i * 2.9) * 14), (q0[1] + q1[1]) / 2 + Math.sin(a) * (38 + hash(i * 4.1) * 14)); } g.closePath(); g.fill();
      g.strokeStyle = 'rgba(90,80,140,.35)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(q0[0] + 20, q0[1] + 60); g.bezierCurveTo(q0[0] + 50, q0[1] + 50, q0[0] + 60, q0[1] + 100, q1[0] - 18, q1[1] - 30); g.stroke(); }
    { const z0 = 5.95, X0 = 1.95, X1 = 2.5; scPoly(g, [[X0, 0, z0], [X1, 0, z0], [X1, 1.25, z0], [X0, 1.25, z0]]); g.fillStyle = '#16171a'; g.fill();
      const t0 = sP(X0, 1.25, z0), t1 = sP(X1, 1.25, z0); g.fillStyle = '#232428'; g.fillRect(t0[0] - 3, t0[1] - 8, t1[0] - t0[0] + 6, 10);
      const d0 = sP(X0 + .15, .7, z0), d1 = sP(X0 + .42, .35, z0); g.fillStyle = '#0c0c0e'; g.fillRect(d0[0], d0[1], d1[0] - d0[0], d1[1] - d0[1]);
      const pp = sP(2.22, 1.25, z0 + .3), pt = sP(2.22, 2.6, z0 + .3); g.fillStyle = '#1b1c1f'; g.fillRect(pp[0] - 6, pt[1], 12, pp[1] - pt[1]); g.fillRect(pp[0] - 6, pt[1] - 4, 60, 10); }
    // Garderobe an der rechten Wand: Haken, Mäntel, ein Ranzen
    for (let i = 0; i < 5; i++) { const z = 1.9 + i * .75, [hx, hy] = sP(rw, 1.6, z), s = SC.f / z; g.fillStyle = '#1a1714'; g.beginPath(); g.arc(hx, hy, Math.max(2, .025 * s), 0, TAU); g.fill();
      if (i % 2 === 0 || i === 3) { g.fillStyle = i === 3 ? '#2c2a26' : '#24221f'; g.beginPath(); g.moveTo(hx - .02 * s, hy); g.quadraticCurveTo(hx - .16 * s, hy + .3 * s, hx - .12 * s, hy + .78 * s); g.lineTo(hx + .06 * s, hy + .8 * s); g.quadraticCurveTo(hx + .04 * s, hy + .3 * s, hx + .02 * s, hy); g.fill(); } }
    // Rückwand-Schatten nahe der Kamera
    const sh = g.createLinearGradient(0, sP(0, 0, 2.2)[1], 0, H - RY); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = sh; g.fillRect(RX, sP(0, 0, 2.2)[1], RW, H - RY);
  }
  // Schulbank-Einheit (Bank + Pult, zwei Plätze) für Reihe zr; part: 'back' (vor den Kindern) oder 'front' (Lehne + Wange, nach den Kindern)
  function benchUnit(c, xa, xb, zr, part, win, aisleSide) {
    const top = win ? '#4d3d2f' : '#33281f', edge = win ? '#2e241b' : '#1e1812', dark = '#150f0b', lit = win ? 'rgba(220,225,232,.22)' : 'rgba(255,200,140,.1)';
    if (part === 'back') {
      scPoly(c, [[xa, .62, zr + .32], [xb, .62, zr + .32], [xb, .71, zr + .76], [xa, .71, zr + .76]]); c.fillStyle = top; c.fill();
      scPoly(c, [[xa, .62, zr + .32], [xb, .62, zr + .32], [xb, .57, zr + .32], [xa, .57, zr + .32]]); c.fillStyle = edge; c.fill();
      scPoly(c, [[xa, .57, zr + .34], [xb, .57, zr + .34], [xb, .44, zr + .5], [xa, .44, zr + .5]]); c.fillStyle = dark; c.fill(); // Fach
      const a = sP(xa, .62, zr + .32), b = sP(xb, .62, zr + .32); c.strokeStyle = lit; c.lineWidth = 1.5; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
      const n = Math.round((xb - xa) / .6); for (let i = 0; i < n; i++) { const X = xa + (i + .5) * (xb - xa) / n + (i % 2 ? .16 : -.16), [ix, iy] = sP(X, .705, zr + .68), s = SC.f / (zr + .68); // eingelassenes Tintenfass (Messingdeckel)
        c.fillStyle = '#2a2219'; c.beginPath(); c.ellipse(ix, iy, .024 * s, .009 * s, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(190,160,100,.35)'; c.beginPath(); c.ellipse(ix - .006 * s, iy - .002 * s, .012 * s, .004 * s, 0, 0, TAU); c.fill(); }
      scPoly(c, [[xa, .42, zr - .12], [xb, .42, zr - .12], [xb, .42, zr + .16], [xa, .42, zr + .16]]); c.fillStyle = top; c.fill();
      scPoly(c, [[xa, .42, zr - .12], [xb, .42, zr - .12], [xb, .38, zr - .12], [xa, .38, zr - .12]]); c.fillStyle = edge; c.fill();
    } else {
      scPoly(c, [[xa, .6, zr - .16], [xb, .6, zr - .16], [xb, .71, zr - .17], [xa, .71, zr - .17]]); c.fillStyle = edge; c.fill(); // Rückenlehne
      const a = sP(xa, .71, zr - .17), b = sP(xb, .71, zr - .17); c.strokeStyle = lit; c.lineWidth = 2; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke();
      // Seitenwange an der Gangseite (geschwungenes Profil)
      const X = aisleSide, pr = [[-.24, 0], [.8, 0], [.8, .07], [.68, .07], [.68, .66], [.54, .7], [.52, .14], [.12, .14], [.1, .44], [-.06, .46], [-.14, .74], [-.2, .74], [-.16, .44], [-.16, .07], [-.24, .07]];
      scPoly(c, pr.map(q => [X, q[1], zr + q[0]])); c.fillStyle = edge; c.fill();
      const t0 = sP(X, .74, zr - .17), t1 = sP(X, .74, zr - .2), d0 = sP(X, .7, zr + .54), d1 = sP(X, .66, zr + .68); c.strokeStyle = lit; c.lineWidth = 1.5; c.beginPath(); c.moveTo(t0[0], t0[1]); c.lineTo(t1[0], t1[1]); c.moveTo(d0[0], d0[1]); c.lineTo(d1[0], d1[1]); c.stroke();
    }
  }
  // Kind von hinten, sitzend; (x,y) = Sitzfläche, s = px je Meter; o: hair 0..2, seed, turn (−1..1), write (0..1)
  function kidBack(c, x, y, s, t, o) {
    const sd = o.seed, br = Math.sin(t * 1.6 + sd * 2.1) * .004, tilt = noise(t * .25, sd) * .02 + (o.turn || 0) * .035, wr = o.write ? Math.sin(t * 7 + sd) * .006 : 0;
    const X = v => x + v * s, Y = v => y - v * s, col = o.col, rim = o.rim;
    const body = (dx, dy, cl) => { c.fillStyle = cl; c.beginPath();
      c.moveTo(X(-.15) + dx, Y(0) + dy); c.bezierCurveTo(X(-.165) + dx, Y(.2) + dy, X(-.17) + dx, Y(.36) + dy, X(-.155 + wr) + dx, Y(.44 + br) + dy);
      c.quadraticCurveTo(X(-.15 + wr) + dx, Y(.5 + br) + dy, X(-.06) + dx, Y(.52 + br) + dy); c.lineTo(X(.06) + dx, Y(.52 + br) + dy);
      c.quadraticCurveTo(X(.15 - wr) + dx, Y(.5 + br) + dy, X(.155 - wr) + dx, Y(.44 + br) + dy); c.bezierCurveTo(X(.17) + dx, Y(.36) + dy, X(.165) + dx, Y(.2) + dy, X(.15) + dx, Y(0) + dy); c.closePath();
      c.moveTo(X(-.035) + dx, Y(.5 + br) + dy); c.lineTo(X(-.03) + dx, Y(.58 + br) + dy); c.lineTo(X(.03) + dx, Y(.58 + br) + dy); c.lineTo(X(.035) + dx, Y(.5 + br) + dy); c.closePath(); // Hals
      const hx = X(tilt * 1.6) + dx, hy = Y(.64 + br) + dy, r = .085 * s;
      c.moveTo(hx + r, hy); c.ellipse(hx, hy, r * .98, r * 1.06, tilt, 0, TAU);
      c.fill();
      if (o.hair === 1) { // Zöpfe: einer mittig oder zwei über die Schultern nach vorn (von hinten nur der Ansatz sichtbar)
        if (sd % 2) { c.beginPath(); c.moveTo(hx - r * .2, hy + r * .7); c.quadraticCurveTo(hx - r * .3 + tilt * s * .2, hy + r * 1.9, hx - r * .08 + tilt * s * .4, hy + r * 3.1); c.lineTo(hx + r * .16 + tilt * s * .4, hy + r * 3.05); c.quadraticCurveTo(hx + r * .3 + tilt * s * .2, hy + r * 1.9, hx + r * .2, hy + r * .7); c.fill(); }
        else for (const sg of [-1, 1]) { c.beginPath(); c.moveTo(hx + sg * r * .55, hy + r * .5); c.quadraticCurveTo(hx + sg * r * 1.05, hy + r * 1.2, hx + sg * r * 1.25, hy + r * 1.9); c.lineTo(hx + sg * r * 1.0, hy + r * 1.95); c.quadraticCurveTo(hx + sg * r * .8, hy + r * 1.3, hx + sg * r * .3, hy + r * .6); c.fill(); }
      } else if (o.hair === 2) { c.beginPath(); c.arc(hx, hy - r * .1, r * 1.12, Math.PI * .85, Math.PI * 2.15); c.lineTo(hx + r * 1.05, hy + r * .55); c.lineTo(hx - r * 1.05, hy + r * .55); c.fill(); } // Bubikopf
      else { c.beginPath(); c.ellipse(hx - r * .98, hy + r * .05, r * .2, r * .3, 0, 0, TAU); c.ellipse(hx + r * .98, hy + r * .05, r * .2, r * .3, 0, 0, TAU); c.fill(); } // Ohren
      // Arme (Ellbogen nach vorn aufs Pult)
      c.lineCap = 'round'; c.strokeStyle = cl; c.lineWidth = .075 * s;
      for (const sg of [-1, 1]) { c.beginPath(); c.moveTo(X(sg * .14) + dx, Y(.46 + br) + dy); c.quadraticCurveTo(X(sg * .2) + dx, Y(.36) + dy, X(sg * (.18 - (o.write && sg > 0 ? wr * 3 : 0))) + dx, Y(.26 + (o.write && sg > 0 ? .02 : 0)) + dy); c.stroke(); }
      return [hx, hy, r];
    };
    if (rim) body(-1.8, -.8, rim);
    const h = body(0, 0, col);
    if (o.hair === 1 && sd % 2) { c.fillStyle = o.ribbon || 'rgba(70,50,50,.7)'; c.beginPath(); c.ellipse(h[0] + h[2] * .04 + tilt * s * .4, h[1] + h[2] * 2.95, h[2] * .26, h[2] * .1, 0, 0, TAU); c.fill(); } // eine dunkle Schleife
  }
  function teacherBack(c, x, y, h, t, o) { // Lehrer von hinten: Anzug, kurzes Haar; o.write (0..1): rechter Arm an der Tafel; o.reach: Handhöhe (px) beim Schreiben
    const X = v => x + v * h, Y = v => y - v * h, col = o.col, sw = noise(t * .4, 5) * .004, wr = o.write || 0;
    c.save(); c.fillStyle = col; c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); // Beine
    c.moveTo(X(-.075), Y(0)); c.lineTo(X(-.065), Y(.46)); c.lineTo(X(.065), Y(.46)); c.lineTo(X(.075), Y(0)); c.lineTo(X(.018), Y(0)); c.lineTo(X(.006), Y(.38)); c.lineTo(X(-.006), Y(.38)); c.lineTo(X(-.018), Y(0)); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(X(-.13 + sw), Y(.45)); c.bezierCurveTo(X(-.135 + sw), Y(.62), X(-.14 + sw), Y(.74), X(-.115 + sw), Y(.8)); c.quadraticCurveTo(X(-.08 + sw), Y(.83), X(-.04 + sw), Y(.835));
    c.lineTo(X(.04 + sw), Y(.835)); c.quadraticCurveTo(X(.08 + sw), Y(.83), X(.115 + sw), Y(.8)); c.bezierCurveTo(X(.14 + sw), Y(.74), X(.135 + sw), Y(.62), X(.13 + sw), Y(.45)); c.closePath(); c.fill(); // Sakko
    c.beginPath(); c.ellipse(X(sw * 1.3), Y(.905), h * .056, h * .068, 0, 0, TAU); c.fill(); // Kopf
    c.lineWidth = h * .05;
    c.beginPath(); c.moveTo(X(-.11 + sw), Y(.79)); c.quadraticCurveTo(X(-.15), Y(.62), X(-.13 + Math.sin(t * .8) * .01), Y(.47)); c.stroke(); // linker Arm hängt
    const tg = o.hand || [X(.3), Y(.95)];
    const hx = lerp(X(.14), tg[0], wr) + (wr > 0 ? Math.sin(t * 9) * h * .008 * wr : 0), hy = lerp(Y(.47), tg[1], wr) + (wr > 0 ? Math.sin(t * 13) * h * .006 * wr : 0);
    c.beginPath(); c.moveTo(X(.11 + sw), Y(.79)); c.quadraticCurveTo(lerp(X(.15), X(.2), wr), lerp(Y(.62), Y(.88), wr), hx, hy); c.stroke();
    if (o.pointer && wr < .5) { c.lineWidth = 2.5; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx - h * .32, hy - h * .42); c.stroke(); }
    c.restore();
    return [hx, hy];
  }
  SCENES.school_desk = (c, lt, b, gt) => {
    const p = b.p || {};
    const win = p.window !== false, rows = clamp(Math.round(num(p.rows, 3)), 1, 4);
    const em = p.empty === false ? null : { row: 1, col: 1, ...obj(p.empty) }, er = em ? clamp(Math.round(num(em.row, 1)), 0, rows - 1) : -1, ec = em ? clamp(Math.round(num(em.col, 1)), 0, 3) : -1;
    blit(c, layer('sc|' + win, g => scRoom(g, win)));
    const sp = sprite('soft');
    // Schnee hinter dem Fenster neben der Tafel
    { const q0 = sP(-2.42, 2.95, SC.front), q1 = sP(-1.82, 1.0, SC.front); c.save(); c.beginPath(); c.rect(q0[0], q0[1], q1[0] - q0[0], q1[1] - q0[1]); c.clip();
      snowfall(c, gt, { n: 18, x0: q0[0] - 20, x1: q1[0] + 20, y0: q0[1], y1: q1[1], s0: 1, s1: 2.6, v0: 18, v1: 40, alpha: win ? .7 : .4, seed: 31 }); c.restore(); }
    // ---- Kreide an der Tafel ----
    const Fz = SC.front, b0 = sP(BOARD.x0, BOARD.y1, Fz), b1 = sP(BOARD.x1, BOARD.y0, Fz), bw = b1[0] - b0[0], bh = b1[1] - b0[1];
    const chalk = typeof p.chalk === 'string' ? p.chalk.trim() : '', cAt = num(p.chalkAt, .5), cps = num(p.chalkSpeed, 8);
    let pen = null, wb = 0; // Kreidespitze (Bildpunkt) und Anteil „Lehrer schreibt“
    if (chalk) {
      const lines = chalk.includes('|') ? chalk.split('|').map(s => s.trim()) : wrap(c, chalk, bw - 60, '700 56px Caveat');
      let fs = 56; c.font = `700 ${fs}px Caveat`; const mw = Math.max(...lines.map(l => c.measureText(l).width)); if (mw > bw - 60) fs = Math.max(30, Math.floor(fs * (bw - 60) / mw));
      fs = Math.min(fs, Math.floor((bh - 30) / (lines.length * 1.05)));
      const font = `700 ${fs}px Caveat`, total = lines.reduce((s, l) => s + l.length, 0), tEnd = cAt + total / cps; c.font = font;
      let shown = lt < cAt ? 0 : Math.min(total, (lt - cAt) * cps);
      const y0 = b0[1] + (bh - lines.length * fs * 1.05) / 2 + fs * .82;
      lines.forEach((l, i) => { const w = c.measureText(l).width, x0 = b0[0] + 30, y = y0 + i * fs * 1.05, k = clamp(shown / Math.max(1, l.length)); shown -= l.length;
        if (pen == null || k > 0) pen = [x0 + w * k, y - fs * .3];
        if (k <= 0) return; c.save(); c.beginPath(); c.rect(x0 - 10, y - fs, w * k + 10, fs * 1.4); c.clip();
        c.globalAlpha = .9; txt(c, l, x0, y, font, '#e4e4da', 'left'); c.globalAlpha = .25; txt(c, l, x0 + 1.2, y + .8, font, '#ffffff', 'left'); c.restore(); });
      wb = E.inOut(clamp((lt - (cAt - .5)) / .45)) * (1 - E.inOut(clamp((lt - tEnd - .15) / .7)));
    }
    // ---- Lehrer ----
    if (p.teacher !== false) {
      const th = SC.f * 1.68 / SC.tz, idle = sP(BOARD.x1 + .3, 0, SC.tz)[0];
      const tx = pen ? lerp(idle, pen[0] - th * .17, wb) : idle, [, ty] = sP(0, 0, SC.tz);
      c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(tx, ty, th * .16, th * .03, 0, 0, TAU); c.fill();
      teacherBack(c, tx, ty, th, gt, { col: win ? '#15161a' : '#0b0b0d', write: wb, hand: pen, pointer: wb < .3 });
    }
    // ---- Reihen von hinten nach vorn: Pult/Bank, Kinder, Lehne/Wange ----
    const rim = win ? 'rgba(200,210,226,.55)' : 'rgba(255,190,130,.28)', kc = win ? '#191b21' : '#0e0f12';
    const ringT = tOn(p.ring);
    let emptyPos = null;
    for (let r = rows - 1; r >= 0; r--) {
      const zr = SC.z0 + r * SC.dz;
      for (const [xa, xb] of SC.units) benchUnit(c, xa, xb, zr, 'back', win);
      SC.seats.forEach((X, ci) => {
        const [sx, sy] = sP(X, .42, zr), s = SC.f / zr;
        if (r === er && ci === ec) { // leerer Platz: Schiefertafel, Griffel, Schwamm am Faden
          const q = [[X - .17, .633, zr + .38], [X + .17, .633, zr + .38], [X + .17, .67, zr + .58], [X - .17, .67, zr + .58]].map(v => sP(...v));
          poly(c, q); c.fillStyle = '#6e5133'; c.fill();
          const qi = [[X - .15, .636, zr + .395], [X + .15, .636, zr + .395], [X + .15, .668, zr + .565], [X - .15, .668, zr + .565]].map(v => sP(...v)); poly(c, qi); c.fillStyle = '#25292b'; c.fill();
          c.strokeStyle = 'rgba(220,222,215,.45)'; c.lineWidth = 1.2; c.beginPath(); for (let k = 0; k < 3; k++) { const a = sP(X - .12, .645 + k * .008, zr + .43 + k * .04), bb = sP(X + .1, .645 + k * .008, zr + .43 + k * .04); c.moveTo(a[0], a[1]); for (let j = 1; j <= 8; j++) { const u = j / 8; c.lineTo(lerp(a[0], bb[0], u), lerp(a[1], bb[1], u) - (j % 2 ? 3 : 0) * s / 300); } } c.stroke();
          const g1 = sP(X + .22, .64, zr + .42), g2 = sP(X + .3, .645, zr + .5); c.strokeStyle = '#cfcbbf'; c.lineWidth = Math.max(2, s * .012); c.beginPath(); c.moveTo(g1[0], g1[1]); c.lineTo(g2[0], g2[1]); c.stroke();
          const fa = sP(X - .17, .62, zr + .34), swg = Math.sin(gt * 1.4) * .02; c.strokeStyle = 'rgba(200,195,180,.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(fa[0], fa[1]); c.lineTo(fa[0] + swg * s, fa[1] + .12 * s); c.stroke();
          c.fillStyle = '#8c8668'; c.beginPath(); c.ellipse(fa[0] + swg * s, fa[1] + .13 * s, .025 * s, .018 * s, 0, 0, TAU); c.fill();
          emptyPos = [sP(X, .52, zr + .2), s]; return; }
        const sd = r * 4 + ci + 1, h = hash(sd * 3.7), hair = h < .45 ? 1 : h < .65 ? 2 : 0;
        let turn = 0; if (ringT != null && r === er && Math.abs(ci - ec) === 1) turn = (ci < ec ? 1 : -1) * E.inOut(prog(lt, ringT + .6, ringT + 2.2)); // Nachbarn schauen zum leeren Platz
        kidBack(c, sx, sy, s, gt, { seed: sd, hair, col: kc, rim, write: hash(sd * 1.9) > .62, turn, ribbon: win ? 'rgba(88,62,62,.75)' : 'rgba(60,44,40,.7)' });
      });
      for (const [xa, xb, ai] of SC.units) benchUnit(c, xa, xb, zr, 'front', win, ai);
    }
    // ---- Licht ----
    if (win) { // graues Morgenlicht: breite Bahnen von links, eine fällt auf den leeren Platz
      const br = .85 + .15 * noise(gt * .3, 2);
      c.save(); c.globalCompositeOperation = 'lighter';
      const shaft = (x0, y0, x1, y1, w0, w1, a) => { const gr = c.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, `rgba(210,218,230,${a * br})`); gr.addColorStop(1, 'rgba(210,218,230,0)');
        const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L; c.fillStyle = gr; c.beginPath(); c.moveTo(x0 + nx * w0, y0 + ny * w0); c.lineTo(x1 + nx * w1, y1 + ny * w1); c.lineTo(x1 - nx * w1, y1 - ny * w1); c.lineTo(x0 - nx * w0, y0 - ny * w0); c.closePath(); c.fill(); };
      shaft(-120, 470, 620, 1060, 70, 150, .07); shaft(-160, 700, 420, 1350, 90, 200, .06);
      if (emptyPos) { const [[ex, ey]] = emptyPos; shaft(-140, ey - 520, ex + 10, ey + 20, 60, 90, .1); addGlow(c, ex, ey + 6, 120, '220,226,236', .1 * br, .5); }
      c.restore(); motes(c, gt, 360, 860, 380, 46, 21, .32, 'soft', 1.3);
    } else { for (const X of [-1.45, 1.05]) { const [x, y] = sP(X, 2.75, 2.5); addGlow(c, x, y + 20, 260, '255,190,120', .12); } }
    // Hängelampen (vorn, angeschnitten)
    for (const X of [-1.45, 1.05]) { const [x, y] = sP(X, 2.75, 2.5), [, yt] = sP(X, SC.ceil, 2.5); c.strokeStyle = '#0d0d0f'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, yt); c.lineTo(x, y - 20); c.stroke();
      c.fillStyle = '#1b1c1f'; c.beginPath(); c.moveTo(x - 62, y + 22); c.quadraticCurveTo(x, y - 40, x + 62, y + 22); c.closePath(); c.fill(); c.fillStyle = win ? '#6c6a64' : '#d9b27a'; c.beginPath(); c.ellipse(x, y + 22, 62, 9, 0, 0, Math.PI); c.fill(); }
    // ---- roter Ring um den leeren Platz ----
    if (emptyPos && ringT != null) { const [[ex, ey], s] = emptyPos; redRing(c, ex, ey, s * .44, s * .27, lt, ringT); }
    // ---- Text ----
    const tx = p.text; if (tx) { const q = typeof tx === 'string' ? { s: tx } : obj(tx), s = String(q.s || 'SATURDAY, 1 APRIL · CÄZILIA, 7 · ABSENT'), at = num(q.at, .6);
      const parts = s.split(/\s*[·|]\s*/).filter(Boolean), y0 = num(q.y, 395), cps = 22;
      if (lt >= at) { c.save(); c.translate(540, y0 + (parts.length - 1) * 34 - 18); c.scale(1, (parts.length * 68 + 40) / 900); spot(c, 0, 0, 520, 'rgba(0,0,0,A)', .55 * clamp((lt - at) / .3)); c.restore(); } // dunkles Polster hinter dem Text
      let t0 = at; parts.forEach((ln, i) => { const last = i === parts.length - 1 && parts.length > 1 && q.red !== false;
        const done = typeLine(c, ln.toUpperCase(), 540, y0 + i * 68, lt, t0, { size: last ? 64 : 54, ls: 5, cps, maxW: 860, col: last ? '#ff4a42' : '#f6f3ec', glowCol: last ? 'rgba(255,40,40,.75)' : null, cursor: i === parts.length - 1 });
        t0 = done !== false ? done + .25 : t0 + ln.length / cps + .25; }); }
  };

  // =====================================================================
  // 4) demolition – Februar 1923: Wohnhaus + Stadel unter einem Dach werden abgerissen (graues Winterlicht)
  // =====================================================================
  // Welt: X entlang des Hauses (−30 Stadelende … 0 Giebel Wohnteil), Z Tiefe (0 Traufseite vorn … 10 hinten), Y Höhe
  const DM = { x: 4.5, y: 2.6, z: -8.5, a: .58, f: 820, cx: 775, cy: 860 }, DC = Math.cos(DM.a), DS = Math.sin(DM.a);
  const HB = { L: 30, D: 10, hw: 5.4, hr: 8.6, ov: .6, res: -11 };
  function dP(X, Y, Z) { const dx = X - DM.x, dz = Z - DM.z, xc = dx * DC + dz * DS, zc = Math.max(.5, -dx * DS + dz * DC); return [DM.cx + DM.f * xc / zc, DM.cy - DM.f * (Y - DM.y) / zc]; }
  const dScale = (X, Y, Z) => { const dx = X - DM.x, dz = Z - DM.z; return DM.f / Math.max(.5, -dx * DS + dz * DC); };
  const roofY = Z => Z <= 5 ? HB.hw + (Z / 5) * (HB.hr - HB.hw) : HB.hw + ((10 - Z) / 5) * (HB.hr - HB.hw); // Dachfläche über Z
  const ordX = X => clamp((X + 30) / 30); // 0 = Stadelende, 1 = Giebel
  let DEMO = null;
  function demoBuild() { // alle Bauteile einmal projizieren: {pts, col, thr, k (Art), w (Linie)}
    const E2 = { back: [], inside: [], gable: [], boards: [], roof: [], tiles: [] }, P = (X, Y, Z) => dP(X, Y, Z);
    const q = (a, b, c2, d) => { const r = [P(...a), P(...b), P(...c2), P(...d)]; r.w = [0, 1, 2].map(k => (a[k] + b[k] + c2[k] + d[k]) / 4); return r; }; // .w = Weltmittelpunkt (für das Herabfallen)
    const xs = []; for (let X = -30.6; X < .6 - 1e-6; X += 1.2) xs.push([X, Math.min(.6, X + 1.2)]);
    const bands = [0, .25, .5, .75, 1];
    const zOf = (u, back) => back ? lerp(10 + HB.ov, 5, u) : lerp(-HB.ov, 5, u); // Traufe → First
    const yOf = (u) => lerp(HB.hw - HB.ov * .64, HB.hr, u);
    const workers = X => X > -8.5 && X < -1.2; // dort früh geöffnet
    xs.forEach(([x0, x1], i) => { const xm = (x0 + x1) / 2, o = ordX(xm);
      for (let j = 0; j < 4; j++) { const u0 = bands[j], u1 = bands[j + 1];
        const thrF = workers(xm) ? .02 + .08 * hash(i * 3.1 + j) : .04 + .3 * (.62 * o + .38 * hash(i * 5.3 + j * 1.7));
        const snow = hash(i * 2.3 + j * 7.1) < (j === 3 ? .75 : .42);
        const tile = { k: 'tile', pts: q([x0, yOf(u0), zOf(u0)], [x1, yOf(u0), zOf(u0)], [x1, yOf(u1), zOf(u1)], [x0, yOf(u1), zOf(u1)]), thr: thrF, snow, sd: i * 4 + j };
        E2.roof.push(tile); (E2.tiles[i] = E2.tiles[i] || [])[j] = tile;
        E2.roof.push({ k: 'batten', pts: [0, 1, 2].map(m => { const u = lerp(u0, u1, (m + .5) / 3); return [P(x0, yOf(u) + .04, zOf(u)), P(x1, yOf(u) + .04, zOf(u))]; }), thr: thrF + .14 + .05 * hash(i + j * 9) });
        E2.back.push({ k: 'under', pts: q([x0, yOf(u0) - .05, zOf(u0, 1)], [x1, yOf(u0) - .05, zOf(u0, 1)], [x1, yOf(u1) - .05, zOf(u1, 1)], [x0, yOf(u1) - .05, zOf(u1, 1)]), thr: thrF + .1 + .06 * hash(i * 7 + j) }); }
    });
    for (let X = -30.4; X <= .45; X += 1.2) { const o = ordX(X), thr = (X > -8.5 && X < -1.2 ? .5 : .4) + .2 * o + .06 * hash(X * 3.3);
      E2.roof.push({ k: 'rafter', pts: q([X - .07, yOf(0) + .02, zOf(0)], [X + .07, yOf(0) + .02, zOf(0)], [X + .07, HB.hr + .02, 5], [X - .07, HB.hr + .02, 5]), thr, X });
      E2.back.push({ k: 'rafterB', pts: q([X - .07, yOf(0) - .12, zOf(0, 1)], [X + .07, yOf(0) - .12, zOf(0, 1)], [X + .07, HB.hr - .12, 5], [X - .07, HB.hr - .12, 5]), thr: thr + .03 }); }
    // Dachstuhl: First, Pfetten, Stuhlsäulen, Kehlbalken; Dachbodenbalken
    for (let X = -30; X < 0; X += 4) { const x1 = Math.min(0, X + 4), o = ordX(X + 2), thr = .52 + .2 * o + .04 * hash(X);
      E2.inside.push({ k: 'beam', pts: q([X, HB.hr - .1, 5], [x1, HB.hr - .1, 5], [x1, HB.hr - .42, 5], [X, HB.hr - .42, 5]), thr, col: '#3e342b' });
      for (const z of [2.6, 7.4]) E2.inside.push({ k: 'beam', pts: q([X, roofY(z) - .2, z], [x1, roofY(z) - .2, z], [x1, roofY(z) - .48, z], [X, roofY(z) - .48, z]), thr: thr + .02, col: '#3a3028' });
      for (const z of [2.6, 7.4]) E2.inside.push({ k: 'post', pts: q([X + 1.9, HB.hw, z], [X + 2.1, HB.hw, z], [X + 2.1, roofY(z) - .45, z], [X + 1.9, roofY(z) - .45, z]), thr: thr + .05, col: '#33291f' });
      E2.inside.push({ k: 'post', pts: q([X + 2, 7.25, 2.2], [X + 2, 7.25, 7.8], [X + 2, 7.05, 7.8], [X + 2, 7.05, 2.2]), thr: thr + .03, col: '#3a3028' }); }
    for (let X = -29.5; X <= -.5; X += 1) E2.inside.push({ k: 'joist', pts: q([X - .1, HB.hw - .02, 0], [X + .1, HB.hw - .02, 0], [X + .1, HB.hw - .02, 10], [X - .1, HB.hw - .02, 10]), thr: .6 + .13 * ordX(X) + .04 * hash(X * 1.7), col: '#2c241c' });
    // Stadel: senkrechte Bretter vorn
    for (let X = -30; X < HB.res - .01; X += .4) { const door = X >= -22 && X < -17.6;
      E2.boards.push({ k: 'board', pts: q([X, 0, 0], [X + .4, 0, 0], [X + .4, door ? 4.2 : HB.hw, 0], [X, door ? 4.2 : HB.hw, 0]), thr: door ? .44 + .06 * (X > -19.8) : .28 + .42 * hash(X * 2.9), door, sd: X });
      if (door) E2.boards.push({ k: 'board', pts: q([X, 4.2, 0], [X + .4, 4.2, 0], [X + .4, HB.hw, 0], [X, HB.hw, 0]), thr: .3 + .4 * hash(X * 4.1), sd: X + 50 }); }
    // Giebeldreieck (Bretter)
    for (let Z = 0; Z < 10 - .01; Z += .5) { const yt0 = roofY(Z), yt1 = roofY(Z + .5);
      const gp = [P(0, HB.hw, Z), P(0, HB.hw, Z + .5), P(0, yt1, Z + .5), P(0, yt0, Z)]; gp.w = [.3, (HB.hw + yt0) / 2, Z + .25];
      E2.gable.push({ k: 'gboard', pts: gp, thr: .46 + .14 * hash(Z * 3.7) }); }
    return E2;
  }
  function wallTop(X, s, fl, hmin, sd) { // Resthöhe einer Mauer an Stelle X; fl = Beginn des Abrisses
    const k = clamp((s - fl) / .3), jag = (hash(Math.floor(X * 2) * 1.37 + sd) - .5) * .7 * Math.min(1, k * 3);
    return Math.max(hmin, HB.hw * (1 - k) + jag * (k > 0 ? 1 : 0)) ;
  }
  function demoBg(g) { // Himmel, Wald, Schneefeld (bleibt nach dem Abriss als leeres Feld)
    const hz = DM.cy;
    const sk = g.createLinearGradient(0, RY, 0, hz); sk.addColorStop(0, '#5f666f'); sk.addColorStop(.55, '#8f959c'); sk.addColorStop(1, '#b7bbbf');
    g.fillStyle = sk; g.fillRect(RX, RY, RW, hz - RY + 4);
    for (let i = 0; i < 14; i++) { const y = 120 + i * 44 + hash(i) * 30, x = RX + hash(i * 3.3) * RW; g.save(); g.translate(x, y); g.scale(1, .08 + hash(i * 5) * .05);
      spot(g, 0, 0, 420 + hash(i * 7) * 380, hash(i * 2) > .5 ? 'rgba(60,66,74,A)' : 'rgba(200,204,208,A)', .28); g.restore(); }
    forestRow(g, RX, W - RX, x => hz - 4 + Math.sin(x * .006) * 5, 26, 60, '#5d636b', 7, 14);
    forestRow(g, RX, W - RX, x => hz + 3 + Math.sin(x * .004 + 2) * 4, x => x < 300 ? 70 : 40, x => x < 300 ? 140 : 90, '#4a5058', 13, 20);
    const sn = g.createLinearGradient(0, hz, 0, H - RY); sn.addColorStop(0, '#b4b8bc'); sn.addColorStop(.25, '#a2a7ac'); sn.addColorStop(.6, '#878d94'); sn.addColorStop(1, '#646a72');
    g.fillStyle = sn; g.fillRect(RX, hz + 4, RW, H - RY - hz);
    for (let i = 0; i < 9; i++) { g.save(); g.translate(RX + hash(i * 5.1) * RW, hz + 60 + i * 90); g.scale(1, .08); spot(g, 0, 0, 500 + hash(i) * 400, hash(i * 3) > .5 ? 'rgba(220,224,228,A)' : 'rgba(70,74,80,A)', .18); g.restore(); }
    for (let i = 0; i < 500; i++) { const x = RX + hash(i * 1.9) * RW, y = hz + 10 + Math.pow(hash(i * 3.7), 1.5) * (H - RY - hz); g.fillStyle = hash(i * 7.1) > .5 ? 'rgba(235,238,240,.18)' : 'rgba(60,64,70,.12)'; g.fillRect(x, y, 2 + 3 * hash(i), 1.5); }
    // Weidezaun rechts vorn (bleibt auch auf dem leeren Feld stehen)
    const posts = [.4, -1.2, -2.8, -4.2].map(Z => { const X = 2.4 + Z * .25, [x, y] = dP(X, 0, Z), s = dScale(X, 0, Z); return [x, y, s]; });
    g.strokeStyle = '#3b3f45'; g.lineCap = 'round';
    for (const fy of [.45, .85]) { g.lineWidth = 4; g.beginPath(); posts.forEach(([x, y, s], i) => { g.lineWidth = Math.max(2, .06 * s); i ? g.lineTo(x, y - fy * s) : g.moveTo(x, y - fy * s); }); g.stroke(); }
    for (const [x, y, s] of posts) { g.lineWidth = Math.max(3, .13 * s); g.beginPath(); g.moveTo(x, y + .05 * s); g.lineTo(x + .02 * s, y - 1.15 * s); g.stroke();
      g.fillStyle = '#e4e6e8'; rr(g, x - .1 * s, y - 1.22 * s, .24 * s, .08 * s, .03 * s); g.fill(); g.fillStyle = 'rgba(200,204,208,.6)'; g.beginPath(); g.ellipse(x, y + .03 * s, .35 * s, .06 * s, 0, 0, TAU); g.fill(); }
  }
  function demoGround(g) { // zertretener, schmutziger Schnee und Wagenspuren vor dem Haus (verschwindet mit dem Haus)
    for (let i = 0; i < 160; i++) { const X = -31 + hash(i * 2.7) * 36, Z = -5 + Math.pow(hash(i * 4.9), .7) * 4.6, [x, y] = dP(X, 0, Z), s = dScale(X, 0, Z);
      g.fillStyle = `rgba(78,72,66,${.08 + .1 * hash(i)})`; g.beginPath(); g.ellipse(x, y, (.25 + hash(i * 3) * .7) * s, (.06 + hash(i * 5) * .1) * s, (hash(i * 7) - .5) * .4, 0, TAU); g.fill(); }
    for (let i = 0; i < 70; i++) { const X = -3 + hash(i * 5.3) * 8, Z = -4.5 + hash(i * 6.1) * 14, [x, y] = dP(X, 0, Z), s = dScale(X, 0, Z); // auch neben dem Giebel
      g.fillStyle = `rgba(78,72,66,${.07 + .08 * hash(i * 2)})`; g.beginPath(); g.ellipse(x, y, (.2 + hash(i * 3.3) * .5) * s, (.05 + hash(i * 4.4) * .08) * s, 0, 0, TAU); g.fill(); }
    g.strokeStyle = 'rgba(70,68,64,.28)'; g.lineCap = 'round';
    for (const off of [0, 1.4]) { g.beginPath(); for (let k = 0; k <= 30; k++) { const X = -34 + k * 1.4, Z = -4.6 + off + Math.sin(k * .3) * .3, [x, y] = dP(X, 0, Z); g.lineWidth = Math.max(1.5, .12 * dScale(X, 0, Z)); k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  }
  // Arbeiter (Silhouette): (x,y) Füße, h Höhe; pose 'pry' | 'pull' | 'stand'; ph Bewegungsphase
  function workman(c, x, y, h, pose, ph, col, o = {}) {
    const d = o.dir || 1, X = v => x + v * h * d, Y = v => y - v * h;
    c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineCap = 'round'; c.lineJoin = 'round';
    let hip, sh, head, hl, hr2, kneeL, kneeR, fL = [-.06, 0], fR = [.07, 0], bar = null;
    const sn = Math.sin(ph), cs = Math.cos(ph);
    if (pose === 'pry') { const b = .5 + .5 * sn; hip = [-.02, .5 - .06 * b]; sh = [.12 + .1 * b, .78 - .16 * b]; head = [sh[0] + .07, sh[1] + .07 - .04 * b]; kneeL = [.0, .27]; kneeR = [.1, .26];
      hl = [sh[0] + .1, sh[1] - .2 - .05 * b]; hr2 = [sh[0] + .16, sh[1] - .18 - .04 * b]; bar = [[hl[0] - .05, hl[1] + .1], [hr2[0] + .18, hr2[1] - .4 + .05 * b]]; }
    else if (pose === 'pull') { const b = .5 + .5 * sn; hip = [-.06 - .04 * b, .5]; sh = [-.1 - .05 * b, .82]; head = [sh[0] - .01, sh[1] + .1]; kneeL = [.02, .26]; kneeR = [-.08, .26]; fL = [.08, 0]; fR = [-.1, 0];
      hl = [.12 - .02 * b, .74 + .05 * cs]; hr2 = [.18 - .03 * b, .68 - .05 * cs]; }
    else { const lean = o.lean || 0; hip = [0, .51]; sh = [.03 + lean * .1, .81 - lean * .03]; head = [sh[0] + .02 + lean * .06, sh[1] + .1 - lean * .05]; kneeL = [-.03, .26]; kneeR = [.05, .26]; hl = [-.05, .5]; hr2 = [.1 + lean * .05, .5]; bar = [[.1, .55], [.15, .02]]; }
    const L = (a, b, w) => { c.lineWidth = w * h; c.beginPath(); c.moveTo(X(a[0]), Y(a[1])); for (const q of b) c.lineTo(X(q[0]), Y(q[1])); c.stroke(); };
    L(hip, [kneeL, fL], .075); L(hip, [kneeR, fR], .075); L(hip, [sh], .15); // Beine, Rumpf
    c.beginPath(); c.ellipse(X(head[0]), Y(head[1]), h * .06, h * .068, 0, 0, TAU); c.fill(); // Kopf
    c.beginPath(); c.ellipse(X(head[0] + .01), Y(head[1] + .045), h * .068, h * .026, 0, 0, TAU); c.fill(); c.fillRect(X(head[0]) - (d > 0 ? 0 : h * .1), Y(head[1] + .04), h * .1, h * .015); // Mütze mit Schirm
    const el = (a, b) => [(a[0] + b[0]) / 2 + .03, (a[1] + b[1]) / 2 - .05];
    L([sh[0] - .03, sh[1] - .02], [el(sh, hl), hl], .055); L([sh[0] + .03, sh[1] - .02], [el(sh, hr2), hr2], .055);
    if (bar) { c.lineWidth = Math.max(2, h * .028); c.beginPath(); c.moveTo(X(bar[0][0]), Y(bar[0][1])); c.lineTo(X(bar[1][0]), Y(bar[1][1])); c.stroke(); }
    c.restore();
    return { hand: [X(hl[0]), Y(hl[1])] };
  }
  SCENES.demolition = (c, lt, b, gt) => {
    const p = b.p || {};
    if (!DEMO) DEMO = demoBuild();
    // ---- Abrissfortschritt ----
    const anim = typeof p.stage0 === 'number' || typeof p.stage1 === 'number';
    // nur stage1 angegeben → ab stage (bzw. 0); nur stage0 angegeben → bis 1 abreißen
    const s0 = clamp(num(p.stage0, num(p.stage, 0))), s1 = clamp(num(p.stage1, 1)), at0 = num(p.t0, 0), at1 = Math.max(at0 + .1, num(p.t1, at0 + 6));
    const st = anim ? lerp(s0, s1, prog(lt, at0, at1)) : clamp(num(p.stage, .5));
    const tCross = thr => (anim && s1 > s0 && thr > s0 && thr <= s1) ? at0 + (thr - s0) / (s1 - s0) * (at1 - at0) : null;
    const FALL = .85, fallen = (e) => { const tc = tCross(e.thr); return tc != null && lt >= tc && lt < tc + FALL ? lt - tc : -1; };
    const emT = tOn(p.empty), eu = emT == null ? -1 : lt - emT;
    const siteA = eu < .9 ? 1 : 1 - clamp((eu - .9) / 1.5); // Haus + Baustelle blenden hinter dem Staub aus
    const bg = layer('demoBg', demoBg);
    blit(c, bg);
    if (siteA > 0) { c.save(); c.globalAlpha = siteA; demoGround(c); c.restore(); } // Spuren im Schnee gehören zur Baustelle und verschwinden mit ihr
    const sp = sprite('soft'), dsp = sprite('dust');
    for (let i = 0; i < 4; i++) { const cx = mod(gt * (5 + i * 2) + i * 470, 1800) - 350; c.globalAlpha = .08; c.drawImage(sp, cx - 420, 230 + i * 110 - 26, 840, 52); } c.globalAlpha = 1;
    // Krähen kreisen
    for (let i = 0; i < 3; i++) { const a = gt * (.35 + i * .07) + i * 2.1, x = 300 + i * 160 + Math.cos(a) * (120 + i * 30), y = 380 + i * 30 + Math.sin(a) * 40, fl2 = Math.sin(gt * 9 + i * 1.7);
      c.strokeStyle = '#26292e'; c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 11, y - 4 * fl2); c.quadraticCurveTo(x - 4, y - 2, x, y); c.quadraticCurveTo(x + 4, y - 2, x + 11, y - 4 * fl2); c.stroke(); }
    const fallDraw = (pts, u, col, sd) => { // Teil fällt bis zum Boden (Schwerkraft, leichte Drehung), bleibt kurz liegen und verschwindet im Schutt
      const cx = pts.reduce((a, q) => a + q[0], 0) / pts.length, cy = pts.reduce((a, q) => a + q[1], 0) / pts.length, w = pts.w;
      const gy = w ? dP(w[0], .2, Math.min(w[2], 0) - .6 - hash(sd) * .8)[1] : cy + 400, maxD = Math.max(0, gy - cy), g0 = 1300;
      const tHit = Math.sqrt(maxD / g0), ue = Math.min(u, tHit), dy = Math.min(maxD, g0 * u * u), rot = (hash(sd * 1.7) - .5) * 1.6 * ue, dx = (hash(sd * 3.1) - .4) * 60 * ue;
      c.save(); c.globalAlpha = clamp(1 - Math.max(0, u - tHit) / Math.max(.1, FALL - tHit)) * siteA; c.translate(cx + dx, cy + dy); c.rotate(rot); c.translate(-cx, -cy); poly(c, pts); c.fillStyle = col; c.fill(); c.restore(); };
    if (siteA > 0) {
      const E2 = DEMO; c.save(); c.globalAlpha = siteA;
      // 1) Unterseite der hinteren Dachfläche + hintere Sparren (nur durch Lücken sichtbar)
      for (const e of E2.back) { if (st >= e.thr) continue; poly(c, e.pts); c.fillStyle = e.k === 'under' ? '#3b3530' : '#2a231d'; c.fill(); }
      // Innenraum: Rückwand innen (dunkel, Lichtritzen), Stadel dunkel
      { // Rückwand innen: dunkel unter dem Dach, wird heller, sobald das Dach fehlt; bröckelt ebenfalls
        const open = clamp((st - .4) / .3), col = `rgb(${Math.round(lerp(42, 104, open))},${Math.round(lerp(38, 99, open))},${Math.round(lerp(34, 92, open))})`;
        const top = []; for (let X = -30; X <= .01; X += 1) top.push(dP(X, wallTop(X * 1.3, st, .74 + .14 * ordX(X), .3 + .5 * hash(X * 4.3), 7), 10));
        poly(c, [dP(-30, 0, 0), dP(HB.res, 0, 0), dP(HB.res, 0, 10), dP(-30, 0, 10)]); c.fillStyle = `rgb(${Math.round(lerp(40, 92, open))},${Math.round(lerp(36, 88, open))},${Math.round(lerp(32, 82, open))})`; c.fill(); // Tennenboden
        const hg = wallTop(-61, st, .7, .4, 9), gy = Math.min(HB.hr, hg > HB.hw - .01 ? HB.hr : hg); // hinterer Stadelgiebel innen
        poly(c, [dP(-30, 0, 0), dP(-30, 0, 10), dP(-30, Math.min(hg, HB.hw), 10), dP(-30, gy, 5), dP(-30, Math.min(hg, HB.hw), 0)]); c.fillStyle = col; c.fill();
        poly(c, [dP(-30, 0, 10), ...top, dP(0, 0, 10)]); c.fillStyle = col; c.fill();
        // wo das Dach schon offen ist (Arbeitsbereich), fällt Tageslicht auf die Rückwand
        const ow = clamp((st - .08) / .22) * (1 - open); if (ow > 0) { const gx0 = dP(-9.5, 0, 10), gx1 = dP(-.5, 0, 10), lg = c.createLinearGradient(gx0[0], 0, gx1[0], 0);
          lg.addColorStop(0, 'rgba(120,114,106,0)'); lg.addColorStop(.25, `rgba(120,114,106,${.75 * ow})`); lg.addColorStop(.8, `rgba(120,114,106,${.75 * ow})`); lg.addColorStop(1, 'rgba(120,114,106,0)');
          poly(c, [dP(-9.5, 0, 10), ...top.slice(20, 31), dP(0, 0, 10)]); c.fillStyle = lg; c.fill(); }
        c.strokeStyle = `rgba(210,214,220,${.22 * (1 - open)})`; c.lineWidth = 1.2; c.beginPath(); for (let X = -29.6; X < HB.res; X += .9) { const a = dP(X, .2, 10), b2 = dP(X, wallTop(X * 1.3, st, .74 + .14 * ordX(X), .3, 7) - .2, 10); c.moveTo(a[0], a[1]); c.lineTo(b2[0], b2[1]); } c.stroke(); }
      // 2) Dachstuhl + Dachbodenbalken
      for (const e of E2.inside) { if (st >= e.thr) { const u = fallen(e); if (u >= 0) fallDraw(e.pts, u, e.col, e.thr * 97); continue; } poly(c, e.pts); c.fillStyle = e.col; c.fill(); }
      if (st < .95) { const ch = dP(-5.5, HB.hr - .2, 4.6), cs2 = dScale(-5.5, HB.hr, 4.6); const cht = .62; // Kamin
        if (st < cht) { c.fillStyle = '#6a645c'; c.fillRect(ch[0] - .35 * cs2, ch[1] - 1.4 * cs2, .7 * cs2, 1.4 * cs2 + 4); c.fillStyle = '#d6d9dc'; c.fillRect(ch[0] - .42 * cs2, ch[1] - 1.48 * cs2, .84 * cs2, .12 * cs2); } }
      c.restore();
    }
    // ---- Arbeiter: Position hängt davon ab, was noch steht ----
    const nW = clamp(Math.round(num(p.workers, 3)), 0, 3), fz = tOn(p.freeze), frozen = fz != null && lt >= fz;
    const wCol = '#1a1b1e';
    const onFloor = st < .78, onRidge = st < .66;
    const W2 = onFloor ? [-7.0, HB.hw, 2.4] : [-6.6, 1.05, 2.2], W1 = onRidge ? [-2.6, HB.hr, 5] : [-3.4, .55, -1.3], W3 = [-9.5, 0, -2.7]; // W2 später: auf dem Schutt im Erdgeschoss
    const drawW = (pos, pose, ph, o = {}) => { const [x, y] = dP(...pos), h = 1.75 * dScale(...pos);
      workman(c, x - .6, y - 1.8, h, pose, ph, 'rgba(205,210,216,.55)', o); return workman(c, x, y, h, pose, ph, wCol, o); }; // feine Himmelslicht-Kante oben
    const wph = (k) => gt * (k === 3 ? 2.4 : 2.0) + k * 1.9;
    // 3) Arbeiter auf dem Dachboden (zwischen Dachstuhl und Wänden)
    let gapPos = null;
    if (siteA > 0 && nW >= 1) { c.save(); c.globalAlpha = siteA;
      // erstarrt: Bewegung bleibt in der Haltung des Augenblicks stehen (Phase zum Zeitpunkt freeze)
      const ph = frozen ? (gt - lt + fz) * 2.0 + 2 * 1.9 : wph(2), xk = clamp((st - .76) / .04); // Wechsel Dachboden → Schutt weich überblenden
      if (xk > 0 && xk < 1) { c.globalAlpha = siteA * (1 - xk); drawW([-7.0, HB.hw, 2.4], 'pry', ph, { dir: 1 }); c.globalAlpha = siteA * xk; drawW([-6.6, 1.05, 2.2], 'pry', ph, { dir: 1 }); }
      else drawW(W2, 'pry', ph, { dir: 1 });
      gapPos = [W2[0] + .35, W2[1], W2[2] - .1]; c.restore(); }
    // 4) Giebelwand (X = 0): Mauer mit Fenstern, darüber Bretter; vorderer Teil bleibt als letzte Wand stehen
    const lastStand = 3.2;
    const fallK = eu < 0 ? 0 : E.in(clamp(eu / .8)), fallA = fallK * Math.PI / 2 * .98; // letzte Wand kippt nach außen
    if (siteA > 0) { c.save(); c.globalAlpha = siteA;
      const gPts = []; for (let Z = 0; Z <= 10.001; Z += .5) { const last = Z <= 4.6, hmin = last ? lastStand + (hash(Z * 3) - .5) * .5 : .5 + .4 * hash(Z * 7); gPts.push([Z, wallTop(Z * 3 - 40, st, last ? .78 : .7 + .1 * (Z / 10), hmin, 11)]); }
      const rotP = (Z, Y) => fallA > 0 && Z <= 4.6 ? dP(Y * Math.sin(fallA), Y * Math.cos(fallA), Z) : dP(0, Y, Z);
      // hinterer Teil
      c.fillStyle = '#77736c'; c.beginPath(); c.moveTo(...dP(0, 0, 4.6)); gPts.filter(q => q[0] >= 4.6).forEach(q => c.lineTo(...dP(0, q[1], q[0]))); c.lineTo(...dP(0, 0, 10)); c.closePath(); c.fill();
      // vorderer Teil (letzte Wand), ggf. kippend
      const front = gPts.filter(q => q[0] <= 4.6), fp = [rotP(0, 0), ...front.map(q => rotP(q[0], q[1])), rotP(4.6, 0)];
      poly(c, fp); c.fillStyle = '#7d7972'; c.fill();
      c.save(); poly(c, fp); c.clip(); // Fenster + Risse
      for (const [z0, z1, y0, y1] of [[1.3, 2.4, 1.1, 2.3], [1.3, 2.4, 3.3, 4.5], [6.2, 7.3, 1.1, 2.3], [6.2, 7.3, 3.3, 4.5]]) { if (z0 > 4.6) continue; poly(c, [rotP(z0, y0), rotP(z1, y0), rotP(z1, y1), rotP(z0, y1)]); c.fillStyle = '#1d1b19'; c.fill(); }
      c.strokeStyle = 'rgba(60,56,50,.45)'; c.lineWidth = 1.4; c.beginPath(); const a1 = rotP(2.6, 2.4), a2 = rotP(3.1, 1.2), a3 = rotP(3.6, .2); c.moveTo(a1[0], a1[1]); c.lineTo(a2[0], a2[1]); c.lineTo(a3[0], a3[1]); c.stroke();
      c.restore();
      c.save(); c.beginPath(); c.moveTo(...dP(0, 0, 4.6)); gPts.filter(q => q[0] >= 4.6).forEach(q => c.lineTo(...dP(0, q[1], q[0]))); c.lineTo(...dP(0, 0, 10)); c.closePath(); c.clip();
      for (const [z0, z1, y0, y1] of [[6.2, 7.3, 1.1, 2.3], [6.2, 7.3, 3.3, 4.5]]) { poly(c, [dP(0, y0, z0), dP(0, y0, z1), dP(0, y1, z1), dP(0, y1, z0)]); c.fillStyle = '#1d1b19'; c.fill(); } c.restore();
      for (const e of DEMO.gable) { if (st >= e.thr) { const u = fallen(e); if (u >= 0) fallDraw(e.pts, u, '#4e463e', e.thr * 61); continue; } poly(c, e.pts); c.fillStyle = '#4e463e'; c.fill(); c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 1; c.stroke(); }
      c.restore(); }
    // 5) Traufseite: Stadelbretter, Wohnteil gemauert (Fenster), Balkenköpfe
    if (siteA > 0) { c.save(); c.globalAlpha = siteA;
      for (const e of DEMO.boards) { if (st >= e.thr) { const u = fallen(e); if (u >= 0) fallDraw(e.pts, u, '#5d554c', e.sd); continue; }
        poly(c, e.pts); c.fillStyle = e.door ? '#4f483f' : (hash(e.sd * 1.3) > .5 ? '#5f574e' : '#575047'); c.fill(); c.strokeStyle = 'rgba(20,18,16,.45)'; c.lineWidth = 1; c.stroke(); }
      // Mauerkrone; dort, wo die Männer arbeiten, ist früh eine Bresche geschlagen (Blick auf den Dachboden)
      const breach = 1 - clamp((st - .14) / .1), mPts = [];
      for (let X = HB.res; X <= .001; X += .5) { let h = wallTop(X, st, .6 + .22 * ((X - HB.res) / -HB.res), .55 + .55 * hash(X * 2.3), 5);
        if (X >= -7.6 && X <= -3.6) h = Math.min(h, lerp(4.45 + (hash(X * 5.3) - .5) * .35 + (X < -7.2 || X > -4 ? .45 : 0), HB.hw, breach)); mPts.push([X, h]); }
      const mp = [dP(HB.res, 0, 0), ...mPts.map(q => dP(q[0], q[1], 0)), dP(0, 0, 0)];
      poly(c, mp); const wg = c.createLinearGradient(0, dP(0, HB.hw, 0)[1], 0, dP(0, 0, 0)[1]); wg.addColorStop(0, '#8f8b84'); wg.addColorStop(1, '#7a766f'); c.fillStyle = wg; c.fill();
      c.save(); poly(c, mp); c.clip();
      // verwitterter Putz: Flecken, abgeplatzte Stellen, Sockel
      for (let i = 0; i < 18; i++) { const X = -10.6 + hash(i * 3.7) * 10.4, Y = .3 + hash(i * 5.9) * 4.8, [x, y] = dP(X, Y, 0), s = dScale(X, Y, 0);
        c.fillStyle = hash(i * 2.2) > .5 ? 'rgba(60,56,50,.09)' : 'rgba(170,166,158,.1)'; c.beginPath(); c.ellipse(x, y, (.3 + hash(i) * .9) * s, (.2 + hash(i * 4) * .5) * s, 0, 0, TAU); c.fill(); }
      poly(c, [dP(HB.res, 0, -.02), dP(0, 0, -.02), dP(0, .65, -.02), dP(HB.res, .65, -.02)]); c.fillStyle = '#5f5b55'; c.fill();
      const win = (X, y0, y1, shut) => { const w = .5; poly(c, [dP(X - w - .1, y0 - .1, 0), dP(X + w + .1, y0 - .1, 0), dP(X + w + .1, y1 + .1, 0), dP(X - w - .1, y1 + .1, 0)]); c.fillStyle = '#a9a59c'; c.fill();
        poly(c, [dP(X - w, y0, 0), dP(X + w, y0, 0), dP(X + w, y1, 0), dP(X - w, y1, 0)]); c.fillStyle = '#1c1a18'; c.fill();
        if (shut) { const sx = shut > 0 ? X + w + .08 : X - w - .58, sk = shut > 0 ? .18 : 0; poly(c, [dP(sx, y0 - .05 - sk, -.04), dP(sx + .5, y0 - .05, -.04), dP(sx + .5, y1 + .05, -.04), dP(sx, y1 + .05 - sk, -.04)]); c.fillStyle = '#3e3a35'; c.fill(); } };
      win(-1.9, 1.05, 2.3, -1); win(-4.4, 1.05, 2.3, 0); win(-9.0, 1.05, 2.3, 1);
      win(-1.9, 3.3, 4.5, 0); win(-4.4, 3.3, 4.5, 1); win(-6.7, 3.3, 4.5, 0); win(-9.0, 3.3, 4.5, -1);
      poly(c, [dP(-7.25, 0, 0), dP(-6.15, 0, 0), dP(-6.15, 2.2, 0), dP(-7.25, 2.2, 0)]); c.fillStyle = '#211e1b'; c.fill();
      c.strokeStyle = 'rgba(50,46,40,.5)'; c.lineWidth = 1.3; c.beginPath(); for (const [x0, y0, x1, y1] of [[-3, 5, -3.4, 3.8], [-3.4, 3.8, -3.1, 2.9], [-8, 4.9, -7.6, 4.1], [-10.2, 2.6, -10.6, 1.4], [-5.6, 1.2, -5.2, .5]]) { const a = dP(x0, y0, 0), b2 = dP(x1, y1, 0); c.moveTo(a[0], a[1]); c.lineTo(b2[0], b2[1]); } c.stroke();
      // Ruß über den Fensterstürzen, Schatten unter der (fehlenden) Traufe
      const sg = c.createLinearGradient(0, dP(0, HB.hw, 0)[1], 0, dP(0, HB.hw - 1.2, 0)[1]); sg.addColorStop(0, `rgba(40,36,32,${st < .5 ? .5 : .15})`); sg.addColorStop(1, 'rgba(40,36,32,0)'); c.fillStyle = sg; poly(c, mp); c.fill();
      c.restore();
      c.strokeStyle = 'rgba(200,198,192,.35)'; c.lineWidth = 1.5; c.beginPath(); mp.slice(1, -1).forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.stroke(); // Bruchkante
      // Staub, wo die Mauerkrone gerade fällt
      if (anim) for (let i = 0; i < mPts.length; i += 2) { const [X] = mPts[i], fl = .6 + .22 * ((X - HB.res) / -HB.res), k = (st - fl) / .3; if (k <= 0 || k >= 1) continue;
        const [x, y] = dP(X, mPts[i][1], 0), s = dScale(X, 0, 0); for (let j = 0; j < 2; j++) { const a = mod(gt * .9 + hash(i * 3 + j), 1); c.globalAlpha = .3 * (1 - a) * siteA; const r = (.6 + a * 1.6) * s; c.drawImage(dsp, x - r + (j - .5) * .8 * s, y - r - a * 1.2 * s, 2 * r, 2 * r); } }
      c.globalAlpha = siteA;
      c.restore(); }
    // 6) vordere Dachfläche: Sparren, Latten, Ziegel (mit Schnee)
    if (siteA > 0) { c.save(); c.globalAlpha = siteA;
      for (const e of DEMO.roof) if (e.k === 'rafter') { if (st >= e.thr) { const u = fallen(e); if (u >= 0) fallDraw(e.pts, u, '#4a3f35', e.X * 7); continue; } poly(c, e.pts); c.fillStyle = '#4a3f35'; c.fill(); }
      c.strokeStyle = '#5e5044'; c.lineWidth = 2.2; c.beginPath(); for (const e of DEMO.roof) if (e.k === 'batten' && st < e.thr) for (const [a, b2] of e.pts) { c.moveTo(a[0], a[1]); c.lineTo(b2[0], b2[1]); } c.stroke();
      for (const e of DEMO.roof) if (e.k === 'tile') { if (st >= e.thr) { const u = fallen(e); if (u >= 0) fallDraw(e.pts, u * .8, '#4d433a', e.sd * 3.3); continue; }
        poly(c, e.pts); c.fillStyle = e.snow ? '#cfd2d5' : '#544a41'; c.fill();
        c.strokeStyle = e.snow ? 'rgba(120,124,130,.35)' : 'rgba(25,20,16,.5)'; c.lineWidth = 1; c.beginPath(); for (const v of [.33, .66]) { c.moveTo(lerp(e.pts[0][0], e.pts[3][0], v), lerp(e.pts[0][1], e.pts[3][1], v)); c.lineTo(lerp(e.pts[1][0], e.pts[2][0], v), lerp(e.pts[1][1], e.pts[2][1], v)); } c.stroke(); }
      // Firstlinie mit Schnee, solange Ziegel oben liegen
      c.restore(); }
    // 7) Arbeiter auf First / am Boden, Seil
    let ropeTo = null;
    if (siteA > 0 && nW >= 3) { c.save(); const xk = clamp((st - .64) / .04); // Wechsel First → Schutthaufen weich überblenden
      let r; if (xk > 0 && xk < 1) { c.globalAlpha = siteA * (1 - xk); r = drawW([-2.6, HB.hr, 5], 'pry', wph(1), { dir: 1 }); c.globalAlpha = siteA * xk; drawW([-3.4, .55, -1.3], 'pry', wph(1), { dir: -1 }); }
      else { c.globalAlpha = siteA; r = drawW(W1, 'pry', wph(1), { dir: onRidge ? 1 : -1 }); }
      ropeTo = onRidge ? r.hand : (st < .9 ? dP(0, wallTop(-40 + 6, st, .78, lastStand, 11) - .2, 2.2) : null); c.restore(); }
    // Leiter am Haus
    if (siteA > 0 && st < .8) { c.save(); c.globalAlpha = siteA; const l0 = [-1.4, 0, -1.7], l1 = [-1.4, 5.1, -.15], a0 = dP(l0[0] - .25, l0[1], l0[2]), a1 = dP(l1[0] - .25, l1[1], l1[2]), b0 = dP(l0[0] + .25, l0[1], l0[2]), b1 = dP(l1[0] + .25, l1[1], l1[2]);
      c.strokeStyle = '#2e2924'; c.lineWidth = 4; c.beginPath(); c.moveTo(a0[0], a0[1]); c.lineTo(a1[0], a1[1]); c.moveTo(b0[0], b0[1]); c.lineTo(b1[0], b1[1]); for (let k = 1; k < 14; k++) { const u = k / 14; c.moveTo(lerp(a0[0], a1[0], u), lerp(a0[1], a1[1], u)); c.lineTo(lerp(b0[0], b1[0], u), lerp(b0[1], b1[1], u)); } c.lineWidth = 2.5; c.stroke(); c.restore(); }
    // Schutthaufen + Balkenstapel + Wagen (wachsen mit dem Fortschritt)
    if (siteA > 0) { c.save(); c.globalAlpha = siteA;
      // Schutthügel vor der Traufseite und am Giebel: einzelne Haufen, wachsen mit dem Fortschritt
      const rk = clamp((st - .22) / .7);
      if (rk > 0) { const mounds = [];
        for (let i = 0; i < 18; i++) { const X = -29.6 + i * 1.72 + (hash(i * 3.3) - .5) * .8; mounds.push([X, -.8 - .6 * hash(i * 5.7), (.8 + .9 * hash(i * 2.1)) * (X > -11 ? 1.2 : 1), (.5 + .9 * hash(i * 7.9)) * (X > -11 ? 1.35 : 1), i]); }
        for (let i = 0; i < 5; i++) mounds.push([1.0 + .5 * hash(i * 4.1), 1 + i * 2, .9 + .6 * hash(i * 6.3), .4 + .5 * hash(i * 8.7), 30 + i]);
        mounds.sort((a, b2) => dScale(a[0], 0, a[1]) - dScale(b2[0], 0, b2[1])); // hinten zuerst
        for (const [X, Z, R, Hm, sd] of mounds) { const h = Hm * rk, [x, y] = dP(X, 0, Z), s = dScale(X, 0, Z), w = R * s * (.55 + .45 * rk), hh = h * s; if (hh < 2) continue;
          // Haufen mit unruhiger Kontur (Mauerbrocken), dunkler Fuß, Licht von oben, Schneerest
          c.fillStyle = 'rgba(40,38,35,.35)'; c.beginPath(); c.ellipse(x, y + .06 * s, w * 1.08, .16 * s, 0, 0, TAU); c.fill();
          const top = []; for (let k = 0; k <= 14; k++) { const u = k / 14, base = Math.pow(Math.sin(u * Math.PI), .8), bump = .86 + .28 * hash(sd * 9 + k);
            top.push([x - w + 2 * w * u + (hash(sd + k * 2.3) - .5) * .08 * s, y - hh * base * bump]); }
          c.fillStyle = hash(sd * 1.3) > .5 ? '#6a645d' : '#625d56'; c.beginPath(); c.moveTo(x - w * 1.02, y + .06 * s); c.lineTo(top[0][0], top[0][1]);
          for (let k = 1; k < top.length - 1; k++) { const m = [(top[k][0] + top[k + 1][0]) / 2, (top[k][1] + top[k + 1][1]) / 2]; c.quadraticCurveTo(top[k][0], top[k][1], m[0], m[1]); } // weiche, aber unruhige Kontur
          c.lineTo(top[top.length - 1][0], top[top.length - 1][1]); c.lineTo(x + w * 1.02, y + .06 * s); c.closePath(); c.fill();
          c.fillStyle = 'rgba(150,146,140,.4)'; c.beginPath(); c.moveTo(top[2][0], top[2][1] + 2); for (let k = 3; k <= 9; k++) c.lineTo(top[k][0], top[k][1] + 2); for (let k = 9; k >= 3; k--) c.lineTo(top[k][0] - .05 * s, top[k][1] + hh * .25); c.closePath(); c.fill();
          for (let k = 0; k < 4; k++) { const q = top[2 + Math.floor(hash(sd * 4 + k) * 10)], bw = (.12 + .16 * hash(sd + k)) * s; c.fillStyle = k % 2 ? '#7f786f' : '#4f4a44'; c.save(); c.translate(q[0], q[1] + bw * .4); c.rotate((hash(sd * 5 + k) - .5) * .8); c.fillRect(-bw / 2, -bw * .35, bw, bw * .7); c.restore(); } // Brocken
          if (hash(sd * 6.1) > .35) { const q = top[6 + Math.floor(hash(sd * 2.2) * 3)]; c.fillStyle = 'rgba(218,221,224,.7)'; c.beginPath(); c.ellipse(q[0], q[1] + 1, w * .22, Math.max(1.5, .05 * s), (hash(sd) - .5) * .3, 0, TAU); c.fill(); }
          if (hash(sd * 8.3) > .45) { const a = (hash(sd * 3) - .5) * .9, L = (1.4 + hash(sd * 5) * 1.6) * s, q = top[4 + Math.floor(hash(sd * 7) * 6)]; // ein Balken ragt heraus
            c.strokeStyle = '#3b332b'; c.lineCap = 'butt'; c.lineWidth = Math.max(2, .14 * s); c.beginPath(); c.moveTo(q[0] - Math.cos(a) * L * .3, q[1] - Math.sin(a) * L * .3 + 3); c.lineTo(q[0] + Math.cos(a) * L * .7, q[1] + Math.sin(a) * L * .7); c.stroke(); } } }
      // geborgene Balken, ordentlich gestapelt vor dem Stadel (werden mehr)
      const nB = Math.round(2 + 10 * clamp(st * 1.15));
      for (let i = 0; i < nB; i++) { const row = Math.floor(i / 4), k = i % 4, Z = -3.6 + k * .32 + row * .16, Y = .16 + row * .3, a = dP(-16.5, Y, Z), b2 = dP(-11.8, Y, Z), s = dScale(-11.8, Y, Z);
        c.strokeStyle = '#3d342c'; c.lineWidth = .28 * s; c.lineCap = 'butt'; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b2[0], b2[1]); c.stroke(); c.fillStyle = '#7a6a58'; c.fillRect(b2[0] - .13 * s, b2[1] - .14 * s, .26 * s, .28 * s); }
      // geborgene Dachziegel (Stapel) und lose Bretter im Schnee vorn
      for (const [X, Z, n] of [[-2.6, -3.9, 6], [-1.7, -4.4, 5], [-3.4, -3.3, 4]]) { const [x, y] = dP(X, 0, Z), s = dScale(X, 0, Z), k = Math.max(1, Math.round(n * clamp(.3 + st * 1.4)));
        c.fillStyle = 'rgba(70,66,60,.35)'; c.beginPath(); c.ellipse(x + .05 * s, y + .02 * s, .36 * s, .07 * s, 0, 0, TAU); c.fill();
        for (let i = 0; i < k; i++) { c.fillStyle = i % 2 ? '#5d5248' : '#51473e'; c.fillRect(x - .24 * s, y - (i + 1) * .075 * s, .48 * s, .07 * s); }
        c.fillStyle = 'rgba(226,229,232,.75)'; c.fillRect(x - .24 * s, y - (k + .35) * .075 * s, .48 * s, .03 * s); }
      c.strokeStyle = '#4a4138'; c.lineCap = 'butt';
      for (const [X, Z, dX, dZ, th] of [[-5.6, -4.8, 2.6, .5, .2], [-4.2, -5.6, 1.9, -.4, .18], [1.0, -3.4, -.6, 2.2, .2], [-7.4, -3.9, 2.2, -.9, .17]]) {
        const a = dP(X, .04, Z), b2 = dP(X + dX, .04, Z + dZ); c.lineWidth = th * dScale(X + dX / 2, 0, Z + dZ / 2); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b2[0], b2[1]); c.stroke();
        c.strokeStyle = 'rgba(225,228,231,.55)'; c.lineWidth = Math.max(1, .03 * dScale(X, 0, Z)); c.beginPath(); c.moveTo(a[0], a[1] - 2); c.lineTo(b2[0], b2[1] - 2); c.stroke(); c.strokeStyle = '#4a4138'; }
      c.restore(); }
    if (siteA > 0 && nW >= 2) { c.save(); c.globalAlpha = siteA; const r = drawW(W3, 'pull', wph(3), { dir: 1 });
      if (ropeTo) { c.strokeStyle = 'rgba(40,36,32,.85)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(r.hand[0], r.hand[1]); c.quadraticCurveTo((r.hand[0] + ropeTo[0]) / 2, (r.hand[1] + ropeTo[1]) / 2 + 30, ropeTo[0], ropeTo[1]); c.stroke(); } c.restore(); }
    // ---- herabrutschende Ziegel (gelegentlich) ----
    if (p.tiles !== false && siteA > 0) {
      const per = 1.15, k0 = Math.floor((lt - 2.2) / per);
      for (let k = Math.max(0, k0); k <= k0 + 2; k++) { const te = k * per + hash(k * 7.7) * .5, u = lt - te; if (u < 0 || u > 1.6) continue;
        const band = 1 + Math.floor(hash(k * 5.9) * 3), bay = Math.floor(hash(k * 3.1) * 25), X = -30.6 + (bay + .5) * 1.2, cell = DEMO.tiles[bay] && DEMO.tiles[bay][band];
        if (!cell || st >= cell.thr) continue;
        const u0 = band * .25 + .12, slide = .5, uu = u < slide ? u0 * (1 - (u / slide) * (u / slide)) : 0, Z = lerp(-HB.ov, 5, uu), Yr = lerp(HB.hw - HB.ov * .64, HB.hr, uu);
        let pos; if (u < slide) pos = [X, Yr + .08, Z]; else { const v = u - slide, Y = Math.max(0, HB.hw - .4 - 4.9 * v * v); pos = [X - v * .4, Y, -HB.ov - v * 1.2]; if (Y <= 0) { const w = v - Math.sqrt((HB.hw - .4) / 4.9); const [x, y] = dP(...pos), s = dScale(...pos); c.globalAlpha = .45 * clamp(1 - w / .6) * siteA; const r = (.4 + w * 2) * s; c.drawImage(dsp, x - r, y - r * .8, 2 * r, 1.4 * r); c.globalAlpha = 1; continue; } }
        const [x, y] = dP(...pos), s = dScale(...pos), rot = u < slide ? -.5 : (u - slide) * 9 * (hash(k) > .5 ? 1 : -1);
        c.save(); c.globalAlpha = siteA; c.translate(x, y); c.rotate(rot); c.fillStyle = '#4b4037'; c.fillRect(-.2 * s, -.09 * s, .4 * s, .18 * s); c.fillStyle = 'rgba(220,224,228,.8)'; c.fillRect(-.2 * s, -.09 * s, .4 * s, .05 * s); c.restore(); }
    }
    // ---- erstarrter Arbeiter: schwaches rotes Glühen steigt aus der Lücke im Boden ----
    if (frozen && gapPos && siteA > 0) { const k = E.out(prog(lt, fz + .2, fz + 1.6)), pul = .75 + .25 * Math.sin((lt - fz) * 2.6), [gx, gy] = dP(...gapPos), s = dScale(...gapPos);
      c.save(); c.globalAlpha = siteA; c.globalCompositeOperation = 'lighter';
      // weiche Säule aus übereinanderliegenden Glühflecken (keine harten Kanten), oben ausdünnend
      const rsp = sprite('red');
      for (let i = 0; i < 7; i++) { const v = i / 6, r = (.45 + v * .75) * s, y = gy - v * 2.6 * s + Math.sin(gt * 1.3 + i) * .05 * s; c.globalAlpha = siteA * clamp(.32 * k * pul * (1 - v * .8)); c.drawImage(rsp, gx - r + Math.sin(gt * .7 + i * 1.3) * .08 * s, y - r, 2 * r, 2 * r); }
      c.globalAlpha = siteA; addGlow(c, gx, gy, 1.2 * s, '255,40,30', .38 * k * pul, .35); addGlow(c, gx - .2 * s, gy - 1 * s, 1.6 * s, '255,30,30', .1 * k * pul);
      const rs = sprite('red'); for (let i = 0; i < 8; i++) { const a = mod(gt * .25 + hash(i * 3.3), 1), x = gx + (hash(i * 5.1) - .5) * .5 * s + Math.sin(gt + i) * 3, y = gy - a * 2.4 * s, r = (.04 + .05 * hash(i)) * s;
        c.globalAlpha = .6 * k * (1 - a) * siteA; c.drawImage(rs, x - r, y - r, 2 * r, 2 * r); }
      c.restore(); }
    // ---- leere Fläche: letzte Wand fällt, Staubwolke, dann nur Schnee ----
    if (eu >= 0) {
      const hit = eu - .8;
      if (hit > 0 && hit < 4.5) { // Staub- und Schneewolke breitet sich am Boden aus, steigt, zerfasert
        const smk = sprite('smoke'), fa = clamp((1 - hit / 4.5) * (hit < .12 ? hit / .12 : 1));
        for (let i = 0; i < 24; i++) { // Wolke rollt vom Giebel aus über die ganze Ruine, steigt und zerfasert
          const ox = i < 10 ? 1.6 : -2 - hash(i * 4.3) * 16, oz = i < 10 ? 2.3 : -.4, [x0, y0] = dP(ox, 0, oz), s = Math.min(70, dScale(ox, 0, oz));
          const a = hash(i * 3.7) * Math.PI, sp2 = .45 + hash(i * 2.1) * .8, v = Math.min(hit, 3.2) * (1 - Math.min(1, hit / 4.5) * .35) * (i < 10 ? 1 : .7), side = hash(i * 9.3) > .5 ? 1 : -1, dl = i < 10 ? 0 : .15 + hash(i) * .35;
          if (hit < dl) continue;
          const x = x0 + side * Math.cos(a * .5) * sp2 * v * 2.4 * s + (hash(i) - .5) * 2 * s, y = y0 - Math.sin(a) * sp2 * v * .8 * s - v * .5 * s + .4 * s, r = Math.min(200, (1.2 + v * 1.1 + hash(i * 5) * 1.2) * s);
          c.globalAlpha = .6 * fa * clamp((hit - dl) / .2); c.drawImage(i % 3 ? dsp : smk, x - r, y - r, 2 * r, 2 * r); }
        c.globalAlpha = 1; }
      // Treibschnee über dem leeren Feld
      const dk = clamp((eu - 1) / 2);
      if (dk > 0) { const fs = sprite('flake'); for (let i = 0; i < 90; i++) { const y = DM.cy + 30 + Math.pow(hash(i * 2.3), .8) * 1100, sc = (y - DM.cy) / 400, vx = 160 + 220 * hash(i * 5.1);
          const x = mod(hash(i * 7.7) * 1600 + gt * vx * (.5 + sc), 1600) - 260, yy = y - Math.abs(Math.sin(gt * 2 + i)) * 10 * sc, r = (1.5 + 2.5 * hash(i)) * (.6 + sc);
          c.globalAlpha = dk * .55 * (.4 + .6 * hash(i * 3)); c.drawImage(fs, x - r * 3, yy - r, r * 6, r * 2); }
        for (let i = 0; i < 5; i++) { const x = mod(gt * (40 + i * 18) + i * 400, 1700) - 300, y = DM.cy + 120 + i * 170; c.globalAlpha = .12 * dk; c.drawImage(sp, x - 500, y - 30, 1000, 60); }
        c.globalAlpha = 1; }
    }
    if (p.snow || eu > 1) snowfall(c, gt, { n: p.snow ? 140 : 70, s0: 1.2, s1: 5, v0: 30, v1: 110, alpha: .75 * (p.snow ? 1 : clamp((eu - 1) / 2)), wind: .9, seed: 41 });
    // ---- Beschriftung ----
    const lb = p.label; if (lb) { const q = typeof lb === 'string' ? { s: lb } : obj(lb), s = String(q.s || 'FEBRUARY 1923 · DEMOLITION'), at = num(q.at, .4), ly = num(q.y, 1330);
      if (lt >= at) { c.save(); c.translate(540, ly - 18); c.scale(1, .14); spot(c, 0, 0, 560, 'rgba(10,10,12,A)', .55 * clamp((lt - at) / .3)); c.restore(); }
      typeLine(c, s, 540, ly, lt, at, { size: 54, ls: 6, cps: 20, maxW: 860, col: '#f4f2ec', cursorHold: .8 }); }
  };
})();
