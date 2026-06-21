/**
 * Catalogue module
 * Loads the Bouquets catalogue from the API and handles "Show More" pagination.
 * Items are appended (load-more), not replaced.
 */

import { apiClient, isStaticApiMode } from './apiClient.js';
import { showErrorNotification } from './notifications.js';
import { extractErrorMessage, escapeHtml, formatPrice, buildProductPicture } from './utils.js';
import { cacheProducts } from './productStore.js';
import { LIMITS } from './constants.js';

const list = document.getElementById('bouquets-list');
const loader = document.getElementById('bouquets-loader');
const status = document.getElementById('bouquets-status');
const showMoreButton = document.getElementById('bouquets-show-more');

// Single source of truth for the catalogue UI.
const appState = {
	page: 0,
	totalPages: 1,
	total: 0,
	loadedIds: new Set(),
	isLoading: false,
};

/**
 * Items loaded per request. The layout shows 8 bouquets per "page" on every
 * viewport, so the limit is constant — kept as a function to mirror the
 * viewport-aware pattern used across the codebase.
 * @returns {number}
 */
const getLimit = () => LIMITS.BOUQUETS;

/**
 * Toggle the initial-load spinner and busy state on the list.
 * @param {boolean} isLoading
 */
function setInitialLoading(isLoading) {
	if (loader) loader.hidden = !isLoading;
	if (list) list.setAttribute('aria-busy', isLoading ? 'true' : 'false');
}

/**
 * Toggle the "Show More" button loading/disabled state.
 * @param {boolean} isLoading
 */
function setShowMoreLoading(isLoading) {
	if (!showMoreButton) return;
	showMoreButton.disabled = isLoading;
	showMoreButton.textContent = isLoading ? 'Loading…' : 'Show More';
}

/**
 * Show a status message (empty/end/error) or hide it when message is falsy.
 * @param {string} [message]
 */
function setStatusMessage(message) {
	if (!status) return;
	status.textContent = message ?? '';
	status.hidden = !message;
}

/**
 * Build the markup for a single bouquet card.
 * @param {object} product
 * @returns {string}
 */
function buildCardMarkup(product) {
	const picture = buildProductPicture(product, {
		imageClass: 'bouquets-card-image',
		width: 335,
		height: 296,
	});

	return `
		<li class="bouquets-item">
			<div class="product-card" data-id="${escapeHtml(product.id)}">
				${picture}
				<div class="product-card-content">
					<div class="product-card-header">
						<h3 class="product-card-title">${escapeHtml(product.title)}</h3>
						<p class="product-card-text">${escapeHtml(product.text)}</p>
					</div>
					<p class="product-card-price">${escapeHtml(formatPrice(product.price))}</p>
				</div>
			</div>
		</li>`;
}

/**
 * Render a chunk of products. One insertAdjacentHTML call for the whole chunk —
 * no per-item appendChild. Skips products already on screen to avoid duplicates.
 * @param {object[]} products
 * @param {{ replace: boolean }} options
 */
function renderChunk(products, { replace }) {
	if (!list) return;
	if (replace) {
		list.replaceChildren();
		appState.loadedIds.clear();
	}

	const fresh = products.filter(product => !appState.loadedIds.has(product.id));
	fresh.forEach(product => appState.loadedIds.add(product.id));

	if (fresh.length > 0) {
		cacheProducts(fresh);
		list.insertAdjacentHTML('beforeend', fresh.map(buildCardMarkup).join(''));
	}
}

/**
 * Normalize the API payload. json-server v1 returns { data, pages, items };
 * static mode returns a plain array sliced client-side.
 * @param {object|object[]} body
 * @param {number} requestedPage
 * @returns {{ products: object[], totalPages: number, total: number }}
 */
function normalizeResponse(body, requestedPage) {
	const limit = getLimit();

	if (Array.isArray(body)) {
		const start = (requestedPage - 1) * limit;
		const slice = body.slice(start, start + limit);
		return {
			products: slice,
			totalPages: Math.max(1, Math.ceil(body.length / limit)),
			total: body.length,
		};
	}

	const products = Array.isArray(body?.data) ? body.data : [];
	const totalPages = Number(body?.pages);
	const total = Number(body?.items);
	return {
		products,
		totalPages: Number.isFinite(totalPages) && totalPages >= 1 ? totalPages : 1,
		total: Number.isFinite(total) ? total : products.length,
	};
}

/**
 * Hide the "Show More" button once the last page has been loaded.
 */
function updateShowMoreVisibility() {
	if (!showMoreButton) return;
	showMoreButton.hidden = appState.page >= appState.totalPages;
}

/**
 * Fetch one page and render it. Appends when `append` is true, otherwise
 * replaces the list (initial load / reset).
 * @param {number} page
 * @param {{ append: boolean }} options
 */
async function fetchAndRender(page, { append }) {
	if (appState.isLoading) return;
	appState.isLoading = true;

	if (append) {
		setShowMoreLoading(true);
	} else {
		setInitialLoading(true);
		setStatusMessage('');
		if (showMoreButton) showMoreButton.hidden = true;
	}

	try {
		const params = isStaticApiMode
			? {}
			: { _page: page, _per_page: getLimit(), category: 'bouquet' };

		const response = await apiClient.get('/products', { params });
		const { products, totalPages, total } = normalizeResponse(response.data, page);

		// Static mode returns the full collection; keep only bouquets.
		const bouquets = products.filter(p => !p.category || p.category === 'bouquet');

		renderChunk(bouquets, { replace: !append });
		appState.page = page;
		appState.totalPages = totalPages;
		appState.total = total;

		if (appState.loadedIds.size === 0) {
			setStatusMessage('No bouquets available right now. Please check back soon.');
		} else if (appState.page >= appState.totalPages) {
			setStatusMessage("You've reached the end — that's all our bouquets for now.");
		} else {
			setStatusMessage('');
		}

		updateShowMoreVisibility();
	} catch (err) {
		console.error('Failed to load bouquets:', err);
		showErrorNotification(extractErrorMessage(err));
		if (!append && appState.loadedIds.size === 0) {
			setStatusMessage('Could not load bouquets. Please try again later.');
		}
	} finally {
		appState.isLoading = false;
		if (append) {
			setShowMoreLoading(false);
		} else {
			setInitialLoading(false);
		}
	}
}

/**
 * Reset state and load the first page (used on init; would also be called by a
 * filter/search change to reset pagination to page 1).
 */
function resetAndLoad() {
	appState.page = 0;
	appState.totalPages = 1;
	appState.total = 0;
	appState.loadedIds.clear();
	fetchAndRender(1, { append: false });
}

/**
 * Handle a "Show More" click — load and append the next page.
 */
function handleShowMore() {
	fetchAndRender(appState.page + 1, { append: true });
}

/**
 * Wire up the catalogue. Guards against duplicate listeners.
 */
function initCatalogue() {
	if (!list) return;

	if (showMoreButton && showMoreButton.dataset.listenerAttached !== 'true') {
		showMoreButton.dataset.listenerAttached = 'true';
		showMoreButton.addEventListener('click', handleShowMore);
	}

	resetAndLoad();
}

initCatalogue();
