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
});
