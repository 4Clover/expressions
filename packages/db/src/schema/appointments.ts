import { pgTable, pgPolicy, pgEnum, uuid, text, integer, boolean, timestamp, unique } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { anonRole, authenticatedRole } from 'drizzle-orm/supabase';
import { staff } from './staff.js';
import { services } from './services.js';

// Appointment status enum
export const appointmentStatusEnum = pgEnum('appointment_status', [
  'pending',    // Created but not confirmed (future: awaiting deposit)
  'confirmed',  // Booking complete
  'cancelled',  // Cancelled by customer
  'completed',  // Appointment happened
  'no_show',    // Customer didn't show
]);

// Staff weekly schedule (which days/hours they work)
export const staffSchedule = pgTable('staff_schedule', {
  id: uuid('id').primaryKey().defaultRandom(),
  staffId: uuid('staff_id').notNull().references(() => staff.id),
  weekday: integer('weekday').notNull(), // 0=Sunday, 6=Saturday
  startTime: text('start_time').notNull(), // Format: "09:00" - text per RESEARCH (Drizzle time quirks)
  endTime: text('end_time').notNull(), // Format: "17:00"
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique().on(table.staffId, table.weekday),
  pgPolicy('public can view staff schedule', {
    for: 'select',
    to: [anonRole, authenticatedRole],
    using: sql`${table.isActive} = true`,
  }),
]);

// Appointments table with optimistic locking
export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  staffId: uuid('staff_id').notNull().references(() => staff.id),
  serviceId: uuid('service_id').notNull().references(() => services.id),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  status: appointmentStatusEnum('status').notNull().default('confirmed'),
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
}, () => [
  // Public can view own appointments by cancelToken
  pgPolicy('public can view own appointments', {
    for: 'select',
    to: [anonRole, authenticatedRole],
    using: sql`true`, // Filter by cancelToken in queries
  }),
  // Authenticated can manage appointments
  pgPolicy('authenticated can manage appointments', {
    for: 'all',
    to: authenticatedRole,
    using: sql`true`,
  }),
]);

// Drizzle relations for eager loading
export const staffScheduleRelations = relations(staffSchedule, ({ one }) => ({
  staff: one(staff, {
    fields: [staffSchedule.staffId],
    references: [staff.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  staff: one(staff, {
    fields: [appointments.staffId],
    references: [staff.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
}));
