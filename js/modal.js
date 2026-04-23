// ===================== MODAL UTILITIES =====================

/**
 * Open a <dialog> by id.
 * Attaches backdrop-click-to-close listener once (mousedown+click trick
 * prevents false close when user selects text inside the modal).
 */
export const openModal = id => {
	const modal = document.getElementById(id);
	if (!modal) return;

	modal.showModal();

	if (modal.dataset.backdropListener !== 'true') {
		let mouseDownTarget = null;

		modal.addEventListener('mousedown', e => {
			mouseDownTarget = e.target;
		});

		modal.addEventListener('click', e => {
			if (e.target === modal && mouseDownTarget === modal) {
				modal.close();
			}
			mouseDownTarget = null;
		});

		modal.dataset.backdropListener = 'true';
	}
};

/**
 * Close a <dialog> by id.
 */
export const closeModal = id => {
	const modal = document.getElementById(id);
	modal?.close();
};

/**
 * Wire a close button inside a dialog.
 * Falls back gracefully if Invoker Commands API (commandfor/command) is unsupported.
 */
export const wireCloseButton = (buttonSelector, modalId) => {
	const btn = document.querySelector(buttonSelector);
	if (!btn) return;

	// If native commandfor is supported — browser handles it; add listener anyway
	// (double-close is safe: dialog ignores close() when already closed)
	btn.addEventListener('click', () => closeModal(modalId));
};
