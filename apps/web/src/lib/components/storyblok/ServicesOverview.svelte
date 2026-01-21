<script lang="ts">
	import { storyblokEditable, StoryblokComponent } from '@storyblok/svelte';
	import type { SbBlokData } from '@storyblok/svelte';

	interface ServicesOverviewBlok extends SbBlokData {
		headline?: string;
		services?: SbBlokData[];
	}

	let { blok }: { blok: ServicesOverviewBlok } = $props();
</script>

<section use:storyblokEditable={blok} class="px-6 py-16 md:py-24 bg-muted/50">
	<div class="mx-auto max-w-6xl">
		{#if blok.headline}
			<h2 class="text-2xl md:text-3xl font-bold text-center mb-12">
				{blok.headline}
			</h2>
		{/if}

		{#if blok.services && blok.services.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
				{#each blok.services as service (service._uid)}
					<StoryblokComponent blok={service} />
				{/each}
			</div>
		{/if}
	</div>
</section>
