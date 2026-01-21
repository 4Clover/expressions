<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';
	import type { SbBlokData } from '@storyblok/svelte';
	import { Card, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { browser } from '$app/environment';

	interface StaffMember {
		id: string;
		displayName: string;
		photoUrl: string | null;
		bio: string | null;
		specialties: string[] | null;
	}

	interface StaffHighlightsBlok extends SbBlokData {
		headline?: string;
		description?: string;
		staff_ids?: string[];
	}

	let { blok }: { blok: StaffHighlightsBlok } = $props();

	// Fetch staff data from API
	let staffMembers = $state<StaffMember[]>([]);
	let loading = $state(true);

	$effect(() => {
		if (browser) {
			fetch('/api/staff')
				.then(r => r.json())
				.then(data => {
					staffMembers = data.staff;
					loading = false;
				})
				.catch(() => {
					staffMembers = [];
					loading = false;
				});
		}
	});

	// Filter staff if CMS specifies staff_ids, otherwise show all
	let displayStaff = $derived(() => {
		if (blok.staff_ids && blok.staff_ids.length > 0) {
			return staffMembers.filter(s => blok.staff_ids!.includes(s.id));
		}
		return staffMembers;
	});

	// Convert display name to URL slug
	function toSlug(name: string): string {
		return name.toLowerCase().replace(/\s+/g, '-');
	}
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

		{#if loading}
			<!-- Loading skeleton -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
				{#each [1, 2, 3] as i (i)}
					<Card class="h-full animate-pulse">
						<CardHeader class="text-center">
							<div class="w-24 h-24 mx-auto mb-4 rounded-full bg-muted"></div>
							<div class="h-6 bg-muted rounded w-32 mx-auto mb-2"></div>
							<div class="h-4 bg-muted rounded w-48 mx-auto"></div>
						</CardHeader>
					</Card>
				{/each}
			</div>
		{:else if displayStaff().length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
				{#each displayStaff() as member (member.id)}
					<a href="/staff/{toSlug(member.displayName)}" class="block group">
						<Card class="h-full transition-shadow hover:shadow-lg">
							<CardHeader class="text-center">
								{#if member.photoUrl}
									<img
										src={member.photoUrl}
										alt={member.displayName}
										class="w-24 h-24 mx-auto mb-4 rounded-full object-cover"
									/>
								{:else}
									<div class="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
										<span class="text-muted-foreground text-2xl font-medium">
											{member.displayName.charAt(0)}
										</span>
									</div>
								{/if}
								<CardTitle class="group-hover:text-primary transition-colors">
									{member.displayName}
								</CardTitle>
								{#if member.specialties && member.specialties.length > 0}
									<div class="flex flex-wrap gap-1.5 justify-center mt-3">
										{#each member.specialties.slice(0, 3) as specialty (specialty)}
											<Badge variant="secondary" class="text-xs">
												{specialty}
											</Badge>
										{/each}
									</div>
								{/if}
							</CardHeader>
						</Card>
					</a>
				{/each}
			</div>
		{:else}
			<p class="text-center text-muted-foreground">
				Our talented team will be featured here soon.
			</p>
		{/if}
	</div>
</section>
