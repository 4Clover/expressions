import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { storyblokApi } = await parent();

	try {
		const response = await storyblokApi.get('cdn/stories/contact', {
			version: import.meta.env.DEV ? 'draft' : 'published'
		});
		return { story: response.data.story };
	} catch {
		// Story doesn't exist yet - return null for fallback display
		return { story: null };
	}
};
