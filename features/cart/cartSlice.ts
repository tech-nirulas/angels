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
    return raw.map((item) => ({
      id: `temp-${item.productId}-${Math.random()}`,
      productId: item.productId,
      quantity: item.quantity ?? 1,
      product: {
        id: item.productId,
        name: item.name ?? "",
        slug: item.slug ?? "",
        description: item.description ?? "",
        basePrice: item.price ?? 0,
        inStock: true,
        mainImage: item.image ?? null,
      },
      currentPrice: item.price ?? 0,
      currentDiscount: item.discount ?? null,
      lineTotal: (item.price ?? 0) * (item.quantity ?? 1),
    }));
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
      price: item.currentPrice,
      discount: item.currentDiscount,
      image: item.product.mainImage,
    }));
    localStorage.setItem("guestCart", JSON.stringify(simple));
  } catch {
    /* ignore write errors */
  }
}

// ── Slice state ───────────────────────────────────────────────────────────────
interface CartState {
  /** Items used ONLY for unauthenticated (guest) sessions. */
  guestItems: CartItem[];
  /** Drawer / sidebar open state. */
  isOpen: boolean;
}

const initialState: CartState = {
  guestItems: loadGuestCart(),
  isOpen: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // ── Guest cart actions ─────────────────────────────────────────────────
    addToGuestCart(
      state,
      action: PayloadAction<{ productId: string; quantity?: number; product: CartItem["product"] }>
    ) {
      const { productId, quantity = 1, product } = action.payload;
      const existing = state.guestItems.find((i) => i.productId === productId);
      if (existing) {
        existing.quantity += quantity;
        existing.lineTotal = existing.currentPrice * existing.quantity;
      } else {
        state.guestItems.push({
          id: `temp-${productId}-${Date.now()}`,
          productId,
          quantity,
          product,
          currentPrice: product.basePrice,
          currentDiscount: null,
          lineTotal: product.basePrice * quantity,
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
          item.lineTotal = item.currentPrice * quantity;
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

// ── Exports ───────────────────────────────────────────────────────────────────
export const {
  addToGuestCart,
  updateGuestQuantity,
  removeFromGuestCart,
  clearGuestCart,
  openCart,
  closeCart,
  toggleCart,
} = cartSlice.actions;

export default cartSlice.reducer;