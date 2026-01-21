<script lang="ts">
  import { StaffProfile } from "$lib/components/staff";

  let { data } = $props();

  // Generate gallery link with pre-filtered stylist
  let galleryUrl = $derived(`/gallery?stylist=${data.staffMember.id}`);
</script>

<svelte:head>
  <title>{data.staffMember.displayName} | Expressions Hair Designs</title>
  <meta
    name="description"
    content={data.staffMember.bio || `Book an appointment with ${data.staffMember.displayName} at Expressions Hair Designs.`}
  />
</svelte:head>

<main class="px-6 py-16 md:py-24">
  <div class="mx-auto max-w-5xl">
    <StaffProfile staffMember={data.staffMember} />

    <!-- Portfolio Section -->
    <section class="mt-16 pt-12 border-t">
      <h2 class="font-heading text-2xl md:text-3xl font-bold tracking-tight mb-4">
        Portfolio
      </h2>
      <p class="text-muted-foreground mb-6">
        Browse {data.staffMember.displayName}'s work samples and before/after transformations.
      </p>
      <a
        href={galleryUrl}
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5 hover:shadow-md transition-all duration-[var(--transition-smooth)]"
      >
        View {data.staffMember.displayName}'s Work
      </a>
    </section>
  </div>
</main>
