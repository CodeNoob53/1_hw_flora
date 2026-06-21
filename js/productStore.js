import { apiClient } from './apiClient.js';

// Shared product cache so the modal can resolve a product by id regardless of
// which list (catalogue or bestsellers) the user clicked, without re-fetching.
const byId = new Map();
let allProductsPromise = null;

export function cacheProducts(products) {
	products.forEach(product => byId.set(String(product.id), product));
}

export function getCachedProduct(id) {
	return byId.get(String(id));
}

// Lazily fetch the full collection once; used as a fallback when a clicked
// product isn't already cached (e.g. on a fresh page load before scrolling).
export async function getAllProducts() {
	if (!allProductsPromise) {
		allProductsPromise = apiClient
			.get('/products')
			.then(response => {
				const data = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
				cacheProducts(data);
				return data;
			})
			.catch(error => {
				allProductsPromise = null;
				throw error;
			});
	}
	return allProductsPromise;
}
