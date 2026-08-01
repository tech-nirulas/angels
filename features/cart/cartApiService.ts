import { createApi } from "@reduxjs/toolkit/query/react";
import { cartEndpoints } from "./cartEndpoints";
import { baseQueryWithReauth } from "@/features/api/baseQuery";

export const cartApiService = createApi({
  reducerPath: "cartApiService",
  baseQuery: baseQueryWithReauth,
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
