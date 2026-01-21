<script lang="ts">
  import { StaffCard } from "$lib/components/staff";

  let { data } = $props();
</script>

<svelte:head>
  <title>Our Stylists | Expressions Hair Designs</title>
  <meta name="description" content="Meet our talented team of hair stylists at Expressions Hair Designs." />
</svelte:head>

<main class="px-6 py-16 md:py-24">
  <div class="mx-auto max-w-6xl">
    <div class="text-center mb-12 md:mb-16">
      <h1 class="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-4">
        Our Stylists
      </h1>
      <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
        Meet our talented team of hair professionals dedicated to making you look and feel your best.
      </p>
    </div>

    {#if data.staff.length > 0}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {#each data.staff as staffMember (staffMember.id)}
          <StaffCard staff={staffMember} />
        {/each}
      </div>
    {:else}
      <div class="text-center py-12">
        <p class="text-muted-foreground">
          Our stylist profiles are coming soon. Check back later!
        </p>
      </div>
    {/if}
  </div>
</main>
