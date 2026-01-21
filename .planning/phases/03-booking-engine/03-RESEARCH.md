# Phase 3: Booking-Engine - Research

**Researched:** 2026-01-21
**Domain:** Appointment booking, availability calculation, optimistic locking, multi-step forms
**Confidence:** HIGH

## Summary

Phase 3 builds the core booking engine enabling customers to browse services, select a stylist, pick an available time slot, and confirm appointments. The research focused on five key areas: (1) availability calculation algorithm for generating bookable slots from stylist schedules and existing bookings, (2) optimistic locking to prevent double-booking, (3) timezone-safe date handling, (4) multi-step wizard UX patterns in Svelte 5, and (5) integration points with the existing Phase 2 codebase.

The standard approach uses a version column for optimistic locking combined with Drizzle's `.returning()` clause to detect conflicts. For dates, `@date-fns/utc` provides UTC-first operations while `date-fns` handles formatting. The booking wizard uses Svelte 5's `$state` rune for step management without external state libraries. The existing schema from Phase 2 provides staff, services, and pricing data that booking depends on.

**Primary recommendation:** Implement availability as a simple schedule table (weekday + start/end times) with slot generation in application code. Use version-based optimistic locking on the appointments table with Drizzle transactions. Build the booking wizard as a single-page multi-step form using `$state` for step management and per-step validation.

## Key Findings

### 1. Availability Calculation Strategy

**Decision:** Calculate available slots at query time, not pre-computed.

The algorithm:
1. Get stylist's weekly schedule (which days/hours they work)
2. Generate potential 30-minute slots within working hours for target date
3. Filter out slots where existing bookings overlap
4. Filter out slots in the past
5. Filter out slots where service duration would exceed working hours

**Why query-time calculation:**
- Simpler schema (no slot pre-generation)
- Handles variable service durations naturally
- No stale slot data to manage
- Scales well for salon-size booking volumes

### 2. Optimistic Locking for Double-Booking Prevention

**Decision:** Use version column with `RETURNING` clause.

PostgreSQL optimistic locking pattern verified for Drizzle:
```typescript
// Check-and-update in single atomic operation
const result = await db
  .update(appointments)
  .set({
    status: 'confirmed',
    version: sql`${appointments.version} + 1`
  })
  .where(and(
    eq(appointments.id, appointmentId),
    eq(appointments.version, expectedVersion)
  ))
  .returning({ id: appointments.id });

// If result is empty, version changed (conflict detected)
if (result.length === 0) {
  throw new Error('Slot no longer available');
}
```

**Why version column over row locking:**
- Better UX (no blocking waits)
- Salon booking has low contention (rarely same slot, same second)
- Simpler error handling (retry with fresh data)
- Drizzle supports `.returning()` for PostgreSQL

### 3. Timezone Handling

**Decision:** Store UTC, display in salon's local timezone.

Stack:
- `@date-fns/utc` (239B) - UTCDate class for UTC operations
- `date-fns` - Formatting and date arithmetic
- `@internationalized/date` - Already in shadcn-svelte Calendar component

Pattern:
```typescript
import { UTCDate } from '@date-fns/utc';
import { format, addMinutes } from 'date-fns';

// Store in database as UTC
const appointmentStart = new UTCDate(2026, 0, 21, 14, 30); // 2:30 PM UTC

// Display in local time (salon timezone)
const displayTime = format(appointmentStart, 'h:mm a'); // Uses local timezone
```

**Key insight:** The salon operates in a single timezone. Store UTC, but the UI displays times in that fixed timezone. No per-user timezone detection needed.

### 4. Booking Wizard State Management

**Decision:** Single-page form with `$state` for step management.

Pattern for Svelte 5:
```typescript
// Booking wizard state
let currentStep = $state(1);
let bookingData = $state({
  serviceId: null as string | null,
  staffId: null as string | null,
  date: null as Date | null,
  time: null as string | null,
  customerEmail: '',
  customerPhone: '',
  customerName: '',
});

// Step validation before proceeding
function canProceed(step: number): boolean {
  switch(step) {
    case 1: return !!bookingData.serviceId;
    case 2: return !!bookingData.staffId;
    case 3: return !!bookingData.date && !!bookingData.time;
    case 4: return !!bookingData.customerEmail && !!bookingData.customerName;
    default: return false;
  }
}
```

**Why not external state library:**
- Booking flow is linear, not complex
- All state is local to booking page
- Svelte 5 `$state` handles reactivity cleanly
- Superforms is overkill for this use case (no server-side form actions)

### 5. Existing Codebase Assets

Phase 2 provides:

| Asset | Location | Use in Booking |
|-------|----------|----------------|
| Staff schema | `packages/db/src/schema/staff.ts` | Staff selection, schedule association |
| Services schema | `packages/db/src/schema/services.ts` | Service selection, duration |
| Staff-services junction | `packages/db/src/schema/services.ts` | Which stylists offer which services |
| StaffCard component | `apps/web/src/lib/components/staff/StaffCard.svelte` | Adapt for stylist selection |
| ServiceCard component | `apps/web/src/lib/components/services/ServiceCard.svelte` | Adapt for service selection |
| PriceDisplay component | `apps/web/src/lib/components/services/PriceDisplay.svelte` | Reuse directly |
| Card UI components | `apps/web/src/lib/components/ui/card/` | Booking confirmation display |
| Button, Input, Badge | `apps/web/src/lib/components/ui/` | Form controls |
| Drizzle db instance | `packages/db/src/index.ts` | Database queries |
| RLS policies | Schema files | Public read access already configured |

## Technical Approach

### Schema Additions

New tables for Phase 3:

```typescript
// Staff schedule (weekly availability)
export const staffSchedule = pgTable('staff_schedule', {
  id: uuid('id').primaryKey().defaultRandom(),
  staffId: uuid('staff_id').notNull().references(() => staff.id),
  weekday: integer('weekday').notNull(), // 0=Sunday, 6=Saturday
  startTime: time('start_time').notNull(), // e.g., '09:00'
  endTime: time('end_time').notNull(), // e.g., '17:00'
  isActive: boolean('is_active').notNull().default(true),
}, (table) => [
  unique().on(table.staffId, table.weekday),
]);

// Appointments
export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  staffId: uuid('staff_id').notNull().references(() => staff.id),
  serviceId: uuid('service_id').notNull().references(() => services.id),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  status: appointmentStatusEnum('status').notNull().default('pending'),
  version: integer('version').notNull().default(1), // Optimistic locking

  // Customer info (guest booking)
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone'),

  // Cancellation
  cancelToken: text('cancel_token').notNull().unique(), // nanoid for URL
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),

  // Deposit (placeholder for Phase 4)
  depositRequired: boolean('deposit_required').notNull().default(false),
  depositAmount: integer('deposit_amount'), // cents
  depositPaidAt: timestamp('deposit_paid_at', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Status enum
export const appointmentStatusEnum = pgEnum('appointment_status', [
  'pending',    // Created but not confirmed (future: awaiting deposit)
  'confirmed',  // Booking complete
  'cancelled',  // Cancelled by customer
  'completed',  // Appointment happened
  'no_show',    // Customer didn't show
]);
```

### Availability Calculation Algorithm

```typescript
// lib/booking/availability.ts
import { UTCDate } from '@date-fns/utc';
import { addMinutes, isBefore, isAfter, parseISO, format } from 'date-fns';

interface TimeSlot {
  start: Date;
  end: Date;
  display: string; // "2:30 PM"
}

interface Booking {
  startTime: Date;
  endTime: Date;
}

export function generateAvailableSlots(
  date: Date,
  schedule: { startTime: string; endTime: string }, // "09:00", "17:00"
  existingBookings: Booking[],
  serviceDuration: number, // minutes
  slotGranularity: number = 30 // 30-minute slots
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  // Parse schedule times for the target date
  const [startHour, startMin] = schedule.startTime.split(':').map(Number);
  const [endHour, endMin] = schedule.endTime.split(':').map(Number);

  const dayStart = new UTCDate(date);
  dayStart.setUTCHours(startHour, startMin, 0, 0);

  const dayEnd = new UTCDate(date);
  dayEnd.setUTCHours(endHour, endMin, 0, 0);

  const now = new UTCDate();

  // Generate slots at granularity intervals
  let slotStart = dayStart;
  while (true) {
    const slotEnd = addMinutes(slotStart, serviceDuration);

    // Stop if slot would exceed working hours
    if (isAfter(slotEnd, dayEnd)) break;

    // Skip past slots
    if (isBefore(slotStart, now)) {
      slotStart = addMinutes(slotStart, slotGranularity);
      continue;
    }

    // Check for booking conflicts
    const hasConflict = existingBookings.some(booking =>
      isBefore(booking.startTime, slotEnd) && isAfter(booking.endTime, slotStart)
    );

    if (!hasConflict) {
      slots.push({
        start: slotStart,
        end: slotEnd,
        display: format(slotStart, 'h:mm a'),
      });
    }

    slotStart = addMinutes(slotStart, slotGranularity);
  }

  return slots;
}
```

### Booking Flow Routes

```
/book                           # Booking wizard (single page, multi-step)
/book/confirmation/[id]         # Confirmation page after booking
/book/cancel/[token]            # Cancel via unique link
```

### Unique Cancel Token Generation

Use nanoid for URL-safe, collision-resistant tokens:

```typescript
import { nanoid } from 'nanoid';

// Generate 21-character URL-safe token
const cancelToken = nanoid(); // e.g., "V1StGXR8_Z5jdHi6B-myT"

// Cancel URL: /book/cancel/V1StGXR8_Z5jdHi6B-myT
```

**Why nanoid:**
- URL-safe characters (A-Za-z0-9_-)
- 21 chars = same collision probability as UUID v4
- Smaller than UUID (no dashes, shorter)
- Cryptographically secure (uses crypto.getRandomValues)

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| date-fns | ^4.1 | Date formatting, arithmetic | Tree-shakeable, immutable, TypeScript-first |
| @date-fns/utc | ^1.2 | UTCDate class for UTC operations | 239B, works with date-fns |
| nanoid | ^5.0 | Cancel token generation | URL-safe, tiny, secure |
| ics | ^3.8 | ICS calendar file generation | Standard, handles edge cases |

### Already Installed (from Phase 1/2)

| Library | Purpose |
|---------|---------|
| @internationalized/date | shadcn-svelte Calendar uses this |
| drizzle-orm | Database ORM |
| shadcn-svelte | UI components (Card, Button, Input, Calendar) |

### Not Needed

| Library | Why Not |
|---------|---------|
| sveltekit-superforms | Booking is client-side flow, not traditional form submission |
| svelte-wizard | Simple 4-step flow doesn't need external wizard library |
| dayjs | date-fns already covers needs |

**Installation:**
```bash
pnpm add date-fns @date-fns/utc nanoid ics
```

## Architecture Patterns

### Recommended Project Structure

```
apps/web/src/
├── lib/
│   ├── booking/                    # Booking-specific logic
│   │   ├── availability.ts         # Slot generation algorithm
│   │   ├── validation.ts           # Booking validation rules
│   │   └── ics.ts                  # Calendar file generation
│   ├── components/
│   │   └── booking/                # Booking UI components
│   │       ├── ServiceStep.svelte
│   │       ├── StylistStep.svelte
│   │       ├── DateTimeStep.svelte
│   │       ├── ConfirmStep.svelte
│   │       ├── BookingProgress.svelte
│   │       ├── SlotGrid.svelte
│   │       ├── WeekView.svelte
│   │       └── BookingSummary.svelte
├── routes/
│   └── book/
│       ├── +page.svelte            # Booking wizard
│       ├── +page.server.ts         # Load services, staff
│       ├── confirmation/
│       │   └── [id]/
│       │       ├── +page.svelte    # Confirmation display
│       │       └── +page.server.ts # Load booking details
│       └── cancel/
│           └── [token]/
│               ├── +page.svelte    # Cancel confirmation
│               └── +page.server.ts # Process cancellation
packages/db/src/schema/
├── appointments.ts                 # New: appointments, schedule tables
└── index.ts                        # Export new schema
```

### Pattern 1: Booking Wizard with $state

**What:** Single-page multi-step form using Svelte 5 runes
**When to use:** Linear wizard flows with client-side navigation

```svelte
<!-- /book/+page.svelte -->
<script lang="ts">
  import ServiceStep from '$lib/components/booking/ServiceStep.svelte';
  import StylistStep from '$lib/components/booking/StylistStep.svelte';
  import DateTimeStep from '$lib/components/booking/DateTimeStep.svelte';
  import ConfirmStep from '$lib/components/booking/ConfirmStep.svelte';
  import BookingProgress from '$lib/components/booking/BookingProgress.svelte';

  let { data } = $props();

  const STEPS = ['Service', 'Stylist', 'Date & Time', 'Confirm'];

  let currentStep = $state(1);
  let booking = $state({
    serviceId: null as string | null,
    staffId: null as string | null,
    date: null as Date | null,
    timeSlot: null as { start: Date; end: Date } | null,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });

  let isSubmitting = $state(false);

  function canProceed(): boolean {
    switch (currentStep) {
      case 1: return !!booking.serviceId;
      case 2: return !!booking.staffId;
      case 3: return !!booking.date && !!booking.timeSlot;
      case 4: return !!booking.customerEmail && booking.customerName.length >= 2;
      default: return false;
    }
  }

  async function handleConfirm() {
    isSubmitting = true;
    const response = await fetch('/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    });
    // Handle response...
  }
</script>

<div class="max-w-2xl mx-auto px-4 py-8">
  <BookingProgress steps={STEPS} {currentStep} />

  {#if currentStep === 1}
    <ServiceStep
      services={data.services}
      bind:selectedId={booking.serviceId}
    />
  {:else if currentStep === 2}
    <StylistStep
      serviceId={booking.serviceId}
      staff={data.staff}
      bind:selectedId={booking.staffId}
    />
  {:else if currentStep === 3}
    <DateTimeStep
      staffId={booking.staffId}
      serviceId={booking.serviceId}
      bind:date={booking.date}
      bind:timeSlot={booking.timeSlot}
    />
  {:else if currentStep === 4}
    <ConfirmStep
      {booking}
      services={data.services}
      staff={data.staff}
      bind:customerName={booking.customerName}
      bind:customerEmail={booking.customerEmail}
      bind:customerPhone={booking.customerPhone}
      onConfirm={handleConfirm}
      {isSubmitting}
    />
  {/if}

  <div class="flex justify-between mt-8">
    {#if currentStep > 1}
      <button onclick={() => currentStep--}>Back</button>
    {/if}
    {#if currentStep < 4}
      <button
        onclick={() => currentStep++}
        disabled={!canProceed()}
      >
        Continue
      </button>
    {/if}
  </div>
</div>
```

### Pattern 2: Availability API Endpoint

**What:** Server endpoint that calculates available slots
**When to use:** When date/stylist selection changes

```typescript
// /api/availability/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '@repo/db';
import { staffSchedule, appointments, services } from '@repo/db/schema';
import { eq, and, gte, lt } from 'drizzle-orm';
import { generateAvailableSlots } from '$lib/booking/availability';

export async function GET({ url }) {
  const staffId = url.searchParams.get('staffId');
  const serviceId = url.searchParams.get('serviceId');
  const dateStr = url.searchParams.get('date'); // YYYY-MM-DD

  if (!staffId || !serviceId || !dateStr) {
    return json({ error: 'Missing parameters' }, { status: 400 });
  }

  const date = new Date(dateStr);
  const weekday = date.getDay(); // 0-6

  // Get stylist's schedule for this weekday
  const schedule = await db.query.staffSchedule.findFirst({
    where: and(
      eq(staffSchedule.staffId, staffId),
      eq(staffSchedule.weekday, weekday),
      eq(staffSchedule.isActive, true),
    ),
  });

  if (!schedule) {
    return json({ slots: [], message: 'Stylist not available this day' });
  }

  // Get service duration
  const service = await db.query.services.findFirst({
    where: eq(services.id, serviceId),
  });

  if (!service) {
    return json({ error: 'Service not found' }, { status: 404 });
  }

  // Get existing bookings for this day
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const existingBookings = await db.query.appointments.findMany({
    where: and(
      eq(appointments.staffId, staffId),
      gte(appointments.startTime, dayStart),
      lt(appointments.startTime, dayEnd),
      eq(appointments.status, 'confirmed'),
    ),
  });

  const slots = generateAvailableSlots(
    date,
    { startTime: schedule.startTime, endTime: schedule.endTime },
    existingBookings,
    service.durationMinutes,
  );

  return json({ slots });
}
```

### Pattern 3: Optimistic Locking in Create Booking

**What:** Prevent double-booking with version check
**When to use:** When confirming appointment

```typescript
// /book/+server.ts (POST handler)
import { json, error } from '@sveltejs/kit';
import { db, sql } from '@repo/db';
import { appointments } from '@repo/db/schema';
import { and, eq, gte, lt } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function POST({ request }) {
  const data = await request.json();

  // Validate inputs...

  return await db.transaction(async (tx) => {
    // Check for conflicts one more time (in transaction)
    const conflicts = await tx.query.appointments.findMany({
      where: and(
        eq(appointments.staffId, data.staffId),
        lt(appointments.startTime, data.endTime),
        gte(appointments.endTime, data.startTime),
        eq(appointments.status, 'confirmed'),
      ),
    });

    if (conflicts.length > 0) {
      return json({
        error: 'conflict',
        message: 'This slot was just booked. Please select another time.',
      }, { status: 409 });
    }

    // Create appointment
    const [appointment] = await tx
      .insert(appointments)
      .values({
        staffId: data.staffId,
        serviceId: data.serviceId,
        startTime: data.startTime,
        endTime: data.endTime,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        cancelToken: nanoid(),
        status: 'confirmed',
      })
      .returning();

    return json({
      success: true,
      appointmentId: appointment.id,
    });
  });
}
```

### Pattern 4: ICS File Download

**What:** Generate downloadable calendar file
**When to use:** Confirmation page

```typescript
// lib/booking/ics.ts
import { createEvent } from 'ics';

interface AppointmentDetails {
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
}

export function generateICS(appointment: AppointmentDetails): string {
  const start = appointment.startTime;
  const end = appointment.endTime;

  const { value, error } = createEvent({
    title: appointment.title,
    description: appointment.description,
    location: appointment.location,
    start: [
      start.getFullYear(),
      start.getMonth() + 1,
      start.getDate(),
      start.getHours(),
      start.getMinutes(),
    ],
    end: [
      end.getFullYear(),
      end.getMonth() + 1,
      end.getDate(),
      end.getHours(),
      end.getMinutes(),
    ],
  });

  if (error) throw error;
  return value!;
}

// In Svelte component:
function downloadCalendar() {
  const icsContent = generateICS({
    title: `${serviceName} at Expressions Salon`,
    description: `Appointment with ${stylistName}`,
    location: '123 Main St, City',
    startTime: appointment.startTime,
    endTime: appointment.endTime,
  });

  const blob = new Blob([icsContent], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'appointment.ics';
  a.click();
}
```

### Anti-Patterns to Avoid

- **Don't pre-generate all slots in database:** Wastes storage, stale data risk, inflexible for variable durations
- **Don't use Math.random() for tokens:** Use crypto-secure nanoid
- **Don't validate availability only client-side:** Server must re-check in transaction
- **Don't store local times:** Always store UTC, convert for display
- **Don't use external state management for wizard:** Svelte 5 $state is sufficient
- **Don't block UI during availability fetch:** Show loading states, fetch asynchronously

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ICS file generation | String concatenation | `ics` library | RFC 5545 compliance, timezone handling, edge cases |
| Unique tokens | Math.random or UUID | `nanoid` | URL-safe, compact, cryptographically secure |
| Date arithmetic | Manual calculations | `date-fns` | DST handling, timezone safety, tested edge cases |
| Calendar UI | Custom date picker | shadcn-svelte Calendar | Already uses @internationalized/date, accessible |
| Progress indicator | Custom stepper | Simple CSS with $derived | 4 steps doesn't need library overhead |

**Key insight:** Booking logic is where the custom work is needed. Date handling and token generation are solved problems.

## Common Pitfalls

### Pitfall 1: Timezone Mismatch Between Server and Client

**What goes wrong:** Appointment shows different time in confirmation vs what customer selected
**Why it happens:** Server renders UTC, client renders local time, hydration mismatch
**How to avoid:**
```typescript
// Store salon timezone as constant
const SALON_TIMEZONE = 'America/New_York';

// Format times consistently
import { formatInTimeZone } from 'date-fns-tz';
const displayTime = formatInTimeZone(appointment.startTime, SALON_TIMEZONE, 'h:mm a');
```
**Warning signs:** Different times on page load vs after hydration

### Pitfall 2: Race Condition on Popular Slots

**What goes wrong:** Two customers book same slot simultaneously
**Why it happens:** Availability checked before booking, another insert happens between
**How to avoid:**
- Use database transaction with conflict check
- Check for overlapping bookings inside transaction
- Return 409 Conflict with helpful message if slot taken
**Warning signs:** Duplicate bookings in database, customer complaints

### Pitfall 3: Service Duration Exceeds Schedule

**What goes wrong:** 90-minute service booked starting at 4:30 PM when stylist ends at 5:00 PM
**Why it happens:** Slot generation doesn't account for service duration extending past schedule
**How to avoid:**
```typescript
// Stop generating slots when service would exceed end time
while (true) {
  const slotEnd = addMinutes(slotStart, serviceDuration);
  if (isAfter(slotEnd, scheduleEnd)) break; // This check is critical
  // ... rest of slot generation
}
```
**Warning signs:** Bookings that extend past closing time

### Pitfall 4: Cancel Token Collision

**What goes wrong:** Two appointments get same cancel token, wrong one gets cancelled
**Why it happens:** Using weak random or too-short tokens
**How to avoid:**
- Use nanoid (21 chars = 126 bits of entropy)
- Add unique constraint on cancel_token column
- Handle unique violation gracefully (regenerate token)
**Warning signs:** Database unique constraint violations

### Pitfall 5: Stale Availability Display

**What goes wrong:** Customer selects slot that's already booked by another customer
**Why it happens:** Availability fetched when page loads, not refreshed
**How to avoid:**
- Refresh availability when date changes
- Re-validate server-side before confirming
- Show "just booked" error with alternative suggestions
- Consider WebSocket/polling for high-traffic slots (overkill for salon)
**Warning signs:** High rate of 409 Conflict responses

### Pitfall 6: "Any Stylist" Logic Complexity

**What goes wrong:** "Any available" returns first stylist alphabetically, not first with availability
**Why it happens:** Naive implementation doesn't actually find next available slot
**How to avoid:**
```typescript
// For "any available" - find first slot across all stylists
async function getFirstAvailableSlot(serviceId: string, date: Date) {
  const qualifiedStaff = await getStaffForService(serviceId);

  let earliestSlot = null;
  let selectedStaff = null;

  for (const staff of qualifiedStaff) {
    const slots = await getAvailableSlots(staff.id, serviceId, date);
    if (slots.length > 0 && (!earliestSlot || slots[0].start < earliestSlot.start)) {
      earliestSlot = slots[0];
      selectedStaff = staff;
    }
  }

  return { slot: earliestSlot, staff: selectedStaff };
}
```
**Warning signs:** "Any available" shows no slots when individual stylists have openings

## Code Examples

### Week View Calendar Component

```svelte
<!-- WeekView.svelte -->
<script lang="ts">
  import { addDays, format, startOfWeek, isSameDay } from 'date-fns';
  import { Button } from '$lib/components/ui/button';

  let {
    selectedDate = $bindable<Date | null>(null),
    availableDates = [],
  }: {
    selectedDate: Date | null;
    availableDates: Date[];
  } = $props();

  let weekStart = $state(startOfWeek(new Date()));

  let days = $derived(
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  );

  function hasAvailability(date: Date): boolean {
    return availableDates.some(d => isSameDay(d, date));
  }

  function isPast(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <Button variant="ghost" onclick={() => weekStart = addDays(weekStart, -7)}>
      Previous
    </Button>
    <span class="font-medium">
      {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
    </span>
    <Button variant="ghost" onclick={() => weekStart = addDays(weekStart, 7)}>
      Next
    </Button>
  </div>

  <div class="grid grid-cols-7 gap-2">
    {#each days as day}
      <button
        class="p-3 rounded-lg text-center transition-colors
          {isSameDay(day, selectedDate) ? 'bg-primary text-primary-foreground' : ''}
          {hasAvailability(day) && !isPast(day) ? 'hover:bg-accent cursor-pointer' : 'opacity-50 cursor-not-allowed'}
        "
        disabled={!hasAvailability(day) || isPast(day)}
        onclick={() => selectedDate = day}
      >
        <div class="text-xs text-muted-foreground">{format(day, 'EEE')}</div>
        <div class="text-lg font-semibold">{format(day, 'd')}</div>
        {#if hasAvailability(day) && !isPast(day)}
          <div class="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1"></div>
        {/if}
      </button>
    {/each}
  </div>
</div>
```

### Time Slot Grid Component

```svelte
<!-- SlotGrid.svelte -->
<script lang="ts">
  import { Button } from '$lib/components/ui/button';

  interface TimeSlot {
    start: Date;
    end: Date;
    display: string;
  }

  let {
    slots,
    selectedSlot = $bindable<TimeSlot | null>(null),
    isLoading = false,
  }: {
    slots: TimeSlot[];
    selectedSlot: TimeSlot | null;
    isLoading: boolean;
  } = $props();

  // Group slots by time of day
  let groupedSlots = $derived(() => {
    const morning: TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];
    const evening: TimeSlot[] = [];

    for (const slot of slots) {
      const hour = slot.start.getHours();
      if (hour < 12) morning.push(slot);
      else if (hour < 17) afternoon.push(slot);
      else evening.push(slot);
    }

    return { morning, afternoon, evening };
  });
</script>

{#if isLoading}
  <div class="grid grid-cols-3 gap-2">
    {#each Array(9) as _}
      <div class="h-10 bg-muted animate-pulse rounded"></div>
    {/each}
  </div>
{:else if slots.length === 0}
  <p class="text-muted-foreground text-center py-8">
    No available times for this day. Try another date.
  </p>
{:else}
  <div class="space-y-6">
    {#if groupedSlots().morning.length > 0}
      <div>
        <h4 class="text-sm font-medium text-muted-foreground mb-2">Morning</h4>
        <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {#each groupedSlots().morning as slot}
            <Button
              variant={selectedSlot?.start.getTime() === slot.start.getTime() ? 'default' : 'outline'}
              size="sm"
              onclick={() => selectedSlot = slot}
            >
              {slot.display}
            </Button>
          {/each}
        </div>
      </div>
    {/if}

    {#if groupedSlots().afternoon.length > 0}
      <div>
        <h4 class="text-sm font-medium text-muted-foreground mb-2">Afternoon</h4>
        <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {#each groupedSlots().afternoon as slot}
            <Button
              variant={selectedSlot?.start.getTime() === slot.start.getTime() ? 'default' : 'outline'}
              size="sm"
              onclick={() => selectedSlot = slot}
            >
              {slot.display}
            </Button>
          {/each}
        </div>
      </div>
    {/if}

    {#if groupedSlots().evening.length > 0}
      <div>
        <h4 class="text-sm font-medium text-muted-foreground mb-2">Evening</h4>
        <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {#each groupedSlots().evening as slot}
            <Button
              variant={selectedSlot?.start.getTime() === slot.start.getTime() ? 'default' : 'outline'}
              size="sm"
              onclick={() => selectedSlot = slot}
            >
              {slot.display}
            </Button>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}
```

### Booking Progress Indicator

```svelte
<!-- BookingProgress.svelte -->
<script lang="ts">
  let { steps, currentStep }: { steps: string[]; currentStep: number } = $props();
</script>

<div class="mb-8">
  <div class="flex items-center justify-between">
    {#each steps as step, i}
      <div class="flex items-center">
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
            {i + 1 < currentStep ? 'bg-primary text-primary-foreground' : ''}
            {i + 1 === currentStep ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : ''}
            {i + 1 > currentStep ? 'bg-muted text-muted-foreground' : ''}
          "
        >
          {#if i + 1 < currentStep}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          {:else}
            {i + 1}
          {/if}
        </div>
        {#if i < steps.length - 1}
          <div
            class="w-12 sm:w-24 h-1 mx-2
              {i + 1 < currentStep ? 'bg-primary' : 'bg-muted'}
            "
          ></div>
        {/if}
      </div>
    {/each}
  </div>
  <div class="flex justify-between mt-2 text-xs sm:text-sm text-muted-foreground">
    {#each steps as step}
      <span class="w-8 sm:w-auto text-center">{step}</span>
    {/each}
  </div>
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| moment.js | date-fns v4 | 2025 | 80% smaller bundle, tree-shakeable |
| UUID v4 for tokens | nanoid | 2023+ | Shorter, URL-safe, same security |
| Vuex/Redux for wizard | Svelte 5 $state | 2024 | No external state library needed |
| Pre-computed availability table | Query-time calculation | N/A | Simpler schema, flexible durations |
| Pessimistic row locks | Optimistic version column | Standard | Better UX, no blocking |

**Deprecated/outdated:**
- `moment.js` - Use date-fns, much smaller
- `date-fns-tz` for date-fns v4 - Use `@date-fns/utc` which integrates better
- Svelte stores for form state - Use $state rune in Svelte 5
- Manual ICS string building - Use `ics` library

## Risks and Mitigations

### Risk 1: @date-fns/utc Compatibility

**Risk:** @date-fns/utc is relatively new, may have edge cases
**Likelihood:** LOW
**Impact:** MEDIUM (date display bugs)
**Mitigation:** Test thoroughly with DST transitions, fall back to date-fns-tz if issues

### Risk 2: Drizzle time Column Type

**Risk:** Drizzle's `time` column type may have quirks with PostgreSQL
**Likelihood:** MEDIUM
**Impact:** LOW (can use `text` as fallback)
**Mitigation:** Test schedule storage early, use text('09:00') format if `time` has issues

### Risk 3: High-Traffic Slot Conflicts

**Risk:** Popular time slots may have many conflicts during demo
**Likelihood:** LOW (demo scale, not production)
**Impact:** LOW (handled gracefully with error message)
**Mitigation:** Clear error messaging, suggest alternative slots

## Open Questions

1. **Email confirmation in Phase 3 or 4?**
   - Context says "basic email for demo" but Phase 5 builds full notification system
   - Recommendation: Phase 3 creates the email content, stores it, but actual sending is Phase 5. Show email content in confirmation page for demo.

2. **Staff schedule data entry**
   - How does schedule data get into database?
   - Recommendation: Seed script for demo, admin UI is post-demo feature

3. **24-hour cancellation enforcement**
   - Context says "soft-enforced for demo"
   - Recommendation: Show warning message but allow cancellation, track policy violation flag for future use

## Sources

### Primary (HIGH confidence)
- [Drizzle ORM Update Documentation](https://orm.drizzle.team/docs/update) - .returning() syntax
- [Drizzle ORM Transactions](https://orm.drizzle.team/docs/transactions) - Transaction patterns
- [date-fns Documentation](https://date-fns.org/) - Date manipulation
- [@date-fns/utc GitHub](https://github.com/date-fns/utc) - UTC handling
- [nanoid GitHub](https://github.com/ai/nanoid) - Token generation
- [ics npm](https://www.npmjs.com/package/ics) - ICS file generation
- [shadcn-svelte Calendar](https://shadcn-svelte.com/docs/components/calendar) - Calendar component docs

### Secondary (MEDIUM confidence)
- [PostgreSQL Optimistic Locking Pattern](https://reintech.io/blog/implementing-optimistic-locking-postgresql) - Version column approach
- [Booking System Tutorial](https://encore.dev/docs/go/tutorials/booking-system) - Availability schema patterns
- [SvelteKit Timezone Handling](https://github.com/sveltejs/kit/issues/13696) - Community patterns

### Tertiary (LOW confidence)
- WebSearch results for Svelte 5 multi-step forms
- WebSearch results for availability calculation algorithms

## Metadata

**Confidence breakdown:**
- Availability calculation: HIGH - Standard algorithm, verified patterns
- Optimistic locking: HIGH - Drizzle docs verify .returning() support
- Timezone handling: MEDIUM - @date-fns/utc is newer, needs testing
- Wizard UX: HIGH - Svelte 5 $state is well-documented
- Schema design: HIGH - Based on existing Phase 2 patterns

**Research date:** 2026-01-21
**Valid until:** 2026-02-21 (30 days - core libraries are stable)
