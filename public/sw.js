const CACHE_NAME = "snacksy-shell-v1.0.4";
const SHELL_FILES = [
  "/",
  "/manifest.webmanifest",
  "/snacksy-logo.png",
  "/snacksy-icon-192.png",
  "/snacksy-icon-512.png",
  "/snacksy-icon-maskable-512.png",
  "/snacksy-apple-touch-icon.png",
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(SHELL_FILES.map(file => cache.add(file)));
    try {
      const home = await fetch("/", { cache: "reload" });
      if (home.ok) {
        await cache.put("/", home.clone());
        const html = await home.text();
        const assets = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
          .map(match => match[1])
          .filter(path => path.startsWith("/_next/static/"));
        await Promise.allSettled([...new Set(assets)].map(file => cache.add(file)));
      }
    } catch {
      // The basic shell list remains available when install-time networking is interrupted.
    }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith("snacksy-") && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

const cacheResponse = async (request, response) => {
  if (response?.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
};

const markOffline = async response => {
  const headers = new Headers(response.headers);
  headers.set("x-snacksy-offline", "1");
  return new Response(await response.blob(), { status: response.status, statusText: response.statusText, headers });
};

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname === "/api/cafe") {
    event.respondWith((async () => {
      try {
        return await cacheResponse(request, await fetch(request));
      } catch {
        const cached = await caches.match(request);
        if (cached) return markOffline(cached);
        return new Response(JSON.stringify({ error: "No saved café data is available on this device yet." }), { status: 503, headers: { "content-type": "application/json", "x-snacksy-offline": "1" } });
      }
    })());
    return;
  }

  if (url.pathname.startsWith("/api/menu-images/")) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      try {
        return await cacheResponse(request, await fetch(request));
      } catch {
        return new Response("Image unavailable offline", { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } });
      }
    })());
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        return await cacheResponse(request, await fetch(request));
      } catch {
        return (await caches.match(request)) || (await caches.match("/")) || new Response("Snacksy is unavailable offline until it has been opened online once.", { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } });
      }
    })());
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || /\.(?:png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(url.pathname)) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      return cacheResponse(request, await fetch(request));
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    const network = fetch(request).then(response => cacheResponse(request, response)).catch(() => null);
    return cached || await network || new Response("Offline", { status: 503 });
  })());
});
