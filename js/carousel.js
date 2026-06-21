/**
 * Carousel module
 * A finite (non-looping) sliding carousel shared by the Bestsellers and
 * Feedback sections. All items live in one flex row (the track) inside an
 * overflow-hidden viewport; navigating translates the track horizontally by a
 * whole page (perView cards) using a GPU-friendly transform transition. Arrows
 * disable at the first/last page and dots reflect the page count.
 */

import { BREAKPOINTS } from './constants.js';

/**
 * Cards visible per page, matching the CSS breakpoints (mobile 1 / tablet 2 /
 * desktop 3).
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
 * @param {HTMLElement} config.viewport - Overflow-hidden wrapper around the track.
 * @param {HTMLElement} config.track - The flex-row <ul> that slides.
 * @param {HTMLElement} [config.prevButton]
 * @param {HTMLElement} [config.nextButton]
 * @param {HTMLElement} [config.dots]
 * @param {() => number} config.getPerView - Cards per page for the current viewport.
 * @param {number} [config.dotsVisible=6] - How many dots the viewport window shows at once.
 * @returns {{ update: () => void }}
 */
export function createCarousel({ viewport, track, prevButton, nextButton, dots, getPerView, dotsVisible = 6 }) {
	const items = [...track.children];
	let page = 0;

	const pageCount = () => Math.max(1, Math.ceil(items.length / getPerView()));

	/** Slide the track so the current page is in view. */
	function applyTransform() {
		// Slide by one viewport width plus the gap between pages, measured live so
		// it stays correct across breakpoints and after layout changes.
		const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '0') || 0;
		const step = viewport.clientWidth + gap;
		track.style.transform = `translate3d(${-page * step}px, 0, 0)`;
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

	// Lazily created inner track for the sliding-window dots UI.
	let dotsTrack = null;

	function renderDots() {
		if (!dots) return;
		const total = pageCount();
		if (total <= 1) {
			dots.replaceChildren();
			dotsTrack = null;
			return;
		}

		// Build the inner track on first render (or after a replaceChildren reset).
		if (!dotsTrack || !dots.contains(dotsTrack)) {
			dotsTrack = document.createElement('div');
			dotsTrack.className = 'bestsellers-dots-track';
			const markup = Array.from({ length: total }, (_, i) =>
				`<button class="bestsellers-dot" type="button" aria-label="Page ${i + 1}"></button>`
			).join('');
			dotsTrack.insertAdjacentHTML('beforeend', markup);
			dots.replaceChildren(dotsTrack);
		}

		// Update active class without rebuilding the DOM.
		[...dotsTrack.children].forEach((btn, i) => {
			btn.classList.toggle('is-active', i === page);
			btn.setAttribute('aria-current', i === page ? 'true' : 'false');
		});

		// Sliding-window: keep the active dot centred in the visible window.
		// Each dot slot = dot size (8px) + gap (8px) = 16px; last dot has no gap.
		const DOT_SLOT = 16; // px per dot (size + gap)
		const windowHalf = Math.floor(dotsVisible / 2); // centre anchor inside window
		const maxOffset = Math.max(0, (total - dotsVisible) * DOT_SLOT);
		const rawOffset = (page - windowHalf + 1) * DOT_SLOT;
		const offset = Math.max(0, Math.min(rawOffset, maxOffset));
		dotsTrack.style.transform = `translateX(${-offset}px)`;
	}

	function update() {
		page = Math.min(page, pageCount() - 1);
		applyTransform();
		updateArrows();
		renderDots();
	}

	function goTo(nextPage) {
		const clamped = Math.max(0, Math.min(nextPage, pageCount() - 1));
		if (clamped === page) return;
		page = clamped;
		update();
	}

	prevButton?.addEventListener('click', () => goTo(page - 1));
	nextButton?.addEventListener('click', () => goTo(page + 1));

	dots?.addEventListener('click', event => {
		const btn = event.target.closest('button');
		if (!btn || !dotsTrack) return;
		const i = [...dotsTrack.children].indexOf(btn);
		if (i >= 0) goTo(i);
	});

	// Recompute geometry on resize (per-view and widths change between
	// breakpoints). Disable the transition during the resize jump so it doesn't
	// animate while the layout settles.
	let resizeTimer;
	window.addEventListener('resize', () => {
		track.style.transition = 'none';
		if (dotsTrack) dotsTrack.style.transition = 'none';
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(() => {
			// pageCount changes on breakpoint switch — rebuild dots from scratch.
			dotsTrack = null;
			update();
			requestAnimationFrame(() => {
				track.style.transition = '';
				if (dotsTrack) dotsTrack.style.transition = '';
			});
		}, 150);
	});

	return { update };
}
