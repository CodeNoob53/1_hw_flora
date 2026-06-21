import { openModal, closeModal } from './modal.js';
import { getCachedProduct, getAllProducts } from './productStore.js';
import { formatPrice } from './utils.js';
import { showErrorNotification } from './notifications.js';
import { extractErrorMessage } from './utils.js';

const assetBase = import.meta.env.BASE_URL.replace(/\/$/, '');

const productModal = document.getElementById('product-modal');
const modalImg = document.getElementById('product-modal-img');
const modalTitle = productModal?.querySelector('.product-modal-title');
const modalPrice = productModal?.querySelector('.product-modal-price');
const modalDesc = productModal?.querySelector('.product-modal-description');

function fillModal(product) {
	const original = `${assetBase}/assets/images/original/${product.slug}.jpg`;
	modalImg.src = original;
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
// never stack on top of each other.
productModal?.querySelector('.product-modal-buy')?.addEventListener('click', () => {
	closeModal('product-modal');
	openModal('order-modal');
});
