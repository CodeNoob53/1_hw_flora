/**
 * Scroll-reveal module — replaces AOS with a native IntersectionObserver.
 *
 * Supported variants (set via the data-reveal attribute):
 *   data-reveal="fade-up"    — default, slides up from below
 *   data-reveal="fade-down"  — slides down from above
 *   data-reveal="fade-left"  — slides in from the right
 *   data-reveal="fade-right" — slides in from the left
 *
 * Optional modifiers (extra data-* attributes on the same element):
 *   data-reveal-delay="200"  — ms delay before the transition starts
 *   data-reveal-duration     — not needed; set in CSS per variant if wanted
 *
 * Cards with stagger: set --reveal-delay inline on each element (catalogue.js
 * already does this) and call observeReveal(parentElement) after insertion.
 */

const observer = new IntersectionObserver(
	entries => {
		entries.forEach(entry => {
			if (!entry.isIntersecting) return;
			const el = entry.target;
			const delay = el.dataset.revealDelay;
			if (delay) el.style.transitionDelay = `${delay}ms`;
			el.classList.add('is-visible');
			observer.unobserve(el);
		});
	},
	{ threshold: 0.12 }
);

/**
 * Observe all [data-reveal] elements inside root (or the element itself).
 * Safe to call multiple times — already-visible elements are skipped.
 * @param {Element} [root=document]
 */
export function observeReveal(root = document) {
	const selector = '[data-reveal]';
	const targets =
		root.matches?.(selector) ? [root] : [...root.querySelectorAll(selector)];
	targets.forEach(el => {
		if (!el.classList.contains('is-visible')) observer.observe(el);
	});
}
