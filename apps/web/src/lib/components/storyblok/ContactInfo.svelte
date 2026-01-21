<script lang="ts">
	import { storyblokEditable, renderRichText } from '@storyblok/svelte';
	import type { SbBlokData } from '@storyblok/svelte';

	interface ContactInfoBlok extends SbBlokData {
		address?: string;
		phone?: string;
		email?: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		hours?: any;
		google_maps_embed_url?: string;
	}

	let { blok }: { blok: ContactInfoBlok } = $props();

	const hoursHtml = $derived(blok.hours ? renderRichText(blok.hours as Parameters<typeof renderRichText>[0]) : '');
</script>

<section use:storyblokEditable={blok} class="px-6 py-16 md:py-24">
	<div class="mx-auto max-w-6xl grid md:grid-cols-2 gap-12">
		<div class="space-y-8">
			<div>
				<h2 class="text-2xl font-bold mb-4">Contact Us</h2>
				{#if blok.address}
					<p class="text-muted-foreground">{blok.address}</p>
				{/if}
				{#if blok.phone}
					<p class="mt-2">
						<a
							href="tel:{blok.phone.replace(/\D/g, '')}"
							class="text-primary hover:underline"
						>
							{blok.phone}
						</a>
					</p>
				{/if}
				{#if blok.email}
					<p class="mt-2">
						<a
							href="mailto:{blok.email}"
							class="text-primary hover:underline"
						>
							{blok.email}
						</a>
					</p>
				{/if}
			</div>

			{#if hoursHtml}
				<div>
					<h3 class="text-xl font-semibold mb-3">Hours</h3>
					<div class="prose prose-sm">
						{@html hoursHtml}
					</div>
				</div>
			{/if}
		</div>

		<div class="h-[400px] rounded-lg overflow-hidden shadow">
			{#if blok.google_maps_embed_url}
				<iframe
					title="Salon Location"
					width="100%"
					height="100%"
					style="border:0"
					loading="lazy"
					allowfullscreen
					referrerpolicy="no-referrer-when-downgrade"
					src={blok.google_maps_embed_url}
				></iframe>
			{:else}
				<div class="w-full h-full bg-muted flex items-center justify-center">
					<p class="text-muted-foreground">Map not configured</p>
				</div>
			{/if}
		</div>
	</div>
</section>
