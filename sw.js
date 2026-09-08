/**
 * LANDSLIDE SENTINEL AI - Service Worker for Offline-First Operation
 * Caches core static assets, map overlays, emergency contacts, and shelters.
 */

const CACHE_NAME = 'landslide-sentinel-v1.0.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/api.js',
  './js/dashboard.js',
  './js/map.js',
  './js/charts.js',
  './js/rainfall.js',
  './js/risk.js',
  './js/terrain.js',
  './js/historical.js',
  './js/replay.js',
  './js/model.js',
  './js/explainability.js',
  './js/citizen.js',
  './js/i18n.js',
  './js/iot.js',
  './js/field_ai.js',
  './js/emergency.js',
  './js/auth.js',
  './js/demo.js',
  './js/utils.js',
  './data/current_risk.json',
  './data/rainfall_latest.json',
  './data/model_metrics.json',
  './data/shelters/shelters.json',
  './data/resources/emergency_resources.json',
  './data/gis/nh10_road_network.geojson',
  './data/gis/corridor_infrastructure.geojson',
  './data/gis/settlements.geojson',
  './locales/en.json',
  './locales/ne.json',
  './locales/hi.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Pre-caching static assets for offline readiness');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone and update cache with fresh response
        const resClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          if (event.request.method === 'GET' && response.status === 200) {
            cache.put(event.request, resClone);
          }
        });
        return response;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
