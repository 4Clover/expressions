<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';
	import type { SbBlokData } from '@storyblok/svelte';
	import { optimizeImage } from '$lib/storyblok';
	import { Card, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';

	interface ServicePreviewCardBlok extends SbBlokData {
		name?: string;
		description?: string;
		icon?: { filename: string; alt?: string };
	}

	let { blok }: { blok: ServicePreviewCardBlok } = $props();

	const iconUrl = $derived(
		blok.icon?.filename ? optimizeImage(blok.icon.filename, 64, 90) : ''
	);
</script>

<div use:storyblokEditable={blok} class="h-full">
	<Card class="h-full">
		<CardHeader>
			{#if iconUrl}
				<img
					src={iconUrl}
					alt={blok.icon?.alt || blok.name || 'Service icon'}
					class="w-12 h-12 mb-4"
					loading="lazy"
				/>
			{/if}
			{#if blok.name}
				<CardTitle>{blok.name}</CardTitle>
			{/if}
			{#if blok.description}
				<CardDescription>{blok.description}</CardDescription>
			{/if}
		</CardHeader>
	</Card>
</div>
