---
phase: 02-staff-services-content
plan: 02
subsystem: cms
tags: [storyblok, cms, svelte5, visual-editor]
depends_on:
  requires: [01-03]
  provides: [storyblok-sdk, block-components, cms-integration]
  affects: [02-03, 02-04]
tech_stack:
  added:
    - "@storyblok/svelte@5.2.16"
    - "@vitejs/plugin-basic-ssl@2.1.4"
  patterns:
    - "storyblokEditable directive for visual editor"
    - "StoryblokComponent for nested blocks"
    - "optimizeImage helper for Image Service"
key_files:
  created:
    - "apps/web/src/lib/storyblok.ts"
    - "apps/web/src/routes/+layout.ts"
    - "apps/web/src/lib/components/storyblok/Page.svelte"
    - "apps/web/src/lib/components/storyblok/Hero.svelte"
    - "apps/web/src/lib/components/storyblok/ServicesOverview.svelte"
    - "apps/web/src/lib/components/storyblok/ServicePreviewCard.svelte"
    - "apps/web/src/lib/components/storyblok/StaffHighlights.svelte"
    - "apps/web/src/lib/components/storyblok/ContactInfo.svelte"
    - "apps/web/src/lib/components/storyblok/RichTextBlock.svelte"
    - "apps/web/src/lib/components/storyblok/index.ts"
  modified:
    - "apps/web/package.json"
    - "apps/web/vite.config.ts"
    - "apps/web/.env.example"
decisions:
  - id: 02-02-D1
    decision: "Type assertion for Storyblok component registration"
    why: "Svelte 5 component types stricter than Storyblok's generic Component type"
    code: "components as unknown as SbSvelteComponentsMap"
  - id: 02-02-D2
    decision: "Rich text type uses any with cast"
    why: "StoryblokRichTextDocumentNode incompatible with renderRichText parameter"
    code: "hours?: any; renderRichText(blok.hours as Parameters<typeof renderRichText>[0])"
metrics:
  duration: 6min
  completed: 2026-01-21
---

# Phase 02 Plan 02: Storyblok CMS Integration Summary

**One-liner:** Storyblok SDK v5.2.16 with 7 block components for CMS-driven marketing pages and visual editor support.

## What Was Done

### Task 1: Install Storyblok SDK and configure HTTPS

Installed `@storyblok/svelte` for CMS integration and `@vitejs/plugin-basic-ssl` for HTTPS dev server required by Storyblok Visual Editor.

**Files modified:**
- `apps/web/package.json` - Added dependencies
- `apps/web/vite.config.ts` - Added basicSsl() plugin
- `apps/web/.env.example` - Added VITE_STORYBLOK_ACCESS_TOKEN

**Commit:** 78d4ae3

### Task 2: Initialize Storyblok SDK

Created SDK initialization helper and layout integration:

**apps/web/src/lib/storyblok.ts:**
- `initStoryblok()` - Configures SDK with access token, US region, apiPlugin
- Registers 7 block components with Storyblok names
- `optimizeImage()` - Helper for Storyblok Image Service transforms

**apps/web/src/routes/+layout.ts:**
- Calls `initStoryblok()` at module level (before load runs)
- Exports `storyblokApi` to child routes via parent()

**Commit:** b52f810

### Task 3: Create Storyblok block components

Created 7 block components for CMS-driven content:

| Component | Purpose | Key Fields |
|-----------|---------|------------|
| Page.svelte | Container for nested blocks | body (array) |
| Hero.svelte | Full-width hero section | headline, subheadline, background_image, cta_text, cta_link |
| ServicesOverview.svelte | Service preview grid | headline, services (nested blocks) |
| ServicePreviewCard.svelte | Individual service card | name, description, icon |
| StaffHighlights.svelte | Staff showcase grid | headline, description, staff_ids |
| ContactInfo.svelte | Contact details with map | address, phone, email, hours, google_maps_embed_url |
| RichTextBlock.svelte | Rich text content | content |

All components use:
- `use:storyblokEditable={blok}` for visual editor support
- `let { blok } = $props()` for Svelte 5 syntax
- Type-safe blok interfaces extending `SbBlokData`

**Commit:** a64af2b

## Decisions Made

### D1: Type assertion for component registration

Svelte 5 component types are stricter than Storyblok SDK's generic `Component` type expectation. Used double cast:

```typescript
const components = { ... } as unknown as SbSvelteComponentsMap;
```

### D2: Rich text types use any with parameter cast

`StoryblokRichTextDocumentNode` is incompatible with `renderRichText` parameter type due to `exactOptionalPropertyTypes`. Solution:

```typescript
hours?: any;
renderRichText(blok.hours as Parameters<typeof renderRichText>[0])
```

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

| Check | Status |
|-------|--------|
| @storyblok/svelte in dependencies | PASS |
| basicSsl enables HTTPS dev server | PASS |
| pnpm dev runs on https://localhost:5173 | PASS (status 200) |
| storyblokInit called on app load | PASS |
| All 7 components created | PASS |
| storyblokEditable on all blocks | PASS |
| pnpm check (TypeScript) | PASS (0 errors) |

## Next Phase Readiness

### For Plan 02-03 (Marketing Pages)
- Storyblok SDK initialized and ready
- Block components available for CMS-driven pages
- `storyblokApi` accessible via `await parent()` in page load functions
- StaffHighlights ready for DB staff integration

### User Setup Required
Before Plan 02-03 can fetch real content:
1. Create Storyblok space
2. Generate preview access token
3. Set `VITE_STORYBLOK_ACCESS_TOKEN` in `.env`
4. Configure Visual Editor preview URL to `https://localhost:5173`
5. Create content blocks in Storyblok Block Library matching registered names
