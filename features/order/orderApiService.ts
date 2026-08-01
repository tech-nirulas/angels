import { createApi } from "@reduxjs/toolkit/query/react";
import { orderEndpoints } from "./orderEndpoints";
import { baseQueryWithReauth } from "@/features/api/baseQuery";

export const orderApiService = createApi({
  reducerPath: "orderApiService",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Order"],
  endpoints: orderEndpoints,
});

export const {
  useCreateOrderMutation,
  useVerifyPaymentMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useGetOrdersPaginatedQuery,
  useLazyGetOrderQuery,
  useLazyGetOrdersPaginatedQuery,
  useLazyGetOrdersQuery,
} = orderApiService;
