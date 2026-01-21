import { pgTable, pgPolicy, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { anonRole, authenticatedRole } from 'drizzle-orm/supabase';
import { profiles } from './profiles';
import { staffServices } from './services';

export const staff = pgTable('staff', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id),
  displayName: text('display_name').notNull(),
  bio: text('bio'),
  photoUrl: text('photo_url'),
  specialties: text('specialties').array(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  pgPolicy('public can view active staff', {
    for: 'select',
    to: [anonRole, authenticatedRole],
    using: sql`${table.isActive} = true`,
  }),
]);

// Drizzle relations v2 for eager loading
export const staffRelations = relations(staff, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [staff.profileId],
    references: [profiles.id],
  }),
  staffServices: many(staffServices),
}));
