import { apiClient, isStaticApiMode } from './apiClient.js';
import { closeModal } from './modal.js';
import { showSuccessNotification, showErrorNotification } from './notifications.js';
import { extractErrorMessage } from './utils.js';

const orderForm = document.getElementById('order-form');
const subscribeForm = document.getElementById('subscribe-form');

function setSubmitting(form, isSubmitting) {
	const submit = form.querySelector('[type="submit"]');
	if (submit) submit.disabled = isSubmitting;
}

// POST the payload to json-server. On static hosting (GitHub Pages) there's no
// writable backend, so we treat the submission as accepted locally.
async function submitTo(endpoint, payload) {
	if (isStaticApiMode) return;
	await apiClient.post(endpoint, payload);
}

orderForm?.addEventListener('submit', async event => {
	event.preventDefault();
	if (!orderForm.reportValidity()) return;

	const data = Object.fromEntries(new FormData(orderForm).entries());
	setSubmitting(orderForm, true);

	try {
		await submitTo('/orders', { ...data, createdAt: new Date().toISOString() });
		orderForm.reset();
		closeModal('order-modal');
		showSuccessNotification('Thank you! Your order request has been received.');
	} catch (error) {
		showErrorNotification(extractErrorMessage(error, 'Could not submit your order. Please try again.'));
	} finally {
		setSubmitting(orderForm, false);
	}
});

subscribeForm?.addEventListener('submit', async event => {
	event.preventDefault();
	if (!subscribeForm.reportValidity()) return;

	const data = Object.fromEntries(new FormData(subscribeForm).entries());
	setSubmitting(subscribeForm, true);

	try {
		await submitTo('/subscriptions', { ...data, createdAt: new Date().toISOString() });
		subscribeForm.reset();
		showSuccessNotification('You are subscribed! Watch your inbox for fresh blooms.');
	} catch (error) {
		showErrorNotification(extractErrorMessage(error, 'Could not subscribe. Please try again.'));
	} finally {
		setSubmitting(subscribeForm, false);
	}
});
