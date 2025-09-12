const CACHE_NAME = 'disaster-prep-v2.1.0';
const API_CACHE_NAME = 'api-cache-v1.0.0';
const STATIC_CACHE_NAME = 'static-cache-v2.1.0';

// Core files that must be cached for offline functionality
const CORE_CACHE_FILES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico'
];

// API endpoints to cache for offline access
const API_CACHE_URLS = [
  '/api/modules',
  '/api/emergency-contacts',
  '/api/drills',
  '/api/alerts',
  '/api/auth/profile'
];

// Content that should be cached on demand
const DYNAMIC_CACHE_PATTERNS = [
  /\/api\/modules\/.*$/,
  /\/api\/drills\/.*$/,
  /\/static\/.*$/,
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/
];

// URLs that should always be fetched from network (critical data)
const NETWORK_ONLY_PATTERNS = [
  /\/api\/auth\/login$/,
  /\/api\/auth\/register$/,
  /\/api\/emergency\/report$/,
  /\/api\/alerts\/broadcast$/,
  /\/api\/family\/emergency-broadcast$/
];

// Offline fallback pages
const OFFLINE_FALLBACK_PAGE = '/offline.html';
const OFFLINE_MODULE_DATA = '/offline-modules.json';

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response for caching
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Offline fallback pages
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
          
          // Fallback for API requests
          if (event.request.url.includes('/api/')) {
            return new Response(
              JSON.stringify({
                success: false,
                message: 'Offline - cached data not available',
                offline: true
              }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );
          }
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
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
});

// Background sync for emergency alerts
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-alerts') {
    event.waitUntil(syncAlerts());
  }
});

// Push notification for emergency alerts
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo192.png',
      badge: '/icons/badge.png',
      vibrate: [200, 100, 200, 100, 200, 100, 200],
      data: {
        url: data.url || '/',
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'view',
          title: 'View Details',
          icon: '/icons/view.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/dismiss.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    const urlToOpen = event.notification.data.url;
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  }
});

// Sync emergency alerts when online
async function syncAlerts() {
  try {
    const response = await fetch('/api/alerts');
    if (response.ok) {
      const alerts = await response.json();
      // Store alerts in IndexedDB for offline access
      await storeAlertsOffline(alerts.data);
    }
  } catch (error) {
    console.log('Failed to sync alerts:', error);
  }
}

// Store alerts for offline access
async function storeAlertsOffline(alerts) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('DisasterPrepDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['alerts'], 'readwrite');
      const store = transaction.objectStore('alerts');
      
      alerts.forEach(alert => {
        store.put(alert);
      });
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('alerts')) {
        db.createObjectStore('alerts', { keyPath: '_id' });
      }
    };
  });
}
