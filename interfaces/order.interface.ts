import { Address } from "./address.interface";

/**
 * Order-time product snapshot. The backend writes this object into
 * OrderItem.productSnapshot (Prisma Json) at checkout, so it must stay a
 * structural type rather than Product: a past order legitimately keeps the
 * name/price of a product that has since been renamed, repriced or deleted.
 *
 * Shape written by order.service.ts createOrder. Older rows (pre-snapshot
 * enrichment) only carry id/sku/name/image/discount/basePrice/unitPrice, so
 * everything added since is optional.
 */
export interface ProductSnapshot {
  id: string;
  name: string;
  sku?: string | null;
  image?: string | null;
  basePrice?: number;
  unitPrice?: number;
  discount?: number | null;
  promoDiscount?: number;
  gstRate?: number;
  hsnCode?: string | null;
  brandId?: string | null;
  brand?: { id: string; name: string; slug: string } | null;
  legalEntityId?: string | null;
  category?: { id: string; name: string; slug: string } | null;
}

export interface OrderItem {
  id: string;
  quantity: number;
  unit: string;
  unitPrice: number | string;
  lineTotal: number | string;
  productSnapshot?: ProductSnapshot | null;
  specialInstructions?: string | null;
  cakeSize?: string | null;
  cakeFlavor?: string | null;
  frostingFlavor?: string | null;
  fillingFlavor?: string | null;
  preparationStatus: string;
  productId: string;
  orderId: string;
  fulfillmentOutletId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber?: string | null;
  orderType: string;
  paymentMethod: string;
  status: string;
  bakingStatus?: string;
  subtotal: number | string;
  discountTotal?: number | string;
  deliveryFee: number | string;
  grandTotal: number | string;
  placedAt: string;
  items?: OrderItem[];
  /** Full Address record — the backend includes the relation, so it has line1/postcode. */
  deliveryAddress?: Address | null;
}
