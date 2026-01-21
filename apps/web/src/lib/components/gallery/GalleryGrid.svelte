<script lang="ts">
  import BeforeAfterSlider from "./BeforeAfterSlider.svelte";
  import GalleryImage from "./GalleryImage.svelte";

  export type GalleryItem = {
    id: string;
    type: "comparison" | "single";
    beforeImage?: string;
    afterImage?: string;
    image?: string;
    alt: string;
    stylistId?: string;
    categoryId?: string;
    caption?: string;
  };

  interface Props {
    items: GalleryItem[];
  }

  let { items }: Props = $props();
</script>

{#if items.length === 0}
  <div class="py-12 text-center">
    <p class="text-muted-foreground">No gallery items match your filters.</p>
  </div>
{:else}
  <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {#each items as item (item.id)}
      {#if item.type === "comparison" && item.beforeImage && item.afterImage}
        <BeforeAfterSlider
          beforeImage={item.beforeImage}
          afterImage={item.afterImage}
          alt={item.alt}
        />
      {:else if item.type === "single" && item.image}
        <GalleryImage
          image={item.image}
          alt={item.alt}
          {...(item.caption ? { caption: item.caption } : {})}
        />
      {/if}
    {/each}
  </div>
{/if}
