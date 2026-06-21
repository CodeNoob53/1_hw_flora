/**
 * Forms module
 * Handles the order (modal) form client-side. There is no orders backend, so
 * the submission is validated and acknowledged locally — no HTTP request.
 */

import { closeModal } from './modal.js';
import { showSuccessNotification } from './notifications.js';

const orderForm = document.getElementById('order-form');

orderForm?.addEventListener('submit', event => {
	event.preventDefault();
	if (!orderForm.reportValidity()) return;

	const data = Object.fromEntries(new FormData(orderForm).entries());
	console.log('Order submitted:', data);

	orderForm.reset();
	closeModal('order-modal');
	showSuccessNotification(`Thank you, ${data.name || 'friend'}! Your order request has been received.`);
});
