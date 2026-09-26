/* Service Worker fuer CrankScore.
   Der Cache-Praefix "dreambuild-" ist intern und bleibt -- aeltere Fassungen
   erkennen Updates genau daran.
   Zweck: die App startet ohne Netz. Der gesamte Aufbau liegt im localStorage,
   die Logik in der HTML-Datei -- es gibt nichts, wofuer ein Server noetig waere.

   Strategie: Cache zuerst, Netz nebenher (stale-while-revalidate). Die Antwort
   kommt sofort aus dem Cache, die frische Fassung wird im Hintergrund geholt und
   greift beim naechsten Start. Der Cache-Name traegt die Version: beim Aktivieren
   fliegt alles Aeltere raus, deshalb kann die App nicht auf einer alten Fassung
   festhaengen.

   Die Schriften liegen in fonts/ und werden mit der App vorab gecacht -- keine
   Verbindung zu Google, auch nicht beim ersten Start. */
var CACHE = 'dreambuild-20260926-1837';
var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './icon-mask.png',
  './fonts/inter-400-800-latin.woff2',
  './fonts/ibmplexmono-400-latin.woff2',
  './fonts/ibmplexmono-500-latin.woff2',
  './fonts/ibmplexmono-600-latin.woff2'
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
    return Promise.all(ks.map(function(k){ return k === CACHE ? null : caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;
  var url = new URL(req.url);
  var eigen = url.origin === self.location.origin;
  var fremd = FREMD.indexOf(url.origin) >= 0;
  if(!eigen && !fremd) return;

  /* Preise (preise.json, preisverlauf.json): Netz zuerst. Ein Preis von
     gestern ist schlechter als keiner -- der Cache springt nur ein, wenn das
     Netz weg ist. Eine 404 (noch keine Preise) wird nicht gecacht. */
  if(eigen && /\.json$/.test(url.pathname)){
    e.respondWith(caches.open(CACHE).then(function(c){
      return fetch(req, {cache:"no-cache"}).then(function(res){
        if(res && res.ok) c.put(req, res.clone());
        return res;
      }).catch(function(){
        return c.match(req).then(function(hit){ return hit || new Response("", {status:504}); });
      });
    }));
    return;
  }

  e.respondWith(caches.open(CACHE).then(function(c){
    return c.match(req).then(function(hit){
      var netz = fetch(req, eigen ? {cache:"no-cache"} : undefined).then(function(res){
        if(res && (res.ok || res.type === 'opaque')) c.put(req, res.clone());
        return res;
      }).catch(function(){ return hit; });
      return hit || netz;
    });
  }));
});
