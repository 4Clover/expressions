<script lang="ts">
  import { untrack } from "svelte";
  import { GalleryGrid, GalleryFilter } from "$lib/components/gallery";

  let { data } = $props();

  // Filter state - initialized from URL query parameters
  // User modifies these filters interactively, so initial capture is intentional
  // Use untrack to suppress state_referenced_locally warning
  let selectedCategory = $state(untrack(() => data.initialCategory));
  let selectedStylist = $state(untrack(() => data.initialStylist));

  // Filtered gallery items based on current filter selections
  let filteredItems = $derived(
    data.galleryItems.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.categoryId === selectedCategory;
      const matchesStylist =
        selectedStylist === "all" || item.stylistId === selectedStylist;
      return matchesCategory && matchesStylist;
    })
  );

  // Check if we have any gallery content
  let hasContent = $derived(data.galleryItems.length > 0);
</script>

<svelte:head>
  <title>Gallery | Expressions Hair Designs</title>
  <meta
    name="description"
    content="Browse our gallery of hair transformations. See before and after results from our talented stylists at Expressions Hair Designs."
  />
</svelte:head>

<main class="px-6 py-16 md:py-24">
  <div class="mx-auto max-w-6xl">
    <!-- Page Header -->
    <header class="mb-12 text-center">
      <h1 class="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-4">
        Our Work
      </h1>
      <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
        Browse through our gallery of stunning hair transformations. From vibrant
        colors to elegant cuts, see the artistry of our talented stylists.
      </p>
    </header>

    {#if hasContent}
      <!-- Filters -->
      <div class="mb-10">
        <GalleryFilter
          categories={data.categories}
          stylists={data.stylists}
          {selectedCategory}
          {selectedStylist}
          onCategoryChange={(value) => (selectedCategory = value)}
          onStylistChange={(value) => (selectedStylist = value)}
        />
      </div>

      <!-- Gallery Grid -->
      <GalleryGrid items={filteredItems} />

      <!-- Results count -->
      {#if filteredItems.length > 0}
        <p class="mt-8 text-center text-sm text-muted-foreground">
          Showing {filteredItems.length} of {data.galleryItems.length} items
        </p>
      {/if}
    {:else}
      <!-- Empty state when CMS not configured -->
      <div class="py-16 text-center">
        <div class="mx-auto max-w-md space-y-4">
          <div
            class="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
          <h2 class="text-xl font-semibold">Gallery Coming Soon</h2>
          <p class="text-muted-foreground">
            We're curating our best before and after transformations.
            Check back soon to see our stylists' amazing work!
          </p>
        </div>
      </div>
    {/if}
  </div>
</main>
