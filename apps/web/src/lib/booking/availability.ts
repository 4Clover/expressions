/**
 * Availability calculation library
 *
 * Calculates available time slots based on staff schedules and existing bookings.
 * Uses local time for slot generation (salon times are local, not UTC).
 */

import { addMinutes, isBefore, isAfter, format, startOfDay, addDays } from 'date-fns';

/**
 * Represents an available time slot for booking
 */
export interface TimeSlot {
  start: Date;
  end: Date;
  display: string; // "2:30 PM"
}

/**
 * Represents an existing booking that occupies time
 */
interface Booking {
  startTime: Date;
  endTime: Date;
}

/**
 * Staff schedule for a specific weekday
 */
interface Schedule {
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
}

/**
 * Generates available time slots for a given date based on schedule and existing bookings.
 *
 * Algorithm:
 * 1. Parse schedule times, create slot boundaries for the target date
 * 2. Generate potential slots at 30-minute intervals (configurable)
 * 3. Skip slots in the past (compare against now)
 * 4. Skip slots where service duration exceeds schedule end
 * 5. Skip slots that overlap with existing bookings
 * 6. Return remaining available slots with display string
 *
 * @param date - The target date for availability
 * @param schedule - Staff's working hours for this day
 * @param existingBookings - Appointments already booked for this staff/date
 * @param serviceDuration - Duration of the service in minutes
 * @param slotGranularity - Interval between slot start times (default: 30 minutes)
 * @returns Array of available time slots
 */
export function generateAvailableSlots(
  date: Date,
  schedule: Schedule,
  existingBookings: Booking[],
  serviceDuration: number,
  slotGranularity: number = 30
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  // Parse schedule times for the target date
  const startParts = schedule.startTime.split(':').map(Number);
  const endParts = schedule.endTime.split(':').map(Number);
  const startHour = startParts[0] ?? 0;
  const startMin = startParts[1] ?? 0;
  const endHour = endParts[0] ?? 0;
  const endMin = endParts[1] ?? 0;

  // Create day boundaries in local time
  const dayStart = startOfDay(date);
  const scheduleStart = new Date(dayStart);
  scheduleStart.setHours(startHour, startMin, 0, 0);

  const scheduleEnd = new Date(dayStart);
  scheduleEnd.setHours(endHour, endMin, 0, 0);

  const now = new Date();

  // Generate slots at granularity intervals
  let slotStart = new Date(scheduleStart);

  while (true) {
    const slotEnd = addMinutes(slotStart, serviceDuration);

    // Stop if slot would exceed working hours
    if (isAfter(slotEnd, scheduleEnd)) break;

    // Skip past slots
    if (isBefore(slotStart, now)) {
      slotStart = addMinutes(slotStart, slotGranularity);
      continue;
    }

    // Check for booking conflicts
    // A conflict exists if the booking overlaps with the proposed slot
    const hasConflict = existingBookings.some(booking => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      // Overlap: slot starts before booking ends AND slot ends after booking starts
      return isBefore(bookingStart, slotEnd) && isAfter(bookingEnd, slotStart);
    });

    if (!hasConflict) {
      slots.push({
        start: new Date(slotStart),
        end: new Date(slotEnd),
        display: format(slotStart, 'h:mm a'),
      });
    }

    slotStart = addMinutes(slotStart, slotGranularity);
  }

  return slots;
}

/**
 * Gets dates within a week that have at least one available slot.
 *
 * This is a utility function for the WeekView component to indicate
 * which days have availability.
 *
 * @param staffId - The staff member's ID
 * @param serviceId - The service ID (for duration)
 * @param weekStart - Start of the week to check
 * @param getScheduleForDate - Function to get schedule for a specific date
 * @param getBookingsForDate - Function to get bookings for a specific date
 * @param serviceDuration - Service duration in minutes
 * @returns Array of dates with availability
 */
export async function getAvailableDatesForWeek(
  weekStart: Date,
  getScheduleForDate: (date: Date) => Promise<Schedule | null>,
  getBookingsForDate: (date: Date) => Promise<Booking[]>,
  serviceDuration: number
): Promise<Date[]> {
  const availableDates: Date[] = [];

  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    const schedule = await getScheduleForDate(date);

    if (!schedule) continue;

    const bookings = await getBookingsForDate(date);
    const slots = generateAvailableSlots(date, schedule, bookings, serviceDuration);

    if (slots.length > 0) {
      availableDates.push(date);
    }
  }

  return availableDates;
}
