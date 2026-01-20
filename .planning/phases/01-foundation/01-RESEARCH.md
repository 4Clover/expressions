# Phase 1: Foundation - Research

**Researched:** 2026-01-20
**Domain:** Monorepo setup, database/auth, design system
**Confidence:** HIGH

## Summary

Phase 1 establishes the technical foundation for the Expressions Hair Designs website. The research covers five key areas: Turborepo + pnpm monorepo setup, shadcn-svelte with Svelte 5 and Tailwind v4, Drizzle ORM with Supabase, SvelteKit 2 with Svelte 5 runes, and Cloudflare Pages deployment.

The standard approach is well-documented and mature. Turborepo 2.7+ provides excellent SvelteKit support with proper caching. shadcn-svelte has full Svelte 5 and Tailwind v4 support with OKLCH color system. Drizzle ORM integrates cleanly with Supabase including RLS policy support. The Cloudflare Pages adapter handles all SvelteKit features.

**Primary recommendation:** Use the official patterns from each tool's documentation. The ecosystem is mature and well-integrated. The main gotcha is Tailwind v4's CSS-based configuration (no more `tailwind.config.ts`) and ensuring proper Turborepo output caching for `.svelte-kit/cloudflare`.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| SvelteKit | 2.x | Full-stack framework | Form actions, server load functions, API routes |
| Svelte | 5.x | UI framework | Runes syntax ($state, $derived, $effect) |
| Turborepo | 2.7+ | Monorepo build system | Caching, parallel tasks, SvelteKit support |
| pnpm | 9.x | Package manager | Workspace protocol, disk efficiency |
| shadcn-svelte | 1.x | Component library | Svelte 5 + Tailwind v4 support, OKLCH theming |
| Bits UI | latest | Headless components | Powers shadcn-svelte, accessibility built-in |
| Drizzle ORM | latest | Database ORM | Type-safe, edge-compatible, RLS support |
| Supabase | latest | Backend-as-a-Service | PostgreSQL, Auth, RLS |
| Tailwind CSS | 4.x | Styling | CSS-based config, OKLCH colors |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @sveltejs/adapter-cloudflare | latest | Deployment adapter | Required for Cloudflare Pages |
| postgres | latest | PostgreSQL driver | Drizzle connection to Supabase |
| tw-animate-css | latest | Animations | Replaces tailwindcss-animate for Tailwind v4 |
| @lucide/svelte | latest | Icons | 1500+ consistent stroke icons |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Drizzle | Prisma | Drizzle is smaller (7.4KB vs heavy query engine), edge-compatible |
| shadcn-svelte | Flowbite Svelte | shadcn-svelte offers full customization, Flowbite for rapid prototyping |
| Tailwind v4 | Tailwind v3 | v4 is current, but requires modern browser support |

**Installation:**
```bash
# Root level
pnpm add -D turbo

# In apps/web
pnpm add @supabase/supabase-js @supabase/ssr drizzle-orm postgres
pnpm add -D drizzle-kit @sveltejs/adapter-cloudflare

# shadcn-svelte (run in apps/web)
pnpm dlx shadcn-svelte@latest init
pnpm dlx shadcn-svelte@latest add button card
```

## Architecture Patterns

### Recommended Project Structure

```
expressions/
├── apps/
│   └── web/                    # Main SvelteKit app
│       ├── src/
│       │   ├── routes/
│       │   │   ├── (marketing)/    # Homepage, about, services
│       │   │   ├── (booking)/      # Booking flow (future)
│       │   │   ├── (auth)/         # Login, register
│       │   │   └── (admin)/        # Owner dashboard
│       │   ├── lib/
│       │   │   ├── server/         # Server-only code
│       │   │   ├── components/     # App-specific components
│       │   │   │   └── ui/         # shadcn-svelte components
│       │   │   ├── state/          # Svelte 5 state classes
│       │   │   └── schemas/        # Zod schemas
│       │   ├── app.css             # Tailwind v4 CSS config
│       │   └── app.d.ts            # TypeScript declarations
│       ├── static/
│       ├── svelte.config.js
│       └── vite.config.ts
├── packages/
│   ├── db/                     # Drizzle schema & migrations
│   │   ├── src/
│   │   │   ├── schema/         # Table definitions
│   │   │   └── index.ts        # DB client export
│   │   ├── drizzle/            # Migration files
│   │   └── drizzle.config.ts
│   └── config/                 # Shared ESLint, TS configs
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### Pattern 1: Svelte 5 Runes for State

**What:** Use `$state`, `$derived`, `$effect` instead of Svelte 4 patterns
**When to use:** All new component state
**Example:**
```svelte
<script lang="ts">
  // Source: https://svelte.dev/docs/svelte/$state

  // Reactive state
  let count = $state(0);

  // Computed values
  let doubled = $derived(count * 2);

  // Side effects
  $effect(() => {
    console.log(`Count changed to ${count}`);
  });
</script>

<button onclick={() => count++}>
  {count} (doubled: {doubled})
</button>
```

### Pattern 2: Class-Based State for Complex State

**What:** Use classes with $state fields for shared/complex state
**When to use:** Multi-step wizards, shared state across components
**Example:**
```typescript
// Source: https://svelte.dev/docs/svelte/$state
// lib/state/booking.svelte.ts

export class BookingWizard {
  // Reactive state as class fields
  services = $state<Service[]>([]);
  stylist = $state<Staff | null>(null);
  currentStep = $state(1);

  // Computed via getters
  get totalPrice() {
    return this.services.reduce((sum, s) => sum + s.price, 0);
  }

  get canProceed() {
    switch (this.currentStep) {
      case 1: return this.services.length > 0;
      case 2: return this.stylist !== null;
      default: return false;
    }
  }

  // Actions as methods
  addService(service: Service) {
    this.services.push(service);
  }

  reset() {
    this.services = [];
    this.stylist = null;
    this.currentStep = 1;
  }
}
```

### Pattern 3: Drizzle Schema with RLS

**What:** Define tables with Row Level Security policies
**When to use:** All tables that need access control
**Example:**
```typescript
// Source: https://orm.drizzle.team/docs/rls
// packages/db/src/schema/profiles.ts

import { pgTable, uuid, text, pgPolicy } from 'drizzle-orm/pg-core';
import { authenticatedRole } from 'drizzle-orm/supabase';
import { sql } from 'drizzle-orm';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  email: text('email').notNull(),
  role: text('role').notNull().default('customer'),
}, (table) => [
  pgPolicy('users can view own profile', {
    for: 'select',
    to: authenticatedRole,
    using: sql`auth.uid() = ${table.userId}`,
  }),
  pgPolicy('users can update own profile', {
    for: 'update',
    to: authenticatedRole,
    using: sql`auth.uid() = ${table.userId}`,
  }),
]);
```

### Pattern 4: Turborepo Task Configuration

**What:** Configure build caching and task dependencies
**When to use:** Root turbo.json
**Example:**
```json
// Source: https://turborepo.dev/docs/reference/configuration
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".svelte-kit/**", ".svelte-kit/cloudflare/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "check": {
      "dependsOn": ["^build"]
    },
    "db:generate": {
      "cache": false
    },
    "db:push": {
      "cache": false
    }
  }
}
```

### Pattern 5: shadcn-svelte Theming with OKLCH

**What:** CSS-based theming using OKLCH color space
**When to use:** app.css for design tokens
**Example:**
```css
/* Source: https://shadcn-svelte.com/docs/theming */
/* app.css */

@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* Cool neutral monochromatic base (slate grays) */
  --color-background: oklch(0.99 0.002 255);
  --color-foreground: oklch(0.15 0.01 255);

  /* Rose gold accent */
  --color-primary: oklch(0.65 0.12 25);
  --color-primary-foreground: oklch(0.98 0.01 25);

  /* Card and popover surfaces */
  --color-card: oklch(0.99 0.002 255);
  --color-card-foreground: oklch(0.15 0.01 255);

  /* Muted elements */
  --color-muted: oklch(0.95 0.005 255);
  --color-muted-foreground: oklch(0.45 0.01 255);

  /* Interactive states */
  --color-accent: oklch(0.95 0.02 25);
  --color-accent-foreground: oklch(0.15 0.01 255);

  /* Borders and inputs */
  --color-border: oklch(0.90 0.005 255);
  --color-input: oklch(0.90 0.005 255);
  --color-ring: oklch(0.65 0.12 25);

  /* Border radius - slightly rounded per design spec */
  --radius: 0.375rem; /* 6px - middle of 4-8px range */
}

.dark {
  --color-background: oklch(0.15 0.01 255);
  --color-foreground: oklch(0.95 0.005 255);
  /* ... dark mode variants */
}
```

### Anti-Patterns to Avoid

- **Don't use `$app/stores`:** Deprecated in SvelteKit 2.12, use `$app/state` instead
- **Don't throw error()/redirect():** SvelteKit 2 no longer requires explicit throw
- **Don't use tailwind.config.ts with v4:** Use CSS-based @theme configuration
- **Don't use tailwindcss-animate:** Use tw-animate-css for Tailwind v4
- **Don't destructure $state:** Breaks reactivity - `let {a} = obj` captures value, not reference
- **Don't use relative imports across packages:** Use workspace dependencies (`@repo/ui`)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Headless UI components | Custom accessible components | Bits UI / shadcn-svelte | ARIA, keyboard nav, focus management |
| Form validation | Manual validation logic | Superforms + Zod | Progressive enhancement, error handling |
| Database migrations | Raw SQL files | Drizzle Kit | Schema versioning, type generation |
| Auth session handling | Custom JWT parsing | @supabase/ssr | Cookie handling, token refresh |
| CSS animations | Custom keyframes | tw-animate-css | Tailwind v4 compatible, consistent |
| Icon system | Custom SVG management | @lucide/svelte | 1500+ icons, tree-shakeable |
| Monorepo task running | npm scripts chaining | Turborepo | Caching, parallelization |

**Key insight:** The ecosystem has mature solutions for all common problems. Hand-rolling leads to missed edge cases (accessibility, security, browser compat).

## Common Pitfalls

### Pitfall 1: Tailwind v4 Configuration Confusion

**What goes wrong:** Expecting `tailwind.config.ts` to work, or mixing v3 and v4 patterns
**Why it happens:** Major paradigm shift from JS config to CSS-based config
**How to avoid:**
- Delete `tailwind.config.ts` entirely
- Use `@theme inline` in app.css for custom values
- Replace `tailwindcss-animate` with `tw-animate-css`
- Use Vite plugin, not PostCSS plugin

**Warning signs:** Build errors about missing config, animations not working

### Pitfall 2: Svelte 5 Reactivity Breaking

**What goes wrong:** State updates don't trigger UI updates
**Why it happens:** Destructuring `$state` objects captures values at a moment
**How to avoid:**
```typescript
// BAD - breaks reactivity
let { done, text } = todos[0];
done = !done; // Won't affect original

// GOOD - maintain reference
todos[0].done = !todos[0].done;
```

**Warning signs:** UI doesn't update after state changes

### Pitfall 3: Supabase Connection Pooling

**What goes wrong:** Prepared statement errors in serverless
**Why it happens:** Transaction pool mode doesn't support prepared statements
**How to avoid:**
```typescript
// Source: https://orm.drizzle.team/docs/connect-supabase
const client = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle({ client });
```

**Warning signs:** `prepared statement does not exist` errors

### Pitfall 4: Turborepo Output Caching

**What goes wrong:** Builds fail or stale builds deployed
**Why it happens:** Missing `.svelte-kit/cloudflare` in outputs
**How to avoid:**
```json
{
  "tasks": {
    "build": {
      "outputs": [".svelte-kit/**", ".svelte-kit/cloudflare/**"]
    }
  }
}
```

**Warning signs:** Deployment errors, stale content after changes

### Pitfall 5: SvelteKit 2 Cookie Path

**What goes wrong:** Cookies set incorrectly, auth issues
**Why it happens:** SvelteKit 2 requires explicit path option
**How to avoid:**
```typescript
// Always include path
cookies.set('session', value, { path: '/' });
cookies.delete('session', { path: '/' });
```

**Warning signs:** Cookies not persisting, auth state issues

### Pitfall 6: Internal Package Imports in Monorepo

**What goes wrong:** TypeScript can't resolve internal packages
**Why it happens:** Incorrect workspace protocol or missing exports
**How to avoid:**
```json
// In apps/web/package.json
{
  "dependencies": {
    "@repo/db": "workspace:*"
  }
}

// In packages/db/package.json
{
  "name": "@repo/db",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

**Warning signs:** Module not found errors, TypeScript red squiggles

## Code Examples

### SvelteKit Cloudflare Adapter Setup

```javascript
// Source: https://svelte.dev/docs/kit/adapter-cloudflare
// svelte.config.js

import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      routes: {
        include: ['/*'],
        exclude: ['<all>']
      }
    })
  }
};
```

### Platform Bindings TypeScript

```typescript
// Source: https://developers.cloudflare.com/pages/framework-guides/deploy-a-svelte-kit-site/
// src/app.d.ts

declare global {
  namespace App {
    interface Platform {
      env: {
        // Add your bindings here
        // KV: KVNamespace;
        // DB: D1Database;
      };
    }
  }
}

export {};
```

### Vite Config with Tailwind v4

```typescript
// Source: https://shadcn-svelte.com/docs/migration/tailwind-v4
// vite.config.ts

import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit()
  ]
});
```

### Drizzle Config for Supabase

```typescript
// Source: https://orm.drizzle.team/docs/kit-overview
// packages/db/drizzle.config.ts

import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### pnpm Workspace Configuration

```yaml
# Source: https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository
# pnpm-workspace.yaml

packages:
  - 'apps/*'
  - 'packages/*'
```

### Root Package.json Scripts

```json
{
  "name": "expressions-hair-designs",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "check": "turbo check",
    "db:generate": "turbo db:generate",
    "db:push": "turbo db:push",
    "db:studio": "pnpm --filter @repo/db drizzle-kit studio"
  },
  "devDependencies": {
    "turbo": "^2.7.0"
  },
  "packageManager": "pnpm@9.15.4"
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwind.config.ts | CSS @theme inline | Tailwind v4 (2025) | No JS config file needed |
| tailwindcss-animate | tw-animate-css | Tailwind v4 | Different import |
| $app/stores | $app/state | SvelteKit 2.12 | Runes-based, more flexible |
| export let props | $props() | Svelte 5 | Explicit destructuring |
| $: reactive | $derived / $effect | Svelte 5 | More predictable |
| throw error() | error() | SvelteKit 2 | No throw needed |
| HSL colors | OKLCH colors | shadcn-svelte + Tailwind v4 | Perceptually uniform |
| bits-ui + cmdk-sv | bits-ui (merged) | Recent | cmdk now in bits-ui |

**Deprecated/outdated:**
- `$app/stores` - Use `$app/state` (SvelteKit 2.12+)
- `tailwindcss-animate` - Use `tw-animate-css` for Tailwind v4
- PostCSS for Tailwind - Use Vite plugin with v4
- `createEventDispatcher` - Use callback props in Svelte 5
- `<svelte:component this={X}>` - Direct component references work now

## Open Questions

Things that couldn't be fully resolved:

1. **Exact OKLCH values for rose gold accent**
   - What we know: OKLCH format required, rose gold is ~25 hue
   - What's unclear: Exact lightness/chroma for proper contrast
   - Recommendation: Start with provided values, test with contrast checker

2. **shadcn-svelte + Tailwind v4 fresh project setup**
   - What we know: CLI works, but some report issues with v4 auto-detection
   - What's unclear: Whether to init with v3 then migrate, or start fresh v4
   - Recommendation: Use `sv create` with TailwindCSS, then run shadcn-svelte init

3. **Security patches (January 2026)**
   - What we know: CVEs affecting devalue, svelte, @sveltejs/kit, adapter-node
   - What's unclear: Exact version requirements for patches
   - Recommendation: Use latest versions, check `npm audit` after setup

## Sources

### Primary (HIGH confidence)
- [Turborepo Documentation](https://turborepo.dev/docs) - Structuring, configuration, SvelteKit guide
- [shadcn-svelte Documentation](https://shadcn-svelte.com/docs) - Installation, theming, Tailwind v4 migration
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs) - Supabase setup, RLS, migrations
- [Svelte 5 Documentation](https://svelte.dev/docs/svelte) - Runes, state management, migration guide
- [SvelteKit Documentation](https://svelte.dev/docs/kit) - Adapter Cloudflare, SvelteKit 2 migration
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/framework-guides/deploy-a-svelte-kit-site/) - Deployment, bindings

### Secondary (MEDIUM confidence)
- [Supabase Documentation](https://supabase.com/docs/guides/auth/server-side/sveltekit) - Auth with SvelteKit
- [Configuring Turborepo for SvelteKit](https://maier.tech/posts/configuring-turborepo-for-a-sveltekit-monorepo) - Community patterns

### Tertiary (LOW confidence)
- WebSearch results for version numbers and recent changes

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All from official documentation
- Architecture: HIGH - Patterns from official docs and mature community templates
- Pitfalls: HIGH - Documented in official migration guides

**Research date:** 2026-01-20
**Valid until:** 2026-02-20 (30 days - ecosystem is stable)
