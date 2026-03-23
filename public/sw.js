const CACHE_NAME = 'healthtrack-v1';

// Install event - cache the app shell
self.addEventListener('install', (event) => {
  console.log('Service worker installing.');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service worker activating.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim all clients
  event.waitUntil(self.clients.claim());
});

// Fetch event - ✅ FIXED: Single unified respondWith, no double calls
self.addEventListener('fetch', (event) => {
  // Single strategy for ALL requests
  event.respondWith(handleFetch(event.request));
});

async function handleFetch(request) {
  // Bypass SW for ALL Supabase API calls (fix CORS)
  if (request.url.includes('/supabase.co/') || request.method !== 'GET') {
    try {
      console.log('SW: Bypassing cache for Supabase/API:', request.url);
      return await fetch(request);
    } catch (error) {
      console.error('SW API fetch failed:', request.url, error);
      return new Response(JSON.stringify({ error: 'Network unavailable' }), { 
        status: 503, 
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Static assets: network-first + cache update + cache fallback
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Network failed: try cache
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}
