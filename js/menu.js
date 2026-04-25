const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('#mobile-menu');
const header = document.querySelector('#site-header');

// Toggle menu open/closed and keep aria-expanded in sync.
// header uses the Popover API as an overlay backdrop.
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

// Close on Escape even when focus is outside the menu element.
document.addEventListener('keydown', e => {
	if (e.key === 'Escape' && mobileMenu.open) {
		mobileMenu.close();
		header.hidePopover();
		menuButton?.setAttribute('aria-expanded', 'false');
	}
});

// <details> fires a native 'close' event when collapsed by any means
// (e.g. another <details> opening) — keep state consistent.
mobileMenu?.addEventListener('close', () => {
	header.hidePopover();
	menuButton?.setAttribute('aria-expanded', 'false');
});

// Close when the user taps a nav link or action button inside the menu
// so the page scrolls to the section without leaving the menu open.
mobileMenu?.addEventListener('click', e => {
	if (e.target.closest('.menu-navigation-link, .menu-action-button')) {
		mobileMenu.close();
	}
});
