// Booking wizard components
export { default as BookingProgress } from './BookingProgress.svelte';
export { default as ServiceStep } from './ServiceStep.svelte';
export { default as StylistStep } from './StylistStep.svelte';
export { default as DateTimeStep } from './DateTimeStep.svelte';
export { default as ConfirmStep } from './ConfirmStep.svelte';
export { default as PaymentStep } from './PaymentStep.svelte';

// Supporting components
export { default as WeekView } from './WeekView.svelte';
export { default as SlotGrid } from './SlotGrid.svelte';

// Re-export TimeSlot type for convenience
export type { TimeSlot } from './SlotGrid.svelte';
