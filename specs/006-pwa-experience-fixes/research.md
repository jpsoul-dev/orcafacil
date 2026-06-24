# Research: PWA and Mobile UX Enhancements

## 1. Service Worker & Offline Capability

### Decision
Implement a custom service worker (`public/sw.js`) and register it using a React Client Component (`components/pwa-register.tsx`) rendered inside the Root Layout.

### Rationale
- Next.js 16 supports serving static files directly from `/public`. A service worker script placed at `public/sw.js` is served at the root URL scope (`/sw.js`), which is necessary to intercept requests from the entire origin.
- A basic custom Service Worker with Cache-First strategy for static assets (fonts, icons, styles) and Network-First for core application pages (with an offline fallback page or cache fallback) fulfills the PWA criteria.
- Registering via a lightweight `useEffect` client component avoids bloating Server Components with client-side registration code.

### Alternatives Considered
- **next-pwa library**: Rejected because `next-pwa` sometimes causes compatibility issues with Next.js 16 App Router due to changing compiler options and webpack structures. A custom service worker is highly reliable, easy to customize, and has zero external dependencies.

---

## 2. Header and Footer Layout Collisions

### Decision
Introduce a `group` container in the layout shell (`app/app/layout.tsx`) and use Tailwind v4 dynamic `:has()` selector to conditionally hide the global Header and the MobileTabBar when a target component rendering a specific page class (`.hide-global-header-mobile`) is present.

### Rationale
- Server Component constraints: `app/app/layout.tsx` is a Server Component. It doesn't have runtime access to the `pathname` client hook (`usePathname()`) to dynamically toggle UI elements based on the route.
- A pure CSS approach using `:has()` (e.g., `.max-sm:group-has-[.hide-global-header-mobile]:hidden`) resolves the problem at the layout level without forcing the layout to become a Client Component or querying headers on every request.
- Very high performance with no Layout Shift.

---

## 3. Safari iOS Zoom Prevention and Numeric Inputs

### Decision
Set the input font size to `text-base` (16px) on viewports below 640px (using `max-sm:text-base sm:text-sm` or similar). Add `inputMode="decimal"` to currency and percentage inputs.

### Rationale
- **iOS Zoom Quirk**: Mobile Safari automatically zooms in on any `<input>` or `<textarea>` where the font size is less than 16px. By setting the font size to at least 16px (1rem) on mobile viewports, we cleanly prevent this behavior.
- **Teclado Decimal**: `inputMode="decimal"` instructs the browser to open the virtual keyboard with numbers and a decimal separator (comma/dot), which is correct for prices and discount values, rather than showing the full alphanumeric keyboard.

---

## 4. Mobile Drawer vs. Dialog for Catalog

### Decision
Import `Drawer` from `vaul` (or the shadcn/ui wrapper `components/ui/drawer.tsx`). Use a media query client-side hook (`useMediaQuery`) to dynamically render a bottom drawer (`Drawer`) on mobile screens (`< 640px`) and keep the modal dialog (`Dialog`) on desktop.

### Rationale
- Native Mobile feel: Modals in center-screen are difficult to interact with on mobile. A slide-up bottom sheet is the industry standard for picking items.
- Maintain Desktop experience: The existing modal layout works very well on wider screens, so a responsive component swap gives the best of both worlds.
