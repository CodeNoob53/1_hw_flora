/**
 * Bestsellers module
 * Loads the Top-Selling bouquets (top by order count) and presents them in a
 * finite paged carousel. Cards animate in on first render.
 */

import { apiClient, isStaticApiMode } from './apiClient.js';
import { showErrorNotification } from './notifications.js';
import { extractErrorMessage, normalizeApiResponse, setStatusMessage, buildProductCard } from './utils.js';
import { cacheProducts } from './productStore.js';
import { createCarousel, perViewByBreakpoint } from './carousel.js';

const TOP_COUNT = 18;

const viewport = document.getElementById('bestsellers-viewport');
const list = document.getElementById('bestsellers-list');
const dots = document.getElementById('bestsellers-dots');
const status = document.getElementById('bestsellers-status');
const prevButton = document.getElementById('bestsellers-prev');
const nextButton = document.getElementById('bestsellers-next');

function buildItemMarkup(product) {
	return buildProductCard(product, {
		containerClass: 'bestsellers-item',
		imageClass: 'bestsellers-card-image',
		imageWidth: 335,
		imageHeight: 320,
	});
}

async function init() {
	if (!list || !viewport) return;
	list.setAttribute('aria-busy', 'true');

	try {
		// Sort by orders desc and take the top N. In dev we can ask json-server
		// to sort/limit; in static mode we sort the full array client-side.
		const params = isStaticApiMode ? {} : { _page: 1, _per_page: TOP_COUNT };
		const response = await apiClient.get('/products', { params });
		const items = [...normalizeApiResponse(response)]
			.sort((a, b) => (b.orders ?? 0) - (a.orders ?? 0))
			.slice(0, TOP_COUNT);

		if (items.length === 0) {
			setStatusMessage(status, 'No bestsellers to show right now.');
			return;
		}

		cacheProducts(items);
		list.insertAdjacentHTML('beforeend', items.map(buildItemMarkup).join(''));

		const carousel = createCarousel({
			viewport,
			track: list,
			prevButton,
			nextButton,
			dots,
			getPerView: perViewByBreakpoint,
		});
		carousel.update();
	} catch (error) {
		console.error('Failed to load bestsellers:', error);
		showErrorNotification(extractErrorMessage(error));
		setStatusMessage(status, 'Could not load bestsellers. Please try again later.');
	} finally {
		list.setAttribute('aria-busy', 'false');
	}
}

init();
