import { apiClient, isStaticApiMode } from './apiClient.js';
import { showErrorNotification } from './notifications.js';
import { extractErrorMessage, escapeHtml, formatPrice, buildProductPicture } from './utils.js';
import { cacheProducts } from './productStore.js';

const PER_PAGE = 8;

const list = document.getElementById('bouquets-list');
const loader = document.getElementById('bouquets-loader');
const status = document.getElementById('bouquets-status');
const showMoreButton = document.getElementById('bouquets-show-more');

// Single source of truth for the catalogue UI.
const state = {
	page: 0,
	totalPages: 1,
	total: 0,
	loadedIds: new Set(),
	isLoading: false,
};

function setInitialLoading(isLoading) {
	if (loader) loader.hidden = !isLoading;
	if (list) list.setAttribute('aria-busy', isLoading ? 'true' : 'false');
}

function setShowMoreLoading(isLoading) {
	if (!showMoreButton) return;
	showMoreButton.disabled = isLoading;
	showMoreButton.textContent = isLoading ? 'Loading…' : 'Show More';
}

function setStatusMessage(message) {
	if (!status) return;
	status.textContent = message ?? '';
	status.hidden = !message;
}

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

// One insertAdjacentHTML call for the whole chunk — no per-item appendChild.
function renderChunk(products, { replace }) {
	if (!list) return;
	if (replace) {
		list.replaceChildren();
		state.loadedIds.clear();
	}

	const fresh = products.filter(product => !state.loadedIds.has(product.id));
	fresh.forEach(product => state.loadedIds.add(product.id));

	if (fresh.length > 0) {
		cacheProducts(fresh);
		list.insertAdjacentHTML('beforeend', fresh.map(buildCardMarkup).join(''));
	}
}

// json-server v1 returns { data, pages, items, ... }; static mode returns a plain array.
function normalizeResponse(body, requestedPage) {
	if (Array.isArray(body)) {
		// Static mode: full collection in one file — slice client-side.
		const start = (requestedPage - 1) * PER_PAGE;
		const slice = body.slice(start, start + PER_PAGE);
		return {
			products: slice,
			totalPages: Math.max(1, Math.ceil(body.length / PER_PAGE)),
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

function updateShowMoreVisibility() {
	if (!showMoreButton) return;
	const reachedLastPage = state.page >= state.totalPages;
	showMoreButton.hidden = reachedLastPage;
}

async function loadPage(page, { append }) {
	if (state.isLoading) return;
	state.isLoading = true;

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
			: { _page: page, _per_page: PER_PAGE, category: 'bouquet' };

		const response = await apiClient.get('/products', { params });
		const { products, totalPages, total } = normalizeResponse(response.data, page);

		// In static mode we already filter to bouquets client-side here.
		const bouquets = products.filter(p => !p.category || p.category === 'bouquet');

		renderChunk(bouquets, { replace: !append });
		state.page = page;
		state.totalPages = totalPages;
		state.total = total;

		if (state.loadedIds.size === 0) {
			setStatusMessage('No bouquets available right now. Please check back soon.');
		} else if (state.page >= state.totalPages) {
			setStatusMessage("You've reached the end — that's all our bouquets for now.");
		} else {
			setStatusMessage('');
		}

		updateShowMoreVisibility();
	} catch (error) {
		showErrorNotification(extractErrorMessage(error));
		if (!append && state.loadedIds.size === 0) {
			setStatusMessage('Could not load bouquets. Please try again later.');
		}
	} finally {
		state.isLoading = false;
		if (append) {
			setShowMoreLoading(false);
		} else {
			setInitialLoading(false);
		}
	}
}

function resetAndLoad() {
	state.page = 0;
	state.totalPages = 1;
	state.total = 0;
	state.loadedIds.clear();
	loadPage(1, { append: false });
}

function init() {
	if (!list) return;
	showMoreButton?.addEventListener('click', () => {
		loadPage(state.page + 1, { append: true });
	});
	resetAndLoad();
}

init();
