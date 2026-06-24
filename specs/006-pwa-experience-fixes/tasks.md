# Tasks: PWA Mobile Experience Improvements

**Input**: Design documents from `/specs/006-pwa-experience-fixes/`

**Prerequisites**: plan.md (required), spec.md (required)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify and ensure presence of icons in public/android-chrome-192x192.png, public/android-chrome-512x512.png, and public/apple-touch-icon.png

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core layout shell updates that MUST be complete before user stories can be implemented

- [x] T002 Add the `group` class to the `<SidebarInset>` element in app/app/layout.tsx
- [x] T003 Add CSS selectors `max-sm:group-has-[.hide-global-header-mobile]:hidden` to the header and MobileTabBar in app/app/layout.tsx

**Checkpoint**: Foundation ready - user story layout hides dynamically when child is marked with `.hide-global-header-mobile`.

---

## Phase 3: User Story 1 - Header & Footer Screen Area Optimization on Mobile (Priority: P1) 🎯 MVP

**Goal**: Hide global header/navigation on mobile and shift actions to the upper AppBar for new and edit quote forms.

**Independent Test**: Load `/app/quotes/new` or `/app/quotes/[id]/edit` on mobile device simulation. Verify that the global header and MobileTabBar are hidden, the AppBar is displayed with actions "Voltar" (left) and "Gerar/Salvar" (right), and the bottom buttons do not overlap as a fixed overlay.

### Implementation for User Story 1

- [x] T004 [US1] Add the class `hide-global-header-mobile` to the main root element in app/app/quotes/components/quote-form.tsx
- [x] T005 [US1] Modify the mobile AppBar container in app/app/quotes/components/quote-form.tsx to include the submit action button on the top right
- [x] T006 [US1] Update the actions footer container class in app/app/quotes/components/quote-form.tsx to avoid being fixed on mobile (`max-sm`)

**Checkpoint**: User Story 1 is functional. Form headers/footers do not compete for viewport space on mobile device simulation.

---

## Phase 4: User Story 2 - PWA Installation Configuration & Assets Setup (Priority: P2)

**Goal**: Configure metadata and manifest settings to enable mobile app installation with correct icons.

**Independent Test**: Open Chrome DevTools Application -> Manifest. Check that icons `192x192` and `512x512` are listed without errors, and check that the Apple touch icon is declared correctly.

### Implementation for User Story 2

- [x] T007 [P] [US2] Modify app/manifest.ts to map to the valid PNG icons and remove the invalid `/icon.svg`
- [x] T008 [P] [US2] Update metadata, viewport statusBarStyle, and viewportFit properties in app/layout.tsx

**Checkpoint**: PWA is installable in Chrome DevTools with no resource errors.

---

## Phase 5: User Story 3 - Preventing Zoom and Optimizing Input Usability (Priority: P2)

**Goal**: Avoid automatic iOS page zoom on input focus and show the decimal virtual keyboard for values.

**Independent Test**: Tap unit price and discount inputs in iOS Safari; virtual decimal keyboard opens, page scale remains intact.

### Implementation for User Story 3

- [x] T009 [US3] Modify unit price input in app/app/quotes/components/quote-form.tsx to set `inputMode="decimal"` and force a minimum font size of `text-base` for mobile viewports
- [x] T010 [P] [US3] Modify discount input in components/ui/discount-input.tsx to use `inputMode="decimal"` and set font size to `text-base` on mobile

**Checkpoint**: Input fields are numeric and do not trigger layout scale changes on iOS touch devices.

---

## Phase 6: User Story 4 - Touch Targets Optimization (Priority: P3)

**Goal**: Maximize click target sizes for small buttons to prevent misclicks on touch screens.

**Independent Test**: Inspect item delete, discount help, and edit buttons. Confirm they have a hit target area of at least 44px × 44px.

### Implementation for User Story 4

- [x] T011 [US4] Increase click area of delete button `Trash2` in app/app/quotes/components/quote-form.tsx from `h-9 w-9` to `h-11 w-11`
- [x] T012 [P] [US4] Increase padding of discount help button in app/app/quotes/components/quote-form.tsx from `p-0.5` to `p-2`
- [x] T013 [P] [US4] Increase click area of global discount edit trigger in app/app/quotes/components/quote-form.tsx to `h-10 w-10`

**Checkpoint**: All interactive utility buttons conform to mobile touch target guidelines (>= 44px).

---

## Phase 7: User Story 5 - Dialog Catalog to Drawer (Bottom Sheet) Transition (Priority: P3)

**Goal**: Display catalog search modal as an ergonomic slide-up drawer on mobile screens.

**Independent Test**: Open catalog picker on mobile; sheet slides up from bottom. Open on desktop; catalog remains in a modal dialog.

### Implementation for User Story 5

- [x] T014 [US5] Implement dynamic layout shift (Drawer on mobile, Dialog on desktop) for catalog modal in app/app/quotes/components/quote-form.tsx using a media query hook

**Checkpoint**: Catalog picker opens as a bottom sheet drawer on small screen sizes.

---

## Phase 8: User Story 6 - Basic Service Worker Offline Support (Priority: P3)

**Goal**: Register a custom Service Worker to caching static files and handling simple offline states.

**Independent Test**: Inspect Application -> Service Workers in DevTools to check sw.js is running. Toggle offline mode in Network tab and refresh `/app` dashboard.

### Implementation for User Story 6

- [x] T015 [US6] Create basic Service Worker script public/sw.js to handle static caching of App Shell assets
- [x] T016 [P] [US6] Create client registration wrapper component in components/pwa-register.tsx
- [x] T017 [US6] Render `<PwaRegister />` inside the root layout in app/layout.tsx

**Checkpoint**: Service worker is registered and serves the dashboard shell correctly under offline scenarios.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final formatting, cleaning, and performance validation

- [x] T018 Run code quality formatting and check typescript errors via `npm run lint`
- [x] T019 Perform complete manual testing workflows using specs/006-pwa-experience-fixes/quickstart.md
- [x] T020 [P] Validate build compatibility by running `npm run build`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion. Blocks US1 layout integration.
- **User Stories (Phase 3+)**: Depend on Foundational completion.
  - US1 (Phase 3) must be implemented first to lay out form structure.
  - US2 (Phase 4), US3 (Phase 5), US4 (Phase 6), US5 (Phase 7), and US6 (Phase 8) are independent of each other and can be worked on in parallel.
- **Polish (Phase 9)**: Requires all prior user stories to be completed.

---

## Parallel Opportunities

- Tasks marked with `[P]` in setup and foundational phases can run in parallel.
- Once Phase 3 (US1) is complete, Phases 4 through 8 can be implemented in parallel by different developers.
- Within Phase 6, T012 and T013 can run in parallel.
- Within Phase 8, T016 can run in parallel with T015.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup (Phase 1).
2. Complete Foundational (Phase 2).
3. Complete User Story 1 (Phase 3).
4. **STOP and VALIDATE**: Verify mobile layout works correctly on Simulated Mobile viewports without overlapping header/footer.
5. Deploy/Demo layout improvements.

### Incremental Delivery

1. Deploy MVP first (Mobile layout fixes).
2. Deploy PWA Setup & Assets (US2).
3. Deploy Zoom and Usability improvements (US3, US4).
4. Deploy Mobile Drawer Catalogue (US5).
5. Deploy Service Worker Offline Shell caching (US6).
