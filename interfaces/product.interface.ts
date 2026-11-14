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
  discountedPrice?: number;
  discountPct?: number | null;
  discountFlat?: number | null;
  discountName?: string | null;
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
  hasVariants?: boolean;
  variants?: ProductVariant[];
  modifierGroups?: ProductModifierGroup[];
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

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string; // e.g. "500g", "1kg", "2kg"
  price: number | string;
  compareAtPrice?: number | string | null;
  weight?: number | string | null;
  weightUnit?: string;
  isDefault: boolean;
  inStock: boolean;
  stockQuantity?: number;
  displayOrder?: number;
}

export interface ModifierOption {
  id: string;
  groupId: string;
  name: string; // e.g. "Eggless Preparation", "Sparkler Candle"
  price: number | string;
  dietaryTag?: string | null;
  isDefault: boolean;
  inStock: boolean;
  displayOrder?: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  displayName?: string | null;
  minSelections: number; // 0 = optional, 1+ = mandatory
  maxSelections: number; // 1 = radio, >1 = checkboxes
  isActive: boolean;
  displayOrder: number;
  options: ModifierOption[];
}

export interface ProductModifierGroup {
  id: string;
  productId: string;
  modifierGroupId: string;
  displayOrder: number;
  modifierGroup: ModifierGroup;
}

export type GetProductsResponse = Root<Product[]>;
export type GetProductResponse = Root<Product>;
export type PaginatedProductsResponse = RootPaginate<Product[]>;
