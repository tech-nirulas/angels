"use strict";
/**
 * @aimk/image-spec — shared image slot specifications.
 *
 * SINGLE SOURCE OF TRUTH for image requirements across:
 *   - angels        (next/image `sizes` + `quality`, container ratios)
 *   - aimk_admin    (upload/selection guidance + advisory validation)
 *   - IMAGE_GUIDELINES.md (generated — never hand-edited)
 *
 * Every dimension here was measured from the rendered angels UI, not estimated.
 * `recommended` targets DPR 2 at the widest measured render of each slot;
 * `minimum` is the point below which upscaling becomes visible at DPR 2.
 *
 * NOTE: every value in `quality` must also appear in `images.qualities` in
 * angels/next.config.ts, otherwise Next silently coerces it to the nearest
 * allowed value.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASPECT_RATIO_TOLERANCE = exports.IMAGE_SLOT_NAMES = exports.IMAGE_SLOTS = exports.IMAGE_QUALITY = void 0;
exports.getImageSlot = getImageSlot;
exports.formatRatio = formatRatio;
exports.validateImageAgainstSpec = validateImageAgainstSpec;
/** Quality tiers. Must stay in sync with `images.qualities` in angels/next.config.ts. */
exports.IMAGE_QUALITY = {
    /** Full-bleed hero — largest surface, most visible compression artefacts. */
    hero: 90,
    /** Product / featured / category cards. */
    card: 85,
    /** Small thumbnails (<= 88px) where 75 is indistinguishable from 90. */
    thumbnail: 75,
};
exports.IMAGE_SLOTS = {
    /**
     * Hero / offer banner — angels components/sections/HeroSection.tsx
     * Container ratio is breakpoint-dependent: 4:5 (<600), 4:3 (600-899),
     * 2.37:1 (>=900), clamped by maxHeight: 80vh on very wide screens.
     * Mobile is the binding constraint for the safe area: 0.8 / 2.37 = 33.8%.
     */
    heroBanner: {
        label: "Hero / Offer Banner",
        recommended: [2560, 1080],
        minimum: [1920, 810],
        ratio: "2.37:1 (desktop) · 4:3 (tablet) · 4:5 (mobile)",
        targetRatio: 2560 / 1080,
        fit: "cover",
        cropped: true,
        transparency: false,
        format: "JPG",
        maxFileSize: "800 KB",
        sizes: "100vw",
        quality: exports.IMAGE_QUALITY.hero,
        safeArea: "Single asset is cropped hard on phones — only the central ~34% of the width survives. " +
            "Keep all headline text, logos and price callouts inside the central 34% (≈ 865px of a 2560px asset). " +
            "Also avoid the bottom 25%, which the copy overlay and gradient cover.",
    },
    /**
     * Product card — angels components/ui/ProductCard.tsx (MenuSection and /cakes)
     * Grid xs:12 sm:6 md:4 lg:3 inside Container maxWidth="lg".
     * Widest render 567px (single column at a 599px viewport) -> 1134px at DPR 2.
     */
    productCard: {
        label: "Product Card",
        recommended: [1200, 900],
        minimum: [800, 600],
        ratio: "4:3",
        targetRatio: 4 / 3,
        fit: "cover",
        cropped: true,
        transparency: false,
        format: "JPG",
        maxFileSize: "300 KB",
        sizes: "(max-width: 599px) 100vw, (max-width: 899px) 50vw, (max-width: 1199px) 33vw, 288px",
        quality: exports.IMAGE_QUALITY.card,
        safeArea: "A 4:3 upload is not cropped. Off-ratio uploads are trimmed symmetrically from the long edge — keep the product centred.",
    },
    /**
     * Featured card — angels components/sections/FeaturedSection.tsx
     * Grid xs:12 sm:6 md:3 inside Container maxWidth="lg".
     */
    featuredCard: {
        label: "Featured Card",
        recommended: [1200, 900],
        minimum: [800, 600],
        ratio: "4:3",
        targetRatio: 4 / 3,
        fit: "cover",
        cropped: true,
        transparency: false,
        format: "JPG",
        maxFileSize: "300 KB",
        sizes: "(max-width: 599px) 100vw, (max-width: 899px) 50vw, (max-width: 1199px) 25vw, 288px",
        quality: exports.IMAGE_QUALITY.card,
        safeArea: "A 4:3 upload is not cropped. Off-ratio uploads are trimmed symmetrically from the long edge — keep the product centred.",
    },
    /**
     * Circular category avatar — angels components/sections/CategoriesSection.tsx
     * Fixed 190x190 at every breakpoint; 570px needed at DPR 3.
     */
    categoryAvatar: {
        label: "Category Avatar",
        recommended: [800, 800],
        minimum: [512, 512],
        ratio: "1:1",
        targetRatio: 1,
        fit: "cover",
        cropped: true,
        transparency: false,
        format: "JPG",
        maxFileSize: "150 KB",
        sizes: "190px",
        quality: exports.IMAGE_QUALITY.card,
        safeArea: "Cropped to a circle — all four corners are discarded. Keep the subject inside the inscribed circle with ~10% breathing room.",
    },
    /**
     * Product gallery / modal main image — angels components/ui/ProductModal.tsx
     * 45% of a maxWidth="md" (900px) dialog on desktop, full width below that.
     */
    productGallery: {
        label: "Product Gallery / Modal",
        recommended: [1200, 1200],
        minimum: [800, 800],
        ratio: "1:1",
        targetRatio: 1,
        fit: "cover",
        cropped: true,
        transparency: false,
        format: "JPG",
        maxFileSize: "300 KB",
        sizes: "(max-width: 899px) 100vw, 420px",
        quality: exports.IMAGE_QUALITY.card,
        safeArea: "Keep the product centred; edges are trimmed on narrow viewports.",
    },
    /**
     * Small navigation / chip thumbnails — CakesCategoryNav (36-40px),
     * cart line items (72-88px), order rows (40px), modal gallery strip (56px).
     * These reuse the product/category asset — no separate upload.
     */
    thumbnail: {
        label: "Thumbnail (nav, cart, orders)",
        recommended: [256, 256],
        minimum: [128, 128],
        ratio: "1:1",
        targetRatio: 1,
        fit: "cover",
        cropped: true,
        transparency: false,
        format: "JPG",
        maxFileSize: "80 KB",
        sizes: "40px",
        quality: exports.IMAGE_QUALITY.thumbnail,
        safeArea: "Reuses the product or category asset. No separate upload required.",
    },
    /**
     * Category icon rendered at 18-24px in filter chips.
     * KNOWN FOLLOW-UP: this currently reuses the category photograph, which is
     * illegible at icon size. A dedicated transparent icon media slot on Category
     * is a separate future improvement.
     */
    categoryIcon: {
        label: "Category Icon (chips)",
        recommended: [256, 256],
        minimum: [128, 128],
        ratio: "1:1",
        targetRatio: 1,
        fit: "contain",
        cropped: false,
        transparency: true,
        format: "PNG or SVG",
        maxFileSize: "40 KB",
        sizes: "24px",
        quality: exports.IMAGE_QUALITY.thumbnail,
        safeArea: "Not cropped (object-fit: contain). Currently reuses the category photograph, which is illegible at icon size — a dedicated transparent icon asset is a planned improvement, so uploading one here has no effect yet.",
    },
};
/** Ordered slot names — used by the docs generator and admin reference lists. */
exports.IMAGE_SLOT_NAMES = Object.keys(exports.IMAGE_SLOTS);
function getImageSlot(name) {
    return exports.IMAGE_SLOTS[name];
}
// ─── Advisory validation ─────────────────────────────────────────────────────
// Shared so the admin panel and any future surface warn identically.
// These are ADVISORY ONLY: they never block upload or selection.
/** Fractional tolerance before an aspect ratio is considered mismatched (10%). */
exports.ASPECT_RATIO_TOLERANCE = 0.1;
/** Format a numeric ratio as a readable "N:1" or "1:N" string. */
function formatRatio(ratio) {
    if (!isFinite(ratio) || ratio <= 0)
        return "unknown";
    if (Math.abs(ratio - 1) < 0.01)
        return "1:1";
    return ratio >= 1 ? `${ratio.toFixed(2)}:1` : `1:${(1 / ratio).toFixed(2)}`;
}
/**
 * Compare real media dimensions against a slot spec.
 *
 * Returns an empty array when dimensions are unknown (legacy media) so callers
 * never surface a false warning. Being LARGER than recommended is always fine
 * and is never reported.
 */
function validateImageAgainstSpec(dimensions, spec) {
    const { width, height } = dimensions;
    // Unknown dimensions -> advisory silence, never a false warning.
    if (!width || !height || width <= 0 || height <= 0)
        return [];
    const issues = [];
    const [minW, minH] = spec.minimum;
    if (width < minW || height < minH) {
        issues.push({
            code: "below-minimum",
            level: "warning",
            message: `Image resolution is below the recommended minimum (${width} × ${height} px, ` +
                `needs at least ${minW} × ${minH} px). This image may appear blurry.`,
        });
    }
    const actualRatio = width / height;
    const deviation = Math.abs(actualRatio - spec.targetRatio) / spec.targetRatio;
    if (deviation > exports.ASPECT_RATIO_TOLERANCE) {
        // With object-fit: cover, a wider-than-target image loses its sides;
        // a taller-than-target image loses its top and bottom.
        const cropDirection = spec.fit === "cover"
            ? actualRatio > spec.targetRatio
                ? " The left and right edges will be cropped."
                : " The top and bottom will be cropped."
            : "";
        issues.push({
            code: "aspect-mismatch",
            level: "warning",
            message: `This image has a ${formatRatio(actualRatio)} ratio, while this slot expects ` +
                `${formatRatio(spec.targetRatio)}. The image may be cropped significantly.${cropDirection}`,
        });
    }
    return issues;
}
