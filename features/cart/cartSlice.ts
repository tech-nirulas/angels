// features/cart/cartSlice.ts
import { RootState } from "@/lib/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ── Shared cart item shape (mirrors CartItemResponse from the backend) ────────
export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  snapshotPrice?: number;
  snapshotDiscount?: number | null;
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    discountedPrice?: number;
    discountPct?: number | null;
    inStock: boolean;
    mainImage?: { url?: string; key?: string } | null;
  };
  currentPrice: number;
  currentDiscount: number | null;
  lineTotal: number;
}

// ── Guest-cart helpers ────────────────────────────────────────────────────────
function loadGuestCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("guestCart");
    if (!stored) return [];
    const raw: any[] = JSON.parse(stored);
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => {
      const basePrice = Number(item.price ?? 0);
      const discountedPrice = item.discountedPrice !== undefined ? Number(item.discountedPrice) : basePrice;
      const discountPct = item.discount ?? null;
      const effectivePrice = discountedPrice < basePrice ? discountedPrice : (discountPct && discountPct > 0 ? basePrice * (1 - discountPct / 100) : basePrice);

      return {
        id: `temp-${item.productId}-${Math.random()}`,
        productId: item.productId,
        quantity: item.quantity ?? 1,
        product: {
          id: item.productId,
          name: item.name ?? "",
          slug: item.slug ?? "",
          description: item.description ?? "",
          basePrice,
          discountedPrice,
          discountPct,
          inStock: true,
          mainImage: item.image ?? null,
        },
        currentPrice: basePrice,
        currentDiscount: discountPct,
        lineTotal: effectivePrice * (item.quantity ?? 1),
      };
    });
  } catch {
    return [];
  }
}

function saveGuestCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    const simple = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      name: item.product.name,
      slug: item.product.slug,
      price: item.product.basePrice,
      discountedPrice: item.product.discountedPrice,
      discount: item.currentDiscount,
      image: item.product.mainImage,
    }));
    localStorage.setItem("guestCart", JSON.stringify(simple));
  } catch {
    /* ignore write errors */
  }
}

export interface AppliedPromoInfo {
  code: string;
  discountAmount: number;
  offerId?: string;
  title?: string;
}

// ── Slice state ───────────────────────────────────────────────────────────────
interface CartState {
  /** Items used ONLY for unauthenticated (guest) sessions. */
  guestItems: CartItem[];
  /** Drawer / sidebar open state. */
  isOpen: boolean;
  /** Currently applied promo code coupon info. */
  appliedPromo: AppliedPromoInfo | null;
}

const initialState: CartState = {
  guestItems: loadGuestCart(),
  isOpen: false,
  appliedPromo: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // ── Promo Code actions ─────────────────────────────────────────────────
    applyPromo(state, action: PayloadAction<AppliedPromoInfo>) {
      state.appliedPromo = action.payload;
    },
    removePromo(state) {
      state.appliedPromo = null;
    },
    // ── Guest cart actions ─────────────────────────────────────────────────
    addToGuestCart(
      state,
      action: PayloadAction<{ productId: string; quantity?: number; product: CartItem["product"] }>
    ) {
      const { productId, quantity = 1, product } = action.payload;
      const basePrice = Number(product.basePrice);
      const discountedPrice = product.discountedPrice !== undefined ? Number(product.discountedPrice) : basePrice;
      const discountPct = product.discountPct !== undefined ? product.discountPct : (discountedPrice < basePrice ? Math.round(((basePrice - discountedPrice) / basePrice) * 100) : null);
      const unitEffectivePrice = discountedPrice < basePrice ? discountedPrice : (discountPct && discountPct > 0 ? basePrice * (1 - discountPct / 100) : basePrice);

      const existing = state.guestItems.find((i) => i.productId === productId);
      if (existing) {
        existing.quantity += quantity;
        const existingEffective = existing.product.discountedPrice !== undefined && existing.product.discountedPrice < existing.product.basePrice
          ? existing.product.discountedPrice
          : (existing.currentDiscount && existing.currentDiscount > 0 ? existing.currentPrice * (1 - existing.currentDiscount / 100) : existing.currentPrice);
        existing.lineTotal = existingEffective * existing.quantity;
      } else {
        state.guestItems.push({
          id: `temp-${productId}-${Date.now()}`,
          productId,
          quantity,
          product: {
            ...product,
            discountedPrice,
            discountPct,
          },
          currentPrice: basePrice,
          currentDiscount: discountPct,
          lineTotal: unitEffectivePrice * quantity,
        });
      }
      saveGuestCart(state.guestItems);
    },

    updateGuestQuantity(
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        state.guestItems = state.guestItems.filter((i) => i.productId !== productId);
      } else {
        const item = state.guestItems.find((i) => i.productId === productId);
        if (item) {
          item.quantity = quantity;
          const effective = item.product.discountedPrice !== undefined && item.product.discountedPrice < item.product.basePrice
            ? item.product.discountedPrice
            : (item.currentDiscount && item.currentDiscount > 0 ? item.currentPrice * (1 - item.currentDiscount / 100) : item.currentPrice);
          item.lineTotal = effective * item.quantity;
        }
      }
      saveGuestCart(state.guestItems);
    },

    removeFromGuestCart(state, action: PayloadAction<string>) {
      state.guestItems = state.guestItems.filter((i) => i.productId !== action.payload);
      saveGuestCart(state.guestItems);
    },

    clearGuestCart(state) {
      state.guestItems = [];
      saveGuestCart([]);
    },

    // ── Drawer actions ─────────────────────────────────────────────────────
    openCart(state) {
      state.isOpen = true;
    },
    closeCart(state) {
      state.isOpen = false;
    },
    toggleCart(state) {
      state.isOpen = !state.isOpen;
    },
  },
});

// ── Selectors ─────────────────────────────────────────────────────────────────

/** Open/close state of the cart drawer. */
export const selectCartIsOpen = (state: RootState) => state.cart?.isOpen ?? false;

/**
 * Guest-only items stored in Redux / localStorage.
 * For authenticated users, consume `useGetCartQuery` from cartApiService directly.
 */
export const selectGuestCartItems = (state: RootState): CartItem[] =>
  state.cart?.guestItems ?? [];

export const selectGuestCartCount = (state: RootState) =>
  selectGuestCartItems(state).reduce((sum, i) => sum + i.quantity, 0);

export const selectGuestCartTotal = (state: RootState) =>
  selectGuestCartItems(state).reduce((sum, i) => sum + i.lineTotal, 0);

export const selectAppliedPromo = (state: RootState): AppliedPromoInfo | null =>
  state.cart?.appliedPromo ?? null;

// ── Exports ───────────────────────────────────────────────────────────────────
export const {
  applyPromo,
  removePromo,
  addToGuestCart,
  updateGuestQuantity,
  removeFromGuestCart,
  clearGuestCart,
  openCart,
  closeCart,
  toggleCart,
} = cartSlice.actions;

export default cartSlice.reducer;