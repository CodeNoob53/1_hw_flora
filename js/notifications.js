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

const ICONS = {
	error: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
		<path d="M10 6v5M10 14h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
	</svg>`,
	success: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
		<path d="M4 10.5l4.5 4.5 7.5-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
	</svg>`,
};

function showNotification(message, variant) {
	const root = ensureNotificationRoot();

	// Don't show duplicate message if same toast is already visible
	const existing = root.querySelector(`.notification--${variant}`);
	if (existing && existing.querySelector('.notification-text')?.textContent === message) return;

	const element = document.createElement('div');
	element.className = `notification notification--${variant}`;
	element.setAttribute('role', 'alert');
	element.innerHTML = `
		<span class="notification-icon">${ICONS[variant]}</span>
		<span class="notification-text">${message}</span>
	`;
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
