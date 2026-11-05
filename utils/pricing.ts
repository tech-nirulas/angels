/**
 * Tax-inclusive display pricing.
 *
 * Product prices in the DB/API are PRE-TAX (`basePrice`, `discountedPrice`, cart
 * snapshot prices). The customer always pays tax-inclusive, so every price shown
 * on the storefront is converted here. Must stay in lockstep with
 * aimk_backend/src/modules/order/pricing.helper.ts — one formula, two runtimes.
 *
 * IMPORTANT: only for DISPLAY. Cart add / checkout payloads must keep sending
 * pre-tax prices — the backend converts (see promotion-evaluation.service.ts).
 */
export function taxInclusive(
  preTax: number,
  gstRate: number | string | null | undefined,
): number {
  const price = Number(preTax) || 0;
  const rate = Number(gstRate ?? 5) || 0;
  return Math.round((price * (1 + rate / 100) + Number.EPSILON) * 100) / 100;
}

export function gstRateOf(product: { gstRate?: number | string | null }): number {
  const rate = Number(product.gstRate);
  return Number.isFinite(rate) ? rate : 5;
}

/**
 * The customer never picks a delivery window — it is derived strictly from the
 * current IST wall clock: 00:00–03:59 midnight, 04:00–07:59 early_morning,
 * 08:00–23:59 standard. Must stay in lockstep with
 * aimk_backend/src/modules/delivery-fee/delivery-window.ts (the authority).
 */
export function detectDeliveryWindow(at: Date = new Date()): "standard" | "early_morning" | "midnight" {
  const istMinutes = Math.floor((at.getTime() + 330 * 60 * 1000) / 60000) % 1440;
  const h = Math.floor(istMinutes / 60);
  if (h < 4) return "midnight";
  if (h < 8) return "early_morning";
  return "standard";
}

/** GST contained in a tax-inclusive total: total × rate / (100 + rate). */
export function gstFromInclusive(
  inclusiveTotal: number,
  gstRate: number | string | null | undefined,
): number {
  const total = Number(inclusiveTotal) || 0;
  const rate = Number(gstRate ?? 5) || 0;
  return Math.round((total * (rate / (100 + rate)) + Number.EPSILON) * 100) / 100;
}
