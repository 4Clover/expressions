# Phase 5: Code-Quality-Analysis - Research

**Researched:** 2026-01-21
**Domain:** ESLint, TypeScript strict mode, Svelte 5/SvelteKit 2, Drizzle ORM
**Confidence:** HIGH (verified against official documentation)

## Summary

This phase establishes production-level code quality through ESLint, svelte-check, and TypeScript strict mode. The current codebase has **no ESLint installed** (script exists but package missing), TypeScript is already in strict mode with aggressive settings, and svelte-check reveals 4 errors and 4 warnings that need fixing.

The standard approach is:
1. Install and configure ESLint 9+ with flat config format for Svelte 5/TypeScript
2. Fix existing svelte-check errors (type mismatches, unused imports, Svelte 5 reactivity warnings)
3. Verify all patterns against official documentation (Svelte 5, SvelteKit 2, Drizzle ORM, shadcn-svelte)
4. Document patterns for future development

**Primary recommendation:** Install eslint-plugin-svelte with typescript-eslint using ESLint 9 flat config, then systematically fix errors starting with TypeScript/Svelte-check errors before running ESLint.

## Current State Analysis

### Existing Configuration

**TypeScript (apps/web/tsconfig.json):**
- `strict: true` enabled
- All strict sub-flags explicitly enabled
- `noUncheckedIndexedAccess: true` - aggressive null checking for array access
- `exactOptionalPropertyTypes: true` - strict optional handling
- `noUnusedLocals: true` and `noUnusedParameters: true` - catches dead code

**svelte-check (already configured):**
- Script: `svelte-kit sync && svelte-check --tsconfig ./tsconfig.json`
- Currently reports 4 errors, 4 warnings

**ESLint (NOT configured):**
- Script exists in package.json: `"lint": "eslint ."`
- Package NOT installed (not in pnpm-lock.yaml)
- No eslint.config.js file exists

### Current Errors (from svelte-check)

| File | Issue | Type |
|------|-------|------|
| `api/availability/+server.ts:42` | Unused import `staff` | Error |
| `api/availability/+server.ts:122-123` | `slot.time` should be `slot.display` (TimeSlot interface mismatch) | Error |
| `book/confirmation/[id]/+page.svelte:19-20` | state_referenced_locally - `data` captured at initialization | Warning |
| `gallery/+page.svelte:7-8` | state_referenced_locally - `data` captured at initialization | Warning |

## Standard Stack

### Core ESLint Setup

| Package | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| eslint | ^9.0.0 | Linting engine | Industry standard, v9 uses flat config |
| eslint-plugin-svelte | ^3.0.0 | Svelte-specific rules | Official Svelte ESLint plugin |
| typescript-eslint | ^8.0.0 | TypeScript parsing/rules | Official TypeScript ESLint integration |
| globals | ^15.0.0 | Global variable definitions | Required for browser/node globals |
| svelte-eslint-parser | (peer dep) | Parses .svelte files | Used by eslint-plugin-svelte |

### Optional Enhancements

| Package | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| eslint-plugin-svelte-runes | ^0.x | Svelte 5 runes best practices | Early development, may have breaking changes |
| @poupe/eslint-plugin-tailwindcss | latest | Tailwind v4 full support | If CSS linting desired |
| eslint-plugin-tailwindcss | ^4.0.0-beta | Tailwind linting (partial v4) | Alternative, more established |

**Installation:**
```bash
pnpm add -D eslint eslint-plugin-svelte typescript-eslint globals
```

## Architecture Patterns

### Recommended ESLint Configuration (eslint.config.js)

```javascript
// Source: https://sveltejs.github.io/eslint-plugin-svelte/user-guide/
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node // Required for SvelteKit SSR
      }
    }
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
        svelteConfig
      }
    }
  },
  {
    ignores: [
      '.svelte-kit/**',
      'node_modules/**',
      'build/**',
      'dist/**'
    ]
  }
);
```

### Svelte 5 Props Pattern (Current Best Practice)

```typescript
// Source: https://svelte.dev/docs/svelte/$props
// Correct pattern for Svelte 5 with TypeScript

// 1. Interface definition
interface Props {
  requiredProp: string;
  optionalProp?: number;
  bindableProp?: string;
  class?: string;       // Reserved: use for className passthrough
  children?: Snippet;   // Reserved: for child content
}

// 2. Destructure with $props()
let {
  requiredProp,
  optionalProp = 42,                    // Default value
  bindableProp = $bindable('default'),  // Two-way bindable
  class: className,                      // Rename reserved word
  children,
  ...restProps                          // Spread rest
}: Props = $props();
```

### Svelte 5 Derived State Pattern

```typescript
// Source: https://svelte.dev/docs/svelte/v5-migration-guide

// WRONG - captures value at initialization
let { data } = $props();
const startTime = new Date(data.appointment.startTime); // Static!

// CORRECT - reactive derivation
let { data } = $props();
let startTime = $derived(new Date(data.appointment.startTime)); // Reactive!

// For complex derivations
let computed = $derived.by(() => {
  // Multiple statements
  const parsed = parseData(data);
  return transform(parsed);
});
```

### SvelteKit Load Function Pattern

```typescript
// Source: https://svelte.dev/docs/kit/form-actions
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  // Return type is inferred
  return {
    item: await fetchItem(params.id)
  };
};

export const actions = {
  default: async ({ request }) => {
    // Use fail() for validation errors
    return fail(400, { error: 'message' });
  }
} satisfies Actions;
```

### Drizzle ORM Type-Safe Query Pattern

```typescript
// Source: https://orm.drizzle.team/docs/select
import { db, users } from '@repo/db';
import { eq } from 'drizzle-orm';

// Type-safe select - result types inferred from schema
const result = await db.query.users.findFirst({
  where: eq(users.id, userId),
});

// Result: { id: string; name: string; ... } | undefined
// Always handle undefined with strict null checks!

if (!result) {
  return json({ error: 'Not found' }, { status: 404 });
}
```

### Anti-Patterns to Avoid

- **Capturing $props values in non-reactive declarations:** Use `$derived` for computed values from props
- **Using `export let` syntax:** Deprecated in Svelte 5, use `$props()`
- **Event dispatcher pattern:** Use callback props instead of `createEventDispatcher`
- **`on:event` directive:** Use `onevent` attributes in Svelte 5
- **Default slot syntax:** Use `{@render children()}` with snippet props
- **Binding to non-$bindable props:** Mark props with `$bindable()` for two-way binding

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Class merging | String concatenation | `cn()` from utils (clsx + tailwind-merge) | Handles Tailwind conflicts |
| Form validation | Manual checks | Superforms or native FormData | Type safety, progressive enhancement |
| Date formatting | Manual string building | date-fns `format()` | Locale support, edge cases |
| Array index access | Direct `arr[i]` | Nullish coalescing `arr[i] ?? default` | noUncheckedIndexedAccess requires it |

**Key insight:** With `noUncheckedIndexedAccess: true`, all array access returns `T | undefined`. Every `array[index]` must handle the undefined case.

## Common Pitfalls

### Pitfall 1: state_referenced_locally Warning

**What goes wrong:** Using `$props()` values directly in non-reactive declarations
**Why it happens:** Svelte 5 tracks reactivity; capturing props at initialization loses reactivity
**How to avoid:** Use `$derived` for any computed value from props
**Warning signs:** "This reference only captures the initial value"

```typescript
// WRONG
let { data } = $props();
const items = data.items; // Captured at mount, never updates

// RIGHT
let { data } = $props();
let items = $derived(data.items); // Reactive
```

### Pitfall 2: noUncheckedIndexedAccess Type Errors

**What goes wrong:** TypeScript errors on array access without null checks
**Why it happens:** tsconfig has `noUncheckedIndexedAccess: true`
**How to avoid:** Always handle `| undefined` from array access
**Warning signs:** "Object is possibly 'undefined'" on array indexing

```typescript
// WRONG
const first = items[0]; // Type: Item | undefined
first.name; // Error!

// RIGHT
const first = items[0];
if (first) {
  first.name; // OK
}

// OR with nullish coalescing
const hour = parts[0] ?? 0;
```

### Pitfall 3: Unused Imports from Destructuring

**What goes wrong:** Importing more than needed from dynamic imports
**Why it happens:** Destructuring pattern imports all listed, `noUnusedLocals: true` catches it
**How to avoid:** Only destructure what you use
**Warning signs:** "'X' is declared but its value is never read"

```typescript
// WRONG - imports staff but never uses it
const { db, staff, services } = await import('@repo/db');

// RIGHT - only import what's used
const { db, services } = await import('@repo/db');
```

### Pitfall 4: shadcn-svelte / bits-ui Type Mismatches

**What goes wrong:** Type errors in UI components after package updates
**Why it happens:** bits-ui major versions have breaking type changes
**How to avoid:** Pin bits-ui version, check compatibility before updates
**Warning signs:** ClassValue type incompatibilities, prop type errors

**Current versions in project:**
- bits-ui: ^1.0.0 (current)
- svelte: ^5.20.0 (current)

### Pitfall 5: TimeSlot Interface Mismatch

**What goes wrong:** Code references `slot.time` but interface has `slot.display`
**Why it happens:** Interface changed, callers not updated
**How to avoid:** Let TypeScript guide - read interface definitions
**Warning signs:** "Property 'time' does not exist on type 'TimeSlot'"

**Current issue in codebase:** `availability/+server.ts` uses `slot.time` but `TimeSlot` interface defines `slot.display`.

## Code Examples

### Fixing state_referenced_locally

```typescript
// Source: https://svelte.dev/docs/svelte/$derived

// File: +page.svelte - Before (warning)
<script lang="ts">
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();

  const startTime = new Date(data.appointment.startTime);
  const endTime = new Date(data.appointment.endTime);
</script>

// File: +page.svelte - After (correct)
<script lang="ts">
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();

  let startTime = $derived(new Date(data.appointment.startTime));
  let endTime = $derived(new Date(data.appointment.endTime));
</script>
```

### Fixing Array Index Access

```typescript
// Source: TypeScript handbook - noUncheckedIndexedAccess

// Before (error with noUncheckedIndexedAccess)
const parts = time.split(':');
const hour = parts[0]; // number | undefined
const min = parts[1];  // number | undefined

// After (handles undefined)
const parts = time.split(':').map(Number);
const hour = parts[0] ?? 0;
const min = parts[1] ?? 0;
```

### ESLint Ignore Patterns

```javascript
// For files that need exceptions
/* eslint-disable @typescript-eslint/no-unused-vars */

// For specific lines
// eslint-disable-next-line @typescript-eslint/no-explicit-any
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `export let prop` | `let { prop } = $props()` | Svelte 5 | All components need update |
| `$: derived = x * 2` | `let derived = $derived(x * 2)` | Svelte 5 | Reactive derivations |
| `on:click` | `onclick` | Svelte 5 | Event handler syntax |
| `<slot />` | `{@render children()}` | Svelte 5 | Content projection |
| `.eslintrc` | `eslint.config.js` | ESLint 9 | Flat config required |
| `eslint-plugin-svelte3` | `eslint-plugin-svelte` | 2023 | Different plugin |

**Deprecated/outdated:**
- `createEventDispatcher`: Use callback props
- `$$props` / `$$restProps`: Use rest destructuring from `$props()`
- `svelte/store`: Can still use, but `$state` preferred for component state
- Legacy `$:` reactive declarations: Use `$derived` and `$effect`

## Open Questions

1. **eslint-plugin-svelte-runes adoption**
   - What we know: Plugin exists for Svelte 5 runes-specific rules
   - What's unclear: Stability, whether it adds value over eslint-plugin-svelte
   - Recommendation: Start with eslint-plugin-svelte only, add runes plugin if gaps found

2. **Tailwind v4 ESLint plugin**
   - What we know: eslint-plugin-tailwindcss has beta v4 support; @poupe/eslint-plugin-tailwindcss has full support
   - What's unclear: Which is more stable for production
   - Recommendation: Skip Tailwind linting initially; add if class conflicts become an issue

## Sources

### Primary (HIGH confidence)
- [eslint-plugin-svelte User Guide](https://sveltejs.github.io/eslint-plugin-svelte/user-guide/) - ESLint configuration
- [Svelte 5 TypeScript Docs](https://svelte.dev/docs/svelte/typescript) - Props typing patterns
- [Svelte 5 Migration Guide](https://svelte.dev/docs/svelte/v5-migration-guide) - Breaking changes
- [sv check CLI](https://svelte.dev/docs/cli/sv-check) - Svelte-check options
- [SvelteKit Form Actions](https://svelte.dev/docs/kit/form-actions) - Action typing
- [Drizzle ORM Select](https://orm.drizzle.team/docs/select) - Query patterns

### Secondary (MEDIUM confidence)
- [shadcn-svelte Svelte 5 Migration](https://www.shadcn-svelte.com/docs/migration/svelte-5) - Component patterns
- [eslint-plugin-tailwindcss](https://github.com/francoismassart/eslint-plugin-tailwindcss) - Tailwind v4 beta support

### Tertiary (LOW confidence)
- eslint-plugin-svelte-runes - Early development, may have breaking changes
- @poupe/eslint-plugin-tailwindcss - Full v4 support but less established

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official documentation verified
- Architecture patterns: HIGH - Official Svelte 5 docs, verified syntax
- Pitfalls: HIGH - Based on actual errors in codebase + official docs
- ESLint config: HIGH - Official eslint-plugin-svelte user guide

**Research date:** 2026-01-21
**Valid until:** 2026-02-21 (30 days - stable ecosystem)

---

## Implementation Priority

Based on CONTEXT.md decisions (zero errors AND zero warnings, fix all occurrences):

1. **Install ESLint** - No config exists, need full setup
2. **Fix svelte-check errors** - 4 errors blocking build
3. **Fix svelte-check warnings** - 4 warnings (state_referenced_locally)
4. **Run ESLint** - Will reveal additional issues
5. **Verify patterns** - Check all libraries against official docs
6. **Document patterns** - Store in Serena memories for future reference
