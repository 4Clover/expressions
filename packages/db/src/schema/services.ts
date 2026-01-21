import { pgTable, pgPolicy, uuid, text, integer, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { anonRole, authenticatedRole } from 'drizzle-orm/supabase';
import { staff } from './staff.js';

// Price type enum: fixed price, starting-from price, or range
export const priceTypeEnum = pgEnum('price_type', ['fixed', 'starting', 'range']);

export const serviceCategories = pgTable('service_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, () => [
  pgPolicy('public can view categories', {
    for: 'select',
    to: [anonRole, authenticatedRole],
    using: sql`true`,
  }),
]);

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').notNull().references(() => serviceCategories.id),
  name: text('name').notNull(),
  description: text('description'),
  durationMinutes: integer('duration_minutes').notNull(),
  priceType: priceTypeEnum('price_type').notNull().default('fixed'),
  priceMin: integer('price_min').notNull(), // Price in cents
  priceMax: integer('price_max'), // Nullable for fixed/starting prices
  depositRequired: boolean('deposit_required').notNull().default(false),
  depositAmountCents: integer('deposit_amount_cents'), // Nullable - only set when depositRequired is true
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  pgPolicy('public can view active services', {
    for: 'select',
    to: [anonRole, authenticatedRole],
    using: sql`${table.isActive} = true`,
  }),
]);

// Junction table for per-stylist pricing
export const staffServices = pgTable('staff_services', {
  id: uuid('id').primaryKey().defaultRandom(),
  staffId: uuid('staff_id').notNull().references(() => staff.id),
  serviceId: uuid('service_id').notNull().references(() => services.id),
  customPrice: integer('custom_price'), // Nullable - use service price if null
  isAvailable: boolean('is_available').notNull().default(true),
}, (table) => [
  pgPolicy('public can view available staff services', {
    for: 'select',
    to: [anonRole, authenticatedRole],
    using: sql`${table.isAvailable} = true`,
  }),
]);

// Drizzle relations v2 for eager loading
export const serviceCategoriesRelations = relations(serviceCategories, ({ many }) => ({
  services: many(services),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  category: one(serviceCategories, {
    fields: [services.categoryId],
    references: [serviceCategories.id],
  }),
  staffServices: many(staffServices),
}));

export const staffServicesRelations = relations(staffServices, ({ one }) => ({
  staff: one(staff, {
    fields: [staffServices.staffId],
    references: [staff.id],
  }),
  service: one(services, {
    fields: [staffServices.serviceId],
    references: [services.id],
  }),
}));
