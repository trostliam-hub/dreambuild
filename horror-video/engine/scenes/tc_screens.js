'use strict';
// Bildschirme & Tafeln für True-Crime-Shorts:
//   tv_news        – Röhrenfernseher (70er Holz / 2000er silber) mit Nachrichtensendung, im dunklen Wohnzimmer
//   computer_disk  – lila 3,5"-Diskette fährt ins Laufwerk eines beigen PCs, Eigenschaften-Dialog enthüllt Metadaten
//   evidence_board – Korkwand mit Karten, Polaroids, Zetteln, roten Fäden, Markerkreis und Taschenlampe
//   city_map       – dunkler, stilisierter Stadtplan mit fallenden Pins, Linien und sich zuziehendem roten Ring
// Alles in einer IIFE; nach außen wird nur in SCENES geschrieben. Zeiten in p = lokale Sekunden.
(() => {
  // ================= Hilfen =================
  const CACHE = new Map();
  function layer(key, w, h, draw, sc = 1) { // statische Ebene, einmal gezeichnet
    let cv = CACHE.get(key);
    if (!cv) {
      cv = document.createElement('canvas'); cv.width = Math.ceil(w * sc); cv.height = Math.ceil(h * sc);
      const g = cv.getContext('2d'); if (sc !== 1) g.scale(sc, sc); draw(g, w, h); CACHE.set(key, cv);
    }
    return cv;
  }
  const SCR = {};
  function scratch(name, w, h) { // wiederverwendete Arbeitsfläche
    w = Math.max(1, Math.ceil(w)); h = Math.max(1, Math.ceil(h));
    let cv = SCR[name]; if (!cv) cv = SCR[name] = document.createElement('canvas');
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    return cv;
  }
  const isNum = v => typeof v === 'number' && isFinite(v);
  const num = (v, d) => isNum(v) ? v : d;
  function rng(seed) { let a = (seed * 2654435761) >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function textW(c, s, font, ls = 0) { c.font = font; c.letterSpacing = ls + 'px'; const w = c.measureText(s).width; c.letterSpacing = '0px'; return w; }
  function fitSize(c, s, maxW, size, fontT, ls = 0) { const w = textW(c, s, fontT.replace('{S}', size), ls); return w > maxW ? Math.max(8, Math.floor(size * maxW / w)) : size; }
  function noShadow(c) { c.shadowOffsetX = 0; c.shadowOffsetY = 0; noGlow(c); }
  function layoutText(c, text, maxW, maxH, fontT, size, lh = 1.15, minSize = 12) { // Umbruch + Schrumpfen bis es passt
    const paras = String(text == null ? '' : text).split('\n');
    let best = null;
    for (let fs = size; fs >= minSize; fs -= 2) {
      const font = fontT.replace('{S}', fs), lines = [];
      for (const pr of paras) { if (!pr.trim()) { lines.push(''); continue; } for (const l of wrap(c, pr.trim(), maxW, font)) lines.push(l); }
      c.font = font; const wide = lines.some(l => c.measureText(l).width > maxW);
      best = { fs, lines, font };
      if (lines.length * fs * lh <= maxH && !wide) return best;
    }
    return best;
  }
  const BLOOM_PAD = .12;
  function drawBloom(c, src, x, y, w, h, alpha) { // stark verkleinerte Kopie mit Rand = billiger, deckungsgleicher Glow
    const A = scratch('bloomA', 200, 150), ac = A.getContext('2d'), px = 200 * BLOOM_PAD / (1 + 2 * BLOOM_PAD), py = 150 * BLOOM_PAD / (1 + 2 * BLOOM_PAD);
    ac.clearRect(0, 0, 200, 150); ac.imageSmoothingQuality = 'medium'; ac.drawImage(src, 0, 0, src.width, src.height, px, py, 200 - 2 * px, 150 - 2 * py);
    const B = scratch('bloomB', 50, 38), bc = B.getContext('2d'); bc.clearRect(0, 0, 50, 38); bc.imageSmoothingQuality = 'medium'; bc.drawImage(A, 0, 0, 50, 38);
    c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = alpha; c.imageSmoothingQuality = 'low';
    c.drawImage(B, x - w * BLOOM_PAD, y - h * BLOOM_PAD, w * (1 + 2 * BLOOM_PAD), h * (1 + 2 * BLOOM_PAD)); c.restore();
  }
  function burstAmt(lt, v, d = .75) { // Signalstörung: schnell an, langsam ab
    const arr = Array.isArray(v) ? v : (isNum(v) ? [v] : []); let a = 0;
    for (const t0 of arr) { if (!isNum(t0) || lt < t0 || lt > t0 + d) continue; const u = (lt - t0) / d; a = Math.max(a, u < .08 ? u / .08 : Math.pow(1 - (u - .08) / .92, 1.4)); }
    return a;
  }
  function tree(c, x, y, len, ang, w, depth) { // kahler Baum
    const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
    c.lineWidth = w; c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke();
    if (depth <= 0) return;
    tree(c, x2, y2, len * .72, ang - .42 - hash(depth * 3.1 + x) * .2, w * .62, depth - 1);
    tree(c, x2, y2, len * .68, ang + .38 + hash(depth * 5.7 + y) * .2, w * .62, depth - 1);
  }
  function catmull(c, pts) { // weiche Kurve durch Punkte
    c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      c.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
    }
  }

  // ---------- 3,5"-Diskette (Draufsicht, Shutter oben, Etikett unten) ----------
  function floppyFace(c, D, label) {
    const cut = D * .07, r = D * .03;
    c.beginPath(); c.moveTo(r, 0); c.lineTo(D - cut, 0); c.lineTo(D, cut); c.lineTo(D, D - r); c.quadraticCurveTo(D, D, D - r, D);
    c.lineTo(r, D); c.quadraticCurveTo(0, D, 0, D - r); c.lineTo(0, r); c.quadraticCurveTo(0, 0, r, 0); c.closePath();
    const g = c.createLinearGradient(0, 0, D, D); g.addColorStop(0, '#74569f'); g.addColorStop(1, '#3f2b63'); c.fillStyle = g; c.fill();
    c.strokeStyle = 'rgba(255,255,255,.16)'; c.lineWidth = Math.max(1, D * .006); c.stroke();
    // Shutter
    const sx = D * .2, sw = D * .54, sh = D * .36;
    c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(sx - D * .03, 0, sw + D * .06, sh + D * .03);
    const mg = c.createLinearGradient(sx, 0, sx + sw, 0); mg.addColorStop(0, '#83868c'); mg.addColorStop(.45, '#cfd2d8'); mg.addColorStop(1, '#74777d');
    c.fillStyle = mg; c.fillRect(sx, 0, sw, sh);
    c.fillStyle = '#1d1526'; c.fillRect(sx + sw * .6, sh * .14, sw * .22, sh * .72);
    c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(sx, sh - D * .012, sw, D * .012);
    // Etikett
    const lx = D * .1, ly = D * .45, lw = D * .8, lh = D * .5;
    c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(lx - D * .025, ly - D * .025, lw + D * .05, lh + D * .07);
    c.fillStyle = '#dcd8ce'; c.fillRect(lx, ly, lw, lh);
    c.fillStyle = 'rgba(110,80,160,.55)'; c.fillRect(lx, ly, lw, D * .035);
    c.strokeStyle = 'rgba(70,60,110,.3)'; c.lineWidth = Math.max(1, D * .004);
    for (let i = 1; i < 4; i++) { const yy = ly + D * .04 + (lh - D * .04) * i / 4; c.beginPath(); c.moveTo(lx + D * .04, yy); c.lineTo(lx + lw - D * .04, yy); c.stroke(); }
    if (label) {
      const L = layoutText(c, label, lw - D * .08, lh - D * .1, '400 {S}px Marker', Math.round(D * .11), 1.05, 6);
      L.lines.forEach((l, i) => txt(c, l, lx + lw / 2, ly + D * .05 + (lh - D * .05) / 2 + (i - (L.lines.length - 1) / 2) * L.fs * 1.05 + L.fs * .36, L.font, '#1f1a33', 'center'));
    }
    c.fillStyle = '#1a1222'; c.fillRect(D * .04, D * .87, D * .05, D * .075); c.fillRect(D * .91, D * .87, D * .05, D * .075);
  }

  // ================= 1) tv_news =================
  const TV_TICKER = 'POLICE CONFIRM NEW LETTER  •  TASK FORCE REOPENS CASE FILES  •  TIP LINE OPEN AROUND THE CLOCK';
  const TVG = {
    old: { S: { x: 170, y: 520, w: 740, h: 555, r: 72 }, tint: 'rgba(235,185,135,A)', rgb: '235,185,135' },
    new: { S: { x: 160, y: 498, w: 760, h: 570, r: 30 }, tint: 'rgba(170,192,225,A)', rgb: '170,192,225' },
  };
  const TV_CLOSE = { x: 60, y: 520, w: 960, h: 720 };

  function tvRoomLayer(old) {
    return layer('tvroom' + old, W + 400, H + 400, (g) => {
      const R = rng(old ? 70 : 2000); g.translate(200, 200);
      const FY = 1330;
      if (old) { // Holzpaneele
        const wg = g.createLinearGradient(0, -200, 0, FY); wg.addColorStop(0, '#3a2b20'); wg.addColorStop(1, '#4c3828');
        g.fillStyle = wg; g.fillRect(-200, -200, W + 400, FY + 200);
        for (let x = -200; x < W + 200; x += 96) {
          g.fillStyle = R() > .5 ? `rgba(255,210,160,${.02 + R() * .05})` : `rgba(0,0,0,${.05 + R() * .1})`; g.fillRect(x, -200, 96, FY + 200);
          g.strokeStyle = 'rgba(20,10,4,.18)'; g.lineWidth = 1.5;
          for (let k = 0; k < 7; k++) { const xx = x + 8 + R() * 80, ph = R() * 9, fq = .003 + R() * .008; g.beginPath(); for (let y = -200; y <= FY; y += 30) { const px = xx + Math.sin(y * fq + ph) * 4; if (y === -200) g.moveTo(px, y); else g.lineTo(px, y); } g.stroke(); }
          g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(x, -200, 5, FY + 200);
        }
        // Bild an der Wand
        g.fillStyle = '#4a3624'; g.fillRect(806, 120, 210, 260); g.fillStyle = '#2b241d'; g.fillRect(820, 134, 182, 232);
        g.strokeStyle = '#4a4034'; g.lineWidth = 4; g.beginPath(); g.moveTo(820, 330); g.lineTo(872, 266); g.lineTo(912, 306); g.lineTo(952, 250); g.lineTo(1002, 310); g.stroke();
        // Stehlampe (aus)
        g.fillStyle = '#17110c'; g.fillRect(30, 300, 9, FY + 60 - 300); g.beginPath(); g.moveTo(-28, 300); g.lineTo(96, 300); g.lineTo(70, 180); g.lineTo(2, 180); g.closePath(); g.fill();
      } else { // gestrichene Wand, Fenster mit Jalousie
        const wg = g.createLinearGradient(0, -200, 0, FY); wg.addColorStop(0, '#2c3038'); wg.addColorStop(1, '#3a3e47');
        g.fillStyle = wg; g.fillRect(-200, -200, W + 400, FY + 200);
        for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(${R() > .5 ? '255,255,255' : '0,0,0'},${R() * .05})`; g.fillRect(R() * (W + 400) - 200, R() * (FY + 200) - 200, 2, 2); }
        const wx = 770, wy = 30, ww = 300, wh = 360;
        g.fillStyle = '#07080a'; g.fillRect(wx, wy, ww, wh);
        const lg = g.createRadialGradient(wx + 230, wy + 90, 10, wx + 230, wy + 90, 280); lg.addColorStop(0, 'rgba(170,135,100,.5)'); lg.addColorStop(1, 'rgba(170,135,100,0)'); g.fillStyle = lg; g.fillRect(wx, wy, ww, wh);
        for (let y = wy + 6; y < wy + wh; y += 18) { g.fillStyle = 'rgba(78,82,90,.93)'; g.fillRect(wx, y, ww, 11); g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(wx, y, ww, 2); }
        g.strokeStyle = '#454953'; g.lineWidth = 14; g.strokeRect(wx, wy, ww, wh); g.fillStyle = '#454953'; g.fillRect(wx - 16, wy + wh, ww + 32, 14);
        // Bilderrahmen links (unterhalb des HUD)
        g.fillStyle = '#1d2026'; g.fillRect(-60, 360, 150, 190); g.strokeStyle = '#4a4e57'; g.lineWidth = 8; g.strokeRect(-60, 360, 150, 190);
      }
      g.fillStyle = old ? '#2a1d13' : '#25272d'; g.fillRect(-200, FY - 28, W + 400, 28);
      const fg = g.createLinearGradient(0, FY, 0, H + 200); fg.addColorStop(0, old ? '#3a2b21' : '#2c2e34'); fg.addColorStop(1, old ? '#1a130e' : '#141518');
      g.fillStyle = fg; g.fillRect(-200, FY, W + 400, H + 200 - FY);
      for (let i = 0; i < 9000; i++) { const y = FY + R() * (H + 200 - FY); g.fillStyle = `rgba(${R() > .5 ? '255,235,215' : '0,0,0'},${R() * .08})`; g.fillRect(R() * (W + 400) - 200, y, 2 + R() * 3, 2); }
    });
  }
  function tvBodyLayer(old) { // Szenen-y 400..1560
    return layer('tvbody' + old, W, 1160, (g) => {
      const R = rng(old ? 71 : 2001); g.translate(0, -400);
      g.save(); g.translate(540, 1405); g.scale(1, .1); const sg = g.createRadialGradient(0, 0, 40, 0, 0, 560); sg.addColorStop(0, 'rgba(0,0,0,.85)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sg; g.fillRect(-600, -600, 1200, 1200); g.restore();
      if (old) {
        g.fillStyle = '#21160e';
        for (const [x, d] of [[175, -1], [905, 1]]) { g.beginPath(); g.moveTo(x - 22, 1262); g.lineTo(x + 22, 1262); g.lineTo(x + 10 + d * 26, 1400); g.lineTo(x - 6 + d * 26, 1400); g.closePath(); g.fill(); g.fillStyle = '#6a5233'; g.fillRect(x - 7 + d * 26, 1388, 18, 12); g.fillStyle = '#21160e'; }
        rr(g, 100, 460, 880, 805, 22); const wg = g.createLinearGradient(0, 460, 0, 1265); wg.addColorStop(0, '#553a25'); wg.addColorStop(1, '#2e1e13'); g.fillStyle = wg; g.fill();
        g.save(); rr(g, 100, 460, 880, 805, 22); g.clip();
        for (let k = 0; k < 150; k++) { const y0 = 460 + R() * 805, amp = 2 + R() * 7, ph = R() * 7, fq = .003 + R() * .009; g.strokeStyle = R() > .35 ? `rgba(20,10,4,${.15 + R() * .25})` : `rgba(140,100,65,${.1 + R() * .15})`; g.lineWidth = .8 + R() * 1.8;
          g.beginPath(); for (let x = 100; x <= 980; x += 20) { const yy = y0 + Math.sin(x * fq + ph) * amp + Math.sin(x * .03 + ph * 2) * 1.2; if (x === 100) g.moveTo(x, yy); else g.lineTo(x, yy); } g.stroke(); }
        g.restore();
        rr(g, 92, 446, 896, 24, 10); g.fillStyle = '#66492f'; g.fill(); g.fillStyle = 'rgba(255,225,190,.12)'; g.fillRect(100, 448, 880, 3);
        rr(g, 146, 496, 788, 603, 98); g.fillStyle = '#0d0b0a'; g.fill();
        rr(g, 158, 508, 764, 579, 88); g.lineWidth = 3; g.strokeStyle = '#6a5a47'; g.stroke();
        rr(g, 170, 520, 740, 555, 72); g.fillStyle = '#000'; g.fill();
        g.fillStyle = '#7a6850'; g.fillRect(140, 1110, 800, 4); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(140, 1114, 800, 3);
        rr(g, 140, 1128, 470, 114, 10); g.fillStyle = '#1a130d'; g.fill();
        g.save(); rr(g, 140, 1128, 470, 114, 10); g.clip(); for (let y = 1134; y < 1242; y += 9) { g.fillStyle = 'rgba(95,72,48,.3)'; g.fillRect(140, y, 470, 3); } for (let x = 146; x < 610; x += 22) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x, 1128, 6, 114); } g.restore();
        for (const [x, lab] of [[730, 'VHF'], [868, 'UHF']]) {
          g.beginPath(); g.arc(x, 1180, 52, 0, 7); g.fillStyle = '#17120e'; g.fill();
          g.beginPath(); g.arc(x, 1180, 44, 0, 7); const kg = g.createRadialGradient(x - 14, 1166, 4, x, 1180, 46); kg.addColorStop(0, '#6a5e52'); kg.addColorStop(1, '#251f19'); g.fillStyle = kg; g.fill();
          for (let a = 0; a < 36; a++) { const an = a / 36 * Math.PI * 2; g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + Math.cos(an) * 39, 1180 + Math.sin(an) * 39); g.lineTo(x + Math.cos(an) * 45, 1180 + Math.sin(an) * 45); g.stroke(); }
          const pa = R() * 6; g.strokeStyle = '#c2b296'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + Math.cos(pa) * 10, 1180 + Math.sin(pa) * 10); g.lineTo(x + Math.cos(pa) * 35, 1180 + Math.sin(pa) * 35); g.stroke();
          txt(g, lab, x, 1254, '700 13px SMono', 'rgba(200,180,150,.55)', 'center', 'alphabetic', 3);
        }
      } else {
        rr(g, 60, 1196, 960, 240, 8); g.fillStyle = '#141418'; g.fill(); g.fillStyle = '#34353c'; g.fillRect(60, 1196, 960, 6);
        rr(g, 110, 1236, 860, 170, 6); g.fillStyle = '#060607'; g.fill();
        rr(g, 300, 1262, 480, 86, 8); const vg = g.createLinearGradient(0, 1262, 0, 1348); vg.addColorStop(0, '#2f3036'); vg.addColorStop(1, '#18191c'); g.fillStyle = vg; g.fill();
        rr(g, 330, 1282, 220, 16, 4); g.fillStyle = '#08080a'; g.fill();
        rr(g, 596, 1280, 150, 44, 5); g.fillStyle = '#050506'; g.fill();
        for (let i = 0; i < 5; i++) { rr(g, 336 + i * 40, 1314, 28, 12, 3); g.fillStyle = '#3d3e45'; g.fill(); }
        g.fillStyle = '#0a0a0c'; g.fillRect(80, 1436, 40, 16); g.fillRect(960, 1436, 40, 16);
        rr(g, 108, 444, 864, 752, 34); const bg2 = g.createLinearGradient(0, 444, 0, 1196); bg2.addColorStop(0, '#73767d'); bg2.addColorStop(.5, '#53565c'); bg2.addColorStop(1, '#34363b'); g.fillStyle = bg2; g.fill();
        g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.14)'; rr(g, 110, 446, 860, 748, 33); g.stroke();
        rr(g, 138, 476, 804, 616, 30); g.fillStyle = '#121316'; g.fill();
        rr(g, 160, 498, 760, 570, 30); g.fillStyle = '#000'; g.fill();
        for (const x0 of [176, 742]) for (let yy = 0; yy < 4; yy++) for (let xx = 0; xx < 14; xx++) { g.beginPath(); g.arc(x0 + xx * 12, 1118 + yy * 14, 3, 0, 7); g.fillStyle = '#23242a'; g.fill(); }
        rr(g, 486, 1116, 108, 30, 8); g.fillStyle = '#62656c'; g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; g.stroke();
        for (let i = 0; i < 4; i++) { rr(g, 500 + i * 22, 1162, 14, 8, 3); g.fillStyle = '#2c2e33'; g.fill(); }
      }
      // Gehäuse liegt im Dunkeln: zum Rand hin abdunkeln
      g.globalCompositeOperation = 'source-atop';
      const dk = g.createRadialGradient(540, 790, 280, 540, 860, 800); dk.addColorStop(0, 'rgba(0,0,0,.05)'); dk.addColorStop(1, 'rgba(0,0,0,.6)'); g.fillStyle = dk; g.fillRect(0, 400, W, 1160);
      g.globalCompositeOperation = 'source-over';
    });
  }
  function tvSceneLayer(old) { // Raum mit eingebackenem Fernsehlicht + Gehäuse
    const key = 'tvscene' + old;
    if (CACHE.has(key)) return CACHE.get(key);
    const cv = layer(key, W + 400, H + 400, (g) => {
      g.drawImage(tvRoomLayer(old), 0, 0); g.translate(200, 200);
      const G = old ? TVG.old : TVG.new, S = G.S, cx = S.x + S.w / 2, cy = S.y + S.h / 2;
      const dg = g.createRadialGradient(cx, cy, 160, cx, cy + 160, 1400);
      dg.addColorStop(0, 'rgba(0,0,0,.2)'); dg.addColorStop(.42, 'rgba(0,0,0,.56)'); dg.addColorStop(1, 'rgba(0,0,0,.9)');
      g.fillStyle = dg; g.fillRect(-200, -200, W + 400, H + 400);
      g.globalCompositeOperation = 'screen'; spot(g, cx, cy, 980, G.tint, .13);
      g.save(); g.translate(cx, 1560); g.scale(1, .2); spot(g, 0, 0, 820, G.tint, .22); g.restore();
      g.globalCompositeOperation = 'source-over';
      g.drawImage(tvBodyLayer(old), 0, 400);
    });
    CACHE.delete('tvroom' + old); CACHE.delete('tvbody' + old); // Zwischenebenen freigeben
    return cv;
  }
  function tvCloseLayer(old) { // Nahaufnahme: Gehäuse füllt das Bild
    return layer('tvclose' + old, W + 400, H + 400, (g) => {
      const R = rng(old ? 72 : 2002); g.translate(200, 200); const S = TV_CLOSE;
      if (old) {
        const wg = g.createLinearGradient(0, -200, 0, H + 200); wg.addColorStop(0, '#3e2a1b'); wg.addColorStop(1, '#22170f'); g.fillStyle = wg; g.fillRect(-200, -200, W + 400, H + 400);
        for (let k = 0; k < 260; k++) { const y0 = -200 + R() * (H + 400), amp = 3 + R() * 9, ph = R() * 7, fq = .002 + R() * .006; g.strokeStyle = R() > .35 ? `rgba(15,8,3,${.15 + R() * .25})` : `rgba(140,100,65,${.08 + R() * .12})`; g.lineWidth = 1 + R() * 2.4;
          g.beginPath(); for (let x = -200; x <= W + 200; x += 24) { const yy = y0 + Math.sin(x * fq + ph) * amp; if (x === -200) g.moveTo(x, yy); else g.lineTo(x, yy); } g.stroke(); }
        rr(g, S.x - 46, S.y - 46, S.w + 92, S.h + 92, 130); g.fillStyle = '#0d0b0a'; g.fill();
        rr(g, S.x - 26, S.y - 26, S.w + 52, S.h + 52, 112); g.lineWidth = 4; g.strokeStyle = '#6a5a47'; g.stroke();
        g.fillStyle = '#7a6850'; g.fillRect(-200, S.y + S.h + 96, W + 400, 5);
        rr(g, 30, S.y + S.h + 130, 640, 260, 14); g.fillStyle = '#1a130d'; g.fill();
        for (let y = S.y + S.h + 138; y < S.y + S.h + 390; y += 11) { g.fillStyle = 'rgba(95,72,48,.3)'; g.fillRect(30, y, 640, 4); }
        for (const x of [810, 990]) { const y = S.y + S.h + 230; g.beginPath(); g.arc(x, y, 72, 0, 7); g.fillStyle = '#17120e'; g.fill();
          g.beginPath(); g.arc(x, y, 62, 0, 7); const kg = g.createRadialGradient(x - 18, y - 18, 4, x, y, 64); kg.addColorStop(0, '#6a5e52'); kg.addColorStop(1, '#231d18'); g.fillStyle = kg; g.fill();
          for (let a = 0; a < 44; a++) { const an = a / 44 * Math.PI * 2; g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x + Math.cos(an) * 55, y + Math.sin(an) * 55); g.lineTo(x + Math.cos(an) * 63, y + Math.sin(an) * 63); g.stroke(); }
          const pa = R() * 6; g.strokeStyle = '#c2b296'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + Math.cos(pa) * 14, y + Math.sin(pa) * 14); g.lineTo(x + Math.cos(pa) * 50, y + Math.sin(pa) * 50); g.stroke(); }
      } else {
        const bg2 = g.createLinearGradient(0, -200, 0, H + 200); bg2.addColorStop(0, '#5e6168'); bg2.addColorStop(.5, '#44464c'); bg2.addColorStop(1, '#2a2b30'); g.fillStyle = bg2; g.fillRect(-200, -200, W + 400, H + 400);
        for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(${R() > .5 ? '255,255,255' : '0,0,0'},${R() * .05})`; g.fillRect(R() * (W + 400) - 200, R() * (H + 400) - 200, 2, 2); }
        rr(g, S.x - 40, S.y - 40, S.w + 80, S.h + 80, 52); g.fillStyle = '#121316'; g.fill();
        g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.12)'; rr(g, S.x - 70, S.y - 70, S.w + 140, S.h + 140, 70); g.stroke();
        for (const x0 of [80, 760]) for (let yy = 0; yy < 6; yy++) for (let xx = 0; xx < 20; xx++) { g.beginPath(); g.arc(x0 + xx * 12, S.y + S.h + 110 + yy * 15, 3.4, 0, 7); g.fillStyle = '#26272c'; g.fill(); }
        rr(g, 470, S.y + S.h + 120, 140, 36, 9); g.fillStyle = '#5c5f66'; g.fill();
      }
      rr(g, S.x, S.y, S.w, S.h, old ? 90 : 36); g.fillStyle = '#000'; g.fill();
    });
  }

  // ----- Bildmotive (lokal 0..w, 0..h) -----
  function newsPic(o, kind, w, h, gt, old) {
    const s = h / 236;
    if (kind === 'letter') {
      o.fillStyle = old ? '#2c241d' : '#1d1f24'; o.fillRect(0, 0, w, h);
      spot(o, w * .5, h * .45, h * .8, WHITEA, .08);
      o.save(); o.translate(w / 2, h / 2 + 4 * s); o.rotate(-.06);
      const pw = h * .74, ph = h * .96;
      o.shadowColor = 'rgba(0,0,0,.7)'; o.shadowBlur = 16 * s; o.shadowOffsetY = 6 * s; o.fillStyle = old ? '#dcceb6' : '#d8d5cd'; o.fillRect(-pw / 2, -ph / 2, pw, ph); noShadow(o);
      txt(o, 'TO THE PRESS:', -pw / 2 + 14 * s, -ph / 2 + 26 * s, `400 ${13 * s}px Elite`, '#2a2522', 'left');
      for (let i = 0; i < 9; i++) { const lw = (pw - 28 * s) * (.5 + hash(i * 3.7) * .5); o.fillStyle = 'rgba(40,36,32,.5)'; o.fillRect(-pw / 2 + 14 * s, -ph / 2 + (40 + i * 17.5) * s, lw, 5 * s); }
      o.strokeStyle = '#c0141c'; o.lineWidth = 3 * s; o.beginPath(); o.ellipse(-pw / 2 + 62 * s, -ph / 2 + (42.5 + 4 * 17.5) * s, 54 * s, 12 * s, -.03, 0, 7); o.stroke();
      o.restore();
    } else if (kind === 'house') {
      const g = o.createLinearGradient(0, 0, 0, h); g.addColorStop(0, old ? '#2e2620' : '#1b1f26'); g.addColorStop(1, old ? '#55432f' : '#323640'); o.fillStyle = g; o.fillRect(0, 0, w, h);
      spot(o, w * .8, h * .2, h * .45, WHITEA, .14);
      o.fillStyle = '#09090b'; o.fillRect(0, h * .8, w, h * .2);
      const hx = w * .42, hy = h * .8, hw = h * .66, hh = h * .3;
      o.fillRect(hx - hw / 2, hy - hh, hw, hh);
      o.beginPath(); o.moveTo(hx - hw / 2 - 12 * s, hy - hh + 2); o.lineTo(hx, hy - hh - h * .22); o.lineTo(hx + hw / 2 + 12 * s, hy - hh + 2); o.closePath(); o.fill();
      o.fillRect(hx + hw * .2, hy - hh - h * .19, 14 * s, h * .14);
      glow(o, 'rgba(255,40,40,.9)', 16 * s); o.fillStyle = '#ff3a3a'; o.fillRect(hx - hw * .32, hy - hh * .72, hw * .17, hh * .32); noGlow(o);
      o.fillStyle = 'rgba(210,200,180,.22)'; o.fillRect(hx + hw * .14, hy - hh * .72, hw * .17, hh * .32);
      o.fillStyle = '#141418'; o.fillRect(hx - hw * .06, hy - hh * .55, hw * .12, hh * .55);
      o.strokeStyle = '#09090b'; o.lineCap = 'round'; tree(o, w * .86, h * .82, h * .2, -Math.PI / 2, 7 * s, 5);
    } else if (kind === 'silhouette') {
      o.fillStyle = old ? '#4d433a' : '#3d4047'; o.fillRect(0, 0, w, h);
      o.strokeStyle = 'rgba(0,0,0,.35)'; o.lineWidth = 1.5 * s;
      for (let i = 0; i < 9; i++) { const y = h * .1 + i * h * .1; o.beginPath(); o.moveTo(0, y); o.lineTo(w, y); o.stroke(); if (i % 2 === 0) txt(o, `${6 - i / 2}'`, 8 * s, y - 3 * s, `700 ${11 * s}px SMono`, 'rgba(0,0,0,.45)', 'left'); }
      const cx = w / 2; o.fillStyle = '#060607';
      o.beginPath(); o.moveTo(cx - h * .42, h); o.bezierCurveTo(cx - h * .42, h * .74, cx - h * .3, h * .68, cx - h * .12, h * .64); o.lineTo(cx + h * .12, h * .64); o.bezierCurveTo(cx + h * .3, h * .68, cx + h * .42, h * .74, cx + h * .42, h); o.closePath(); o.fill();
      o.fillRect(cx - h * .06, h * .5, h * .12, h * .16);
      o.beginPath(); o.ellipse(cx, h * .4, h * .13, h * .165, 0, 0, 7); o.fill();
      glow(o, 'rgba(255,30,30,1)', 20 * s); txt(o, '?', cx, h * .5, `400 ${h * .34}px Anton`, '#ff3030', 'center'); noGlow(o);
    } else if (kind === 'floppy') {
      o.fillStyle = old ? '#241d18' : '#15171b'; o.fillRect(0, 0, w, h);
      spot(o, w * .5, h * .5, h * .7, 'rgba(150,110,220,A)', .16);
      const D = h * .74; o.save(); o.translate(w / 2, h / 2); o.rotate(-.1); o.shadowColor = 'rgba(0,0,0,.7)'; o.shadowBlur = 20 * s; o.shadowOffsetY = 8 * s;
      o.translate(-D / 2, -D / 2); o.fillStyle = '#000'; o.fillRect(D * .02, D * .02, D * .96, D * .96); noShadow(o); floppyFace(o, D, ''); o.restore();
    } else if (kind === 'farm') {
      const g = o.createLinearGradient(0, 0, 0, h * .7); g.addColorStop(0, old ? '#2f241d' : '#22252c'); g.addColorStop(1, old ? '#8a6446' : '#6a5550'); o.fillStyle = g; o.fillRect(0, 0, w, h);
      spot(o, w * .3, h * .68, h * .6, 'rgba(255,120,80,A)', .25);
      o.fillStyle = '#0c0b0b'; o.fillRect(0, h * .68, w, h * .32);
      o.strokeStyle = 'rgba(80,60,50,.35)'; o.lineWidth = 1.5 * s; for (let i = -8; i <= 8; i++) { o.beginPath(); o.moveTo(w / 2 + i * 8 * s, h * .69); o.lineTo(w / 2 + i * 70 * s, h); o.stroke(); }
      o.fillStyle = '#09090a';
      const bx = w * .56, by = h * .69, bw = h * .44, bh = h * .2;
      o.beginPath(); o.moveTo(bx, by); o.lineTo(bx, by - bh); o.lineTo(bx + bw * .16, by - bh - h * .1); o.lineTo(bx + bw * .5, by - bh - h * .15); o.lineTo(bx + bw * .84, by - bh - h * .1); o.lineTo(bx + bw, by - bh); o.lineTo(bx + bw, by); o.closePath(); o.fill();
      o.fillRect(bx - h * .13, by - h * .4, h * .1, h * .4); o.beginPath(); o.arc(bx - h * .08, by - h * .4, h * .05, Math.PI, 0); o.fill();
      const wx = w * .2; o.strokeStyle = '#09090a'; o.lineWidth = 3 * s; o.beginPath(); o.moveTo(wx - h * .05, by); o.lineTo(wx, by - h * .36); o.lineTo(wx + h * .05, by); o.stroke();
      const rot = gt * .6; for (let k = 0; k < 6; k++) { const a = rot + k * Math.PI / 3; o.beginPath(); o.moveTo(wx, by - h * .36); o.lineTo(wx + Math.cos(a) * h * .09, by - h * .36 + Math.sin(a) * h * .09); o.stroke(); }
      for (let i = 0; i < 12; i++) o.fillRect(i * w / 11 - 2 * s, h * .66, 4 * s, h * .06);
      o.fillStyle = '#ff3a3a'; glow(o, 'rgba(255,40,40,.9)', 10 * s); o.fillRect(bx + bw * .42, by - bh * .6, bw * .14, bh * .3); noGlow(o);
    } else {
      o.fillStyle = '#111'; o.fillRect(0, 0, w, h);
    }
  }
  function studioBg(o, old, gt, station, pw, ph) { // statischer Teil gecacht in Bildschirmpixeln, Lichtstreifen live
    o.drawImage(layer(`studio|${old}|${station}|${pw}x${ph}`, pw, ph, (g) => { g.scale(pw / 800, ph / 600); studioStatic(g, old, station); }), 0, 0, 800, 600);
    if (!old) {
      o.save(); o.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 4; i++) { const x = ((gt * 14 + i * 260) % 1150) - 170; const lg = o.createLinearGradient(x - 80, 0, x + 120, 0); lg.addColorStop(0, 'rgba(120,150,190,0)'); lg.addColorStop(.5, 'rgba(120,150,190,.07)'); lg.addColorStop(1, 'rgba(120,150,190,0)');
        o.fillStyle = lg; o.beginPath(); o.moveTo(x, 0); o.lineTo(x + 120, 0); o.lineTo(x + 40, 400); o.lineTo(x - 80, 400); o.closePath(); o.fill(); }
      o.restore();
    }
  }
  function studioStatic(o, old, station) {
    if (old) {
      const g = o.createLinearGradient(0, 0, 0, 600); g.addColorStop(0, '#6a4630'); g.addColorStop(1, '#2a180e'); o.fillStyle = g; o.fillRect(0, 0, 800, 600);
      ['#8a5228', '#a8703a', '#cfae80'].forEach((cl, i) => { o.fillStyle = cl; o.globalAlpha = .32; o.fillRect(0, 318 + i * 15, 800, 9); }); o.globalAlpha = 1;
      txt(o, station + ' NEWS', 780, 300, '900 64px Mont', 'rgba(255,225,190,.08)', 'right', 'alphabetic', 4);
      const sg = o.createRadialGradient(250, 210, 20, 250, 210, 380); sg.addColorStop(0, 'rgba(255,205,150,.22)'); sg.addColorStop(1, 'rgba(255,205,150,0)'); o.fillStyle = sg; o.fillRect(0, 0, 800, 600);
    } else {
      const g = o.createLinearGradient(0, 0, 0, 600); g.addColorStop(0, '#2c3542'); g.addColorStop(1, '#0f1318'); o.fillStyle = g; o.fillRect(0, 0, 800, 600);
      o.strokeStyle = 'rgba(210,40,40,.14)'; o.lineWidth = 16; o.beginPath(); o.arc(610, 170, 220, 0, 7); o.stroke();
      o.strokeStyle = 'rgba(200,210,230,.05)'; o.lineWidth = 2; o.beginPath(); o.arc(610, 170, 260, 0, 7); o.stroke();
      for (let i = 0; i < 27; i++) {
        const bw = 22 + hash(i * 3.3) * 38, bh = 40 + hash(i * 7.1) * 130, bx = i * 31 - 10; o.fillStyle = '#151a21'; o.fillRect(bx, 392 - bh, bw, bh);
        for (let k = 0; k < 8; k++) if (hash(i * 13 + k) > .5) { o.fillStyle = hash(i + k * 5) > .86 ? 'rgba(255,60,60,.65)' : 'rgba(200,210,230,.3)'; o.fillRect(bx + 4 + (k % 2) * 10, 392 - bh + 10 + Math.floor(k / 2) * 16, 4, 6); }
      }
    }
  }
  function anchorFig(o, ax, gt, old) { // Silhouette ohne Gesicht
    const bob = Math.sin(gt * 6.4) * 1.4 + noise(gt * 1.1, 4) * 2.4, sway = noise(gt * .5, 8) * 6;
    const body = (dx, dy, col) => {
      o.fillStyle = col; o.beginPath();
      o.moveTo(ax - 168 + dx, 430 + dy); o.bezierCurveTo(ax - 168 + dx, 302 + dy, ax - 140 + dx, 284 + dy, ax - 72 + dx, 272 + dy);
      o.lineTo(ax + 72 + dx, 272 + dy); o.bezierCurveTo(ax + 140 + dx, 284 + dy, ax + 168 + dx, 302 + dy, ax + 168 + dx, 430 + dy); o.closePath(); o.fill();
      o.fillRect(ax - 22 + dx + sway * .3, 222 + dy + bob, 44, 58);
      o.beginPath(); o.ellipse(ax + dx + sway * .5, 198 + dy + bob, old ? 45 : 42, 52, sway * .004, 0, 7); o.fill();
    };
    body(4, -3, old ? 'rgba(255,215,170,.4)' : 'rgba(180,205,240,.38)');
    body(0, 0, '#08080a');
    o.fillStyle = old ? '#4e463e' : '#44464e'; o.beginPath(); o.moveTo(ax - 32, 272); o.lineTo(ax, 326); o.lineTo(ax + 32, 272); o.closePath(); o.fill();
    o.fillStyle = '#6e1117'; o.beginPath(); o.moveTo(ax - 8, 280); o.lineTo(ax + 8, 280); o.lineTo(ax + (old ? 16 : 12), 336); o.lineTo(ax, 352); o.lineTo(ax - (old ? 16 : 12), 336); o.closePath(); o.fill();
    o.strokeStyle = old ? 'rgba(255,220,180,.1)' : 'rgba(200,215,240,.1)'; o.lineWidth = 3;
    o.beginPath(); o.moveTo(ax - 34, 274); o.lineTo(ax - (old ? 78 : 60), 360); o.moveTo(ax + 34, 274); o.lineTo(ax + (old ? 78 : 60), 360); o.stroke();
  }
  function newsDesk(o, old, ax) {
    if (old) {
      o.fillStyle = '#3e2b1b'; o.fillRect(0, 404, 800, 196); o.fillStyle = '#5e4229'; o.fillRect(0, 398, 800, 9);
      o.fillStyle = 'rgba(225,215,195,.8)'; o.beginPath(); o.moveTo(ax - 70, 401); o.lineTo(ax + 60, 401); o.lineTo(ax + 74, 408); o.lineTo(ax - 82, 408); o.fill();
      o.fillStyle = '#121212'; o.fillRect(ax + 120, 340, 5, 62); o.beginPath(); o.ellipse(ax + 122, 336, 10, 14, 0, 0, 7); o.fill();
    } else {
      const g = o.createLinearGradient(0, 400, 0, 600); g.addColorStop(0, '#1e232c'); g.addColorStop(1, '#0b0d11'); o.fillStyle = g; o.fillRect(0, 402, 800, 198);
      o.fillStyle = 'rgba(255,255,255,.14)'; o.fillRect(0, 398, 800, 4); o.fillStyle = 'rgba(225,40,40,.75)'; o.fillRect(0, 410, 800, 3);
      o.fillStyle = 'rgba(230,230,235,.7)'; o.beginPath(); o.moveTo(ax - 60, 399); o.lineTo(ax + 50, 399); o.lineTo(ax + 60, 404); o.lineTo(ax - 70, 404); o.fill();
    }
  }
  function newsOverlays(o, lt, gt, p, old, m) {
    const at = num(p.at, 0);
    const station = String(p.station != null ? p.station : 'KAKE').toUpperCase();
    const head = String(p.headline != null ? p.headline : 'BTK LETTER').toUpperCase();
    const sub = p.sub ? String(p.sub).toUpperCase() : '';
    const breaking = p.breaking !== false;
    const tick = p.ticker != null ? String(p.ticker) : TV_TICKER;
    const y0 = 388, bw = 800 - 2 * m;
    if (lt >= at && head) {
      const k = old ? 1 : E.out(prog(lt, at, at + .5));
      const fl = old && lt < at + .3 ? (flicker(gt, 13, 30) > .5 ? 1 : .15) : 1;
      o.save(); o.globalAlpha = fl;
      if (!old) { o.beginPath(); o.rect(m - 4, 0, (bw + 8) * k, 600); o.clip(); }
      if (breaking) {
        const lab = old ? 'SPECIAL BULLETIN' : 'BREAKING NEWS', fnt = old ? '800 24px Mont' : '400 30px Anton', ls = old ? 4 : 2;
        const tw = textW(o, lab, fnt, ls) + 34, pulse = (gt % 1) < .72 ? 1 : .5;
        o.fillStyle = `rgba(${old ? '178,22,26' : '210,18,26'},${pulse})`; o.fillRect(m, y0, tw, 42);
        txt(o, lab, m + 17, y0 + (old ? 30 : 33), fnt, '#fff', 'left', 'alphabetic', ls);
        if (!old) { o.fillStyle = '#d2121a'; o.fillRect(m, y0 + 40, bw, 4); }
      }
      const hb = y0 + 44, hh = 80;
      o.fillStyle = old ? 'rgba(0,0,0,.74)' : 'rgba(12,13,17,.95)'; o.fillRect(m, hb, bw, hh);
      if (!old) { o.fillStyle = '#d2121a'; o.fillRect(m, hb, 8, hh); const hg = o.createLinearGradient(0, hb, 0, hb + hh); hg.addColorStop(0, 'rgba(255,255,255,.09)'); hg.addColorStop(1, 'rgba(255,255,255,0)'); o.fillStyle = hg; o.fillRect(m, hb, bw, hh); }
      const hf = old ? '800 {S}px Mont' : '400 {S}px Anton', fs = fitSize(o, head, bw - 50, old ? 56 : 66, hf, 1);
      if (old) glow(o, 'rgba(255,240,220,.6)', 4);
      txt(o, head, m + 26, hb + hh / 2 + fs * (old ? .36 : .38), hf.replace('{S}', fs), old ? '#f4e4ca' : '#f7f4ef', 'left', 'alphabetic', 1); noGlow(o);
      if (sub) {
        const sb = hb + hh; o.fillStyle = old ? 'rgba(0,0,0,.62)' : 'rgba(228,228,234,.96)'; o.fillRect(m, sb, bw, 38);
        const sf = fitSize(o, sub, bw - 50, 25, '700 {S}px Mont'); txt(o, sub, m + 26, sb + 28, `700 ${sf}px Mont`, old ? '#ecdfc6' : '#141418', 'left');
      }
      o.restore();
    }
    const ta = at + .35;
    if (lt >= ta && tick) {
      const k = clamp((lt - ta) / .3), ty = 552, th = 44;
      o.save(); o.globalAlpha = k;
      o.fillStyle = old ? 'rgba(0,0,0,.82)' : '#0b0b0e'; o.fillRect(0, ty, 800, th);
      let tx0 = 0;
      if (!old) { const sw = textW(o, station, '400 26px Anton', 2) + m + 18; o.fillStyle = '#d2121a'; o.fillRect(0, ty, sw, th); txt(o, station, m - 2, ty + 33, '400 26px Anton', '#fff', 'left', 'alphabetic', 2); tx0 = sw; }
      o.beginPath(); o.rect(tx0, ty, 800 - tx0, th); o.clip();
      const s = tick.toUpperCase() + '     •     ', fnt = '700 25px Mont', tw = Math.max(50, textW(o, s, fnt)), off = ((lt - ta) * 115) % tw;
      for (let x = tx0 + Math.max(20, m - 20) - off; x < 800; x += tw) txt(o, s, x, ty + 31, fnt, old ? '#ecdcc2' : '#f0f0f2', 'left');
      o.restore();
    }
    if (old) {
      const f = 'italic 900 30px Mont'; txt(o, station, m + 6, 56, f, 'rgba(255,248,235,.85)', 'left', 'alphabetic', 1);
      o.fillStyle = 'rgba(205,30,30,.85)'; o.fillRect(m + 6, 64, textW(o, station, f, 1), 4);
    } else {
      if (p.live !== false) { o.fillStyle = '#d2121a'; o.fillRect(m, 24, 84, 34); txt(o, 'LIVE', m + 50, 51, '400 26px Anton', '#fff', 'center', 'alphabetic', 2);
        o.fillStyle = (gt % 1.2) < .8 ? '#fff' : 'rgba(255,255,255,.25)'; o.beginPath(); o.arc(m + 14, 41, 5, 0, 7); o.fill();
        if (p.time) txt(o, String(p.time), m + 98, 50, '700 22px SMono', 'rgba(240,240,244,.85)', 'left'); }
      txt(o, station, 800 - m, 50, '400 30px Anton', 'rgba(255,255,255,.6)', 'right', 'alphabetic', 2);
    }
  }
  function broadcast(o, lt, gt, p, old, m, pw, ph) {
    const img = p.image != null ? String(p.image) : 'letter', hasImg = img !== 'none' && img !== '';
    const anchor = p.anchor !== false, at = num(p.at, 0);
    const station = String(p.station != null ? p.station : 'KAKE').toUpperCase();
    if (!anchor && hasImg) { newsPic(o, img, 800, 600, gt, old); const vg = o.createLinearGradient(0, 300, 0, 600); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)'); o.fillStyle = vg; o.fillRect(0, 300, 800, 300); }
    else {
      studioBg(o, old, gt, station, pw, ph);
      const ax = hasImg ? 250 : 400;
      if (anchor) anchorFig(o, ax, gt, old);
      else { o.save(); glow(o, old ? 'rgba(255,220,180,.5)' : 'rgba(255,40,40,.6)', 30); const f = fitSize(o, station + ' NEWS', 640, 110, '900 {S}px Mont', 6); txt(o, station + ' NEWS', 400, 250, `900 ${f}px Mont`, old ? '#eedcc2' : '#e8eaf0', 'center', 'alphabetic', 6); o.restore(); }
      newsDesk(o, old, ax);
      if (hasImg) {
        const ik = E.back(prog(lt, at + .15, at + .55));
        if (ik > .001) {
          const bx = 446, by = 62, bw = 318, bh = 238;
          o.save(); o.translate(bx + bw / 2, by + bh / 2); o.scale(ik, ik); o.translate(-bw / 2, -bh / 2);
          if (old) { rr(o, 0, 0, bw, bh, 22); o.save(); o.clip(); newsPic(o, img, bw, bh, gt, old); const eg = o.createRadialGradient(bw / 2, bh / 2, bh * .3, bw / 2, bh / 2, bw * .7); eg.addColorStop(0, 'rgba(0,0,0,0)'); eg.addColorStop(1, 'rgba(0,0,0,.6)'); o.fillStyle = eg; o.fillRect(0, 0, bw, bh); o.restore(); }
          else { o.shadowColor = 'rgba(0,0,0,.7)'; o.shadowBlur = 18; o.fillStyle = '#e8e8ee'; o.fillRect(-4, -4, bw + 8, bh + 8); noShadow(o); o.save(); o.beginPath(); o.rect(0, 0, bw, bh); o.clip(); newsPic(o, img, bw, bh, gt, old); o.restore();
            if (p.insetLabel) { o.fillStyle = 'rgba(12,13,17,.92)'; o.fillRect(0, bh - 36, bw, 36); o.fillStyle = '#d2121a'; o.fillRect(0, bh - 36, 6, 36); const lf = fitSize(o, String(p.insetLabel).toUpperCase(), bw - 28, 24, '400 {S}px Anton', 1); txt(o, String(p.insetLabel).toUpperCase(), 16, bh - 9, `400 ${lf}px Anton`, '#fff', 'left', 'alphabetic', 1); } }
          if (old && p.insetLabel) { const lf = fitSize(o, String(p.insetLabel).toUpperCase(), bw - 28, 26, '800 {S}px Mont', 2); glow(o, 'rgba(0,0,0,1)', 8); txt(o, String(p.insetLabel).toUpperCase(), bw / 2, bh - 14, `800 ${lf}px Mont`, '#f4ead8', 'center', 'alphabetic', 2); noGlow(o); }
          o.restore();
        }
      }
    }
    newsOverlays(o, lt, gt, p, old, m);
  }
  function crtOverlay(S, old) { // Zeilen + Wölbungs-Vignette + Glasreflex, einmal gezeichnet
    return layer(`crtov|${S.w}|${S.h}|${S.r}|${old}`, S.w, S.h, (g) => {
      g.fillStyle = 'rgba(0,0,0,.28)'; for (let y = 2; y < S.h; y += 3) g.fillRect(0, y, S.w, 1);
      const cx = S.w / 2, cy = S.h / 2;
      const vg = g.createRadialGradient(cx, cy, S.h * .38, cx, cy, S.w * .72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${old ? .72 : .5})`); g.fillStyle = vg; g.fillRect(0, 0, S.w, S.h);
      const gl = g.createLinearGradient(0, 0, S.w * .6, S.h * .65); gl.addColorStop(0, 'rgba(255,255,255,.11)'); gl.addColorStop(.5, 'rgba(255,255,255,.025)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gl; g.fillRect(0, 0, S.w, S.h);
      g.strokeStyle = 'rgba(255,255,255,.05)'; g.lineWidth = 10; g.beginPath(); g.ellipse(cx - S.w * .05, cy - S.h * .05, S.w * .46, S.h * .44, 0, Math.PI * 1.08, Math.PI * 1.42); g.stroke();
    });
  }
  function crtComposite(c, src, S, lt, gt, st, old, I) { // Bildröhre: Rollen/Reißen, Echo, Schnee, Brummbalken, Zeilen, Glow
    const fr = Math.floor(gt * 30);
    c.save(); rr(c, S.x, S.y, S.w, S.h, S.r); c.clip();
    c.globalAlpha = clamp(.93 + .05 * noise(gt * 11, 9)) * (1 - st * .45); // Loch darunter ist schwarz
    if (st > .01) {
      const roll = st > .3 ? ((lt * 1.6) % 1) * S.h * Math.min(1, st * 1.3) : 0;
      if (st < .75) { c.drawImage(src, S.x, S.y + roll); if (roll) c.drawImage(src, S.x, S.y + roll - S.h); } // darüber deckt der Schnee ohnehin
      for (let i = 0; i < 10; i++) { const y = Math.floor(hash(fr * 7.3 + i) * S.h), hh = Math.min(6 + hash(fr * 3.1 + i * 2) * 44, S.h - y), dx = (hash(fr * 1.7 + i * 5) - .5) * 180 * st;
        if (hh > 1) c.drawImage(src, 0, y, S.w, hh, S.x + dx, S.y + y, S.w, hh); }
    } else c.drawImage(src, S.x, S.y);
    c.globalAlpha = 1;
    if (old) { c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = .07; c.drawImage(src, S.x + 6, S.y); c.restore(); } // Geisterbild (Antennenecho)
    if (st <= .01) { c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = old ? .09 : .05; c.drawImage(grain[fr % 6], S.x, S.y, S.w, S.h); c.restore(); }
    else { c.save(); c.globalAlpha = clamp(st * 1.05); c.drawImage(grain[(fr + 3) % 6], S.x - 30, S.y, S.w + 60, S.h); c.fillStyle = `rgba(0,0,0,${.22 * st})`; c.fillRect(S.x, S.y, S.w, S.h); c.restore(); }
    const hy = S.y + ((gt * .21) % 1) * (S.h + 260) - 130;
    const hg = c.createLinearGradient(0, hy - 100, 0, hy + 100); hg.addColorStop(0, 'rgba(255,255,255,0)'); hg.addColorStop(.5, `rgba(255,255,255,${old ? .055 : .04})`); hg.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = hg; c.fillRect(S.x, hy - 100, S.w, 200);
    c.drawImage(crtOverlay(S, old), S.x, S.y);
    c.restore();
    drawBloom(c, src, S.x, S.y, S.w, S.h, clamp(.42 * (.8 + .2 * I) + st * .3));
  }
  function tvViewer(c, gt, I, G) { // Zuschauer im Sessel (Silhouette, hinten)
    const hx = 262 + noise(gt * .3, 12) * 4, hy = 1452;
    c.save(); c.fillStyle = '#040405';
    rr(c, -140, 1536, 680, 720, 120); c.fill();
    c.fillRect(hx - 36, hy + 40, 72, 100);
    c.beginPath(); c.ellipse(hx, hy, 76, 90, -.05, 0, 7); c.fill();
    c.beginPath(); c.ellipse(hx - 76, hy + 8, 13, 24, -.1, 0, 7); c.ellipse(hx + 74, hy + 6, 13, 24, .1, 0, 7); c.fill(); // Ohren
    c.strokeStyle = `rgba(${G.rgb},${.38 * I})`; c.lineWidth = 4; c.lineCap = 'round';
    c.beginPath(); c.ellipse(hx, hy, 76, 90, -.05, Math.PI * 1.12, Math.PI * 1.88); c.stroke();
    c.strokeStyle = `rgba(${G.rgb},${.18 * I})`; c.beginPath(); c.moveTo(-60, 1538); c.lineTo(hx - 80, 1538); c.moveTo(hx + 80, 1538); c.lineTo(440, 1538); c.stroke();
    c.restore();
  }
  SCENES.tv_news = (c, lt, b, gt) => {
    const p = b.p || {};
    const old = p.era !== '2000s', room = p.room !== false, G = old ? TVG.old : TVG.new;
    const S = room ? G.S : { ...TV_CLOSE, r: old ? 90 : 36 };
    const st = burstAmt(lt, p.static), fr = Math.floor(gt * 30);
    const I = clamp(.8 + .13 * noise(gt * 2.2, 3) + .08 * noise(gt * 8.5, 5) + (hash(Math.floor(gt * 1.3) + 11) - .5) * .16 + st * (hash(fr * .37) - .25) * 1.3, .2, 1.6);
    const breaking = p.breaking !== false && lt >= num(p.at, 0);
    if (room) {
      // Raum + Lichtabfall + Gehäuse als eine Ebene; das Flackern moduliert die Helligkeit über Schwarz
      c.save(); c.globalAlpha = clamp(.62 + .38 * I); c.drawImage(tvSceneLayer(old), -200, -200); c.restore();
      if (breaking) { c.save(); c.globalCompositeOperation = 'screen'; c.translate(S.x + S.w / 2 - 200, 1560); c.scale(1, .2); spot(c, 0, 0, 500, RED, .12 * ((gt % 1) < .72 ? 1 : .5)); c.restore(); }
      if (!old) { // VCR blinkt 12:00, Standby-LED
        if ((gt % 1) < .55) { glow(c, 'rgba(255,40,40,.9)', 12); txt(c, '12:00', 671, 1313, '700 26px SMono', '#ff3b3b', 'center'); noGlow(c); }
        c.fillStyle = '#ff3030'; glow(c, 'rgba(255,40,40,.9)', 10); c.beginPath(); c.arc(900, 1166, 4, 0, 7); c.fill(); noGlow(c);
      }
    } else c.drawImage(tvCloseLayer(old), -200, -200);
    // Sendung in eigene Fläche rendern
    const src = scratch('tvscr', S.w, S.h), o = src.getContext('2d');
    o.setTransform(1, 0, 0, 1, 0, 0); o.globalAlpha = 1; o.globalCompositeOperation = 'source-over'; noShadow(o); o.clearRect(0, 0, S.w, S.h);
    o.setTransform(S.w / 800, 0, 0, S.h / 600, 0, 0);
    broadcast(o, lt, gt, p, old, room ? 40 : 70, S.w, S.h);
    o.setTransform(1, 0, 0, 1, 0, 0);
    crtComposite(c, src, S, lt, gt, st, old, I);
    if (room && p.viewer !== false) tvViewer(c, gt, I, G);
  };

  // ================= 2) computer_disk =================
  const PCW = { mon: { x: 110, y: 236, w: 860, h: 772 }, scr: { x: 170, y: 290, w: 740, h: 555 }, cas: { x: 80, y: 1052, w: 920, h: 246 }, slotX: 655, slotY: 1124, slotW: 210 };
  const VK = PCW.scr.w / 800;
  const PC_FIELDS = [{ k: 'Organization', v: 'Christ Lutheran Church', red: true }, { k: 'Last saved by', v: 'Dennis', red: true }];
  const DLG = { x: 96, y: 26, w: 608, h: 534 };
  function fieldLayout(n) {
    const top = DLG.y + 168, avail = DLG.h - 168 - 64;
    if (n <= 3) { const rh = Math.min(110, avail / Math.max(1, n)), off = (avail - rh * n) * .3, bh = Math.min(58, rh - 46);
      return i => { const ry = top + off + i * rh; return { lx: DLG.x + 36, ly: ry + 20, x: DLG.x + 36, y: ry + 40, w: DLG.w - 72, h: bh, mg: 10 }; }; }
    const rh = avail / n, bh = Math.min(44, rh - 10), mg = Math.max(3, Math.min(10, (rh - bh) / 2 - 2));
    return i => { const ry = top + i * rh; return { lx: DLG.x + 36, ly: ry + rh / 2 + 7, x: DLG.x + 220, y: ry + (rh - bh) / 2, w: DLG.w - 256, h: bh, side: true, mg }; };
  }
  function bevel(c, x, y, w, h, raised, fill = '#bdbab3') {
    c.fillStyle = fill; c.fillRect(x, y, w, h);
    c.fillStyle = raised ? '#efede8' : '#7a7770'; c.fillRect(x, y, w, 2); c.fillRect(x, y, 2, h);
    c.fillStyle = raised ? '#6e6b65' : '#f4f2ee'; c.fillRect(x, y + h - 2, w, 2); c.fillRect(x + w - 2, y, 2, h);
  }
  function docIcon(c, x, y, s = 1, sel = false) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = '#f2f2ee'; c.beginPath(); c.moveTo(0, 0); c.lineTo(30, 0); c.lineTo(42, 12); c.lineTo(42, 54); c.lineTo(0, 54); c.closePath(); c.fill();
    c.strokeStyle = '#55575c'; c.lineWidth = 1.6; c.stroke();
    c.fillStyle = '#c9c9c4'; c.beginPath(); c.moveTo(30, 0); c.lineTo(30, 12); c.lineTo(42, 12); c.closePath(); c.fill();
    c.fillStyle = '#4a6a9a'; for (let i = 0; i < 6; i++) c.fillRect(7, 18 + i * 5.6, i % 3 === 2 ? 18 : 28, 2.2);
    if (sel) { c.fillStyle = 'rgba(52,70,92,.35)'; c.fillRect(-4, -4, 50, 62); }
    c.restore();
  }
  function deskIcon(c, x, y, kind, label) {
    c.save(); c.translate(x, y);
    if (kind === 'pc') { c.fillStyle = '#cfcabc'; c.fillRect(4, 0, 40, 30); c.fillStyle = '#2b3d52'; c.fillRect(9, 5, 30, 20); c.fillStyle = '#cfcabc'; c.fillRect(14, 31, 20, 5); c.fillRect(8, 36, 32, 5); }
    else if (kind === 'folder') { c.fillStyle = '#c9a957'; c.fillRect(2, 6, 18, 6); c.fillRect(2, 10, 44, 30); c.fillStyle = '#e0c470'; c.fillRect(2, 15, 44, 25); }
    else { c.fillStyle = '#9aa0a8'; c.beginPath(); c.moveTo(8, 6); c.lineTo(40, 6); c.lineTo(36, 42); c.lineTo(12, 42); c.closePath(); c.fill(); c.fillStyle = '#7a8088'; c.fillRect(5, 2, 38, 5); }
    txt(c, label, 24, 60, '600 14px Mont', '#eef0f2', 'center');
    c.restore();
  }
  function arrowCursor(c, x, y, busy) {
    c.save(); c.translate(x, y);
    if (busy) { c.fillStyle = '#f4f4f4'; c.strokeStyle = '#111'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(0, 0); c.lineTo(20, 0); c.lineTo(11, 14); c.lineTo(20, 28); c.lineTo(0, 28); c.lineTo(9, 14); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#8a6a2a'; c.beginPath(); c.moveTo(4, 26); c.lineTo(16, 26); c.lineTo(10, 18); c.fill(); }
    else { c.fillStyle = '#f7f7f7'; c.strokeStyle = '#0c0c0c'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 30); c.lineTo(7, 23); c.lineTo(12, 34); c.lineTo(17, 32); c.lineTo(12, 21); c.lineTo(22, 21); c.closePath(); c.fill(); c.stroke(); }
    c.restore();
  }
  function pcTiming(p) {
    const fIn = p.floppyIn === undefined ? .3 : (isNum(p.floppyIn) ? p.floppyIn : null);
    const T = { fIn, click: fIn != null ? fIn + 1.5 : -99, win: fIn != null ? fIn + 2.1 : -99 };
    T.open = p.open === undefined ? (fIn != null ? fIn + 3.35 : 1.2) : (isNum(p.open) ? p.open : null);
    const src = Array.isArray(p.fields) ? p.fields : PC_FIELDS;
    const base = T.open != null ? T.open : 0;
    T.fields = src.map((f, i) => { const v = f.v != null ? String(f.v) : ''; const at = isNum(f.at) ? f.at : base + .6 + i * .95; return { k: String(f.k || ''), v, red: !!f.red, at, end: at + clamp(v.length / 18, .3, 1.4) }; });
    const ends = T.fields.map(f => f.end);
    T.zoom = p.zoom === undefined ? (T.open != null && ends.length ? Math.max(...ends) + .4 : null) : (isNum(p.zoom) ? p.zoom : null);
    T.file = p.file != null ? String(p.file) : 'Test A.rtf';
    T.title = p.title ? String(p.title) : T.file + ' Properties';
    return T;
  }
  function pcScreen(c, lt, gt, p, T) { // virtueller Bildschirm 800x600
    c.fillStyle = '#233340'; c.fillRect(0, 0, 800, 600);
    deskIcon(c, 22, 24, 'pc', 'Computer'); deskIcon(c, 22, 116, 'folder', 'Documents'); deskIcon(c, 22, 208, 'bin', 'Trash');
    c.fillStyle = '#aeaba4'; c.fillRect(0, 566, 800, 34); c.fillStyle = '#e2dfd8'; c.fillRect(0, 566, 800, 2);
    bevel(c, 4, 570, 86, 26, true); txt(c, 'Menu', 47, 589, '700 15px Mont', '#1a1a1a', 'center');
    bevel(c, 686, 570, 110, 26, false, '#b5b2ab'); txt(c, p.clock != null ? String(p.clock) : '11:52 PM', 741, 589, '600 14px Mont', '#1a1a1a', 'center');
    const open = T.open;
    const winK = T.win < -50 ? 1 : E.out(prog(lt, T.win, T.win + .25));
    if (winK > 0) { bevel(c, 96, 570, 190, 26, false, '#c9c6bf'); txt(c, 'Removable Disk (A:)', 106, 588, '600 13px Mont', '#1a1a1a', 'left'); }
    const ix = 112, iy = 150;
    if (winK > 0) {
      c.save(); c.globalAlpha = clamp(winK * 1.4); c.translate(80, 52); c.scale(lerp(.94, 1, winK), lerp(.94, 1, winK)); c.translate(-80, -52);
      const x = 66, y = 52, w = 440, h = 290, act = open == null || lt < open;
      bevel(c, x, y, w, h, true);
      const tg = c.createLinearGradient(x, 0, x + w, 0); tg.addColorStop(0, act ? '#33465d' : '#6b6e74'); tg.addColorStop(1, act ? '#5d7189' : '#8f9298'); c.fillStyle = tg; c.fillRect(x + 4, y + 4, w - 8, 28);
      txt(c, 'Removable Disk (A:)', x + 12, y + 24, '700 16px Mont', '#f3f3f3', 'left');
      for (let i = 0; i < 3; i++) { bevel(c, x + w - 30 - i * 26, y + 8, 22, 20, true); }
      txt(c, '×', x + w - 19, y + 24, '700 18px Mont', '#111', 'center');
      c.fillStyle = '#c4c1ba'; c.fillRect(x + 4, y + 34, w - 8, 26); txt(c, 'File   Edit   View   Help', x + 12, y + 52, '500 14px Mont', '#222', 'left');
      bevel(c, x + 8, y + 64, w - 16, 26, false, '#f3f3f0'); txt(c, 'A:\\', x + 16, y + 83, '600 15px Mont', '#222', 'left');
      c.fillStyle = '#f6f6f3'; c.fillRect(x + 8, y + 94, w - 16, h - 102);
      const sel = open != null && lt >= open - .58;
      docIcon(c, ix, iy, 1, sel);
      if (sel) { c.fillStyle = '#34465c'; const tw = textW(c, T.file, '600 15px Mont'); c.fillRect(ix + 21 - tw / 2 - 4, iy + 62, tw + 8, 22); }
      txt(c, T.file, ix + 21, iy + 78, '600 15px Mont', sel ? '#fff' : '#1a1a1a', 'center');
      txt(c, '1 object(s)   ' + (p.size || '1.2 KB'), x + 14, y + h - 12, '500 13px Mont', '#444', 'left');
      c.restore();
    }
    // Kontextmenü
    const items = ['Open', 'Print', 'Open With...', '-', 'Send To', '-', 'Cut', 'Copy', '-', 'Delete', 'Rename', '-', 'Properties'];
    const mx = ix + 30, my = iy + 26;
    const ih = it => it === '-' ? 9 : 25;
    let propY = my + 4; for (const it of items.slice(0, -1)) propY += ih(it);
    if (open != null && lt >= open - .55 && lt < open) {
      const mh = items.reduce((s, it) => s + ih(it), 8);
      c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(mx + 5, my + 5, 196, mh); bevel(c, mx, my, 196, mh, true);
      let yy = my + 4;
      for (const it of items) {
        if (it === '-') { c.fillStyle = '#7a7770'; c.fillRect(mx + 6, yy + 4, 184, 1); c.fillStyle = '#f4f2ee'; c.fillRect(mx + 6, yy + 5, 184, 1); yy += 9; continue; }
        const hl = it === 'Properties' && lt >= open - .28;
        if (hl) { c.fillStyle = '#34465c'; c.fillRect(mx + 4, yy, 188, 25); }
        txt(c, it, mx + 24, yy + 18, (it === 'Open' ? '700' : '500') + ' 15px Mont', hl ? '#fff' : '#1a1a1a', 'left'); yy += 25;
      }
    }
    // Eigenschaften-Dialog
    if (open != null && lt >= open) {
      const k = E.out(prog(lt, open, open + .22));
      c.save(); c.globalAlpha = clamp(k * 1.5); c.translate(DLG.x + DLG.w / 2, DLG.y + DLG.h / 2); c.scale(lerp(.9, 1, k), lerp(.9, 1, k)); c.translate(-DLG.x - DLG.w / 2, -DLG.y - DLG.h / 2);
      c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(DLG.x + 7, DLG.y + 7, DLG.w, DLG.h);
      bevel(c, DLG.x, DLG.y, DLG.w, DLG.h, true, '#c9c6bf');
      const tg = c.createLinearGradient(DLG.x, 0, DLG.x + DLG.w, 0); tg.addColorStop(0, '#33465d'); tg.addColorStop(1, '#5d7189'); c.fillStyle = tg; c.fillRect(DLG.x + 4, DLG.y + 4, DLG.w - 8, 30);
      const tf = fitSize(c, T.title, DLG.w - 90, 17, '700 {S}px Mont'); txt(c, T.title, DLG.x + 12, DLG.y + 25, `700 ${tf}px Mont`, '#f3f3f3', 'left');
      bevel(c, DLG.x + DLG.w - 30, DLG.y + 9, 22, 20, true); txt(c, '×', DLG.x + DLG.w - 19, DLG.y + 25, '700 18px Mont', '#111', 'center');
      bevel(c, DLG.x + DLG.w - 56, DLG.y + 9, 22, 20, true); txt(c, '?', DLG.x + DLG.w - 45, DLG.y + 25, '700 15px Mont', '#111', 'center');
      const tabs = ['General', 'Summary', 'Custom']; let tx = DLG.x + 12;
      const panelY = DLG.y + 72;
      tabs.forEach((tb, i) => { const tw = textW(c, tb, '600 15px Mont') + 30, act = i === 1;
        bevel(c, tx, DLG.y + 44 - (act ? 3 : 0), tw, 30 + (act ? 3 : 0), true, act ? '#dcd9d2' : '#c4c1ba'); txt(c, tb, tx + tw / 2, DLG.y + 65 - (act ? 2 : 0), `${act ? 700 : 500} 15px Mont`, '#151515', 'center'); tx += tw + 2; });
      bevel(c, DLG.x + 10, panelY, DLG.w - 20, DLG.h - 128, true, '#dcd9d2');
      docIcon(c, DLG.x + 34, panelY + 16, .9);
      const ff = fitSize(c, T.file, DLG.w - 150, 26, '700 {S}px Mont'); txt(c, T.file, DLG.x + 92, panelY + 52, `700 ${ff}px Mont`, '#141416', 'left');
      c.fillStyle = '#8a8780'; c.fillRect(DLG.x + 30, panelY + 82, DLG.w - 60, 1); c.fillStyle = '#f4f2ee'; c.fillRect(DLG.x + 30, panelY + 83, DLG.w - 60, 1);
      const L = fieldLayout(T.fields.length);
      T.fields.forEach((f, i) => {
        const r = L(i);
        txt(c, f.k + ':', r.lx, r.ly, `600 ${r.side ? 17 : 19}px Mont`, '#2a2a2e', 'left');
        const redK = f.red ? E.out(prog(lt, f.end, f.end + .25)) : 0;
        bevel(c, r.x, r.y, r.w, r.h, false, '#fbfbf9');
        if (redK > 0) { c.save(); c.globalAlpha = redK; c.fillStyle = '#ad1119'; c.fillRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4); c.restore(); }
        const n = lt < f.at ? 0 : Math.min(f.v.length, Math.floor((lt - f.at) / Math.max(.01, f.end - f.at) * f.v.length + .999));
        const shown = f.v.slice(0, n), fs = fitSize(c, f.v || 'M', r.w - 28, Math.round(r.h * .64), '700 {S}px Mont');
        const tcol = redK > .5 ? '#ffffff' : '#111114';
        if (redK > 0) glow(c, `rgba(255,40,40,${redK})`, 14);
        txt(c, shown, r.x + 14, r.y + r.h / 2 + fs * .36, `700 ${fs}px Mont`, tcol, 'left'); noGlow(c);
        const typing = lt >= f.at && lt < f.end + 1.2, last = i === T.fields.length - 1 && lt >= f.at;
        if ((typing || last) && (gt % .9) < .5) { const cw = textW(c, shown, `700 ${fs}px Mont`); c.fillStyle = tcol; c.fillRect(r.x + 16 + cw, r.y + r.h * .18, 2.5, r.h * .64); }
      });
      ['OK', 'Cancel', 'Apply'].forEach((bt, i) => { const bx = DLG.x + DLG.w - 3 * 104 - 10 + i * 104; bevel(c, bx, DLG.y + DLG.h - 46, 94, 32, true); txt(c, bt, bx + 47, DLG.y + DLG.h - 24, '600 15px Mont', '#151515', 'center'); });
      c.restore();
    }
    // Mauszeiger
    let cx = 640, cy = 470, busy = T.fIn != null && lt >= T.click && lt < T.win + .3;
    if (open != null) {
      const a = E.inOut(prog(lt, open - 1.0, open - .6)), b2 = E.inOut(prog(lt, open - .45, open - .25)), d = E.inOut(prog(lt, open + .15, open + .9));
      cx = lerp(lerp(lerp(640, ix + 24, a), mx + 70, b2), 760, d); cy = lerp(lerp(lerp(470, iy + 30, a), propY + 12, b2), 545, d);
    }
    arrowCursor(c, cx + noise(gt * .8, 31) * 1.5, cy + noise(gt * .7, 32) * 1.5, busy);
  }
  function pcWorldBg(c) { // Wand (Licht nur vom Bildschirm) + Tisch; Wand nur dort füllen, wo Monitor/Gehäuse nicht decken
    const wg = c.createRadialGradient(540, 560, 150, 540, 640, 1250); wg.addColorStop(0, '#1d2128'); wg.addColorStop(.45, '#111317'); wg.addColorStop(1, '#060607');
    c.fillStyle = wg; c.fillRect(-500, -700, W + 1000, 990); c.fillRect(-500, 250, 650, 1040); c.fillRect(930, 250, 650, 1040); c.fillRect(100, 960, 880, 100);
    const dg = c.createLinearGradient(0, 1290, 0, 2000); dg.addColorStop(0, '#2a2219'); dg.addColorStop(.4, '#18130e'); dg.addColorStop(1, '#070605'); c.fillStyle = dg; c.fillRect(-500, 1290, W + 1000, 1100);
    c.fillStyle = 'rgba(255,230,200,.06)'; c.fillRect(-500, 1290, W + 1000, 3);
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 2; for (let i = 0; i < 14; i++) { const y = 1310 + i * 34 + hash(i) * 10; c.beginPath(); c.moveTo(-500, y); c.bezierCurveTo(200, y + 8, 700, y - 8, W + 500, y + 4); c.stroke(); }
    // Tastatur + Maus (im Halbdunkel)
    rr(c, 190, 1460, 700, 120, 14); c.fillStyle = '#3e3a31'; c.fill(); rr(c, 206, 1474, 668, 92, 8); c.fillStyle = '#302d26'; c.fill();
    c.fillStyle = '#47423a'; for (let r = 0; r < 4; r++) for (let k = 0; k < 18; k++) c.fillRect(214 + k * 36.5, 1480 + r * 21, 31, 16);
    rr(c, 940, 1480, 70, 104, 34); c.fillStyle = '#3a362e'; c.fill();
  }
  function pcCase(c, lt, gt, T) {
    const K = PCW.cas;
    rr(c, K.x + 10, K.y - 16, K.w - 20, 22, 6); c.fillStyle = '#8d8574'; c.fill();
    rr(c, K.x, K.y, K.w, K.h, 10); const g = c.createRadialGradient(560, 900, 220, 560, 1000, 720); g.addColorStop(0, '#7f7867'); g.addColorStop(1, '#423d32'); c.fillStyle = g; c.fill();
    c.fillStyle = 'rgba(255,245,225,.1)'; c.fillRect(K.x + 6, K.y + 2, K.w - 12, 2);
    // CD-Laufwerk + Blende
    rr(c, 130, 1080, 430, 70, 6); c.fillStyle = '#6e6757'; c.fill(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 2; c.stroke();
    c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(140, 1110, 410, 2); rr(c, 496, 1126, 46, 14, 4); c.fillStyle = '#5e5849'; c.fill(); c.fillStyle = '#2a2a22'; c.fillRect(150, 1130, 12, 5);
    rr(c, 130, 1162, 430, 70, 6); c.fillStyle = '#736c5b'; c.fill(); c.strokeStyle = 'rgba(0,0,0,.3)'; c.stroke();
    // Diskettenlaufwerk
    rr(c, 610, 1090, 300, 84, 6); c.fillStyle = '#6c6555'; c.fill(); c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 2; c.stroke();
    rr(c, PCW.slotX - 6, PCW.slotY - 9, PCW.slotW + 12, 22, 8); c.fillStyle = '#4f493d'; c.fill();
    rr(c, PCW.slotX, PCW.slotY - 5, PCW.slotW, 12, 5); c.fillStyle = '#050505'; c.fill();
    c.fillStyle = 'rgba(255,240,210,.12)'; c.fillRect(PCW.slotX + 6, PCW.slotY + 8, PCW.slotW - 12, 2);
    const ej = T.fIn != null && lt >= T.click ? 1 : 0;
    rr(c, 836, 1146, 50, 16, 4); c.fillStyle = ej ? '#7a7363' : '#5f594c'; c.fill(); if (ej) { c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(838, 1161, 48, 3); }
    const reading = T.fIn != null && lt >= T.click && lt < T.click + 2.2;
    const ledOn = reading && noise(gt * 14, 41) > -.3;
    c.fillStyle = ledOn ? '#7dff6a' : '#24301f'; if (ledOn) glow(c, 'rgba(120,255,100,.95)', 16); c.fillRect(632, 1150, 18, 7); noGlow(c);
    // Netzschalter
    c.beginPath(); c.arc(950, 1190, 22, 0, 7); c.fillStyle = '#6a6354'; c.fill(); c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 3; c.stroke();
    c.fillStyle = '#5dff6e'; glow(c, 'rgba(90,255,110,.8)', 8); c.beginPath(); c.arc(950, 1234, 4, 0, 7); c.fill(); noGlow(c);
    c.fillStyle = 'rgba(0,0,0,.3)'; for (let x = 140; x < 880; x += 12) c.fillRect(x, 1252, 5, 30);
  }
  function pcMonitor(c) {
    const M = PCW.mon, S = PCW.scr;
    c.beginPath(); c.ellipse(540, 1047, 205, 15, 0, 0, 7); c.fillStyle = '#4e4839'; c.fill();
    c.fillStyle = '#5a5444'; c.beginPath(); c.moveTo(440, 1000); c.lineTo(640, 1000); c.lineTo(672, 1044); c.lineTo(408, 1044); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,245,225,.08)'; c.fillRect(440, 1000, 200, 3);
    rr(c, M.x + 50, M.y - 24, M.w - 100, 40, 18); c.fillStyle = '#5a5444'; c.fill();
    rr(c, M.x, M.y, M.w, M.h, 38); const g = c.createRadialGradient(540, 560, 360, 540, 600, 700); g.addColorStop(0, '#978f7b'); g.addColorStop(1, '#4f493c'); c.fillStyle = g; c.fill();
    c.strokeStyle = 'rgba(255,248,230,.13)'; c.lineWidth = 3; rr(c, M.x + 3, M.y + 3, M.w - 6, M.h - 6, 36); c.stroke();
    rr(c, S.x - 15.5, S.y - 15.5, S.w + 31, S.h + 31, 23); c.lineWidth = 13; c.strokeStyle = '#4a4538'; c.stroke(); // Vertiefung (nur Ring, Bild deckt die Mitte)
    rr(c, S.x - 4, S.y - 4, S.w + 8, S.h + 8, 18); c.lineWidth = 10; c.strokeStyle = '#060606'; c.stroke();
    const cy = S.y + S.h + 70;
    rr(c, 480, cy - 13, 120, 26, 7); c.fillStyle = '#857e6b'; c.fill(); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 2; c.stroke();
    for (let i = 0; i < 5; i++) { rr(c, 700 + i * 34, cy - 7, 24, 14, 4); c.fillStyle = '#7a7362'; c.fill(); c.strokeStyle = 'rgba(0,0,0,.3)'; c.stroke(); }
    c.fillStyle = '#5dff6e'; glow(c, 'rgba(90,255,110,.85)', 10); c.beginPath(); c.arc(894, cy, 5, 0, 7); c.fill(); noGlow(c);
    c.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < 10; i++) c.fillRect(160 + i * 14, cy - 10, 6, 20);
  }
  function pcGlass() { // Zeilen + Vignette + Glasreflex des Monitors in einer Ebene
    const S = PCW.scr;
    return layer('pcglass', S.w, S.h, (g, w, h) => {
      g.fillStyle = 'rgba(0,0,0,.22)'; for (let y = 2; y < h; y += 3) g.fillRect(0, y, w, 1);
      const vg = g.createRadialGradient(w / 2, h / 2, h * .4, w / 2, h / 2, w * .7); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)'); g.fillStyle = vg; g.fillRect(0, 0, w, h);
      const gl = g.createLinearGradient(0, 0, w * .5, h * .7); gl.addColorStop(0, 'rgba(255,255,255,.09)'); gl.addColorStop(.55, 'rgba(255,255,255,.015)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gl; g.fillRect(0, 0, w, h);
    });
  }
  function floppyTex(label) { return layer('floppy|' + label, 320, 320, (g) => floppyFace(g, 320, label)); }
  // Diskette: erst frontal (Etikett lesbar), kippt dann perspektivisch nach hinten und gleitet in den Schlitz.
  // Trapez-Perspektive über horizontale Streifen (Canvas kann nur affin).
  function floppyAnim(c, lt, gt, T, label) {
    const f0 = T.fIn; if (f0 == null) return;
    const tB = f0 + 1.0, tC = f0 + 1.5; if (lt > tC + .02) return;
    const D = 204, Fl = 720, u = E.inOut(prog(lt, f0, tB)), ins = E.inOut(prog(lt, tB, tC));
    const th = lerp(0, 1.36, u), sc = lerp(1.22, 1, u);
    const idle = 1 - u, bob = Math.sin(gt * 1.7) * 5 * idle, roll = (noise(gt * .5, 44) * .035 - .05) * idle;
    const topY = lerp(PCW.slotY + 62, PCW.slotY + 1, E.out(u)) + bob, cx = lerp(724, PCW.slotX + PCW.slotW / 2, u);
    const half = D / 2 * Math.sin(th), kT = Fl / (Fl + half), kB = Fl / (Fl - half), Hp = D * Math.cos(th) * sc;
    const wAt = t => D * sc * lerp(kT, kB, t), tex = floppyTex(label), TS = tex.width;
    const vis = 1 - ins, hv = Hp * vis;
    c.save(); c.beginPath(); c.rect(-400, PCW.slotY + 1, W + 800, 2400); c.clip();
    c.translate(cx, topY); c.rotate(roll);
    // Schatten aufs Gehäuse
    c.save(); c.shadowColor = 'rgba(0,0,0,.7)'; c.shadowBlur = 22; c.shadowOffsetY = 10 + 22 * Math.sin(th);
    c.fillStyle = '#3f2b63'; c.beginPath(); c.moveTo(-wAt(ins) / 2, 0); c.lineTo(wAt(ins) / 2, 0); c.lineTo(wAt(1) / 2, hv); c.lineTo(-wAt(1) / 2, hv); c.closePath(); c.fill(); c.restore();
    const N = 40;
    for (let j = 0; j < N; j++) {
      const t0 = ins + vis * j / N, t1 = ins + vis * (j + 1) / N, y0 = (t0 - ins) * Hp, y1 = (t1 - ins) * Hp, wm = wAt((t0 + t1) / 2);
      c.drawImage(tex, 0, t0 * TS, TS, Math.max(.5, (t1 - t0) * TS), -wm / 2, y0, wm, y1 - y0 + .7);
    }
    // Lichtwechsel: frontal dunkler, flach liegend vom Bildschirm beleuchtet
    c.fillStyle = `rgba(0,0,0,${.24 * Math.cos(th)})`; c.beginPath(); c.moveTo(-wAt(ins) / 2, 0); c.lineTo(wAt(ins) / 2, 0); c.lineTo(wAt(1) / 2, hv); c.lineTo(-wAt(1) / 2, hv); c.closePath(); c.fill();
    const tk = 7 * Math.sin(th) * sc; // Kante (Dicke)
    if (tk > .3) { c.fillStyle = '#271a3c'; c.fillRect(-wAt(1) / 2, hv, wAt(1), tk); c.fillStyle = 'rgba(255,255,255,.1)'; c.fillRect(-wAt(1) / 2, hv, wAt(1), 1.2); }
    c.restore();
  }
  SCENES.computer_disk = (c, lt, b, gt) => {
    const p = b.p || {};
    const T0 = c.getTransform();
    const T = pcTiming(p), S = PCW.scr;
    const I = .9 + .07 * noise(gt * 3.1, 17) + .04 * noise(gt * 13, 18);
    // Kamera in der Szene: Laufwerk -> Monitor -> Felder
    const VD = { x: 762, y: 1182, s: 2.05 }, VM = { x: 540, y: 600, s: 1.06 };
    let v = VM;
    if (T.fIn != null) { const k = E.inOut(prog(lt, T.click + .2, T.click + 1.4)); v = { x: lerp(VD.x, VM.x, k), y: lerp(VD.y, VM.y, k), s: Math.exp(lerp(Math.log(VD.s), Math.log(VM.s), k)) }; }
    const L = fieldLayout(T.fields.length);
    if (T.zoom != null && T.open != null && T.fields.length) {
      const sel = T.fields.map((f, i) => ({ f, r: L(i) })).filter(o => o.f.red); const use = sel.length ? sel : T.fields.map((f, i) => ({ f, r: L(i) }));
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const { r } of use) { x0 = Math.min(x0, r.side ? r.lx : r.x); y0 = Math.min(y0, r.side ? r.y : r.ly - 22); x1 = Math.max(x1, r.x + r.w); y1 = Math.max(y1, r.y + r.h); }
      const wx0 = S.x + x0 * VK, wx1 = S.x + x1 * VK, wy0 = S.y + y0 * VK, wy1 = S.y + y1 * VK;
      const sZ = clamp(Math.min(800 / (wx1 - wx0 + 30), 820 / (wy1 - wy0 + 50)), 1.2, 3); // bleibt in x 140..940
      const VZ = { x: (wx0 + wx1) / 2, y: (wy0 + wy1) / 2, s: sZ };
      const k = E.inOut(prog(lt, T.zoom, T.zoom + 1.5));
      v = { x: lerp(v.x, VZ.x, k), y: lerp(v.y, VZ.y, k), s: Math.exp(lerp(Math.log(v.s), Math.log(VZ.s), k)) };
    }
    const bump = T.fIn != null && lt > T.click ? Math.exp(-(lt - T.click) * 9) * .04 : 0;
    const s = v.s * (1 + bump + .01 * Math.sin(gt * .45));
    c.translate(540, 860); c.scale(s, s); c.translate(-v.x + noise(gt * .3, 2) * 2.5, -v.y + noise(gt * .27, 5) * 2.5);
    // Welt
    pcWorldBg(c);
    pcCase(c, lt, gt, T);
    pcMonitor(c);
    // Bildschirm
    c.save(); rr(c, S.x, S.y, S.w, S.h, 16); c.clip();
    c.save(); c.translate(S.x, S.y); c.scale(VK, VK); pcScreen(c, lt, gt, p, T); c.restore();
    const ry = S.y + ((gt * .17) % 1) * (S.h + 200) - 100, rg = c.createLinearGradient(0, ry - 70, 0, ry + 70); rg.addColorStop(0, 'rgba(255,255,255,0)'); rg.addColorStop(.5, 'rgba(255,255,255,.035)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = rg; c.fillRect(S.x, ry - 70, S.w, 140);
    c.globalAlpha = clamp(.88 + .24 * noise(gt * 9, 23)); c.drawImage(pcGlass(), S.x, S.y, S.w, S.h); c.globalAlpha = 1; // Zeilen + Glas, flackert leicht
    c.restore();
    const cx = S.x + S.w / 2, cy = S.y + S.h / 2, ga = .1 * I * clamp((1.7 - s) / .5);
    if (ga > .002) { c.save(); c.globalCompositeOperation = 'screen'; const sg = c.createRadialGradient(cx, cy, S.h * .45, cx, cy, S.w * .62); sg.addColorStop(0, `rgba(150,175,205,${ga})`); sg.addColorStop(1, 'rgba(150,175,205,0)'); c.fillStyle = sg; c.fillRect(S.x - 60, S.y - 60, S.w + 120, S.h + 120); c.restore(); }
    // rote Markierungen (über dem Glas)
    if (T.open != null && lt >= T.open) T.fields.forEach((f, i) => {
      if (!f.red) return; const t0 = f.end + .12; if (lt < t0) return;
      const r = L(i), k = E.inOut(prog(lt, t0, t0 + .5));
      const m = r.mg, x0 = S.x + (r.x - 12) * VK, y0 = S.y + (r.y - m) * VK, w = (r.w + 24) * VK, h = (r.h + 2 * m) * VK, j = m / 10;
      const pts = [[x0 - 6, y0 + 3 * j], [x0 + w + 4, y0 - 2 * j], [x0 + w + 2, y0 + h + 3 * j], [x0 - 3, y0 + h], [x0 + 4, y0 - 5 * j]];
      const segL = pts.slice(1).map((q, j) => Math.hypot(q[0] - pts[j][0], q[1] - pts[j][1])), tot = segL.reduce((a2, b3) => a2 + b3, 0);
      let rem = tot * k;
      c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
      for (let j = 0; j < segL.length && rem > 0; j++) { const u = Math.min(1, rem / segL[j]); c.lineTo(lerp(pts[j][0], pts[j + 1][0], u), lerp(pts[j][1], pts[j + 1][1], u)); rem -= segL[j]; }
      c.strokeStyle = 'rgba(255,30,30,.14)'; c.lineWidth = 22; c.stroke(); c.strokeStyle = 'rgba(255,30,30,.25)'; c.lineWidth = 12; c.stroke();
      c.strokeStyle = 'rgba(255,40,40,.97)'; c.lineWidth = 5.5; c.stroke(); c.restore();
    });
    floppyAnim(c, lt, gt, T, p.label != null ? String(p.label) : '');
    // Bildschirmraum: roter Puls bei der Enthüllung
    c.setTransform(T0);
    let pulse = 0; for (const f of T.fields) if (f.red && lt > f.end) pulse = Math.max(pulse, Math.exp(-(lt - f.end) * 3.2));
    const after = T.zoom != null && lt > T.zoom ? clamp(prog(lt, T.zoom, T.zoom + 1.5)) * (.55 + .45 * Math.sin(gt * 3.4)) : 0;
    const a = clamp(pulse * .42 + after * .2);
    if (a > .01) { // rote Vignette als kleines, hochskaliertes Bild
      const rv = layer('redvig', 74, 116, (g, w, h) => { g.save(); g.translate(w / 2, h / 2); g.scale(1, h / w); const rg = g.createRadialGradient(0, 0, w * .24, 0, 0, w * .62); rg.addColorStop(0, 'rgba(255,20,20,0)'); rg.addColorStop(1, 'rgba(255,20,20,1)'); g.fillStyle = rg; g.fillRect(-w, -w, 2 * w, 2 * w); g.restore(); });
      c.save(); c.globalAlpha = a; c.drawImage(rv, -200, -200, W + 400, H + 400); c.restore();
    }
  };

  // ================= 3) evidence_board =================
  const EB = { x0: 215, x1: 865, y0: 556, y1: 1278 }, EB_TY = 410;
  const EB_DEFAULT = {
    title: 'BTK', torch: true,
    cards: [
      { text: 'WICHITA, KS\n1974 – 1991', kind: 'card', x: .12, y: .04, at: .35, rot: -.06 },
      { text: 'LETTERS TO\nTHE PRESS', kind: 'note', x: .86, y: .1, at: .8, rot: .07 },
      { text: 'SUSPECT?', kind: 'photo', x: .5, y: .43, at: 1.3, rot: -.03, red: true },
      { text: 'PURPLE FLOPPY DISK', kind: 'card', x: .14, y: .84, at: 1.85, rot: .05 },
      { text: 'CHRIST LUTHERAN CHURCH', kind: 'card', x: .84, y: .9, at: 2.35, rot: -.05, red: true },
    ],
    strings: [{ from: 0, to: 2, at: 2.9 }, { from: 1, to: 2, at: 3.2 }, { from: 3, to: 2, at: 3.5 }, { from: 4, to: 2, at: 3.8 }],
    circle: { i: 2, at: 4.4 },
  };
  function ebDims(kind, s) { return kind === 'photo' ? [236 * s, 286 * s] : kind === 'note' ? [250 * s, 226 * s] : [330 * s, 206 * s]; }
  function corkLayer() {
    return layer('cork', W + 400, H + 400, (g) => {
      const R = rng(1977), CW = W + 400, CH = H + 400;
      g.fillStyle = '#6e5038'; g.fillRect(0, 0, CW, CH);
      for (let i = 0; i < 46; i++) { const x = R() * CW, y = R() * CH, r = 90 + R() * 280, dark = R() > .5, gg = g.createRadialGradient(x, y, 0, x, y, r);
        gg.addColorStop(0, dark ? 'rgba(35,22,10,.24)' : 'rgba(160,120,80,.14)'); gg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gg; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
      // Korkkörnung: Rauschkachel als Muster, zweimal versetzt/skaliert gegen sichtbare Wiederholung
      const TL = document.createElement('canvas'); TL.width = TL.height = 256; const tc = TL.getContext('2d'), id = tc.createImageData(256, 256), d = id.data;
      for (let i = 0; i < d.length; i += 4) { const v = R(), light = v > .965 || (v > .5 && R() > .55); d[i] = light ? 200 : 22; d[i + 1] = light ? 160 : 13; d[i + 2] = light ? 112 : 6; d[i + 3] = v > .965 ? 110 : v < .035 ? 150 : R() * 70; }
      tc.putImageData(id, 0, 0);
      g.fillStyle = g.createPattern(TL, 'repeat'); g.fillRect(0, 0, CW, CH);
      g.save(); g.globalAlpha = .55; g.translate(37, 91); g.rotate(.3); g.scale(1.8, 1.8); g.fillStyle = g.createPattern(TL, 'repeat'); g.fillRect(-600, -600, CW, CH); g.restore();
      g.translate(200, 200);
      for (let i = 0; i < 260; i++) { g.fillStyle = 'rgba(25,15,8,.7)'; g.beginPath(); g.arc(R() * (W + 400) - 200, R() * (H + 400) - 200, 1.5 + R() * 1.5, 0, 7); g.fill(); } // alte Nadellöcher
      for (let i = 0; i < 14; i++) { g.save(); g.translate(R() * W, R() * H); g.rotate((R() - .5) * .6); g.fillStyle = `rgba(230,215,180,${.04 + R() * .05})`; g.fillRect(-70, -50, 140 + R() * 80, 100 + R() * 60); g.restore(); }
      // unscharfe alte Zettel am Rand (Tiefe): klein zeichnen, groß skalieren = weich
      const scraps = [[-30, 560, 230, 300, -.08, 'news'], [990, 300, 220, 280, .1, 'news'], [1010, 1080, 200, 250, -.06, 'photo'], [-50, 1200, 220, 200, .07, 'note'], [420, 1560, 300, 220, -.04, 'news'], [760, 1640, 220, 260, .09, 'photo'], [80, 1700, 240, 200, .05, 'map'], [-40, 140, 220, 200, .04, 'map'], [760, 60, 240, 160, -.07, 'note']];
      const SD = 4, sc = document.createElement('canvas'); sc.width = Math.ceil(340 / SD); sc.height = Math.ceil(340 / SD); const s0 = sc.getContext('2d');
      for (const [x, y, w, h, r, k] of scraps) {
        s0.setTransform(1, 0, 0, 1, 0, 0); s0.clearRect(0, 0, sc.width, sc.height); s0.setTransform(1 / SD, 0, 0, 1 / SD, sc.width / 2, sc.height / 2);
        const gg = g; { const g = s0;
        g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(-w / 2 + 8, -h / 2 + 10, w, h);
        g.fillStyle = k === 'note' ? '#9a9070' : k === 'photo' ? '#a8a6a0' : k === 'map' ? '#5a6458' : '#8f8a80'; g.fillRect(-w / 2, -h / 2, w, h);
        if (k === 'news') { g.fillStyle = 'rgba(30,30,30,.5)'; g.fillRect(-w / 2 + 14, -h / 2 + 16, w - 28, 22); for (let l = 0; l < 12; l++) g.fillRect(-w / 2 + 14 + (l % 2) * (w / 2 - 10), -h / 2 + 52 + Math.floor(l / 2) * 18, w / 2 - 24, 5); }
        if (k === 'photo') { g.fillStyle = '#2a2a2e'; g.fillRect(-w / 2 + 12, -h / 2 + 12, w - 24, w - 24); }
        if (k === 'map') { g.strokeStyle = 'rgba(30,40,30,.5)'; g.lineWidth = 2; for (let l = 0; l < 8; l++) { g.beginPath(); g.moveTo(-w / 2, -h / 2 + l * h / 8); g.lineTo(w / 2, -h / 2 + l * h / 8 + 10); g.stroke(); g.beginPath(); g.moveTo(-w / 2 + l * w / 8, -h / 2); g.lineTo(-w / 2 + l * w / 8 - 6, h / 2); g.stroke(); } }
        g.fillStyle = '#5a1414'; g.beginPath(); g.arc(0, -h / 2 + 14, 9, 0, 7); g.fill(); }
        gg.save(); gg.translate(x, y); gg.rotate(r); gg.imageSmoothingQuality = 'high'; gg.drawImage(sc, -170, -170, 340, 340); gg.restore();
      }
      const vg = g.createRadialGradient(540, 900, 500, 540, 900, 1500); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = vg; g.fillRect(-200, -200, W + 400, H + 400);
    });
  }
  function ebPhoto(g, img, w, h, red) {
    if (img && img !== 'person') { newsPic(g, img, w, h, 0, false); }
    else {
      const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#55555c'); bg.addColorStop(1, '#232327'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
      spot(g, w * .5, h * .38, w * .6, WHITEA, .15);
      const cx = w / 2; g.fillStyle = '#060607';
      g.beginPath(); g.moveTo(cx - w * .46, h); g.bezierCurveTo(cx - w * .46, h * .74, cx - w * .32, h * .68, cx - w * .13, h * .64); g.lineTo(cx + w * .13, h * .64); g.bezierCurveTo(cx + w * .32, h * .68, cx + w * .46, h * .74, cx + w * .46, h); g.closePath(); g.fill();
      g.fillRect(cx - w * .065, h * .5, w * .13, h * .16); g.beginPath(); g.ellipse(cx, h * .4, w * .14, h * .175, 0, 0, 7); g.fill();
    }
    if (red) { g.fillStyle = 'rgba(255,0,0,.12)'; g.fillRect(0, 0, w, h); }
    const gl = g.createLinearGradient(0, 0, w, h); gl.addColorStop(0, 'rgba(255,255,255,.12)'); gl.addColorStop(.4, 'rgba(255,255,255,0)'); g.fillStyle = gl; g.fillRect(0, 0, w, h);
  }
  function ebCardCanvas(cd) {
    const kind = cd.kind === 'photo' || cd.kind === 'note' ? cd.kind : 'card', s = num(cd.s, 1), [w, h] = ebDims(kind, s);
    const text = cd.text != null ? String(cd.text) : '', red = !!cd.red;
    return layer(`ebc|${kind}|${text}|${red}|${s}|${cd.img || ''}`, w, h, (g) => {
      const R = rng(text.length * 31 + (red ? 7 : 3) + kind.length);
      const speck = (n, a) => { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(90,60,30,${R() * a})`; g.fillRect(R() * w, R() * h, 1 + R() * 2, 1 + R() * 2); } };
      const age = () => { const ag = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .3, w / 2, h / 2, Math.max(w, h) * .75); ag.addColorStop(0, 'rgba(120,85,40,0)'); ag.addColorStop(1, 'rgba(120,85,40,.3)'); g.fillStyle = ag; g.fillRect(0, 0, w, h); };
      const ink = red ? '#a8121a' : '#1c1a1d';
      if (kind === 'card') {
        g.fillStyle = '#ddd6c6'; g.fillRect(0, 0, w, h); age(); speck(160, .25);
        g.fillStyle = 'rgba(195,60,60,.6)'; g.fillRect(0, 50 * s, w, 2 * s);
        g.fillStyle = 'rgba(70,90,140,.22)'; for (let y = 82 * s; y < h - 6; y += 30 * s) g.fillRect(0, y, w, 1.5 * s);
        const L = layoutText(g, text.toUpperCase(), w - 40 * s, h - 72 * s, '400 {S}px Elite', Math.round(36 * s), 1.1);
        const lh = L.fs * 1.1, y0 = 50 * s + (h - 50 * s - L.lines.length * lh) / 2 + L.fs * .78;
        L.lines.forEach((l, i) => txt(g, l, 22 * s, y0 + i * lh, L.font, ink, 'left'));
        if (red) { g.strokeStyle = 'rgba(200,20,28,.8)'; g.lineWidth = 4 * s; g.strokeRect(5 * s, 5 * s, w - 10 * s, h - 10 * s); }
      } else if (kind === 'photo') {
        g.fillStyle = '#e0ded8'; g.fillRect(0, 0, w, h); age(); speck(60, .15);
        const m = 14 * s, pw = w - 2 * m; g.save(); g.beginPath(); g.rect(m, m, pw, pw); g.clip(); g.translate(m, m); ebPhoto(g, cd.img, pw, pw, red); g.restore();
        g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1; g.strokeRect(m, m, pw, pw);
        if (text) { const fs = fitSize(g, text, w - 24 * s, Math.round(30 * s), '400 {S}px Marker'); txt(g, text, w / 2, m + pw + (h - m - pw) / 2 + fs * .36, `400 ${fs}px Marker`, ink, 'center'); }
      } else {
        g.beginPath(); g.moveTo(0, 12 * s); for (let x = 0; x <= w; x += 12 * s) g.lineTo(x, (R() * 12 + 2) * s); g.lineTo(w, h); g.lineTo(0, h); g.closePath();
        g.fillStyle = '#d3c8a4'; g.fill(); g.save(); g.clip(); age(); speck(100, .2);
        g.fillStyle = 'rgba(60,80,120,.16)'; for (let y = 52 * s; y < h; y += 34 * s) g.fillRect(0, y, w, 1.5 * s); g.restore();
        const L = layoutText(g, text, w - 36 * s, h - 54 * s, '400 {S}px Marker', Math.round(40 * s), 1.08);
        const lh = L.fs * 1.08, y0 = 20 * s + (h - 20 * s - L.lines.length * lh) / 2 + L.fs * .8;
        L.lines.forEach((l, i) => txt(g, l, w / 2, y0 + i * lh, L.font, ink, 'center'));
      }
    }, 1.5);
  }
  function shadowSprite(w, h) { // weicher Schatten als Bild (statt shadowBlur pro Frame)
    const q = 4, pad = 40;
    return layer(`ebsh|${Math.round(w)}|${Math.round(h)}`, (w + 2 * pad) / q, (h + 2 * pad) / q, (g) => {
      g.filter = 'blur(4px)'; g.fillStyle = 'rgba(0,0,0,.78)'; g.fillRect(pad / q, pad / q, w / q, h / q); g.filter = 'none';
    });
  }
  function drawShadow(c, w, h, ox, oy, sc, a) { const sp = shadowSprite(w, h), pad = 40; c.save(); c.globalAlpha *= a; c.drawImage(sp, -w / 2 * sc - pad * sc + ox, -h / 2 * sc - pad * sc + oy, (w + 2 * pad) * sc, (h + 2 * pad) * sc); c.restore(); }
  function pin(c, x, y, red, sc = 1) {
    c.save(); c.translate(x, y); c.scale(sc, sc);
    c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.ellipse(5, 7, 12, 9, 0, 0, 7); c.fill();
    const g = c.createRadialGradient(-4, -5, 1, 0, 0, 14); g.addColorStop(0, red ? '#ff8a8a' : '#e88a8a'); g.addColorStop(.35, red ? '#e01b22' : '#9c1d21'); g.addColorStop(1, red ? '#6a0507' : '#3e0a0c');
    if (red) glow(c, 'rgba(255,30,30,.75)', 14);
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, 13, 0, 7); c.fill(); noGlow(c);
    c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.arc(-4, -5, 3.5, 0, 7); c.fill();
    c.restore();
  }
  SCENES.evidence_board = (c, lt, b, gt) => {
    const p0 = b.p || {}, useDef = !Array.isArray(p0.cards);
    const p = useDef ? { ...EB_DEFAULT, ...p0 } : p0;
    const cards = (p.cards || []).map((cd, i) => {
      const kind = cd.kind === 'photo' || cd.kind === 'note' ? cd.kind : 'card', [w, h] = ebDims(kind, num(cd.s, 1));
      const x = lerp(EB.x0, EB.x1, num(cd.x, .5)), y = lerp(EB.y0, EB.y1, num(cd.y, .5)), rot = num(cd.rot, (hash(i * 3.1 + 1) - .5) * .14);
      const at = num(cd.at, .3 + i * .5), py = -h / 2 + 18;
      return { cd, i, kind, w, h, x, y, rot, at, land: at + .22, pin: [x - Math.sin(rot) * py, y + Math.cos(rot) * py] };
    });
    const at0 = num(p.at, 0), title = p.title != null ? String(p.title) : '';
    let shx = 0, shy = 0;
    for (const k of cards) { const u = lt - k.land; if (u > 0 && u < .28) { const a = 5 * (1 - u / .28); shx += Math.sin(u * 70) * a; shy += Math.cos(u * 55) * a * .6; } }
    c.save(); c.translate(shx, shy);
    c.drawImage(corkLayer(), -200, -200);
    // Titel
    if (title && lt >= at0) {
      const k = clamp((lt - at0) / .22), ke = k * k, sc = lerp(1.4, 1, ke) * (lt > at0 + .22 ? 1 - .02 * Math.sin(clamp((lt - at0 - .22) / .16) * Math.PI) : 1);
      const fs = fitSize(c, title, 620, 92, '400 {S}px Marker', 4), tw = textW(c, title, `400 ${fs}px Marker`, 4) + 90;
      c.save(); c.translate(540, EB_TY); c.rotate(-.018); c.scale(sc, sc); c.globalAlpha = clamp(k * 3);
      c.save(); c.translate(0, -3); drawShadow(c, tw, 118, 0, lerp(40, 8, ke), lerp(1.1, 1, ke), .85); c.restore(); c.fillStyle = '#ddd6c4'; c.fillRect(-tw / 2, -62, tw, 118);
      c.fillStyle = 'rgba(120,85,40,.18)'; c.fillRect(-tw / 2, 40, tw, 16);
      c.fillStyle = 'rgba(225,220,200,.55)'; c.save(); c.rotate(.08); c.fillRect(-tw / 2 - 30, -70, 90, 34); c.restore(); c.save(); c.rotate(-.06); c.fillRect(tw / 2 - 60, -74, 90, 34); c.restore();
      txt(c, title, 0, fs * .36, `400 ${fs}px Marker`, '#141416', 'center', 'alphabetic', 4);
      c.restore();
    }
    // Karten
    const vis = cards.filter(k => lt >= k.at).sort((a, b2) => a.at - b2.at);
    for (const k of vis) {
      const u = lt - k.at, q = clamp(u / .22), qe = q * q, cv = ebCardCanvas(k.cd);
      const sc = lerp(1.45, 1, qe) * (u > .22 ? 1 - .025 * Math.sin(clamp((u - .22) / .18) * Math.PI) : 1);
      const sg = (hash(k.i * 7.7) > .5 ? 1 : -1);
      c.save(); c.translate(k.x, k.y); c.rotate(k.rot + (1 - qe) * .2 * sg); c.scale(sc, sc); c.globalAlpha = clamp(u / .07);
      drawShadow(c, k.w, k.h, lerp(20, 4, qe), lerp(48, 9, qe), lerp(1.12, 1, qe), lerp(.55, .9, qe));
      c.drawImage(cv, -k.w / 2, -k.h / 2, k.w, k.h);
      if (k.cd.red) { c.lineWidth = 10; c.strokeStyle = 'rgba(255,30,30,.12)'; c.strokeRect(-k.w / 2 - 3, -k.h / 2 - 3, k.w + 6, k.h + 6); c.lineWidth = 2; c.strokeStyle = 'rgba(255,50,50,.45)'; c.strokeRect(-k.w / 2, -k.h / 2, k.w, k.h); }
      c.restore();
      if (u > .2 && u < .75) { // Staub beim Aufschlag
        const du = (u - .2) / .55;
        for (let j = 0; j < 14; j++) { const side = j % 4, f = hash(k.i * 17 + j), sp = 60 + hash(j * 3 + k.i) * 140;
          const ex = side === 0 ? -k.w / 2 + f * k.w : side === 1 ? k.w / 2 : side === 2 ? -k.w / 2 + f * k.w : -k.w / 2, ey = side === 0 ? -k.h / 2 : side === 1 ? -k.h / 2 + f * k.h : side === 2 ? k.h / 2 : -k.h / 2 + f * k.h;
          const nx = side === 1 ? 1 : side === 3 ? -1 : (f - .5) * .6, ny = side === 0 ? -1 : side === 2 ? 1 : (f - .5) * .6;
          c.fillStyle = `rgba(220,200,170,${.55 * (1 - du)})`; c.beginPath(); c.arc(k.x + ex + nx * sp * du, k.y + ey + ny * sp * du + du * du * 30, 2 + hash(j) * 2.5, 0, 7); c.fill(); }
      }
    }
    // Fäden
    const strings = Array.isArray(p.strings) ? p.strings : [];
    for (const sd of strings) {
      const A = cards[sd.from | 0], B = cards[sd.to | 0]; if (!A || !B || A === B) continue;
      const t0 = Math.max(num(sd.at, Math.max(A.land, B.land) + .2), A.land, B.land); if (lt < t0) continue;
      const k = E.inOut(prog(lt, t0, t0 + .7)), a = A.pin, bb = B.pin, d = Math.hypot(bb[0] - a[0], bb[1] - a[1]);
      const wob = Math.exp(-Math.max(0, lt - t0 - .7) * 4) * Math.sin(gt * 26) * 7 * (lt > t0 + .7 ? 1 : 0);
      const ctl = [(a[0] + bb[0]) / 2, (a[1] + bb[1]) / 2 + d * .08 + 12 + wob];
      const c1 = [lerp(a[0], ctl[0], k), lerp(a[1], ctl[1], k)], e = [lerp(lerp(a[0], ctl[0], k), lerp(ctl[0], bb[0], k), k), lerp(lerp(a[1], ctl[1], k), lerp(ctl[1], bb[1], k), k)];
      c.save(); c.lineCap = 'round';
      c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 5; c.beginPath(); c.moveTo(a[0] + 6, a[1] + 10); c.quadraticCurveTo(c1[0] + 6, c1[1] + 12, e[0] + 6, e[1] + 10); c.stroke();
      c.strokeStyle = 'rgba(255,30,30,.13)'; c.lineWidth = 16; c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo(c1[0], c1[1], e[0], e[1]); c.stroke();
      c.strokeStyle = '#b3141b'; c.lineWidth = 5; c.stroke();
      c.strokeStyle = 'rgba(255,120,110,.45)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(a[0], a[1] - 1.5); c.quadraticCurveTo(c1[0], c1[1] - 1.5, e[0], e[1] - 1.5); c.stroke();
      c.restore();
    }
    for (const k of vis) { const u = lt - k.land; if (u >= 0) pin(c, k.pin[0], k.pin[1], !!k.cd.red, lerp(1.7, 1, E.out(clamp(u / .12)))); }
    // Markerkreis
    const ci = p.circle;
    if (ci && cards[ci.i | 0]) {
      const k0 = cards[ci.i | 0], t0 = Math.max(num(ci.at, k0.land + .4), k0.land);
      if (lt >= t0) {
        const k = E.inOut(prog(lt, t0, t0 + .65)), rx = k0.w * .68 + 26, ry = k0.h * .66 + 26, a0 = -2.3, span = Math.PI * 2 * 1.13 * k;
        c.save(); c.translate(k0.x, k0.y); c.rotate(k0.rot); c.lineCap = 'round'; c.lineJoin = 'round';
        c.beginPath(); const N = Math.max(2, Math.ceil(80 * k));
        for (let j = 0; j <= N; j++) { const th = a0 + span * j / N, gr = 1 + .05 * (th - a0) / (Math.PI * 2) + .03 * Math.sin(th * 3 + 1.3); const px = Math.cos(th) * rx * gr, py = Math.sin(th) * ry * gr; if (j) c.lineTo(px, py); else c.moveTo(px, py); }
        c.strokeStyle = 'rgba(255,30,30,.12)'; c.lineWidth = 34; c.stroke(); c.strokeStyle = 'rgba(255,30,30,.22)'; c.lineWidth = 18; c.stroke(); // Glow ohne Blur
        c.strokeStyle = 'rgba(232,22,30,.95)'; c.lineWidth = 10; c.stroke(); c.restore();
      }
    }
    c.restore();
    // Licht: Taschenlampe oder Deckenlicht
    if (p.torch !== false) {
      let bx = 540, by = title ? EB_TY + 40 : 800;
      const ev = cards.map(k => [k.at, k.x, k.y]); if (ci && cards[ci.i | 0]) ev.push([num(ci.at, 0), cards[ci.i | 0].x, cards[ci.i | 0].y]);
      ev.sort((a, b2) => a[0] - b2[0]);
      for (const [t, x, y] of ev) { const k = E.inOut(prog(lt, t - .25, t + .75)); bx = lerp(bx, x, k); by = lerp(by, y, k); }
      bx += noise(gt * .42, 61) * 80; by += noise(gt * .36, 62) * 60;
      const R = 560 * (.97 + .03 * noise(gt * 7, 63)), d = .86;
      const g = c.createRadialGradient(bx, by, R * .08, bx, by, R);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.5, `rgba(0,0,0,${d * .4})`); g.addColorStop(1, `rgba(0,0,0,${d})`);
      c.fillStyle = g; c.fillRect(-200, -200, W + 400, H + 400);
      c.save(); c.globalCompositeOperation = 'screen'; spot(c, bx, by, R * .65, 'rgba(255,232,195,A)', .13); c.restore();
    } else {
      const g = c.createRadialGradient(540, 300, 200, 540, 900, 1300); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.6)'); c.fillStyle = g; c.fillRect(-200, -200, W + 400, H + 400);
      c.save(); c.globalCompositeOperation = 'screen'; spot(c, 540, 250, 900, 'rgba(255,225,185,A)', .1 * (.95 + .05 * noise(gt * 2, 64))); c.restore();
    }
    // Schwebeteilchen im Licht
    c.save(); for (let j = 0; j < 26; j++) { const x = (hash(j * 3.3) * 1300 + gt * (8 + hash(j) * 14)) % 1300 - 110, y = (hash(j * 5.1) * 2100 - gt * (5 + hash(j + 9) * 10) + 2100 * 4) % 2100 - 90;
      c.fillStyle = `rgba(255,235,210,${.05 + .06 * hash(j * 2.2)})`; c.beginPath(); c.arc(x, y, 1.5 + hash(j * 1.7) * 2, 0, 7); c.fill(); } c.restore();
  };

  // ================= 4) city_map =================
  const MAP = { x0: 140, x1: 940, y0: 612, y1: 1350 };
  const mx = x => lerp(MAP.x0, MAP.x1, x), my = y => lerp(MAP.y0, MAP.y1, y);
  const MAP_DEFAULT_PINS = [{ x: .3, y: .3, at: .5, label: '1974', red: true }, { x: .66, y: .48, at: 1.1, label: '1977', red: true }, { x: .42, y: .74, at: 1.7, label: '1985', red: true }];
  const RIVER = [[230, -260], [290, 140], [350, 420], [470, 640], [430, 860], [380, 1040], [490, 1220], [640, 1380], [610, 1620], [700, 1900], [770, 2200]];
  const TRIB = [[-260, 300], [20, 430], [200, 560], [350, 610], [470, 640]];
  function mapLayer(river, grid) {
    return layer(`map|${river}|${grid}`, W + 400, H + 400, (g) => {
      const R = rng(1974); g.translate(200, 200);
      g.fillStyle = '#0a0c10'; g.fillRect(-200, -200, W + 400, H + 400);
      const step = 38, ox = -200 + 14, oy = -200 + 6;
      if (grid) {
        for (let x = ox; x < W + 200; x += step) for (let y = oy; y < H + 200; y += step) if (R() < .55) { g.fillStyle = `rgba(150,165,185,${.012 + R() * .03})`; g.fillRect(x + 4, y + 4, step - 8, step - 8); }
        g.strokeStyle = '#1a1f26'; g.lineWidth = 2;
        for (let x = ox; x < W + 200; x += step) for (let y = oy; y < H + 200; y += step) { if (R() > .07) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + step); g.stroke(); } if (R() > .07) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + step, y); g.stroke(); } }
        g.save(); g.beginPath(); g.rect(782, 1206, 520, 820); g.clip(); g.fillStyle = '#0a0c10'; g.fillRect(782, 1206, 520, 820); // Vorort: geschwungene Straßen, Sackgassen
        g.strokeStyle = '#1a1f26'; g.lineWidth = 2;
        for (let i = 0; i < 11; i++) { const y = 1226 + i * 62; g.beginPath(); g.moveTo(782, y); for (let x = 782; x <= 1300; x += 26) g.lineTo(x, y + Math.sin(x * .018 + i * 1.7) * 16); g.stroke(); }
        for (let i = 0; i < 6; i++) { const x = 820 + i * 78; g.beginPath(); g.moveTo(x, 1206); g.bezierCurveTo(x + 40, 1400, x - 40, 1620, x + 26, 2030); g.stroke(); }
        for (let i = 0; i < 16; i++) { const x = 800 + R() * 460, y = 1240 + R() * 700, a = R() * 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 26, y + Math.sin(a) * 26); g.stroke(); g.beginPath(); g.arc(x + Math.cos(a) * 32, y + Math.sin(a) * 32, 6, 0, 7); g.stroke(); }
        g.restore();
        for (let i = 0; i < 46; i++) { const bx = 440 + Math.floor(R() * 6) * step + 6, by = 780 + Math.floor(R() * 6) * step + 6; g.fillStyle = `rgba(140,155,175,${.05 + R() * .07})`; g.fillRect(bx + R() * 6, by + R() * 6, 10 + R() * 14, 10 + R() * 14); } // Innenstadt
      }
      for (const [x, y, w, h] of [[ox + step * 9, oy + step * 21, step * 3, step * 2], [ox + step * 22, oy + step * 33, step * 2, step * 3], [ox + step * 5, oy + step * 42, step * 4, step * 2], [ox + step * 26, oy + step * 14, step * 2, step * 2]]) {
        g.fillStyle = '#0f1714'; g.fillRect(x + 2, y + 2, w - 4, h - 4); for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(70,100,80,.25)'; g.beginPath(); g.arc(x + 8 + R() * (w - 16), y + 8 + R() * (h - 16), 3 + R() * 3, 0, 7); g.fill(); } }
      g.strokeStyle = '#272d36'; g.lineWidth = 5;
      for (let x = ox + step * 2; x < W + 200; x += step * 5) { g.beginPath(); g.moveTo(x, -200); g.lineTo(x, H + 200); g.stroke(); }
      for (let y = oy + step * 3; y < H + 200; y += step * 5) { g.beginPath(); g.moveTo(-200, y); g.lineTo(W + 200, y); g.stroke(); }
      g.strokeStyle = '#1e2229'; g.lineWidth = 3; g.setLineDash([10, 8]); g.beginPath(); g.moveTo(-200, 1500); g.lineTo(W + 200, 300); g.stroke(); g.setLineDash([]); // Bahnlinie
      if (river) {
        for (const [pts, wid] of [[RIVER, 40], [TRIB, 20]]) {
          g.lineCap = 'round'; g.lineJoin = 'round';
          g.strokeStyle = '#0c141b'; g.lineWidth = wid + 14; g.beginPath(); catmull(g, pts); g.stroke();
          g.strokeStyle = '#15283a'; g.lineWidth = wid; g.beginPath(); catmull(g, pts); g.stroke();
          g.strokeStyle = 'rgba(70,110,140,.35)'; g.lineWidth = wid * .18; g.beginPath(); catmull(g, pts); g.stroke();
        }
      }
      const hw = (pts, wid) => { g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#090a0d'; g.lineWidth = wid + 6; g.beginPath(); catmull(g, pts); g.stroke(); g.strokeStyle = '#3a414c'; g.lineWidth = wid; g.beginPath(); catmull(g, pts); g.stroke();
        g.strokeStyle = 'rgba(120,130,145,.5)'; g.lineWidth = 1.5; g.setLineDash([14, 12]); g.beginPath(); catmull(g, pts); g.stroke(); g.setLineDash([]); };
      hw([[720, -260], [705, 300], [670, 880], [700, 1400], [735, 2200]], 9);
      hw([[-260, 1000], [300, 990], [700, 1004], [1340, 992]], 9);
      hw([[705, 160], [420, 110], [150, 330], [70, 760], [150, 1180], [420, 1390], [700, 1400]], 7);
      const lab = (s, x, y, r) => { g.save(); g.translate(x, y); g.rotate(r); txt(g, s, 0, 0, '700 15px SMono', 'rgba(120,130,145,.55)', 'center', 'middle', 3); g.restore(); };
      lab('CENTRAL AVE', 300, oy + step * 13 - 10, 0); lab('13TH ST', 860, oy + step * 8 - 10, 0); lab('MAIN ST', ox + step * 12 + 12, 760, Math.PI / 2); lab('OAK ST', ox + step * 22 + 12, 1260, Math.PI / 2);
      lab('PINE AVE', 880, oy + step * 33 - 10, 0); lab('HWY 54', 140, 980, 0);
      g.strokeStyle = 'rgba(140,150,165,.22)'; g.lineWidth = 1;
      for (let i = 0; i <= 8; i++) { const x = MAP.x0 + i * 100; g.beginPath(); g.moveTo(x, MAP.y0 - 18); g.lineTo(x, MAP.y0 - 6); g.stroke(); if (i < 8) txt(g, 'ABCDEFGH'[i], x + 50, MAP.y0 - 8, '700 13px SMono', 'rgba(140,150,165,.4)', 'center'); }
      // Kompass + Maßstab
      g.save(); g.translate(906, 1408); g.strokeStyle = 'rgba(200,205,215,.45)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 26, 0, 7); g.stroke();
      g.fillStyle = 'rgba(220,225,232,.6)'; g.beginPath(); g.moveTo(0, -24); g.lineTo(7, 0); g.lineTo(-7, 0); g.closePath(); g.fill(); g.fillStyle = 'rgba(220,40,40,.6)'; g.beginPath(); g.moveTo(0, 24); g.lineTo(7, 0); g.lineTo(-7, 0); g.closePath(); g.fill();
      txt(g, 'N', 0, -34, '700 16px SMono', 'rgba(220,225,232,.7)', 'center'); g.restore();
      g.fillStyle = 'rgba(200,205,215,.5)'; g.fillRect(150, 1414, 190, 3); g.fillRect(150, 1406, 3, 12); g.fillRect(245, 1408, 2, 9); g.fillRect(337, 1406, 3, 12);
      txt(g, '0', 151, 1398, '700 14px SMono', 'rgba(200,205,215,.6)', 'center'); txt(g, '1 MI', 338, 1398, '700 14px SMono', 'rgba(200,205,215,.6)', 'center');
    });
  }
  function mapPin(c, x, y, red, hgt, sq) {
    c.save(); c.translate(x, y - hgt);
    c.scale(1 + sq * .25, 1 - sq * .25);
    const col = red ? '#ff2b2b' : '#d9d9df';
    if (red) glow(c, 'rgba(255,30,30,.9)', 26); else glow(c, 'rgba(220,220,235,.5)', 14);
    c.fillStyle = col; c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-10, -20, -22, -30, -22, -46); c.arc(0, -46, 22, Math.PI, 0); c.bezierCurveTo(22, -30, 10, -20, 0, 0); c.closePath(); c.fill(); noGlow(c);
    c.fillStyle = red ? '#5a0608' : '#3a3a42'; c.beginPath(); c.arc(0, -46, 8.5, 0, 7); c.fill();
    c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.arc(-8, -54, 5, 0, 7); c.fill();
    c.restore();
  }
  SCENES.city_map = (c, lt, b, gt) => {
    const p = b.p || {};
    const river = p.river !== false, grid = p.grid !== false;
    c.fillStyle = '#0a0c10'; c.fillRect(-200, -200, W + 400, H + 400);
    const dx = noise(gt * .08, 71) * 10, dy = noise(gt * .07, 72) * 10;
    c.save(); c.translate(dx, dy); c.drawImage(mapLayer(river, grid), -200, -200); c.restore();
    // Abtastlicht
    const sy = ((gt * 140) % 2600) - 400, sg = c.createLinearGradient(0, sy - 160, 0, sy + 160); sg.addColorStop(0, 'rgba(120,150,190,0)'); sg.addColorStop(.5, 'rgba(120,150,190,.05)'); sg.addColorStop(1, 'rgba(120,150,190,0)');
    c.fillStyle = sg; c.fillRect(-200, sy - 160, W + 400, 320);
    const pins = (Array.isArray(p.pins) ? p.pins : MAP_DEFAULT_PINS).map((q, i) => ({ q, i, x: mx(num(q.x, .5)) + dx, y: my(num(q.y, .5)) + dy, at: num(q.at, .4 + i * .5), red: q.red !== false, label: q.label != null ? String(q.label) : '' }));
    // Ring
    const ring = p.ring;
    if (ring) {
      const cx = mx(num(ring.x, .5)) + dx, cy = my(num(ring.y, .5)) + dy, t0 = num(ring.t0, 0), t1 = num(ring.t1, t0 + 3);
      const rp = v => v <= 2 ? v * (MAP.x1 - MAP.x0) : v;
      const r0 = rp(num(ring.r0, .55)), r1 = rp(num(ring.r1, .14));
      if (lt >= t0 - .3) {
        const ka = E.out(prog(lt, t0 - .3, t0 + .3)), kr = E.inOut(prog(lt, t0, t1)), r = lerp(r0, r1, kr) * (1 + .008 * Math.sin(gt * 5));
        c.save(); c.fillStyle = `rgba(0,0,0,${.5 * ka * (.4 + .6 * kr)})`; c.beginPath(); c.rect(-200, -200, W + 400, H + 400); c.arc(cx, cy, r, 0, Math.PI * 2, true); c.fill('evenodd');
        c.globalAlpha = ka; c.strokeStyle = '#ff2b2b'; c.lineWidth = 6; glow(c, 'rgba(255,30,30,1)', 30); c.beginPath(); c.arc(cx, cy, r, 0, 7); c.stroke();
        c.lineWidth = 2; c.setLineDash([14, 12]); c.lineDashOffset = -gt * 30; c.strokeStyle = 'rgba(255,60,60,.6)'; c.beginPath(); c.arc(cx, cy, r + 20, 0, 7); c.stroke(); c.setLineDash([]); noGlow(c);
        c.strokeStyle = 'rgba(255,70,70,.85)'; c.lineWidth = 3; for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; c.beginPath(); c.moveTo(cx + Math.cos(a) * (r - 18), cy + Math.sin(a) * (r - 18)); c.lineTo(cx + Math.cos(a) * (r + 30), cy + Math.sin(a) * (r + 30)); c.stroke(); }
        if (ring.label) { const ly = Math.max(cy - r - 44, MAP.y0 + 40); c.font = '700 26px SMono'; const s = String(ring.label).toUpperCase(), tw = textW(c, s, '700 26px SMono', 3) + 28; rr(c, cx - tw / 2, ly - 30, tw, 42, 8); c.fillStyle = 'rgba(150,10,14,.9)'; c.fill(); txt(c, s, cx, ly, '700 26px SMono', '#fff', 'center', 'alphabetic', 3); }
        c.restore();
      }
    }
    // Linien
    for (const ln of (Array.isArray(p.lines) ? p.lines : [])) {
      const A = pins[ln.from | 0], B = pins[ln.to | 0]; if (!A || !B || A === B) continue;
      const t0 = Math.max(num(ln.at, 0), A.at + .5, B.at + .5); if (lt < t0) continue;
      const k = E.inOut(prog(lt, t0, t0 + .6)), ax = A.x, ay = A.y - 46, bx = lerp(ax, B.x, k), by = lerp(ay, B.y - 46, k);
      c.save(); c.strokeStyle = 'rgba(255,50,50,.9)'; c.lineWidth = 4; c.setLineDash([16, 11]); c.lineDashOffset = -gt * 40; glow(c, 'rgba(255,30,30,.9)', 16);
      c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); c.restore();
    }
    // Pins
    for (const q of pins) {
      if (lt < q.at) continue;
      const u = (lt - q.at) / .62; let hgt, sq = 0;
      if (u < .5) hgt = 1 - Math.pow(u / .5, 2); else if (u < .78) hgt = .16 * Math.sin((u - .5) / .28 * Math.PI); else if (u < 1) hgt = .045 * Math.sin((u - .78) / .22 * Math.PI); else hgt = 0;
      if (u >= .5 && u < .6) sq = Math.sin((u - .5) / .1 * Math.PI) * .6;
      const H0 = 190, land = q.at + .31;
      c.save(); c.fillStyle = `rgba(0,0,0,${.55 * (1 - hgt * .6)})`; c.beginPath(); c.ellipse(q.x, q.y, 16 * (1 - hgt * .5), 6 * (1 - hgt * .5), 0, 0, 7); c.fill(); c.restore();
      if (lt > land) { const pu = (lt - land) / .9; if (pu < 1) { c.save(); c.strokeStyle = q.red ? `rgba(255,40,40,${1 - pu})` : `rgba(220,220,235,${.8 * (1 - pu)})`; c.lineWidth = 5 * (1 - pu) + 1; glow(c, 'rgba(255,30,30,.8)', 18); c.beginPath(); c.ellipse(q.x, q.y, 14 + pu * 110, (14 + pu * 110) * .55, 0, 0, 7); c.stroke(); c.restore(); }
        if (q.red) { const ph = ((lt - land) / 1.8) % 1; c.save(); c.strokeStyle = `rgba(255,40,40,${.35 * (1 - ph)})`; c.lineWidth = 2; c.beginPath(); c.ellipse(q.x, q.y, 14 + ph * 70, (14 + ph * 70) * .55, 0, 0, 7); c.stroke(); c.restore(); } }
      c.save(); c.globalAlpha = clamp(u * 4); mapPin(c, q.x, q.y, q.red, hgt * H0, sq); c.restore();
      if (q.label && lt > q.at + .4) {
        const k = clamp((lt - q.at - .4) / .35), s = q.label.toUpperCase(), n = Math.ceil(s.length * k), f = '700 27px SMono', tw = textW(c, s, f, 2) + 26;
        const left = q.x + 34 + tw > 960, lx = left ? q.x - 34 - tw : q.x + 34, ly = q.y - 72;
        c.save(); c.globalAlpha = clamp(k * 2);
        c.strokeStyle = q.red ? 'rgba(255,60,60,.7)' : 'rgba(210,210,220,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(q.x + (left ? -14 : 14), q.y - 52); c.lineTo(left ? lx + tw : lx, ly + 18); c.stroke();
        rr(c, lx, ly - 4, tw, 44, 6); c.fillStyle = 'rgba(8,9,12,.88)'; c.fill(); c.strokeStyle = q.red ? 'rgba(255,50,50,.8)' : 'rgba(200,200,210,.5)'; c.stroke();
        txt(c, s.slice(0, n), lx + 13, ly + 28, f, q.red ? '#ff6a6a' : '#e4e4ea', 'left', 'alphabetic', 2);
        c.restore();
      }
    }
    // Titel
    const title = p.title != null ? String(p.title) : 'WICHITA';
    const tb = c.createLinearGradient(0, -200, 0, 630); tb.addColorStop(0, 'rgba(6,7,10,.95)'); tb.addColorStop(.74, 'rgba(6,7,10,.78)'); tb.addColorStop(1, 'rgba(6,7,10,0)'); c.fillStyle = tb; c.fillRect(-200, -200, W + 400, 830);
    if (title) {
      const T = title.toUpperCase(), k = E.out(prog(lt, 0, .6)), fs = fitSize(c, T, 760, 124, '400 {S}px Bebas', 16);
      c.save(); c.globalAlpha = k; glow(c, 'rgba(255,255,255,.25)', 18);
      txt(c, T, 540, 476, `400 ${fs}px Bebas`, '#eeeef2', 'center', 'alphabetic', 16); noGlow(c);
      const tw = textW(c, T, `400 ${fs}px Bebas`, 16) * k;
      c.fillStyle = '#ff2b2b'; glow(c, 'rgba(255,30,30,1)', 16); c.fillRect(540 - tw / 2, 492, tw, 5); noGlow(c);
      const sub = p.sub != null ? String(p.sub) : (T === 'WICHITA' ? 'KANSAS' : '');
      if (sub) txt(c, sub.toUpperCase(), 540, 534, '700 26px SMono', '#ff6a6a', 'center', 'alphabetic', 10);
      const co = p.coords != null ? String(p.coords) : (T === 'WICHITA' ? '37.69° N · 97.34° W' : '');
      if (co) txt(c, co, 540, 566, '700 18px SMono', 'rgba(200,205,215,.5)', 'center', 'alphabetic', 3);
      c.restore();
    }
  };
})();
