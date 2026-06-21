/**
 * Forms module
 * Handles the order (modal) and subscribe (footer) forms client-side.
 * There is no orders/subscriptions backend, so submissions are validated and
 * acknowledged locally — no HTTP request is sent.
 */

import { closeModal } from './modal.js';
import { showSuccessNotification } from './notifications.js';

const orderForm = document.getElementById('order-form');
const subscribeForm = document.getElementById('subscribe-form');

orderForm?.addEventListener('submit', event => {
	event.preventDefault();
	if (!orderForm.reportValidity()) return;

	const data = Object.fromEntries(new FormData(orderForm).entries());
	console.log('Order submitted:', data);

	orderForm.reset();
	closeModal('order-modal');
	showSuccessNotification(`Thank you, ${data.name || 'friend'}! Your order request has been received.`);
});

subscribeForm?.addEventListener('submit', event => {
	event.preventDefault();
	if (!subscribeForm.reportValidity()) return;

	const data = Object.fromEntries(new FormData(subscribeForm).entries());
	console.log('Subscribed:', data);

	subscribeForm.reset();
	showSuccessNotification('You are subscribed! Watch your inbox for fresh blooms.');
});
