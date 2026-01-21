import { apiPlugin, storyblokInit } from '@storyblok/svelte';
import type { SbSvelteComponentsMap } from '@storyblok/svelte';
import Page from '$lib/components/storyblok/Page.svelte';
import Hero from '$lib/components/storyblok/Hero.svelte';
import ServicesOverview from '$lib/components/storyblok/ServicesOverview.svelte';
import ServicePreviewCard from '$lib/components/storyblok/ServicePreviewCard.svelte';
import StaffHighlights from '$lib/components/storyblok/StaffHighlights.svelte';
import ContactInfo from '$lib/components/storyblok/ContactInfo.svelte';
import RichTextBlock from '$lib/components/storyblok/RichTextBlock.svelte';
import Gallery from '$lib/components/storyblok/Gallery.svelte';

/**
 * Initialize Storyblok SDK with component registration.
 * Call this at module level in +layout.ts before any content fetching.
 */
export function initStoryblok() {
	// Type assertion needed for Svelte 5 component compatibility
	const components = {
		page: Page,
		hero: Hero,
		'services-overview': ServicesOverview,
		'service-preview-card': ServicePreviewCard,
		'staff-highlights': StaffHighlights,
		'contact-info': ContactInfo,
		'rich-text-block': RichTextBlock,
		gallery: Gallery
	} as unknown as SbSvelteComponentsMap;

	storyblokInit({
		accessToken: import.meta.env.VITE_STORYBLOK_ACCESS_TOKEN,
		apiOptions: {
			region: 'us'
		},
		use: [apiPlugin],
		components
	});
}

/**
 * Optimize Storyblok image URL using the Image Service.
 * Appends transformation parameters for resizing and quality.
 *
 * @param url - Original Storyblok image URL
 * @param width - Target width (height auto-calculated to maintain aspect ratio)
 * @param quality - JPEG/WebP quality (1-100)
 * @returns Optimized image URL
 */
export function optimizeImage(url: string, width: number = 800, quality: number = 80): string {
	if (!url) return '';
	return `${url}/m/${width}x0/filters:quality(${quality})`;
}
