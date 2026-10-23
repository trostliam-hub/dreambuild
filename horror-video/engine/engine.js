'use strict';
// Horror-Shortform-Engine: deterministisches Canvas-Rendering, renderFrame(i) zeichnet Frame i.
const W = 1080, H = 1920, FPS = 30;
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const off = document.createElement('canvas'); off.width = W; off.height = H; const octx = off.getContext('2d');
const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H; const tctx = tmp.getContext('2d');
let TL = null;
const POST_HOOKS = []; // Zusatz-Overlays aus scenes/*.js: f(ctx, t, beat, lt)
const UI_DE = { now: 'jetzt', message: 'Nachricht', date: 'Freitag, 23. Oktober', typing: 'Mama schreibt', sender: 'Unbekannt', kicker: 'VON: MIR', pill: 'FOLGE FÜR TEIL 2', title: 'WEM VERTRAUST DU?', optA: 'OPTION A', optB: 'OPTION B', end: 'NACHT 2' };
const U = k => (TL && TL.ui && TL.ui[k] != null) ? TL.ui[k] : UI_DE[k];

const C = {
  bg: '#08080a', g1: '#111115', g2: '#18181d', g3: '#202027', g4: '#2b2b33', g5: '#383842', line: '#45454f',
  red: '#ff2b2b', red2: '#ff4a3d', redD: '#7a0d10', redDD: '#3a0507', white: '#ecebf0', dim: '#8d8d99', blue: '#5aa0ff',
};

// ---------- Mathe ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  out: t => 1 - Math.pow(1 - t, 3),
  in: t => t * t * t,
  inOut: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  back: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  elastic: t => t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI / 3)) + 1,
};
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function noise(t, seed = 0) { const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return lerp(hash(i + seed * 57.3), hash(i + 1 + seed * 57.3), u) * 2 - 1; }
function flicker(t, seed = 1, rate = 14) { return noise(t * rate, seed) > -0.55 ? 1 : 0.25; }

// ---------- Zeichenhilfen ----------
function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function glow(c, color, blur) { c.shadowColor = color; c.shadowBlur = blur; }
function noGlow(c) { c.shadowBlur = 0; c.shadowColor = 'transparent'; }
function spot(c, x, y, r, col, a) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0));
  c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r);
}
const RED = 'rgba(255,32,32,A)', WHITEA = 'rgba(235,235,240,A)', BLACKA = 'rgba(0,0,0,A)';
function txt(c, s, x, y, font, col, align = 'center', base = 'alphabetic', ls = 0) {
  c.font = font; c.fillStyle = col; c.textAlign = align; c.textBaseline = base; c.letterSpacing = ls + 'px'; c.fillText(s, x, y); c.letterSpacing = '0px';
}
function wrap(c, s, maxW, font) {
  c.font = font; const words = s.split(/\s+/); const lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
function bgFill(c, top = '#0d0d10', bot = '#050506') {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(-200, -200, W + 400, H + 400);
}

// ---------- Strichmännchen ----------
const BASE = { head: [0, -.9], hr: .085, neck: [0, -.79], hip: [0, -.44], lk: [-.05, -.22], lf: [-.08, 0], rk: [.05, -.22], rf: [.08, 0], le: [-.1, -.62], lh: [-.12, -.46], re: [.1, -.62], rh: [.12, -.46] };
const POSES = {
  stand: BASE,
  phone: { ...BASE, re: [.15, -.62], rh: [.07, -.73] },
  scared: { ...BASE, le: [-.13, -.68], lh: [-.035, -.83], re: [.13, -.68], rh: [.035, -.83] },
  reach: { ...BASE, re: [.17, -.72], rh: [.33, -.74] },
  walk: { ...BASE, lk: [-.1, -.22], lf: [-.18, 0], rk: [.09, -.2], rf: [.13, 0], le: [-.08, -.6], lh: [.02, -.46], re: [.08, -.6], rh: [-.03, -.47] },
  listen: { ...BASE, head: [.03, -.9], re: [.13, -.7], rh: [.07, -.86] },
  peek: { ...BASE, head: [.08, -.88], neck: [.04, -.78], re: [.15, -.66], rh: [.2, -.78] },
};
function stick(c, x, y, h, pose = 'stand', t = 0, o = {}) {
  const P = typeof pose === 'string' ? (POSES[pose] || BASE) : pose;
  const col = o.color || C.white, lw = o.lw || h * .048, fl = o.flip ? -1 : 1;
  const tr = o.tremble ? noise(t * 30, 3) * h * .006 : 0, bob = Math.sin(t * 2.1) * h * .004;
  const pt = p => [x + p[0] * fl * h + tr, y + p[1] * h + (p[1] < -.4 ? bob : 0)];
  c.save(); c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round';
  if (o.glow) glow(c, o.glow, o.glowBlur || 30);
  const seg = (...ps) => { c.beginPath(); ps.forEach((p, i) => { const q = pt(p); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.stroke(); };
  const hd0 = pt(P.head), hr0 = P.hr * h;
  if (o.hair === 'long') { // lange, offene Haare hinter dem Kopf
    c.save(); noGlow(c); c.fillStyle = o.hairColor || '#b9b9c3';
    const sw = Math.sin(t * 1.3) * hr0 * .08;
    c.beginPath(); c.moveTo(hd0[0] - hr0 * 1.05, hd0[1]); c.quadraticCurveTo(hd0[0] - hr0 * 1.35 + sw, hd0[1] + hr0 * 2.2, hd0[0] - hr0 * 1.1 + sw, hd0[1] + hr0 * 3.1);
    c.lineTo(hd0[0] + hr0 * 1.1 + sw, hd0[1] + hr0 * 3.1); c.quadraticCurveTo(hd0[0] + hr0 * 1.35 + sw, hd0[1] + hr0 * 2.2, hd0[0] + hr0 * 1.05, hd0[1]);
    c.arc(hd0[0], hd0[1], hr0 * 1.12, 0, Math.PI, true); c.fill(); c.restore();
  }
  if (o.dress) { // Mantel / Nachthemd als Trapez
    c.save(); noGlow(c); const n = pt(P.neck), hp = pt(P.hip), len = o.dressLen || .3;
    c.fillStyle = o.dress; c.beginPath(); c.moveTo(n[0] - h * .05, n[1] + h * .02); c.lineTo(n[0] + h * .05, n[1] + h * .02);
    c.lineTo(hp[0] + h * .13, hp[1] + h * len); c.lineTo(hp[0] - h * .13, hp[1] + h * len); c.closePath(); c.fill();
    if (o.dressLine) { c.strokeStyle = o.dressLine; c.lineWidth = lw * .35; c.stroke(); }
    if (o.coat) { c.strokeStyle = o.dressLine; c.lineWidth = lw * .3; c.beginPath(); c.moveTo(n[0] - h * .06, n[1] + h * .01); c.lineTo(n[0], n[1] + h * .09); c.lineTo(n[0] + h * .06, n[1] + h * .01); c.stroke();
      c.fillStyle = o.dressLine; for (let b = 0; b < 4; b++) { c.beginPath(); c.arc(n[0] + h * .012, n[1] + h * (.13 + b * .085), h * .009, 0, 7); c.fill(); } }
    c.restore();
  }
  seg(P.neck, P.hip); seg(P.hip, P.lk, P.lf); seg(P.hip, P.rk, P.rf); seg(P.neck, P.le, P.lh); seg(P.neck, P.re, P.rh);
  if (o.hood) { const hh = pt(P.head), r = P.hr * h; c.save(); noGlow(c); c.fillStyle = o.hoodColor || '#9a9aa6';
    c.beginPath(); c.ellipse(hh[0], hh[1] + r * .12, r * 1.28, r * 1.32, 0, 0, 7); c.fill(); c.restore(); }
  const hd = pt(P.head); c.beginPath(); c.arc(hd[0], hd[1], P.hr * h, 0, Math.PI * 2); c.fillStyle = col; c.fill();
  if (o.hood) { const r = P.hr * h; c.save(); noGlow(c); c.strokeStyle = o.hoodColor || '#9a9aa6'; c.lineWidth = r * .14; c.beginPath(); c.arc(hd[0], hd[1] + r * .1, r * 1.12, Math.PI * .15, Math.PI * .85); c.stroke(); c.restore(); }
  if (o.back) { c.save(); noGlow(c); c.fillStyle = o.hairColor || '#b9b9c3'; c.beginPath(); c.arc(hd[0], hd[1], hr0 * 1.1, 0, 7); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = hr0 * .06; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(hd[0] + k * hr0 * .3, hd[1] - hr0 * .9); c.quadraticCurveTo(hd[0] + k * hr0 * .4, hd[1], hd[0] + k * hr0 * .45, hd[1] + hr0 * 1.6); c.stroke(); }
    c.restore(); c.restore(); return { head: hd, hand: pt(P.rh) }; }
  if (o.hair === 'long') { // Pony
    c.save(); noGlow(c); c.fillStyle = o.hairColor || '#b9b9c3'; c.beginPath(); c.arc(hd[0], hd[1], hr0 * 1.08, Math.PI * 1.05, Math.PI * 1.95); c.quadraticCurveTo(hd[0], hd[1] - hr0 * .35, hd[0] - hr0 * 1.03, hd[1] - hr0 * .15); c.fill(); c.restore();
  }
  if (o.hair === 'bun') { c.save(); noGlow(c); c.fillStyle = o.hairColor || '#b9b9c3'; c.beginPath(); c.arc(hd[0] + hr0 * .2, hd[1] - hr0 * 1.05, hr0 * .5, 0, 7); c.fill();
    c.beginPath(); c.arc(hd[0], hd[1], hr0 * 1.06, Math.PI * 1.08, Math.PI * 1.92); c.lineTo(hd[0], hd[1] - hr0 * .55); c.fill(); c.restore(); }
  if (o.face) { // Gesicht auf heller Figur
    c.save(); noGlow(c); const fc = o.faceColor || '#141418', r0 = hr0;
    if (o.face === 'yawn') { c.strokeStyle = fc; c.lineWidth = r0 * .1; c.lineCap = 'round';
      for (const sd of [-1, 1]) { c.beginPath(); c.arc(hd[0] + sd * r0 * .36, hd[1] - r0 * .16, r0 * .14, .15 * Math.PI, .85 * Math.PI); c.stroke(); }
      const op = .5 + .5 * Math.sin(t * 2.2); c.fillStyle = fc; c.beginPath(); c.ellipse(hd[0], hd[1] + r0 * .42, r0 * .2, r0 * (.18 + .14 * op), 0, 0, 7); c.fill();
      c.restore(); c.restore(); return { head: hd, hand: pt(P.rh) }; }
    const big = o.face === 'wide' || o.face === 'stare';
    const ew = o.face === 'stare' ? .2 : big ? .19 : .13, eh = o.face === 'stare' ? .27 : big ? .24 : .15;
    c.fillStyle = fc; c.beginPath(); c.ellipse(hd[0] - r0 * .36, hd[1] - r0 * .1, r0 * ew, r0 * eh, 0, 0, 7); c.ellipse(hd[0] + r0 * .36, hd[1] - r0 * .1, r0 * ew, r0 * eh, 0, 0, 7); c.fill();
    if (o.face === 'wide') { c.fillStyle = '#fff'; c.beginPath(); c.arc(hd[0] - r0 * .36, hd[1] - r0 * .1, r0 * .06, 0, 7); c.arc(hd[0] + r0 * .36, hd[1] - r0 * .1, r0 * .06, 0, 7); c.fill(); }
    if (o.face === 'stare') { c.fillStyle = '#ff3b3b'; glow(c, 'rgba(255,40,40,1)', r0 * .2); c.beginPath(); c.arc(hd[0] - r0 * .36, hd[1] - r0 * .1, r0 * .045, 0, 7); c.arc(hd[0] + r0 * .36, hd[1] - r0 * .1, r0 * .045, 0, 7); c.fill(); noGlow(c); }
    c.strokeStyle = o.mouthColor || fc; c.lineWidth = r0 * .1; c.lineCap = 'round';
    const g = o.smile == null ? 0 : o.smile;
    if (g > .05 && o.face === 'stare') { // zu breites Grinsen mit Zähnen
      const R = r0 * (.4 + .25 * g), a0 = (.5 - .45 * g) * Math.PI, a1 = (.5 + .45 * g) * Math.PI, cy = hd[1] - r0 * .02;
      c.fillStyle = fc; c.beginPath(); c.moveTo(hd[0] + Math.cos(a0) * R, cy + Math.sin(a0) * R); c.arc(hd[0], cy, R, a0, a1); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(230,220,222,.9)'; c.lineWidth = r0 * .04;
      for (let k = 1; k < 7; k++) { const a = lerp(a0, a1, k / 7); c.beginPath(); c.moveTo(hd[0] + Math.cos(a) * R * .95, cy + Math.sin(a) * R * .95); c.lineTo(hd[0] + Math.cos(a) * R * .55, cy + Math.sin(a) * R * .3 + r0 * .05); c.stroke(); }
    } else if (g > .05) { if (o.mouthGlow) glow(c, o.mouthGlow, r0 * .5); c.beginPath(); c.arc(hd[0], hd[1] + r0 * .02, r0 * (.35 + .3 * g), (.5 - .42 * g) * Math.PI, (.5 + .42 * g) * Math.PI); c.stroke(); noGlow(c); }
    else { c.beginPath(); c.moveTo(hd[0] - r0 * .22, hd[1] + r0 * .42); c.lineTo(hd[0] + r0 * .22, hd[1] + r0 * .42); c.stroke(); }
    c.restore();
  }
  if (o.eyes) { // weiße Augen auf dunkler Figur
    noGlow(c); c.fillStyle = o.eyes; const e = P.hr * h * .32;
    c.beginPath(); c.arc(hd[0] - e, hd[1] - e * .2, e * .38, 0, 7); c.arc(hd[0] + e, hd[1] - e * .2, e * .38, 0, 7); c.fill();
  }
  if (o.grin) { noGlow(c); c.strokeStyle = o.grin; c.lineWidth = P.hr * h * .12; c.beginPath(); c.arc(hd[0], hd[1] + P.hr * h * .05, P.hr * h * .55, .15 * Math.PI, .85 * Math.PI); c.stroke(); }
  c.restore();
  return { head: hd, hand: pt(P.rh) };
}
const MAMA = {
  coat: { hair: 'bun', dress: '#2c2c36', dressLine: '#8a8a98', dressLen: .4, coat: true },
  gown: { hair: 'long', dress: '#cfcfd8', dressLen: .36 },
};
function mama(c, kind, x, y, h, pose, t, extra = {}) { return stick(c, x, y, h, pose, t, { ...MAMA[kind], ...extra }); }
// Dunkle, große Gestalt (Silhouette)
function shade(c, x, y, h, t, o = {}) {
  c.save();
  const sway = noise(t * .7, 9) * h * .01;
  c.fillStyle = o.color || '#020203';
  if (o.rim) glow(c, o.rim, 40);
  c.beginPath();
  const hw = h * .09;
  c.moveTo(x - hw * 1.3, y); c.quadraticCurveTo(x - hw * 1.5 + sway, y - h * .45, x - hw * 1.1 + sway, y - h * .78);
  c.quadraticCurveTo(x + sway, y - h * .86, x + hw * 1.1 + sway, y - h * .78);
  c.quadraticCurveTo(x + hw * 1.5 + sway, y - h * .45, x + hw * 1.3, y); c.closePath(); c.fill();
  c.beginPath(); c.ellipse(x + sway * 1.3, y - h * .88, h * .07, h * .09, 0, 0, 7); c.fill();
  noGlow(c);
  if (o.eyes) {
    const a = o.eyes; c.fillStyle = `rgba(255,240,240,${a})`; glow(c, 'rgba(255,60,60,.9)', 18);
    const ex = x + sway * 1.3 + (o.look || 0) * h * .02, ey = y - h * .89;
    c.beginPath(); c.ellipse(ex - h * .024, ey, h * .011, h * .006, 0, 0, 7); c.ellipse(ex + h * .024, ey, h * .011, h * .006, 0, 0, 7); c.fill();
  }
  c.restore();
}

// ---------- Handy ----------
function phoneBody(c, cx, cy, w, h, tilt, screen) {
  c.save(); c.translate(cx, cy); c.rotate(tilt);
  glow(c, 'rgba(0,0,0,.8)', 60);
  rr(c, -w / 2, -h / 2, w, h, w * .15); c.fillStyle = '#16161b'; c.fill(); noGlow(c);
  c.lineWidth = 7; c.strokeStyle = '#3d3d47'; c.stroke();
  rr(c, -w / 2 + 10, -h / 2 + 10, w - 20, h - 20, w * .13); c.lineWidth = 3; c.strokeStyle = '#26262d'; c.stroke();
  const sx = -w / 2 + w * .045, sy = -h / 2 + w * .045, sw = w * .91, sh = h - w * .09;
  c.save(); rr(c, sx, sy, sw, sh, w * .115); c.clip(); c.fillStyle = '#0b0b0e'; c.fillRect(sx, sy, sw, sh);
  screen(c, sx, sy, sw, sh); c.restore();
  rr(c, -w * .15, sy + w * .035, w * .3, w * .08, w * .04); c.fillStyle = '#000'; c.fill();
  c.restore();
}
function notifCard(c, x, y, w, sender, body, a, hl) {
  c.save(); c.globalAlpha = a;
  const lines = wrap(c, body, w - 150, '500 30px Mont');
  const h = 96 + lines.length * 38;
  if (hl) glow(c, 'rgba(255,40,40,.75)', 40);
  rr(c, x, y, w, h, 34); c.fillStyle = 'rgba(38,38,46,.94)'; c.fill(); noGlow(c);
  if (hl) { c.lineWidth = 3; c.strokeStyle = 'rgba(255,60,60,.8)'; c.stroke(); }
  rr(c, x + 26, y + 28, 70, 70, 18); c.fillStyle = C.red; c.fill();
  rr(c, x + 41, y + 46, 40, 30, 10); c.fillStyle = '#fff'; c.fill();
  txt(c, sender, x + 120, y + 56, '700 32px Mont', '#fff', 'left');
  txt(c, U('now'), x + w - 28, y + 56, '500 26px Mont', '#9a9aa6', 'right');
  lines.forEach((l, i) => txt(c, l, x + 120, y + 100 + i * 38, '500 30px Mont', '#e3e3ea', 'left'));
  c.restore(); return h;
}
function lockScreen(c, sx, sy, sw, sh, t, p) {
  const g = c.createLinearGradient(0, sy, 0, sy + sh); g.addColorStop(0, '#15151a'); g.addColorStop(1, '#2a0607'); c.fillStyle = g; c.fillRect(sx, sy, sw, sh);
  spot(c, sx + sw / 2, sy + sh, sw * .9, RED, .25);
  const cx = sx + sw / 2;
  txt(c, p.date || U('date'), cx, sy + 190, '600 34px Mont', '#d9d9e0');
  txt(c, p.time || '3:07', cx, sy + 360, '700 170px Mont', '#f2f2f5');
  (p.notifs || []).forEach((n, i) => {
    const at = n.at || 0; if (t < at) return;
    const k = E.back(prog(t, at, at + .35));
    c.save(); c.translate(cx, sy + 470 + i * 200); c.scale(lerp(.85, 1, k), lerp(.85, 1, k)); c.translate(-cx, -(sy + 470 + i * 200));
    notifCard(c, sx + 30, sy + 430 + i * 200, sw - 60, n.sender || U('sender'), n.text, clamp(k * 1.2), true); c.restore();
  });
  rr(c, cx - 90, sy + sh - 30, 180, 9, 5); c.fillStyle = 'rgba(255,255,255,.6)'; c.fill();
}
function chatScreen(c, sx, sy, sw, sh, t, p) {
  c.fillStyle = '#0c0c0f'; c.fillRect(sx, sy, sw, sh);
  // Kopfzeile
  c.fillStyle = '#17171c'; c.fillRect(sx, sy, sw, 210);
  const cx = sx + sw / 2;
  c.beginPath(); c.arc(cx, sy + 110, 44, 0, 7); c.fillStyle = p.avatarColor || '#3a3a44'; c.fill();
  txt(c, (p.initials || p.name || '?').slice(0, 2).toUpperCase(), cx, sy + 123, '700 34px Mont', '#fff');
  txt(c, p.name || U('sender'), cx, sy + 182, '600 28px Mont', '#e8e8ee');
  const away = p.awayAt != null && t >= p.awayAt, hs = away ? 'Away' : p.headerSub;
  if (hs) { txt(c, hs, cx + 10, sy + 206, '600 20px Mont', p.headerSubRed ? '#ff5a5a' : '#8d8d99');
    if (p.headerDot) { c.font = '600 20px Mont'; const tw = c.measureText(hs).width; c.fillStyle = away ? '#6a6a74' : '#3dff6e'; c.beginPath(); c.arc(cx + 10 - tw / 2 - 14, sy + 199, 6, 0, 7); c.fill(); } }
  c.strokeStyle = C.red; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx + 52, sy + 92); c.lineTo(sx + 34, sy + 112); c.lineTo(sx + 52, sy + 132); c.stroke();
  // Nachrichten von unten nach oben
  const msgs = (p.messages || []).filter(m => t >= (m.at || 0));
  const font = '500 31px Mont', maxW = sw * .68, pad = 26, lh = 40;
  let y = sy + sh - 150; const items = [];
  const typingAt = (p.messages || []).find(m => m.typing && t >= m.typing && t < m.at);
  if (typingAt) items.push({ kind: 'typing', side: typingAt.side || 'in', h: 74, k: 1 });
  for (let i = msgs.length - 1; i >= 0; i--) {
    const m = msgs[i]; const k = E.back(prog(t, m.at || 0, (m.at || 0) + .3));
    let h, lines = null;
    if (m.kind === 'photo') h = 420; else if (m.kind === 'voice') h = 110; else if (m.kind === 'stamp') h = 40; else { lines = wrap(c, m.text, maxW - pad * 2, font); h = lines.length * lh + pad * 1.6; }
    items.push({ m, h, lines, k, side: m.side || 'in' });
  }
  for (const it of items) {
    y -= it.h; const isOut = it.side === 'out';
    let bw;
    if (it.m && it.m.kind === 'stamp') { c.save(); c.globalAlpha = clamp(it.k * 1.3); txt(c, it.m.text, sx + sw / 2, y + 28, '600 22px Mont', it.m.red ? '#ff6a6a' : '#8d8d99'); c.restore(); y -= 18; continue; }
    if (it.kind === 'typing') bw = 130; else if (it.m.kind === 'photo') bw = sw * .6; else if (it.m.kind === 'voice') bw = sw * .62;
    else { c.font = font; bw = Math.max(...it.lines.map(l => c.measureText(l).width)) + pad * 2; }
    const bx = isOut ? sx + sw - 30 - bw : sx + 30;
    c.save(); const ox = isOut ? bx + bw : bx, oy = y + it.h;
    c.translate(ox, oy); c.scale(lerp(.6, 1, it.k), lerp(.6, 1, it.k)); c.translate(-ox, -oy); c.globalAlpha = clamp(it.k * 1.3);
    const red = it.m && it.m.red;
    if (red) glow(c, 'rgba(255,40,40,.6)', 30);
    rr(c, bx, y, bw, it.h, 30); c.fillStyle = isOut ? '#2a6df4' : (red ? '#3a0c0e' : '#26262d'); c.fill(); noGlow(c);
    if (red) { c.lineWidth = 3; c.strokeStyle = 'rgba(255,60,60,.85)'; c.stroke(); }
    if (it.kind === 'typing') {
      for (let d = 0; d < 3; d++) { const a = .35 + .65 * Math.max(0, Math.sin(t * 7 - d * .9)); c.beginPath(); c.arc(bx + 38 + d * 28, y + 37, 9, 0, 7); c.fillStyle = `rgba(200,200,210,${a})`; c.fill(); }
    } else if (it.m.kind === 'photo') {
      c.save(); rr(c, bx + 12, y + 12, bw - 24, it.h - 24, 22); c.clip();
      drawPhoto(c, bx + 12, y + 12, bw - 24, it.h - 24, t, it.m.photo || {}); c.restore();
    } else if (it.m.kind === 'voice') {
      c.beginPath(); c.arc(bx + 55, y + 55, 30, 0, 7); c.fillStyle = 'rgba(255,255,255,.15)'; c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(bx + 46, y + 40); c.lineTo(bx + 70, y + 55); c.lineTo(bx + 46, y + 70); c.fill();
      const play = it.m.play != null ? prog(t, it.m.play, it.m.play + (it.m.len || 3)) : 0;
      for (let b = 0; b < 26; b++) {
        const hh = 10 + 34 * Math.abs(Math.sin(b * 1.7) * Math.cos(b * .6));
        c.fillStyle = b / 26 < play ? C.red : 'rgba(255,255,255,.55)'; rr(c, bx + 105 + b * 13, y + 55 - hh / 2, 7, hh, 3); c.fill();
      }
      txt(c, it.m.text || '0:07', bx + bw - 26, y + 98, '500 22px Mont', 'rgba(255,255,255,.7)', 'right');
    } else {
      it.lines.forEach((l, i) => txt(c, l, bx + pad, y + pad * .8 + lh * (i + .75), font, '#f0f0f4', 'left'));
    }
    c.restore();
    y -= 18;
  }
  // Eingabeleiste
  rr(c, sx + 28, sy + sh - 120, sw - 56, 72, 36); c.fillStyle = '#1b1b21'; c.fill();
  txt(c, U('message'), sx + 64, sy + sh - 74, '500 28px Mont', '#6f6f7a', 'left');
}

// ---------- Foto-Motive ----------
function drawPhoto(c, x, y, w, h, t, p) {
  c.save(); c.translate(x, y);
  c.fillStyle = '#1a0405'; c.fillRect(0, 0, w, h);
  const kind = p.kind || 'sleeping';
  if (kind === 'sleeping') { // Bett von oben aus der Zimmerecke
    c.save(); c.translate(w * .5, h * .55); c.rotate(-.35);
    rr(c, -w * .28, -h * .36, w * .56, h * .72, 18); c.fillStyle = '#5a1316'; c.fill();
    rr(c, -w * .22, -h * .32, w * .44, h * .14, 14); c.fillStyle = '#8a2a2c'; c.fill();
    rr(c, -w * .26, -h * .06, w * .52, h * .4, 14); c.fillStyle = '#771a1d'; c.fill();
    c.beginPath(); c.arc(0, -h * .2, w * .07, 0, 7); c.fillStyle = '#e6b3b3'; c.fill();
    c.strokeStyle = '#3a0607'; c.lineWidth = 3; c.beginPath(); c.arc(-w * .025, -h * .2, w * .015, .1, Math.PI - .1); c.stroke(); c.beginPath(); c.arc(w * .025, -h * .2, w * .015, .1, Math.PI - .1); c.stroke();
    c.restore();
  } else if (kind === 'back') { // du von hinten, an der Tür
    c.fillStyle = '#2a0809'; c.fillRect(w * .25, h * .1, w * .5, h * .9);
    stick(c, w * .5, h * 1.02, h * .8, 'stand', t, { color: '#e9b9b9' });
  } else if (kind === 'room_empty') {
    c.fillStyle = '#2a0809'; c.fillRect(0, h * .65, w, h * .35);
    rr(c, w * .1, h * .45, w * .5, h * .25, 10); c.fillStyle = '#5a1316'; c.fill();
  } else if (kind === 'window_face') {
    c.fillStyle = '#120203'; c.fillRect(w * .15, h * .1, w * .7, h * .8);
    shade(c, w * .5, h * 1.1, h * .9, t, { eyes: .95 });
  }
  // rote Tönung + Zeitstempel
  c.fillStyle = 'rgba(255,0,0,.08)'; c.fillRect(0, 0, w, h);
  if (p.stamp) txt(c, p.stamp, w - 16, h - 16, '700 22px SMono', 'rgba(255,90,90,.9)', 'right');
  c.restore();
}

// ---------- Szenen ----------
// Jede Szene: (c, lt = lokale Zeit in s, b = Beat, gt = globale Zeit)
const SCENES = {};

SCENES.bedroom = (c, lt, b, gt) => {
  const p = b.p || {};
  bgFill(c, '#111116', '#060607');
  c.translate(0, p.dy != null ? p.dy : -150);
  const FY = 1380; // Boden
  c.fillStyle = '#141419'; c.fillRect(-100, -100, W + 200, FY + 100);
  c.fillStyle = '#0b0b0e'; c.fillRect(-100, FY, W + 200, 900);
  c.strokeStyle = '#25252c'; c.lineWidth = 4; c.beginPath(); c.moveTo(-100, FY); c.lineTo(W + 100, FY); c.stroke();
  // Fenster
  const wx = 610, wy = 420, ww = 340, wh = 460;
  rr(c, wx, wy, ww, wh, 8); c.fillStyle = '#07070a'; c.fill();
  for (let i = 0; i < 9; i++) { const bx = wx + 22 + (i % 3) * 104, by = wy + 250 + Math.floor(i / 3) * 66; c.fillStyle = (p.cityLit && hash(i) > .6) ? 'rgba(255,60,60,.5)' : '#121217'; c.fillRect(bx, by, 62, 36); }
  if (p.windowRed) { c.save(); c.globalAlpha = .6 + .4 * flicker(gt, 5); spot(c, wx + ww / 2, wy + wh / 2, 380, RED, .4); c.restore(); }
  c.lineWidth = 14; c.strokeStyle = '#2a2a32'; rr(c, wx, wy, ww, wh, 8); c.stroke();
  c.beginPath(); c.moveTo(wx + ww / 2, wy); c.lineTo(wx + ww / 2, wy + wh); c.moveTo(wx, wy + wh / 2); c.lineTo(wx + ww, wy + wh / 2); c.lineWidth = 10; c.stroke();
  if (p.ceilingCrib) { // gestrichelter Umriss des Kinderbetts im Stock darüber
    const a = typeof p.ceilingCrib === 'number' ? clamp(prog(lt, p.ceilingCrib, p.ceilingCrib + .8)) : 1;
    c.save(); c.globalAlpha = .75 * a; c.setLineDash([16, 12]); c.strokeStyle = '#e8e8ee'; c.lineWidth = 5;
    c.strokeRect(330, 60, 340, 150); for (let k = 1; k < 9; k++) { c.beginPath(); c.moveTo(330 + k * 38, 60); c.lineTo(330 + k * 38, 210); c.stroke(); }
    c.setLineDash([]); c.beginPath(); c.arc(430, 160, 26, 0, 7); c.stroke();
    c.strokeStyle = 'rgba(232,232,238,.4)'; c.beginPath(); c.moveTo(-100, 250); c.lineTo(W + 100, 250); c.stroke();
    if (p.ceilingLabel) txt(c, p.ceilingLabel, 500, 40, '700 26px SMono', 'rgba(232,232,238,.85)', 'center', 'alphabetic', 4);
    c.restore(); }
  if (p.roomCam) { c.fillStyle = '#2e2e36'; rr(c, 960, 300, 70, 44, 10); c.fill(); c.fillStyle = (gt % 1.2) < .6 ? '#ff2b2b' : '#4a0a0a'; c.beginPath(); c.arc(1012, 322, 7, 0, 7); c.fill(); }
  // Bild an der Wand
  c.strokeStyle = '#2c2c34'; c.lineWidth = 8; c.strokeRect(120, 470, 250, 180);
  c.beginPath(); c.moveTo(140, 620); c.lineTo(215, 545); c.lineTo(265, 595); c.lineTo(305, 555); c.lineTo(350, 620); c.lineWidth = 5; c.stroke();
  if (p.breath) { // Atemlinien aus dem Nachbarzimmer (links)
    c.save(); c.lineWidth = 8; c.lineCap = 'round';
    for (let k = 0; k < 4; k++) { const ph = ((gt * .35 + k / 4) % 1); const r = 80 + ph * 520; c.strokeStyle = `rgba(255,50,50,${.55 * (1 - ph) * (.6 + .4 * Math.sin(gt * 2.4))})`; glow(c, 'rgba(255,40,40,.8)', 20);
      c.beginPath(); c.arc(-60, 820, r, -.55, .55); c.stroke(); }
    noGlow(c); c.restore();
  }
  // Schatten in der Ecke (hinter dem Bett)
  if (p.shadowInDoor != null) { c.save(); c.globalAlpha = clamp(prog(lt, p.shadowInDoor, p.shadowInDoor + 1.5)); shade(c, 520, FY, 980, gt, { eyes: .9 }); c.restore(); }
  // Bett
  rr(c, 60, 1040, 60, 360, 14); c.fillStyle = '#2b2b33'; c.fill();
  rr(c, 60, 1220, 800, 120, 18); c.fillStyle = '#22222a'; c.fill();
  c.fillStyle = '#1b1b21'; c.fillRect(90, 1330, 30, 60); c.fillRect(800, 1330, 30, 60);
  rr(c, 135, 1165, 210, 80, 34); c.fillStyle = '#3a3a44'; c.fill(); // Kissen
  // Nachttisch + Handy
  rr(c, 885, 1225, 160, 155, 10); c.fillStyle = '#1d1d23'; c.fill();
  const buzz = (p.buzz || []).some(bt => lt > bt && lt < bt + 1.2) ? noise(gt * 80, 2) * 5 : 0;
  const phoneOnTable = !(p.pose === 'sitting' && p.lookPhone) && !p.monitorOnStand;
  if (p.monitorOnStand) { // kleines Babyphone mit leuchtendem Bildschirm
    c.save(); c.translate(965, 1150); rr(c, -52, -70, 104, 140, 18); c.fillStyle = '#dcdade'; glow(c, 'rgba(200,200,210,.5)', 30); c.fill(); noGlow(c);
    rr(c, -40, -58, 80, 70, 8); c.fillStyle = '#5a5a62'; glow(c, 'rgba(220,220,230,.8)', 25); c.fill(); noGlow(c);
    c.fillStyle = '#4dff7a'; c.beginPath(); c.arc(30, 50, 5, 0, 7); c.fill(); c.restore(); spot(c, 965, 1110, 220, WHITEA, .12); }
  if (p.shapeBehind && lt >= (p.shapeBehind.at || 0)) { const q = p.shapeBehind;
    c.save(); c.globalAlpha = (q.alpha != null ? q.alpha : 1) * clamp(prog(lt, q.at || 0, (q.at || 0) + (q.fade || .4)));
    shapeEntity(c, q.x || 420, q.y || 1300, q.h || 1100, gt, { pose: q.pose || 'hunch', flip: q.flip != null ? q.flip : true, eyes: q.eyes != null && lt >= q.eyes ? clamp(prog(lt, q.eyes, q.eyes + .4)) : 0 });
    c.restore(); }
  if (phoneOnTable) {
    if (p.phoneGlow) spot(c, 965 + buzz, 1215, 280, RED, .55);
    c.save(); c.translate(950 + buzz, 1212); c.rotate(-.12); rr(c, -46, -14, 92, 26, 7); c.fillStyle = '#16161b'; c.fill();
    rr(c, -40, -10, 80, 18, 5); c.fillStyle = p.phoneGlow ? '#ff4a4a' : '#2c2c34'; if (p.phoneGlow) glow(c, 'rgba(255,40,40,.9)', 30); c.fill(); noGlow(c); c.restore();
  }
  const pose = p.pose || 'lying';
  const blanket = () => { rr(c, 330, 1190, 520, 100, 30); c.fillStyle = '#30303a'; c.fill(); c.strokeStyle = '#3a3a45'; c.lineWidth = 4; c.stroke(); };
  if (pose === 'lying') {
    const br = Math.sin(gt * 1.6) * 3;
    c.beginPath(); c.arc(250, 1170 - br * .3, 48, 0, 7); c.fillStyle = C.white; c.fill();
    if (p.eyesOpen) { c.fillStyle = '#16161a'; c.beginPath(); c.arc(236, 1162, 7, 0, 7); c.arc(266, 1162, 7, 0, 7); c.fill(); }
    rr(c, 300, 1185 - br, 550, 100 + br, 34); c.fillStyle = '#30303a'; c.fill(); c.strokeStyle = '#3a3a45'; c.lineWidth = 4; c.stroke();
  } else if (pose === 'sitting') {
    const h = 560, base = 1235 + .44 * h;
    const P = { ...BASE, lk: [.3, -.44], lf: [.6, -.44], rk: [.32, -.43], rf: [.62, -.43], le: [.1, -.62], lh: [.24, -.5], re: [.12, -.64], rh: [.26, -.52] };
    if (p.listen) { P.head = [-.035, -.9]; }
    if (p.lookPhone) { P.re = [.16, -.66]; P.rh = [.14, -.8]; P.le = [.13, -.64]; P.lh = [.11, -.79]; }
    const st = stick(c, 260, base, h, P, gt, { tremble: p.tremble, hood: p.hood });
    blanket();
    if (p.lookPhone) {
      const bz = (p.buzz || []).some(bt => lt > bt && lt < bt + 1.2) ? noise(gt * 80, 2) * 4 : 0;
      spot(c, st.hand[0], st.hand[1], 300, RED, .5);
      glow(c, 'rgba(255,40,40,.9)', 40); rr(c, st.hand[0] - 10 + bz, st.hand[1] - 50, 40, 70, 7); c.fillStyle = '#ff4040'; c.fill(); noGlow(c);
    }
  } else if (pose === 'standing') {
    blanket();
    stick(c, p.figX || 600, 1640, 640, p.figPose || 'phone', gt, { tremble: p.tremble });
  }
};

SCENES.phone_lock = (c, lt, b, gt) => {
  const p = b.p || {};
  bgFill(c, '#0b0b0e', '#040405'); spot(c, 540, 1000, 700, RED, .18);
  const fl = noise(gt * .6, 4) * .02;
  const buzz = (p.buzz || []).some(bt => lt > bt && lt < bt + .9) ? noise(gt * 90, 7) * 7 : 0;
  phoneBody(c, 540 + buzz, 900 + Math.sin(lt * 1.3) * 8, 640, 1300, -.05 + fl, (cc, sx, sy, sw, sh) => lockScreen(cc, sx, sy, sw, sh, lt, p));
  if (p.hand === true) { c.save(); c.strokeStyle = C.white; c.lineCap = 'round'; c.lineWidth = 60; c.beginPath(); c.moveTo(-60, 1800); c.lineTo(110, 1450 - Math.sin(lt * 1.3) * 8); c.stroke(); c.restore(); }
};

SCENES.phone_chat = (c, lt, b, gt) => {
  const p = b.p || {};
  bgFill(c, '#0b0b0e', '#040405'); spot(c, 540, 900, 760, RED, .14);
  const buzz = (p.messages || []).some(m => m.side !== 'out' && lt > (m.at || 0) && lt < (m.at || 0) + .5) ? noise(gt * 90, 7) * 6 : 0;
  phoneBody(c, 540 + buzz, 900 + Math.sin(lt * 1.2) * 8, 580, 1160, .03 + noise(gt * .5, 8) * .015, (cc, sx, sy, sw, sh) => chatScreen(cc, sx, sy, sw, sh, lt, p));
};

SCENES.building_facade = (c, lt, b, gt) => {
  const p = b.p || {};
  bgFill(c, '#0a0a0d', '#050506');
  const cols = 6, rows = 11, ww = 120, wh = 150, gx = 46, gy = 40, x0 = (W - (cols * ww + (cols - 1) * gx)) / 2, y0 = 120;
  c.fillStyle = '#121216'; c.fillRect(x0 - 60, 0, cols * ww + (cols - 1) * gx + 120, H);
  const lit = p.lit; // {col,row,on,off,figure}
  for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
    const x = x0 + q * (ww + gx), y = y0 + r * (wh + gy);
    const isLit = lit && lit.col === q && lit.row === r && lt >= (lit.on || 0) && (lit.off == null || lt < lit.off);
    rr(c, x - 8, y - 8, ww + 16, wh + 16, 4); c.fillStyle = '#1c1c22'; c.fill();
    if (isLit) {
      const f = lt < (lit.on || 0) + .5 ? flicker(gt, 3, 30) : 1;
      glow(c, 'rgba(255,30,30,.9)', 60 * f); c.fillStyle = `rgba(255,${40 * f},${40 * f},${.9 * f})`; c.fillRect(x, y, ww, wh); noGlow(c);
      if (lit.figure) { c.save(); c.beginPath(); c.rect(x, y, ww, wh); c.clip(); stick(c, x + ww * .5, y + wh * 1.05, wh * .95, lit.pose || 'stand', gt, { color: '#1a0203', lw: 6 }); c.restore(); }
      c.fillStyle = '#1c1c22'; c.fillRect(x + ww / 2 - 4, y, 8, wh); c.fillRect(x, y + wh * .4 - 4, ww, 8);
    } else {
      const g = c.createLinearGradient(x, y, x + ww, y + wh); g.addColorStop(0, '#0e0e12'); g.addColorStop(1, '#16161b'); c.fillStyle = g; c.fillRect(x, y, ww, wh);
      c.fillStyle = '#1c1c22'; c.fillRect(x + ww / 2 - 4, y, 8, wh); c.fillRect(x, y + wh * .4 - 4, ww, 8);
      if (p.others && hash(r * 13 + q * 7) > .93) { c.fillStyle = 'rgba(255,40,40,.12)'; c.fillRect(x, y, ww, wh); }
    }
  }
  if (lit && lt >= (lit.on || 0) && (lit.off == null || lt < lit.off)) {
    const x = x0 + lit.col * (ww + gx) + ww / 2, y = y0 + lit.row * (wh + gy) + wh / 2; spot(c, x, y, 420, RED, .3);
  }
};

SCENES.street_lamp = (c, lt, b, gt) => {
  const p = b.p || {};
  bgFill(c, '#08080b', '#0c0c10');
  // Straße (leicht von oben)
  c.fillStyle = '#101014'; c.fillRect(-100, 1150, W + 200, 900);
  c.fillStyle = '#16161b'; c.fillRect(-100, 1080, W + 200, 80);
  c.strokeStyle = '#2a2a31'; c.lineWidth = 10; c.setLineDash([80, 60]); c.beginPath(); c.moveTo(-100, 1560); c.lineTo(W + 100, 1560); c.stroke(); c.setLineDash([]);
  // Häuserkante hinten
  c.fillStyle = '#0d0d11'; for (let i = 0; i < 6; i++) c.fillRect(i * 200 - 40, 300 + hash(i) * 200, 180, 800);
  for (let i = 0; i < 30; i++) { c.fillStyle = '#16161c'; c.fillRect((i % 6) * 200 - 10 + (i % 2) * 70, 360 + Math.floor(i / 6) * 140 + hash(i) * 40, 40, 60); }
  const lx = p.lampX || 540, on = p.on != null ? p.on : 0;
  const isOn = lt >= on, f = lt < on + .7 ? flicker(gt, 11, 25) : 1;
  c.strokeStyle = '#2d2d35'; c.lineWidth = 16; c.beginPath(); c.moveTo(lx, 1250); c.lineTo(lx, 420); c.quadraticCurveTo(lx, 380, lx - 40, 380); c.stroke();
  rr(c, lx - 90, 368, 70, 26, 8); c.fillStyle = isOn ? '#ff5050' : '#2d2d35'; if (isOn) glow(c, 'rgba(255,40,40,1)', 40 * f); c.fill(); noGlow(c);
  if (isOn) {
    c.save(); c.globalAlpha = .85 * f;
    const g = c.createLinearGradient(0, 390, 0, 1350); g.addColorStop(0, 'rgba(255,40,40,.75)'); g.addColorStop(1, 'rgba(255,40,40,.05)');
    c.fillStyle = g; c.beginPath(); c.moveTo(lx - 80, 392); c.lineTo(lx - 30, 392); c.lineTo(lx + 230, 1330); c.lineTo(lx - 340, 1330); c.closePath(); c.fill();
    c.beginPath(); c.ellipse(lx - 55, 1300, 300, 60, 0, 0, 7); c.fillStyle = 'rgba(255,40,40,.35)'; c.fill();
    c.restore();
  }
  if (p.figure && lt >= (p.figure.at || 0)) {
    const a = clamp(prog(lt, p.figure.at || 0, (p.figure.at || 0) + .25));
    c.save(); c.globalAlpha = a * (isOn ? f : .3);
    shade(c, lx - 60, 1310, p.figure.h || 560, gt, { color: '#050506', eyes: p.figure.eyes != null && lt > p.figure.eyes ? clamp(prog(lt, p.figure.eyes, p.figure.eyes + .4)) : 0, look: 0 });
    c.restore();
  }
};

SCENES.door_inside = (c, lt, b, gt) => {
  const p = b.p || {};
  bgFill(c, '#0f0f13', '#060607');
  const knock = (p.knocks || []).reduce((s, k) => s + (lt > k && lt < k + .18 ? Math.sin((lt - k) * 120) * (1 - (lt - k) / .18) * 7 : 0), 0);
  const dx = 290 + knock, dy = 260, dw = 500, dh = 1080;
  // Wand
  c.fillStyle = '#121217'; c.fillRect(-100, 0, W + 200, dy + dh);
  // Boden (Perspektive)
  c.fillStyle = '#0a0a0d'; c.fillRect(-100, dy + dh, W + 200, 900);
  // Licht unter der Tür
  if (p.light !== false) {
    const la = p.lightOn != null ? clamp(prog(lt, p.lightOn, p.lightOn + .3)) : 1;
    const fl = .85 + .15 * noise(gt * 6, 3);
    c.save(); c.globalAlpha = la * fl;
    const g = c.createLinearGradient(0, dy + dh, 0, H); g.addColorStop(0, 'rgba(255,30,30,.85)'); g.addColorStop(1, 'rgba(255,30,30,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(dx + 20, dy + dh); c.lineTo(dx + dw - 20, dy + dh); c.lineTo(dx + dw + 330, H); c.lineTo(dx - 330, H); c.closePath(); c.fill();
    glow(c, 'rgba(255,30,30,1)', 30); c.fillStyle = '#ff3a3a'; c.fillRect(dx + 10, dy + dh - 6, dw - 20, 10); noGlow(c);
    // Fußschatten
    if (p.feet && lt >= (p.feetAt || 0)) {
      const fa = clamp(prog(lt, p.feetAt || 0, (p.feetAt || 0) + .4));
      c.globalAlpha = la * fa;
      for (const fx of [dx + dw * .36, dx + dw * .6]) {
        c.fillStyle = '#050506'; c.fillRect(fx - 32, dy + dh - 8, 64, 14);
        c.beginPath(); c.moveTo(fx - 32, dy + dh + 4); c.lineTo(fx + 32, dy + dh + 4); c.lineTo(fx + 32 + (fx - 540) * .9 + 40, H); c.lineTo(fx - 32 + (fx - 540) * .9 - 40, H); c.closePath(); c.fillStyle = 'rgba(5,5,6,.92)'; c.fill();
      }
    }
    c.restore();
  }
  // Tür
  c.fillStyle = '#1b1b21'; c.fillRect(dx - 30, dy - 30, dw + 60, dh + 30);
  const dg = c.createLinearGradient(dx, 0, dx + dw, 0); dg.addColorStop(0, '#1e1e25'); dg.addColorStop(1, '#17171c');
  c.fillStyle = dg; c.fillRect(dx, dy, dw, dh);
  c.strokeStyle = '#26262e'; c.lineWidth = 6; c.strokeRect(dx + 60, dy + 70, dw - 120, 380); c.strokeRect(dx + 60, dy + 520, dw - 120, 470);
  // Spion
  c.beginPath(); c.arc(dx + dw / 2, dy + 300, 14, 0, 7); c.fillStyle = '#0a0a0c'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#3a3a44'; c.stroke();
  if (p.peepLight) { c.beginPath(); c.arc(dx + dw / 2, dy + 300, 8, 0, 7); c.fillStyle = '#ff5050'; glow(c, 'rgba(255,40,40,1)', 20); c.fill(); noGlow(c); }
  // Klinke
  let hd = p.handle != null ? (lt > p.handle ? Math.sin(clamp((lt - p.handle) / .5) * Math.PI) * .5 + (lt > p.handle + .5 && lt < p.handle + 1.4 ? Math.abs(Math.sin((lt - p.handle) * 18)) * .25 : 0) : 0) : 0;
  if (p.rattle && lt > p.rattle[0]) { const u = lt - p.rattle[0], d = p.rattle[1] || 1.6; hd = u < d ? .25 + .25 * Math.abs(Math.sin(u * 11)) : .55; }
  c.save(); c.translate(dx + dw - 70, dy + 560); c.rotate(hd);
  rr(c, -16, -30, 32, 60, 10); c.fillStyle = '#3a3a44'; c.fill();
  c.strokeStyle = '#4a4a55'; c.lineWidth = 18; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(-90, 0); c.stroke(); c.restore();
  // Kette
  if (p.chain) { c.strokeStyle = '#4a4a55'; c.lineWidth = 6; c.beginPath(); c.moveTo(dx + dw - 30, dy + 420); c.quadraticCurveTo(dx + dw - 90, dy + 470, dx + dw - 150, dy + 430); c.stroke(); }
  if (p.whisper && lt >= (p.whisper.at || 0)) {
    const s = p.whisper.text, k = prog(lt, p.whisper.at || 0, (p.whisper.at || 0) + (p.whisper.dur || 1.2));
    const n = Math.floor(s.length * k); c.save(); glow(c, 'rgba(255,30,30,1)', 30);
    c.font = 'italic 600 60px Mont'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const wy = p.whisper.y || (dy + 820);
    const full = c.measureText(s).width; let x = 540 - full / 2;
    for (let i = 0; i < n; i++) { const ch = s[i]; const w = c.measureText(ch).width; c.globalAlpha = clamp((k * s.length - i) / 3) * (.75 + .25 * noise(gt * 8, i));
      c.fillStyle = 'rgba(255,225,225,.85)'; c.fillText(ch, x + w / 2, wy + Math.sin(gt * 3 + i * .5) * 10); x += w; }
    noGlow(c); c.restore();
  }
  if (p.figure) { // Strichfigur davor, Rückenansicht
    stick(c, p.figure.x || 820, 1640, 640, p.figure.pose || 'listen', gt, { tremble: true });
  }
};

SCENES.peephole = (c, lt, b, gt) => {
  const p = b.p || {};
  c.fillStyle = '#000'; c.fillRect(-200, -200, W + 400, H + 400);
  // Treppenhaus in Offscreen zeichnen
  const o = tctx; o.save(); o.setTransform(1, 0, 0, 1, 0, 0);
  o.fillStyle = '#0d0b0c'; o.fillRect(0, 0, W, H);
  const fl = p.lamp === 'flicker' ? flicker(gt, 21, 9) : 1;
  o.fillStyle = '#171214'; o.fillRect(140, 380, 800, 1160); // Rückwand
  o.fillStyle = '#100c0d'; o.beginPath(); o.moveTo(0, 0); o.lineTo(140, 380); o.lineTo(140, 1540); o.lineTo(0, H); o.fill();
  o.beginPath(); o.moveTo(W, 0); o.lineTo(940, 380); o.lineTo(940, 1540); o.lineTo(W, H); o.fill();
  o.fillStyle = '#0a0809'; o.beginPath(); o.moveTo(0, H); o.lineTo(140, 1540); o.lineTo(940, 1540); o.lineTo(W, H); o.fill();
  o.fillStyle = '#1e1719'; o.fillRect(380, 700, 320, 840); // Tür gegenüber
  o.strokeStyle = '#2a2124'; o.lineWidth = 8; o.strokeRect(380, 700, 320, 840);
  o.fillStyle = '#2a2124'; o.fillRect(470, 610, 140, 50); // Wohnungsnummer
  o.fillStyle = '#5a4549'; o.font = '700 34px SMono'; o.textAlign = 'center'; o.fillText(p.number || '4B', 540, 648);
  // Treppengeländer
  o.strokeStyle = '#231b1d'; o.lineWidth = 12; o.beginPath(); o.moveTo(140, 1200); o.lineTo(360, 1000); o.stroke();
  // Lampe
  o.globalAlpha = fl; const lg = o.createRadialGradient(540, 420, 0, 540, 420, 700); lg.addColorStop(0, 'rgba(255,60,60,.45)'); lg.addColorStop(1, 'rgba(255,60,60,0)'); o.fillStyle = lg; o.fillRect(0, 0, W, H); o.globalAlpha = 1;
  o.fillStyle = fl > .5 ? '#ff6a6a' : '#3a2a2c'; o.fillRect(500, 380, 80, 18);
  let fig = p.figure || 'none';
  if (p.eyeAt != null && lt >= p.eyeAt) fig = 'eye';
  const fa = p.eyeAt != null && lt >= p.eyeAt ? 1 : (p.figureAt != null ? clamp(prog(lt, p.figureAt, p.figureAt + .15)) : 1);
  o.globalAlpha = fa;
  if (fig === 'stand') { shade(o, 540, 1560, 1050, gt, { color: '#050404', eyes: p.eyes ? 1 : 0 }); }
  else if (fig === 'close') { shade(o, 540, 2300, 2100, gt, { color: '#040303', eyes: p.eyes ? 1 : 0 }); }
  else if (fig === 'person') { stick(o, 540, 1620, 1100, p.pose || 'stand', gt, { color: '#d9c4c6', grin: p.grin ? '#3a0507' : null, eyes: p.grin ? '#3a0507' : null }); }
  else if (fig === 'mama') {
    const P = { ...BASE, head: [.025, -.9] };
    const st = mama(o, p.mama || 'coat', 540, p.figY || 1900, p.figH || 1350, P, 0, { color: '#e2d2d4', face: 'stare', smile: p.smile != null ? p.smile : .9, faceColor: '#1a0304' });
    if (p.hands != null && lt >= p.hands) { const h = p.figH || 1350, y0 = p.figY || 1900, k = .6 + .4 * Math.sin(gt * 5);
      for (const sd of [-1, 1]) { const hx = 540 + sd * .12 * h, hy = y0 - .46 * h;
        o.save(); o.translate(hx, hy + 30); glow(o, `rgba(255,40,40,${k})`, 45); o.fillStyle = '#e2d2d4';
        o.beginPath(); o.ellipse(0, 0, 42, 52, 0, 0, 7); o.fill();
        o.strokeStyle = '#e2d2d4'; o.lineCap = 'round'; o.lineWidth = 16;
        for (let f = 0; f < 4; f++) { const fx = -27 + f * 18; o.beginPath(); o.moveTo(fx, 20); o.lineTo(fx + sd * 2, 78 + (f === 0 || f === 3 ? -8 : 0)); o.stroke(); }
        o.beginPath(); o.moveTo(sd * -38, -5); o.lineTo(sd * -66, 26); o.stroke();
        noGlow(o); o.restore(); } }
  }
  else if (fig === 'grin') {
    o.fillStyle = '#d9c4c6'; o.beginPath(); o.arc(540, 980, 380, 0, 7); o.fill();
    o.fillStyle = '#1a0304'; o.beginPath(); o.ellipse(400, 900, 40, 55, 0, 0, 7); o.ellipse(680, 900, 40, 55, 0, 0, 7); o.fill();
    o.strokeStyle = '#1a0304'; o.lineWidth = 22; o.lineCap = 'round'; o.beginPath(); o.arc(540, 1000, 220, .12 * Math.PI, .88 * Math.PI); o.stroke();
  } else if (fig === 'eye') {
    o.fillStyle = '#e8dfe0'; o.beginPath(); o.ellipse(540, 960, 520, 300, 0, 0, 7); o.fill();
    const look = noise(gt * 2, 4) * 40;
    o.fillStyle = '#5a0a0c'; o.beginPath(); o.arc(540 + look, 960, 200, 0, 7); o.fill(); o.fillStyle = '#000'; o.beginPath(); o.arc(540 + look, 960, 90, 0, 7); o.fill();
    o.fillStyle = '#fff'; o.beginPath(); o.arc(590 + look, 900, 26, 0, 7); o.fill();
  } else if (fig === 'dark') { o.fillStyle = '#000'; o.fillRect(0, 0, W, H); }
  o.globalAlpha = 1; o.restore();
  // Fischaugen-Effekt: konzentrische Ringe unterschiedlich skaliert
  const cx = 540, cy = 900, R = 470;
  for (let i = 24; i >= 1; i--) {
    const r = R * i / 24, s = 1.15 + .55 * Math.pow(1 - i / 24, 1.6);
    c.save(); c.beginPath(); c.arc(cx, cy, r, 0, 7); c.clip();
    c.translate(cx, cy); c.scale(s * .62, s * .62); c.translate(-W / 2, -H / 2); c.drawImage(tmp, 0, 0); c.restore();
  }
  const vg = c.createRadialGradient(cx, cy, R * .55, cx, cy, R); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.95)');
  c.fillStyle = vg; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
  c.strokeStyle = '#1a1a1f'; c.lineWidth = 30; c.beginPath(); c.arc(cx, cy, R + 12, 0, 7); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 10; c.beginPath(); c.arc(cx, cy, R - 40, 3.6, 4.4); c.stroke();
  if (false) { // Banner jetzt als Overlay (OVERLAYS.typing)
    const k = E.back(prog(lt, p.typing, p.typing + .35));
    c.save(); c.globalAlpha = clamp(k * 1.3); c.translate(0, lerp(-80, 0, k));
    glow(c, 'rgba(255,40,40,.7)', 30); rr(c, 140, 1440, 800, 120, 36); c.fillStyle = 'rgba(32,32,40,.96)'; c.fill(); noGlow(c);
    c.lineWidth = 3; c.strokeStyle = 'rgba(255,60,60,.8)'; c.stroke();
    rr(c, 170, 1465, 70, 70, 18); c.fillStyle = C.red; c.fill(); rr(c, 185, 1483, 40, 30, 10); c.fillStyle = '#fff'; c.fill();
    txt(c, p.typingText || U('typing'), 265, 1512, '700 36px Mont', '#fff', 'left');
    for (let d = 0; d < 3; d++) { const a = .3 + .7 * Math.max(0, Math.sin(gt * 7 - d * .9)); c.beginPath(); c.arc(770 + d * 34, 1500, 10, 0, 7); c.fillStyle = `rgba(255,90,90,${a})`; c.fill(); }
    c.restore();
  }
};

SCENES.hallway = (c, lt, b, gt) => {
  const p = b.p || {};
  bgFill(c, '#0b0b0e', '#050506');
  const vx = 540, vy = 860, fw = 220, fh = 330; // Fluchtrechteck
  const fl = p.flicker ? flicker(gt, 17, 8) : 1;
  c.fillStyle = '#17171c'; c.beginPath(); c.moveTo(0, 0); c.lineTo(vx - fw / 2, vy - fh / 2); c.lineTo(vx - fw / 2, vy + fh / 2); c.lineTo(0, H); c.fill();
  c.beginPath(); c.moveTo(W, 0); c.lineTo(vx + fw / 2, vy - fh / 2); c.lineTo(vx + fw / 2, vy + fh / 2); c.lineTo(W, H); c.fill();
  c.fillStyle = '#111115'; c.beginPath(); c.moveTo(0, 0); c.lineTo(W, 0); c.lineTo(vx + fw / 2, vy - fh / 2); c.lineTo(vx - fw / 2, vy - fh / 2); c.fill();
  c.fillStyle = '#0f0f13'; c.beginPath(); c.moveTo(0, H); c.lineTo(W, H); c.lineTo(vx + fw / 2, vy + fh / 2); c.lineTo(vx - fw / 2, vy + fh / 2); c.fill();
  c.fillStyle = '#2a0809'; c.fillRect(vx - fw / 2, vy - fh / 2, fw, fh); c.save(); c.beginPath(); c.rect(vx - fw / 2, vy - fh / 2, fw, fh); c.clip(); spot(c, vx, vy + 40, 260, RED, .55 * fl); c.restore();
  // Türen an den Seiten
  c.strokeStyle = '#2a2a33'; c.lineWidth = 6;
  for (const [a, k] of [[.18, 1], [.45, 1], [.68, 1]]) {
    for (const side of [-1, 1]) {
      const xA = side < 0 ? lerp(0, vx - fw / 2, a) : lerp(W, vx + fw / 2, a), xB = side < 0 ? lerp(0, vx - fw / 2, a + .12) : lerp(W, vx + fw / 2, a + .12);
      const tA = lerp(0, vy - fh / 2, a), bA = lerp(H, vy + fh / 2, a), tB = lerp(0, vy - fh / 2, a + .12), bB = lerp(H, vy + fh / 2, a + .12);
      const top = (y0, y1) => lerp(y0, y1, .3);
      c.fillStyle = '#1e1e25'; c.beginPath(); c.moveTo(xA, top(tA, bA)); c.lineTo(xB, top(tB, bB)); c.lineTo(xB, bB); c.lineTo(xA, bA); c.closePath(); c.fill(); c.stroke();
    }
  }
  // Deckenlampe
  c.save(); c.globalAlpha = p.noLamp ? 0 : fl;
  const lg = c.createRadialGradient(vx, 520, 0, vx, 520, 900); lg.addColorStop(0, 'rgba(255,40,40,.42)'); lg.addColorStop(1, 'rgba(255,40,40,0)'); c.fillStyle = lg; c.fillRect(0, 0, W, H);
  rr(c, vx - 110, 500, 220, 26, 10); c.fillStyle = '#ff5a5a'; glow(c, 'rgba(255,40,40,1)', 40); c.fill(); noGlow(c);
  c.restore();
  if (p.figure) {
    const k = p.approach ? E.inOut(prog(lt, p.approach[0], p.approach[1])) : 0;
    const h = lerp(p.figure.h0 || 260, p.figure.h1 || 260, k), y = lerp(p.figure.y0 || vy + fh / 2, p.figure.y1 || vy + fh / 2, k);
    c.save(); c.globalAlpha = (p.figure.alpha != null ? p.figure.alpha : 1) * (p.figure.at != null ? clamp(prog(lt, p.figure.at, p.figure.at + .2)) : 1) * (p.figure.until != null && lt > p.figure.until ? 0 : 1) * (p.flicker ? (fl > .5 ? 1 : 0) : 1);
    shade(c, vx, y, h, gt, { eyes: p.figure.eyes ? 1 : 0 }); c.restore();
  }
  if (p.sideDoor != null) { // rechte hintere Tür öffnet sich, roter Lichtstreifen
    const k = E.inOut(prog(lt, p.sideDoor, p.sideDoor + 1.6));
    const a = .45, xA = lerp(W, vx + fw / 2, a), xB = lerp(W, vx + fw / 2, a + .12), tA = lerp(0, vy - fh / 2, a), bA = lerp(H, vy + fh / 2, a), tB = lerp(0, vy - fh / 2, a + .12), bB = lerp(H, vy + fh / 2, a + .12);
    const top = (y0, y1) => lerp(y0, y1, .3);
    c.save(); c.fillStyle = `rgba(255,40,40,${.85 * k})`; glow(c, 'rgba(255,40,40,1)', 40 * k);
    c.beginPath(); c.moveTo(xA, top(tA, bA)); c.lineTo(lerp(xA, xB, k), lerp(top(tA, bA), top(tB, bB), k)); c.lineTo(lerp(xA, xB, k), lerp(bA, bB, k)); c.lineTo(xA, bA); c.closePath(); c.fill(); noGlow(c);
    c.fillStyle = `rgba(255,40,40,${.35 * k})`; c.beginPath(); c.moveTo(xA, bA); c.lineTo(lerp(xA, xB, k), lerp(bA, bB, k)); c.lineTo(vx - 40, H); c.lineTo(vx + 160, H); c.closePath(); c.fill();
    c.restore();
  }
  if (p.lightBehind != null && lt >= p.lightBehind) { // Tür hinter dir geht auf: Lichtkeil vom unteren Bildrand
    const k = E.out(prog(lt, p.lightBehind, p.lightBehind + .5)), fl = .85 + .15 * noise(gt * 7, 5);
    c.save(); const g = c.createLinearGradient(0, H, 0, vy + fh / 2); g.addColorStop(0, `rgba(255,40,40,${.75 * k * fl})`); g.addColorStop(1, 'rgba(255,40,40,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(lerp(540, 60, k), H); c.lineTo(lerp(540, 1020, k), H); c.lineTo(vx + 60, vy + fh / 2); c.lineTo(vx - 60, vy + fh / 2); c.closePath(); c.fill();
    c.fillStyle = `rgba(0,0,0,${.85 * k})`; c.beginPath(); c.moveTo(470, H); c.lineTo(610, H); c.lineTo(vx + 14, vy + fh / 2 + 40); c.lineTo(vx - 14, vy + fh / 2 + 40); c.closePath(); c.fill(); // dein Schatten
    c.restore();
  }
  if (p.person) { const q = p.person; const a = q.at != null ? clamp(prog(lt, q.at, q.at + .12)) : 1;
    const fk = q.flinch != null ? E.out(prog(lt, q.flinch, q.flinch + .35)) : 0;
    c.save(); c.globalAlpha = a; const P = fk > 0 ? { ...BASE, head: [(q.tilt || .04) - .06 * fk, -.88], le: [-.13, -.68], lh: [-.03, -.83], re: [.13, -.68], rh: [.03, -.83] } : { ...BASE, head: [q.tilt || .04, -.9] };
    mama(c, q.kind || 'gown', (q.x || 540) + (q.flinchDx || 160) * fk, (q.y || 1320) - 30 * fk, (q.h || 620) * (1 - .15 * fk), P, gt, { face: q.face || 'wide', smile: q.smile || 0 }); c.restore(); }
  if (p.you) stick(c, 540, 1800, 700, 'stand', gt, { tremble: true });
  if (p.youWalk) { const q = p.youWalk, k = E.inOut(prog(lt, q.approach[0], q.approach[1]));
    const h = lerp(q.h0 || 260, q.h1 || 900, k), y = lerp(q.y0 || vy + fh / 2, q.y1 || 1900, k), step = Math.sin(lt * 7) * .06;
    const P = { ...BASE, lk: [-.05 + step, -.22], lf: [-.08 + 2 * step, 0], rk: [.05 - step, -.22], rf: [.08 - 2 * step, 0], re: [.12, -.62], rh: [.07, -.72] };
    const st = stick(c, 540, y, h, P, gt, { color: '#d9d9df', hood: true });
    glow(c, 'rgba(255,255,255,.9)', 30); c.fillStyle = '#fff'; c.fillRect(st.hand[0] - h * .02, st.hand[1] - h * .03, h * .04, h * .055); noGlow(c);
    spot(c, st.hand[0], st.hand[1] - h * .1, h * .35, WHITEA, .25); }
  if (p.youBack) { // Hinterkopf + Schultern im Vordergrund
    const turn = p.youTurn != null ? E.inOut(prog(lt, p.youTurn, p.youTurn + .6)) : 0;
    const hx = 540 + turn * 50, hy = 1330, R = 170;
    c.save(); c.fillStyle = '#0d0d10'; glow(c, 'rgba(255,40,40,.6)', 40);
    c.beginPath(); c.ellipse(540, 1830, 400, 210, 0, Math.PI, 0); c.lineTo(940, H + 50); c.lineTo(140, H + 50); c.closePath(); c.fill(); // Schultern
    c.fillRect(475, 1460, 130, 260); // Hals
    c.beginPath(); c.arc(hx, hy, R, 0, 7); c.fill();
    c.beginPath(); c.ellipse(hx - R * .98, hy + 20, 30, 50, 0, 0, 7); c.ellipse(hx + R * .98, hy + 20, 30, 50, 0, 0, 7); c.fill(); // Ohren
    for (let k = 0; k < 7; k++) { const a = -2.6 + k * .33; c.beginPath(); c.moveTo(hx + Math.cos(a) * R * .9, hy + Math.sin(a) * R * .9); c.lineTo(hx + Math.cos(a + .12) * R * 1.12, hy + Math.sin(a + .12) * R * 1.12); c.lineTo(hx + Math.cos(a + .26) * R * .9, hy + Math.sin(a + .26) * R * .9); c.fill(); } // Haarbüschel
    noGlow(c); c.strokeStyle = 'rgba(255,80,80,.7)'; c.lineWidth = 6; c.beginPath(); c.arc(hx, hy, R + 2, Math.PI * .95, Math.PI * 2.05); c.stroke();
    if (turn > .3) { c.fillStyle = 'rgba(255,90,90,.8)'; c.beginPath(); c.ellipse(hx + R * .78, hy - 10, 10, 15, 0, 0, 7); c.fill(); }
    c.restore();
  }
};

SCENES.bathroom_mirror = (c, lt, b, gt) => {
  const p = b.p || {};
  bgFill(c, '#0e0e12', '#060607');
  // Fliesen (nur im Bad)
  if (!p.noSink) { c.strokeStyle = '#17171c'; c.lineWidth = 3;
  for (let y = 0; y < H; y += 90) { c.beginPath(); c.moveTo(-100, y); c.lineTo(W + 100, y); c.stroke(); }
  for (let x = 0; x < W; x += 90) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } }
  // Lampe über Spiegel
  const fl = p.flicker ? flicker(gt, 23, 7) : 1;
  if (!p.noLamp) rr(c, 340, 250, 400, 30, 12); else c.beginPath(); c.fillStyle = fl > .5 ? '#ff5050' : '#3a2022'; if (fl > .5) glow(c, 'rgba(255,40,40,1)', 50); c.fill(); noGlow(c);
  c.save(); c.globalAlpha = fl; spot(c, 540, 300, 700, RED, .25); c.restore();
  // Spiegel
  const mx = 220, my = 330, mw = 640, mh = 820;
  rr(c, mx - 20, my - 20, mw + 40, mh + 40, 30); c.fillStyle = p.noSink ? '#4a4a56' : '#2a2a32'; c.fill();
  c.save(); rr(c, mx, my, mw, mh, 22); c.clip();
  c.fillStyle = '#0d0e12'; c.fillRect(mx, my, mw, mh);
  c.strokeStyle = '#15161b'; c.lineWidth = 3; for (let y = my; y < my + mh; y += 90) { c.beginPath(); c.moveTo(mx, y); c.lineTo(mx + mw, y); c.stroke(); }
  // Spiegelbild (Oberkörper)
  const refl = p.reflection || 'normal';
  const ry = my + mh + 260, rh = 760;
  if (p.behind && lt > (p.behindAt || 0)) { c.save(); c.globalAlpha = clamp(prog(lt, p.behindAt || 0, (p.behindAt || 0) + 1.2)); shade(c, mx + mw * .78, my + mh + 40, 900, gt, { eyes: .9 }); c.restore(); }
  if (p.reflMama) { const k = p.grinAt != null ? clamp(prog(lt, p.grinAt, p.grinAt + 1.4)) : 0;
    if (p.reflBack) mama(c, p.reflMama, p.reflX || mx + mw / 2, p.reflY || ry, p.reflH || rh, BASE, gt, { color: '#cfcfd6', back: true });
    else mama(c, p.reflMama, p.reflX || mx + mw / 2, p.reflY || ry, p.reflH || rh, BASE, gt, { color: '#d6d6dd', face: p.reflFace || 'wide', smile: k, mouthColor: k > .05 ? '#ff2a2a' : null, mouthGlow: 'rgba(255,30,30,1)' });
  } else if (refl !== 'missing') {
    const late = refl === 'late' ? .45 : 0;
    const raise = p.wave != null ? E.inOut(prog(lt - late, p.wave, p.wave + .5)) : 0;
    const P = { ...BASE, re: [.14, lerp(-.62, -.86, raise)], rh: [lerp(.12, .2, raise), lerp(-.46, -1.02, raise)] };
    stick(c, mx + mw / 2, ry, rh, P, gt, { color: '#d6d6dd' });
    const hd = [mx + mw / 2, ry - .9 * rh], hr = .085 * rh;
    if (refl === 'grin' && lt > (p.grinAt || 0)) {
      const k = clamp(prog(lt, p.grinAt || 0, (p.grinAt || 0) + .6));
      c.fillStyle = '#120203'; c.beginPath(); c.ellipse(hd[0] - hr * .38, hd[1] - hr * .2, hr * .14, hr * .22 * k, 0, 0, 7); c.ellipse(hd[0] + hr * .38, hd[1] - hr * .2, hr * .14, hr * .22 * k, 0, 0, 7); c.fill();
      c.strokeStyle = '#120203'; c.lineWidth = hr * .12; c.lineCap = 'round'; c.beginPath(); c.arc(hd[0], hd[1] + hr * .05, hr * .62 * k + 1, .1 * Math.PI, .9 * Math.PI); c.stroke();
    }
  }
  if (p.ghostGrin != null && lt >= p.ghostGrin) { // Grinsen ohne Gesicht, dort wo dein Gesicht sein müsste
    const k = clamp(prog(lt, p.ghostGrin, p.ghostGrin + 1.0)), gx = p.grinX || p.reflX || mx + mw / 2, gy = p.grinY || ry - .86 * rh, R = 70 * (0.6 + .4 * k);
    c.save(); glow(c, 'rgba(255,30,30,1)', 40); c.fillStyle = '#1a0304'; c.beginPath(); c.moveTo(gx - R, gy); c.arc(gx, gy - R * .1, R, .05 * Math.PI, .95 * Math.PI); c.closePath(); c.fill();
    c.strokeStyle = '#ff3a3a'; c.lineWidth = 4; c.stroke(); noGlow(c);
    c.strokeStyle = 'rgba(240,230,232,.95)'; c.lineWidth = 4;
    for (let q = 1; q < 9; q++) { const a = lerp(.05, .95, q / 9) * Math.PI; c.beginPath(); c.moveTo(gx + Math.cos(a) * R * .98, gy - R * .1 + Math.sin(a) * R * .98); c.lineTo(gx + Math.cos(a) * R * .6, gy + R * .12); c.stroke(); }
    c.restore();
  }
  // Beschlag + Schrift
  if (p.fog) {
    c.fillStyle = 'rgba(200,190,195,.18)'; c.fillRect(mx, my, mw, mh);
    for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(220,210,215,.05)'; c.beginPath(); c.arc(mx + hash(i) * mw, my + hash(i + 50) * mh, 60 + hash(i + 9) * 120, 0, 7); c.fill(); }
    if (p.fogText) {
      const k = p.fogTextAt != null ? prog(lt, p.fogTextAt, p.fogTextAt + 1.6) : 1;
      const lines = p.fogText.split('\n');
      c.save(); c.globalCompositeOperation = 'destination-out';
      const total = lines.join('').length; let shown = Math.floor(total * k);
      lines.forEach((l, i) => { const s = l.slice(0, Math.max(0, shown)); shown -= l.length; txt(c, s, mx + mw / 2, my + 170 + i * 115, '400 110px Bebas', 'rgba(0,0,0,.85)', 'center', 'alphabetic', 4); });
      c.restore();
      c.save(); glow(c, 'rgba(255,40,40,.6)', 12); shown = Math.floor(total * k);
      lines.forEach((l, i) => { const s = l.slice(0, Math.max(0, shown)); shown -= l.length; txt(c, s, mx + mw / 2, my + 170 + i * 115, '400 110px Bebas', 'rgba(255,90,90,.35)', 'center', 'alphabetic', 4); });
      c.restore();
    }
  }
  c.fillStyle = 'rgba(255,255,255,.07)'; c.beginPath(); c.moveTo(mx + 60, my); c.lineTo(mx + 200, my); c.lineTo(mx, my + 260); c.lineTo(mx, my + 120); c.fill();
  c.beginPath(); c.moveTo(mx + mw - 120, my + mh); c.lineTo(mx + mw - 40, my + mh); c.lineTo(mx + mw, my + mh - 120); c.lineTo(mx + mw, my + mh - 220); c.fill();
  c.restore();
  // Waschbecken
  if (!p.noSink) { rr(c, 300, 1210, 480, 90, 40); c.fillStyle = '#26262e'; c.fill();
  rr(c, 520, 1150, 40, 70, 10); c.fillStyle = '#3a3a44'; c.fill(); }
  if (p.drip) { const d = ((lt * 1.1) % 1); c.fillStyle = 'rgba(255,90,90,.8)'; c.beginPath(); c.arc(540, 1225 + d * 50, 8, 0, 7); c.fill(); }
  if (p.front === 'you') { // du von hinten vor dem Spiegel, winkst
    const wv = p.wave != null && lt > p.wave ? Math.sin((lt - p.wave) * 9) : null;
    const P = { ...BASE, head: [0, -.9] };
    if (wv != null) { P.le = [-.17, -.78]; P.lh = [-.26 + .06 * wv, -1.0]; }
    stick(c, p.frontX || 300, 2150, 1200, P, gt, { color: '#e9e9ee' });
  } else if (p.front) { // Mama vorn im Bild, Gesicht bleibt leer
    mama(c, p.front, p.frontX || 250, 2150, 1450, { ...BASE, head: [.02, -.9] }, gt, { face: 'wide', smile: 0 });
  }
};

SCENES.rule_card = (c, lt, b, gt) => {
  const p = b.p || {};
  bgFill(c, '#0c0c0f', '#050506');
  // Rauch/Nebel
  for (let i = 0; i < 6; i++) { c.save(); c.globalAlpha = .07; spot(c, 540 + noise(gt * .2, i) * 400, 900 + noise(gt * .15, i + 9) * 500, 500, RED, .9); c.restore(); }
  if (p.icon) drawIcon(c, p.icon, 540, 1460, lt, gt);
  const k = E.back(prog(lt, 0, .45));
  c.save(); c.translate(540, 760); c.scale(lerp(.8, 1, k), lerp(.8, 1, k)); c.globalAlpha = clamp(k * 1.4);
  const label = p.label || 'REGEL #1';
  c.font = '700 34px SMono'; c.letterSpacing = '4px'; const lw = c.measureText(label).width + 50; c.letterSpacing = '0px';
  rr(c, -lw / 2, -250, lw, 62, 10); c.fillStyle = C.red; glow(c, 'rgba(255,40,40,.9)', 30); c.fill(); noGlow(c);
  txt(c, label, 0, -207, '700 34px SMono', '#fff', 'center', 'alphabetic', 4);
  const lines = wrap(c, (p.text || '').toUpperCase(), 900, '400 128px Anton');
  const fs = lines.length > 3 ? 104 : 128;
  const L = wrap(c, (p.text || '').toUpperCase(), 900, `400 ${fs}px Anton`);
  glow(c, 'rgba(0,0,0,.9)', 30);
  const hl = (p.hl || []).map(w => w.toUpperCase());
  L.forEach((l, i) => {
    c.font = `400 ${fs}px Anton`; c.letterSpacing = '1px'; const ws = l.split(' '), sp = c.measureText(' ').width; const tw = c.measureText(l).width; let x = -tw / 2;
    ws.forEach(w => { const isH = hl.some(h => w.replace(/[^A-ZÄÖÜ]/g, '').startsWith(h)); if (isH) glow(c, 'rgba(255,30,30,1)', 30);
      c.fillStyle = isH ? '#ff3030' : '#f4f4f6'; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillText(w, x, -60 + i * fs * 1.08); noGlow(c); glow(c, 'rgba(0,0,0,.9)', 30); x += c.measureText(w).width + sp; });
    c.letterSpacing = '0px';
  });
  noGlow(c);
  if (p.sub) txt(c, p.sub, 0, -60 + L.length * fs * 1.08 + 30, '600 36px Mont', '#ff6a6a');
  c.restore();
  if (p.strike != null && lt > p.strike) { // Regel wird durchgestrichen
    const s = E.out(prog(lt, p.strike, p.strike + .35)); c.strokeStyle = C.red; c.lineWidth = 18; glow(c, 'rgba(255,40,40,1)', 30);
    c.beginPath(); c.moveTo(110, 760); c.lineTo(110 + 860 * s, 760 + 40 * s); c.stroke(); noGlow(c);
  }
};
function drawIcon(c, name, x, y, lt, gt) {
  c.save(); c.translate(x, y); c.strokeStyle = 'rgba(255,255,255,.18)'; c.fillStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 10; c.lineCap = 'round';
  if (name === 'eye') { c.beginPath(); c.ellipse(0, 0, 150, 80, 0, 0, 7); c.stroke(); c.beginPath(); c.arc(0, 0, 45, 0, 7); c.fill(); }
  else if (name === 'door') { c.strokeRect(-90, -160, 180, 320); c.beginPath(); c.arc(55, 10, 10, 0, 7); c.fill(); }
  else if (name === 'mirror') { rr(c, -100, -150, 200, 300, 30); c.stroke(); }
  else if (name === 'phone') { rr(c, -70, -140, 140, 280, 26); c.stroke(); }
  else if (name === 'lips') { c.beginPath(); c.moveTo(-120, 0); c.quadraticCurveTo(0, -70, 120, 0); c.quadraticCurveTo(0, 80, -120, 0); c.stroke(); }
  else if (name === 'light') { c.strokeRect(-70, -110, 140, 220); rr(c, -25, -60, 50, 120, 10); c.fill(); }
  else if (name === 'mama_coat' || name === 'mama_gown') { c.restore(); const coat = name === 'mama_coat';
    mama(c, name.slice(5), x, y + 120, 400, 'stand', gt, coat ? { face: 'stare', smile: .9, faceColor: '#1a0304' } : { face: 'wide', smile: 0 }); return; }
  else if (name === 'note') { c.strokeRect(-110, -140, 220, 280); for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-70, -80 + i * 55); c.lineTo(70, -80 + i * 55); c.stroke(); } }
  c.restore();
}

SCENES.face_closeup = (c, lt, b, gt) => {
  const p = b.p || {};
  bgFill(c, '#0c0c0f', '#050506'); spot(c, 900, 700, 600, RED, .35);
  const sh = noise(gt * 20, 2) * 4;
  const cx = 540 + sh, cy = 900, R = 400;
  c.strokeStyle = C.white; c.lineWidth = 110; c.lineCap = 'round';
  c.beginPath(); c.moveTo(cx, cy + R); c.lineTo(cx, H + 200); c.stroke();
  c.beginPath(); c.moveTo(cx, cy + R + 200); c.quadraticCurveTo(cx - 400, cy + R + 300, cx - 500, H + 200); c.moveTo(cx, cy + R + 200); c.quadraticCurveTo(cx + 400, cy + R + 300, cx + 500, H + 200); c.stroke();
  c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fillStyle = C.white; c.fill();
  const bl = c.createRadialGradient(cx + 260, cy + 60, 0, cx + 260, cy + 60, 220); bl.addColorStop(0, 'rgba(255,60,60,.55)'); bl.addColorStop(1, 'rgba(255,60,60,0)'); c.fillStyle = bl; c.fillRect(cx, cy - 200, 500, 500);
  let jx = noise(gt * 14, 5) * 8, jy = noise(gt * 14, 6) * 5; const blink = (lt % 3.1) > 3.0 ? .1 : 1;
  if (p.dart) { const side = Math.sin(lt * 2.6) > 0 ? 1 : -1; jx += side * 34; spot(c, side > 0 ? 1080 : 0, 900, 700, RED, .45); }
  if (p.look != null) jx += (p.lookAt != null ? E.inOut(prog(lt, p.lookAt, p.lookAt + .8)) : 1) * p.look * 36;
  if (p.lightBelow) spot(c, cx, cy + 520, 620, p.lightBelow === 'grey' ? WHITEA : RED, .35);
  for (const s of [-1, 1]) {
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(cx + s * 140, cy - 40, 82, 92 * blink, 0, 0, 7); c.fill(); c.lineWidth = 6; c.strokeStyle = '#1a1a1f'; c.stroke();
    c.fillStyle = '#121216'; c.beginPath(); c.arc(cx + s * 140 + jx, cy - 30 + jy, 30 * blink, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(cx + s * 140 + jx + 10, cy - 42 + jy, 9 * blink, 0, 7); c.fill();
    c.strokeStyle = '#2a2a30'; c.lineWidth = 14; c.beginPath(); c.moveTo(cx + s * 70, cy - 170 - (p.mood === 'shock' ? 20 : 0)); c.lineTo(cx + s * 210, cy - 150 + (p.mood === 'shock' ? -30 : 10)); c.stroke();
  }
  c.fillStyle = '#2a0b0d'; c.beginPath(); c.ellipse(cx, cy + 190, 34, 46 + Math.sin(gt * 9) * 4, 0, 0, 7); c.fill();
  // Schweißtropfen
  const d = (lt * .5) % 1; c.fillStyle = '#9ec5ff'; c.beginPath(); c.moveTo(cx + 330, cy - 240 + d * 120); c.quadraticCurveTo(cx + 365, cy - 170 + d * 120, cx + 330, cy - 160 + d * 120); c.quadraticCurveTo(cx + 295, cy - 170 + d * 120, cx + 330, cy - 240 + d * 120); c.fill();
};

SCENES.sfx_text = (c, lt, b, gt) => {
  const p = b.p || {};
  if (p.bg && SCENES[p.bg]) { SCENES[p.bg](c, lt, { p: p.bgP || {} }, gt); c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(-200, -200, W + 400, H + 400); }
  else { bgFill(c, '#0b0b0e', '#040405'); }
  const lines = p.lines || ['KLOPF.'];
  lines.forEach((l, i) => {
    const at = (p.times && p.times[i] != null) ? p.times[i] : i * .55; if (lt < at) return;
    const k = E.back(prog(lt, at, at + .2)), j = noise(gt * 25, i) * 6;
    const x = (p.xs && p.xs[i] != null) ? p.xs[i] : 540, y = (p.y || 640) + i * (p.size || 230) * 1.0;
    c.save(); c.translate(x + j, y); c.scale(lerp(1.6, 1, k), lerp(1.6, 1, k)); c.globalAlpha = clamp(k * 1.5);
    glow(c, 'rgba(255,30,30,1)', 50); txt(c, l, 0, 0, `400 ${p.size || 230}px Anton`, '#ff3030', 'center', 'middle', 2); txt(c, l, 0, 0, `400 ${p.size || 230}px Anton`, '#ff4a4a', 'center', 'middle', 2);
    noGlow(c); c.restore();
  });
};

SCENES.photo_reveal = (c, lt, b, gt) => {
  const p = b.p || {};
  bgFill(c, '#0b0b0e', '#040405');
  const k = E.out(prog(lt, 0, .8));
  c.save(); c.translate(540, 900); c.rotate(lerp(-.12, -.035, k)); c.scale(lerp(1.25, 1, k), lerp(1.25, 1, k));
  glow(c, 'rgba(0,0,0,.9)', 60); c.fillStyle = '#e9e6e6'; c.fillRect(-400, -520, 800, 1000); noGlow(c);
  drawPhoto(c, -360, -480, 720, 780, gt, { kind: p.kind || 'sleeping', stamp: p.stamp });
  if (p.caption) txt(c, p.caption, 0, 410, '400 60px Bebas', '#2a2a30', 'center', 'alphabetic', 3);
  c.restore();
  // Sucher-Ecken
  c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 6;
  for (const [x, y, sx, sy] of [[90, 260, 1, 1], [990, 260, -1, 1], [90, 1540, 1, -1], [990, 1540, -1, -1]]) { c.beginPath(); c.moveTo(x, y + sy * 70); c.lineTo(x, y); c.lineTo(x + sx * 70, y); c.stroke(); }
  if (p.rec !== false) { c.fillStyle = (gt % 1) < .5 ? C.red : 'rgba(255,40,40,.3)'; c.beginPath(); c.arc(830, 210, 14, 0, 7); c.fill(); txt(c, 'REC', 900, 222, '700 32px SMono', '#fff', 'center'); }
};

SCENES.choice_split = (c, lt, b, gt) => {
  const p = b.p || {};
  bgFill(c, '#0b0b0e', '#040405');
  const pulse = (Math.sin(gt * 3) + 1) / 2;
  for (const [side, label, icon, sub] of [[-1, p.a || 'A', p.iconA, p.subA], [1, p.b || 'B', p.iconB, p.subB]]) {
    const x0 = side < 0 ? 0 : 540, hl = side < 0 ? pulse : 1 - pulse;
    c.save(); c.beginPath(); c.rect(x0, 0, 540, H); c.clip();
    c.fillStyle = side < 0 ? '#101014' : '#0d0d10'; c.fillRect(x0, 0, 540, H);
    spot(c, x0 + 270, 1050, 500, RED, .12 + .18 * hl);
    if (icon) drawIcon(c, icon, side < 0 ? 290 : 790, 990, lt, gt);
    c.restore();
    const k = E.back(prog(lt, side < 0 ? .3 : .7, side < 0 ? .7 : 1.1));
    c.save(); c.globalAlpha = clamp(k * 1.4);
    const cxo = side < 0 ? 290 : 790;
    txt(c, side < 0 ? U('optA') : U('optB'), cxo, 1160, '700 30px SMono', '#ff5a5a', 'center', 'alphabetic', 6);
    const L = (label.includes('|') ? label.split('|') : wrap(c, label.toUpperCase(), 380, '400 84px Anton')).map(x => x.trim().toUpperCase());
    L.forEach((l, i) => txt(c, l, cxo, 1260 + i * 90, '400 84px Anton', '#f2f2f5'));
    if (sub) txt(c, sub.toUpperCase(), cxo, 1260 + L.length * 90 + 4, '700 30px Mont', '#d0d0d8');
    c.restore();
  }
  c.save(); glow(c, 'rgba(255,40,40,1)', 30); c.fillStyle = C.red; c.fillRect(536, 700, 8, H); noGlow(c); c.restore();
  const k = E.back(prog(lt, 0, .4));
  c.save(); c.globalAlpha = clamp(k * 1.5);
  if (p.kicker) txt(c, p.kicker, 540, 410, '700 30px SMono', '#ff5a5a', 'center', 'alphabetic', 6);
  const T = wrap(c, (p.title || U('title')).toUpperCase(), 900, '400 110px Anton');
  glow(c, 'rgba(0,0,0,1)', 30); T.forEach((l, i) => txt(c, l, 540, 530 + i * 118, '400 110px Anton', '#fff')); noGlow(c);
  c.restore();
};

const END_BG = []; // Hintergrund-Ebenen der Endkarte (z. B. Gestalt hinter dem Titel)
SCENES.end_card = (c, lt, b, gt) => {
  const p = b.p || {};
  bgFill(c, '#0b0b0e', '#040405');
  for (const f of END_BG) f(c, lt, b, gt);
  const f = lt < 1 ? flicker(gt, 31, 20) : (noise(gt * 3, 2) > .85 ? .5 : 1);
  spot(c, 540, 860, 650, RED, .22 * f);
  txt(c, p.kicker || U('kicker'), 540, 640, '700 38px SMono', '#e8e8ee', 'center', 'alphabetic', 10);
  const ttl = p.title || U('end'); c.font = '400 250px Anton'; c.letterSpacing = '4px'; const tws = c.measureText(ttl).width; c.letterSpacing = '0px';
  const tfs = Math.min(250, Math.floor(250 * 880 / tws));
  c.save(); c.globalAlpha = f; glow(c, 'rgba(255,30,30,1)', 60);
  txt(c, ttl, 540, 900, `400 ${tfs}px Anton`, '#ff3a3a', 'center', 'alphabetic', 4);
  txt(c, ttl, 540, 900, `400 ${tfs}px Anton`, '#ff4a4a', 'center', 'alphabetic', 4); noGlow(c); c.restore();
  if (p.time) txt(c, p.time, 540, 1000, '700 44px SMono', '#e8e8ee', 'center', 'alphabetic', 6);
  const pill = p.pill || U('pill');
  c.font = '700 34px SMono'; c.letterSpacing = '5px'; const pw = c.measureText(pill).width + 80; c.letterSpacing = '0px';
  const pa = clamp(prog(lt, .6, 1.0));
  c.save(); c.globalAlpha = pa; rr(c, 540 - pw / 2, 1060, pw, 80, 40); c.lineWidth = 4; c.strokeStyle = '#e8e8ee'; c.stroke();
  txt(c, pill, 540, 1112, '700 34px SMono', '#e8e8ee', 'center', 'alphabetic', 5); c.restore();
  if (p.sub) { c.save(); c.globalAlpha = clamp(prog(lt, 1.0, 1.4)); p.sub.split('|').forEach((l, i) => txt(c, l.trim(), 540, 1260 + i * 58, '800 44px Mont', '#ff5a5a', 'center', 'alphabetic', 1)); c.restore(); }
};

SCENES.fridge_note = (c, lt, b, gt) => {
  const p = b.p || {};
  bgFill(c, '#0e0e12', '#060607');
  // Küche: Wand, Boden, Kühlschrank mittig
  c.fillStyle = '#121216'; c.fillRect(-200, -200, W + 400, 1500);
  c.fillStyle = '#0a0a0d'; c.fillRect(-200, 1300, W + 400, 900);
  rr(c, 130, 120, 820, 1500, 40); c.fillStyle = '#26262d'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#33333c'; c.stroke();
  c.fillStyle = '#1c1c22'; c.fillRect(130, 560, 820, 10);
  rr(c, 880, 220, 26, 260, 13); c.fillStyle = '#3c3c46'; c.fill(); rr(c, 880, 640, 26, 360, 13); c.fill();
  const fl = p.flicker ? flicker(gt, 41, 6) : 1;
  c.save(); c.globalAlpha = fl; spot(c, 540, 700, 800, RED, .22); c.restore();
  // Zettel
  const lines = p.lines || [];
  c.save(); c.translate(540, 820); c.rotate(p.tilt != null ? p.tilt : -.035);
  const nw = 700, nh = 860;
  glow(c, 'rgba(0,0,0,.8)', 40); c.fillStyle = '#d8d2c6'; c.fillRect(-nw / 2, -nh / 2, nw, nh); noGlow(c);
  c.fillStyle = 'rgba(120,20,20,.18)'; c.fillRect(-nw / 2, -nh / 2, nw, nh);
  c.strokeStyle = 'rgba(80,90,140,.25)'; c.lineWidth = 2; for (let y = -nh / 2 + 190; y < nh / 2 - 20; y += 88) { c.beginPath(); c.moveTo(-nw / 2 + 30, y); c.lineTo(nw / 2 - 30, y); c.stroke(); }
  c.beginPath(); c.arc(0, -nh / 2 + 6, 34, 0, 7); c.fillStyle = C.red; glow(c, 'rgba(255,40,40,.8)', 20); c.fill(); noGlow(c);
  if (p.title) txt(c, p.title, 0, -nh / 2 + 130, `700 ${p.titleSize || 78}px Caveat`, '#2a2326');
  lines.forEach((l, i) => {
    const at = l.at || 0; if (lt < at) return;
    const k = clamp((lt - at) / (l.dur || .9));
    const font = l.style === 'other' ? `400 ${l.size || 40}px RockSalt` : `700 ${l.size || 60}px Caveat`;
    const col = l.red ? '#b3141a' : (l.style === 'other' ? '#5a0b0e' : '#26203a');
    const rows = wrap(c, l.text, nw - 100, font); let shown = Math.ceil(l.text.length * k);
    const r0 = l.row != null ? l.row : i, x = -nw / 2 + 50;
    rows.forEach((rw, j) => {
      const y = -nh / 2 + 240 + (r0 + j) * 88, part = rw.slice(0, Math.max(0, shown)); shown -= rw.length + 1;
      c.save(); if (l.red || l.style === 'other' || (l.glowAt != null && lt >= l.glowAt)) glow(c, 'rgba(255,30,30,.6)', l.glowAt != null && lt >= l.glowAt ? 22 : 10); txt(c, part, x, y, font, col, 'left'); c.restore();
      if (l.underline != null && lt >= l.underline) { const uk = E.out(prog(lt, l.underline, l.underline + .4)); c.font = font; const tw = c.measureText(rw).width;
        c.strokeStyle = '#d0141c'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y + 14); c.lineTo(x + tw * uk, y + 12 + 3 * Math.sin(uk * 9)); c.stroke(); }
      if (l.wet && part.length) { c.font = font; const tw = c.measureText(part).width;
        for (let q = 0; q < 6; q++) { const dx = x + 20 + hash(q * 7 + i) * (tw - 40), st = at + (l.dur || .9) + hash(q + 3) * .8, u = Math.max(0, lt - st);
          const len = Math.min(70, u * (25 + hash(q) * 30)); if (len <= 0) continue;
          c.strokeStyle = col; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(dx, y + 6); c.lineTo(dx, y + 6 + len); c.stroke();
          c.fillStyle = col; c.beginPath(); c.arc(dx, y + 8 + len, 6, 0, 7); c.fill(); } }
      if (l.strike != null && lt > l.strike) { const sk = E.out(prog(lt, l.strike, l.strike + .4)); c.font = font; const tw = c.measureText(rw).width;
        c.strokeStyle = '#b3141a'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 6, y - 18); c.lineTo(x - 6 + (tw + 12) * sk, y - 22 + 4 * sk); c.stroke(); }
    });
  });
  c.restore();
};

SCENES.black = (c) => { c.fillStyle = '#000'; c.fillRect(-200, -200, W + 400, H + 400); };

// ---------- Overlays ----------
function typingBanner(c, lt, p, gt) {
  if (p.typing == null || lt < p.typing) return;
  const k = E.back(prog(lt, p.typing, p.typing + .35)), y = p.bannerY || 1390;
  c.save(); c.globalAlpha = clamp(k * 1.3); c.translate(0, lerp(-60, 0, k));
  glow(c, 'rgba(255,40,40,.7)', 30); rr(c, 150, y, 760, 112, 34); c.fillStyle = 'rgba(32,32,40,.96)'; c.fill(); noGlow(c);
  c.lineWidth = 3; c.strokeStyle = 'rgba(255,60,60,.8)'; c.stroke();
  rr(c, 178, y + 22, 68, 68, 18); c.fillStyle = C.red; c.fill(); rr(c, 192, y + 40, 40, 30, 10); c.fillStyle = '#fff'; c.fill();
  txt(c, p.typingText || U('typing'), 270, y + 68, '700 36px Mont', '#fff', 'left');
  for (let d = 0; d < 3; d++) { const a = .3 + .7 * Math.max(0, Math.sin(gt * 7 - d * .9)); c.beginPath(); c.arc(790 + d * 32, y + 56, 10, 0, 7); c.fillStyle = `rgba(255,90,90,${a})`; c.fill(); }
  c.restore();
}
let grain = null;
function makeGrain() {
  grain = [];
  for (let k = 0; k < 6; k++) {
    const g = document.createElement('canvas'); g.width = 360; g.height = 640; const gc = g.getContext('2d');
    const id = gc.createImageData(360, 640);
    for (let i = 0; i < id.data.length; i += 4) { const v = hash(i * .37 + k * 1000.13) * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    gc.putImageData(id, 0, 0); grain.push(g);
  }
}
function hud(c, t, beat) {
  const clk = beat.clock || '';
  const prev = TL.beats[beat.i - 1];
  const changed = prev && prev.clock !== clk && (t - beat.start) < .3;
  c.translate(0, 60);
  const red = !!beat.clockRed;
  c.save();
  const blink = (t % 1.2) < .8;
  c.fillStyle = blink ? C.red : 'rgba(255,40,40,.25)'; c.beginPath(); c.arc(64, 96, 9, 0, 7); c.fill();
  txt(c, TL.series || 'TEIL 1', 84, 106, '700 26px SMono', '#ff6a6a', 'left', 'alphabetic', 5);
  let s = clk;
  if (changed && hash(Math.floor(t * 30)) > .4) { const m = clk.match(/\d(?=\D*$)/); if (m) { const i = clk.lastIndexOf(m[0]); s = clk.slice(0, i) + String(Math.floor(hash(t * 30) * 10)) + clk.slice(i + 1); } }
  if (red) glow(c, 'rgba(255,40,40,1)', 30);
  txt(c, s, 52, 190, '700 84px SMono', red ? '#ff3a3a' : '#f1f1f4', 'left');
  noGlow(c);
  txt(c, TL.place || 'WHG 4B', 56, 240, '700 30px SMono', '#8d8d98', 'left', 'alphabetic', 5);
  c.restore();
}
function captions(c, t, beat) {
  const ch = TL.chunks.find(k => t >= k.start && t < k.end);
  if (!ch) return;
  const words = ch.words.map(i => TL.words[i]);
  let fs = 70; const font = s => `900 ${s}px Mont`;
  const str = words.map(w => w.text.toUpperCase());
  c.font = font(fs); c.letterSpacing = '1px';
  const sp = c.measureText(' ').width;
  let tw = str.reduce((s, w) => s + c.measureText(w).width, 0) + sp * (str.length - 1);
  if (tw > 800) { fs = Math.floor(fs * 800 / tw); c.font = font(fs); tw = str.reduce((s, w) => s + c.measureText(w).width, 0) + c.measureText(' ').width * (str.length - 1); }
  const sp2 = c.measureText(' ').width;
  let x = 540 - tw / 2; const y = beat.captionY || TL.captionY || 1250;
  const k0 = E.back(prog(t, ch.start, ch.start + .12));
  c.save(); c.translate(540, y); c.scale(lerp(.88, 1, k0), lerp(.88, 1, k0)); c.translate(-540, -y);
  if (beat.capBox) { rr(c, 540 - tw / 2 - 34, y - fs * .95, tw + 68, fs * 1.32, 24); c.fillStyle = 'rgba(8,8,10,.82)'; c.fill(); }
  words.forEach((w, i) => {
    const s = str[i]; const ww = c.measureText(s).width;
    const wi = ch.words[i], nx = TL.words[wi + 1];
    const until = nx && nx.line === w.line ? nx.start : w.end + .3;
    const active = t >= w.start && t < until, spoken = t >= w.start;
    const col = (active || w.emph) && spoken ? '#ff2e2e' : '#ffffff';
    c.lineJoin = 'round'; c.lineWidth = 14; c.strokeStyle = 'rgba(0,0,0,.92)'; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    c.font = font(fs);
    c.strokeText(s, x, y);
    if ((active || w.emph) && spoken) glow(c, 'rgba(255,30,30,.85)', 26);
    c.fillStyle = spoken ? col : 'rgba(255,255,255,.55)'; c.fillText(s, x, y); noGlow(c);
    x += ww + sp2;
  });
  c.letterSpacing = '0px';
  c.restore();
}
function vignette(c, a = .78) {
  const g = c.createRadialGradient(540, 900, 400, 540, 960, 1250); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); c.fillStyle = g; c.fillRect(0, 0, W, H);
}
function glitch(c, t, amt, seed) {
  octx.setTransform(1, 0, 0, 1, 0, 0); octx.clearRect(0, 0, W, H); octx.drawImage(cv, 0, 0);
  // RGB-Versatz
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .35 * amt;
  c.drawImage(off, 18 * amt, 0); c.drawImage(off, -18 * amt, 0); c.restore();
  c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(255,200,200,1)'; c.globalAlpha = .3 * amt; c.fillRect(0, 0, W, H); c.restore();
  // Streifen verschieben
  const n = 7 + Math.floor(hash(seed) * 6);
  for (let i = 0; i < n; i++) {
    const y = hash(seed * 3 + i * 7.1) * H, h = 20 + hash(seed + i * 1.7) * 120, dx = (hash(seed * 1.3 + i) - .5) * 160 * amt;
    c.drawImage(off, 0, y, W, h, dx, y, W, h);
  }
  c.fillStyle = `rgba(255,30,30,${.12 * amt})`; c.fillRect(0, hash(seed * 9) * H, W, 6);
}

// ---------- Hauptschleife ----------
window.setTimeline = (tl) => { TL = tl; TL.beats.forEach((b, i) => { b.i = i; }); if (!grain) makeGrain(); };
window.renderFrame = (fi) => {
  const t = fi / FPS;
  let bi = TL.beats.findIndex(b => t >= b.start && t < b.end); if (bi < 0) bi = TL.beats.length - 1;
  const b = TL.beats[bi]; const lt = t - b.start, dur = b.end - b.start;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; noGlow(ctx);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  // Kamera
  const z = b.zoom || [1, 1.06];
  const pr = E.inOut(clamp(lt / dur));
  let s = lerp(z[0], z[1], pr);
  const punch = (b.punch || []).reduce((a, pt) => a + (lt > pt ? Math.exp(-(lt - pt) * 7) * .07 : 0), 0); s += punch;
  const f = b.focus || [540, 900];
  const shakeA = (b.shake || 0) + (TL.shakes || []).reduce((a, sh) => a + (t > sh.t && t < sh.t + sh.d ? sh.a * (1 - (t - sh.t) / sh.d) : 0), 0);
  const hx = noise(t * .8, 1) * 6 + noise(t * 18, 2) * shakeA, hy = noise(t * .7, 3) * 6 + noise(t * 18, 4) * shakeA;
  const pan = b.pan ? [lerp(b.pan[0], b.pan[2], pr), lerp(b.pan[1], b.pan[3], pr)] : [0, 0];
  ctx.save();
  ctx.translate(f[0] + hx + pan[0], f[1] + hy + pan[1]); ctx.scale(s, s); ctx.rotate((b.rot || 0) + noise(t * .5, 5) * .004); ctx.translate(-f[0], -f[1]);
  (SCENES[b.scene] || SCENES.black)(ctx, lt, b, t);
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; noGlow(ctx);
  // Atmosphäre
  vignette(ctx, b.vignette != null ? b.vignette : .8);
  if (b.p && b.p.typing != null && b.scene !== 'phone_chat') typingBanner(ctx, lt, b.p, t);
  // Blitze
  for (const fl of (TL.flashes || [])) { if (t >= fl.t && t < fl.t + fl.d) { ctx.fillStyle = fl.c || '#fff'; ctx.globalAlpha = (1 - (t - fl.t) / fl.d) * (fl.a || .85); ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; } }
  if (b.flashback) { // Rückblende: rot-monochrom, Bildzittern, Label
    ctx.save(); ctx.globalCompositeOperation = 'color'; ctx.fillStyle = '#8a1010'; ctx.globalAlpha = .75; ctx.fillRect(0, 0, W, H); ctx.restore();
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(0, 0, W, H);
    for (let k = 0; k < 4; k++) { const yy = hash(Math.floor(t * 12) * 3 + k) * H; ctx.fillStyle = 'rgba(255,200,200,.06)'; ctx.fillRect(0, yy, W, 3 + hash(k + t) * 6); }
    txt(ctx, b.flashLabel || 'NIGHT 1', 1000, 190, '700 34px SMono', '#ffb3b3', 'right', 'alphabetic', 6);
  }
  // Rote Atmung
  if (b.redPulse) { ctx.fillStyle = `rgba(255,0,0,${.06 + .06 * Math.sin(t * 6)})`; ctx.fillRect(0, 0, W, H); }
  hud(ctx, t, b);
  for (const f of POST_HOOKS) { ctx.save(); f(ctx, t, b, lt); ctx.restore(); }
  if (!b.noCaptions) captions(ctx, t, b);
  // Körnung
  ctx.save(); ctx.globalAlpha = .07; ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(grain[Math.floor(t * 24) % 6], 0, 0, W, H); ctx.restore();
  // Scanline
  ctx.fillStyle = 'rgba(255,255,255,.015)'; for (let y = Math.floor((t * 60) % 6); y < H; y += 6) ctx.fillRect(0, y, W, 2);
  // Glitch an Übergängen
  const tg = b.trans || 'glitch';
  let ga = 0;
  if (bi > 0 && tg === 'glitch' && lt < .14) ga = 1 - lt / .14;
  for (const g of (TL.glitches || [])) if (t >= g.t && t < g.t + (g.d || .12)) ga = Math.max(ga, g.a || 1);
  if (ga > 0) glitch(ctx, t, ga, Math.floor(t * 30) + 1);
  if (bi > 0 && tg === 'fade' && lt < .3) { ctx.fillStyle = `rgba(0,0,0,${1 - lt / .3})`; ctx.fillRect(0, 0, W, H); }
  // Ausblende am Ende
  if (TL.duration && !TL.noEndFade && t > TL.duration - .6) { ctx.fillStyle = `rgba(0,0,0,${clamp((t - (TL.duration - .6)) / .6)})`; ctx.fillRect(0, 0, W, H); }
  return true;
};
window.enginePromise = document.fonts.ready.then(() => Promise.all(['Anton', 'Bebas', 'Mont', 'Oswald', 'SMono', 'Caveat', 'RockSalt', 'Marker'].map(f => document.fonts.load(`400 40px ${f}`)))).then(() => document.fonts.load('700 40px Caveat')).then(() => document.fonts.load('900 40px Mont')).then(() => document.fonts.load('700 40px SMono'));
