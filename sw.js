/* Glacier Water Solutions — offline app shell. Bump CACHE on each release. */
var CACHE = 'gws-v2';
var SHELL = [
  './', './index.html', './styles.css', './core.js', './ui.js', './backup.js', './app.js',
  './vendor/jspdf.umd.min.js', './vendor/jspdf.plugin.autotable.min.js',
  './fonts/space-grotesk-latin-700-normal.woff2',
  './fonts/work-sans-latin-400-normal.woff2', './fonts/work-sans-latin-500-normal.woff2',
  './icons/icon-32.png', './icons/icon-192.png', './icons/icon-512.png',
  './icons/apple-touch-icon.png', './manifest.webmanifest'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); })
    .then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(function (res) {
      var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put('./index.html', copy); }); return res;
    }).catch(function () { return caches.match('./index.html').then(function (r) { return r || caches.match('./'); }); }));
    return;
  }
  e.respondWith(caches.match(req).then(function (hit) {
    if (hit) return hit;
    return fetch(req).then(function (res) {
      if (res && res.status === 200) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      return res;
    });
  }));
});
