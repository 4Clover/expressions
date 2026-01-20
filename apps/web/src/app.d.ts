/// <reference types="@sveltejs/kit" />

declare global {
	namespace App {
		interface Platform {
			env: {
				// Cloudflare bindings will be added here as needed
				// KV: KVNamespace;
				// DB: D1Database;
			};
		}
		interface Error {
			message: string;
			code?: string;
		}
		interface Locals {}
		interface PageData {}
		interface PageState {}
	}
}

export {};
