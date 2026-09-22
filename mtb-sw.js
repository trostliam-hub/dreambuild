/* Service Worker fuer Dreambuild.
   Zweck: die App startet ohne Netz. Der gesamte Aufbau liegt im localStorage,
   die Logik in der HTML-Datei -- es gibt nichts, wofuer ein Server noetig waere.

   Strategie: Cache zuerst, Netz nebenher (stale-while-revalidate). Die Antwort
   kommt sofort aus dem Cache, die frische Fassung wird im Hintergrund geholt und
   greift beim naechsten Start. Der Cache-Name traegt die Version: beim Aktivieren
   fliegt alles Aeltere raus, deshalb kann die App nicht auf einer alten Fassung
   festhaengen.

   Die Google-Schriften werden beim ersten Start mitgecacht. Vor dem ersten
   Online-Start greift die Systemschrift aus dem Fallback-Stack -- die App ist
   dann lesbar, nur nicht in Archivo. */
var CACHE = 'dreambuild-20260922-2316';
var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './icon-mask.png'
];
var FREMD = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); })
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

  e.respondWith(caches.open(CACHE).then(function(c){
    return c.match(req).then(function(hit){
      var netz = fetch(req).then(function(res){
        if(res && (res.ok || res.type === 'opaque')) c.put(req, res.clone());
        return res;
      }).catch(function(){ return hit; });
      return hit || netz;
    });
  }));
});
