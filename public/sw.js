const CACHE_NAME = 'anbar-sistemi-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/src/main.tsx',
  '/src/index.css'
];

// IndexedDB setup for offline data
const DB_NAME = 'anbar-offline-db';
const DB_VERSION = 1;
const STORE_NAME = 'offline-actions';

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('action', 'action', { unique: false });
      }
    };
  });
}

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Failed to cache resources:', error);
      })
  );
  self.skipWaiting();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
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
  self.clients.claim();
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  return initDB().then(db => {
    return new Promise((resolve, reject) => {
      console.log('Background sync triggered - syncing offline data');
      
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore('offline-actions');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        const offlineActions = getAllRequest.result;
        console.log('Syncing', offlineActions.length, 'offline actions');
        
        // Process each offline action
        const syncPromises = offlineActions.map(action => {
          return syncOfflineAction(action).then(() => {
            // Remove synced action from offline store
            return store.delete(action.id);
          });
        });
        
        Promise.all(syncPromises)
          .then(() => resolve())
          .catch(error => {
            console.error('Sync failed:', error);
            reject(error);
          });
      };
      
      getAllRequest.onerror = () => reject(getAllRequest.error);
    });
  });
}

// Function to sync individual offline actions
function syncOfflineAction(action) {
  return fetch('/api/sync-action', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(action)
  }).then(response => {
    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`);
    }
    return response.json();
  });
}

// Function to store offline actions
function storeOfflineAction(actionData) {
  return initDB().then(db => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore('offline-actions');
    
    const offlineAction = {
      ...actionData,
      timestamp: Date.now(),
      synced: false
    };
    
    return store.add(offlineAction);
  });
}

// Message handler for storing offline actions
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'STORE_OFFLINE_ACTION') {
    storeOfflineAction(event.data.action)
      .then(() => {
        console.log('Offline action stored successfully');
      })
      .catch(error => {
        console.error('Failed to store offline action:', error);
      });
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Yeni bildiriş',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Anbar Sistemi', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});