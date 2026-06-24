// Normalise paged { data, pages, items } or plain array into a plain array.
export function normalizeApiResponse(response) {
	return Array.isArray(response.data) ? response.data : response.data?.data ?? [];
}

// Show/hide a status <p> element. Passing null/undefined clears and hides it.
export function setStatusMessage(el, message) {
	if (!el) return;
	el.textContent = message ?? '';
	el.hidden = !message;
}

// Build a skeleton placeholder <li> that mirrors the real card structure.
// containerClass must match the section (bestsellers-item / bouquets-item)
// so the section-specific CSS rules apply (image height, text alignment).
export function buildSkeletonCard(containerClass) {
	return `
		<li class="${containerClass}" aria-hidden="true">
			<div class="skeleton-card">
				<div class="skeleton-image skeleton-bone"></div>
				<div class="skeleton-text-group">
					<div class="skeleton-line skeleton-line--title skeleton-bone"></div>
					<div class="skeleton-line skeleton-line--subtitle skeleton-bone"></div>
					<div class="skeleton-line skeleton-line--subtitle-short skeleton-bone"></div>
					<div class="skeleton-line skeleton-line--price skeleton-bone"></div>
				</div>
			</div>
		</li>`;
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
	const serverMessage = error?.response?.data?.message ?? error?.response?.data?.error;
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

// Insert Cloudinary transform string after "/upload/" in an existing secure_url.
// e.g. "https://.../upload/v123/flora/bouquets/x.jpg"
//   → "https://.../upload/f_avif,w_335,c_fill,q_auto/v123/flora/bouquets/x.jpg"
function cldTransform(secureUrl, transforms) {
	return secureUrl.replace('/upload/', `/upload/${transforms}/`);
}

function cldSource(secureUrl, w, media) {
	const srcset = [
		`${cldTransform(secureUrl, `f_avif,w_${w},c_fill,q_auto`)} 1x`,
		`${cldTransform(secureUrl, `f_avif,w_${w * 2},c_fill,q_auto`)} 2x`,
		`${cldTransform(secureUrl, `f_avif,w_${w * 3},c_fill,q_auto`)} 3x`,
	].join(', ');
	return media
		? `<source media="${media}" srcset="${srcset}" type="image/avif">`
		: `<source srcset="${srcset}" type="image/avif">`;
}

// Build retina <picture> markup for dynamically rendered products.
// If photoURL (Cloudinary secure_url) is present — uses Cloudinary URL transforms for AVIF retina.
// Otherwise falls back to local AVIF assets.
export function buildProductPicture(product, { imageClass, width, height }) {
	const alt = escapeHtml(product.alt ?? product.title ?? '');

	if (product.photoURL) {
		const url = product.photoURL;
		return `
		<picture>
			${cldSource(url, 405, '(min-width: 1440px)')}
			${cldSource(url, 340, '(min-width: 768px)')}
			${cldSource(url, 335, '')}
			<img
				class="${imageClass}"
				loading="lazy"
				src="${cldTransform(url, `f_auto,w_${width},c_fill,q_auto`)}"
				alt="${alt}"
				width="${width}"
				height="${height}"
			>
		</picture>`;
	}

	// Local mode: build retina AVIF set from local assets.
	const slug = escapeHtml(product.slug);
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
