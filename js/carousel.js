/**
 * Carousel module
 * A finite (non-looping) paged carousel shared by the Bestsellers and Feedback
 * sections. Items are split into pages of `perView` cards (1 / 2 / 3 by
 * viewport); only the current page is shown, the rest are hidden via JS. Arrows
 * step one page at a time and disable at the first/last page; dots reflect the
 * page count.
 */

import { BREAKPOINTS } from './constants.js';
import { revealCards } from './utils.js';

/**
 * Cards visible per page, matching the CSS breakpoints.
 * @returns {number}
 */
export function perViewByBreakpoint() {
	const width = window.innerWidth;
	if (width >= BREAKPOINTS.DESKTOP) return 3;
	if (width >= BREAKPOINTS.TABLET) return 2;
	return 1;
}

/**
 * @param {object} config
 * @param {HTMLElement} config.track - The <ul> holding all the item elements.
 * @param {HTMLElement} [config.prevButton]
 * @param {HTMLElement} [config.nextButton]
 * @param {HTMLElement} [config.dots]
 * @param {() => number} config.getPerView - Cards per page for the current viewport.
 * @returns {{ update: () => void }}
 */
export function createCarousel({ track, prevButton, nextButton, dots, getPerView }) {
	const items = [...track.children];
	let page = 0; // current page index (0-based)

	const pageCount = () => Math.max(1, Math.ceil(items.length / getPerView()));

	/**
	 * Show only the current page's items; hide the rest. When `animate` is true
	 * (page navigation), replay the entrance animation on the cards that just
	 * became visible.
	 * @param {boolean} [animate]
	 */
	function applyVisibility(animate = false) {
		const perView = getPerView();
		const startIndex = page * perView;
		const endIndex = startIndex + perView;
		items.forEach((item, i) => {
			const visible = i >= startIndex && i < endIndex;
			item.classList.toggle('carousel-hidden', !visible);
			if (animate && visible && item.classList.contains('card-reveal')) {
				// Reset so the reveal transition runs again for this page.
				item.classList.remove('is-visible');
			}
		});
		if (animate) {
			revealCards(track);
		}
	}

	function updateArrows() {
		const atStart = page <= 0;
		const atEnd = page >= pageCount() - 1;
		if (prevButton) {
			prevButton.disabled = atStart;
			prevButton.setAttribute('aria-disabled', String(atStart));
		}
		if (nextButton) {
			nextButton.disabled = atEnd;
			nextButton.setAttribute('aria-disabled', String(atEnd));
		}
	}

	function renderDots() {
		if (!dots) return;
		const pages = pageCount();
		if (pages <= 1) {
			dots.replaceChildren();
			return;
		}
		const markup = Array.from({ length: pages }, (_, i) => {
			const active = i === page ? ' is-active' : '';
			return `<li><span class="bestsellers-dot${active}"></span></li>`;
		}).join('');
		dots.replaceChildren();
		dots.insertAdjacentHTML('beforeend', markup);
	}

	function update({ animate = false } = {}) {
		page = Math.min(page, pageCount() - 1);
		applyVisibility(animate);
		updateArrows();
		renderDots();
	}

	function goTo(nextPage) {
		const clamped = Math.max(0, Math.min(nextPage, pageCount() - 1));
		if (clamped === page) return;
		page = clamped;
		update({ animate: true });
	}

	prevButton?.addEventListener('click', () => goTo(page - 1));
	nextButton?.addEventListener('click', () => goTo(page + 1));

	dots?.addEventListener('click', event => {
		const dot = event.target.closest('li');
		if (!dot) return;
		const i = [...dots.children].indexOf(dot);
		if (i >= 0) goTo(i);
	});

	// Re-evaluate pages/edges on resize (per-view changes between breakpoints).
	let resizeTimer;
	window.addEventListener('resize', () => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(update, 150);
	});

	return { update };
}
