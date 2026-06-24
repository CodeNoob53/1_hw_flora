import axios from 'axios';

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
