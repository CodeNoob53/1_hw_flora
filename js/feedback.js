/**
 * Feedback module
 * Loads testimonials and presents them in the same finite carousel as the
 * bestsellers (1 / 2 / 3 cards per view). Cards animate in on first render.
 */

import { apiClient } from './apiClient.js';
import { showErrorNotification } from './notifications.js';
import { extractErrorMessage, escapeHtml } from './utils.js';
import { createCarousel, perViewByBreakpoint } from './carousel.js';

const list = document.getElementById('feedback-list');
const status = document.getElementById('feedback-status');
const prevButton = document.getElementById('feedback-prev');
const nextButton = document.getElementById('feedback-next');

function setStatus(message) {
	if (!status) return;
	status.textContent = message ?? '';
	status.hidden = !message;
}

function buildItemMarkup(feedback, position) {
	return `
		<li class="feedback-item card-reveal" style="--reveal-delay: ${position * 120}ms">
			<blockquote class="feedback-quote">
				<p>${escapeHtml(feedback.text)}</p>
			</blockquote>
			<p class="feedback-author">${escapeHtml(feedback.author)}</p>
		</li>`;
}

function revealCards() {
	requestAnimationFrame(() => {
		list.querySelectorAll('.card-reveal').forEach(el => el.classList.add('is-visible'));
	});
}

async function init() {
	if (!list) return;
	list.setAttribute('aria-busy', 'true');

	try {
		const response = await apiClient.get('/feedbacks');
		const items = Array.isArray(response.data) ? response.data : response.data?.data ?? [];

		if (items.length === 0) {
			setStatus('No testimonials yet — be the first to share your experience.');
			return;
		}

		list.insertAdjacentHTML('beforeend', items.map(buildItemMarkup).join(''));

		revealCards();
		const carousel = createCarousel({
			track: list,
			prevButton,
			nextButton,
			getPerView: perViewByBreakpoint,
		});
		carousel.update();
	} catch (error) {
		console.error('Failed to load testimonials:', error);
		showErrorNotification(extractErrorMessage(error));
		setStatus('Could not load testimonials. Please try again later.');
	} finally {
		list.setAttribute('aria-busy', 'false');
	}
}

init();
