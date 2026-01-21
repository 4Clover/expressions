---
phase: 02-staff-services-content
plan: 01
subsystem: ui, database
tags: [svelte, drizzle, rls, sveltekit, ssr]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: database schema (staff, services, staffServices tables), design system tokens
provides:
  - Drizzle relations for staff/services eager loading
  - RLS policies for public read access
  - Staff display components (StaffCard, StaffProfile)
  - Service display components (PriceDisplay, ServiceCard, ServiceCategory)
  - Staff listing page (/staff)
  - Staff profile page (/staff/[slug])
  - Services catalog page (/services)
affects: [02-02, 03-booking-flow, 04-payments]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Drizzle relations v2 with eager loading
    - RLS policies for anonymous read access
    - Server-side data loading with +page.server.ts
    - Graceful empty state handling for missing database

key-files:
  created:
    - packages/db/src/schema/staff.ts (relations, RLS)
    - packages/db/src/schema/services.ts (relations, RLS)
    - apps/web/src/lib/components/staff/StaffCard.svelte
    - apps/web/src/lib/components/staff/StaffProfile.svelte
    - apps/web/src/lib/components/services/PriceDisplay.svelte
    - apps/web/src/lib/components/services/ServiceCard.svelte
    - apps/web/src/lib/components/services/ServiceCategory.svelte
    - apps/web/src/routes/staff/+page.svelte
    - apps/web/src/routes/staff/+page.server.ts
    - apps/web/src/routes/staff/[slug]/+page.svelte
    - apps/web/src/routes/staff/[slug]/+page.server.ts
    - apps/web/src/routes/services/+page.svelte
    - apps/web/src/routes/services/+page.server.ts
  modified:
    - packages/db/src/schema/index.ts

key-decisions:
  - "RLS policies use anonRole + authenticatedRole for public pages"
  - "Slug-to-name conversion: jane-doe -> Jane Doe (simple case, may need refinement)"
  - "Per-stylist custom pricing displayed when set, else base service price"

patterns-established:
  - "Drizzle relations pattern: define relations in same file as table, export from index"
  - "Price display pattern: cents to dollars formatting with type-aware display"
  - "Staff profile slug pattern: display name kebab-cased for URL"

# Metrics
duration: 7min
completed: 2026-01-21
---

# Phase 2 Plan 1: Staff and Services Display Pages Summary

**Database-driven staff listing, individual profiles, and service catalog with per-stylist pricing using Drizzle relations and RLS policies**

## Performance

- **Duration:** 7 min
- **Started:** 2026-01-21T11:46:25Z
- **Completed:** 2026-01-21T11:53:26Z
- **Tasks:** 3
- **Files modified:** 17

## Accomplishments
- Drizzle relations v2 enable eager loading for staff profiles with services
- RLS policies allow anonymous users to view active staff and services
- Staff listing page with responsive grid of StaffCard components
- Individual staff profile shows bio, specialties, and their available services with custom pricing
- Services catalog organizes services by category with correct price display (fixed/starting/range)
- All pages gracefully handle empty database state

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Drizzle relations and public RLS policies** - `8b8a1cb` (feat)
2. **Task 2: Create staff and service display components** - `c5f8bed` (feat)
3. **Task 3: Create staff and services pages with server data loading** - `76053ca` (feat)

## Files Created/Modified

### Database Schema
- `packages/db/src/schema/staff.ts` - Added staffRelations (profile, staffServices), RLS policy for active staff
- `packages/db/src/schema/services.ts` - Added serviceCategoriesRelations, servicesRelations, staffServicesRelations, RLS policies
- `packages/db/src/schema/index.ts` - Export all relations

### Staff Components
- `apps/web/src/lib/components/staff/StaffCard.svelte` - Card display with photo, name, bio, specialties
- `apps/web/src/lib/components/staff/StaffProfile.svelte` - Full profile with grouped services by category
- `apps/web/src/lib/components/staff/index.ts` - Component exports

### Services Components
- `apps/web/src/lib/components/services/PriceDisplay.svelte` - Handles fixed/starting/range price formats
- `apps/web/src/lib/components/services/ServiceCard.svelte` - Service with name, duration, price
- `apps/web/src/lib/components/services/ServiceCategory.svelte` - Groups services under category heading
- `apps/web/src/lib/components/services/index.ts` - Component exports

### Route Pages
- `apps/web/src/routes/staff/+page.server.ts` - Loads active staff from database
- `apps/web/src/routes/staff/+page.svelte` - Staff listing grid
- `apps/web/src/routes/staff/[slug]/+page.server.ts` - Loads staff member with services (eager loading)
- `apps/web/src/routes/staff/[slug]/+page.svelte` - Individual profile page
- `apps/web/src/routes/services/+page.server.ts` - Loads service categories with services
- `apps/web/src/routes/services/+page.svelte` - Service catalog by category

## Decisions Made
- **RLS policies use combined anonRole + authenticatedRole:** Ensures public pages work for all visitors
- **Simple slug conversion (kebab to title case):** Works for most names; may need enhancement for edge cases (O'Brien, etc.)
- **Custom price display priority:** If staff has custom price, show that; otherwise show service base price with type indicator

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed Storyblok component type errors**
- **Found during:** Task 2 (component creation)
- **Issue:** Pre-existing storyblok.ts imported components that existed but had TypeScript errors (ISbRichtext not exported from @storyblok/svelte, Svelte 5 component type mismatch)
- **Fix:** Changed ISbRichtext to any with type assertion for renderRichText, added type assertion for component registration
- **Files modified:** apps/web/src/lib/storyblok.ts, apps/web/src/lib/components/storyblok/ContactInfo.svelte, apps/web/src/lib/components/storyblok/RichTextBlock.svelte
- **Verification:** pnpm check passes with 0 errors
- **Note:** These files were staged from a previous session; fixes were necessary to unblock the build

---

**Total deviations:** 1 auto-fixed (blocking issue)
**Impact on plan:** Minimal - type fixes were necessary to allow pnpm check to pass. No scope creep.

## Issues Encountered
None - all tasks executed as planned.

## User Setup Required
None - no external service configuration required for this plan. Database tables and RLS policies will be applied on next `db:push` when Supabase is configured.

## Next Phase Readiness
- Staff and services pages ready for content
- Drizzle relations enable efficient queries for booking flow (Phase 3)
- Plan 02-02 (CMS Integration) can use staff/services data for homepage highlights
- RLS policies ready for Supabase deployment

---
*Phase: 02-staff-services-content*
*Plan: 01*
*Completed: 2026-01-21*
