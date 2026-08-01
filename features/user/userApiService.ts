import { createApi } from "@reduxjs/toolkit/query/react";
import { userEndpoints } from "./userEndpoints";
import { baseQueryWithReauth } from "@/features/api/baseQuery";

export const userApiService = createApi({
  reducerPath: "userApiService",
  baseQuery: baseQueryWithReauth,
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
  useGetMyLoyaltyProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = userApiService;
