---
phase: 03-booking-engine
plan: 01
subsystem: database
tags: [drizzle, postgresql, appointments, scheduling, date-fns, nanoid, ics]

# Dependency graph
requires:
  - phase: 02-staff-services-content
    provides: staff and services schema for FK references
provides:
  - appointments table with optimistic locking (version column)
  - staffSchedule table for weekly availability
  - appointmentStatusEnum (pending/confirmed/cancelled/completed/no_show)
  - date-fns, @date-fns/utc, nanoid, ics libraries in web app
  - seed script for demo schedule data
affects: [03-02, 03-03, 03-04, 04-payments, 05-notifications]

# Tech tracking
tech-stack:
  added: [date-fns, "@date-fns/utc", nanoid, ics]
  patterns: [optimistic-locking-version-column, text-time-columns, onConflictDoNothing-upsert]

key-files:
  created:
    - packages/db/src/schema/appointments.ts
    - packages/db/scripts/seed.ts
  modified:
    - packages/db/src/schema/index.ts
    - apps/web/package.json

key-decisions:
  - "Text type for time columns (Drizzle time type quirks per RESEARCH)"
  - "Seed script in packages/db/scripts/ (drizzle/ is gitignored)"
  - "Empty arrow function for RLS policies with sql`true` (avoid unused table parameter)"

patterns-established:
  - "Optimistic locking: version integer column, increment on update, check in WHERE"
  - "Cancel token: nanoid() unique column for guest cancel URLs"
  - "Schedule times: text format '09:00' not PostgreSQL time type"

# Metrics
duration: 3min
completed: 2026-01-21
---

# Phase 3 Plan 01: Booking Schema Foundation Summary

**Appointments and staff schedule schema with optimistic locking, date-fns/nanoid/ics dependencies, and seed script for demo data**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-21T13:03:33Z
- **Completed:** 2026-01-21T13:07:28Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Appointments table with version column for optimistic locking and cancelToken for cancel URLs
- Staff schedule table with unique constraint on (staffId, weekday) for weekly availability
- Booking dependencies installed: date-fns, @date-fns/utc, nanoid, ics
- Seed script ready for populating demo schedule and sample appointments

## Task Commits

Each task was committed atomically:

1. **Task 1: Create appointments schema with optimistic locking** - `a9a5cda` (feat)
2. **Task 2: Install booking dependencies in web app** - `297f343` (chore)
3. **Task 3: Create seed script for demo staff schedules** - `51ae358` (feat)

## Files Created/Modified
- `packages/db/src/schema/appointments.ts` - Appointments and staff schedule tables, status enum, relations
- `packages/db/src/schema/index.ts` - Re-exports new schema elements
- `packages/db/scripts/seed.ts` - Demo data seeding for schedules and sample appointments
- `apps/web/package.json` - Added date-fns, @date-fns/utc, nanoid, ics dependencies
- `packages/db/package.json` - Added nanoid for seed script

## Decisions Made
- **Text for time columns:** Used text type for startTime/endTime (format "09:00") instead of PostgreSQL time type, per RESEARCH noting Drizzle time type quirks
- **Seed script location:** Placed in packages/db/scripts/ since packages/db/drizzle/ is gitignored for migration artifacts
- **Empty arrow function for RLS:** Used `() => [...]` instead of `(table) => [...]` for appointments table RLS policies that use `sql`true`` to avoid TypeScript unused variable error

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] nanoid not available in db package for seed script**
- **Found during:** Task 3 (Create seed script)
- **Issue:** nanoid was installed in apps/web but seed script runs from packages/db
- **Fix:** Installed nanoid in packages/db as well
- **Files modified:** packages/db/package.json, pnpm-lock.yaml
- **Verification:** Seed script imports nanoid successfully
- **Committed in:** 51ae358 (Task 3 commit)

**2. [Rule 3 - Blocking] drizzle directory gitignored, seed script couldn't be committed**
- **Found during:** Task 3 (Create seed script)
- **Issue:** packages/db/drizzle/ is gitignored (per commit 2d9bf0e), git add failed
- **Fix:** Moved seed.ts to packages/db/scripts/ which is not ignored
- **Files modified:** packages/db/scripts/seed.ts (new location)
- **Verification:** git add succeeded, file committed
- **Committed in:** 51ae358 (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes necessary to complete task 3. No scope creep.

## Issues Encountered
- TypeScript error for unused `table` parameter in appointments RLS policy - resolved by using empty arrow function `() =>` since policy uses `sql`true`` without table column references

## User Setup Required

None - no external service configuration required. Schema additions will be applied when user runs `pnpm db:push` with DATABASE_URL configured.

## Next Phase Readiness
- Schema foundation complete for booking engine
- Plan 02 can build availability calculation endpoint
- Plan 03 can build booking wizard UI
- Seed script ready: `npx tsx packages/db/scripts/seed.ts` (requires DATABASE_URL)

---
*Phase: 03-booking-engine*
*Plan: 01*
*Completed: 2026-01-21*
