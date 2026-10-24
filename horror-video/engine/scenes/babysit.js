'use strict';
// Elemente für "DON'T WAKE HER": die Gestalt (Shape), du mit Kapuze im Kamerabild, Overlays (Pops, Uhr-Ring),
// Foto-Motive (Kamera-Screenshot, du am Kinderbett), Vergleichs-Icons.

// ---------- Die Gestalt ----------
const SHAPE_POSES = {
  stand: { head: [0, -.93], neck: [0, -.86], hip: [0, -.5], lk: [-.04, -.25], lf: [-.06, 0], rk: [.04, -.25], rf: [.06, 0], le: [-.1, -.62], lh: [-.11, -.2], re: [.1, -.62], rh: [.11, -.2] },
  bend: { head: [.31, -.7], neck: [.22, -.74], hip: [0, -.5], lk: [-.03, -.25], lf: [-.06, 0], rk: [.05, -.25], rf: [.07, 0], le: [.24, -.52], lh: [.3, -.3], re: [.3, -.52], rh: [.36, -.31] },
  finger: { head: [0, -.93], neck: [0, -.86], hip: [0, -.5], lk: [-.04, -.25], lf: [-.06, 0], rk: [.04, -.25], rf: [.06, 0], le: [-.1, -.62], lh: [-.11, -.2], re: [.13, -.72], rh: [.015, -.9] },
  hunch: { head: [.3, -.6], neck: [.22, -.66], hip: [0, -.46], lk: [-.03, -.23], lf: [-.06, 0], rk: [.05, -.23], rf: [.07, 0], le: [.26, -.46], lh: [.32, -.26], re: [.14, -.6], rh: [.27, -.64] },
  lift: { head: [.2, -.85], neck: [.15, -.79], hip: [0, -.5], lk: [-.03, -.25], lf: [-.06, 0], rk: [.05, -.25], rf: [.07, 0], le: [.17, -.6], lh: [.24, -.36], re: [.23, -.6], rh: [.3, -.37] },
  shush: { head: [.07, -.84], neck: [.05, -.78], hip: [0, -.5], lk: [-.04, -.25], lf: [-.06, 0], rk: [.04, -.25], rf: [.06, 0], le: [-.06, -.6], lh: [-.09, -.22], re: [.22, -.66], rh: [.075, -.775] },
  bendShush: { head: [.31, -.7], neck: [.22, -.74], hip: [0, -.5], lk: [-.03, -.25], lf: [-.06, 0], rk: [.05, -.25], rf: [.07, 0], le: [.24, -.52], lh: [.3, -.3], re: [.4, -.6], rh: [.32, -.63] },
  down: { head: [.24, -.5], neck: [.2, -.6], hip: [0, -.46], lk: [-.03, -.23], lf: [-.06, 0], rk: [.05, -.23], rf: [.07, 0], le: [.22, -.48], lh: [.3, -.28], re: [.12, -.58], rh: [.25, -.47] },
  walk: { head: [.02, -.93], neck: [.01, -.86], hip: [0, -.5], lk: [-.08, -.25], lf: [-.14, 0], rk: [.07, -.24], rf: [.11, 0], le: [-.06, -.62], lh: [.02, -.2], re: [.08, -.62], rh: [-.03, -.21] },
};
function lerpPose(a, b, k) { const o = {}; for (const key in a) o[key] = [lerp(a[key][0], b[key][0], k), lerp(a[key][1], b[key][1], k)]; return o; }
function shapeEntity(c, x, y, h, t, o = {}) {
  let P = SHAPE_POSES[o.pose || 'stand'];
  if (o.from && o.blend != null) P = lerpPose(SHAPE_POSES[o.from], P, clamp(o.blend));
  if (o.wave != null) P = { ...P, re: [.14, -.84], rh: [.2 + .07 * Math.sin(o.wave * 8), -1.06] }; // langer Arm winkt
  const fl = o.flip ? -1 : 1, sway = noise(t * .6, 13) * h * .006;
  const pt = q => [x + q[0] * fl * h + (q[1] < -.4 ? sway : 0), y + q[1] * h];
  c.save(); c.globalAlpha *= (o.alpha != null ? o.alpha : 1);
  c.strokeStyle = o.color || '#050506'; c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = h * .032;
  if (o.rim !== false) glow(c, o.rimColor || 'rgba(255,40,40,.35)', h * .03);
  const seg = (...ps) => { c.beginPath(); ps.forEach((q, i) => { const r = pt(q); i ? c.lineTo(r[0], r[1]) : c.moveTo(r[0], r[1]); }); c.stroke(); };
  seg(P.neck, P.hip); seg(P.hip, P.lk, P.lf); seg(P.hip, P.rk, P.rf); seg(P.neck, P.le, P.lh); seg(P.neck, P.re, P.rh);
  // lange Finger
  for (const [e, hnd] of [[P.le, P.lh], [P.re, P.rh]]) { const a = pt(e), b = pt(hnd), dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    c.lineWidth = h * .012; for (const off of [-.03, 0, .03]) { c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(b[0] + dx / L * h * .06 + off * h * .4 * (dy / L), b[1] + dy / L * h * .06 - off * h * .4 * (dx / L)); c.stroke(); } }
  const hd = pt(P.head); c.fillStyle = o.color || '#050506'; c.beginPath(); c.arc(hd[0], hd[1], h * .055, 0, 7); c.fill(); noGlow(c);
  if (o.headRim) { c.strokeStyle = o.headRim; c.lineWidth = h * .006; c.beginPath(); c.arc(hd[0], hd[1], h * .056, 0, 7); c.stroke(); }
  // ein langer Finger senkrecht vor dem Mund (Pose finger/shush)
  const isF = q => q === 'finger' || q === 'shush' || q === 'bendShush';
  const fk = o.finger != null ? o.finger : isF(o.pose) ? (o.from && !isF(o.from) && o.blend != null ? clamp((o.blend - .55) / .45) : 1) : 0;
  if (fk > 0) { const hn = pt(P.rh), fx = Math.abs(hn[0] - hd[0]) < h * .1 ? hn[0] : hd[0], y0 = Math.max(hn[1], hd[1] + h * .07);
    c.save(); c.strokeStyle = o.fingerColor || '#9a9aa4'; c.lineCap = 'round'; c.lineWidth = h * .012; glow(c, 'rgba(255,40,40,.8)', h * .025);
    c.beginPath(); c.moveTo(fx, y0); c.lineTo(fx, lerp(y0, hd[1] + h * .008, fk)); c.stroke(); c.restore(); }
  const ea = o.eyes != null ? o.eyes : 0;
  if (ea > 0) { const turn = o.headTurn != null ? o.headTurn : 1; c.fillStyle = `rgba(255,${60 + 40 * ea},${60 + 40 * ea},${ea})`; glow(c, 'rgba(255,30,30,1)', h * .04 * ea);
    const ex = hd[0] + (1 - turn) * h * .025 * fl, sp = h * .02 * (.3 + .7 * turn), ey = hd[1] - h * .004 + h * .036 * (o.eyesDown || 0);
    c.beginPath(); c.ellipse(ex - sp, ey, h * .009, h * .006, 0, 0, 7); c.ellipse(ex + sp, ey, h * .009, h * .006, 0, 0, 7); c.fill(); noGlow(c); }
  c.restore();
  shapeEntity._last = hd;
  return { head: hd };
}

// ---------- Figuren im Kamerabild: Gestalt + du ----------
const _feedFigure = feedFigure;
feedFigure = function (c, w, h, t, f) {
  if (!f || t < (f.at || 0) || (f.until != null && t >= f.until)) return;
  if (f.kind === 'shape') {
    const a = clamp(prog(t, f.at || 0, (f.at || 0) + (f.fade != null ? f.fade : .15)));
    const sk = f.shrink ? lerp(1, f.shrink[2], E.inOut(prog(t, f.shrink[0], f.shrink[1]))) : 1, fo = f.fadeOut ? 1 - prog(t, f.fadeOut[0], f.fadeOut[1]) : 1;
    const x = (f.x != null ? f.x : .5) * w, y = (f.y != null ? f.y : .8) * h, fh = (f.h || .75) * h * sk;
    const mv = f.move ? E.inOut(prog(t, f.move[0], f.move[1])) : 0;
    const xx = f.move ? lerp(x, f.move[2] * w, mv) : x;
    c.save(); c.globalAlpha = a * fo * (f.alpha != null ? f.alpha : 1);
    shapeEntity(c, xx, y, fh, t, { pose: f.pose || 'stand', from: f.fromPose, blend: f.poseAt != null ? prog(t, f.poseAt, f.poseAt + (f.poseDur || 1)) : null,
      eyes: f.eyes != null ? clamp(prog(t, f.eyes, f.eyes + .4)) : 0, headTurn: f.turn != null ? E.inOut(prog(t, f.turn, f.turn + 1.2)) : 1, flip: f.flip, rimColor: 'rgba(0,0,0,0)', headRim: f.headRim || 'rgba(190,190,200,.5)',
      wave: f.waveAt != null && t >= f.waveAt && t < f.waveAt + (f.waveDur || 1.6) ? t - f.waveAt : null,
      eyesDown: f.eyesDownAt != null ? E.inOut(prog(t, f.eyesDownAt, f.eyesDownAt + .6)) : 0 });
    if (f.sightAt != null && t >= f.sightAt && shapeEntity._last) { const hd = shapeEntity._last, k = E.out(prog(t, f.sightAt, f.sightAt + .6)); c.save(); c.setLineDash([w * .02, w * .015]);
      c.strokeStyle = '#ff3030'; c.lineWidth = Math.max(3, w * .006); glow(c, 'rgba(255,40,40,1)', 14); c.beginPath(); c.moveTo(hd[0], hd[1] + fh * .05); c.lineTo(hd[0], lerp(hd[1] + fh * .05, h * 1.05, k)); c.stroke(); c.restore(); }
    if (f.ringAt != null && t >= f.ringAt) { const hd = shapeEntity._last; if (hd) { const k = 1 + .6 * (1 - E.out(prog(t, f.ringAt, f.ringAt + .5)));
      c.strokeStyle = '#ff3030'; c.lineWidth = Math.max(3, w * .006); glow(c, 'rgba(255,40,40,1)', 16); c.beginPath(); c.ellipse(hd[0], hd[1], fh * .09 * k, fh * .08 * k, 0, 0, 7); c.stroke(); noGlow(c); } }
    c.restore(); return;
  }
  if (f.kind === 'you') {
    const a = clamp(prog(t, f.at || 0, (f.at || 0) + (f.fade != null ? f.fade : .15)));
    const x = (f.x != null ? f.x : .5) * w, y = (f.y != null ? f.y : .85) * h, fh = (f.h || .45) * h;
    let P = { ...BASE, re: [.12, -.62], rh: [.08, -.72] }; // Handy vor der Brust
    if (f.pose === 'wave' && t >= (f.waveAt || 0)) { const u = t - (f.waveAt || 0); const wv = u < (f.waveDur || 1.6) ? Math.sin(u * 8) : 0; P = { ...BASE, re: [.15, -.8], rh: [.22 + .07 * wv, -1.02] }; }
    if (f.pose === 'sit') P = { ...BASE, hip: [0, -.44], lk: [.18, -.42], lf: [.2, -.12], rk: [.2, -.4], rf: [.22, -.1], re: [.12, -.62], rh: [.1, -.7], le: [.1, -.6], lh: [.08, -.68] };
    const mv = f.move ? E.inOut(prog(t, f.move[0], f.move[1])) : 0, xx = f.move ? lerp(x, f.move[2] * w, mv) : x;
    c.save(); c.globalAlpha = a; const st = stick(c, xx, y, fh, P, t, { color: '#d9d9df', lw: fh * .06, hood: true, hoodColor: '#8e8e98', flip: f.flip });
    if (f.phone !== false) { glow(c, 'rgba(255,255,255,.9)', fh * .08); c.fillStyle = '#f2f2f2'; c.fillRect(st.hand[0] - fh * .025, st.hand[1] - fh * .04, fh * .05, fh * .07); noGlow(c); }
    c.restore(); return;
  }
  return _feedFigure(c, w, h, t, f);
};

// ---------- Zusätze im Kamerabild: Tür, Hand, Kamera-Punkt, Augen im Türspalt ----------
function doorOpen(p, lt) { // door / doorSwing / doorKeys [[t, v], ...]
  if (p.doorKeys) { const K = p.doorKeys; if (lt <= K[0][0]) return K[0][1];
    for (let i = 1; i < K.length; i++) if (lt <= K[i][0]) return lerp(K[i - 1][1], K[i][1], E.inOut(prog(lt, K[i - 1][0], K[i][0])));
    return K[K.length - 1][1]; }
  let open = p.door != null ? p.door : .35;
  if (p.doorSwing && lt >= p.doorSwing[0]) open = lerp(p.doorSwing[2], p.doorSwing[3], E.inOut(prog(lt, p.doorSwing[0], p.doorSwing[1])));
  return open;
}
function feedExtras(c, w, h, lt, gt, p) {
  if (p.door != null || p.doorSwing || p.doorKeys) { // Tür links, halb offen, schwarzer Spalt dahinter
    let open = doorOpen(p, lt);
    const fx = w * .04, fy = h * .14, fw = w * .16, fh = h * .62;
    c.fillStyle = '#060607'; c.fillRect(fx, fy, fw, fh); // Durchgang/Spalt
    c.strokeStyle = '#3e3e46'; c.lineWidth = Math.max(2, w * .006); c.strokeRect(fx, fy, fw, fh);
    const ex = fx + fw * (1 - open), skew = h * .03 * open; // Türblatt
    c.fillStyle = '#34343c'; c.beginPath(); c.moveTo(fx + fw, fy); c.lineTo(ex, fy - skew); c.lineTo(ex, fy + fh + skew); c.lineTo(fx + fw, fy + fh); c.closePath(); c.fill(); c.stroke();
    if (p.gapEyes && lt >= p.gapEyes[0] && lt < p.gapEyes[1]) { const br = p.gapEyesBright != null && lt >= p.gapEyesBright ? E.out(prog(lt, p.gapEyesBright, p.gapEyesBright + .3)) : 0;
      c.fillStyle = `rgba(255,${60 + 50 * br},${60 + 50 * br},${.55 + .45 * br})`; glow(c, 'rgba(255,30,30,1)', 8 + 16 * br); c.beginPath(); c.arc(fx + fw * .35, fy + fh * .22, w * (.006 + .006 * br), 0, 7); c.arc(fx + fw * .55, fy + fh * .22, w * (.006 + .006 * br), 0, 7); c.fill(); noGlow(c); }
    if (p.doorHand != null && lt >= p.doorHand) { c.fillStyle = '#d9d9df'; c.beginPath(); c.ellipse(ex + w * .008, fy + fh * .48, w * .014, h * .022, 0, 0, 7); c.fill();
      for (let k = 0; k < 4; k++) { c.fillRect(ex - w * .004 - k * 0, fy + fh * .44 + k * h * .012, w * .02, h * .006); } }
  }
  if (p.doorStyle === 'closet' && (p.door != null || p.doorSwing || p.doorKeys)) { // Lamellen auf dem Schrankflügel
    let open = doorOpen(p, lt);
    const fx = w * .04, fy = h * .14, fw = w * .16, fh = h * .62, ex = fx + fw * (1 - open);
    c.strokeStyle = '#46464f'; c.lineWidth = Math.max(1.5, w * .003); for (let k = 1; k < 14; k++) { const yy = fy + fh * k / 14; c.beginPath(); c.moveTo(ex + 4, yy); c.lineTo(fx + fw - 4, yy + 2); c.stroke(); }
    txt(c, 'CLOSET', fx + fw / 2, fy - h * .02, `700 ${Math.max(10, w * .022)}px SMono`, 'rgba(160,160,170,.0)'); }
  if (p.entry != null || p.entrySwing) { // Zimmertür rechts (Eingang ins Kinderzimmer)
    let op = p.entry != null ? p.entry : 0; if (p.entrySwing && lt >= p.entrySwing[0]) op = lerp(p.entrySwing[2], p.entrySwing[3], E.inOut(prog(lt, p.entrySwing[0], p.entrySwing[1])));
    const fx = w * .86, fy = h * .2, fw = w * .13, fh = h * .56;
    c.fillStyle = op > .02 ? '#0a0a0c' : '#2c2c33'; c.fillRect(fx, fy, fw, fh);
    if (op > .02 && p.hallLight) { c.fillStyle = 'rgba(200,200,210,.25)'; c.fillRect(fx, fy, fw * op, fh); }
    c.strokeStyle = '#4a4a52'; c.lineWidth = Math.max(2, w * .006); c.strokeRect(fx, fy, fw, fh);
    const ex = fx + fw * op; c.fillStyle = '#34343c'; c.beginPath(); c.moveTo(fx, fy); c.lineTo(ex, fy - h * .02 * op); c.lineTo(ex, fy + fh + h * .02 * op); c.lineTo(fx, fy + fh); c.closePath(); c.fill(); c.stroke();
    if (p.entryHand != null && lt >= p.entryHand) { c.fillStyle = '#d9d9df'; c.beginPath(); c.ellipse(ex - w * .006, fy + fh * .5, w * .012, h * .02, 0, 0, 7); c.fill(); for (let k = 0; k < 4; k++) c.fillRect(ex - w * .002, fy + fh * .46 + k * h * .011, w * .016, h * .006); }
  }
  const bx = w * .36, by = h * .686;
  if (p.slatEye != null && lt >= p.slatEye) { const a = clamp(prog(lt, p.slatEye, p.slatEye + .3)); c.save(); c.fillStyle = `rgba(255,70,70,${a})`; glow(c, 'rgba(255,30,30,1)', 18 * a);
    c.beginPath(); c.ellipse(w * .12, h * .14 + h * .62 * .3, w * .011, w * .006, 0, 0, 7); c.fill(); c.restore(); }
  if (p.cry != null && lt >= p.cry && (p.cryEnd == null || lt < p.cryEnd)) { c.save(); c.strokeStyle = 'rgba(240,240,245,.85)'; c.lineWidth = Math.max(2, w * .006); c.lineCap = 'round';
    for (let k = 0; k < 6; k++) { const ph = ((lt - p.cry) * 1.6 + k / 6) % 1, a = -2.7 + k * .3, r0 = w * (.05 + ph * .08); c.globalAlpha = 1 - ph;
      c.beginPath(); c.moveTo(bx + Math.cos(a) * r0, by + Math.sin(a) * r0); c.lineTo(bx + Math.cos(a) * (r0 + w * .03), by + Math.sin(a) * (r0 + w * .03)); c.stroke(); } c.restore(); }
  if (p.bundleRing != null && lt >= p.bundleRing) { const k = 1 + .5 * (1 - E.out(prog(lt, p.bundleRing, p.bundleRing + .4))); c.save(); c.strokeStyle = '#ff3030'; c.lineWidth = Math.max(3, w * .007); glow(c, 'rgba(255,40,40,1)', 14);
    c.beginPath(); c.ellipse(bx, by, w * .1 * k, h * .06 * k, 0, 0, 7); c.stroke(); c.restore(); }
  if (p.seamRing != null && lt >= p.seamRing) { const k = 1 + .6 * (1 - E.out(prog(lt, p.seamRing, p.seamRing + .5))); c.save(); c.strokeStyle = '#ff3030'; c.lineWidth = Math.max(3, w * .007); glow(c, 'rgba(255,40,40,1)', 16);
    c.beginPath(); c.ellipse(w * .12, h * .45, w * .1 * k, h * .2 * k, 0, 0, 7); c.stroke(); c.restore(); }
  if (p.nightlight) { spot(c, w * .86, h * .66, w * .2, RED, .25); c.fillStyle = '#ff6a6a'; c.beginPath(); c.arc(w * .86, h * .66, w * .008, 0, 7); c.fill(); }
}
// monitor_screen / cctv_grid um Tür & Co. erweitern: Raumzeichnung umhüllen
const _feedRoom = feedRoom;
feedRoom = function (c, kind, w, h, t, o = {}) {
  if (kind === 'guest') { _feedRoom(c, 'bedroom', w, h, t, o); }
  else _feedRoom(c, kind, w, h, t, o);
  if (o && o._lt != null) feedExtras(c, w, h, o._lt, t, o);
};
const _monitor = SCENES.monitor_screen;
SCENES.monitor_screen = (c, lt, b, gt) => {
  const p = b.p || {}; p._lt = lt;
  if (p.flashFrames) { let fr = p.flashFrames[0]; for (const q of p.flashFrames) if (lt >= q.at) fr = q;
    p.figures = fr.figures || []; p.stamp = fr.stamp; p.stampT = null; p.door = fr.door != null ? fr.door : p.door; p.bundleRing = fr.ring ? fr.at + .05 : null; p._frameAt = fr.at; }
  if (p.flickerClean) { const [f0, f1] = p.flickerClean; const inF = lt >= f0 && lt < f1; p.clean = inF && Math.floor((lt - f0) * 5) % 2 === 0; }
  const dsc = p.scale != null ? p.scale : ((p.device || 'baby') === 'none' ? 1 : .8), top = p.top || 330;
  bgFill(c, '#0b0b0e', '#040405');
  c.save(); c.translate(540, top); c.scale(dsc, dsc); c.translate(-540, -330);
  monitorInner(c, lt, b, gt, p);
  c.restore();
};
function monitorInner(c, lt, b, gt, p) {
  _monitor(c, lt, b, gt);
  // Overlays im Bildschirm: stumm-Symbol, Ring um Zeitstempel, Kamera-Punkt
  const dev = p.device || 'baby'; let sx = 140, sy = 420, sw = 800, sh = 960;
  if (dev === 'tablet') { sx = 100; sy = 410; sw = 880; sh = 1220; } else if (dev === 'none') { sx = 0; sy = 0; sw = W; sh = H; }
  if (p.muted && p.mutedPulse != null && lt > p.mutedPulse) { c.save(); const k = E.back(prog(lt, p.mutedPulse, p.mutedPulse + .25)); c.translate(sx + sw - 170, sy + sh - 62); c.scale(k, k);
    rr(c, -60, -24, 120, 48, 10); c.fillStyle = '#d0141c'; glow(c, 'rgba(255,30,30,.9)', 20); c.fill(); noGlow(c); txt(c, 'MUTED', 0, 11, '700 28px SMono', '#fff'); c.restore(); }
  if (p.unmuteAt != null && lt >= p.unmuteAt) p.muted = false;
  if (p.waveform != null && lt >= p.waveform) { c.save(); c.beginPath(); c.rect(sx, sy, sw, sh); c.clip(); const n = 40;
    for (let i = 0; i < n; i++) { const a = (.25 + .75 * Math.abs(noise(gt * 9 + i * .7, 77))) * clamp(prog(lt, p.waveform, p.waveform + .3)); const hh = 10 + 90 * a;
      c.fillStyle = `rgba(255,60,60,${.35 + .4 * a})`; c.fillRect(sx + sw * .1 + i * sw * .8 / n, sy + sh * .82 - hh / 2, sw * .8 / n * .6, hh); } c.restore(); }
  if (p.muted) { const pulse = p.mutedPulse != null && lt > p.mutedPulse && lt < p.mutedPulse + .8 ? 1 + .25 * Math.sin((lt - p.mutedPulse) * 8) : 1;
    const ix = sx + sw - 70, iy = sy + sh - 62; c.save(); c.translate(ix, iy); c.scale(pulse, pulse); c.fillStyle = '#e8e8ee'; c.strokeStyle = '#e8e8ee'; c.lineWidth = 5;
    c.beginPath(); c.moveTo(-26, -9); c.lineTo(-14, -9); c.lineTo(0, -22); c.lineTo(0, 22); c.lineTo(-14, 9); c.lineTo(-26, 9); c.closePath(); c.fill();
    c.strokeStyle = '#ff3a3a'; c.lineWidth = 6; c.beginPath(); c.moveTo(-30, -26); c.lineTo(22, 26); c.stroke(); c.restore(); }
  if (p.stampRing != null && lt >= p.stampRing) { const k = .6 + .4 * Math.sin(gt * 6); c.save(); c.strokeStyle = `rgba(255,50,50,${k})`; c.lineWidth = 6; glow(c, 'rgba(255,40,40,1)', 25);
    rr(c, sx + 14, sy + sh * .95 - 58, 360, 80, 20); c.stroke(); noGlow(c); c.restore(); }
  if (p.rewind && lt >= p.rewind[0] && lt < p.rewind[1]) { c.save(); c.beginPath(); c.rect(sx, sy, sw, sh); c.clip();
    for (let k = 0; k < 6; k++) { const yy = sy + ((lt * 900 + k * 180) % sh); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(sx, yy, sw, 6 + (k % 3) * 4); }
    txt(c, '◀◀ REWIND', sx + sw / 2, sy + sh / 2, '700 64px SMono', '#ffffff'); c.restore(); }
  if (p.gapRing != null && lt >= p.gapRing) { const k = E.back(prog(lt, p.gapRing, p.gapRing + .3)); c.save(); c.strokeStyle = '#ff3030'; c.lineWidth = 7; glow(c, 'rgba(255,40,40,1)', 25);
    const z = p.feedZoom ? lerp(p.feedZoom[0], p.feedZoom[1], E.inOut(clamp(lt / Math.max(.1, (b.end - b.start) || 1)))) : 1, fz = p.feedFocus || [.5, .5];
    const gx = sx + sw * fz[0] + (sw * .14 - sw * fz[0]) * z, gy = sy + sh * fz[1] + (sh * .31 - sh * fz[1]) * z;
    c.beginPath(); c.ellipse(gx, gy, 90 * z * k, 70 * z * k, 0, 0, 7); c.stroke(); noGlow(c); c.restore(); }
  if (p.camDot) { const on = (gt % 1.2) < .6; c.fillStyle = on ? '#ff2b2b' : '#3a0a0a'; if (on) glow(c, 'rgba(255,40,40,1)', 20); c.beginPath(); c.arc(sx + sw * .9, sy + sh * .06, 12, 0, 7); c.fill(); noGlow(c); }
}

// ---------- Overlays im Bildschirmraum ----------
POST_HOOKS.push((c, t, b, lt) => {
  for (const pp of (b.pops || [])) { // kleine Text-Pops (z. B. CREAK)
    if (lt < pp.at || lt > pp.at + (pp.dur || .7)) continue;
    const k = E.back(prog(lt, pp.at, pp.at + .15)), fa = 1 - prog(lt, pp.at + (pp.dur || .7) - .25, pp.at + (pp.dur || .7));
    c.save(); c.globalAlpha = fa; c.translate(pp.x || 540, pp.y || 900); c.rotate(pp.rot != null ? pp.rot : -.08); c.scale(lerp(1.4, 1, k), lerp(1.4, 1, k));
    glow(c, 'rgba(255,30,30,1)', 20); txt(c, pp.text, 0, 0, `400 ${pp.size || 70}px Anton`, '#ff4a4a', 'center', 'middle', 2); noGlow(c); c.restore();
  }
  if (b.hudRing != null && lt >= b.hudRing) { const k = .6 + .4 * Math.sin(t * 6); c.strokeStyle = `rgba(255,50,50,${k})`; c.lineWidth = 6; glow(c, 'rgba(255,40,40,1)', 25);
    rr(c, 30, 110, 480, 140, 24); c.stroke(); noGlow(c); }
});

// ---------- Foto-Motive & Vergleichs-Icons ----------
const _drawPhoto = drawPhoto;
drawPhoto = function (c, x, y, w, h, t, p) {
  if (p.kind === 'hall_dark') { c.save(); c.translate(x, y); c.fillStyle = '#030304'; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(90,90,100,.35)'; c.lineWidth = 3; c.strokeRect(w * .38, h * .3, w * .24, h * .55);
    c.fillStyle = 'rgba(255,60,60,.75)'; glow(c, 'rgba(255,30,30,.9)', 8); c.beginPath(); c.arc(w * .47, h * .14, 3.5, 0, 7); c.arc(w * .53, h * .14, 3.5, 0, 7); c.fill(); noGlow(c);
    if (p.ring) { c.strokeStyle = '#ff3030'; c.lineWidth = 4; glow(c, 'rgba(255,40,40,1)', 12); c.beginPath(); c.ellipse(w * .5, h * .14, w * .14, h * .1, 0, 0, 7); c.stroke(); noGlow(c); }
    feedFX(c, w, h, t, 7, { label: 'HALL', stamp: p.stamp, rec: true, stampScale: 1.5 }); c.restore(); return; }
  if (p.kind === 'hall_you') { c.save(); c.translate(x, y); c.save(); c.scale(w / 490, h / 620); feedRoom(c, 'corridor', 490, 620, t, {}); feedFigure(c, 490, 620, 99, { kind: 'you', pose: 'stand', x: .5, y: .78, h: .36 }); c.restore();
    feedFX(c, w, h, t, 5, { label: 'HALL', stamp: p.stamp, rec: true }); c.restore(); return; }
  if (p.kind === 'grid4' || p.kind === 'nursery_you' || p.kind === 'feed') {
    c.save(); c.translate(x, y); c.fillStyle = '#0a0a0c'; c.fillRect(0, 0, w, h);
    const one = (fx, fy, fw, fh, room, figs, label) => { c.save(); c.beginPath(); c.rect(fx, fy, fw, fh); c.clip(); c.translate(fx, fy);
      c.save(); c.scale(fw / 490, fh / 620); feedRoom(c, room, 490, 620, t, { door: room === 'nursery' ? .35 : null, _lt: 0 }); (figs || []).forEach(f => feedFigure(c, 490, 620, 99, f)); c.restore();
      feedFX(c, fw, fh, t, 1, { label, stamp: p.stamp, rec: true }); c.restore(); c.strokeStyle = '#2a2a32'; c.lineWidth = 2; c.strokeRect(fx, fy, fw, fh); };
    if (p.kind === 'grid4') { const g = 4, fw = (w - g) / 2, fh = (h - g) / 2;
      one(0, 0, fw, fh, 'nursery', [], 'NURSERY'); one(fw + g, 0, fw, fh, 'corridor', [], 'HALL'); one(0, fh + g, fw, fh, 'stairs', [], 'STAIRS');
      one(fw + g, fh + g, fw, fh, 'guest', [{ kind: 'you', pose: 'sit', x: .3, y: .78, h: .38 }].concat(p.shapeGuest ? [{ kind: 'shape', pose: 'hunch', flip: true, x: .5, y: .86, h: .8, eyes: 0 }] : []), 'GUEST RM');
      if (p.shapeGuest) { c.strokeStyle = '#ff3030'; c.lineWidth = 4; glow(c, 'rgba(255,40,40,1)', 14); c.strokeRect(fw + g + 2, fh + g + 2, fw - 4, fh - 4); noGlow(c); } }
    else if (p.kind === 'nursery_you') one(0, 0, w, h, 'nursery', [{ kind: 'you', pose: 'stand', x: .72, y: .9, h: .5 }], 'NURSERY');
    else one(0, 0, w, h, p.room || 'nursery', p.figures || [], p.label || 'CAM');
    c.restore(); return;
  }
  return _drawPhoto(c, x, y, w, h, t, p);
};
const _drawIcon = drawIcon;
drawIcon = function (c, name, x, y, lt, gt) {
  if (name === 'stairs') { c.save(); c.translate(x, y); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 12; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(-150, 170); for (let k = 0; k < 5; k++) { c.lineTo(-150 + k * 60, 170 - k * 60); c.lineTo(-90 + k * 60, 170 - k * 60); } c.stroke();
    c.strokeRect(80, -230, 90, 150); c.fillStyle = 'rgba(255,40,40,.9)'; glow(c, 'rgba(255,40,40,1)', 20); c.fillRect(80, -84, 90, 6); noGlow(c); c.restore(); return; }
  if (name === 'fist') { c.save(); c.translate(x, y); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 10; c.setLineDash([14, 10]); c.strokeRect(-110, -250, 220, 80); c.setLineDash([]);
    c.beginPath(); c.moveTo(-170, -160); c.lineTo(170, -160); c.stroke();
    const st = stick(c, 0, 170, 300, { ...BASE, re: [.07, -.98], rh: [.05, -1.1], le: [-.12, -.62], lh: [-.16, -.46] }, gt, { color: '#d9d9df', hood: true });
    c.fillStyle = '#d9d9df'; c.beginPath(); c.arc(st.hand[0], st.hand[1], 14, 0, 7); c.fill(); c.restore(); return; }
  if (name === 'crib') { c.save(); c.translate(x, y); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 10; c.strokeRect(-150, -40, 300, 150); for (let k = 1; k < 7; k++) { c.beginPath(); c.moveTo(-150 + k * 43, -40); c.lineTo(-150 + k * 43, 110); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(-30, 70, 60, 22, 0, 0, 7); c.fill();
    txt(c, 'z', 70 + Math.sin(gt * 2) * 6, -90, '700 54px Mont', 'rgba(255,255,255,.6)'); txt(c, 'z', 110 + Math.sin(gt * 2 + 1) * 6, -150, '700 40px Mont', 'rgba(255,255,255,.4)'); c.restore(); return; }
  if (name === 'bed') { c.save(); c.translate(x, y); c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(-170, 40, 340, 80); c.fillRect(-170, -20, 30, 160);
    stick(c, -60, 90, 230, { ...BASE, hip: [0, -.44], lk: [.2, -.42], lf: [.22, -.08], rk: [.22, -.4], rf: [.24, -.06] }, gt, { color: '#d9d9df', hood: true });
    rr(c, 110, -10, 60, 80, 10); c.fillStyle = '#d0ced3'; glow(c, 'rgba(220,220,230,.8)', 20); c.fill(); noGlow(c); c.restore(); return; }
  if (name === 'feed_empty' || name === 'feed_shape') { // Mini-Feed als Vergleichsbild
    const w = 340, h = 440; c.save(); c.translate(x - w / 2, y - h / 2 - 40); c.beginPath(); c.rect(0, 0, w, h); c.clip();
    c.save(); c.scale(w / 490, h / 620); feedRoom(c, 'nursery', 490, 620, gt, { door: .35, _lt: lt });
    if (name === 'feed_shape') feedFigure(c, 490, 620, 99, { kind: 'shape', pose: 'bend', x: .38, y: .86, h: .72, eyes: 0 });
    c.restore(); feedFX(c, w, h, gt, name.length, { label: name === 'feed_shape' ? 'MONITOR' : 'LIVE', stamp: null, rec: true }); c.restore();
    c.strokeStyle = '#3a3a44'; c.lineWidth = 4; c.strokeRect(x - w / 2, y - h / 2 - 40, w, h); return;
  }
  return _drawIcon(c, name, x, y, lt, gt);
};

const _cctv = SCENES.cctv_grid;
SCENES.cctv_grid = (c, lt, b, gt) => { (b.p && b.p.feeds || []).forEach(f => { f._lt = lt; }); _cctv(c, lt, b, gt); };

// Eingeblendete Foto-Karte (z. B. Mrs. Hales Foto neben dem Monitor): beat.card = {at, until, kind, stamp, x, y, w, h, rot}
POST_HOOKS.push((c, t, b, lt) => {
  const q = b.card; if (!q || lt < q.at || (q.until != null && lt > q.until)) return;
  const k = E.back(prog(lt, q.at, q.at + .3)), w = q.w || 420, h = q.h || 520, x = q.x || 620, y = q.y || 360;
  c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(q.rot != null ? q.rot : .06); c.scale(lerp(.6, 1, k), lerp(.6, 1, k)); c.globalAlpha = clamp(k * 1.3);
  glow(c, 'rgba(0,0,0,.9)', 40); c.fillStyle = '#eceaea'; c.fillRect(-w / 2 - 16, -h / 2 - 16, w + 32, h + 70); noGlow(c);
  drawPhoto(c, -w / 2, -h / 2, w, h, t, { kind: q.kind || 'nursery_you', stamp: q.stamp, shapeGuest: q.shapeGuest });
  if (q.caption) txt(c, q.caption, 0, h / 2 + 42, '700 30px Caveat', '#2a2326');
  c.restore();
});

// Ende: schwarzer Spalt mit zwei roten Punkten hinter dem Titel (beat.endEyes = Zeit)
END_BG.push((c, lt, b, t) => {
  if (b.endEyes == null || lt < b.endEyes) return;
  const k = clamp(prog(lt, b.endEyes, b.endEyes + .4)); c.save(); c.globalCompositeOperation = 'destination-over';
  c.restore(); c.save(); c.globalAlpha = .9 * k; c.fillStyle = '#000'; c.fillRect(855, 420, 26, 760);
  const blink = ((lt - b.endEyes) % 1.6) < 1.3; if (blink) { c.fillStyle = '#ff2b2b'; glow(c, 'rgba(255,30,30,1)', 14); c.beginPath(); c.arc(862, 640, 5, 0, 7); c.arc(875, 640, 5, 0, 7); c.fill(); noGlow(c); }
  c.restore();
});

// Endkarte: schwache Gestalt hinter dem Titel (beat.endShape = {at, eyes, finger})
END_BG.push((c, lt, b, t) => {
  const q = b.endShape; if (!q || lt < q.at) return;
  c.save(); c.globalAlpha = .45 * clamp(prog(lt, q.at, q.at + .3));
  shapeEntity(c, 880, 1500, 1250, t, { pose: 'finger', from: 'stand', blend: q.finger != null ? prog(lt, q.finger, q.finger + .6) : 1,
    eyes: q.eyes != null ? clamp(prog(lt, q.eyes, q.eyes + .3)) * 2.2 : 0, headTurn: q.turn != null ? E.inOut(prog(lt, q.turn, q.turn + .6)) : 1, rimColor: 'rgba(255,40,40,.5)' });
  c.restore();
});
