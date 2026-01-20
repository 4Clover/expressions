# Stack Research

**Domain:** Hair salon website with booking system
**Project:** Expressions Hair Designs
**Researched:** 2026-01-20
**Overall Confidence:** HIGH

---

## Executive Summary

The existing tech stack in `docs/tech-stack-workup.md` is **well-researched and validated** for 2025/2026 best practices. All major choices align with current ecosystem recommendations. Minor updates needed for package names and version specificity.

**Verdict:** Proceed with existing stack. This research validates choices and fills gaps.

---

## Validated Stack Choices

### Core Framework: SvelteKit 2.x + Svelte 5

| Aspect | Value | Confidence |
|--------|-------|------------|
| **Package** | `@sveltejs/kit` | HIGH |
| **Current Version** | 2.15+ (January 2026) | HIGH |
| **Svelte Version** | 5.16+ | HIGH |

**Validation:** SvelteKit 2.12+ introduced `$app/state` module using Svelte 5 runes. The `bundleStrategy` option in 2.13+ and 2.15+ provides JS/CSS bundling flexibility. Svelte 5's runes system (`$state`, `$derived`, `$effect`) is stable and feature-complete.

**Concerns:** None. This is the recommended stack for new Svelte projects.

**Source:** [What's new in Svelte: January 2026](https://svelte.dev/blog/whats-new-in-svelte-january-2026)

---

### Database: Supabase (PostgreSQL)

| Aspect | Value | Confidence |
|--------|-------|------------|
| **Package** | `@supabase/supabase-js` | HIGH |
| **SSR Package** | `@supabase/ssr` | HIGH |
| **Current Version** | Latest | HIGH |

**Validation:** Supabase with `@supabase/ssr` is the official recommended approach for SvelteKit. The pattern in the tech doc (using `safeGetSession` with `getUser()` validation) matches 2025 best practices.

**Critical Note:** Always call `auth.getUser()` to validate JWTs on server. The `getSession()` alone doesn't verify tokens. This is correctly documented in the existing tech stack.

**Concern:** Edge runtime compatibility with Supabase requires using the Transaction Pool connection string, not direct connection.

**Source:** [Supabase SvelteKit SSR Guide](https://supabase.com/docs/guides/auth/server-side/sveltekit)

---

### ORM: Drizzle

| Aspect | Value | Confidence |
|--------|-------|------------|
| **Package** | `drizzle-orm` | HIGH |
| **Dev Package** | `drizzle-kit` | HIGH |
| **Current Version** | Latest (0.37+) | MEDIUM |

**Validation:** Drizzle is the preferred ORM for SvelteKit in 2024-2025. The official Svelte CLI (`npx sv add drizzle`) supports direct integration. Edge-compatible unlike Prisma.

**Integration Pattern (Supabase + Drizzle):**
```typescript
// src/lib/server/db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client);
```

**Concern for Cloudflare:** The `postgres` package may have Node module resolution issues on Cloudflare Workers edge. Use connection pooling mode (`?pgbouncer=true`) and test thoroughly.

**Source:** [Drizzle SvelteKit Integration](https://sveltekit.io/blog/drizzle-sveltekit-integration)

---

### CMS: Storyblok

| Aspect | Value | Confidence |
|--------|-------|------------|
| **Package** | `@storyblok/svelte` | HIGH |
| **Current Version** | v5 (Svelte 5 compatible) | HIGH |
| **Repository** | Moved to monorepo | HIGH |

**Validation:** Storyblok released SDK v5 specifically for Svelte 5 runes compatibility. The visual editor is ideal for non-technical owners. Free Starter tier (1 user, 250GB traffic) covers MVP needs.

**Update from Tech Doc:** The original repository has been archived. Development moved to `storyblok/monoblok` monorepo at `packages/svelte`.

**New Features in v5:**
- `renderRichText` function works with `$derived` rune
- Improved `storyblokEditable` action
- Better error messages for Visual Editor integration

**Source:** [Storyblok Svelte SDK v5 Announcement](https://www.storyblok.com/mp/storyblok-svelte-sdk-updated-to-v5-with-lots-of-new-features)

---

### Payments: Square

| Aspect | Value | Confidence |
|--------|-------|------------|
| **Web SDK** | Square Web Payments SDK (CDN) | HIGH |
| **Server SDK** | `square` | HIGH |
| **Current Version** | Latest | MEDIUM |

**Validation:** Square Web Payments SDK is loaded via CDN (`https://web.squarecdn.com/v1/square.js`). Good choice for salon with potential POS integration.

**2025 Security Requirements (Critical):**
Starting October 1st, 2025, Square requires:
- Secure Contexts (HTTPS)
- Proper Content Security Policy
- No Internet Explorer 11 support

**Recent Updates (April 2025):**
- Updated ACH tokenization parameters
- New Afterpay experience (Cash App integration)
- New styling options for AfterpayCheckoutWidget

**Note:** No official Svelte wrapper exists. Use vanilla JS integration or adapt the React wrapper pattern.

**Source:** [Square Web Payments SDK](https://developer.squareup.com/docs/web-payments/overview)

---

### UI Components: shadcn-svelte

| Aspect | Value | Confidence |
|--------|-------|------------|
| **CLI Package** | `shadcn-svelte` | HIGH |
| **Current Version** | 1.0.9 | HIGH |
| **Foundation** | Bits UI (headless) | HIGH |

**Validation:** shadcn-svelte fully supports Svelte 5 and Tailwind v4. The CLI command structure in tech doc is correct.

**Recent Updates (2025):**
- Tailwind v4 support (May 2025)
- New Calendar component (June 2025)
- Charts support (May 2025)

**Updated Dependencies:**
- `bits-ui` (updated for Svelte 5)
- `cmdk-sv` replaced with Bits UI Command component
- `svelte-sonner`, `paneforge`, `vaul-svelte`, `mode-watcher` all updated

**Installation (Verified):**
```bash
npx shadcn-svelte@latest init
npx shadcn-svelte@latest add button card dialog sheet tabs calendar form input label select textarea
```

**Source:** [shadcn-svelte Changelog](https://www.shadcn-svelte.com/docs/changelog)

---

### UI Components (MVP): Flowbite Svelte

| Aspect | Value | Confidence |
|--------|-------|------------|
| **Svelte 5 Package** | `flowbite-svelte-next` | HIGH |
| **Stable Package** | `flowbite-svelte` (1.31.0) | HIGH |
| **Status** | Early development | MEDIUM |

**Validation:** `flowbite-svelte-next` is built from scratch for Svelte 5 runes. Good for rapid prototyping.

**Warning:** The `-next` package is in early development. APIs may change. Use for MVP exploration, migrate to shadcn-svelte for production.

**Source:** [Flowbite Svelte Next GitHub](https://github.com/themesberg/flowbite-svelte-next)

---

### Icons: Lucide

| Aspect | Value | Confidence |
|--------|-------|------------|
| **Svelte 5 Package** | `@lucide/svelte` | HIGH |
| **Svelte 4 Package** | `lucide-svelte` (legacy) | - |
| **Current Version** | 0.562.0 | HIGH |

**CORRECTION NEEDED:** Tech doc shows `@lucide/svelte` which is correct. However, some imports may need updating.

**Important:** `@lucide/svelte` is ONLY for Svelte 5. The old `lucide-svelte` package will be deprecated.

**Optimal Import Pattern (Faster Builds):**
```svelte
<script>
  // Direct imports for faster builds
  import Scissors from '@lucide/svelte/icons/scissors';
  import Calendar from '@lucide/svelte/icons/calendar';
</script>
```

**Source:** [Lucide Svelte Guide](https://lucide.dev/guide/packages/lucide-svelte)

---

### Forms: Superforms + Zod 4

| Aspect | Value | Confidence |
|--------|-------|------------|
| **Package** | `sveltekit-superforms` | HIGH |
| **Zod 4 Adapter** | `zod4` / `zod4Client` | HIGH |
| **Status** | Supported | HIGH |

**Validation:** Superforms added Zod 4 adapter. Works with both full Zod and Zod Mini.

**Breaking Change Alert:** Zod 4 uses different adapter names:
```typescript
// Server-side
import { zod4 } from 'sveltekit-superforms/adapters';
const form = await superValidate(zod4(schema));

// Client-side
import { zod4Client } from 'sveltekit-superforms/adapters';
validators: zod4Client(schema)
```

**Zod 4 Benefits:**
- 14x faster string parsing
- 7x faster array parsing
- 57% smaller bundle
- Better TypeScript compilation times

**Known Issues Fixed:**
- Default Date values in nested objects
- Top-level discriminated unions
- Set and map handling in JSON Schema

**Source:** [Zod 4 Superforms Compatibility](https://github.com/ciscoheat/sveltekit-superforms/releases)

---

### Hosting: Cloudflare Pages

| Aspect | Value | Confidence |
|--------|-------|------------|
| **Adapter** | `@sveltejs/adapter-cloudflare` | HIGH |
| **Deprecated** | `adapter-cloudflare-workers` | - |
| **Wrangler Version** | 4.x | HIGH |

**Validation:** Use `adapter-cloudflare`, not the deprecated workers adapter.

**Configuration (Updated for 2025):**
```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare';

export default {
  kit: {
    adapter: adapter()
  }
};
```

**wrangler.json (for Workers deployment):**
```json
{
  "main": ".svelte-kit/cloudflare/_worker.js",
  "compatibility_date": "2025-01-01",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "binding": "ASSETS",
    "directory": ".svelte-kit/cloudflare"
  }
}
```

**Local Testing:**
```bash
wrangler pages dev .svelte-kit/cloudflare
```

**Limitation:** Cannot use `fs` module. Use `read` function from `$app/server` instead.

**Source:** [Cloudflare SvelteKit Adapter Docs](https://svelte.dev/docs/kit/adapter-cloudflare)

---

### Email: Resend

| Aspect | Value | Confidence |
|--------|-------|------------|
| **Package** | `resend` | HIGH |
| **Free Tier** | 3,000 emails/month | HIGH |

**Validation:** Resend with SvelteKit is well-documented. Use server-only files (`.server.ts`) for API key protection.

**Integration Pattern:**
```typescript
// src/lib/server/email.ts
import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';

const resend = new Resend(RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  return resend.emails.send({
    from: 'Expressions <bookings@expressionshair.com>',
    to,
    subject,
    html
  });
}
```

**Source:** [Resend SvelteKit Docs](https://resend.com/docs/send-with-sveltekit)

---

### SMS: Plivo

| Aspect | Value | Confidence |
|--------|-------|------------|
| **Package** | `plivo` | HIGH |
| **Current Version** | 4.75.4 | HIGH |
| **Cost** | ~$0.0045/msg US | HIGH |

**Validation:** Plivo SDK is actively maintained (last published 6 days ago as of research date). 33-40% cheaper than Twilio.

**Source:** [Plivo npm](https://www.npmjs.com/package/plivo)

---

### Email Templates: MJML

| Aspect | Value | Confidence |
|--------|-------|------------|
| **Package** | `mjml` | HIGH |
| **Status** | Mature, stable | HIGH |

**Validation:** MJML remains the standard for responsive email templates. Works in Outlook and all major clients.

**Alternative Consideration:** `svelte-email-tailwind` allows writing email templates in Svelte with Tailwind classes. Could simplify DX if team is Svelte-focused.

**Recommendation:** Stick with MJML for reliability. Consider `svelte-email-tailwind` only if MJML proves too cumbersome.

**Source:** [MJML Official](https://mjml.io/)

---

### Testing: Playwright

| Aspect | Value | Confidence |
|--------|-------|------------|
| **Package** | `@playwright/test` | HIGH |
| **Current Version** | Latest | HIGH |

**Validation:** Playwright is the recommended E2E testing framework for SvelteKit. The CLI (`npx sv create`) offers Playwright setup option.

**2025 Enhancement:** Consider `@vitest/browser` + `vitest-browser-svelte` + `playwright` for component testing in real browsers instead of jsdom.

**Source:** [Svelte Testing Docs](https://svelte.dev/docs/svelte/testing)

---

### Monorepo: Turborepo + pnpm

| Aspect | Value | Confidence |
|--------|-------|------------|
| **Package** | `turbo` | HIGH |
| **Package Manager** | `pnpm` | HIGH |

**Validation:** Official Turborepo documentation includes SvelteKit guide. The structure in tech doc is correct.

**Critical Configuration for SvelteKit:**
```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".svelte-kit/**", ".vercel/**"]
    }
  }
}
```

**Important:** Include hosting-specific directories in `outputs` (e.g., `.vercel/**` for Vercel).

**Performance:** Initial builds ~30s, cached builds ~0.2s.

**Source:** [Turborepo SvelteKit Guide](https://turborepo.com/docs/guides/frameworks/sveltekit)

---

## Stack Gaps Identified

### 1. Background Jobs / Scheduled Tasks

**Gap:** Tech doc mentions Cloudflare Cron Triggers or QStash for scheduled notifications but no specific recommendation.

**Recommendation:** Use Cloudflare Scheduled Workers (Cron Triggers) for:
- Appointment reminders (24h, 2h before)
- Review request emails (24h after)
- Notification queue processing

**Alternative:** If more complex job handling needed, consider Trigger.dev (has Svelte SDK).

### 2. Rate Limiting

**Gap:** No rate limiting strategy documented.

**Recommendation:** Use Cloudflare KV for rate limiting on:
- Booking attempts (prevent abuse)
- Contact form submissions
- API endpoints

### 3. Error Monitoring

**Gap:** No error monitoring/observability mentioned.

**Recommendation:** Add Sentry (`@sentry/sveltekit`) for:
- Error tracking
- Performance monitoring
- Session replay (optional)

### 4. Analytics

**Gap:** SEO Dashboard mentioned but no analytics strategy.

**Recommendation:**
- Cloudflare Web Analytics (free, privacy-focused)
- Google Analytics 4 (for deeper insights)
- Plausible (if privacy is priority)

---

## Recommended Versions Summary

### Core Technologies

| Technology | Package | Version | Confidence |
|------------|---------|---------|------------|
| SvelteKit | `@sveltejs/kit` | ^2.15.0 | HIGH |
| Svelte | `svelte` | ^5.16.0 | HIGH |
| Drizzle ORM | `drizzle-orm` | ^0.37.0 | MEDIUM |
| Drizzle Kit | `drizzle-kit` | ^0.30.0 | MEDIUM |
| Supabase JS | `@supabase/supabase-js` | ^2.47.0 | HIGH |
| Supabase SSR | `@supabase/ssr` | ^0.5.0 | HIGH |
| Zod | `zod` | ^4.0.0 | HIGH |
| Superforms | `sveltekit-superforms` | ^2.28.0 | HIGH |

### UI & Styling

| Technology | Package | Version | Confidence |
|------------|---------|---------|------------|
| shadcn-svelte | CLI | ^1.0.9 | HIGH |
| Flowbite (MVP) | `flowbite-svelte-next` | Latest | MEDIUM |
| Lucide Icons | `@lucide/svelte` | ^0.562.0 | HIGH |
| Tailwind CSS | `tailwindcss` | ^4.0.0 | HIGH |

### Services & Infrastructure

| Technology | Package | Version | Confidence |
|------------|---------|---------|------------|
| Storyblok | `@storyblok/svelte` | ^5.0.0 | HIGH |
| Square | `square` | Latest | MEDIUM |
| Resend | `resend` | ^4.0.0 | HIGH |
| Plivo | `plivo` | ^4.75.0 | HIGH |
| MJML | `mjml` | ^5.0.0 | HIGH |
| Cloudflare Adapter | `@sveltejs/adapter-cloudflare` | ^4.0.0 | HIGH |

### Development Tools

| Technology | Package | Version | Confidence |
|------------|---------|---------|------------|
| Turborepo | `turbo` | ^2.3.0 | HIGH |
| pnpm | - | ^9.0.0 | HIGH |
| Playwright | `@playwright/test` | ^1.49.0 | HIGH |
| Vitest | `vitest` | ^2.0.0 | HIGH |
| Wrangler | `wrangler` | ^4.0.0 | HIGH |

---

## Installation Commands

```bash
# Create SvelteKit project
pnpm create svelte@latest expressions-web
cd expressions-web

# Core dependencies
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit
pnpm add zod sveltekit-superforms
pnpm add @storyblok/svelte
pnpm add resend plivo mjml
pnpm add square

# UI
npx shadcn-svelte@latest init
npx shadcn-svelte@latest add button card dialog sheet tabs calendar form input label select textarea alert badge separator
pnpm add @lucide/svelte

# MVP prototyping (optional)
pnpm add flowbite flowbite-svelte-next

# Cloudflare
pnpm add -D @sveltejs/adapter-cloudflare wrangler

# Testing
pnpm add -D @playwright/test vitest @vitest/browser vitest-browser-svelte
npx playwright install

# Code quality
pnpm add -D eslint prettier eslint-plugin-svelte prettier-plugin-svelte
pnpm add -D husky lint-staged

# Drizzle setup via CLI
npx sv add drizzle

# Turborepo (if monorepo)
pnpm add -D turbo
```

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `lucide-svelte` | Legacy package for Svelte 4 | `@lucide/svelte` |
| `@sveltejs/adapter-cloudflare-workers` | Deprecated | `@sveltejs/adapter-cloudflare` |
| `@supabase/auth-helpers-sveltekit` | Deprecated | `@supabase/ssr` |
| Prisma | Heavy bundle, edge incompatible | Drizzle ORM |
| `zod` adapter in Superforms | Old Zod 3 adapter | `zod4` / `zod4Client` adapters |
| `getSession()` alone | Doesn't validate JWT | `safeGetSession()` with `getUser()` |
| jsdom for testing | Simulated environment | Playwright/Vitest Browser Mode |
| Stripe | Project requirement is Square | Square Web Payments SDK |

---

## Version Compatibility Notes

### Cloudflare Edge + Supabase

The `postgres` package used with Drizzle may have issues on Cloudflare Workers due to Node module dependencies (`dns`, `net`).

**Mitigation:**
1. Use Supabase connection pooler URL with `?pgbouncer=true`
2. Add `nodejs_compat` flag to wrangler config
3. Test thoroughly before production deployment

### Zod 4 Migration

If porting existing code from Picasso-Hair-Salon:
1. Update Zod imports
2. Change Superforms adapter from `zod` to `zod4`
3. Review enum handling (breaking change in Zod 4)
4. Test all form validations

### Tailwind v4

shadcn-svelte supports Tailwind v4 as of May 2025. If using Flowbite Svelte, verify compatibility with your Tailwind version.

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Core Framework | HIGH | Official docs verified, stable releases |
| Database/ORM | HIGH | Multiple official sources confirm pattern |
| CMS | HIGH | Official Storyblok announcement |
| Payments | MEDIUM | No Svelte-specific docs, vanilla JS approach |
| UI Components | HIGH | Official changelogs verified |
| Forms | HIGH | GitHub releases confirm Zod 4 support |
| Hosting | HIGH | Official adapter docs verified |
| Email/SMS | HIGH | npm registries verified |
| Monorepo | HIGH | Official Turborepo docs |

---

## Sources

### High Confidence (Official Documentation)
- [Svelte Blog - January 2026](https://svelte.dev/blog/whats-new-in-svelte-january-2026)
- [SvelteKit Cloudflare Adapter](https://svelte.dev/docs/kit/adapter-cloudflare)
- [Supabase SvelteKit SSR](https://supabase.com/docs/guides/auth/server-side/sveltekit)
- [Storyblok Svelte SDK v5](https://www.storyblok.com/mp/storyblok-svelte-sdk-updated-to-v5-with-lots-of-new-features)
- [shadcn-svelte Changelog](https://www.shadcn-svelte.com/docs/changelog)
- [Turborepo SvelteKit Guide](https://turborepo.com/docs/guides/frameworks/sveltekit)
- [Lucide Svelte](https://lucide.dev/guide/packages/lucide-svelte)
- [Svelte Testing](https://svelte.dev/docs/svelte/testing)

### Medium Confidence (Verified npm/GitHub)
- [Superforms Releases](https://github.com/ciscoheat/sveltekit-superforms/releases)
- [Drizzle SvelteKit Integration](https://sveltekit.io/blog/drizzle-sveltekit-integration)
- [Plivo npm](https://www.npmjs.com/package/plivo)
- [Square Web Payments](https://developer.squareup.com/docs/web-payments/overview)

### Low Confidence (Community Sources)
- [Flowbite Svelte Next](https://github.com/themesberg/flowbite-svelte-next) - Early development warning

---

*Research completed 2026-01-20. Validate versions against npm before installation.*
