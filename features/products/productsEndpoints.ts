import { Parameters } from "@/interfaces/parameters.interface";
import {
  GetProductResponse,
  GetProductsResponse,
  PaginatedProductsResponse,
} from "@/interfaces/product.interface";
import { EndpointBuilder } from "@reduxjs/toolkit/query";

type EndpointDefinitions = EndpointBuilder<any, any, any>;

export const productsEndpoints = (builder: EndpointDefinitions) => ({
  getAllProducts: builder.query<GetProductsResponse, null>({
    query: () => ({
      url: "product",
      method: "GET",
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
  getProductsByCategory: builder.query<GetProductsResponse, { id: string }>({
    query: ({ id }: { id: string }) => ({
      url: `product/category/${id}`,
      method: "GET",
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
  getFeaturedProducts: builder.query<GetProductsResponse, null>({
    query: () => ({
      url: `product/featured`,
      method: "GET"
    })
  }),
  getFeaturedProductsPaginated: builder.query<PaginatedProductsResponse, Parameters>({
    query: (params) => ({
      url: `product/featured`,
      method: "GET",
      params: {
        page: params.page,
        limit: params.limit,
        ...(params.search && { search: params.search }),
        ...(params.isActive !== undefined && { isActive: params.isActive }),
        ...(params.sortBy && { sortBy: params.sortBy }),
        ...(params.sortOrder && { sortOrder: params.sortOrder }),
      },
    })
  })
});
