import { apiClient, isStaticApiMode } from './apiClient.js';
import { showErrorNotification } from './notifications.js';
import { extractErrorMessage, escapeHtml, formatPrice, buildProductPicture } from './utils.js';
import { cacheProducts } from './productStore.js';

const list = document.getElementById('bestsellers-list');
const dots = document.getElementById('bestsellers-dots');
const status = document.getElementById('bestsellers-status');
const prevButton = document.getElementById('bestsellers-prev');
const nextButton = document.getElementById('bestsellers-next');

let items = [];
let activeIndex = 0;

function setStatus(message) {
	if (!status) return;
	status.textContent = message ?? '';
	status.hidden = !message;
}

function buildItemMarkup(product) {
	const picture = buildProductPicture(product, {
		imageClass: 'bestsellers-card-image',
		width: 335,
		height: 320,
	});

	return `
		<li class="bestsellers-item">
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

// Rotate the array so `activeIndex` sits first; the responsive nth-child CSS
// then renders the visible window (1 card on mobile, 2 on tablet, 3 on desktop).
function render() {
	if (!list || items.length === 0) return;

	const ordered = [...items.slice(activeIndex), ...items.slice(0, activeIndex)];
	list.replaceChildren();
	list.insertAdjacentHTML('beforeend', ordered.map(buildItemMarkup).join(''));

	if (dots) {
		dots.replaceChildren();
		const dotsMarkup = items
			.map((_, index) => {
				const activeClass = index === activeIndex ? ' is-active' : '';
				return `<li><span class="bestsellers-dot${activeClass}"></span></li>`;
			})
			.join('');
		dots.insertAdjacentHTML('beforeend', dotsMarkup);
	}
}

function goTo(index) {
	if (items.length === 0) return;
	activeIndex = (index + items.length) % items.length;
	render();
}

async function init() {
	if (!list) return;

	try {
		const params = isStaticApiMode ? {} : { bestseller: true };
		const response = await apiClient.get('/products', { params });
		const data = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
		items = data.filter(product => product.bestseller === true);

		if (items.length === 0) {
			setStatus('No bestsellers to show right now.');
			return;
		}

		cacheProducts(items);
		render();

		prevButton?.addEventListener('click', () => goTo(activeIndex - 1));
		nextButton?.addEventListener('click', () => goTo(activeIndex + 1));
		dots?.addEventListener('click', event => {
			const dot = event.target.closest('li');
			if (!dot) return;
			const index = [...dots.children].indexOf(dot);
			if (index >= 0) goTo(index);
		});
	} catch (error) {
		showErrorNotification(extractErrorMessage(error));
		setStatus('Could not load bestsellers. Please try again later.');
	}
}

init();
