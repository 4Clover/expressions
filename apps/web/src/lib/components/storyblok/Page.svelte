<script lang="ts">
	import { storyblokEditable, StoryblokComponent } from '@storyblok/svelte';
	import type { SbBlokData } from '@storyblok/svelte';

	interface PageBlok extends SbBlokData {
		body?: SbBlokData[];
	}

	let { blok }: { blok: PageBlok } = $props();
</script>

<div use:storyblokEditable={blok}>
	{#if blok.body}
		{#each blok.body as bodyBlok (bodyBlok._uid)}
			<StoryblokComponent blok={bodyBlok} />
		{/each}
	{/if}
</div>
