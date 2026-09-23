// SMSMass - service worker
// Estrategia: sempre busca a versao nova na internet primeiro.
// A copia guardada so e usada quando o celular estiver sem sinal.
// Chamadas a outros sites (Apps Script, Kiwify, WhatsApp) nunca passam por aqui.
var CACHE = 'smsmass-v072';

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(['/', '/index.html', '/style.css?v=57', '/icon-192.png']);
    }).catch(function () {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (nomes) {
      return Promise.all(nomes.map(function (n) {
        if (n !== CACHE) { return caches.delete(n); }
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') { return; }
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) { return; }

  event.respondWith(
    fetch(req, { cache: 'no-store' }).then(function (resp) {
      if (resp && resp.ok && resp.type === 'basic') {
        var copia = resp.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copia); });
      }
      return resp;
    }).catch(function () {
      return caches.match(req).then(function (guardado) {
        if (guardado) { return guardado; }
        if (req.mode === 'navigate') { return caches.match('/index.html'); }
        return new Response('', { status: 504 });
      });
    })
  );
});
