/**
 * Availability API Endpoint
 *
 * GET /api/availability?staffId=xxx&serviceId=xxx&date=YYYY-MM-DD
 *
 * Returns available time slots for a given staff member, service, and date.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateAvailableSlots } from '$lib/booking/availability';

export const GET: RequestHandler = async ({ url }) => {
  const staffId = url.searchParams.get('staffId');
  const serviceId = url.searchParams.get('serviceId');
  const dateStr = url.searchParams.get('date'); // YYYY-MM-DD format

  // Validate required params
  if (!staffId || !serviceId || !dateStr) {
    return json(
      { error: 'Missing required parameters: staffId, serviceId, date' },
      { status: 400 }
    );
  }

  // Validate date format
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return json(
      { error: 'Invalid date format. Use YYYY-MM-DD.' },
      { status: 400 }
    );
  }

  // Check if DATABASE_URL is configured
  if (!process.env.DATABASE_URL) {
    return json({ slots: [], message: 'Database not configured' });
  }

  try {
    // Dynamically import to avoid errors when DATABASE_URL is not set
    const { db, staffSchedule, services, appointments } = await import('@repo/db');
    const { eq, and, gte, lt } = await import('drizzle-orm');

    // Get weekday (0-6, Sunday-Saturday)
    const weekday = date.getDay();

    // Query staffSchedule for this staffId + weekday + isActive=true
    const schedule = await db.query.staffSchedule.findFirst({
      where: and(
        eq(staffSchedule.staffId, staffId),
        eq(staffSchedule.weekday, weekday),
        eq(staffSchedule.isActive, true)
      ),
    });

    if (!schedule) {
      return json({
        slots: [],
        message: 'Stylist not available this day',
      });
    }

    // Query service for durationMinutes
    const service = await db.query.services.findFirst({
      where: eq(services.id, serviceId),
    });

    if (!service) {
      return json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Query appointments for this staffId on this date with status='confirmed'
    // Create day boundaries
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const existingBookings = await db.query.appointments.findMany({
      where: and(
        eq(appointments.staffId, staffId),
        gte(appointments.startTime, dayStart),
        lt(appointments.startTime, dayEnd),
        eq(appointments.status, 'confirmed')
      ),
    });

    // Call generateAvailableSlots
    const slots = generateAvailableSlots(
      date,
      { startTime: schedule.startTime, endTime: schedule.endTime },
      existingBookings.map(b => ({
        startTime: b.startTime,
        endTime: b.endTime,
      })),
      service.durationMinutes
    );

    return json({ slots });
  } catch (error) {
    console.error('Failed to fetch availability:', error);
    return json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
};
