/**
 * Booking POST handler
 *
 * Creates appointments with optimistic locking to prevent double-booking.
 * Handles "Any Available" stylist selection by finding first available staff.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { nanoid } from 'nanoid';

interface BookingRequest {
  serviceId: string;
  staffId: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

export const POST: RequestHandler = async ({ request }) => {
  let data: BookingRequest;

  try {
    data = await request.json();
  } catch {
    return json(
      { error: 'validation', message: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  // Validate required fields
  if (!data.serviceId || !data.staffId || !data.startTime || !data.endTime) {
    return json(
      { error: 'validation', message: 'Missing required fields: serviceId, staffId, startTime, endTime' },
      { status: 400 }
    );
  }

  if (!data.customerName || data.customerName.length < 2) {
    return json(
      { error: 'validation', message: 'Customer name must be at least 2 characters' },
      { status: 400 }
    );
  }

  if (!data.customerEmail || !data.customerEmail.includes('@')) {
    return json(
      { error: 'validation', message: 'Valid email address required' },
      { status: 400 }
    );
  }

  // Parse dates
  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);

  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    return json(
      { error: 'validation', message: 'Invalid date format for startTime or endTime' },
      { status: 400 }
    );
  }

  // Check if DATABASE_URL is configured
  if (!process.env.DATABASE_URL) {
    return json(
      { error: 'server', message: 'Database not configured' },
      { status: 500 }
    );
  }

  try {
    // Dynamic import to handle missing DATABASE_URL gracefully
    const { db, appointments, staffSchedule, staffServices } = await import('@repo/db');
    const { eq, and, lt, gte, inArray } = await import('drizzle-orm');

    // Handle "Any Available" staffId
    let finalStaffId = data.staffId;

    if (data.staffId === 'any') {
      // Find all staff who offer this service
      const qualifiedStaff = await db.query.staffServices.findMany({
        where: and(
          eq(staffServices.serviceId, data.serviceId),
          eq(staffServices.isAvailable, true)
        ),
      });

      if (qualifiedStaff.length === 0) {
        return json(
          { error: 'validation', message: 'No stylists available for this service' },
          { status: 400 }
        );
      }

      const staffIds = qualifiedStaff.map(ss => ss.staffId);
      const weekday = startTime.getDay();

      // Find staff who work on this day
      const workingSchedules = await db.query.staffSchedule.findMany({
        where: and(
          inArray(staffSchedule.staffId, staffIds),
          eq(staffSchedule.weekday, weekday),
          eq(staffSchedule.isActive, true)
        ),
      });

      if (workingSchedules.length === 0) {
        return json(
          { error: 'conflict', message: 'No stylists available at this time. Please select another time.' },
          { status: 409 }
        );
      }

      // Check each staff member for conflicts, pick first available
      let foundStaffId: string | null = null;

      for (const schedule of workingSchedules) {
        const conflicts = await db.query.appointments.findMany({
          where: and(
            eq(appointments.staffId, schedule.staffId),
            lt(appointments.startTime, endTime),
            gte(appointments.endTime, startTime),
            eq(appointments.status, 'confirmed')
          ),
        });

        if (conflicts.length === 0) {
          foundStaffId = schedule.staffId;
          break;
        }
      }

      if (!foundStaffId) {
        return json(
          { error: 'conflict', message: 'This slot was just booked. Please select another time.' },
          { status: 409 }
        );
      }

      finalStaffId = foundStaffId;
    }

    // Use transaction for atomic conflict check and insert
    const result = await db.transaction(async (tx) => {
      // Check for conflicts with the selected staff member
      const conflicts = await tx.query.appointments.findMany({
        where: and(
          eq(appointments.staffId, finalStaffId),
          lt(appointments.startTime, endTime),
          gte(appointments.endTime, startTime),
          eq(appointments.status, 'confirmed')
        ),
      });

      if (conflicts.length > 0) {
        return { conflict: true };
      }

      // Generate cancel token
      const cancelToken = nanoid();

      // Insert appointment
      const insertedRows = await tx
        .insert(appointments)
        .values({
          staffId: finalStaffId,
          serviceId: data.serviceId,
          startTime,
          endTime,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone || null,
          cancelToken,
          status: 'confirmed',
        })
        .returning({ id: appointments.id });

      const appointment = insertedRows[0];
      if (!appointment) {
        throw new Error('Failed to create appointment');
      }

      return { conflict: false, appointmentId: appointment.id };
    });

    if (result.conflict) {
      return json(
        { error: 'conflict', message: 'This slot was just booked. Please select another time.' },
        { status: 409 }
      );
    }

    return json(
      { success: true, appointmentId: result.appointmentId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create booking:', error);
    return json(
      { error: 'server', message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
};
