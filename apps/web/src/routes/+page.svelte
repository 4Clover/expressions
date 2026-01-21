<script lang="ts">
	import { StoryblokComponent, useStoryblokBridge } from '@storyblok/svelte';
	import { browser } from '$app/environment';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui/card';

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
	<title>Expressions Hair Designs</title>
	<meta name="description" content="Professional hair styling services - Book your appointment today" />
</svelte:head>

{#if story}
	<!-- CMS-driven content -->
	<StoryblokComponent blok={story.content} />
{:else}
	<!-- Fallback content when CMS not configured -->

	<!-- Hero Section -->
	<section class="px-6 py-24 md:py-32 lg:py-40">
		<div class="mx-auto max-w-4xl text-center space-y-8">
			<h1 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
				Expressions Hair Designs
			</h1>
			<p class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
				Where artistry meets expertise. Experience personalized hair care in a relaxing,
				welcoming atmosphere.
			</p>
			<div class="pt-4">
				<Button size="lg">Book Now</Button>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section class="px-6 py-16 md:py-24 bg-muted/50">
		<div class="mx-auto max-w-6xl">
			<h2 class="text-2xl md:text-3xl font-bold text-center mb-12">
				Why choose Expressions
			</h2>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
				<Card>
					<CardHeader>
						<CardTitle>Expert stylists</CardTitle>
						<CardDescription>
							Our experienced team stays current with the latest techniques and trends.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							From classic cuts to modern styles, color treatments to special occasion styling,
							we bring your vision to life.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Personalized care</CardTitle>
						<CardDescription>
							Every client receives a consultation to understand their unique needs.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							We take time to listen and recommend solutions tailored to your hair type,
							lifestyle, and personal style.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Premium products</CardTitle>
						<CardDescription>
							We use only professional-grade products for lasting results.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p class="text-sm text-muted-foreground">
							Quality products protect your hair while delivering the beautiful, healthy
							results you deserve.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="px-6 py-16 md:py-24">
		<div class="mx-auto max-w-2xl text-center space-y-6">
			<h2 class="text-2xl md:text-3xl font-bold">
				Ready for your transformation?
			</h2>
			<p class="text-muted-foreground">
				Book your appointment today and discover the Expressions difference.
			</p>
			<Button>Schedule appointment</Button>
		</div>
	</section>

{/if}
