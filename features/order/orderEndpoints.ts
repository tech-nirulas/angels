import { Parameters } from "@/interfaces/parameters.interface";
import { EndpointBuilder } from "@reduxjs/toolkit/query/react";

type EndpointDefinitions = EndpointBuilder<any, any, any>;

export const orderEndpoints = (builder: EndpointDefinitions) => ({
  createOrder: builder.mutation<
    any,
    {
      orderType: string;
      deliveryAddressId: string;
      promoCode?: string;
      paymentMethod?: string;
      /**
       * Identifies one logical "pay" attempt. The backend returns the original
       * order for a repeat with the same key, so a double click or a retry
       * after an ambiguous response cannot create a second order.
       */
      idempotencyKey?: string;
    }
  >({
    query: (body) => ({
      url: "order",
      method: "POST",
      body,
    }),
    // Only COD consumes the server cart at creation. An online order consumes
    // it on capture (verifyPayment), so invalidating here would refetch a cart
    // that is still full and briefly show the purchased items as unpurchased.
    invalidatesTags: [],
  }),

  // Server-authoritative totals. The backend derives subtotal/GST/delivery fee
  // from the persisted cart and its own promotion rules, so this is the only
  // number that matches what the user is actually charged.
  previewOrder: builder.mutation<
    any,
    { deliveryAddressId: string; promoCode?: string; orderType?: string }
  >({
    query: (body) => ({
      url: "order/preview",
      method: "POST",
      body,
    }),
  }),

  verifyPayment: builder.mutation<
    any,
    {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }
  >({
    query: (body) => ({
      url: "order/verify-payment",
      method: "POST",
      body,
    }),
    // The capture consumed the server cart.
    invalidatesTags: ["Cart"],
  }),

  getOrders: builder.query<any, void>({
    query: () => ({
      url: "order",
      method: "GET",
    }),
    providesTags: ["Order"],
  }),

  getOrdersPaginated: builder.query<any, Parameters>({
    query: (params) => ({
      url: "order/paginated",
      method: "GET",
      params: {
        page: params.page,
        limit: params.limit,
        ...(params.sortBy && { sortBy: params.sortBy }),
        ...(params.sortOrder && { sortOrder: params.sortOrder }),
      },
    }),
    providesTags: ["Order"],
  }),

  getOrder: builder.query<any, { id: string }>({
    query: ({ id }) => ({
      url: `order/${id}`,
      method: "GET",
    }),
    providesTags: ["Order"],
  }),
});
