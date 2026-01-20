<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="min-h-screen bg-background text-foreground">
	<!-- Header placeholder for future navigation -->
	<header class="w-full border-b border-border bg-card">
		<nav class="mx-auto max-w-7xl px-6 py-4">
			<span class="text-lg font-semibold tracking-tight">Expressions</span>
		</nav>
	</header>

	<main>
		{@render children()}
	</main>
</div>
