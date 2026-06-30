# Quickstart: Catalog Refactoring & Improvements

This document outlines the steps required to verify the implementation of the Catalog Refactoring and Improvements feature.

## Development Setup

1. **Verify Dependencies**:
   Ensure all dependencies are installed:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Confirm your `.env.local` contains valid Supabase configurations:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run Dev Server**:
   Start the local Next.js development server:
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:3000/app/catalog`.

---

## Verifying the Implementation

### 1. Verification of the Service Isolation (CatalogService)
- Open `lib/services/catalog-service.ts` and verify that all queries utilize `@/lib/supabase/server` client and proper error handling.
- Verify that both `app/app/catalog/page.tsx` and `app/app/catalog/actions.ts` no longer make direct calls to `supabase.from('catalog_items')` but instead call `CatalogService` methods.

### 2. Validation & Sanitization Verification
- Navigate to `/app/catalog` and click "Novo item".
- Try submitting the form with an empty "Unidade de Medida" field. It should block submission and display: `"A unidade de medida é obrigatória."`
- Insert a Name with HTML (e.g. `<b>Item Teste</b>`) and trailing spaces. Save the item.
- Verify in the list that the name displays as `"Item Teste"` (spaces trimmed and HTML tags stripped).
- In mobile view (or responsive emulator), focus on the "Valor Unitário" field and confirm that the numeric keyboard is invoked (i.e. `inputMode="decimal"` is present).

### 3. List Layout & Header Verification
- Verify the layout matches the requested top-to-bottom hierarchy:
  1. Sticky top-0 header containing the page title ("Catálogo" on desktop) and the "Novo item" button (on desktop only).
  2. Search bar aligned next to the "Filtros" button.
  3. Filter chips appearing below the search bar if active.
  4. Listing as a clean rows list with dividers instead of cards.
- Scroll down the list. Ensure the header remains sticky at the top.
- On mobile view, verify that the page title "Catálogo" is integrated into the native app navigation header.
- On mobile view, verify that the "Novo item" button is fixed at the bottom, directly replacing/overlapping the bottom navigation tab bar (bottom nav/tab bar is hidden).

### 4. Detail View Sheet & Menu Actions Verification
- Click on any item. It must open a read-only Sheet.
- **On Desktop**: Ensure "Editar" and "Deletar" buttons are aligned to the right inside the sheet header.
- **On Mobile**: Ensure those actions are collapsed inside a three-dots vertical menu (`⋮`) on the top right.
- Click "Editar". The sheet must seamlessly swap to the edit form without stacking.
- Click "Deletar". A confirmation Dialog must appear. Click confirm. A pill toast should appear at the bottom center saying `"Item deletado com sucesso"`.

### 5. Filtering & Sorting Verification
- Click on "Filtros". A sheet should slide in (side sheet on desktop, full width on mobile).
- Check/uncheck options and change sorting. Click "Aplicar".
- Confirm that the list filters correctly, and corresponding active chips appear below the search bar.
- Uncheck both "Produto" and "Serviço" in the filter sheet. Click "Aplicar". Verify that the page shows an empty state, and a filter chip labeled `[nenhum ×]` is displayed.
- Click `[ Limpar filtros ]` or individual `×` buttons on chips to instantly restore default listing.
