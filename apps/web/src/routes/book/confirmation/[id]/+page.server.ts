/**
 * Confirmation page server-side data loading
 *
 * Loads appointment by ID with staff and service details for confirmation display.
 */

import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
  const { id } = params;

  // Check if DATABASE_URL is configured
  if (!process.env.DATABASE_URL) {
    throw error(500, 'Database not configured');
  }

  try {
    // Dynamic import to handle missing DATABASE_URL gracefully
    const { db, appointments } = await import('@repo/db');
    const { eq } = await import('drizzle-orm');

    // Query appointment by ID with staff and service details
    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, id),
      with: {
        staff: true,
        service: true,
      },
    });

    // Return 404 if not found
    if (!appointment) {
      throw error(404, {
        message: 'Appointment not found',
      });
    }

    // Return appointment details (serialize dates for client)
    return {
      appointment: {
        id: appointment.id,
        status: appointment.status,
        startTime: appointment.startTime.toISOString(),
        endTime: appointment.endTime.toISOString(),
        customerName: appointment.customerName,
        customerEmail: appointment.customerEmail,
        customerPhone: appointment.customerPhone,
        cancelToken: appointment.cancelToken,
      },
      staff: {
        id: appointment.staff.id,
        displayName: appointment.staff.displayName,
        photoUrl: appointment.staff.photoUrl,
      },
      service: {
        id: appointment.service.id,
        name: appointment.service.name,
        durationMinutes: appointment.service.durationMinutes,
        priceType: appointment.service.priceType,
        priceMin: appointment.service.priceMin,
        priceMax: appointment.service.priceMax,
      },
    };
  } catch (err) {
    // Re-throw SvelteKit errors
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    console.error('Failed to load appointment:', err);
    throw error(500, 'Failed to load appointment details');
  }
};
