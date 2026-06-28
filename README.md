# নৈবেদ্য — PWA Setup Guide

## 📁 File Structure

Place all files on your web server exactly like this:

```
your-website/
│
├── index.html                        ← Your main app (rename bangla-puja-app-fixed.html)
├── manifest.json                     ← PWA manifest
├── sw.js                             ← Service worker
│
└── icons/
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    ├── icon-512x512.png
    ├── icon-maskable-512x512.png
    ├── apple-touch-icon.png
    ├── favicon-16x16.png
    └── favicon-32x32.png
```

---

## 🔗 Add these tags to your index.html <head>

The HTML file already includes these, but verify they are present:

```html
<!-- PWA Manifest -->
<link rel="manifest" href="manifest.json">

<!-- Theme color (browser chrome) -->
<meta name="theme-color" content="#f4a535">

<!-- iOS / Safari -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="নৈবেদ্য">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">

<!-- Favicons -->
<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="icons/favicon-16x16.png">
```

---

## ⚙️ Service Worker Registration

Already included in index.html. Requires **HTTPS** to function.

---

## 🌐 Hosting Requirements

| Requirement | Why |
|---|---|
| **HTTPS** | Mandatory for PWA / service workers |
| **Correct MIME types** | `manifest.json` must be served as `application/manifest+json` |
| **Same origin** | sw.js must be at root of your domain |

### Free HTTPS hosts that work out of the box:
- **Netlify** — drag & drop the folder, instant HTTPS
- **GitHub Pages** — free with custom domain + HTTPS
- **Vercel** — instant deploy from GitHub
- **Cloudflare Pages** — fastest CDN + free HTTPS

---

## 📲 Install prompt behavior

- **Android (Chrome):** "Add to Home Screen" banner appears automatically after user visits twice
- **iOS (Safari):** User taps Share → "Add to Home Screen" manually
- **Desktop (Chrome/Edge):** Install icon appears in the address bar

---

## ✅ PWA Checklist

- [x] manifest.json with all required fields
- [x] Icons: 192×192 and 512×512 minimum (all sizes provided)
- [x] Maskable icon (safe zone padding for Android adaptive icons)
- [x] Apple touch icon (180×180) for iOS
- [x] Service worker with offline caching
- [x] Cache-first strategy for instant load
- [x] Push notification support
- [x] App shortcuts (জপ কাউন্টার, মন্ত্র)
- [x] theme_color and background_color set
- [x] Bengali language declared (lang: "bn")
- [ ] HTTPS hosting (your responsibility)

---

## 🔔 Enable Push Notifications (optional advanced step)

To use push notifications with a backend:

```js
// In your main JS, after SW registration:
const reg = await navigator.serviceWorker.ready;
const sub = await reg.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
});
// Send `sub` to your server to store
```

For a pure frontend app with no backend, the reminder alarm built into
the app (using setInterval) already works without push notifications.

---

*নৈবেদ্য · বাংলা পূজা অ্যাপ · © Manik Roy*
