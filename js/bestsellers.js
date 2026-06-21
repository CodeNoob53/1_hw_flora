/**
 * Bestsellers module
 * Loads the Top-Selling bouquets (top 3 by order count) and presents them in a
 * finite carousel. Cards animate in on first render.
 */

import { apiClient, isStaticApiMode } from './apiClient.js';
import { showErrorNotification } from './notifications.js';
import { extractErrorMessage, escapeHtml, formatPrice, buildProductPicture } from './utils.js';
import { cacheProducts } from './productStore.js';
import { createCarousel, perViewByBreakpoint } from './carousel.js';

const TOP_COUNT = 3;

const list = document.getElementById('bestsellers-list');
const dots = document.getElementById('bestsellers-dots');
const status = document.getElementById('bestsellers-status');
const prevButton = document.getElementById('bestsellers-prev');
const nextButton = document.getElementById('bestsellers-next');

function setStatus(message) {
	if (!status) return;
	status.textContent = message ?? '';
	status.hidden = !message;
}

function buildItemMarkup(product, position) {
	const picture = buildProductPicture(product, {
		imageClass: 'bestsellers-card-image',
		width: 335,
		height: 320,
	});

	// Stagger the entrance animation by card position.
	return `
		<li class="bestsellers-item card-reveal" style="--reveal-delay: ${position * 120}ms">
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

/** Reveal cards on the next frame so the CSS transition runs. */
function revealCards() {
	requestAnimationFrame(() => {
		list.querySelectorAll('.card-reveal').forEach(el => el.classList.add('is-visible'));
	});
}

async function init() {
	if (!list) return;
	list.setAttribute('aria-busy', 'true');

	try {
		// Sort by orders desc and take the top N. In dev we can ask json-server
		// to sort/limit; in static mode we sort the full array client-side.
		const params = isStaticApiMode ? {} : { _sort: '-orders', _page: 1, _per_page: TOP_COUNT };
		const response = await apiClient.get('/products', { params });
		const raw = Array.isArray(response.data) ? response.data : response.data?.data ?? [];

		const items = [...raw]
			.sort((a, b) => (b.orders ?? 0) - (a.orders ?? 0))
			.slice(0, TOP_COUNT);

		if (items.length === 0) {
			setStatus('No bestsellers to show right now.');
			return;
		}

		cacheProducts(items);
		list.insertAdjacentHTML('beforeend', items.map(buildItemMarkup).join(''));

		revealCards();
		const carousel = createCarousel({
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
		setStatus('Could not load bestsellers. Please try again later.');
	} finally {
		list.setAttribute('aria-busy', 'false');
	}
}

init();
