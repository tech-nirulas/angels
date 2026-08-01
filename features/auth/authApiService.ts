import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from "@/interfaces/auth.interface";
import { Root } from "@/interfaces/root.interface";
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/features/api/baseQuery";

export const authApiService = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
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
      query: (emailOrPhone) => ({
        url: "auth/request-otp",
        method: "POST",
        body: { emailOrPhone },
      }),
    }),
    resendOtp: builder.mutation({
      query: (emailOrPhone) => ({
        url: "auth/resend-otp",
        method: "POST",
        body: { emailOrPhone },
      }),
    }),
    verifyOtp: builder.mutation({
      query: ({ emailOrPhone, otp, guestCart }) => ({
        url: "auth/verify-otp",
        method: "POST",
        body: { emailOrPhone, otp, guestCart },
      }),
    }),
    verifyEmailOtp: builder.mutation({
      query: ({ email, otp }) => ({
        url: "auth/verify-email-otp",
        method: "POST",
        body: { email, otp },
      }),
    }),
    loginPasswordless: builder.mutation({
      query: ({ primaryToken, provider, guestCart }) => ({
        url: "auth/login-passwordless",
        method: "POST",
        body: { primaryToken, provider, guestCart },
      }),
    }),
    registerPasswordless: builder.mutation({
      query: ({
        primaryToken,
        primaryProvider,
        secondaryToken,
        secondaryProvider,
        firstName,
        lastName,
        guestCart,
      }) => ({
        url: "auth/register-passwordless",
        method: "POST",
        body: {
          primaryToken,
          primaryProvider,
          secondaryToken,
          secondaryProvider,
          firstName,
          lastName,
          guestCart,
        },
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
  useVerifyEmailOtpMutation,
  useLoginPasswordlessMutation,
  useRegisterPasswordlessMutation,
} = authApiService;
