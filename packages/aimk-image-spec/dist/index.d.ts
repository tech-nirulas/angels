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
/** Quality tiers. Must stay in sync with `images.qualities` in angels/next.config.ts. */
export declare const IMAGE_QUALITY: {
    /** Full-bleed hero — largest surface, most visible compression artefacts. */
    readonly hero: 90;
    /** Product / featured / category cards. */
    readonly card: 85;
    /** Small thumbnails (<= 88px) where 75 is indistinguishable from 90. */
    readonly thumbnail: 75;
};
export interface ImageSlotSpec {
    /** Human-readable slot name used in the admin UI and the Marketing guide. */
    label: string;
    /** Recommended upload size, [width, height] in px. */
    recommended: readonly [number, number];
    /** Minimum acceptable upload size, [width, height] in px. */
    minimum: readonly [number, number];
    /** Aspect ratio as displayed to a human. */
    ratio: string;
    /**
     * Numeric width/height ratio the uploaded asset should have.
     * Used for advisory validation. For slots whose container ratio varies by
     * breakpoint (the hero), this is the ratio the source asset should be authored at.
     */
    targetRatio: number;
    /** CSS object-fit applied to the rendered image. */
    fit: "cover" | "contain";
    /** Whether the rendered container crops the source. */
    cropped: boolean;
    /** Whether an alpha channel is preserved and useful. */
    transparency: boolean;
    /** Recommended upload format. */
    format: string;
    /** Practical file-size ceiling for uploads. */
    maxFileSize: string;
    /** The `sizes` attribute for next/image, derived from measured containers. */
    sizes: string;
    /** The `quality` prop for next/image. */
    quality: number;
    /** Guidance on which part of the image always survives cropping. */
    safeArea: string;
}
export declare const IMAGE_SLOTS: {
    /**
     * Hero / offer banner — angels components/sections/HeroSection.tsx
     * Container ratio is breakpoint-dependent: 4:5 (<600), 4:3 (600-899),
     * 2.37:1 (>=900), clamped by maxHeight: 80vh on very wide screens.
     * Mobile is the binding constraint for the safe area: 0.8 / 2.37 = 33.8%.
     */
    readonly heroBanner: {
        readonly label: "Hero / Offer Banner";
        readonly recommended: readonly [2560, 1080];
        readonly minimum: readonly [1920, 810];
        readonly ratio: "2.37:1 (desktop) · 4:3 (tablet) · 4:5 (mobile)";
        readonly targetRatio: number;
        readonly fit: "cover";
        readonly cropped: true;
        readonly transparency: false;
        readonly format: "JPG";
        readonly maxFileSize: "800 KB";
        readonly sizes: "100vw";
        readonly quality: 90;
        readonly safeArea: string;
    };
    /**
     * Product card — angels components/ui/ProductCard.tsx (MenuSection and /cakes)
     * Grid xs:12 sm:6 md:4 lg:3 inside Container maxWidth="lg".
     * Widest render 567px (single column at a 599px viewport) -> 1134px at DPR 2.
     */
    readonly productCard: {
        readonly label: "Product Card";
        readonly recommended: readonly [1200, 900];
        readonly minimum: readonly [800, 600];
        readonly ratio: "4:3";
        readonly targetRatio: number;
        readonly fit: "cover";
        readonly cropped: true;
        readonly transparency: false;
        readonly format: "JPG";
        readonly maxFileSize: "300 KB";
        readonly sizes: "(max-width: 599px) 100vw, (max-width: 899px) 50vw, (max-width: 1199px) 33vw, 288px";
        readonly quality: 85;
        readonly safeArea: "A 4:3 upload is not cropped. Off-ratio uploads are trimmed symmetrically from the long edge — keep the product centred.";
    };
    /**
     * Featured card — angels components/sections/FeaturedSection.tsx
     * Grid xs:12 sm:6 md:3 inside Container maxWidth="lg".
     */
    readonly featuredCard: {
        readonly label: "Featured Card";
        readonly recommended: readonly [1200, 900];
        readonly minimum: readonly [800, 600];
        readonly ratio: "4:3";
        readonly targetRatio: number;
        readonly fit: "cover";
        readonly cropped: true;
        readonly transparency: false;
        readonly format: "JPG";
        readonly maxFileSize: "300 KB";
        readonly sizes: "(max-width: 599px) 100vw, (max-width: 899px) 50vw, (max-width: 1199px) 25vw, 288px";
        readonly quality: 85;
        readonly safeArea: "A 4:3 upload is not cropped. Off-ratio uploads are trimmed symmetrically from the long edge — keep the product centred.";
    };
    /**
     * Circular category avatar — angels components/sections/CategoriesSection.tsx
     * Fixed 190x190 at every breakpoint; 570px needed at DPR 3.
     */
    readonly categoryAvatar: {
        readonly label: "Category Avatar";
        readonly recommended: readonly [800, 800];
        readonly minimum: readonly [512, 512];
        readonly ratio: "1:1";
        readonly targetRatio: 1;
        readonly fit: "cover";
        readonly cropped: true;
        readonly transparency: false;
        readonly format: "JPG";
        readonly maxFileSize: "150 KB";
        readonly sizes: "190px";
        readonly quality: 85;
        readonly safeArea: "Cropped to a circle — all four corners are discarded. Keep the subject inside the inscribed circle with ~10% breathing room.";
    };
    /**
     * Product gallery / modal main image — angels components/ui/ProductModal.tsx
     * 45% of a maxWidth="md" (900px) dialog on desktop, full width below that.
     */
    readonly productGallery: {
        readonly label: "Product Gallery / Modal";
        readonly recommended: readonly [1200, 1200];
        readonly minimum: readonly [800, 800];
        readonly ratio: "1:1";
        readonly targetRatio: 1;
        readonly fit: "cover";
        readonly cropped: true;
        readonly transparency: false;
        readonly format: "JPG";
        readonly maxFileSize: "300 KB";
        readonly sizes: "(max-width: 899px) 100vw, 420px";
        readonly quality: 85;
        readonly safeArea: "Keep the product centred; edges are trimmed on narrow viewports.";
    };
    /**
     * Small navigation / chip thumbnails — CakesCategoryNav (36-40px),
     * cart line items (72-88px), order rows (40px), modal gallery strip (56px).
     * These reuse the product/category asset — no separate upload.
     */
    readonly thumbnail: {
        readonly label: "Thumbnail (nav, cart, orders)";
        readonly recommended: readonly [256, 256];
        readonly minimum: readonly [128, 128];
        readonly ratio: "1:1";
        readonly targetRatio: 1;
        readonly fit: "cover";
        readonly cropped: true;
        readonly transparency: false;
        readonly format: "JPG";
        readonly maxFileSize: "80 KB";
        readonly sizes: "40px";
        readonly quality: 75;
        readonly safeArea: "Reuses the product or category asset. No separate upload required.";
    };
    /**
     * Category icon rendered at 18-24px in filter chips.
     * KNOWN FOLLOW-UP: this currently reuses the category photograph, which is
     * illegible at icon size. A dedicated transparent icon media slot on Category
     * is a separate future improvement.
     */
    readonly categoryIcon: {
        readonly label: "Category Icon (chips)";
        readonly recommended: readonly [256, 256];
        readonly minimum: readonly [128, 128];
        readonly ratio: "1:1";
        readonly targetRatio: 1;
        readonly fit: "contain";
        readonly cropped: false;
        readonly transparency: true;
        readonly format: "PNG or SVG";
        readonly maxFileSize: "40 KB";
        readonly sizes: "24px";
        readonly quality: 75;
        readonly safeArea: "Not cropped (object-fit: contain). Currently reuses the category photograph, which is illegible at icon size — a dedicated transparent icon asset is a planned improvement, so uploading one here has no effect yet.";
    };
};
export type ImageSlotName = keyof typeof IMAGE_SLOTS;
/** Ordered slot names — used by the docs generator and admin reference lists. */
export declare const IMAGE_SLOT_NAMES: ImageSlotName[];
export declare function getImageSlot(name: ImageSlotName): ImageSlotSpec;
/** Fractional tolerance before an aspect ratio is considered mismatched (10%). */
export declare const ASPECT_RATIO_TOLERANCE = 0.1;
export type ImageIssueCode = "below-minimum" | "aspect-mismatch";
export interface ImageValidationIssue {
    code: ImageIssueCode;
    /** Always "warning" — nothing here is a hard failure. */
    level: "warning";
    message: string;
}
/** Format a numeric ratio as a readable "N:1" or "1:N" string. */
export declare function formatRatio(ratio: number): string;
/**
 * Compare real media dimensions against a slot spec.
 *
 * Returns an empty array when dimensions are unknown (legacy media) so callers
 * never surface a false warning. Being LARGER than recommended is always fine
 * and is never reported.
 */
export declare function validateImageAgainstSpec(dimensions: {
    width?: number | null;
    height?: number | null;
}, spec: ImageSlotSpec): ImageValidationIssue[];
