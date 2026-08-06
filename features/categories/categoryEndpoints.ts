import {
  GetAllCategoriesPaginatedResponse,
  GetAllCategoriesResponse,
  GetCategoryBySlugResponse,
  GetCategoryResponse,
  GetCategoryTreeResponse,
} from "@/interfaces/category.interface";
import { Parameters } from "@/interfaces/parameters.interface";
import { EndpointBuilder } from "@reduxjs/toolkit/query";

type EndpointDefinitions = EndpointBuilder<any, any, any>;

export const categoryEndpoints = (builder: EndpointDefinitions) => ({
  getAllCategories: builder.query<GetAllCategoriesResponse, null>({
    query: () => ({
      url: `category`,
      method: "GET",
    }),
  }),
  getCategoryTree: builder.query<GetCategoryTreeResponse, null>({
    query: () => ({
      url: `category/tree`,
      method: "GET",
    }),
  }),
  getCategoryBySlug: builder.query<GetCategoryBySlugResponse, { slug: string }>({
    query: ({ slug }) => ({
      url: `category/slug/${slug}`,
      method: "GET",
    }),
  }),
  getAllCategoriesPaginated: builder.query<
    GetAllCategoriesPaginatedResponse,
    Parameters
  >({
    query: (params) => ({
      url: `category/paginated`,
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
  getCategory: builder.query<GetCategoryResponse, { id: string }>({
    query: (body) => ({
      url: `category/${body.id}`,
      method: "GET",
    }),
  }),
});

