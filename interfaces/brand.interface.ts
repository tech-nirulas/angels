import { Root, RootPaginate } from "./root.interface";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  legalEntityId: string;
  createdAt: string;
  updatedAt: string;
}

export type GetCategoryResponse = Root<Brand>;
export type GetAllCategoriesResponse = Root<Brand[]>;
export type GetAllCategoriesPaginatedResponse = RootPaginate<Brand[]>;
