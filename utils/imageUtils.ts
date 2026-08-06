import { Product } from "@/interfaces/product.interface";
import { MEDIA_BASE_URL } from "@/utils/constants";

export function getImageUrl(product: Product): string {
  const key = product.mainImage?.key ?? product.thumbnail?.key;
  return key
    ? MEDIA_BASE_URL + key
    : "https://placehold.co/400x400?text=Delicious+Bakery";
}
