<script lang="ts">
  import { ServiceCategory } from "$lib/components/services";

  let { data } = $props();
</script>

<svelte:head>
  <title>Our Services | Expressions Hair Designs</title>
  <meta name="description" content="Browse our full menu of hair services including cuts, color, styling, and more at Expressions Hair Designs." />
</svelte:head>

<main class="px-6 py-16 md:py-24">
  <div class="mx-auto max-w-6xl">
    <div class="text-center mb-12 md:mb-16">
      <h1 class="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-4">
        Our Services
      </h1>
      <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
        From precision cuts to stunning color transformations, discover the full range of services we offer.
      </p>
    </div>

    {#if data.categories.length > 0}
      <div class="space-y-16">
        {#each data.categories as category (category.id)}
          {#if category.services && category.services.length > 0}
            <ServiceCategory {category} />
          {/if}
        {/each}
      </div>
    {:else}
      <div class="text-center py-12">
        <p class="text-muted-foreground">
          Our service menu is coming soon. Check back later!
        </p>
      </div>
    {/if}
  </div>
</main>
