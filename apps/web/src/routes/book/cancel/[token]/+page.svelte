<script lang="ts">
  /**
   * Cancel Appointment Page
   *
   * Allows customers to cancel their appointment via a unique link.
   * Shows appointment details, 24-hour policy warning, and confirmation step.
   */

  import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { PriceDisplay } from '$lib/components/services';
  import { isWithinCancellationWindow } from '$lib/booking/validation';
  import { format } from 'date-fns';

  let { data } = $props();

  // Local state
  let isConfirming = $state(false);
  let isCancelled = $state(false);
  let isSubmitting = $state(false);
  let error = $state<string | null>(null);

  // Derived values from data (reactive to data changes)
  let startTime = $derived(new Date(data.appointment.startTime));
  let endTime = $derived(new Date(data.appointment.endTime));

  // Check if within 24-hour window
  let isWithin24Hours = $derived(!isWithinCancellationWindow(startTime, 24));

  // Check if appointment is already cancelled on load
  $effect(() => {
    if (data.appointment.status === 'cancelled') {
      isCancelled = true;
    }
  });

  // Format price for deposit display
  function formatPrice(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  // Handle cancellation
  async function handleCancel() {
    isSubmitting = true;
    error = null;

    try {
      const response = await fetch(`/book/cancel/${data.token}`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === 'already_cancelled') {
          isCancelled = true;
        } else {
          error = result.message || 'Failed to cancel appointment';
        }
        return;
      }

      // Success - update state
      isCancelled = true;
    } catch (e) {
      error = 'An error occurred. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<svelte:head>
  <title>Cancel Appointment | Expressions Salon</title>
</svelte:head>

<div class="min-h-screen bg-background py-12 px-4">
  <div class="max-w-lg mx-auto">
    {#if isCancelled}
      <!-- Already Cancelled State -->
      <Card class="shadow-lg">
        <CardHeader class="text-center pb-2">
          <div class="mx-auto mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <svg
              class="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <CardTitle class="text-2xl">Appointment Cancelled</CardTitle>
        </CardHeader>
        <CardContent class="text-center space-y-4">
          <p class="text-muted-foreground">
            This appointment has been cancelled.
          </p>
          {#if data.appointment.cancelledAt}
            <p class="text-sm text-muted-foreground">
              Cancelled on {format(new Date(data.appointment.cancelledAt), 'MMMM d, yyyy')}
            </p>
          {/if}
          <div class="pt-4">
            <p class="text-sm mb-3">Need to book a new appointment?</p>
            <a
              href="/book"
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium
                ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                transition-all duration-[var(--transition-smooth)]
                bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg
                h-10 px-4 py-2 w-full sm:w-auto"
            >
              Book New Appointment
            </a>
          </div>
        </CardContent>
      </Card>
    {:else if isConfirming}
      <!-- Confirmation Step -->
      <Card class="shadow-lg border-destructive/20">
        <CardHeader class="text-center pb-2">
          <div class="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg
              class="w-8 h-8 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <CardTitle class="text-2xl text-destructive">Are you sure?</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          {#if error}
            <div class="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          {/if}

          <p class="text-center text-muted-foreground">
            You are about to cancel your appointment:
          </p>

          <!-- Appointment Summary -->
          <div class="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Service:</span>
              <span class="font-medium">{data.service.name}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Stylist:</span>
              <span class="font-medium">{data.staff.name}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Date:</span>
              <span class="font-medium">{format(startTime, 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Time:</span>
              <span class="font-medium">{format(startTime, 'h:mm a')}</span>
            </div>
          </div>

          <!-- Deposit warning (only shows if depositRequired && within policy window) -->
          {#if data.appointment.depositRequired && data.appointment.depositAmount && isWithin24Hours}
            <div class="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md">
              <p class="font-medium">Deposit Notice</p>
              <p>Your deposit of {formatPrice(data.appointment.depositAmount)} will be forfeited.</p>
            </div>
          {/if}

          <p class="text-center text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
        </CardContent>
        <CardFooter class="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            class="w-full sm:w-1/2"
            onclick={() => (isConfirming = false)}
            disabled={isSubmitting}
          >
            Keep Appointment
          </Button>
          <Button
            variant="destructive"
            class="w-full sm:w-1/2"
            onclick={handleCancel}
            disabled={isSubmitting}
          >
            {#if isSubmitting}
              Cancelling...
            {:else}
              Yes, Cancel
            {/if}
          </Button>
        </CardFooter>
      </Card>
    {:else}
      <!-- Active Appointment View -->
      <Card class="shadow-lg">
        <CardHeader class="text-center pb-2">
          <div class="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg
              class="w-8 h-8 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <CardTitle class="text-2xl">Cancel Your Appointment</CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- Appointment Details -->
          <div class="bg-muted/50 rounded-lg p-4 space-y-3">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-semibold text-lg">{data.service.name}</h3>
                <p class="text-muted-foreground text-sm">with {data.staff.name}</p>
              </div>
              <PriceDisplay
                priceType={data.service.priceType}
                priceMin={data.service.priceMin}
                priceMax={data.service.priceMax}
              />
            </div>
            <hr class="border-border" />
            <div class="flex items-center gap-3">
              <svg
                class="w-5 h-5 text-muted-foreground flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p class="font-medium">{format(startTime, 'EEEE, MMMM d, yyyy')}</p>
                <p class="text-muted-foreground text-sm">
                  {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                  ({data.service.durationMinutes} min)
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <svg
                class="w-5 h-5 text-muted-foreground flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <div>
                <p class="font-medium">{data.appointment.customerName}</p>
                <p class="text-muted-foreground text-sm">{data.appointment.customerEmail}</p>
              </div>
            </div>

            <!-- Deposit info (only shows if depositRequired) -->
            {#if data.appointment.depositRequired && data.appointment.depositAmount}
              <div class="flex items-center gap-3">
                <svg
                  class="w-5 h-5 text-muted-foreground flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p class="font-medium">Deposit: {formatPrice(data.appointment.depositAmount)}</p>
                  <p class="text-muted-foreground text-sm">Deposit refund policy applies</p>
                </div>
              </div>
            {/if}
          </div>

          <!-- 24-hour Policy Warning -->
          {#if isWithin24Hours}
            <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 p-4 rounded-lg">
              <div class="flex gap-3">
                <svg
                  class="w-5 h-5 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p class="font-medium">This appointment is within 24 hours</p>
                  <p class="text-sm mt-1 opacity-90">
                    Late cancellations may be subject to a fee. Please contact us if you have any concerns.
                  </p>
                </div>
              </div>
            </div>
          {/if}

          <!-- Cancel Button -->
          <Button
            variant="destructive"
            class="w-full"
            onclick={() => (isConfirming = true)}
          >
            Cancel This Appointment
          </Button>

          <!-- Reschedule Option -->
          <div class="text-center border-t border-border pt-6">
            <p class="text-muted-foreground text-sm mb-2">
              Need to reschedule instead?
            </p>
            <a
              href="/book"
              class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium
                ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                transition-all duration-[var(--transition-smooth)]
                border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5 hover:shadow-md
                h-10 px-4 py-2 w-full sm:w-auto"
            >
              Book a New Appointment
            </a>
            <p class="text-xs text-muted-foreground mt-2">
              Your current appointment will remain active until you cancel it.
            </p>
          </div>
        </CardContent>
      </Card>
    {/if}
  </div>
</div>
