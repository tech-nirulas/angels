import { Category } from "./category.interface";
import { Media } from "./media.interface";
import { Root, RootPaginate } from "./root.interface";

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  code: string;
  baseUnit: string;
  basePrice: string;
  availableUnits: object;
  hsnCode: string;
  gstRate: string;
  inStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  preorderEnabled: boolean;
  preorderLeadDays: number;
  weight: string;
  weightUnit: string;
  piecesPerPack: number;
  shelfLife: number;
  storageInstructions: string;
  dietaryTags: string[];
  allergenInfo: object;
  nutritionalInfo: object;
  mainImageId: string;
  thumbnailId: string;
  rating: string;
  totalReviews: number;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  isSeasonal: boolean;
  availableFrom: string;
  availableUntil: string;
  maxPerOrder: number;
  seoTitle: string;
  seoDescription: string;
  categoryId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: Category;
  tags: string[];
  favoriteOf: any[];
  inventoryBatches: any[];
  orderItems: any[];
  reviews: any[];
  gallery: Media[];
  mainImage: Media;
  thumbnail: Media;
  _count: Count;
}

export interface Count {
  favoriteOf: number;
  inventoryBatches: number;
  orderItems: number;
  reviews: number;
  tags: number;
}

export type GetProductsResponse = Root<Product[]>;
export type GetProductResponse = Root<Product>;
export type PaginatedProductsResponse = RootPaginate<Product[]>;