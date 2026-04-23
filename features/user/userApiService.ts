// features/user/userApiService.ts
import getDecryptedToken from "@/helpers/decryptToken.helper";
import { API_BASE_URL } from "@/utils/constants";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userEndpoints } from "./userEndpoints";

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

export const userApiService = createApi({
  reducerPath: "userApiService",
  baseQuery,
  tagTypes: ["User"],
  endpoints: userEndpoints,
});

// Export all hooks
export const {
  useGetAllUsersQuery,
  useLazyGetAllUsersQuery,
  useGetUserQuery,
  useLazyGetUserQuery,
  useGetProfileQuery,
  useLazyGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = userApiService;
