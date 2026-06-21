import axios from 'axios';

const isStaticMode = import.meta.env.VITE_API_MODE === 'static';

// Resolve the API base URL against the site base so it works both at "/" (dev)
// and at "/<repo>/" (GitHub Pages).
function resolveApiBaseURL() {
	const raw = import.meta.env.VITE_API_BASE_URL ?? '/api';
	if (/^https?:\/\//i.test(raw)) return raw;
	const segment = raw.replace(/^\/+|\/+$/g, '');
	const siteBase = new URL(import.meta.env.BASE_URL, 'http://flora.local');
	return new URL(segment, siteBase).pathname;
}

export const apiClient = axios.create({
	baseURL: resolveApiBaseURL(),
	timeout: 15000,
});

if (isStaticMode) {
	// GitHub Pages can't run json-server. The build emits dist/api/<name>.json,
	// so rewrite "/products" -> "/products.json". Query params (pagination) are
	// then applied client-side in the catalogue logic.
	apiClient.interceptors.request.use(config => {
		if (typeof config.url !== 'string' || config.url.length === 0) return config;
		const [pathPart, queryPart] = config.url.split('?', 2);
		if (!pathPart || /\.[a-z0-9]+$/i.test(pathPart)) return config;
		config.url = queryPart ? `${pathPart}.json?${queryPart}` : `${pathPart}.json`;
		return config;
	});
}

export const isStaticApiMode = isStaticMode;
