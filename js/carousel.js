/**
 * Carousel module
 * A finite (non-looping) windowed carousel shared by the Bestsellers and
 * Feedback sections. It renders all items once in order, then slides the track
 * horizontally to reveal a viewport-dependent window (1 / 2 / 3 cards). Arrows
 * disable at the start/end; optional dots reflect the active page.
 */

import { BREAKPOINTS } from './constants.js';

/**
 * @param {object} config
 * @param {HTMLElement} config.viewport - Overflow-hidden wrapper around the track.
 * @param {HTMLElement} config.track - The <ul> that holds the items and slides.
 * @param {HTMLElement} [config.prevButton]
 * @param {HTMLElement} [config.nextButton]
 * @param {HTMLElement} [config.dots]
 * @param {() => number} config.getPerView - How many cards are visible now.
 * @returns {{ update: () => void }}
 */
export function createCarousel({ viewport, track, prevButton, nextButton, dots, getPerView }) {
	let index = 0; // index of the left-most visible card

	const itemCount = () => track.children.length;

	/** Largest valid start index so the last card sits flush at the right edge. */
	const maxIndex = () => Math.max(0, itemCount() - getPerView());

	/** Slide the track so `index` is the left-most visible card. */
	function applyTransform() {
		const first = track.children[0];
		if (!first) return;

		const cardWidth = first.getBoundingClientRect().width;
		const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '0') || 0;
		const offset = index * (cardWidth + gap);
		track.style.transform = `translateX(-${offset}px)`;
	}

	function updateArrows() {
		const atStart = index <= 0;
		const atEnd = index >= maxIndex();
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
		const pages = maxIndex() + 1;
		// Hide dots when everything fits in one view.
		if (pages <= 1) {
			dots.replaceChildren();
			return;
		}
		const markup = Array.from({ length: pages }, (_, i) => {
			const active = i === index ? ' is-active' : '';
			return `<li><span class="bestsellers-dot${active}"></span></li>`;
		}).join('');
		dots.replaceChildren();
		dots.insertAdjacentHTML('beforeend', markup);
	}

	/** Recompute geometry/state (after render or resize) without animating. */
	function update() {
		index = Math.min(index, maxIndex());
		applyTransform();
		updateArrows();
		renderDots();
	}

	function goTo(next) {
		const clamped = Math.max(0, Math.min(next, maxIndex()));
		if (clamped === index) return;
		index = clamped;
		applyTransform();
		updateArrows();
		renderDots();
	}

	prevButton?.addEventListener('click', () => goTo(index - getPerView()));
	nextButton?.addEventListener('click', () => goTo(index + getPerView()));

	dots?.addEventListener('click', event => {
		const dot = event.target.closest('li');
		if (!dot) return;
		const i = [...dots.children].indexOf(dot);
		if (i >= 0) goTo(i);
	});

	// Re-measure on resize (debounced) since card width / per-view can change.
	let resizeTimer;
	window.addEventListener('resize', () => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(update, 150);
	});

	return { update };
}

/**
 * Cards visible per view, matching the CSS breakpoints (mobile 1, tablet 2,
 * desktop 3).
 * @returns {number}
 */
export function perViewByBreakpoint() {
	const width = window.innerWidth;
	if (width >= BREAKPOINTS.DESKTOP) return 3;
	if (width >= BREAKPOINTS.TABLET) return 2;
	return 1;
}
