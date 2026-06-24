const notificationRootId = 'notification-root';
const dismissMs = 6000;

function ensureNotificationRoot() {
	let root = document.getElementById(notificationRootId);
	if (!root) {
		root = document.createElement('div');
		root.id = notificationRootId;
		root.className = 'notifications';
		root.setAttribute('aria-live', 'polite');
		// popover=manual puts the element in the top layer (above <dialog>),
		// without intercepting clicks or adding a backdrop.
		root.setAttribute('popover', 'manual');
		document.body.append(root);
		root.showPopover();
	}
	return root;
}

function showNotification(message, variant) {
	const root = ensureNotificationRoot();

	// Don't show duplicate message if same toast is already visible
	const existing = root.querySelector(`.notification--${variant}`);
	if (existing && existing.textContent === message) return;

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
