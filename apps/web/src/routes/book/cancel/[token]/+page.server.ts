/**
 * Cancel page server-side data loading
 *
 * Loads appointment by cancel token for display and cancellation.
 */

import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
  const { token } = params;

  // Dynamic import to handle missing DATABASE_URL gracefully
  const { db, appointments } = await import('@repo/db');
  const { eq } = await import('drizzle-orm');

  // Query appointment by cancelToken with staff and service details
  const appointment = await db.query.appointments.findFirst({
    where: eq(appointments.cancelToken, token),
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

  // Return appointment details
  return {
    appointment: {
      id: appointment.id,
      status: appointment.status,
      startTime: appointment.startTime.toISOString(),
      endTime: appointment.endTime.toISOString(),
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      customerPhone: appointment.customerPhone,
      cancelledAt: appointment.cancelledAt?.toISOString() ?? null,
      depositRequired: appointment.depositRequired,
      depositAmount: appointment.depositAmount,
    },
    staff: {
      id: appointment.staff.id,
      name: appointment.staff.displayName,
    },
    service: {
      id: appointment.service.id,
      name: appointment.service.name,
      durationMinutes: appointment.service.durationMinutes,
      priceType: appointment.service.priceType,
      priceMin: appointment.service.priceMin,
      priceMax: appointment.service.priceMax,
    },
    token,
  };
};
