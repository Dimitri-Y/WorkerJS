const CACHE_NAME = 'v1';
const urlsToCache = [
    '/',
    './styles/main.css',
    './scripts/main.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching install successfully');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('Error caching files:', err);
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            const request = indexedDB.open(CACHE_NAME, 1);
            request.onupgradeneeded = event => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('localStorage')) {
                    db.createObjectStore('localStorage', { keyPath: 'key' });
                }
            };
            request.onsuccess = event => {
                const db = event.target.result;
                console.log('IndexedDB initialize successfully');
            };
            request.onerror = event => {
                console.error('Error IndexedDB', event.target.error);
            };
        })
    );
});




self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SAVE_TO_LOCAL_STORAGE') {
        const { key, value } = event.data;
        const request = indexedDB.open(CACHE_NAME);
        request.onsuccess = event => {
            const db = event.target.result;
            const transaction = db.transaction(['localStorage'], 'readwrite');
            const store = transaction.objectStore('localStorage');
            store.put({ key, value });
        };
    } else if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
                caches.delete(cacheName);
            });
        });
    }
});
