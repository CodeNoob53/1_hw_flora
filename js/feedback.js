/**
 * Feedback module
 * Loads testimonials and presents them in the same finite carousel as the
 * bestsellers (1 / 2 / 3 cards per view).
 */

import { apiClient } from './apiClient.js';
import { showErrorNotification } from './notifications.js';
import { extractErrorMessage, normalizeApiResponse, setStatusMessage, escapeHtml } from './utils.js';
import { createCarousel, perViewByBreakpoint } from './carousel.js';

const viewport = document.getElementById('feedback-viewport');
const list = document.getElementById('feedback-list');
const status = document.getElementById('feedback-status');
const prevButton = document.getElementById('feedback-prev');
const nextButton = document.getElementById('feedback-next');

function buildItemMarkup(feedback) {
	return `
		<li class="feedback-item">
			<blockquote class="feedback-quote">
				<p>${escapeHtml(feedback.text)}</p>
			</blockquote>
			<p class="feedback-author">${escapeHtml(feedback.author)}</p>
		</li>`;
}

async function init() {
	if (!list || !viewport) return;
	list.setAttribute('aria-busy', 'true');

	try {
		const response = await apiClient.get('/feedbacks');
		const items = normalizeApiResponse(response);

		if (items.length === 0) {
			setStatusMessage(status, 'No testimonials yet — be the first to share your experience.');
			return;
		}

		list.insertAdjacentHTML('beforeend', items.map(buildItemMarkup).join(''));

		const carousel = createCarousel({
			viewport,
			track: list,
			prevButton,
			nextButton,
			getPerView: perViewByBreakpoint,
		});
		carousel.update();
	} catch (error) {
		console.error('Failed to load testimonials:', error);
		showErrorNotification(extractErrorMessage(error));
		setStatusMessage(status, 'Could not load testimonials. Please try again later.');
	} finally {
		list.setAttribute('aria-busy', 'false');
	}
}

init();
