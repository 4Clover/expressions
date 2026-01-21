<script lang="ts">
  import { cn } from "$lib/utils";

  type PriceType = "fixed" | "starting" | "range";

  let {
    priceType,
    priceMin,
    priceMax = null,
    class: className,
  }: {
    priceType: PriceType;
    priceMin: number; // cents
    priceMax?: number | null; // cents
    class?: string;
  } = $props();

  function formatPrice(cents: number): string {
    return `$${Math.floor(cents / 100)}`;
  }

  let displayPrice = $derived.by(() => {
    switch (priceType) {
      case "fixed":
        return formatPrice(priceMin);
      case "starting":
        return `Starting at ${formatPrice(priceMin)}`;
      case "range":
        return `${formatPrice(priceMin)} - ${formatPrice(priceMax!)}`;
      default:
        return formatPrice(priceMin);
    }
  });
</script>

<span class={cn("text-lg font-semibold", className)}>{displayPrice}</span>
