<script lang="ts">
  import { optimizeImage } from "$lib/storyblok";

  interface Props {
    beforeImage: string;
    afterImage: string;
    alt?: string;
    width?: number;
    quality?: number;
  }

  let {
    beforeImage,
    afterImage,
    alt = "Before and after comparison",
    width = 600,
    quality = 85,
  }: Props = $props();

  let sliderPosition = $state(50);

  // Optimize images via Storyblok Image Service
  let optimizedBefore = $derived(optimizeImage(beforeImage, width, quality));
  let optimizedAfter = $derived(optimizeImage(afterImage, width, quality));

  function handleSliderChange(event: Event) {
    const target = event.target as HTMLInputElement;
    sliderPosition = parseFloat(target.value);
  }
</script>

<div
  class="relative aspect-[4/3] overflow-hidden rounded-lg shadow hover:shadow-lg transition-shadow duration-[var(--transition-smooth)]"
>
  <!-- After image (full width, behind) -->
  <img
    src={optimizedAfter}
    alt="{alt} - After"
    class="absolute inset-0 w-full h-full object-cover"
    loading="lazy"
  />

  <!-- Before image (clipped based on slider) -->
  <div
    class="absolute inset-0 overflow-hidden"
    style="width: {sliderPosition}%"
  >
    <img
      src={optimizedBefore}
      alt="{alt} - Before"
      class="absolute inset-0 w-full h-full object-cover"
      style="width: {100 / (sliderPosition / 100)}%"
      loading="lazy"
    />
  </div>

  <!-- Slider line indicator -->
  <div
    class="absolute top-0 bottom-0 w-0.5 bg-white shadow-md pointer-events-none"
    style="left: {sliderPosition}%"
  >
    <!-- Drag handle -->
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-4 h-4 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M8 9l4-4 4 4m0 6l-4 4-4-4"
        />
      </svg>
    </div>
  </div>

  <!-- Invisible range slider for interaction -->
  <input
    type="range"
    min="0"
    max="100"
    value={sliderPosition}
    oninput={handleSliderChange}
    class="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
    aria-label="Slide to compare before and after images"
  />

  <!-- Labels -->
  <div class="absolute bottom-3 left-3 px-2 py-1 bg-black/60 text-white text-xs rounded">
    Before
  </div>
  <div class="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded">
    After
  </div>
</div>
