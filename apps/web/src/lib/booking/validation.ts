/**
 * Booking validation utilities
 *
 * Validates customer info and booking-related business rules.
 */

import { isBefore, subHours } from 'date-fns';

/**
 * Customer booking data for validation
 */
export interface BookingCustomerData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string | undefined;
}

/**
 * Validation result with field-level errors
 */
export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof BookingCustomerData, string>>;
}

/**
 * Email regex pattern (RFC 5322 simplified)
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone regex pattern (allows common formats: 123-456-7890, (123) 456-7890, 1234567890)
 */
const PHONE_REGEX = /^[\d\s\-().+]+$/;

/**
 * Validates customer booking data
 *
 * @param data - Customer data to validate
 * @returns Validation result with any errors
 */
export function validateBookingData(data: BookingCustomerData): ValidationResult {
  const errors: ValidationResult['errors'] = {};

  // Name validation
  if (!data.customerName || data.customerName.trim().length < 2) {
    errors.customerName = 'Name must be at least 2 characters';
  } else if (data.customerName.trim().length > 100) {
    errors.customerName = 'Name must be less than 100 characters';
  }

  // Email validation
  if (!data.customerEmail || data.customerEmail.trim().length === 0) {
    errors.customerEmail = 'Email is required';
  } else if (!EMAIL_REGEX.test(data.customerEmail.trim())) {
    errors.customerEmail = 'Please enter a valid email address';
  }

  // Phone validation (optional but must be valid if provided)
  if (data.customerPhone && data.customerPhone.trim().length > 0) {
    const cleanPhone = data.customerPhone.trim();
    if (!PHONE_REGEX.test(cleanPhone)) {
      errors.customerPhone = 'Please enter a valid phone number';
    } else if (cleanPhone.replace(/\D/g, '').length < 10) {
      errors.customerPhone = 'Phone number must have at least 10 digits';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Checks if an appointment time is within the cancellation window.
 *
 * Business rule: Cancellations are allowed if > 24 hours before appointment.
 * Within 24 hours, cancellation is still technically allowed (soft-enforced)
 * but the customer should be warned.
 *
 * @param appointmentTime - The appointment start time
 * @param hoursBeforeWindow - Hours before appointment when cancellation is restricted (default: 24)
 * @returns true if cancellation is allowed without restriction
 */
export function isWithinCancellationWindow(
  appointmentTime: Date,
  hoursBeforeWindow: number = 24
): boolean {
  const now = new Date();
  const windowStart = subHours(appointmentTime, hoursBeforeWindow);

  // If we're before the window start, cancellation is freely allowed
  return isBefore(now, windowStart);
}

/**
 * Checks if an appointment time is in the future
 *
 * @param appointmentTime - The appointment start time
 * @returns true if appointment is in the future
 */
export function isAppointmentInFuture(appointmentTime: Date): boolean {
  return isAfter(appointmentTime, new Date());
}

/**
 * Helper to check if a date is after another (re-exported for convenience)
 */
function isAfter(date: Date, dateToCompare: Date): boolean {
  return date.getTime() > dateToCompare.getTime();
}
