import { createApi } from "@reduxjs/toolkit/query/react";
import { addressEndpoints } from "./addressEndpoints";
import { baseQueryWithReauth } from "@/features/api/baseQuery";

export const addressApiService = createApi({
  reducerPath: "addressApiService",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Address"],
  endpoints: addressEndpoints,
});

export const {
  useGetAddressesQuery,
  useLazyGetAddressesQuery,
  useGetAddressQuery,
  useLazyGetAddressQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  useGetNearestOutletQuery,
  useLazyGetNearestOutletQuery,
} = addressApiService;
