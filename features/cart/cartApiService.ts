// features/cart/cartApiService.ts
import getDecryptedToken from "@/helpers/decryptToken.helper";
import { API_BASE_URL } from "@/utils/constants";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { cartEndpoints } from "./cartEndpoints";


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

export const cartApiService = createApi({
  reducerPath: "cartApiService",
  baseQuery,
  tagTypes: ["Cart"],
  endpoints: cartEndpoints,
});

export const {
  useGetCartQuery,
  useLazyGetCartQuery,
  useGetCartCountQuery,
  useLazyGetCartCountQuery,
  useAddToCartMutation,
  useUpdateCartQuantityMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useMergeCartMutation,
  useValidateCartQuery,
  useLazyValidateCartQuery,
} = cartApiService;
