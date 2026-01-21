<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';
	import type { SbBlokData } from '@storyblok/svelte';
	import { optimizeImage } from '$lib/storyblok';
	import Button from '$lib/components/ui/button/button.svelte';

	interface HeroBlok extends SbBlokData {
		headline?: string;
		subheadline?: string;
		background_image?: { filename: string; alt?: string };
		cta_text?: string;
		cta_link?: { cached_url?: string; url?: string };
	}

	let { blok }: { blok: HeroBlok } = $props();

	const ctaHref = $derived(blok.cta_link?.cached_url || blok.cta_link?.url || '#');
	const bgImageUrl = $derived(
		blok.background_image?.filename ? optimizeImage(blok.background_image.filename, 1920, 85) : ''
	);
</script>

<section
	use:storyblokEditable={blok}
	class="relative px-6 py-24 md:py-32 lg:py-40"
	style={bgImageUrl ? `background-image: url('${bgImageUrl}'); background-size: cover; background-position: center;` : ''}
>
	{#if bgImageUrl}
		<div class="absolute inset-0 bg-background/70"></div>
	{/if}

	<div class="relative mx-auto max-w-4xl text-center space-y-8">
		{#if blok.headline}
			<h1 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
				{blok.headline}
			</h1>
		{/if}

		{#if blok.subheadline}
			<p class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
				{blok.subheadline}
			</p>
		{/if}

		{#if blok.cta_text}
			<div class="pt-4">
				<a href={ctaHref}>
					<Button size="lg">{blok.cta_text}</Button>
				</a>
			</div>
		{/if}
	</div>
</section>
