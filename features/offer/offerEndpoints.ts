import { EndpointBuilder } from "@reduxjs/toolkit/query";

type EndpointDefinitions = EndpointBuilder<any, any, any>;

export const offerEndpoints = (builder: EndpointDefinitions) => ({
  getActiveOffers: builder.query<any, void>({
    query: () => ({
      url: "offer/active",
      method: "GET",
    }),
    providesTags: ["Offer"],
  }),
  getAvailableOffers: builder.query<any, void>({
    query: () => ({
      url: "offer/available",
      method: "GET",
    }),
    providesTags: ["Offer"],
  }),
  validateOfferCode: builder.mutation<any, { code: string; cartItems?: any[] }>({
    query: (body) => ({
      url: "offer/validate-code",
      method: "POST",
      body,
    }),
  }),
});
