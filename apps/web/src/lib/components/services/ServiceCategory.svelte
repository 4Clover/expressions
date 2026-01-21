<script lang="ts">
  import ServiceCard from "./ServiceCard.svelte";
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

  interface Category {
    id: string;
    name: string;
    services: Service[];
  }

  let { category, class: className }: { category: Category; class?: string } = $props();
</script>

<section class={cn("space-y-6", className)}>
  <h2 class="font-heading text-2xl font-bold tracking-tight">{category.name}</h2>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
    {#each category.services as service (service.id)}
      <ServiceCard {service} />
    {/each}
  </div>
</section>
