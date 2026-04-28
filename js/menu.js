const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('#mobile-menu');
const pageContent = document.querySelectorAll('main, footer');
const root = document.documentElement;

const setPageInert = isInert => {
	pageContent.forEach(element => {
		element.inert = isInert;
	});
};

const focusFirstMenuItem = () => {
	mobileMenu?.querySelector('a, button')?.focus();
};

const focusLinkedSection = link => {
	const id = link.hash?.slice(1);
	const target = id ? document.getElementById(decodeURIComponent(id)) : null;

	if (!target) return;

	if (!target.hasAttribute('tabindex')) {
		target.setAttribute('tabindex', '-1');
	}

	window.setTimeout(() => {
		target.focus({ preventScroll: true });
	}, 0);
};

const handleDocumentKeydown = e => {
	if (e.key === 'Escape' && mobileMenu?.classList.contains('is-open')) {
		closeMenu();
	}
};

const openMenu = () => {
	if (!mobileMenu || mobileMenu.classList.contains('is-open')) return;

	mobileMenu.hidden = false;
	root.classList.add('menu-open');
	setPageInert(true);
	menuButton?.setAttribute('aria-expanded', 'true');
	document.addEventListener('keydown', handleDocumentKeydown);

	requestAnimationFrame(() => {
		mobileMenu.classList.add('is-open');
		focusFirstMenuItem();
	});
};

const closeMenu = ({ restoreFocus = true } = {}) => {
	if (!mobileMenu || !mobileMenu.classList.contains('is-open')) return;

	mobileMenu.classList.remove('is-open');
	root.classList.remove('menu-open');
	setPageInert(false);
	menuButton?.setAttribute('aria-expanded', 'false');
	document.removeEventListener('keydown', handleDocumentKeydown);

	window.setTimeout(() => {
		if (!mobileMenu.classList.contains('is-open')) {
			mobileMenu.hidden = true;
		}
	}, 300);

	if (restoreFocus) {
		menuButton?.focus();
	}
};

// Toggle menu open/closed and keep aria-expanded in sync.
menuButton?.addEventListener('click', () => {
	if (mobileMenu?.classList.contains('is-open')) {
		closeMenu();
	} else {
		openMenu();
	}
});

// Close when the user taps a nav link or action button inside the menu
// so the page scrolls to the section without leaving the menu open.
mobileMenu?.addEventListener('click', e => {
	const link = e.target.closest('.menu-navigation-link, .menu-action-button');

	if (link) {
		closeMenu({ restoreFocus: false });
		focusLinkedSection(link);
	}
});
