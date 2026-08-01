import { createApi } from "@reduxjs/toolkit/query/react";
import { cakeEndpoints } from "./cakeEndpoints";
import { baseQueryWithReauth } from "@/features/api/baseQuery";

export const cakeApiService = createApi({
  reducerPath: "cakeApiService",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["CakeCustomization"],
  endpoints: cakeEndpoints,
});

export const { useCreateCakeRequestMutation } = cakeApiService;
