/**
 * sw.js - Service Worker for Flashcard App
 * オフラインでも動作するようにファイルをキャッシュします
 */

const CACHE_NAME = 'flashcard-app-v1';

// アプリの動作に必要なファイルのリスト
// ※ユーザーが追加した画像や音声はローカルストレージに保存されるため、
// ここでは基本のアプリファイルのみをキャッシュします。
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './admin.html',
  './css/app.css',
  './css/admin.css',
  './js/app.js',
  './js/admin.js',
  './js/cards-data.js',
  './manifest.json',
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-512x512.png',
  // Google Fonts
  'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap'
];

// 1. インストール時の処理：ファイルをキャッシュに保存
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] キャッシュを保存中...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // すぐにアクティブ化
  self.skipWaiting();
});

// 2. アクティブ時の処理：古いキャッシュの削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] 古いキャッシュを削除:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. ネットワークリクエストの処理：キャッシュがあれば返す、なければ通信
self.addEventListener('fetch', (event) => {
  // GETリクエスト以外（POSTなど）や、拡張機能などのリクエストは無視
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // キャッシュがあればそれを返す
      if (cachedResponse) {
        return cachedResponse;
      }

      // キャッシュがなければネットワークへリクエスト
      return fetch(event.request).then((response) => {
        // 成功したレスポンスならキャッシュに保存して返す
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // オフラインで取得失敗した場合（必要に応じて代替処理）
        // console.log('[Service Worker] フェッチに失敗しました（オフライン）');
      });
    })
  );
});
