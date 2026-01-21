# Svelte 5 Patterns - Quick Reference

## Props
```typescript
// CORRECT - Svelte 5
interface Props {
  name: string;
  optional?: number;
  bindable?: string;
  class?: string;
}
let { name, optional = 42, bindable = $bindable(), class: className }: Props = $props();

// WRONG - Svelte 4 (deprecated)
export let name: string;
```

## Reactive Derivations
```typescript
// CORRECT
let doubled = $derived(count * 2);
let complex = $derived.by(() => { /* multi-line */ return result; });

// WRONG - captures initial value only
const doubled = count * 2;
```

## Event Handlers
```typescript
// CORRECT - Svelte 5
<button onclick={handleClick}>

// WRONG - Svelte 4
<button on:click={handleClick}>
```

## Slots/Children
```svelte
<!-- CORRECT - Svelte 5 -->
{@render children?.()}

<!-- WRONG - Svelte 4 -->
<slot />
```

## One-time Prop Capture (untrack)
```typescript
// When you intentionally want initial value only (e.g., filter state)
import { untrack } from 'svelte';

let initialFilter = untrack(() => props.filter);

// Use $derived for reactive prop-derived values
let displayValue = $derived(props.value.toUpperCase());
```

## Storyblok Bridge Pattern (Svelte 5)
```typescript
// $derived with fallback for live editing
let content = $derived(liveStory ?? story);
```
