/* ==========================================
   SERVICE WORKER - PWA Cache & Offline
   ========================================== */

// Version du cache - incrémenter pour forcer la mise à jour
const CACHE_VERSION = 'v3';
const CACHE_NAME = `pokemon-collector-${CACHE_VERSION}`;
const RUNTIME_CACHE = `pokemon-collector-runtime-${CACHE_VERSION}`;

// Fichiers à mettre en cache immédiatement (statiques)
const STATIC_CACHE_FILES = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  // Scripts externes (optionnel, pour mode offline complet)
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
];

// Install : Mise en cache des fichiers statiques
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static files');
        return cache.addAll(STATIC_CACHE_FILES).catch((err) => {
          console.warn('[SW] Some files failed to cache:', err);
          // Continuer même si certains fichiers échouent
        });
      })
      .then(() => {
        console.log('[SW] Service Worker installed');
        return self.skipWaiting(); // Activer immédiatement
      })
  );
});

// Activate : Nettoyer les anciens caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Supprimer tous les caches qui ne correspondent pas à la version actuelle
          if (!cacheName.includes(CACHE_VERSION)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[SW] Service Worker activated');
      return self.clients.claim(); // Prendre le contrôle immédiatement
    })
  );
});

// Fetch : Stratégie de cache (Cache First, Network Fallback)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes Supabase (API)
  if (url.hostname.includes('supabase.co')) {
    return; // Laisser passer les requêtes API
  }

  // Ignorer les requêtes vers les APIs externes (PokéAPI, etc.)
  if (url.hostname.includes('raw.githubusercontent.com') || 
      url.hostname.includes('pokeapi.co') ||
      url.hostname.includes('play.pokemonshowdown.com')) {
    // Pour les images externes, utiliser Network First avec cache
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return fetch(request)
          .then((response) => {
            // Mettre en cache si valide
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // En cas d'erreur réseau, chercher dans le cache
            return cache.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Fallback : image placeholder si pas de cache
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#333"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#666" font-size="12">?</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            });
          });
      })
    );
    return;
  }

  // Pour les fichiers HTML/JS/CSS : Network First (toujours prendre la dernière version)
  if (url.pathname.endsWith('.html') || 
      url.pathname.endsWith('.js') || 
      url.pathname.endsWith('.css') ||
      url.pathname === '/' ||
      url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Mettre à jour le cache avec la nouvelle version
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // En cas d'erreur réseau, utiliser le cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Si pas de cache, retourner une erreur
            return new Response('Ressource non disponible hors ligne', { 
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
        })
    );
    return;
  }

  // Pour les fichiers HTML/JS : Network First (pour éviter les problèmes de cache)
  if (request.destination === 'document' || 
      url.pathname.endsWith('.js') || 
      url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Si la réponse est valide, la mettre en cache
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // En cas d'erreur réseau, utiliser le cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Si pas de cache et que c'est la page principale, retourner index.html
            if (request.destination === 'document') {
              return caches.match('./index.html');
            }
            return new Response('Offline', { status: 503 });
          });
        })
    );
    return;
  }

  // Pour les autres fichiers locaux (CSS, images locales) : Cache First
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // Pas en cache, fetch depuis le réseau
        return fetch(request)
          .then((response) => {
            // Vérifier que la réponse est valide
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cloner la réponse pour la mettre en cache
            const responseToCache = response.clone();

            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // En cas d'erreur réseau totale, retourner une page offline
            if (request.destination === 'document') {
              return caches.match('./index.html');
            }
            // Pour les autres ressources, retourner null
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Message handler pour les mises à jour manuelles
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    // Forcer la mise à jour du cache
    caches.delete(CACHE_NAME).then(() => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_CACHE_FILES);
      });
    });
  }
});

