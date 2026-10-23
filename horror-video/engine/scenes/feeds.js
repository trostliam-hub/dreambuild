'use strict';
// Kamera-Feeds: monitor_screen (ein Feed, z. B. Babyphone) und cctv_grid (2x2 Überwachungskameras).
// Räume werden in Graustufen gezeichnet, darüber Rauschen, Scanlines, REC und Zeitstempel.

const FEED_BG = '#1b1b1f';
function feedRoom(c, kind, w, h, t, o = {}) {
  // Koordinaten 0..w, 0..h (Feed-Raum). Leichte Vogelperspektive aus einer Raumecke.
  c.fillStyle = FEED_BG; c.fillRect(0, 0, w, h);
  const wallH = h * .55;
  c.fillStyle = '#26262b'; c.fillRect(0, 0, w, wallH);
  c.fillStyle = '#1e1e22'; c.beginPath(); c.moveTo(0, wallH); c.lineTo(w, wallH); c.lineTo(w, h); c.lineTo(0, h); c.fill();
  c.strokeStyle = '#34343a'; c.lineWidth = Math.max(2, w * .004);
  c.beginPath(); c.moveTo(0, wallH); c.lineTo(w, wallH); c.stroke();
  const L = (x1, y1, x2, y2) => { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); };
  if (kind === 'nursery') {
    // Fenster mit Vorhang, Krippe mit Gitterstäben, Mobile
    c.fillStyle = '#121216'; c.fillRect(w * .62, h * .12, w * .22, h * .28); c.strokeStyle = '#3a3a42'; c.strokeRect(w * .62, h * .12, w * .22, h * .28);
    c.fillStyle = '#2e2e35'; c.fillRect(w * .58, h * .1, w * .06, h * .36); c.fillRect(w * .82, h * .1, w * .06, h * .36);
    const cx = w * .22, cy = h * .5, cw = w * .4, ch = h * .3;
    c.fillStyle = '#2f2f36'; c.fillRect(cx, cy + ch * .7, cw, ch * .3); // Matratze/Front
    c.strokeStyle = '#4a4a52'; c.lineWidth = Math.max(2, w * .006);
    c.strokeRect(cx, cy, cw, ch); for (let i = 1; i < 10; i++) L(cx + cw * i / 10, cy, cx + cw * i / 10, cy + ch);
    c.fillStyle = '#3c3c44'; c.beginPath(); c.ellipse(cx + cw * .35, cy + ch * .62, cw * .12, ch * .12, 0, 0, 7); c.fill(); // Baby-Decke
    // Mobile
    const mx = cx + cw * .5, my = h * .1, sw = Math.sin(t * .8) * w * .01; c.strokeStyle = '#4a4a52'; L(mx, 0, mx + sw, my); L(mx - w * .08 + sw, my, mx + w * .08 + sw, my);
    for (let i = 0; i < 3; i++) { const x = mx - w * .08 + sw + i * w * .08; L(x, my, x, my + h * .06); c.fillStyle = '#55555e'; c.beginPath(); c.arc(x, my + h * .075, w * .012, 0, 7); c.fill(); }
    if (o.rocking) { c.save(); c.globalAlpha = .5; c.strokeStyle = '#6a6a74'; L(cx + cw + w * .02, cy + ch, cx + cw + w * .02 + Math.sin(t * 2) * w * .01, cy); c.restore(); }
  } else if (kind === 'bedroom') {
    c.fillStyle = '#121216'; c.fillRect(w * .65, h * .1, w * .2, h * .3); c.strokeStyle = '#3a3a42'; c.strokeRect(w * .65, h * .1, w * .2, h * .3);
    c.fillStyle = '#303037'; c.fillRect(w * .1, h * .52, w * .5, h * .2); c.fillStyle = '#3a3a42'; c.fillRect(w * .1, h * .48, w * .12, h * .1);
    if (o.sleeper) { c.fillStyle = '#5c5c66'; c.beginPath(); c.arc(w * .17, h * .5, w * .035, 0, 7); c.fill(); c.fillStyle = '#3e3e46'; c.fillRect(w * .2, h * .5, w * .38, h * .08); }
    c.strokeStyle = '#3a3a42'; c.strokeRect(w * .9, h * .2, w * .1, h * .5); // Tür rechts
  } else if (kind === 'living') {
    c.fillStyle = '#303037'; c.fillRect(w * .15, h * .55, w * .45, h * .14); c.fillRect(w * .15, h * .45, w * .45, h * .1); // Sofa
    c.fillStyle = '#121216'; c.fillRect(w * .7, h * .25, w * .2, h * .2); c.strokeStyle = '#3a3a42'; c.strokeRect(w * .7, h * .25, w * .2, h * .2); // TV
    c.fillStyle = '#2a2a30'; c.fillRect(w * .72, h * .45, w * .16, h * .12);
  } else if (kind === 'corridor') {
    const vx = w * .5, vy = h * .42; c.strokeStyle = '#3a3a42';
    L(0, 0, vx - w * .1, vy - h * .12); L(w, 0, vx + w * .1, vy - h * .12); L(0, h, vx - w * .1, vy + h * .12); L(w, h, vx + w * .1, vy + h * .12);
    c.fillStyle = '#121216'; c.fillRect(vx - w * .1, vy - h * .12, w * .2, h * .24);
    for (const a of [.3, .55]) { c.strokeRect(lerp(0, vx - w * .1, a), lerp(0, vy - h * .12, a) + h * .1, w * .05, h * .25 * (1 - a)); c.strokeRect(lerp(w, vx + w * .1, a) - w * .05, lerp(0, vy - h * .12, a) + h * .1, w * .05, h * .25 * (1 - a)); }
  } else if (kind === 'stairs') {
    c.strokeStyle = '#3e3e46'; for (let i = 0; i < 8; i++) { const y = h * (.35 + i * .08); L(w * (.2 + i * .04), y, w * (.75 + i * .02), y); L(w * (.75 + i * .02), y, w * (.75 + i * .02), y + h * .08); }
    L(w * .15, h * .3, w * .5, h * .95);
  } else if (kind === 'entrance') {
    c.fillStyle = '#141418'; c.fillRect(w * .35, h * .15, w * .3, h * .55); c.strokeStyle = '#44444c'; c.strokeRect(w * .35, h * .15, w * .3, h * .55);
    L(w * .5, h * .15, w * .5, h * .7); c.fillStyle = '#2e2e35'; c.fillRect(w * .1, h * .6, w * .18, h * .1); // Theke
  } else if (kind === 'parking') {
    c.strokeStyle = '#4a4a52'; for (let i = 0; i < 5; i++) L(w * (.1 + i * .2), h * .6, w * (.05 + i * .22), h);
    c.fillStyle = '#2c2c33'; c.fillRect(w * .28, h * .66, w * .16, h * .14);
    c.fillStyle = '#3a3a42'; c.fillRect(w * .78, h * .05, w * .02, h * .5);
  } else if (kind === 'aisle') {
    c.fillStyle = '#2a2a30'; c.fillRect(0, h * .1, w * .25, h * .8); c.fillRect(w * .75, h * .1, w * .25, h * .8);
    c.strokeStyle = '#3a3a42'; for (let i = 0; i < 5; i++) { L(0, h * (.2 + i * .14), w * .25, h * (.2 + i * .14)); L(w * .75, h * (.2 + i * .14), w, h * (.2 + i * .14)); }
  }
}
function feedFigure(c, w, h, t, f) {
  // f: {kind: 'shade'|'pale'|'child', x (0..1), y (0..1 Fußpunkt), h (0..1), at, eyes (Zeit), look}
  if (!f || t < (f.at || 0)) return;
  const a = clamp(prog(t, f.at || 0, (f.at || 0) + (f.fade != null ? f.fade : .15)));
  c.save(); c.globalAlpha = a * (f.alpha || 1);
  const x = (f.x != null ? f.x : .5) * w, y = (f.y != null ? f.y : .75) * h, fh = (f.h || .5) * h;
  if (f.kind === 'pale' || f.kind === 'child') {
    stick(c, x, y, fh, f.pose || 'stand', t, { color: f.kind === 'child' ? '#b8b8c2' : '#d8d8de', lw: fh * .05, face: f.face || null, smile: f.smile || 0, faceColor: '#111' });
  } else {
    shade(c, x, y, fh, t, { color: '#060607', eyes: f.eyes != null && t > f.eyes ? clamp(prog(t, f.eyes, f.eyes + .3)) : 0 });
  }
  c.restore();
}
function feedFX(c, w, h, t, seed, o = {}) {
  // Rauschen, Scanlines, Vignette, REC, Zeitstempel, Label
  if (o.clean) { const vg0 = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .3, w / 2, h / 2, Math.max(w, h) * .75); vg0.addColorStop(0, 'rgba(0,0,0,0)'); vg0.addColorStop(1, 'rgba(0,0,0,.55)'); c.fillStyle = vg0; c.fillRect(0, 0, w, h);
    if (o.hud === false) return; }
  else {
  c.save();
  const g = grain[Math.floor(t * 24 + seed) % 6]; c.globalAlpha = .22; c.globalCompositeOperation = 'screen'; c.drawImage(g, 0, 0, w, h); c.restore();
  c.save(); c.fillStyle = 'rgba(0,0,0,.18)'; for (let y = (t * 40 + seed * 7) % 4; y < h; y += 4) c.fillRect(0, y, w, 1.5); c.restore();
  const vg = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .3, w / 2, h / 2, Math.max(w, h) * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.65)'); c.fillStyle = vg; c.fillRect(0, 0, w, h);
  if (o.hud === false) return; }
  const fs = Math.max(16, w * .045);
  if (o.rec !== false) { c.fillStyle = (t % 1) < .55 ? '#ff2b2b' : 'rgba(255,43,43,.25)'; c.beginPath(); c.arc(w * .06, h * .07, fs * .32, 0, 7); c.fill(); txt(c, 'REC', w * .06 + fs * .55, h * .07 + fs * .35, `700 ${fs}px SMono`, '#e8e8ee', 'left'); }
  if (o.label) txt(c, o.label, w * .95, h * .07 + fs * .35, `700 ${fs}px SMono`, '#e8e8ee', 'right');
  if (o.stamp) txt(c, o.stamp, w * .05, h * .95, `700 ${fs * .9}px SMono`, '#e8e8ee', 'left');
  if (o.dead) { c.save(); c.globalAlpha = .95; c.drawImage(grain[Math.floor(t * 30) % 6], 0, 0, w, h); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, 0, w, h); txt(c, o.deadText || 'NO SIGNAL', w / 2, h / 2, `700 ${fs * 1.2}px SMono`, '#ff5a5a'); c.restore(); }
}
function stampAt(base, lt) { // "03:12:05" oder "11:30 PM" + lt Sekunden
  const m = /^(\d\d?):(\d\d)(?::(\d\d))?\s*(AM|PM)?$/.exec(base || '03:12:00'); if (!m) return base;
  let s = (+m[1]) * 3600 + (+m[2]) * 60 + (+(m[3] || 0)) + Math.floor(lt); const p = n => String(n).padStart(2, '0');
  if (m[4]) { let hh = Math.floor(s / 3600), ap = m[4]; if (hh >= 12 && +m[1] !== 12) { ap = ap === 'PM' ? 'AM' : 'PM'; } hh = ((hh - 1) % 12) + 1;
    return `${hh}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)} ${ap}`; }
  return `${p(Math.floor(s / 3600) % 24)}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}`;
}

SCENES.monitor_screen = (c, lt, b, gt) => {
  // p: room, figure {...}, label, stamp ("03:12:00"), device: 'baby'|'tablet'|'none', glitchAt [t], static (t: Bildausfall), sleeper, rocking, red (rote Tönung)
  const p = b.p || {};
  bgFill(c, '#0b0b0e', '#040405');
  const dev = p.device || 'baby';
  let sx = 110, sy = 360, sw = 860, sh = 1100;
  c.save(); c.translate(0, dev === 'none' ? 0 : 70);
  if (dev === 'baby') { // Babyphone-Gehäuse
    rr(c, 70, 260, 940, 1380, 90); c.fillStyle = '#e4e2e6'; glow(c, 'rgba(0,0,0,.8)', 50); c.fill(); noGlow(c);
    rr(c, 70, 260, 940, 1380, 90); c.lineWidth = 6; c.strokeStyle = '#bdbac0'; c.stroke();
    rr(c, 120, 330, 840, 1000, 30); c.fillStyle = '#0a0a0c'; c.fill();
    sx = 140; sy = 350; sw = 800; sh = 960;
    for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(400 + i * 140, 1460, 34, 0, 7); c.fillStyle = '#c9c6cc'; c.fill(); }
    c.beginPath(); c.arc(860, 1460, 16, 0, 7); c.fillStyle = (gt % 1.4) < 1 ? '#4dff7a' : '#1d3a24'; c.fill(); // Power-LED
    for (let i = 0; i < 5; i++) { c.fillStyle = i < (p.signal != null ? p.signal : 4) ? '#4a4a52' : '#d0ced3'; c.fillRect(170 + i * 22, 1430 - i * 8, 14, 20 + i * 8); }
  } else if (dev === 'tablet') {
    rr(c, 60, 300, 960, 1300, 60); c.fillStyle = '#16161b'; glow(c, 'rgba(0,0,0,.8)', 50); c.fill(); noGlow(c); c.lineWidth = 6; c.strokeStyle = '#3d3d47'; c.stroke();
    sx = 100; sy = 340; sw = 880; sh = 1220;
  } else { sx = 0; sy = 0; sw = W; sh = H; }
  c.restore(); if (dev !== 'none') sy += 70;
  c.save(); c.beginPath(); c.rect(sx, sy, sw, sh); c.clip(); c.translate(sx, sy);
  const z = p.feedZoom ? lerp(p.feedZoom[0], p.feedZoom[1], E.inOut(clamp(lt / Math.max(.1, (b.end - b.start) || 1)))) : 1;
  const fz = p.feedFocus || [.5, .5];
  c.translate(sw * fz[0], sh * fz[1]); c.scale(z, z); c.translate(-sw * fz[0], -sh * fz[1]);
  feedRoom(c, p.room || 'nursery', sw, sh, gt, p);
  (p.figures || (p.figure ? [p.figure] : [])).forEach(f => feedFigure(c, sw, sh, lt, f));
  c.restore();
  c.save(); c.beginPath(); c.rect(sx, sy, sw, sh); c.clip(); c.translate(sx, sy);
  if (p.red) { c.fillStyle = 'rgba(255,0,0,.12)'; c.fillRect(0, 0, sw, sh); }
  const dead = p.static != null && lt >= p.static && (p.staticEnd == null || lt < p.staticEnd);
  if (p.redLight) { c.fillStyle = 'rgba(255,30,30,.10)'; c.fillRect(0, 0, sw, sh); spot(c, sw * .86, sh * .66, sw * .5, RED, .22); }
  feedFX(c, sw, sh, gt, 3, { label: p.label != null ? p.label : 'NURSERY CAM', stamp: p.stamp && !p.hideStamp ? stampAt(p.stamp, lt) : null, dead, deadText: p.staticText, clean: p.clean, hud: p.hud, rec: p.rec });
  c.restore();
};

SCENES.cctv_grid = (c, lt, b, gt) => {
  // p.feeds: [{room, label, figure|figures, dead (t), deadEnd, stamp}] x4; p.focus: {feed, at, dur} zoomt einen Feed auf Vollbild
  const p = b.p || {};
  bgFill(c, '#08080a', '#040405');
  const feeds = p.feeds || [];
  const gx = 40, gy = 330, cw = 490, chh = 620, gap = 20;
  const fo = p.focus; const fk = fo && lt >= fo.at ? E.inOut(prog(lt, fo.at, fo.at + (fo.dur || .6))) : 0;
  const draw = (i, x, y, w, h) => {
    const f = feeds[i] || {}; c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.translate(x, y);
    c.save(); c.scale(w / 490, h / 620); feedRoom(c, f.room || 'corridor', 490, 620, gt, f); (f.figures || (f.figure ? [f.figure] : [])).forEach(fg => feedFigure(c, 490, 620, lt, fg)); c.restore();
    const dead = f.dead != null && lt >= f.dead && (f.deadEnd == null || lt < f.deadEnd);
    feedFX(c, w, h, gt, i * 5, { label: f.label || `CAM ${i + 1}`, stamp: stampAt(f.stamp || p.stamp, lt), dead, deadText: f.deadText, rec: true, clean: p.clean || f.clean });
    c.restore(); c.strokeStyle = f.alert && lt >= f.alert ? '#ff3030' : '#2a2a32'; c.lineWidth = f.alert && lt >= f.alert ? 8 : 4;
    if (f.alert && lt >= f.alert) glow(c, 'rgba(255,40,40,.9)', 30); c.strokeRect(x, y, w, h); noGlow(c);
  };
  for (let i = 0; i < 4; i++) {
    if (fo && fo.feed === i && fk > 0) continue;
    draw(i, gx + (i % 2) * (cw + gap), gy + Math.floor(i / 2) * (chh + gap), cw, chh);
  }
  if (fo && fk > 0) { const i = fo.feed, x0 = gx + (i % 2) * (cw + gap), y0 = gy + Math.floor(i / 2) * (chh + gap);
    draw(i, lerp(x0, 40, fk), lerp(y0, 330, fk), lerp(cw, 1000, fk), lerp(chh, 1260, fk)); }
  if (p.title !== '') { txt(c, p.title || 'SECURITY — LIVE', 1040, 312, '700 28px SMono', '#8d8d99', 'right', 'alphabetic', 5);
    if (p.live) { c.font = '700 28px SMono'; c.letterSpacing = '5px'; const tw = c.measureText(p.title).width; c.letterSpacing = '0px'; c.fillStyle = (gt % 1.2) < .8 ? '#3dff6e' : '#14501f'; c.beginPath(); c.arc(1040 - tw - 22, 302, 9, 0, 7); c.fill(); } }
};
