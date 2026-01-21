<script lang="ts">
  /**
   * Booking Wizard Page
   *
   * Multi-step booking flow: Service -> Stylist -> Date/Time -> Confirm -> Payment
   * Uses $state for step management and component bindings for data collection.
   */

  import { goto } from '$app/navigation';
  import {
    BookingProgress,
    ServiceStep,
    StylistStep,
    DateTimeStep,
    ConfirmStep,
    PaymentStep,
  } from '$lib/components/booking';
  import type { TimeSlot } from '$lib/components/booking';
  import { Button } from '$lib/components/ui/button';

  let { data } = $props();

  const STEPS = ['Service', 'Stylist', 'Date & Time', 'Confirm', 'Payment'];

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
    paymentMethod: 'pay_at_salon' as 'pay_at_salon' | 'square',
  });
  let isSubmitting = $state(false);
  let error = $state<string | null>(null);

  // Payment data loaded when staff is selected
  interface PaymentMethod {
    methodType: 'venmo' | 'cashapp' | 'zelle' | 'cash';
    handle: string | null;
    displayName: string | null;
  }
  let staffPaymentMethods = $state<PaymentMethod[]>([]);
  let hasSquare = $state(false);
  let loadingPaymentData = $state(false);

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

  // Check if service requires deposit
  let depositRequired = $derived(selectedService?.depositRequired ?? false);
  let depositAmountCents = $derived(selectedService?.depositAmountCents ?? null);

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
      case 5:
        // For deposit-required services, must select square payment (if available)
        if (depositRequired && !hasSquare) return false;
        if (depositRequired) return booking.paymentMethod === 'square';
        return !!booking.paymentMethod;
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

  async function goNext() {
    if (currentStep < 5 && canProceed()) {
      // If moving to payment step, load payment data for the selected staff
      if (currentStep === 4 && booking.staffId && booking.staffId !== 'any') {
        await loadPaymentData(booking.staffId);
      }
      currentStep++;
      error = null;
    }
  }

  async function loadPaymentData(staffId: string) {
    loadingPaymentData = true;
    try {
      const response = await fetch(`/api/staff/${staffId}/payment-methods`);
      if (response.ok) {
        const result = await response.json();
        staffPaymentMethods = result.paymentMethods;
        hasSquare = result.hasSquare;

        // If deposit required and square available, auto-select square
        if (depositRequired && hasSquare) {
          booking.paymentMethod = 'square';
        }
      }
    } catch (err) {
      console.error('Failed to load payment methods:', err);
      // Continue anyway, will just not show payment methods
    } finally {
      loadingPaymentData = false;
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
        // If Square payment selected, create payment link and redirect
        if (booking.paymentMethod === 'square') {
          const linkResponse = await fetch('/api/payments/create-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              appointmentId: result.appointmentId,
              staffId: booking.staffId,
              serviceName: selectedService?.name,
              amountCents: selectedService?.depositAmountCents ?? selectedService?.priceMin,
            }),
          });
          const linkResult = await linkResponse.json();
          if (linkResult.paymentUrl) {
            window.location.href = linkResult.paymentUrl;
            return;
          }
          // If payment link creation fails, still redirect to confirmation
          // User can pay later or try again
        }
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
      />
    {:else if currentStep === 5}
      {#if loadingPaymentData}
        <div class="text-center py-12">
          <div class="w-8 h-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p class="text-muted-foreground mt-4">Loading payment options...</p>
        </div>
      {:else}
        <PaymentStep
          {staffPaymentMethods}
          {hasSquare}
          {depositRequired}
          {depositAmountCents}
          serviceName={selectedService?.name ?? ''}
          bind:selectedMethod={booking.paymentMethod}
        />
      {/if}
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

      {#if currentStep < 5}
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
      {:else if currentStep === 5}
        <Button
          onclick={handleConfirm}
          disabled={!canProceed() || isSubmitting}
        >
          {#if isSubmitting}
            <div class="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            Processing...
          {:else if booking.paymentMethod === 'square'}
            Continue to Payment
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
          {:else}
            Complete Booking
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 ml-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          {/if}
        </Button>
      {/if}
    </div>
  </div>
</div>
