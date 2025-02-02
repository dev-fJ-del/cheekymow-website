const CACHE_NAME = "cheekymow-cache-v1";
const urlsToCache = [
  "/",
  "/styles.css",
  "/fonts/DIN%20Medium.ttf",
  "/fonts/Arima-SemiBold.ttf",
  "/fonts/Font Awesome 6 Brands-Regular-400.otf",
  "/images/cheekymow_logo.webp",
  "/images/features/image1.webp",
  "/images/features/image2.webp",
  "/images/features/image3.webp",
  "/images/features/image4.webp",
  "/images/features/image5.webp",
  "/images/features/feature-graphic.webp",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
