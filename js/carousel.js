/**
 * Carousel module
 * A finite (non-looping) windowed carousel shared by the Bestsellers and
 * Feedback sections. The layout itself is CSS-driven: the list shows the first
 * 1 / 2 / 3 children (mobile / tablet / desktop) via nth-child rules. This
 * module reorders the DOM so the active window sits at the front, disables the
 * arrows at the start/end, and keeps the dots in sync.
 */

import { BREAKPOINTS } from './constants.js';

/**
 * Cards visible per view, matching the CSS breakpoints.
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
 * @param {HTMLElement} config.track - The <ul> holding the items.
 * @param {HTMLElement} [config.prevButton]
 * @param {HTMLElement} [config.nextButton]
 * @param {HTMLElement} [config.dots]
 * @param {() => number} config.getPerView - How many cards are visible now.
 * @returns {{ update: () => void }}
 */
export function createCarousel({ track, prevButton, nextButton, dots, getPerView }) {
	// The immutable source order of items (macket order). The DOM is reordered
	// for display, but navigation logic works against this stable list.
	const items = [...track.children];
	let start = 0; // index of the left-most visible card

	const maxStart = () => Math.max(0, items.length - getPerView());

	/** Put the items in display order: active window first, rest after. */
	function applyOrder() {
		const ordered = [...items.slice(start), ...items.slice(0, start)];
		// Animating wrappers (.card-reveal) keep their is-visible state; we only
		// re-append, which moves existing nodes without recreating them.
		ordered.forEach(node => track.append(node));
	}

	function updateArrows() {
		const atStart = start <= 0;
		const atEnd = start >= maxStart();
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
		const pages = maxStart() + 1;
		if (pages <= 1) {
			dots.replaceChildren();
			return;
		}
		const markup = Array.from({ length: pages }, (_, i) => {
			const active = i === start ? ' is-active' : '';
			return `<li><span class="bestsellers-dot${active}"></span></li>`;
		}).join('');
		dots.replaceChildren();
		dots.insertAdjacentHTML('beforeend', markup);
	}

	function update() {
		start = Math.min(start, maxStart());
		applyOrder();
		updateArrows();
		renderDots();
	}

	function goTo(next) {
		const clamped = Math.max(0, Math.min(next, maxStart()));
		if (clamped === start) return;
		start = clamped;
		update();
	}

	prevButton?.addEventListener('click', () => goTo(start - getPerView()));
	nextButton?.addEventListener('click', () => goTo(start + getPerView()));

	dots?.addEventListener('click', event => {
		const dot = event.target.closest('li');
		if (!dot) return;
		const i = [...dots.children].indexOf(dot);
		if (i >= 0) goTo(i);
	});

	// Re-evaluate edges/dots on resize (per-view changes between breakpoints).
	let resizeTimer;
	window.addEventListener('resize', () => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(update, 150);
	});

	return { update };
}
