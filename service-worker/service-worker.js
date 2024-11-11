const CACHE_NAME = 'v1';
const urlsToCache = [
    '/',
    '/styles/main.css',
    '/scripts/main.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
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
        })
    );
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(function (registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(function (err) {
            console.log('ServiceWorker registration failed: ', err);
        });
}

document.addEventListener('DOMContentLoaded', (event) => {
    const offlineForm = document.getElementById('offline-form');
    const dataField = document.getElementById('data-field');
    const submitButton = document.getElementById('submit-button');

    offlineForm.addEventListener('submit', (event) => {
        event.preventDefault();
        localStorage.setItem('offlineData', dataField.value);
        alert('Дані збережено для офлайн використання!');
    });

    if (localStorage.getItem('offlineData')) {
        dataField.value = localStorage.getItem('offlineData');
    }
});
