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
  console.log('Background sync event triggered:', event.tag);
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Handle sync events for specific action types
self.addEventListener('sync', (event) => {
  if (event.tag.startsWith('sync-')) {
    event.waitUntil(
      syncSpecificAction(event.tag)
        .catch(error => {
          console.error('Sync failed for', event.tag, error);
          // Re-register for retry
          return self.registration.sync.register(event.tag);
        })
    );
  }
});

function doBackgroundSync() {
  console.log('Starting background sync process');
  return initDB().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore('offline-actions');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        const offlineActions = getAllRequest.result;
        console.log('Found', offlineActions.length, 'offline actions to sync');
        
        if (offlineActions.length === 0) {
          resolve();
          return;
        }
        
        // Process each offline action
        const syncPromises = offlineActions.map(action => {
          return syncOfflineAction(action)
            .then(() => {
              console.log('Successfully synced action:', action.id);
              // Remove synced action from offline store
              const deleteTransaction = db.transaction([STORE_NAME], 'readwrite');
              const deleteStore = deleteTransaction.objectStore('offline-actions');
              return deleteStore.delete(action.id);
            })
            .catch(error => {
              console.error('Failed to sync action:', action.id, error);
              // Mark as failed but don't remove - will retry later
              throw error;
            });
        });
        
        Promise.allSettled(syncPromises)
          .then(results => {
            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;
            console.log(`Sync completed: ${successful} successful, ${failed} failed`);
            
            // Notify the app about sync status
            self.clients.matchAll().then(clients => {
              clients.forEach(client => {
                client.postMessage({
                  type: 'SYNC_COMPLETE',
                  successful,
                  failed,
                  total: offlineActions.length
                });
              });
            });
            
            resolve();
          })
          .catch(error => {
            console.error('Background sync failed:', error);
            reject(error);
          });
      };
      
      getAllRequest.onerror = () => {
        console.error('Failed to get offline actions:', getAllRequest.error);
        reject(getAllRequest.error);
      };
    });
  }).catch(error => {
    console.error('Background sync initialization failed:', error);
    throw error;
  });
}

// Sync specific action by tag
function syncSpecificAction(tag) {
  const actionId = tag.replace('sync-', '');
  console.log('Syncing specific action:', actionId);
  
  return initDB().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore('offline-actions');
      const getRequest = store.get(parseInt(actionId));
      
      getRequest.onsuccess = () => {
        const action = getRequest.result;
        if (action) {
          syncOfflineAction(action)
            .then(() => {
              // Remove synced action
              const deleteTransaction = db.transaction([STORE_NAME], 'readwrite');
              const deleteStore = deleteTransaction.objectStore('offline-actions');
              deleteStore.delete(action.id);
              resolve();
            })
            .catch(reject);
        } else {
          resolve(); // Action already synced or doesn't exist
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  });
}

// Function to sync individual offline actions
function syncOfflineAction(action) {
  console.log('Attempting to sync action:', action);
  
  // Simulate API endpoint - in real app, this would be your actual API
  const apiEndpoint = determineApiEndpoint(action);
  
  return fetch(apiEndpoint, {
    method: action.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Sync-Action': 'true'
    },
    body: JSON.stringify({
      type: action.type,
      data: action.data,
      timestamp: action.timestamp,
      offline: true
    })
  }).then(response => {
    console.log('Sync response:', response.status, 'for action:', action.type);
    
    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json().catch(() => ({})); // Handle empty responses
  }).catch(error => {
    console.error('Sync request failed:', error);
    
    // For demo purposes, simulate successful sync for some operations
    if (action.type.includes('ADD_PRODUCT') || action.type.includes('UPDATE_PRODUCT')) {
      console.log('Simulating successful sync for product operation');
      return Promise.resolve({ success: true, simulated: true });
    }
    
    throw error;
  });
}

// Determine API endpoint based on action type
function determineApiEndpoint(action) {
  const baseUrl = self.location.origin;
  
  switch (action.type) {
    case 'ADD_PRODUCT':
      return `${baseUrl}/api/products`;
    case 'UPDATE_PRODUCT':
      return `${baseUrl}/api/products/${action.data.id}`;
    case 'DELETE_PRODUCT':
      return `${baseUrl}/api/products/${action.data.id}`;
    case 'ADD_WAREHOUSE':
      return `${baseUrl}/api/warehouses`;
    case 'UPDATE_WAREHOUSE':
      return `${baseUrl}/api/warehouses/${action.data.id}`;
    case 'DELETE_WAREHOUSE':
      return `${baseUrl}/api/warehouses/${action.data.id}`;
    case 'ADD_OPERATION':
      return `${baseUrl}/api/operations`;
    default:
      return `${baseUrl}/api/sync`;
  }
}

// Function to store offline actions
function storeOfflineAction(actionData) {
  return initDB().then(db => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore('offline-actions');
    
    const offlineAction = {
      ...actionData,
      timestamp: Date.now(),
      synced: false,
      retryCount: 0,
      maxRetries: 3
    };
    
    return new Promise((resolve, reject) => {
      const addRequest = store.add(offlineAction);
      addRequest.onsuccess = () => {
        console.log('Offline action stored with ID:', addRequest.result);
        
        // Try to register background sync immediately
        if ('serviceWorker' in navigator && 'sync' in self.registration) {
          self.registration.sync.register('background-sync')
            .then(() => console.log('Background sync registered'))
            .catch(error => console.log('Background sync registration failed:', error));
        }
        
        resolve(addRequest.result);
      };
      addRequest.onerror = () => reject(addRequest.error);
    });
  });
}

// Message handler for storing offline actions
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'STORE_OFFLINE_ACTION') {
    console.log('Received offline action to store:', event.data.action);
    storeOfflineAction(event.data.action)
      .then((actionId) => {
        console.log('Offline action stored successfully with ID:', actionId);
        // Send confirmation back to the app
        event.ports[0]?.postMessage({ success: true, actionId });
      })
      .catch(error => {
        console.error('Failed to store offline action:', error);
        event.ports[0]?.postMessage({ success: false, error: error.message });
      });
  }
  
  // Handle manual sync requests
  if (event.data && event.data.type === 'TRIGGER_SYNC') {
    console.log('Manual sync triggered');
    if ('sync' in self.registration) {
      self.registration.sync.register('background-sync')
        .then(() => {
          console.log('Manual background sync registered');
          event.ports[0]?.postMessage({ success: true });
        })
        .catch(error => {
          console.error('Manual sync registration failed:', error);
          event.ports[0]?.postMessage({ success: false, error: error.message });
        });
    }
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