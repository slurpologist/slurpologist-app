self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('slurp-monitoring-cache-v1').then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/manifest.json',
                '/assets/styles.css',
                // Add other assets to cache as needed
            ]);
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== 'slurp-monitoring-cache-v1') {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});