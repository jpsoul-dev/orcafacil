# Tasks: Catalog Refactoring & Improvements

**Input**: Design documents from `/specs/007-catalog-refactor/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Path is project-relative starting from repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initial project preparation and structure alignment.

- [x] T001 Initialize catalog workspace by verifying current branch `007-catalog-refactor` is active and Next.js dev server builds successfully.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database isolation service and backend validation logic. This phase MUST be completed before UI components are refactored.

- [x] T002 [P] Create the data isolation service in `lib/services/catalog-service.ts` implementing `getCatalogItemsPaged`, `saveCatalogItem`, and `deleteCatalogItem` with full multi-tenant isolation checks.
- [x] T003 [P] Refactor `app/app/catalog/actions.ts` to replace direct Supabase client calls with methods from `CatalogService`.
- [x] T004 Refactor `app/app/catalog/page.tsx` to query data via `CatalogService.getCatalogItemsPaged` instead of direct Supabase queries.

**Checkpoint**: Foundation ready - catalog service is integrated and the page functions with isolated queries.

---

## Phase 3: User Story 1 - Read-Only Item Details Sheet & Actions (Priority: P1) 🎯 MVP

**Goal**: Expose a read-only sheet detailing item specifications upon clicking a list row, offering Edit/Delete actions.

**Independent Test**: Clicking a row opens a non-editable details sheet. Clicing "Editar" closes the sheet and loads the form. Clicking "Deletar" spawns a confirmation dialog.

- [x] T005 [P] [US1] Create the read-only visualizer component in `app/app/catalog/components/catalog-view-sheet.tsx` rendering Item Name, Description, Type, Price, and Unit of Measure.
- [x] T006 [US1] Add responsive action buttons to `app/app/catalog/components/catalog-view-sheet.tsx` (regular buttons aligned right on desktop; vertical three-dots dropdown menu `⋮` on mobile).
- [x] T007 [US1] Connect the delete action inside `app/app/catalog/components/catalog-view-sheet.tsx` with the confirmation dialog in `app/app/catalog/delete-item-dialog.tsx`.
- [x] T008 [US1] Wire up `app/app/catalog/catalog-list.tsx` to handle the `activeViewItem` state and trigger the sheet when a list row is clicked.

**Checkpoint**: User Story 1 is functional. Items can be viewed in read-only sheets, and actions can be triggered.

---

## Phase 4: User Story 2 - Modernized Clean List Layout & Sticky Header (Priority: P1)

**Goal**: Remove cards and containers, render items as clean table rows with dividers, and fix the header to the top of the scroll viewport.

**Independent Test**: Scroll down the page and verify header stickiness. Check that listing exhibits rows separated by borders rather than card components.

- [x] T009 [P] [US2] Delete the deprecated card component `app/app/catalog/components/catalog-card.tsx`.
- [x] T010 [US2] Re-implement the row item layout inside `app/app/catalog/catalog-list.tsx` to use flexbox list rows with horizontal dividers, showing the price format `R$ valor/unidade` alinhada à direita, a type badge below the name, and a trailing chevron `›`.
- [x] T011 [US2] Refactor `app/app/catalog/page.tsx` to style the header wrapper as `sticky top-0 z-50 bg-background/95 backdrop-blur-xs` for scroll locking.
- [x] T012 [US2] Modify `app/app/catalog/catalog-list.tsx` action bar to align the search input and the filter button horizontally on the same line, removing wrapper card elements.

**Checkpoint**: Listing is modern, clean, sticky on scroll, and card wrappers are eliminated.

---

## Phase 5: User Story 3 - Comprehensive Filtering & Sorting (Priority: P2)

**Goal**: Filter by type (checkboxes) and sort (radio buttons) inside a responsive sheet, outputting active query chips below search.

**Independent Test**: Open filter panel, check type/sort options, apply and verify chips appear. Clicking chip `×` or `[ Limpar filtros ]` updates URL search queries live.

- [x] T013 [P] [US3] Delete the deprecated tabs component `app/app/catalog/components/catalog-filter.tsx`.
- [x] T014 [US3] Create the filter sheet component in `app/app/catalog/components/catalog-filter-sheet.tsx` with multi-select checkboxes for Type (Produto, Serviço) and single-select radio buttons for Sorting.
- [x] T015 [US3] Integrate responsive styling in `app/app/catalog/components/catalog-filter-sheet.tsx` (side sheet on desktop; full-width `w-full` sheet on mobile devices).
- [x] T016 [US3] Implement URL query parameter bindings and the active chips container (including the `[nenhum ×]` fallback and `[ Limpar filtros ]` buttons) inside `app/app/catalog/catalog-list.tsx`.

**Checkpoint**: Filtering and sorting are URL-driven, reactive, and responsive.

---

## Phase 6: User Story 4 - Strict Form Validation, Keyboards & Sanitization (Priority: P2)

**Goal**: Force decimal keyboard on mobile inputs, validate mandatory measurement units, and sanitize string fields via Zod transformation.

**Independent Test**: Focus price field on mobile emulator and check keyboard type. Submit empty unit of measure to assert rejection. Check database entries to verify HTML tags were stripped.

- [x] T017 [P] [US4] Add `inputMode="decimal"` on the `unit_price` field in `app/app/catalog/catalog-form.tsx`.
- [x] T018 [US4] Update Zod schema rules inside `app/app/catalog/actions.ts` to require `unit_measure` (remove optional/nullable attributes).
- [x] T019 [US4] Implement HTML-tag stripping regex (`/<[^>]*>/g`) and trim functions inside the Zod schemas of `app/app/catalog/actions.ts` and `app/app/catalog/catalog-form.tsx`.

**Checkpoint**: Form validations are strict, inputs are sanitized against XSS/HTML, and mobile UX has decimal keyboard support.

---

## Phase 7: User Story 5 - Native Mobile UI Alignment (Priority: P2)

**Goal**: Hide main page title from viewport on mobile to leverage app native navigation header, and lock "Novo item" button at the bottom of mobile viewport replacing bottom nav tab bar.

**Independent Test**: Inspect app on mobile viewports. Check that the title "Catálogo" is hidden from content, and "Novo item" covers the tab bar area at bottom.

- [x] T020 [US5] Add mobile-hiding utility classes to the header title in `app/app/catalog/page.tsx` (visible only on desktop viewports).
- [x] T021 [US5] Update `app/app/catalog/catalog-list.tsx` (or `page.tsx`) to conditionally render the "Novo item" button as a fixed full-width element at `bottom-0` on mobile viewports, hiding the default bottom navigation bar on this route.

**Checkpoint**: Mobile viewport layouts hide duplicate titles and anchor primary actions securely in place of the bottom navigation bar.

---

## Phase 8: User Story 6 - Compact Pill Notifications (Priority: P3)

**Goal**: Display compact, center-bottom rounded toasts (pills) for catalog mutation feedbacks.

**Independent Test**: Save or delete items, and verify that center-bottom pill toasts appear and dismiss smoothly after 2 seconds.

- [x] T022 [P] [US6] Create a pill-toast helper in `app/app/catalog/components/pill-toast.ts` using `sonner` configured with `position: "bottom-center"`, `duration: 2000`, and rounded-full tailwind classes.
- [x] T023 [US6] Replace all `toast` notifications in `app/app/catalog/catalog-form.tsx` and `app/app/catalog/delete-item-dialog.tsx` with the new `showPillToast` utility.

**Checkpoint**: Feedback notifications in the catalog are formatted as elegant, center-bottom rounded pills.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, hygiene, and full manual validation.

- [x] T024 Perform verification checks documented in `specs/007-catalog-refactor/quickstart.md` across both mobile and desktop views.
- [x] X T025 Review modified files to remove unused imports, dead variables, and print debugging statements (hygiene cleanup).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion. Blocks Phase 3+.
- **User Story 1 (Phase 3)**: MVP goal. Must complete before lists are refactored.
- **User Story 2 (Phase 4)**: Refactors the list page structure.
- **User Story 3 (Phase 5)**: Filters for the new list page.
- **User Stories 4 to 6 (Phases 6-8)**: Can execute in parallel or sequence.
- **Polish (Phase 9)**: Executed last.

### Parallel Opportunities

- T002, T003 can run in parallel (service and action setup).
- T005, T006, T007 (view sheet components) can run in parallel.
- Once Foundation (Phase 2) is finished, independent stories can be allocated to different developers.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup and Foundational database isolation.
2. Build read-only View Sheet and wire click handlers in the list.
3. Validate detail sheet viewing, edit swapping, and delete triggers.
