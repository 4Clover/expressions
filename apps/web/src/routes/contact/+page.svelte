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
	<title>Contact | Expressions Hair Designs</title>
	<meta name="description" content="Contact Expressions Hair Designs - find our location, hours, and get in touch" />
</svelte:head>

{#if story}
	<!-- CMS-driven content -->
	<StoryblokComponent blok={story.content} />
{:else}
	<!-- Fallback content when CMS not configured -->
	<section class="px-6 py-16 md:py-24">
		<div class="mx-auto max-w-6xl">
			<div class="text-center space-y-4 mb-12">
				<h1 class="text-4xl md:text-5xl font-bold tracking-tight">
					Contact Us
				</h1>
				<p class="text-lg text-muted-foreground max-w-2xl mx-auto">
					We would love to hear from you
				</p>
			</div>

			<div class="grid md:grid-cols-2 gap-12">
				<div class="space-y-8">
					<div>
						<h2 class="text-xl font-semibold mb-4">Location</h2>
						<p class="text-muted-foreground">
							123 Main Street<br />
							Your City, ST 12345
						</p>
					</div>

					<div>
						<h2 class="text-xl font-semibold mb-4">Phone</h2>
						<p>
							<a href="tel:+15551234567" class="text-primary hover:underline">
								(555) 123-4567
							</a>
						</p>
					</div>

					<div>
						<h2 class="text-xl font-semibold mb-4">Hours</h2>
						<ul class="space-y-2 text-muted-foreground">
							<li class="flex justify-between max-w-xs">
								<span>Monday - Friday</span>
								<span>9:00 AM - 7:00 PM</span>
							</li>
							<li class="flex justify-between max-w-xs">
								<span>Saturday</span>
								<span>9:00 AM - 5:00 PM</span>
							</li>
							<li class="flex justify-between max-w-xs">
								<span>Sunday</span>
								<span>Closed</span>
							</li>
						</ul>
					</div>
				</div>

				<div class="h-[400px] rounded-lg overflow-hidden shadow">
					<div class="w-full h-full bg-muted flex items-center justify-center">
						<p class="text-muted-foreground">Map will appear here</p>
					</div>
				</div>
			</div>
		</div>
	</section>
{/if}
