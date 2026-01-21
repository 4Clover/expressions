<script lang="ts">
  /**
   * WeekView - 7-day calendar navigation for booking
   *
   * Shows a week at a time with Previous/Next navigation.
   * Highlights days with availability, disables past days.
   * Per RESEARCH: Week view first, show 7-day grid with available/unavailable indicators.
   */

  import { addDays, format, startOfWeek, isSameDay, isBefore, startOfDay } from 'date-fns';
  import { Button } from "$lib/components/ui/button";
  import { cn } from "$lib/utils";

  let {
    selectedDate = $bindable<Date | null>(null),
    availableDates = [],
    class: className,
  }: {
    selectedDate: Date | null;
    availableDates: Date[];
    class?: string;
  } = $props();

  // Start of current week (Sunday)
  let weekStart = $state(startOfWeek(new Date()));

  // Generate 7 days from weekStart
  let days = $derived(
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  );

  // Week range display
  let weekRangeDisplay = $derived(
    `${format(weekStart, 'MMM d')} - ${format(addDays(weekStart, 6), 'MMM d, yyyy')}`
  );

  function hasAvailability(date: Date): boolean {
    return availableDates.some(d => isSameDay(d, date));
  }

  function isPast(date: Date): boolean {
    const today = startOfDay(new Date());
    return isBefore(date, today);
  }

  function goToPreviousWeek() {
    weekStart = addDays(weekStart, -7);
  }

  function goToNextWeek() {
    weekStart = addDays(weekStart, 7);
  }

  function selectDate(date: Date) {
    selectedDate = date;
  }
</script>

<div class={cn("space-y-4", className)}>
  <!-- Week navigation -->
  <div class="flex items-center justify-between">
    <Button variant="ghost" size="sm" onclick={goToPreviousWeek}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4 mr-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Previous
    </Button>
    <span class="font-medium text-sm sm:text-base">{weekRangeDisplay}</span>
    <Button variant="ghost" size="sm" onclick={goToNextWeek}>
      Next
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4 ml-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Button>
  </div>

  <!-- Day grid -->
  <div class="grid grid-cols-7 gap-1 sm:gap-2">
    {#each days as day (day.getTime())}
      {@const isAvailable = hasAvailability(day) && !isPast(day)}
      {@const isSelected = selectedDate && isSameDay(day, selectedDate)}
      <button
        type="button"
        class={cn(
          "p-2 sm:p-3 rounded-lg text-center transition-all",
          isSelected && "bg-primary text-primary-foreground",
          !isSelected && isAvailable && "hover:bg-accent cursor-pointer",
          !isAvailable && "opacity-50 cursor-not-allowed",
          !isSelected && isAvailable && "hover:shadow-md"
        )}
        disabled={!isAvailable}
        onclick={() => selectDate(day)}
      >
        <div class="text-xs text-muted-foreground" class:text-primary-foreground={isSelected}>
          {format(day, 'EEE')}
        </div>
        <div class="text-lg font-semibold">{format(day, 'd')}</div>
        {#if isAvailable && !isSelected}
          <!-- Availability indicator dot -->
          <div class="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1"></div>
        {:else if !isAvailable && !isPast(day)}
          <!-- No availability indicator -->
          <div class="w-2 h-2 bg-muted-foreground/30 rounded-full mx-auto mt-1"></div>
        {:else}
          <!-- Spacer for alignment -->
          <div class="w-2 h-2 mx-auto mt-1"></div>
        {/if}
      </button>
    {/each}
  </div>
</div>
