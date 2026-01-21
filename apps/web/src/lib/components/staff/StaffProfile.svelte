<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { PriceDisplay } from "$lib/components/services";
  import { cn } from "$lib/utils";

  interface Service {
    id: string;
    name: string;
    description: string | null;
    durationMinutes: number;
    priceType: "fixed" | "starting" | "range";
    priceMin: number;
    priceMax: number | null;
    category: {
      id: string;
      name: string;
    } | null;
  }

  interface StaffService {
    id: string;
    customPrice: number | null;
    service: Service;
  }

  interface StaffMember {
    id: string;
    displayName: string;
    bio: string | null;
    photoUrl: string | null;
    specialties: string[] | null;
    staffServices: StaffService[];
  }

  let { staffMember, class: className }: { staffMember: StaffMember; class?: string } = $props();

  // Group services by category
  let servicesByCategory = $derived.by(() => {
    const grouped: Map<string, { name: string; services: (StaffService & { displayPrice: number })[] }> = new Map();

    for (const ss of staffMember.staffServices) {
      const categoryName = ss.service.category?.name ?? "Other Services";
      const categoryId = ss.service.category?.id ?? "other";

      if (!grouped.has(categoryId)) {
        grouped.set(categoryId, { name: categoryName, services: [] });
      }

      // Use custom price if set, otherwise use service base price
      const displayPrice = ss.customPrice ?? ss.service.priceMin;

      grouped.get(categoryId)!.services.push({
        ...ss,
        displayPrice,
      });
    }

    return Array.from(grouped.values());
  });

  function formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }
    return `${hours} hr ${remainingMinutes} min`;
  }
</script>

<div class={cn("space-y-12", className)}>
  <!-- Profile Header -->
  <div class="grid md:grid-cols-2 gap-8 md:gap-12">
    <!-- Photo -->
    <div class="aspect-[3/4] relative bg-muted rounded-lg overflow-hidden shadow-lg">
      {#if staffMember.photoUrl}
        <img
          src={staffMember.photoUrl}
          alt={staffMember.displayName}
          class="w-full h-full object-cover"
        />
      {:else}
        <div class="w-full h-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-24 w-24 text-muted-foreground/40"
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

    <!-- Details -->
    <div class="space-y-6">
      <div>
        <h1 class="font-heading text-3xl md:text-4xl font-bold tracking-tight mb-4">
          {staffMember.displayName}
        </h1>
        {#if staffMember.bio}
          <p class="text-muted-foreground leading-relaxed">
            {staffMember.bio}
          </p>
        {/if}
      </div>

      {#if staffMember.specialties && staffMember.specialties.length > 0}
        <div>
          <h2 class="font-heading text-xl font-semibold mb-3">Specialties</h2>
          <div class="flex flex-wrap gap-2">
            {#each staffMember.specialties as specialty (specialty)}
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent text-accent-foreground"
              >
                {specialty}
              </span>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Services Section -->
  {#if staffMember.staffServices.length > 0}
    <div class="space-y-8">
      <h2 class="font-heading text-2xl md:text-3xl font-bold tracking-tight">
        Services by {staffMember.displayName}
      </h2>

      {#each servicesByCategory as category (category.name)}
        <div class="space-y-4">
          <h3 class="font-heading text-xl font-semibold text-muted-foreground">
            {category.name}
          </h3>
          <div class="grid gap-4">
            {#each category.services as ss (ss.id)}
              <Card>
                <CardHeader class="py-4">
                  <div class="flex items-start justify-between gap-4">
                    <div class="space-y-1">
                      <CardTitle class="text-base">{ss.service.name}</CardTitle>
                      {#if ss.service.description}
                        <p class="text-sm text-muted-foreground line-clamp-1">
                          {ss.service.description}
                        </p>
                      {/if}
                    </div>
                    <div class="text-right shrink-0">
                      {#if ss.customPrice !== null}
                        <!-- Show custom price -->
                        <span class="text-lg font-semibold">${Math.floor(ss.customPrice / 100)}</span>
                      {:else}
                        <!-- Show service base price with type -->
                        <PriceDisplay
                          priceType={ss.service.priceType}
                          priceMin={ss.service.priceMin}
                          priceMax={ss.service.priceMax}
                        />
                      {/if}
                    </div>
                  </div>
                </CardHeader>
                <CardContent class="pt-0 pb-4">
                  <p class="text-sm text-muted-foreground">
                    {formatDuration(ss.service.durationMinutes)}
                  </p>
                </CardContent>
              </Card>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
