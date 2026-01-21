<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "$lib/components/ui/card";
  import PriceDisplay from "./PriceDisplay.svelte";
  import { cn } from "$lib/utils";

  interface Service {
    id: string;
    name: string;
    description: string | null;
    durationMinutes: number;
    priceType: "fixed" | "starting" | "range";
    priceMin: number;
    priceMax: number | null;
  }

  let { service, class: className }: { service: Service; class?: string } = $props();

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
</script>

<Card class={cn("h-full", className)}>
  <CardHeader class="space-y-2">
    <div class="flex items-start justify-between gap-4">
      <CardTitle class="font-heading text-lg">{service.name}</CardTitle>
      <PriceDisplay
        priceType={service.priceType}
        priceMin={service.priceMin}
        priceMax={service.priceMax}
        class="shrink-0"
      />
    </div>
    {#if service.description}
      <CardDescription class="line-clamp-2">{service.description}</CardDescription>
    {/if}
  </CardHeader>
  <CardContent class="pt-0">
    <p class="text-sm text-muted-foreground">
      {formatDuration(service.durationMinutes)}
    </p>
  </CardContent>
</Card>
