<script lang="ts">
  /**
   * ServiceStep - Service selection for booking wizard (BOOK-01)
   *
   * Displays services grouped by category. Customer selects one service to book.
   * Reuses the ServiceCard styling pattern with selection highlight.
   */

  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "$lib/components/ui/card";
  import PriceDisplay from "$lib/components/services/PriceDisplay.svelte";
  import { cn } from "$lib/utils";

  interface Service {
    id: string;
    name: string;
    description: string | null;
    durationMinutes: number;
    priceType: "fixed" | "starting" | "range";
    priceMin: number;
    priceMax: number | null;
    categoryId: string;
  }

  interface Category {
    id: string;
    name: string;
  }

  let {
    services,
    categories = [],
    selectedId = $bindable<string | null>(null),
    class: className,
  }: {
    services: Service[];
    categories?: Category[];
    selectedId: string | null;
    class?: string;
  } = $props();

  // Group services by category
  let groupedServices = $derived.by(() => {
    const grouped = new Map<string, { category: Category | null; services: Service[] }>();

    // Initialize with categories
    for (const category of categories) {
      grouped.set(category.id, { category, services: [] });
    }

    // Add services to their categories
    for (const service of services) {
      const group = grouped.get(service.categoryId);
      if (group) {
        group.services.push(service);
      } else {
        // Service has no matching category, create ungrouped bucket
        if (!grouped.has('ungrouped')) {
          grouped.set('ungrouped', { category: null, services: [] });
        }
        grouped.get('ungrouped')!.services.push(service);
      }
    }

    // Filter out empty groups
    return Array.from(grouped.entries())
      .filter(([_, g]) => g.services.length > 0)
      .map(([_, g]) => g);
  });

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

  function selectService(id: string) {
    selectedId = id;
  }
</script>

<div class={cn("space-y-8", className)}>
  <div class="text-center">
    <h2 class="font-heading text-2xl font-semibold">Choose a Service</h2>
    <p class="text-muted-foreground mt-1">Select the service you'd like to book</p>
  </div>

  {#each groupedServices as group}
    <div class="space-y-4">
      {#if group.category}
        <h3 class="font-heading text-lg font-medium text-muted-foreground">{group.category.name}</h3>
      {/if}
      <div class="grid gap-4 sm:grid-cols-2">
        {#each group.services as service}
          <button
            type="button"
            class="text-left w-full"
            onclick={() => selectService(service.id)}
          >
            <Card
              class={cn(
                "h-full cursor-pointer transition-all",
                selectedId === service.id
                  ? "ring-2 ring-primary bg-accent/50"
                  : "hover:shadow-md"
              )}
            >
              <CardHeader class="space-y-2">
                <div class="flex items-start justify-between gap-4">
                  <CardTitle class="font-heading text-lg">{service.name}</CardTitle>
                  <PriceDisplay
                    priceType={service.priceType}
                    priceMin={service.priceMin}
                    priceMax={service.priceMax}
                    class="shrink-0 text-base"
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
          </button>
        {/each}
      </div>
    </div>
  {/each}

  {#if services.length === 0}
    <p class="text-center text-muted-foreground py-8">No services available</p>
  {/if}
</div>
