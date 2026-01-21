<script lang="ts">
  import { storyblokEditable } from "@storyblok/svelte";
  import type { SbBlokData } from "@storyblok/svelte";
  import { BeforeAfterSlider, GalleryImage } from "$lib/components/gallery";

  interface GalleryImageBlok {
    _uid: string;
    type?: "comparison" | "single";
    before_image?: { filename: string; alt?: string };
    after_image?: { filename: string; alt?: string };
    image?: { filename: string; alt?: string };
    alt?: string;
    caption?: string;
  }

  interface GalleryBlok extends SbBlokData {
    headline?: string;
    subheadline?: string;
    images?: GalleryImageBlok[];
    max_display?: number;
  }

  let { blok }: { blok: GalleryBlok } = $props();

  // Default to 6 featured images
  let maxDisplay = $derived(blok.max_display ?? 6);

  // Parse images from Storyblok format
  let displayImages = $derived(
    (blok.images ?? []).slice(0, maxDisplay).map((img) => {
      const isComparison = img.before_image?.filename && img.after_image?.filename;
      return {
        id: img._uid,
        type: isComparison ? ("comparison" as const) : ("single" as const),
        beforeImage: img.before_image?.filename,
        afterImage: img.after_image?.filename,
        image: img.image?.filename,
        alt: img.alt ?? "Gallery image",
        caption: img.caption,
      };
    })
  );

  let hasImages = $derived(displayImages.length > 0);
</script>

<section use:storyblokEditable={blok} class="px-6 py-16 md:py-24">
  <div class="mx-auto max-w-6xl">
    <!-- Header -->
    {#if blok.headline}
      <h2 class="font-heading text-2xl md:text-3xl font-bold text-center mb-4">
        {blok.headline}
      </h2>
    {/if}

    {#if blok.subheadline}
      <p class="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
        {blok.subheadline}
      </p>
    {/if}

    <!-- Gallery Grid (3 cols max) -->
    {#if hasImages}
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {#each displayImages as img (img.id)}
          {#if img.type === "comparison" && img.beforeImage && img.afterImage}
            <BeforeAfterSlider
              beforeImage={img.beforeImage}
              afterImage={img.afterImage}
              alt={img.alt}
            />
          {:else if img.type === "single" && img.image}
            <GalleryImage
              image={img.image}
              alt={img.alt}
              {...(img.caption ? { caption: img.caption } : {})}
            />
          {/if}
        {/each}
      </div>

      <!-- View Gallery CTA -->
      <div class="text-center">
        <a
          href="/gallery"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5 hover:shadow-md transition-all duration-[var(--transition-smooth)]"
        >
          View Full Gallery
        </a>
      </div>
    {:else}
      <p class="text-center text-muted-foreground">
        Gallery images coming soon.
      </p>
    {/if}
  </div>
</section>
