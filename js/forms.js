import { closeModal, openModal } from './modal.js';
import { showErrorNotification } from './notifications.js';
import { extractErrorMessage, formatPrice } from './utils.js';
import { apiClient } from './apiClient.js';

const orderForm = document.getElementById('order-form');

const FIELD_ERRORS = {
	'order-name': {
		valueMissing: 'Name is required.',
		tooShort: 'Name must be at least 2 characters.',
	},
	'order-phone': {
		valueMissing: 'Phone number is required.',
	},
};

function showFieldError(input, message) {
	const errorEl = document.getElementById(`${input.id}-error`);
	if (!errorEl) return;
	errorEl.textContent = message;
	errorEl.hidden = !message;
	input.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function validateField(input) {
	const rules = FIELD_ERRORS[input.id];
	if (!rules) return true;
	const v = input.validity;
	const message =
		(v.valueMissing && rules.valueMissing) ||
		(v.tooShort && rules.tooShort) ||
		'';
	showFieldError(input, message);
	return !message;
}

function validateForm() {
	const fields = orderForm.querySelectorAll('input, textarea');
	let valid = true;
	fields.forEach(f => { if (!validateField(f)) valid = false; });
	return valid;
}
const successModal = document.getElementById('order-success-modal');

let _product = null;
let _quantity = 1;

export function setOrderProduct(product, quantity = 1) {
	_product = product;
	_quantity = quantity;
}

function fillSuccessModal(order, payload) {
	const year = new Date().getFullYear();
	const orderId = `#FL-${year}-${String(order.id).padStart(4, '0')}`;

	successModal.querySelector('.order-success-order-id').textContent = orderId;
	successModal.querySelector('.order-success-name').textContent = payload.name;
	successModal.querySelector('.order-success-phone').textContent = payload.phone;

	const addressRow = successModal.querySelector('.order-success-address-row');
	const addressEl = successModal.querySelector('.order-success-address');
	if (payload.address) {
		addressEl.textContent = payload.address;
		addressRow.hidden = false;
	} else {
		addressRow.hidden = true;
	}

	const productRow = document.getElementById('order-success-product-row');
	const totalRow = document.getElementById('order-success-total-row');

	if (_product) {
		const unitPrice = _product.price ?? 0;
		const total = unitPrice * _quantity;
		successModal.querySelector('.order-success-product-title').textContent = _product.title ?? 'Bouquet';
		successModal.querySelector('.order-success-qty').textContent = `× ${_quantity}`;
		successModal.querySelector('.order-success-line-total').textContent = formatPrice(unitPrice * _quantity);
		successModal.querySelector('.order-success-total').textContent = formatPrice(total);
		if (productRow) productRow.hidden = false;
		if (totalRow) totalRow.hidden = false;
	} else {
		if (productRow) productRow.hidden = true;
		if (totalRow) totalRow.hidden = true;
	}
}

// Clear error when user starts fixing a field
orderForm?.addEventListener('input', event => {
	const input = event.target.closest('input, textarea');
	if (input && input.getAttribute('aria-invalid') === 'true') validateField(input);
});

// Show error on blur (after user leaves field)
orderForm?.addEventListener('blur', event => {
	const input = event.target.closest('input, textarea');
	if (input) validateField(input);
}, true);

// Reset all errors when modal is reset
orderForm?.addEventListener('reset', () => {
	orderForm.querySelectorAll('.order-form-error').forEach(el => { el.hidden = true; el.textContent = ''; });
	orderForm.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
});

orderForm?.addEventListener('submit', async event => {
	event.preventDefault();
	if (!validateForm()) return;

	const formData = Object.fromEntries(new FormData(orderForm).entries());

	const payload = {
		name: formData.name,
		phone: formData.phone,
		address: formData.address || undefined,
		message: formData.message || undefined,
		quantity: _quantity,
	};

	if (_product) {
		payload.productId = _product.id;
		payload.productTitle = _product.title;
		payload.productPrice = _product.price;
	}

	try {
		const { data: order } = await apiClient.post('/orders', payload);
		orderForm.reset();
		closeModal('order-modal');
		fillSuccessModal(order, payload);
		openModal('order-success-modal');
	} catch (error) {
		showErrorNotification(extractErrorMessage(error));
	}
});
