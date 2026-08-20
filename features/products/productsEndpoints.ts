import { Parameters } from "@/interfaces/parameters.interface";
import {
  GetProductResponse,
  GetProductsResponse,
  PaginatedProductsResponse,
} from "@/interfaces/product.interface";
import { EndpointBuilder } from "@reduxjs/toolkit/query";

type EndpointDefinitions = EndpointBuilder<any, any, any>;

export const productsEndpoints = (builder: EndpointDefinitions) => ({
  getAllProducts: builder.query<GetProductsResponse, Parameters | void | null>({
    query: (params) => ({
      url: "product",
      method: "GET",
      params: params
        ? {
            ...(params.search && { search: params.search }),
            ...(params.isActive !== undefined && { isActive: params.isActive }),
          }
        : undefined,
    }),
    providesTags: ["Product"],
  }),
  getPaginatedProducts: builder.query<PaginatedProductsResponse, Parameters>({
    query: (params) => ({
      url: "product/paginated",
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
    providesTags: ["Product"],
  }),
  getProduct: builder.query<GetProductResponse, { id: string }>({
    query: (body) => ({
      url: `product/${body.id}`,
      method: "GET",
    }),
    providesTags: (result, error, arg) => [{ type: "Category", id: arg.id }],
  }),
  getProductsByCategory: builder.query<
    GetProductsResponse,
    { id: string; filterDto?: Parameters }
  >({
    query: ({ id, filterDto }) => ({
      url: `product/category/${id}`,
      method: "GET",
      params: filterDto
        ? {
            ...(filterDto.search && { search: filterDto.search }),
            ...(filterDto.isActive !== undefined && { isActive: filterDto.isActive }),
          }
        : undefined,
    }),
  }),
  getProductsByCategoryPaginated: builder.query<
    PaginatedProductsResponse,
    { id: string; filterDto: Parameters }
  >({
    query: ({ id, filterDto }) => ({
      url: `product/category/${id}/paginated`,
      method: "GET",
      params: {
        page: filterDto.page,
        limit: filterDto.limit,
        ...(filterDto.search && { search: filterDto.search }),
        ...(filterDto.isActive !== undefined && { isActive: filterDto.isActive }),
        ...(filterDto.sortBy && { sortBy: filterDto.sortBy }),
        ...(filterDto.sortOrder && { sortOrder: filterDto.sortOrder }),
      },
    }),
  }),
  getProductsByCategorySlugPaginated: builder.query<
    PaginatedProductsResponse,
    { slug: string; filterDto: Parameters }
  >({
    query: ({ slug, filterDto }) => ({
      url: `product/category/slug/${slug}/paginated`,
      method: "GET",
      params: {
        page: filterDto.page,
        limit: filterDto.limit,
        ...(filterDto.search && { search: filterDto.search }),
        ...(filterDto.isActive !== undefined && { isActive: filterDto.isActive }),
        ...(filterDto.sortBy && { sortBy: filterDto.sortBy }),
        ...(filterDto.sortOrder && { sortOrder: filterDto.sortOrder }),
      },
    }),
  }),
  getFeaturedProducts: builder.query<GetProductsResponse, Parameters | void | null>({
    query: (params) => ({
      url: `product/featured`,
      method: "GET",
      params: params
        ? {
            ...(params.search && { search: params.search }),
            ...(params.isActive !== undefined && { isActive: params.isActive }),
          }
        : undefined,
    }),
  }),
  getFeaturedProductsPaginated: builder.query<PaginatedProductsResponse, Parameters>({
    query: (params) => ({
      url: `product/featured/paginated`,
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
});
