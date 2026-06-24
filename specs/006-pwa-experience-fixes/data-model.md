# Data Model & Storage

No database schema migrations are required for this feature, as all improvements are concentrated on the frontend user experience (UX) and PWA setup.

## Current Schema Consumption

The form in `/app/quotes/new` and `/app/quotes/[id]/edit` interacts with the following existing entities in the Supabase database:

### 1. `quotes`
- Primary table containing header information for quotes (customer reference, validity date, totals, discount type, payment methods, notes, status).
- **RLS Policy**: Row Level Security is active. Users can only write/read rows belonging to their corresponding `tenant_id`.

### 2. `quote_items`
- Contains individual items linked to a quote, including catalog item reference (optional), quantity, price, and item-level discount.
- **RLS Policy**: Row Level Security is active. Inherited boundaries apply.

### 3. `companies`
- Holds tenant/company data. Used in layout header to render the active company name.

### 4. `profiles`
- Represents the authenticated user profile, used to check permissions and subscription statuses.

## Local Storage & Cache Boundaries

### 1. Service Worker Caching (`public/sw.js`)
- **App Shell Cache**: Cache key `orcafacil-app-shell-v1`. Stores static assets (CSS, JS bundles, manifest metadata, local fonts, and icons).
- **Network-First Pages**: Service worker implements network-first with a cache fallback strategy for the application dashboard shell `/app` to ensure the interface can load in offline conditions.

### 2. Offline Form Resilience
- Draft quotes values are stored in memory via React Hook Form states during the session.
- If network connection drops at submit time, local state is preserved in the form component, displaying an active visual alert so the user doesn't navigate away and lose changes.
