---
phase: 02-staff-services-content
plan: 03
subsystem: content
tags: [sveltekit, storyblok, cms, marketing-pages]

dependency_graph:
  requires:
    - 02-01 (staff/services display pages)
    - 02-02 (Storyblok SDK and block components)
  provides:
    - CMS-driven homepage with live editing
    - About page with salon story content
    - Contact page with location and hours
    - Staff API endpoint for real data
  affects:
    - Phase 4 booking (homepage CTA integration)
    - Phase 7 launch (marketing page content)

tech_stack:
  added:
    - Badge UI component
  patterns:
    - Storyblok bridge pattern for live editing
    - Fallback content for graceful degradation
    - API endpoint for database queries

key_files:
  created:
    - apps/web/src/routes/+page.ts
    - apps/web/src/routes/about/+page.ts
    - apps/web/src/routes/about/+page.svelte
    - apps/web/src/routes/contact/+page.ts
    - apps/web/src/routes/contact/+page.svelte
    - apps/web/src/routes/api/staff/+server.ts
    - apps/web/src/lib/components/ui/badge/badge.svelte
    - apps/web/src/lib/components/ui/badge/index.ts
  modified:
    - apps/web/src/routes/+page.svelte
    - apps/web/src/lib/components/storyblok/StaffHighlights.svelte
    - apps/web/src/lib/components/gallery/GalleryGrid.svelte

decisions:
  - key: storyblok-bridge-pattern
    choice: Use $derived with storyFromBridge fallback to data.story
    reason: Svelte 5 strictness requires avoiding direct $state(data.prop) pattern
  - key: staff-api-endpoint
    choice: Dynamic import of @repo/db in API route
    reason: Avoids runtime errors when DATABASE_URL not configured
  - key: badge-component
    choice: Created new Badge UI component
    reason: Needed for displaying staff specialties in StaffHighlights

metrics:
  duration: 4 min
  completed: 2026-01-21
---

# Phase 02 Plan 03: Marketing Pages Summary

CMS-driven homepage, about, and contact pages with Storyblok visual editor support and database-driven staff highlights.

## What Was Built

### Homepage (/)
- Fetches 'home' story from Storyblok CDN
- Renders CMS blocks (Hero, ServicesOverview, StaffHighlights) via StoryblokComponent
- Live editing enabled via useStoryblokBridge
- Fallback content displays when CMS not configured (existing landing page)

### About Page (/about)
- Fetches 'about' story from Storyblok
- Fallback shows salon story with image placeholder
- SEO title and meta description set

### Contact Page (/contact)
- Fetches 'contact' story from Storyblok
- Fallback shows location, phone, hours, and map placeholder
- SEO title and meta description set

### Staff API Endpoint (/api/staff)
- GET endpoint returns active staff from database
- Gracefully handles missing DATABASE_URL (returns empty array)
- Dynamic import prevents runtime errors

### StaffHighlights Component
- Fetches real staff data from /api/staff
- Displays staff cards with photo, name, and specialties
- Supports CMS-driven staff_ids filtering
- Shows all active staff when no filter specified
- Loading skeleton while fetching
- Links to /staff/[slug] profile pages

## Commits

| Hash | Message |
|------|---------|
| 909d02d | feat(02-03): create CMS-driven homepage |
| 4c13e39 | feat(02-03): create about and contact pages |
| 8b59b88 | feat(02-03): wire StaffHighlights to fetch real staff data |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed GalleryGrid caption type error**
- **Found during:** Task 1 verification
- **Issue:** GalleryGrid.svelte had type error with optional caption prop and exactOptionalPropertyTypes
- **Fix:** Changed to spread syntax `{...(item.caption ? { caption: item.caption } : {})}`
- **Files modified:** apps/web/src/lib/components/gallery/GalleryGrid.svelte
- **Commit:** 909d02d (included with Task 1)

**2. [Rule 2 - Missing Critical] Created Badge component**
- **Found during:** Task 3
- **Issue:** StaffHighlights needed Badge component for specialties display, but it didn't exist
- **Fix:** Created full Badge component with variant support
- **Files created:** apps/web/src/lib/components/ui/badge/badge.svelte, index.ts
- **Commit:** 8b59b88

## Technical Notes

### Storyblok Bridge Pattern (Svelte 5)
```svelte
let storyFromBridge = $state<typeof data.story>(null);
let story = $derived(storyFromBridge ?? data.story);

$effect(() => {
  if (browser && data.story) {
    useStoryblokBridge(data.story.id, (newStory) => (storyFromBridge = newStory));
  }
});
```
This pattern avoids the Svelte 5 warning about capturing initial values while still enabling live editing.

### API Endpoint Resilience
The /api/staff endpoint checks for DATABASE_URL before importing @repo/db to avoid runtime crashes when database isn't configured. This allows the site to function in demo/preview mode.

## Verification Results

- pnpm check: 0 errors, 2 pre-existing warnings (unrelated gallery page)
- All three marketing pages render with fallback content
- StaffHighlights fetches and displays staff data
- CMS integration ready for Storyblok content

## Next Phase Readiness

Ready for Plan 02-04 (if exists) or Phase 3. Marketing pages are complete and functional with:
- Fallback content for immediate use
- CMS slots for owner content management
- Database integration for dynamic staff display
