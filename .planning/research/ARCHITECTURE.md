# Architecture Research

**Domain:** Hair salon website with booking system
**Researched:** 2026-01-20
**Confidence:** HIGH (SvelteKit patterns well-documented; booking system patterns established)

## System Overview

```
+------------------+     +-------------------+     +------------------+
|                  |     |                   |     |                  |
|  Customer Web    |---->|   SvelteKit App   |---->|    Supabase      |
|  (Browser)       |<----|   (Cloudflare)    |<----|    (PostgreSQL)  |
|                  |     |                   |     |                  |
+------------------+     +--------+----------+     +------------------+
                                  |
          +-----------------------+------------------------+
          |                       |                        |
          v                       v                        v
+------------------+   +------------------+   +------------------+
|                  |   |                  |   |                  |
|    Storyblok     |   |    Square        |   |  Google Calendar |
|    (CMS)         |   |    (Payments)    |   |  (Sync)          |
|                  |   |                  |   |                  |
+------------------+   +------------------+   +------------------+
          |                       |                        |
          v                       v                        v
+------------------+   +------------------+   +------------------+
|                  |   |                  |   |                  |
|    Resend        |   |    Plivo         |   |  Cloudflare      |
|    (Email)       |   |    (SMS)         |   |  Images/KV       |
|                  |   |                  |   |                  |
+------------------+   +------------------+   +------------------+
```

### Layer Architecture

```
+============================================================================+
|                              PRESENTATION LAYER                            |
|  +------------------------------------------------------------------+     |
|  |  Routes (src/routes/)                                             |     |
|  |  +------------------+ +------------------+ +------------------+   |     |
|  |  | (marketing)/     | | (booking)/       | | (admin)/         |   |     |
|  |  | - Homepage       | | - Service select | | - Dashboard      |   |     |
|  |  | - About          | | - Stylist select | | - Appointments   |   |     |
|  |  | - Gallery        | | - Time select    | | - Staff mgmt     |   |     |
|  |  | - Contact        | | - Confirmation   | | - Settings       |   |     |
|  |  +------------------+ +------------------+ +------------------+   |     |
|  +------------------------------------------------------------------+     |
+============================================================================+
|                              APPLICATION LAYER                             |
|  +------------------------------------------------------------------+     |
|  |  Server Logic (+page.server.ts, +server.ts)                       |     |
|  |  - Form Actions (booking, auth, admin)                            |     |
|  |  - Load Functions (data fetching)                                 |     |
|  |  - API Routes (webhooks, external integrations)                   |     |
|  +------------------------------------------------------------------+     |
|  +------------------------------------------------------------------+     |
|  |  Hooks (hooks.server.ts)                                          |     |
|  |  - Auth session management                                        |     |
|  |  - Request-scoped Supabase client                                 |     |
|  |  - Route protection                                               |     |
|  +------------------------------------------------------------------+     |
+============================================================================+
|                                DOMAIN LAYER                                |
|  +------------------------------------------------------------------+     |
|  |  Business Logic (src/lib/server/)                                 |     |
|  |  +------------------+ +------------------+ +------------------+   |     |
|  |  | booking/         | | payments/        | | notifications/   |   |     |
|  |  | - availability   | | - square         | | - email          |   |     |
|  |  | - slots          | | - tokenization   | | - sms            |   |     |
|  |  | - reservations   | | - webhooks       | | - scheduling     |   |     |
|  |  +------------------+ +------------------+ +------------------+   |     |
|  +------------------------------------------------------------------+     |
+============================================================================+
|                                DATA LAYER                                  |
|  +------------------------------------------------------------------+     |
|  |  Drizzle ORM (packages/db/)                                       |     |
|  |  - Schema definitions                                             |     |
|  |  - Migrations                                                     |     |
|  |  - Query helpers                                                  |     |
|  +------------------------------------------------------------------+     |
|  +------------------------------------------------------------------+     |
|  |  External Services                                                |     |
|  |  - Supabase (PostgreSQL + Auth + RLS)                             |     |
|  |  - Storyblok (CMS content)                                        |     |
|  |  - Google Calendar API (sync)                                     |     |
|  +------------------------------------------------------------------+     |
+============================================================================+
```

## Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Routes** | Page rendering, user interaction | Form Actions, Load Functions |
| **Form Actions** | Handle form submissions, mutations | Domain services, Database |
| **Load Functions** | Fetch data for pages | Database, CMS, External APIs |
| **API Routes** | Webhooks, external API endpoints | Domain services, External services |
| **Hooks** | Auth, request middleware | Supabase Auth, Routes |
| **Domain Services** | Business logic encapsulation | Database, External APIs |
| **Drizzle Schema** | Data model, migrations | PostgreSQL |
| **Supabase** | Database, Auth, RLS | Application |
| **Storyblok** | CMS content management | Load Functions |
| **Square** | Payment processing | API Routes, Domain services |
| **Google Calendar** | External calendar sync | Domain services, Webhooks |

## Recommended Project Structure

```
salon-website/
├── apps/
│   └── web/                          # Main SvelteKit application
│       ├── src/
│       │   ├── routes/
│       │   │   ├── (marketing)/      # Public pages
│       │   │   │   ├── +page.svelte             # Homepage
│       │   │   │   ├── +page.server.ts          # CMS load
│       │   │   │   ├── about/
│       │   │   │   ├── services/
│       │   │   │   ├── team/
│       │   │   │   │   └── [slug]/              # Stylist profiles
│       │   │   │   ├── gallery/
│       │   │   │   └── contact/
│       │   │   │
│       │   │   ├── (booking)/        # Booking flow (may require auth)
│       │   │   │   ├── book/
│       │   │   │   │   ├── +page.svelte         # Booking wizard
│       │   │   │   │   ├── +page.server.ts      # Booking actions
│       │   │   │   │   └── confirm/
│       │   │   │   │       └── [id]/            # Confirmation page
│       │   │   │   └── appointments/
│       │   │   │       ├── +page.svelte         # Customer's appointments
│       │   │   │       └── [id]/
│       │   │   │           ├── +page.svelte     # Appointment detail
│       │   │   │           └── +page.server.ts  # Cancel/reschedule
│       │   │   │
│       │   │   ├── (auth)/           # Authentication routes
│       │   │   │   ├── login/
│       │   │   │   ├── register/
│       │   │   │   └── callback/               # OAuth callback
│       │   │   │
│       │   │   ├── (admin)/          # Protected admin routes
│       │   │   │   ├── +layout.server.ts       # Admin auth guard
│       │   │   │   ├── dashboard/
│       │   │   │   ├── appointments/
│       │   │   │   │   ├── +page.svelte        # Calendar view
│       │   │   │   │   └── [id]/
│       │   │   │   ├── staff/
│       │   │   │   │   ├── +page.svelte        # Staff list
│       │   │   │   │   └── [id]/               # Staff profile edit
│       │   │   │   ├── services/
│       │   │   │   └── settings/
│       │   │   │
│       │   │   ├── api/              # API routes for webhooks/integrations
│       │   │   │   ├── webhooks/
│       │   │   │   │   ├── square/
│       │   │   │   │   │   └── +server.ts      # Square payment webhooks
│       │   │   │   │   └── calendar/
│       │   │   │   │       └── +server.ts      # Google Calendar webhooks
│       │   │   │   └── availability/
│       │   │   │       └── +server.ts          # AJAX availability check
│       │   │   │
│       │   │   ├── +layout.svelte              # Root layout
│       │   │   ├── +layout.server.ts           # Root server layout
│       │   │   ├── +layout.ts                  # Storyblok init, session
│       │   │   └── +error.svelte               # Error page
│       │   │
│       │   ├── lib/
│       │   │   ├── components/       # UI components
│       │   │   │   ├── booking/      # Booking-specific
│       │   │   │   │   ├── ServiceSelector.svelte
│       │   │   │   │   ├── StylistPicker.svelte
│       │   │   │   │   ├── TimeSlotGrid.svelte
│       │   │   │   │   └── BookingWizard.svelte
│       │   │   │   ├── calendar/     # Calendar components
│       │   │   │   ├── storyblok/    # CMS block components
│       │   │   │   └── ui/           # shadcn-svelte components
│       │   │   │
│       │   │   ├── server/           # Server-only code
│       │   │   │   ├── booking/
│       │   │   │   │   ├── availability.ts     # Slot calculation
│       │   │   │   │   ├── reservation.ts      # Optimistic locking
│       │   │   │   │   └── calendar-sync.ts    # Google Calendar
│       │   │   │   ├── payments/
│       │   │   │   │   ├── square.ts           # Square integration
│       │   │   │   │   └── webhooks.ts         # Payment webhooks
│       │   │   │   ├── notifications/
│       │   │   │   │   ├── email.ts            # Resend integration
│       │   │   │   │   ├── sms.ts              # Plivo integration
│       │   │   │   │   └── scheduler.ts        # Reminder scheduling
│       │   │   │   ├── auth/
│       │   │   │   │   └── session.ts          # Session helpers
│       │   │   │   └── cms/
│       │   │   │       └── storyblok.ts        # CMS helpers
│       │   │   │
│       │   │   ├── state/            # Client state (Svelte 5 runes)
│       │   │   │   ├── booking.svelte.ts       # Booking wizard state
│       │   │   │   └── ui.svelte.ts            # UI state (modals, etc.)
│       │   │   │
│       │   │   ├── schemas/          # Zod validation schemas
│       │   │   │   ├── booking.ts
│       │   │   │   ├── auth.ts
│       │   │   │   └── admin.ts
│       │   │   │
│       │   │   └── utils/            # Shared utilities
│       │   │       ├── dates.ts               # Timezone handling
│       │   │       └── format.ts              # Formatting helpers
│       │   │
│       │   ├── hooks.server.ts       # Server hooks (auth, supabase client)
│       │   └── app.html
│       │
│       ├── static/
│       ├── tests/                    # Playwright tests
│       ├── svelte.config.js
│       └── vite.config.ts
│
├── packages/
│   ├── db/                           # Drizzle schema & migrations
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   │   ├── appointments.ts
│   │   │   │   ├── services.ts
│   │   │   │   ├── staff.ts
│   │   │   │   ├── customers.ts
│   │   │   │   └── index.ts
│   │   │   ├── migrations/
│   │   │   └── index.ts              # Export schema & helpers
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   │
│   ├── ui/                           # Shared shadcn components
│   │   ├── src/
│   │   │   └── components/
│   │   └── package.json
│   │
│   ├── email/                        # MJML email templates
│   │   ├── templates/
│   │   │   ├── booking-confirmation.mjml
│   │   │   ├── appointment-reminder.mjml
│   │   │   ├── cancellation.mjml
│   │   │   └── review-request.mjml
│   │   ├── components/
│   │   │   ├── header.mjml
│   │   │   └── footer.mjml
│   │   ├── render.ts                 # MJML rendering utility
│   │   └── package.json
│   │
│   └── config/                       # Shared configs
│       ├── eslint/
│       ├── typescript/
│       └── tailwind/
│
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Architectural Patterns

### 1. SvelteKit Form Actions (Primary Mutation Pattern)

Form actions are the **recommended pattern** for data mutations in SvelteKit. They provide progressive enhancement (work without JavaScript) and integrate seamlessly with Superforms.

**When to use:**
- All form submissions (booking, login, profile updates)
- Any user-initiated data mutation
- Admin CRUD operations

**Pattern:**

```typescript
// src/routes/(booking)/book/+page.server.ts
import { superValidate, fail } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { bookingSchema } from '$lib/schemas/booking';
import { reserveSlot } from '$lib/server/booking/reservation';

export const load = async ({ locals }) => {
  const form = await superValidate(zod(bookingSchema));
  return { form };
};

export const actions = {
  book: async ({ request, locals }) => {
    const form = await superValidate(request, zod(bookingSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      const appointment = await reserveSlot({
        ...form.data,
        customerId: locals.user?.id
      });

      return { form, success: true, appointmentId: appointment.id };
    } catch (error) {
      if (error.code === 'SLOT_TAKEN') {
        return fail(409, { form, error: 'Slot no longer available' });
      }
      throw error;
    }
  }
};
```

### 2. Load Functions (Data Fetching Pattern)

Load functions run server-side and provide data to pages with automatic dependency tracking.

**When to use:**
- Fetching data for page render
- Pre-loading CMS content
- Loading user-specific data

**Pattern:**

```typescript
// src/routes/(booking)/book/+page.server.ts
export const load = async ({ locals, depends }) => {
  depends('app:availability'); // Allows invalidation

  const [services, staff] = await Promise.all([
    db.query.services.findMany({ where: eq(services.active, true) }),
    db.query.staff.findMany({
      where: eq(staff.active, true),
      with: { services: true }
    })
  ]);

  return { services, staff };
};
```

### 3. API Routes (+server.ts) for Webhooks and External APIs

API routes handle non-form HTTP requests, especially webhooks from external services.

**When to use:**
- Webhook endpoints (Square, Google Calendar)
- AJAX requests for dynamic data (availability checks)
- External API consumption

**Pattern:**

```typescript
// src/routes/api/webhooks/square/+server.ts
import { json } from '@sveltejs/kit';
import { verifySquareSignature, processPayment } from '$lib/server/payments/square';

export const POST = async ({ request }) => {
  const signature = request.headers.get('x-square-signature');
  const body = await request.text();

  if (!verifySquareSignature(body, signature)) {
    return json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);

  switch (event.type) {
    case 'payment.completed':
      await processPayment(event.data);
      break;
    case 'refund.created':
      await processRefund(event.data);
      break;
  }

  return json({ received: true });
};
```

### 4. Hooks for Auth and Middleware

Server hooks run on every request and handle cross-cutting concerns.

**Pattern:**

```typescript
// src/hooks.server.ts
import { createServerClient } from '@supabase/ssr';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const supabaseHandle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (key) => event.cookies.get(key),
        set: (key, value, options) => event.cookies.set(key, value, options),
        remove: (key, options) => event.cookies.delete(key, options),
      },
    }
  );

  // IMPORTANT: Always call getUser() for verified auth
  const { data: { user } } = await event.locals.supabase.auth.getUser();
  event.locals.user = user;

  return resolve(event);
};

const authGuard: Handle = async ({ event, resolve }) => {
  const isAdminRoute = event.url.pathname.startsWith('/admin');
  const isProtectedRoute = event.url.pathname.startsWith('/appointments');

  if ((isAdminRoute || isProtectedRoute) && !event.locals.user) {
    throw redirect(303, '/login?redirectTo=' + event.url.pathname);
  }

  if (isAdminRoute) {
    const { data: profile } = await event.locals.supabase
      .from('staff')
      .select('role')
      .eq('user_id', event.locals.user.id)
      .single();

    if (!profile || !['owner', 'admin'].includes(profile.role)) {
      throw redirect(303, '/');
    }
  }

  return resolve(event);
};

export const handle = sequence(supabaseHandle, authGuard);
```

### 5. Svelte 5 Runes for Client State

Use Svelte 5 runes for reactive client-side state, especially for multi-step flows.

**Pattern:**

```typescript
// src/lib/state/booking.svelte.ts
import type { Service, Staff, TimeSlot } from '@salon/db';

export class BookingWizard {
  // Reactive state
  services = $state<Service[]>([]);
  stylist = $state<Staff | null>(null);
  date = $state<Date | null>(null);
  timeSlot = $state<TimeSlot | null>(null);
  step = $state(1);

  // Derived values
  totalPrice = $derived(
    this.services.reduce((sum, s) => sum + s.price, 0)
  );

  totalDuration = $derived(
    this.services.reduce((sum, s) => sum + s.durationMinutes, 0)
  );

  canProceed = $derived.by(() => {
    switch (this.step) {
      case 1: return this.services.length > 0;
      case 2: return this.stylist !== null;
      case 3: return this.date !== null && this.timeSlot !== null;
      default: return false;
    }
  });

  // Actions
  addService(service: Service) {
    if (!this.services.find(s => s.id === service.id)) {
      this.services.push(service);
    }
  }

  removeService(serviceId: string) {
    this.services = this.services.filter(s => s.id !== serviceId);
  }

  selectStylist(staff: Staff) {
    this.stylist = staff;
    // Reset time selection when stylist changes
    this.date = null;
    this.timeSlot = null;
  }

  reset() {
    this.services = [];
    this.stylist = null;
    this.date = null;
    this.timeSlot = null;
    this.step = 1;
  }
}

// Singleton for app-wide booking state
export const bookingWizard = new BookingWizard();
```

### 6. Domain-Organized Server Code

Organize server-side business logic by domain rather than technical function.

**Pattern:**

```typescript
// src/lib/server/booking/availability.ts
import { db } from '@salon/db';
import { and, eq, gte, lte, not } from 'drizzle-orm';
import { appointments, staffAvailability } from '@salon/db/schema';

interface AvailabilityParams {
  staffId: string;
  date: Date;
  durationMinutes: number;
}

export async function getAvailableSlots({
  staffId,
  date,
  durationMinutes
}: AvailabilityParams): Promise<TimeSlot[]> {
  // 1. Get staff's working hours for this day
  const dayOfWeek = date.getDay();
  const availability = await db.query.staffAvailability.findFirst({
    where: and(
      eq(staffAvailability.staffId, staffId),
      eq(staffAvailability.dayOfWeek, dayOfWeek)
    )
  });

  if (!availability) return []; // Staff doesn't work this day

  // 2. Get existing appointments for this day
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const existingAppointments = await db.query.appointments.findMany({
    where: and(
      eq(appointments.staffId, staffId),
      gte(appointments.startTime, dayStart),
      lte(appointments.startTime, dayEnd),
      not(eq(appointments.status, 'cancelled'))
    ),
    orderBy: appointments.startTime
  });

  // 3. Calculate available slots (with buffer time)
  return calculateSlots(
    availability.startTime,
    availability.endTime,
    existingAppointments,
    durationMinutes,
    15 // 15-minute buffer between appointments
  );
}
```

## Data Flow

### Booking Flow

```
1. BROWSE SERVICES
   Customer -> Load Function -> Supabase (services table)
                             -> Storyblok (service descriptions)

2. SELECT STYLIST
   Customer -> Load Function -> Supabase (staff table)
                             -> Storyblok (staff bios)

3. CHECK AVAILABILITY (AJAX)
   Customer -> API Route -> availability.ts -> Supabase
                                            -> Google Calendar API
                         <- Available slots

4. SUBMIT BOOKING (Form Action)
   Customer -> Form Action -> Zod Validation
                           -> reservation.ts (optimistic lock)
                              -> BEGIN TRANSACTION
                              -> SELECT ... FOR UPDATE
                              -> INSERT appointment
                              -> COMMIT
                           -> notifications/scheduler.ts
                           -> Google Calendar sync
           <- Confirmation (redirect to /book/confirm/[id])

5. PAYMENT (if online)
   Customer -> Square Web SDK -> Tokenization
            -> Form Action -> square.ts -> Square Payments API
                                        -> Update appointment.paymentStatus
           <- Payment confirmation
```

### Optimistic Locking for Double-Booking Prevention

```typescript
// src/lib/server/booking/reservation.ts
import { db } from '@salon/db';
import { appointments } from '@salon/db/schema';
import { and, eq, gte, lte, sql } from 'drizzle-orm';

interface ReservationParams {
  staffId: string;
  customerId: string;
  serviceIds: string[];
  startTime: Date;
  endTime: Date;
  timezone: string;
}

export async function reserveSlot(params: ReservationParams) {
  return db.transaction(async (tx) => {
    // 1. Lock the time range for this staff member
    const conflicting = await tx
      .select()
      .from(appointments)
      .where(and(
        eq(appointments.staffId, params.staffId),
        // Overlapping time check
        lte(appointments.startTime, params.endTime),
        gte(appointments.endTime, params.startTime),
        not(eq(appointments.status, 'cancelled'))
      ))
      .for('update'); // Pessimistic lock

    if (conflicting.length > 0) {
      throw new SlotTakenError('SLOT_TAKEN');
    }

    // 2. Insert the appointment
    const [appointment] = await tx
      .insert(appointments)
      .values({
        staffId: params.staffId,
        customerId: params.customerId,
        serviceIds: params.serviceIds,
        startTime: params.startTime,
        endTime: params.endTime,
        timezone: params.timezone,
        status: 'pending',
        version: 1
      })
      .returning();

    return appointment;
  });
}

// For updates, use version column for optimistic locking
export async function updateAppointment(
  id: string,
  updates: Partial<Appointment>,
  expectedVersion: number
) {
  const result = await db
    .update(appointments)
    .set({
      ...updates,
      version: sql`${appointments.version} + 1`,
      updatedAt: new Date()
    })
    .where(and(
      eq(appointments.id, id),
      eq(appointments.version, expectedVersion)
    ))
    .returning();

  if (result.length === 0) {
    throw new ConcurrentModificationError('CONCURRENT_MODIFICATION');
  }

  return result[0];
}
```

### Authentication Flow

```
1. CUSTOMER LOGIN (OAuth)
   Customer -> /auth/login -> Supabase Auth (Google/Facebook)
            -> /auth/callback -> hooks.server.ts (set session cookie)
            <- Redirect to original destination

2. ADMIN LOGIN (Email/Password)
   Admin -> /auth/login -> Form Action -> Supabase Auth
                                       -> Check staff.role
         <- Redirect to /admin/dashboard

3. EVERY REQUEST
   Request -> hooks.server.ts -> supabase.auth.getUser() (verify JWT)
                              -> Set locals.user
                              -> Route guards check permissions
```

### CMS Content Flow

```
1. STORYBLOK INITIALIZATION
   +layout.ts -> storyblokInit() with component mapping

2. PAGE LOAD
   Load Function -> Storyblok API -> Content JSON
                 <- Transformed to Svelte components

3. VISUAL EDITOR (Owner editing)
   Storyblok Visual Editor -> iframe with site
                           -> Storyblok Bridge (real-time updates)
   Owner saves -> Webhook -> Site rebuild (ISR)
```

### Google Calendar Bi-Directional Sync

```
OUTBOUND (Appointment created in app)
   Appointment saved -> calendar-sync.ts -> Google Calendar API
                                         -> Create/update event
                                         -> Store externalCalendarId

INBOUND (External event created in Google Calendar)
   Google Calendar -> Webhook -> /api/webhooks/calendar
                              -> Parse event
                              -> Block slot (type: 'external_block')
                              -> OR update existing appointment

INCREMENTAL SYNC (Periodic)
   Cron job -> For each staff with calendar connected
            -> Fetch changes since syncToken
            -> Process additions/modifications/deletions
            -> Update local records
            -> Store new syncToken
```

### Payment Flow (Square)

```
ONLINE PAYMENT
   1. Customer selects "Pay with Card"
   2. Square Web SDK renders card form (PCI-compliant iframe)
   3. Customer enters card details
   4. SDK tokenizes card -> returns nonce
   5. Form submission sends nonce to server
   6. Server calls Square Payments API with nonce
   7. Payment confirmed -> Update appointment.paymentStatus
   8. Square sends webhook -> /api/webhooks/square

PAY AT SALON
   1. Customer selects "Pay at Salon"
   2. Display stylist's accepted payment methods
   3. Appointment saved with paymentStatus: 'unpaid'
   4. Staff marks paid after service (manual)
```

## Database Schema Overview

```sql
-- Core tables for booking system

-- Staff members (stylists)
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  bio TEXT,
  photo_url TEXT,
  role TEXT DEFAULT 'stylist', -- owner, admin, stylist
  active BOOLEAN DEFAULT true,

  -- Payment configuration (booth rental model)
  accepts_square BOOLEAN DEFAULT false,
  square_merchant_id TEXT,
  venmo_handle TEXT,
  zelle_identifier TEXT, -- phone or email
  accepts_cash BOOLEAN DEFAULT true,

  -- Calendar sync
  google_calendar_id TEXT,
  calendar_sync_token TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Services offered
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- cuts, color, treatments, styling

  -- Duration (minutes)
  duration_minutes INTEGER NOT NULL,
  duration_min INTEGER, -- for variable durations
  duration_max INTEGER,

  -- Pricing
  price_type TEXT NOT NULL, -- fixed, starting_from, range, consultation
  price INTEGER, -- in cents
  price_min INTEGER,
  price_max INTEGER,

  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Staff-specific pricing (overrides service defaults)
CREATE TABLE staff_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,

  -- Override pricing for this stylist
  price INTEGER,
  price_min INTEGER,
  price_max INTEGER,
  duration_minutes INTEGER,

  active BOOLEAN DEFAULT true,

  UNIQUE(staff_id, service_id)
);

-- Staff availability (weekly schedule)
CREATE TABLE staff_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  UNIQUE(staff_id, day_of_week)
);

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  notes TEXT, -- staff notes about customer

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Appointments (core booking table)
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff(id) NOT NULL,
  customer_id UUID REFERENCES customers(id),

  -- Services booked
  service_ids UUID[] NOT NULL,

  -- Timing (always stored in UTC)
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL, -- IANA timezone

  -- Status
  status TEXT DEFAULT 'pending',
    -- pending, confirmed, completed, cancelled, no_show

  -- Payment
  payment_status TEXT DEFAULT 'unpaid',
    -- unpaid, deposit, paid, refunded
  payment_method TEXT, -- square, venmo, zelle, cash
  payment_amount INTEGER, -- in cents
  square_payment_id TEXT,

  -- For external calendar blocks
  type TEXT DEFAULT 'appointment', -- appointment, external_block, break
  external_calendar_id TEXT, -- Google Calendar event ID

  -- Notes
  customer_notes TEXT,
  staff_notes TEXT,

  -- Optimistic locking
  version INTEGER DEFAULT 1,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Scheduled notifications
CREATE TABLE scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- email, sms
  template TEXT NOT NULL, -- confirmation, reminder_24h, reminder_2h
  send_at TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  error TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for double-booking prevention
CREATE INDEX idx_appointments_staff_time
  ON appointments(staff_id, start_time, end_time)
  WHERE status != 'cancelled';

-- Index for availability queries
CREATE INDEX idx_appointments_day
  ON appointments(staff_id, DATE(start_time AT TIME ZONE 'UTC'))
  WHERE status != 'cancelled';

-- Index for notification processing
CREATE INDEX idx_scheduled_notifications_pending
  ON scheduled_notifications(send_at)
  WHERE sent = false;
```

## Integration Points

### Supabase

| Integration | Purpose | Pattern |
|-------------|---------|---------|
| **PostgreSQL** | Primary database | Drizzle ORM queries |
| **Auth** | User authentication | @supabase/ssr in hooks |
| **RLS** | Row-level security | Database policies |
| **Realtime** | Live updates (future) | Subscription channels |

**Auth Configuration:**
- Customers: Google/Facebook OAuth
- Staff/Admin: Email + password
- Role stored in `staff.role`, not JWT claims

### Square

| Integration | Purpose | Pattern |
|-------------|---------|---------|
| **Web Payments SDK** | Card tokenization | Client-side iframe |
| **Payments API** | Process payments | Server-side API call |
| **Webhooks** | Payment confirmations | /api/webhooks/square |
| **Cards API** | Store cards on file | For no-show charges |

**Configuration:**
- Each stylist can have their own Square merchant ID (booth rental model)
- Fallback to salon's main Square account if stylist doesn't have one

### Storyblok

| Integration | Purpose | Pattern |
|-------------|---------|---------|
| **Content API** | Fetch CMS content | Load functions |
| **Visual Editor** | Live editing | Storyblok Bridge |
| **Webhooks** | Content updates | ISR/rebuild trigger |

**Content Types:**
- Homepage blocks
- Service descriptions
- Staff bios and photos
- Gallery items
- Announcements/promotions
- Business info (hours, location)

### Google Calendar

| Integration | Purpose | Pattern |
|-------------|---------|---------|
| **Events API** | Create/update events | Outbound sync |
| **Watch API** | Receive change notifications | Webhooks |
| **Incremental Sync** | Periodic full sync | Cron job + sync tokens |

**Sync Strategy:**
- Per-stylist calendar connection (OAuth)
- Appointments sync to stylist's personal calendar
- External events from Google block availability

### Resend

| Integration | Purpose | Pattern |
|-------------|---------|---------|
| **Send API** | Transactional email | Direct API calls |
| **Templates** | Email content | MJML pre-compiled |
| **Attachments** | Calendar .ics files | Generated per booking |

### Plivo

| Integration | Purpose | Pattern |
|-------------|---------|---------|
| **Messages API** | Send SMS | Direct API calls |
| **Inbound SMS** | Customer replies | Webhook endpoint |

### Cloudflare

| Integration | Purpose | Pattern |
|-------------|---------|---------|
| **Pages** | Hosting | Adapter-cloudflare |
| **Images** | Image optimization | URL-based transforms |
| **KV** | Caching | Platform bindings |
| **Cron Triggers** | Scheduled jobs | Notifications, sync |

## Scaling Considerations

For a hair salon with 10 stylists, the scale is modest. Focus on reliability over high-scale patterns.

| Concern | Current Scale (10 stylists) | If Grows to 50+ |
|---------|----------------------------|-----------------|
| **Database** | Supabase free tier sufficient | Upgrade plan, add indexes |
| **Concurrent bookings** | Pessimistic locking adequate | Consider queue-based booking |
| **Calendar sync** | Direct API calls | Background job queue |
| **Notifications** | Cron every 15 min | Dedicated worker |
| **CMS** | Storyblok free tier | Upgrade for more users |

**Realistic Sizing:**
- ~100-500 appointments/month
- ~10-50 concurrent users max
- ~1000-5000 page views/day
- All well within free tier limits

## Anti-Patterns to Avoid

### 1. Auth in Root Layout Only

**Problem:** Putting all auth logic in `+layout.server.ts` doesn't reliably protect all routes.

**Solution:** Use `hooks.server.ts` for session setup, and add empty `+layout.server.ts` or `+page.server.ts` in protected directories to ensure hooks run.

### 2. Trusting getSession() Without getUser()

**Problem:** `getSession()` returns unverified JWT data that could be tampered with.

**Solution:** Always call `auth.getUser()` for server-side auth checks. It makes a request to verify the token.

### 3. API Routes for Everything

**Problem:** Using `+server.ts` API routes for form submissions adds boilerplate and loses progressive enhancement.

**Solution:** Use Form Actions for mutations. Reserve API routes for webhooks, AJAX, and external integrations.

### 4. Client-Side Only Validation

**Problem:** Relying solely on client-side validation is a security risk.

**Solution:** Always validate server-side with Zod. Use Superforms for unified client/server validation.

### 5. Storing Timestamps Without Timezone

**Problem:** Storing local times leads to confusion across timezones.

**Solution:** Store all times in UTC with IANA timezone names. Convert for display only.

### 6. Monolithic Server Files

**Problem:** Putting all server logic in `+page.server.ts` files makes code hard to test and reuse.

**Solution:** Extract business logic to `$lib/server/` domain modules. Keep route files thin.

### 7. Overcomplicating State Management

**Problem:** Reaching for external state libraries when Svelte 5 runes suffice.

**Solution:** Use `$state`, `$derived`, `$effect` and class-based state. Context API for cross-component sharing.

### 8. Missing Optimistic Lock on Updates

**Problem:** Using simple UPDATE without version check allows concurrent modifications to overwrite each other.

**Solution:** Include `WHERE version = ?` on all appointment updates. Handle conflict with user-friendly retry.

## Build Order (Dependency-Based)

Based on component dependencies, recommended implementation order:

### Phase 1: Foundation
1. **Monorepo setup** (Turborepo, pnpm workspace)
2. **Database schema** (packages/db with Drizzle)
3. **SvelteKit app scaffold** (apps/web)
4. **Supabase connection** (hooks.server.ts)
5. **shadcn-svelte setup** (packages/ui)

### Phase 2: Core Data
1. **Staff & services models** (seed data)
2. **Staff profiles** (read-only)
3. **Services listing** (read-only)
4. **Basic Storyblok integration** (homepage)

### Phase 3: Booking Engine
1. **Availability calculation** (lib/server/booking)
2. **Time slot API** (availability endpoint)
3. **Booking wizard UI** (runes state)
4. **Reservation with locking** (Form Action)
5. **Confirmation page**

### Phase 4: Authentication
1. **Supabase Auth setup** (OAuth + email)
2. **Customer accounts** (optional login)
3. **Admin authentication** (required)
4. **Route protection** (hooks)

### Phase 5: Notifications
1. **Email templates** (packages/email, MJML)
2. **Resend integration** (booking confirmation)
3. **Plivo integration** (SMS confirmation)
4. **Notification scheduler** (reminders)
5. **Cron trigger setup** (Cloudflare)

### Phase 6: Payments
1. **Square Web SDK** (client integration)
2. **Payment processing** (server API)
3. **Webhook handling** (payment events)
4. **Pay-at-salon flow** (display methods)

### Phase 7: Calendar Sync
1. **Google OAuth** (per-stylist)
2. **Outbound sync** (appointment -> Google)
3. **Webhook setup** (inbound changes)
4. **Incremental sync** (periodic job)

### Phase 8: Admin Dashboard
1. **Dashboard layout** (admin route group)
2. **Appointment management** (calendar view)
3. **Staff management** (CRUD)
4. **Service management** (CRUD)

### Phase 9: CMS & Marketing
1. **Full Storyblok setup** (all content types)
2. **Visual Editor** (owner editing)
3. **Gallery page**
4. **SEO optimization** (meta, schema.org)

## Sources

- [SvelteKit Form Actions Documentation](https://svelte.dev/docs/kit/form-actions)
- [Supabase SSR Auth for SvelteKit](https://supabase.com/docs/guides/auth/server-side/sveltekit)
- [Storyblok SvelteKit Integration](https://www.storyblok.com/tp/the-storyblok-sveltekit-ultimate-tutorial)
- [Square Web Payments SDK](https://developer.squareup.com/docs/web-payments/overview)
- [Google Calendar Sync Guide](https://developers.google.com/workspace/calendar/api/guides/sync)
- [Bi-directional Calendar Sync Implementation](https://calendhub.com/blog/implement-bidirectional-calendar-sync-2025/)
- [PostgreSQL Double Booking Prevention](https://jsupskills.dev/how-to-solve-the-double-booking-problem/)
- [Optimistic vs Pessimistic Locking](https://hevalhazalkurt.com/blog/optimistic-vs-pessimistic-locking-in-orms/)
- [Hair Salon Database Design](https://vertabelo.com/blog/a-database-model-to-manage-appointments-and-organize-schedules/)
- [SvelteKit Architecture Patterns](https://oestechnology.co.uk/posts/architectural-patterns-scaling-sveltekit)
- [Multi-tenant Booking System Design](https://palospublishing.com/design-a-multi-tenant-booking-system-with-object-oriented-design/)
