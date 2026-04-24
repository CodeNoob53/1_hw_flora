// ===================== IMPORTS =====================
import { openModal, closeModal } from './modal.js';
import { products } from './products.js';

// ===================== MOBILE MENU =====================

const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('#mobile-menu');
const header = document.querySelector('#site-header');

menuButton?.addEventListener('click', () => {
	if (mobileMenu.open) {
		mobileMenu.close();
		header.hidePopover();
		menuButton.setAttribute('aria-expanded', 'false');
	} else {
		header.showPopover();
		mobileMenu.show();
		menuButton.setAttribute('aria-expanded', 'true');
	}
});

document.addEventListener('keydown', e => {
	if (e.key === 'Escape' && mobileMenu.open) {
		mobileMenu.close();
		header.hidePopover();
		menuButton?.setAttribute('aria-expanded', 'false');
	}
});

mobileMenu?.addEventListener('close', () => {
	header.hidePopover();
	menuButton?.setAttribute('aria-expanded', 'false');
});

// ===================== PRODUCT MODAL =====================

const productModal = document.getElementById('product-modal');
const modalImg = document.getElementById('product-modal-img');
const modalTitle = productModal?.querySelector('.product-modal-title');
const modalPrice = productModal?.querySelector('.product-modal-price');
const modalDesc = productModal?.querySelector('.product-modal-description');

// Делегування — один слухач на document замість окремого на кожну картку
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

// ===================== ORDER MODAL =====================

productModal?.querySelector('.product-modal-buy')?.addEventListener('click', () => {
	closeModal('product-modal');
	openModal('order-modal');
});

// ===================== MODAL CLOSE BUTTONS =====================

document.addEventListener('click', e => {
	const btn = e.target.closest('[data-close-modal]');
	if (btn) closeModal(btn.dataset.closeModal);
});

// ===================== MOBILE MENU LINKS =====================

mobileMenu?.addEventListener('click', e => {
	if (e.target.closest('.menu-navigation-link, .menu-action-button')) {
		mobileMenu.close();
	}
});
