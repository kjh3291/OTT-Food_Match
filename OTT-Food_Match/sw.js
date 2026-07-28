const CACHE = 'ott-food-v1';
const STATIC = [
  '/',
  '/index.html',
  '/movie.html',
  '/recommend.html',
  '/mypage.html',
  '/styles.css',
  '/common.js',
  '/i18n.js',
  '/script.js',
  '/movie.js',
  '/recommend.js',
  '/mypage.js',
  '/firebase.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/images/netflix.png',
  '/images/disney.png',
  '/images/tving.png',
  '/images/wavve.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // API 요청(TMDB, Firebase)은 항상 네트워크
  if (e.request.url.includes('firebasejs') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('themoviedb') ||
      e.request.url.includes('/api/')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok && e.request.method === 'GET') {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      });
    }).catch(() => caches.match('/index.html'))
  );
});
