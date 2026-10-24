/* Service Worker fuer CrankScore.
   Der Cache-Praefix "dreambuild-" ist intern und bleibt -- aeltere Fassungen
   erkennen Updates genau daran.
   Zweck: die App startet ohne Netz. Der gesamte Aufbau liegt im localStorage,
   die Logik in der HTML-Datei -- es gibt nichts, wofuer ein Server noetig waere.

   Strategie: Programmdateien aus dem Cache, Netz nebenher. Lokale Bilder und
   Schriften kommen direkt aus dem versionierten Cache; Preise aus dem Netz.
   Der Cache-Name traegt die Version: beim Aktivieren
   fliegt alles Aeltere raus, deshalb kann die App nicht auf einer alten Fassung
   festhaengen.

   Die Schriften liegen in fonts/ und werden mit der App vorab gecacht -- keine
   Verbindung zu Google, auch nicht beim ersten Start. */
var CACHE = 'dreambuild-20261024-1903';
var ASSETS = [
  './',
  './index.html',
  './guide-safety.js',
  './bilder/produkte/katalog.js',
  './bilder/produkte/ansicht.js',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './icon-mask.png',
  './bilder/fahrwerk/fox-dhx-hebel.jpg',
  './bilder/fahrwerk/fox-dhx-lsc.jpg',
  './bilder/fahrwerk/fox-dhx-zug.jpg',
  './bilder/fahrwerk/fox-dhx2-druck.jpg',
  './bilder/fahrwerk/fox-dhx2-hsr.jpg',
  './bilder/fahrwerk/fox-dhx2-zug.jpg',
  './bilder/fahrwerk/fox-floatx-hebel.jpg',
  './bilder/fahrwerk/fox-floatx-lsc.jpg',
  './bilder/fahrwerk/fox-gripsl-top.jpg',
  './bilder/fahrwerk/fox-gripx-top.jpg',
  './bilder/fahrwerk/fox-gripx2-top.jpg',
  './bilder/fahrwerk/fox-x2-druck.jpg',
  './bilder/fahrwerk/fox-x2-hsr.jpg',
  './bilder/fahrwerk/fox-x2-zug.jpg',
  './bilder/fahrwerk/rs-charger3-druck.jpg',
  './bilder/fahrwerk/rs-charger3-luft-zug.jpg',
  './bilder/fahrwerk/rs-rc2t-druck.jpg',
  './bilder/fahrwerk/rs-rc2t-hsc-detail.jpg',
  './bilder/fahrwerk/rs-rc2t-lsc-detail.jpg',
  './bilder/fahrwerk/rs-sdcoil-front-detail.png',
  './bilder/fahrwerk/rs-sdcoil-side-detail.png',
  './bilder/fahrwerk/rs-sdcoil-3q-detail.png',
  './bilder/fahrwerk/rs-nah-daempfer-druck.jpg',
  './bilder/fahrwerk/rs-nah-daempfer-luft.jpg',
  './bilder/fahrwerk/rs-nah-daempfer-oring.jpg',
  './bilder/fahrwerk/rs-nah-daempfer-zug.jpg',
  './bilder/fahrwerk/rs-nah-coil-bo.jpg',
  './bilder/fahrwerk/rs-nah-coil-druck.jpg',
  './bilder/fahrwerk/rs-nah-coil-hsc.jpg',
  './bilder/fahrwerk/rs-nah-coil-sag.jpg',
  './bilder/fahrwerk/rs-nah-coil-zug.jpg',
  './bilder/fahrwerk/rs-nah-gabel-bo.jpg',
  './bilder/fahrwerk/rs-nah-gabel-hsc.jpg',
  './bilder/fahrwerk/rs-nah-gabel-lsc.jpg',
  './bilder/fahrwerk/rs-nah-gabel-luft.jpg',
  './bilder/fahrwerk/rs-nah-gabel-oring.jpg',
  './bilder/fahrwerk/rs-nah-gabel-zug.jpg',
  './bilder/beispielrad-seite-640.webp',
  './bilder/beispielrad-seite-1200.webp',
  './fonts/inter-400-800-latin.woff2',
  './fonts/ibmplexmono-400-latin.woff2',
  './fonts/ibmplexmono-500-latin.woff2',
  './fonts/ibmplexmono-600-latin.woff2',
  './fonts/barlowsemicondensed-600-latin.woff2',
  './fonts/barlowsemicondensed-700-latin.woff2'
];
var FREMD = [];                /* nichts von fremden Servern -- Schriften liegen in fonts/ */

self.addEventListener('install', function(e){
  /* cache:"reload" -- sonst fuellt der Browser den neuen App-Cache aus seinem
     eigenen HTTP-Cache, und direkt nach einer Veroeffentlichung landet darin
     noch die alte Seite. */
  e.waitUntil(caches.open(CACHE).then(function(c){
      return c.addAll(ASSETS.map(function(u){ return new Request(u, {cache:"reload"}); }));
    })
    .then(function(){
      /* Sofort uebernehmen statt zu warten, bis alle Tabs zu sind. Die Seite
         laedt sich daraufhin selbst einmal neu -- so sieht der Nutzer immer die
         aktuelle Fassung, ohne je etwas neu zu installieren. */
      return self.skipWaiting();
    }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ return k === CACHE || !/^(dreambuild|crankscore)-/.test(k) ? null : caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;
  var url = new URL(req.url);
  var eigen = url.origin === self.location.origin;
  var fremd = FREMD.indexOf(url.origin) >= 0;
  if(!eigen && !fremd) return;
  /* Update-Proben muessen frisch bleiben und duerfen keine neuen Cacheeintraege
     fuer jeden Zeitstempel anlegen. Auch andere no-store-Aufrufe respektieren. */
  if(req.cache === 'no-store' || eigen && url.pathname === self.location.pathname) return;

  var schreiben = function(c, key, res){
    if(!res || !(res.ok || res.type === 'opaque')) return Promise.resolve(res);
    return c.put(key, res.clone()).catch(function(){}).then(function(){ return res; });
  };

  /* Preise (preise.json, preisverlauf.json): Netz zuerst. Ein Preis von
     gestern ist schlechter als keiner -- der Cache springt nur ein, wenn das
     Netz weg ist. Eine 404 (noch keine Preise) wird nicht gecacht. */
  if(eigen && /\.json$/.test(url.pathname)){
    e.respondWith(caches.open(CACHE).then(function(c){
      return fetch(req, {cache:"no-cache"}).then(function(res){
        return schreiben(c, req, res);
      }).catch(function(){
        return c.match(req).then(function(hit){ return hit || new Response("", {status:504}); });
      });
    }));
    return;
  }

  var hintergrund = Promise.resolve();
  var antwort = caches.open(CACHE).then(function(c){
    var start = new URL('./', self.location.href);
    var einstieg = eigen && req.mode === 'navigate' && (url.pathname === start.pathname || url.pathname === start.pathname + 'index.html');
    var key = einstieg ? new URL(url.pathname === start.pathname ? './' : './index.html', start).href : req;
    return c.match(key).then(function(hit){
      if(hit && eigen && /\.(?:avif|gif|ico|jpe?g|png|svg|webp|woff2?|glb)$/i.test(url.pathname)) return hit;
      var netz = fetch(req, eigen ? {cache:"no-cache"} : undefined).then(function(res){
        return schreiben(c, key, res);
      }).catch(function(){ return hit || new Response("", {status:504}); });
      hintergrund = netz;
      return hit || netz;
    });
  });
  e.respondWith(antwort);
  /* Auch nach einer schnellen Cacheantwort darf der Worker erst nach dem
     abgeschlossenen Hintergrundabruf und Cache-Schreiben beendet werden. */
  e.waitUntil(antwort.then(function(){ return hintergrund; }).catch(function(){}));
});
