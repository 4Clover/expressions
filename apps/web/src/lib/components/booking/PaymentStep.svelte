<script lang="ts">
  /**
   * Payment Step in Booking Wizard
   *
   * Allows customer to choose:
   * - Pay at Salon (default) - shows stylist's P2P payment methods
   * - Pay Online (if stylist has Square) - redirects to Square checkout
   *
   * For deposit-required services, online payment is mandatory.
   */
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { PaymentMethodDisplay } from '$lib/components/payments';

  interface PaymentMethod {
    methodType: 'venmo' | 'cashapp' | 'zelle' | 'cash';
    handle: string | null;
    displayName: string | null;
  }

  interface Props {
    staffPaymentMethods: PaymentMethod[];
    hasSquare: boolean;
    depositRequired: boolean;
    depositAmountCents: number | null;
    serviceName: string;
    selectedMethod: 'pay_at_salon' | 'square';
  }

  let {
    staffPaymentMethods,
    hasSquare,
    depositRequired,
    depositAmountCents,
    serviceName,
    selectedMethod = $bindable('pay_at_salon'),
  }: Props = $props();

  // If deposit required and no Square, show warning
  let depositBlocked = $derived(depositRequired && !hasSquare);

  // Format deposit amount
  let depositDisplay = $derived(
    depositAmountCents ? `$${(depositAmountCents / 100).toFixed(2)}` : null
  );
</script>

<div class="space-y-6">
  <div class="text-center">
    <h2 class="font-heading text-2xl font-semibold text-foreground">
      Payment Method
    </h2>
    <p class="text-muted-foreground mt-1">
      {#if depositRequired}
        A {depositDisplay} deposit is required for this service
      {:else}
        Choose how you'd like to pay
      {/if}
    </p>
  </div>

  {#if depositBlocked}
    <!-- Stylist doesn't have Square but service requires deposit -->
    <Card class="border-destructive bg-destructive/5">
      <CardContent class="pt-6">
        <p class="text-destructive text-center">
          This service requires a deposit, but online payment is not available for this stylist.
          Please contact the salon to book this service.
        </p>
      </CardContent>
    </Card>
  {:else}
    <div class="space-y-4">
      <!-- Pay at Salon Option -->
      {#if !depositRequired}
        <button
          type="button"
          onclick={() => selectedMethod = 'pay_at_salon'}
          class="w-full text-left p-4 rounded-lg border-2 transition-all duration-200 {
            selectedMethod === 'pay_at_salon'
              ? 'border-primary bg-primary/5 shadow-md'
              : 'border-border hover:border-primary/50'
          }"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-semibold text-foreground">Pay at Salon</p>
              <p class="text-sm text-muted-foreground">
                Pay your stylist directly when you arrive
              </p>
            </div>
            {#if selectedMethod === 'pay_at_salon'}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            {/if}
          </div>
        </button>
      {/if}

      <!-- Pay Online Option (if Square available) -->
      {#if hasSquare}
        <button
          type="button"
          onclick={() => selectedMethod = 'square'}
          class="w-full text-left p-4 rounded-lg border-2 transition-all duration-200 {
            selectedMethod === 'square'
              ? 'border-primary bg-primary/5 shadow-md'
              : 'border-border hover:border-primary/50'
          }"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="font-semibold text-foreground">
                {depositRequired ? 'Pay Deposit Now' : 'Pay Online'}
              </p>
              <p class="text-sm text-muted-foreground">
                {#if depositRequired && depositDisplay}
                  {depositDisplay} deposit via secure checkout
                {:else}
                  Secure payment via Square
                {/if}
              </p>
            </div>
            {#if selectedMethod === 'square'}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            {/if}
          </div>
        </button>
      {/if}
    </div>

    <!-- Show payment methods when Pay at Salon selected -->
    {#if selectedMethod === 'pay_at_salon' && staffPaymentMethods.length > 0}
      <Card class="mt-6">
        <CardHeader>
          <CardTitle class="text-lg font-heading">Accepted Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentMethodDisplay
            methods={staffPaymentMethods}
            {serviceName}
          />
        </CardContent>
      </Card>
    {/if}
  {/if}
</div>
