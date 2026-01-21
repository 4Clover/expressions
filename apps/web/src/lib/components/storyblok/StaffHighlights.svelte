<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';
	import type { SbBlokData } from '@storyblok/svelte';
	import { Card, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';

	interface StaffHighlightsBlok extends SbBlokData {
		headline?: string;
		description?: string;
		staff_ids?: string[];
	}

	let { blok }: { blok: StaffHighlightsBlok } = $props();
</script>

<section use:storyblokEditable={blok} class="px-6 py-16 md:py-24">
	<div class="mx-auto max-w-6xl">
		{#if blok.headline}
			<h2 class="text-2xl md:text-3xl font-bold text-center mb-4">
				{blok.headline}
			</h2>
		{/if}

		{#if blok.description}
			<p class="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
				{blok.description}
			</p>
		{/if}

		{#if blok.staff_ids && blok.staff_ids.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
				{#each blok.staff_ids as staffId (staffId)}
					<!-- Placeholder card - will fetch staff data from DB in Plan 02-03 -->
					<Card class="h-full">
						<CardHeader class="text-center">
							<div class="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
								<span class="text-muted-foreground text-sm">Photo</span>
							</div>
							<CardTitle>Staff Member</CardTitle>
							<CardDescription>ID: {staffId}</CardDescription>
						</CardHeader>
					</Card>
				{/each}
			</div>
		{:else}
			<p class="text-center text-muted-foreground">No staff members selected.</p>
		{/if}
	</div>
</section>
