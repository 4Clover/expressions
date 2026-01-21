<script lang="ts">
  /**
   * Booking Wizard Page
   *
   * Multi-step booking flow: Service -> Stylist -> Date/Time -> Confirm
   * Uses $state for step management and component bindings for data collection.
   */

  import { goto } from '$app/navigation';
  import {
    BookingProgress,
    ServiceStep,
    StylistStep,
    DateTimeStep,
    ConfirmStep,
  } from '$lib/components/booking';
  import type { TimeSlot } from '$lib/components/booking';
  import { Button } from '$lib/components/ui/button';

  let { data } = $props();

  const STEPS = ['Service', 'Stylist', 'Date & Time', 'Confirm'];

  // Wizard state
  let currentStep = $state(1);
  let booking = $state({
    serviceId: null as string | null,
    staffId: null as string | null,
    date: null as Date | null,
    timeSlot: null as TimeSlot | null,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });
  let isSubmitting = $state(false);
  let error = $state<string | null>(null);

  // Get selected service/staff objects for display
  let selectedService = $derived(
    data.services.find(s => s.id === booking.serviceId) ?? null
  );
  let selectedStaff = $derived(() => {
    if (booking.staffId === 'any') {
      return { id: 'any', displayName: 'Any Available Stylist', photoUrl: null };
    }
    return data.staff.find(s => s.id === booking.staffId) ?? null;
  });

  // Check if current step allows proceeding
  function canProceed(): boolean {
    switch (currentStep) {
      case 1:
        return !!booking.serviceId;
      case 2:
        return !!booking.staffId;
      case 3:
        return !!booking.date && !!booking.timeSlot;
      case 4:
        return booking.customerEmail.length > 0 && booking.customerName.length >= 2;
      default:
        return false;
    }
  }

  function goBack() {
    if (currentStep > 1) {
      currentStep--;
      error = null;
    }
  }

  function goNext() {
    if (currentStep < 4 && canProceed()) {
      currentStep++;
      error = null;
    }
  }

  async function handleConfirm() {
    if (!booking.timeSlot || !booking.serviceId || !booking.staffId) {
      error = 'Please complete all booking steps';
      return;
    }

    isSubmitting = true;
    error = null;

    try {
      const response = await fetch('/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: booking.serviceId,
          staffId: booking.staffId,
          startTime: booking.timeSlot.start.toISOString(),
          endTime: booking.timeSlot.end.toISOString(),
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          customerPhone: booking.customerPhone || undefined,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Redirect to confirmation page
        await goto(`/book/confirmation/${result.appointmentId}`);
      } else if (response.status === 409) {
        // Slot conflict - allow retry
        error = result.message || 'This slot was just booked. Please select another time.';
        // Go back to date/time step to pick another slot
        currentStep = 3;
        booking.timeSlot = null;
      } else {
        error = result.message || 'Failed to create booking. Please try again.';
      }
    } catch (err) {
      console.error('Booking error:', err);
      error = 'An unexpected error occurred. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>Book Appointment | Expressions Hair Designs</title>
  <meta name="description" content="Book your hair appointment online at Expressions Hair Designs" />
</svelte:head>

<div class="min-h-screen bg-background">
  <div class="max-w-2xl mx-auto px-4 py-8 sm:py-12">
    <!-- Progress indicator -->
    <BookingProgress steps={STEPS} {currentStep} />

    <!-- Error message -->
    {#if error}
      <div class="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
        {error}
      </div>
    {/if}

    <!-- Step content -->
    {#if currentStep === 1}
      <ServiceStep
        services={data.services}
        categories={data.categories}
        bind:selectedId={booking.serviceId}
      />
    {:else if currentStep === 2}
      <StylistStep
        staff={data.staff}
        staffServices={data.staffServices}
        serviceId={booking.serviceId ?? ''}
        bind:selectedId={booking.staffId}
      />
    {:else if currentStep === 3}
      <DateTimeStep
        staffId={booking.staffId ?? ''}
        serviceId={booking.serviceId ?? ''}
        bind:date={booking.date}
        bind:timeSlot={booking.timeSlot}
      />
    {:else if currentStep === 4}
      <ConfirmStep
        service={selectedService}
        staff={selectedStaff()}
        date={booking.date}
        timeSlot={booking.timeSlot}
        bind:customerName={booking.customerName}
        bind:customerEmail={booking.customerEmail}
        bind:customerPhone={booking.customerPhone}
        onConfirm={handleConfirm}
        {isSubmitting}
      />
    {/if}

    <!-- Navigation buttons -->
    <div class="flex justify-between mt-8 pt-6 border-t border-border">
      {#if currentStep > 1}
        <Button
          variant="outline"
          onclick={goBack}
          disabled={isSubmitting}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>
      {:else}
        <div></div>
      {/if}

      {#if currentStep < 4}
        <Button
          onclick={goNext}
          disabled={!canProceed()}
        >
          Continue
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 ml-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      {/if}
    </div>
  </div>
</div>
