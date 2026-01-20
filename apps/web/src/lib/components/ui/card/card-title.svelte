<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { cn } from "$lib/utils";

  interface Props extends HTMLAttributes<HTMLHeadingElement> {
    class?: string;
    children?: Snippet;
  }

  let { class: className, children, ...restProps }: Props = $props();
</script>

<h3
  class={cn("text-lg font-semibold leading-none tracking-tight", className)}
  {...restProps}
>
  {#if children}
    {@render children()}
  {/if}
</h3>
