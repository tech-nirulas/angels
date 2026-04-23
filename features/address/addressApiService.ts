// features/address/addressApiService.ts
import getDecryptedToken from "@/helpers/decryptToken.helper";
import { API_BASE_URL } from "@/utils/constants";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { addressEndpoints } from "./addressEndpoints";

// const baseQuery = createBaseQuery();
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

export const addressApiService = createApi({
  reducerPath: "addressApiService",
  baseQuery,
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
