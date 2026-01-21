/**
 * Cancel appointment POST endpoint
 *
 * Executes appointment cancellation by updating status to 'cancelled'.
 * 24-hour policy is displayed but soft-enforced for demo.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params }) => {
  const { token } = params;

  try {
    // Dynamic import to handle missing DATABASE_URL gracefully
    const { db, appointments } = await import('@repo/db');
    const { eq, and, ne } = await import('drizzle-orm');

    // Find appointment by cancelToken
    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.cancelToken, token),
    });

    // 404: Appointment not found
    if (!appointment) {
      return json(
        { error: 'not_found', message: 'Appointment not found' },
        { status: 404 }
      );
    }

    // 400: Already cancelled
    if (appointment.status === 'cancelled') {
      return json(
        { error: 'already_cancelled', message: 'This appointment has already been cancelled' },
        { status: 400 }
      );
    }

    // Note: 24-hour policy is NOT enforced for demo per CONTEXT.md
    // The warning is displayed on the frontend, but cancellation is always allowed

    // Update appointment status to cancelled
    const result = await db
      .update(appointments)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(appointments.cancelToken, token),
          ne(appointments.status, 'cancelled')
        )
      )
      .returning({ id: appointments.id });

    // Double-check update succeeded (optimistic locking pattern)
    if (result.length === 0) {
      // Race condition: appointment was cancelled between check and update
      return json(
        { error: 'already_cancelled', message: 'This appointment has already been cancelled' },
        { status: 400 }
      );
    }

    return json({
      success: true,
      message: 'Appointment cancelled',
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return json(
      { error: 'server', message: 'An error occurred while cancelling the appointment' },
      { status: 500 }
    );
  }
};
