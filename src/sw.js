// Service Worker for DC Genesis Signup - Offline PWA functionality
// This enables the site to work offline after first visit

const CACHE_NAME = 'dc-genesis-v4-admin-fixed'
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/creator-types.json',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
]

// Install service worker and cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing new version...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files')
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .then(() => {
        console.log('Service Worker: Cache complete, force activating')
        // Force the new service worker to activate immediately
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error)
      })
  )
})

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Claiming clients')
        return self.clients.claim()
      })
  )
})

// Fetch strategy: Network first for HTML, cache first for other assets
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }
  
  // Skip Supabase API requests (always try network)
  if (event.request.url.includes('supabase.co')) {
    return
  }
  
  // Skip caching for admin.html during development (always fetch fresh)
  if (event.request.url.includes('admin.html')) {
    return
  }
  
  // For HTML files, try network first to get latest updates
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseToCache = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache)
            })
          }
          return response
        })
        .catch(() => {
          // Fall back to cache if network fails
          return caches.match(event.request)
        })
    )
    return
  }
  
  // For other assets, use cache first
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache', event.request.url)
          return cachedResponse
        }
        
        // Otherwise fetch from network
        console.log('Service Worker: Fetching from network', event.request.url)
        return fetch(event.request)
          .then((response) => {
            // Cache successful responses
            if (response.status === 200) {
              const responseToCache = response.clone()
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache)
                })
            }
            return response
          })
          .catch((error) => {
            console.log('Service Worker: Network fetch failed, serving offline page', error)
            
            // For HTML requests, serve the main page when offline
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/')
            }
            
            // For other requests, return a generic offline response
            return new Response('Offline - Content not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' }
            })
          })
      })
  )
})

// Handle background sync for form submissions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag)
  
  if (event.tag === 'background-sync-submissions') {
    event.waitUntil(syncPendingSubmissions())
  }
})

// Sync pending form submissions when connection returns
async function syncPendingSubmissions() {
  try {
    console.log('Service Worker: Syncing pending submissions...')
    
    // This would integrate with your main app's sync logic
    // For now, we'll just post a message to the main thread
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_PENDING_SUBMISSIONS'
      })
    })
    
    console.log('Service Worker: Sync message sent to clients')
  } catch (error) {
    console.error('Service Worker: Sync failed', error)
  }
}

// Handle install prompt
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

console.log('Service Worker: Script loaded')