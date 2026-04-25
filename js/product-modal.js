import { openModal, closeModal } from './modal.js';
import { products } from './products.js';

const productModal = document.getElementById('product-modal');
const modalImg = document.getElementById('product-modal-img');
const modalTitle = productModal?.querySelector('.product-modal-title');
const modalPrice = productModal?.querySelector('.product-modal-price');
const modalDesc = productModal?.querySelector('.product-modal-description');

// Single delegated listener for all product cards.
// Cards carry only data-id; full product data is looked up from the products array
// so the HTML stays clean and swapping to a real API only touches products.js.
document.addEventListener('click', e => {
	const card = e.target.closest('.product-card');
	if (!card) return;

	const product = products.find(p => p.id === card.dataset.id);
	if (!product) return;

	modalImg.src = product.image;
	modalImg.alt = product.alt;
	modalTitle.textContent = product.title;
	modalPrice.textContent = product.price;
	modalDesc.textContent = product.description;
	productModal.querySelector('.product-modal-qty').value = 1;

	openModal('product-modal');
});

// "Buy" closes the product modal and immediately opens the order form
// so the two dialogs never stack on top of each other.
productModal?.querySelector('.product-modal-buy')?.addEventListener('click', () => {
	closeModal('product-modal');
	openModal('order-modal');
});

// Delegated close handler — any button with data-close-modal="<id>" anywhere
// in the document closes the matching dialog without per-button wiring.
document.addEventListener('click', e => {
	const btn = e.target.closest('[data-close-modal]');
	if (btn) closeModal(btn.dataset.closeModal);
});
