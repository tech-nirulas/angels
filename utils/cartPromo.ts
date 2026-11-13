import type { AppliedPromoInfo } from "@/features/cart/cartSlice";

export interface RevalidationDecision {
  action: "KEEP" | "UPDATE" | "REMOVE";
  newDiscountAmount?: number;
  reason?: string;
}

/**
 * Pure decision function to determine if a cart coupon should be kept, updated, or removed.
 */
export function decidePromoRevalidation(
  appliedPromo: AppliedPromoInfo | null,
  cartItemsCount: number,
  validationResult?: {
    eligible?: boolean;
    status?: boolean;
    valid?: boolean;
    discountAmount?: number;
    message?: string;
  } | null
): RevalidationDecision {
  if (!appliedPromo) {
    return { action: "KEEP" };
  }

  // 1. If cart is empty, promo must be removed immediately
  if (cartItemsCount === 0) {
    return {
      action: "REMOVE",
      reason: "Cart is empty",
    };
  }

  // 2. If validationResult is explicitly not eligible, drop promo
  if (
    validationResult &&
    (validationResult.eligible === false ||
      validationResult.status === false ||
      validationResult.valid === false)
  ) {
    return {
      action: "REMOVE",
      reason: validationResult.message || `Coupon '${appliedPromo.code}' is no longer eligible`,
    };
  }

  // 3. If validationResult is present and eligible, update discount if changed
  if (
    validationResult &&
    validationResult.eligible !== false &&
    typeof validationResult.discountAmount === "number"
  ) {
    if (validationResult.discountAmount !== appliedPromo.discountAmount) {
      return {
        action: "UPDATE",
        newDiscountAmount: validationResult.discountAmount,
      };
    }
  }

  return { action: "KEEP" };
}

/**
 * Calculates safe promo savings clamped to the cart total (defense in depth against negative or 0 totals)
 */
export function calculateSafePromoSaving(
  appliedPromo: { discountAmount: number } | null,
  cartTotal: number
): number {
  if (!appliedPromo || cartTotal <= 0) return 0;
  return Math.min(Math.max(0, appliedPromo.discountAmount), cartTotal);
}
