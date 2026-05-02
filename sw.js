const CACHE_VERSION = "rfrl-shell-v12";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";

const APP_SHELL = [
  "/",
  "/app.html",
  "/index.html",
  "/student-portal.html",
  "/student-portal.js",
  "/portal-submissions.html",
  "/manifest.json",
  "/offline.html",
  "/pwa-gestures.js",
  "/site-search.css",
  "/site-search.js",
  "/site-search-index.json",
  "/access-gate.js",
  "/favicon.ico",
  "/apple-touch-icon-rfrl.png",
  "/assets/mmmf-email-avatar.png",
  "/assets/mmmf-site-mark.svg",
  "/assets/icons/icon-192-rfrl.png",
  "/assets/icons/icon-512-rfrl.png",
  "/game.html",
  "/game-data.js",
  "/game.js",
  "/program.html",
  "/resume.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE].includes(key))
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (
    url.pathname.endsWith("/portal-approvals.html") ||
    url.pathname.endsWith("/portal-submissions.html")
  ) {
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match(OFFLINE_URL);
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response.ok) return response;
        const copy = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
        return response;
      });
    }),
  );
});
