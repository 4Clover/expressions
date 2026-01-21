import { initStoryblok } from '$lib/storyblok';
import { useStoryblokApi } from '@storyblok/svelte';

// Initialize Storyblok SDK at module level (before load runs)
initStoryblok();

export async function load() {
	const storyblokApi = useStoryblokApi();

	return {
		storyblokApi
	};
}
