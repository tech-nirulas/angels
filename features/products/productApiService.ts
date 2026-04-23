import createBaseQuery from "@/lib/baseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { productsEndpoints } from "./productsEndpoints";

const baseQuery = createBaseQuery();

export const productApiService = createApi({
  reducerPath: "productApiService",
  baseQuery,
  tagTypes: ["Product"],
  endpoints: productsEndpoints,
});

export const {
  useGetAllProductsQuery,
  useGetProductQuery,
  useLazyGetAllProductsQuery,
  useLazyGetProductQuery,
  useGetPaginatedProductsQuery,
  useLazyGetPaginatedProductsQuery,
  useGetProductsByCategoryPaginatedQuery,
  useGetProductsByCategoryQuery,
  useLazyGetProductsByCategoryPaginatedQuery,
  useLazyGetProductsByCategoryQuery,
  useGetFeaturedProductsPaginatedQuery,
  useGetFeaturedProductsQuery,
  useLazyGetFeaturedProductsPaginatedQuery,
  useLazyGetFeaturedProductsQuery,
} = productApiService;
