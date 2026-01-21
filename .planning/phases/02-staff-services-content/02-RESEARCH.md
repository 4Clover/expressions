# Phase 2: Staff-Services-Content - Research

**Researched:** 2026-01-21
**Domain:** Storyblok CMS integration, staff/service data display, marketing pages, photo gallery
**Confidence:** HIGH

## Summary

Phase 2 creates the data foundation and CMS-managed marketing content that the booking system depends on. This research covers four key areas: (1) Storyblok CMS integration with SvelteKit for visual editing, (2) staff and services UI using existing database schema, (3) marketing pages (homepage, about, contact), and (4) photo gallery with before/after images.

The standard approach uses `@storyblok/svelte` v5.x which is fully compatible with Svelte 5. Storyblok provides the visual editor that non-technical salon owners need, while the database (already created in Phase 1) handles staff profiles, services, and pricing. The key architectural decision is splitting data ownership: CMS owns marketing content (hero text, about page, contact info), database owns operational data (staff, services, availability, pricing).

**Primary recommendation:** Use Storyblok for all owner-editable content (homepage, about, contact, gallery metadata) and database for operational data (staff profiles, services, pricing). Leverage Storyblok's Image Service CDN for all images with automatic WebP conversion.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @storyblok/svelte | 5.x | Storyblok SDK for SvelteKit | Official SDK, Svelte 5 compatible, visual editor support |
| @vitejs/plugin-basic-ssl | latest | HTTPS for dev server | Required for Storyblok Visual Editor iframe embedding |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| svelte-image-compare | 1.x | Before/after image slider | Photo gallery comparison feature |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Storyblok Image Service | @sveltejs/enhanced-img | enhanced-img is build-time only; Storyblok CDN handles CMS images |
| Custom gallery filter | Flowbite Svelte Gallery | Flowbite is heavier; custom filter is simple for this use case |
| svelte-image-compare | Custom slider | Library handles edge cases (touch, keyboard, aspect ratio) |

**Installation:**
```bash
# In apps/web
pnpm add @storyblok/svelte
pnpm add -D @vitejs/plugin-basic-ssl

# For photo gallery
pnpm add svelte-image-compare
```

## Architecture Patterns

### Recommended Project Structure

```
apps/web/src/
├── lib/
│   ├── components/
│   │   ├── storyblok/           # Storyblok block components
│   │   │   ├── Page.svelte
│   │   │   ├── Hero.svelte
│   │   │   ├── ServicesOverview.svelte
│   │   │   ├── StaffHighlights.svelte
│   │   │   ├── ContactInfo.svelte
│   │   │   └── Gallery.svelte
│   │   ├── staff/               # Staff-related components
│   │   │   ├── StaffCard.svelte
│   │   │   ├── StaffProfile.svelte
│   │   │   └── StaffPortfolio.svelte
│   │   ├── services/            # Service-related components
│   │   │   ├── ServiceCard.svelte
│   │   │   ├── ServiceCategory.svelte
│   │   │   └── PriceDisplay.svelte
│   │   └── gallery/             # Gallery components
│   │       ├── GalleryGrid.svelte
│   │       ├── GalleryFilter.svelte
│   │       └── BeforeAfterSlider.svelte
│   └── storyblok.ts             # Storyblok initialization
├── routes/
│   ├── +layout.ts               # Storyblok init in load()
│   ├── +page.svelte             # Homepage (CMS-driven)
│   ├── about/
│   │   └── +page.svelte         # About page (CMS-driven)
│   ├── contact/
│   │   └── +page.svelte         # Contact page (CMS-driven)
│   ├── services/
│   │   └── +page.svelte         # Service catalog (DB-driven)
│   ├── staff/
│   │   ├── +page.svelte         # Staff listing (DB-driven)
│   │   └── [slug]/
│   │       └── +page.svelte     # Individual staff profile (DB-driven)
│   └── gallery/
│       └── +page.svelte         # Photo gallery (hybrid: CMS + DB)
```

### Pattern 1: Storyblok Initialization in Layout

**What:** Initialize Storyblok SDK in root layout load function
**When to use:** All pages that need CMS content
**Example:**
```typescript
// src/routes/+layout.ts
// Source: https://github.com/storyblok/storyblok-svelte

import { apiPlugin, storyblokInit, useStoryblokApi } from '@storyblok/svelte';
import Page from '$lib/components/storyblok/Page.svelte';
import Hero from '$lib/components/storyblok/Hero.svelte';
import ServicesOverview from '$lib/components/storyblok/ServicesOverview.svelte';
import StaffHighlights from '$lib/components/storyblok/StaffHighlights.svelte';
import ContactInfo from '$lib/components/storyblok/ContactInfo.svelte';
import Gallery from '$lib/components/storyblok/Gallery.svelte';

export async function load() {
  storyblokInit({
    accessToken: import.meta.env.VITE_STORYBLOK_ACCESS_TOKEN,
    apiOptions: {
      region: 'us', // Adjust based on your space region
    },
    use: [apiPlugin],
    components: {
      page: Page,
      hero: Hero,
      'services-overview': ServicesOverview,
      'staff-highlights': StaffHighlights,
      'contact-info': ContactInfo,
      gallery: Gallery,
    },
  });

  const storyblokAPI = await useStoryblokApi();
  return { storyblokAPI };
}
```

### Pattern 2: Fetching CMS Content in Page Load

**What:** Fetch Storyblok stories in +page.ts load functions
**When to use:** CMS-driven pages (homepage, about, contact)
**Example:**
```typescript
// src/routes/+page.ts
// Source: https://www.storyblok.com/tp/render-storyblok-stories-dynamically-in-sveltekit

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { storyblokAPI } = await parent();

  const response = await storyblokAPI.get('cdn/stories/home', {
    version: import.meta.env.DEV ? 'draft' : 'published',
  });

  return {
    story: response.data.story,
  };
};
```

### Pattern 3: Rendering Storyblok Components

**What:** Use StoryblokComponent to render CMS blocks
**When to use:** Pages with dynamic CMS content
**Example:**
```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { StoryblokComponent, useStoryblokBridge } from '@storyblok/svelte';

  let { data } = $props();
  let story = $state(data.story);

  // Enable live editing in Visual Editor
  useStoryblokBridge(story.id, (newStory) => (story = newStory));
</script>

<StoryblokComponent blok={story.content} />
```

### Pattern 4: Storyblok Block Component with storyblokEditable

**What:** Enable visual editing on component elements
**When to use:** All Storyblok block components
**Example:**
```svelte
<!-- src/lib/components/storyblok/Hero.svelte -->
<script lang="ts">
  import { storyblokEditable } from '@storyblok/svelte';
  import { Button } from '$lib/components/ui/button';

  let { blok } = $props();
</script>

<section use:storyblokEditable={blok} class="px-6 py-24 md:py-32 lg:py-40">
  <div class="mx-auto max-w-4xl text-center space-y-8">
    <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
      {blok.headline}
    </h1>
    <p class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
      {blok.subheadline}
    </p>
    {#if blok.cta_text && blok.cta_link}
      <div class="pt-4">
        <Button size="lg" href={blok.cta_link}>{blok.cta_text}</Button>
      </div>
    {/if}
  </div>
</section>
```

### Pattern 5: Database-Driven Staff/Services with Drizzle

**What:** Fetch staff and services from database in server load
**When to use:** Staff listing, service catalog, staff profile pages
**Example:**
```typescript
// src/routes/staff/+page.server.ts
import { db } from '@repo/db';
import { staff, staffServices, services } from '@repo/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const staffMembers = await db.query.staff.findMany({
    where: eq(staff.isActive, true),
    with: {
      staffServices: {
        with: {
          service: true,
        },
        where: eq(staffServices.isAvailable, true),
      },
    },
  });

  return { staff: staffMembers };
};
```

### Pattern 6: Storyblok Image Service for CDN Images

**What:** Use Storyblok's Image Service for automatic optimization
**When to use:** All images from Storyblok CMS
**Example:**
```svelte
<!-- Storyblok image with automatic WebP and resize -->
<script lang="ts">
  let { blok } = $props();

  // Transform image URL for optimization
  // Original: https://a.storyblok.com/f/12345/1920x1080/abc123/image.jpg
  // Optimized: https://a.storyblok.com/f/12345/1920x1080/abc123/image.jpg/m/800x0/filters:quality(80)
  function optimizeImage(url: string, width: number = 800, quality: number = 80) {
    if (!url) return '';
    return `${url}/m/${width}x0/filters:quality(${quality})`;
  }
</script>

<img
  src={optimizeImage(blok.image.filename, 800)}
  alt={blok.image.alt || blok.title}
  width="800"
  height="600"
  loading="lazy"
/>
```

### Pattern 7: Price Display Component

**What:** Handle fixed/starting/range price types
**When to use:** Service cards, staff service listings
**Example:**
```svelte
<!-- src/lib/components/services/PriceDisplay.svelte -->
<script lang="ts">
  type PriceType = 'fixed' | 'starting' | 'range';

  let { priceType, priceMin, priceMax }: {
    priceType: PriceType;
    priceMin: number;  // cents
    priceMax?: number | null; // cents
  } = $props();

  function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(0)}`;
  }

  let displayPrice = $derived(() => {
    switch (priceType) {
      case 'fixed':
        return formatPrice(priceMin);
      case 'starting':
        return `Starting at ${formatPrice(priceMin)}`;
      case 'range':
        return `${formatPrice(priceMin)} - ${formatPrice(priceMax!)}`;
    }
  });
</script>

<span class="text-lg font-semibold">{displayPrice()}</span>
```

### Anti-Patterns to Avoid

- **Don't mix CMS and DB for same data:** Staff profiles live in DB, not Storyblok. Marketing content lives in Storyblok, not DB.
- **Don't skip storyblokEditable:** Without it, visual editor won't work on that component.
- **Don't hardcode image URLs:** Always use Storyblok Image Service transforms for optimization.
- **Don't forget HTTPS in dev:** Storyblok Visual Editor requires HTTPS; use @vitejs/plugin-basic-ssl.
- **Don't use $state destructuring:** `let { headline } = blok` breaks reactivity; use `blok.headline` directly.
- **Don't forget public RLS policies:** Staff and services need public read access for anonymous visitors.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Visual CMS editing | Custom admin forms | Storyblok Visual Editor | Owner needs drag-and-drop, live preview |
| Image optimization | Manual resizing | Storyblok Image Service | Auto WebP, CDN caching, URL-based transforms |
| Before/after slider | Custom drag logic | svelte-image-compare | Touch support, keyboard a11y, aspect ratio handling |
| Rich text rendering | HTML parsing | renderRichText from @storyblok/svelte | Handles all Storyblok rich text features |
| Image lazy loading | Intersection Observer | native loading="lazy" | Browser-native, simpler, good support |
| Map embeds | Google Maps JS API | Google Maps Embed API | No API key management, iframe simplicity |

**Key insight:** Phase 2 is about content display, not complex interactions. Use built-in browser features and CMS capabilities rather than building custom solutions.

## Common Pitfalls

### Pitfall 1: Storyblok HTTPS Requirement

**What goes wrong:** Visual Editor iframe fails to load
**Why it happens:** Storyblok requires HTTPS for security; dev servers default to HTTP
**How to avoid:**
```typescript
// vite.config.ts
import basicSsl from '@vitejs/plugin-basic-ssl';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    basicSsl(), // Enables HTTPS in dev
  ],
});
```
**Warning signs:** "Refused to frame" errors, blank visual editor

### Pitfall 2: Missing Public RLS Policies

**What goes wrong:** Staff and services pages return empty data for visitors
**Why it happens:** RLS is enabled but no policy allows anon role to read
**How to avoid:**
```typescript
// packages/db/src/schema/staff.ts
import { pgTable, pgPolicy, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { anonRole, authenticatedRole } from 'drizzle-orm/supabase';

export const staff = pgTable('staff', {
  // ... columns
}, (table) => [
  pgPolicy('public can view active staff', {
    for: 'select',
    to: [anonRole, authenticatedRole],
    using: sql`${table.isActive} = true`,
  }),
]);
```
**Warning signs:** Empty arrays in page data, 403 errors

### Pitfall 3: Storyblok Component Registration Mismatch

**What goes wrong:** "Unknown component" errors in console
**Why it happens:** Component technical name in Storyblok doesn't match key in components object
**How to avoid:**
- Verify exact technical name in Storyblok Block Library
- Use kebab-case in Storyblok, match exactly in registration
- Log `blok.component` to debug mismatches

**Warning signs:** Components render as empty, console warnings about unknown components

### Pitfall 4: Image Service URL Format

**What goes wrong:** Images fail to load or aren't optimized
**Why it happens:** Missing `/m/` prefix or malformed filter syntax
**How to avoid:**
```
// Correct format:
https://a.storyblok.com/f/12345/image.jpg/m/800x0

// With filters:
https://a.storyblok.com/f/12345/image.jpg/m/800x0/filters:quality(80):format(webp)

// WRONG - missing /m/:
https://a.storyblok.com/f/12345/image.jpg?w=800
```
**Warning signs:** Original large images loading, no WebP conversion

### Pitfall 5: Draft vs Published Content

**What goes wrong:** Changes in Storyblok don't appear on site
**Why it happens:** Fetching 'published' version but content is in draft
**How to avoid:**
```typescript
const response = await storyblokAPI.get('cdn/stories/home', {
  version: import.meta.env.DEV ? 'draft' : 'published',
});
```
**Warning signs:** Content updates in Storyblok not reflected on site

### Pitfall 6: useStoryblokBridge in SSR Context

**What goes wrong:** Hydration errors or bridge not connecting
**Why it happens:** Bridge requires client-side DOM; SSR renders server-side
**How to avoid:**
```svelte
<script lang="ts">
  import { browser } from '$app/environment';
  import { useStoryblokBridge } from '@storyblok/svelte';

  let { data } = $props();
  let story = $state(data.story);

  // Only run bridge on client
  $effect(() => {
    if (browser) {
      useStoryblokBridge(story.id, (newStory) => (story = newStory));
    }
  });
</script>
```
**Warning signs:** Hydration mismatch warnings, live preview not working

## Code Examples

### Storyblok Block: Services Overview

```svelte
<!-- src/lib/components/storyblok/ServicesOverview.svelte -->
<script lang="ts">
  import { storyblokEditable } from '@storyblok/svelte';
  import { Card, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';

  let { blok } = $props();
</script>

<section use:storyblokEditable={blok} class="px-6 py-16 md:py-24 bg-muted/50">
  <div class="mx-auto max-w-6xl">
    <h2 class="text-2xl md:text-3xl font-bold text-center mb-12">
      {blok.headline}
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      {#each blok.services as service}
        <Card class="shadow hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>{service.name}</CardTitle>
            <CardDescription>{service.description}</CardDescription>
          </CardHeader>
        </Card>
      {/each}
    </div>
  </div>
</section>
```

### Staff Profile Page (DB-Driven)

```typescript
// src/routes/staff/[slug]/+page.server.ts
import { db } from '@repo/db';
import { staff, staffServices, services, serviceCategories } from '@repo/db/schema';
import { eq, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const staffMember = await db.query.staff.findFirst({
    where: and(
      eq(staff.displayName, params.slug.replace(/-/g, ' ')),
      eq(staff.isActive, true)
    ),
    with: {
      staffServices: {
        where: eq(staffServices.isAvailable, true),
        with: {
          service: {
            with: {
              category: true,
            },
          },
        },
      },
    },
  });

  if (!staffMember) {
    error(404, 'Staff member not found');
  }

  return { staffMember };
};
```

### Gallery Filter Component

```svelte
<!-- src/lib/components/gallery/GalleryFilter.svelte -->
<script lang="ts">
  import { Button } from '$lib/components/ui/button';

  let {
    categories,
    stylists,
    selectedCategory = $bindable('all'),
    selectedStylist = $bindable('all'),
  }: {
    categories: { id: string; name: string }[];
    stylists: { id: string; displayName: string }[];
    selectedCategory: string;
    selectedStylist: string;
  } = $props();
</script>

<div class="flex flex-wrap gap-4 mb-8">
  <div class="space-y-2">
    <label class="text-sm font-medium">Service Type</label>
    <div class="flex flex-wrap gap-2">
      <Button
        variant={selectedCategory === 'all' ? 'default' : 'outline'}
        size="sm"
        onclick={() => selectedCategory = 'all'}
      >
        All
      </Button>
      {#each categories as category}
        <Button
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          size="sm"
          onclick={() => selectedCategory = category.id}
        >
          {category.name}
        </Button>
      {/each}
    </div>
  </div>

  <div class="space-y-2">
    <label class="text-sm font-medium">Stylist</label>
    <div class="flex flex-wrap gap-2">
      <Button
        variant={selectedStylist === 'all' ? 'default' : 'outline'}
        size="sm"
        onclick={() => selectedStylist = 'all'}
      >
        All
      </Button>
      {#each stylists as stylist}
        <Button
          variant={selectedStylist === stylist.id ? 'default' : 'outline'}
          size="sm"
          onclick={() => selectedStylist = stylist.id}
        >
          {stylist.displayName}
        </Button>
      {/each}
    </div>
  </div>
</div>
```

### Before/After Image Slider

```svelte
<!-- src/lib/components/gallery/BeforeAfterSlider.svelte -->
<script lang="ts">
  import ImageCompare from 'svelte-image-compare';

  let { beforeImage, afterImage, alt }: {
    beforeImage: string;
    afterImage: string;
    alt: string;
  } = $props();

  // Optimize images via Storyblok Image Service
  function optimizeImage(url: string, width: number = 600) {
    if (!url) return '';
    return `${url}/m/${width}x0/filters:quality(85)`;
  }
</script>

<div class="rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
  <ImageCompare
    before={optimizeImage(beforeImage)}
    after={optimizeImage(afterImage)}
    {alt}
  />
</div>
```

### Contact Page with Google Maps Embed

```svelte
<!-- src/lib/components/storyblok/ContactInfo.svelte -->
<script lang="ts">
  import { storyblokEditable, renderRichText } from '@storyblok/svelte';

  let { blok } = $props();
  let hoursHtml = $derived(renderRichText(blok.hours));
</script>

<section use:storyblokEditable={blok} class="px-6 py-16 md:py-24">
  <div class="mx-auto max-w-6xl grid md:grid-cols-2 gap-12">
    <div class="space-y-8">
      <div>
        <h2 class="text-2xl font-bold mb-4">Contact Us</h2>
        <p class="text-muted-foreground">{blok.address}</p>
        <p class="mt-2">
          <a href="tel:{blok.phone}" class="text-primary hover:underline">
            {blok.phone}
          </a>
        </p>
      </div>

      <div>
        <h3 class="text-xl font-semibold mb-3">Hours</h3>
        <div class="prose prose-sm">{@html hoursHtml}</div>
      </div>
    </div>

    <div class="h-[400px] rounded-lg overflow-hidden shadow">
      <!-- Google Maps Embed API - no API key needed -->
      <iframe
        title="Salon Location"
        width="100%"
        height="100%"
        style="border:0"
        loading="lazy"
        allowfullscreen
        referrerpolicy="no-referrer-when-downgrade"
        src="https://www.google.com/maps/embed/v1/place?key={blok.google_maps_key}&q={encodeURIComponent(blok.address)}"
      ></iframe>
    </div>
  </div>
</section>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Svelte 4 props | Svelte 5 $props() | Svelte 5 (2025) | Different component API |
| export let blok | let { blok } = $props() | Svelte 5 | Runes-based reactivity |
| onMount for bridge | $effect for bridge | Svelte 5 | Cleaner lifecycle handling |
| beforeUpdate | $effect.pre | Svelte 5 | Deprecated lifecycle |
| storyblok-js-client | @storyblok/svelte v5 | 2025 | Unified SDK with bridge |

**Deprecated/outdated:**
- `storyblok-js-client` standalone - Use `@storyblok/svelte` which includes it
- Storyblok v1 API - Use v2 Content Delivery API
- `export let` for props - Use `$props()` in Svelte 5
- `useStoryblok` hook - Use `useStoryblokBridge` + `StoryblokComponent`

## Data Ownership Model

Critical architectural decision for Phase 2:

| Data Type | Owner | Why |
|-----------|-------|-----|
| Homepage hero text | Storyblok | Owner edits visually |
| Homepage services preview | Storyblok | Marketing content, visual editing |
| Staff highlights on homepage | Storyblok | Curated selection, visual editing |
| About page content | Storyblok | Owner edits visually |
| Contact info/hours | Storyblok | Owner edits visually |
| Gallery image metadata | Storyblok | Asset management, descriptions |
| Staff profiles | Database | Operational data, booking integration |
| Services catalog | Database | Pricing, duration, booking integration |
| Service categories | Database | Used in booking flow |
| Per-stylist pricing | Database | Booth rental flexibility |

**Key insight:** CMS for presentation, database for operations. Gallery images may live in Storyblok but are tagged with DB references (stylist ID, service category) for filtering.

## Storyblok Content Structure

Recommended block structure for salon website:

### Content Types (Story Templates)
- **Page** - Generic page with nestable blocks

### Nestable Blocks
- **Hero** - headline (text), subheadline (text), background_image (asset), cta_text (text), cta_link (link)
- **ServicesOverview** - headline (text), services (blocks: ServiceCard)
- **ServiceCard** - name (text), description (text), icon (asset)
- **StaffHighlights** - headline (text), staff_ids (text array - DB references)
- **ContactInfo** - address (text), phone (text), hours (richtext), google_maps_key (text)
- **GallerySection** - headline (text), images (assets with metadata)
- **RichTextBlock** - content (richtext)
- **ImageBlock** - image (asset), caption (text), alt (text)

## Open Questions

Things that couldn't be fully resolved:

1. **Gallery image tagging strategy**
   - What we know: Images in Storyblok need association with DB stylists/services
   - What's unclear: Best way to link - store DB IDs in Storyblok metadata fields or separate join table?
   - Recommendation: Use Storyblok text fields for stylist_id and service_category_id; filter on client

2. **Staff portfolio images**
   - What we know: STAFF-05 requires before/after portfolio samples per stylist
   - What's unclear: Should portfolio live in Storyblok (owner uploads) or separate feature (stylist uploads)?
   - Recommendation: Phase 2 uses Storyblok for all gallery/portfolio; stylist self-service is post-MVP

3. **svelte-image-compare Svelte 5 compatibility**
   - What we know: Library works with Svelte 4
   - What's unclear: No explicit Svelte 5 support documentation found
   - Recommendation: Test during implementation; fallback is custom slider with $state

## Sources

### Primary (HIGH confidence)
- [Storyblok Svelte SDK](https://github.com/storyblok/storyblok-svelte) - Installation, initialization, components
- [Storyblok SvelteKit Integration Guide](https://www.storyblok.com/tp/add-a-headless-cms-to-svelte-in-5-minutes) - Complete setup walkthrough
- [Storyblok Dynamic Routing](https://www.storyblok.com/tp/render-storyblok-stories-dynamically-in-sveltekit) - Catch-all routes
- [Storyblok Image Service](https://www.storyblok.com/docs/api/image-service) - URL transformation API
- [SvelteKit Images Documentation](https://svelte.dev/docs/kit/images) - @sveltejs/enhanced-img setup
- [Drizzle ORM Relations v2](https://orm.drizzle.team/docs/relations-v2) - Relation definitions
- [Drizzle ORM Relational Queries](https://orm.drizzle.team/docs/rqb-v2) - Eager loading patterns
- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security) - Public read policies

### Secondary (MEDIUM confidence)
- [Storyblok Blocks Concepts](https://www.storyblok.com/docs/concepts/blocks) - Content types vs bloks
- [Storyblok Custom Components Tutorial](https://www.storyblok.com/tp/create-custom-components-in-storyblok-and-sveltekit) - Block creation
- [svelte-image-compare](https://github.com/PaulMaly/svelte-image-compare) - Before/after slider

### Tertiary (LOW confidence)
- WebSearch results for Svelte 5 + svelte-image-compare compatibility
- Gallery filtering patterns from general SvelteKit tutorials

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Storyblok SDK documentation
- Architecture patterns: HIGH - Official tutorials and documentation
- CMS integration: HIGH - Official Storyblok SvelteKit guide
- Gallery implementation: MEDIUM - Some components not verified for Svelte 5
- Pitfalls: HIGH - Documented in official guides and GitHub issues

**Research date:** 2026-01-21
**Valid until:** 2026-02-21 (30 days - Storyblok SDK is stable)
