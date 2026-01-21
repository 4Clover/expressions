<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "$lib/components/ui/card";
  import { cn } from "$lib/utils";

  interface Staff {
    id: string;
    displayName: string;
    bio: string | null;
    photoUrl: string | null;
    specialties: string[] | null;
  }

  let { staff, class: className }: { staff: Staff; class?: string } = $props();

  // Generate URL-friendly slug from display name
  function slugify(name: string): string {
    return name.toLowerCase().replace(/\s+/g, "-");
  }
</script>

<a href="/staff/{slugify(staff.displayName)}" class="block group">
  <Card class={cn("overflow-hidden", className)}>
    <div class="aspect-[3/4] relative bg-muted">
      {#if staff.photoUrl}
        <img
          src={staff.photoUrl}
          alt={staff.displayName}
          class="w-full h-full object-cover"
          loading="lazy"
        />
      {:else}
        <div class="w-full h-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-16 w-16 text-muted-foreground/40"
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
    <CardHeader class="space-y-2">
      <CardTitle class="font-heading text-xl">{staff.displayName}</CardTitle>
      {#if staff.bio}
        <CardDescription class="line-clamp-2">{staff.bio}</CardDescription>
      {/if}
    </CardHeader>
    {#if staff.specialties && staff.specialties.length > 0}
      <CardContent class="pt-0">
        <div class="flex flex-wrap gap-1.5">
          {#each staff.specialties as specialty}
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground"
            >
              {specialty}
            </span>
          {/each}
        </div>
      </CardContent>
    {/if}
  </Card>
</a>
