# Quickstart: Testing PWA & Mobile UX Improvements

This guide outlines how to build, run, and verify the PWA and mobile layout changes locally.

## Prerequisite: Mapped Icons

Make sure these icons are present in the `public/` directory (these are already supplied):
- `public/android-chrome-192x192.png` (192x192, maskable)
- `public/android-chrome-512x512.png` (512x512, any)
- `public/apple-touch-icon.png` (180x180, opaca)

---

## 1. Run the Application Locally

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 2. Verify PWA Installability (Desktop Chrome)

1. Open Chrome DevTools (`F12`).
2. Go to the **Application** tab.
3. Click on **Manifest** in the left sidebar.
4. Verify that:
   - No errors are shown regarding missing icon paths.
   - The manifest displays the mock representation of the PWA icons correctly.
5. In Chrome's address bar, look for the **Install App** icon (monitor with down arrow) and try to install it.

---

## 3. Verify Mobile Layout & Preventing Zoom (Chrome Device Mode)

1. Enable Device Toggle in Chrome DevTools (`Ctrl + Shift + M`).
2. Select a mobile device simulation (e.g., iPhone 12 Pro or Samsung Galaxy S20).
3. Navigate to `/app/quotes/new`.
4. **Header Check**: Verify that the global layout header and bottom MobileTabBar are hidden, leaving only the mobile-specific quote form header (AppBar) visible.
5. **Touch Targets Check**: Verify that the delete icon (`Trash2`), discount edit button, and popover triggers are large and easy to click.
6. **Zoom Check**: Click on any input field. Since the font size is set to `16px` on mobile resolutions, the browser will not trigger the automatic page zoom behavior.
7. **Keyboard check**: Inspect fields like price and discount and check that their `inputmode` attribute is set to `decimal`.

---

## 4. Verify Catalog Drawer (Bottom Sheet)

1. In mobile mode (`< 640px`), click the **Catálogo** button.
2. Verify that the catalogue search slides up from the bottom of the screen as a Drawer (Bottom Sheet).
3. Toggle to desktop resolution (width `> 640px`).
4. Click **Catálogo** and verify that it renders as a classic centered Dialog modal.

---

## 5. Verify Offline Support (Service Worker)

1. In Chrome DevTools, go to **Application** -> **Service Workers**.
2. Verify that `sw.js` is registered, active, and running.
3. Check the **Offline** checkbox in Chrome DevTools Network panel (or under Application -> Service Workers).
4. Refresh `/app` and verify that the page loads static resources from cache rather than showing the standard Chrome offline page.
