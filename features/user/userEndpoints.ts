// features/user/userEndpoints.ts
import {
  GetAllUsersResponse,
  GetUserResponse,
  ChangePasswordResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  RequestOtpResponse,
  ResendOtpResponse,
} from "@/interfaces/user.interface";
import { Parameters } from "@/interfaces/parameters.interface";
import { EndpointBuilder } from "@reduxjs/toolkit/query";

type EndpointDefinitions = EndpointBuilder<any, any, any>;

export const userEndpoints = (builder: EndpointDefinitions) => ({
  getAllUsers: builder.query<GetAllUsersResponse, Parameters>({
    query: (params) => ({
      url: `user`,
      method: "GET",
      params: {
        page: params.page,
        limit: params.limit,
        ...(params.search && { search: params.search }),
        ...(params.isActive !== undefined && { isActive: params.isActive }),
        ...(params.sortBy && { sortBy: params.sortBy }),
        ...(params.sortOrder && { sortOrder: params.sortOrder }),
      },
    }),
  }),

  getUser: builder.query<GetUserResponse, { id: string }>({
    query: (body) => ({
      url: `user/${body.id}`,
      method: "GET",
    }),
  }),

  getProfile: builder.query<GetUserResponse, void>({
    query: () => ({
      url: `user/profile`,
      method: "GET",
    }),
    providesTags: ["User"],
  }),

  updateProfile: builder.mutation<GetUserResponse, UpdateProfileDto>({
    query: (body) => ({
      url: `user/profile`,
      method: "PATCH",
      body,
    }),
    invalidatesTags: ["User"],
  }),

  changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordDto>({
    query: (body) => ({
      url: `user/change-password`,
      method: "POST",
      body,
    }),
  }),

  forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordDto>({
    query: (body) => ({
      url: `user/forgot-password`,
      method: "POST",
      body,
    }),
  }),

  resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordDto>({
    query: (body) => ({
      url: `user/reset-password`,
      method: "POST",
      body,
    }),
  }),

  // requestOtp: builder.mutation<RequestOtpResponse, RequestOtpDto>({
  //   query: (body) => ({
  //     url: `user/request-otp`,
  //     method: "POST",
  //     body,
  //   }),
  // }),

  // resendOtp: builder.mutation<ResendOtpResponse, ResendOtpDto>({
  //   query: (body) => ({
  //     url: `user/resend-otp`,
  //     method: "POST",
  //     body,
  //   }),
  // }),
});