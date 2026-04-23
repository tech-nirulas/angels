// features/auth/authApiService.ts (add signup mutation)
import getDecryptedToken from "@/helpers/decryptToken.helper";
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from "@/interfaces/auth.interface";
import { Root } from "@/interfaces/root.interface";
import { API_BASE_URL } from "@/utils/constants";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

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

export const authApiService = createApi({
  reducerPath: "authApi",
  baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation<Root<LoginResponse>, LoginRequest>({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    signup: builder.mutation<Root<SignupResponse>, SignupRequest>({
      query: (userData) => ({
        url: "auth/signup",
        method: "POST",
        body: userData,
      }),
    }),
    fetchUser: builder.query({
      query: (token) => ({
        url: "auth/user",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }),
    }),
    verifyToken: builder.mutation({
      query: (token) => ({
        url: "auth/verify",
        method: "POST",
        body: { token },
      }),
    }),
    requestOtp: builder.mutation({
      query: (email) => ({
        url: "auth/request-otp",
        method: "POST",
        body: { email },
      }),
    }),
    resendOtp: builder.mutation({
      query: (email) => ({
        url: "auth/resend-otp",
        method: "POST",
        body: { email },
      }),
    }),
    verifyOtp: builder.mutation({
      query: ({ email, otp, guestCart }) => ({
        url: "auth/verify-otp",
        method: "POST",
        body: { email, otp, guestCart },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useFetchUserQuery,
  useLazyFetchUserQuery,
  useVerifyTokenMutation,
  useRequestOtpMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
} = authApiService;
