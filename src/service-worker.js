/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
/* global workbox */

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('static-pages').then((cache) => {
      return cache.add('/offline.html');
    })
  );
});

// Precaching del build
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

// Página offline personalizada
workbox.routing.setCatchHandler(({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match('/offline.html');
  }
  return Response.error();
});

// Cache para imágenes
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 80,
        maxAgeSeconds: 7 * 24 * 60 * 60 // 1 semana
      })
    ]
  })
);

// Cache para API de reservas (read-only)
workbox.routing.registerRoute(
  ({ url }) => url.pathname.startsWith('/api/reservas/'),
  new workbox.strategies.NetworkFirst({
    cacheName: 'reservas-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 5 * 60 // 5 minutos
      })
    ]
  })
);

// JS/CSS static
workbox.routing.registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-resources'
  })
);
