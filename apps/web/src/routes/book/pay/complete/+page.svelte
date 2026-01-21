<script lang="ts">
  /**
   * Payment Completion Page
   *
   * Customer lands here after Square checkout redirect.
   * Shows payment status and redirects to confirmation.
   */
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';

  let { data } = $props();

  let checking = $state(true);
  let attempts = $state(0);
  const MAX_ATTEMPTS = 10;

  onMount(() => {
    // Poll for payment completion (webhook may take a moment)
    const checkPayment = async () => {
      if (data.paymentStatus === 'completed') {
        await goto(`/book/confirmation/${data.appointmentId}`);
        return;
      }

      if (data.paymentStatus === 'failed') {
        checking = false;
        return;
      }

      // Still pending - poll
      attempts++;
      if (attempts >= MAX_ATTEMPTS) {
        checking = false;
        return;
      }

      setTimeout(async () => {
        // Reload to check status
        window.location.reload();
      }, 2000);
    };

    checkPayment();
  });
</script>

<svelte:head>
  <title>Processing Payment | Expressions Hair Designs</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="min-h-screen bg-background flex items-center justify-center">
  <div class="max-w-md mx-auto px-4 text-center">
    {#if checking}
      <div class="mb-6">
        <div class="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
        </div>
      </div>
      <h1 class="font-heading text-2xl font-semibold text-foreground mb-2">
        Processing Payment
      </h1>
      <p class="text-muted-foreground">
        Please wait while we confirm your payment...
      </p>
    {:else if data.paymentStatus === 'failed'}
      <Card class="border-destructive">
        <CardContent class="pt-6">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 class="font-heading text-xl font-semibold text-foreground mb-2">
            Payment Failed
          </h2>
          <p class="text-muted-foreground mb-4">
            Your payment could not be processed. Your appointment slot is still reserved.
          </p>
          <Button onclick={() => window.history.back()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    {:else}
      <!-- Timeout - show manual link -->
      <Card>
        <CardContent class="pt-6">
          <p class="text-muted-foreground mb-4">
            Payment verification is taking longer than expected.
          </p>
          <a href="/book/confirmation/{data.appointmentId}">
            <Button>View Appointment</Button>
          </a>
        </CardContent>
      </Card>
    {/if}
  </div>
</div>
