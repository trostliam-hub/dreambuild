'use strict';
// Justiz & Doppelleben (True Crime): courtroom (Gerichtssaal), cell (Zelle), double_life (geteiltes Bild normal | dunkel).
// Alles in einer IIFE, damit Hilfsnamen nicht mit anderen Szenen-Dateien kollidieren; nach außen nur SCENES.*
(() => {
  const TAU = Math.PI * 2;
  const num = (v, d) => (typeof v === 'number' && isFinite(v)) ? v : d;
  const list = v => v == null || v === false ? [] : Array.isArray(v) ? v : [v];
  const COLD = 'rgba(160,185,225,A)', WARM = 'rgba(255,186,110,A)';

  // ---------- Ebenen-Cache: statische Ebenen als Offscreen-Canvas (x -200..W+200+extra, y y0..H+200) ----------
  const CACHE = new Map();
  function layer(key, draw, extra = 0, y0 = -200) {
    let cv = CACHE.get(key);
    if (!cv) {
      cv = document.createElement('canvas'); cv.width = W + 400 + extra; cv.height = H + 200 - y0; cv._y0 = y0;
      const g = cv.getContext('2d'); g.translate(200, -y0); draw(g);
      CACHE.set(key, cv); if (CACHE.size > 30) CACHE.delete(CACHE.keys().next().value);
    }
    return cv;
  }
  const blit = (c, cv, dx = 0) => c.drawImage(cv, -200 + dx, cv._y0);
  // Ausschnitt einer Ebene erneut zeichnen (Szenen-Koordinaten x0..x1, y0..y1) – verdeckt dynamische Figuren dahinter
  const reblit = (c, cv, x0, y0, x1, y1, dx = 0) => c.drawImage(cv, x0 + 200, y0 - cv._y0, x1 - x0, y1 - y0, x0 + dx, y0, x1 - x0, y1 - y0);
  // kleine Sprites (leuchtende Wörter, Schilder): einmal mit shadowBlur zeichnen, danach nur noch drawImage
  const SPR = new Map();
  function sprite(key, w, h, draw) {
    let cv = SPR.get(key);
    if (!cv) {
      cv = document.createElement('canvas'); cv.width = Math.ceil(w); cv.height = Math.ceil(h);
      const g = cv.getContext('2d'); g.translate(cv.width / 2, cv.height / 2); draw(g);
      SPR.set(key, cv); if (SPR.size > 40) SPR.delete(SPR.keys().next().value);
    }
    return cv;
  }
  const drawSpr = (c, cv) => c.drawImage(cv, -cv.width / 2, -cv.height / 2);
  function grade(g, col, extra = 0) { g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = col; g.fillRect(-200, -200, W + 400 + extra, H + 400); g.restore(); }
  // weicher Lichtschein ohne shadowBlur (billig): horizontaler Verlauf um eine senkrechte Linie
  function vGlowLine(c, x, y0, y1, w, col, a) {
    const g = c.createLinearGradient(x - w, 0, x + w, 0); g.addColorStop(0, col.replace('A', 0)); g.addColorStop(.5, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0));
    c.fillStyle = g; c.fillRect(x - w, y0, 2 * w, y1 - y0);
  }

  // ---------- Path2D-Bausteine (alle im Uhrzeigersinn → nonzero-Füllung ergibt die Vereinigung, ein Schatten) ----------
  function pCirc(p, x, y, r) { p.moveTo(x + r, y); p.arc(x, y, r, 0, TAU); }
  function pEll(p, x, y, rx, ry) { p.moveTo(x + rx, y); p.ellipse(x, y, rx, ry, 0, 0, TAU); }
  function pPoly(p, pts) {
    let s = 0; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; s += a[0] * b[1] - b[0] * a[1]; }
    if (s < 0) pts = pts.slice().reverse();
    p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath();
  }
  function pLimb(p, a, b, ra, rb) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    pPoly(p, [[a[0] + nx * ra, a[1] + ny * ra], [b[0] + nx * rb, b[1] + ny * rb], [b[0] - nx * rb, b[1] - ny * rb], [a[0] - nx * ra, a[1] - ny * ra]]);
    pCirc(p, a[0], a[1], ra); pCirc(p, b[0], b[1], rb);
  }
  function hull(pts) { // konvexe Hülle (monotone chain)
    const P = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const q of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (let i = P.length - 1; i >= 0; i--) { const q = P[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  function polyPath(c, pts) { c.beginPath(); pts.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.closePath(); }

  // ---------- Silhouette eines Menschen (gefüllt, nie ein Gesicht). Gelenke in Einheiten der Körpergröße, Füße bei y = 0 ----------
  function mkPose(o) {
    const r = { head: o.head, neck: o.neck };
    for (const k of ['sh', 'el', 'ha', 'hip', 'kn', 'an']) { const v = o[k]; r[k + 'L'] = v.length === 4 ? [v[0], v[1]] : [-v[0], v[1]]; r[k + 'R'] = v.length === 4 ? [v[2], v[3]] : [v[0], v[1]]; }
    return r;
  }
  const LEG_ST = { hip: [.06, -.47], kn: [.064, -.245], an: [.066, -.035] }, LEG_SIT = { hip: [.066, -.27], kn: [.085, -.255], an: [.088, -.035] };
  const UP_ST = { head: [0, -.928], neck: [0, -.858], sh: [.118, -.8] }, UP_SIT = { head: [0, -.728], neck: [0, -.658], sh: [.118, -.6] };
  const MP = {
    stand: mkPose({ ...UP_ST, ...LEG_ST, el: [.146, -.615], ha: [.156, -.462] }),
    lectern: mkPose({ ...UP_ST, ...LEG_ST, el: [.148, -.625], ha: [.105, -.5] }),
    clip: mkPose({ ...UP_ST, ...LEG_ST, el: [-.15, -.645, .145, -.635], ha: [-.035, -.665, .05, -.64] }),
    hold: mkPose({ ...UP_ST, ...LEG_ST, el: [-.17, -.6, .142, -.62], ha: [-.105, -.45, .148, -.455] }),
    sit: mkPose({ ...UP_SIT, ...LEG_SIT, el: [.15, -.43], ha: [.11, -.3] }),
    table: mkPose({ ...UP_SIT, ...LEG_SIT, el: [.168, -.47], ha: [.1, -.425] }),
    pew: mkPose({ ...UP_SIT, ...LEG_SIT, el: [.152, -.47], ha: [.06, -.48] }),
    write: mkPose({ head: [0, -.712], neck: [0, -.648], sh: [.118, -.592], ...LEG_SIT, el: [.165, -.46], ha: [-.07, -.42, .085, -.418] }),
    bowed: mkPose({ head: [0, -.585], neck: [0, -.56], sh: [.122, -.535], ...LEG_SIT, el: [.105, -.3], ha: [.022, -.405] }),
  };
  function lerpPose(a, b, k) { const o = {}; for (const key in a) o[key] = [lerp(a[key][0], b[key][0], k), lerp(a[key][1], b[key][1], k)]; return o; }
  function manPath(x, y, h, P, o) {
    const d = o.flip ? -1 : 1, up = o.breath || 0, sx = o.shoulder || 1, hs = o.headScale || 1, u = h;
    const Q = (v, k = 1, s = 1) => [x + v[0] * s * h * d, y + (v[1] - up * k) * h];
    const hd = Q([P.head[0] + (o.headDx || 0), P.head[1] + (o.headDy || 0)]), nk = Q(P.neck);
    const sL = Q(P.shL, 1, sx), sR = Q(P.shR, 1, sx), eL = Q(P.elL, .6, sx), eR = Q(P.elR, .6, sx), aL = Q(P.haL, .3), aR = Q(P.haR, .3);
    const hL = Q(P.hipL, 0), hR = Q(P.hipR, 0), kL = Q(P.knL, 0), kR = Q(P.knR, 0), nL = Q(P.anL, 0), nR = Q(P.anR, 0);
    const body = new Path2D(), head = new Path2D();
    const off = (q, ax, ay) => [q[0] + d * ax * u, q[1] + ay * u]; // ax > 0 = nach außen (rechte Seite), für links negativ übergeben
    // Rumpf: Nackenansatz → Trapez → Schulter → Achsel → Taille → Hüfte (beidseitig)
    pPoly(body, [off(nk, -.03 * sx, .012), off(sL, .032 * sx, -.022), off(sL, -.014, .004), off(sL, .01, .066), off(hL, -.036 * sx, -.09), off(hL, -.046, 0),
      off(hR, .046, 0), off(hR, .036 * sx, -.09), off(sR, -.01, .066), off(sR, .014, .004), off(sR, -.032 * sx, -.022), off(nk, .03 * sx, .012)]);
    pPoly(body, [off(hL, -.048, -.04), off(hR, .048, -.04), off(hR, .04, .05), off(hL, -.04, .05)]);
    pCirc(body, ...off(sL, 0, .024), .026 * u); pCirc(body, ...off(sR, 0, .024), .026 * u);
    if (o.robe) {
      pPoly(body, [off(sL, -.02, -.004), off(sR, .02, -.004), off(sR, .09, .55), off(sL, -.09, .55)]);
    }
    for (const [s, e, a, sg] of [[sL, eL, aL, -1], [sR, eR, aR, 1]]) {
      const s0 = off(s, sg * .006, .03);
      pLimb(body, s0, e, (o.robe ? .05 : .03) * u, (o.robe ? .055 : .027) * u); pLimb(body, e, a, (o.robe ? .05 : .026) * u, (o.robe ? .045 : .021) * u);
      if (!o.noHands) pEll(body, a[0], a[1] + .012 * u, .021 * u, .031 * u);
    }
    if (o.jacket) pPoly(body, [off(hL, -.036 * sx, -.09), off(hR, .036 * sx, -.09), off(hR, .054, .065), off(hL, -.054, .065)]);
    if (o.dress) pPoly(body, [off(hL, -.05, -.07), off(hR, .05, -.07), off(hR, .11, .29), off(hL, -.11, .29)]);
    if (!o.noLegs) for (const [hp, kn, an, sg] of [[hL, kL, nL, -1], [hR, kR, nR, 1]]) {
      const th = o.dress ? .62 : 1;
      pLimb(body, hp, kn, .05 * u * th, .04 * u * th); pLimb(body, kn, an, .038 * u * th, .027 * u * th);
      pEll(body, an[0] + sg * d * .008 * u, an[1] + .02 * u, .04 * u * (o.dress ? .8 : 1), .017 * u);
    }
    // Kopf
    const tn = o.turn || 0, at = Math.abs(tn), ts = Math.sign(tn), hx = hd[0] + tn * .006 * u, hy = hd[1], U = u * hs;
    pLimb(head, [lerp(hd[0], nk[0], .5), hy + .045 * U], [nk[0], nk[1] + .01 * u], .023 * u * Math.min(1.2, hs), .027 * u);
    pEll(head, hx, hy, .05 * U, .062 * U); pEll(head, hx - .002 * U, hy - .017 * U, .053 * U, .049 * U);
    if (o.hair === 'bob') { pEll(head, hx, hy + .01 * U, .066 * U, .066 * U); pEll(head, hx, hy + .048 * U, .07 * U, .04 * U); }
    if (o.hair === 'bun') pCirc(head, hx + .01 * U, hy - .066 * U, .028 * U);
    if (o.hair !== 'bob') for (const s of [-1, 1]) if (!(at > .3 && ts === s)) pEll(head, hx + s * .049 * U, hy + .006 * U, .009 * U, .016 * U);
    if (at > .25) pPoly(head, [[hx + ts * .045 * U, hy - .008 * U], [hx + ts * (.047 + .02 * at) * U, hy + .02 * U], [hx + ts * .043 * U, hy + .03 * U]]);
    if (o.cap) {
      pPoly(head, [[hx - .053 * U, hy - .026 * U], [hx + .053 * U, hy - .026 * U], [hx + .066 * U, hy - .07 * U], [hx - .066 * U, hy - .07 * U]]);
      pEll(head, hx, hy - .07 * U, .066 * U, .012 * U); pEll(head, hx, hy - .02 * U, .06 * U, .012 * U);
    }
    return { body, head, hd: [hx, hy], hands: [aL, aR], els: [eL, eR], sh: [sL, sR], u };
  }
  // nur Unterarme + Hände (z. B. auf einer Tischplatte, nachdem der Tisch den Körper verdeckt hat)
  function drawForearms(c, m, o) {
    const p = new Path2D(), u = m.u;
    for (let i = 0; i < 2; i++) { pLimb(p, m.els[i], m.hands[i], .026 * u, .021 * u); pEll(p, m.hands[i][0], m.hands[i][1] + .012 * u, .021 * u, .031 * u); }
    if (o.rims && o.rims[0]) { c.save(); c.translate(0, -2); c.globalAlpha *= .6; c.fillStyle = o.rims[0][0]; c.fill(p); c.restore(); } // nur feine Oberkante
    c.fillStyle = o.color || '#050608'; c.fill(p);
  }
  // o: color, bodyColor (z. B. Overall), rims [[farbe, dx, dy], ...] (versetzte helle Kopien = Streiflicht), glow, glowBlur, alpha, breath …
  function drawMan(c, x, y, h, pose, o = {}) {
    const P = typeof pose === 'string' ? (MP[pose] || MP.stand) : pose;
    const m = manPath(x, y, h, P, o);
    const all = new Path2D(m.body); all.addPath(m.head); m.all = all;
    c.save(); if (o.alpha != null) c.globalAlpha *= o.alpha;
    for (const [rc, dx, dy] of (o.rims || [])) { c.save(); c.translate(dx, dy); c.fillStyle = rc; c.fill(all); c.restore(); }
    if (o.glow) glow(c, o.glow, o.glowBlur || 30);
    if (o.bodyColor) { c.fillStyle = o.bodyColor; c.fill(m.body); noGlow(c); c.fillStyle = o.color || '#050608'; c.fill(m.head); }
    else { c.fillStyle = o.color || '#050608'; c.fill(all); }
    noGlow(c); c.restore();
    return m;
  }
  // Kopf + Schultern von hinten (Zuschauer), turn -1..1 dreht den Kopf ins Profil
  function bust(c, x, y, r, turn, o = {}) {
    const p = new Path2D();
    pEll(p, x, y + r * 1.35, r * 2.2, r * 1.45);
    pPoly(p, [[x - r * .42, y - r * .9], [x + r * .42, y - r * .9], [x + r * .52, y + r * .1], [x - r * .52, y + r * .1]]);
    const hx = x + turn * r * .12, hy = y - r * 1.2, at = Math.abs(turn), ts = Math.sign(turn);
    pEll(p, hx, hy, r * .84, r);
    if (o.hair === 'bob') pEll(p, hx, hy + r * .2, r * .98, r * .9);
    if (o.hair === 'bun') pCirc(p, hx - turn * r * .2, hy - r * .82, r * .36);
    if (o.hair !== 'bob') for (const s of [-1, 1]) if (!(at > .3 && ts === s)) pEll(p, hx + s * r * .82, hy + r * .1, r * .14, r * .24);
    if (at > .22) pPoly(p, [[hx + ts * r * .74, hy - r * .12], [hx + ts * r * (.8 + .26 * at), hy + r * .3], [hx + ts * r * .7, hy + r * .44]]);
    c.fillStyle = o.color || '#06080b'; c.fill(p);
    if (o.rim) {
      c.strokeStyle = o.rim; c.lineWidth = Math.max(1.5, r * .07); c.lineCap = 'round';
      c.beginPath(); c.ellipse(hx, hy, r * .84, r, 0, Math.PI * 1.18, Math.PI * 1.82); c.stroke();
      c.beginPath(); c.ellipse(x, y + r * 1.35, r * 2.2, r * 1.45, 0, Math.PI * 1.13, Math.PI * 1.36); c.stroke();
      c.beginPath(); c.ellipse(x, y + r * 1.35, r * 2.2, r * 1.45, 0, Math.PI * 1.64, Math.PI * 1.87); c.stroke();
    }
  }
  // Staubkörner in einem Lichtkegel (pos(u, v) → [x, y]), deterministisch
  function dust(c, gt, n, seed, pos, col, a = .5) {
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const u = (hash(i * 3.1 + seed) + gt * (.006 + hash(i + seed * 2) * .012)) % 1, v = (hash(i * 7.3 + seed) + noise(gt * .2, i + seed) * .08 + 1) % 1;
      const [x, y] = pos(u, v), tw = .35 + .65 * Math.max(0, Math.sin(gt * (1 + hash(i) * 2) + i));
      c.fillStyle = col.replace('A', (a * tw).toFixed(3)); c.beginPath(); c.arc(x, y, 1.2 + hash(i * 1.7 + seed) * 2.4, 0, TAU); c.fill();
    }
    c.restore();
  }
  // Wackeln: Summe abklingender Stöße
  const kick = (lt, ts, amp, decay = 9) => ts.reduce((a, t) => a + (lt >= t ? Math.exp(-(lt - t) * decay) * amp : 0), 0);
  function flash(c, lt, ts, col, a, d) {
    for (const t of ts) if (lt >= t && lt < t + d) { const k = 1 - (lt - t) / d; c.fillStyle = col; c.globalAlpha = a * k * k; c.fillRect(-300, -300, W + 600, H + 600); c.globalAlpha = 1; }
  }

  // ======================================================================
  // 1) GERICHTSSAAL
  // ======================================================================
  function courtBack(g, bench) {
    bgFill(g, '#0d1117', '#07090c');
    let gr = g.createLinearGradient(0, -200, 0, 260); gr.addColorStop(0, '#06080b'); gr.addColorStop(1, '#10151b');
    g.fillStyle = gr; g.fillRect(-200, -200, W + 400, 460);
    // Decken-Kassetten (Perspektive)
    g.strokeStyle = 'rgba(120,140,170,.07)'; g.lineWidth = 3;
    for (let i = -7; i <= 7; i++) { g.beginPath(); g.moveTo(540 + i * 70, 252); g.lineTo(540 + i * 260, -200); g.stroke(); }
    for (const yy of [200, 120, 0]) { g.beginPath(); g.moveTo(-200, yy); g.lineTo(W + 200, yy); g.stroke(); }
    gr = g.createLinearGradient(0, 260, 0, 660); gr.addColorStop(0, '#1a2129'); gr.addColorStop(1, '#262e38');
    g.fillStyle = gr; g.fillRect(-200, 260, W + 400, 400);
    g.fillStyle = '#323c47'; g.fillRect(-200, 250, W + 400, 10); g.fillStyle = '#0a0d10'; g.fillRect(-200, 260, W + 400, 7);
    // hohe Fenster mit kaltem Tageslicht
    for (const wx of [24, 936]) {
      gr = g.createLinearGradient(0, 300, 0, 630); gr.addColorStop(0, '#6c809a'); gr.addColorStop(1, '#2f3c4b');
      g.fillStyle = '#0b0e12'; g.fillRect(wx - 12, 288, 144, 352);
      g.fillStyle = gr; g.fillRect(wx, 300, 120, 330);
      g.fillStyle = '#0b0e12'; g.fillRect(wx + 56, 300, 8, 330); for (let y = 380; y < 630; y += 82) g.fillRect(wx, y, 120, 6);
      g.save(); g.globalCompositeOperation = 'lighter'; spot(g, wx + 60, 460, 260, COLD, .12); g.restore();
    }
    // Holzvertäfelung der Rückwand
    gr = g.createLinearGradient(0, 660, 0, 1010); gr.addColorStop(0, '#29231f'); gr.addColorStop(1, '#16120f');
    g.fillStyle = gr; g.fillRect(-200, 660, W + 400, 350);
    g.fillStyle = '#3d352f'; g.fillRect(-200, 656, W + 400, 8);
    for (let x = -190; x < W + 200; x += 128) {
      g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(x + 12, 690, 104, 300);
      g.strokeStyle = 'rgba(255,235,215,.06)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 12, 990); g.lineTo(x + 12, 690); g.lineTo(x + 116, 690); g.stroke();
      g.strokeStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.moveTo(x + 116, 690); g.lineTo(x + 116, 990); g.lineTo(x + 12, 990); g.stroke();
    }
    if (bench) {
      // Rückwand hinter dem Richter: dunkles Feld mit Pilastern, rundes Siegel (ohne Motiv)
      g.fillStyle = '#17120f'; g.fillRect(290, 300, 500, 400);
      gr = g.createLinearGradient(290, 0, 790, 0); gr.addColorStop(0, 'rgba(0,0,0,.4)'); gr.addColorStop(.5, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.4)'); g.fillStyle = gr; g.fillRect(290, 300, 500, 400);
      for (const px of [290, 750]) { g.fillStyle = '#2a231e'; g.fillRect(px, 300, 40, 400); g.fillStyle = 'rgba(255,235,215,.07)'; g.fillRect(px + 4, 300, 4, 400); }
      g.fillStyle = '#3a312a'; g.fillRect(276, 288, 528, 16);
      for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(255,255,255,.025)'; g.fillRect(345 + i * 70, 320, 24, 360); }
      g.save(); g.translate(540, 392);
      gr = g.createRadialGradient(-18, -18, 4, 0, 0, 66); gr.addColorStop(0, '#5b5244'); gr.addColorStop(1, '#2a241d');
      g.beginPath(); g.arc(0, 0, 64, 0, TAU); g.fillStyle = gr; g.fill();
      g.strokeStyle = '#1a1613'; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, 50, 0, TAU); g.stroke(); g.beginPath(); g.arc(0, 0, 30, 0, TAU); g.stroke();
      g.strokeStyle = 'rgba(255,240,210,.12)'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 62, Math.PI * 1.1, Math.PI * 1.6); g.stroke();
      g.restore();
      // Richterstuhl
      rr(g, 470, 468, 140, 262, 46); gr = g.createLinearGradient(470, 0, 610, 0); gr.addColorStop(0, '#0c0a0b'); gr.addColorStop(.35, '#1d181a'); gr.addColorStop(1, '#09080a');
      g.fillStyle = gr; g.fill(); g.strokeStyle = 'rgba(200,210,230,.08)'; g.lineWidth = 3; g.stroke();
    }
    // Leuchtstoff-Felder an der Decke + kaltes Oberlicht (eingebacken)
    for (const [y, w, hh] of LIGHTS) {
      g.save(); glow(g, 'rgba(190,210,240,.9)', 40); g.fillStyle = '#c9d6e6'; g.beginPath();
      g.moveTo(540 - w / 2, y); g.lineTo(540 + w / 2, y); g.lineTo(540 + w / 2 - 14, y + hh); g.lineTo(540 - w / 2 + 14, y + hh); g.fill(); noGlow(g); g.restore();
    }
    g.save(); g.globalCompositeOperation = 'lighter'; spot(g, 540, 300, 760, COLD, .075); spot(g, 540, 560, 300, COLD, .09); g.restore();
  }
  const LIGHTS = [[22, 560, 30], [132, 400, 22], [212, 290, 14]];
  function courtFront(g, bench) {
    // Boden
    let gr = g.createLinearGradient(0, 1010, 0, 1700); gr.addColorStop(0, '#1b2129'); gr.addColorStop(1, '#0a0c10');
    g.fillStyle = gr; g.fillRect(-200, 1010, W + 400, H + 200);
    g.strokeStyle = 'rgba(160,180,210,.06)'; g.lineWidth = 2;
    for (let i = -14; i <= 14; i++) { g.beginPath(); g.moveTo(540 + i * 40, 1010); g.lineTo(540 + i * 230, H + 200); g.stroke(); }
    for (let k = 0; k < 9; k++) { const y = 1010 + 18 * (Math.pow(1.55, k) - 1); g.beginPath(); g.moveTo(-200, y); g.lineTo(W + 200, y); g.stroke(); }
    g.save(); g.globalCompositeOperation = 'lighter'; g.translate(540, 1060); g.scale(1, .22); spot(g, 0, 0, 520, COLD, .09); g.restore();
    // Zeugenstand links, Protokollführer rechts
    const desk = (x0, x1, y0) => {
      gr = g.createLinearGradient(0, y0, 0, 1010); gr.addColorStop(0, '#2d2622'); gr.addColorStop(1, '#151210');
      g.fillStyle = gr; g.fillRect(x0, y0, x1 - x0, 1010 - y0);
      g.fillStyle = '#463c35'; g.fillRect(x0, y0 - 12, x1 - x0, 14); g.fillStyle = 'rgba(190,205,230,.12)'; g.fillRect(x0, y0 - 12, x1 - x0, 3);
      for (let x = x0 + 24; x < x1 - 60; x += 118) { g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 4; g.strokeRect(x, y0 + 26, 94, 1010 - y0 - 52); g.strokeStyle = 'rgba(255,235,215,.05)'; g.lineWidth = 2; g.strokeRect(x + 4, y0 + 30, 94, 1010 - y0 - 52); }
    };
    desk(-200, 236, 800); desk(846, W + 200, 846);
    if (bench) {
      // Richterbank
      gr = g.createLinearGradient(0, 700, 0, 1010); gr.addColorStop(0, '#3a312b'); gr.addColorStop(.25, '#2c2520'); gr.addColorStop(1, '#171310');
      g.fillStyle = gr; g.fillRect(228, 700, 624, 310);
      g.fillStyle = '#4c423a'; g.fillRect(214, 686, 652, 20); g.fillStyle = 'rgba(200,215,240,.22)'; g.fillRect(214, 686, 652, 3);
      g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(214, 706, 652, 6);
      for (const [x0, x1] of [[262, 438], [452, 628], [642, 818]]) {
        g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x0, 748, x1 - x0, 228);
        g.strokeStyle = 'rgba(255,235,215,.08)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, 976); g.lineTo(x0, 748); g.lineTo(x1, 748); g.stroke();
        g.strokeStyle = 'rgba(0,0,0,.5)'; g.beginPath(); g.moveTo(x1, 748); g.lineTo(x1, 976); g.lineTo(x0, 976); g.stroke();
      }
      rr(g, 480, 722, 120, 16, 3); g.fillStyle = '#5e5240'; g.fill(); // Schild ohne Text
      // Mikrofon + Schlagklotz
      g.strokeStyle = '#0d0f12'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(438, 688); g.quadraticCurveTo(436, 640, 462, 628); g.stroke();
      g.fillStyle = '#0d0f12'; g.beginPath(); g.ellipse(466, 626, 9, 6, -.5, 0, TAU); g.fill(); g.beginPath(); g.ellipse(438, 688, 16, 5, 0, 0, TAU); g.fill();
      g.beginPath(); g.ellipse(708, 688, 30, 8, 0, 0, TAU); g.fillStyle = '#2a1b12'; g.fill(); g.fillStyle = '#3d2a1c'; g.fillRect(678, 680, 60, 8);
      g.beginPath(); g.ellipse(708, 680, 30, 7, 0, 0, TAU); g.fillStyle = '#5a4030'; g.fill();
    }
    // Tische (Verteidigung links, Anklage rechts)
    for (const [x0, x1] of [[96, 604], [676, 1070]]) {
      g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse((x0 + x1) / 2, 1186, (x1 - x0) / 2 + 30, 18, 0, 0, TAU); g.fill();
      g.fillStyle = '#0f0c0b'; for (const lx of [x0 + 16, x1 - 30]) g.fillRect(lx, 1100, 14, 84);
      g.fillStyle = '#3b322c'; g.fillRect(x0, 1072, x1 - x0, 12); g.fillStyle = '#231d19'; g.fillRect(x0, 1084, x1 - x0, 18);
      g.fillStyle = 'rgba(200,215,240,.2)'; g.fillRect(x0, 1072, x1 - x0, 2);
      for (let i = 0; i < 3; i++) { const px = x0 + 60 + i * (x1 - x0 - 140) / 2; g.fillStyle = 'rgba(210,214,222,.55)'; g.beginPath(); g.moveTo(px, 1074); g.lineTo(px + 70, 1071); g.lineTo(px + 76, 1077); g.lineTo(px + 4, 1080); g.fill(); }
    }
  }
  function judgeAt(c, lt, gt, gav) {
    const x = 540, y = 872, h = 430;
    let r = 0;
    for (const g of gav) {
      if (lt >= g - .55 && lt < g) r = Math.max(r, lt < g - .12 ? E.inOut(prog(lt, g - .55, g - .14)) : 1 - E.in(prog(lt, g - .12, g)));
      if (lt >= g && lt < g + .35) { const q = prog(lt, g, g + .35); r = Math.max(r, Math.sin(q * Math.PI) * (1 - q) * .3); }
    }
    const P = { ...MP.sit, elL: [-.17, -.5], haL: [-.13, -.44], elR: [.21, lerp(-.5, -.63, r)], haR: [lerp(.25, .19, r), lerp(-.445, -.8, r)] };
    const br = Math.sin(gt * 1.25) * .003;
    const m = drawMan(c, x, y, h, P, { robe: true, breath: br, color: '#040507', rims: [['rgba(165,185,220,.28)', 0, -3], ['rgba(165,185,220,.12)', 3, -1]], turn: noise(gt * .3, 4) * .3 });
    // Hammer
    const hand = m.hands[1], ang = lerp(.05, -1.15, r), L = 64, hx = hand[0] + Math.cos(ang) * L, hy = hand[1] + Math.sin(ang) * L;
    c.save(); c.strokeStyle = '#1a110b'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(hand[0] - Math.cos(ang) * 8, hand[1] - Math.sin(ang) * 8); c.lineTo(hx, hy); c.stroke();
    c.translate(hx, hy); c.rotate(ang); rr(c, -12, -22, 24, 44, 6); const gg = c.createLinearGradient(-12, 0, 12, 0); gg.addColorStop(0, '#1d130d'); gg.addColorStop(.4, '#4a3324'); gg.addColorStop(1, '#140d09');
    c.fillStyle = gg; c.fill(); c.fillStyle = '#6b4d36'; c.fillRect(-12, -22, 24, 4); c.fillRect(-12, 18, 24, 4); c.restore();
  }
  function courtGallery(c, lt, gt, ev) {
    // Schranke (Bar) zwischen Saal und Zuschauern
    let gr = c.createLinearGradient(0, 1262, 0, 1300); gr.addColorStop(0, '#4a3f37'); gr.addColorStop(1, '#1d1814');
    c.fillStyle = '#100d0b'; for (let x = -190; x < W + 200; x += 46) c.fillRect(x, 1292, 14, 230);
    c.fillStyle = 'rgba(190,205,230,.07)'; for (let x = -190; x < W + 200; x += 46) c.fillRect(x + 2, 1292, 3, 230);
    c.fillStyle = gr; c.fillRect(-200, 1262, W + 400, 34); c.fillStyle = 'rgba(200,215,240,.25)'; c.fillRect(-200, 1262, W + 400, 3);
    const rows = [{ y: 1478, r: 40, step: 150, off: -40, seed: 0, pew: 1526 }, { y: 1792, r: 78, step: 265, off: -110, seed: 40, pew: 1880 }];
    rows.forEach((R, ri) => {
      let i = 0;
      for (let x = R.off; x < W + 200; x += R.step, i++) {
        const sd = R.seed + i, xx = x + (hash(sd * 1.7) - .5) * R.step * .3;
        const sel = hash(sd * 3.7) > .45;
        let tn = clamp(noise(gt * .32, 30 + sd) * 2.6, -1, 1) * (sel ? 1 : .2);
        if (ev != null) { const d0 = ev + .05 + hash(sd * 2.3) * .5; tn = clamp(tn + (hash(sd * 5.1) > .5 ? 1 : -1) * .9 * E.out(prog(lt, d0, d0 + .45)) * (sel ? 1 : .6), -1, 1); }
        const hr = hash(sd * 9.1), hair = hr < .22 ? 'bob' : hr < .34 ? 'bun' : '';
        bust(c, xx, R.y + Math.sin(gt * 1.2 + sd) * 1.5, R.r * (.92 + hash(sd * 4.4) * .16), tn, { hair, color: '#05070a', rim: `rgba(165,185,220,${ri === 0 ? .3 : .26})` });
      }
      // Banklehne vor der Reihe (kalt angestrahltes Holz, damit die Köpke davor lesbar bleiben)
      gr = c.createLinearGradient(0, R.pew, 0, R.pew + 260); gr.addColorStop(0, '#3e3631'); gr.addColorStop(.12, '#2c2622'); gr.addColorStop(1, '#100d0b');
      c.fillStyle = gr; c.fillRect(-200, R.pew, W + 400, 500); c.fillStyle = 'rgba(205,220,245,.3)'; c.fillRect(-200, R.pew, W + 400, 3);
      c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(-200, R.pew + 22, W + 400, 6);
    });
  }
  function slamTexts(c, lt, gt, items) {
    items.forEach((t, i) => {
      const at = num(t.at, .4 + i * .6); if (lt < at) return;
      const s = String(t.s || '').toUpperCase(); let size = num(t.size, 250);
      c.font = `400 ${size}px Anton`; c.letterSpacing = '4px'; const tw = c.measureText(s).width; c.letterSpacing = '0px';
      if (tw > 820) size = Math.floor(size * 820 / tw);
      const y = num(t.y, 790 + i * size * 1.02), k = prog(lt, at, at + .16), after = lt - at - .16;
      const sc = lerp(2.5, 1, E.in(k)) + (after > 0 ? Math.exp(-after * 10) * .05 : 0);
      c.save(); c.globalAlpha = clamp(k * 2) * .7; gr2(c, y, size); c.restore();
      const white = t.col === 'white';
      c.save(); c.translate(540, y); c.scale(sc, sc); c.globalAlpha = clamp(k * 1.7);
      if (after > 0 && after < .8) { c.save(); c.globalCompositeOperation = 'lighter'; c.scale(1.7, .45); spot(c, 0, 0, size * 1.6, white ? WHITEA : 'rgba(255,40,40,A)', .5 * Math.exp(-after * 5)); c.restore(); }
      c.font = `400 ${size}px Anton`; c.letterSpacing = '4px'; const tw2 = c.measureText(s).width; c.letterSpacing = '0px';
      drawSpr(c, sprite(`slam|${s}|${size}|${white}`, tw2 + 200, size * 1.7, g => {
        glow(g, white ? 'rgba(255,255,255,.7)' : 'rgba(255,30,30,1)', 38);
        txt(g, s, 0, 0, `400 ${size}px Anton`, white ? '#e9e9ee' : '#ff2424', 'center', 'middle', 4);
        noGlow(g); txt(g, s, 0, 0, `400 ${size}px Anton`, white ? '#ffffff' : '#ff3b3b', 'center', 'middle', 4);
      }));
      c.restore();
    });
  }
  function gr2(c, y, size) { const g = c.createLinearGradient(0, y - size, 0, y + size); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.5, 'rgba(0,0,0,.85)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(-200, y - size, W + 400, size * 2); }
  function sentenceCard(c, lt, gt, s, hasText) {
    const at = num(s.at, 1); if (lt < at) return;
    const k = E.out(prog(lt, at, at + .5));
    c.fillStyle = `rgba(2,3,5,${.62 * k})`; c.fillRect(-300, -300, W + 600, H + 600);
    const text = String(s.text || '').toUpperCase(); let size = num(s.size, 100), lines;
    for (;;) { lines = wrap(c, text, 800, `400 ${size}px Anton`); if (lines.length <= 3 || size <= 60) break; size -= 6; }
    const lh = size * 1.04, sub = s.sub ? String(s.sub).toUpperCase() : '';
    const bh = lines.length * lh + (sub ? 84 : 0);
    const y0 = num(s.y, hasText ? 1010 : 900 - bh / 2);
    // rote Linie
    const rk = E.inOut(prog(lt, at, at + .45)); c.save(); glow(c, 'rgba(255,30,30,1)', 24); c.fillStyle = '#ff2b2b'; c.fillRect(540 - 300 * rk, y0 - 34, 600 * rk, 6); noGlow(c); c.restore();
    lines.forEach((l, i) => {
      const a0 = at + .12 + i * .2, lk = E.inOut(prog(lt, a0, a0 + .4)); if (lk <= 0) return;
      c.font = `400 ${size}px Anton`; c.letterSpacing = '2px'; const tw = c.measureText(l).width; c.letterSpacing = '0px';
      const yy = y0 + lh * (i + .82);
      c.save(); c.beginPath(); c.rect(540 - tw / 2 - 20, yy - size, (tw + 40) * lk, size * 1.3); c.clip();
      txt(c, l, 543, yy + 5, `400 ${size}px Anton`, 'rgba(0,0,0,.85)', 'center', 'alphabetic', 2); txt(c, l, 540, yy, `400 ${size}px Anton`, '#f3f3f6', 'center', 'alphabetic', 2); c.restore();
      if (lk < 1) { c.fillStyle = '#ff2b2b'; glow(c, 'rgba(255,30,30,1)', 20); c.fillRect(540 - tw / 2 - 20 + (tw + 40) * lk - 4, yy - size * .8, 8, size * .95); noGlow(c); }
    });
    if (sub) {
      const a1 = at + .2 + lines.length * .2 + .25, sk = E.out(prog(lt, a1, a1 + .4)); if (sk <= 0) return;
      let st = sub; const mm = sub.match(/\d+/);
      if (mm && s.count !== false) { const n = Math.round(+mm[0] * E.out(prog(lt, a1, a1 + 1.1))); st = sub.replace(mm[0], String(n)); }
      c.save(); c.globalAlpha = sk; c.font = '700 46px SMono'; c.letterSpacing = '6px'; const tw = c.measureText(sub).width; c.letterSpacing = '0px';
      const fs = Math.min(46, Math.floor(46 * 800 / tw));
      glow(c, 'rgba(255,30,30,.9)', 24); txt(c, st, 540, y0 + lines.length * lh + 62 - (1 - sk) * 14, `700 ${fs}px SMono`, '#ff4040', 'center', 'alphabetic', 6); noGlow(c); c.restore();
    }
  }

  SCENES.courtroom = (c, lt, b, gt) => {
    const p = b.p || {};
    const bench = p.bench !== false, gal = p.gallery !== false;
    const gav = list(p.gavel).filter(v => typeof v === 'number');
    const texts = list(p.text).map(o => typeof o === 'string' ? { s: o } : o).filter(o => o && o.s);
    const hits = texts.map((t, i) => num(t.at, .4 + i * .6) + .16);
    const evs = gav.concat(hits), ev = evs.length ? Math.min(...evs) : null;
    const shk = kick(lt, gav, 22) + kick(lt, hits, 15, 10);
    c.save();
    if (shk > .2) c.translate(noise(gt * 40, 7) * shk, noise(gt * 40, 8) * shk * .7);
    // eine statische Ebene (Rückwand + Bank + Boden + Tische); Figuren dahinter werden durch erneutes Kopieren
    // kleiner Ausschnitte (Richterbank, Protokolltisch) verdeckt – spart eine zweite Vollbild-Ebene
    const L = layer('court|' + bench, g => { courtBack(g, bench); courtFront(g, bench); });
    blit(c, L);
    if (bench) { judgeAt(c, lt, gt, gav); reblit(c, L, 214, 686, 866, 884); }
    // Protokollführerin rechts hinter dem Tisch
    drawMan(c, 975, 1012, 360, 'table', { hair: 'bun', shoulder: .9, color: '#05070a', rims: [['rgba(160,180,215,.2)', 0, -2]], breath: Math.sin(gt * 1.5) * .003, turn: -.4 });
    reblit(c, L, 846, 832, W + 200, 1014);
    // mittleres Deckenlicht flackert gelegentlich (abdunkeln statt neu zeichnen), Oberlicht atmet
    if (flicker(gt, 17, 7) < 1) { c.fillStyle = 'rgba(8,10,14,.55)'; c.beginPath(); c.moveTo(310, 112); c.lineTo(770, 112); c.lineTo(740, 176); c.lineTo(340, 176); c.fill(); }
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .5 + .5 * noise(gt * .6, 3); spot(c, 540, 470, 340, COLD, .06); c.restore();
    // Anwälte (sitzend, von hinten) auf Stühlen
    const chair = (x, y, s = 1) => { // Stuhl von hinten: Lehne, Sitzkante, Säule, Fußkreuz
      c.fillStyle = '#0b0a0a'; c.fillRect(x - 5 * s, y - 120 * s, 10 * s, 110 * s);
      c.beginPath(); c.ellipse(x, y - 6 * s, 62 * s, 9 * s, 0, 0, TAU); c.fill();
      rr(c, x - 66 * s, y - 150 * s, 132 * s, 26 * s, 10 * s); c.fill();
      rr(c, x - 58 * s, y - 262 * s, 116 * s, 118 * s, 26 * s); c.fillStyle = '#100d0d'; c.fill();
      c.strokeStyle = 'rgba(190,205,230,.16)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 46 * s, y - 260 * s); c.quadraticCurveTo(x, y - 266 * s, x + 46 * s, y - 260 * s); c.stroke();
    };
    if (p.lawyers !== false) {
      for (const [x, h, s] of [[590, 500, 1], [880, 480, 2]]) {
        drawMan(c, x, 1236, h, 'table', { color: '#06080b', noLegs: true, rims: [['rgba(160,180,215,.24)', 0, -3]], breath: Math.sin(gt * 1.4 + s) * .003, turn: noise(gt * .25, 50 + s) * .6 });
        chair(x, 1240, h / 520);
      }
    }
    // Angeklagter
    const D = p.defendant === false ? null : (p.defendant || {});
    if (D) {
      const x = num(D.x, 360), at = num(D.at, -1), a = at < 0 ? 1 : clamp(prog(lt, at, at + .6));
      if (a > 0) {
        const st = D.stand === false ? 0 : typeof D.stand === 'number' ? E.inOut(prog(lt, D.stand, D.stand + .9)) : 1;
        const sitP = { ...MP.table, haL: [-.1, -.43], haR: [.1, -.43] };
        const P = lerpPose(sitP, MP.lectern, st), h = num(D.h, 560), y = 1252;
        const sent = p.sentence && p.sentence.at != null ? E.inOut(prog(lt, p.sentence.at + .3, p.sentence.at + 1.5)) : 0;
        c.save(); c.globalCompositeOperation = 'lighter'; c.translate(x, y - 4); c.scale(1, .2); spot(c, 0, 0, 260, COLD, .14); c.restore();
        c.save(); c.globalCompositeOperation = 'lighter'; spot(c, x, y - h * .75, 320, COLD, .07); c.restore();
        const js = D.jumpsuit;
        drawMan(c, x, y, h, P, { alpha: a, color: '#050608', bodyColor: js ? '#3a1a08' : null, breath: Math.sin(gt * 1.7) * .004, turn: num(D.turn, .55) * (1 - sent * .4), headDy: sent * .025, noLegs: st < .5,
          rims: js ? [['rgba(255,130,50,.55)', 0, -3], ['rgba(255,120,40,.3)', -3, -1]] : [['rgba(165,185,220,.4)', 0, -3], ['rgba(165,185,220,.2)', -3, -1]] });
        if (D.stand === false || typeof D.stand === 'number') { c.save(); c.globalAlpha = a; chair(x, y + 4 + st * 30, h / 520); c.restore(); }
      }
    }
    // kaltes Fensterlicht (Strahlen + Staub)
    const drift = Math.sin(gt * .13) * 40, ba = .07 + .03 * noise(gt * .5, 12);
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const [x0, x1, bx0, bx1, s] of [[40, 150, 330, 640, 1], [930, 1040, 470, 760, .6]]) {
      const g = c.createLinearGradient(0, 320, 0, 1250); g.addColorStop(0, `rgba(150,175,215,${ba * s})`); g.addColorStop(1, 'rgba(150,175,215,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(x0, 320); c.lineTo(x1, 320); c.lineTo(bx1 + drift * s, 1250); c.lineTo(bx0 + drift * s, 1250); c.fill();
    }
    c.restore();
    dust(c, gt, 36, 3, (u, v) => [lerp(lerp(40, 150, v), lerp(330, 640, v) + drift, u), lerp(320, 1250, u)], COLD, .45);
    if (gal) courtGallery(c, lt, gt, ev);
    // Schlag-Effekt am Klotz
    for (const g of gav) if (bench && lt >= g && lt < g + .3) {
      const q = prog(lt, g, g + .3); c.save(); c.strokeStyle = `rgba(255,255,255,${1 - q})`; c.lineWidth = 4; glow(c, 'rgba(255,255,255,.9)', 20);
      c.beginPath(); c.ellipse(708, 686, 30 + q * 160, 8 + q * 40, 0, 0, TAU); c.stroke();
      for (let i = 0; i < 8; i++) { const an = Math.PI + (i + .5) / 8 * Math.PI, r0 = 30 + q * 40, r1 = r0 + 40 + q * 60; c.beginPath(); c.moveTo(708 + Math.cos(an) * r0, 684 + Math.sin(an) * r0 * .5); c.lineTo(708 + Math.cos(an) * r1, 684 + Math.sin(an) * r1 * .5); c.stroke(); }
      noGlow(c); c.restore();
    }
    if (p.sentence) sentenceCard(c, lt, gt, p.sentence, texts.length > 0);
    slamTexts(c, lt, gt, texts);
    c.restore();
    flash(c, lt, gav, '#ffffff', .62, .26);
    flash(c, lt, hits, '#ff2020', .22, .2);
  };

  // ======================================================================
  // 2) ZELLE
  // ======================================================================
  const CZ = 3.6, CFOC = 870;
  const cp = (X, Y, Z) => [540 + X * CFOC / Z, 860 + Y * CFOC / Z];
  const poly3 = (g, pts, fill) => { polyPath(g, pts.map(q => cp(...q))); g.fillStyle = fill; g.fill(); };
  const WIN = { x0: -.35, x1: .55, y0: -1.1, y1: -.5 };
  function cellStatic(g, win) {
    bgFill(g, '#0c0e11', '#060708');
    const Zn = .35, Yc = -1.4, Yf = 1.2, Xw = 1.5;
    // Wände, Boden, Decke
    poly3(g, [[-Xw, Yc, Zn], [-Xw, Yc, CZ], [-Xw, Yf, CZ], [-Xw, Yf, Zn]], '#252a31');
    poly3(g, [[Xw, Yc, Zn], [Xw, Yc, CZ], [Xw, Yf, CZ], [Xw, Yf, Zn]], '#20252b');
    poly3(g, [[-Xw, Yc, Zn], [Xw, Yc, Zn], [Xw, Yc, CZ], [-Xw, Yc, CZ]], '#101318');
    let gr = g.createLinearGradient(0, 1150, 0, H); gr.addColorStop(0, '#22262c'); gr.addColorStop(1, '#0d0f12');
    poly3(g, [[-Xw, Yf, Zn], [Xw, Yf, Zn], [Xw, Yf, CZ], [-Xw, Yf, CZ]], gr);
    poly3(g, [[-Xw, Yc, CZ], [Xw, Yc, CZ], [Xw, Yf, CZ], [-Xw, Yf, CZ]], '#2e343c');
    // zweifarbiger Anstrich (unten dunkler)
    const Yp = .05;
    poly3(g, [[-Xw, Yp, CZ], [Xw, Yp, CZ], [Xw, Yf, CZ], [-Xw, Yf, CZ]], '#232830');
    poly3(g, [[-Xw, Yp, Zn], [-Xw, Yp, CZ], [-Xw, Yf, CZ], [-Xw, Yf, Zn]], '#1b1f25');
    poly3(g, [[Xw, Yp, Zn], [Xw, Yp, CZ], [Xw, Yf, CZ], [Xw, Yf, Zn]], '#181c21');
    // Betonstein-Fugen
    g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 2;
    for (let Y = Yc + .2, r = 0; Y < Yf; Y += .2, r++) {
      g.beginPath(); let a = cp(-Xw, Y, CZ), b2 = cp(Xw, Y, CZ); g.moveTo(...a); g.lineTo(...b2); g.stroke();
      for (let X = -Xw + (r % 2 ? .2 : 0); X < Xw; X += .4) { a = cp(X, Y, CZ); b2 = cp(X, Y + .2, CZ); g.beginPath(); g.moveTo(...a); g.lineTo(...b2); g.stroke(); }
      for (const s of [-1, 1]) {
        a = cp(s * Xw, Y, Zn); b2 = cp(s * Xw, Y, CZ); g.beginPath(); g.moveTo(...a); g.lineTo(...b2); g.stroke();
        for (let Z = CZ - (r % 2 ? .2 : 0); Z > Zn + .2; Z -= .4) { a = cp(s * Xw, Y, Z); b2 = cp(s * Xw, Y + .2, Z); g.beginPath(); g.moveTo(...a); g.lineTo(...b2); g.stroke(); }
      }
    }
    // Strichliste an der Wand
    g.strokeStyle = 'rgba(200,210,225,.16)'; g.lineWidth = 3; g.lineCap = 'round';
    for (let gI = 0; gI < 4; gI++) { const x0 = 196 + gI * 44, y0 = 840 + (gI % 2) * 6; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x0 + i * 8, y0); g.lineTo(x0 + i * 8 + 2, y0 + 38); g.stroke(); } g.beginPath(); g.moveTo(x0 - 6, y0 + 30); g.lineTo(x0 + 32, y0 + 6); g.stroke(); }
    // Fenster
    if (win) {
      const a = cp(WIN.x0 - .06, WIN.y0 - .06, CZ), b2 = cp(WIN.x1 + .06, WIN.y1 + .06, CZ);
      g.fillStyle = '#0d1014'; g.fillRect(a[0], a[1], b2[0] - a[0], b2[1] - a[1]);
      const w0 = cp(WIN.x0, WIN.y0, CZ), w1 = cp(WIN.x1, WIN.y1, CZ);
      gr = g.createLinearGradient(0, w0[1], 0, w1[1]); gr.addColorStop(0, '#c8d6ea'); gr.addColorStop(1, '#7f93ad');
      g.fillStyle = gr; g.fillRect(w0[0], w0[1], w1[0] - w0[0], w1[1] - w0[1]);
      g.fillStyle = '#14181d'; for (let i = 1; i < 5; i++) { const x = lerp(w0[0], w1[0], i / 5); g.fillRect(x - 5, w0[1], 10, w1[1] - w0[1]); }
      g.fillRect(w0[0], lerp(w0[1], w1[1], .5) - 4, w1[0] - w0[0], 8);
      g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(w0[0], w1[1], w1[0] - w0[0], 6); // Fensterbank
    }
    // Pritsche an der Rückwand
    const BZ0 = 2.85, BZ1 = CZ, BX0 = -1.5, BX1 = .32, BY = .75;
    g.fillStyle = '#0c0d10'; for (const X of [-1.38, .2]) { const a = cp(X, BY + .08, BZ0 + .05), b2 = cp(X, Yf, BZ0 + .05); g.fillRect(a[0] - 6, a[1], 12, b2[1] - a[1]); }
    g.fillStyle = 'rgba(0,0,0,.35)'; polyPath(g, [cp(BX0, Yf, BZ0 - .05), cp(BX1 + .05, Yf, BZ0 - .05), cp(BX1 + .05, Yf, BZ1), cp(BX0, Yf, BZ1)].map(q => q)); g.fill();
    poly3(g, [[BX0, BY, BZ0], [BX1, BY, BZ0], [BX1, BY, BZ1], [BX0, BY, BZ1]], '#3b424b');
    poly3(g, [[BX0, BY, BZ0], [BX1, BY, BZ0], [BX1, BY + .08, BZ0], [BX0, BY + .08, BZ0]], '#2b3037');
    poly3(g, [[BX1, BY, BZ0], [BX1, BY, BZ1], [BX1, BY + .08, BZ1], [BX1, BY + .08, BZ0]], '#22262c');
    // Matratze + Decke + Kissen
    const MY = .67;
    poly3(g, [[BX0 + .05, MY, BZ0 + .06], [BX1 - .04, MY, BZ0 + .06], [BX1 - .04, MY, BZ1 - .04], [BX0 + .05, MY, BZ1 - .04]], '#59616b');
    poly3(g, [[BX0 + .05, MY, BZ0 + .06], [BX1 - .04, MY, BZ0 + .06], [BX1 - .04, BY, BZ0 + .06], [BX0 + .05, BY, BZ0 + .06]], '#444b54');
    poly3(g, [[BX1 - .5, MY - .1, BZ0 + .08], [BX1 - .06, MY - .1, BZ0 + .08], [BX1 - .06, MY, BZ0 + .08], [BX1 - .5, MY, BZ0 + .08]], '#3a4048');
    poly3(g, [[BX1 - .5, MY - .1, BZ0 + .08], [BX1 - .06, MY - .1, BZ0 + .08], [BX1 - .06, MY - .1, BZ1 - .1], [BX1 - .5, MY - .1, BZ1 - .1]], '#4a515a');
    const pa = cp(BX0 + .08, MY - .12, BZ1 - .15), pb = cp(BX0 + .42, MY, BZ0 + .3); rr(g, pa[0], pa[1], pb[0] - pa[0], pb[1] - pa[1], 14); g.fillStyle = '#5c636d'; g.fill();
    // Edelstahl-Toilette/Waschbecken hinten rechts (Kombi-Block, matt)
    const TX0 = 1.04, TX1 = 1.44, TZ0 = 3.25, TY = .45;
    gr = g.createLinearGradient(cp(TX0, 0, TZ0)[0], 0, cp(TX1, 0, TZ0)[0], 0); gr.addColorStop(0, '#2c3239'); gr.addColorStop(.45, '#4f5862'); gr.addColorStop(1, '#22272d');
    poly3(g, [[TX0, TY, TZ0], [TX1, TY, TZ0], [TX1, Yf, TZ0], [TX0, Yf, TZ0]], gr);
    poly3(g, [[TX0, TY, TZ0], [TX1, TY, TZ0], [TX1, TY, CZ], [TX0, TY, CZ]], '#5d6670');
    const bw0 = cp(TX0 + .07, TY, TZ0 + .06), bw1 = cp(TX1 - .07, TY, CZ - .06); g.fillStyle = '#15181c'; g.beginPath(); g.ellipse((bw0[0] + bw1[0]) / 2, (bw0[1] + bw1[1]) / 2, (bw1[0] - bw0[0]) / 2, Math.abs(bw1[1] - bw0[1]) / 2 + 3, 0, 0, TAU); g.fill();
    poly3(g, [[TX0 + .04, TY - .32, CZ - .01], [TX1 - .04, TY - .32, CZ - .01], [TX1 - .04, TY - .01, CZ - .01], [TX0 + .04, TY - .01, CZ - .01]], '#353c44');
    const tap = cp((TX0 + TX1) / 2, TY - .28, CZ - .04); g.fillStyle = '#6d7782'; g.fillRect(tap[0] - 5, tap[1], 10, 16);
    g.strokeStyle = 'rgba(200,215,235,.18)'; g.lineWidth = 2; polyPath(g, [[TX0, TY, TZ0], [TX1, TY, TZ0]].map(q => cp(...q))); g.stroke();
    // Kälte-Verlauf von oben
    g.save(); g.globalCompositeOperation = 'lighter'; spot(g, 560, 680, 520, COLD, .1); g.restore();
  }
  function cellBars(c, off, gt, lockRed) {
    const xL = 70 + off;
    // feste Zarge links
    let gr = c.createLinearGradient(0, 0, 70, 0); gr.addColorStop(0, '#030405'); gr.addColorStop(.5, '#2a3038'); gr.addColorStop(1, '#07090b');
    c.fillStyle = gr; c.fillRect(8, -200, 56, H + 400);
    // Querstreben
    for (const y of [430, 1560]) {
      gr = c.createLinearGradient(0, y, 0, y + 36); gr.addColorStop(0, '#2e353e'); gr.addColorStop(.3, '#59636f'); gr.addColorStop(1, '#0a0c0f');
      c.fillStyle = gr; c.fillRect(xL, y, W + 400, 36);
    }
    // Stäbe: ein gemeinsamer Verlauf (verschoben je Stab), Nieten an den Querstreben
    gr = c.createLinearGradient(-14, 0, 14, 0); gr.addColorStop(0, '#030405'); gr.addColorStop(.3, '#4a535e'); gr.addColorStop(.45, '#8a95a3'); gr.addColorStop(.7, '#1a1e23'); gr.addColorStop(1, '#030405');
    c.fillStyle = gr;
    for (let i = 0; i < 9; i++) { const x = xL + 50 + i * 155; if (x > W + 220) break; c.save(); c.translate(x, 0); c.fillRect(-14, -200, 28, H + 400); c.restore(); }
    c.fillStyle = 'rgba(0,0,0,.55)'; c.beginPath();
    for (let i = 0; i < 9; i++) { const x = xL + 50 + i * 155; if (x > W + 220) break; for (const y of [430, 1560]) { c.moveTo(x + 7, y + 18); c.arc(x, y + 18, 7, 0, TAU); } }
    c.fill();
    // Schlosskasten an der Vorderkante
    const lx = xL - 8, ly = 900;
    gr = c.createLinearGradient(lx, 0, lx + 108, 0); gr.addColorStop(0, '#15181c'); gr.addColorStop(.35, '#3c444e'); gr.addColorStop(1, '#0b0d10');
    rr(c, lx, ly, 108, 190, 8); c.fillStyle = gr; c.fill(); c.strokeStyle = 'rgba(200,215,235,.25)'; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#050607'; c.beginPath(); c.arc(lx + 54, ly + 120, 10, 0, TAU); c.fill(); c.fillRect(lx + 50, ly + 120, 8, 26);
    const la = lockRed ? .85 + .15 * Math.sin(gt * 5) : .25;
    c.save(); c.fillStyle = `rgba(255,40,40,${la})`; if (lockRed) glow(c, 'rgba(255,30,30,1)', 22); c.beginPath(); c.arc(lx + 54, ly + 44, 8, 0, TAU); c.fill(); noGlow(c); c.restore();
  }
  SCENES.cell = (c, lt, b, gt) => {
    const p = b.p || {};
    const dark = clamp(num(p.dark, .7)), win = p.window !== false, bars = p.bars !== false;
    const slam = typeof p.slam === 'number' ? p.slam : null;
    let off = 0;
    if (slam != null) {
      if (lt < slam - .42) off = 780; else if (lt < slam) off = 780 * (1 - E.in(prog(lt, slam - .42, slam)));
      else off = 18 * Math.abs(Math.sin((lt - slam) * 24)) * Math.exp(-(lt - slam) * 9);
    }
    const shk = slam != null ? kick(lt, [slam], 26, 8) : 0;
    c.save();
    if (shk > .2) c.translate(noise(gt * 42, 3) * shk, noise(gt * 42, 4) * shk * .6);
    const dk = 1 - dark * .62; // Dunkelheit ist in die statische Ebene eingebacken, dynamische Teile werden mit dk gedämpft
    blit(c, layer('cell|' + win + '|' + dark.toFixed(2), g => {
      cellStatic(g, win); g.fillStyle = `rgba(2,3,5,${dark * .62})`; g.fillRect(-200, -200, W + 400, H + 400);
      if (win) { const a = cp(WIN.x0, WIN.y0, CZ), b2 = cp(WIN.x1, WIN.y1, CZ); g.save(); g.globalCompositeOperation = 'lighter'; spot(g, (a[0] + b2[0]) / 2, (a[1] + b2[1]) / 2, 300, COLD, .19); g.restore(); }
    }));
    // Schatten der Gitterstäbe auf dem Boden (Gangbeleuchtung hinter der Kamera)
    if (bars) {
      const fa = .3 * (.9 + .1 * flicker(gt, 9, 5));
      const g = c.createLinearGradient(0, H, 0, 1160); g.addColorStop(0, `rgba(0,0,0,${fa})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.beginPath();
      for (let i = 0; i < 9; i++) {
        const x = 70 + off + 50 + i * 155; if (x > W + 220) break;
        c.moveTo(x - 30, H + 200); c.lineTo(x + 30, H + 200); c.lineTo(lerp(x, 540, .78) + 4, 1160); c.lineTo(lerp(x, 540, .78) - 4, 1160); c.closePath();
      }
      c.fill();
    }
    // Figur
    const F = p.figure === false ? null : (p.figure || {});
    const cloud = .82 + .18 * noise(gt * .35, 5);
    if (F) {
      const fat = num(F.at, -1), fa = fat < 0 ? 1 : clamp(prog(lt, fat, fat + .7));
      if (fa > 0) {
        const pose = F.pose || 'sit';
        const rimA = a => `rgba(175,198,235,${(a * Math.max(.55, dk)).toFixed(3)})`;
        if (pose === 'stand') {
          const s = CFOC / 2.5, x = 540 + num(F.x, -.09) * s, y = 860 + 1.2 * s, h = 1.75 * s;
          if (win) { c.save(); c.globalAlpha = fa; c.globalCompositeOperation = 'lighter'; spot(c, x, y - h * .86, 230, COLD, .22 * cloud); c.restore(); }
          drawMan(c, x, y, h, MP.stand, { alpha: fa, color: '#040506', breath: Math.sin(gt * 1.2) * .003,
            rims: [[rimA(.5), 0, -3], [rimA(.2), 3, -1], [rimA(.2), -3, -1]], headDy: .006 + Math.sin(gt * .4) * .004 });
        } else {
          const s = CFOC / 2.75, x = 540 + num(F.x, -.15) * s, y = 860 + 1.2 * s, h = 1.75 * s;
          c.save(); c.globalAlpha = fa; c.globalCompositeOperation = 'lighter'; spot(c, x, y - h * .5, 320, COLD, .1 * cloud); c.restore();
          drawMan(c, x, y, h, pose === 'sitUp' ? MP.sit : MP.bowed, { alpha: fa, color: '#040506', breath: Math.sin(gt * 1.1) * .004,
            rims: [[rimA(.6), 0, -3], [rimA(.28), 3, -1], [rimA(.2), -3, -1]], headDy: pose === 'sitUp' ? 0 : Math.sin(gt * .5) * .004 });
        }
      }
    }
    // Fensterlicht: Lichtschacht + Fleck auf dem Boden mit Gitterschatten, wandert langsam
    if (win) {
      const dx = num(p.lightDx, -.16) + Math.min(lt, 12) * .014, dz = .9, I = cloud;
      const toFloor = (X, Y) => { const s = 1.2 - Y; return [X + dx * s, 1.2, CZ - dz * s]; };
      const wc = [[WIN.x0, WIN.y0], [WIN.x1, WIN.y0], [WIN.x1, WIN.y1], [WIN.x0, WIN.y1]];
      const pts = wc.map(([X, Y]) => cp(X, Y, CZ)).concat(wc.map(([X, Y]) => cp(...toFloor(X, Y))));
      const w0 = cp(WIN.x0, WIN.y0, CZ), w1 = cp(WIN.x1, WIN.y1, CZ), fc = cp(...toFloor((WIN.x0 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2));
      c.save(); c.globalCompositeOperation = 'lighter';
      const g = c.createLinearGradient(0, w0[1], 0, fc[1]); g.addColorStop(0, `rgba(160,185,225,${.1 * I})`); g.addColorStop(1, `rgba(160,185,225,${.03 * I})`);
      polyPath(c, hull(pts)); c.fillStyle = g; c.fill();
      // Fleck in Streifen (5 Spalten × 2 Reihen zwischen den Fensterstäben)
      const patch = new Path2D();
      for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) {
        const X0 = lerp(WIN.x0, WIN.x1, i / 5) + .025, X1 = lerp(WIN.x0, WIN.x1, (i + 1) / 5) - .025, Y0 = lerp(WIN.y0, WIN.y1, j / 2) + (j ? .02 : 0), Y1 = lerp(WIN.y0, WIN.y1, (j + 1) / 2) - (j ? 0 : .02);
        pPoly(patch, [[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]].map(([X, Y]) => cp(...toFloor(X, Y))));
      }
      c.fillStyle = `rgba(175,198,235,${.3 * I})`; c.fill(patch);
      c.restore();
      dust(c, gt, 40, 11, (u, v) => { const X = lerp(WIN.x0, WIN.x1, v), Y = lerp(WIN.y0, WIN.y1, (v * 7.3) % 1), s = u * (1.2 - Y); return cp(X + dx * s, Y + s, CZ - dz * s); }, COLD, .55 * I);
    }
    if (!win) { // ohne Fenster: vergitterte Deckenleuchte, leicht flackernd
      const [lx, ly] = cp(.1, -1.4, 2.6), f = .85 + .15 * flicker(gt, 27, 6);
      c.save(); c.globalCompositeOperation = 'lighter';
      const g = c.createLinearGradient(0, ly, 0, 1300); g.addColorStop(0, `rgba(170,190,225,${.12 * f})`); g.addColorStop(1, 'rgba(170,190,225,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(lx - 40, ly + 20); c.lineTo(lx + 40, ly + 20); c.lineTo(lx + 420, 1300); c.lineTo(lx - 420, 1300); c.fill();
      spot(c, lx, ly + 20, 160, COLD, .45 * f); c.restore();
      c.fillStyle = `rgba(225,235,250,${f})`; c.beginPath(); c.ellipse(lx, ly + 22, 34, 12, 0, 0, TAU); c.fill();
      c.strokeStyle = '#14181d'; c.lineWidth = 3; c.beginPath(); for (let i = -2; i <= 2; i++) { c.moveTo(lx + i * 14, ly + 8); c.lineTo(lx + i * 15, ly + 34); } c.stroke();
      c.fillStyle = '#1c2026'; c.fillRect(lx - 44, ly, 88, 10);
    }
    if (bars) cellBars(c, off, gt, slam == null || lt >= slam);
    // Funken beim Zuschlagen
    if (slam != null && lt >= slam && lt < slam + .7) {
      const q = lt - slam; c.save(); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 18; i++) { const an = -Math.PI * .5 + (hash(i * 3.3) - .5) * 2.4, v = 500 + hash(i * 7.7) * 900, x = 80 + Math.cos(an) * v * q, y = 990 + Math.sin(an) * v * q + 1400 * q * q;
        c.strokeStyle = `rgba(255,${200 + hash(i) * 55 | 0},170,${1 - q / .7})`; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x - Math.cos(an) * 18, y - (Math.sin(an) * v + 2800 * q) * .02); c.stroke(); }
      const gk = 1 - prog(lt, slam, slam + .35); glow(c, 'rgba(210,225,255,1)', 50); c.fillStyle = `rgba(230,240,255,${gk})`; c.fillRect(-200, 984, 900 * gk + 200, 8); c.fillRect(60, -200, 10, H + 400 * gk); noGlow(c);
      c.restore();
    }
    c.restore();
    if (slam != null) flash(c, lt, [slam], '#dfe8ff', .6, .26);
    // Ortsangabe (getippt)
    const L = p.label;
    if (L && (L.text || typeof L === 'string')) {
      const text = String(L.text || L).toUpperCase(), at = num(L.at, .6), y = num(L.y, 1290);
      if (lt >= at) {
        // Schreibmaschinen-Einblendung, bei langen Namen zweizeilig
        const fs = 42, font = `700 ${fs}px SMono`, lh = 54;
        c.letterSpacing = '4px'; const rows = wrap(c, text, 660, font).slice(0, 3); c.font = font; const tw = Math.max(...rows.map(r => c.measureText(r).width)); c.letterSpacing = '0px';
        let n = Math.floor((lt - at) * 30); const total = rows.join(' ').length, done = n >= total;
        const pk = E.out(prog(lt, at - .05, at + .3)), pw = Math.min(840, tw + 110), x0 = 540 - pw / 2, ph = rows.length * lh + 40 + (L.sub ? 44 : 0), top = y - 54;
        c.save(); c.globalAlpha = pk; rr(c, x0, top, pw * pk, ph, 10); c.fillStyle = 'rgba(4,5,7,.88)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 2; c.stroke();
        glow(c, 'rgba(255,30,30,1)', 18); c.fillStyle = '#ff2b2b'; c.fillRect(x0 + 22, top + 24, 12, rows.length * lh - 14); noGlow(c);
        let cx = x0 + 54, cy = y;
        rows.forEach((r, i) => { const part = r.slice(0, Math.max(0, n)); n -= r.length + 1; if (part.length || i === 0) { cy = y + i * lh; txt(c, part, x0 + 54, cy, font, '#eef0f4', 'left', 'alphabetic', 4); c.font = font; c.letterSpacing = '4px'; cx = x0 + 56 + c.measureText(part).width; c.letterSpacing = '0px'; } });
        if (!done || (lt % 1) < .55) { c.fillStyle = '#ff3b3b'; c.fillRect(cx, cy - fs * .78, fs * .55, fs * .9); }
        if (L.sub) { c.globalAlpha = pk * clamp(prog(lt, at + total / 30, at + total / 30 + .4)); txt(c, String(L.sub).toUpperCase(), x0 + 54, y + (rows.length - 1) * lh + 48, '600 28px Mont', '#a3abb8', 'left', 'alphabetic', 3); }
        c.restore();
      }
    }
  };

  // ======================================================================
  // 3) DOPPELLEBEN – links warm & normal, rechts kalt & dunkel, rote Trennlinie
  // ======================================================================
  const LX = 330, RX = 740;
  const WARM_LABEL = { church: 'CHURCH COUNCIL PRESIDENT', dinner: 'FAMILY MAN', uniform: 'CITY COMPLIANCE OFFICER', family: 'HUSBAND. FATHER OF TWO.', office: 'RESPECTED EMPLOYEE' };
  const warmMan = { color: '#21140b', rims: [['rgba(255,190,120,.5)', 0, -3], ['rgba(255,170,90,.25)', 3, -1]] };
  function warmBg(g, top, mid, bot) { const gr = g.createLinearGradient(0, -200, 0, H + 200); gr.addColorStop(0, top); gr.addColorStop(.5, mid); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(-200, -200, W + 400, H + 400); }
  function archWin(g, x, y, w, h) {
    const path = () => { g.beginPath(); g.moveTo(x - w / 2, y + h); g.lineTo(x - w / 2, y + w / 2); g.arc(x, y + w / 2, w / 2, Math.PI, 0); g.lineTo(x + w / 2, y + h); g.closePath(); };
    g.save(); g.lineWidth = 26; g.strokeStyle = '#140c07'; path(); g.stroke();
    const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#f5cf91'); gr.addColorStop(.6, '#d99a52'); gr.addColorStop(1, '#a4602c');
    path(); g.fillStyle = gr; g.fill(); g.clip();
    g.strokeStyle = 'rgba(60,30,12,.75)'; g.lineWidth = 4;
    for (let k = -8; k <= 8; k++) { g.beginPath(); g.moveTo(x + k * 40, y); g.lineTo(x + k * 40 + h * .5, y + h); g.stroke(); g.beginPath(); g.moveTo(x + k * 40, y); g.lineTo(x + k * 40 - h * .5, y + h); g.stroke(); }
    g.fillStyle = '#2a1408'; g.fillRect(x - 6, y, 12, h); g.fillRect(x - w / 2, y + h * .42, w, 12);
    g.restore();
  }
  function churchBack(g) {
    warmBg(g, '#1c120b', '#2e1f13', '#130c07');
    g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 2; for (let y = 320; y < 1100; y += 58) { g.beginPath(); g.moveTo(-200, y); g.lineTo(W + 200, y); g.stroke(); }
    for (const [wx, ww, wy] of [[330, 270, 380], [800, 200, 440], [-60, 200, 440], [1220, 200, 440]]) { g.save(); g.globalCompositeOperation = 'lighter'; spot(g, wx, 720, ww * 1.6, WARM, .22); g.restore(); archWin(g, wx, wy, ww, 980 - wy); }
    // hintere Bankreihen mit Gemeinde (gegenlicht)
    const row = (top, h, xs, seed) => {
      for (const [i, x] of xs.entries()) drawMan(g, x, top + .48 * h, h, MP.pew, { color: '#1a100a', hair: hash(seed + i) < .45 ? 'bob' : hash(seed + i) < .6 ? 'bun' : '', shoulder: hash(seed + i) < .6 ? .88 : 1,
        rims: [['rgba(255,185,110,.45)', 0, -3]], turn: (hash(seed * 3 + i) - .5) * .8, noLegs: true });
      const gr = g.createLinearGradient(0, top, 0, top + 70); gr.addColorStop(0, '#4a2f1b'); gr.addColorStop(1, '#1d1209');
      g.fillStyle = gr; g.fillRect(-200, top, W + 400, 400); g.fillStyle = 'rgba(255,200,140,.35)'; g.fillRect(-200, top, W + 400, 3);
    };
    row(1000, 380, [40, 170, 500, 630, 760, 905, 1040], 3);
    row(1046, 520, [-10, 150, 540, 710, 890, 1070], 9);
  }
  function churchFront(g) {
    const gr = g.createLinearGradient(0, 1170, 0, 1500); gr.addColorStop(0, '#5a3a21'); gr.addColorStop(.1, '#3a2415'); gr.addColorStop(1, '#140b06');
    g.fillStyle = gr; g.fillRect(-200, 1170, W + 400, H); g.fillStyle = 'rgba(255,205,150,.45)'; g.fillRect(-200, 1170, W + 400, 4);
    for (let x = -180; x < W + 200; x += 210) { g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 4; g.strokeRect(x, 1210, 180, 260); }
  }
  function dinnerBack(g) {
    warmBg(g, '#2a1b10', '#3a271a', '#1c120a');
    g.fillStyle = 'rgba(255,220,170,.03)'; for (let x = -200; x < W + 200; x += 46) g.fillRect(x, -200, 18, 1200);
    g.fillStyle = '#24170e'; g.fillRect(-200, 980, W + 400, 600); g.fillStyle = 'rgba(255,200,140,.15)'; g.fillRect(-200, 976, W + 400, 6);
    // Fenster mit Vorhängen
    g.fillStyle = '#0f1520'; g.fillRect(660, 420, 260, 430); g.strokeStyle = '#2b1a0f'; g.lineWidth = 14; g.strokeRect(660, 420, 260, 430); g.beginPath(); g.moveTo(790, 420); g.lineTo(790, 850); g.moveTo(660, 630); g.lineTo(920, 630); g.stroke();
    for (const [x0, x1] of [[610, 700], [880, 970]]) { const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, '#4a2c18'); gr.addColorStop(.5, '#6e4426'); gr.addColorStop(1, '#3a2213'); g.fillStyle = gr; g.fillRect(x0, 390, x1 - x0, 500); }
    // Bilderrahmen
    for (const [x, y, w, h] of [[140, 430, 150, 120], [320, 450, 96, 96]]) { g.fillStyle = '#6b4c2a'; g.fillRect(x, y, w, h); g.fillStyle = '#2c1d12'; g.fillRect(x + 10, y + 10, w - 20, h - 20); g.fillStyle = 'rgba(255,210,160,.08)'; g.fillRect(x + 16, y + 16, w - 32, h - 32); }
    g.save(); g.globalCompositeOperation = 'lighter'; spot(g, 450, 900, 560, WARM, .14); g.restore();
  }
  function dinnerFront(g) {
    let gr = g.createLinearGradient(0, 990, 0, 1062); gr.addColorStop(0, '#cdb48d'); gr.addColorStop(1, '#ecdcbd');
    g.fillStyle = gr; g.beginPath(); g.moveTo(-60, 990); g.lineTo(1140, 990); g.lineTo(1240, 1062); g.lineTo(-160, 1062); g.fill();
    gr = g.createLinearGradient(0, 1062, 0, 1440); gr.addColorStop(0, '#b29872'); gr.addColorStop(1, '#3a2a19');
    g.fillStyle = gr; g.fillRect(-200, 1062, W + 400, 400);
    g.strokeStyle = 'rgba(60,40,20,.25)'; g.lineWidth = 8; for (let x = -160; x < W + 200; x += 120) { g.beginPath(); g.moveTo(x, 1070); g.quadraticCurveTo(x + 20, 1250, x - 10, 1440); g.stroke(); }
    g.fillStyle = '#1a1009'; g.fillRect(-200, 1440, W + 400, 600);
    for (const [x, rx] of [[330, 78], [640, 70], [870, 60]]) { g.fillStyle = 'rgba(80,50,25,.35)'; g.beginPath(); g.ellipse(x, 1032, rx + 8, 17, 0, 0, TAU); g.fill(); g.fillStyle = '#f6ecdc'; g.beginPath(); g.ellipse(x, 1028, rx, 15, 0, 0, TAU); g.fill(); g.fillStyle = '#d8c6a8'; g.beginPath(); g.ellipse(x, 1028, rx * .6, 8, 0, 0, TAU); g.fill(); }
    // Schüssel + Gläser
    g.fillStyle = '#8a5a34'; g.beginPath(); g.ellipse(500, 1012, 56, 14, 0, 0, TAU); g.fill(); g.fillStyle = '#5c3a20'; g.beginPath(); g.ellipse(500, 1006, 48, 10, 0, 0, TAU); g.fill();
    for (const x of [492, 1000]) { g.fillStyle = 'rgba(255,240,220,.35)'; g.fillRect(x - 10, 1004, 20, 40); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x - 8, 1006, 4, 36); }
  }
  function uniformBack(g) {
    warmBg(g, '#2e2018', '#9a6a3f', '#2a1a0e');
    let gr = g.createLinearGradient(0, 300, 0, 1010); gr.addColorStop(0, '#5a3d28'); gr.addColorStop(1, '#e4ad6c'); g.fillStyle = gr; g.fillRect(-200, 300, W + 400, 710);
    g.save(); g.globalCompositeOperation = 'lighter'; spot(g, 840, 940, 520, 'rgba(255,200,130,A)', .6); g.restore();
    glow(g, 'rgba(255,220,160,1)', 60); g.fillStyle = '#fff0d0'; g.beginPath(); g.arc(840, 940, 46, 0, TAU); g.fill(); noGlow(g);
    // Häuserreihe am Horizont
    g.fillStyle = '#5a3a24';
    for (let i = 0; i < 9; i++) { const x = -180 + i * 170 + hash(i) * 40, w = 140 + hash(i + 3) * 40, hh = 60 + hash(i + 5) * 30; g.fillRect(x, 1010 - hh, w, hh); g.beginPath(); g.moveTo(x - 10, 1010 - hh); g.lineTo(x + w / 2, 1010 - hh - 34); g.lineTo(x + w + 10, 1010 - hh); g.fill(); }
    g.fillStyle = '#4a2f1c'; for (let i = 0; i < 6; i++) { const x = -100 + i * 230 + hash(i * 9) * 80; g.beginPath(); g.arc(x, 950, 50 + hash(i) * 30, 0, TAU); g.fill(); g.fillRect(x - 6, 950, 12, 60); }
    gr = g.createLinearGradient(0, 1010, 0, H); gr.addColorStop(0, '#5a3d22'); gr.addColorStop(.3, '#2e1f12'); gr.addColorStop(1, '#140c06'); g.fillStyle = gr; g.fillRect(-200, 1010, W + 400, H);
    g.fillStyle = 'rgba(255,215,160,.12)'; g.beginPath(); g.moveTo(-200, 1330); g.lineTo(W + 200, 1250); g.lineTo(W + 200, 1300); g.lineTo(-200, 1400); g.fill(); // Gehweg
    // Lattenzaun
    g.fillStyle = '#2a1a0f'; g.fillRect(-200, 1090, 760, 14); g.fillRect(-200, 1150, 760, 14);
    for (let x = -190; x < 560; x += 34) { g.beginPath(); g.moveTo(x, 1210); g.lineTo(x, 1070); g.lineTo(x + 10, 1058); g.lineTo(x + 20, 1070); g.lineTo(x + 20, 1210); g.fill(); g.fillStyle = 'rgba(255,200,130,.25)'; g.fillRect(x + 17, 1070, 3, 140); g.fillStyle = '#2a1a0f'; }
    // Dienstwagen rechts
    g.fillStyle = '#24170d'; rr(g, 610, 1060, 470, 120, 20); g.fill(); rr(g, 640, 980, 240, 100, 18); g.fill();
    g.fillStyle = 'rgba(255,210,150,.35)'; rr(g, 660, 996, 90, 60, 8); g.fill(); rr(g, 762, 996, 100, 60, 8); g.fill();
    g.fillStyle = '#0d0805'; for (const x of [700, 980]) { g.beginPath(); g.arc(x, 1185, 44, 0, TAU); g.fill(); }
    g.strokeStyle = 'rgba(255,220,170,.45)'; g.lineWidth = 4; g.beginPath(); g.arc(800, 1120, 30, 0, TAU); g.stroke();
    g.fillStyle = 'rgba(255,200,130,.5)'; g.fillRect(610, 1060, 470, 3);
  }
  function familyBack(g) {
    warmBg(g, '#24160d', '#3a2616', '#160d07');
    g.save(); g.globalCompositeOperation = 'lighter'; spot(g, 380, 820, 700, 'rgba(170,120,75,A)', .55);
    for (let i = 0; i < 14; i++) spot(g, hash(i) * 1080, 300 + hash(i + 9) * 1200, 120 + hash(i + 4) * 200, 'rgba(120,80,45,A)', .12); g.restore();
    // Vorhang rechts
    const gr = g.createLinearGradient(900, 0, 1100, 0); gr.addColorStop(0, '#3a2213'); gr.addColorStop(.5, '#5a3820'); gr.addColorStop(1, '#2a180c');
    g.fillStyle = gr; g.fillRect(900, -200, 400, H + 400);
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 10; for (let x = 930; x < 1280; x += 60) { g.beginPath(); g.moveTo(x, -200); g.lineTo(x + 10, H + 200); g.stroke(); }
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(360, 1420, 420, 40, 0, 0, TAU); g.fill();
  }
  function officeBack(g) {
    warmBg(g, '#24170e', '#382619', '#170e08');
    // Jalousie-Fenster
    g.fillStyle = '#1a0f08'; g.fillRect(104, 404, 452, 412);
    for (let y = 420; y < 800; y += 22) { const gr = g.createLinearGradient(0, y, 0, y + 22); gr.addColorStop(0, '#f2c584'); gr.addColorStop(.6, '#c98b4b'); gr.addColorStop(1, '#5a361b'); g.fillStyle = gr; g.fillRect(120, y, 420, 18); }
    g.fillStyle = '#1a0f08'; g.fillRect(326, 420, 8, 380);
    g.save(); g.globalCompositeOperation = 'lighter'; spot(g, 330, 610, 420, WARM, .22); g.restore();
    // Aktenschrank
    let gr = g.createLinearGradient(760, 0, 960, 0); gr.addColorStop(0, '#3a2c20'); gr.addColorStop(.5, '#4e3c2c'); gr.addColorStop(1, '#2a1f16');
    g.fillStyle = gr; g.fillRect(760, 760, 200, 470);
    for (let i = 0; i < 4; i++) { g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 3; g.strokeRect(774, 776 + i * 112, 172, 100); g.fillStyle = '#8a6c4c'; g.fillRect(836, 816 + i * 112, 48, 10); }    // Uhr (Zeiger dynamisch)
    g.fillStyle = '#2a1c12'; g.beginPath(); g.arc(860, 520, 66, 0, TAU); g.fill(); g.fillStyle = '#e1d0b0'; g.beginPath(); g.arc(860, 520, 56, 0, TAU); g.fill();
    g.fillStyle = '#4a3624'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.fillRect(860 + Math.cos(a) * 46 - 3, 520 + Math.sin(a) * 46 - 3, 6, 6); }
    g.fillStyle = '#1e140c'; g.fillRect(-200, 1180, W + 400, 800);
    officeDesk(g);
  }
  function officeFront(g) { // Schreibtisch-Front (deckt die Beine)
    const gr = g.createLinearGradient(0, 1104, 0, 1500); gr.addColorStop(0, '#3a2414'); gr.addColorStop(1, '#160d06'); g.fillStyle = gr; g.fillRect(-200, 1104, 1060, 600);
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 4; for (const x of [20, 300, 580]) g.strokeRect(x, 1140, 250, 300);
    g.fillStyle = 'rgba(255,210,150,.35)'; g.fillRect(-80, 1102, 940, 3);
  }
  function officeDesk(g) { // Tischplatte mit Papieren, Telefon, Tasse, Lampe (hinter den Händen)
    const gr = g.createLinearGradient(0, 1060, 0, 1104); gr.addColorStop(0, '#6a4628'); gr.addColorStop(1, '#8a5f38');
    g.fillStyle = gr; g.beginPath(); g.moveTo(-40, 1060); g.lineTo(820, 1060); g.lineTo(860, 1104); g.lineTo(-80, 1104); g.fill();
    g.fillStyle = '#efe2c8'; g.beginPath(); g.moveTo(250, 1066); g.lineTo(430, 1062); g.lineTo(450, 1090); g.lineTo(236, 1094); g.fill();
    g.fillStyle = '#d8c8a8'; g.beginPath(); g.moveTo(430, 1070); g.lineTo(540, 1066); g.lineTo(556, 1086); g.lineTo(440, 1090); g.fill();
    g.fillStyle = '#1a110a'; rr(g, 70, 1030, 130, 50, 14); g.fill(); rr(g, 60, 1012, 150, 26, 12); g.fill();
    g.fillStyle = '#5a3a22'; g.fillRect(560, 1030, 30, 40);
    // Schreibtischlampe
    g.fillStyle = '#2a1a0e'; g.fillRect(668, 1050, 70, 14); g.fillRect(698, 970, 10, 82);
    g.fillStyle = '#3c5a3a'; g.beginPath(); g.moveTo(640, 990); g.lineTo(770, 990); g.lineTo(750, 952); g.lineTo(660, 952); g.fill();
  }
  function coldBg(g, top, bot) { const gr = g.createLinearGradient(0, -200, 0, H + 200); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(-200, -200, W + 800, H + 400); }
  function shadowBack(g) {
    coldBg(g, '#070a0f', '#05070a');
    const gr = g.createLinearGradient(0, 300, 0, 1390); gr.addColorStop(0, '#0b1018'); gr.addColorStop(1, '#141b25'); g.fillStyle = gr; g.fillRect(-200, 300, W + 800, 1090);
    g.fillStyle = '#05070a'; g.fillRect(-200, 1390, W + 800, 800); g.fillStyle = 'rgba(150,175,215,.12)'; g.fillRect(-200, 1388, W + 800, 3);
    // Türrahmen (dunkel) links im erweiterten Bereich
    g.fillStyle = '#030405'; g.fillRect(120, 520, 200, 870); g.fillStyle = 'rgba(150,175,215,.08)'; g.fillRect(316, 520, 4, 870);
  }
  function houseBack(g) {
    coldBg(g, '#04060a', '#0b121c');
    let gr = g.createLinearGradient(0, 300, 0, 1120); gr.addColorStop(0, '#060a12'); gr.addColorStop(1, '#16223a'); g.fillStyle = gr; g.fillRect(-200, 300, W + 800, 820);
    g.save(); g.globalCompositeOperation = 'lighter'; spot(g, 990, 470, 260, COLD, .28); g.restore();
    g.fillStyle = '#c9d6ea'; glow(g, 'rgba(180,200,235,1)', 40); g.beginPath(); g.arc(990, 470, 34, 0, TAU); g.fill(); noGlow(g);
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(200,215,240,${.2 + hash(i) * .4})`; g.fillRect(-200 + hash(i * 3.3) * 1680, 300 + hash(i * 7.1) * 420, 2, 2); }
    // Strommasten + Leitungen
    g.strokeStyle = '#020305'; g.lineWidth = 12; for (const x of [140, 600, 1180]) { g.beginPath(); g.moveTo(x, 1130); g.lineTo(x, 560); g.stroke(); g.lineWidth = 8; g.beginPath(); g.moveTo(x - 50, 600); g.lineTo(x + 50, 600); g.stroke(); g.lineWidth = 12; }
    g.lineWidth = 2; for (const dy of [0, 22]) for (const [a, b2] of [[140, 600], [600, 1180]]) { g.beginPath(); g.moveTo(a - 40, 600 + dy); g.quadraticCurveTo((a + b2) / 2, 660 + dy, b2 - 40, 600 + dy); g.stroke(); }
    // Nachbarhaus links (für Swap-Ansicht) und Haus rechts
    const house = (x0, x1, y0, peak, col) => { g.fillStyle = col; g.fillRect(x0, y0, x1 - x0, 1130 - y0); g.fillStyle = '#05070b'; g.beginPath(); g.moveTo(x0 - 30, y0 + 4); g.lineTo((x0 + x1) / 2, peak); g.lineTo(x1 + 30, y0 + 4); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; for (let y = y0 + 16; y < 1130; y += 16) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); } };
    house(-160, 300, 960, 870, '#0f1520'); house(580, 1140, 880, 776, '#18212e');
    g.fillStyle = '#070a0f'; g.fillRect(660, 930, 90, 80); g.fillRect(800, 960, 64, 170);
    g.fillStyle = 'rgba(150,175,215,.1)'; g.fillRect(580, 880, 560, 3);
    // kahler Baum
    g.strokeStyle = '#020305'; g.lineCap = 'round';
    const br = (x, y, a, l, w, n) => { if (n <= 0) return; const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke(); br(x2, y2, a - .45 + hash(n + x) * .2, l * .72, w * .66, n - 1); br(x2, y2, a + .4 - hash(n + y) * .2, l * .7, w * .66, n - 1); };
    br(420, 1140, -Math.PI / 2, 190, 22, 6);
    gr = g.createLinearGradient(0, 1120, 0, H); gr.addColorStop(0, '#111923'); gr.addColorStop(1, '#05070a'); g.fillStyle = gr; g.fillRect(-200, 1120, W + 800, H);
  }
  function letterBack(g, lines) {
    coldBg(g, '#06080c', '#030405');
    g.save(); g.globalCompositeOperation = 'lighter'; spot(g, 820, 800, 620, COLD, .14); spot(g, 300, 900, 400, COLD, .05); g.restore();
    const sheet = (cx, cy, w, h, rot, a, txtLines) => {
      g.save(); g.translate(cx, cy); g.rotate(rot); g.globalAlpha = a;
      glow(g, 'rgba(0,0,0,.9)', 50); g.fillStyle = '#b3bcc8'; g.fillRect(-w / 2, -h / 2, w, h); noGlow(g);
      const gr = g.createRadialGradient(0, 0, w * .2, 0, 0, w * .9); gr.addColorStop(0, 'rgba(255,255,255,.12)'); gr.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = gr; g.fillRect(-w / 2, -h / 2, w, h);
      if (txtLines) txtLines.forEach((l, i) => {
        const y = -h / 2 + 80 + i * 46; if (y > h / 2 - 60) return;
        if (l === '#') { for (let k = 0; k < 3; k++) { const ww = 60 + hash(i * 5 + k) * 110; g.fillStyle = '#0d0f12'; g.fillRect(-w / 2 + 50 + k * 150, y - 24, ww, 30); } return; }
        txt(g, l, -w / 2 + 50, y, '400 30px Elite', 'rgba(20,24,30,.85)', 'left');
      });
      g.restore();
    };
    // Umschlag links (sichtbar nach dem Swap): dunkles Papier, Klappe, roter Stempel
    g.save(); g.translate(250, 900); g.rotate(.1); g.globalAlpha = .55;
    g.fillStyle = '#6f7885'; g.fillRect(-200, -125, 400, 250); g.strokeStyle = 'rgba(20,24,30,.6)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(-200, -125); g.lineTo(0, 30); g.lineTo(200, -125); g.stroke();
    for (let i = 0; i < 3; i++) g.fillRect(-120, 50 + i * 22, 150 - i * 30, 6);
    g.globalAlpha = .8; g.strokeStyle = '#b3141a'; g.lineWidth = 4; g.strokeRect(118, -100, 58, 66); g.restore();
    sheet(820, 790, 540, 760, -.07, 1, lines);
    // roter Kringel / Unterstreichung
    g.save(); g.translate(820, 790); g.rotate(-.07); g.strokeStyle = '#d0141c'; g.lineWidth = 6; g.lineCap = 'round'; glow(g, 'rgba(255,30,30,.8)', 14);
    g.beginPath(); g.ellipse(120, 290, 90, 34, -.1, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(-220, -190); g.lineTo(60, -196); g.stroke(); noGlow(g); g.restore();
    const gr = g.createLinearGradient(0, 1300, 0, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, '#020304'); g.fillStyle = gr; g.fillRect(-200, 1300, W + 800, 900);
  }
  const LETTER = ['TO WHOM IT MAY CONCERN,', '', 'YOU HAVE ASKED WHO I AM.', '#', 'I AM CLOSER THAN YOU', 'THINK.', '#', '#', 'DO NOT LOOK FOR ME.', '', '                    — X'];
  const LEFT_DRAW = { church: [churchBack, churchFront], dinner: [dinnerBack, dinnerFront], uniform: [uniformBack, null], family: [familyBack, null], office: [officeBack, officeFront] };
  const RIGHT_DRAW = { shadow: shadowBack, house: houseBack, letter: letterBack };

  function drawWarm(c, kind, lt, gt) {
    const [bk, fr] = LEFT_DRAW[kind] || LEFT_DRAW.church;
    const L = layer('dl_w|' + kind, g => { bk(g); if (fr) fr(g); grade(g, 'rgba(255,170,90,.25)'); });
    blit(c, L);
    const br = Math.sin(gt * 1.5) * .004, arms = [];
    const sat = (x, y, h, P, o) => arms.push([drawMan(c, x, y, h, P, o), o]); // sitzt am Tisch: Unterarme später auf die Platte
    if (kind === 'church') {
      drawMan(c, LX, 1484, 820, MP.pew, { ...warmMan, color: '#1a0f08', breath: br, noLegs: true, turn: noise(gt * .2, 2) * .25 });
      const hb = [LX, 1484 - .465 * 820 - br * 820 * .3]; c.save(); c.translate(hb[0], hb[1]); c.rotate(-.03); // aufgeschlagenes Gesangbuch
      c.fillStyle = '#120a05'; c.beginPath(); c.moveTo(-70, -8); c.lineTo(0, 4); c.lineTo(70, -8); c.lineTo(70, 14); c.lineTo(0, 24); c.lineTo(-70, 14); c.fill();
      c.fillStyle = '#e9d4aa'; c.beginPath(); c.moveTo(-64, -12); c.quadraticCurveTo(-30, -18, 0, -2); c.quadraticCurveTo(30, -18, 64, -12); c.lineTo(64, -6); c.quadraticCurveTo(30, -10, 0, 4); c.quadraticCurveTo(-30, -10, -64, -6); c.fill(); c.restore();
      const sw = Math.sin(gt * .12) * 30, a = .1 + .04 * noise(gt * .5, 5);
      c.save(); c.globalCompositeOperation = 'lighter';
      for (const [wx, ww] of [[330, 270], [800, 200]]) { const g = c.createLinearGradient(0, 500, 0, 1400); g.addColorStop(0, `rgba(255,190,110,${a})`); g.addColorStop(1, 'rgba(255,190,110,0)');
        c.fillStyle = g; c.beginPath(); c.moveTo(wx - ww / 2, 520); c.lineTo(wx + ww / 2, 520); c.lineTo(wx + ww * .3 - 160 + sw, 1400); c.lineTo(wx - ww * .9 - 160 + sw, 1400); c.fill(); }
      c.restore();
      dust(c, gt, 30, 21, (u, v) => [lerp(110, 970, v) - u * 220 + sw, lerp(520, 1350, u)], WARM, .5);
    } else if (kind === 'dinner') {
      const sway = Math.sin(gt * .9) * 6, lx = 450 + sway;
      sat(645, 1316, 700, MP.table, { ...warmMan, hair: 'bob', shoulder: .86, breath: Math.sin(gt * 1.4 + 1) * .004, turn: -.5 + noise(gt * .3, 8) * .3 });
      sat(868, 1300, 470, { ...MP.table, elL: [-.17, -.52], elR: [.17, -.52], haL: [-.1, -.585], haR: [.1, -.585] }, { ...warmMan, headScale: 1.25, shoulder: .9, breath: Math.sin(gt * 1.8 + 2) * .004, turn: -.6 }); // Kind: Hände höher auf dem Tisch
      sat(LX, 1316, 760, MP.table, { ...warmMan, breath: br, turn: .35 + noise(gt * .25, 3) * .3 });
      c.strokeStyle = '#120a05'; c.lineWidth = 4; c.beginPath(); c.moveTo(450, -200); c.lineTo(lx, 520); c.stroke();
      const fl = .93 + .07 * noise(gt * 8, 4);
      c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(0, 570, 0, 1060); g.addColorStop(0, `rgba(255,200,130,${.28 * fl})`); g.addColorStop(1, 'rgba(255,200,130,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(lx - 60, 572); c.lineTo(lx + 60, 572); c.lineTo(lx + 420, 1060); c.lineTo(lx - 420, 1060); c.fill(); spot(c, lx, 590, 160, WARM, .5 * fl); c.restore();
      c.fillStyle = '#3a2210'; c.beginPath(); c.moveTo(lx - 28, 520); c.lineTo(lx + 28, 520); c.lineTo(lx + 70, 576); c.lineTo(lx - 70, 576); c.fill();
      c.fillStyle = `rgba(255,236,190,${fl})`; c.beginPath(); c.ellipse(lx, 576, 40, 8, 0, 0, TAU); c.fill();
    } else if (kind === 'uniform') {
      const m = drawMan(c, LX, 1372, 880, MP.clip, { color: '#22150c', rims: [['rgba(255,196,120,.75)', 4, -1], ['rgba(255,180,100,.3)', 0, -3]], breath: br, cap: true, jacket: true, turn: .15 });
      const [hl, hr] = m.hands; c.save(); c.translate((hl[0] + hr[0]) / 2 - 6, (hl[1] + hr[1]) / 2 + 26); c.rotate(-.08);
      c.fillStyle = '#3a2818'; c.fillRect(-58, -78, 116, 150); c.fillStyle = '#e6d6b8'; c.fillRect(-50, -66, 100, 132); c.fillStyle = '#6a5a44'; for (let i = 0; i < 6; i++) c.fillRect(-40, -46 + i * 18, 70 - (i % 3) * 14, 4);
      c.fillStyle = '#8a7a60'; c.fillRect(-20, -84, 40, 14); c.restore();
      const bx = m.sh[0][0] + 30, by = m.sh[0][1] + 60, tw = .5 + .5 * Math.sin(gt * 2.2);
      c.save(); c.globalCompositeOperation = 'lighter'; spot(c, bx, by, 22, 'rgba(255,220,150,A)', .7 * tw); c.restore(); c.fillStyle = '#b8955a'; c.beginPath(); c.arc(bx, by, 6, 0, TAU); c.fill();
      c.save(); c.globalCompositeOperation = 'lighter'; spot(c, 840, 940, 300, 'rgba(255,210,140,A)', .12 + .05 * Math.sin(gt * .7)); c.restore();
      dust(c, gt, 22, 31, (u, v) => [lerp(100, 1000, v), lerp(600, 1300, (u + v * .3) % 1)], WARM, .4);
    } else if (kind === 'family') {
      drawMan(c, 482, 1395, 815, MP.stand, { ...warmMan, hair: 'bob', dress: true, shoulder: .85, breath: Math.sin(gt * 1.4 + 1) * .004, turn: -.2 });
      drawMan(c, 300, 1392, 900, MP.hold, { ...warmMan, breath: br, jacket: true, turn: .2 });
      drawMan(c, 222, 1408, 500, MP.stand, { ...warmMan, hair: 'bob', dress: true, headScale: 1.3, shoulder: .9, breath: Math.sin(gt * 1.9) * .004 });
      drawMan(c, 404, 1410, 455, MP.stand, { ...warmMan, headScale: 1.32, shoulder: .9, breath: Math.sin(gt * 2.1 + 2) * .004, turn: .3 });
      c.save(); c.globalCompositeOperation = 'lighter'; spot(c, 360, 700, 520, WARM, .06 + .02 * Math.sin(gt * .8)); c.restore();
    } else if (kind === 'office') {
      const sh = Math.sin(gt * .1) * 20;
      c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,190,110,.06)'; c.beginPath();
      for (let i = 0; i < 9; i++) { const y = 640 + i * 46 + sh; c.moveTo(560, y); c.lineTo(1100, y + 260); c.lineTo(1100, y + 282); c.lineTo(560, y + 20); c.closePath(); }
      c.fill(); c.restore();
      const cl = gt; c.save(); c.translate(860, 520); c.strokeStyle = '#1e140c'; c.lineCap = 'round';
      c.lineWidth = 6; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(-1.2 + cl * .002) * 28, Math.sin(-1.2 + cl * .002) * 28); c.stroke();
      c.lineWidth = 4; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(.6 + cl * .02) * 42, Math.sin(.6 + cl * .02) * 42); c.stroke();
      c.strokeStyle = '#a02018'; c.lineWidth = 2; const sa = -Math.PI / 2 + Math.floor(cl) / 60 * TAU; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(sa) * 48, Math.sin(sa) * 48); c.stroke(); c.restore();
      const wr = Math.sin(gt * 6) * .006;
      sat(LX, 1398, 800, { ...MP.write, haR: [.085 + wr, -.418] }, { ...warmMan, breath: br, turn: .1, headDy: .012 });
    }
    // Vordergrund (Bank/Tisch/Schreibtisch, deckend) nur dort neu kopieren, wo Figuren dahinter sitzen, dann Unterarme auf die Platte
    if (fr && FRONT_CLIP[kind]) reblit(c, L, ...FRONT_CLIP[kind]);
    for (const [m, o] of arms) drawForearms(c, m, o);
    if (kind === 'office') { const fl = .95 + .05 * noise(gt * 6, 2); c.save(); c.globalCompositeOperation = 'lighter'; spot(c, 705, 1000, 200, WARM, .35 * fl); c.translate(705, 1064); c.scale(1, .2); spot(c, 0, 0, 280, WARM, .45 * fl); c.restore(); }
  }
  const FRONT_CLIP = { church: [100, 1172, 570, 1340], dinner: [140, 991, 1010, 1336], office: [100, 1061, 570, 1430] };
  function drawCold(c, kind, lt, gt, ox, p) {
    const bk = RIGHT_DRAW[kind] || RIGHT_DRAW.shadow;
    const lines = Array.isArray(p.letterText) ? p.letterText.map(String) : LETTER;
    blit(c, layer('dl_c|' + kind + (kind === 'letter' ? '|' + lines.join('/') : ''), g => {
      bk(g, lines); if (kind === 'shadow') spot(g, RX - 140, 1300, 420, 'rgba(255,32,32,A)', .18); grade(g, 'rgba(80,120,190,.25)', 400);
    }, 400), ox);
    c.save(); c.translate(ox, 0);
    const br = Math.sin(gt * 1.1) * .004, x = RX;
    if (kind === 'shadow') {
      // Jalousie-Streifen (ein Pfad), wandern langsam nach unten; schwach auch über die Figur
      const sl = (gt * 6) % 60, stripes = new Path2D();
      for (let i = -4; i < 16; i++) { const y = 220 + i * 60 + sl, y0 = Math.max(300, y), y1 = Math.min(1390, y + 548); if (y1 <= y0) continue; pPoly(stripes, [[1400, y], [-200, y + 520], [-200, y + 548], [1400, y + 28]]); }
      c.save(); c.beginPath(); c.rect(-200, 300, W + 800, 1090); c.clip(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(150,175,215,.09)'; c.fill(stripes); c.restore();
      const m = drawMan(c, x, 1392, 900, MP.stand, { color: '#020304', breath: br, jacket: true, rims: [['rgba(255,40,40,.55)', -4, 0], ['rgba(160,185,225,.45)', 4, -2]] });
      c.save(); c.clip(m.all); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(150,175,215,.05)'; c.fill(stripes); c.restore();
    } else if (kind === 'house') {
      const wf = .75 + .25 * flicker(gt, 13, 3);
      c.save(); c.globalCompositeOperation = 'lighter'; glow(c, 'rgba(255,50,40,.9)', 40); c.fillStyle = `rgba(200,40,30,${.75 * wf})`; c.fillRect(930, 930, 90, 80); noGlow(c);
      spot(c, 975, 970, 200, 'rgba(255,40,30,A)', .25 * wf); c.restore();
      c.strokeStyle = '#07090c'; c.lineWidth = 6; c.beginPath(); c.moveTo(975, 930); c.lineTo(975, 1010); c.moveTo(930, 970); c.lineTo(1020, 970); c.stroke();
      drawMan(c, x, 1424, 780, MP.stand, { color: '#020304', breath: br, jacket: true, rims: [['rgba(160,185,225,.5)', 3, -3], ['rgba(255,40,40,.4)', -3, 0]], turn: .0 });
      c.save(); c.globalCompositeOperation = 'lighter'; c.translate(x, 1426); c.scale(1, .12); spot(c, 0, 0, 260, COLD, .2); c.restore();
    } else {
      const a = .1 + .04 * Math.sin(gt * .9);
      c.save(); c.globalCompositeOperation = 'lighter'; spot(c, 900, 700, 360, COLD, a); c.restore();
      drawMan(c, x + 10, 1404, 880, MP.stand, { color: '#020304', breath: br, jacket: true, rims: [['rgba(160,185,225,.55)', 4, -2], ['rgba(255,40,40,.45)', -4, 0]] });
    }
    dust(c, gt, 18, 41, (u, v) => [lerp(560, 1060, v), lerp(1300, 400, u)], COLD, .35);
    c.restore();
  }
  function labelPlate(c, text, x, y, side, a, sc, gt) {
    if (!text || a <= 0) return;
    const s = String(text).toUpperCase();
    c.save(); c.globalAlpha *= clamp(a); c.translate(x, y); c.scale(sc, sc);
    if (s.length <= 5) { // kurzer Name: groß, rot leuchtend (als Sprite, flackert leicht)
      c.globalAlpha *= .88 + .12 * flicker(gt, 7, 9);
      drawSpr(c, sprite('big|' + s, 820, 320, g => { glow(g, 'rgba(255,30,30,1)', 50); txt(g, s, 0, 0, '400 150px Anton', '#ff2424', 'center', 'middle', 8); noGlow(g);
        txt(g, s, 0, 0, '400 150px Anton', '#ff4646', 'center', 'middle', 8); }));
      c.restore(); return;
    }
    const warm = side === 'l';
    drawSpr(c, sprite('plate|' + side + '|' + s, 500, 280, g => {
      const font = '700 38px Oswald'; g.letterSpacing = '4px'; const lines = wrap(g, s, 340, font).slice(0, 3);
      g.font = font; const tw = Math.max(...lines.map(l => g.measureText(l).width)); g.letterSpacing = '0px';
      const pw = Math.min(390, tw + 56), ph = lines.length * 48 + 30;
      glow(g, 'rgba(0,0,0,.8)', 30); rr(g, -pw / 2, -ph / 2, pw, ph, 6); g.fillStyle = warm ? 'rgba(16,9,4,.9)' : 'rgba(4,5,8,.9)'; g.fill(); noGlow(g);
      if (!warm) glow(g, 'rgba(255,30,30,.9)', 18);
      g.lineWidth = 2.5; g.strokeStyle = warm ? 'rgba(255,205,150,.8)' : 'rgba(255,50,50,.95)'; g.stroke(); noGlow(g);
      g.fillStyle = warm ? '#f0b46a' : '#ff2b2b'; g.fillRect(-pw / 2, -ph / 2 + 10, 6, ph - 20);
      lines.forEach((l, i) => { g.font = font; g.letterSpacing = '4px'; const fs = Math.min(38, Math.floor(38 * (pw - 40) / g.measureText(l).width)); g.letterSpacing = '0px';
        txt(g, l, 4, -ph / 2 + 15 + 48 * (i + .78), `700 ${fs}px Oswald`, warm ? '#fff1dc' : '#f6f6f8', 'center', 'alphabetic', 4); });
    }));
    c.restore();
  }
  SCENES.double_life = (c, lt, b, gt) => {
    const p = b.p || {};
    const left = LEFT_DRAW[p.left] ? p.left : 'church', right = RIGHT_DRAW[p.right] ? p.right : 'shadow';
    const at = num(p.at, 0), split = num(p.split, at + .6), swap = typeof p.swap === 'number' ? p.swap : null;
    const lab = p.labels === false ? null : (p.labels || { l: WARM_LABEL[left], r: 'THE KILLER' });
    const fi = Math.floor(lt * 30);
    const sk = E.inOut(prog(lt, split, split + .75)), tip = lerp(-220, H + 220, sk);
    const sw = swap != null ? prog(lt, swap, swap + 1.1) : 0, full = swap != null && lt >= swap + .42;
    const ox = swap != null ? -200 * E.inOut(prog(lt, swap + .3, swap + 1.2)) : 0;
    if (!full) { // warme Seite nur dort zeichnen, wo sie sichtbar bleibt (links + noch nicht aufgedeckter Teil rechts)
      c.save(); if (sk > 0) { c.beginPath(); c.rect(-300, -300, 840, H + 600); if (tip < H + 200) c.rect(540, tip, W, H + 300 - tip); c.clip(); }
      drawWarm(c, left, lt, gt); c.restore();
    }
    if (sk > 0 && !full) {
      c.save(); c.beginPath(); c.rect(540, -300, W, tip + 300); c.clip();
      if (sk < 1) c.translate((hash(fi) - .5) * 10 * (1 - sk), 0);
      drawCold(c, right, lt, gt, 0, p); c.restore();
    }
    if (swap != null && lt >= swap && !full) { // Glitch: die dunkle Hälfte frisst sich über die linke
      const q = prog(lt, swap, swap + .42), n = 3 + Math.floor(q * 12);
      for (let i = 0; i < n; i++) {
        const y = hash(fi * 3.1 + i) * (H + 200) - 100, hh = 30 + hash(fi * 7.7 + i) * 170 * (.5 + q), dx = (hash(fi * 11.3 + i) - .5) * 260;
        c.save(); c.beginPath(); c.rect(-200, y, 740 + 200, hh); c.clip(); c.translate(dx + 200 * q * (hash(i) - .2), 0); drawCold(c, right, lt, gt, 0, p); c.restore();
        if (hash(fi + i * 5) > .6) { c.fillStyle = hash(i + fi) > .5 ? 'rgba(255,32,32,.35)' : 'rgba(120,200,255,.18)'; c.fillRect(-200, y, W + 400, 4 + hash(i * 9 + fi) * 8); }
      }
    }
    if (full) {
      drawCold(c, right, lt, gt, ox, p);
      if (lt < swap + .6) { const fi2 = fi; for (let i = 0; i < 5; i++) { const y = hash(fi2 * 5.3 + i) * H, hh = 20 + hash(i + fi2) * 90; c.fillStyle = 'rgba(255,32,32,.25)'; c.fillRect(-200, y, W + 400, hh * .1 + 3); } }
    }
    // rote Trennlinie
    const la = full ? 1 - prog(lt, swap + .42, swap + .9) : swap != null && lt >= swap ? (hash(fi * 1.7) > .35 ? 1 : .3) : 1;
    if (sk > 0 && la > 0) {
      c.save(); c.globalAlpha = la; c.globalCompositeOperation = 'lighter'; vGlowLine(c, 540, -220, tip, 46, 'rgba(255,32,32,A)', .5); c.globalCompositeOperation = 'source-over';
      c.fillStyle = '#ff2020'; c.fillRect(536, -220, 8, tip + 220); c.fillStyle = '#ffd0d0'; c.fillRect(538.5, -220, 3, tip + 220);
      if (sk < 1) { spot(c, 540, tip, 90, 'rgba(255,60,60,A)', .9); spot(c, 540, tip, 26, 'rgba(255,230,230,A)', 1); }
      c.restore();
    }
    // Schilder
    if (lab) {
      const la0 = num(lab.at, split + .7);
      const lk = E.back(prog(lt, la0, la0 + .4)), rk = E.back(prog(lt, la0 + .35, la0 + .75));
      let lA = clamp(lk * 1.3), lX = LX + 10, jit = 0;
      if (swap != null && lt >= swap) { lA *= 1 - prog(lt, swap + .1, swap + .45); jit = (hash(fi * 2.2) - .5) * 40; if (hash(fi * 3.9) < .3) lA *= .2; }
      labelPlate(c, lab.l, lX + jit, 412, 'l', lA, lerp(.8, 1, clamp(lk)), gt);
      const mv = swap != null ? E.inOut(prog(lt, swap + .3, swap + 1.2)) : 0;
      const big = lab.r && String(lab.r).length <= 5;
      labelPlate(c, lab.r, lerp(RX, 540, mv), lerp(big ? 430 : 412, big ? 395 : 412, mv), 'r', clamp(rk * 1.3), lerp(.8, 1, clamp(rk)) * lerp(1, big ? 1.3 : 1.2, mv), gt);
    }
    // optionale Einblendung von Schwarz ab at
    if (p.fadeIn && lt < at + .4) { c.fillStyle = `rgba(0,0,0,${1 - E.out(prog(lt, at, at + .4))})`; c.fillRect(-300, -300, W + 600, H + 600); }
  };
})();
