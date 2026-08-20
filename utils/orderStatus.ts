// utils/orderStatus.ts
//
// Canonical order-status vocabulary for the storefront.
//
// SOURCE OF TRUTH: the Prisma `OrderStatus` enum in
// aimk_backend/prisma/schema/order-status.prisma. Any value not in that enum is
// rejected by `PATCH /order/admin/:id/status`, so this list must not drift.
// The admin panel keeps a matching copy at aimk_admin/utils/orderStatus.ts — move
// the two together.

export type OrderStatusValue =
  | "pending"
  | "confirmed"
  | "payment_failed"
  | "processing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderStatusConfig {
  value: OrderStatusValue;
  label: string;
  /** Chip background. */
  bg: string;
  /** Chip foreground. */
  color: string;
}

/** Ordered by fulfilment lifecycle, with the terminal/exception states last. */
export const ORDER_STATUSES: OrderStatusConfig[] = [
  { value: "pending", label: "Pending", bg: "#FEF3C7", color: "#B45309" },
  { value: "confirmed", label: "Confirmed", bg: "#DBEAFE", color: "#1D4ED8" },
  { value: "processing", label: "Processing", bg: "#EDE9FE", color: "#6D28D9" },
  { value: "ready", label: "Ready", bg: "#D1FAE5", color: "#047857" },
  { value: "out_for_delivery", label: "Out for Delivery", bg: "#E0F2FE", color: "#0369A1" },
  { value: "delivered", label: "Delivered", bg: "#D1FAE5", color: "#065F46" },
  { value: "cancelled", label: "Cancelled", bg: "#FEE2E2", color: "#991B1B" },
  { value: "payment_failed", label: "Payment Failed", bg: "#FEE2E2", color: "#991B1B" },
  { value: "refunded", label: "Refunded", bg: "#F3F4F6", color: "#6B7280" },
];

const FALLBACK: OrderStatusConfig = {
  value: "pending",
  label: "Unknown",
  bg: "#F1F5F9",
  color: "#334155",
};

const BY_VALUE = new Map(ORDER_STATUSES.map((s) => [s.value, s]));

/**
 * Resolves any status string to a renderable config. Unknown values (e.g. a new
 * enum member added backend-first) render with their raw name rather than a
 * blank chip, so the UI degrades legibly instead of silently.
 */
export function getOrderStatusConfig(status?: string | null): OrderStatusConfig {
  if (!status) return FALLBACK;
  const key = String(status).toLowerCase();
  return BY_VALUE.get(key as OrderStatusValue) ?? { ...FALLBACK, label: key.replace(/_/g, " ") };
}

export function getOrderStatusLabel(status?: string | null): string {
  return getOrderStatusConfig(status).label;
}

/** True when the status is one the backend actually accepts. */
export function isKnownOrderStatus(status?: string | null): boolean {
  return Boolean(status) && BY_VALUE.has(String(status).toLowerCase() as OrderStatusValue);
}
