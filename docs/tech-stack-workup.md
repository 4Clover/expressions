# Expressions — Technology Stack Document

> **Project Type:** Feature-rich hair salon website with booking, payments, CMS, and admin dashboard  
> **Primary Goals:** Page load speed, tech-illiterate owner management, excellent DX, stunning UI  
> **Development Phase:** MVP first, then iterative enhancement

---

## Quick Reference Table

| Category            | Technology         | Version/Variant           | Priority                      |
| ------------------- | ------------------ | ------------------------- | ----------------------------- |
| Framework           | SvelteKit          | 2.x + Svelte 5            | Core                          |
| Database            | Supabase           | PostgreSQL                | Core                          |
| Authentication      | Supabase Auth      | —                         | Core                          |
| ORM                 | Drizzle            | Latest                    | Core                          |
| CMS                 | Storyblok          | Free Starter              | Core                          |
| Booking System      | Custom             | Port existing + modernize | Core                          |
| Payments            | Square             | Online + POS ecosystem    | MVP (basic) → Post-MVP (full) |
| UI Components       | shadcn-svelte      | Svelte 5 compatible       | Core                          |
| UI Components (MVP) | Flowbite Svelte    | `flowbite-svelte-next`    | MVP acceleration              |
| Icons               | Lucide             | `@lucide/svelte`          | Core                          |
| Animations          | Svelte Transitions | Built-in                  | Core                          |
| Forms               | Superforms         | Latest                    | Core                          |
| Validation          | Zod                | 4.x                       | Core                          |
| State Management    | Svelte 5 Runes     | Built-in                  | Core                          |
| Package Manager     | pnpm               | Latest                    | Core                          |
| Monorepo            | Turborepo          | Latest                    | Core                          |
| Testing (E2E)       | Playwright         | Latest                    | Core (with booking)           |
| Hosting             | Cloudflare Pages   | `adapter-cloudflare`      | Core                          |
| Image Hosting       | Cloudflare Images  | —                         | Default                       |
| Image Hosting (Alt) | Cloudinary         | —                         | If hairstyle try-on feature   |
| Email               | Resend             | 3,000/month free          | Core                          |
| SMS                 | Plivo              | ~$0.0045/msg              | Core                          |
| Email Templates     | MJML               | Latest                    | Core                          |
| SEO Dashboard       | Custom             | —                         | MVP if feasible               |

---

## Detailed Stack Breakdown

### 1. Core Framework — SvelteKit 2 + Svelte 5

| Aspect            | Details                                                          |
| ----------------- | ---------------------------------------------------------------- |
| **Role**          | Fullstack framework (no separate backend needed)                 |
| **Key Features**  | Form actions, server load functions, API routes via `+server.ts` |
| **Bundle Size**   | 15-30% smaller than Svelte 4                                     |
| **Observability** | Native OpenTelemetry support                                     |

**Critical Notes:**

- Form actions provide progressive enhancement — forms work without JS, gain SPA behavior with `use:enhance`
- Server load functions run exclusively server-side with automatic dependency tracking
- Use `+server.ts` for REST API endpoints (external integrations, potential mobile app)
- Edge functions can be added later for specific routes; start with standard Node.js serverless

**Form Actions Pattern:**

```javascript
// +page.server.ts
export const actions = {
	book: async ({ request, locals }) => {
		const data = await request.formData();
		// Server-side validation and booking logic
	},
};
```

---

### 2. Database — Supabase (PostgreSQL)

| Aspect                | Details                                                         |
| --------------------- | --------------------------------------------------------------- |
| **Database**          | PostgreSQL (managed)                                            |
| **Free Tier**         | 500MB storage, unlimited API requests                           |
| **Included Services** | Auth, file storage, real-time subscriptions, row-level security |
| **SQL Compliance**    | 160/179 SQL:2011 features                                       |

**Critical Notes:**

- PostgreSQL's date/time handling is ideal for appointment management
- Row-level locking prevents double-bookings via optimistic locking
- Store appointment times in **UTC** with **IANA timezone names**
- Use **version columns** for optimistic locking pattern:

```sql
-- Booking with optimistic lock
UPDATE appointments
SET status = 'confirmed', version = version + 1
WHERE id = $1 AND version = $2
RETURNING *;
-- If 0 rows returned, another booking occurred — retry with fresh data
```

**Row-Level Security:**

- Protects data at database level
- Customers see only their own appointments
- Staff see their assigned appointments
- Owner sees everything

---

### 3. Authentication — Supabase Auth

| Aspect               | Details                                 |
| -------------------- | --------------------------------------- |
| **Free Tier**        | Unlimited auth users                    |
| **Social Providers** | Google, Facebook (for customer login)   |
| **Other Methods**    | Magic links, email/password (for admin) |
| **Package**          | `@supabase/ssr`                         |

**Critical Notes:**

- **Always call `auth.getUser()`** to validate JWTs on server — `getSession()` alone doesn't verify tokens
- Don't put auth logic in `+layout.server.ts` — may not propagate to all routes
- Protect each route individually in `+page.server.ts`

**Recommended Auth Architecture:**
| User Type | Auth Method |
|-----------|-------------|
| Customers | Google/Facebook OAuth (easy booking) |
| Owner/Admin | Email + password |
| Staff | Email + password or magic link |

**Role-Based Access:**

- Use Supabase custom claims for roles
- Enforce via RLS policies and server-side checks

---

### 4. ORM — Drizzle

| Aspect              | Details                                    |
| ------------------- | ------------------------------------------ |
| **Bundle Size**     | 7.4KB (vs Prisma's heavy query engine)     |
| **Integration**     | Native SvelteKit CLI: `npx sv add drizzle` |
| **Query Style**     | SQL-like syntax, predictable queries       |
| **Edge Compatible** | Yes (unlike Prisma)                        |

**Critical Notes:**

- Preferred over Prisma for SvelteKit in 2024-2025 community
- Smaller bundle = faster serverless cold starts
- TypeScript types generated from schema
- Migrations via `drizzle-kit`

**Setup Command:**

```bash
npx sv add drizzle
```

---

### 5. CMS — Storyblok

| Aspect          | Details                                     |
| --------------- | ------------------------------------------- |
| **Plan**        | Free Starter (1 user, 250GB traffic/month)  |
| **Key Feature** | True visual editor — click elements to edit |
| **SDK**         | `@storyblok/svelte`                         |
| **Best For**    | Non-technical owners                        |

**Critical Notes:**

- Users click directly on page elements to edit — no navigating complex admin panels
- Real-time preview before publishing
- Component-based architecture maps to salon content naturally

**Content Types to Create:**
| Content Block | Purpose |
|---------------|---------|
| Services | Name, description, duration, price, category |
| Staff Bios | Name, photo, specialties, certifications, portfolio |
| Gallery Items | Before/after photos, service type, stylist tag |
| Announcements | Homepage banners, promotions, holiday hours |
| Business Info | Hours, address, phone, social links |

**Integration Pattern:**

```javascript
// +page.server.ts
import { useStoryblokApi } from "@storyblok/svelte";

export async function load() {
	const storyblokApi = useStoryblokApi();
	const { data } = await storyblokApi.get("cdn/stories/home");
	return { story: data.story };
}
```

---

### 6. Booking System — Custom (Port + Modernize)

| Aspect                 | Details                                                    |
| ---------------------- | ---------------------------------------------------------- |
| **Base**               | Existing shadcn booking system (6-9 months old)            |
| **Updates Needed**     | Svelte 5 runes, modern patterns, new styling               |
| **Calendar Component** | shadcn-svelte Calendar (Bits UI + @internationalized/date) |
| **Concurrency**        | PostgreSQL optimistic locking                              |

**Modernization Checklist:**

- [ ] Convert to Svelte 5 runes (`$state`, `$derived`, `$effect`)
- [ ] Update to latest shadcn-svelte components
- [ ] Implement optimistic locking for slot reservation
- [ ] Add buffer time logic between appointments
- [ ] Google Calendar API integration (bi-directional sync)
- [ ] Timezone handling (store UTC, display local)

**Booking Data Model:**

```typescript
interface Appointment {
	id: string;
	customerId: string;
	staffId: string;
	serviceIds: string[];
	startTime: Date; // UTC
	endTime: Date; // UTC
	timezone: string; // IANA (e.g., 'America/New_York')
	status: "pending" | "confirmed" | "completed" | "cancelled" | "no-show";
	paymentStatus: "unpaid" | "deposit" | "paid";
	version: number; // For optimistic locking
	createdAt: Date;
	updatedAt: Date;
}
```

**Playwright Testing — Implement Immediately:**

- Test full booking flow (service → stylist → time → confirm)
- Test concurrent booking attempts (race conditions)
- Test cancellation and rescheduling
- Test payment integration points

---

### 7. Payments — Square

| Aspect                    | Details                                           |
| ------------------------- | ------------------------------------------------- |
| **Transaction Fee**       | 2.9% + $0.30 (same as Stripe)                     |
| **Chargeback Protection** | Free up to $250/month                             |
| **Ecosystem**             | Online payments + physical POS hardware           |
| **Current Situation**     | Stylists use various methods (cash, Venmo, Zelle) |

**Implementation Phases:**

| Phase        | Scope                       | Features                                             |
| ------------ | --------------------------- | ---------------------------------------------------- |
| **MVP**      | Basic Square integration    | Online card payments, simple checkout                |
| **MVP**      | Alternative payment display | Show Venmo/Zelle/Cash options per stylist preference |
| **Post-MVP** | Full Square ecosystem       | POS integration, unified reporting, gift cards       |
| **Post-MVP** | Owner conversion            | Migrate stylists to Square for unified payments      |

**MVP Payment Flow:**

```
Customer books → Choose payment method:
├── Pay with Card (Square) → Immediate processing
├── Pay at Salon → Show stylist's accepted methods
│   ├── Cash
│   ├── Venmo (@handle)
│   └── Zelle (phone/email)
```

**Square Integration Notes:**

- Use Square Web Payments SDK for card processing
- Webhook handlers for `payment.completed`, `refund.created`
- Store tokenized payment methods for no-show charges
- PCI compliance: SAQ A level with hosted payment fields

**Post-MVP Square Ecosystem Benefits:**

- Unified online + in-person payments
- Inventory management (products)
- Team management and permissions
- Integrated appointment booking (Square Appointments)
- Customer loyalty programs
- Gift card management

---

### 8. UI Components — shadcn-svelte + Flowbite Svelte

#### Primary: shadcn-svelte

| Aspect         | Details                                          |
| -------------- | ------------------------------------------------ |
| **Philosophy** | Components copied to project, fully customizable |
| **Foundation** | Bits UI (headless) + Tailwind CSS                |
| **Components** | 50+ accessible components                        |
| **Svelte 5**   | Full support                                     |
| **Tailwind**   | v4 compatible                                    |

**Critical Notes:**

- Not a library — source code lives in your project
- Full control over styling for unique brand aesthetics
- Accessibility built-in (ARIA, keyboard nav, focus management)

**Installation:**

```bash
npx shadcn-svelte@latest init
npx shadcn-svelte@latest add button card dialog sheet tabs calendar form
```

**Existing Code Migration:**

- Port existing shadcn components to Svelte 5 syntax
- Update to latest component versions
- Apply new brand styling

#### MVP Acceleration: Flowbite Svelte

| Aspect         | Details                              |
| -------------- | ------------------------------------ |
| **Package**    | `flowbite-svelte-next` (Svelte 5)    |
| **Components** | 130+ ready-made                      |
| **Best For**   | Rapid prototyping, theme exploration |

**MVP Strategy:**

- Use Flowbite for quick color scheme/style demonstrations
- Show client different theme options rapidly
- Transition to shadcn-svelte for production customization

---

### 9. Icons — Lucide

| Aspect      | Details                 |
| ----------- | ----------------------- |
| **Package** | `@lucide/svelte`        |
| **Count**   | 1,500+ icons            |
| **Style**   | Consistent stroke icons |

**Salon-Relevant Icons:**

- `Scissors` — Services, cuts
- `Calendar` — Booking, availability
- `Clock` — Duration, hours
- `Phone` — Contact
- `MapPin` — Location
- `Star` — Reviews, ratings
- `User` — Staff, customers
- `CreditCard` — Payments
- `Gift` — Gift cards
- `Award` — Loyalty program

**Usage:**

```svelte
<script>
  import { Scissors, Calendar, Clock } from '@lucide/svelte';
</script>

<Scissors class="h-5 w-5" />
```

---

### 10. Animations — Svelte Transitions

| Aspect                   | Details                                         |
| ------------------------ | ----------------------------------------------- |
| **Built-in Transitions** | `fade`, `fly`, `slide`, `scale`, `blur`, `draw` |
| **Custom Transitions**   | Supported via transition functions              |
| **List Animations**      | Use `@formkit/auto-animate`                     |

**Luxury Feel Guidelines:**

- Use longer durations: 500-800ms for elegant feel
- Ease functions: `cubicOut` for smooth deceleration
- Subtle movements: small offsets (10-20px) for fly transitions

**Examples:**

```svelte
<script>
  import { fade, fly, slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
</script>

<!-- Elegant fade -->
<div transition:fade={{ duration: 600 }}>

<!-- Subtle slide up -->
<div transition:fly={{ y: 20, duration: 500, easing: cubicOut }}>

<!-- List animation -->
<script>
  import { autoAnimate } from '@formkit/auto-animate';
</script>
<ul use:autoAnimate>
```

---

### 11. Forms & Validation — Superforms + Zod 4

| Aspect           | Details                                                                |
| ---------------- | ---------------------------------------------------------------------- |
| **Form Library** | Superforms (latest)                                                    |
| **Validation**   | Zod 4                                                                  |
| **Features**     | Server + client validation, auto-focus errors, progressive enhancement |

**Critical Notes:**

- Zod 4 now supported by Superforms
- Combine with shadcn-svelte Form components
- Progressive enhancement: works without JS

**Booking Form Schema Example:**

```typescript
import { z } from "zod";

export const bookingSchema = z.object({
	serviceIds: z.array(z.string()).min(1, "Select at least one service"),
	staffId: z.string().min(1, "Select a stylist"),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
	time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time"),
	customerName: z.string().min(2, "Name required"),
	customerEmail: z.string().email("Valid email required"),
	customerPhone: z.string().min(10, "Valid phone required"),
	notes: z.string().optional(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;
```

**Form Setup:**

```svelte
<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { bookingSchema } from '$lib/schemas';

  export let data;

  const { form, errors, enhance } = superForm(data.form, {
    validators: zodClient(bookingSchema),
    resetForm: false,
  });
</script>

<form method="POST" use:enhance>
  <!-- Form fields with error display -->
</form>
```

---

### 12. State Management — Svelte 5 Runes

| Aspect              | Details                                 |
| ------------------- | --------------------------------------- |
| **Local State**     | `$state`                                |
| **Computed**        | `$derived`                              |
| **Side Effects**    | `$effect`                               |
| **Cross-Component** | Context API (`setContext`/`getContext`) |

**No external libraries needed for most cases.**

**Booking Wizard State Example:**

```typescript
// lib/state/booking.svelte.ts
export class BookingWizard {
	// Reactive state
	services = $state<Service[]>([]);
	stylist = $state<Staff | null>(null);
	selectedDate = $state<Date | null>(null);
	selectedTime = $state<string | null>(null);
	currentStep = $state(1);

	// Computed values
	get totalPrice() {
		return this.services.reduce((sum, s) => sum + s.price, 0);
	}

	get totalDuration() {
		return this.services.reduce((sum, s) => sum + s.duration, 0);
	}

	get canProceed() {
		switch (this.currentStep) {
			case 1:
				return this.services.length > 0;
			case 2:
				return this.stylist !== null;
			case 3:
				return this.selectedDate && this.selectedTime;
			default:
				return false;
		}
	}

	// Actions
	addService(service: Service) {
		this.services.push(service);
	}

	removeService(serviceId: string) {
		this.services = this.services.filter((s) => s.id !== serviceId);
	}

	reset() {
		this.services = [];
		this.stylist = null;
		this.selectedDate = null;
		this.selectedTime = null;
		this.currentStep = 1;
	}
}
```

---

### 13. Package Manager & Monorepo — pnpm + Turborepo

| Aspect              | Details                                        |
| ------------------- | ---------------------------------------------- |
| **Package Manager** | pnpm                                           |
| **Disk Savings**    | ~70% less than npm (content-addressable store) |
| **Monorepo Tool**   | Turborepo                                      |
| **Caching**         | 30s builds → 0.2s from cache                   |
| **Remote Cache**    | Free via Vercel                                |

**Project Structure:**

```
salon-website/
├── apps/
│   ├── web/                 # Customer-facing SvelteKit app
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── (marketing)/    # Homepage, about, services
│   │   │   │   ├── (booking)/      # Booking flow
│   │   │   │   ├── (auth)/         # Login, register
│   │   │   │   └── (admin)/        # Owner dashboard
│   │   │   ├── lib/
│   │   │   │   ├── server/         # Server-only code
│   │   │   │   ├── components/     # Shared components
│   │   │   │   ├── state/          # State classes
│   │   │   │   └── schemas/        # Zod schemas
│   │   │   └── app.html
│   │   ├── static/
│   │   └── svelte.config.js
│   └── admin/               # (Future) Separate admin app if needed
├── packages/
│   ├── ui/                  # Shared shadcn components
│   ├── db/                  # Drizzle schema & migrations
│   ├── email/               # MJML templates
│   └── config/              # Shared ESLint, TS configs
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

**pnpm-workspace.yaml:**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**turbo.json:**

```json
{
	"$schema": "https://turbo.build/schema.json",
	"tasks": {
		"build": {
			"dependsOn": ["^build"],
			"outputs": [".svelte-kit/**", "build/**"]
		},
		"dev": {
			"cache": false,
			"persistent": true
		},
		"test": {
			"dependsOn": ["build"]
		},
		"lint": {}
	}
}
```

---

### 14. Testing — Playwright

| Aspect       | Details                                   |
| ------------ | ----------------------------------------- |
| **Type**     | End-to-end testing                        |
| **Priority** | Implement immediately with booking system |
| **Browsers** | Chromium, Firefox, WebKit                 |

**Critical Test Scenarios:**

| Test                | Purpose                                      |
| ------------------- | -------------------------------------------- |
| Full booking flow   | Service → Stylist → Time → Payment → Confirm |
| Concurrent bookings | Two users booking same slot (race condition) |
| Cancellation        | Cancel and verify slot reopens               |
| Rescheduling        | Move appointment, verify old slot freed      |
| Payment flows       | Card payment, pay-at-salon options           |
| Auth flows          | Customer login, admin login, logout          |
| CMS content         | Verify Storyblok content renders             |

**Playwright Config:**

```typescript
// playwright.config.ts
import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
	webServer: {
		command: "pnpm run build && pnpm run preview",
		port: 4173,
	},
	testDir: "tests",
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	use: {
		baseURL: "http://localhost:4173",
	},
	projects: [
		{ name: "chromium", use: { browserName: "chromium" } },
		{ name: "firefox", use: { browserName: "firefox" } },
		{ name: "webkit", use: { browserName: "webkit" } },
	],
};

export default config;
```

**Example Booking Test:**

```typescript
// tests/booking.spec.ts
import { test, expect } from "@playwright/test";

test("complete booking flow", async ({ page }) => {
	await page.goto("/book");

	// Step 1: Select service
	await page.click('[data-testid="service-haircut"]');
	await page.click('[data-testid="next-step"]');

	// Step 2: Select stylist
	await page.click('[data-testid="stylist-jane"]');
	await page.click('[data-testid="next-step"]');

	// Step 3: Select time
	await page.click('[data-testid="date-picker"]');
	await page.click('[data-testid="available-slot-10:00"]');
	await page.click('[data-testid="next-step"]');

	// Step 4: Confirm
	await page.fill('[data-testid="customer-name"]', "Test User");
	await page.fill('[data-testid="customer-email"]', "test@example.com");
	await page.click('[data-testid="confirm-booking"]');

	// Verify confirmation
	await expect(page.locator('[data-testid="booking-confirmed"]')).toBeVisible();
});
```

---

### 15. Hosting — Cloudflare Pages

| Aspect                  | Details                                   |
| ----------------------- | ----------------------------------------- |
| **Adapter**             | `@sveltejs/adapter-cloudflare`            |
| **Edge Locations**      | 275+ data centers                         |
| **Free Tier**           | 100,000 requests/day, unlimited bandwidth |
| **Egress Fees**         | None (major cost advantage)               |
| **Additional Services** | D1, KV, R2, Durable Objects               |

**Critical Notes — Learning Cloudflare Ecosystem:**

| Service     | Use Case                                               |
| ----------- | ------------------------------------------------------ |
| **Pages**   | SvelteKit deployment                                   |
| **D1**      | SQLite at edge (not for this project — using Supabase) |
| **KV**      | Key-value cache (session storage, rate limiting)       |
| **R2**      | Object storage (alternative to S3, zero egress)        |
| **Images**  | Image optimization & hosting                           |
| **Workers** | Edge compute (custom middleware)                       |

**SvelteKit Configuration:**

```javascript
// svelte.config.js
import adapter from "@sveltejs/adapter-cloudflare";

export default {
	kit: {
		adapter: adapter({
			routes: {
				include: ["/*"],
				exclude: ["<all>"],
			},
		}),
	},
};
```

**Platform Access Pattern:**

```javascript
// +page.server.ts
export async function load({ platform }) {
	// Access Cloudflare bindings
	const kv = platform.env.KV_NAMESPACE;
	const r2 = platform.env.R2_BUCKET;

	// Example: Cache expensive query
	const cached = await kv.get("services-list");
	if (cached) return { services: JSON.parse(cached) };

	// Fetch from Supabase and cache
	const services = await fetchServices();
	await kv.put("services-list", JSON.stringify(services), {
		expirationTtl: 3600,
	});

	return { services };
}
```

**Deployment:**

```bash
# Connect repo to Cloudflare Pages via dashboard
# Or use Wrangler CLI:
pnpm add -D wrangler
wrangler pages deploy .svelte-kit/cloudflare
```

---

### 16. Image Hosting — Cloudflare Images (Default) / Cloudinary (Conditional)

#### Default: Cloudflare Images

| Aspect           | Details                             |
| ---------------- | ----------------------------------- |
| **Pricing**      | $5/month for 100K stored images     |
| **Delivery**     | Unlimited                           |
| **Optimization** | Automatic format, resize on-the-fly |
| **Integration**  | Native with Cloudflare Pages        |

**Use For:**

- Staff photos
- Gallery images
- Service images
- Before/after photos

#### Conditional: Cloudinary (If Hairstyle Try-On Feature)

| Aspect          | Details                            |
| --------------- | ---------------------------------- |
| **Free Tier**   | 25 credits/month                   |
| **Key Feature** | AI transformations, face detection |
| **Use Case**    | Virtual hairstyle try-on           |

**Hairstyle Try-On Feature (If Implemented):**

- Upload customer photo
- Use Cloudinary AI to overlay hairstyles
- Face detection for proper positioning
- Upsell opportunity for owner

---

### 17. Email — Resend

| Aspect         | Details                                      |
| -------------- | -------------------------------------------- |
| **Free Tier**  | 3,000 emails/month                           |
| **API**        | Modern TypeScript SDK                        |
| **Templating** | React Email (renders HTML for any framework) |

**Email Types:**
| Email | Trigger |
|-------|---------|
| Booking confirmation | Immediately on booking |
| 24-48 hour reminder | Scheduled job |
| Cancellation confirmation | On cancellation |
| Review request | 24 hours post-appointment |
| Gift card delivery | On purchase |

**Integration:**

```typescript
// lib/server/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingConfirmation(booking: Booking) {
	const { data, error } = await resend.emails.send({
		from: "Salon Name <bookings@salon.com>",
		to: booking.customerEmail,
		subject: "Booking Confirmed!",
		html: await renderMJML("booking-confirmation", booking),
		attachments: [
			{
				filename: "appointment.ics",
				content: generateICS(booking),
			},
		],
	});

	return { data, error };
}
```

---

### 18. SMS — Plivo

| Aspect          | Details                        |
| --------------- | ------------------------------ |
| **Cost**        | ~$0.0045-0.0055 per US message |
| **Savings**     | 33-40% cheaper than Twilio     |
| **Inbound SMS** | Free                           |

**SMS Types:**
| SMS | Timing |
|-----|--------|
| Booking confirmation | Immediately |
| 24-48 hour reminder | Scheduled |
| 1-2 hour reminder | Scheduled |
| Confirmation reply | Customer texts back |

**Impact:** Text reminders reduce no-shows by **66%**

**Integration:**

```typescript
// lib/server/sms.ts
import plivo from "plivo";

const client = new plivo.Client(
	process.env.PLIVO_AUTH_ID,
	process.env.PLIVO_AUTH_TOKEN,
);

export async function sendSMS(to: string, message: string) {
	return client.messages.create({
		src: process.env.PLIVO_PHONE_NUMBER,
		dst: to,
		text: message,
	});
}

export async function sendAppointmentReminder(booking: Booking) {
	const message = `Reminder: Your appointment at Salon Name is tomorrow at ${booking.time}. Reply CONFIRM or call to reschedule.`;
	return sendSMS(booking.customerPhone, message);
}
```

---

### 19. Email Templates — MJML

| Aspect          | Details                                                        |
| --------------- | -------------------------------------------------------------- |
| **Purpose**     | Responsive email that works in all clients (including Outlook) |
| **Syntax**      | Component-based (`<mj-section>`, `<mj-button>`)                |
| **Compilation** | Pre-compile at build time or render server-side                |

**Template Structure:**

```
packages/email/
├── templates/
│   ├── booking-confirmation.mjml
│   ├── appointment-reminder.mjml
│   ├── cancellation.mjml
│   ├── review-request.mjml
│   └── gift-card.mjml
├── components/
│   ├── header.mjml
│   ├── footer.mjml
│   └── button.mjml
└── render.ts
```

**Example Template:**

```xml
<!-- templates/booking-confirmation.mjml -->
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="Arial, sans-serif" />
      <mj-button background-color="#8B5CF6" color="white" />
    </mj-attributes>
  </mj-head>
  <mj-body>
    <mj-include path="./components/header.mjml" />

    <mj-section>
      <mj-column>
        <mj-text font-size="24px">Booking Confirmed!</mj-text>
        <mj-text>Hi {{customerName}},</mj-text>
        <mj-text>Your appointment is confirmed for:</mj-text>
        <mj-text font-weight="bold">
          {{date}} at {{time}}
          with {{stylistName}}
        </mj-text>
        <mj-text>Services: {{services}}</mj-text>
        <mj-button href="{{calendarLink}}">
          Add to Calendar
        </mj-button>
      </mj-column>
    </mj-section>

    <mj-include path="./components/footer.mjml" />
  </mj-body>
</mjml>
```

---

### 20. Notification Sequence — Full Implementation

| Timing                 | Channel     | Content                                         |
| ---------------------- | ----------- | ----------------------------------------------- |
| **Instant**            | Email       | Booking confirmation + .ics calendar attachment |
| **Instant**            | SMS         | Brief confirmation with date/time               |
| **24-48 hours before** | Email + SMS | Reminder with reschedule option                 |
| **1-2 hours before**   | SMS only    | Final reminder                                  |
| **24 hours after**     | Email       | Review request with link                        |

**Scheduling Implementation:**

- Use Cloudflare Cron Triggers or external service (e.g., QStash)
- Store scheduled notification timestamps in database
- Cron job queries upcoming notifications and sends

```typescript
// Scheduled job (runs every 15 minutes)
export async function processScheduledNotifications() {
	const now = new Date();
	const notifications = await db.query.scheduledNotifications.findMany({
		where: and(
			lte(scheduledNotifications.sendAt, now),
			eq(scheduledNotifications.sent, false),
		),
	});

	for (const notification of notifications) {
		if (notification.type === "email") {
			await sendEmail(notification);
		} else if (notification.type === "sms") {
			await sendSMS(notification);
		}
		await markAsSent(notification.id);
	}
}
```

---

### 21. SEO Dashboard — MVP Scope

| Feature                    | MVP Priority    | Implementation       |
| -------------------------- | --------------- | -------------------- |
| Google Search Console data | If time permits | API integration      |
| Page performance metrics   | If time permits | Web Vitals API       |
| Basic traffic stats        | If time permits | Cloudflare Analytics |

**If Implemented:**

```typescript
// Simple dashboard showing:
// - Total visits (from Cloudflare Analytics)
// - Top pages
// - Search queries (from GSC API)
// - Core Web Vitals scores
```

**Full SEO Strategy (Post-MVP):**

- Prerender static pages (`export const prerender = true`)
- HairSalon schema (LocalBusiness subtype) with JSON-LD
- Service schema with pricing
- AggregateRating schema for reviews
- Google Business Profile optimization
- Core Web Vitals monitoring

---

### 22. Salon-Specific Features — Full List

#### Service Menu

| Feature            | Implementation                                     |
| ------------------ | -------------------------------------------------- |
| Categories         | Cuts, Color, Treatments, Styling                   |
| Variable durations | Range for complex services                         |
| Price types        | Fixed, starting-from, range, consultation-required |
| Add-ons            | Deep conditioning, Olaplex, etc.                   |
| Package deals      | Bundled services with discount                     |

#### Staff Profiles

| Feature              | Implementation                |
| -------------------- | ----------------------------- |
| Individual calendars | Per-stylist availability      |
| Portfolio galleries  | Before/after work samples     |
| Specialties & certs  | Tags and badges               |
| Client reviews       | Per-stylist ratings           |
| Direct booking       | `/team/[slug]` pages with CTA |

#### Gallery

| Feature               | Implementation         |
| --------------------- | ---------------------- |
| Before/after display  | Side-by-side or slider |
| Categorization        | By service type        |
| Tagging               | By stylist, hair type  |
| Lazy loading          | Blur-up placeholders   |
| Instagram integration | Feed embed or API      |

#### Reviews

| Feature          | Implementation                    |
| ---------------- | --------------------------------- |
| Google Reviews   | Embed widget or Places API        |
| Schema markup    | AggregateRating for rich snippets |
| Internal reviews | Post-appointment collection       |

#### Loyalty Program (Points-Based)

| Feature       | Implementation                  |
| ------------- | ------------------------------- |
| Earn points   | Per dollar spent                |
| Redeem points | For discounts or free services  |
| Tier levels   | Bronze, Silver, Gold (optional) |
| Dashboard     | Customer can see balance        |

#### Gift Cards

| Feature            | Implementation              |
| ------------------ | --------------------------- |
| E-gift cards       | Email delivery              |
| Physical cards     | Generate codes for in-store |
| Custom amounts     | Or preset denominations     |
| Partial redemption | Track remaining balance     |
| Square integration | Unified with payment system |

---

## Development Environment Setup

### WSL2 Optimization (Critical)

**Store projects in Linux filesystem:**

```bash
# CORRECT — fast
~/projects/salon-website/

# WRONG — 10-20x slower
/mnt/c/Users/You/projects/salon-website/
```

**Memory Configuration (`~/.wslconfig` on Windows):**

```ini
[wsl2]
memory=8GB
processors=4
```

**Increase file watchers:**

```bash
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### VSCode Extensions

| Extension                 | Purpose                 |
| ------------------------- | ----------------------- |
| Svelte for VS Code        | Official Svelte support |
| Tailwind CSS IntelliSense | Class autocomplete      |
| Error Lens                | Inline error display    |
| Remote - WSL              | WSL integration         |
| ESLint                    | Linting                 |
| Prettier                  | Formatting              |
| Playwright Test           | Test runner             |

### Code Quality Setup

```bash
# ESLint + Prettier
pnpm add -D eslint prettier eslint-plugin-svelte prettier-plugin-svelte

# Git hooks
pnpm add -D husky lint-staged
npx husky init
```

**lint-staged.config.js:**

```javascript
export default {
	"*.{js,ts,svelte}": ["eslint --fix", "prettier --write"],
	"*.{css,md,json}": ["prettier --write"],
};
```

---

## Estimated Monthly Costs

| Service           | Cost             | Notes                   |
| ----------------- | ---------------- | ----------------------- |
| Cloudflare Pages  | $0               | Free tier               |
| Supabase          | $0               | Free tier (500MB)       |
| Storyblok         | $0               | Free Starter (1 user)   |
| Resend            | $0               | Free tier (3K emails)   |
| Plivo SMS         | ~$10-30          | Based on volume         |
| Cloudflare Images | $5               | 100K images             |
| Square            | 2.9% + $0.30     | Per transaction         |
| **Total Fixed**   | **~$5-35/month** | Before transaction fees |

---

## Quick Start Commands

```bash
# Create project
pnpm create svelte@latest salon-website
cd salon-website

# Add dependencies
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add drizzle-orm
pnpm add -D drizzle-kit
pnpm add zod sveltekit-superforms
pnpm add @storyblok/svelte
pnpm add resend plivo
pnpm add mjml

# Add shadcn-svelte
npx shadcn-svelte@latest init
npx shadcn-svelte@latest add button card dialog sheet tabs calendar form input label select textarea

# Add Flowbite (MVP)
pnpm add flowbite flowbite-svelte-next

# Add icons
pnpm add @lucide/svelte

# Add testing
pnpm add -D @playwright/test
npx playwright install

# Add Drizzle via SvelteKit CLI
npx sv add drizzle

# Setup Turborepo (if monorepo)
pnpm add -D turbo
```

---

_Document generated for hair salon website project — January 2026_
