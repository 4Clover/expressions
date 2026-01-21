<script lang="ts">
  /**
   * SlotGrid - Time slot selection grouped by time of day
   *
   * Groups slots into Morning (<12), Afternoon (<17), Evening (>=17).
   * Shows skeleton loading state and empty state message.
   * Per RESEARCH: Morning/Afternoon/Evening groupings for visual organization.
   */

  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";

  export interface TimeSlot {
    start: Date;
    end: Date;
    display: string;
  }

  let {
    slots = [],
    selectedSlot = $bindable<TimeSlot | null>(null),
    isLoading = false,
    class: className,
  }: {
    slots: TimeSlot[];
    selectedSlot: TimeSlot | null;
    isLoading?: boolean;
    class?: string;
  } = $props();

  // Group slots by time of day
  let groupedSlots = $derived.by(() => {
    const morning: TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];
    const evening: TimeSlot[] = [];

    for (const slot of slots) {
      const hour = new Date(slot.start).getHours();
      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 17) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    }

    return { morning, afternoon, evening };
  });

  function isSlotSelected(slot: TimeSlot): boolean {
    if (!selectedSlot) return false;
    return new Date(slot.start).getTime() === new Date(selectedSlot.start).getTime();
  }

  function selectSlot(slot: TimeSlot) {
    selectedSlot = slot;
  }
</script>

<div class={cn("space-y-6", className)}>
  {#if isLoading}
    <!-- Skeleton loading state -->
    <div class="space-y-4">
      <div class="h-4 bg-muted rounded w-20 animate-pulse"></div>
      <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {#each { length: 8 } as _, i (i)}
          <div class="h-10 bg-muted animate-pulse rounded-md"></div>
        {/each}
      </div>
    </div>
  {:else if slots.length === 0}
    <!-- Empty state -->
    <p class="text-muted-foreground text-center py-8">
      No available times for this day. Try another date.
    </p>
  {:else}
    <!-- Time slot groups -->
    {#if groupedSlots.morning.length > 0}
      <div class="space-y-2">
        <h4 class="text-sm font-medium text-muted-foreground">Morning</h4>
        <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {#each groupedSlots.morning as slot (slot.start.getTime())}
            <Button
              variant={isSlotSelected(slot) ? 'default' : 'outline'}
              size="sm"
              onclick={() => selectSlot(slot)}
            >
              {slot.display}
            </Button>
          {/each}
        </div>
      </div>
    {/if}

    {#if groupedSlots.afternoon.length > 0}
      <div class="space-y-2">
        <h4 class="text-sm font-medium text-muted-foreground">Afternoon</h4>
        <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {#each groupedSlots.afternoon as slot (slot.start.getTime())}
            <Button
              variant={isSlotSelected(slot) ? 'default' : 'outline'}
              size="sm"
              onclick={() => selectSlot(slot)}
            >
              {slot.display}
            </Button>
          {/each}
        </div>
      </div>
    {/if}

    {#if groupedSlots.evening.length > 0}
      <div class="space-y-2">
        <h4 class="text-sm font-medium text-muted-foreground">Evening</h4>
        <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {#each groupedSlots.evening as slot (slot.start.getTime())}
            <Button
              variant={isSlotSelected(slot) ? 'default' : 'outline'}
              size="sm"
              onclick={() => selectSlot(slot)}
            >
              {slot.display}
            </Button>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>
