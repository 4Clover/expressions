/**
 * ICS Calendar File Generation
 *
 * Generates .ics files for appointment calendar integration.
 * Uses the 'ics' library for RFC 5545 compliance.
 */

import { createEvent, type EventAttributes } from 'ics';

export interface AppointmentDetails {
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
}

/**
 * Generate ICS calendar content for an appointment
 *
 * @param appointment - Appointment details
 * @returns ICS file content as string
 * @throws Error if event creation fails
 */
export function generateICS(appointment: AppointmentDetails): string {
  const start = appointment.startTime;
  const end = appointment.endTime;

  const event: EventAttributes = {
    title: appointment.title,
    description: appointment.description,
    location: appointment.location,
    start: [
      start.getFullYear(),
      start.getMonth() + 1, // ics uses 1-indexed months
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
    status: 'CONFIRMED',
    busyStatus: 'BUSY',
    organizer: {
      name: 'Expressions Hair Designs',
      email: 'appointments@expressions-salon.com',
    },
    productId: 'expressions-salon/booking',
  };

  const { value, error } = createEvent(event);

  if (error || !value) {
    throw new Error(`Failed to generate calendar event: ${error}`);
  }

  return value;
}

/**
 * Format duration in human-readable form
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }
  return `${hours} hr ${remainingMinutes} min`;
}
