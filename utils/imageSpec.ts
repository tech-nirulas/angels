/**
 * Compatibility re-export.
 *
 * The image specification now lives in the shared package `@aimk/image-spec`
 * (canonical source: aimk_backend/packages/aimk-image-spec/src/index.ts) so that
 * this storefront, the Admin Panel and IMAGE_GUIDELINES.md all consume identical
 * values from one place.
 *
 * Do NOT add or override slot definitions here — that would recreate the second
 * source of truth this package exists to eliminate. Edit the package instead and
 * run `npm run build` in it to recompile, sync to consumers and regenerate the docs.
 *
 * This file exists only so existing imports (`@/utils/imageSpec`) keep working.
 */
export {
  IMAGE_QUALITY,
  IMAGE_SLOTS,
  IMAGE_SLOT_NAMES,
  getImageSlot,
  formatRatio,
  validateImageAgainstSpec,
  ASPECT_RATIO_TOLERANCE,
} from "@aimk/image-spec";

export type {
  ImageSlotSpec,
  ImageSlotName,
  ImageValidationIssue,
  ImageIssueCode,
} from "@aimk/image-spec";
