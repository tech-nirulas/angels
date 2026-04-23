import {
  GetAllCategoriesPaginatedResponse,
  GetAllCategoriesResponse,
  GetCategoryResponse,
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
      url: `categories/${body.id}`,
      method: "GET",
    }),
  }),
});
