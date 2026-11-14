// features/cart/cartSlice.ts
import type { RootState } from "@/lib/store";
import { computeClientConfigHash } from "../../utils/cartHash.ts";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface SelectedVariantSnapshot {
  id: string;
  sku?: string;
  name: string;
  price: number;
}

export interface SelectedModifierSnapshot {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
}

// ── Shared cart item shape (mirrors CartItemResponse from the backend) ────────
export interface CartItem {
  id: string;
  productId: string;
  variantId?: string | null;
  configurationHash?: string;
  selectedVariant?: SelectedVariantSnapshot | null;
  selectedModifiers?: SelectedModifierSnapshot[] | null;
  itemNotes?: string | null;
  quantity: number;
  snapshotPrice?: number;
  snapshotDiscount?: number | null;
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    /** GST rate (%), kept pre-tax in currentPrice — used only for tax-inclusive display. */
    gstRate?: number | string;
    discountedPrice?: number;
    discountPct?: number | null;
    inStock: boolean;
    /** cart.service includes a trimmed {id,name,slug} category on each item's product. */
    category?: { id: string; name: string; slug: string } | null;
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
      const hasVariant = Boolean(item.variantId || item.selectedVariant);
      const effectivePrice = !hasVariant && discountedPrice < basePrice
        ? discountedPrice
        : (discountPct && discountPct > 0 ? basePrice * (1 - discountPct / 100) : basePrice);
      const configHash =
        item.configurationHash ||
        computeClientConfigHash(
          item.productId,
          item.variantId,
          item.selectedModifiers ? item.selectedModifiers.map((m: any) => m.optionId) : null
        );

      return {
        id: item.id || `temp-${configHash}-${Math.random()}`,
        productId: item.productId,
        variantId: item.variantId || null,
        configurationHash: configHash,
        selectedVariant: item.selectedVariant || null,
        selectedModifiers: item.selectedModifiers || null,
        itemNotes: item.itemNotes || null,
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
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      configurationHash: item.configurationHash,
      selectedVariant: item.selectedVariant,
      selectedModifiers: item.selectedModifiers,
      itemNotes: item.itemNotes,
      quantity: item.quantity,
      name: item.product.name,
      slug: item.product.slug,
      price: item.currentPrice,
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
    updatePromoDiscount(state, action: PayloadAction<number>) {
      if (state.appliedPromo) {
        state.appliedPromo.discountAmount = action.payload;
      }
    },
    // ── Guest cart actions ─────────────────────────────────────────────────
    addToGuestCart(
      state,
      action: PayloadAction<{
        productId: string;
        quantity?: number;
        variantId?: string | null;
        modifierOptionIds?: string[] | null;
        selectedVariant?: SelectedVariantSnapshot | null;
        selectedModifiers?: SelectedModifierSnapshot[] | null;
        itemNotes?: string | null;
        product: CartItem["product"];
        unitPrice?: number;
      }>
    ) {
      const {
        productId,
        quantity = 1,
        variantId,
        modifierOptionIds,
        selectedVariant,
        selectedModifiers,
        itemNotes,
        product,
        unitPrice,
      } = action.payload;

      const basePrice = unitPrice !== undefined ? Number(unitPrice) : Number(product.basePrice);
      const hasVariant = Boolean(variantId || selectedVariant);
      const productBasePrice = Number(product.basePrice || basePrice);
      const productDiscountedPrice =
        product.discountedPrice !== undefined ? Number(product.discountedPrice) : productBasePrice;

      const discountPct =
        product.discountPct !== undefined && product.discountPct !== null
          ? product.discountPct
          : !hasVariant && productDiscountedPrice < productBasePrice && productBasePrice > 0
          ? Math.round(((productBasePrice - productDiscountedPrice) / productBasePrice) * 100)
          : null;

      const unitEffectivePrice =
        !hasVariant && productDiscountedPrice < basePrice
          ? productDiscountedPrice
          : discountPct && discountPct > 0
          ? Math.round(basePrice * (1 - discountPct / 100) * 100) / 100
          : basePrice;

      const configHash = computeClientConfigHash(
        productId,
        variantId,
        modifierOptionIds || (selectedModifiers ? selectedModifiers.map((m) => m.optionId) : null)
      );

      const existing = state.guestItems.find(
        (i) =>
          i.configurationHash === configHash ||
          (!i.configurationHash && i.productId === productId && !variantId && (!selectedModifiers || selectedModifiers.length === 0))
      );

      if (existing) {
        existing.quantity += quantity;
        const existingHasVariant = Boolean(existing.variantId || existing.selectedVariant);
        const existingEffective =
          !existingHasVariant &&
          existing.product.discountedPrice !== undefined &&
          existing.product.discountedPrice < existing.currentPrice
            ? existing.product.discountedPrice
            : existing.currentDiscount && existing.currentDiscount > 0
            ? existing.currentPrice * (1 - existing.currentDiscount / 100)
            : existing.currentPrice;
        existing.lineTotal = existingEffective * existing.quantity;
      } else {
        state.guestItems.push({
          id: `temp-${configHash}-${Date.now()}`,
          productId,
          variantId: variantId || null,
          configurationHash: configHash,
          selectedVariant: selectedVariant ?? null,
          selectedModifiers: selectedModifiers ?? null,
          itemNotes: itemNotes || null,
          quantity,
          product: {
            ...product,
            basePrice,
            discountedPrice: productDiscountedPrice,
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
      action: PayloadAction<{ itemIdentifier?: string; productId?: string; quantity: number }>
    ) {
      const { itemIdentifier, productId, quantity } = action.payload;
      const key = itemIdentifier || productId;
      if (!key) return;

      const itemIndex = state.guestItems.findIndex(
        (i) => i.id === key || i.configurationHash === key || i.productId === key
      );
      if (itemIndex === -1) return;

      if (quantity <= 0) {
        state.guestItems.splice(itemIndex, 1);
      } else {
        const item = state.guestItems[itemIndex];
        item.quantity = quantity;
        const itemHasVariant = Boolean(item.variantId || item.selectedVariant);
        const effective =
          !itemHasVariant &&
          item.product.discountedPrice !== undefined &&
          item.product.discountedPrice < item.currentPrice
            ? item.product.discountedPrice
            : item.currentDiscount && item.currentDiscount > 0
            ? item.currentPrice * (1 - item.currentDiscount / 100)
            : item.currentPrice;
        item.lineTotal = effective * item.quantity;
      }
      saveGuestCart(state.guestItems);
    },

    removeFromGuestCart(state, action: PayloadAction<string>) {
      const key = action.payload;
      state.guestItems = state.guestItems.filter(
        (i) => i.id !== key && i.configurationHash !== key && i.productId !== key
      );
      saveGuestCart(state.guestItems);
    },

    clearGuestCart(state) {
      state.guestItems = [];
      state.appliedPromo = null;
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
  updatePromoDiscount,
  addToGuestCart,
  updateGuestQuantity,
  removeFromGuestCart,
  clearGuestCart,
  openCart,
  closeCart,
  toggleCart,
} = cartSlice.actions;

export default cartSlice.reducer;