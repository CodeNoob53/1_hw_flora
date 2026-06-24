import { openModal, closeModal } from './modal.js';
import { getCachedProduct, getAllProducts } from './productStore.js';
import { formatPrice } from './utils.js';
import { showErrorNotification } from './notifications.js';
import { extractErrorMessage } from './utils.js';
import { setOrderProduct } from './forms.js';

const assetBase = import.meta.env.BASE_URL.replace(/\/$/, '');

const productModal = document.getElementById('product-modal');
const modalImg = document.getElementById('product-modal-img');
const modalImgContainer = productModal?.querySelector('.product-modal-image');
const modalTitle = productModal?.querySelector('.product-modal-title');
const modalPrice = productModal?.querySelector('.product-modal-price');
const modalDesc = productModal?.querySelector('.product-modal-description');

let currentProduct = null;

function fillModal(product) {
	currentProduct = product;
	const src = product.photoURL
		? product.photoURL
		: `${assetBase}/assets/images/original/${product.slug}.jpg`;

	modalImgContainer.classList.add('is-loading');

	const done = () => modalImgContainer.classList.remove('is-loading');

	// Assign handlers before src so a cached image (sync load) doesn't miss them.
	modalImg.onload = done;
	modalImg.onerror = done;
	modalImg.src = src;

	// If the browser served from cache, complete is already true — fire immediately.
	if (modalImg.complete) done();
	modalImg.alt = product.alt ?? product.title ?? '';
	modalTitle.textContent = product.title ?? '';
	modalPrice.textContent = formatPrice(product.price);
	modalDesc.textContent = product.description ?? product.text ?? '';
	productModal.querySelector('.product-modal-qty').value = 1;
}

// Single delegated listener for every product card (catalogue + bestsellers).
// Cards carry only data-id; full data is resolved from the shared product store.
document.addEventListener('click', async event => {
	const card = event.target.closest('.product-card');
	if (!card) return;

	const id = card.dataset.id;
	let product = getCachedProduct(id);

	if (!product) {
		try {
			await getAllProducts();
			product = getCachedProduct(id);
		} catch (error) {
			showErrorNotification(extractErrorMessage(error));
			return;
		}
	}

	if (!product) return;

	fillModal(product);
	openModal('product-modal');
});

// "Buy" closes the product modal and opens the order form so the two dialogs
// never stack on top of each other. Pass the current product data to the form.
productModal?.querySelector('.product-modal-buy')?.addEventListener('click', () => {
	const qty = Number(productModal.querySelector('.product-modal-qty').value) || 1;
	setOrderProduct(currentProduct, qty);
	closeModal('product-modal');
	openModal('order-modal');
});
