<script lang="ts">
  /**
   * Booking Confirmation Page
   *
   * Shows appointment details after successful booking with ICS download option.
   * Displays service, stylist, date/time, customer info, payment status, and cancel link.
   */

  import { format } from 'date-fns';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import PriceDisplay from '$lib/components/services/PriceDisplay.svelte';
  import { PaymentMethodDisplay } from '$lib/components/payments';
  import { generateICS, formatDuration } from '$lib/booking/ics';

  let { data } = $props();

  // Parse dates - use $derived for reactive derivation from props
  let startTime = $derived(new Date(data.appointment.startTime));
  let endTime = $derived(new Date(data.appointment.endTime));

  // Salon location (hardcoded for now, can be CMS-driven later)
  const SALON_LOCATION = 'Expressions Hair Designs, 123 Main St, City, State';

  // Payment status helpers
  let paymentPaid = $derived(data.payment?.status === 'completed');
  let paymentAmount = $derived(
    data.payment ? `$${(data.payment.amountCents / 100).toFixed(2)}` : null
  );

  /**
   * Download ICS calendar file
   */
  function downloadCalendar() {
    const icsContent = generateICS({
      title: `${data.service.name} at Expressions Hair Designs`,
      description: `Appointment with ${data.staff.displayName}\n\nBooked for: ${data.appointment.customerName}\nEmail: ${data.appointment.customerEmail}${data.appointment.customerPhone ? `\nPhone: ${data.appointment.customerPhone}` : ''}`,
      location: SALON_LOCATION,
      startTime,
      endTime,
    });

    // Create blob and trigger download
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'expressions-appointment.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
</script>

<svelte:head>
  <title>Booking Confirmed | Expressions Hair Designs</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="min-h-screen bg-background">
  <div class="max-w-2xl mx-auto px-4 py-8 sm:py-12">
    <!-- Success Header -->
    <div class="text-center mb-8">
      <div class="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
        <svg
          class="w-8 h-8 text-green-600 dark:text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h1 class="font-heading text-3xl font-semibold text-foreground">
        Booking Confirmed!
      </h1>
      <p class="text-muted-foreground mt-2">
        We look forward to seeing you
      </p>
    </div>

    <!-- Appointment Summary Card -->
    <Card class="mb-6 shadow-lg">
      <CardHeader>
        <CardTitle class="font-heading text-xl">Appointment Details</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- Service -->
        <div class="flex justify-between items-start">
          <div>
            <p class="font-semibold text-lg">{data.service.name}</p>
            <p class="text-sm text-muted-foreground">
              {formatDuration(data.service.durationMinutes)}
            </p>
          </div>
          <PriceDisplay
            priceType={data.service.priceType}
            priceMin={data.service.priceMin}
            priceMax={data.service.priceMax}
            class="text-lg"
          />
        </div>

        <hr class="border-border" />

        <!-- Stylist -->
        <div class="flex items-center gap-4">
          {#if data.staff.photoUrl}
            <img
              src={data.staff.photoUrl}
              alt={data.staff.displayName}
              class="w-12 h-12 rounded-full object-cover"
            />
          {:else}
            <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-muted-foreground"
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
            <p class="font-medium">{data.staff.displayName}</p>
            <p class="text-sm text-muted-foreground">Stylist</p>
          </div>
        </div>

        <hr class="border-border" />

        <!-- Date & Time -->
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-primary"
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
            <p class="font-medium">{format(startTime, 'EEEE, MMMM d, yyyy')}</p>
            <p class="text-muted-foreground">
              {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Payment Status Card -->
    {#if paymentPaid}
      <!-- Deposit Paid -->
      <Card class="mb-6 border-green-200 dark:border-green-900">
        <CardContent class="pt-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="font-semibold text-green-700 dark:text-green-400">Deposit Paid</p>
              <p class="text-sm text-muted-foreground">{paymentAmount} paid via Square</p>
            </div>
          </div>
        </CardContent>
      </Card>
    {:else if data.staffPaymentMethods.length > 0}
      <!-- Pay at Salon - Show Payment Methods -->
      <Card class="mb-6">
        <CardHeader>
          <CardTitle class="font-heading text-lg">How to Pay</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground mb-4">
            Pay your stylist directly using one of these methods:
          </p>
          <PaymentMethodDisplay
            methods={data.staffPaymentMethods}
            serviceName={data.service.name}
          />
        </CardContent>
      </Card>
    {/if}

    <!-- Customer Info Card -->
    <Card class="mb-6">
      <CardHeader>
        <CardTitle class="font-heading text-lg">Your Information</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2">
        <div class="flex items-center gap-3">
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
          <span>{data.appointment.customerName}</span>
        </div>
        <div class="flex items-center gap-3">
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
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
          <span>{data.appointment.customerEmail}</span>
        </div>
        {#if data.appointment.customerPhone}
          <div class="flex items-center gap-3">
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
                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
              />
            </svg>
            <span>{data.appointment.customerPhone}</span>
          </div>
        {/if}
      </CardContent>
    </Card>

    <!-- Actions -->
    <div class="space-y-4">
      <!-- Add to Calendar -->
      <Button onclick={downloadCalendar} class="w-full" size="lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
          />
        </svg>
        Add to Calendar
      </Button>

      <!-- Book Another -->
      <a href="/book" class="block">
        <Button variant="outline" class="w-full" size="lg">
          Book Another Appointment
        </Button>
      </a>
    </div>

    <!-- Cancel Info -->
    <div class="mt-8 p-4 bg-muted/50 rounded-lg">
      <h3 class="font-medium text-sm mb-2">Need to cancel or reschedule?</h3>
      <p class="text-sm text-muted-foreground mb-3">
        You can cancel your appointment using the link below. Please note our 24-hour cancellation policy.
      </p>
      <a
        href="/book/cancel/{data.appointment.cancelToken}"
        class="text-sm text-primary hover:underline"
      >
        Cancel or reschedule appointment
      </a>
    </div>

    <!-- Confirmation Email Notice -->
    <p class="text-center text-sm text-muted-foreground mt-6">
      A confirmation email will be sent to {data.appointment.customerEmail}
    </p>
  </div>
</div>
