<script lang="ts">
	import { storyblokEditable, renderRichText } from '@storyblok/svelte';
	import type { SbBlokData } from '@storyblok/svelte';

	interface RichTextBlockBlok extends SbBlokData {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		content?: any;
	}

	let { blok }: { blok: RichTextBlockBlok } = $props();

	const contentHtml = $derived(blok.content ? renderRichText(blok.content as Parameters<typeof renderRichText>[0]) : '');
</script>

<div use:storyblokEditable={blok} class="px-6 py-8">
	<div class="mx-auto max-w-3xl prose prose-lg">
		{@html contentHtml}
	</div>
</div>
