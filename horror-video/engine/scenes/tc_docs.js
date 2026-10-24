'use strict';
// Dokument-Szenen für True-Crime-Shorts: title_card, letter, newspaper, years_flip, memorial, id_badge.
// Alles in einer IIFE, nach außen wird nur in SCENES geschrieben.
(() => {
  const EMPTY = {};
  const num = (v, d) => (typeof v === 'number' && isFinite(v)) ? v : d;
  const rnd = (i, s = 0) => hash(i * 1.371 + s * 91.73 + 0.5);

  // ---------- Cache für statische Ebenen ----------
  const CACHE = new Map();
  function cached(key, w, h, fn) {
    let cv = CACHE.get(key);
    if (!cv) {
      cv = document.createElement('canvas'); cv.width = Math.ceil(w); cv.height = Math.ceil(h);
      fn(cv.getContext('2d'), cv.width, cv.height); CACHE.set(key, cv);
      if (CACHE.size > 120) CACHE.delete(CACHE.keys().next().value);
    }
    return cv;
  }

  // ---------- Text ----------
  function tw(c, s, font, ls = 0) { c.font = font; c.letterSpacing = ls + 'px'; const w = c.measureText(s).width; c.letterSpacing = '0px'; return w; }
  function fitSize(c, s, maxW, size, fontFn, ls = 0, min = 12) {
    const w = tw(c, s, fontFn(size), ls); if (w <= maxW) return size;
    const sp = ls * s.length; let f = Math.max(min, Math.floor(size * Math.max(1, maxW - sp) / Math.max(1, w - sp)));
    while (f > min && tw(c, s, fontFn(f), ls) > maxW) f--;
    return f;
  }
  const norm = w => String(w).toUpperCase().replace(/[^A-Z0-9ÄÖÜß]/g, '');
  function isHl(word, list) { const n = norm(word); if (!n || !list || !list.length) return false; return list.some(h => { const q = norm(h); return q && (n === q || (q.length >= 3 && n.startsWith(q))); }); }
  // Zeichen-Positionen einer Zeile (für Schreibmaschine / Schwärzung), gecacht
  const XS = new Map();
  function charXs(c, s, font, ls = 0) {
    const key = font + '|' + ls + '|' + s; let a = XS.get(key);
    if (!a) {
      c.font = font; c.letterSpacing = ls + 'px'; a = [0];
      for (let i = 1; i <= s.length; i++) a.push(c.measureText(s.slice(0, i)).width);
      c.letterSpacing = '0px'; XS.set(key, a); if (XS.size > 4000) XS.clear();
    }
    return a;
  }
  // Markierung pro Zeichen: gehört das Zeichen zu einem hervorgehobenen Wort?
  function hlMask(s, list) {
    const m = new Array(s.length).fill(false); if (!list || !list.length) return m;
    const re = /\S+/g; let r;
    while ((r = re.exec(s))) if (isHl(r[0], list)) { for (let i = r.index; i < r.index + r[0].length; i++) m[i] = /[A-Za-z0-9ÄÖÜäöüß]/.test(s[i]); }
    return m;
  }
  // Schreibmaschinen-Zeile: n Zeichen ab x (links), jedes Zeichen leicht versetzt, frischer Anschlag hell
  function typeRow(c, s, x, y, font, col, n, o = {}) {
    const xs = charXs(c, s, font, o.ls || 0), mask = o.mask, seed = o.seed || 0;
    c.font = font; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.letterSpacing = '0px';
    const nn = Math.min(n, s.length);
    for (let i = 0; i < nn; i++) {
      const ch = s[i]; if (ch === ' ') continue;
      const red = mask && mask[i];
      const age = o.ages ? o.ages(i) : 9;
      const jy = (rnd(i, seed) - .5) * (o.jit != null ? o.jit : 2.2), jx = (rnd(i, seed + 3) - .5) * (o.jit != null ? o.jit * .6 : 1.2);
      const ink = o.inkVar === false ? 1 : .78 + .22 * rnd(i, seed + 7);
      c.globalAlpha = (o.alpha != null ? o.alpha : 1) * ink * (o.alphaOf ? o.alphaOf(i) : 1);
      let cc = red ? (o.redCol || '#ff2b2b') : col;
      if (red && o.redGlow) glow(c, o.redGlow, o.redBlur || 18); else noGlow(c);
      if (age < .09 && o.strike) { const k = 1 - age / .09; c.save(); c.translate(x + xs[i] + jx, y + jy); c.scale(1 + .18 * k, 1 + .18 * k); c.fillStyle = o.strike; c.fillText(ch, 0, 0); c.restore(); continue; }
      c.fillStyle = cc; c.fillText(ch, x + xs[i] + jx, y + jy);
    }
    noGlow(c); c.globalAlpha = 1;
    return xs[nn];
  }

  // ---------- Atmosphäre ----------
  function motes(c, gt, n, seed, x0, y0, w, h, col, a, sz = 3, rise = 14) {
    c.save(); const A = c.globalAlpha; c.fillStyle = col;
    for (let i = 0; i < n; i++) {
      const sp = .3 + rnd(i, seed) * .7;
      let x = rnd(i, seed + 1) * w + noise(gt * .13 * sp + i, seed + 2) * 70 + gt * 5 * sp; x = ((x % w) + w) % w;
      let y = rnd(i, seed + 3) * h - gt * rise * sp + noise(gt * .17 + i * 3, seed + 4) * 40; y = ((y % h) + h) % h;
      const edge = clamp(Math.min(x, w - x, y, h - y) / 80);
      c.globalAlpha = A * a * edge * (.35 + .65 * (.5 + .5 * Math.sin(gt * (.8 + rnd(i, seed + 5) * 2) + i * 2.3)));
      c.beginPath(); c.arc(x0 + x, y0 + y, sz * (.35 + rnd(i, seed + 7)), 0, 7); c.fill();
    }
    c.restore();
  }
  function snow(c, gt, seed, layers = 3) {
    c.save(); c.fillStyle = '#d8dde8';
    for (let L = 0; L < layers; L++) {
      const n = [90, 55, 22][L], sz = [1.6, 3, 5.5][L], fall = [55, 110, 210][L], al = [.35, .55, .75][L];
      for (let i = 0; i < n; i++) {
        const k = i + L * 300, sp = .7 + rnd(k, seed) * .6;
        let y = rnd(k, seed + 1) * 2400 + gt * fall * sp; y = (y % 2400) - 240;
        let x = rnd(k, seed + 2) * 1500 - 210 + Math.sin(gt * (.6 + rnd(k, seed + 3)) + k) * 26 * (L + 1) + gt * 12 * (L + 1); x = ((x + 210) % 1500 + 1500) % 1500 - 210;
        c.globalAlpha = al * (.5 + .5 * rnd(k, seed + 4));
        c.beginPath(); c.arc(x, y, sz * (.6 + .6 * rnd(k, seed + 5)), 0, 7); c.fill();
      }
    }
    c.restore();
  }
  // Abdunklung um eine Lichtquelle (Lampe)
  function lampShade(c, x, y, r0, r1, a) {
    const g = c.createRadialGradient(x, y, r0, x, y, r1); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`);
    c.fillStyle = g; c.fillRect(-300, -300, W + 600, H + 600);
  }

  // ---------- Texturen ----------
  function paperTexture(cx, w, h, base, seed, o = {}) {
    cx.fillStyle = base; cx.fillRect(0, 0, w, h);
    // Fasern + Flecken
    for (let i = 0; i < w * h / 900; i++) {
      const x = rnd(i, seed) * w, y = rnd(i, seed + 1) * h, l = 4 + rnd(i, seed + 2) * 18, a = rnd(i, seed + 3) * Math.PI;
      cx.strokeStyle = rnd(i, seed + 4) > .5 ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.06)'; cx.lineWidth = 1;
      cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); cx.stroke();
    }
    const stains = o.stains || 0;
    for (let i = 0; i < stains; i++) {
      const x = rnd(i, seed + 9) * w, y = rnd(i, seed + 10) * h, r = 30 + rnd(i, seed + 11) * 160;
      const g = cx.createRadialGradient(x, y, r * .2, x, y, r); g.addColorStop(0, `rgba(90,60,20,${.05 + rnd(i, seed + 12) * .08})`); g.addColorStop(.85, 'rgba(90,60,20,.03)'); g.addColorStop(1, 'rgba(90,60,20,0)');
      cx.fillStyle = g; cx.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    // Rand-Vergilbung
    const e = o.edge != null ? o.edge : .18;
    const g = cx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .35, w / 2, h / 2, Math.max(w, h) * .75);
    g.addColorStop(0, 'rgba(70,50,20,0)'); g.addColorStop(1, `rgba(70,50,20,${e})`); cx.fillStyle = g; cx.fillRect(0, 0, w, h);
  }
  // dunkle Tischplatte (Holz)
  function deskLayer() {
    return cached('desk', W + 400, H + 400, (cx, w, h) => {
      const g = cx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#121318'); g.addColorStop(1, '#08090b'); cx.fillStyle = g; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) {
        const y0 = rnd(i, 3) * h, amp = 6 + rnd(i, 4) * 26, fr = .002 + rnd(i, 5) * .004;
        cx.strokeStyle = rnd(i, 6) > .5 ? `rgba(255,255,255,${.012 + rnd(i, 7) * .02})` : `rgba(0,0,0,${.15 + rnd(i, 8) * .2})`;
        cx.lineWidth = 1 + rnd(i, 9) * 3; cx.beginPath();
        for (let x = 0; x <= w; x += 40) { const y = y0 + Math.sin(x * fr + i) * amp + (x * .06); x ? cx.lineTo(x, y) : cx.moveTo(x, y); }
        cx.stroke();
      }
    });
  }
  // dunkler Stoff (Webmuster)
  function fabricLayer() {
    return cached('fabric', W + 400, H + 400, (cx, w, h) => {
      cx.fillStyle = '#0d1017'; cx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 4) { cx.fillStyle = (y / 4) % 2 ? 'rgba(255,255,255,.018)' : 'rgba(0,0,0,.18)'; cx.fillRect(0, y, w, 2); }
      for (let x = 0; x < w; x += 4) { cx.fillStyle = (x / 4) % 2 ? 'rgba(255,255,255,.014)' : 'rgba(0,0,0,.12)'; cx.fillRect(x, 0, 2, h); }
      for (let i = 0; i < 90; i++) { const x = rnd(i, 21) * w, y = rnd(i, 22) * h, r = 80 + rnd(i, 23) * 300; const g = cx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${rnd(i, 24) > .5 ? '255,255,255' : '0,0,0'},${.02 + rnd(i, 25) * .04})`); g.addColorStop(1, 'rgba(0,0,0,0)'); cx.fillStyle = g; cx.fillRect(x - r, y - r, 2 * r, 2 * r); }
    });
  }

  // ---------- Stempel ----------
  function grunge(key, w, h) { // Maske mit Löchern für Stempelfarbe
    return cached('grunge|' + key + '|' + w + 'x' + h, w, h, (cx) => {
      for (let i = 0; i < w * h / 260; i++) { const x = rnd(i, 51) * w, y = rnd(i, 52) * h, r = .6 + rnd(i, 53) * (rnd(i, 54) > .93 ? 6 : 2.2);
        cx.fillStyle = `rgba(0,0,0,${.5 + rnd(i, 55) * .5})`; cx.beginPath(); cx.arc(x, y, r, 0, 7); cx.fill(); }
      for (let i = 0; i < 14; i++) { const y = rnd(i, 56) * h; cx.fillStyle = 'rgba(0,0,0,.35)'; cx.fillRect(0, y, w, 1 + rnd(i, 57) * 2); }
    });
  }
  function stampImage(text, col, maxW) {
    const key = 'stamp|' + text + '|' + col + '|' + maxW;
    const rows = String(text).split('|').map(s => s.trim()).filter(Boolean);
    const m = document.createElement('canvas').getContext('2d');
    let fs = 56; const font = s => `700 ${s}px SMono`;
    const widest = () => Math.max(...rows.map(r => tw(m, r, font(fs), 4)));
    while (fs > 18 && widest() > maxW - 70) fs -= 2;
    const iw = Math.ceil(widest() + 70), ih = Math.ceil(rows.length * fs * 1.15 + 54);
    return cached(key, iw, ih, (cx, w, h) => {
      cx.strokeStyle = col; cx.lineWidth = 7; rr(cx, 6, 6, w - 12, h - 12, 10); cx.stroke();
      cx.lineWidth = 2.5; rr(cx, 16, 16, w - 32, h - 32, 6); cx.stroke();
      rows.forEach((r, i) => txt(cx, r, w / 2, 27 + fs * .95 + i * fs * 1.15, font(fs), col, 'center', 'alphabetic', 4));
      cx.globalCompositeOperation = 'destination-out'; cx.drawImage(grunge('s', w, h), 0, 0);
    });
  }
  // Stempel knallt auf: Skalierung 1.7 → 1, dann bleibt er. Liefert Stoßstärke (für Wackeln)
  function rubberStamp(c, s, x, y, rot, lt, col, maxW) {
    if (!s || lt < s.at) return 0;
    const img = stampImage(s.text || 'RECEIVED', col, maxW);
    const k = prog(lt, s.at, s.at + .13), e = E.in(k);
    c.save(); c.translate(x, y); c.rotate(rot + (1 - e) * .08);
    const sc = lerp(1.7, 1, e); c.scale(sc, sc);
    c.globalAlpha *= clamp(k * 2.2) * (s.alpha != null ? s.alpha : .88);
    if (k < 1) { glow(c, 'rgba(0,0,0,.6)', 30); }
    c.drawImage(img, -img.width / 2, -img.height / 2); noGlow(c);
    c.restore();
    return lt > s.at + .13 ? Math.exp(-(lt - s.at - .13) * 9) : 0;
  }
  const stampShake = (s, lt) => (!s || lt < s.at + .13) ? 0 : Math.exp(-(lt - s.at - .13) * 9);

  // ---------- 1) title_card ----------
  function titleBg(c, bg, lt, gt, cy) {
    if (bg === 'map') {
      bgFill(c, '#0a0d12', '#040506');
      const m = cached('mapbg', 1700, 2600, (cx, w, h) => {
        cx.fillStyle = 'rgba(0,0,0,0)'; cx.clearRect(0, 0, w, h);
        cx.save(); cx.translate(w / 2, h / 2); cx.rotate(-.12); cx.translate(-w / 2, -h / 2);
        for (let i = 0; i < 70; i++) { const x = i * 46 + (rnd(i, 1) - .5) * 14; cx.strokeStyle = i % 8 === 0 ? 'rgba(150,170,200,.28)' : 'rgba(120,140,170,.11)'; cx.lineWidth = i % 8 === 0 ? 5 : 2; cx.beginPath(); cx.moveTo(x, -200); cx.lineTo(x, h + 200); cx.stroke(); }
        for (let i = 0; i < 90; i++) { const y = i * 44 + (rnd(i, 2) - .5) * 12; cx.strokeStyle = i % 9 === 0 ? 'rgba(150,170,200,.28)' : 'rgba(120,140,170,.11)'; cx.lineWidth = i % 9 === 0 ? 5 : 2; cx.beginPath(); cx.moveTo(-200, y); cx.lineTo(w + 200, y); cx.stroke(); }
        cx.restore();
        // Fluss
        cx.strokeStyle = 'rgba(90,120,160,.22)'; cx.lineWidth = 26; cx.lineCap = 'round'; cx.beginPath();
        for (let y = -50; y <= h + 50; y += 30) { const x = w * .3 + Math.sin(y * .004) * 260 + Math.sin(y * .011) * 60; y < -40 ? cx.moveTo(x, y) : cx.lineTo(x, y); } cx.stroke();
        // Highway diagonal
        cx.strokeStyle = 'rgba(170,180,200,.18)'; cx.lineWidth = 10; cx.beginPath(); cx.moveTo(-100, h * .8); cx.bezierCurveTo(w * .3, h * .6, w * .6, h * .45, w + 100, h * .15); cx.stroke();
        // Höhenlinien
        cx.lineWidth = 1.5; for (let k = 0; k < 9; k++) { cx.strokeStyle = 'rgba(120,140,170,.08)'; cx.beginPath(); for (let a = 0; a <= 64; a++) { const an = a / 64 * Math.PI * 2, r = 120 + k * 70 + Math.sin(an * 3 + k) * 30; const x = w * .72 + Math.cos(an) * r * 1.2, y = h * .7 + Math.sin(an) * r; a ? cx.lineTo(x, y) : cx.moveTo(x, y); } cx.stroke(); }
        const names = ['N BROADWAY', 'E 13TH ST N', 'HYDRAULIC AVE', 'MURDOCK ST', 'OLIVER ST', 'S EDGEMOOR', 'E CENTRAL AVE', 'KELLOGG'];
        names.forEach((s, i) => { cx.save(); cx.translate(120 + rnd(i, 31) * (w - 400), 160 + rnd(i, 32) * (h - 320)); cx.rotate(rnd(i, 33) > .5 ? -.12 : -.12 + Math.PI / 2); txt(cx, s, 0, 0, '700 20px SMono', 'rgba(150,165,190,.35)', 'left', 'alphabetic', 5); cx.restore(); });
      });
      const ox = -310 + Math.sin(gt * .05) * 50 - Math.min(lt, 20) * 3, oy = -300 - Math.min(lt, 20) * 5;
      c.save(); c.globalAlpha = .85; c.drawImage(m, ox, oy); c.restore();
      // Stecknadel mit Puls
      const px = 740, py = 1180, pu = (gt * .6) % 1;
      c.save(); c.strokeStyle = `rgba(255,40,40,${.6 * (1 - pu)})`; c.lineWidth = 3; c.beginPath(); c.ellipse(px, py, 20 + pu * 90, (20 + pu * 90) * .45, 0, 0, 7); c.stroke();
      glow(c, 'rgba(255,32,32,1)', 22); c.fillStyle = '#ff2b2b'; c.beginPath(); c.arc(px, py - 34, 13, 0, 7); c.fill(); noGlow(c);
      c.strokeStyle = '#ff5a5a'; c.lineWidth = 4; c.beginPath(); c.moveTo(px, py - 22); c.lineTo(px, py); c.stroke(); c.restore();
      lampShade(c, 540, cy, 260, 1250, .78);
    } else if (bg === 'snow') {
      bgFill(c, '#0d121b', '#040507');
      spot(c, 540, cy - 300, 900, 'rgba(120,140,180,A)', .10 + .03 * noise(gt * .7, 4));
      c.save(); const g = c.createLinearGradient(0, 1450, 0, H + 200); g.addColorStop(0, 'rgba(170,180,200,0)'); g.addColorStop(1, 'rgba(170,180,200,.16)'); c.fillStyle = g; c.fillRect(-200, 1450, W + 400, 700); c.restore();
      snow(c, gt, 7);
      lampShade(c, 540, cy, 380, 1300, .55);
    } else if (bg === 'paper') {
      const pp = cached('titlepaper', W + 400, H + 400, (cx, w, h) => {
        paperTexture(cx, w, h, '#bdb6a6', 77, { stains: 22, edge: .35 });
        cx.strokeStyle = 'rgba(60,45,25,.12)'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(0, h * .52); cx.lineTo(w, h * .5); cx.stroke();
        cx.strokeStyle = 'rgba(255,255,255,.12)'; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(0, h * .52 + 3); cx.lineTo(w, h * .5 + 3); cx.stroke();
      });
      c.drawImage(pp, -200 + Math.sin(gt * .1) * 8, -200);
      const br = .52 + .04 * noise(gt * .8, 3);
      lampShade(c, 520, cy - 80, 240, 1200, br + .32);
      c.save(); c.fillStyle = 'rgba(20,30,50,.18)'; c.fillRect(-200, -200, W + 400, H + 400); c.restore();
      motes(c, gt, 26, 4, -100, 200, W + 200, 1400, 'rgba(30,25,20,1)', .25, 2.5);
    } else {
      bgFill(c, '#0c0c10', '#040405');
      spot(c, 540, cy, 720, RED, .07 + .03 * Math.sin(gt * 1.3));
      spot(c, 540, cy - 40, 520, 'rgba(140,150,175,A)', .05 + .015 * noise(gt * 1.1, 6));
      motes(c, gt, 40, 2, -100, 150, W + 200, 1600, 'rgba(200,205,220,1)', .32, 2.6);
    }
  }
  SCENES.title_card = (c, lt, b, gt) => {
    const p = b.p || EMPTY;
    const bg = p.bg || 'black', cy = num(p.y, 800);
    titleBg(c, bg, lt, gt, cy);
    const onPaper = bg === 'paper';
    const ink = onPaper ? '#1a1816' : '#ecebe6', redC = onPaper ? '#b0121a' : '#ff2b2b', redG = onPaper ? 'rgba(200,20,20,.35)' : 'rgba(255,32,32,.9)';
    const date = p.date != null ? String(p.date) : 'JANUARY 15, 1974';
    const place = p.place != null ? String(p.place) : 'WICHITA, KANSAS';
    const sub = p.sub ? String(p.sub) : '';
    const at = num(p.at, .2);
    let sp = Math.max(1, num(p.speed, 22));
    if (p.speed == null && b.end != null && b.start != null) { // ohne Vorgabe: Tippen passt in den Beat (Linie + Unterzeile danach)
      const need = (date.length + place.length / 1.2) / sp, room = (b.end - b.start) - at - (sub ? 1.6 : 1.1);
      if (room > .5 && need > room) sp *= need / room;
    }
    const reds = Array.isArray(p.red) ? p.red : (p.red ? [p.red] : ['1974']);
    const dfs = fitSize(c, date, 800, num(p.size, 88), s => `400 ${s}px Elite`, 1);
    const dFont = `400 ${dfs}px Elite`;
    let pls = 10; while (pls > 3 && tw(c, place, '700 40px SMono', pls) > 800) pls--;
    const pfs = fitSize(c, place, 800, 40, s => `700 ${s}px SMono`, pls, 18), pFont = `700 ${pfs}px SMono`;
    const tDate = at, dDate = date.length / sp, tPlace = tDate + dDate + (date ? .3 : 0), dPlace = place.length / (sp * 1.2);
    const tLine = tPlace + dPlace + .15, tSub = tLine + .35;
    const dW = tw(c, date, dFont, 1), pW = tw(c, place, pFont, pls);
    const dx = 540 - dW / 2, px = 540 - pW / 2 + 5;
    const dy = cy, py = cy + Math.max(80, dfs * .95), ly = py + 42, sy = ly + 66;
    const drift = noise(gt * .25, 8) * 3, fl = .94 + .06 * flicker(gt, 5, 6);
    c.save(); c.translate(0, drift); c.globalAlpha = fl;
    // Datum
    const nD = Math.max(0, Math.min(date.length, Math.floor((lt - tDate) * sp)));
    if (!onPaper) { c.save(); c.globalAlpha = .55 * fl; glow(c, 'rgba(0,0,0,1)', 24); typeRow(c, date, dx, dy, dFont, 'rgba(0,0,0,.6)', nD, { ls: 1, inkVar: false, jit: 0 }); c.restore(); }
    typeRow(c, date, dx, dy, dFont, ink, nD, { ls: 1, mask: hlMask(date, reds), redCol: redC, redGlow: redG, redBlur: 26, seed: 3, ages: i => lt - (tDate + (i + 1) / sp), strike: onPaper ? '#000' : '#ffffff' });
    // Ort (gesperrt)
    const nP = Math.max(0, Math.min(place.length, Math.floor((lt - tPlace) * sp * 1.2)));
    typeRow(c, place, px, py, pFont, onPaper ? '#2b2722' : '#b9bcc6', nP, { ls: pls, mask: hlMask(place, reds), redCol: redC, redGlow: redG, seed: 9, jit: 1, ages: i => lt - (tPlace + (i + 1) / (sp * 1.2)) });
    // Cursor
    const typingP = lt >= tPlace && place, curX = typingP ? px + charXs(c, place, pFont, pls)[nP] + 4 : dx + charXs(c, date, dFont, 1)[nD] + 6;
    const curY = typingP ? py : dy, curH = typingP ? pfs : dfs * .8;
    const typing = (lt >= tDate && lt < tDate + dDate) || (lt >= tPlace && lt < tPlace + dPlace);
    if (typing || (lt * 1.8) % 1 < .55) { c.save(); glow(c, redG, 16); c.fillStyle = redC; c.fillRect(curX, curY - curH * .85, Math.max(4, curH * .09), curH); c.restore(); }
    // rote Linie
    if (lt >= tLine) {
      const k = E.inOut(prog(lt, tLine, tLine + .7)), lw = Math.max(dW, pW) * .92;
      c.save(); glow(c, redG, 18); c.strokeStyle = redC; c.lineWidth = 3; c.lineCap = 'round';
      c.beginPath(); c.moveTo(540 - lw / 2 * k, ly); c.lineTo(540 + lw / 2 * k, ly); c.stroke();
      c.fillStyle = redC; for (const s of [-1, 1]) { c.beginPath(); c.arc(540 + s * lw / 2 * k, ly, 4.5 * k, 0, 7); c.fill(); }
      c.restore();
    }
    if (sub && lt >= tSub) {
      const k = E.out(prog(lt, tSub, tSub + .6)); c.save(); c.globalAlpha = k * fl;
      const L = wrap(c, sub, 800, '600 34px Mont');
      L.slice(0, 3).forEach((l, i) => txt(c, l, 540, sy + i * 44 + (1 - k) * 14, '600 34px Mont', onPaper ? '#2e2a25' : '#c9cbd3', 'center', 'alphabetic', 1));
      c.restore();
    }
    c.restore();
  };

  // ---------- 4) years_flip ----------
  function invEase(f, y) { let a = 0, b = 1; for (let i = 0; i < 26; i++) { const m = (a + b) / 2; if (f(m) < y) a = m; else b = m; } return (a + b) / 2; }
  function flipCardImg(d, red, w, h) {
    return cached('flip|' + d + '|' + (red ? 1 : 0) + '|' + w, w, h, (cx) => {
      const hh = h / 2;
      let g = cx.createLinearGradient(0, 0, 0, hh); g.addColorStop(0, '#26262d'); g.addColorStop(1, '#1b1b21');
      rr(cx, 0, 0, w, hh, [14, 14, 3, 3]); cx.fillStyle = g; cx.fill();
      g = cx.createLinearGradient(0, hh, 0, h); g.addColorStop(0, '#1d1d23'); g.addColorStop(1, '#141418');
      rr(cx, 0, hh, w, hh, [3, 3, 14, 14]); cx.fillStyle = g; cx.fill();
      cx.fillStyle = 'rgba(255,255,255,.06)'; cx.fillRect(10, 2, w - 20, 2);
      cx.save(); rr(cx, 0, 0, w, h, 14); cx.clip();
      if (red) glow(cx, 'rgba(255,32,32,.95)', 30);
      txt(cx, String(d), w / 2, h / 2 + h * .315, `400 ${Math.round(h * .86)}px Anton`, red ? '#ff3a3a' : '#e9e9ee', 'center', 'alphabetic');
      if (red) { noGlow(cx); txt(cx, String(d), w / 2, h / 2 + h * .315, `400 ${Math.round(h * .86)}px Anton`, '#ff5a50', 'center', 'alphabetic'); }
      cx.restore();
      // Schatten in der Mitte (Klappenspalt)
      g = cx.createLinearGradient(0, hh - 18, 0, hh + 18); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.5, 'rgba(0,0,0,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      cx.fillStyle = g; cx.fillRect(0, hh - 18, w, 36);
    });
  }
  function flap(c, x, y, w, h, oldI, newI, f) {
    const hh = h / 2;
    if (f >= 1 || oldI === newI) { c.drawImage(newI, x, y); return; }
    c.drawImage(newI, 0, 0, w, hh, x, y, w, hh);
    c.drawImage(oldI, 0, hh, w, hh, x, y + hh, w, hh);
    const a = Math.PI * Math.pow(clamp(f), 1.45), cs = Math.cos(a);
    if (cs > 0) {
      c.fillStyle = `rgba(0,0,0,${.55 * cs})`; c.fillRect(x, y, w, hh - hh * cs); // Schatten auf der neuen Oberseite
      const fh = Math.max(1, hh * cs); c.drawImage(oldI, 0, 0, w, hh, x - (1 - cs) * 6, y + hh - fh, w + (1 - cs) * 12, fh);
      c.fillStyle = `rgba(0,0,0,${.6 * (1 - cs)})`; c.fillRect(x - (1 - cs) * 6, y + hh - fh, w + (1 - cs) * 12, fh);
    } else {
      const fh = Math.max(1, hh * -cs), sp = (1 + cs) * 6;
      const g = c.createLinearGradient(0, y + hh, 0, y + h); g.addColorStop(0, `rgba(0,0,0,${.7 * (1 + cs)})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.fillRect(x, y + hh, w, hh);
      c.drawImage(newI, 0, hh, w, hh, x - sp, y + hh, w + sp * 2, fh);
      c.fillStyle = `rgba(255,255,255,${.08 * (1 + cs)})`; c.fillRect(x - sp, y + hh, w + sp * 2, fh);
    }
  }
  SCENES.years_flip = (c, lt, b, gt) => {
    const p = b.p || EMPTY;
    const from = Math.round(num(p.from, 1979)), to = Math.round(num(p.to, 2004));
    const t0 = num(p.t0, .4), t1 = Math.max(t0 + .05, num(p.t1, 3.4));
    const N = Math.abs(to - from), dir = to >= from ? 1 : -1;
    const kf = E.inOut, val = j => from + dir * j;
    const stepT = j => t0 + (t1 - t0) * invEase(kf, j / Math.max(1, N));
    const steps = N ? Math.min(N, Math.floor(kf(prog(lt, t0, t1)) * N + 1e-6)) : 0;
    const vCont = from + dir * kf(prog(lt, t0, t1)) * N;
    const nd = Math.max(4, String(Math.max(Math.abs(from), Math.abs(to))).length);
    const tLand = t1 + .22, land = N ? E.out(prog(lt, tLand, tLand + .3)) : 0;
    const cy = num(p.y, 760);
    // Hintergrund
    bgFill(c, '#0d0e12', '#040405');
    spot(c, 540, cy - 120, 760, 'rgba(150,160,185,A)', .07 + .02 * noise(gt * .9, 2));
    spot(c, 540, cy, 820, RED, .05 + .16 * land * (.75 + .25 * Math.sin(gt * 2.4)));
    motes(c, gt, 34, 11, -100, 200, W + 200, 1500, 'rgba(200,205,220,1)', .28, 2.4);
    // Gehäuse
    const cw = nd > 4 ? Math.floor(720 / nd) : 176, ch = Math.round(cw * 1.62), gap = 18;
    const totW = nd * cw + (nd - 1) * gap, x0 = 540 - totW / 2, y0 = cy - ch / 2;
    const punch = lt > tLand && N ? Math.exp(-(lt - tLand) * 7) * .045 : 0;
    c.save(); c.translate(540, cy); c.scale(1 + punch, 1 + punch); c.translate(-540, -cy);
    c.save(); glow(c, 'rgba(0,0,0,.9)', 60); rr(c, x0 - 46, y0 - 60, totW + 92, ch + 120, 26);
    const hg = c.createLinearGradient(0, y0 - 60, 0, y0 + ch + 60); hg.addColorStop(0, '#1e1f25'); hg.addColorStop(1, '#0f1013'); c.fillStyle = hg; c.fill(); noGlow(c);
    c.lineWidth = 3; c.strokeStyle = '#33343c'; c.stroke(); c.restore();
    for (const [sx, sy] of [[x0 - 26, y0 - 40], [x0 + totW + 26, y0 - 40], [x0 - 26, y0 + ch + 40], [x0 + totW + 26, y0 + ch + 40]]) {
      c.fillStyle = '#2c2d34'; c.beginPath(); c.arc(sx, sy, 8, 0, 7); c.fill(); c.strokeStyle = '#15161a'; c.lineWidth = 2; c.beginPath(); c.moveTo(sx - 5, sy - 3); c.lineTo(sx + 5, sy + 3); c.stroke(); }
    // rote LED-Leiste oben
    c.save(); const led = .25 + .75 * Math.max(land, N && lt >= t0 && lt < t1 ? .5 + .5 * Math.sin(gt * 12) : 0);
    glow(c, 'rgba(255,32,32,1)', 20 * led); c.fillStyle = `rgba(255,40,40,${.35 + .65 * led})`; rr(c, 540 - 60, y0 - 38, 120, 7, 4); c.fill(); c.restore();
    // Ziffern
    for (let k = 0; k < nd; k++) {
      const pw = Math.pow(10, nd - 1 - k), dig = v => Math.floor(Math.abs(v) / pw) % 10;
      const cur = dig(val(steps));
      let f = 1, old = cur;
      if (N) {
        let j = steps; const lim = Math.max(0, steps - 12000);
        while (j > lim && dig(val(j)) === dig(val(j - 1))) j--;
        if (j > lim) {
          const tj = stepT(j); let jn = steps + 1; while (jn <= N && dig(val(jn)) === dig(val(jn - 1))) jn++;
          const tn = jn <= N ? stepT(jn) : Infinity;
          const fd = clamp((tn - tj) * .85, .05, .24); f = clamp((lt - tj) / fd); old = dig(val(j - 1));
        }
      }
      const x = x0 + k * (cw + gap);
      c.save(); glow(c, 'rgba(0,0,0,.85)', 18); c.fillStyle = '#000'; rr(c, x, y0, cw, ch, 14); c.fill(); c.restore();
      flap(c, x, y0, cw, ch, flipCardImg(old, false, cw, ch), flipCardImg(cur, false, cw, ch), f);
      if (land > 0 && f >= 1) { c.save(); c.globalAlpha = land; c.drawImage(flipCardImg(cur, true, cw, ch), x, y0); c.restore(); }
      // Spaltlinie + Scharnier
      c.fillStyle = '#060607'; c.fillRect(x, y0 + ch / 2 - 2, cw, 4);
      c.fillStyle = '#3a3b44'; c.fillRect(x - 7, y0 + ch / 2 - 9, 7, 18); c.fillRect(x + cw, y0 + ch / 2 - 9, 7, 18);
    }
    // Glanz über die Karten
    c.save(); c.globalCompositeOperation = 'screen'; const gx = x0 + ((gt * 120) % (totW + 800)) - 400;
    const sg = c.createLinearGradient(gx, 0, gx + 260, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,255,255,.04)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = sg; c.fillRect(x0, y0, totW, ch); c.restore();
    c.restore();
    // Skala unter dem Zähler
    const ry = y0 + ch + 120;
    if (p.ticks !== false) {
      const spc = 34, vC = N ? vCont : from;
      c.save(); c.beginPath(); c.rect(140, ry - 50, 800, 110); c.clip();
      for (let yv = Math.floor(vC) - 14; yv <= Math.ceil(vC) + 14; yv++) {
        const x = 540 + (yv - vC) * spc, dd = Math.abs(x - 540) / 400, a = clamp(1 - dd * dd);
        const major = yv % 5 === 0; c.globalAlpha = a; c.fillStyle = major ? '#c9cad2' : '#6c6d78';
        c.fillRect(x - 1.5, ry - (major ? 30 : 16), 3, major ? 30 : 16);
        if (major) txt(c, String(yv), x, ry + 34, '700 22px SMono', '#8d8e99', 'center');
      }
      c.restore();
      c.save(); glow(c, 'rgba(255,32,32,1)', 14); c.fillStyle = '#ff2b2b'; c.beginPath(); c.moveTo(540, ry - 36); c.lineTo(530, ry - 54); c.lineTo(550, ry - 54); c.closePath(); c.fill();
      c.fillRect(538.5, ry - 36, 3, 38); c.restore();
      c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(160, ry, 760, 2);
    }
    // Label + Unterzeile
    const label = p.label != null ? String(p.label) : 'YEARS OF SILENCE';
    const la = E.out(prog(lt, 0, .5));
    if (label) {
      const fs = fitSize(c, label, 800, 92, s => `400 ${s}px Anton`, 3);
      const ly = ry + (p.ticks !== false ? 170 : 60);
      c.save(); c.globalAlpha = la; glow(c, land > 0 ? `rgba(255,32,32,${.5 * land})` : 'rgba(0,0,0,.9)', 30);
      txt(c, label, 540, ly + (1 - la) * 16, `400 ${fs}px Anton`, '#f1f1f4', 'center', 'alphabetic', 3); noGlow(c);
      if (land > 0) { c.strokeStyle = '#ff2b2b'; c.lineWidth = 4; glow(c, 'rgba(255,32,32,1)', 16); const lw = tw(c, label, `400 ${fs}px Anton`, 3) * land; c.beginPath(); c.moveTo(540 - lw / 2, ly + 24); c.lineTo(540 + lw / 2, ly + 24); c.stroke(); noGlow(c); }
      if (p.sub) { const L = wrap(c, String(p.sub), 780, '600 34px Mont'); L.slice(0, 2).forEach((l, i) => txt(c, l, 540, ly + 84 + i * 44, '600 34px Mont', '#a9abb6', 'center', 'alphabetic', 1)); }
      c.restore();
    }
    // roter Blitz bei der Landung
    if (N && lt > tLand) { const fa = Math.exp(-(lt - tLand) * 5); if (fa > .01) { c.save(); c.globalCompositeOperation = 'screen'; spot(c, 540, cy, 900, RED, .5 * fa); c.restore(); } }
  };

  // ---------- Umbruch mit Zeichen-Offsets ----------
  function wrapIdx(c, s, maxW, font) {
    c.font = font; c.letterSpacing = '0px'; const rows = []; const re = /\S+/g; let r, start = -1, end = -1;
    while ((r = re.exec(s))) {
      if (start < 0) { start = r.index; end = r.index + r[0].length; continue; }
      const cand = s.slice(start, r.index + r[0].length);
      if (c.measureText(cand).width > maxW) { rows.push({ i0: start, text: s.slice(start, end) }); start = r.index; }
      end = r.index + r[0].length;
    }
    if (start >= 0) rows.push({ i0: start, text: s.slice(start, end) });
    if (!rows.length) rows.push({ i0: 0, text: '' });
    return rows;
  }
  const MEAS = document.createElement('canvas').getContext('2d');

  // ---------- 2) letter ----------
  const LETTER_DEF = ['To whom it may concern,', 'I am the one you are looking for.', 'You will hear from me again.', 'It is only a matter of time.'];
  const LAYOUTS = new WeakMap();
  function letterLayout(p, bdur) {
    let L = LAYOUTS.get(p); if (L) return L;
    const hand = p.style === 'hand', SW = 820, SH = 1060;
    const env = !!p.envelope, t00 = env ? 1.8 : .3;
    const baseSize = hand ? 72 : 44, lhF = hand ? 1.12 : 1.5, maxW = 720, cap = hand ? 84 : 58;
    const pGap = num(p.gap, p.paper === 'yellow' ? 0 : .22);
    const fontOf = s => hand ? `700 ${s}px Caveat` : `400 ${s}px Elite`;
    let src = Array.isArray(p.lines) ? p.lines : LETTER_DEF;
    src = src.map(l => typeof l === 'string' ? { text: l } : (l || { text: '' }));
    // Zeiten: ohne Angaben so schnell schreiben, dass alles in den Beat passt
    const sig = p.signature, limit = Math.max(t00 + 1, (bdur || 8) - .6 - (sig ? 1 : 0) - (p.stamp && p.stamp.at == null ? .8 : 0));
    let v = num(p.speed, hand ? 17 : 26), tc, lines;
    for (let it = 0; it < 8; it++) {
      tc = t00; lines = src.map(l => { const text = String(l.text || ''), at = num(l.at, tc), dur = num(l.dur, Math.max(.15, text.length / v)); tc = at + dur + .25; return { ...l, text, at, dur }; });
      if (p.speed != null || tc - .25 <= limit || v >= 90) break;
      v = Math.min(90, v * (tc - .25 - t00) / Math.max(.5, limit - t00) * 1.03);
    }
    const top = -SH / 2 + (p.title ? 190 : 110), bottom = SH / 2 - (sig ? 150 : 80);
    const fixed = lines.some(l => l.size);
    let s = fixed ? 1 : 1.3, rowsAll, total = 0;
    for (; s >= .4; s -= .03) {
      let y = 0; rowsAll = [];
      lines.forEach((l, li) => {
        const fs = Math.round(Math.min(l.size ? 999 : cap, (l.size || baseSize) * s)), font = fontOf(fs), ind = (l.indent || 0) * s;
        const rows = wrapIdx(MEAS, l.text, maxW - ind, font);
        rows.forEach((r, ri) => { y += (ri === 0 && li === 0) ? fs * .9 : fs * (lhF + (ri === 0 ? pGap : 0)); rowsAll.push({ ...r, li, fs, font, x: -maxW / 2 + ind, y }); });
      });
      total = y; if (y + 10 <= bottom - top) break;
    }
    const avail = bottom - top, off = total < avail * .6 && p.paper !== 'yellow' ? (avail - total) * .22 : 0;
    rowsAll.forEach(r => { r.y += top + off; r.xs = charXs(MEAS, r.text, r.font); r.mask = hlMask(r.text, p.hl || []); });
    const lastY = rowsAll.length ? rowsAll[rowsAll.length - 1].y : top;
    const step = rowsAll.length ? rowsAll[0].fs * lhF : 70;
    L = { hand, SW, SH, lines, rows: rowsAll, s, fontOf, baseSize, lastY, t00, end: tc, step, rule0: rowsAll.length ? rowsAll[0].y : top };
    LAYOUTS.set(p, L); return L;
  }
  function letterPaper(kind, SW, SH, hand, L) {
    return cached('lp|' + kind + '|' + (hand ? 1 : 0) + '|' + (kind === 'yellow' ? Math.round(L.step) + ',' + Math.round(L.rule0) : ''), SW, SH, (cx, w, h) => {
      const base = kind === 'yellow' ? '#d3c992' : kind === 'old' ? '#c4b38b' : '#d2d0c9';
      paperTexture(cx, w, h, base, kind === 'old' ? 13 : 5, { stains: kind === 'old' ? 14 : 3, edge: kind === 'old' ? .45 : .14 });
      if (kind === 'yellow') {
        cx.fillStyle = 'rgba(70,90,140,.3)'; const st = Math.max(30, L.step), y0 = L.rule0 + h / 2 + 10;
        for (let y = y0 - Math.floor((y0 - 70) / st) * st; y < h - 16; y += st) cx.fillRect(16, Math.round(y), w - 32, 2);
        cx.fillStyle = 'rgba(190,40,40,.45)'; cx.fillRect(68, 0, 2, h); cx.fillRect(74, 0, 2, h);
        cx.fillStyle = 'rgba(120,30,30,.35)'; cx.fillRect(0, 0, w, 44); cx.fillStyle = 'rgba(0,0,0,.15)'; cx.fillRect(0, 44, w, 3);
      }
      // Falzlinien (dreifach gefaltet)
      if (kind !== 'yellow') for (const fy of [h / 3, 2 * h / 3]) {
        const g = cx.createLinearGradient(0, fy - 10, 0, fy + 10); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.48, 'rgba(0,0,0,.10)'); g.addColorStop(.52, 'rgba(255,255,255,.18)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        cx.fillStyle = g; cx.fillRect(0, fy - 10, w, 20);
      }
    });
  }
  function envelopeDraw(c, lt, front, SW) {
    const ew = 900, eh = 560, k = E.inOut(prog(lt, 0, .55)), out = E.in(prog(lt, 1.2, 1.8));
    const ey = 1060 + out * 1100, ex = 540;
    if (out >= 1) return;
    c.save(); c.translate(ex, ey); c.rotate(.03 - out * .1);
    const col = '#c9c2b0', dk = '#aaa290';
    if (!front) {
      glow(c, 'rgba(0,0,0,.85)', 50); c.fillStyle = dk; c.fillRect(-ew / 2, -eh / 2, ew, eh); noGlow(c);
      c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-ew / 2 + 10, -eh / 2 + 10, ew - 20, eh - 20);
      if (k > .5) { const fk = (k - .5) * 2; c.fillStyle = dk; c.beginPath(); c.moveTo(-ew / 2, -eh / 2); c.lineTo(ew / 2, -eh / 2); c.lineTo(0, -eh / 2 - eh * .55 * fk); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 2; c.stroke(); }
    } else {
      c.fillStyle = col; c.beginPath(); c.moveTo(-ew / 2, -eh / 2 + 4); c.lineTo(0, eh * .08); c.lineTo(ew / 2, -eh / 2 + 4); c.lineTo(ew / 2, eh / 2); c.lineTo(-ew / 2, eh / 2); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-ew / 2, eh / 2); c.lineTo(0, eh * .08); c.lineTo(ew / 2, eh / 2); c.stroke();
      // Briefmarke + Poststempel
      c.fillStyle = '#7d2328'; c.fillRect(ew / 2 - 150, eh / 2 - 190, 96, 116); c.strokeStyle = 'rgba(255,255,255,.5)'; c.setLineDash([5, 5]); c.lineWidth = 3; c.strokeRect(ew / 2 - 146, eh / 2 - 186, 88, 108); c.setLineDash([]);
      c.strokeStyle = 'rgba(30,30,40,.55)'; c.lineWidth = 3; c.beginPath(); c.arc(ew / 2 - 160, eh / 2 - 130, 50, 0, 7); c.stroke();
      for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(ew / 2 - 320, eh / 2 - 160 + i * 16); for (let x = 0; x <= 140; x += 10) c.lineTo(ew / 2 - 320 + x, eh / 2 - 160 + i * 16 + Math.sin(x * .09) * 5); c.stroke(); }
      if (k <= .5) { const fk = 1 - k * 2; c.fillStyle = '#d3ccba'; glow(c, 'rgba(0,0,0,.4)', 14); c.beginPath(); c.moveTo(-ew / 2, -eh / 2); c.lineTo(ew / 2, -eh / 2); c.lineTo(0, -eh / 2 + eh * .55 * fk); c.closePath(); c.fill(); noGlow(c); }
    }
    c.restore();
  }
  SCENES.letter = (c, lt, b, gt) => {
    const p = b.p || EMPTY, L = letterLayout(p, (b.end != null && b.start != null) ? b.end - b.start : 8), { SW, SH, hand } = L;
    const cx0 = 540, cy0 = num(p.y, 845);
    // Tisch + Lampe
    c.drawImage(deskLayer(), -200 + noise(gt * .05, 3) * 10, -200);
    const lampX = 330 + noise(gt * .2, 4) * 12, lampY = 420;
    spot(c, lampX, lampY + 200, 1100, 'rgba(190,195,210,A)', .10 + .02 * noise(gt * 1.3, 5));
    // Umschlag-Animation
    const env = !!p.envelope;
    let slide = 0, sc = 1;
    if (env) { const k = E.inOut(prog(lt, .45, 1.6)); slide = lerp(560, 0, k); sc = lerp(.86, 1, k); envelopeDraw(c, lt, false, SW); }
    const stamp = p.stamp ? { text: 'RECEIVED OCT 22 1974', ...p.stamp, at: num(p.stamp.at, L.end + .3) } : null;
    const sh = stampShake(stamp, lt);
    const tilt = num(p.tilt, -.02) + noise(gt * .3, 6) * .004;
    const inEnv = env && lt < 1.8;
    if (inEnv) { c.save(); c.beginPath(); c.rect(-400, -400, W + 800, 400 + 1060 + 274 + E.in(prog(lt, 1.2, 1.8)) * 1100); c.clip(); }
    c.save(); c.translate(cx0 + noise(gt * .4, 7) * 3, cy0 + slide + noise(gt * .35, 8) * 4 + sh * 9 * Math.sin(lt * 70)); c.rotate(tilt + sh * .01); c.scale(sc * (1 + sh * .012), sc * (1 + sh * .012));
    // Papier + Schatten
    c.save(); glow(c, 'rgba(0,0,0,.85)', 55); c.shadowOffsetX = 16; c.shadowOffsetY = 22; c.fillStyle = '#000'; c.fillRect(-SW / 2, -SH / 2, SW, SH); c.restore();
    c.drawImage(letterPaper(p.paper || 'white', SW, SH, hand, L), -SW / 2, -SH / 2);
    const ink = hand ? '#1d2440' : '#1a1a1e', redInk = '#b0101a';
    // Titel
    if (p.title) {
      const tFont = hand ? `700 ${Math.round(74 * Math.max(.7, L.s))}px Caveat` : `400 ${Math.round(50 * Math.max(.7, L.s))}px Elite`;
      const ta = p.titleAt != null ? clamp((lt - p.titleAt) * 20 / Math.max(1, String(p.title).length)) : 1;
      const T = String(p.title), tW = tw(c, T, tFont, hand ? 0 : 3);
      const n = Math.floor(T.length * ta);
      if (hand) { c.save(); c.beginPath(); c.rect(-tW / 2 - 10, -SH / 2 + 40, (tW + 20) * ta, 140); c.clip(); txt(c, T, 0, -SH / 2 + 130, tFont, ink, 'center'); c.restore(); }
      else typeRow(c, T, -tW / 2, -SH / 2 + 130, tFont, ink, n, { ls: 3, seed: 41 });
      if (!hand && ta >= 1) { c.fillStyle = 'rgba(20,20,24,.7)'; c.fillRect(-tW / 2, -SH / 2 + 146, tW, 3); }
    }
    // Fokus-Dimmen
    const fa = p.focusLine != null ? E.out(prog(lt, num(p.focusAt, 0), num(p.focusAt, 0) + .5)) : 0;
    const lineAlpha = li => p.focusLine == null || li === p.focusLine ? 1 : 1 - .72 * fa;
    // Zeilen
    for (const r of L.rows) {
      const l = L.lines[r.li]; if (lt < l.at || !r.text) continue;
      const kc = clamp((lt - l.at) / l.dur) * l.text.length, loc = clamp(kc - r.i0, 0, r.text.length);
      if (loc <= 0) continue;
      const col = l.red ? redInk : ink, la = lineAlpha(r.li);
      if (!hand) {
        typeRow(c, r.text, r.x, r.y, r.font, col, Math.floor(loc), { mask: r.mask, redCol: redInk, seed: r.li * 31 + r.i0, alpha: la,
          ages: i => lt - (l.at + (r.i0 + i + 1) / l.text.length * l.dur), strike: l.red ? '#5a0006' : '#000' });
      } else {
        const n = Math.floor(loc), fr = loc - n, rx = r.xs[n] + (n < r.text.length ? (r.xs[n + 1] - r.xs[n]) * fr : 0);
        c.save(); c.globalAlpha = la; c.beginPath(); c.rect(r.x - 20, r.y - r.fs * 1.1, rx + 20, r.fs * 1.6); c.clip();
        txt(c, r.text, r.x, r.y, r.font, col, 'left');
        if (r.mask.some(Boolean)) for (let i = 0; i < r.text.length; i++) if (r.mask[i]) txt(c, r.text[i], r.x + r.xs[i], r.y, r.font, redInk, 'left');
        c.restore();
      }
      // hervorgehobene Wörter glühen rot, sobald sie fertig getippt sind
      if (r.mask.some(Boolean)) {
        let i = 0; while (i < r.text.length) { if (!r.mask[i]) { i++; continue; } let j = i; while (j < r.text.length && r.mask[j]) j++;
          const tDone = l.at + (r.i0 + j) / l.text.length * l.dur;
          if (lt >= tDone) { const g = E.out(prog(lt, tDone, tDone + .35)), pulse = .8 + .2 * Math.sin(gt * 3 + i);
            c.save(); c.globalAlpha = la * g * pulse; glow(c, 'rgba(255,32,32,.95)', 22); txt(c, r.text.slice(i, j), r.x + r.xs[i], r.y, r.font, '#d01820', 'left'); c.restore(); }
          i = j; }
      }
    }
    // Schwärzungen
    for (const rd of (p.redact || [])) {
      const li = rd.line || 0, l = L.lines[li]; if (!l) continue;
      const shown = Math.floor(clamp((lt - l.at) / l.dur) * l.text.length); // nur über bereits Geschriebenes
      const from = clamp(Math.round(num(rd.from, 0)), 0, l.text.length), to = clamp(Math.round(num(rd.to, l.text.length)), from, Math.max(from, shown));
      const at = num(rd.at, l.at + l.dur + .3); if (lt < at || to <= from) continue;
      const k = E.inOut(prog(lt, at, at + .4)) * (to - from);
      for (const r of L.rows) {
        if (r.li !== li) continue; const a = Math.max(from, r.i0) - r.i0, bb = Math.min(to, r.i0 + r.text.length) - r.i0; if (bb <= a) continue;
        const done = Math.max(0, Math.min(bb, from - r.i0 + k) - a); if (done <= 0) continue;
        const ai = Math.floor(a), x0 = r.x + r.xs[ai] - 6, x1 = r.x + r.xs[Math.min(r.text.length, Math.ceil(a + done))] + 6;
        c.save(); c.fillStyle = '#0b0b0d'; c.globalAlpha = .97;
        rr(c, x0, r.y - r.fs * .8, Math.max(4, x1 - x0), r.fs * 1.02, r.fs * .16); c.fill();
        c.globalAlpha = .6; for (let q = 0; q < 2; q++) { rr(c, x0 + 3 + q * 5, r.y - r.fs * (.86 - q * 1.06) + (rnd(q, li) - .5) * 3, Math.max(4, x1 - x0 - 8 - q * 8), r.fs * .14, r.fs * .07); c.fill(); }
        c.restore();
      }
    }
    // Unterschrift
    if (p.signature) {
      const sg = typeof p.signature === 'string' ? { text: p.signature } : p.signature;
      const sat = num(sg.at, L.end + .2), sFont = sg.style === 'type' ? `400 ${Math.round(46 * Math.max(.75, L.s))}px Elite` : sg.style === 'scrawl' ? `400 ${Math.round(44 * Math.max(.75, L.s))}px RockSalt` : `700 ${Math.round(84 * Math.max(.75, L.s))}px Caveat`;
      if (lt >= sat) {
        const S = String(sg.text || '—'), sw = tw(c, S, sFont), k = E.inOut(prog(lt, sat, sat + Math.max(.5, S.length * .07)));
        const sx = SW / 2 - 80 - sw, sy = Math.min(SH / 2 - 70, L.lastY + 120);
        c.save(); c.beginPath(); c.rect(sx - 20, sy - 120, (sw + 40) * k, 170); c.clip(); txt(c, S, sx, sy, sFont, sg.red ? redInk : ink, 'left');
        c.strokeStyle = sg.red ? redInk : ink; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx - 10, sy + 20); c.quadraticCurveTo(sx + sw * .5, sy + 34, sx + sw + 10, sy + 12); c.stroke(); c.restore();
      }
    }
    // Stempel
    if (stamp) rubberStamp(c, stamp, num(stamp.x, SW / 2 - 250), num(stamp.y, SH / 2 - 190), num(stamp.rot, -.14), lt, stamp.col || 'rgba(176,18,26,1)', num(stamp.w, 460));
    // Papierglanz von der Lampe
    c.save(); c.globalCompositeOperation = 'screen'; const pg = c.createLinearGradient(-SW / 2, -SH / 2, SW / 2, SH / 2); pg.addColorStop(0, 'rgba(255,255,255,.07)'); pg.addColorStop(.6, 'rgba(255,255,255,0)'); c.fillStyle = pg; c.fillRect(-SW / 2, -SH / 2, SW, SH); c.restore();
    c.restore();
    if (inEnv) c.restore();
    if (env) envelopeDraw(c, lt, true, SW);
    // Licht + Staub
    lampShade(c, lampX + 160, lampY + 380, 360, 1350, .72 + .04 * noise(gt * 1.1, 9));
    c.save(); c.fillStyle = 'rgba(20,30,55,.13)'; c.fillRect(-200, -200, W + 400, H + 400); c.restore();
    motes(c, gt, 30, 17, -100, 200, W + 200, 1500, 'rgba(220,222,230,1)', .3, 2.2);
    if (sh > .02) motes(c, gt * 3, 14, 23, 300, 300, 600, 500, 'rgba(230,230,235,1)', .4 * sh, 2);
  };

  // ---------- Pressefotos (Graustufen-Motive → Raster) ----------
  function photoArt(cx, kind, w, h) {
    const G = v => `rgb(${v},${v},${v})`;
    if (kind === 'silhouette') {
      let g = cx.createRadialGradient(w / 2, h * .4, 10, w / 2, h * .5, w * .7); g.addColorStop(0, G(200)); g.addColorStop(1, G(110)); cx.fillStyle = g; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = G(90); cx.lineWidth = 2; cx.fillStyle = G(80); cx.font = '700 14px SMono'; cx.textAlign = 'left';
      for (let i = 1; i < 8; i++) { const y = h * i / 8; cx.beginPath(); cx.moveTo(0, y); cx.lineTo(w, y); cx.stroke(); cx.fillText(`${7 - Math.floor(i / 2)}'${i % 2 ? '6"' : ''}`, 8, y - 5); }
      cx.fillStyle = G(18); cx.beginPath(); cx.ellipse(w / 2, h * 1.02, w * .36, h * .3, 0, Math.PI, 0); cx.fill();
      cx.fillRect(w / 2 - w * .06, h * .55, w * .12, h * .2);
      cx.beginPath(); cx.ellipse(w / 2, h * .43, w * .13, h * .19, 0, 0, 7); cx.fill();
    } else if (kind === 'floppy') {
      let g = cx.createLinearGradient(0, 0, w, h); g.addColorStop(0, G(150)); g.addColorStop(1, G(95)); cx.fillStyle = g; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 40; i++) { cx.strokeStyle = `rgba(0,0,0,${.04 + rnd(i, 61) * .05})`; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(0, rnd(i, 62) * h); cx.lineTo(w, rnd(i, 63) * h + 30); cx.stroke(); }
      const s = h * .7; cx.save(); cx.translate(w * .52, h * .5); cx.rotate(-.18);
      cx.fillStyle = 'rgba(0,0,0,.35)'; cx.fillRect(-s / 2 + 14, -s / 2 + 16, s, s);
      cx.fillStyle = G(34); cx.beginPath(); cx.moveTo(-s / 2, -s / 2); cx.lineTo(s / 2 - s * .06, -s / 2); cx.lineTo(s / 2, -s / 2 + s * .06); cx.lineTo(s / 2, s / 2); cx.lineTo(-s / 2, s / 2); cx.closePath(); cx.fill();
      cx.fillStyle = G(185); cx.fillRect(-s * .22, -s / 2, s * .5, s * .36); cx.fillStyle = G(60); cx.fillRect(s * .06, -s / 2 + s * .05, s * .1, s * .24);
      cx.fillStyle = G(230); cx.fillRect(-s * .4, -s * .02, s * .8, s * .48);
      cx.strokeStyle = G(120); cx.lineWidth = 2; for (let i = 0; i < 4; i++) { cx.beginPath(); cx.moveTo(-s * .34, s * .08 + i * s * .09); cx.lineTo(s * .34, s * .08 + i * s * .09); cx.stroke(); }
      cx.fillStyle = G(70); cx.font = `700 ${Math.round(s * .09)}px Caveat`; cx.textAlign = 'left'; cx.fillText('Disk 1', -s * .3, s * .07);
      cx.fillStyle = G(10); cx.fillRect(-s * .45, s * .38, s * .07, s * .07);
      cx.restore();
    } else if (kind === 'farm') {
      let g = cx.createLinearGradient(0, 0, 0, h * .6); g.addColorStop(0, G(150)); g.addColorStop(1, G(196)); cx.fillStyle = g; cx.fillRect(0, 0, w, h);
      cx.fillStyle = G(215); cx.fillRect(0, h * .62, w, h * .38);
      cx.fillStyle = G(95); for (let x = 0; x < w; x += 8) { const t = h * (.56 + .03 * Math.sin(x * .05) + .02 * rnd(x, 64)); cx.fillRect(x, t, 9, h * .62 - t + 2); }
      // Hof: Wohnhaus + Stadel
      cx.fillStyle = G(70); cx.fillRect(w * .12, h * .42, w * .26, h * .24);
      cx.fillStyle = G(38); cx.beginPath(); cx.moveTo(w * .09, h * .43); cx.lineTo(w * .25, h * .22); cx.lineTo(w * .41, h * .43); cx.closePath(); cx.fill();
      cx.fillStyle = G(85); cx.fillRect(w * .38, h * .47, w * .5, h * .19);
      cx.fillStyle = G(48); cx.beginPath(); cx.moveTo(w * .36, h * .48); cx.lineTo(w * .42, h * .33); cx.lineTo(w * .86, h * .33); cx.lineTo(w * .9, h * .48); cx.closePath(); cx.fill();
      cx.fillStyle = G(28); for (const [x, y] of [[.16, .5], [.22, .5], [.29, .5], [.16, .58], [.29, .58]]) cx.fillRect(w * x, h * y, w * .035, h * .05);
      cx.fillRect(w * .58, h * .53, w * .08, h * .13);
      cx.strokeStyle = G(30); cx.lineWidth = 3; for (let i = 0; i < 12; i++) { const x = w * .05 + i * w * .08; cx.beginPath(); cx.moveTo(x, h * .8); cx.lineTo(x, h * .9); cx.stroke(); }
      cx.beginPath(); cx.moveTo(0, h * .83); cx.lineTo(w, h * .83); cx.moveTo(0, h * .87); cx.lineTo(w, h * .87); cx.stroke();
      cx.lineWidth = 4; cx.beginPath(); cx.moveTo(w * .93, h * .64); cx.lineTo(w * .93, h * .3); cx.moveTo(w * .93, h * .4); cx.lineTo(w * .99, h * .3); cx.moveTo(w * .93, h * .45); cx.lineTo(w * .87, h * .34); cx.stroke();
    } else { // house
      let g = cx.createLinearGradient(0, 0, 0, h * .7); g.addColorStop(0, G(140)); g.addColorStop(1, G(190)); cx.fillStyle = g; cx.fillRect(0, 0, w, h);
      cx.fillStyle = G(110); cx.fillRect(0, h * .7, w, h * .3);
      cx.fillStyle = G(165); cx.beginPath(); cx.moveTo(w * .58, h * .7); cx.lineTo(w * .82, h * .7); cx.lineTo(w * .98, h); cx.lineTo(w * .5, h); cx.closePath(); cx.fill();
      cx.fillStyle = G(85); cx.fillRect(w * .16, h * .44, w * .68, h * .27);
      cx.fillStyle = G(40); cx.beginPath(); cx.moveTo(w * .12, h * .45); cx.lineTo(w * .5, h * .27); cx.lineTo(w * .88, h * .45); cx.closePath(); cx.fill();
      cx.fillRect(w * .66, h * .28, w * .04, h * .1);
      cx.fillStyle = G(135); cx.fillRect(w * .58, h * .51, w * .23, h * .2); cx.strokeStyle = G(95); cx.lineWidth = 2; for (let i = 1; i < 5; i++) { cx.beginPath(); cx.moveTo(w * .58, h * (.51 + i * .04)); cx.lineTo(w * .81, h * (.51 + i * .04)); cx.stroke(); }
      cx.fillStyle = G(25); cx.fillRect(w * .22, h * .51, w * .1, h * .09); cx.fillRect(w * .36, h * .51, w * .06, h * .2); cx.fillRect(w * .46, h * .51, w * .08, h * .09);
      cx.strokeStyle = G(28); cx.lineCap = 'round';
      const br = (x, y, a, l, d) => { if (d > 5) return; const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l; cx.lineWidth = Math.max(1, 9 - d * 1.8); cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x2, y2); cx.stroke(); br(x2, y2, a - .45, l * .72, d + 1); br(x2, y2, a + .4, l * .7, d + 1); };
      br(w * .07, h * .78, -Math.PI / 2, h * .22, 0);
      // Streifenwagen
      cx.fillStyle = G(20); rr(cx, w * .62, h * .76, w * .26, h * .1, 8); cx.fill(); rr(cx, w * .67, h * .7, w * .15, h * .08, 8); cx.fill();
      cx.fillStyle = G(225); cx.fillRect(w * .72, h * .685, w * .05, h * .018);
      cx.fillStyle = G(10); for (const x of [.66, .83]) { cx.beginPath(); cx.arc(w * x, h * .865, h * .03, 0, 7); cx.fill(); }
      cx.strokeStyle = G(235); cx.lineWidth = 3; cx.setLineDash([14, 8]); cx.beginPath(); cx.moveTo(0, h * .8); cx.lineTo(w * .55, h * .77); cx.stroke(); cx.setLineDash([]);
    }
  }
  function halftone(kind, w, h, sp, sepia) {
    return cached('ht|' + kind + '|' + w + 'x' + h + '|' + sp + '|' + (sepia ? 1 : 0), w, h, (cx) => {
      const src = document.createElement('canvas'); src.width = w; src.height = h; const sc = src.getContext('2d');
      photoArt(sc, kind, w, h);
      const d = sc.getImageData(0, 0, w, h).data;
      cx.fillStyle = sepia ? '#d8c9a3' : '#e4e2dc'; cx.fillRect(0, 0, w, h);
      cx.fillStyle = sepia ? '#2a2216' : '#151515';
      for (let y = sp / 2, row = 0; y < h; y += sp * .866, row++) for (let x = (row % 2 ? sp / 2 : 0) + sp / 4; x < w; x += sp) {
        const i = (Math.floor(y) * w + Math.floor(x)) * 4, lum = d[i] / 255, r = sp * .6 * Math.sqrt(Math.max(0, 1 - lum));
        if (r > .25) { cx.beginPath(); cx.arc(x, y, r, 0, 7); cx.fill(); }
      }
      cx.globalAlpha = .18; cx.drawImage(src, 0, 0); cx.globalAlpha = 1;
    });
  }

  // ---------- 3) newspaper ----------
  const WORDS = 'the of and police said was that home found case after his were investigators city family officials night county had been would told house one there into from years their about department chief local evidence'.split(' ');
  const WORDS_DE = 'der die und das in den von zu mit sich des auf für ist im dem nicht ein eine als auch es an werden aus er hat daß sie nach bei um am sind noch wie einem über einen so zum war haben nur oder aber vor zur bis mehr durch man Polizei Hof Mord Gendarmerie'.split(' ');
  function filler(cx, x, y0, w, y1, font, lh, seed, de, col) {
    cx.font = font; cx.fillStyle = col; cx.textAlign = 'left'; cx.textBaseline = 'alphabetic';
    const words = de ? WORDS_DE : WORDS; let y = y0, k = seed * 100, para = 0;
    while (y < y1) {
      let line = '', first = para === 0 ? '   ' : '';
      while (true) { const wd = words[Math.floor(rnd(k++, seed) * words.length)]; const t = (line ? line + ' ' : first) + wd; if (cx.measureText(t).width > w) break; line = t; }
      para++; const end = rnd(k, seed + 3) > .86 && para > 3;
      if (end) { line = line.slice(0, Math.floor(line.length * (.3 + .5 * rnd(k, 9)))) + '.'; para = 0; }
      cx.fillText(line, x, y); y += lh;
    }
  }
  const NEWS_DEF = {
    modern: { masthead: 'THE WICHITA EAGLE', date: 'FRIDAY, JANUARY 30, 2004', headline: 'BTK KILLER RESURFACES', sub: 'Police confirm a new letter linked to the unsolved case', photo: 'house' },
    '1970s': { masthead: 'The Wichita Eagle', date: 'WEDNESDAY, JANUARY 16, 1974', headline: 'FAMILY OF FOUR FOUND SLAIN', sub: 'Police have no suspect in the killings', photo: 'house' },
    '1922': { masthead: 'Münchner Neueste Nachrichten', date: 'Donnerstag, 6. April 1922', headline: 'Sechsfacher Mord auf einem Einödhof', sub: 'Die Gendarmerie steht vor einem Rätsel', photo: 'farm' },
  };
  const NLAYOUTS = new WeakMap();
  function newsLayout(p) {
    let L = NLAYOUTS.get(p); if (L) return L;
    const style = NEWS_DEF[p.style] ? p.style : 'modern', D = NEWS_DEF[style], lang = p.lang || (style === '1922' ? 'de' : 'en'), de = lang === 'de';
    const q = { style, lang, masthead: p.masthead != null ? String(p.masthead) : D.masthead, date: p.date != null ? String(p.date) : D.date,
      headline: p.headline ? String(p.headline) : D.headline, sub: p.sub != null ? String(p.sub) : (p.headline ? '' : D.sub), photo: p.photo || D.photo,
      hl: p.hl || ['BTK'], cl: p.classified ? { text: String(p.classified.text || 'REX, IT WILL BE OK'), label: p.classified.label || (de ? 'ANZEIGEN' : 'CLASSIFIEDS') } : null };
    const PW = 900, PH = 1240, key = 'news|' + JSON.stringify(q);
    const hls = []; let adRect = null;
    const paperCol = style === '1922' ? '#cbb98f' : style === '1970s' ? '#d2cab6' : '#d3d2cc', ink = style === '1922' ? '#20190f' : '#141414';
    const hFont = s => style === '1922' ? `700 ${s}px OldStd` : style === '1970s' ? `700 ${s}px Oswald` : `900 ${s}px Playfair`;
    const bodyFont = style === '1922' ? '400 12px OldStd' : '400 12px Playfair';
    const m = MEAS;
    // Schlagzeile einpassen (max. 3 Zeilen)
    const H1 = style === '1970s' ? q.headline.toUpperCase() : q.headline;
    let hs = 118, hl;
    for (; hs >= 40; hs -= 4) { hl = wrapIdx(m, H1, 840, hFont(hs)); if (hl.length <= 3 && hl.length * hs * 1.02 <= 330) break; }
    const yH = 222, hLines = hl.map((r, i) => ({ text: r.text, y: yH + hs * .9 + i * hs * 1.02 }));
    let y = yH + hl.length * hs * 1.02 + 6;
    const sFont = style === '1922' ? '400 30px OldStd' : style === '1970s' ? '500 30px Playfair' : '600 29px Mont';
    const subL = q.sub ? wrapIdx(m, q.sub, 820, sFont).slice(0, 2) : [];
    const sLines = subL.map((r, i) => ({ text: r.text, y: y + 34 + i * 38 }));
    y += subL.length ? subL.length * 38 + 24 : 4;
    const yC = y + 12;
    const img = cached(key, PW, PH, (cx, w, h) => {
      paperTexture(cx, w, h, paperCol, style === '1922' ? 33 : 21, { stains: style === '1922' ? 18 : style === '1970s' ? 6 : 1, edge: style === '1922' ? .5 : style === '1970s' ? .28 : .12 });
      cx.fillStyle = ink; cx.strokeStyle = ink;
      // Kopfleiste
      const ear = de ? (style === '1922' ? 'Morgen-Ausgabe' : 'AUSGABE STADT') : (style === 'modern' ? 'FINAL EDITION' : 'HOME EDITION');
      const price = de ? (style === '1922' ? 'Preis 2 Mark' : '1,20 €') : (style === 'modern' ? '50¢' : '15¢');
      const smallF = style === '1922' ? '400 17px OldStd' : '700 15px SMono';
      txt(cx, ear, 34, 46, smallF, ink, 'left', 'alphabetic', style === '1922' ? 0 : 2); txt(cx, price, w - 34, 46, smallF, ink, 'right', 'alphabetic', style === '1922' ? 0 : 2);
      // Titelkopf
      const mF = s => style === 'modern' ? `900 ${s}px Playfair` : `400 ${s}px Fraktur`;
      const mStr = style === 'modern' ? q.masthead.toUpperCase() : q.masthead;
      const ms = fitSize(cx, mStr, style === 'modern' ? 820 : 800, style === 'modern' ? 84 : 104, mF, style === 'modern' ? 1 : 0);
      txt(cx, mStr, w / 2, 146, mF(ms), ink, 'center', 'alphabetic', style === 'modern' ? 1 : 0);
      cx.fillRect(28, 164, w - 56, 4); cx.fillRect(28, 172, w - 56, 1.5);
      const dF = style === '1922' ? '400 19px OldStd' : '700 15px SMono';
      txt(cx, q.date, 34, 194, dF, ink, 'left', 'alphabetic', style === '1922' ? 0 : 1);
      txt(cx, de ? (style === '1922' ? '75. Jahrgang · Nr. 141' : 'Nr. 24 · 78. Jahrgang') : (style === 'modern' ? 'VOL. 132 · NO. 30' : 'VOL. 102 · NO. 16'), w - 34, 194, dF, ink, 'right', 'alphabetic', style === '1922' ? 0 : 1);
      cx.fillRect(28, 204, w - 56, 1.5); cx.fillRect(28, 208, w - 56, 3);
      // Schlagzeile (rote Wörter)
      hLines.forEach(r => {
        const f = hFont(hs); cx.font = f; const lw = cx.measureText(r.text).width; let x = w / 2 - lw / 2; const sp = cx.measureText(' ').width;
        r.text.split(' ').forEach(wd => { const red = isHl(wd, q.hl); cx.font = f; cx.fillStyle = red ? '#b3121b' : ink; cx.textAlign = 'left'; cx.fillText(wd, x, r.y);
          if (red) hls.push({ text: wd, x, y: r.y, font: f }); x += cx.measureText(wd).width + sp; });
      });
      sLines.forEach(r => txt(cx, r.text, w / 2, r.y, sFont, style === '1922' ? ink : '#2a2a2a', 'center'));
      if (subL.length) { cx.fillRect(w / 2 - 120, y - 6, 240, 1.5); }
      // Spalten
      const colsX = [30, 320, 610], cw = 260, bot = h - 34, hasPh = q.photo !== 'none', phH = Math.min(400, Math.max(220, bot - yC - 300));
      cx.fillStyle = 'rgba(0,0,0,.35)'; for (const x of [305, 595]) cx.fillRect(x, yC, 1, bot - yC);
      const fillCol = style === '1922' ? 'rgba(32,25,15,.78)' : 'rgba(20,20,20,.72)';
      let yL = yC;
      if (hasPh) {
        const pw = 560, ph = phH;
        cx.drawImage(halftone(q.photo, pw, ph, style === '1922' ? 4 : style === '1970s' ? 5 : 4, style === '1922'), 30, yC, pw, ph);
        cx.strokeStyle = 'rgba(0,0,0,.6)'; cx.lineWidth = 1; cx.strokeRect(30.5, yC + .5, pw - 1, ph - 1);
        const cap = de ? (q.photo === 'farm' ? 'Der Einödhof, auf dem die Tat geschah.' : 'Der Tatort am Morgen danach.') : (q.photo === 'floppy' ? 'The computer disk sent to police.' : q.photo === 'silhouette' ? 'Police released a description of the suspect.' : 'Officers outside the home on Thursday.');
        txt(cx, cap, 30, yC + ph + 22, style === '1922' ? '400 15px OldStd' : '600 14px Mont', '#333', 'left');
        yL = yC + ph + 44;
        filler(cx, 30, yL, cw, bot, bodyFont, 15, 3, de, fillCol); filler(cx, 320, yL, cw, bot, bodyFont, 15, 4, de, fillCol);
      } else {
        filler(cx, 30, yC + 14, cw, bot, bodyFont, 15, 3, de, fillCol); filler(cx, 320, yC + 14, cw, bot, bodyFont, 15, 4, de, fillCol);
      }
      // rechte Spalte: Text + Kleinanzeigen
      const clTop = q.cl ? Math.max(yC + 120, bot - 440) : bot;
      const sh2 = style === '1922' ? '700 19px OldStd' : '700 17px Mont';
      txt(cx, de ? 'Aus der Stadt' : 'INSIDE TODAY', 610, yC + 18, sh2, ink, 'left');
      filler(cx, 610, yC + 42, cw, clTop - 14, bodyFont, 15, 5, de, fillCol);
      if (q.cl) {
        cx.fillStyle = ink; cx.fillRect(610, clTop, cw, 30); txt(cx, q.cl.label, 610 + cw / 2, clTop + 22, style === '1922' ? '700 18px OldStd' : '700 16px SMono', paperCol, 'center', 'alphabetic', 3);
        const ads = de ? ['ZU VERKAUFEN', 'VERLOREN', 'STELLEN', 'PERSÖNLICHES', 'ZU VERMIETEN'] : ['FOR SALE', 'LOST & FOUND', 'HELP WANTED', 'PERSONALS', 'FOR RENT'];
        let ya = clTop + 52; const adF = style === '1922' ? '700 13px OldStd' : '700 12px Mont';
        ads.forEach((a, i) => {
          if (ya > bot - 30) return;
          txt(cx, a, 610, ya, adF, ink, 'left', 'alphabetic', 1); ya += 16;
          if (i === 3) {
            const tf = style === '1922' ? '700 16px OldStd' : '700 15px SMono', rows = wrapIdx(m, q.cl.text, cw - 16, tf);
            const ah = rows.length * 19 + 14; adRect = { x: 606, y: ya - 6, w: cw + 8, h: ah };
            cx.strokeStyle = ink; cx.lineWidth = 1.5; cx.strokeRect(606.5, ya - 5.5, cw + 7, ah);
            rows.forEach((r, k) => txt(cx, r.text, 614, ya + 13 + k * 19, tf, ink, 'left')); ya += ah + 6;
            filler(cx, 610, ya + 8, cw, ya + 40, bodyFont, 14, 20 + i, de, fillCol); ya += 44;
          } else { filler(cx, 610, ya + 4, cw, ya + 44, bodyFont, 14, 10 + i, de, fillCol); ya += 52; }
          cx.fillStyle = 'rgba(0,0,0,.4)'; cx.fillRect(610, ya - 12, cw, 1);
        });
      }
      // Seitenzahl
      txt(cx, de ? 'Seite 1' : 'A1', w / 2, h - 12, '700 13px SMono', '#444', 'center');
    });
    if (!adRect && q.cl) { // Cache war schon vorhanden: Positionen erneut berechnen (ohne Zeichnen)
      const bot = PH - 34, clTop = Math.max(yC + 120, bot - 440), tf = style === '1922' ? '700 16px OldStd' : '700 15px SMono';
      let ya = clTop + 52; for (let i = 0; i < 3; i++) ya += 16 + 52; ya += 16;
      const rows = wrapIdx(m, q.cl.text, 260 - 16, tf); adRect = { x: 606, y: ya - 6, w: 268, h: rows.length * 19 + 14 };
    }
    if (!hls.length) { hLines.forEach(r => { const f = hFont(hs); m.font = f; const lw = m.measureText(r.text).width; let x = PW / 2 - lw / 2; const sp = m.measureText(' ').width;
      r.text.split(' ').forEach(wd => { if (isHl(wd, q.hl)) hls.push({ text: wd, x, y: r.y, font: f }); m.font = f; x += m.measureText(wd).width + sp; }); }); }
    L = { q, PW, PH, img, hls, adRect, style, de, paperCol, ink };
    NLAYOUTS.set(p, L); return L;
  }
  // Umbruchbreite für die Lupe: kurze Anzeigen einzeilig, lange eher kompakt (damit der Kreis passt)
  function rowsW(s, tf) { const w = tw(MEAS, s, tf); return w <= 660 ? 660 : w <= 1100 ? Math.max(380, w / 2 + 40) : 560; }
  SCENES.newspaper = (c, lt, b, gt) => {
    const p = b.p || EMPTY, L = newsLayout(p), { PW, PH } = L;
    // Untergrund
    c.fillStyle = '#030304'; c.fillRect(-200, -200, W + 400, H + 400);
    c.save(); c.globalAlpha = .55; c.drawImage(deskLayer(), -200, -200); c.restore();
    const at = num(p.at, 0), spin = p.spin !== false;
    const k = spin ? prog(lt, at, at + .75) : 1;
    if (spin && lt < at) { motes(c, gt, 20, 31, -100, 200, W + 200, 1500, 'rgba(200,205,220,1)', .2, 2.2); lampShade(c, 540, 860, 300, 1300, .85); return; }
    const e = E.out(k), land = spin ? lt - (at + .75) : 9;
    const cx0 = 540, cy0 = num(p.y, 905), tilt = num(p.tilt, -.025);
    const bump = land > 0 ? Math.exp(-land * 9) * Math.sin(land * 40) * .006 : 0;
    const push = 1 + .035 * E.inOut(clamp((lt - at - .75) / 8));
    const cl = p.classified ? { at: 2.2, ...p.classified } : null, clAt = cl ? num(cl.at, 2.2) : 1e9;
    const sc0 = .9 * push * (lerp(.04, 1, e) + bump);
    const rot = tilt + (1 - e) * -Math.PI * 4 + noise(gt * .3, 41) * .004;
    const drawPage = (r, s, a) => {
      c.save(); c.translate(cx0 + noise(gt * .3, 42) * 4, cy0 + noise(gt * .25, 43) * 4); c.rotate(r); c.scale(s, s); c.globalAlpha = a;
      glow(c, 'rgba(0,0,0,.9)', 60); c.shadowOffsetY = 24; c.fillStyle = '#000'; c.fillRect(-PW / 2, -PH / 2, PW, PH); noGlow(c); c.shadowOffsetY = 0;
      c.drawImage(L.img, -PW / 2, -PH / 2);
      // leichte Wölbung
      const g = c.createLinearGradient(-PW / 2, 0, PW / 2, 0); g.addColorStop(0, 'rgba(0,0,0,.22)'); g.addColorStop(.15, 'rgba(0,0,0,0)'); g.addColorStop(.85, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.25)');
      c.fillStyle = g; c.fillRect(-PW / 2, -PH / 2, PW, PH);
      if (a >= 1) { // rote Schlagzeilen-Wörter glühen
        const pu = .55 + .45 * Math.sin(gt * 2.2);
        for (const h of L.hls) { c.save(); c.globalAlpha = .55 * pu * clamp(land * 2 + .2); glow(c, 'rgba(255,32,32,1)', 28); txt(c, h.text, -PW / 2 + h.x, -PH / 2 + h.y, h.font, '#d0141d', 'left'); c.restore(); }
      }
      c.restore();
    };
    if (k < 1) for (let g = 2; g >= 1; g--) drawPage(tilt + (1 - E.out(clamp(k - g * .05))) * -Math.PI * 4, .9 * lerp(.04, 1, E.out(clamp(k - g * .05))), .25);
    drawPage(rot, sc0, 1);
    // Landungs-Blitz
    if (spin && land > 0 && land < .25) { c.fillStyle = `rgba(255,255,255,${.25 * (1 - land / .25)})`; c.fillRect(-200, -200, W + 400, H + 400); }
    // Licht
    lampShade(c, 520, 760, 380, 1300, .7 + .05 * noise(gt * 1.1, 44));
    c.save(); c.fillStyle = 'rgba(20,30,55,.12)'; c.fillRect(-200, -200, W + 400, H + 400); c.restore();
    // Kleinanzeige: Zoom-Kasten + roter Kreis
    if (cl && L.adRect && lt >= clAt) {
      const ka = E.inOut(prog(lt, clAt, clAt + .7)), ar = L.adRect;
      const toS = (x, y) => { const px = (x - PW / 2) * sc0, py = (y - PH / 2) * sc0, cs = Math.cos(rot), sn = Math.sin(rot); return [cx0 + px * cs - py * sn, cy0 + px * sn + py * cs]; };
      c.save(); c.fillStyle = `rgba(0,0,0,${.6 * ka})`; c.fillRect(-200, -200, W + 400, H + 400); c.restore();
      const corners = [toS(ar.x, ar.y), toS(ar.x + ar.w, ar.y), toS(ar.x + ar.w, ar.y + ar.h), toS(ar.x, ar.y + ar.h)];
      c.save(); c.strokeStyle = '#ff2b2b'; c.lineWidth = 3; glow(c, 'rgba(255,32,32,1)', 12); c.beginPath(); corners.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.closePath(); c.stroke(); c.restore();
      // Kasten-Inhalt
      const lab = L.q.cl.label, bw = 760;
      let tfs = L.style === 'modern' ? 46 : 50, tf, rows;
      for (; tfs >= 28; tfs -= 2) { tf = L.style === 'modern' ? `700 ${tfs}px SMono` : `700 ${tfs}px OldStd`; rows = wrapIdx(MEAS, L.q.cl.text, rowsW(L.q.cl.text, tf), tf); if (rows.length <= 4) break; }
      rows = rows.slice(0, 5);
      const lh = tfs * 1.3, blockH = rows.length * lh, halfW = Math.max(...rows.map(r => tw(MEAS, r.text, tf))) / 2;
      const multi = rows.length > 1, rw = Math.min(bw / 2 - 14, multi ? halfW * 1.22 + 26 : halfW + 52), rh = multi ? blockH / 2 * 1.3 + 22 : blockH / 2 + 30;
      const bh = 64 + 2 * rh + 56, ccy = 64 + 28 + rh;
      const bx1 = 160, by1 = clamp(num(cl.y, 980) - bh / 2, 330, 1380 - bh);
      const sx = Math.min(...corners.map(q => q[0])), sy = Math.min(...corners.map(q => q[1])), sw = Math.max(...corners.map(q => q[0])) - sx, shh = Math.max(...corners.map(q => q[1])) - sy;
      const bx = lerp(sx, bx1, ka), by = lerp(sy, by1, ka), bwk = lerp(sw, bw, ka), bhk = lerp(shh, bh, ka);
      c.save(); c.strokeStyle = 'rgba(255,60,60,.55)'; c.lineWidth = 2; c.beginPath();
      c.moveTo(corners[0][0], corners[0][1]); c.lineTo(bx, by); c.moveTo(corners[1][0], corners[1][1]); c.lineTo(bx + bwk, by); c.stroke(); c.restore();
      c.save(); glow(c, 'rgba(0,0,0,.9)', 50); c.fillStyle = L.paperCol; c.fillRect(bx, by, bwk, bhk); noGlow(c);
      c.beginPath(); c.rect(bx, by, bwk, bhk); c.clip(); c.translate(bx, by); c.scale(bwk / bw, bhk / bh);
      c.drawImage(cached('clpaper|' + L.style, bw, 900, (cx, w, h) => paperTexture(cx, w, h, L.paperCol, 71, { stains: 2, edge: .2 })), 0, 0);
      c.fillStyle = L.ink; c.fillRect(0, 0, bw, 64); txt(c, lab, bw / 2, 45, L.style === '1922' ? '700 36px OldStd' : '700 32px SMono', L.paperCol, 'center', 'alphabetic', 6);
      c.fillStyle = 'rgba(0,0,0,.2)'; for (let i = 0; i < 2; i++) c.fillRect(40, bh - 26 + i * 12 - 6, i ? 420 : 680, 6);
      rows.forEach((r, i) => txt(c, r.text, bw / 2, ccy - blockH / 2 + (i + .5) * lh + tfs * .34, tf, L.ink, 'center'));
      // roter Markerkreis
      const kc = E.inOut(prog(lt, clAt + .75, clAt + 1.35));
      if (kc > 0) {
        c.strokeStyle = '#e01a22'; c.lineWidth = 8; c.lineCap = 'round'; glow(c, 'rgba(255,32,32,.9)', 18);
        const ccx = bw / 2;
        c.beginPath(); const n = 64, tot = 1.12 * kc;
        for (let i = 0; i <= n * tot; i++) { const a = -2.3 + i / n * Math.PI * 2, wob = 1 + .05 * Math.sin(i * .35) + .03 * (i / n); const x = ccx + Math.cos(a) * rw * wob, y = ccy + Math.sin(a) * rh * wob; i ? c.lineTo(x, y) : c.moveTo(x, y); }
        c.stroke(); noGlow(c);
      }
      c.restore();
    }
    motes(c, gt, 26, 33, -100, 200, W + 200, 1500, 'rgba(220,222,230,1)', .25, 2.2);
  };

  // ---------- 5) memorial ----------
  const MEM_DEF = [{ name: 'Jane Doe', sub: 'UNIDENTIFIED · 1974' }, { name: 'John Doe', sub: 'UNIDENTIFIED · 1977' }, { name: 'Mary Roe', sub: 'AGE 24' }, { name: 'Richard Roe', sub: 'AGE 9' }];
  SCENES.memorial = (c, lt, b, gt) => {
    const p = b.p || EMPTY;
    bgFill(c, '#0b0b0e', '#050505');
    // Kerzenschein unten
    const fl = .82 + .1 * noise(gt * 2.3, 51) + .06 * noise(gt * 7, 52) + .05 * Math.sin(gt * 1.1);
    spot(c, 540 + noise(gt * .8, 53) * 20, 1760, 1050, 'rgba(255,170,110,A)', .17 * fl);
    spot(c, 540 + noise(gt * 1.3, 54) * 14, 1640, 520, 'rgba(255,190,140,A)', .14 * fl);
    spot(c, 540, 700, 800, 'rgba(150,160,185,A)', .045);
    motes(c, gt, 34, 55, -100, 500, W + 200, 1500, 'rgba(255,196,150,1)', .45, 2.4, 38);
    const names = (Array.isArray(p.names) && p.names.length ? p.names : MEM_DEF).slice(0, 12).map(n => typeof n === 'string' ? { name: n } : (n || { name: '' }));
    const at = num(p.at, .3), gap = num(p.gap, .45), n = names.length;
    // Titel
    const title = p.title != null ? String(p.title) : 'REMEMBER THEIR NAMES';
    const ta = E.out(prog(lt, 0, .8));
    if (title) {
      const tfs = fitSize(c, title, 700, 34, s => `600 ${s}px Mont`, 12);
      c.save(); c.globalAlpha = ta;
      txt(c, title, 546, 445, `600 ${tfs}px Mont`, '#c3c5cf', 'center', 'alphabetic', 12);
      const tW = tw(c, title, `600 ${tfs}px Mont`, 12), lw = Math.min(70, (800 - tW) / 2 - 30) * ta;
      c.fillStyle = 'rgba(200,202,212,.35)'; if (lw > 4) { c.fillRect(540 - tW / 2 - 24 - lw, 433, lw, 1.5); c.fillRect(540 + tW / 2 + 24, 433, lw, 1.5); }
      c.fillStyle = 'rgba(220,222,230,.55)'; c.fillRect(540 - 30 * ta, 477, 60 * ta, 2); c.restore(); // Gedenken: kein Rot
    }
    // Namen
    const two = n > 8, rows = two ? Math.ceil(n / 2) : n, top = title ? 545 : 380, bot = 1350;
    const eh = Math.min(two ? 135 : 160, (bot - top) / Math.max(1, rows)), colW = two ? 330 : 780;
    // gemeinsame Größe aus dem Median der Breiten, Ausreißer werden einzeln verkleinert
    let ns = Math.min(two ? 58 : 80, Math.floor(eh * .5));
    const fits = names.map(q => fitSize(c, String(q.name || ''), colW, ns, s => `600 ${s}px Playfair`, 1)).sort((a, b) => a - b);
    ns = fits[Math.floor((fits.length - 1) / 2)] || ns;
    const ss = clamp(Math.round(ns * .5), 24, 30);
    const y0 = top + ((bot - top) - rows * eh) / 2;
    names.forEach((q, i) => {
      const ti = at + i * gap; if (lt < ti) return;
      const col = two ? Math.floor(i / rows) : 0, row = two ? i % rows : i;
      const x = two ? (col ? 740 : 340) : 540, y = y0 + row * eh + eh * .52;
      const k = E.out(prog(lt, ti, ti + .9)), hk = Math.exp(-Math.max(0, lt - ti - .2) * 2.2);
      c.save(); c.globalAlpha = k * (.93 + .07 * Math.sin(gt * 1.4 + i));
      if (hk > .03) glow(c, `rgba(255,200,160,${.55 * hk})`, 26);
      const nm = String(q.name || ''), nsi = fitSize(c, nm, colW, ns, s => `600 ${s}px Playfair`, 1);
      txt(c, nm, x, y + (1 - k) * 26, `600 ${nsi}px Playfair`, '#f1efec', 'center', 'alphabetic', lerp(7, 1, k) * nsi / ns); noGlow(c);
      if (q.sub != null && q.sub !== '') { const sk = E.out(prog(lt, ti + .25, ti + 1)); c.globalAlpha = sk * .95;
        txt(c, String(q.sub).toUpperCase(), x, y + ss * 1.55 + (1 - sk) * 12, `600 ${ss}px Mont`, '#b4b6c0', 'center', 'alphabetic', 4); }
      c.restore();
    });
  };

  // ---------- 6) id_badge ----------
  function idPhoto(c, x, y, w, h, glasses, red) {
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#9aa7b8'); g.addColorStop(1, '#5c6878'); c.fillStyle = g; c.fillRect(x, y, w, h);
    spot(c, x + w * .5, y + h * .35, w * .7, 'rgba(255,255,255,A)', .18);
    const cx = x + w / 2, hy = y + h * .4, hr = w * .2;
    c.fillStyle = '#14171c';
    c.beginPath(); c.ellipse(cx, y + h * 1.06, w * .48, h * .36, 0, Math.PI, 0); c.fill();
    c.fillRect(cx - hr * .5, hy + hr * .8, hr, h * .3);
    c.beginPath(); c.ellipse(cx, hy, hr, hr * 1.25, 0, 0, 7); c.fill();
    c.beginPath(); c.ellipse(cx - hr * .98, hy + hr * .15, hr * .16, hr * .28, 0, 0, 7); c.ellipse(cx + hr * .98, hy + hr * .15, hr * .16, hr * .28, 0, 0, 7); c.fill();
    if (glasses) {
      c.strokeStyle = red ? 'rgba(255,90,90,.85)' : 'rgba(205,212,222,.8)'; c.lineWidth = Math.max(2, w * .012);
      const gy = hy + hr * .05, gw = hr * .72, gh = hr * .48;
      for (const s of [-1, 1]) { rr(c, cx + s * hr * .45 - gw / 2, gy - gh / 2, gw, gh, gh * .3); c.stroke(); }
      c.beginPath(); c.moveTo(cx - hr * .09, gy - gh * .1); c.quadraticCurveTo(cx, gy - gh * .3, cx + hr * .09, gy - gh * .1); c.stroke();
      c.beginPath(); c.moveTo(cx - hr * .81, gy - gh * .2); c.lineTo(cx - hr * .98, gy - gh * .1); c.moveTo(cx + hr * .81, gy - gh * .2); c.lineTo(cx + hr * .98, gy - gh * .1); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(cx - hr * .62, gy - gh * .3, gw * .25, 2); c.fillRect(cx + hr * .28, gy - gh * .3, gw * .25, 2);
    }
    c.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < h; i += 3) c.fillRect(x, y + i, w, 1);
    c.restore();
  }
  function barcode(c, x, y, w, h, seed, col) { c.fillStyle = col; let xx = x; let i = 0; while (xx < x + w) { const bw = 1 + Math.floor(rnd(i, seed) * 4); if (i % 2 === 0) c.fillRect(xx, y, bw, h); xx += bw + 1; i++; } }
  function idFace(cx, kind, q, w, h) {
    const band = q.red ? '#7d0f14' : '#1e3248', ink = '#16181d';
    rr(cx, 0, 0, w, h, kind === 'card' ? 28 : 30); cx.fillStyle = '#e3e3df'; cx.fill(); cx.save(); cx.clip();
    paperTexture(cx, w, h, '#e1e1dc', 91, { stains: 0, edge: .1 });
    const bh = kind === 'card' ? 118 : 165;
    const g = cx.createLinearGradient(0, 0, w, bh); g.addColorStop(0, band); g.addColorStop(1, q.red ? '#4a080c' : '#121e2d'); cx.fillStyle = g; cx.fillRect(0, 0, w, bh);
    cx.fillStyle = 'rgba(255,255,255,.06)'; for (let i = -h; i < w; i += 26) { cx.beginPath(); cx.moveTo(i, 0); cx.lineTo(i + bh, bh); cx.lineTo(i + bh + 8, bh); cx.lineTo(i + 8, 0); cx.fill(); }
    // Siegel
    const sx = kind === 'card' ? 74 : w / 2, sy = kind === 'card' ? bh / 2 : 66, sr = kind === 'card' ? 40 : 29;
    cx.strokeStyle = 'rgba(255,255,255,.75)'; cx.lineWidth = 3; cx.beginPath(); cx.arc(sx, sy, sr, 0, 7); cx.stroke(); cx.lineWidth = 1.5; cx.beginPath(); cx.arc(sx, sy, sr - 7, 0, 7); cx.stroke();
    cx.fillStyle = 'rgba(255,255,255,.75)'; cx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? sr * .25 : sr * .55; cx.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); } cx.closePath(); cx.fill();
    const org = String(q.org).toUpperCase();
    // bis zu zwei Zeilen, sonst einpassen
    const lines2 = (s, maxW, size, minS, fontFn, ls) => {
      if (tw(cx, s, fontFn(size), ls) <= maxW) return { rows: [s], fs: size };
      for (let f = size; f >= minS; f -= 2) { const r = wrapIdx(cx, s, maxW, fontFn(f)).map(x => x.text); if (r.length <= 2 && r.every(x => tw(cx, x, fontFn(f), ls) <= maxW)) return { rows: r, fs: f }; }
      const r = wrapIdx(cx, s, maxW, fontFn(minS)).map(x => x.text).slice(0, 2); return { rows: r, fs: Math.min(...r.map(x => fitSize(cx, x, maxW, minS, fontFn, ls, 10))) };
    };
    const mF = s => `800 ${s}px Mont`;
    if (kind === 'card') { const o = lines2(org, w - 190, 40, 24, mF, 3); o.rows.forEach((r, i) => txt(cx, r, 140, bh / 2 + o.fs * .36 + (i - (o.rows.length - 1) / 2) * o.fs * 1.08, mF(o.fs), '#fff', 'left', 'alphabetic', 3)); }
    else { const o = lines2(org, w - 60, 34, 22, mF, 3), yb = o.rows.length > 1 ? 150 : 142; o.rows.forEach((r, i) => txt(cx, r, w / 2, yb - (o.rows.length - 1 - i) * o.fs * 1.05, mF(o.fs), '#fff', 'center', 'alphabetic', 3)); }
    // Foto + Text
    const name = String(q.name).toUpperCase(), title = String(q.title).toUpperCase();
    if (kind === 'card') {
      const px = 40, py = bh + 34, pw = 220, ph = h - bh - 74;
      if (q.photo !== 'none') { idPhoto(cx, px, py, pw, ph, q.glasses, q.red); cx.strokeStyle = 'rgba(0,0,0,.35)'; cx.lineWidth = 2; cx.strokeRect(px, py, pw, ph); }
      const tx = q.photo !== 'none' ? px + pw + 36 : 50, tw0 = w - tx - 40;
      txt(cx, 'NAME', tx, py + 22, '700 18px SMono', '#6a6d76', 'left', 'alphabetic', 3);
      const L = wrapIdx(cx, name, tw0, `800 48px Mont`).slice(0, 2); let ns = 48; if (L.length > 1 || tw(cx, name, '800 48px Mont') > tw0) ns = fitSize(cx, L[0].text, tw0, 48, s => `800 ${s}px Mont`, 1);
      L.forEach((r, i) => txt(cx, r.text, tx, py + 70 + i * ns * 1.05, `800 ${ns}px Mont`, ink, 'left', 'alphabetic', 1));
      const yT = py + 70 + (L.length - 1) * ns * 1.05 + 58;
      if (String(title || '').trim()) txt(cx, 'TITLE', tx, yT - 30, '700 18px SMono', '#6a6d76', 'left', 'alphabetic', 3);
      txt(cx, title, tx, yT, `700 ${fitSize(cx, title, tw0, 28, s => `700 ${s}px SMono`, 2)}px SMono`, q.red ? '#9c121a' : '#24324a', 'left', 'alphabetic', 2);
      txt(cx, q.idno, tx, h - 52, '700 22px SMono', '#3a3d45', 'left', 'alphabetic', 3);
      barcode(cx, w - 230, h - 76, 190, 34, 7, '#22252b');
    } else {
      const N = lines2(name, w - 70, 54, 38, mF, 1), T = lines2(title, w - 80, 28, 20, s => `700 ${s}px SMono`, 3);
      const nH = (N.rows.length - 1) * N.fs * 1.04, tH = (T.rows.length - 1) * T.fs * 1.25;
      const pw = 300, ph = 350 - nH - tH, px = (w - pw) / 2, py = bh + 38;
      if (q.photo !== 'none') { idPhoto(cx, px, py, pw, ph, q.glasses, q.red); cx.strokeStyle = 'rgba(0,0,0,.35)'; cx.lineWidth = 2; cx.strokeRect(px, py, pw, ph); }
      else { // Wappen statt Foto
        const ex = w / 2, ey = py + ph / 2, er = Math.min(pw, ph) * .4, col = q.red ? 'rgba(125,15,20,' : 'rgba(30,50,72,';
        cx.strokeStyle = col + '.35)'; cx.lineWidth = 8; cx.beginPath(); cx.arc(ex, ey, er, 0, 7); cx.stroke(); cx.lineWidth = 3; cx.beginPath(); cx.arc(ex, ey, er - 18, 0, 7); cx.stroke();
        cx.fillStyle = col + '.28)'; cx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? er * .26 : er * .6; cx.lineTo(ex + Math.cos(a) * r, ey + Math.sin(a) * r); } cx.closePath(); cx.fill();
      }
      const yN = py + ph + 78;
      N.rows.forEach((r, i) => txt(cx, r, w / 2, yN + i * N.fs * 1.04, mF(N.fs), ink, 'center', 'alphabetic', 1));
      const yB = yN + nH + 26, bH = 52 + tH;
      cx.fillStyle = q.red ? '#7d0f14' : '#1e3248'; cx.fillRect(0, yB, w, bH);
      T.rows.forEach((r, i) => txt(cx, r, w / 2, yB + 26 + T.fs * .36 + i * T.fs * 1.25, `700 ${T.fs}px SMono`, '#fff', 'center', 'alphabetic', 3));
      barcode(cx, 60, h - 92, w - 120, 42, 11, '#22252b');
      txt(cx, q.idno, w / 2, h - 30, '700 20px SMono', '#3a3d45', 'center', 'alphabetic', 4);
    }
    cx.restore();
  }
  function idBack(cx, kind, q, w, h) {
    rr(cx, 0, 0, w, h, 30); cx.fillStyle = '#d9d9d4'; cx.fill(); cx.save(); cx.clip();
    paperTexture(cx, w, h, '#d8d8d2', 97, { stains: 0, edge: .1 });
    cx.fillStyle = '#16171b'; cx.fillRect(0, kind === 'card' ? 50 : 70, w, kind === 'card' ? 70 : 80);
    const lines = (q.back && Array.isArray(q.back.lines) && q.back.lines.length) ? q.back.lines : ['PROPERTY OF ' + String(q.org).toUpperCase(), 'IF FOUND, PLEASE RETURN', 'NOT TRANSFERABLE'];
    let y = kind === 'card' ? 180 : 220; const fsz = kind === 'card' ? 26 : 26;
    lines.slice(0, 9).forEach(l => { const s = String(l), L = wrapIdx(cx, s, w - 90, `700 ${fsz}px SMono`);
      L.forEach(r => { txt(cx, r.text, w / 2, y, `700 ${fsz}px SMono`, '#24262c', 'center', 'alphabetic', 1); y += fsz * 1.45; }); y += 8; });
    const sy = h - (kind === 'card' ? 70 : 150);
    cx.fillStyle = '#f2f2ee'; cx.fillRect(50, sy - 60, w - 100, 70); cx.strokeStyle = 'rgba(0,0,0,.3)'; cx.lineWidth = 1.5; cx.strokeRect(50, sy - 60, w - 100, 70);
    txt(cx, 'SIGNATURE', 60, sy + 30, '700 16px SMono', '#6a6d76', 'left', 'alphabetic', 3);
    const nw = String(q.name).trim().split(/\s+/), cap = s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    const sig = nw.length > 1 ? nw[0].charAt(0).toUpperCase() + '. ' + cap(nw[nw.length - 1]) : cap(nw[0] || '');
    txt(cx, sig, 80, sy - 12, `700 ${fitSize(cx, sig, w - 180, 50, s => `700 ${s}px Caveat`)}px Caveat`, '#1d2440', 'left');
    if (kind !== 'card') barcode(cx, 60, h - 70, w - 120, 34, 17, '#2a2c32');
    cx.restore();
  }
  SCENES.id_badge = (c, lt, b, gt) => {
    const p = b.p || EMPTY;
    const kind = ['badge', 'card', 'nameplate'].includes(p.kind) ? p.kind : 'badge';
    const q = { org: p.org != null ? p.org : 'CITY OF PARK CITY', title: p.title != null ? p.title : 'COMPLIANCE OFFICER', name: p.name != null ? p.name : 'DENNIS RADER',
      photo: p.photo || 'silhouette', glasses: p.glasses !== false, red: !!p.red, idno: p.idno || 'ID 0447-1991', back: p.back };
    const at = num(p.at, .2);
    // Untergrund
    if (kind === 'nameplate') c.drawImage(deskLayer(), -200 + noise(gt * .05, 61) * 8, -200); else c.drawImage(fabricLayer(), -200 + noise(gt * .05, 62) * 8, -200 + noise(gt * .04, 63) * 8);
    const lx = 420 + noise(gt * .15, 64) * 40, ly = 640;
    spot(c, lx, ly, 900, 'rgba(170,180,205,A)', .1 + .02 * noise(gt * 1.2, 65));
    if (q.red) spot(c, 540, 900, 800, RED, .08 + .03 * Math.sin(gt * 1.6));
    const stamp = p.stamp ? { text: 'CHURCH COUNCIL PRESIDENT', ...p.stamp, at: num(p.stamp.at, at + 1.6) } : null, sh = stampShake(stamp, lt);
    const kIn = prog(lt, at, at + .8), e = E.back(kIn), eo = E.out(kIn);
    if (lt >= at) {
      const tilt = num(p.tilt, kind === 'nameplate' ? 0 : -.035) + noise(gt * .3, 66) * .005;
      const fk = p.flip != null ? E.inOut(prog(lt, p.flip, p.flip + .75)) : 0, ang = fk * Math.PI, sx = Math.cos(ang), back = sx < 0, lift = 1 + .07 * Math.sin(ang);
      const cy = num(p.y, kind === 'card' ? 850 : kind === 'nameplate' ? 860 : 880);
      c.save(); c.translate(540 + sh * 8 * Math.sin(lt * 60), cy + (1 - e) * 1100 + noise(gt * .35, 67) * 4); c.rotate(tilt + (1 - eo) * .35);
      c.scale(lift * (1 + sh * .015), lift * (1 + sh * .015));
      if (kind === 'nameplate') {
        const w = 840, h = 230;
        // Sockel
        c.save(); glow(c, 'rgba(0,0,0,.9)', 50); c.shadowOffsetY = 30; c.fillStyle = '#141416'; c.beginPath(); c.moveTo(-w / 2 - 30, h / 2 + 60); c.lineTo(w / 2 + 30, h / 2 + 60); c.lineTo(w / 2 + 10, h / 2 - 10); c.lineTo(-w / 2 - 10, h / 2 - 10); c.closePath(); c.fill(); c.restore();
        c.fillStyle = '#1e1c1b'; c.fillRect(-w / 2 - 22, h / 2 + 2, w + 44, 46);
        const img = cached('plate|' + JSON.stringify(q), w, h, (cx) => {
          const g = cx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#b9b4a6'); g.addColorStop(.5, '#8f8a7e'); g.addColorStop(1, '#6e6a61'); cx.fillStyle = g; rr(cx, 0, 0, w, h, 10); cx.fill();
          for (let i = 0; i < 500; i++) { cx.fillStyle = `rgba(${rnd(i, 71) > .5 ? '255,255,255' : '0,0,0'},${.03 + rnd(i, 72) * .05})`; cx.fillRect(0, rnd(i, 73) * h, w, 1); }
          cx.strokeStyle = 'rgba(40,36,30,.8)'; cx.lineWidth = 3; rr(cx, 14, 14, w - 28, h - 28, 6); cx.stroke();
          const name = String(q.name).toUpperCase(), ns = fitSize(cx, name, w - 90, 78, s => `800 ${s}px Mont`, 3);
          txt(cx, name, w / 2 + 2, 118 + 2, `800 ${ns}px Mont`, 'rgba(255,255,255,.35)', 'center', 'alphabetic', 3);
          txt(cx, name, w / 2, 118, `800 ${ns}px Mont`, '#1c1a17', 'center', 'alphabetic', 3);
          const t = String(q.title).toUpperCase(), ts = fitSize(cx, t, w - 120, 30, s => `700 ${s}px SMono`, 6);
          txt(cx, t, w / 2, 176, `700 ${ts}px SMono`, q.red ? '#7a1015' : '#2b2822', 'center', 'alphabetic', 6);
        });
        c.save(); glow(c, 'rgba(0,0,0,.7)', 24); c.drawImage(img, -w / 2, -h / 2); c.restore();
        // Glanz
        c.save(); rr(c, -w / 2, -h / 2, w, h, 10); c.clip(); c.globalCompositeOperation = 'screen';
        const sp = ((lt - at - .3) / 4) % 1, gx = lerp(-w, w, sp < 0 ? 0 : sp);
        const sg = c.createLinearGradient(gx - 160, 0, gx + 160, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,250,240,.28)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = sg; c.fillRect(-w / 2, -h / 2, w, h); c.restore();
        if (stamp) rubberStamp(c, stamp, num(stamp.x, 170), num(stamp.y, -150), num(stamp.rot, -.12), lt, 'rgba(200,24,30,1)', num(stamp.w, 520));
      } else {
        const w = kind === 'card' ? 800 : 540, h = kind === 'card' ? 500 : 820;
        // Lanyard
        if (kind === 'badge') {
          c.save(); c.scale(Math.abs(sx) < .02 ? .02 : Math.abs(sx), 1);
          c.save(); glow(c, 'rgba(0,0,0,.7)', 24); c.fillStyle = q.red ? '#5a0d11' : '#22324a'; c.fillRect(-34, -h / 2 - 1400, 68, 1400 - 46); c.restore();
          c.fillStyle = 'rgba(255,255,255,.14)'; c.fillRect(-30, -h / 2 - 1400, 2, 1354); c.fillRect(28, -h / 2 - 1400, 2, 1354);
          for (let i = 0; i < 18; i++) txt(c, '·  ' + String(q.org).split(' ').pop().toUpperCase() + '  ·', 0, -h / 2 - 90 - i * 140, '700 18px SMono', 'rgba(255,255,255,.22)', 'center');
          c.fillStyle = '#8d9099'; rr(c, -26, -h / 2 - 70, 52, 60, 10); c.fill(); c.fillStyle = '#5a5d66'; rr(c, -16, -h / 2 - 58, 32, 24, 6); c.fill();
          c.strokeStyle = '#a0a3ac'; c.lineWidth = 7; c.beginPath(); c.arc(0, -h / 2 - 8, 16, Math.PI, 0); c.stroke();
          c.restore();
        }
        c.save(); c.scale(Math.max(.02, Math.abs(sx)), 1);
        // Laminat-Rand (durchsichtig)
        c.save(); glow(c, 'rgba(0,0,0,.6)', 30); c.shadowOffsetX = 10; c.shadowOffsetY = 14;
        rr(c, -w / 2 - 10, -h / 2 - 10, w + 20, h + 20, 36); c.fillStyle = 'rgba(190,200,215,.13)'; c.fill(); c.restore();
        rr(c, -w / 2 - 10, -h / 2 - 10, w + 20, h + 20, 36); c.lineWidth = 2; c.strokeStyle = q.red ? 'rgba(255,60,60,.6)' : 'rgba(220,228,240,.35)'; c.stroke();
        if (q.red) { c.save(); glow(c, 'rgba(255,32,32,.8)', 24); c.stroke(); c.restore(); }
        const face = back ? cached('idb|' + kind + '|' + JSON.stringify(q), w, h, (cx) => idBack(cx, kind, q, w, h)) : cached('idf|' + kind + '|' + JSON.stringify(q), w, h, (cx) => idFace(cx, kind, q, w, h));
        c.save(); glow(c, 'rgba(0,0,0,.85)', 46); c.shadowOffsetX = 18 + fk * 20; c.shadowOffsetY = 26 + Math.sin(ang) * 30;
        c.drawImage(face, -w / 2, -h / 2); c.restore();
        if (kind === 'badge') { c.fillStyle = 'rgba(10,12,16,.92)'; rr(c, -48, -h / 2 + 18, 96, 20, 10); c.fill(); }
        if (stamp && !back) rubberStamp(c, stamp, num(stamp.x, kind === 'card' ? 150 : 40), num(stamp.y, kind === 'card' ? 120 : 150), num(stamp.rot, -.16), lt, 'rgba(200,24,30,1)', num(stamp.w, kind === 'card' ? 520 : 460));
        // Glanzstreifen über das Laminat
        c.save(); rr(c, -w / 2 - 10, -h / 2 - 10, w + 20, h + 20, 36); c.clip(); c.globalCompositeOperation = 'screen';
        const per = 3.6, u = lt - at - .45, sp = u < 0 ? -1 : (u % per) / 1.1;
        if (sp >= 0 && sp <= 1) { const gx = lerp(-w * 1.1, w * 1.1, E.inOut(sp)); c.translate(gx, 0); c.rotate(.5);
          const sg = c.createLinearGradient(-110, 0, 110, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,255,255,.32)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = sg; c.fillRect(-110, -h * 1.5, 220, h * 3); }
        c.restore();
        c.save(); rr(c, -w / 2 - 10, -h / 2 - 10, w + 20, h + 20, 36); c.clip(); const lg = c.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); lg.addColorStop(0, 'rgba(255,255,255,.10)'); lg.addColorStop(.45, 'rgba(255,255,255,0)'); lg.addColorStop(1, 'rgba(0,0,0,.18)'); c.fillStyle = lg; c.fillRect(-w, -h, 2 * w, 2 * h); c.restore();
        c.restore();
      }
      c.restore();
    }
    lampShade(c, lx + 120, ly + 260, 330, 1300, .74);
    c.save(); c.fillStyle = 'rgba(20,30,55,.12)'; c.fillRect(-200, -200, W + 400, H + 400); c.restore();
    motes(c, gt, 28, 69, -100, 200, W + 200, 1500, 'rgba(220,222,230,1)', .26, 2.2);
  };

})();
