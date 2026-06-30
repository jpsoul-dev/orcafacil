# Research: Catalog Refactoring & Improvements

## Technical Findings & Decisions

### 1. Architectural Alignment: Isolating Data Queries into Service Layer (Principle I)
- **Finding**: Currently, `page.tsx` runs Supabase queries directly, and `actions.ts` directly performs database mutations. This violates **Principle I: Separação Estrita de Lógicas (SRP & Services Pattern)** of the Orca Fácil Constitution.
- **Decision**: Introduce a `CatalogService` under `lib/services/catalog-service.ts` to encapsulate all Supabase interactions (fetching, searching, inserting, updating, deleting). Both the page (Server Component) and the Server Actions will delegate database work to this service class.
- **Alternatives Considered**: Keeping database logic inside Server Components/Actions was rejected because it violates the project's strict architecture guidelines.

### 2. PWA Mobile UX: Mobile Keyboards & UI Constraints
- **Finding**: On mobile devices, inputting the unit price pulls up the default alphanumeric keyboard. To enforce a native-like experience, a numeric/decimal keyboard should open.
- **Decision**: Add `inputMode="decimal"` to the numeric field input inside `catalog-form.tsx`. This prompts mobile browsers to show a numerical keypad with decimal support without breaking the currency masking utility.
- **UX Alignment**: Set the "Novo Item" button to fix at the bottom of the screen (`fixed bottom-0`) on mobile (viewport < 640px), replacing/overlapping the default bottom navigation tab bar in this specific route to maximize screen real estate and mimic native action bar behaviors.

### 3. State Management for Sheet Coordination (Preventing Overlay)
- **Finding**: Opening the edit form directly from the item view sheet causes sheet stacking (overlays), which degrades PWA UX and feels non-native.
- **Decision**: Control the open/close state of both sheets centrally in `catalog-list.tsx`. We will track:
  - `activeViewItem: CatalogItem | null` (determines if the read-only view sheet is open)
  - `activeEditItem: CatalogItem | null` (determines if the edit sheet is open)
  When "Editar" is clicked on the view sheet, we set `activeViewItem` to `null` and instantly set `activeEditItem` to the selected item. This guarantees only one sheet is open at any time.

### 4. Compact Pill Notifications (Toasts)
- **Finding**: The application uses the `sonner` toast library, styled with custom class names in `globals.css` (`.cn-toast`). We need a uniform "pill" format centered at the bottom.
- **Decision**: Implement a helper function `showPillToast(message, type)` that calls `toast[type]` with `position: "bottom-center"`, `duration: 2000`, and Tailwind classes to style it as a rounded pill (`!rounded-full !px-5 !py-2.5 !w-auto !min-w-[200px] !max-w-xs !mx-auto`). This isolates the catalog style from the app's standard toast layout.

### 5. URL-driven Filter Sheet
- **Finding**: The filter requirements demand multi-select checkboxes for types (Products and/or Services) and single-select radios for sorting, plus active filter chips that update live.
- **Decision**: Instead of component state, the filter sheet will write its selections directly to the Next.js `searchParams` URL query strings (`type` as `product|service|all`, `sort` as `az|za|price_asc|price_desc`).
- **Active Chips**: The listing page reads the current URL params, generates removable chips, and updates the search query instantly when a chip is closed or cleared. If both "Product" and "Service" are unchecked, we display an empty state and a chip labeled `[nenhum ×]`, updating the URL to `type=none` or empty string.

## Alternatives Considered

- **Sub-pages instead of sheets for mobile details**: Considered redirecting mobile users to `/app/catalog/[id]` instead of using sheets. Rejected because sheets match the desktop flow better and keep the user in the context of the main listing, aligning with the stakeholder PRD.
- **Standard browser dialogs**: Rejected for deleting confirmations because standard alert boxes break the premium PWA design styling. We will use a custom `<Dialog>` (Shadcn) for clean delete confirmation.
