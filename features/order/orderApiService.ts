import getDecryptedToken from "@/helpers/decryptToken.helper";
import { API_BASE_URL } from "@/utils/constants";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { orderEndpoints } from "./orderEndpoints";

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers) => {
    headers.set("Content-Type", "application/json");

    // Get token from encrypted storage for authenticated requests
    const token = await getDecryptedToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const orderApiService = createApi({
  reducerPath: "orderApiService",
  baseQuery,
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
