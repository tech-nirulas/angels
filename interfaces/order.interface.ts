export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
  product: {
    id: string;
    name: string;
    sku?: string | null;
    mainImage?: { key: string } | null;
  };
}

export interface Order {
  id: string;
  orderNumber?: string | null;
  orderType: string;
  paymentMethod: string;
  status: string;
  subtotal: number | string;
  deliveryFee: number | string;
  grandTotal: number | string;
  placedAt: string;
  items?: OrderItem[];
  deliveryAddress?: {
    street: string;
    city: string;
    pincode: string;
  } | null;
}
