<script lang="ts">
  import { Button } from "$lib/components/ui/button";

  interface FilterOption {
    id: string;
    name: string;
  }

  interface Props {
    categories: FilterOption[];
    stylists: FilterOption[];
    selectedCategory: string;
    selectedStylist: string;
    onCategoryChange: (value: string) => void;
    onStylistChange: (value: string) => void;
  }

  let {
    categories,
    stylists,
    selectedCategory,
    selectedStylist,
    onCategoryChange,
    onStylistChange,
  }: Props = $props();
</script>

<div class="space-y-6">
  <!-- Service Type Filter -->
  <div class="space-y-3">
    <h3 class="text-sm font-medium text-muted-foreground">Service Type</h3>
    <div class="flex flex-wrap gap-2">
      <Button
        variant={selectedCategory === "all" ? "default" : "outline"}
        size="sm"
        onclick={() => onCategoryChange("all")}
      >
        All
      </Button>
      {#each categories as category (category.id)}
        <Button
          variant={selectedCategory === category.id ? "default" : "outline"}
          size="sm"
          onclick={() => onCategoryChange(category.id)}
        >
          {category.name}
        </Button>
      {/each}
    </div>
  </div>

  <!-- Stylist Filter -->
  {#if stylists.length > 0}
    <div class="space-y-3">
      <h3 class="text-sm font-medium text-muted-foreground">Stylist</h3>
      <div class="flex flex-wrap gap-2">
        <Button
          variant={selectedStylist === "all" ? "default" : "outline"}
          size="sm"
          onclick={() => onStylistChange("all")}
        >
          All
        </Button>
        {#each stylists as stylist (stylist.id)}
          <Button
            variant={selectedStylist === stylist.id ? "default" : "outline"}
            size="sm"
            onclick={() => onStylistChange(stylist.id)}
          >
            {stylist.name}
          </Button>
        {/each}
      </div>
    </div>
  {/if}
</div>
