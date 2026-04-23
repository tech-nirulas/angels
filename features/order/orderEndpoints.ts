import { Parameters } from "@/interfaces/parameters.interface";
import { EndpointBuilder } from "@reduxjs/toolkit/query";

type EndpointDefinitions = EndpointBuilder<any, any, any>;

export const orderEndpoints = (builder: EndpointDefinitions) => ({
  createOrder: builder.mutation<
    any,
    {
      orderType: string;
      deliveryAddressId: string;
      promoCode?: string;
    }
  >({
    query: (body) => ({
      url: "order",
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
