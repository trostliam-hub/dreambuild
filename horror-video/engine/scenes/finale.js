'use strict';
// Szenen für das Finale von "DON'T WAKE HER": Treppe nach oben, Kinderzimmer mit eigenen Augen,
// Haustür von innen (Schlüssel, Scheinwerfer, Eltern), Scheinwerfer über der Wohnzimmerwand.

// Gestalt in Szenen-Koordinaten (Parameter wie im Kamerabild: at/until/fade/pose/fromPose/poseAt/eyes/turn/move)
function sceneShape(c, lt, gt, f) {
  if (!f || lt < (f.at || 0) || (f.until != null && lt >= f.until)) return null;
  const a = clamp(prog(lt, f.at || 0, (f.at || 0) + (f.fade != null ? f.fade : .2)));
  const mv = f.move ? E.inOut(prog(lt, f.move[0], f.move[1])) : 0;
  const x = f.move ? lerp(f.x, f.move[2], mv) : f.x;
  c.save(); c.globalAlpha *= a * (f.alpha != null ? f.alpha : 1);
  const r = shapeEntity(c, x, f.y, f.h, gt, { pose: f.pose || 'stand', from: f.fromPose, blend: f.poseAt != null ? prog(lt, f.poseAt, f.poseAt + (f.poseDur || 1)) : null,
    color: f.color, eyes: f.eyes != null ? clamp(prog(lt, f.eyes, f.eyes + .4)) : 0, headTurn: f.turn != null ? E.inOut(prog(lt, f.turn, f.turn + 1.2)) : 1, flip: f.flip, rimColor: f.rim || 'rgba(255,40,40,.35)',
    wave: f.waveAt != null && lt >= f.waveAt && lt < f.waveAt + (f.waveDur || 1.6) ? lt - f.waveAt : null });
  c.restore(); return r;
}
// Dunkelheit mit Lichtkegel (Handylampe): radialer Verlauf, außen deckend
function torchDark(c, lt, p) {
  const tq = p.torch; let x = 540, y = 1000, r = 0;
  if (tq) { const k = tq.t1 != null ? E.inOut(prog(lt, tq.t0 || 0, tq.t1)) : 0; x = lerp(tq.x, tq.x1 != null ? tq.x1 : tq.x, k); y = lerp(tq.y, tq.y1 != null ? tq.y1 : tq.y, k);
    r = (tq.r || 420) * (.97 + .03 * noise(lt * 9, 21)) * (tq.on != null ? E.out(prog(lt, tq.on, tq.on + .25)) : 1); }
  const d = p.dark != null ? p.dark : .8;
  const g = c.createRadialGradient(x, y, r * .15, x, y, Math.max(1, r) * 1.05);
  g.addColorStop(0, `rgba(0,0,0,${r > 0 ? 0 : d})`); g.addColorStop(.7, `rgba(0,0,0,${r > 0 ? d * .45 : d})`); g.addColorStop(1, `rgba(0,0,0,${d})`);
  c.fillStyle = g; c.fillRect(-300, -300, W + 600, H + 600);
  if (r > 0) { c.save(); c.globalCompositeOperation = 'screen'; spot(c, x, y, r * .8, WHITEA, .07); c.restore(); }
}
function backHead(c, lt, p) { // Hinterkopf mit Kapuze im Vordergrund (wie im Flur)
  const turn = p.youTurn != null ? E.inOut(prog(lt, p.youTurn, p.youTurn + .6)) : 0;
  const hx = (p.youX || 540) + turn * 50, hy = 1380, R = 165;
  c.save(); c.fillStyle = '#0d0d10'; glow(c, 'rgba(255,40,40,.6)', 40);
  c.beginPath(); c.ellipse(hx, 1860, 400, 210, 0, Math.PI, 0); c.lineTo(hx + 400, H + 50); c.lineTo(hx - 400, H + 50); c.closePath(); c.fill();
  c.fillRect(hx - 65, 1500, 130, 260); c.beginPath(); c.arc(hx, hy, R, 0, 7); c.fill();
  noGlow(c); c.strokeStyle = 'rgba(255,80,80,.7)'; c.lineWidth = 6; c.beginPath(); c.arc(hx, hy, R + 2, Math.PI * .95, Math.PI * 2.05); c.stroke();
  if (turn > .3) { c.fillStyle = 'rgba(255,90,90,.8)'; c.beginPath(); c.ellipse(hx + R * .78, hy - 10, 10, 15, 0, 0, 7); c.fill(); }
  c.restore();
}

// ---------- Treppe nach oben, Tür mit Licht darunter ----------
SCENES.stairwell = (c, lt, b, gt) => {
  const p = b.p || {};
  bgFill(c, '#0b0b0e', '#050506');
  const top = 760, bot = H + 40, wT = 300, wB = 1180, n = 13;
  // Wände
  c.fillStyle = '#15151a'; c.beginPath(); c.moveTo(-100, -100); c.lineTo(540 - wT / 2 - 40, 250); c.lineTo(540 - wT / 2, top); c.lineTo(540 - wB / 2, bot); c.lineTo(-100, bot); c.fill();
  c.fillStyle = '#121216'; c.beginPath(); c.moveTo(W + 100, -100); c.lineTo(540 + wT / 2 + 40, 250); c.lineTo(540 + wT / 2, top); c.lineTo(540 + wB / 2, bot); c.lineTo(W + 100, bot); c.fill();
  // Tür oben
  const dx = 540 - 120, dw = 240, dy = 330, dh = top - dy;
  const lightA = (p.doorLight != null ? p.doorLight : 1) * (p.lightOn != null ? clamp(prog(lt, p.lightOn, p.lightOn + .3)) : 1) * (p.flicker ? flicker(gt, 23, 9) : .9 + .1 * noise(gt * 6, 4));
  const op = p.doorOpen != null ? E.inOut(prog(lt, p.doorOpen, p.doorOpen + (p.openDur || 1.6))) : 0;
  c.fillStyle = '#0e0e12'; c.fillRect(dx - 22, dy - 22, dw + 44, dh + 22);
  if (op > 0) { c.save(); c.fillStyle = `rgba(255,40,40,${.85 * lightA})`; glow(c, 'rgba(255,40,40,1)', 50); c.fillRect(dx, dy, dw, dh); noGlow(c); c.restore();
    sceneShape(c, lt, gt, p.shapeTop ? { x: 540, y: top - 4, h: 330, ...p.shapeTop } : null); }
  c.fillStyle = '#1b1b21'; c.fillRect(dx, dy, dw * (1 - op * .82), dh); // Türblatt schwingt nach innen
  if (op < .5) { c.fillStyle = '#3a3a44'; c.beginPath(); c.arc(dx + dw * (1 - op * .82) - 30, dy + dh * .55, 9, 0, 7); c.fill(); }
  // Lichtspalt unter der Tür + Fußschatten
  c.save(); c.globalAlpha = lightA * (1 - op); glow(c, 'rgba(255,40,40,1)', 30); c.fillStyle = '#ff3a3a'; c.fillRect(dx + 6, top - 7, dw - 12, 8); noGlow(c);
  if (p.feet != null && lt >= p.feet) { c.globalAlpha *= clamp(prog(lt, p.feet, p.feet + .4)); c.fillStyle = '#050506'; c.fillRect(dx + dw * .3, top - 8, 34, 10); c.fillRect(dx + dw * .58, top - 8, 34, 10); }
  c.restore();
  // Stufen
  for (let i = n - 1; i >= 0; i--) {
    const k0 = i / n, k1 = (i + 1) / n, e = q => Math.pow(q, 1.6);
    const y0 = lerp(top, bot, e(k0)), y1 = lerp(top, bot, e(k1)), w0 = lerp(wT, wB, e(k0)), w1 = lerp(wT, wB, e(k1)), ym = lerp(y0, y1, .45);
    c.fillStyle = '#1c1c22'; c.beginPath(); c.moveTo(540 - w0 / 2, y0); c.lineTo(540 + w0 / 2, y0); c.lineTo(540 + lerp(w0, w1, .45) / 2, ym); c.lineTo(540 - lerp(w0, w1, .45) / 2, ym); c.fill(); // Trittfläche
    c.fillStyle = '#101014'; c.beginPath(); c.moveTo(540 - lerp(w0, w1, .45) / 2, ym); c.lineTo(540 + lerp(w0, w1, .45) / 2, ym); c.lineTo(540 + w1 / 2, y1); c.lineTo(540 - w1 / 2, y1); c.fill(); // Setzstufe
    c.strokeStyle = 'rgba(255,60,60,.13)'; c.lineWidth = 3; c.beginPath(); c.moveTo(540 - w0 / 2, y0); c.lineTo(540 + w0 / 2, y0); c.stroke();
  }
  // roter Schein die Stufen herab
  c.save(); c.globalAlpha = lightA * (.55 + .45 * op); const g = c.createLinearGradient(0, top, 0, top + 700); g.addColorStop(0, 'rgba(255,40,40,.35)'); g.addColorStop(1, 'rgba(255,40,40,0)');
  c.fillStyle = g; c.beginPath(); c.moveTo(540 - wT / 2, top); c.lineTo(540 + wT / 2, top); c.lineTo(540 + 420, top + 700); c.lineTo(540 - 420, top + 700); c.fill(); c.restore();
  // Geländer rechts
  c.strokeStyle = '#2b2b33'; c.lineWidth = 14; c.beginPath(); c.moveTo(540 + wT / 2 - 10, top - 170); c.lineTo(540 + wB / 2 - 120, bot - 760); c.stroke();
  c.lineWidth = 7; for (let i = 0; i < 9; i++) { const k = i / 8, x = lerp(540 + wT / 2 - 10, 540 + wB / 2 - 120, k), y = lerp(top - 170, bot - 760, k);
    const yb = lerp(top, bot, Math.pow(lerp(0, .78, k), 1.6)); c.beginPath(); c.moveTo(x, y); c.lineTo(x + k * 30, yb - 6); c.stroke(); }
  if (p.youBack) backHead(c, lt, p);
};

// ---------- Kinderzimmer mit eigenen Augen ----------
SCENES.nursery_pov = (c, lt, b, gt) => {
  const p = b.p || {};
  bgFill(c, '#16161c', '#0b0b0f');
  const fy = 1330; // Bodenlinie
  c.fillStyle = '#0d0d11'; c.fillRect(-200, fy, W + 400, H);
  c.strokeStyle = 'rgba(255,255,255,.04)'; c.lineWidth = 3; for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(540 + i * 90, fy); c.lineTo(540 + i * 330, H); c.stroke(); }
  // Fenster mit Mondlicht
  c.fillStyle = '#20232c'; c.fillRect(650, 360, 250, 380); spot(c, 775, 550, 330, 'rgba(150,160,190,A)', .16);
  c.strokeStyle = '#0b0b0f'; c.lineWidth = 12; c.strokeRect(650, 360, 250, 380); c.beginPath(); c.moveTo(775, 360); c.lineTo(775, 740); c.moveTo(650, 550); c.lineTo(900, 550); c.stroke();
  c.fillStyle = '#121218'; c.fillRect(620, 330, 60, 470); c.fillRect(870, 330, 60, 470); // Vorhänge
  // Schrank links (Lamellentüren), Spalt geht auf
  const cx0 = 40, cy0 = 360, cw = 270, ch = fy - cy0;
  c.fillStyle = '#1a1a20'; c.fillRect(cx0 - 14, cy0 - 14, cw + 28, ch + 14);
  const gap = p.closetOpen != null ? E.inOut(prog(lt, p.closetOpen, p.closetOpen + (p.closetDur || 1.2))) * (p.closetGap || 70) : (p.closetGap0 || 0);
  c.fillStyle = '#020203'; c.fillRect(cx0 + cw / 2 - gap / 2, cy0, gap, ch);
  if (p.gapEyes != null && lt >= p.gapEyes && gap > 8) { const ea = clamp(prog(lt, p.gapEyes, p.gapEyes + .35)); c.fillStyle = `rgba(255,70,70,${ea})`; glow(c, 'rgba(255,30,30,1)', 22 * ea);
    c.beginPath(); c.ellipse(cx0 + cw / 2 - 14, cy0 + 300, 11, 7, 0, 0, 7); c.ellipse(cx0 + cw / 2 + 14, cy0 + 300, 11, 7, 0, 0, 7); c.fill(); noGlow(c); }
  for (const [x, w] of [[cx0, cw / 2 - gap / 2], [cx0 + cw / 2 + gap / 2, cw / 2 - gap / 2]]) {
    c.fillStyle = '#202027'; c.fillRect(x, cy0, w, ch); c.strokeStyle = '#2c2c35'; c.lineWidth = 5; c.strokeRect(x + 4, cy0 + 4, w - 8, ch - 8);
    c.strokeStyle = '#141419'; c.lineWidth = 4; for (let y = cy0 + 40; y < cy0 + ch - 30; y += 26) { c.beginPath(); c.moveTo(x + 18, y); c.lineTo(x + w - 18, y); c.stroke(); }
  }
  // Gestalt hinter dem Bett (vor der Wand, hinter dem Gitter)
  if (p.shape && !p.shape.front) sceneShape(c, lt, gt, { x: 540, y: fy + 10, h: 900, ...p.shape });
  // Mobile
  const mx = 540, my = 700, rot = gt * (p.mobileSpin != null ? p.mobileSpin : .5);
  c.strokeStyle = '#3a3a44'; c.lineWidth = 3; c.beginPath(); c.moveTo(mx, 0); c.lineTo(mx, my); c.stroke();
  for (let i = 0; i < 4; i++) { const a = rot + i * Math.PI / 2, x = mx + Math.cos(a) * 110, yy = my + 20 + Math.sin(a) * 14;
    c.beginPath(); c.moveTo(mx, my); c.lineTo(x, yy); c.lineTo(x, yy + 70); c.stroke(); c.fillStyle = Math.cos(a) > 0 ? '#5a5a66' : '#3a3a44';
    c.beginPath(); i % 2 ? c.arc(x, yy + 86, 16, 0, 7) : (c.moveTo(x, yy + 70), c.lineTo(x + 16, yy + 100), c.lineTo(x - 16, yy + 100)); c.fill(); }
  // Kinderbett
  const bx = 330, bw = 420, by = 1000, bh = 330;
  c.fillStyle = '#1d1d24'; c.fillRect(bx, by + 140, bw, 60); // Matratze
  if (!p.cribEmpty) { const br = 1 + .03 * Math.sin(gt * 2.2); c.fillStyle = '#cfcfd8'; c.beginPath(); c.ellipse(560, by + 128, 95 * br, 34 * br, 0, 0, 7); c.fill();
    c.fillStyle = '#e4e4ea'; c.beginPath(); c.arc(455, by + 118, 30, 0, 7); c.fill(); }
  c.strokeStyle = '#4a4a55'; c.lineWidth = 12; c.strokeRect(bx, by, bw, bh); c.lineWidth = 7;
  for (let x = bx + 30; x < bx + bw; x += 32) { c.beginPath(); c.moveTo(x, by); c.lineTo(x, by + bh); c.stroke(); }
  c.lineWidth = 14; c.beginPath(); c.moveTo(bx - 12, by - 40); c.lineTo(bx - 12, fy + 30); c.moveTo(bx + bw + 12, by - 40); c.lineTo(bx + bw + 12, fy + 30); c.stroke();
  if (p.shape && p.shape.front) sceneShape(c, lt, gt, { x: 540, y: fy + 120, h: 1000, ...p.shape });
  // Nachtlicht
  const nl = p.nightlight != null ? p.nightlight : 1; c.save(); c.globalAlpha = nl * (.8 + .2 * noise(gt * 3, 31));
  spot(c, 940, 1390, 260, RED, .4); glow(c, 'rgba(255,40,40,1)', 30); c.fillStyle = '#ff4646'; rr(c, 922, 1372, 36, 36, 10); c.fill(); noGlow(c); c.restore();
  if (p.seamRing != null && lt >= p.seamRing) { const k = 1 + .6 * (1 - E.out(prog(lt, p.seamRing, p.seamRing + .5))), fa = p.seamRingDur != null ? 1 - prog(lt, p.seamRing + p.seamRingDur - .3, p.seamRing + p.seamRingDur) : 1;
    c.save(); c.globalAlpha = fa * (p.seamFaint ? .5 + .3 * Math.sin(gt * 4) : 1); c.strokeStyle = '#ff3030'; c.lineWidth = 8; glow(c, 'rgba(255,40,40,1)', 24); c.beginPath(); c.ellipse(cx0 + cw / 2, cy0 + ch * .45, 80 * k, 330 * k, 0, 0, 7); c.stroke(); c.restore(); }
  if (p.slatEye != null && lt >= p.slatEye) { const a = clamp(prog(lt, p.slatEye, p.slatEye + .3)); c.save(); c.fillStyle = `rgba(255,70,70,${a})`; glow(c, 'rgba(255,30,30,1)', 26 * a);
    c.beginPath(); c.ellipse(cx0 + cw * .32, cy0 + 300, 16, 8, 0, 0, 7); c.fill(); c.restore(); }
  if (p.cry != null && lt >= p.cry && !(p.cryGap && lt >= p.cryGap[0] && lt < p.cryGap[1])) { c.save(); c.strokeStyle = 'rgba(255,90,90,.85)'; c.lineWidth = 7; c.lineCap = 'round'; // Weinen: zitternde Linien über dem Bett
    for (let k = 0; k < 5; k++) { const ph = ((lt - p.cry) * 1.4 + k / 5) % 1, a = -2.4 + k * .35; const r0 = 70 + ph * 160;
      c.globalAlpha = 1 - ph; c.beginPath(); c.moveTo(455 + Math.cos(a) * r0, by + 90 + Math.sin(a) * r0); c.lineTo(455 + Math.cos(a) * (r0 + 40), by + 90 + Math.sin(a) * (r0 + 40)); c.stroke(); } c.restore(); }
  if (p.notes != null && lt >= p.notes) for (let k = 0; k < 6; k++) { const ph = ((lt - p.notes) * .35 + k / 6) % 1, x = 160 + hash(k * 3.7) * 760 + noise(lt + k, k) * 40, y = 1700 - ph * 1300;
    c.save(); c.globalAlpha = Math.sin(ph * Math.PI) * .9; c.translate(x, y); c.rotate(noise(lt * 2, k) * .5); txt(c, k % 2 ? '♪' : '♫', 0, 0, '700 90px Mont', '#ff6a6a'); c.restore(); }
  const dk = p.lightsOn != null ? lerp(p.dark != null ? p.dark : .8, .12, E.out(prog(lt, p.lightsOn, p.lightsOn + .15))) : null;
  torchDark(c, lt, dk != null ? { ...p, dark: dk, torch: lt >= p.lightsOn ? null : p.torch } : p);
  if (p.lightsOn != null && lt >= p.lightsOn && lt < p.lightsOn + .2) { c.fillStyle = `rgba(255,255,255,${.6 * (1 - (lt - p.lightsOn) / .2)})`; c.fillRect(-300, -300, W + 600, H + 600); }
  if (p.camDot) { c.fillStyle = `rgba(255,40,40,${.6 + .4 * Math.sin(gt * 5)})`; glow(c, 'rgba(255,40,40,1)', 16); c.beginPath(); c.arc(985, 320, 9, 0, 7); c.fill(); noGlow(c);
    c.fillStyle = '#26262e'; rr(c, 955, 300, 70, 44, 10); c.globalAlpha = .55; c.fill(); c.globalAlpha = 1; }
};

// ---------- Haustür von innen ----------
SCENES.front_door = (c, lt, b, gt) => {
  const p = b.p || {};
  bgFill(c, '#101015', '#060607');
  const dx = 300, dy = 330, dw = 480, dh = 1060, fy = dy + dh;
  c.fillStyle = '#131318'; c.fillRect(-100, 0, W + 200, fy); c.fillStyle = '#0a0a0d'; c.fillRect(-100, fy, W + 200, 900);
  const op = p.open != null ? E.inOut(prog(lt, p.open, p.open + (p.openDur || 1.2))) : 0;
  // Scheinwerfer (Licht wandert durch die Fenster)
  const hl = p.headlights != null ? prog(lt, p.headlights, p.headlights + (p.hlDur || 2.4)) : -1;
  const hlA = hl >= 0 && hl < 1 ? Math.sin(hl * Math.PI) : (p.hlStay != null && lt >= p.hlStay ? 1 : 0);
  const outside = (a) => { const g = c.createLinearGradient(0, dy, 0, fy); g.addColorStop(0, `rgba(255,245,225,${.25 + .7 * a})`); g.addColorStop(1, `rgba(255,220,180,${.08 + .5 * a})`); return g; };
  // Rahmen + Außenraum hinter der offenen Tür
  c.fillStyle = '#1b1b21'; c.fillRect(dx - 34, dy - 34, dw + 68, dh + 34);
  if (op > 0) { c.fillStyle = '#05060a'; c.fillRect(dx, dy, dw, dh); c.fillStyle = outside(Math.max(hlA, p.porch != null ? p.porch : .35)); c.fillRect(dx, dy, dw, dh);
    if (p.parents && lt >= (p.parents.at || 0)) { const pa = clamp(prog(lt, p.parents.at || 0, (p.parents.at || 0) + .3));
      c.save(); c.globalAlpha = pa; const sil = { color: '#08080a', lw: 30 };
      mama(c, 'coat', dx + dw * .36, fy, 640, { ...BASE, head: [.02, -.9] }, gt, { ...sil, dress: '#08080a', dressLine: '#08080a', hairColor: '#08080a' });
      stick(c, dx + dw * .7, fy, 700, 'stand', gt, sil); c.restore(); }
    if (p.shapeOut) sceneShape(c, lt, gt, { x: dx + dw / 2, y: fy, h: 760, rim: 'rgba(255,255,255,.4)', color: '#000', ...p.shapeOut }); }
  // Türblatt (schwingt nach innen nach links)
  const ow = dw * (1 - op * .85);
  const dg = c.createLinearGradient(dx, 0, dx + ow, 0); dg.addColorStop(0, '#1f1f26'); dg.addColorStop(1, '#17171c');
  c.fillStyle = dg; c.fillRect(dx, dy, ow, dh);
  if (op < .6) { c.strokeStyle = '#26262e'; c.lineWidth = 6; c.strokeRect(dx + 50, dy + 470, ow - 100, 520);
    // drei kleine Fenster oben, Scheinwerferlicht wandert hindurch
    for (let i = 0; i < 3; i++) { const wx = dx + 60 + i * (ow - 120) / 3 + 10, ww = (ow - 120) / 3 - 20;
      c.fillStyle = '#0a0b10'; c.fillRect(wx, dy + 90, ww, 300);
      if (hlA > 0) { const sx = lerp(dx - 200, dx + dw + 200, clamp(hl)); const a = clamp(1 - Math.abs(wx + ww / 2 - sx) / 260) * hlA;
        c.save(); c.fillStyle = `rgba(255,248,230,${.9 * a})`; glow(c, 'rgba(255,240,210,1)', 40 * a); c.fillRect(wx, dy + 90, ww, 300); noGlow(c); c.restore(); } } }
  // Lichtflecken der Scheinwerfer auf Wand und Boden
  if (hlA > 0 && op < 1) { const sx = lerp(-300, W + 300, clamp(hl)); c.save(); c.globalCompositeOperation = 'screen';
    spot(c, sx, fy + 260, 520, 'rgba(255,235,200,A)', .22 * hlA); spot(c, W - sx, 420, 380, 'rgba(255,235,200,A)', .12 * hlA); c.restore(); }
  // Schloss: Drehknauf dreht sich
  const kk = p.keyAt != null ? E.inOut(prog(lt, p.keyAt, p.keyAt + (p.keyDur || .6))) : 0;
  if (op < .5) { c.save(); c.translate(dx + ow - 70, dy + 470); c.fillStyle = '#3a3a44'; c.beginPath(); c.arc(0, 0, 26, 0, 7); c.fill();
    c.rotate(kk * Math.PI / 2); c.fillStyle = '#5a5a66'; rr(c, -8, -22, 16, 44, 6); c.fill(); c.restore();
    c.save(); c.translate(dx + ow - 70, dy + 580); rr(c, -16, -30, 32, 60, 10); c.fillStyle = '#3a3a44'; c.fill();
    const hd = p.handleAt != null ? Math.sin(clamp((lt - p.handleAt) / .5) * Math.PI) * .45 * (lt > p.handleAt ? 1 : 0) : 0; c.rotate(hd);
    c.strokeStyle = '#4a4a55'; c.lineWidth = 18; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(-90, 0); c.stroke(); c.restore(); }
  // Lichtkeil durch die offene Tür
  if (op > 0) { c.save(); c.globalAlpha = op; const g = c.createLinearGradient(0, fy, 0, H); g.addColorStop(0, 'rgba(255,240,215,.45)'); g.addColorStop(1, 'rgba(255,240,215,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(dx + ow, fy); c.lineTo(dx + dw, fy); c.lineTo(dx + dw + 360, H); c.lineTo(dx + ow - 120, H); c.closePath(); c.fill(); c.restore(); }
  if (p.you) { const q = p.you; stick(c, q.x || 900, 1820, q.h || 760, q.pose || 'scared', gt, { color: '#d9d9df', hood: true, hoodColor: '#8e8e98', tremble: true, flip: q.flip }); }
  if (p.shapeIn) sceneShape(c, lt, gt, { x: 160, y: fy + 200, h: 1100, ...p.shapeIn });
};

// ---------- Scheinwerfer streichen über die Wohnzimmerwand ----------
SCENES.car_headlights = (c, lt, b, gt) => {
  const p = b.p || {};
  bgFill(c, '#0c0c10', '#050506');
  const fy = 1300;
  c.fillStyle = '#121217'; c.fillRect(-200, 0, W + 400, fy); c.fillStyle = '#08080b'; c.fillRect(-200, fy, W + 400, H);
  // Bilderrahmen, Stehlampe
  c.strokeStyle = '#1f1f26'; c.lineWidth = 10; c.strokeRect(160, 520, 200, 260); c.strokeRect(420, 470, 150, 190); c.strokeRect(420, 700, 150, 120);
  c.lineWidth = 8; c.beginPath(); c.moveTo(900, fy - 10); c.lineTo(900, 640); c.stroke(); c.fillStyle = '#1b1b21'; c.beginPath(); c.moveTo(840, 640); c.lineTo(960, 640); c.lineTo(930, 540); c.lineTo(870, 540); c.fill();
  // Lichtfeld: Fensterform mit Sprossen-Schatten, wandert über die Wand
  const sweeps = p.sweeps || (p.sweep ? [p.sweep] : []);
  for (const s of sweeps) {
    const k = prog(lt, s[0], s[1]); if (k <= 0 || k >= 1) continue;
    const a = Math.min(1, Math.sin(k * Math.PI) * 1.6), x = lerp(-380, W - 20, k), sk = lerp(.35, -.35, k), y = 380, w = 400, h = 620;
    c.save(); c.beginPath(); c.moveTo(x + sk * 200, y); c.lineTo(x + w + sk * 200, y); c.lineTo(x + w - sk * 120, y + h); c.lineTo(x - sk * 120, y + h); c.closePath(); c.clip();
    const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, `rgba(255,240,215,${.0})`); g.addColorStop(.25, `rgba(255,240,215,${.7 * a})`); g.addColorStop(.75, `rgba(255,240,215,${.7 * a})`); g.addColorStop(1, 'rgba(255,240,215,0)');
    c.fillStyle = g; c.fillRect(x - 300, y, w + 600, h);
    c.strokeStyle = 'rgba(8,8,10,.9)'; c.lineWidth = 26; c.beginPath(); c.moveTo(x + w / 2 + sk * 40, y); c.lineTo(x + w / 2 - sk * 40, y + h); c.moveTo(x - 300, y + h / 2); c.lineTo(x + w + 300, y + h / 2); c.stroke();
    if (p.shadow) { const q = p.shadow; c.globalAlpha = .92; shapeEntity(c, q.x || 560, q.y || 1240, q.h || 900, gt, { pose: q.pose || 'stand', color: '#060607', rim: false, eyes: 0 }); }
    c.restore();
  }
  if (p.youCouch) stick(c, p.youCouch.x || 640, 1560, 560, 'listen', gt, { color: '#d9d9df', hood: true, hoodColor: '#8e8e98', tremble: true });
  // Sofa im Vordergrund
  c.fillStyle = '#0a0a0d'; rr(c, 80, 1250, 920, 300, 50); c.fill(); rr(c, 40, 1180, 140, 400, 40); c.fill(); rr(c, 900, 1180, 140, 400, 40); c.fill();
  if (p.monitorGlow) { spot(c, 380, 1300, 220, 'rgba(255,40,40,A)', .35); }
};

// Rückblende-Overlay für beliebige Szenen: beat.rewindFx = {at, dur, label}
POST_HOOKS.push((c, t, b, lt) => {
  const q = b.rewindFx; if (!q || lt < (q.at || 0)) return;
  const on = lt < (q.at || 0) + (q.dur != null ? q.dur : .8);
  if (on) for (let k = 0; k < 7; k++) { const yy = (lt * 1100 + k * 260) % H; c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(0, yy, W, 8 + (k % 3) * 6); }
  c.save(); c.globalCompositeOperation = 'color'; c.fillStyle = 'rgba(140,20,20,.55)'; c.fillRect(0, 0, W, H); c.restore();
  if (q.label) { c.font = '700 40px SMono'; const tw = c.measureText(q.label).width + 50; rr(c, 900 - tw, 150, tw, 70, 14); c.fillStyle = 'rgba(0,0,0,.6)'; c.fill();
    txt(c, q.label, 900 - tw / 2, 199, '700 40px SMono', '#ffffff'); }
});
