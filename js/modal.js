// mousedown+click guard: track where the press started so a drag that begins
// inside the modal content and ends on the backdrop doesn't close the dialog.
const attachBackdropClose = modal => {
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
};

// Opens a <dialog> by id and lazily attaches backdrop-click-to-close.
export const openModal = id => {
	const modal = document.getElementById(id);
	if (!modal) return;

	modal.showModal();

	if (modal.dataset.backdropListener !== 'true') {
		attachBackdropClose(modal);
	}
};

// Closes a <dialog> by id. Safe to call when the dialog is already closed.
export const closeModal = id => {
	const modal = document.getElementById(id);
	modal?.close();
};
