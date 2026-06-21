// Normalise the two shapes json-server returns (array in static mode,
// { data, pages, items } in dev mode) into a plain array.
export function normalizeApiResponse(response) {
	return Array.isArray(response.data) ? response.data : response.data?.data ?? [];
}

// Show/hide a status <p> element. Passing null/undefined clears and hides it.
export function setStatusMessage(el, message) {
	if (!el) return;
	el.textContent = message ?? '';
	el.hidden = !message;
}

// Build the shared product-card <li> markup used by both the bestsellers
// carousel and the bouquets catalogue grid.
export function buildProductCard(product, {
	containerClass,
	imageClass,
	imageWidth,
	imageHeight,
	revealDelay,
}) {
	const picture = buildProductPicture(product, {
		imageClass,
		width: imageWidth,
		height: imageHeight,
	});
	const delayStyle = revealDelay != null ? ` style="--reveal-delay: ${revealDelay}ms"` : '';
	const revealAttr = revealDelay != null ? ' data-reveal="fade-up"' : '';

	return `
		<li class="${containerClass}"${revealAttr}${delayStyle}>
			<div class="product-card" data-id="${escapeHtml(product.id)}">
				${picture}
				<div class="product-card-content">
					<div class="product-card-header">
						<h3 class="product-card-title">${escapeHtml(product.title)}</h3>
						<p class="product-card-text">${escapeHtml(product.text)}</p>
					</div>
					<p class="product-card-price">${escapeHtml(formatPrice(product.price))}</p>
				</div>
			</div>
		</li>`;
}

// Resolve a human-readable message from an axios error.
export function extractErrorMessage(
	error,
	fallbackMessage = 'Something went wrong while loading data. Please try again later.'
) {
	const serverMessage = error?.response?.data?.error;
	if (typeof serverMessage === 'string') return serverMessage;
	if (error?.message) return error.message;
	return fallbackMessage;
}

// Escape values that go into template strings rendered with insertAdjacentHTML.
export function escapeHtml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

export function formatPrice(price) {
	const numeric = Number(price);
	return Number.isFinite(numeric) ? `$${numeric}` : `${price ?? ''}`;
}

// Vite rewrites BASE_URL to "/" in dev and "/<repo>/" on GitHub Pages.
const assetBase = import.meta.env.BASE_URL.replace(/\/$/, '');

function assetUrl(path) {
	return `${assetBase}/${path.replace(/^\/+/, '')}`;
}

// Build a responsive <source srcset> line with @1x/@2x/@3x AVIF for one breakpoint.
function avifSource(slug, breakpoint, media) {
	const base = `assets/images/avif/${breakpoint}/${slug}`;
	const srcset = [1, 2, 3]
		.map(dpr => `${assetUrl(`${base}_@${dpr}x.avif`)} ${dpr}x`)
		.join(',\n\t\t\t\t');
	const mediaAttr = media ? `media="${media}"` : '';
	return `<source ${mediaAttr} srcset="\n\t\t\t\t${srcset}\n\t\t\t" type="image/avif">`;
}

// Reproduce the retina <picture> markup of the static cards so dynamically
// rendered products keep mobile-first @1x/@2x/@3x AVIF with a JPEG fallback.
// `breakpoints` lists which AVIF folders exist for this slug (mob/tab/pc).
export function buildProductPicture(product, { imageClass, width, height }) {
	const slug = escapeHtml(product.slug);
	const alt = escapeHtml(product.alt ?? product.title ?? '');
	const available = Array.isArray(product.breakpoints) ? product.breakpoints : ['mob', 'tab', 'pc'];

	const sources = [];
	if (available.includes('pc')) sources.push(avifSource(slug, 'pc', '(min-width: 1440px)'));
	if (available.includes('tab')) sources.push(avifSource(slug, 'tab', '(min-width: 768px)'));
	if (available.includes('mob')) sources.push(avifSource(slug, 'mob', ''));

	const fallback = assetUrl(`assets/images/fallback/${escapeHtml(product.fallback ?? `${product.slug}.jpg`)}`);

	return `
		<picture>
			${sources.join('\n\t\t\t')}
			<img
				class="${imageClass}"
				loading="lazy"
				src="${fallback}"
				alt="${alt}"
				width="${width}"
				height="${height}"
			>
		</picture>`;
}
