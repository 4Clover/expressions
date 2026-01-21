<script lang="ts">
  /**
   * Displays a stylist's accepted payment methods with icons and deep links
   * Used on booking confirmation and pay-at-salon flow
   */
  import { generateVenmoLink, generateCashAppLink } from '$lib/payments/deeplinks';

  interface PaymentMethod {
    methodType: 'venmo' | 'cashapp' | 'zelle' | 'cash';
    handle: string | null;
    displayName: string | null;
  }

  interface Props {
    methods: PaymentMethod[];
    serviceName?: string;
    amount?: number; // in dollars, for deep link prefill
  }

  let { methods, serviceName, amount }: Props = $props();

  const methodConfig = {
    venmo: {
      name: 'Venmo',
      icon: '💳', // Will use proper SVG icon
      bgColor: 'bg-[#3D95CE]/10',
      textColor: 'text-[#3D95CE]',
      getLink: (handle: string) => generateVenmoLink(handle, amount, serviceName),
    },
    cashapp: {
      name: 'Cash App',
      icon: '💵',
      bgColor: 'bg-[#00D632]/10',
      textColor: 'text-[#00D632]',
      getLink: (handle: string) => generateCashAppLink(handle, amount),
    },
    zelle: {
      name: 'Zelle',
      icon: '🏦',
      bgColor: 'bg-[#6D1ED4]/10',
      textColor: 'text-[#6D1ED4]',
      getLink: () => null as string | null,
    },
    cash: {
      name: 'Cash',
      icon: '💵',
      bgColor: 'bg-muted',
      textColor: 'text-muted-foreground',
      getLink: () => null as string | null,
    },
  };
</script>

<div class="space-y-3">
  {#each methods as method (method.methodType)}
    {@const config = methodConfig[method.methodType]}
    {@const link = method.handle ? config.getLink(method.handle) : null}

    {#if link}
      <!-- Clickable payment method with deep link -->
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all duration-200 group"
      >
        <div class="w-12 h-12 rounded-full {config.bgColor} flex items-center justify-center text-2xl">
          {config.icon}
        </div>
        <div class="flex-1">
          <p class="font-medium {config.textColor}">{config.name}</p>
          <p class="text-sm text-muted-foreground">
            {method.displayName ?? method.handle}
          </p>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    {:else}
      <!-- Non-clickable payment method (Zelle, Cash) -->
      <div class="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/30">
        <div class="w-12 h-12 rounded-full {config.bgColor} flex items-center justify-center text-2xl">
          {config.icon}
        </div>
        <div class="flex-1">
          <p class="font-medium {config.textColor}">{config.name}</p>
          {#if method.methodType === 'zelle' && method.handle}
            <p class="text-sm text-muted-foreground">
              Send to: {method.handle}
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              Use your bank's Zelle feature
            </p>
          {:else if method.methodType === 'cash'}
            <p class="text-sm text-muted-foreground">
              Pay in person at the salon
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              ATM available nearby
            </p>
          {:else}
            <p class="text-sm text-muted-foreground">
              {method.displayName ?? method.handle ?? 'Contact stylist'}
            </p>
          {/if}
        </div>
      </div>
    {/if}
  {/each}

  {#if methods.length === 0}
    <p class="text-muted-foreground text-center py-4">
      Contact your stylist for payment options
    </p>
  {/if}
</div>
