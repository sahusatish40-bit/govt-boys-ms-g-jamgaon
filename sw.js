const CACHE_NAME = "school-sathi-shell-v5";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./question-bank-v2.js",
  "./teacher-corner.html",
  "./manifest.webmanifest",
  "./offline.html",
  "./images/pwa-icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Cache each same-origin shell file independently so one missing asset
    // cannot prevent the main school website from being available offline.
    await Promise.all(APP_SHELL.map(async path => {
      try {
        const response = await fetch(new Request(path, { cache: "reload" }));
        if (response && response.ok) await cache.put(path, response);
      } catch (error) {
        // A failed optional asset should not cancel service-worker installation.
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith("school-sathi-") && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (error) {
        const cachedPage = await caches.match(request, { ignoreSearch: true });
        if (cachedPage) return cachedPage;
        const homeUrl = new URL("./index.html", self.registration.scope).href;
        const cachedHome = await caches.match(homeUrl);
        if (cachedHome) return cachedHome;
        const offlineUrl = new URL("./offline.html", self.registration.scope).href;
        return (await caches.match(offlineUrl)) ||
          new Response("आप ऑफलाइन हैं। कृपया इंटरनेट कनेक्शन चालू करके वेबसाइट एक बार खोलें।",
            { headers: { "Content-Type": "text/plain; charset=utf-8" } });
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response && response.ok && response.type === "basic") {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      return new Response("", { status: 503, statusText: "Offline" });
    }
  })());
});
