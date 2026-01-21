<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { cn } from "$lib/utils";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    class?: string;
    children?: Snippet;
  }

  let { class: className, children, ...restProps }: Props = $props();
</script>

<div
  class={cn(
    "rounded-lg border border-border bg-card text-card-foreground shadow",
    "transition-all duration-[var(--transition-smooth)]",
    "hover:shadow-lg",
    className
  )}
  {...restProps}
>
  {#if children}
    {@render children()}
  {/if}
</div>
