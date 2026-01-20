# The Complete SvelteKit Hair Salon Tech Stack: A 2025 Architecture Guide

**SvelteKit 2 with Svelte 5 runes is the ideal fullstack foundation for this project**, eliminating the need for a separate backend while delivering exceptional performance. Combined with **Drizzle ORM + Supabase (or Neon) for the database**, **shadcn-svelte for UI components**, **Cloudflare Pages for hosting**, and **Storyblok (or Sanity) as a CMS for the tech-illiterate owner**, this stack achieves all four optimization goals: blazing page loads, seamless owner management, delightful developer experience, and breathtaking UI capabilities.

This report provides detailed pros and cons for every major architectural decision across 15 technology domains, with clear recommendations based on current 2024-2025 ecosystem maturity.

---

## Backend architecture: SvelteKit handles everything

For a hair salon website with booking, payments, and content management, **SvelteKit's built-in server capabilities are more than sufficient** and avoid the complexity of maintaining separate backend infrastructure. The framework has reached strong production maturity with Svelte 5, producing **15-30% smaller bundles** than Svelte 4 while adding native OpenTelemetry support for observability.

SvelteKit's **form actions** provide progressive enhancement out of the box—forms work without JavaScript and gain SPA-like behavior with the `use:enhance` directive. Server **load functions** run exclusively on the server with automatic dependency tracking for efficient revalidation. For external integrations or mobile apps, **+server.ts API routes** expose standard REST endpoints alongside form actions.

A separate backend in Go, Rust, or even Node.js frameworks like Fastify or Hono would add unnecessary complexity for this use case. These options shine for high-concurrency scenarios processing millions of requests, but a salon booking system will never approach those volumes. If type-safe API calls become valuable later, **tRPC 11** integrates seamlessly with SvelteKit via the fetch adapter, providing end-to-end TypeScript inference without code generation.

**Edge functions vs traditional servers** presents an interesting tradeoff. Cloudflare Workers and Vercel Edge Functions offer sub-5ms cold starts and global distribution, but edge runtimes have memory limits (128MB), execution time constraints, and limited Node.js API support. For a booking system requiring database transactions and session management, **start with traditional Node.js serverless deployment** on Vercel or Cloudflare Pages with the standard adapter—edge can be added later for specific routes like authentication middleware or geo-personalization.

---

## Database decisions favor PostgreSQL with modern tooling

**PostgreSQL via Supabase or Neon emerges as the clear winner** for a booking system requiring ACID compliance, complex scheduling queries, and concurrent booking prevention. PostgreSQL's advanced date/time handling, row-level locking, and 160/179 SQL:2011 compliance make it ideal for appointment management.

Between the two managed providers, **Supabase** offers the better all-in-one solution with built-in authentication, file storage, real-time subscriptions, and row-level security—all on a generous free tier (500MB storage, unlimited API requests). **Neon** provides a purer database experience with unique features like branch databases (Git-like workflows for testing) and scale-to-zero billing, starting at approximately **$5/month** for the Launch plan.

The ORM choice between **Drizzle** and **Prisma** depends on developer preference. Drizzle has become the community favorite for SvelteKit projects in 2024-2025, with official Svelte CLI integration (`npx sv add drizzle`), a **7.4KB bundle size** (versus Prisma's heavy query engine), and SQL-like syntax that translates to predictable queries. Prisma offers a more abstracted developer experience with excellent documentation and Prisma Studio for database visualization, but its larger bundle impacts serverless cold starts. For edge deployment compatibility, **Drizzle is the safer choice**.

MySQL alternatives like PlanetScale removed their free tier in March 2024 and now start at **$39/month**. SQLite-based **Turso** offers interesting edge-native capabilities with automatic global replication, but SQLite's single-writer limitation makes it unsuitable for concurrent booking scenarios where multiple stylists might book appointments simultaneously.

For preventing double-bookings, PostgreSQL's **optimistic locking with version columns** provides the right balance of simplicity and reliability. A transaction checks the version number before confirming an appointment; if another booking occurred first, the version mismatch triggers a retry with updated availability.

---

## Authentication: Supabase Auth or Auth.js for simplicity

The authentication landscape for SvelteKit has evolved significantly, with **Lucia Auth officially deprecated in March 2025** (though the patterns live on via `npx sv add lucia` which scaffolds the code into your project). Three strong options remain for production use.

**Supabase Auth** is the natural choice if already using Supabase for the database. It provides unlimited auth users on the free tier, social providers (Google, Facebook for customer login), magic links, and row-level security that protects data at the database level. The `@supabase/ssr` package handles SvelteKit integration, though developers must remember to call `auth.getUser()` to validate JWTs on the server—`getSession()` alone doesn't verify tokens.

**Auth.js** (formerly NextAuth) via `@auth/sveltekit` offers a database-agnostic solution with **68+ built-in OAuth providers** and pre-built sign-in components. It's mature, well-documented, and acquired by Better Auth Inc. in 2025 for continued development. The main caveat: auth logic shouldn't live in `+layout.server.ts` as it may not propagate to all routes—protect each route individually in `+page.server.ts`.

**Better Auth** has emerged as the spiritual successor to Lucia, offering a modern approach with native SvelteKit handlers, passkey support, and 2FA. It's actively developed and gaining community adoption. For managed solutions, **Kinde** stands out as the only provider with an **official SvelteKit SDK** (`@kinde-oss/kinde-auth-sveltekit`), offering a generous free tier suitable for small business scale.

For a hair salon, the recommended architecture separates admin access (email/password for the owner) from customer accounts (Google/Facebook OAuth for easy booking). Supabase Auth handles both scenarios elegantly with role-based access via custom claims.

---

## CMS for the non-technical owner: Storyblok leads

The salon owner's inability to work with technology makes CMS selection critical. After evaluating seven major options, **Storyblok emerges as the top recommendation** for its true visual editor where users click directly on page elements to edit them—no navigating complex admin panels or understanding content models.

Storyblok's **free Starter plan** includes one user with 250GB traffic per month, sufficient for a single-location salon. The visual editor provides real-time preview before publishing, eliminating the guesswork that frustrates non-technical users. Its component-based architecture maps naturally to salon content: reusable blocks for services, staff bios, gallery items, and announcements. The `@storyblok/svelte` SDK integrates cleanly with SvelteKit's load functions.

**Sanity** offers the best free tier (**20 users** versus Storyblok's one) and more customization flexibility, making it ideal if multiple staff members need CMS access. Sanity Studio is customizable to create salon-specific editing interfaces, but requires more upfront developer work to optimize for non-technical users. The real-time collaboration features shine for teams, and the GROQ query language provides powerful content retrieval.

**Contentful** should be avoided for small business—the jump from free to paid is **$300/month minimum**, making it prohibitively expensive. **Strapi** and **Payload CMS** are self-hosted and more developer-focused, lacking the visual editing experience non-technical owners need.

**Builder.io** offers drag-and-drop visual editing with Svelte SDK support, useful for truly no-code page building, but adds complexity for a site where content structure is well-defined. For most salons, Storyblok or Sanity with a well-designed content model provides the right balance.

---

## Booking system: integrate rather than build

Building a custom booking system from scratch requires **80-120 hours of development** for core functionality: time slot management, staff availability logic, buffer times, race condition prevention, Google Calendar sync, and reminder notifications. For most projects, integrating an existing solution offers better value.

**Acuity Scheduling** (now part of Squarespace) is purpose-built for salons with flat-rate pricing: **$34/month for the Growing plan** covering multiple staff calendars, service duration handling, built-in payments, and gift certificates. It lacks a true free tier but includes features that would take months to build custom.

**Cal.com** provides an open-source alternative that's self-hostable with Docker and includes a generous free tier for unlimited bookings. The Svelte 5 integration is documented with a `Cal.svelte` component supporting inline, floating button, and click-triggered embeds. However, **API access requires a commercial license** when self-hosted—a significant limitation for deep custom integration.

**Square Appointments** offers a compelling free tier (single location, unlimited calendars) that unifies online booking with Square's payment and POS ecosystem. For salons already using Square for in-person payments, this creates a seamless experience.

If building custom, use **shadcn-svelte's Calendar component** (built on Bits UI and @internationalized/date) for the date picker, implement **optimistic locking in PostgreSQL** for slot reservation, store times in UTC with IANA timezone names, and integrate the **Google Calendar API** for bi-directional sync. Schedule reminders via a cron job triggering SMS/email at 24-hour and 1-hour intervals before appointments.

---

## Payment processing: Stripe for flexibility

**Stripe provides the best developer experience** for SvelteKit integration via the community-maintained `svelte-stripe` package, which wraps `@stripe/stripe-js` with native Svelte components including `<PaymentElement/>`, `<PaymentRequestButton/>` (Apple/Google Pay), and form field components.

For salon-specific payment patterns, Stripe handles deposits effectively: create a PaymentIntent for the deposit amount, then charge the remaining balance via the stored PaymentMethod after service completion. For cancellation fees, use **SetupIntents** to save cards without immediate charges, then charge off-session for no-shows. Stripe Billing manages membership subscriptions with smart retry logic that recovers **56% of failed payments** automatically.

**Square** deserves consideration for salons wanting unified online and in-person payments. Its ecosystem includes physical hardware (Reader, Terminal, Register), and online transaction fees are identical to Stripe at **2.9% + $0.30**. Notably, Square provides **free chargeback protection up to $250/month**—valuable for salons dealing with cancellation disputes.

Payment Element with hosted iframes keeps PCI compliance at the simplest **SAQ A level**—card data never touches your servers. Store only tokenized PaymentMethod IDs, card brand, and last four digits. Webhook handlers in SvelteKit's `+server.ts` routes process `payment_intent.succeeded`, `invoice.payment_failed`, and subscription events to update appointment status and trigger notifications.

---

## UI components: shadcn-svelte enables stunning design

For a "breathtakingly beautiful yet intuitive" salon website, **shadcn-svelte is the definitive choice**. Unlike traditional component libraries, shadcn-svelte copies component source code into your project, enabling complete customization for unique brand aesthetics. Built on **Bits UI** (headless, accessible primitives) and **Tailwind CSS**, it offers **50+ components** including navigation menus, dialogs, sheets, calendars, and form elements—all with full **Svelte 5 and Tailwind v4 support**.

The philosophy "not a component library—it's how you build your component library" perfectly serves salon branding needs. Components are added via CLI (`npx shadcn-svelte add button card dialog sheet tabs`), then modified freely. Accessibility comes built-in with ARIA attributes, keyboard navigation, and focus management from the underlying Bits UI primitives.

For alternative approaches: **Skeleton UI v3** (in beta) provides a powerful theme system with pre-built skins and design tokens, while **Flowbite Svelte** (`flowbite-svelte-next` for Svelte 5) offers 130+ ready-made components for faster prototyping. **DaisyUI** works as a pure Tailwind plugin with 35+ built-in themes and zero runtime overhead, though component behavior requires manual implementation.

**Lucide icons** (`@lucide/svelte`) provide **1,500+ consistent stroke icons** including scissors, calendar, phone, and clock—perfect for salon contexts. Svelte's **built-in transitions** (`fade`, `fly`, `slide`, `scale`, `blur`) create elegant animations with longer durations (500-800ms) for luxurious feels. For list animations, **AutoAnimate** (`@formkit/auto-animate`) adds automatic entrance/exit transitions with a simple `use:autoAnimate` action.

**Superforms** handles booking forms with server and client validation, 10+ validation library adapters (Zod 4 now supported), auto-focus on invalid fields, and progressive enhancement. Combined with shadcn-svelte's Form components, this creates polished, accessible form experiences.

---

## State management leverages Svelte 5 runes

Svelte 5's rune system fundamentally changes state management, making external libraries largely unnecessary for most applications. **`$state`** creates reactive values that update the UI on direct mutation—no setters required. **`$derived`** computes memoized values that recalculate only when dependencies change. **`$effect`** runs side effects like localStorage persistence or DOM manipulation.

For complex state like a multi-step booking wizard, **class-based state with runes** provides excellent encapsulation:

```javascript
class BookingWizard {
  services = $state([]);
  stylist = $state(null);
  datetime = $state(null);
  currentStep = $state(1);
  
  get totalPrice() {
    return this.services.reduce((sum, s) => sum + s.price, 0);
  }
}
```

This pattern centralizes logic, preserves TypeScript types, and avoids the boilerplate of external state management libraries. For cross-component sharing, use Svelte's **Context API** (`setContext`/`getContext`) which is SSR-safe and prevents global state pollution.

Traditional Svelte stores (`writable`, `readable`, `derived`) **remain supported** in Svelte 5 and integrate well for specific patterns like cross-tab synchronization or localStorage persistence via `svelte-persisted-store`. For server state with caching and background refetching, **TanStack Query** (`@tanstack/svelte-query` v5+) now has native runes support and excels at real-time availability polling with automatic revalidation.

The general principle: start with local `$state`, extract to class-based patterns when state grows, add persistence when users expect data to survive navigation, and reach for TanStack Query only when you need sophisticated caching of server data.

---

## Repository structure and development environment

For a project potentially including both customer-facing site and admin dashboard, **pnpm workspaces with Turborepo** provides the optimal monorepo setup. pnpm's content-addressable store uses **70% less disk space** than npm through hard links, enforces strict dependencies preventing phantom imports, and offers native workspace support. Turborepo adds intelligent task caching—**30-second builds become 0.2 seconds** from cache—with minimal configuration and free remote caching via Vercel.

SvelteKit folder structure should leverage **route groups** (`(marketing)`, `(booking)`, `(auth)`) to organize routes without affecting URLs, keep server-only code in `$lib/server` (SvelteKit prevents client imports automatically), and colocate route-specific components within route folders. Feature-based organization scales better than layer-based as the project grows.

The **WSL2 development environment** requires one critical optimization: **store projects in the Linux filesystem** (`~/projects/salon-website/`) rather than Windows mounts (`/mnt/c/...`) to avoid 10-20x slower file operations. Configure WSL2 memory limits in `.wslconfig`, increase `fs.inotify.max_user_watches` for large projects, and access projects via `code .` from the WSL terminal with the Remote-WSL extension.

Essential VSCode extensions include **Svelte for VS Code** (official syntax and IntelliSense), **Tailwind CSS IntelliSense** (class autocomplete), and **Error Lens** (inline error display). For code quality, ESLint 9's flat config with `eslint-plugin-svelte` and `prettier-plugin-svelte` handles formatting, while **Husky** with **lint-staged** enforces checks on commit.

Testing combines **Vitest** for unit tests (configured in vite.config.ts with jsdom environment), **@testing-library/svelte** for component testing, and **Playwright** for end-to-end booking flow validation.

---

## Hosting: Cloudflare Pages delivers edge performance

**Cloudflare Pages with adapter-cloudflare emerges as the top hosting choice** for performance-critical deployments. It provides true global edge SSR across **275+ data centers**, zero egress fees (massive cost advantage at scale), and native access to D1 (SQLite at edge), KV storage, and R2 object storage. The free tier includes **100,000 requests per day** with unlimited bandwidth.

The platform access pattern in SvelteKit allows direct database queries from load functions:
```javascript
export async function load({ platform }) {
  const db = platform.env.DB;
  const result = await db.prepare('SELECT * FROM services').all();
  return { services: result.results };
}
```

**Vercel** offers zero-config deployment with excellent developer experience, ISR support, and integrated analytics. However, benchmarks show SvelteKit running **3.6x slower on Vercel (367ms) compared to Railway with Bun (102ms)**. The free tier works for development; production may face surprise costs from bandwidth and function invocations.

**Railway** provides the best raw performance for SvelteKit via container deployment with Bun runtime support. Database inclusion (managed Postgres, Redis) simplifies the stack, and horizontal scaling handles growth. The Hobby plan starts at **$5/month** with usage-based billing.

For image hosting, **Cloudinary** serves salon galleries with automatic format conversion (WebP/AVIF), face detection for portraits, and an upload widget non-technical owners can use. The free tier (25 credits/month) likely suffices for small salons. **Cloudflare Images** offers a budget alternative at $5/month for 100K stored images if already on Cloudflare.

---

## Email and SMS for appointment notifications

Appointment confirmations and reminders require reliable transactional email and SMS. **Resend** offers the best developer experience with a modern TypeScript API, React Email integration for templating (renders to HTML for any framework), and **3,000 free emails per month**. **Postmark** achieves the highest deliverability rate (**93.8%** in tests) with fastest time-to-inbox, ideal when appointment confirmations absolutely must arrive.

For SMS, **Plivo** undercuts Twilio by **33-40%** at $0.0045-0.0055 per US message with free inbound SMS—perfect for appointment reminders where customers reply to confirm. Twilio remains the industry standard with comprehensive documentation and multi-channel support if future WhatsApp or voice integration becomes valuable.

The notification sequence for salons should include: instant booking confirmation (email with .ics calendar attachment), 24-48 hour reminder (email + SMS), 1-2 hour reminder (SMS only), and 24-hour follow-up requesting reviews. **Text reminders reduce no-shows by 66%** according to scheduling platform data.

Email templates built with **MJML** compile to responsive HTML that renders correctly across all clients including Outlook. The component syntax (`<mj-section>`, `<mj-button>`) simplifies responsive email development. Templates can be pre-compiled at build time or rendered server-side.

---

## SEO strategy for local salon visibility

SvelteKit's rendering flexibility enables optimal SEO configuration. **Prerender static pages** (homepage, services, about) with `export const prerender = true` for instant CDN delivery. Use **SSR for booking pages** requiring user-specific data. For frequently updated galleries, Vercel's **ISR** revalidates cached content at configurable intervals without full rebuilds.

**Structured data using JSON-LD** is essential for local business visibility. Implement the **HairSalon schema** (a specific LocalBusiness subtype) with complete address, geo coordinates, opening hours, price range, and social links. Service pages should include **Service schema** with pricing, and review sections need **AggregateRating** markup. The `svelte-meta-tags` package handles meta tags and Open Graph with JSON-LD support.

**Google Business Profile optimization** drives local search visibility—it accounts for **19% of local ranking factors**. Complete the profile with primary category "Hair Salon," add all services with descriptions and prices, upload high-quality photos weekly (42% more direction requests), respond to every review, and enable online booking links.

Core Web Vitals optimization focuses on three metrics: **LCP** (Largest Contentful Paint < 2.5s) through prerendering, image optimization, and font preloading; **CLS** (Cumulative Layout Shift < 0.1) via explicit image dimensions and avoiding content insertion above existing content; **INP** (Interaction to Next Paint < 200ms, replaced FID in March 2024) through code splitting and deferring non-critical JavaScript. Svelte 5's smaller bundles provide a head start, and `@sveltejs/enhanced-img` optimizes local images at build time.

---

## Salon-specific features to implement

The service menu architecture should support **categories** (cuts, color, treatments, styling), **variable durations** (ranges for complex services), **price types** (fixed, starting-from, range, consultation-required), and **add-ons** like deep conditioning or Olaplex treatments. Package deals bundling multiple services with discounts encourage upsells.

Staff profiles need **individual booking calendars**, portfolio galleries of their work, specialties and certifications, client reviews specific to each stylist, and direct booking CTAs. Dedicated `/team/[slug]` pages improve SEO and allow customers to find and book their preferred stylist directly.

The gallery requires **before/after photo displays** with consistent lighting and positioning standards, categorization by service type, tagging by stylist and hair type, and lazy loading with blur-up placeholders for performance. Instagram feed integration via Basic Display API or embed widgets extends portfolio reach.

**Google Reviews integration** can use third-party widgets (EmbedSocial, Elfsight) for simplicity or the Google Places API for custom display. AggregateRating schema markup enables rich snippets in search results.

For loyalty programs, a **points-based system** (earn per dollar, redeem for discounts) or punch card model ("9th cut free") both work well digitally. Gift cards require physical and e-gift options, custom denominations, partial redemption tracking, and integration with payment processing for redemption.

---

## Recommended technology stack summary

The optimal stack for a feature-rich, high-performance hair salon website in 2025:

**Core framework**: SvelteKit 2 with Svelte 5 runes as fullstack solution—no separate backend needed. TypeScript throughout for type safety.

**Database**: PostgreSQL via Supabase (includes auth, storage, realtime) or Neon (pure database with scale-to-zero). Drizzle ORM for lightweight, type-safe queries with native SvelteKit CLI integration.

**Authentication**: Supabase Auth if using Supabase database, otherwise Auth.js with social providers (Google/Facebook for customers, email/password for admin).

**CMS**: Storyblok for visual editing or Sanity for flexible content modeling—both let the tech-illiterate owner manage services, pricing, staff, gallery, and announcements independently.

**Booking**: Integrate Acuity Scheduling ($34/month) or Cal.com (open source) rather than building custom. For custom needs, use shadcn-svelte Calendar components with optimistic locking in PostgreSQL.

**Payments**: Stripe via svelte-stripe package, with Square as alternative for unified online/in-store POS.

**UI**: shadcn-svelte components with Tailwind CSS, Lucide icons, Svelte built-in transitions, and Superforms for booking form handling.

**Hosting**: Cloudflare Pages for edge performance and cost efficiency, or Vercel for simpler deployment. Cloudinary for image optimization and gallery management.

**Notifications**: Resend for email (3,000/month free), Plivo for SMS reminders (cheapest rates).

**Development**: pnpm workspaces, ESLint/Prettier with Svelte plugins, Vitest for unit tests, Playwright for E2E. Projects stored in WSL2 Linux filesystem for optimal performance.

This architecture delivers sub-second page loads through edge deployment and prerendering, intuitive content management through visual CMS editing, delightful developer experience through Svelte 5's reactivity and modern tooling, and stunning UI through accessible, customizable component libraries—all while remaining cost-effective for a small business at approximately **$50-100/month** total infrastructure cost.