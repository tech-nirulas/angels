import createBaseQuery from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { categoryEndpoints } from "./categoryEndpoints";

const baseQuery = createBaseQuery();

export const categoryApiService = createApi({
  reducerPath: "categoryApiService",
  baseQuery,
  tagTypes: ["Category"],
  endpoints: categoryEndpoints,
});

export const {
  useGetAllCategoriesQuery,
  useLazyGetAllCategoriesQuery,
  useGetCategoryQuery,
  useLazyGetCategoryQuery,
  useGetAllCategoriesPaginatedQuery,
  useLazyGetAllCategoriesPaginatedQuery,
} = categoryApiService;
