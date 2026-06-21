const notificationRootId = 'notification-root';
const dismissMs = 6000;

function ensureNotificationRoot() {
	let root = document.getElementById(notificationRootId);
	if (!root) {
		root = document.createElement('div');
		root.id = notificationRootId;
		root.className = 'notifications';
		root.setAttribute('aria-live', 'polite');
		document.body.append(root);
	}
	return root;
}

function showNotification(message, variant) {
	const root = ensureNotificationRoot();
	const element = document.createElement('div');
	element.className = `notification notification--${variant}`;
	element.textContent = message;
	root.append(element);

	window.setTimeout(() => {
		element.classList.add('is-leaving');
		element.addEventListener('transitionend', () => element.remove(), { once: true });
		// Fallback removal in case the transition never fires.
		window.setTimeout(() => element.remove(), 400);
	}, dismissMs);
}

export function showErrorNotification(message) {
	showNotification(message, 'error');
}

export function showSuccessNotification(message) {
	showNotification(message, 'success');
}
