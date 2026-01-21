/**
 * Seed script for demo data - staff schedules and sample appointments
 *
 * Run with: npx tsx packages/db/scripts/seed.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import {
  staff,
  staffSchedule,
  appointments,
  services,
} from '../src/schema/index.js';
import { nanoid } from 'nanoid';

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.log('DATABASE_URL not set - skipping seed');
  process.exit(0);
}

const client = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle({ client });

// Schedule templates
const WEEKDAY_SCHEDULE = { startTime: '09:00', endTime: '18:00' }; // Mon-Fri
const SATURDAY_SCHEDULE = { startTime: '09:00', endTime: '16:00' }; // Saturday
// Sunday is closed (no entry)

async function seedStaffSchedules() {
  console.log('Seeding staff schedules...');

  // Get all active staff
  const staffMembers = await db.select().from(staff).where(eq(staff.isActive, true));

  if (staffMembers.length === 0) {
    console.log('  No active staff found - run staff seed first');
    return [];
  }

  const insertedSchedules: string[] = [];

  for (const member of staffMembers) {
    console.log(`  Creating schedule for ${member.displayName}...`);

    // Monday through Friday (weekday 1-5)
    for (let weekday = 1; weekday <= 5; weekday++) {
      try {
        await db
          .insert(staffSchedule)
          .values({
            staffId: member.id,
            weekday,
            startTime: WEEKDAY_SCHEDULE.startTime,
            endTime: WEEKDAY_SCHEDULE.endTime,
            isActive: true,
          })
          .onConflictDoNothing();
        insertedSchedules.push(`${member.displayName} - weekday ${weekday}`);
      } catch (e) {
        // Unique constraint violation - schedule already exists
      }
    }

    // Saturday (weekday 6)
    try {
      await db
        .insert(staffSchedule)
        .values({
          staffId: member.id,
          weekday: 6,
          startTime: SATURDAY_SCHEDULE.startTime,
          endTime: SATURDAY_SCHEDULE.endTime,
          isActive: true,
        })
        .onConflictDoNothing();
      insertedSchedules.push(`${member.displayName} - Saturday`);
    } catch (e) {
      // Unique constraint violation
    }

    // Sunday (weekday 0) - explicitly closed (isActive: false)
    try {
      await db
        .insert(staffSchedule)
        .values({
          staffId: member.id,
          weekday: 0,
          startTime: '00:00',
          endTime: '00:00',
          isActive: false,
        })
        .onConflictDoNothing();
      insertedSchedules.push(`${member.displayName} - Sunday (closed)`);
    } catch (e) {
      // Unique constraint violation
    }
  }

  console.log(`  Inserted/skipped ${insertedSchedules.length} schedule entries`);
  return insertedSchedules;
}

async function seedSampleAppointments() {
  console.log('Seeding sample appointments...');

  // Get first active staff and service for demo appointments
  const [firstStaff] = await db.select().from(staff).where(eq(staff.isActive, true)).limit(1);
  const [firstService] = await db.select().from(services).where(eq(services.isActive, true)).limit(1);

  if (!firstStaff || !firstService) {
    console.log('  No staff or services found - skipping sample appointments');
    return [];
  }

  const insertedAppointments: string[] = [];

  // Create a confirmed appointment for tomorrow at 10:00 AM
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setMinutes(tomorrowEnd.getMinutes() + firstService.durationMinutes);

  try {
    const [confirmedAppt] = await db
      .insert(appointments)
      .values({
        staffId: firstStaff.id,
        serviceId: firstService.id,
        startTime: tomorrow,
        endTime: tomorrowEnd,
        status: 'confirmed',
        customerName: 'Demo Customer',
        customerEmail: 'demo@example.com',
        customerPhone: '555-0100',
        cancelToken: nanoid(),
      })
      .onConflictDoNothing()
      .returning({ id: appointments.id });

    if (confirmedAppt) {
      insertedAppointments.push(`Confirmed: ${tomorrow.toISOString()}`);
      console.log(`  Created confirmed appointment for ${tomorrow.toDateString()} at 10:00 AM`);
    }
  } catch (e) {
    console.log('  Sample appointment already exists or error:', e);
  }

  // Create a cancelled appointment for day after tomorrow at 2:00 PM
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(14, 0, 0, 0);

  const dayAfterEnd = new Date(dayAfter);
  dayAfterEnd.setMinutes(dayAfterEnd.getMinutes() + firstService.durationMinutes);

  try {
    const [cancelledAppt] = await db
      .insert(appointments)
      .values({
        staffId: firstStaff.id,
        serviceId: firstService.id,
        startTime: dayAfter,
        endTime: dayAfterEnd,
        status: 'cancelled',
        customerName: 'Cancelled Customer',
        customerEmail: 'cancelled@example.com',
        cancelToken: nanoid(),
        cancelledAt: new Date(),
      })
      .onConflictDoNothing()
      .returning({ id: appointments.id });

    if (cancelledAppt) {
      insertedAppointments.push(`Cancelled: ${dayAfter.toISOString()}`);
      console.log(`  Created cancelled appointment for ${dayAfter.toDateString()} at 2:00 PM`);
    }
  } catch (e) {
    console.log('  Sample cancelled appointment already exists or error:', e);
  }

  console.log(`  Inserted ${insertedAppointments.length} sample appointments`);
  return insertedAppointments;
}

async function main() {
  console.log('Starting seed script...\n');

  try {
    const schedules = await seedStaffSchedules();
    console.log('');
    const appointments = await seedSampleAppointments();

    console.log('\n--- Seed Complete ---');
    console.log(`Schedules: ${schedules.length} entries`);
    console.log(`Appointments: ${appointments.length} entries`);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
