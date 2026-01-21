<script lang="ts">
  /**
   * BookingProgress - Step indicator for booking wizard
   *
   * Shows 1-4 circles with connecting lines indicating progress through the booking flow.
   * Completed steps show checkmarks, current step is highlighted, future steps are muted.
   */

  import { cn } from "$lib/utils";

  let {
    steps,
    currentStep,
    class: className,
  }: {
    steps: string[];
    currentStep: number;
    class?: string;
  } = $props();
</script>

<div class={cn("mb-8", className)}>
  <div class="flex items-center justify-between">
    {#each steps as _, i (i)}
      <div class="flex items-center">
        <div
          class={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
            i + 1 < currentStep && "bg-primary text-primary-foreground",
            i + 1 === currentStep && "bg-primary text-primary-foreground ring-4 ring-primary/20",
            i + 1 > currentStep && "bg-muted text-muted-foreground"
          )}
        >
          {#if i + 1 < currentStep}
            <!-- Checkmark for completed steps -->
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          {:else}
            {i + 1}
          {/if}
        </div>
        {#if i < steps.length - 1}
          <!-- Connecting line between steps -->
          <div
            class={cn(
              "w-12 sm:w-24 h-1 mx-2 transition-colors",
              i + 1 < currentStep ? "bg-primary" : "bg-muted"
            )}
          ></div>
        {/if}
      </div>
    {/each}
  </div>
  <!-- Step labels -->
  <div class="flex justify-between mt-2 text-xs sm:text-sm text-muted-foreground">
    {#each steps as stepLabel, i (i)}
      <span class={cn(
        "w-8 sm:w-auto text-center",
        i + 1 === currentStep && "text-foreground font-medium"
      )}>{stepLabel}</span>
    {/each}
  </div>
</div>
