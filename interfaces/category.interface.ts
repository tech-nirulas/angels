import { Media } from "./media.interface";
import { Root, RootPaginate } from "./root.interface";



export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;

  categoryImageId: string | null;
  categoryImage?: Media | null;

  displayOrder: number;
  isActive: boolean;
  parentId: string | null;
  parent: Category | null;

  typicalConsumption?: string;
  preparationTime?: string;
  defaultGstRate?: number | null;

  createdAt: string;
  updatedAt: string;

  _count?: object | undefined;
}

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

export type GetCategoryResponse = Root<Category>;
export type GetCategoryBySlugResponse = Root<CategoryWithChildren>;
export type GetAllCategoriesResponse = Root<Category[]>;
export type GetCategoryTreeResponse = Root<CategoryWithChildren[]>;
export type GetAllCategoriesPaginatedResponse = RootPaginate<Category[]>;

