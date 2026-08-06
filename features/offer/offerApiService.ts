import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../api/baseQuery";
import { offerEndpoints } from "./offerEndpoints";

export const offerApiService = createApi({
  reducerPath: "offerApiService",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Offer"],
  endpoints: offerEndpoints,
});

export const {
  useGetActiveOffersQuery,
  useGetAvailableOffersQuery,
  useValidateOfferCodeMutation,
} = offerApiService;
