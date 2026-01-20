---
phase: 01-foundation
plan: 02
subsystem: data-layer
tags: [drizzle, supabase, postgresql, rls, monorepo]
dependency_graph:
  requires: [01-01]
  provides: ["db-package", "schema-profiles", "schema-staff", "schema-services"]
  affects: [01-03, 02-01, 03-01]
tech_stack:
  added: [drizzle-orm, drizzle-kit, postgres]
  patterns: [rls-policies, workspace-packages, transaction-pooler]
key_files:
  created:
    - packages/db/package.json
    - packages/db/tsconfig.json
    - packages/db/drizzle.config.ts
    - packages/db/src/index.ts
    - packages/db/src/schema/index.ts
    - packages/db/src/schema/profiles.ts
    - packages/db/src/schema/staff.ts
    - packages/db/src/schema/services.ts
    - apps/web/src/routes/+page.server.ts
    - apps/web/.env.example
  modified:
    - apps/web/package.json
    - apps/web/src/routes/+page.svelte
    - turbo.json
decisions:
  - id: prepare-false
    choice: "Use prepare: false for postgres client"
    rationale: "Required for Supabase transaction pooler mode"
  - id: price-in-cents
    choice: "Store prices as integers (cents)"
    rationale: "Avoid floating point precision issues"
  - id: price-type-enum
    choice: "Use enum for price types (fixed/starting/range)"
    rationale: "Supports salon pricing models - fixed, starting-from, and ranges"
metrics:
  duration: 5 min
  completed: 2026-01-20
---

# Phase 01 Plan 02: Database Package with Drizzle Summary

Drizzle ORM schema with profiles/staff/services tables, RLS policies, and Supabase connection using prepare: false for transaction pooler compatibility.

## What Was Built

### Database Package (@repo/db)
- **Package Structure:** Workspace package with exports for db client and schema
- **Drizzle Config:** PostgreSQL dialect targeting Supabase
- **Connection:** Using postgres driver with `prepare: false` (critical for Supabase pooler)

### Schema Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| profiles | User profiles linked to Supabase Auth | userId, email, role |
| staff | Stylist information | profileId FK, displayName, specialties[], isActive |
| service_categories | Service groupings | name, displayOrder |
| services | Available services | categoryId FK, durationMinutes, priceType, priceMin/Max |
| staff_services | Per-stylist pricing junction | staffId FK, serviceId FK, customPrice |

### RLS Policies
- profiles: Users can view/update only their own profile
- Other tables: RLS to be added in Phase 7 (admin features)

### Integration
- apps/web depends on @repo/db via workspace protocol
- Homepage shows database connection status (dev helper)
- Graceful handling when DATABASE_URL not configured

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 83acee5 | feat | Create database package with Drizzle ORM |
| 1cc2330 | feat | Add database connection verification |

Note: Schema files (profiles.ts, staff.ts, services.ts) were committed in a prior session as part of 01-03 commits (6dfe14d, 66cadbd). This occurred due to session overlap.

## Decisions Made

1. **prepare: false for Supabase** - Transaction pooler mode doesn't support prepared statements. This setting is critical to avoid "prepared statement does not exist" errors.

2. **Prices in cents (integers)** - Storing $45.00 as 4500 cents avoids floating point precision issues in calculations.

3. **Price type enum (fixed/starting/range)** - Salon services have different pricing models: fixed ($45), starting from ($65+), or ranges ($45-65).

4. **Per-stylist pricing junction** - staffServices table allows custom prices per stylist while defaulting to service price if null. Supports booth rental model flexibility.

## Deviations from Plan

### Session Overlap
Task 2 schema files were committed in a prior session's plan 01-03 execution. The work was complete but committed under different commit messages. This is documented for traceability.

### Auto-fixed Issues
**1. [Rule 3 - Blocking] Missing sql export from @repo/db**
- **Found during:** Task 3 verification
- **Issue:** TypeScript couldn't find drizzle-orm module when importing sql in apps/web
- **Fix:** Re-exported sql from @repo/db/src/index.ts
- **Files modified:** packages/db/src/index.ts
- **Commit:** 1cc2330

## Verification Results

- pnpm install: Workspace dependency resolved
- pnpm check: TypeScript compiles (0 errors, 0 warnings)
- pnpm dev: Starts successfully, shows "Database not configured" gracefully
- Schema exports: All tables exported from @repo/db/schema

## Next Phase Readiness

**Ready for:**
- Phase 2 (Booking Core) - Can define appointments table with FK to staff/services
- Phase 3 (Calendar) - Schema foundation in place

**Prerequisites for db:push:**
- User must configure Supabase project
- Add DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY to .env
- Run `pnpm --filter @repo/db db:push` to sync schema

**Open items:**
- RLS policies for staff/services (Phase 7)
- Database seeding (future plan)
