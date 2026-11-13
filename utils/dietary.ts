export type DietaryType = "vegetarian" | "non_vegetarian" | "contains_egg";

export interface DietaryClassification {
  type: DietaryType;
  isVeg: boolean;
  isNonVeg: boolean;
  isEgg: boolean;
  color: string;
  label: string;
}

export const PRIMARY_DIETARY_TAGS: string[] = [
  "vegetarian",
  "veg",
  "non_vegetarian",
  "non-vegetarian",
  "nonveg",
  "non_veg",
  "contains_egg",
  "contains-egg",
  "containsegg",
  "egg",
  "with_egg",
];

/**
 * Parses allergenInfo to check if egg is an intentional ingredient.
 * Explicitly ignores `mayContain` which indicates factory trace warnings / cross-contamination.
 */
export function parseEggFromAllergenInfo(allergenInfo: any): boolean {
  if (!allergenInfo) return false;

  // Direct array of allergen names (e.g. ["eggs", "milk"])
  if (Array.isArray(allergenInfo)) {
    return allergenInfo.some(
      (item) =>
        typeof item === "string" &&
        /\b(egg|eggs)\b/i.test(item) &&
        !/\b(eggless|egg-free|egg_free)\b/i.test(item)
    );
  }

  if (typeof allergenInfo === "object") {
    // 1. Check `contains` array (standard structured format)
    if (Array.isArray(allergenInfo.contains)) {
      const hasEgg = allergenInfo.contains.some(
        (item: any) =>
          typeof item === "string" &&
          /\b(egg|eggs)\b/i.test(item) &&
          !/\b(eggless|egg-free|egg_free)\b/i.test(item)
      );
      if (hasEgg) return true;
    }

    // 2. Check boolean properties (e.g. { egg: true, eggs: true })
    if (allergenInfo.egg === true || allergenInfo.eggs === true) {
      return true;
    }

    // DO NOT inspect `mayContain`
    return false;
  }

  if (typeof allergenInfo === "string") {
    const lower = allergenInfo.toLowerCase();
    // Exclude mayContain string phrasing
    if (/may\s*contain/i.test(lower)) {
      return false;
    }
    return (
      /\b(egg|eggs)\b/i.test(lower) &&
      !/\b(eggless|egg-free|egg_free)\b/i.test(lower)
    );
  }

  return false;
}

/**
 * Classifies food dietary status according to standard Indian food labeling (FSSAI).
 *
 * Precedence:
 * 1. Non-Vegetarian (#DC2626)
 * 2. Contains Egg (#D97706)
 * 3. Vegetarian / Vegan / Egg-free (#16A34A)
 *
 * Safe allergen fallback:
 * If a product is explicitly tagged with `vegetarian`, `vegan`, or `egg_free`,
 * ambiguous allergen fallback will not override it as egg-containing unless `contains_egg`
 * is explicitly tagged. Factory trace warnings (`mayContain`) are always ignored.
 *
 * Returns null if no authoritative classification is present.
 */
export function getDietaryClassification(
  dietaryTags?: string[] | null,
  allergenInfo?: any
): DietaryClassification | null {
  const normalizedTags = (dietaryTags || []).map((tag) =>
    String(tag).toLowerCase().trim()
  );

  const isNonVeg =
    normalizedTags.includes("non_vegetarian") ||
    normalizedTags.includes("non-vegetarian") ||
    normalizedTags.includes("nonveg") ||
    normalizedTags.includes("non_veg");

  if (isNonVeg) {
    return {
      type: "non_vegetarian",
      isVeg: false,
      isNonVeg: true,
      isEgg: false,
      color: "#DC2626",
      label: "Non-Vegetarian",
    };
  }

  const isExplicitEggTag =
    normalizedTags.includes("contains_egg") ||
    normalizedTags.includes("contains-egg") ||
    normalizedTags.includes("containsegg") ||
    normalizedTags.includes("egg") ||
    normalizedTags.includes("with_egg");

  if (isExplicitEggTag) {
    return {
      type: "contains_egg",
      isVeg: false,
      isNonVeg: false,
      isEgg: true,
      color: "#D97706",
      label: "Contains Egg",
    };
  }

  const isExplicitVeg =
    normalizedTags.includes("vegetarian") ||
    normalizedTags.includes("vegan") ||
    normalizedTags.includes("veg") ||
    normalizedTags.includes("egg_free") ||
    normalizedTags.includes("eggless");

  const hasEggInAllergen = parseEggFromAllergenInfo(allergenInfo);

  // If allergen info indicates egg, only apply it if product is NOT explicitly tagged veg/vegan/egg_free
  if (hasEggInAllergen && !isExplicitVeg) {
    return {
      type: "contains_egg",
      isVeg: false,
      isNonVeg: false,
      isEgg: true,
      color: "#D97706",
      label: "Contains Egg",
    };
  }

  if (isExplicitVeg) {
    return {
      type: "vegetarian",
      isVeg: true,
      isNonVeg: false,
      isEgg: false,
      color: "#16A34A",
      label: "Vegetarian",
    };
  }

  return null;
}
