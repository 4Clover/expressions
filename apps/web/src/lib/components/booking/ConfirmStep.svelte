<script lang="ts">
  /**
   * ConfirmStep - Review and customer info for booking wizard (BOOK-04)
   *
   * Displays booking summary (service, stylist, date, time, duration, price)
   * and collects customer information (name, email, phone).
   */

  import { format } from 'date-fns';
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import PriceDisplay from "$lib/components/services/PriceDisplay.svelte";
  import { validateBookingData } from "$lib/booking/validation";
  import { cn } from "$lib/utils";

  interface Service {
    id: string;
    name: string;
    durationMinutes: number;
    priceType: "fixed" | "starting" | "range";
    priceMin: number;
    priceMax: number | null;
  }

  interface Staff {
    id: string;
    displayName: string;
    photoUrl: string | null;
  }

  interface TimeSlot {
    start: Date;
    end: Date;
    display: string;
  }

  let {
    service,
    staff,
    date,
    timeSlot,
    customerName = $bindable(""),
    customerEmail = $bindable(""),
    customerPhone = $bindable(""),
    onConfirm,
    isSubmitting = false,
    class: className,
  }: {
    service: Service | null;
    staff: Staff | null;
    date: Date | null;
    timeSlot: TimeSlot | null;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    onConfirm?: () => void;
    isSubmitting?: boolean;
    class?: string;
  } = $props();

  // Validation state
  let errors = $state<Record<string, string>>({});
  let touched = $state<Record<string, boolean>>({});

  // Check if form is valid for submission
  let isValid = $derived.by(() => {
    const result = validateBookingData({
      customerName,
      customerEmail,
      customerPhone: customerPhone || undefined,
    });
    return result.valid;
  });

  function validateField(field: string) {
    touched[field] = true;
    const result = validateBookingData({
      customerName,
      customerEmail,
      customerPhone: customerPhone || undefined,
    });
    errors = result.errors as Record<string, string>;
  }

  function formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }
    return `${hours} hr ${remainingMinutes} min`;
  }

  function handleSubmit() {
    if (!onConfirm) return;

    // Validate all fields
    touched = { customerName: true, customerEmail: true, customerPhone: true };
    const result = validateBookingData({
      customerName,
      customerEmail,
      customerPhone: customerPhone || undefined,
    });
    errors = result.errors as Record<string, string>;

    if (result.valid) {
      onConfirm();
    }
  }
</script>

<div class={cn("space-y-8", className)}>
  <div class="text-center">
    <h2 class="font-heading text-2xl font-semibold">Confirm Your Booking</h2>
    <p class="text-muted-foreground mt-1">Review details and enter your information</p>
  </div>

  <!-- Booking Summary -->
  <Card>
    <CardHeader>
      <CardTitle class="font-heading text-lg">Appointment Summary</CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <!-- Service -->
      {#if service}
        <div class="flex justify-between items-start">
          <div>
            <p class="font-medium">{service.name}</p>
            <p class="text-sm text-muted-foreground">{formatDuration(service.durationMinutes)}</p>
          </div>
          <PriceDisplay
            priceType={service.priceType}
            priceMin={service.priceMin}
            priceMax={service.priceMax}
          />
        </div>
      {/if}

      <hr class="border-border" />

      <!-- Stylist -->
      <div class="flex items-center gap-3">
        {#if staff}
          {#if staff.id === 'any'}
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <p class="font-medium">Any Available Stylist</p>
              <p class="text-sm text-muted-foreground">First available appointment</p>
            </div>
          {:else}
            {#if staff.photoUrl}
              <img
                src={staff.photoUrl}
                alt={staff.displayName}
                class="w-10 h-10 rounded-full object-cover"
              />
            {:else}
              <div class="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </div>
            {/if}
            <div>
              <p class="font-medium">{staff.displayName}</p>
              <p class="text-sm text-muted-foreground">Stylist</p>
            </div>
          {/if}
        {/if}
      </div>

      <hr class="border-border" />

      <!-- Date & Time -->
      {#if date && timeSlot}
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
          </div>
          <div>
            <p class="font-medium">{format(date, 'EEEE, MMMM d, yyyy')}</p>
            <p class="text-sm text-muted-foreground">{timeSlot.display}</p>
          </div>
        </div>
      {/if}
    </CardContent>
  </Card>

  <!-- Customer Information Form -->
  <Card>
    <CardHeader>
      <CardTitle class="font-heading text-lg">Your Information</CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <!-- Name -->
      <div class="space-y-2">
        <label for="customerName" class="text-sm font-medium">
          Name <span class="text-destructive">*</span>
        </label>
        <Input
          id="customerName"
          type="text"
          placeholder="Your full name"
          bind:value={customerName}
          onblur={() => validateField('customerName')}
          class={touched.customerName && errors.customerName ? 'border-destructive' : ''}
        />
        {#if touched.customerName && errors.customerName}
          <p class="text-sm text-destructive">{errors.customerName}</p>
        {/if}
      </div>

      <!-- Email -->
      <div class="space-y-2">
        <label for="customerEmail" class="text-sm font-medium">
          Email <span class="text-destructive">*</span>
        </label>
        <Input
          id="customerEmail"
          type="email"
          placeholder="your@email.com"
          bind:value={customerEmail}
          onblur={() => validateField('customerEmail')}
          class={touched.customerEmail && errors.customerEmail ? 'border-destructive' : ''}
        />
        {#if touched.customerEmail && errors.customerEmail}
          <p class="text-sm text-destructive">{errors.customerEmail}</p>
        {/if}
      </div>

      <!-- Phone (Optional) -->
      <div class="space-y-2">
        <label for="customerPhone" class="text-sm font-medium">
          Phone <span class="text-muted-foreground">(optional)</span>
        </label>
        <Input
          id="customerPhone"
          type="tel"
          placeholder="(555) 123-4567"
          bind:value={customerPhone}
          onblur={() => validateField('customerPhone')}
          class={touched.customerPhone && errors.customerPhone ? 'border-destructive' : ''}
        />
        {#if touched.customerPhone && errors.customerPhone}
          <p class="text-sm text-destructive">{errors.customerPhone}</p>
        {/if}
      </div>
    </CardContent>
  </Card>

  <!-- Confirm Button (only shown when onConfirm is provided) -->
  {#if onConfirm}
    <Button
      class="w-full"
      size="lg"
      disabled={!isValid || isSubmitting}
      onclick={handleSubmit}
    >
      {#if isSubmitting}
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Confirming...
      {:else}
        Confirm Booking
      {/if}
    </Button>
  {/if}
</div>
