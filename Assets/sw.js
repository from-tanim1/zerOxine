// zerOxine - Powerful Service Worker
const CACHE_NAME = 'zeroxine-v2';
const API_CACHE = 'zeroxine-api-v1';
const ASSET_CACHE = 'zeroxine-assets-v1';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'https://raw.githubusercontent.com/from-tanim1/zerOxine/refs/heads/main/Assets/zerOxine.png'
];

// Install event - precache critical assets
self.addEventListener('install', event => {
  console.log('⚡ Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old cache versions
          if (cacheName !== CACHE_NAME && 
              cacheName !== API_CACHE && 
              cacheName !== ASSET_CACHE) {
            console.log('🗑️ Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper: Network with cache fallback (stale-while-revalidate strategy)
const staleWhileRevalidate = async (request) => {
  const cache = await caches.open(ASSET_CACHE);
  
  // Try to get from cache first
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background
  const networkPromise = fetch(request)
    .then(networkResponse => {
      // Update cache with new response
      cache.put(request, networkResponse.clone());
      return networkResponse;
    })
    .catch(error => {
      console.log('Network request failed:', error);
    });
  
  // Return cached response immediately if available, otherwise wait for network
  return cachedResponse || networkPromise;
};

// Fetch event - intelligent caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests except our allowed ones
  if (!url.origin.includes('githubusercontent') && url.origin !== self.location.origin) {
    // For external resources, try cache first with network fallback
    if (url.origin.includes('githubusercontent')) {
      event.respondWith(staleWhileRevalidate(request));
    }
    return;
  }

  // Handle different resource types
  if (request.destination === 'document') {
    // HTML - Network first, cache fallback
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(request))
    );
  } 
  else if (request.destination === 'style' || request.destination === 'script' || request.destination === 'font') {
    // Static assets - Cache first, network fallback
    event.respondWith(
      caches.match(request).then(cached => {
        return cached || fetch(request).then(response => {
          const responseClone = response.clone();
          caches.open(ASSET_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        });
      })
    );
  }
  else if (request.destination === 'image') {
    // Images - Cache first with background refresh
    event.respondWith(staleWhileRevalidate(request));
  }
  else if (request.url.includes('/api/') || request.url.includes('pdfhost.io')) {
    // API calls and external PDFs - Network only with cache fallback for offline
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
  }
  else {
    // Default - Network first, cache fallback
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(request))
    );
  }
});

// Background sync for when app comes back online
self.addEventListener('sync', event => {
  if (event.tag === 'sync-resources') {
    console.log('🔄 Background sync triggered');
    event.waitUntil(syncResources());
  }
});

// Push notification handler (optional)
self.addEventListener('push', event => {
  const options = {
    body: event.data.text(),
    icon: 'https://raw.githubusercontent.com/from-tanim1/zerOxine/refs/heads/main/Assets/zerOxine.png',
    badge: 'https://raw.githubusercontent.com/from-tanim1/zerOxine/refs/heads/main/Assets/zerOxine.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore zerOxine'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('zerOxine Update', options)
  );
});

// Helper function for background sync
async function syncResources() {
  const cache = await caches.open(API_CACHE);
  const requests = await cache.keys();
  
  // Attempt to refresh cached resources
  for (const request of requests) {
    try {
      const response = await fetch(request);
      if (response.status === 200) {
        cache.put(request, response);
      }
    } catch (error) {
      console.log('Background sync failed for:', request.url);
    }
  }
      }
