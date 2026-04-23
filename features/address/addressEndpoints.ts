// features/address/addressEndpoints.ts
import { EndpointBuilder } from "@reduxjs/toolkit/query";
import {
  Address,
  CreateAddressPayload,
  GetAddressResponse,
  GetAllAddressesResponse,
  UpdateAddressPayload,
} from "@/interfaces/address.interface";
import { Root } from "@/interfaces/root.interface";

type Builder = EndpointBuilder<any, any, any>;

export const addressEndpoints = (builder: Builder) => ({
  getAddresses: builder.query<GetAllAddressesResponse, void>({
    query: () => ({ url: "address", method: "GET" }),
    providesTags: ["Address"],
  }),

  getAddress: builder.query<GetAddressResponse, string>({
    query: (id) => ({ url: `address/${id}`, method: "GET" }),
    providesTags: (_r, _e, id) => [{ type: "Address", id }],
  }),

  createAddress: builder.mutation<GetAddressResponse, CreateAddressPayload>({
    query: (body) => ({ url: "address", method: "POST", body }),
    invalidatesTags: ["Address"],
  }),

  updateAddress: builder.mutation<GetAddressResponse, { id: string; body: UpdateAddressPayload }>({
    query: ({ id, body }) => ({ url: `address/${id}`, method: "PATCH", body }),
    invalidatesTags: ["Address"],
  }),

  deleteAddress: builder.mutation<Root<{ message: string }>, string>({
    query: (id) => ({ url: `address/${id}`, method: "DELETE" }),
    invalidatesTags: ["Address"],
  }),

  setDefaultAddress: builder.mutation<GetAddressResponse, string>({
    query: (id) => ({ url: `address/${id}/set-default`, method: "PATCH" }),
    invalidatesTags: ["Address"],
  }),

  getNearestOutlet: builder.query<any, string>({
    query: (addressId) => ({
      url: `address/${addressId}/nearest-outlet`,
      method: "GET",
    }),
  }),
});