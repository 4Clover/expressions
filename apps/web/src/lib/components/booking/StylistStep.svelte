<script lang="ts">
  /**
   * StylistStep - Stylist selection for booking wizard (BOOK-02)
   *
   * Shows stylist cards with photo, name, specialties, and availability badge.
   * Includes "Any Available" option at top for customers who don't have a preference.
   * Filters to show only stylists who offer the selected service.
   */

  import { Card, CardHeader, CardTitle, CardDescription } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { cn } from "$lib/utils";

  interface Staff {
    id: string;
    displayName: string;
    bio: string | null;
    photoUrl: string | null;
    specialties: string[] | null;
  }

  interface StaffService {
    staffId: string;
    serviceId: string;
    customPrice: number | null;
    isAvailable: boolean;
  }

  let {
    staff,
    staffServices = [],
    serviceId,
    selectedId = $bindable<string | null>(null),
    class: className,
  }: {
    staff: Staff[];
    staffServices?: StaffService[];
    serviceId: string;
    selectedId: string | null;
    class?: string;
  } = $props();

  // Filter staff to only those who offer the selected service
  let availableStaff = $derived.by(() => {
    if (!staffServices || staffServices.length === 0) {
      // If no staffServices data, show all staff
      return staff;
    }

    const staffIdsForService = new Set(
      staffServices
        .filter(ss => ss.serviceId === serviceId && ss.isAvailable)
        .map(ss => ss.staffId)
    );

    return staff.filter(s => staffIdsForService.has(s.id));
  });

  function selectStaff(id: string) {
    selectedId = id;
  }
</script>

<div class={cn("space-y-6", className)}>
  <div class="text-center">
    <h2 class="font-heading text-2xl font-semibold">Choose a Stylist</h2>
    <p class="text-muted-foreground mt-1">Select your preferred stylist or choose "Any Available"</p>
  </div>

  <!-- Any Available option -->
  <button
    type="button"
    class="text-left w-full"
    onclick={() => selectStaff('any')}
  >
    <Card
      class={cn(
        "cursor-pointer transition-all",
        selectedId === 'any'
          ? "ring-2 ring-primary bg-accent/50"
          : "hover:shadow-md"
      )}
    >
      <CardHeader>
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div>
            <CardTitle class="font-heading text-lg">Any Available Stylist</CardTitle>
            <CardDescription>First available appointment with any qualified stylist</CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  </button>

  <!-- Individual stylists -->
  <div class="grid gap-4 sm:grid-cols-2">
    {#each availableStaff as stylist (stylist.id)}
      <button
        type="button"
        class="text-left w-full"
        onclick={() => selectStaff(stylist.id)}
      >
        <Card
          class={cn(
            "h-full cursor-pointer transition-all overflow-hidden",
            selectedId === stylist.id
              ? "ring-2 ring-primary bg-accent/50"
              : "hover:shadow-md"
          )}
        >
          <div class="flex">
            <!-- Stylist photo -->
            <div class="w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-muted">
              {#if stylist.photoUrl}
                <img
                  src={stylist.photoUrl}
                  alt={stylist.displayName}
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
              {:else}
                <div class="w-full h-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-10 w-10 text-muted-foreground/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </div>
              {/if}
            </div>
            <!-- Stylist info -->
            <CardHeader class="flex-1 py-3">
              <CardTitle class="font-heading text-lg">{stylist.displayName}</CardTitle>
              {#if stylist.bio}
                <CardDescription class="line-clamp-2 text-xs">{stylist.bio}</CardDescription>
              {/if}
              {#if stylist.specialties && stylist.specialties.length > 0}
                <div class="flex flex-wrap gap-1 mt-2">
                  {#each stylist.specialties.slice(0, 3) as specialty (specialty)}
                    <Badge variant="secondary" class="text-xs px-1.5 py-0">
                      {specialty}
                    </Badge>
                  {/each}
                </div>
              {/if}
            </CardHeader>
          </div>
        </Card>
      </button>
    {/each}
  </div>

  {#if availableStaff.length === 0 && staff.length > 0}
    <p class="text-center text-muted-foreground py-4">
      No stylists currently offer this service
    </p>
  {/if}
</div>
