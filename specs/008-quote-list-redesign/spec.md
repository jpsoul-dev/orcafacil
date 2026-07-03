# Feature Specification: Redesign Quote List

**Feature Branch**: `008-quote-list-redesign`

**Created**: 2026-07-03

**Status**: Draft

**Input**: User description: "preciso implementar as melhorias sugeridas pelo P.O relatadas no artifacts/stackholders/20260702-melhoria-redesenho-listagem-orcamentos.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Desktop Layout Redesign and List View (Priority: P1)

As a user, I want to view my quotes in a compact list format instead of large cards so that I can see more quotes on the screen at once and scan the information quickly.

**Why this priority**: Crucial for improving information density and alignment with the new visual identity of the design system.

**Independent Test**: Can be fully tested by loading the quote list page on a desktop viewport and verifying that quotes are rendered in rows separated by subtle dividers, with the required hierarchy of information (ID, creation date, title, customer, total value, and status pill).

**Acceptance Scenarios**:

1. **Given** that I am on the quote list page on desktop, **When** the page loads, **Then** I should see quotes displayed in a list with thin dividers between them, showing the quote ID, creation date (below ID, smaller and secondary color), description (bold, prominent), customer name, total value, and status pill (low contrast, aligned to design system).
2. **Given** the quote list page on desktop, **When** looking at the top header, **Then** I should see the title "Meus Orçamentos", a back button, and the primary "Novo Orçamento" action button aligned on the same row.

---

### User Story 2 - Real-time Search with Debounce and Active Filter Chips (Priority: P1)

As a user, I want to type in the search bar and see the quote list filter dynamically in real-time, and see active filters displayed as removable chips.

**Why this priority**: Enhances usability by letting users quickly find specific quotes without page reloads or manual form submissions.

**Independent Test**: Can be tested by typing in the search bar and observing the automatic update of the list after a small delay, and applying a filter to see the chip appear and disappear when clicked.

**Acceptance Scenarios**:

1. **Given** that I type "ORC-001" in the search bar, **When** I stop typing for 300ms, **Then** the quote list should automatically filter to show matching quotes.
2. **Given** that a filter is applied (e.g., Status: Draft), **When** the list updates, **Then** a chip reading "Status: Rascunho" with an "x" close icon should appear below the search bar.
3. **Given** an active filter chip, **When** I click on its close icon, **Then** the filter should be removed, the list should refresh, and the chip should disappear. If no active filters remain, the "Limpar filtros" button should also disappear.

---

### User Story 3 - Unified Filtering and Sorting Panel (Priority: P1)

As a user, I want to click a single filter button to open a side panel where I can configure data filters, sorting options, and multiple status filters.

**Why this priority**: Consolidates all filtering and sorting controls, removing visual clutter from the main page.

**Independent Test**: Can be tested by clicking the "Filtros" button on desktop, verifying that a side sheet opens containing options for date ranges, sort order, and multiple status checkboxes, and that applying them updates the main list.

**Acceptance Scenarios**:

1. **Given** that I am on desktop, **When** I click the "Filtros" button, **Then** a side panel (Sheet) should slide in from the right.
2. **Given** the filter panel open, **When** I select multiple statuses (e.g., "Rascunho" and "Enviado"), set a date range, and choose sorting "Valor Total (Maior primeiro)", **Then** the quote list should update to reflect these criteria.

---

### User Story 4 - Mobile View Enhancements (Priority: P2)

As a user accessing the application on a mobile device, I want the list, header, search bar, and filter controls to adapt to smaller screens for an optimal mobile experience.

**Why this priority**: Essential for consistency with the mobile Catalog design and overall mobile usability.

**Independent Test**: Can be tested by loading the quote list page in a mobile viewport, verifying that the create button moves to a bottom floating action button, the title moves to the app header, the filter panel opens fullscreen, and the status selector opens in a bottom drawer.

**Acceptance Scenarios**:

1. **Given** that I access the quote list page on a mobile device, **When** the page renders, **Then** the page title should be in the app's top header and a floating "Novo Orçamento" button should be visible at the bottom of the screen.
2. **Given** that I am on mobile, **When** I click the "Filtros" button, **Then** the filter panel should open in fullscreen mode.
3. **Given** the mobile filter panel open, **When** I tap the status selector, **Then** a bottom drawer should slide up containing the checkboxes to select multiple statuses.

---

### Edge Cases

- **No Quotes Found**: When search or filters return no results, the system must show a clean empty state illustration with a clear message and a button to reset all filters.
- **Loading State**: While data is being fetched from the database, the list must display a skeleton loader matching the dense list item layout to prevent layout shifts.
- **Very Long Titles or Client Names**: If a quote description or customer name is too long, the text must truncate gracefully with an ellipsis (`...`) to prevent breaking the table/list layout.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The quote list MUST be rendered as a dense vertical list with subtle dividers between items, eliminating card containers.
- **FR-002**: The layout MUST be mobile-first and adapt according to the device's screen size.
- **FR-003**: The header on desktop MUST align the title "Meus Orçamentos", the back button, and the primary "Novo Orçamento" button on a single line.
- **FR-004**: The header on mobile MUST place the page title in the app header and display the primary "Novo Orçamento" action as a floating button at the bottom of the screen.
- **FR-005**: The search bar and filters button MUST share a single row on desktop and mobile.
- **FR-006**: The search input MUST trigger automatic filtering of the quote list in real-time with a debounce delay of 300ms.
- **FR-007**: Filters and sorting controls MUST be contained inside a unified filters panel.
- **FR-008**: The filter panel MUST open as a side Sheet on desktop and as a full-screen modal on mobile.
- **FR-009**: Status selection inside the mobile filter panel MUST open in a bottom Drawer containing checkboxes for multi-select.
- **FR-010**: Applied filters MUST be shown as interactive chips below the search row, allowing individual removal by clicking a close (x) icon.
- **FR-011**: A "Limpar filtros" button MUST be displayed next to the chips when one or more filters are active, clearing all filters when clicked.
- **FR-012**: Each quote item in the list MUST display: ID/code, creation date (under ID, smaller, secondary color), description/title (prominent weight), client name, total value, and status pill.
- **FR-013**: Quote status pills MUST use low-contrast, theme-appropriate colors from the Design System (`--ds-color-status-*`).
- **FR-014**: The system MUST support sorting by: Creation Date (Newest/Oldest), Total Value (Highest/Lowest), and Quote Title (A-Z/Z-A).
- **FR-015**: The system MUST render a skeleton loader during data fetching and an empty state message with a reset button when no results match search/filters.

### Key Entities

- **Quote**: Represents the budget proposal, with attributes like ID (code), Title, Customer Name, Total Value, Creation Date, and Status.
- **FilterState**: Represents the active filter and sorting criteria, including search query, selected statuses, date range, and sort order.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can filter and find a specific quote by code or customer name in under 5 seconds.
- **SC-002**: The quote list information density increases by at least 40%, allowing more quotes to be visible on desktop screens without scrolling.
- **SC-003**: 100% of UI elements (dividers, text hierarchy, status pills, sheets, drawers) strictly comply with the Design System tokens and layout rules.
- **SC-004**: Filter panel opening transition on both desktop (Sheet) and mobile (Fullscreen/Drawer) is smooth (rendering under 100ms without layout shifting).

## Assumptions

- The base database schemas and RLS policies for quotes remain unchanged (out of scope).
- The list uses the existing quote fetching service in `lib/services/`, which will be extended/updated to support multi-status filtering, sorting, and text search if needed.
- Standard browser back navigation or parent routing is used for the back button in the header.
