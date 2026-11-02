// Cambia este número cada vez que subas una versión nueva de la app
const VERSION = 'lector-v6';
const FILES = ['./', './index.html', './pdf.min.js', './pdf.worker.min.js',
               './manifest.webmanifest', './icon-192.png', './icon-512.png'];

// 1) Al instalar: guardar todos los archivos de la app en el teléfono
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

// 2) Al activar: borrar versiones viejas guardadas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 3) Al pedir un archivo: con internet usa lo nuevo, sin internet usa lo guardado
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return; // Gemini no se toca
  e.respondWith(
    fetch(req)
      .then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
