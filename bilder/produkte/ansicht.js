/* Produktfotos: unveränderte Herstellerdateien, schwarze Darstellung und
   eine eigene Großansicht. Die Teileauswahl und gespeicherte Räder bleiben
   dabei unangetastet. Keine Bibliothek und keine Anfrage an einen Bilddienst. */
(() => {
  'use strict';
  const tr = (de, en) => typeof tx === 'function' ? tx(de, en) : de;
  const fotos = '.teilfoto img,.fw-foto img,.fk-bild img,.feedbild,.pb-flaeche img';
  const cache = new Map();
  let arbeit = Promise.resolve();

  function schwarzeFlaeche(img, original){
    const faktor = Math.min(1, 1200 / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * faktor));
    const h = Math.max(1, Math.round(img.naturalHeight * faktor));
    const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d', {willReadFrequently:true});
    ctx.drawImage(img, 0, 0, w, h);
    const bild = ctx.getImageData(0, 0, w, h), p = bild.data;
    const ecken = [0, w - 1, (h - 1) * w, w * h - 1];
    if(ecken.some(i => p[i * 4 + 3] < 250)) return {url:original, art:'transparent'};
    const rgb = i => [p[i * 4], p[i * 4 + 1], p[i * 4 + 2]];
    const hell = c => Math.min(...c) >= 200 && Math.max(...c) - Math.min(...c) <= 12;
    const rand = ecken.map(rgb), plausible = rand.filter(hell);
    /* Ein Produkt darf eine Ecke berühren. Mindestens zwei helle neutrale
       Ecken und weitere passende Randpunkte müssen den Hintergrund belegen. */
    if(plausible.length < 2) return {url:original, art:'original'};
    const median = values => { const a = values.slice().sort((a,b) => a-b); return a[Math.floor(a.length / 2)]; };
    const mitte = [0,1,2].map(k => median(plausible.map(c => c[k])));
    const passt = c => hell(c) && c.every((v,k) => Math.abs(v - mitte[k]) <= 35);
    const randpunkte = [Math.floor(w/2), (h-1)*w+Math.floor(w/2), Math.floor(h/2)*w, Math.floor(h/2)*w+w-1].map(rgb);
    if(rand.filter(passt).length + randpunkte.filter(passt).length < 4) return {url:original, art:'original'};
    const oben = [rand[0],rand[1],randpunkte[0]].filter(passt), unten = [rand[2],rand[3],randpunkte[1]].filter(passt);
    const farbe = cs => [0,1,2].map(k => cs.length ? median(cs.map(c => c[k])) : mitte[k]);
    const tl = passt(rand[0]) ? rand[0] : farbe(oben), tr = passt(rand[1]) ? rand[1] : farbe(oben);
    const bl = passt(rand[2]) ? rand[2] : farbe(unten), br = passt(rand[3]) ? rand[3] : farbe(unten);
    /* Ein sanfter heller Studioverlauf ist ebenfalls Hintergrund. Eine
       bilineare Randreferenz verhindert, dass seine grauen Ränder bleiben. */
    const links = new Float32Array(h*3), delta = new Float32Array(h*3);
    for(let y=0;y<h;y++) for(let k=0;k<3;k++){
      const fy = y / Math.max(1,h-1), a = rgb(y*w), b = rgb(y*w+w-1);
      const einheitlich = passt(a) && passt(b) && a.every((v,j) => Math.abs(v-b[j]) <= 8);
      const l = einheitlich ? a[k] : tl[k]+(bl[k]-tl[k])*fy, r = einheitlich ? b[k] : tr[k]+(br[k]-tr[k])*fy;
      links[y*3+k] = l; delta[y*3+k] = (r-l)/Math.max(1,w-1);
    }
    const n = w * h, gesehen = new Uint8Array(n), schlange = new Int32Array(n);
    /* Diese Herstelleraufnahme hat einen neutralen Wand/Boden-Übergang.
       Das Rad selbst ist schwarz; nur sein heller Studiohintergrund wird
       zusammen mit eingeschlossenen Speichenflächen als Fläche erkannt. */
    const studioRad = /\/w-bontline\./.test(original);
    const nah = (i, toleranz = 14) => {
      if(!p[i*4+3]) return false;
      if(studioRad){ const c=rgb(i);return Math.min(...c)>=210 && Math.max(...c)-Math.min(...c)<=12; }
      const x = i%w, row = Math.floor(i/w)*3;
      return [0,1,2].every(k => Math.abs(p[i*4+k] - links[row+k] - delta[row+k]*x) <= toleranz);
    };
    let start = 0, ende = 0, entfernt = 0;
    const add = (i, toleranz = 14) => { if(!gesehen[i] && nah(i, toleranz)){ gesehen[i] = 1; schlange[ende++] = i; } };
    for(let x = 0; x < w; x++){ add(x); add((h - 1) * w + x); }
    for(let y = 0; y < h; y++){ add(y * w); add(y * w + w - 1); }
    const wachsen = (toleranz = 14) => {
      while(start < ende){
        const i = schlange[start++], x = i % w;
        if(x) add(i - 1, toleranz); if(x < w - 1) add(i + 1, toleranz);
        if(i >= w) add(i - w, toleranz); if(i < n - w) add(i + w, toleranz);
      }
    };
    wachsen();
    /* Auch zwischen Gabelholmen, Rahmenrohren und Speichen liegt der
       Studiohintergrund in geschlossenen Flächen. Große Flächen derselben
       Farbe ergänzen; kleine Schrift und Reflexe bleiben sichtbar. */
    const mindestflaeche = Math.max(90, n * (/\/(?:w-|f-)[\w-]+\./.test(original) ? .00016 : .003));
    const innenToleranz = /\/(?:f-|gr-)[\w-]+\./.test(original) ? 3 : 14;
    for(let i = 0; i < n; i++) if(!gesehen[i] && nah(i, innenToleranz)){
      const ab = ende; add(i, innenToleranz); wachsen(innenToleranz);
      if(ende - ab < mindestflaeche) for(let j = ab; j < ende; j++) gesehen[schlange[j]] = 2;
    }
    for(let i = 0; i < n; i++) if(gesehen[i] === 1){ p[i * 4 + 3] = 0; entfernt++; }
    if(entfernt < n * .03) return {url:original, art:'original'};
    ctx.putImageData(bild, 0, 0);
    return new Promise(resolve => canvas.toBlob(blob => resolve(blob ?
      {url:URL.createObjectURL(blob), art:'schwarz'} : {url:original, art:'original'}), 'image/png'));
  }

  function darstellen(img, svg){
    if(!svg && !img.matches(fotos) || !img.naturalWidth || img.dataset.photoBereit) return;
    const original = img.getAttribute('src');
    if(!original || !/^bilder\/(produkte|fahrwerk)\//.test(original)) return;
    img.dataset.photoBereit = '1'; img.classList.add('pb-photo-pending');
    if(!cache.has(original)){
      const task = arbeit.then(() => new Promise(r => setTimeout(r, 0)))
        .then(() => schwarzeFlaeche(img, original)).catch(() => ({url:original, art:'original'}));
      arbeit = task.then(() => {});
      cache.set(original, task);
      if(cache.size > 96){
        const key = cache.keys().next().value, alt = cache.get(key); cache.delete(key);
        alt.then(b => { if(b.url.startsWith('blob:')) setTimeout(() => URL.revokeObjectURL(b.url), 10000); });
      }
    }
    cache.get(original).then(b => {
      if(svg){ if(svg.isConnected){ svg.setAttribute('href', b.url); svg.dataset.photoBackground = b.art; } return; }
      if(!img.isConnected) return;
      img.dataset.photoBackground = b.art;
      if(b.url !== original){ img.src = b.url; return img.decode().catch(() => {}); }
    }).finally(() => img.classList.remove('pb-photo-pending'));
  }
  document.addEventListener('load', e => { if(e.target instanceof HTMLImageElement) darstellen(e.target); }, true);
  const finden = node => {
    if(node.nodeType !== 1) return;
    if(node.matches(fotos) && node.complete) darstellen(node);
    node.querySelectorAll(fotos).forEach(img => { if(img.complete) darstellen(img); });
    node.querySelectorAll('.fw-nah-link svg image').forEach(svg => {
      if(svg.dataset.photoBereit) return;
      svg.dataset.photoBereit = '1';
      const img = new Image(); img.onload = () => darstellen(img, svg); img.src = svg.getAttribute('href');
    });
  };
  new MutationObserver(events => events.forEach(e => e.addedNodes.forEach(finden)))
    .observe(document.body, {childList:true, subtree:true});
  finden(document.body);

  const dialog = document.createElement('dialog');
  dialog.id = 'produktbild-dialog'; dialog.className = 'pb-dialog';
  dialog.setAttribute('aria-labelledby', 'pb-titel');
  dialog.innerHTML = '<header class="pb-kopf"><h2 id="pb-titel"></h2><button type="button" data-pb-close>×</button></header>' +
    '<div class="sheet-b pb-medien"><div class="pb-flaeche"></div><p class="pb-fehler" hidden></p></div>' +
    '<footer class="pb-fuss"><div class="pb-werkzeuge"><button type="button" data-pb-zoom aria-pressed="false"></button><a class="pb-quelle" target="_blank" rel="noopener"></a></div><p class="pb-hinweis"></p></footer>';
  document.body.append(dialog);
  const titel = dialog.querySelector('h2'), medien = dialog.querySelector('.pb-medien');
  const flaeche = dialog.querySelector('.pb-flaeche'), zoom = dialog.querySelector('[data-pb-zoom]');
  const close = dialog.querySelector('[data-pb-close]'), quelle = dialog.querySelector('.pb-quelle');
  const fehler = dialog.querySelector('.pb-fehler');
  let ausloeser = null, eigeneSperre = false, ansichtOffen = false;
  const statusfarbe = value => {
    const meta = document.querySelector('meta[name="theme-color"]'); if(!meta) return;
    const neu = meta.cloneNode(); neu.content = value; meta.replaceWith(neu);
  };
  const resetZoom = () => { medien.classList.remove('pb-zoom'); zoom.setAttribute('aria-pressed', 'false');
    zoom.textContent = tr('Vergrößern', 'Zoom in'); medien.scrollTop = 0; medien.scrollLeft = 0; };
  function oeffnen(el){
    const figure = el.closest('figure'), a = figure && figure.querySelector('figcaption a[href]');
    const url = el.dataset.produktfoto || el.getAttribute('href');
    if(!url || !/^(bilder\/|https:\/\/)/.test(url)) return;
    ausloeser = el;
    titel.textContent = el.dataset.bildname || (figure && figure.querySelector('figcaption b')?.textContent) || tr('Produktfoto', 'Product photo');
    close.setAttribute('aria-label', tr('Bild schließen', 'Close image'));
    resetZoom(); fehler.hidden = true; flaeche.hidden = false;
    flaeche.replaceChildren();
    const img = new Image(); img.alt = titel.textContent; img.decoding = 'async';
    img.onerror = () => { if(flaeche.firstElementChild !== img || !dialog.open) return; flaeche.hidden = true; fehler.hidden = false;
      fehler.textContent = tr('Das Foto ist gerade nicht verfügbar. Bitte versuche es mit Netz noch einmal.', 'The photo is currently unavailable. Please try again when online.'); };
    img.src = url; flaeche.append(img);
    const q = el.dataset.bildquelle || (a && a.href) || '';
    quelle.hidden = !/^https:\/\//.test(q);
    if(!quelle.hidden){ quelle.href = q; quelle.textContent = tr('Bildquelle: ', 'Image source: ') + (el.dataset.bildmarke || (a && a.textContent.replace(/^.*?:\s*/, '')) || tr('Hersteller', 'Manufacturer')); }
    dialog.querySelector('.pb-hinweis').textContent = el.dataset.bildhinweis || tr('Modellansicht · Farbe, Ausstattung und Baujahr können abweichen.', 'Model view · colour, specification and year may differ.');
    eigeneSperre = !gesperrt;
    if(eigeneSperre) sperre();
    statusfarbe('#000000'); dialog.showModal(); ansichtOffen = true; close.focus({preventScroll:true});
  }
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-produktfoto],a.fw-foto-link,a.fw-nah-link');
    if(!el || dialog.open) return;
    e.preventDefault(); e.stopImmediatePropagation(); oeffnen(el);
  }, true);
  function bereinigen(){
    if(!ansichtOffen) return; ansichtOffen = false;
    flaeche.replaceChildren(); resetZoom();
    statusfarbe(document.documentElement.dataset.theme === 'light' ? '#f2f0ec' : '#000000');
    if(eigeneSperre){ freigeben(); eigeneSperre = false; }
    if(ausloeser && ausloeser.isConnected) ausloeser.focus({preventScroll:true});
  }
  function schliessen(){ if(dialog.open){ dialog.close(); bereinigen(); } }
  close.addEventListener('click', schliessen);
  dialog.addEventListener('cancel', e => { e.preventDefault(); schliessen(); });
  /* Das native close-Event kommt asynchron. Ein inzwischen neu geöffnetes
     Foto darf dadurch weder gelöscht noch seine Seitensperre verloren gehen. */
  dialog.addEventListener('close', () => { if(!dialog.open) bereinigen(); });
  zoom.addEventListener('click', () => {
    const an = medien.classList.toggle('pb-zoom'); zoom.setAttribute('aria-pressed', String(an));
    zoom.textContent = an ? tr('Einpassen', 'Fit image') : tr('Vergrößern', 'Zoom in');
    medien.scrollTop = 0; medien.scrollLeft = 0;
  });
  document.addEventListener('keydown', e => {
    if(!dialog.open) return;
    if(e.key === 'Escape'){ e.preventDefault(); e.stopImmediatePropagation(); schliessen(); }
    else if(e.key === 'Tab'){
      const knoepfe = [close, zoom, quelle].filter(el => !el.hidden), i = knoepfe.indexOf(document.activeElement);
      if(e.shiftKey && i <= 0 || !e.shiftKey && (i < 0 || i === knoepfe.length - 1)){
        e.preventDefault(); knoepfe[e.shiftKey ? knoepfe.length - 1 : 0].focus();
      }
    }
  }, true);
})();
