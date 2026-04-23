// features/cart/cartEndpoints.ts
import { EndpointBuilder } from "@reduxjs/toolkit/query";
import { CartItem } from "./cartSlice";
import { Root } from "@/interfaces/root.interface";

type Builder = EndpointBuilder<any, any, any>;

export interface AddToCartDto {
  productId: string;
  quantity?: number;
}

export interface UpdateCartQuantityDto {
  productId: string;
  quantity: number;
}

export interface MergeCartDto {
  items: {
    productId: string;
    quantity: number;
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
      body: { productId: body.productId, quantity: body.quantity ?? 1 },
    }),
    invalidatesTags: ["Cart"],
  }),

  // PUT /cart/item/:productId
  updateCartQuantity: builder.mutation<Root<CartItem[]>, UpdateCartQuantityDto>({
    query: ({ productId, quantity }) => ({
      url: `cart/item/${productId}`,
      method: "PUT",
      body: { quantity },
    }),
    invalidatesTags: ["Cart"],
  }),

  // DELETE /cart/item/:productId
  removeFromCart: builder.mutation<Root<CartItem[]>, string>({
    query: (productId) => ({
      url: `cart/item/${productId}`,
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