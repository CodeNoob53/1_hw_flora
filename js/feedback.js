import { apiClient } from './apiClient.js';
import { showErrorNotification } from './notifications.js';
import { extractErrorMessage, escapeHtml } from './utils.js';

const list = document.getElementById('feedback-list');
const status = document.getElementById('feedback-status');
const prevButton = document.getElementById('feedback-prev');
const nextButton = document.getElementById('feedback-next');

let items = [];
let activeIndex = 0;

function setStatus(message) {
	if (!status) return;
	status.textContent = message ?? '';
	status.hidden = !message;
}

function buildItemMarkup(feedback) {
	return `
		<li class="feedback-item">
			<blockquote class="feedback-quote">
				<p>${escapeHtml(feedback.text)}</p>
			</blockquote>
			<p class="feedback-author">${escapeHtml(feedback.author)}</p>
		</li>`;
}

// Rotate so the active testimonial sits first; the responsive nth-child CSS
// shows 1 card on mobile and up to 3 on desktop.
function render() {
	if (!list || items.length === 0) return;
	const ordered = [...items.slice(activeIndex), ...items.slice(0, activeIndex)];
	list.replaceChildren();
	list.insertAdjacentHTML('beforeend', ordered.map(buildItemMarkup).join(''));
}

function goTo(index) {
	if (items.length === 0) return;
	activeIndex = (index + items.length) % items.length;
	render();
}

async function init() {
	if (!list) return;
	list.setAttribute('aria-busy', 'true');

	try {
		const response = await apiClient.get('/feedbacks');
		const data = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
		items = data;

		if (items.length === 0) {
			setStatus('No testimonials yet — be the first to share your experience.');
			return;
		}

		render();
		prevButton?.addEventListener('click', () => goTo(activeIndex - 1));
		nextButton?.addEventListener('click', () => goTo(activeIndex + 1));
	} catch (error) {
		showErrorNotification(extractErrorMessage(error));
		setStatus('Could not load testimonials. Please try again later.');
	} finally {
		list.setAttribute('aria-busy', 'false');
	}
}

init();
