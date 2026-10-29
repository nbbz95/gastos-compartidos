// Service worker mínimo: red primero y, sin conexión, lo último que se guardó.
const CACHE = 'gastos-v1'
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        const copia = r.clone()
        caches.open(CACHE).then((c) => c.put(e.request, copia))
        return r
      })
      .catch(() => caches.match(e.request)),
  )
})
