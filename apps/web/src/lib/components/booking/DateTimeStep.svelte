<script lang="ts">
  /**
   * DateTimeStep - Date and time selection for booking wizard (BOOK-03)
   *
   * Uses WeekView for date selection and SlotGrid for time slot selection.
   * Fetches availability when date changes, shows loading state during fetch.
   */

  import { format, startOfWeek, addDays } from 'date-fns';
  import WeekView from "./WeekView.svelte";
  import SlotGrid from "./SlotGrid.svelte";
  import type { TimeSlot } from "./types";
  import { cn } from "$lib/utils";

  let {
    staffId,
    serviceId,
    date = $bindable<Date | null>(null),
    timeSlot = $bindable<TimeSlot | null>(null),
    class: className,
  }: {
    staffId: string;
    serviceId: string;
    date: Date | null;
    timeSlot: TimeSlot | null;
    class?: string;
  } = $props();

  let slots = $state<TimeSlot[]>([]);
  let isLoadingSlots = $state(false);
  let availableDates = $state<Date[]>([]);

  // Fetch available slots when date changes
  $effect(() => {
    if (date) {
      fetchSlotsForDate(date);
    } else {
      slots = [];
    }
  });

  // Fetch availability for the current week on mount and when staffId/serviceId change
  $effect(() => {
    if (staffId && serviceId) {
      fetchWeekAvailability(startOfWeek(new Date()));
    }
  });

  async function fetchSlotsForDate(selectedDate: Date) {
    // Clear selection when date changes
    timeSlot = null;
    isLoadingSlots = true;

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch(
        `/api/availability?staffId=${encodeURIComponent(staffId)}&serviceId=${encodeURIComponent(serviceId)}&date=${dateStr}`
      );

      if (!response.ok) {
        console.error('Failed to fetch availability:', response.status);
        slots = [];
        return;
      }

      const data = await response.json();
      // Convert ISO strings back to Date objects
      slots = (data.slots || []).map((s: { start: string; end: string; display: string }) => ({
        ...s,
        start: new Date(s.start),
        end: new Date(s.end),
      }));
    } catch (error) {
      console.error('Error fetching availability:', error);
      slots = [];
    } finally {
      isLoadingSlots = false;
    }
  }

  async function fetchWeekAvailability(weekStart: Date) {
    // Fetch availability for each day in the week to show indicators
    const dates: Date[] = [];

    for (let i = 0; i < 7; i++) {
      const checkDate = addDays(weekStart, i);
      const dateStr = format(checkDate, 'yyyy-MM-dd');

      try {
        const response = await fetch(
          `/api/availability?staffId=${encodeURIComponent(staffId)}&serviceId=${encodeURIComponent(serviceId)}&date=${dateStr}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.slots && data.slots.length > 0) {
            dates.push(checkDate);
          }
        }
      } catch {
        // Ignore individual day errors
      }
    }

    availableDates = dates;
  }
</script>

<div class={cn("space-y-8", className)}>
  <div class="text-center">
    <h2 class="font-heading text-2xl font-semibold">Choose Date & Time</h2>
    <p class="text-muted-foreground mt-1">Select your preferred appointment time</p>
  </div>

  <!-- Week calendar -->
  <WeekView
    bind:selectedDate={date}
    {availableDates}
  />

  <!-- Time slots -->
  {#if date}
    <div class="space-y-4">
      <h3 class="font-heading text-lg font-medium">
        Available times for {format(date, 'EEEE, MMMM d')}
      </h3>
      <SlotGrid
        {slots}
        bind:selectedSlot={timeSlot}
        isLoading={isLoadingSlots}
      />
    </div>
  {:else}
    <p class="text-muted-foreground text-center py-4">
      Select a date above to see available times
    </p>
  {/if}
</div>
