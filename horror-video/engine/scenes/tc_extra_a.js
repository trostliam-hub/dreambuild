'use strict';
// Zusatzszenen Serie A für "YOU ARE BTK": library_stacks, parking_lot, classified_ad, interview_room, profile_silhouette.
// Alles in einer IIFE, nach außen wird nur in SCENES geschrieben. Statische Ebenen werden gecacht.
(() => {
  const EMPTY = {};
  const TAU = Math.PI * 2, PAD = 200, LW = W + 2 * PAD, LH = H + 2 * PAD;
  const num = (v, d) => (typeof v === 'number' && isFinite(v)) ? v : d;
  const rnd = (i, s = 0) => hash(i * 1.371 + s * 91.73 + 0.5);
  const mkCv = (w, h) => { const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.ceil(w)); cv.height = Math.max(1, Math.ceil(h)); return cv; };
  const poly = (c, pts) => { c.beginPath(); pts.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.closePath(); };
  // Zeit-Parameter: Zahl, {at}, true (=Vorgabe) oder false/null (aus)
  const beatDur = b => (b && b.end != null && b.start != null) ? b.end - b.start : 8;
  // Vorgabezeiten in kurzen Beats zusammenschieben: need = Länge des Vorgabe-Ablaufs
  const fitK = (b, need) => clamp((beatDur(b) - .5) / need, .25, 1);
  const tOf = (v, d) => v === false || v === null ? null : typeof v === 'number' && isFinite(v) ? v : (v && typeof v === 'object' && typeof v.at === 'number') ? v.at : d;

  // ---------- Caches ----------
  const BIG = new Map(), SPR = new Map();
  function layer(key, draw) { // Vollbild-Ebene inkl. Rand (-200..W+200), höchstens 8 Stück
    let cv = BIG.get(key);
    if (cv) { BIG.delete(key); BIG.set(key, cv); return cv; }
    if (BIG.size >= 8) BIG.delete(BIG.keys().next().value);
    cv = mkCv(LW, LH); const g = cv.getContext('2d'); g.translate(PAD, PAD); draw(g); BIG.set(key, cv); return cv;
  }
  function sprite(key, w, h, draw) {
    let cv = SPR.get(key);
    if (cv) { SPR.delete(key); SPR.set(key, cv); return cv; }
    if (SPR.size >= 90) SPR.delete(SPR.keys().next().value);
    cv = mkCv(w, h); draw(cv.getContext('2d'), cv.width, cv.height); SPR.set(key, cv); return cv;
  }
  // sichtbarer Bereich in Szenenkoordinaten (Kamera-Zoom/Schwenk), damit nur sichtbare Pixel kopiert werden
  function visRect(c, m = 4) {
    const t = c.getTransform().inverse(); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [sx, sy] of [[0, 0], [W, 0], [0, H], [W, H]]) { const x = t.a * sx + t.c * sy + t.e, y = t.b * sx + t.d * sy + t.f; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    return [Math.max(-PAD, Math.floor(x0 - m)), Math.max(-PAD, Math.floor(y0 - m)), Math.min(W + PAD, Math.ceil(x1 + m)), Math.min(H + PAD, Math.ceil(y1 + m))];
  }
  function blitLayer(c, cv, dx = 0, dy = 0) {
    const [x0, y0, x1, y1] = visRect(c), X0 = Math.max(x0, -PAD + dx), Y0 = Math.max(y0, -PAD + dy), X1 = Math.min(x1, W + PAD + dx), Y1 = Math.min(y1, H + PAD + dy);
    if (X1 <= X0 || Y1 <= Y0) return;
    const sm = c.imageSmoothingEnabled; c.imageSmoothingEnabled = false;
    c.drawImage(cv, X0 - dx + PAD, Y0 - dy + PAD, X1 - X0, Y1 - Y0, X0, Y0, X1 - X0, Y1 - Y0); c.imageSmoothingEnabled = sm;
  }
  // Arbeits-Leinwand für Masken (Taschenlampen-Kegel u. ä.)
  let PATCH = null;
  function patch(w, h) { if (!PATCH || PATCH.width < w || PATCH.height < h) PATCH = mkCv(Math.max(w, PATCH ? PATCH.width : 0), Math.max(h, PATCH ? PATCH.height : 0)); const g = PATCH.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, w, h); return g; }
  // Ausschnitt einer gecachten Ebene durch eine weiche Ellipse auftragen (Lichtkreis)
  function revealEllipse(c, src, x, y, rx, ry, a = 1, inner = .35) {
    const x0 = Math.floor(x - rx), y0 = Math.floor(y - ry), w = Math.ceil(rx * 2) + 2, h = Math.ceil(ry * 2) + 2;
    if (w < 2 || h < 2 || a <= 0) return;
    const g = patch(w, h);
    g.drawImage(src, x0 + PAD, y0 + PAD, w, h, 0, 0, w, h);
    g.globalCompositeOperation = 'destination-in'; g.translate(x - x0, y - y0); g.scale(1, ry / rx);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(inner, `rgba(0,0,0,${a * .92})`); gr.addColorStop(.72, `rgba(0,0,0,${a * .42})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(-rx, -rx, 2 * rx, 2 * rx);
    c.drawImage(PATCH, 0, 0, w, h, x0, y0, w, h);
  }
  function addSpot(c, x, y, r, col, a, sy = 1) { if (a <= .003 || r <= 1) return; c.save(); c.globalCompositeOperation = 'lighter'; c.translate(x, y); c.scale(1, sy); spot(c, 0, 0, r, col, a); c.restore(); }
  // vorgerenderter, weichgezeichneter Lichtkegel (Spitze oben, Basis unten); wird gedreht/gestreckt additiv gezeichnet
  function coneSpr(col, top) {
    return sprite('cone|' + col + '|' + top, 160, 330, (g, w, h) => {
      g.filter = 'blur(7px)';
      for (const k of [1, .72, .46]) {
        const gr = g.createLinearGradient(0, 12, 0, h - 12); gr.addColorStop(0, col.replace('A', .05)); gr.addColorStop(.6, col.replace('A', .15)); gr.addColorStop(1, col.replace('A', .3));
        g.fillStyle = gr; const t0 = (w - 30) * top * k / 2, b0 = (w - 30) * k / 2;
        poly(g, [[w / 2 - t0, 12], [w / 2 + t0, 12], [w / 2 + b0, h - 12], [w / 2 - b0, h - 12]]); g.fill();
      }
    });
  }
  function drawCone(c, x0, y0, x1, y1, w1, col, a, top = .08) {
    if (a <= .003) return; const L = Math.hypot(x1 - x0, y1 - y0); if (L < 2) return;
    const spr = coneSpr(col, top);
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(1, a);
    c.translate(x0, y0); c.rotate(Math.atan2(y1 - y0, x1 - x0) - Math.PI / 2); c.scale(w1 / (spr.width - 30), L / (spr.height - 24));
    c.drawImage(spr, -spr.width / 2, -12); c.restore();
  }

  // Registrierung; p._perf schreibt die Renderzeit der Szene als Konsolenfehler (nur zum Testen)
  function reg(name, fn) {
    SCENES[name] = (c, lt, b, gt) => {
      const p = b.p || EMPTY; if (!p._perf) return fn(c, lt, b, gt);
      c.getImageData(0, 0, 1, 1); const t0 = performance.now(); fn(c, lt, b, gt); c.getImageData(0, 0, 1, 1);
      console.error(`PERF ${name} ${(performance.now() - t0).toFixed(1)}ms lt=${lt.toFixed(2)}`);
    };
  }

  // ---------- Text ----------
  function tw(c, s, font, ls = 0) { c.font = font; c.letterSpacing = ls + 'px'; const w = c.measureText(s).width; c.letterSpacing = '0px'; return w; }
  function fitSize(c, s, maxW, size, fontFn, ls = 0, min = 12) {
    let f = size; while (f > min && tw(c, s, fontFn(f), ls) > maxW) f -= 2; return f;
  }
  const XS = new Map();
  function charXs(c, s, font, ls = 0) {
    const key = font + '|' + ls + '|' + s; let a = XS.get(key);
    if (!a) { c.font = font; c.letterSpacing = ls + 'px'; a = [0]; for (let i = 1; i <= s.length; i++) a.push(c.measureText(s.slice(0, i)).width); c.letterSpacing = '0px'; XS.set(key, a); if (XS.size > 3000) XS.clear(); }
    return a;
  }
  function yearMask(s) { const m = new Array(s.length).fill(false), re = /\b(19|20)\d\d\b/g; let r; while ((r = re.exec(s))) for (let i = r.index; i < r.index + 4; i++) m[i] = true; return m; }
  // Text wird zeichenweise in ein Sprite geschrieben (inkl. weichem Schatten), damit pro Frame nur ein drawImage nötig ist
  const TSP = new Map();
  function textSprite(key, s, font, fs, ls, n, charFn) {
    let e = TSP.get(key);
    if (!e || e.n > n) {
      const m = Math.ceil(fs * .7), xs = e ? e.xs : charXs(MEAS, s, font, ls), w = xs[s.length] + 2 * m, h = Math.ceil(fs * 2.1);
      if (!e) { if (TSP.size > 40) TSP.delete(TSP.keys().next().value); e = { cv: mkCv(w, h), xs, m, base: Math.round(fs * 1.35), n: 0 }; TSP.set(key, e); }
      else { e.cv.getContext('2d').clearRect(0, 0, e.cv.width, e.cv.height); e.n = 0; }
    }
    if (e.n < n) {
      const g = e.cv.getContext('2d'); g.font = font; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.letterSpacing = '0px';
      for (; e.n < n; e.n++) { const ch = s[e.n]; if (ch !== ' ') charFn(g, e.n, ch, e.m + e.xs[e.n], e.base); }
    }
    return e;
  }
  const MEAS = document.createElement('canvas').getContext('2d');
  // Schreibmaschinen-Zeile (Special Elite), zentriert um o.x, Jahreszahlen rot, roter Cursor
  function typeText(c, lt, gt, s, at, o = {}) {
    s = String(s || ''); if (!s || at == null || lt < at) return;
    const fontFn = o.fontFn || (z => `400 ${z}px Elite`), ls = num(o.ls, 2);
    const fs = fitSize(MEAS, s, num(o.maxW, 800), num(o.size, 84), fontFn, ls, 20), font = fontFn(fs);
    const sp = num(o.speed, 16), u = (lt - at) * sp, n = Math.min(s.length, Math.floor(u)), done = u >= s.length;
    const mask = o.noRed ? null : yearMask(s), col = o.color || '#ecebe6';
    const e = textSprite('t|' + font + '|' + col + '|' + (o.noRed ? 0 : 1) + '|' + s, s, font, fs, ls, n, (g, i, ch, x, y) => {
      const jy = (rnd(i, 3) - .5) * 2.4, jx = (rnd(i, 5) - .5) * 1.4, red = mask && mask[i];
      g.save(); g.globalCompositeOperation = 'destination-over'; g.shadowColor = 'rgba(0,0,0,.95)'; g.shadowBlur = fs * .45; g.fillStyle = 'rgba(0,0,0,.7)'; g.fillText(ch, x + jx, y + jy); g.restore();
      g.save(); if (red) { glow(g, 'rgba(255,32,32,.95)', 24); g.fillStyle = '#ff3a32'; } else { g.fillStyle = col; g.globalAlpha = .82 + .18 * rnd(i, 7); }
      g.fillText(ch, x + jx, y + jy); g.restore();
    });
    const xs = e.xs, x0 = num(o.x, 540) - (xs[s.length] - ls) / 2, y = o.y + noise(gt * .3, 71) * 2;
    c.drawImage(e.cv, x0 - e.m, y - e.base);
    // frischer Anschlag
    const li = n - 1, age = (u - n) / sp;
    if (li >= 0 && age < .08 && s[li] !== ' ') { const k = 1 - age / .08; c.save(); c.font = font; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.translate(x0 + xs[li], y); c.scale(1 + .2 * k, 1 + .2 * k); c.fillStyle = '#fff'; c.fillText(s[li], 0, 0); c.restore(); }
    const since = done ? lt - at - s.length / sp : 0;
    if (!done || (since < 2.2 && (lt * 1.8) % 1 < .55)) { c.save(); const cx = x0 + xs[n] + 6; glow(c, 'rgba(255,32,32,.9)', 14); c.fillStyle = '#ff2b2b'; c.fillRect(cx, y - fs * .72, Math.max(4, fs * .08), fs * .86); c.restore(); }
  }
  // kleines Orts-Etikett (Space Mono, gesperrt), schnell getippt, rote Linie darunter
  function labelText(c, lt, gt, s, at, o = {}) {
    s = String(s || '').toUpperCase(); if (!s || at == null || lt < at) return;
    const size0 = num(o.size, 30); let ls = num(o.ls, 8);
    while (ls > 2 && tw(MEAS, s, `700 ${size0}px SMono`, ls) > 760) ls--;
    const fs = fitSize(MEAS, s, 760, size0, z => `700 ${z}px SMono`, ls, 16), font = `700 ${fs}px SMono`;
    const sp = num(o.speed, 30), n = Math.min(s.length, Math.floor((lt - at) * sp)), col = o.color || '#c9ccd6';
    const e = textSprite('l|' + font + '|' + ls + '|' + col + '|' + s, s, font, fs, ls, n, (g, i, ch, x, y) => {
      g.save(); g.globalCompositeOperation = 'destination-over'; g.shadowColor = 'rgba(0,0,0,1)'; g.shadowBlur = 16; g.fillStyle = 'rgba(0,0,0,.8)'; g.fillText(ch, x, y); g.restore();
      g.fillStyle = col; g.fillText(ch, x, y);
    });
    const wF = e.xs[s.length] - ls, x0 = num(o.x, 540) - wF / 2, y = o.y, k = E.out(prog(lt, at, at + .6));
    c.drawImage(e.cv, x0 - e.m, y - e.base);
    c.save(); glow(c, 'rgba(255,32,32,.9)', 10); c.fillStyle = '#ff2b2b';
    c.fillRect(num(o.x, 540) - wF / 2 * k, y + 18, wF * k, 2.5);
    if ((gt * 1.4) % 1 < .6) { c.beginPath(); c.arc(x0 - 24, y - fs * .34, 6, 0, TAU); c.fill(); }
    c.restore();
  }
  const txtParam = (v, s0, at0) => { if (v === false || v === null || v === '') return null; if (typeof v === 'string') return { s: v, at: at0 }; const o = v && typeof v === 'object' ? v : EMPTY; return { s: o.s != null ? String(o.s) : s0, at: num(o.at, at0) }; };

  // ---------- Atmosphäre ----------
  function motes(c, gt, n, seed, x0, y0, w, h, col, a, sz = 3, rise = 14) {
    c.save(); const A = c.globalAlpha; c.fillStyle = col;
    for (let i = 0; i < n; i++) {
      const sp = .3 + rnd(i, seed) * .7;
      let x = rnd(i, seed + 1) * w + noise(gt * .13 * sp + i, seed + 2) * 70 + gt * 5 * sp; x = ((x % w) + w) % w;
      let y = rnd(i, seed + 3) * h - gt * rise * sp + noise(gt * .17 + i * 3, seed + 4) * 40; y = ((y % h) + h) % h;
      const edge = clamp(Math.min(x, w - x, y, h - y) / 80);
      c.globalAlpha = A * a * edge * (.35 + .65 * (.5 + .5 * Math.sin(gt * (.8 + rnd(i, seed + 5) * 2) + i * 2.3)));
      c.beginPath(); c.arc(x0 + x, y0 + y, sz * (.35 + rnd(i, seed + 7)), 0, TAU); c.fill();
    }
    c.restore();
  }
  function lampShade(c, x, y, r0, r1, a) {
    const g = c.createRadialGradient(x, y, r0, x, y, r1); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`);
    c.fillStyle = g; c.fillRect(-PAD, -PAD, LW, LH);
  }
  // Staub, der nur im Lichtkegel aufleuchtet
  function coneDust(c, gt, seed, n, x0, y0, w0, x1, y1, w1, col, a, bx = [-150, 250, LW - 100, 1900]) {
    const dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy || 1, L = Math.sqrt(L2);
    c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = col;
    for (let i = 0; i < n; i++) {
      const sp = .4 + rnd(i, seed) * .8;
      let x = bx[0] + ((rnd(i, seed + 1) * bx[2] + noise(gt * .11 * sp + i, seed + 2) * 90 + gt * 7 * sp) % bx[2] + bx[2]) % bx[2];
      let y = bx[1] + ((rnd(i, seed + 3) * bx[3] - gt * 11 * sp + noise(gt * .15 + i * 3, seed + 4) * 60) % bx[3] + bx[3]) % bx[3];
      const t = ((x - x0) * dx + (y - y0) * dy) / L2; if (t < .02 || t > 1.08) continue;
      const d = Math.abs((x - x0) * dy - (y - y0) * dx) / L, rad = lerp(w0, w1, clamp(t)) / 2;
      const inside = clamp(1 - d / rad); if (inside <= 0) continue;
      c.globalAlpha = a * inside * clamp(t * 3) * (.4 + .6 * (.5 + .5 * Math.sin(gt * (1 + rnd(i, seed + 5) * 2.5) + i)));
      c.beginPath(); c.arc(x, y, (1 + rnd(i, seed + 7) * 2.4) * (.6 + .5 * t), 0, TAU); c.fill();
    }
    c.restore();
  }
  // Holztisch (Draufsicht) wie in den Dokument-Szenen
  function deskWood(g) {
    const gr = g.createLinearGradient(-PAD, -PAD, W + PAD, H + PAD); gr.addColorStop(0, '#15141a'); gr.addColorStop(1, '#09090c'); g.fillStyle = gr; g.fillRect(-PAD, -PAD, LW, LH);
    for (let i = 0; i < 240; i++) {
      const y0 = -PAD + rnd(i, 3) * LH, amp = 6 + rnd(i, 4) * 26, fr = .002 + rnd(i, 5) * .004;
      g.strokeStyle = rnd(i, 6) > .5 ? `rgba(255,255,255,${.012 + rnd(i, 7) * .02})` : `rgba(0,0,0,${.15 + rnd(i, 8) * .2})`;
      g.lineWidth = 1 + rnd(i, 9) * 3; g.beginPath();
      for (let x = -PAD; x <= W + PAD; x += 40) { const y = y0 + Math.sin(x * fr + i) * amp + (x * .06); x === -PAD ? g.moveTo(x, y) : g.lineTo(x, y); }
      g.stroke();
    }
  }
  function paperTex(g, w, h, base, seed, o = {}) {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < w * h / 1100; i++) {
      const x = rnd(i, seed) * w, y = rnd(i, seed + 1) * h, l = 4 + rnd(i, seed + 2) * 16, a = rnd(i, seed + 3) * Math.PI;
      g.strokeStyle = rnd(i, seed + 4) > .5 ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.06)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    for (let i = 0; i < (o.stains || 0); i++) {
      const x = rnd(i, seed + 9) * w, y = rnd(i, seed + 10) * h, r = 30 + rnd(i, seed + 11) * 140;
      const gr = g.createRadialGradient(x, y, r * .2, x, y, r); gr.addColorStop(0, `rgba(90,60,20,${.04 + rnd(i, seed + 12) * .06})`); gr.addColorStop(1, 'rgba(90,60,20,0)');
      g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    const e = o.edge != null ? o.edge : .18, gr = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .35, w / 2, h / 2, Math.max(w, h) * .75);
    gr.addColorStop(0, 'rgba(70,50,20,0)'); gr.addColorStop(1, `rgba(70,50,20,${e})`); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }

  // =====================================================================
  // 1) library_stacks – Bücherregal in Fluchtperspektive, Taschenlampe, Brief im Buch
  // =====================================================================
  const LIB = { VPX: 2300, HZ: 860, X0: -PAD, XE: 935, BT: 22, DIV: [-40, 318, 640] };
  const lsS = x => (LIB.VPX - x) / (LIB.VPX - LIB.X0);
  const lsY = (x, v) => LIB.HZ + (v - LIB.HZ) * lsS(x);
  const BOARD = k => -40 + k * 250;
  const LIBL = new Map();
  function libLayout(ts, tx) {
    const key = ts + '|' + Math.round(tx); let L = LIBL.get(key); if (L) return L;
    const secs = []; let a = LIB.X0;
    for (const d of LIB.DIV) { secs.push([a, d]); a = d + 34 * lsS(d); } secs.push([a, LIB.XE]);
    const books = []; let target = null, id = ts * 1000 + Math.round(tx);
    const hues = [[20, 30], [8, 34], [212, 20], [150, 14], [36, 26], [280, 10], [0, 0], [190, 12], [28, 18], [350, 26]];
    for (let r = 0; r < 9; r++) {
      const vb = BOARD(r + 1), vMin = BOARD(r) + LIB.BT + 6;
      for (const [s0, s1] of secs) {
        let x = s0 + 1;
        while (x < s1 - 3) {
          const sh = Math.pow(lsS(x), 1.45); id++;
          const tHere = r === ts && !target && s0 <= tx && tx < s1;
          if (tHere) { const wT = 78 * sh, xl = tx - wT / 2;
            if (x + 56 * sh > xl) { x = Math.max(x, xl); target = { x, bw: wT, vT: vb - 196, vB: vb, dx: 30 * lsS(x), col: 'hsl(4,30%,20%)', id, target: true }; x += wT + 1; continue; } }
          if (rnd(id, 1) < .05) { x += (12 + rnd(id, 2) * 34) * sh; continue; }
          let wf = 22 + rnd(id, 3) * 34; if (rnd(id, 4) > .88) wf += 24;
          const bw = Math.min(wf * sh, s1 - x - 1); if (bw < 3) break;
          const hf = 140 + rnd(id, 5) * 76, hu = hues[Math.floor(rnd(id, 6) * hues.length)];
          const lig = 13 + rnd(id, 7) * 17, sat = hu[1] * (.6 + .6 * rnd(id, 8));
          books.push({ x, bw, vT: Math.max(vMin, vb - hf), vB: vb, col: `hsl(${hu[0]},${sat.toFixed(0)}%,${lig.toFixed(0)}%)`, id });
          x += bw + (rnd(id, 9) > .8 ? 1.5 : .5);
        }
      }
    }
    L = { books, target, secs }; LIBL.set(key, L); return L;
  }
  function libQuad(g, x0, x1, v0, v1, dx = 0) { poly(g, [[x0 + dx, lsY(x0, v0)], [x1 + dx, lsY(x1, v0)], [x1 + dx, lsY(x1, v1)], [x0 + dx, lsY(x0, v1)]]); }
  function libLine(g, x0, x1, v, dx = 0) { g.beginPath(); g.moveTo(x0 + dx, lsY(x0, v)); g.lineTo(x1 + dx, lsY(x1, v)); g.stroke(); }
  function libBook(g, b) {
    const { x, bw, vT, vB } = b, dx = b.target ? b.dx : 0, x1 = x + bw, s = lsS(x);
    if (b.target) { // Seitenfläche (Deckel) des herausstehenden Buchs + Schlagschatten auf den Nachbarn
      for (let j = 0; j < 3; j++) { g.fillStyle = `rgba(0,0,0,${.4 - j * .1})`; libQuad(g, x1, x1 + dx + (10 + j * 12) * s, vT + 6, vB); g.fill(); }
      const sg = g.createLinearGradient(x, 0, x + dx, 0); sg.addColorStop(0, 'hsl(4,20%,9%)'); sg.addColorStop(1, 'hsl(4,24%,19%)');
      g.fillStyle = sg; poly(g, [[x, lsY(x, vT)], [x + dx, lsY(x, vT)], [x + dx, lsY(x, vB)], [x, lsY(x, vB)]]); g.fill();
      g.fillStyle = 'rgba(255,225,190,.28)'; g.fillRect(x + dx - 1.5, lsY(x, vT) + 2, 2, lsY(x, vB) - lsY(x, vT) - 4);
      g.strokeStyle = 'rgba(255,230,200,.2)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + 2, lsY(x, vT) + 1); g.lineTo(x + dx, lsY(x, vT) + 1); g.stroke();
      // Seitenschnitt oben (helle Papierkante) und der gefaltete Brief zwischen den Seiten
      const yT = lsY(x, vT);
      g.fillStyle = '#b9b09c'; poly(g, [[x + 3, yT - 2], [x + dx + 2, yT - 2], [x + dx + 2, yT + 2], [x + 3, yT + 2]]); g.fill();
      g.fillStyle = '#d8d0bf'; poly(g, letterWedge(b)); g.fill();
      g.strokeStyle = 'rgba(80,60,40,.5)'; g.lineWidth = 1; g.stroke();
    }
    g.fillStyle = b.col; libQuad(g, x, x1, vT, vB, dx); g.fill();
    const gr = g.createLinearGradient(x + dx, 0, x1 + dx, 0); gr.addColorStop(0, 'rgba(0,0,0,.42)'); gr.addColorStop(.38, 'rgba(255,255,255,.07)'); gr.addColorStop(.7, 'rgba(0,0,0,.05)'); gr.addColorStop(1, 'rgba(0,0,0,.5)');
    g.fillStyle = gr; libQuad(g, x, x1, vT, vB, dx); g.fill();
    // Bünde / Linien
    const r = rnd(b.id, 11), band = r > .5 ? 'rgba(225,200,140,.22)' : 'rgba(0,0,0,.35)';
    g.strokeStyle = band; g.lineWidth = Math.max(1, 2.2 * s);
    libLine(g, x, x1, vT + 14, dx); if (r > .3) libLine(g, x, x1, vT + 21, dx); libLine(g, x, x1, vB - 20, dx);
    // unleserlicher Titel (Goldprägung)
    if (bw > 9) {
      g.fillStyle = 'rgba(220,200,150,.30)';
      const cx = x + dx + bw * .5, kind = rnd(b.id, 12);
      if (kind < .5) { const y0 = lsY(cx, vT + 34), y1 = lsY(cx, vT + 34 + (vB - vT) * (.3 + .2 * rnd(b.id, 13))); g.fillRect(cx - 1.2 * s, y0, 2.4 * s, y1 - y0); }
      else { const n = 2 + Math.floor(rnd(b.id, 14) * 3); for (let k = 0; k < n; k++) { const yy = lsY(cx, vT + 36 + k * 12); g.fillRect(cx - bw * .22, yy, bw * .44, 2.6 * s); } }
    }
    // Signatur-Etikett der Bibliothek
    if (b.target || (bw > 8 && rnd(b.id, 15) > .25)) {
      const lx0 = x + dx + bw * .16, lx1 = x + dx + bw * .84;
      g.fillStyle = 'rgba(208,200,180,.62)'; poly(g, [[lx0, lsY(lx0 - dx, vB - 52)], [lx1, lsY(lx1 - dx, vB - 52)], [lx1, lsY(lx1 - dx, vB - 30)], [lx0, lsY(lx0 - dx, vB - 30)]]); g.fill();
      g.fillStyle = 'rgba(30,30,35,.55)'; const lc = (lx0 + lx1) / 2; g.fillRect(lc - bw * .2, lsY(lc, vB - 46), bw * .4, 2 * s); g.fillRect(lc - bw * .14, lsY(lc, vB - 39), bw * .28, 2 * s);
    }
  }
  function letterWedge(b) { // gefaltete Briefkante, die oben aus dem Buch ragt
    const x = b.x, yT = lsY(x, b.vT), s = lsS(x), xa = x + 4, xb = x + b.dx + b.bw * .58;
    return [[xa, yT + 1], [xa + 2, yT - 13 * s], [xb - 6, yT - 18 * s], [xb, yT + 1]];
  }
  function libBase(g, L) {
    // Rückwand / Dunkel hinter den Büchern
    g.fillStyle = '#0c0a08'; g.fillRect(-PAD, -PAD, LW, LH);
    // Decke + Gang rechts
    const cg = g.createLinearGradient(0, -PAD, 0, 700); cg.addColorStop(0, '#07080b'); cg.addColorStop(1, '#0e1016'); g.fillStyle = cg; g.fillRect(LIB.XE - 40, -PAD, W + PAD - LIB.XE + 40, H + 2 * PAD);
    // Fenster am Ende des Ganges (Mondlicht)
    const wx0 = 990, wx1 = 1210, wy0 = 300, wy1 = 1210;
    const wg = g.createLinearGradient(wx0, wy0, wx1, wy1); wg.addColorStop(0, '#46546e'); wg.addColorStop(1, '#222b3c'); g.fillStyle = wg;
    g.beginPath(); g.moveTo(wx0, wy1); g.lineTo(wx0, wy0 + 110); g.quadraticCurveTo((wx0 + wx1) / 2, wy0 - 60, wx1, wy0 + 110); g.lineTo(wx1, wy1); g.closePath(); g.fill();
    g.strokeStyle = '#0d0f14'; g.lineWidth = 12; g.stroke(); g.lineWidth = 8;
    for (const f of [.5]) { g.beginPath(); g.moveTo(lerp(wx0, wx1, f), wy0); g.lineTo(lerp(wx0, wx1, f), wy1); g.stroke(); }
    for (const f of [.3, .55, .8]) { g.beginPath(); g.moveTo(wx0, lerp(wy0, wy1, f)); g.lineTo(wx1, lerp(wy0, wy1, f)); g.stroke(); }
    // Boden im Gang mit Mondlicht-Streifen
    const fg = g.createLinearGradient(0, 1250, 0, H + PAD); fg.addColorStop(0, '#0f1117'); fg.addColorStop(1, '#060608'); g.fillStyle = fg; g.fillRect(LIB.XE - 40, 1230, W + PAD, H);
    g.fillStyle = 'rgba(120,140,180,.07)'; poly(g, [[wx0 - 10, 1240], [wx1 + 40, 1240], [wx1 + 260, H + PAD], [wx0 - 420, H + PAD]]); g.fill();
    // Regalkorpus (Rückwand leicht heller als das Loch)
    g.fillStyle = '#100d0a'; poly(g, [[LIB.X0, lsY(LIB.X0, BOARD(0) - 60)], [LIB.XE, lsY(LIB.XE, BOARD(0) - 60)], [LIB.XE, lsY(LIB.XE, BOARD(9) + 70)], [LIB.X0, lsY(LIB.X0, BOARD(9) + 70)]]); g.fill();
    // Bücher (Zielbuch zuletzt, es steht vor)
    for (const b of L.books) libBook(g, b);
    // Schatten unter jedem Brett
    for (let k = 0; k < 9; k++) {
      const v = BOARD(k) + LIB.BT;
      for (let j = 0; j < 4; j++) { g.fillStyle = `rgba(0,0,0,${.32 - j * .07})`; libQuad(g, LIB.X0, LIB.XE, v, v + 10 + j * 12); g.fill(); }
    }
    if (L.target) libBook(g, L.target);
    // Bretter
    for (let k = 0; k <= 9; k++) {
      const v = BOARD(k);
      g.fillStyle = '#2e241b'; libQuad(g, LIB.X0, LIB.XE, v, v + LIB.BT); g.fill();
      g.strokeStyle = 'rgba(255,225,190,.16)'; g.lineWidth = 2; libLine(g, LIB.X0, LIB.XE, v + 1);
      g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 2; libLine(g, LIB.X0, LIB.XE, v + LIB.BT);
    }
    // Kranz oben + Sockel unten
    g.fillStyle = '#231b14'; libQuad(g, LIB.X0, LIB.XE, BOARD(0) - 70, BOARD(0)); g.fill();
    g.strokeStyle = 'rgba(255,225,190,.12)'; g.lineWidth = 3; libLine(g, LIB.X0, LIB.XE, BOARD(0) - 70); libLine(g, LIB.X0, LIB.XE, BOARD(0) - 30);
    g.fillStyle = '#1a140f'; libQuad(g, LIB.X0, LIB.XE, BOARD(9) + LIB.BT, BOARD(9) + 80); g.fill();
    // senkrechte Trennwände
    for (const d of LIB.DIV) {
      const dw = 34 * lsS(d);
      g.fillStyle = '#30261c'; poly(g, [[d, lsY(d, BOARD(0) - 30)], [d + dw, lsY(d + dw, BOARD(0) - 30)], [d + dw, lsY(d + dw, BOARD(9) + 30)], [d, lsY(d, BOARD(9) + 30)]]); g.fill();
      g.fillStyle = 'rgba(255,225,190,.10)'; g.fillRect(d, lsY(d, BOARD(0)), 2, lsY(d, BOARD(9)) - lsY(d, BOARD(0)));
      g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(d + dw - 2, lsY(d + dw, BOARD(0)), 3, lsY(d + dw, BOARD(9)) - lsY(d + dw, BOARD(0)));
    }
    // Seitenwange am Regalende (vom Mond angestrahlt)
    const ex = LIB.XE, ew = 26;
    g.fillStyle = '#2a2a30'; poly(g, [[ex, lsY(ex, BOARD(0) - 70)], [ex + ew, lsY(ex, BOARD(0) - 70) + 4], [ex + ew, lsY(ex, BOARD(9) + 80) - 4], [ex, lsY(ex, BOARD(9) + 80)]]); g.fill();
    g.fillStyle = 'rgba(150,170,210,.25)'; g.fillRect(ex + ew - 4, lsY(ex, BOARD(0) - 70) + 4, 4, lsY(ex, BOARD(9) + 80) - lsY(ex, BOARD(0) - 70) - 8);
  }
  function libLayers(ts, tx) {
    const L = libLayout(ts, tx), key = 'lib|' + ts + '|' + Math.round(tx);
    let base = null;
    const getBase = () => base || (base = (() => { const cv = mkCv(LW, LH), g = cv.getContext('2d'); g.translate(PAD, PAD); libBase(g, L); return cv; })());
    const lit = layer(key + '|lit', g => {
      const bs = getBase(); g.drawImage(bs, -PAD, -PAD);
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = .75; g.drawImage(bs, -PAD, -PAD); g.globalAlpha = 1;
      g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgb(255,232,198)'; g.fillRect(-PAD, -PAD, LW, LH);
    });
    const dark = layer(key + '|dark', g => {
      g.drawImage(getBase(), -PAD, -PAD);
      const gr = g.createLinearGradient(-PAD, 0, W + PAD, 0); gr.addColorStop(0, 'rgba(3,4,9,.9)'); gr.addColorStop(.65, 'rgba(4,6,12,.82)'); gr.addColorStop(1, 'rgba(6,9,16,.66)');
      g.fillStyle = gr; g.fillRect(-PAD, -PAD, LW, LH);
      const vg = g.createLinearGradient(0, -PAD, 0, H + PAD); vg.addColorStop(0, 'rgba(0,0,0,.35)'); vg.addColorStop(.4, 'rgba(0,0,0,0)'); vg.addColorStop(.75, 'rgba(0,0,0,.1)'); vg.addColorStop(1, 'rgba(0,0,0,.5)');
      g.fillStyle = vg; g.fillRect(-PAD, -PAD, LW, LH);
      g.globalCompositeOperation = 'lighter'; spot(g, 1100, 650, 760, 'rgba(70,90,130,A)', .12);
    });
    return { L, lit, dark };
  }
  reg('library_stacks', (c, lt, b, gt) => {
    const p = b.p || EMPTY;
    const tg = p.target === false ? null : (p.target || EMPTY);
    const ts = clamp(Math.round(num(tg && tg.shelf, 3)), 1, 7), tx0 = clamp(num(tg && tg.x, 560), 80, 860), fk = fitK(b, 4.9);
    const { L, lit, dark } = libLayers(ts, tx0), T = L.target;
    const tcx = T ? T.x + T.dx + T.bw / 2 : 560, tcy = T ? (lsY(T.x, T.vT) + lsY(T.x, T.vB)) / 2 : 840;
    // Taschenlampe
    const to = p.torch === false ? null : (p.torch || EMPTY);
    let sx = tcx, sy = tcy, on = 0, R = 0;
    if (to) {
      const t0 = num(to.t0, .2 * fk), t1 = Math.max(t0 + .1, num(to.t1, 3.0 * fk)), k = E.inOut(prog(lt, t0, t1));
      const x0 = num(to.x0, 150), y0 = num(to.y0, tcy - 150), x1 = num(to.x1, tcx), y1 = num(to.y1, tcy - 10);
      sx = lerp(x0, x1, k) + noise(gt * 1.3, 11) * 10 + noise(gt * 5, 12) * 2.5; sy = lerp(y0, y1, k) + Math.sin(k * Math.PI) * -40 + noise(gt * 1.1, 13) * 8 + noise(gt * 5.5, 14) * 2;
      on = num(to.on, null) != null ? E.out(prog(lt, to.on, to.on + .25)) * (lt < to.on + .3 ? flicker(gt, 15, 22) : 1) : 1;
      R = num(to.r, 250) * (.62 + .38 * lsS(sx)) * (.98 + .02 * noise(gt * 7, 16));
    }
    blitLayer(c, dark);
    if (to && on > 0) revealEllipse(c, lit, sx, sy, R * .86, R, on, .42);
    // Brief leuchtet rot
    const at = T && tg ? tOf(tg.at, 3.3 * fk) : null, gk = at != null ? E.out(prog(lt, at, at + .6)) : 0;
    const bx = to ? num(to.sx, 930) : 0, by = to ? num(to.sy, 2150) : 0;
    if (to && on > 0) {
      drawCone(c, bx, by, sx, sy, R * 1.45, 'rgba(255,236,205,A)', .42 * on, .05);
      addSpot(c, sx, sy, R * .75, 'rgba(255,236,205,A)', .13 * on, 1.15);
    }
    if (T && gk > 0) { const pu = .8 + .2 * Math.sin(gt * 3.2); addSpot(c, tcx - 4, lsY(T.x, T.vT) + 10, 200, RED, (.2 + .25 * Math.exp(-Math.max(0, lt - at) * 4)) * gk * pu, .75); }
    if (T && gk > 0) {
      const pu = .8 + .2 * Math.sin(gt * 3.2) + .05 * noise(gt * 9, 17), wd = letterWedge(T), flash = Math.exp(-Math.max(0, lt - at) * 4);
      c.save(); c.globalAlpha = gk; glow(c, 'rgba(255,32,32,1)', 20 + 18 * flash);
      c.fillStyle = `rgb(255,${150 + 80 * flash},${140 + 90 * flash})`; poly(c, wd); c.fill(); c.fill();
      noGlow(c); c.strokeStyle = 'rgba(255,50,40,.9)'; c.lineWidth = 1.5; c.stroke();
      c.strokeStyle = 'rgba(150,20,20,.45)'; c.lineWidth = 1; c.beginPath(); c.moveTo(lerp(wd[0][0], wd[3][0], .55), wd[0][1]); c.lineTo(lerp(wd[1][0], wd[2][0], .5), lerp(wd[1][1], wd[2][1], .5) + 1); c.stroke();
      c.restore();
      // rote Linie an der Seitenkante des Buchs (Licht zwischen den Seiten)
      c.save(); c.globalAlpha = gk * .7 * pu; c.strokeStyle = '#ff3a32'; glow(c, 'rgba(255,32,32,1)', 12); c.lineWidth = 2;
      const ex = T.x + T.dx * .55, ey = lsY(T.x, T.vT);
      c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex, ey + (T.vB - T.vT) * lsS(T.x) * .5); c.stroke(); noGlow(c); c.restore();
    }
    // Staub im Kegel
    if (to && on > 0 && p.dust !== false) coneDust(c, gt, 21, 170, bx, by, 60, sx, sy, R * 1.45, 'rgba(255,240,220,1)', .6 * on);
    if (p.dust !== false) motes(c, gt, 22, 23, -100, 200, W + 200, 1500, 'rgba(170,185,215,1)', .12, 2);
    // Texte
    const lab = txtParam(p.label, 'WICHITA PUBLIC LIBRARY', .3 * fk), tx = txtParam(p.text, 'OCTOBER 1974', 4.0 * fk);
    if (tx) typeText(c, lt, gt, tx.s, tx.at, { y: num(p.textY, 1265), size: 86 });
    if (lab) labelText(c, lt, gt, lab.s, lab.at, { y: num(p.labelY, 1345) });
  });

  // =====================================================================
  // 3D-Hilfen (Meter, Z oben) für parking_lot
  // =====================================================================
  function mkCam(o) {
    const cp = Math.cos(o.pitch), sp = Math.sin(o.pitch), cy = Math.cos(o.yaw || 0), sy = Math.sin(o.yaw || 0);
    const F = [sy * cp, cy * cp, -sp], R = [cy, -sy, 0], U = [sy * sp, cy * sp, cp];
    const P = (X, Y, Z) => { const dx = X - o.x, dy = Y - o.y, dz = Z - o.z, d = Math.max(.08, dx * F[0] + dy * F[1] + dz * F[2]);
      return [o.cx + o.f * (dx * R[0] + dy * R[1]) / d, o.cy - o.f * (dx * U[0] + dy * U[1] + dz * U[2]) / d, d]; };
    return { o, P, pos: [o.x, o.y, o.z], f: o.f, hz: o.cy - o.f * Math.tan(o.pitch) };
  }
  const v3sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const v3dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const v3cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const v3norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  // lokale Koordinaten (u vorne, v links, z oben) → Welt; T = {x, y, z, h (Kurs), tilt (Kippen um v)}
  function toW(T, q) {
    let u = q[0], z = q[2]; const v = q[1];
    if (T.tilt) { const ct = Math.cos(T.tilt), st = Math.sin(T.tilt), u2 = u * ct - z * st; z = u * st + z * ct; u = u2; }
    const ch = Math.cos(T.h || 0), sh = Math.sin(T.h || 0);
    return [T.x + u * ch - v * sh, T.y + u * sh + v * ch, (T.z || 0) + z];
  }
  const PW = (cam, T, q) => { const w = toW(T, q); return cam.P(w[0], w[1], w[2]); };
  const rgbS = (c, k = 1) => `rgb(${Math.round(clamp(c[0] * k, 0, 255))},${Math.round(clamp(c[1] * k, 0, 255))},${Math.round(clamp(c[2] * k, 0, 255))})`;
  // Fläche nur zeichnen, wenn sie zur Kamera zeigt; nLoc = lokale Normale, sonst nach außen vom Körpermittelpunkt ctr
  function face3(g, cam, T, verts, col, light, nLoc, ctr) {
    const w = verts.map(q => toW(T, q));
    let n = v3cross(v3sub(w[1], w[0]), v3sub(w[2], w[0]));
    if (nLoc) { const nw = v3sub(toW(T, nLoc), toW(T, [0, 0, 0])); if (v3dot(n, nw) < 0) n = [-n[0], -n[1], -n[2]]; }
    else if (ctr) { const cw = toW(T, ctr), k = 1 / w.length, fc = w.reduce((a, q) => [a[0] + q[0] * k, a[1] + q[1] * k, a[2] + q[2] * k], [0, 0, 0]); if (v3dot(n, v3sub(fc, cw)) < 0) n = [-n[0], -n[1], -n[2]]; }
    if (v3dot(n, v3sub(cam.pos, w[0])) <= 0) return null;
    const pts = w.map(q => cam.P(q[0], q[1], q[2]));
    if (col) { g.fillStyle = typeof col === 'string' ? col : rgbS(col, light ? light(v3norm(n), w[0]) : 1); poly(g, pts); g.fill(); }
    return pts;
  }
  function boxF(u0, u1, v0, v1, z0, z1) {
    return { top: [[u0, v0, z1], [u1, v0, z1], [u1, v1, z1], [u0, v1, z1]],
      front: [[u1, v0, z0], [u1, v1, z0], [u1, v1, z1], [u1, v0, z1]], back: [[u0, v0, z0], [u0, v1, z0], [u0, v1, z1], [u0, v0, z1]],
      left: [[u0, v1, z0], [u1, v1, z0], [u1, v1, z1], [u0, v1, z1]], right: [[u0, v0, z0], [u1, v0, z0], [u1, v0, z1], [u0, v0, z1]] };
  }
  function box3(g, cam, T, B, col, light, cols) {
    const F = boxF(...B), ctr = [(B[0] + B[1]) / 2, (B[2] + B[3]) / 2, (B[4] + B[5]) / 2], out = {};
    for (const k of ['back', 'front', 'left', 'right', 'top']) out[k] = face3(g, cam, T, F[k], (cols && cols[k]) || col, light, null, ctr);
    return out;
  }
  function disc3(g, cam, T, cu, cv, cz, r, col, n = 16) { const pts = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; pts.push(PW(cam, T, [cu + Math.cos(a) * r, cv, cz + Math.sin(a) * r])); } g.fillStyle = col; poly(g, pts); g.fill(); }
  function wheel3(g, cam, T, wu, wv, r, col, hub) { disc3(g, cam, T, wu, wv, r, r, col); if (hub) disc3(g, cam, T, wu, wv + Math.sign(wv) * .02, r, r * .48, hub, 12); }
  function arch3(g, cam, T, wu, sv, r) { const pts = []; for (let i = 0; i <= 12; i++) { const an = Math.PI * i / 12; pts.push(PW(cam, T, [wu + Math.cos(an) * (r + .1), sv, r + Math.sin(an) * (r + .1)])); } g.fillStyle = 'rgb(5,5,6)'; poly(g, pts); g.fill(); }
  function groundShadow(g, cam, T, a, b, col) { const sp = [[-a, -b], [a, -b], [a, b], [-a, b]].map(q => PW(cam, T, [q[0], q[1], .005])); g.fillStyle = col; poly(g, sp); g.fill(); }

  // kantiger SUV (Silhouette im Stil eines frühen Kompakt-SUVs, ohne Logos)
  function suv3(g, cam, T, o = {}) {
    const a = 2.12, b = .89, z0 = .36, z1 = 1.0, zr = 1.64, br = .79, uw = .95, ur = .44, ub = -2.08;
    const L = o.light, body = o.body || [30, 31, 34], glass = o.glass || [44, 50, 60], tire = o.tire || 'rgb(10,10,12)';
    if (o.shadow !== false) { groundShadow(g, cam, T, a + .35, b + .3, 'rgba(0,0,0,.25)'); groundShadow(g, cam, T, a + .1, b + .08, o.shadow || 'rgba(0,0,0,.5)'); }
    for (const wu of [1.3, -1.3]) wheel3(g, cam, T, wu, b - .1, .37, tire);
    box3(g, cam, T, [-a + .25, a - .3, -b + .1, b - .1, .1, z0 + .02], 'rgb(7,7,9)'); // Unterboden: kein Durchblick unter dem Wagen
    const edge = fs => { if (!o.edge) return; g.save(); g.strokeStyle = o.edge; g.lineWidth = o.edgeW || 1.6; g.lineJoin = 'round'; for (const f of fs) if (f) { poly(g, f); g.stroke(); } g.restore(); };
    const lo = box3(g, cam, T, [-a, a, -b, b, z0, z1], body, L);
    edge([lo.top, lo.back, lo.left, lo.right, lo.front]);
    const ctr = [-.8, 0, 1.3];
    const sideR = [[ub - .02, -b + .03, z1], [uw, -b + .03, z1], [ur, -br, zr], [ub, -br, zr]], sideL = sideR.map(q => [q[0], -q[1], q[2]]);
    const fR = face3(g, cam, T, sideR, body, L, null, ctr), fL = face3(g, cam, T, sideL, body, L, null, ctr);
    const fW = face3(g, cam, T, [[uw, -b + .03, z1], [uw, b - .03, z1], [ur, br, zr], [ur, -br, zr]], glass, L, null, ctr);
    const fB = face3(g, cam, T, [[ub - .02, -b + .03, z1], [ub - .02, b - .03, z1], [ub, br, zr], [ub, -br, zr]], body, L, null, ctr);
    const fT = face3(g, cam, T, [[ub, -br, zr], [ur, -br, zr], [ur, br, zr], [ub, br, zr]], body, L, null, ctr);
    edge([fR, fL, fW, fB, fT]);
    const vAt = (z, s) => s * (lerp(b - .03, br, (z - z1) / (zr - z1)) + .012), uA = z => lerp(uw, ur, (z - z1) / (zr - z1));
    const zA = z1 + .07, zB = zr - .07;
    for (const [s, fc] of [[-1, fR], [1, fL]]) if (fc) for (const [w0, w1] of [[ub + .12, -1.38], [-1.28, -.34], [-.24, 0]]) {
      const f0 = w1 === 0; face3(g, cam, T, [[w0, vAt(zA, s), zA], [f0 ? uA(zA) - .1 : w1, vAt(zA, s), zA], [f0 ? uA(zB) - .08 : w1, vAt(zB, s), zB], [w0, vAt(zB, s), zB]], glass, L, [0, s, 0]);
    }
    if (fB) face3(g, cam, T, [[ub - .035, -br + .1, z1 + .08], [ub - .035, br - .1, z1 + .08], [ub - .015, br - .12, zr - .08], [ub - .015, -br + .12, zr - .08]], glass, L, [-1, 0, 0]);
    if (lo.back) { for (const s of [-1, 1]) face3(g, cam, T, [[-a - .01, s * .64, .56], [-a - .01, s * .86, .56], [-a - .01, s * .86, .95], [-a - .01, s * .64, .95]], o.tail || [96, 16, 18], null, [-1, 0, 0]);
      face3(g, cam, T, [[-a - .02, -b, .36], [-a - .02, b, .36], [-a - .02, b, .5], [-a - .02, -b, .5]], [14, 14, 16], L, [-1, 0, 0]); }
    if (lo.front) { for (const s of [-1, 1]) face3(g, cam, T, [[a + .01, s * .52, .62], [a + .01, s * .82, .62], [a + .01, s * .82, .84], [a + .01, s * .52, .84]], o.head || [120, 120, 112], null, [1, 0, 0]);
      face3(g, cam, T, [[a + .01, -.46, .6], [a + .01, .46, .6], [a + .01, .46, .87], [a + .01, -.46, .87]], [12, 12, 14], null, [1, 0, 0]); }
    if (fT) { const d = PW(cam, T, [0, 0, zr])[2]; g.strokeStyle = o.rail || 'rgba(6,6,8,.95)'; g.lineWidth = Math.max(1.2, cam.f * .06 / d); g.lineCap = 'round';
      for (const s of [-1, 1]) { const A = PW(cam, T, [ub + .18, s * .6, zr + .06]), B2 = PW(cam, T, [ur - .22, s * .6, zr + .06]); g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B2[0], B2[1]); g.stroke(); } }
    for (const [s, fc] of [[-1, lo.right], [1, lo.left]]) if (fc) for (const wu of [1.3, -1.3]) { arch3(g, cam, T, wu, s * (b + .005), .37); wheel3(g, cam, T, wu, s * (b + .01), .37, tire, o.hub || 'rgb(34,34,38)'); }
    return { lo, top: fT };
  }
  // Pickup (Seitenansicht leicht von oben, offene Ladefläche). inBed() zeichnet, was in der Ladefläche liegt.
  const PU = { a: 2.75, b: 1.0, zb: .5, zc: 1.18, zg: 1.95, ub: .12, t: .07, zf: .8, zw: 1.32 };
  function pickup3(g, cam, T, o, inBed) {
    const { a, b, zb, zc, zg, ub, t, zf, zw } = PU, L = o.light, body = o.body || [52, 50, 48], tire = 'rgb(9,9,11)', glass = [30, 34, 40];
    groundShadow(g, cam, T, a + .45, b + .4, 'rgba(0,0,0,.22)'); groundShadow(g, cam, T, a + .15, b + .1, 'rgba(0,0,0,.5)');
    for (const wu of [1.85, -1.75]) wheel3(g, cam, T, wu, b - .12, .42, tire);
    // Fahrerhaus + Haube
    const cb = box3(g, cam, T, [ub + .06, a, -b, b, zb, zc], body, L);
    const ctr = [1.0, 0, 1.5], gr0 = .2, gr1 = 1.72, gt0 = .28, gt1 = 1.22, gv = b - .08;
    const gs = s => [[gr0, s * (b - .02), zc], [gr1, s * (b - .02), zc], [gt1, s * gv, zg], [gt0, s * gv, zg]];
    const sR = face3(g, cam, T, gs(-1), body, L, null, ctr), sL = face3(g, cam, T, gs(1), body, L, null, ctr);
    face3(g, cam, T, [[gr1, -b + .02, zc], [gr1, b - .02, zc], [gt1, gv, zg], [gt1, -gv, zg]], glass, L, null, ctr);
    const rB = face3(g, cam, T, [[gr0, -b + .02, zc], [gr0, b - .02, zc], [gt0, gv, zg], [gt0, -gv, zg]], body, L, null, ctr);
    face3(g, cam, T, [[gt0, -gv, zg], [gt1, -gv, zg], [gt1, gv, zg], [gt0, gv, zg]], body, L, null, ctr);
    const vA = (z, s) => s * (lerp(b - .02, gv, (z - zc) / (zg - zc)) + .01);
    for (const [s, fc] of [[-1, sR], [1, sL]]) if (fc) { const z0 = zc + .07, z1 = zg - .07, u1 = z => lerp(gr1, gt1, (z - zc) / (zg - zc)) - .1;
      face3(g, cam, T, [[gr0 + .12, vA(z0, s), z0], [u1(z0), vA(z0, s), z0], [u1(z1), vA(z1, s), z1], [gt0 + .1, vA(z1, s), z1]], glass, L, [0, s, 0]); }
    if (rB) face3(g, cam, T, [[gr0 - .01, -.6, zc + .12], [gr0 - .01, .6, zc + .12], [gt0 - .03, .55, zg - .1], [gt0 - .03, -.55, zg - .1]], glass, L, [-1, 0, 0]);
    // Ladefläche innen
    const bedC = [34, 32, 30], inC = [44, 42, 40];
    const fl = face3(g, cam, T, [[-a + t, -b + t, zf], [ub - t, -b + t, zf], [ub - t, b - t, zf], [-a + t, b - t, zf]], bedC, L, [0, 0, 1]);
    if (fl) { g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.5; for (let v = -b + .2; v < b - .1; v += .16) { const A = PW(cam, T, [-a + t, v, zf]), B2 = PW(cam, T, [ub - t, v, zf]); g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B2[0], B2[1]); g.stroke(); } }
    face3(g, cam, T, [[-a + t, b - t, zf], [ub - t, b - t, zf], [ub - t, b - t, zw], [-a + t, b - t, zw]], inC, L, [0, -1, 0]);
    face3(g, cam, T, [[ub - t, -b + t, zf], [ub - t, b - t, zf], [ub - t, b - t, zw], [ub - t, -b + t, zw]], inC, L, [-1, 0, 0]);
    face3(g, cam, T, [[-a + t, -b + t, zf], [-a + t, b - t, zf], [-a + t, b - t, zw], [-a + t, -b + t, zw]], inC, L, [1, 0, 0]);
    const rail = [86, 82, 78];
    face3(g, cam, T, [[-a, b - t, zw], [ub, b - t, zw], [ub, b, zw], [-a, b, zw]], rail, L, [0, 0, 1]);
    face3(g, cam, T, [[ub - t, -b, zw], [ub, -b, zw], [ub, b, zw], [ub - t, b, zw]], rail, L, [0, 0, 1]);
    face3(g, cam, T, [[-a, -b, zw], [-a + t, -b, zw], [-a + t, b, zw], [-a, b, zw]], rail, L, [0, 0, 1]);
    if (inBed) inBed();
    // nahe Bordwand, Heckklappe
    const nw = face3(g, cam, T, [[-a, -b, zb], [ub, -b, zb], [ub, -b, zw], [-a, -b, zw]], body, L, [0, -1, 0]);
    face3(g, cam, T, [[-a, -b, zw], [ub, -b, zw], [ub, -b + t, zw], [-a, -b + t, zw]], rail, L, [0, 0, 1]);
    const tg = face3(g, cam, T, [[-a, -b, zb], [-a, b, zb], [-a, b, zw], [-a, -b, zw]], body, L, [-1, 0, 0]);
    if (tg) { for (const s of [-1, 1]) face3(g, cam, T, [[-a - .01, s * (b - .03), .82], [-a - .01, s * (b - .2), .82], [-a - .01, s * (b - .2), 1.22], [-a - .01, s * (b - .03), 1.22]], [90, 14, 16], null, [-1, 0, 0]);
      face3(g, cam, T, [[-a - .03, -b, .42], [-a - .03, b, .42], [-a - .03, b, .58], [-a - .03, -b, .58]], [20, 20, 22], L, [-1, 0, 0]); }
    // Radläufe + nahe Räder
    if (cb.right || nw) for (const wu of [1.85, -1.75]) { arch3(g, cam, T, wu, -b - .005, .42); wheel3(g, cam, T, wu, -b - .01, .42, tire, 'rgb(40,40,44)'); }
    if (cb.right) { // Türfuge, Griff, Spiegel
      g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 1.5; const d0 = PW(cam, T, [ub + .25, -b - .005, zb + .08]), d1 = PW(cam, T, [ub + .25, -b - .005, zc]), d2 = PW(cam, T, [1.62, -b - .005, zc]), d3 = PW(cam, T, [1.62, -b - .005, zb + .08]);
      g.beginPath(); g.moveTo(d0[0], d0[1]); g.lineTo(d1[0], d1[1]); g.moveTo(d3[0], d3[1]); g.lineTo(d2[0], d2[1]); g.stroke();
      face3(g, cam, T, [[ub + .4, -b - .01, 1.02], [ub + .6, -b - .01, 1.02], [ub + .6, -b - .01, 1.07], [ub + .4, -b - .01, 1.07]], [18, 18, 20], null, [0, -1, 0]);
      box3(g, cam, T, [1.52, 1.66, -b - .2, -b, 1.24, 1.42], [26, 26, 28], L);
    }
    if (cb.front) { face3(g, cam, T, [[a + .01, -.5, .7], [a + .01, .5, .7], [a + .01, .5, 1.0], [a + .01, -.5, 1.0]], [14, 14, 16], null, [1, 0, 0]); }
  }
  // Müllkorb (Zylinder, oben offen)
  function canGeo(cam, X, Y) {
    const r = .33, h = .98, top = cam.P(X, Y, h), bot = cam.P(X, Y, 0); top[0] = bot[0]; // senkrecht wie die Figuren
    const rxT = cam.f * r / top[2], rxB = cam.f * r / bot[2];
    const ryT = Math.abs(cam.P(X, Y - r, h)[1] - cam.P(X, Y + r, h)[1]) / 2, ryB = Math.abs(cam.P(X, Y - r, 0)[1] - cam.P(X, Y + r, 0)[1]) / 2;
    return { top, bot, rxT, rxB, ryT, ryB, X, Y, h };
  }
  function canBack(g, G, lit) {
    g.save(); g.fillStyle = '#2b2d2a'; g.beginPath(); g.ellipse(G.top[0], G.top[1], G.rxT * 1.04, G.ryT * 1.08, 0, 0, TAU); g.fill();
    g.fillStyle = '#050505'; g.beginPath(); g.ellipse(G.top[0], G.top[1] + G.ryT * .04, G.rxT * .9, G.ryT * .82, 0, 0, TAU); g.fill();
    if (lit) { g.fillStyle = 'rgba(255,170,100,.08)'; g.beginPath(); g.ellipse(G.top[0], G.top[1] - G.ryT * .3, G.rxT * .7, G.ryT * .35, 0, 0, TAU); g.fill(); }
    g.restore();
  }
  function canFront(g, G) {
    const { top: T0, bot: B0, rxT, rxB, ryT, ryB } = G;
    g.save(); g.beginPath(); g.moveTo(T0[0] - rxT, T0[1]); g.ellipse(T0[0], T0[1], rxT, ryT, 0, Math.PI, 0, true); g.lineTo(B0[0] + rxB, B0[1]); g.ellipse(B0[0], B0[1], rxB, ryB, 0, 0, Math.PI, false); g.closePath();
    const gr = g.createLinearGradient(T0[0] - rxT, 0, T0[0] + rxT, 0); gr.addColorStop(0, '#121412'); gr.addColorStop(.55, '#30332f'); gr.addColorStop(.8, '#4a4640'); gr.addColorStop(1, '#1d1e1b');
    g.fillStyle = gr; g.fill(); g.clip();
    g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = Math.max(1, rxT * .05);
    for (let i = 1; i < 12; i++) { const an = Math.PI * i / 12, x0 = T0[0] - Math.cos(an) * rxT, x1 = B0[0] - Math.cos(an) * rxB; g.beginPath(); g.moveTo(x0, T0[1] + Math.sin(an) * ryT); g.lineTo(x1, B0[1] + Math.sin(an) * ryB); g.stroke(); }
    g.restore();
    g.save(); g.strokeStyle = '#5a5650'; g.lineWidth = Math.max(1.5, rxT * .08); g.beginPath(); g.ellipse(T0[0], T0[1], rxT, ryT, 0, 0, Math.PI); g.stroke(); g.restore();
  }
  // Cornflakes-Schachtel (ohne Marke): Vorderseite mit rotem Band und heller Schale
  const CB = { w: .3, d: .1, h: .42 };
  function cereal3(g, cam, T, L, glowA = 0) {
    const { w, d, h } = CB, ctr = [0, 0, h / 2];
    const base = [176, 150, 98], side = [150, 126, 82];
    const F = boxF(-w / 2, w / 2, -d / 2, d / 2, 0, h);
    const drawn = [];
    for (const k of ['back', 'front', 'left', 'right', 'top']) { const pts = face3(g, cam, T, F[k], k === 'top' ? [140, 120, 86] : (k === 'left' || k === 'right') ? base : side, L, null, ctr); if (pts) drawn.push([k, pts]); }
    for (const [k, pts] of drawn) if (k === 'left' || k === 'right') { // große Seiten: Design
      const s = k === 'left' ? 1 : -1, vv = s * (d / 2 + .002);
      face3(g, cam, T, [[-w / 2, vv, h * .78], [w / 2, vv, h * .78], [w / 2, vv, h * .97], [-w / 2, vv, h * .97]], [150, 32, 28], L, [0, s, 0]);
      const pts2 = []; for (let i = 0; i < 14; i++) { const an = i / 14 * TAU; pts2.push(PW(cam, T, [Math.cos(an) * w * .3, vv, h * .4 + Math.sin(an) * h * .17])); }
      g.fillStyle = 'rgba(232,226,210,.85)'; poly(g, pts2); g.fill();
      const pts3 = []; for (let i = 0; i <= 8; i++) { const an = Math.PI * i / 8; pts3.push(PW(cam, T, [Math.cos(an) * w * .26, vv, h * .37 - Math.sin(an) * h * .1])); }
      g.fillStyle = 'rgba(120,96,60,.7)'; poly(g, pts3); g.fill();
      if (glowA > 0) { g.save(); g.globalAlpha = glowA; glow(g, 'rgba(255,32,32,1)', 22); g.strokeStyle = 'rgba(255,60,50,.95)'; g.lineWidth = 2.5; poly(g, pts); g.stroke(); noGlow(g); g.restore(); }
    }
  }

  // ---------- Silhouette eines Menschen im Profil (gehend, greifend) ----------
  function ik2(sx, sy, tx, ty, l1, l2, bend) {
    const dx = tx - sx, dy = ty - sy, D = clamp(Math.hypot(dx, dy), Math.abs(l1 - l2) + .01, l1 + l2 - .01), th = Math.atan2(dy, dx);
    const al = Math.acos(clamp((l1 * l1 + D * D - l2 * l2) / (2 * l1 * D), -1, 1)), e = th + bend * al;
    const ex = sx + Math.cos(e) * l1, ey = sy + Math.sin(e) * l1;
    return [ex, ey, sx + Math.cos(th) * D, sy + Math.sin(th) * D];
  }
  function personShape(c, x, y, h, o, col) {
    const d = o.dir || 1, ph = o.phase || 0, wk = clamp(o.walk || 0);
    c.fillStyle = col; c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round';
    const legs = [0, Math.PI].map(off => {
      const s = Math.sin(ph + off) * wk, th = s * .44 + (off ? -1 : 1) * .075 * (1 - wk), kn = wk * (.12 + .5 * Math.max(0, Math.sin(ph + off + 1.9))) + .03;
      const kx = d * Math.sin(th) * h * .25, ky = Math.cos(th) * h * .25, fx = kx + d * Math.sin(th - kn) * h * .25, fy = ky + Math.cos(th - kn) * h * .25;
      return [kx, ky, fx, fy];
    });
    const lift = Math.max(legs[0][3], legs[1][3]), hipY = y - lift, hx = x, shY = hipY - h * .315, sx = x + d * h * (.012 + (o.lean || 0) * .05);
    const leg = (L, k) => { c.save(); c.lineWidth = h * .092; c.beginPath(); c.moveTo(hx, hipY); c.lineTo(hx + L[0], hipY + L[1]); c.lineTo(hx + L[2], hipY + L[3]); c.stroke();
      c.lineWidth = h * .056; c.beginPath(); c.moveTo(hx + L[2] - d * h * .02, hipY + L[3] - h * .014); c.lineTo(hx + L[2] + d * h * .062, hipY + L[3] - h * .008); c.stroke(); c.restore(); };
    const arm = (k, near) => {
      const s = Math.sin(ph + (k ? 0 : Math.PI)) * wk, ax = sx - d * h * .01, ay = shY + h * .03, l1 = h * .175, l2 = h * .17;
      let ex, ey, hx2, hy2;
      if (near && o.reach) { [ex, ey, hx2, hy2] = ik2(ax, ay, o.reach[0], o.reach[1], l1, l2, -d); }
      else if (near && o.hold) { ex = ax + d * h * .02; ey = ay + l1 * .95; hx2 = ex + d * l2 * .85; hy2 = ey - l2 * .3; }
      else { const a1 = -s * .42, a2 = a1 - .18 - .25 * Math.max(0, -s); ex = ax + d * Math.sin(a1) * l1; ey = ay + Math.cos(a1) * l1; hx2 = ex + d * Math.sin(a2) * l2; hy2 = ey + Math.cos(a2) * l2; }
      c.lineWidth = h * .074; c.beginPath(); c.moveTo(ax, ay); c.lineTo(ex, ey); c.lineTo(hx2, hy2); c.stroke();
      c.beginPath(); c.arc(hx2, hy2, h * .038, 0, TAU); c.fill();
      return [hx2, hy2];
    };
    leg(legs[1], 1); arm(1, false);
    // Rumpf (Jacke)
    const bx = (u, v) => [x + d * u * h, v];
    c.beginPath();
    let q = bx(-.085, shY + h * .02); c.moveTo(q[0], q[1]);
    q = bx(-.01, shY - h * .02); let q2 = bx(.075, shY + h * .025); c.quadraticCurveTo(q[0], q[1], q2[0], q2[1]);
    q = bx(.11, shY + h * .13); q2 = bx(.09, hipY + h * .03); c.quadraticCurveTo(q[0], q[1], q2[0], q2[1]);
    q = bx(.095, hipY + h * .12); c.lineTo(q[0], q[1]);
    q = bx(-.09, hipY + h * .12); c.lineTo(q[0], q[1]);
    q = bx(-.115, hipY - h * .1); q2 = bx(-.085, shY + h * .02); c.quadraticCurveTo(q[0], q[1], q2[0], q2[1]);
    c.closePath(); c.fill();
    // Hals + Kopf
    c.fillRect(sx - h * .032, shY - h * .07, h * .064, h * .08);
    const hdx = sx + d * h * .012, hdy = shY - h * .11 + (o.nod || 0) * h * .01;
    c.beginPath(); c.ellipse(hdx, hdy, h * .062, h * .07, 0, 0, TAU); c.fill();
    if (o.cap) { c.beginPath(); c.ellipse(hdx, hdy - h * .025, h * .062, h * .045, 0, Math.PI, 0); c.fill(); c.beginPath(); c.moveTo(hdx + d * h * .02, hdy - h * .028); c.lineTo(hdx + d * h * .105, hdy - h * .018); c.lineTo(hdx + d * h * .1, hdy - h * .008); c.lineTo(hdx, hdy - h * .012); c.closePath(); c.fill(); }
    leg(legs[0], 0);
    return { hand: arm(0, true), head: [hdx, hdy] };
  }
  function person(c, x, y, h, o) {
    if (o.rim) { c.save(); c.globalAlpha *= o.rimA != null ? o.rimA : 1; personShape(c, x + (o.rimDx || 0) * h * .012, y + (o.rimDy || -1) * h * .006, h, o, o.rim); c.restore(); }
    return personShape(c, x, y, h, o, o.col || '#030304');
  }
  // Weg über Stützpunkte [[t, X, Y], ...] mit weichen Übergängen; liefert Position, Tempo, Richtung
  function pathAt(keys, t) {
    if (t <= keys[0][0]) return { X: keys[0][1], Y: keys[0][2], v: 0, dx: 0 };
    for (let i = 0; i < keys.length - 1; i++) { const A = keys[i], B = keys[i + 1]; if (t <= B[0]) {
      const k = (t - A[0]) / Math.max(1e-3, B[0] - A[0]), e = k * k * (3 - 2 * k), de = 6 * k * (1 - k) / Math.max(1e-3, B[0] - A[0]);
      const dist = Math.hypot(B[1] - A[1], B[2] - A[2]);
      return { X: lerp(A[1], B[1], e), Y: lerp(A[2], B[2], e), v: dist * de, dx: Math.sign(B[1] - A[1]) }; } }
    const Z = keys[keys.length - 1]; return { X: Z[1], Y: Z[2], v: 0, dx: 0 };
  }
  // zurückgelegte Strecke (für die Schrittphase), numerisch
  function pathDist(keys, t) { let s = 0, prev = pathAt(keys, keys[0][0]); const n = 24, t0 = keys[0][0], t1 = Math.min(t, keys[keys.length - 1][0]); if (t1 <= t0) return 0;
    for (let i = 1; i <= n; i++) { const q = pathAt(keys, lerp(t0, t1, i / n)); s += Math.hypot(q.X - prev.X, q.Y - prev.Y); prev = q; } return s; }

  // =====================================================================
  // 2) parking_lot – Baumarkt-Parkplatz bei Nacht (Natriumdampf), Modi truck | trash | cctv | driveway
  // =====================================================================
  const SODIUM = 'rgba(255,168,92,A)';
  const camTruck = () => mkCam({ x: -.62, y: -7.6, z: 4.2, pitch: .45, yaw: 0, f: 940, cx: 540, cy: 1000 });
  const LAMP_T = [2.4, 4.6, 7.4];
  const lightNight = (Ld) => (n) => .3 + .75 * Math.max(0, v3dot(n, Ld)) + .1 * Math.max(0, n[2]);
  const LDIR_T = v3norm([.45, -.55, 1]);
  function groundPool(g, cam, X, Y, R, col, a) {
    const c0 = cam.P(X, Y, 0), rx = Math.abs(cam.P(X + R, Y, 0)[0] - cam.P(X - R, Y, 0)[0]) / 2, ry = Math.abs(cam.P(X, Y + R, 0)[1] - cam.P(X, Y - R, 0)[1]) / 2;
    if (c0[2] < .3) return; g.save(); g.translate(c0[0], c0[1]); g.scale(1, Math.max(.05, ry / Math.max(1, rx))); spot(g, 0, 0, rx, col, a); g.restore();
  }
  function lotLine(g, cam, X0, Y0, X1, Y1, wM, col) { // Bodenmarkierung als Fläche (Breite in Metern)
    const dx = X1 - X0, dy = Y1 - Y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L * wM / 2, ny = dx / L * wM / 2;
    const pts = [cam.P(X0 + nx, Y0 + ny, 0), cam.P(X1 + nx, Y1 + ny, 0), cam.P(X1 - nx, Y1 - ny, 0), cam.P(X0 - nx, Y0 - ny, 0)];
    if (pts.some(q => q[2] < .3)) return; g.fillStyle = col; poly(g, pts); g.fill();
  }
  function lotPole(g, cam, X, Y, H, lamp, a = 1) {
    const b = cam.P(X, Y, 0), t = cam.P(X, Y, H); if (b[2] < .3) return;
    g.strokeStyle = 'rgba(10,10,12,.95)'; g.lineWidth = Math.max(1, cam.f * .16 / b[2]); g.beginPath(); g.moveTo(b[0], b[1]); g.lineTo(t[0], t[1]); g.stroke();
    if (lamp) { const l = cam.P(X, Y, H + .1), r = Math.max(2, cam.f * .5 / l[2]); g.fillStyle = '#1a1612'; g.fillRect(l[0] - r, l[1] - r * .4, r * 2, r * .5);
      g.save(); g.globalCompositeOperation = 'lighter'; spot(g, l[0], l[1] + r * .1, Math.min(160, r * 9), SODIUM, .2 * a); spot(g, l[0], l[1] + r * .1, Math.min(40, r * 2.2), 'rgba(255,214,160,A)', .7 * a); g.restore(); }
  }
  // ferne Laden-Fassade (ohne Logos): langer Kasten, heller Eingang, schlichtes oranges Band
  function storeFront(g, cam, Yd, X0, X1, Hs, ent) {
    const p = (X, Z) => cam.P(X, Yd, Z), a = p(X0, 0), b = p(X1, 0), cT = p(X1, Hs), dT = p(X0, Hs);
    g.fillStyle = '#16130f'; poly(g, [a, b, cT, dT]); g.fill();
    const s0 = p(X0, Hs * .78), s1 = p(X1, Hs * .78), s2 = p(X1, Hs * .9), s3 = p(X0, Hs * .9);
    g.fillStyle = 'rgba(190,96,40,.55)'; poly(g, [s0, s1, s2, s3]); g.fill();
    for (const e of ent) { const q0 = p(e[0], 0), q1 = p(e[1], 0), q2 = p(e[1], e[2]), q3 = p(e[0], e[2]);
      g.fillStyle = 'rgba(214,206,186,.85)'; poly(g, [q0, q1, q2, q3]); g.fill();
      g.save(); g.globalCompositeOperation = 'lighter'; const mx = (q0[0] + q1[0]) / 2; spot(g, mx, q0[1], Math.abs(q1[0] - q0[0]) * 1.3, 'rgba(230,214,180,A)', .25); g.restore();
      g.fillStyle = 'rgba(40,34,28,.6)'; for (let k = 1; k < 4; k++) { const xx = lerp(q0[0], q1[0], k / 4); g.fillRect(xx - .5, q3[1], 1.2, q0[1] - q3[1]); } }
    for (let i = 0; i < 6; i++) { const wx = lerp(X0, X1, (i + .5) / 6), q = p(wx, Hs * .62); g.save(); g.globalCompositeOperation = 'lighter'; spot(g, q[0], q[1], 26, 'rgba(255,190,120,A)', .35); g.restore(); }
  }
  function plBackground(g, cam, kind) {
    const hz = cam.hz;
    const sk = g.createLinearGradient(0, -PAD, 0, hz + 10); sk.addColorStop(0, '#060608'); sk.addColorStop(.7, '#120f0d'); sk.addColorStop(1, '#2b1c12');
    g.fillStyle = sk; g.fillRect(-PAD, -PAD, LW, hz + PAD + 10);
    const gr = g.createLinearGradient(0, hz, 0, H + PAD); gr.addColorStop(0, '#17130f'); gr.addColorStop(.3, '#0e0c0a'); gr.addColorStop(1, '#070606');
    g.fillStyle = gr; g.fillRect(-PAD, hz, LW, H + PAD - hz);
    g.save(); g.globalCompositeOperation = 'lighter'; g.translate(540, hz); g.scale(1, .14); spot(g, 0, 0, 1100, SODIUM, .22); g.restore();
    // Asphalt-Körnung
    for (let i = 0; i < 2600; i++) { const x = -PAD + rnd(i, 81) * LW, y = hz + Math.pow(rnd(i, 82), .7) * (H + PAD - hz), a = .02 + rnd(i, 83) * .03; g.fillStyle = rnd(i, 84) > .5 ? `rgba(255,220,180,${a})` : `rgba(0,0,0,${a * 4})`; const s = 1 + (y - hz) / 500; g.fillRect(x, y, s, s); }
    // Licht-Pools
    const poles = []; for (const Y of [6, 24, 44, 66]) for (const X of [-26, -10, 6, 22]) poles.push([X + (Y % 4), Y]);
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const [X, Y] of poles) groundPool(g, cam, X, Y, 8, SODIUM, .14);
    if (kind === 'truck') { groundPool(g, cam, LAMP_T[0], LAMP_T[1] - 2, 9, SODIUM, .3); groundPool(g, cam, LAMP_T[0] - 1, LAMP_T[1] - 4, 5, 'rgba(255,196,130,A)', .14); groundPool(g, cam, -10, 2, 7, SODIUM, .16); }
    g.restore();
    // Markierungen (Parkbuchten)
    const lc = 'rgba(205,196,176,.11)';
    for (let k = -6; k <= 6; k++) lotLine(g, cam, k * 2.9 - 1.45, -2.6, k * 2.9 - 1.45, -8.2, .12, lc);
    lotLine(g, cam, -20, -8.2, 20, -8.2, .12, lc);
    for (let k = -8; k <= 8; k++) lotLine(g, cam, k * 2.9 - 1.45, 2.4, k * 2.9 - 1.45, 8, .12, lc);
    for (const Y of [20, 26, 40, 46]) for (let k = -12; k <= 12; k++) lotLine(g, cam, k * 2.9, Y, k * 2.9, Y + 5, .14, 'rgba(205,196,176,.18)');
    // Laden
    storeFront(g, cam, 96, -70, 56, 10, [[-16, -6, 4.2]]);
    // ferne Autos
    const L = lightNight(LDIR_T);
    const cols = [[44, 44, 48], [70, 66, 60], [30, 34, 40], [92, 90, 86], [56, 30, 28], [36, 40, 36]];
    const cars = [];
    for (const [Y, dir] of [[48.5, 1], [43, -1], [28.5, 1], [23, -1]]) for (let k = -12; k <= 12; k++) if (rnd(k + Y, 85) > .35) cars.push([k * 2.9 + 1.45, Y, dir, k + Y]);
    cars.sort((a, b) => b[1] - a[1]);
    for (const [X, Y, dir, id] of cars) suv3(g, cam, { x: X, y: Y, h: dir * Math.PI / 2 + (rnd(id, 86) - .5) * .08 }, { body: cols[Math.floor(rnd(id, 87) * cols.length)], light: L, glass: [26, 28, 32], shadow: 'rgba(0,0,0,.4)' });
    // ferne Masten
    for (const [X, Y] of poles.slice().sort((a, b) => b[1] - a[1])) lotPole(g, cam, X, Y, 9, true);
    if (kind === 'truck') { lotPole(g, cam, -10, 2, 7.4, true); lotPole(g, cam, LAMP_T[0], LAMP_T[1], LAMP_T[2], true, 1.3); }
    // Bordstein-Insel vorne links
    g.fillStyle = 'rgba(80,72,62,.45)'; const ib = [cam.P(-14, -3.6, .15), cam.P(-7.4, -3.6, .15), cam.P(-7.4, -4.4, .15), cam.P(-14, -4.4, .15)]; poly(g, ib); g.fill();
  }
  // Masten-Kamera (vorne rechts) mit blinkender roter REC-LED
  function poleCam(c, gt, x, y, s) {
    c.save();
    c.fillStyle = '#060607'; c.fillRect(W + 40, -PAD, 60, H + PAD * 2);
    c.fillStyle = '#0b0b0d'; c.fillRect(x + 20 * s, y - 9 * s, W + 60 - x - 20 * s, 18 * s);
    c.fillStyle = 'rgba(255,170,100,.16)'; c.fillRect(x + 20 * s, y - 9 * s, W + 60 - x - 20 * s, 2.5 * s);
    c.fillStyle = '#0b0b0d'; c.beginPath(); c.moveTo(x + 40 * s, y + 8 * s); c.lineTo(x + 40 * s, y + 30 * s); c.lineTo(x + 140 * s, y + 9 * s); c.closePath(); c.fill();
    c.translate(x, y); c.rotate(.32);
    c.fillStyle = '#121215'; rr(c, -70 * s, -26 * s, 110 * s, 52 * s, 8 * s); c.fill();
    c.fillStyle = '#1d1d22'; rr(c, -78 * s, -32 * s, 124 * s, 14 * s, 5 * s); c.fill();
    c.fillStyle = '#050506'; c.beginPath(); c.arc(-72 * s, 0, 18 * s, 0, TAU); c.fill();
    c.fillStyle = 'rgba(120,130,150,.35)'; c.beginPath(); c.arc(-76 * s, -5 * s, 6 * s, 0, TAU); c.fill();
    const on = (gt % 1.2) < .7;
    if (on) { glow(c, 'rgba(255,32,32,1)', 18); c.fillStyle = '#ff2b2b'; } else c.fillStyle = 'rgba(120,20,20,.8)';
    c.beginPath(); c.arc(18 * s, -2 * s, 5.5 * s, 0, TAU); c.fill(); noGlow(c);
    c.restore();
    if (on) addSpot(c, x + 16 * s, y + 4 * s, 60 * s, RED, .2);
  }
  function lampFlicker(gt, seed) { let f = .92 + .05 * noise(gt * 2.1, seed) + .03 * noise(gt * 9, seed + 1); if (noise(gt * .4, seed + 4) > .62) f *= flicker(gt, seed + 2, 17) > .5 ? 1 : .55; return f; }
  function hazeBands(c, gt, y0, y1, col, a) { // langsam ziehender Dunst
    for (let i = 0; i < 3; i++) { const yy = lerp(y0, y1, (i + .5) / 3) + Math.sin(gt * .2 + i * 2) * 30, xx = 540 + Math.sin(gt * .07 + i * 1.7) * 300;
      c.save(); c.globalCompositeOperation = 'lighter'; c.translate(xx, yy); c.scale(1, .18); spot(c, 0, 0, 900, col, a); c.restore(); }
  }

  // ---------- truck: Schachtel in die Ladefläche, Besitzer wirft sie weg ----------
  const BED_POS = { x: -1.5, y: -.22, z: PU.zf, h: .25 };
  const CAN_POS = [-3.05, -2.1];
  function plTruck(c, lt, gt, p) {
    const cam = camTruck(), L = lightNight(LDIR_T);
    blitLayer(c, layer('pl|truck', g => plBackground(g, cam, 'truck')));
    const lf = lampFlicker(gt, 3);
    // Ablauf
    const boxP = p.box === false ? null : (p.box && typeof p.box === 'object' ? p.box : (p.box == null && p.owner ? null : {}));
    const ownP = p.owner ? (typeof p.owner === 'object' ? p.owner : {}) : null;
    const bAt = boxP ? num(boxP.at, .4) : null, oAt = ownP ? num(ownP.at, .4) : null;
    const figs = [];
    let box = null, boxLayer = 'bed', glowA = 0; // Schachtel: Welt-Pose + Ebene
    const restT = { ...BED_POS };
    // Ablage-Figur
    if (bAt != null) {
      const K = [[bAt, -6.4, -1.8], [bAt + 2.5, -1.42, -1.62]], K2 = [[bAt + 3.45, -1.42, -1.62], [bAt + 5.8, -7.2, -1.95]];
      const u = lt - bAt;
      if (u < 2.5) { const q = pathAt(K, lt), ph = pathDist(K, lt) / .78 * Math.PI, T = { x: q.X + .3, y: q.Y - .32, z: .5 + Math.abs(Math.cos(ph)) * .03, h: 0 };
        figs.push({ X: q.X, Y: q.Y, dir: 1, walk: clamp(q.v / 1.6), phase: ph, cap: true, reachW: T }); box = { T, layer: 'front' }; }
      else if (u < 3.45) { // über die Bordwand heben und absetzen
        const k = E.inOut(prog(u, 2.5, 3.1)), X0 = -1.12, Y0 = -1.94;
        const T = { x: lerp(X0, restT.x, k), y: lerp(Y0, restT.y, k), z: lerp(.5, restT.z, k) + Math.sin(Math.min(1, k * 1.15) * Math.PI) * .95, h: lerp(0, restT.h, k) };
        box = { T, layer: k > .55 ? 'bed' : 'front' };
        const f = { X: -1.42, Y: -1.62, dir: 1, walk: 0, phase: 0, cap: true, reachW: u < 3.15 ? T : null, lean: .3 * Math.sin(prog(u, 2.4, 3.4) * Math.PI) };
        figs.push(f);
      } else { const q = pathAt(K2, lt); figs.push({ X: q.X, Y: q.Y, dir: -1, walk: clamp(q.v / 1.6), phase: pathDist(K2, lt) / .78 * Math.PI, cap: true });
        box = { T: restT, layer: 'bed' }; glowA = E.out(prog(u, 3.6, 4.4)); }
    } else if (p.box !== false) { box = { T: restT, layer: 'bed' }; glowA = 1; }
    // Besitzer
    if (oAt != null && box) {
      const u = lt - oAt, K = [[oAt, 4.2, -1.95], [oAt + 2.6, -.95, -1.62]], K2 = [[oAt + 3.7, -.95, -1.62], [oAt + 4.3, -1.75, -1.75]], K3 = [[oAt + 5.2, -1.75, -1.75], [oAt + 7.6, 1.15, -1.5]];
      if (u < 0) {}
      else if (u < 2.6) { const q = pathAt(K, lt); figs.push({ X: q.X, Y: q.Y, dir: -1, walk: clamp(q.v / 1.6), phase: pathDist(K, lt) / .8 * Math.PI }); }
      else if (u < 3.7) { // greift hinein, hebt die Schachtel heraus, schaut sie an
        const k = E.inOut(prog(u, 2.6, 3.25)), hold = { x: -1.32, y: -1.92, z: 1.12, h: .1 };
        const T = { x: lerp(restT.x, hold.x, k), y: lerp(restT.y, hold.y, k), z: lerp(restT.z, hold.z, k) + Math.sin(k * Math.PI) * .45, h: lerp(restT.h, hold.h, k), tilt: Math.sin(gt * 1.5) * .05 * k };
        box = { T, layer: k > .45 ? 'front' : 'bed' }; glowA = 1 - k;
        figs.push({ X: -.95, Y: -1.62, dir: -1, walk: 0, reachW: T, lean: .25 * Math.sin(prog(u, 2.5, 3.5) * Math.PI), nod: Math.sin(prog(u, 3.2, 3.7) * Math.PI) });
      } else if (u < 4.3) { const q = pathAt(K2, lt); const T = { x: q.X - .38, y: q.Y - .3, z: 1.12, h: .1 }; box = { T, layer: 'front' }; figs.push({ X: q.X, Y: q.Y, dir: -1, walk: clamp(q.v / 1.6), phase: pathDist(K2, lt) / .8 * Math.PI, reachW: T }); }
      else if (u < 5.2) { // Wurf in den Müllkorb
        const k = prog(u, 4.3, 4.95), e = E.in(k * .5 + .5) * 2 - 1, X0 = -2.13, Y0 = -2.05, top = .98;
        const T = { x: lerp(X0, CAN_POS[0], k), y: lerp(Y0, CAN_POS[1], k), z: lerp(1.12, top - .25, E.in(k)) + Math.sin(k * Math.PI) * .7, h: .1 + k * 1.2, tilt: k * 2.6 };
        box = u < 4.95 ? { T, layer: 'air' } : null;
        const armK = Math.sin(clamp((u - 4.25) / .4) * Math.PI);
        figs.push({ X: -1.75, Y: -1.75, dir: -1, walk: 0, reachS: armK, lean: .2 * armK });
      } else { const q = pathAt(K3, lt); box = null; figs.push({ X: q.X, Y: q.Y, dir: u > 5.25 ? 1 : -1, walk: clamp(q.v / 1.6), phase: pathDist(K3, lt) / .8 * Math.PI }); }
    }
    // Lichtkegel der Lampe hinter dem Truck
    { const l = cam.P(LAMP_T[0], LAMP_T[1], LAMP_T[2]), gnd = cam.P(LAMP_T[0], LAMP_T[1] - 2.5, 0); drawCone(c, l[0], l[1] + 8, gnd[0], gnd[1] + 60, 980, SODIUM, .75 * lf, .03); }
    // Truck + Schachtel in der Ladefläche
    const truckT = { x: 0, y: 0, h: 0 };
    pickup3(c, cam, truckT, { light: L, body: p.truckColor || [58, 54, 50] }, () => {
      if (box && box.layer === 'bed') { cereal3(c, cam, box.T, L, glowA * (.6 + .4 * Math.sin(gt * 3))); if (glowA > 0) { const q = PW(cam, box.T, [0, 0, CB.h / 2]); addSpot(c, q[0], q[1], 90, RED, .18 * glowA); } }
    });
    // Müllkorb
    const G = canGeo(cam, CAN_POS[0], CAN_POS[1]);
    canBack(c, G, true);
    if (box && box.layer === 'air') cereal3(c, cam, box.T, L);
    canFront(c, G);
    // Figuren
    figs.sort((a, b) => b.Y - a.Y);
    for (const f of figs) {
      const ft = cam.P(f.X, f.Y, 0), hd = cam.P(f.X, f.Y, 1.8), h = ft[1] - hd[1];
      let reach = null;
      if (f.reachW) { const q = PW(cam, f.reachW, [0, 0, CB.h * .45]); reach = [q[0] - f.dir * h * .02, q[1]]; }
      if (f.reachS != null) reach = [ft[0] + f.dir * h * (.12 + .2 * f.reachS), ft[1] - h * (.55 + .32 * f.reachS)];
      person(c, ft[0], ft[1], h, { dir: f.dir, walk: f.walk, phase: f.phase, cap: f.cap, hold: f.hold, reach, lean: f.lean, nod: f.nod, rim: `rgba(255,170,100,${.55 * lf})`, rimDx: f.X > 0 ? 1.4 : .8, rimDy: -1 });
      if (box && box.layer === 'front' && (f.hold || f.reachW)) { cereal3(c, cam, box.T, L); }
    }
    // Vordergrund: Masten-Kamera + Licht
    if (p.cam !== false) poleCam(c, gt, 880, 390, 1.25);
    hazeBands(c, gt, cam.hz - 40, cam.hz + 260, SODIUM, .05 * lf);
    motes(c, gt, 26, 91, -100, 300, W + 200, 1300, 'rgba(255,200,150,1)', .18, 2.2, 6);
  }
  function plStamp(c, lt, gt, p, def) {
    const st = p.stamp === false || p.stamp === '' ? null : p.stamp != null ? (typeof p.stamp === 'object' ? { s: String(p.stamp.s || def || ''), at: num(p.stamp.at, .3) } : { s: String(p.stamp), at: num(p.stampAt, .3) }) : def ? { s: def, at: num(p.stampAt, .3) } : null;
    if (st && st.s) typeText(c, lt, gt, st.s, st.at, { y: num(p.stampY, 1320), size: 84 });
  }

  reg('parking_lot', (c, lt, b, gt) => {
    const p = b.p || EMPTY, mode = ['truck', 'trash', 'cctv', 'driveway'].includes(p.mode) ? p.mode : 'truck';
    if (mode === 'truck') { plTruck(c, lt, gt, p); plStamp(c, lt, gt, p, 'JAN 2005'); }
    else if (mode === 'trash') { plTrash(c, lt, gt, p); plStamp(c, lt, gt, p, 'JAN 2005'); }
    else if (mode === 'cctv') { plCctv(c, lt, gt, p); }
    else { plDriveway(c, lt, gt, p); plStamp(c, lt, gt, p, null); }
  });
  // ---------- roter Markerkreis + kleines Schild (cctv, driveway) ----------
  function markerRing(c, lt, x, y, rx, ry, at) {
    if (at == null || lt < at) return 0;
    const k = E.inOut(prog(lt, at, at + .6));
    c.save(); c.strokeStyle = '#ff2b2b'; c.lineWidth = 7; c.lineCap = 'round'; c.lineJoin = 'round'; glow(c, 'rgba(255,32,32,.95)', 20);
    c.beginPath(); const n = 72, tot = 1.1 * k;
    for (let i = 0; i <= n * tot; i++) { const a = -2.3 + i / n * TAU, wob = 1 + .05 * Math.sin(i * .37) + .035 * (i / n); const px = x + Math.cos(a) * rx * wob, py = y + Math.sin(a) * ry * wob; i ? c.lineTo(px, py) : c.moveTo(px, py); }
    c.stroke(); noGlow(c); c.restore();
    return k;
  }
  function plateLabel(c, lt, s, at, rx, ry, rcx, rcy, aboveF) {
    s = String(s || '').toUpperCase(); if (!s || at == null || lt < at) return;
    const fs = fitSize(MEAS, s, 640, 32, z => `700 ${z}px SMono`, 4, 18), font = `700 ${fs}px SMono`, w = tw(MEAS, s, font, 4) + 56, h = fs + 34;
    const above = aboveF != null ? aboveF : rcy > 820, py = clamp(above ? rcy - ry - 70 - h : rcy + ry + 70, 320, 1380 - h), px = clamp(rcx - w / 2, 140, 940 - w);
    const k = E.out(prog(lt, at, at + .35)), n = Math.min(s.length, Math.floor((lt - at) * 40));
    c.save(); c.globalAlpha = k;
    const ax = clamp(rcx, px + 20, px + w - 20), ay = above ? py + h : py, ex = rcx + (ax - rcx) * .2, ey = above ? rcy - ry * .98 : rcy + ry * .98;
    c.strokeStyle = 'rgba(255,60,50,.85)'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ax, ay); c.stroke();
    glow(c, 'rgba(0,0,0,.9)', 24); rr(c, px, py + (1 - k) * 10, w, h, 8); c.fillStyle = 'rgba(10,10,12,.92)'; c.fill(); noGlow(c);
    c.lineWidth = 2.5; c.strokeStyle = '#ff2b2b'; glow(c, 'rgba(255,32,32,.8)', 12); c.stroke(); noGlow(c);
    c.font = font; c.letterSpacing = '4px'; c.fillStyle = '#f2f2f4'; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    c.fillText(s.slice(0, n), px + 28, py + (1 - k) * 10 + h / 2 + fs * .36); c.letterSpacing = '0px';
    c.restore();
  }
  const ringAt = (p, d) => tOf(p.ring, d);

  // ---------- trash: Taschenlampen über dem Müllkorb, Handschuhe heben die Schachtel heraus ----------
  const TR = { cx: 540, ty: 860, rxT: 345, ryT: 112, by: 1790, rxB: 300, ryB: 96 };
  function crumple(g, x, y, r, seed, col) {
    g.save(); g.translate(x, y); g.rotate(rnd(seed, 1) * TAU);
    g.beginPath(); for (let i = 0; i < 11; i++) { const a = i / 11 * TAU, rr2 = r * (.7 + .45 * rnd(i, seed + 2)); i ? g.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2 * .8) : g.moveTo(Math.cos(a) * rr2, Math.sin(a) * rr2 * .8); } g.closePath();
    g.fillStyle = col; g.fill();
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo((rnd(i, seed + 5) - .5) * r, (rnd(i, seed + 6) - .5) * r * .7); g.lineTo((rnd(i, seed + 7) - .5) * r * 1.2, (rnd(i, seed + 8) - .5) * r * .8); g.stroke(); }
    g.restore();
  }
  function trashBack(g) {
    const gr = g.createLinearGradient(0, -PAD, 0, H + PAD); gr.addColorStop(0, '#15120f'); gr.addColorStop(.5, '#0f0d0b'); gr.addColorStop(1, '#080707'); g.fillStyle = gr; g.fillRect(-PAD, -PAD, LW, LH);
    for (let i = 0; i < 5000; i++) { const x = -PAD + rnd(i, 21) * LW, y = -PAD + rnd(i, 22) * LH, a = .02 + rnd(i, 23) * .05; g.fillStyle = rnd(i, 24) > .45 ? `rgba(255,225,190,${a})` : `rgba(0,0,0,${a * 3})`; const s = 1 + rnd(i, 25) * 2.4; g.fillRect(x, y, s, s); }
    g.save(); g.globalAlpha = .07; g.fillStyle = '#c8b27a'; g.translate(540, 330); g.rotate(-.18); g.fillRect(-900, -14, 1800, 28); g.restore();
    for (let i = 0; i < 14; i++) { const x = -100 + rnd(i, 31) * (W + 200), y = 300 + rnd(i, 32) * 1500; if (Math.abs(x - 540) < 420 && y > 650) continue; crumple(g, x, y, 8 + rnd(i, 33) * 14, i + 40, `rgba(${90 + rnd(i, 34) * 40},${70 + rnd(i, 35) * 30},50,.5)`); }
    // Schatten des Korbs
    g.save(); g.translate(TR.cx + 60, TR.by + 10); g.scale(1, .32); spot(g, 0, 0, 520, BLACKA, .75); g.restore();
    // Öffnung innen
    g.save(); g.beginPath(); g.ellipse(TR.cx, TR.ty, TR.rxT * .93, TR.ryT * .86, 0, 0, TAU); g.clip();
    g.fillStyle = '#040404'; g.fillRect(TR.cx - TR.rxT, TR.ty - TR.ryT, TR.rxT * 2, TR.ryT * 2);
    const ig = g.createLinearGradient(0, TR.ty - TR.ryT, 0, TR.ty + TR.ryT); ig.addColorStop(0, 'rgba(60,58,54,.5)'); ig.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = ig; g.fillRect(TR.cx - TR.rxT, TR.ty - TR.ryT, TR.rxT * 2, TR.ryT * 2);
    // Müll
    crumple(g, TR.cx - 190, TR.ty + 30, 60, 51, '#5c5a55'); crumple(g, TR.cx + 210, TR.ty + 20, 54, 52, '#6b675e'); crumple(g, TR.cx - 60, TR.ty + 70, 44, 53, '#3e3b36');
    g.fillStyle = '#4a3a28'; g.save(); g.translate(TR.cx + 120, TR.ty + 60); g.rotate(.3); g.fillRect(-70, -26, 140, 52); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-70, -6, 140, 4); g.restore();
    g.fillStyle = '#8b8a86'; g.save(); g.translate(TR.cx - 250, TR.ty - 10); g.rotate(-.5); rr(g, -24, -34, 48, 68, 8); g.fill(); g.restore();
    g.fillStyle = '#16171a'; g.beginPath(); g.ellipse(TR.cx + 20, TR.ty + 95, 220, 40, 0, 0, TAU); g.fill();
    g.restore();
  }
  function trashFront() { // Korbkörper + Müllsack über dem Rand (Sprite)
    return sprite('trashfront', 820, 1120, (g) => {
      g.translate(-(TR.cx - 410), -(TR.ty - 140));
      const { cx, ty, rxT, ryT, by, rxB, ryB } = TR;
      g.beginPath(); g.moveTo(cx - rxT, ty); g.ellipse(cx, ty, rxT, ryT, 0, Math.PI, 0, true); g.lineTo(cx + rxB, by); g.ellipse(cx, by, rxB, ryB, 0, 0, Math.PI, false); g.closePath();
      const gr = g.createLinearGradient(cx - rxT, 0, cx + rxT, 0); gr.addColorStop(0, '#0b0c0b'); gr.addColorStop(.35, '#1d201d'); gr.addColorStop(.62, '#2e322d'); gr.addColorStop(.8, '#3c3a35'); gr.addColorStop(1, '#121311'); g.fillStyle = gr; g.fill();
      g.save(); g.clip();
      for (let i = 1; i < 26; i++) { const an = Math.PI * i / 26, x0 = cx - Math.cos(an) * rxT, x1 = cx - Math.cos(an) * rxB, y0 = ty + Math.sin(an) * ryT, y1 = by + Math.sin(an) * ryB;
        g.strokeStyle = 'rgba(0,0,0,.32)'; g.lineWidth = 7; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
        g.strokeStyle = 'rgba(255,240,220,.035)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0 + 6, y0); g.lineTo(x1 + 6, y1); g.stroke(); }
      for (let i = 0; i < 40; i++) { const x = cx - rxT + rnd(i, 61) * rxT * 2, y = ty + 60 + rnd(i, 62) * (by - ty - 60); g.fillStyle = `rgba(90,60,30,${.06 + rnd(i, 63) * .1})`; g.beginPath(); g.ellipse(x, y, 10 + rnd(i, 64) * 40, 4 + rnd(i, 65) * 10, 0, 0, TAU); g.fill(); }
      g.restore();
      // Müllsack über dem Rand
      g.beginPath(); g.moveTo(cx - rxT - 8, ty - 4); g.ellipse(cx, ty, rxT + 8, ryT + 6, 0, Math.PI, 0, true);
      for (let i = 0; i <= 24; i++) { const an = i / 24 * Math.PI, x = cx + Math.cos(an) * (rxT + 4), y = ty + Math.sin(an) * (ryT + 2) + 46 + 18 * Math.sin(i * 1.9) + 10 * rnd(i, 66); g.lineTo(x, y); }
      g.closePath(); g.fillStyle = '#0a0a0c'; g.fill();
      g.strokeStyle = 'rgba(200,205,220,.16)'; g.lineWidth = 3; for (let i = 0; i < 9; i++) { const an = (.1 + .8 * rnd(i, 67)) * Math.PI, x = cx + Math.cos(an) * rxT, y = ty + Math.sin(an) * ryT; g.beginPath(); g.moveTo(x, y + 4); g.quadraticCurveTo(x + 8, y + 26, x - 4, y + 50); g.stroke(); }
      g.strokeStyle = 'rgba(200,205,220,.22)'; g.lineWidth = 4; g.beginPath(); g.ellipse(cx, ty, rxT + 2, ryT + 1, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
    });
  }
  // Schachtel in 2D (3/4 von oben): Vorderseite, rechte Seite, Deckel
  function box2d(c, x, y, w, h, d, rot, glowA) {
    c.save(); c.translate(x, y); c.rotate(rot);
    const sx = d * .55, sy = -d * .7;
    c.fillStyle = '#342d20'; poly(c, [[w / 2, -h / 2], [w / 2 + sx, -h / 2 + sy], [w / 2 + sx, h / 2 + sy], [w / 2, h / 2]]); c.fill();
    c.fillStyle = '#4a412e'; poly(c, [[-w / 2, -h / 2], [-w / 2 + sx, -h / 2 + sy], [w / 2 + sx, -h / 2 + sy], [w / 2, -h / 2]]); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-w / 2 + sx * .5, -h / 2 + sy * .5); c.lineTo(w / 2 + sx * .5, -h / 2 + sy * .5); c.stroke();
    const fg = c.createLinearGradient(-w / 2, 0, w / 2, 0); fg.addColorStop(0, '#4c412c'); fg.addColorStop(1, '#63563a'); c.fillStyle = fg; c.fillRect(-w / 2, -h / 2, w, h);
    c.fillStyle = '#5c1312'; c.fillRect(-w / 2, -h / 2, w, h * .2);
    c.fillStyle = 'rgba(255,240,220,.18)'; c.fillRect(-w / 2, -h / 2 + h * .2, w, h * .025);
    c.fillStyle = 'rgba(150,145,130,.85)'; c.beginPath(); c.ellipse(0, h * .1, w * .32, h * .16, 0, 0, TAU); c.fill();
    c.fillStyle = 'rgba(160,120,60,.8)'; for (let i = 0; i < 9; i++) { c.beginPath(); c.ellipse((rnd(i, 71) - .5) * w * .4, h * .07 + (rnd(i, 72) - .5) * h * .1, w * .05, w * .03, rnd(i, 73) * 3, 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(110,80,40,.75)'; c.beginPath(); c.ellipse(0, h * .17, w * .3, h * .08, 0, 0, Math.PI); c.fill();
    c.fillStyle = 'rgba(80,60,40,.35)'; c.fillRect(-w * .36, h * .34, w * .72, h * .05); c.fillRect(-w * .26, h * .42, w * .52, h * .035);
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 2; c.strokeRect(-w / 2, -h / 2, w, h);
    if (glowA > 0) { c.globalAlpha = glowA; glow(c, 'rgba(255,32,32,1)', 30); c.strokeStyle = 'rgba(255,50,40,.95)'; c.lineWidth = 3; poly(c, [[-w / 2, -h / 2], [-w / 2 + sx, -h / 2 + sy], [w / 2 + sx, -h / 2 + sy], [w / 2 + sx, h / 2 + sy], [w / 2, h / 2], [-w / 2, h / 2]]); c.stroke(); noGlow(c); }
    c.restore();
  }
  // Latexhandschuh greift die Schachtel seitlich (side -1 = links, +1 = rechts), Ärmel kommt von oben
  function glove(c, x, y, s, side, grip, rot) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(-side * s, s); // lokal: Schachtelkante bei x=0, Vorderseite nach +x
    // Ärmel (dunkle Jacke), verjüngt, gerade Manschette
    const ax = -150, ay = -1000;
    c.fillStyle = '#16181d'; poly(c, [[-74, -150], [-6, -146], [ax + 56, ay], [ax - 70, ay]]); c.fill();
    c.strokeStyle = 'rgba(170,185,210,.2)'; c.lineWidth = 4; c.beginPath(); c.moveTo(-6, -146); c.lineTo(ax + 56, ay); c.stroke();
    c.fillStyle = '#272c34'; poly(c, [[-78, -160], [-2, -156], [0, -134], [-80, -138]]); c.fill();
    // Handschuh: Stulpe + Handrücken + Finger als eine Form
    const fl = [lerp(10, 34, grip), lerp(10, 38, grip), lerp(10, 35, grip), lerp(8, 27, grip)], fy = [-58, -34, -10, 13], fw = 21;
    const gr = c.createLinearGradient(-60, 0, 30, 0); gr.addColorStop(0, '#323b48'); gr.addColorStop(.6, '#4a5668'); gr.addColorStop(1, '#5b687c');
    c.fillStyle = gr; c.beginPath();
    c.moveTo(-66, -138); c.lineTo(-8, -136); c.quadraticCurveTo(-2, -100, 0, fy[0] - 4);
    for (let i = 0; i < 4; i++) { const t0 = fy[i] - fw / 2 + 1, t1 = fy[i] + fw / 2 - 1; c.lineTo(fl[i] - 9, t0); c.quadraticCurveTo(fl[i] + 2, t0, fl[i] + 2, fy[i]); c.quadraticCurveTo(fl[i] + 2, t1, fl[i] - 9, t1); c.lineTo(1, t1 + 1); }
    c.quadraticCurveTo(-2, 44, -26, 50); c.quadraticCurveTo(-58, 46, -60, 6); c.quadraticCurveTo(-64, -60, -66, -138); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(30,38,50,.55)'; c.lineWidth = 2; for (let i = 0; i < 3; i++) { const yy = (fy[i] + fy[i + 1]) / 2; c.beginPath(); c.moveTo(2, yy); c.lineTo(Math.min(fl[i], fl[i + 1]) - 6, yy); c.stroke(); }
    c.strokeStyle = 'rgba(210,222,240,.22)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-50, -120); c.quadraticCurveTo(-54, -40, -44, 30); c.stroke();
    c.strokeStyle = 'rgba(30,38,50,.4)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-64, -128); c.lineTo(-8, -126); c.stroke();
    c.restore();
  }
  function plTrash(c, lt, gt, p) {
    blitLayer(c, layer('pl|trash', trashBack));
    const tP = p.trash === false ? null : (p.trash && typeof p.trash === 'object' ? p.trash : {}), T = tP ? tOf(p.trash, .9) : null;
    const BW = 214, BH = 296, BD = 74, start = [580, 858, -.2], held = [540, 560, .04];
    let bx = start[0], by = start[1], br = start[2], handK = 0, grip = 0, lift = 0;
    if (T != null) { handK = E.out(prog(lt, T, T + 1.0)); grip = E.inOut(prog(lt, T + .95, T + 1.3)); lift = E.inOut(prog(lt, T + 1.3, T + 2.7));
      bx = lerp(start[0], held[0], lift); by = lerp(start[1], held[1], lift) - Math.sin(lift * Math.PI) * 30; br = lerp(start[2], held[2], lift);
      if (lift >= 1) { by += Math.sin(gt * 1.1) * 4; br += Math.sin(gt * .8) * .02; } }
    const glowA = T != null ? E.out(prog(lt, T + 2.6, T + 3.4)) * (.75 + .25 * Math.sin(gt * 3)) : 0;
    // Schachtel (vor dem Rand: Korb-Vorderseite verdeckt den unteren Teil)
    box2d(c, bx, by, BW, BH, BD, br, glowA);
    const fr = trashFront(); c.drawImage(fr, TR.cx - 410, TR.ty - 140);
    if (lift > .55) box2d(c, bx, by, BW, BH, BD, br, glowA); // ganz draußen: vor dem Rand
    // Handschuhe
    if (handK > 0) {
      const cs = Math.cos(br), sn = Math.sin(br), gp = sd => [bx + cs * sd * BW / 2 - sn * 10, by + sn * sd * BW / 2 + cs * 10];
      for (const sd of [-1, 1]) { const q = gp(sd), off = (1 - handK); glove(c, q[0] + sd * 160 * off, q[1] - 480 * off, 1, sd, grip, br * .6 + sd * .1 * off); }
    }
    // Taschenlampen
    const conv = T != null ? E.inOut(prog(lt, T - .4, T + .9)) : 0;
    const sA = [lerp(420 + 130 * Math.sin(gt * .7), bx - 30, conv), lerp(880 + 70 * Math.sin(gt * 1.1 + 1), by + 10, conv)];
    const sB = [lerp(660 + 110 * Math.cos(gt * .6), bx + 40, conv), lerp(840 + 60 * Math.sin(gt * .9), by - 20, conv)];
    const src = [[-260, 420], [1340, 300]], R = 240;
    const lf = .95 + .05 * noise(gt * 7, 5);
    for (const [s0, sp] of [[src[0], sA], [src[1], sB]]) {
      c.save(); c.globalCompositeOperation = 'soft-light'; c.translate(sp[0], sp[1]); c.scale(1, .8); spot(c, 0, 0, R * 1.3, 'rgba(255,255,255,A)', .95 * lf * (1 - .3 * conv)); c.restore();
      addSpot(c, sp[0], sp[1], R * .9, 'rgba(220,230,245,A)', .07 * lf * (1 - .4 * conv), .8);
      drawCone(c, s0[0], s0[1], sp[0], sp[1], R * 1.6, 'rgba(215,225,240,A)', .5 * lf, .05);
      coneDust(c, gt, 30 + s0[0], 70, s0[0], s0[1], 30, sp[0], sp[1], R * 1.6, 'rgba(230,235,245,1)', .5, [-150, -150, LW - 100, 1500]);
    }
    addSpot(c, 1100, -200, 900, SODIUM, .07);
    if (glowA > 0) addSpot(c, bx, by, 260, RED, .16 * glowA);
  }

  // ---------- cctv: körniges Überwachungsbild, dunkler SUV fährt vom Parkplatz ----------
  const camCctv = () => mkCam({ x: -11, y: -19, z: 11.5, pitch: .55, yaw: .5, f: 1250, cx: 540, cy: 860 });
  const CR = 1 / 3; let crtCv = null;
  const lightDay = n => .62 + .38 * Math.max(0, n[2]) + .12 * Math.max(0, v3dot(n, v3norm([.3, -.6, .7])));
  function cctvBg() {
    return sprite('cctv|bg', Math.ceil(LW * CR), Math.ceil(LH * CR), (g) => {
      g.scale(CR, CR); g.translate(PAD, PAD);
      const cam = camCctv();
      g.fillStyle = '#5f645f'; g.fillRect(-PAD, -PAD, LW, LH);
      const gr = g.createLinearGradient(0, -PAD, 0, H + PAD); gr.addColorStop(0, 'rgba(255,255,255,.1)'); gr.addColorStop(1, 'rgba(0,0,0,.25)'); g.fillStyle = gr; g.fillRect(-PAD, -PAD, LW, LH);
      for (let i = 0; i < 1800; i++) { const x = -PAD + rnd(i, 91) * LW, y = -PAD + rnd(i, 92) * LH; g.fillStyle = rnd(i, 93) > .5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.08)'; g.fillRect(x, y, 3, 3); }
      // Gehweg + Fassade
      const sw = [cam.P(-40, 15, 0), cam.P(40, 15, 0), cam.P(40, 19, 0), cam.P(-40, 19, 0)]; g.fillStyle = '#8a8e88'; poly(g, sw); g.fill();
      const wall = [cam.P(-40, 19, 0), cam.P(40, 19, 0), cam.P(40, 19, 8), cam.P(-40, 19, 8)]; g.fillStyle = '#a3a69f'; poly(g, wall); g.fill();
      const door = [cam.P(2, 18.98, 0), cam.P(9, 18.98, 0), cam.P(9, 18.98, 3.2), cam.P(2, 18.98, 3.2)]; g.fillStyle = '#2e322f'; poly(g, door); g.fill();
      g.strokeStyle = 'rgba(200,205,200,.5)'; g.lineWidth = 3; for (let k = 1; k < 4; k++) { const a = cam.P(2 + k * 1.75, 18.97, 0), b = cam.P(2 + k * 1.75, 18.97, 3.2); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
      const awn = [cam.P(-40, 18.9, 5.6), cam.P(40, 18.9, 5.6), cam.P(40, 18.9, 6.6), cam.P(-40, 18.9, 6.6)]; g.fillStyle = '#6c706a'; poly(g, awn); g.fill();
      // Markierungen
      const lc = 'rgba(235,238,232,.75)';
      for (let k = -10; k <= 12; k++) { lotLine(g, cam, k * 2.8 - 1.4, 1.6, k * 2.8 - 1.4, 7, .14, lc); lotLine(g, cam, k * 2.8 - 1.4, -4.6, k * 2.8 - 1.4, -10, .14, lc); }
      lotLine(g, cam, -30, -1.4, 40, -1.4, .12, 'rgba(235,238,232,.35)');
      // Insel mit Lichtmast
      const isl = [cam.P(12.6, 1.6, .15), cam.P(15.4, 1.6, .15), cam.P(15.4, 7, .15), cam.P(12.6, 7, .15)]; g.fillStyle = '#7d827a'; poly(g, isl); g.fill();
      g.fillStyle = '#3d443c'; for (let i = 0; i < 5; i++) { const q = cam.P(13 + rnd(i, 95) * 2, 2.2 + i * 1, .3); g.beginPath(); g.arc(q[0], q[1], 16 + rnd(i, 96) * 12, 0, TAU); g.fill(); }
      // geparkte Autos
      const cols = [[196, 198, 194], [150, 152, 150], [110, 112, 110], [80, 82, 80], [175, 176, 172], [125, 128, 126]];
      const cars = [];
      for (let k = -10; k <= 12; k++) { if (k !== 3 && rnd(k, 97) > .3) cars.push([k * 2.8, 4.3, Math.PI / 2 + (rnd(k, 98) > .5 ? Math.PI : 0), k]); if (k !== -1 && k !== 0 && rnd(k, 99) > .35) cars.push([k * 2.8, -7.3, -Math.PI / 2 + (rnd(k, 100) > .6 ? Math.PI : 0), k + 50]); }
      cars.sort((a, b) => b[1] - a[1] || a[0] - b[0]);
      for (const [X, Y, hd, id] of cars) suv3(g, cam, { x: X + (rnd(id, 101) - .5) * .2, y: Y, h: hd + (rnd(id, 102) - .5) * .06 }, { body: cols[Math.floor(rnd(id, 103) * cols.length)], glass: [52, 56, 54], light: lightDay, shadow: 'rgba(0,0,0,.32)', tail: [70, 70, 70], head: [190, 190, 186] });
      lotPole(g, cam, 14, 4.3, 9, false);
      const ph = cam.P(14, 4.3, 9.1); g.fillStyle = '#3a3e3a'; g.fillRect(ph[0] - 30, ph[1] - 8, 60, 14);
    });
  }
  // Weg des SUV: ausparken, die Fahrgasse entlang, Kurve zur Kamera, Ausfahrt unten rechts
  const SUVP = (() => {
    const bez = (A, B, C, D) => u => { const m = 1 - u; return [m * m * m * A[0] + 3 * m * m * u * B[0] + 3 * m * u * u * C[0] + u * u * u * D[0], m * m * m * A[1] + 3 * m * m * u * B[1] + 3 * m * u * u * C[1] + u * u * u * D[1]]; };
    const segs = [bez([8.4, 4.3], [8.4, -1.1], [6.8, -1.5], [3.4, -1.5]), u => [lerp(3.4, -13, u), -1.5]];
    const pts = []; for (const f of segs) for (let i = 0; i < 40; i++) pts.push(f(i / 40)); pts.push(segs[1](1));
    const acc = [0]; for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return { pts, acc, len: acc[acc.length - 1] };
  })();
  function suvPath(lt, p) {
    const d = p.drive && typeof p.drive === 'object' ? p.drive : EMPTY, t0 = num(d.t0, .3), t1 = Math.max(t0 + .5, num(d.t1, 10));
    const k = E.inOut(prog(lt, t0, t1)), s0 = k * SUVP.len, { pts, acc } = SUVP;
    let i = 1; while (i < acc.length - 1 && acc[i] < s0) i++;
    const f = (s0 - acc[i - 1]) / Math.max(1e-6, acc[i] - acc[i - 1]), a = pts[i - 1], b = pts[i];
    return { x: lerp(a[0], b[0], f), y: lerp(a[1], b[1], f), h: Math.atan2(b[1] - a[1], b[0] - a[0]) };
  }
  function plCctv(c, lt, gt, p) {
    const cam = camCctv(), bw = Math.ceil(LW * CR), bh = Math.ceil(LH * CR);
    if (!crtCv) crtCv = mkCv(bw, bh);
    const g = crtCv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    g.drawImage(cctvBg(), 0, 0);
    g.setTransform(CR, 0, 0, CR, PAD * CR, PAD * CR);
    const pose = suvPath(lt, p);
    suv3(g, cam, pose, { body: [24, 25, 26], glass: [34, 38, 38], light: lightDay, shadow: 'rgba(0,0,0,.4)', tail: [50, 50, 50], head: [150, 150, 146], rail: 'rgba(10,10,10,1)' });
    g.setTransform(1, 0, 0, 1, 0, 0);
    // Zeilen, Rauschen, laufender Balken
    const fi = Math.floor(gt * 30);
    g.fillStyle = 'rgba(0,0,0,.16)'; for (let y = fi % 2; y < bh; y += 2) g.fillRect(0, y, bw, 1);
    const ns = sprite('cctv|noise' + (fi % 4), 160, 160, (q, w, h) => { const id = q.createImageData(w, h); for (let i = 0; i < id.data.length; i += 4) { const v = hash(i * .71 + (fi % 4) * 977.3) * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } q.putImageData(id, 0, 0); });
    g.save(); g.globalAlpha = .09; g.globalCompositeOperation = 'overlay'; for (let y = 0; y < bh; y += 160) for (let x = 0; x < bw; x += 160) g.drawImage(ns, x, y); g.restore();
    const ry = ((gt * 26) % (bh + 120)) - 60; const rg = g.createLinearGradient(0, ry - 40, 0, ry + 40); rg.addColorStop(0, 'rgba(255,255,255,0)'); rg.addColorStop(.5, 'rgba(255,255,255,.07)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(0, ry - 40, bw, 80);
    g.fillStyle = 'rgba(70,110,80,.10)'; g.globalCompositeOperation = 'color'; g.fillRect(0, 0, bw, bh); g.globalCompositeOperation = 'source-over';
    // hochskalieren (weich = niedrige Auflösung)
    c.save(); c.imageSmoothingEnabled = true; c.drawImage(crtCv, -PAD, -PAD, LW, LH); c.restore();
    // Bildrand + Einblendungen
    c.save(); const vg = c.createRadialGradient(540, 900, 500, 540, 900, 1300); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)'); c.fillStyle = vg; c.fillRect(-PAD, -PAD, LW, LH); c.restore();
    const ts = String(p.ts != null ? p.ts : '01/2005 14:32:07'), m = ts.match(/(\d{1,2}):(\d{2}):(\d{2})\s*$/);
    let tsS = ts; if (m) { let sec = (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]) + Math.floor(lt); const hh = Math.floor(sec / 3600) % 24, mm = Math.floor(sec / 60) % 60, ss = sec % 60; tsS = ts.slice(0, m.index) + `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`; }
    const osd = (s, x, y, al, sz = 34) => { c.save(); c.font = `700 ${sz}px SMono`; c.letterSpacing = '3px'; c.textAlign = al; c.textBaseline = 'alphabetic'; c.lineWidth = 6; c.strokeStyle = 'rgba(0,0,0,.85)'; c.strokeText(s, x, y); c.fillStyle = 'rgba(236,240,236,.92)'; c.fillText(s, x, y); c.letterSpacing = '0px'; c.restore(); };
    osd(tsS, 150, 1345, 'left');
    osd(String(p.camLabel != null ? p.camLabel : 'CAM 03'), 930, 372, 'right', 30);
    if ((gt % 1) < .6) { c.save(); glow(c, 'rgba(255,32,32,1)', 16); c.fillStyle = '#ff2b2b'; c.beginPath(); c.arc(760 - (String(p.camLabel != null ? p.camLabel : 'CAM 03').length - 6) * 22, 361, 11, 0, TAU); c.fill(); c.restore(); }
    // Markierung
    const at = ringAt(p, 2.0);
    if (at != null && lt >= at) {
      const q = cam.P(pose.x, pose.y, .9), ext = [[-2.1, -.9], [2.1, -.9], [2.1, .9], [-2.1, .9]].map(e => { const w = toW(pose, [e[0], e[1], .8]); return cam.P(w[0], w[1], w[2]); });
      const rx = Math.max(90, (Math.max(...ext.map(e => e[0])) - Math.min(...ext.map(e => e[0]))) * .78), ry = Math.max(70, (Math.max(...ext.map(e => e[1])) - Math.min(...ext.map(e => e[1]))) * .95);
      markerRing(c, lt, q[0], q[1] - 6, rx, ry, at);
      const q0 = (() => { const pz = suvPath(at, p); return cam.P(pz.x, pz.y, .9); })();
      plateLabel(c, lt, p.label != null ? p.label : 'BLACK JEEP CHEROKEE', at + .55, rx, ry, q[0], q[1], q0[1] > 820);
    }
  }

  // ---------- driveway: derselbe SUV in einer dunklen Einfahrt vor einem kleinen Haus ----------
  const camDrive = () => mkCam({ x: 1.7, y: -11.2, z: 2.3, pitch: .09, yaw: -.69, f: 1150, cx: 540, cy: 1030 });
  const LDIR_D = v3norm([.83, -.34, .45]);
  const lightDrive = n => .3 + .66 * Math.max(0, v3dot(n, LDIR_D)) + .1 * Math.max(0, n[2]);
  const SUV_D = { x: -5.55, y: -3.5, h: Math.PI / 2 + .035 };
  function bareTree(g, x, y, s, seed) {
    g.lineCap = 'round'; let cnt = 0;
    const br = (x0, y0, a, len, wd, dep) => { const x2 = x0 + Math.sin(a) * len, y2 = y0 - Math.cos(a) * len; g.lineWidth = wd; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x2) / 2 + (rnd(cnt++, seed) - .5) * len * .3, (y0 + y2) / 2, x2, y2); g.stroke();
      if (dep <= 0 || len < 8) return; const n = rnd(cnt++, seed + 1) > .6 ? 3 : 2; for (let i = 0; i < n; i++) br(x2, y2, a + (i - (n - 1) / 2) * (.5 + .3 * rnd(cnt++, seed + 2)) + (rnd(cnt++, seed + 3) - .5) * .3, len * (.62 + .18 * rnd(cnt++, seed + 4)), wd * .62, dep - 1); };
    br(x, y, (rnd(1, seed) - .5) * .1, 220 * s, 26 * s, 7);
  }
  function driveBg(g) {
    const cam = camDrive(), hz = cam.hz, L = lightDrive;
    const sk = g.createLinearGradient(0, -PAD, 0, hz); sk.addColorStop(0, '#04060a'); sk.addColorStop(.7, '#0a0f1a'); sk.addColorStop(1, '#151a26'); g.fillStyle = sk; g.fillRect(-PAD, -PAD, LW, hz + PAD);
    for (let i = 0; i < 90; i++) { const x = -PAD + rnd(i, 111) * LW, y = -PAD + rnd(i, 112) * (hz * .55 + PAD); g.fillStyle = `rgba(200,210,235,${.08 + rnd(i, 113) * .3})`; g.fillRect(x, y, 2, 2); }
    g.save(); g.globalCompositeOperation = 'lighter'; g.translate(200, hz - 30); g.scale(1, .22); spot(g, 0, 0, 800, 'rgba(255,150,90,A)', .06); g.restore();
    g.fillStyle = '#0a0b0e'; g.fillRect(-PAD, hz, LW, H + PAD - hz);
    const gp = (pts, col) => { g.fillStyle = col; poly(g, pts.map(q => cam.P(q[0], q[1], q[2] || 0))); g.fill(); };
    // Rasen, Gehweg, Straße, Einfahrt
    gp([[-3.4, -8], [30, -8], [30, 0], [-3.4, 0]], '#121518');
    gp([[-30, -8], [-7.7, -8], [-7.7, 0], [-30, 0]], '#121518');
    gp([[-30, -9.6], [30, -9.6], [30, -8], [-30, -8]], '#25262b');
    gp([[-30, -40], [30, -40], [30, -9.6], [-30, -9.6]], '#0c0c0e');
    gp([[-7.7, -9.6], [-3.4, -9.6], [-3.4, -.3], [-7.7, -.3]], '#2b2c31');
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; for (let Y = -8.6; Y < 0; Y += 1.8) { const a2 = cam.P(-7.7, Y, 0), b2 = cam.P(-3.4, Y, 0); g.beginPath(); g.moveTo(a2[0], a2[1]); g.lineTo(b2[0], b2[1]); g.stroke(); }
    // Schneereste
    for (let i = 0; i < 46; i++) { const X = -3 + rnd(i, 121) * 14, Y = -7.6 + rnd(i, 122) * 7, r = .12 + rnd(i, 123) * .5; const pts = []; for (let k = 0; k < 9; k++) { const a2 = k / 9 * TAU, rr2 = r * (.6 + .5 * rnd(k, i + 124)); pts.push(cam.P(X + Math.cos(a2) * rr2, Y + Math.sin(a2) * rr2 * .7, 0)); } g.fillStyle = `rgba(150,160,182,${.08 + rnd(i, 125) * .1})`; poly(g, pts); g.fill(); }
    for (let i = 0; i < 14; i++) { const X = -13 + rnd(i, 126) * 4.5, Y = -7.6 + rnd(i, 127) * 7, r = .12 + rnd(i, 128) * .4; const pts = []; for (let k = 0; k < 9; k++) { const a2 = k / 9 * TAU; pts.push(cam.P(X + Math.cos(a2) * r, Y + Math.sin(a2) * r * .7, 0)); } g.fillStyle = 'rgba(150,160,182,.14)'; poly(g, pts); g.fill(); }
    g.strokeStyle = 'rgba(160,170,190,.18)'; g.lineWidth = 3; const cb0 = cam.P(-30, -9.6, .12), cb1 = cam.P(30, -9.6, .12); g.beginPath(); g.moveTo(cb0[0], cb0[1]); g.lineTo(cb1[0], cb1[1]); g.stroke();
    // kahler Baum hinter der Garage
    { const q = cam.P(-11.5, 3.5, 0), s = cam.f / q[2] / 100; g.strokeStyle = '#050608'; bareTree(g, q[0], q[1], s * 2.2, 7); }
    const T0 = { x: 0, y: 0, h: 0 }, wallC = [60, 62, 72], roofC = [24, 24, 28];
    // Haus (eingeschossig, flaches Satteldach)
    const front = face3(g, cam, T0, [[-3.6, 0, 0], [11, 0, 0], [11, 0, 2.7], [-3.6, 0, 2.7]], wallC, L, [0, -1, 0]);
    if (front) { g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1.5; for (let z = .25; z < 2.7; z += .22) { const a2 = cam.P(-3.6, -.01, z), b2 = cam.P(11, -.01, z); g.beginPath(); g.moveTo(a2[0], a2[1]); g.lineTo(b2[0], b2[1]); g.stroke(); } }
    face3(g, cam, T0, [[-3.8, -.5, 2.62], [11.2, -.5, 2.62], [11.2, 4, 4.3], [-3.8, 4, 4.3]], roofC, L, [0, -.4, 1]);
    face3(g, cam, T0, [[-3.8, -.5, 2.5], [11.2, -.5, 2.5], [11.2, -.5, 2.66], [-3.8, -.5, 2.66]], [40, 40, 46], L, [0, -1, 0]);
    const fq = (x0, x1, z0, z1, col) => gp([[x0, -.02, z0], [x1, -.02, z0], [x1, -.02, z1], [x0, -.02, z1]], col);
    fq(-2.9, -1.95, 0, 2.05, '#16130f'); fq(-2.82, -2.03, .08, 2.0, '#1d1913');
    fq(.6, 3.6, .85, 2.1, '#0e1016'); fq(.68, 3.52, .92, 2.03, '#121620');
    g.strokeStyle = '#2a2c34'; g.lineWidth = 4; for (const X of [1.6, 2.6]) { const a2 = cam.P(X, -.03, .9), b2 = cam.P(X, -.03, 2.05); g.beginPath(); g.moveTo(a2[0], a2[1]); g.lineTo(b2[0], b2[1]); g.stroke(); }
    fq(5.2, 6.8, 1.0, 2.0, '#0e1016');
    // Garage links, Giebel zur Straße
    const gf = face3(g, cam, T0, [[-8.1, -.3, 0], [-3.4, -.3, 0], [-3.4, -.3, 2.5], [-5.75, -.3, 3.95], [-8.1, -.3, 2.5]], [54, 56, 64], L, [0, -1, 0]);
    face3(g, cam, T0, [[-8.1, -.3, 0], [-8.1, 7, 0], [-8.1, 7, 2.5], [-8.1, -.3, 2.5]], [44, 46, 52], L, [-1, 0, 0]);
    face3(g, cam, T0, [[-8.3, -.5, 2.42], [-8.3, 7, 2.42], [-5.75, 7, 4.1], [-5.75, -.5, 4.1]], roofC, L, [-.6, 0, 1]);
    if (gf) { gp([[-7.7, -.32, 0], [-3.8, -.32, 0], [-3.8, -.32, 2.2], [-7.7, -.32, 2.2]], '#33353d');
      g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 2; for (let z = .55; z < 2.2; z += .55) { const a2 = cam.P(-7.7, -.33, z), b2 = cam.P(-3.8, -.33, z); g.beginPath(); g.moveTo(a2[0], a2[1]); g.lineTo(b2[0], b2[1]); g.stroke(); }
      const gl = cam.P(-5.75, -.34, 2.75); g.fillStyle = '#0e1016'; g.fillRect(gl[0] - 26, gl[1] - 16, 52, 32); }
    // Büsche vor dem Haus
    for (let i = 0; i < 7; i++) { const X = -2.6 + i * 1.7 + (i > 0 ? 1.1 : 0); for (let j = 0; j < 4; j++) { const q = cam.P(X + (rnd(i * 4 + j, 132) - .5) * .9, -.7, .25 + rnd(i * 4 + j, 133) * .35), r = cam.f * (.28 + rnd(i * 4 + j, 131) * .18) / q[2]; g.fillStyle = j % 2 ? '#080a0c' : '#0b0e10'; g.beginPath(); g.arc(q[0], q[1], r, 0, TAU); g.fill(); } }
    // Licht der Laterne (links außerhalb) auf dem Boden
    g.save(); g.globalCompositeOperation = 'lighter'; groundPool(g, cam, 4, -7, 8, SODIUM, .1); groundPool(g, cam, -4.2, -4.5, 5, SODIUM, .06); groundPool(g, cam, -2, -1.2, 3, 'rgba(255,190,120,A)', .08); g.restore();
    // SUV
    suv3(g, cam, SUV_D, { body: [27, 28, 33], glass: [7, 8, 12], light: L, shadow: 'rgba(0,0,0,.65)', tail: [74, 12, 14], hub: 'rgb(48,48,54)', edge: 'rgba(255,180,120,.13)', edgeW: 1.6 });
  }
  function plDriveway(c, lt, gt, p) {
    const cam = camDrive();
    blitLayer(c, layer('pl|drive', driveBg));
    // bewegtes Licht: Veranda-Lampe, Fernseher im Fenster, Scheinwerfer eines vorbeifahrenden Autos
    const pl = cam.P(-1.55, -.1, 2.0), pf = .85 + .1 * noise(gt * 3, 41) + (noise(gt * .5, 42) > .7 ? (flicker(gt, 43, 15) - 1) * .3 : 0);
    addSpot(c, pl[0], pl[1], 70, 'rgba(255,190,120,A)', .55 * pf); addSpot(c, pl[0], pl[1] + 40, 260, 'rgba(255,170,100,A)', .12 * pf);
    const wq = cam.P(2.1, -.05, 1.5), tv = .5 + .5 * noise(gt * 4, 44);
    addSpot(c, wq[0], wq[1], 90, 'rgba(120,150,230,A)', .1 + .12 * tv, .6);
    const per = 9, u = ((lt + 3) % per) / 2.6;
    if (p.sweep !== false && u < 1) { const sx = lerp(-300, 1400, E.inOut(u)); c.save(); c.globalCompositeOperation = 'lighter'; const gr = c.createLinearGradient(sx - 260, 0, sx + 260, 0); gr.addColorStop(0, 'rgba(220,225,240,0)'); gr.addColorStop(.5, `rgba(220,225,240,${.09 * Math.sin(u * Math.PI)})`); gr.addColorStop(1, 'rgba(220,225,240,0)'); c.fillStyle = gr; c.fillRect(sx - 260, cam.hz - 300, 520, 700); c.restore(); }
    // Laternenkegel
    drawCone(c, 1320, -160, 760, 1550, 1200, SODIUM, .14 * lampFlicker(gt, 47), .06);
    hazeBands(c, gt, cam.hz - 60, cam.hz + 240, 'rgba(150,160,190,A)', .035);
    motes(c, gt, 40, 49, -100, 200, W + 200, 1400, 'rgba(200,210,230,1)', .25, 2.4, -22);
    // Markierung
    const at = ringAt(p, 1.5);
    if (at != null && lt >= at) {
      const q = PW(cam, SUV_D, [0, 0, .9]), ext = [[-2.1, -.9], [2.1, -.9], [2.1, .9], [-2.1, .9]].map(e => PW(cam, SUV_D, [e[0], e[1], .2])).concat([[-2.1, -.9], [2.1, .9]].map(e => PW(cam, SUV_D, [e[0], e[1], 1.7])));
      const x0 = Math.min(...ext.map(e => e[0])), x1 = Math.max(...ext.map(e => e[0])), y0 = Math.min(...ext.map(e => e[1])), y1 = Math.max(...ext.map(e => e[1]));
      const rx = (x1 - x0) * .66, ry = (y1 - y0) * .72, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      markerRing(c, lt, cx, cy, rx, ry, at);
      plateLabel(c, lt, p.label != null ? p.label : 'BLACK JEEP CHEROKEE', at + .55, rx, ry, cx, cy);
    }
  }
  // =====================================================================
  // 3) classified_ad – Kleinanzeigen: Stapel (pile), glühende Anzeige (glow), Auflösung (reveal)
  // =====================================================================
  const CL = { PW: 880, PH: 1240 };
  const CL_HEADS = ['ANNOUNCEMENTS', 'LOST & FOUND', 'FOR SALE', 'AUTOS', 'HELP WANTED', 'RENTALS', 'GARAGE SALES', 'PETS', 'SERVICES', 'MISC.', 'WANTED', 'FARM & RANCH'];
  let CLL = null;
  function clLayout() {
    if (CLL) return CLL;
    const cols = 6, x0 = 22, gut = 10, cw = (CL.PW - 2 * x0 - gut * (cols - 1)) / cols, top = 140, bot = CL.PH - 36;
    const items = []; let target = null, hi = 0, id = 0;
    for (let ci = 0; ci < cols; ci++) {
      const x = x0 + ci * (cw + gut); let y = top, first = true;
      while (y < bot - 30) {
        id++;
        const tSpot = ci === 2 && !target && y > 540;
        if (tSpot || first || (rnd(id, 1) < .14 && y < bot - 120)) {
          items.push({ type: 'head', x, y, w: cw, text: tSpot ? 'PERSONALS' : CL_HEADS[hi++ % CL_HEADS.length] }); y += 26; first = false;
          if (tSpot) { target = { type: 'ad', x, y, w: cw, h: 62, rows: 4, id, boxed: true, target: true }; items.push(target); y += 62 + 7; }
          continue;
        }
        const rows = 2 + Math.floor(rnd(id, 2) * 6), h = 12 + rows * 10.5;
        if (y + h > bot) break;
        items.push({ type: 'ad', x, y, w: cw, h, rows, bold: rnd(id, 3) > .45, id, boxed: rnd(id, 4) > .3 });
        y += h + 6;
      }
    }
    CLL = { items, target, cw }; return CLL;
  }
  // Seite zeichnen: Seitenkoordinaten → Gerät (x*S+ox, y*S+oy); w,h = Größe der Zielfläche
  function clDraw(g, S, ox, oy, w, h, title) {
    const L = clLayout();
    g.setTransform(1, 0, 0, 1, 0, 0);
    paperTex(g, w, h, '#d6d2c6', 33, { stains: 3, edge: S > 2 ? .05 : .14 });
    const tl = (x, y) => g.setTransform(S, 0, 0, S, ox, oy);
    tl();
    const ink = '#141414';
    g.fillStyle = ink; g.fillRect(20, 18, CL.PW - 40, 78);
    const T = String(title || 'CLASSIFIEDS').toUpperCase(), tfs = fitSize(MEAS, T, 600, 60, z => `700 ${z}px Oswald`, 8);
    txt(g, T, CL.PW / 2, 78, `700 ${tfs}px Oswald`, '#e9e6dc', 'center', 'alphabetic', 8);
    txt(g, 'SECTION C', 36, 64, '700 13px SMono', '#9a978f', 'left', 'alphabetic', 2); txt(g, 'PAGE C7', CL.PW - 36, 64, '700 13px SMono', '#9a978f', 'right', 'alphabetic', 2);
    txt(g, 'TO PLACE AN AD, CALL THE CLASSIFIED DESK', 22, 116, '700 11px SMono', '#3a3a3a', 'left', 'alphabetic', 1); txt(g, 'DEADLINE: NOON THURSDAY', CL.PW - 22, 116, '700 11px SMono', '#3a3a3a', 'right', 'alphabetic', 1);
    g.fillRect(20, 124, CL.PW - 40, 2.5); g.fillRect(20, 129, CL.PW - 40, 1);
    // Spaltenlinien
    g.fillStyle = 'rgba(0,0,0,.35)'; for (let ci = 1; ci < 6; ci++) g.fillRect(22 + ci * (L.cw + 10) - 5.5, 140, .8, CL.PH - 176);
    // Text-Ebene (wird weichgezeichnet)
    const tc = mkCv(w, h), tg = tc.getContext('2d'); tg.setTransform(S, 0, 0, S, ox, oy);
    for (const it of L.items) {
      if (it.type === 'head') { g.fillStyle = ink; g.fillRect(it.x, it.y, it.w, 1.6); const hs = fitSize(MEAS, it.text, it.w - 4, 14, z => `700 ${z}px Oswald`, 1, 8); txt(g, it.text, it.x + it.w / 2, it.y + 18, `700 ${hs}px Oswald`, ink, 'center', 'alphabetic', 1); continue; }
      if (it.boxed) { g.strokeStyle = 'rgba(20,20,20,.75)'; g.lineWidth = 1; g.strokeRect(it.x + .5, it.y + .5, it.w - 1, it.h - 1); }
      if (it.target) continue;
      clBars(tg, it, it.id);
    }
    if (L.target) clBars(tg, L.target, L.target.id);
    g.setTransform(1, 0, 0, 1, 0, 0); g.filter = `blur(${(S > 2 ? 1.5 * S : .85 * S).toFixed(2)}px)`; g.drawImage(tc, 0, 0); g.filter = 'none';
  }
  const CL_WORDS = 'for sale call after pm good cond asking obo must see new used rent apt bdrm utilities paid dep req wanted help part time exp apply in person lost dog reward found cat black white near east west st ave blvd low miles runs great clean quiet no pets will trade best offer only serious inquiries please weekends evenings each or set of two three all'.split(' ');
  const CL_LEADS = ['FOR SALE', 'WANTED', 'LOST', 'FOUND', 'MOVING', 'FREE', 'NEW', 'ESTATE', 'HELP', 'RENT', 'TRADE', 'PIANO', 'TOOLS', 'TRUCK'];
  function clBars(g, it, seed) {
    g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    let k = seed * 13;
    for (let r = 0; r < it.rows; r++) {
      const y = it.y + 13 + r * 10.5, last = r === it.rows - 1, xEnd = it.x + it.w - 5 - (last ? it.w * (.15 + .5 * rnd(r, seed + 9)) : 0);
      let x = it.x + 5;
      if (r === 0 && it.bold) { g.font = '800 9.5px Mont'; g.fillStyle = 'rgba(12,12,12,.95)'; const L = CL_LEADS[Math.floor(rnd(seed, 2) * CL_LEADS.length)]; g.fillText(L, x, y); x += g.measureText(L).width + 4; }
      g.font = '500 9px Mont'; g.fillStyle = 'rgba(22,22,22,.86)';
      while (x < xEnd - 6) { const wd = CL_WORDS[Math.floor(rnd(k++, seed) * CL_WORDS.length)], ww = g.measureText(wd).width; if (x + ww > xEnd) break; g.fillText(wd, x, y); x += ww + 3; }
    }
  }
  const CL_S = 1.04;
  const clPageSpr = title => sprite('cl|page|' + title, Math.ceil(CL.PW * CL_S), Math.ceil(CL.PH * CL_S), (g, w, h) => { clDraw(g, CL_S, 0, 0, w, h, title);
    g.setTransform(1, 0, 0, 1, 0, 0); const gr = g.createRadialGradient(w * .45, h * .42, 160, w * .5, h * .5, h * .78); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.62)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(20,30,55,.14)'; g.fillRect(0, 0, w, h); });
  const clShadow = (w, h) => sprite('cl|shadow|' + w + 'x' + h, w + 160, h + 160, (g) => { g.filter = 'blur(26px)'; g.fillStyle = 'rgba(0,0,0,.85)'; g.fillRect(80, 92, w, h); });
  function clDesk() { return layer('cl|desk', g => { deskWood(g); lampShade(g, 520, 820, 300, 1300, .8); g.fillStyle = 'rgba(20,30,55,.12)'; g.fillRect(-PAD, -PAD, LW, LH); }); }
  // Ziel-Anzeige in Bildschirmkoordinaten (Seite mittig bei (cx,cy), Maßstab s, Drehung r)
  function clTargetScreen(cx, cy, s, r) {
    const T = clLayout().target, px = (T.x + T.w / 2 - CL.PW / 2) * s, py = (T.y + T.h / 2 - CL.PH / 2) * s, cs = Math.cos(r), sn = Math.sin(r);
    return { x: cx + px * cs - py * sn, y: cy + px * sn + py * cs, w: T.w * s, h: T.h * s, r };
  }
  function clGlowBox(c, gt, B, k, blurInside = 1) {
    if (k <= 0) return;
    const pu = .78 + .22 * Math.sin(gt * 3.1) + .05 * noise(gt * 8, 3);
    addSpot(c, B.x, B.y, Math.min(420, Math.max(B.w, B.h) * 1.6), RED, .2 * k * pu, .7);
    c.save(); c.translate(B.x, B.y); c.rotate(B.r);
    c.globalCompositeOperation = 'lighter'; c.fillStyle = `rgba(255,40,30,${.16 * k * pu * blurInside})`; c.fillRect(-B.w / 2, -B.h / 2, B.w, B.h);
    c.globalCompositeOperation = 'source-over'; glow(c, 'rgba(255,32,32,1)', 14 + 16 * k); c.strokeStyle = `rgba(255,50,40,${.95 * k})`; c.lineWidth = Math.max(2, B.w * .018); c.strokeRect(-B.w / 2, -B.h / 2, B.w, B.h); noGlow(c);
    c.restore();
  }
  function clGlow(c, lt, gt, p, b) {
    blitLayer(c, clDesk(), noise(gt * .05, 3) * 10, 0);
    const spr = clPageSpr(p.title || 'CLASSIFIEDS'), cx = 540 + noise(gt * .3, 42) * 4, cy = num(p.y, 945) + noise(gt * .25, 43) * 4, r = num(p.tilt, -.018) + noise(gt * .3, 41) * .004;
    const sh = clShadow(spr.width, spr.height);
    c.save(); c.translate(cx, cy); c.rotate(r); c.drawImage(sh, -spr.width / 2 - 80 + 14, -spr.height / 2 - 80 + 10); c.drawImage(spr, -spr.width / 2, -spr.height / 2);
    const g = c.createLinearGradient(-spr.width / 2, 0, spr.width / 2, 0); g.addColorStop(0, 'rgba(0,0,0,.2)'); g.addColorStop(.15, 'rgba(0,0,0,0)'); g.addColorStop(.85, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.24)'); c.fillStyle = g; c.fillRect(-spr.width / 2, -spr.height / 2, spr.width, spr.height);
    c.restore();
    const at = tOf(p.at, 1.2 * fitK(b, 2.4)), k = at != null ? E.out(prog(lt, at, at + .8)) : 0, B = clTargetScreen(cx, cy, CL_S, r);
    if (k > 0) { c.save(); c.globalAlpha = .5 * k; lampShade(c, B.x, B.y, 260, 1100, .55); c.restore(); }
    clGlowBox(c, gt, B, k);
    motes(c, gt, 26, 33, -100, 200, W + 200, 1500, 'rgba(220,222,230,1)', .25, 2.2);
  }
  // Auflösung: stark vergrößert, die Anzeige wird lesbar getippt, dann roter Markerkreis
  const CL_Z = 4.7;
  function clReveal(c, lt, gt, p, b) {
    const T = clLayout().target, tcx = T.x + T.w / 2, tcy = T.y + T.h / 2, X = 540, Y = num(p.y, 820);
    const ox = X + PAD - tcx * CL_Z, oy = Y + PAD - tcy * CL_Z, title = p.title || 'CLASSIFIEDS';
    const zl = layer('cl|zoom|' + title + '|' + Y, g => { clDraw(g, CL_Z, ox, oy, LW, LH, title); g.setTransform(1, 0, 0, 1, PAD, PAD); lampShade(g, X - 40, Y - 60, 330, 1250, .86); g.fillStyle = 'rgba(20,30,55,.16)'; g.fillRect(-PAD, -PAD, LW, LH); });
    const dx = noise(gt * .2, 51) * 8, dy = noise(gt * .17, 52) * 6;
    blitLayer(c, zl, dx, dy);
    const B = { x: X + dx, y: Y + dy, w: T.w * CL_Z, h: T.h * CL_Z, r: 0 };
    const text = String(p.text != null ? p.text : 'Rex, it will be ok'), fk = fitK(b, 1.4 + text.length / num(p.speed, 15)), at = tOf(p.at, .6 * fk);
    const un = at != null ? E.inOut(prog(lt, at, at + .45)) : 0;
    // Weichzeichnung im Kasten verschwindet
    if (un > 0) { c.save(); c.globalAlpha = un; c.fillStyle = '#d3cfc3'; c.fillRect(B.x - B.w / 2 + 6, B.y - B.h / 2 + 6, B.w - 12, B.h - 12); c.restore(); }
    // Text tippen (Special Elite, dunkle Druckfarbe)
    if (at != null && lt >= at) {
      const maxW = B.w - 70; let fs = 74, rows;
      for (; fs > 30; fs -= 2) { rows = wrap(MEAS, text, maxW, `400 ${fs}px Elite`); if (rows.length <= 3 && rows.length * fs * 1.2 <= B.h - 40) break; }
      const font = `400 ${fs}px Elite`, sp = num(p.speed, 15), n = Math.floor((lt - at - .15) * sp);
      const lh = fs * 1.18, y0 = B.y - (rows.length - 1) * lh / 2 + fs * .34;
      c.save(); c.font = font; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
      let ci = 0;
      rows.forEach((row, ri) => {
        const xs = charXs(MEAS, row, font), x0 = B.x - xs[row.length] / 2;
        for (let i = 0; i < row.length; i++, ci++) { if (ci >= n) break; if (row[i] === ' ') continue;
          const jy = (rnd(ci, 3) - .5) * 3, age = (lt - at - .15) * sp - ci - 1;
          c.fillStyle = age < 1 ? '#000' : '#1c1a17'; c.globalAlpha = .84 + .16 * rnd(ci, 7);
          c.fillText(row[i], x0 + xs[i] + (rnd(ci, 5) - .5) * 1.6, y0 + ri * lh + jy); }
        ci++;
      });
      c.restore();
    }
    clGlowBox(c, gt, B, 1, 1 - un);
    // Markerkreis
    const ringT = tOf(p.ringAt, at != null ? at + .15 + text.length / num(p.speed, 15) + .45 : 1.5);
    markerRing(c, lt, B.x, B.y, B.w * .62, B.h * .85, ringT);
    motes(c, gt, 22, 37, -100, 200, W + 200, 1500, 'rgba(220,222,230,1)', .22, 2.4);
  }
  // Stapel: Umschlag versinkt unter Anzeigen-Formularen, Tageszähler, "UNNOTICED"
  function clForm(v) {
    const w = 560, h = 740, m = 70;
    return sprite('cl|form|' + v, w + 2 * m, h + 2 * m, (g) => {
      g.save(); g.filter = 'blur(18px)'; g.fillStyle = 'rgba(0,0,0,.7)'; g.fillRect(m + 10, m + 16, w, h); g.restore();
      const pc = mkCv(w, h), q = pc.getContext('2d');
      paperTex(q, w, h, ['#cfc9b9', '#d4cfc2', '#c9c3b2'][v % 3], 61 + v, { stains: 2, edge: .16 });
      q.fillStyle = '#222'; txt(q, 'CLASSIFIED AD ORDER FORM', w / 2, 52, '700 24px SMono', '#1e1e1e', 'center', 'alphabetic', 2);
      q.fillRect(30, 66, w - 60, 2);
      ['NAME', 'ADDRESS', 'PHONE', 'CLASSIFICATION'].forEach((l, i) => { txt(q, l, 32, 104 + i * 38, '700 13px SMono', '#333', 'left', 'alphabetic', 1); q.fillStyle = 'rgba(0,0,0,.4)'; q.fillRect(160, 106 + i * 38, w - 192, 1.2); });
      const gx = 32, gy = 270, cs = 31, nc = Math.floor((w - 64) / cs), nr = 10;
      q.strokeStyle = 'rgba(40,40,60,.45)'; q.lineWidth = 1; for (let r = 0; r <= nr; r++) { q.beginPath(); q.moveTo(gx, gy + r * cs); q.lineTo(gx + nc * cs, gy + r * cs); q.stroke(); } for (let k = 0; k <= nc; k++) { q.beginPath(); q.moveTo(gx + k * cs, gy); q.lineTo(gx + k * cs, gy + nr * cs); q.stroke(); }
      const hand = mkCv(w, h), hq = hand.getContext('2d'); hq.fillStyle = 'rgba(25,30,70,.85)'; hq.font = '700 26px Caveat'; hq.textAlign = 'center';
      const AL = 'ABCDEFGHIJKLMNOPRSTUVWY';
      for (let r = 0; r < nr; r++) { const len = r < 5 + v ? Math.floor(nc * (.4 + .6 * rnd(r, v + 3))) : 0; for (let k = 0; k < len; k++) if (rnd(k + r * 40, v + 5) > .14) hq.fillText(AL[Math.floor(rnd(k + r * 40, v + 6) * AL.length)], gx + k * cs + cs / 2, gy + r * cs + cs * .78); }
      ['J', 'Q', 'P'].forEach((_, i) => { hq.font = '700 30px Caveat'; hq.textAlign = 'left'; hq.fillText(['Mr. ', '1st ', '(316) '][i] + '~~~~~ ~~~', 168, 102 + i * 38); });
      q.filter = 'blur(2.2px)'; q.drawImage(hand, 0, 0); q.filter = 'none';
      txt(q, 'RUN DATES', 32, gy + nr * cs + 44, '700 13px SMono', '#333', 'left', 'alphabetic', 1); q.strokeStyle = 'rgba(0,0,0,.5)'; for (let k = 0; k < 7; k++) q.strokeRect(150 + k * 50, gy + nr * cs + 26, 40, 26);
      txt(q, 'PRICE PER LINE', w - 32, h - 36, '700 13px SMono', '#333', 'right', 'alphabetic', 1);
      g.filter = 'blur(1.1px)'; g.drawImage(pc, m, m); g.filter = 'none';
    });
  }
  function clEnvelope() {
    const w = 640, h = 360, m = 70;
    return sprite('cl|env', w + 2 * m, h + 2 * m, (g) => {
      g.save(); g.filter = 'blur(18px)'; g.fillStyle = 'rgba(0,0,0,.75)'; g.fillRect(m + 10, m + 16, w, h); g.restore();
      const pc = mkCv(w, h), q = pc.getContext('2d');
      paperTex(q, w, h, '#d9d1bd', 71, { stains: 2, edge: .2 });
      q.strokeStyle = 'rgba(0,0,0,.12)'; q.lineWidth = 2; q.beginPath(); q.moveTo(0, 0); q.lineTo(w / 2, h * .55); q.lineTo(w, 0); q.stroke();
      q.fillStyle = '#6e1f22'; q.fillRect(w - 128, 26, 92, 110); q.strokeStyle = 'rgba(255,255,255,.45)'; q.setLineDash([5, 5]); q.lineWidth = 3; q.strokeRect(w - 124, 30, 84, 102); q.setLineDash([]);
      q.strokeStyle = 'rgba(30,30,40,.5)'; q.lineWidth = 3; q.beginPath(); q.arc(w - 150, 92, 46, 0, TAU); q.stroke();
      for (let i = 0; i < 4; i++) { q.beginPath(); q.moveTo(w - 300, 60 + i * 16); for (let x = 0; x <= 130; x += 10) q.lineTo(w - 300 + x, 60 + i * 16 + Math.sin(x * .09) * 5); q.stroke(); }
      q.save(); q.filter = 'blur(1.4px)'; ['CLASSIFIED DEPT.', '825 E. DOUGLAS', 'WICHITA, KANSAS'].forEach((l, i) => txt(q, l, 210, 200 + i * 42, '400 32px Elite', '#232020', 'left', 'alphabetic', 1)); q.restore();
      g.drawImage(pc, m, m);
      g.save(); glow(g, 'rgba(255,32,32,.9)', 16); g.strokeStyle = 'rgba(220,40,36,.8)'; g.lineWidth = 3; g.strokeRect(m + 1.5, m + 1.5, w - 3, h - 3); g.restore();
    });
  }
  const CL_BASE = Array.from({ length: 9 }, (_, i) => [540 + (rnd(i, 141) - .5) * 240, 960 + (rnd(i, 142) - .5) * 260, (rnd(i, 143) - .5) * .7, i % 3]);
  const CL_FS = .84; // Formular-Maßstab
  const clBaseStack = () => layer('cl|basestack', g => { g.drawImage(clDesk(), -PAD, -PAD); g.filter = 'blur(2px)'; for (const [x, y, r, v] of CL_BASE) { const f = clForm(v); g.save(); g.translate(x, y); g.rotate(r); g.scale(CL_FS, CL_FS); g.drawImage(f, -f.width / 2, -f.height / 2); g.restore(); } g.filter = 'none'; });
  function clPilePlan(p, b) {
    const cn = p.counter && typeof p.counter === 'object' ? p.counter : EMPTY, fk = fitK(b, 5.9);
    const from = Math.round(num(cn.from, 1)), to = Math.round(num(cn.to, 9)), t0 = num(cn.t0, 1.0 * fk), t1 = Math.max(t0 + .2, num(cn.t1, 5.0 * fk));
    const N = Math.max(0, Math.min(14, Math.abs(to - from)));
    const forms = Array.from({ length: N }, (_, j) => { const a = rnd(j, 151) * TAU; return { x: 540 + 60 + rnd(j, 152) * 150, y: 960 - 130 + rnd(j, 153) * 170, r: (rnd(j, 154) - .5) * .55, v: j % 3, t: t0 + (t1 - t0) * (j + 1) / N, dx: Math.cos(a), dy: Math.sin(a) - .3 }; });
    return { from, to, t0, t1, N, forms, label: cn.label != null ? String(cn.label) : 'DAYS', env: { x: 520, y: 980, r: -.06, at: num(p.at, clamp(Math.min(.3, t0 - .6), 0, .3)) } };
  }
  let PILE = null;
  function clPileLayer(P, key, k, envIn) {
    const want = key + '|' + (envIn ? 1 : 0);
    if (!PILE || PILE.key !== want || PILE.k > k) {
      if (!PILE) { PILE = { cv: mkCv(LW, LH) }; }
      const g = PILE.cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.drawImage(clBaseStack(), 0, 0);
      g.translate(PAD, PAD);
      if (envIn) { const e = clEnvelope(); g.save(); g.translate(P.env.x, P.env.y); g.rotate(P.env.r); g.drawImage(e, -e.width / 2, -e.height / 2); g.restore(); }
      PILE.key = want; PILE.k = 0;
    }
    const g = PILE.cv.getContext('2d');
    while (PILE.k < k) { const F = P.forms[PILE.k], f = clForm(F.v); g.save(); g.translate(F.x, F.y); g.rotate(F.r); g.scale(CL_FS, CL_FS); g.drawImage(f, -f.width / 2, -f.height / 2); g.restore(); PILE.k++; }
    return PILE.cv;
  }
  function clCounter(c, lt, gt, P) {
    if (lt < P.t0 - .4) return;
    const a = E.out(prog(lt, P.t0 - .4, P.t0)), j = P.N ? Math.min(P.N, Math.floor(prog(lt, P.t0, P.t1) * P.N + 1e-6)) : 0;
    const val = P.from + (P.to >= P.from ? j : -j), tj = j > 0 ? P.forms[j - 1].t : P.t0, pk = Math.exp(-Math.max(0, lt - tj) * 7) * (j > 0 ? 1 : 0);
    const S = String(val), lab0 = P.label.toUpperCase(), lab = Math.abs(val) === 1 && /S$/.test(lab0) ? lab0.slice(0, -1) : lab0, y = 430;
    const nw = tw(MEAS, S, '700 96px SMono'), lw = lab ? tw(MEAS, lab, '700 34px SMono', 6) : 0, bw = nw + 56, tot = bw + (lab ? 26 + lw : 0), x0 = 540 - tot / 2;
    c.save(); c.globalAlpha = a;
    glow(c, 'rgba(0,0,0,.9)', 30); rr(c, x0, y - 92, bw, 122, 14); c.fillStyle = 'rgba(12,12,14,.92)'; c.fill(); noGlow(c);
    c.lineWidth = 3; c.strokeStyle = `rgba(255,50,40,${.6 + .4 * pk})`; glow(c, 'rgba(255,32,32,.9)', 10 + 20 * pk); c.stroke(); noGlow(c);
    c.save(); c.translate(x0 + bw / 2, y - 31); c.scale(1 + .12 * pk, 1 + .12 * pk); glow(c, 'rgba(255,32,32,.8)', 18 * pk); txt(c, S, 0, 34, '700 96px SMono', pk > .3 ? '#ffffff' : '#f0f0f2', 'center'); noGlow(c); c.restore();
    if (lab) { c.shadowColor = 'rgba(0,0,0,1)'; c.shadowBlur = 16; txt(c, lab, x0 + bw + 26, y - 14, '700 34px SMono', '#ff5a4e', 'left', 'alphabetic', 6); }
    c.restore();
  }
  function clPile(c, lt, gt, p, b) {
    const P = clPilePlan(p, b), key = JSON.stringify([P.N, P.t0, P.t1, P.from, P.to]);
    const envLand = P.env.at + .5, envIn = lt >= envLand;
    const k = P.forms.filter(F => lt >= F.t).length;
    blitLayer(c, clPileLayer(P, key, k, envIn));
    // fallender Umschlag
    if (!envIn && lt >= P.env.at) { const u = E.in(prog(lt, P.env.at, envLand)), e = clEnvelope(), s = lerp(1.5, 1, u);
      c.save(); c.globalAlpha = clamp(u * 3); c.translate(P.env.x, lerp(P.env.y - 520, P.env.y, u)); c.rotate(P.env.r + (1 - u) * .25); c.scale(s, s); c.drawImage(e, -e.width / 2, -e.height / 2); c.restore(); }
    // nächstes Formular im Anflug
    const F = P.forms[k];
    if (F && lt >= F.t - .42) { const u = E.out(prog(lt, F.t - .42, F.t)), f = clForm(F.v), d = (1 - u) * 1000, s = lerp(1.12, 1, u) * CL_FS;
      c.save(); c.translate(F.x + F.dx * d, F.y + F.dy * d); c.rotate(F.r + (1 - u) * .4 * (F.dx > 0 ? 1 : -1)); c.scale(s, s); c.drawImage(f, -f.width / 2, -f.height / 2); c.restore(); }
    const bump = P.forms.reduce((a, Q) => a + (lt > Q.t ? Math.exp(-(lt - Q.t) * 10) : 0), 0) + (lt > envLand ? Math.exp(-(lt - envLand) * 10) : 0);
    c.save(); c.globalAlpha = .5; lampShade(c, 540, 900, 420, 1300, .5); c.restore();
    // rote Ecke des verschütteten Umschlags pulsiert
    if (envIn) { const pu = .6 + .4 * Math.sin(gt * 2.6), cov = clamp(k / Math.max(1, P.N)), cr = Math.cos(P.env.r), sr = Math.sin(P.env.r);
      const ex = P.env.x - 300 * cr - 160 * sr, ey = P.env.y - 300 * sr + 160 * cr; addSpot(c, ex, ey, 230, RED, (.08 + .14 * cov) * pu); }
    if (bump > .02) motes(c, gt * 3, 16, 61, 200, 500, 680, 800, 'rgba(230,230,235,1)', .35 * Math.min(1, bump), 2.2);
    motes(c, gt, 24, 63, -100, 200, W + 200, 1500, 'rgba(220,222,230,1)', .24, 2.2);
    clCounter(c, lt, gt, P);
    const tAt = tOf(p.textAt, P.t1 + .5), word = p.text != null ? String(p.text) : 'UNNOTICED';
    if (word && tAt != null && lt >= tAt) {
      const kk = prog(lt, tAt, tAt + .22), e = E.out(kk), fs = fitSize(MEAS, word.toUpperCase(), 820, 150, z => `400 ${z}px Anton`, 6), fl = lt < tAt + .6 ? flicker(gt, 71, 22) : (noise(gt * 2.5, 72) > .8 ? .6 : 1);
      c.save(); c.translate(540, num(p.textY, 1290)); c.scale(lerp(1.5, 1, e), lerp(1.5, 1, e)); c.globalAlpha = clamp(kk * 2) * fl;
      glow(c, 'rgba(255,30,30,1)', 46); txt(c, word.toUpperCase(), 0, 0, `400 ${fs}px Anton`, '#ff3030', 'center', 'middle', 6); txt(c, word.toUpperCase(), 0, 0, `400 ${fs}px Anton`, '#ff4a40', 'center', 'middle', 6); noGlow(c); c.restore();
    }
  }
  reg('classified_ad', (c, lt, b, gt) => {
    const p = b.p || EMPTY, mode = ['pile', 'glow', 'reveal'].includes(p.mode) ? p.mode : 'glow';
    if (mode === 'pile') clPile(c, lt, gt, p, b); else if (mode === 'reveal') clReveal(c, lt, gt, p, b); else clGlow(c, lt, gt, p, b);
  });
  // =====================================================================
  // 4) interview_room – kahler Verhörraum: Hängelampe, Metalltisch, zwei Silhouetten, Einwegspiegel
  // =====================================================================
  const IR = { vp: [540, 700], wall: [60, 170, 1020, 1150], mir: [300, 330, 780, 760], tf: [300, 780, 950], tn: [255, 825, 1062], piv: [540, -260] };
  function irRoom(g, o) {
    const [wx0, wy0, wx1, wy1] = IR.wall, [vx, vy] = IR.vp;
    const ext = (x, y, k) => [vx + (x - vx) * k, vy + (y - vy) * k];
    // Decke, Boden, Seitenwände
    g.fillStyle = '#0b0c0f'; g.fillRect(-PAD, -PAD, LW, LH);
    g.fillStyle = '#101216'; poly(g, [ext(wx0, wy0, 4), ext(wx1, wy0, 4), [wx1, wy0], [wx0, wy0]]); g.fill();
    const fg = g.createLinearGradient(0, wy1, 0, H + PAD); fg.addColorStop(0, '#202227'); fg.addColorStop(1, '#0e0f11');
    g.fillStyle = fg; poly(g, [[wx0, wy1], [wx1, wy1], ext(wx1, wy1, 4), ext(wx0, wy1, 4)]); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; for (let i = -6; i <= 6; i++) { const x = 540 + i * 120; g.beginPath(); g.moveTo(x, wy1); const e = ext(x, wy1, 4); g.lineTo(e[0], e[1]); g.stroke(); }
    for (const k of [1.18, 1.45, 1.85, 2.5]) { const a = ext(wx0, wy1, k), b = ext(wx1, wy1, k); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
    g.fillStyle = '#16181d'; poly(g, [ext(wx0, wy0, 4), [wx0, wy0], [wx0, wy1], ext(wx0, wy1, 4)]); g.fill();
    g.fillStyle = '#15171c'; poly(g, [ext(wx1, wy0, 4), [wx1, wy0], [wx1, wy1], ext(wx1, wy1, 4)]); g.fill();
    // Rückwand aus Betonsteinen
    g.fillStyle = '#353a42'; g.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
    const bh = 54, bw = 116;
    for (let r = 0; r * bh < wy1 - wy0; r++) for (let k = -1; k * bw < wx1 - wx0 + bw; k++) {
      const x = wx0 + k * bw + (r % 2 ? bw / 2 : 0), y = wy0 + r * bh, v = rnd(r * 31 + k, 161);
      g.fillStyle = `rgba(${v > .5 ? '255,255,255' : '0,0,0'},${.02 + rnd(r * 31 + k, 162) * .05})`; g.fillRect(x + 2, y + 2, bw - 4, bh - 4);
    }
    g.fillStyle = 'rgba(0,0,0,.35)'; for (let r = 0; r * bh < wy1 - wy0; r++) { g.fillRect(wx0, wy0 + r * bh, wx1 - wx0, 3); for (let k = -1; k * bw < wx1 - wx0 + bw; k++) g.fillRect(wx0 + k * bw + (r % 2 ? bw / 2 : 0), wy0 + r * bh, 3, bh); }
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(0,0,0,${.05 + rnd(i, 163) * .1})`; g.fillRect(wx0 + rnd(i, 164) * (wx1 - wx0), wy0 + rnd(i, 165) * (wy1 - wy0), 2, 2); }
    g.fillStyle = '#23262c'; g.fillRect(wx0, wy1 - 34, wx1 - wx0, 34); g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(wx0, wy1 - 34, wx1 - wx0, 2);
    // Einwegspiegel
    if (o.mirror) {
      const [mx0, my0, mx1, my1] = IR.mir;
      g.fillStyle = '#1d2026'; g.fillRect(mx0 - 20, my0 - 20, mx1 - mx0 + 40, my1 - my0 + 40);
      g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(mx0 - 20, my0 - 20, mx1 - mx0 + 40, 3);
      const mg = g.createLinearGradient(mx0, my0, mx1, my1); mg.addColorStop(0, '#11151b'); mg.addColorStop(.5, '#090b0f'); mg.addColorStop(1, '#0d1015'); g.fillStyle = mg; g.fillRect(mx0, my0, mx1 - mx0, my1 - my0);
      g.save(); g.beginPath(); g.rect(mx0, my0, mx1 - mx0, my1 - my0); g.clip();
      g.fillStyle = 'rgba(150,170,200,.05)'; poly(g, [[mx0 + 40, my0], [mx0 + 170, my0], [mx0 + 10, my1], [mx0 - 120, my1]]); g.fill();
      g.fillStyle = 'rgba(150,170,200,.03)'; poly(g, [[mx0 + 210, my0], [mx0 + 250, my0], [mx0 + 90, my1], [mx0 + 50, my1]]); g.fill();
      g.strokeStyle = 'rgba(170,185,210,.07)'; g.lineWidth = 3; g.beginPath(); g.moveTo(mx0, my1 - 70); g.lineTo(mx1, my1 - 70); g.stroke(); // Spiegelbild der Tischkante
      g.restore();
      g.fillStyle = '#2a2e35'; g.fillRect(mx0 - 20, my1 + 20, mx1 - mx0 + 40, 10);
    }
    // Tisch (Metall)
    if (o.table) {
      const [fx0, fx1, fy] = IR.tf, [nx0, nx1, ny] = IR.tn;
      g.save(); g.translate(540, 1400); g.scale(1, .16); spot(g, 0, 0, 520, BLACKA, .8); g.restore();
      g.strokeStyle = '#17191d'; g.lineWidth = 20; for (const x of [fx0 + 30, fx1 - 30]) { g.beginPath(); g.moveTo(x, fy + 60); g.lineTo(x, 1320); g.stroke(); }
      g.fillStyle = '#1c1e22'; poly(g, [[nx0 + 6, ny + 26], [nx1 - 6, ny + 26], [nx1 - 6, ny + 70], [nx0 + 6, ny + 70]]); g.fill();
      g.strokeStyle = '#2b2e34'; g.lineWidth = 24; for (const x of [nx0 + 26, nx1 - 26]) { g.beginPath(); g.moveTo(x, ny + 30); g.lineTo(x, 1392); g.stroke(); }
      g.fillStyle = 'rgba(255,255,255,.06)'; for (const x of [nx0 + 16, nx1 - 36]) g.fillRect(x, ny + 30, 4, 1360 - ny);
      const tg = g.createLinearGradient(0, fy, 0, ny); tg.addColorStop(0, '#5a5f68'); tg.addColorStop(1, '#727782');
      g.fillStyle = tg; poly(g, [[fx0, fy], [fx1, fy], [nx1, ny], [nx0, ny]]); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 1.5; for (let i = 0; i < 26; i++) { const t = rnd(i, 166); g.beginPath(); g.moveTo(lerp(nx0, fx0, t), lerp(ny, fy, t)); g.lineTo(lerp(nx1, fx1, t), lerp(ny, fy, t)); g.stroke(); }
      g.fillStyle = '#8c929c'; poly(g, [[nx0, ny], [nx1, ny], [nx1, ny + 28], [nx0, ny + 28]]); g.fill();
      g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(nx0, ny, nx1 - nx0, 2);
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(nx0, ny + 20, nx1 - nx0, 8);
      // Befestigungsring für Handschellen
      g.strokeStyle = '#9aa0aa'; g.lineWidth = 4; g.beginPath(); g.ellipse(540, 1004, 20, 8, 0, 0, TAU); g.stroke();
    }
    // Stühle
    if (o.chairs) for (const d of [1, -1]) {
      const X = x => d > 0 ? x : 1080 - x;
      g.strokeStyle = '#1e2025'; g.lineCap = 'butt'; g.lineWidth = 12;
      for (const [x0, x1] of [[110, 104], [262, 268]]) { g.beginPath(); g.moveTo(X(x0), 1158); g.lineTo(X(x1), 1400); g.stroke(); }
      g.fillStyle = '#25282e'; const xs = [X(92), X(280)].sort((a, b) => a - b); g.fillRect(xs[0], 1136, xs[1] - xs[0], 22);
      g.lineWidth = 16; g.beginPath(); g.moveTo(X(100), 1150); g.lineTo(X(114), 880); g.stroke();
      const bx = [X(98), X(128)].sort((a, b) => a - b); g.fillRect(bx[0], 892, bx[1] - bx[0], 120);
    }
    // Licht der Lampe (gebacken) + Kälte
    const lg = g.createRadialGradient(540, 1000, 180, 540, 940, 1150); lg.addColorStop(0, 'rgba(0,0,0,0)'); lg.addColorStop(.6, 'rgba(0,0,0,.45)'); lg.addColorStop(1, 'rgba(0,0,0,.86)');
    g.fillStyle = lg; g.fillRect(-PAD, -PAD, LW, LH);
    const vg = g.createLinearGradient(0, -PAD, 0, 760); vg.addColorStop(0, 'rgba(0,0,0,.65)'); vg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = vg; g.fillRect(-PAD, -PAD, LW, 960);
    g.globalCompositeOperation = 'lighter'; g.save(); g.translate(540, 1000); g.scale(1, .42); spot(g, 0, 0, 430, 'rgba(200,214,235,A)', .16); g.restore();
    g.globalCompositeOperation = 'source-over'; g.fillStyle = 'rgba(30,45,70,.14)'; g.fillRect(-PAD, -PAD, LW, LH);
  }
  // sitzende Silhouette im Profil (Blick nach rechts, für rechts gespiegelt); o.hand = Handposition x, kein Gesicht
  function seatedFig(c, o, col) {
    const b = o.breathe || 0, ln = o.lean || 0, hx = o.hand != null ? o.hand : 420, U = (x, y) => [x + ln * clamp((1120 - y) / 300), y - b * clamp((1100 - y) / 250)];
    c.save(); c.fillStyle = col; c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round';
    const P = (x, y) => U(x, y), M = (x, y) => { const q = P(x, y); c.moveTo(q[0], q[1]); }, Lt = (x, y) => { const q = P(x, y); c.lineTo(q[0], q[1]); }, Q = (x1, y1, x, y) => { const a1 = P(x1, y1), a2 = P(x, y); c.quadraticCurveTo(a1[0], a1[1], a2[0], a2[1]); };
    c.beginPath();
    M(206, 826); Q(158, 846, 146, 896); Q(124, 1010, 134, 1112); Q(140, 1158, 176, 1162); Lt(326, 1168);
    Q(312, 1262, 324, 1362); Lt(320, 1392); Lt(402, 1395); Q(406, 1376, 380, 1368); Lt(354, 1360);
    Q(358, 1254, 374, 1146); Q(372, 1110, 340, 1106); Lt(256, 1098); Q(270, 1046, 264, 998); Q(276, 902, 248, 864); Lt(246, 826); c.closePath(); c.fill();
    // Kopf (Profil ohne Gesichtszüge)
    const hc = P(232, 762 + (o.headY || 0)); c.beginPath(); c.ellipse(hc[0], hc[1], 49, 59, .16, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(hc[0] + 36, hc[1] + 20, 17, 26, .25, 0, TAU); c.fill();
    const nk = P(226, 826); c.beginPath(); c.ellipse(nk[0], nk[1], 25, 34, .12, 0, TAU); c.fill();
    // Arm auf dem Tisch
    const sh = P(212, 888), ex = 288 + (hx - 420) * .35, ey = 1012;
    c.lineWidth = 46; c.beginPath(); c.moveTo(sh[0], sh[1]); c.lineTo(ex, ey); c.stroke();
    c.lineWidth = 36; c.beginPath(); c.moveTo(ex, ey); c.lineTo(hx - 18, 1000); c.stroke();
    c.beginPath(); c.ellipse(hx + 2, 997, 29, 16, -.05, 0, TAU); c.fill();
    c.restore();
  }
  function irFigure(c, d, o) {
    c.save(); if (d < 0) { c.translate(1080, 0); c.scale(-1, 1); }
    c.save(); c.translate(5, -4); seatedFig(c, o, 'rgba(170,188,215,.42)'); c.restore();
    seatedFig(c, o, '#040506');
    c.restore();
  }
  // 3,5-Zoll-Diskette (lila) auf der Tischplatte: u = waagrecht (px vom Tischmittelpunkt), t = Tiefe (0 vorne .. 1 hinten)
  function irTableP(u, t) { const s = lerp(1, (IR.tf[1] - IR.tf[0]) / (IR.tn[1] - IR.tn[0]), t); return [540 + u * s, lerp(IR.tn[2], IR.tf[2], t)]; }
  function irFloppy(c, uc, tc, rot, lift, a) {
    if (a <= 0) return;
    const S = 66, D = .26, cs = Math.cos(rot), sn = Math.sin(rot);
    const P = (u, v) => { const uu = u * cs - v * sn * 250, vv = (u * sn / 250 + v * cs); const q = irTableP(uc + uu, tc + vv); return [q[0], q[1] - lift]; };
    c.save(); c.globalAlpha = a;
    // Schatten
    const sh = [[-S, -D], [S, -D], [S, D], [-S, D]].map(q => { const r = irTableP(uc + q[0] * cs - q[1] * sn * 250 + lift * .3, tc + q[0] * sn / 250 + q[1] * cs); return r; });
    c.fillStyle = `rgba(0,0,0,${.35 + .2 * (1 - clamp(lift / 60))})`; poly(c, sh); c.fill();
    const body = [P(-S, -D), P(S, -D), P(S, D), P(-S + 9, D), P(-S, D - .035)];
    glow(c, 'rgba(150,80,220,.45)', 16); c.fillStyle = '#5a3f8c'; poly(c, body); c.fill(); noGlow(c);
    c.fillStyle = 'rgba(255,255,255,.08)'; poly(c, [P(-S, -D), P(S, -D), P(S, -D + .05), P(-S, -D + .05)]); c.fill();
    c.fillStyle = '#a3a9b2'; poly(c, [P(-22, D), P(34, D), P(34, D - .17), P(-22, D - .17)]); c.fill();
    c.fillStyle = '#5a3f8c'; poly(c, [P(14, D - .02), P(26, D - .02), P(26, D - .14), P(14, D - .14)]); c.fill();
    c.fillStyle = '#d9d5cc'; poly(c, [P(-50, -D + .03), P(50, -D + .03), P(50, -D + .22), P(-50, -D + .22)]); c.fill();
    c.strokeStyle = 'rgba(40,40,90,.55)'; c.lineWidth = 1.5; for (const v of [.09, .15]) { const A = P(-40, -D + v), B = P(30, -D + v); c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke(); }
    c.fillStyle = '#1a1226'; poly(c, [P(-S + 6, -D + .02), P(-S + 16, -D + .02), P(-S + 16, -D + .06), P(-S + 6, -D + .06)]); c.fill();
    c.restore();
  }
  reg('interview_room', (c, lt, b, gt) => {
    const p = b.p || EMPTY, lamp = p.lamp !== false, table = p.table !== false, mirror = p.mirror !== false;
    const nf = clamp(Math.round(num(p.figures, 2)), 0, 2);
    blitLayer(c, layer('ir|' + (table ? 1 : 0) + (mirror ? 1 : 0) + (nf > 0 ? 1 : 0), g => irRoom(g, { table, mirror, chairs: nf > 0 })));
    // Lampe pendelt leicht
    const th = lamp ? .014 * Math.sin(gt * .8) + .005 * Math.sin(gt * 1.9 + 1) : 0, [px, py] = IR.piv, L = 690;
    const lx = px + Math.sin(th) * L, ly = py + Math.cos(th) * L, fl = lamp ? .95 + .05 * noise(gt * 6, 3) : 0;
    if (mirror) { // Spiegelbild der Lampe + wandernder Glanz
      const [mx0, my0, mx1, my1] = IR.mir; c.save(); c.beginPath(); c.rect(mx0, my0, mx1 - mx0, my1 - my0); c.clip();
      if (lamp) addSpot(c, lx - th * 160, ly - 60, 150, 'rgba(200,214,235,A)', .13 * fl, .6);
      const sx = mx0 + ((gt * 40) % 900) - 200; c.fillStyle = 'rgba(170,190,220,.035)'; poly(c, [[sx, my0], [sx + 60, my0], [sx - 80, my1], [sx - 140, my1]]); c.fill();
      c.restore();
    }
    if (!lamp) { c.fillStyle = 'rgba(2,3,6,.5)'; c.fillRect(-PAD, -PAD, LW, LH); }
    if (lamp) {
      drawCone(c, lx, ly + 70, 540 + th * 900, 1500, 1150, 'rgba(200,214,236,A)', .42 * fl, .14);
      addSpot(c, 540 + th * 600, 1005, 360, 'rgba(205,218,238,A)', .09 * fl, .36);
    }
    // Wandkamera mit roter LED
    if (p.cam !== false) { c.save(); c.fillStyle = '#1c1f24'; c.fillRect(950, 300, 90, 14); c.fillRect(1022, 250, 16, 64); c.translate(915, 330); c.rotate(.55);
      const cg = c.createLinearGradient(0, -24, 0, 24); cg.addColorStop(0, '#3a3e46'); cg.addColorStop(1, '#16181c'); c.fillStyle = cg; rr(c, -62, -24, 96, 48, 7); c.fill();
      c.fillStyle = '#26292f'; rr(c, -70, -30, 112, 12, 4); c.fill(); c.fillStyle = '#050607'; c.beginPath(); c.arc(-62, 0, 16, 0, TAU); c.fill(); c.fillStyle = 'rgba(140,155,180,.35)'; c.beginPath(); c.arc(-66, -5, 5, 0, TAU); c.fill();
      const on = (gt % 1.4) < .8; if (on) { glow(c, 'rgba(255,32,32,1)', 18); c.fillStyle = '#ff2b2b'; } else c.fillStyle = '#5a1012'; c.beginPath(); c.arc(18, -6, 6, 0, TAU); c.fill(); noGlow(c); c.restore();
      if (on) addSpot(c, 925, 322, 70, RED, .18); }
    // Figuren
    const ob = p.object === false ? null : (p.object && typeof p.object === 'object' ? p.object : (p.object === true ? {} : null));
    const oAt = ob ? num(ob.at, 1.5) : null;
    const push = oAt != null ? E.inOut(prog(lt, oAt, oAt + .7)) : 0, back = oAt != null ? E.inOut(prog(lt, oAt + 1.0, oAt + 1.6)) : 0;
    const handR = 420 + (nf >= 2 ? 85 * push * (1 - back) : 0);
    if (nf >= 1) irFigure(c, 1, { breathe: Math.sin(gt * 1.15) * 3, lean: 6 + Math.sin(gt * .4) * 2 });
    // Diskette (wird vom rechten Arm über den Tisch geschoben)
    if (ob && table && lt >= oAt) {
      const pushed = nf >= 2, drop = 1 - E.out(prog(lt, oAt, oAt + (pushed ? .3 : .45))), u = pushed ? lerp(105, 20, push) : 20, a = clamp((lt - oAt) / .15);
      irFloppy(c, u, .5, pushed ? .18 - push * .1 : .08, drop * (pushed ? 40 : 160), a);
    }
    if (nf >= 2) irFigure(c, -1, { breathe: Math.sin(gt * 1.05 + 2) * 3, lean: 2 + Math.sin(gt * .35 + 1) * 2, headY: -10, hand: handR });
    // Lampe vor allem
    if (lamp) {
      c.save(); c.strokeStyle = '#0d0e11'; c.lineWidth = 4; c.beginPath(); c.moveTo(px, py); c.lineTo(lx, ly); c.stroke();
      c.translate(lx, ly); c.rotate(-th);
      const sg = c.createLinearGradient(-90, 0, 90, 0); sg.addColorStop(0, '#15171b'); sg.addColorStop(.6, '#2c3037'); sg.addColorStop(1, '#121317');
      c.fillStyle = sg; poly(c, [[-24, 0], [24, 0], [92, 76], [-92, 76]]); c.fill();
      c.fillStyle = 'rgba(210,222,240,.25)'; c.fillRect(-92, 74, 184, 3);
      c.restore();
      addSpot(c, lx, ly + 76, 70, 'rgba(235,242,255,A)', .7 * fl, .45); addSpot(c, lx, ly + 90, 220, 'rgba(200,214,236,A)', .16 * fl, .7);
      coneDust(c, gt, 81, 120, lx, ly + 70, 160, 540 + th * 900, 1500, 1150, 'rgba(225,232,245,1)', .45 * fl, [-100, 400, LW - 200, 1300]);
    }
    // getipptes Wort
    const wd = p.word === false ? null : (p.word && typeof p.word === 'object' ? p.word : (typeof p.word === 'string' ? { s: p.word } : {}));
    if (wd) typeText(c, lt, gt, wd.s != null ? String(wd.s) : 'CONFESSION', num(wd.at, 1.0), { y: num(p.wordY, 905), size: 92, maxW: 520, color: '#f2f2f4', speed: num(wd.speed, 12) });
  });
  // =====================================================================
  // 5) profile_silhouette – Kopf und Schultern im Profil, völlige Dunkelheit, kein erkennbares Gesicht
  // =====================================================================
  function splinePath(pts) {
    const P = new Path2D(), n = pts.length; P.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      P.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
    }
    P.closePath(); return P;
  }
  // Blick nach rechts; generisches Profil (weiche Formen, keine Details)
  const PS_PTS = [[470, 430], [580, 442], [668, 504], [706, 598], [716, 664], [711, 708], [732, 764], [744, 800], [722, 822], [714, 852], [713, 884], [705, 914], [710, 942], [688, 972], [648, 988], [640, 1036], [650, 1070], [648, 1112], [702, 1170], [792, 1244], [884, 1424], [966, 1710], [1070, 2160], [-170, 2160], [-70, 1650], [56, 1330], [168, 1182], [298, 1092], [354, 1010], [350, 922], [326, 822], [313, 700], [336, 560], [392, 470]];
  let PS_PATH = null;
  const psPath = () => PS_PATH || (PS_PATH = splinePath(PS_PTS));
  const PS_LIGHT = {
    newsprint: { dx: 7, dy: 8, col: [205, 212, 222], a: .66, src: [800, 1240], wrap: .18 },
    lamp: { dx: 10, dy: 1, col: [236, 186, 140], a: .6, src: [960, 760], wrap: .12 },
    none: { dx: -6, dy: -4, col: [120, 140, 175], a: .34, src: [200, 500], wrap: 0 },
  };
  function psNewspaper() {
    return sprite('ps|paper', 900, 640, (g, w, h) => {
      paperTex(g, w, h, '#cbc7bb', 91, { stains: 3, edge: .25 });
      const tc = mkCv(w, h), q = tc.getContext('2d');
      q.fillStyle = '#1b1b1b'; q.fillRect(40, 40, w - 80, 46); q.fillRect(40, 100, w * .55, 30);
      q.fillStyle = '#3a3a3a'; q.fillRect(40, 150, 300, 220);
      for (let i = 0; i < 300; i++) { q.fillStyle = `rgba(0,0,0,${.15 + rnd(i, 171) * .4})`; q.beginPath(); q.arc(48 + rnd(i, 172) * 284, 158 + rnd(i, 173) * 204, 2 + rnd(i, 174) * 4, 0, TAU); q.fill(); }
      q.fillStyle = 'rgba(25,25,25,.75)';
      for (const [x0, y0, cw] of [[370, 150, 230], [620, 150, 240], [40, 390, 260], [320, 390, 280], [620, 390, 240]]) for (let y = y0; y < h - 30; y += 15) { let x = x0; while (x < x0 + cw - 10) { const ww = 10 + rnd(x + y, 175) * 34; q.fillRect(x, y, Math.min(ww, x0 + cw - x), 6); x += ww + 6; } }
      g.filter = 'blur(4px)'; g.drawImage(tc, 0, 0); g.filter = 'none';
      const fg = g.createLinearGradient(0, 0, 0, h); fg.addColorStop(0, 'rgba(255,255,255,.06)'); fg.addColorStop(1, 'rgba(0,0,0,.4)'); g.fillStyle = fg; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(w / 2 - 3, 0, 6, h);
    });
  }
  function psPaperSoft(mode) { // unscharfer Vordergrund: Zeitung mit weichen Kanten, Helligkeit je Lichtmodus
    const pl = mode === 'newsprint' ? .42 : mode === 'lamp' ? .3 : .1;
    return sprite('ps|papersoft|' + mode, 980, 720, (g) => {
      const t = mkCv(900, 640), q = t.getContext('2d'); q.drawImage(psNewspaper(), 0, 0);
      q.globalCompositeOperation = 'multiply'; const sg = q.createRadialGradient(450, 120, 100, 450, 320, 760); sg.addColorStop(0, '#fff'); sg.addColorStop(1, `rgb(${Math.round(128 * pl)},${Math.round(128 * pl)},${Math.round(140 * pl)})`); q.fillStyle = sg; q.fillRect(0, 0, 900, 640);
      q.globalCompositeOperation = 'source-over'; q.fillStyle = `rgba(0,0,0,${.75 - pl})`; q.fillRect(0, 0, 900, 640);
      if (mode === 'lamp') { q.fillStyle = 'rgba(255,170,100,.08)'; q.fillRect(0, 0, 900, 640); }
      g.filter = 'blur(3.5px)'; g.drawImage(t, 40, 40); g.filter = 'none';
    });
  }
  function psFigure(c, gt, o, L, br) {
    const path = psPath();
    c.save(); c.translate(0, 2160); c.scale(1, 1 + .0035 * br); c.translate(0, -2160);
    if (L && L.a > 0) { // Kantenlicht: helle Kopie zum Licht hin versetzt, darüber die schwarze Silhouette
      c.save(); c.translate(L.dx, L.dy); const gr = c.createRadialGradient(L.src[0], L.src[1], 50, L.src[0], L.src[1], 1100);
      gr.addColorStop(0, `rgba(${L.col},${L.a * o.lf})`); gr.addColorStop(1, `rgba(${L.col},${L.a * o.lf * .25})`); c.fillStyle = gr; c.fill(path); c.restore();
    }
    c.fillStyle = '#030304'; c.fill(path);
    if (L && L.wrap > 0) { c.save(); c.clip(path); c.globalCompositeOperation = 'lighter'; spot(c, L.src[0], L.src[1] - 120, 620, `rgba(${L.col},A)`, L.wrap * o.lf); c.restore(); }
    if (o.glasses) { // Brillengestell als feine Lichtkante
      c.save(); c.strokeStyle = `rgba(${L && L.a > 0 ? L.col : [160, 170, 190]},${.55 * o.lf})`; c.lineWidth = 3; c.lineCap = 'round';
      c.beginPath(); c.moveTo(722, 690); c.quadraticCurveTo(733, 732, 726, 776); c.stroke();
      c.lineWidth = 2.4; c.beginPath(); c.moveTo(724, 698); c.lineTo(530, 712); c.quadraticCurveTo(505, 716, 500, 748); c.stroke();
      c.globalAlpha = .5; c.beginPath(); c.moveTo(726, 776); c.quadraticCurveTo(700, 782, 690, 770); c.stroke();
      c.restore();
    }
    c.restore();
  }
  function psEyeLine(c, lt, gt, at, glitchK) {
    if (at == null || lt < at) return;
    const k = E.out(prog(lt, at, at + .45)), pu = .85 + .15 * Math.sin(gt * 4.2) + .1 * noise(gt * 12, 5) + glitchK * .6, y = 736;
    const x0 = lerp(668, 612, k), x1 = lerp(668, 752, k);
    c.save(); glow(c, 'rgba(255,32,32,1)', 26); c.strokeStyle = `rgba(255,40,36,${clamp(pu)})`; c.lineWidth = 5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
    noGlow(c); c.strokeStyle = `rgba(255,200,190,${clamp(pu) * .9})`; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x0 + 10, y); c.lineTo(x1 - 6, y); c.stroke();
    c.restore();
    addSpot(c, 690, y, 140 + 40 * glitchK, RED, (.16 + .15 * glitchK) * k * pu, .5);
  }
  reg('profile_silhouette', (c, lt, b, gt) => {
    const p = b.p || EMPTY, side = p.side === 'left' ? -1 : 1;
    const mode = PS_LIGHT[p.glow] ? p.glow : (p.glow === false ? 'none' : 'newsprint'), L = PS_LIGHT[mode];
    const paper = p.paper !== false, eyeAt = tOf(p.eyeLine, 1.4);
    const gts = Array.isArray(p.glitch) ? p.glitch : (p.glitch != null && p.glitch !== false ? [tOf(p.glitch, 2.5)] : []);
    let gk = 0, gs = 0; for (const g0 of gts) if (g0 != null && lt >= g0 && lt < g0 + .5) { gk = Math.max(gk, Math.sin(prog(lt, g0, g0 + .5) * Math.PI) * (flicker(gt, 81, 30) > .5 ? 1 : .4)); gs = g0; }
    blitLayer(c, layer('ps|bg|' + mode + '|' + side, g => { g.fillStyle = '#030304'; g.fillRect(-PAD, -PAD, LW, LH); if (side < 0) { g.translate(1080, 0); g.scale(-1, 1); }
      spot(g, 470, 760, 620, 'rgba(70,82,104,A)', .11); if (mode !== 'none') spot(g, L.src[0] + 60, L.src[1], 700, `rgba(${L.col},A)`, .05); }));
    const br = Math.sin(gt * 1.25), lf = (mode === 'newsprint' ? .9 + .1 * noise(gt * 1.6, 7) : mode === 'lamp' ? .92 + .06 * noise(gt * 5, 8) : 1) * (1 + gk * .3);
    c.save();
    if (side < 0) { c.translate(1080, 0); c.scale(-1, 1); }
    const dx = noise(gt * .2, 11) * 4, dy = br * 3;
    c.translate(dx, dy);
    const o = { glasses: !!p.glasses, lf };
    if (gk > 0) { // Glitch: Farbsäume, dann Streifen einer einzigen Offscreen-Fassung versetzt
      const seed = Math.floor(gt * 24) + gs * 13;
      c.save(); c.globalAlpha = .5 * gk; c.translate(18 * gk, 0); c.fillStyle = 'rgba(200,20,24,1)'; c.fill(psPath()); c.translate(-36 * gk, 0); c.fillStyle = 'rgba(30,120,200,1)'; c.fill(psPath()); c.restore();
      psFigure(c, gt, o, L, br);
      const g2 = patch(W, 1500); g2.drawImage(c.canvas, 0, 300, W, 1500, 0, 0, W, 1500); // ein Schnappschuss, dann Streifen versetzen (Gerätepixel)
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
      for (let i = 0; i < 7; i++) { const y0 = Math.floor(hash(seed + i * 3.1) * 1400), hh = Math.floor(14 + hash(seed + i * 1.7) * 80), off = Math.round((hash(seed * 1.3 + i) - .5) * 150 * gk);
        c.drawImage(PATCH, 0, y0, W, hh, off, y0 + 300, W, hh); }
      c.restore();
    } else psFigure(c, gt, o, L, br);
    psEyeLine(c, lt, gt, eyeAt, gk);
    // Zeitung im Vordergrund + Finger
    if (paper) {
      const lift = Math.sin(gt * 1.25 + .4) * 5;
      c.save(); c.translate(720 + dx * .5, 1560 + lift); c.transform(1, 0, -.16, 1, 0, 0); c.rotate(-.1); c.scale(1, .82);
      c.drawImage(psPaperSoft(mode), -490, -360);
      // Finger über der Oberkante
      for (let i = 0; i < 3; i++) { const fx = -330 + i * 40, top = -366 + Math.abs(i - 1) * 8;
        c.fillStyle = `rgba(${L.col},${mode === 'none' ? .12 : .32})`; rr(c, fx - 2, top - 3, 34, 64, 16); c.fill();
        c.fillStyle = '#040405'; rr(c, fx, top, 30, 62, 15); c.fill(); }
      c.restore();
      if (mode === 'newsprint') addSpot(c, 760, 1420, 520, 'rgba(205,212,222,A)', .1 * lf, .6);
    }
    c.restore();
    motes(c, gt, 18, 91, -100, 300, W + 200, 1400, 'rgba(180,190,210,1)', .12, 2, 5);
  });
})();
