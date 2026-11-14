// features/cart/cartEndpoints.ts
import { EndpointBuilder } from "@reduxjs/toolkit/query/react";
import { CartItem } from "./cartSlice";
import { Root } from "@/interfaces/root.interface";

type Builder = EndpointBuilder<any, any, any>;

export interface AddToCartDto {
  productId: string;
  quantity?: number;
  variantId?: string | null;
  modifierOptionIds?: string[] | null;
  itemNotes?: string | null;
}

export interface UpdateCartQuantityDto {
  productId?: string;
  itemIdentifier?: string;
  quantity: number;
}

export interface MergeCartDto {
  items: {
    productId: string;
    quantity: number;
    variantId?: string | null;
    modifierOptionIds?: string[] | null;
    selectedVariant?: any;
    selectedModifiers?: any;
    configurationHash?: string;
    itemNotes?: string | null;
    snapshotPrice?: number;
  }[];
}

export const cartEndpoints = (builder: Builder) => ({
  // GET /cart
  getCart: builder.query<Root<CartItem[]>, void>({
    query: () => ({
      url: "cart",
      method: "GET",
    }),
    providesTags: ["Cart"],
  }),

  // GET /cart/count
  getCartCount: builder.query<Root<number>, void>({
    query: () => ({
      url: "cart/count",
      method: "GET",
    }),
    providesTags: ["Cart"],
  }),

  // POST /cart/add
  addToCart: builder.mutation<Root<CartItem[]>, AddToCartDto>({
    query: (body) => ({
      url: "cart/add",
      method: "POST",
      body: {
        productId: body.productId,
        quantity: body.quantity ?? 1,
        variantId: body.variantId || undefined,
        modifierOptionIds: body.modifierOptionIds || undefined,
        itemNotes: body.itemNotes || undefined,
      },
    }),
    invalidatesTags: ["Cart"],
  }),

  // PUT /cart/item/:itemIdentifier
  updateCartQuantity: builder.mutation<Root<CartItem[]>, UpdateCartQuantityDto>({
    query: ({ productId, itemIdentifier, quantity }) => ({
      url: `cart/item/${itemIdentifier || productId}`,
      method: "PUT",
      body: { quantity },
    }),
    invalidatesTags: ["Cart"],
  }),

  // DELETE /cart/item/:itemIdentifier
  removeFromCart: builder.mutation<Root<CartItem[]>, string>({
    query: (itemIdentifier) => ({
      url: `cart/item/${itemIdentifier}`,
      method: "DELETE",
    }),
    invalidatesTags: ["Cart"],
  }),

  // DELETE /cart/clear
  clearCart: builder.mutation<Root<void>, void>({
    query: () => ({
      url: "cart/clear",
      method: "DELETE",
    }),
    invalidatesTags: ["Cart"],
  }),

  // POST /cart/merge  — called after login to sync guest cart
  mergeCart: builder.mutation<Root<CartItem[]>, MergeCartDto>({
    query: (body) => ({
      url: "cart/merge",
      method: "POST",
      body,
    }),
    invalidatesTags: ["Cart"],
  }),

  // GET /cart/validate
  validateCart: builder.query<Root<{ valid: boolean; issues: any[] }>, void>({
    query: () => ({
      url: "cart/validate",
      method: "GET",
    }),
  }),
});