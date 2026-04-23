// ===================== IMPORTS =====================
import { openModal, closeModal } from './modal.js';

// ===================== MOBILE MENU =====================

const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('#mobile-menu');
const header = document.querySelector('#site-header');
const menuLinks = mobileMenu?.querySelectorAll(
	'.menu-navigation-link, .menu-action-button'
);

// Toggle: відкрити або закрити меню по кліку на бургер-кнопку
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

// Escape — закрити меню
document.addEventListener('keydown', e => {
	if (e.key === 'Escape' && mobileMenu.open) {
		mobileMenu.close();
		header.hidePopover();
		menuButton?.setAttribute('aria-expanded', 'false');
	}
});

// При закритті через .close() з інших місць
mobileMenu?.addEventListener('close', () => {
	header.hidePopover();
	menuButton?.setAttribute('aria-expanded', 'false');
});

// Закрити при кліку на посилання / CTA кнопку
menuLinks?.forEach(link =>
	link.addEventListener('click', () => mobileMenu.close())
);
