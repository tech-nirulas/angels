import { Product } from "@/interfaces/product.interface";
import { MEDIA_BASE_URL } from "@/utils/constants";

export const FALLBACK_PRODUCT_IMAGE =
  "https://placehold.co/1200x900.png?text=Delicious+Bakery";

export function getImageUrl(product?: Product | null): string {
  if (!product) return FALLBACK_PRODUCT_IMAGE;

  const media = product.mainImage ?? product.thumbnail;

  // 1. If media object has an explicit valid URL starting with http/https, prioritize it
  if (
    media?.url &&
    (media.url.startsWith("http://") || media.url.startsWith("https://"))
  ) {
    return media.url;
  }

  // 2. Otherwise use the key combined with MEDIA_BASE_URL
  const key = media?.key;
  if (key) {
    if (key.startsWith("http://") || key.startsWith("https://")) {
      return key;
    }
    const base = MEDIA_BASE_URL.endsWith("/")
      ? MEDIA_BASE_URL
      : `${MEDIA_BASE_URL}/`;
    const cleanKey = key.startsWith("/") ? key.slice(1) : key;
    return `${base}${cleanKey}`;
  }

  return FALLBACK_PRODUCT_IMAGE;
}
