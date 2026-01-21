<script lang="ts">
  import { optimizeImage } from "$lib/storyblok";

  interface ImageAsset {
    filename: string;
    alt?: string;
  }

  interface Props {
    image: ImageAsset | string;
    caption?: string;
    alt?: string;
    width?: number;
    quality?: number;
  }

  let {
    image,
    caption,
    alt,
    width = 600,
    quality = 85,
  }: Props = $props();

  // Handle both string URLs and Storyblok asset objects
  let imageUrl = $derived(typeof image === "string" ? image : image.filename);
  let imageAlt = $derived(alt ?? (typeof image === "object" ? image.alt : "") ?? "Gallery image");

  let optimizedUrl = $derived(optimizeImage(imageUrl, width, quality));
</script>

<figure class="group">
  <div class="overflow-hidden rounded-lg shadow hover:shadow-lg transition-shadow duration-[var(--transition-smooth)]">
    <img
      src={optimizedUrl}
      alt={imageAlt}
      loading="lazy"
      class="w-full aspect-[4/3] object-cover transition-transform duration-[var(--transition-smooth)] group-hover:scale-105"
    />
  </div>
  {#if caption}
    <figcaption class="mt-2 text-sm text-muted-foreground text-center">
      {caption}
    </figcaption>
  {/if}
</figure>
