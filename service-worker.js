/**
 * Service Worker para Agricultura de Gravatá
 * Versão: 1.0.0
 * Site: https://agricultura.gravata.pe.gov.br/
 * 
 * Este service worker permite caching de recursos e experiência offline
 */

const CACHE_NAME = 'agricultura-gravata-v1';

// Arquivos para cache inicial
const INITIAL_CACHE_URLS = [
  '/',
  '/index.html',
  '/abacaxi.html',
  '/banana.html',
  '/cara.html',
  '/chuchu.html',
  '/flores.html',
  '/goiaba.html',
  '/organicos.html',
  '/style.css',
  '/responsive.css',
  '/main.js',
  '/charts.js',
  '/favicon.ico',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Instalar o service worker e realizar o cache inicial
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache aberto');
        return cache.addAll(INITIAL_CACHE_URLS);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

// Limpar caches antigos quando ativar uma nova versão do service worker
self.addEventListener('activate', function(event) {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Remover caches antigos
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Estratégia de cache: Network First, com fallback para cache
self.addEventListener('fetch', function(event) {
  // Ignora requisições que não sejam GET
  if (event.request.method !== 'GET') return;
  
  // Ignora requisições para APIs ou analytics
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('google-analytics.com') ||
      event.request.url.includes('analytics')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Verificar se a resposta é válida
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clonar a resposta porque ela será consumida pelo cache e pela página
        const responseToCache = response.clone();
        
        // Adicionar resposta ao cache
        caches.open(CACHE_NAME)
          .then(function(cache) {
            cache.put(event.request, responseToCache);
          });
        
        return response;
      })
      .catch(function() {
        // Se a rede falhar, buscar do cache
        return caches.match(event.request)
          .then(function(cachedResponse) {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Se não encontrado no cache, tentar a página offline
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
            
            // Retornar erro para outros recursos
            return new Response('Recurso não disponível offline', {
              status: 503,
              statusText: 'Serviço Indisponível',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Armazenar em cache recursos acessados com frequência
self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  
  // Caching dinâmico para recursos acessados frequentemente
  if (event.request.destination === 'image' || 
      event.request.destination === 'style' || 
      event.request.destination === 'script') {
    
    event.waitUntil(
      caches.open(CACHE_NAME).then(function(cache) {
        fetch(event.request).then(function(response) {
          // Adicionar ao cache apenas se for uma resposta válida
          if (response.ok) {
            cache.put(event.request, response.clone());
          }
        }).catch(function() {
          // Falha ao buscar, não faz nada
        });
      })
    );
  }
});

// Mensagens do cliente para o service worker
self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
}); 