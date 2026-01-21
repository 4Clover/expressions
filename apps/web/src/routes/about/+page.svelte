<script lang="ts">
	import { StoryblokComponent, useStoryblokBridge } from '@storyblok/svelte';
	import { browser } from '$app/environment';

	let { data } = $props();

	// Reactive story state for live editing - track updates from Storyblok bridge
	let storyFromBridge = $state<typeof data.story>(null);
	let story = $derived(storyFromBridge ?? data.story);

	// Setup Storyblok bridge for live editing in browser
	$effect(() => {
		if (browser && data.story) {
			useStoryblokBridge(data.story.id, (newStory) => (storyFromBridge = newStory));
		}
	});
</script>

<svelte:head>
	<title>About | Expressions Hair Designs</title>
	<meta name="description" content="Learn about Expressions Hair Designs - our story, team, and commitment to exceptional hair care" />
</svelte:head>

{#if story}
	<!-- CMS-driven content -->
	<StoryblokComponent blok={story.content} />
{:else}
	<!-- Fallback content when CMS not configured -->
	<section class="px-6 py-16 md:py-24">
		<div class="mx-auto max-w-4xl space-y-12">
			<div class="text-center space-y-4">
				<h1 class="text-4xl md:text-5xl font-bold tracking-tight">
					About Expressions
				</h1>
				<p class="text-lg text-muted-foreground max-w-2xl mx-auto">
					Where artistry meets expertise
				</p>
			</div>

			<div class="prose prose-lg max-w-none">
				<h2>Our Story</h2>
				<p>
					Expressions Hair Designs has been a cornerstone of our community, providing exceptional
					hair care services in a welcoming, relaxed atmosphere. Our team of experienced stylists
					is dedicated to helping you look and feel your best.
				</p>
				<p>
					We believe that great hair is about more than just technique - it is about understanding
					each client's unique style, lifestyle, and hair goals. That is why every visit begins
					with a thorough consultation to ensure we deliver exactly what you envision.
				</p>

				<h2>Our Commitment</h2>
				<p>
					We are committed to staying current with the latest trends and techniques while using
					only premium, professional-grade products. Your satisfaction and the health of your
					hair are our top priorities.
				</p>
			</div>

			<div class="bg-muted/50 rounded-lg p-8 text-center">
				<div class="w-full h-48 bg-muted rounded flex items-center justify-center mb-4">
					<span class="text-muted-foreground">Salon photo will appear here</span>
				</div>
				<p class="text-sm text-muted-foreground">
					Visit our salon to experience the Expressions difference
				</p>
			</div>
		</div>
	</section>
{/if}
