"use client";

import React from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";

export interface DietaryBadgeProps {
  dietaryTags?: string[] | null;
  allergenInfo?: any;
  size?: "small" | "medium";
  className?: string;
  showTooltip?: boolean;
}

export interface DietaryClassification {
  type: "vegetarian" | "non_vegetarian" | "contains_egg";
  color: string;
  label: string;
}

/**
 * Pure helper to classify food dietary status according to standard Indian food labeling (FSSAI).
 *
 * Precedence:
 * 1. Non-Vegetarian (#DC2626)
 * 2. Contains Egg (#D97706)
 * 3. Vegetarian / Vegan / Egg-free (#16A34A)
 *
 * Returns null if no authoritative classification is present.
 */
export function getDietaryClassification(
  dietaryTags?: string[] | null,
  allergenInfo?: any,
): DietaryClassification | null {
  const normalizedTags = (dietaryTags || []).map((tag) =>
    String(tag).toLowerCase().trim(),
  );

  let hasEggInAllergen = false;
  if (allergenInfo) {
    if (typeof allergenInfo === "string") {
      const str = allergenInfo.toLowerCase();
      if (/\b(egg|eggs)\b/.test(str) && !/\b(eggless|egg-free|egg_free)\b/.test(str)) {
        hasEggInAllergen = true;
      }
    } else if (typeof allergenInfo === "object") {
      const allergenString = JSON.stringify(allergenInfo).toLowerCase();
      if (
        /\b(egg|eggs)\b/.test(allergenString) &&
        !/\b(eggless|egg-free|egg_free)\b/.test(allergenString)
      ) {
        hasEggInAllergen = true;
      }
    }
  }

  const isNonVeg =
    normalizedTags.includes("non_vegetarian") ||
    normalizedTags.includes("non-vegetarian") ||
    normalizedTags.includes("nonveg") ||
    normalizedTags.includes("non_veg");

  if (isNonVeg) {
    return {
      type: "non_vegetarian",
      color: "#DC2626",
      label: "Non-Vegetarian",
    };
  }

  const isEgg =
    normalizedTags.includes("contains_egg") ||
    normalizedTags.includes("contains-egg") ||
    normalizedTags.includes("containsegg") ||
    normalizedTags.includes("egg") ||
    normalizedTags.includes("with_egg") ||
    (hasEggInAllergen &&
      !normalizedTags.includes("egg_free") &&
      !normalizedTags.includes("eggless"));

  if (isEgg) {
    return {
      type: "contains_egg",
      color: "#D97706",
      label: "Contains Egg",
    };
  }

  const isVeg =
    normalizedTags.includes("vegetarian") ||
    normalizedTags.includes("vegan") ||
    normalizedTags.includes("veg") ||
    normalizedTags.includes("egg_free") ||
    normalizedTags.includes("eggless");

  if (isVeg) {
    return {
      type: "vegetarian",
      color: "#16A34A",
      label: "Vegetarian",
    };
  }

  return null;
}

/**
 * DietaryBadge renders the standard Indian food classification symbol:
 * - Green border (#16A34A) with green circular dot for Vegetarian / Vegan / Egg-free
 * - Red border (#DC2626) with red circular dot for Non-Vegetarian
 * - Amber border (#D97706) with amber circular dot for Contains Egg
 *
 * CRITICAL RULE:
 * Only renders when authoritative data explicitly indicates the classification.
 * Returns null if dietary tags are missing, empty, or unclassified.
 * Never guesses based on product name or description.
 */
export function DietaryBadge({
  dietaryTags,
  allergenInfo,
  size = "small",
  className,
  showTooltip = true,
}: DietaryBadgeProps) {
  const classification = getDietaryClassification(dietaryTags, allergenInfo);

  if (!classification) {
    return null;
  }

  const isSmall = size === "small";
  const outerDimension = isSmall ? 15 : 18;
  const innerDimension = isSmall ? 7 : 8;

  const { color, label } = classification;

  const badgeElement = (
    <Box
      className={className}
      component="span"
      role="img"
      aria-label={label}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: outerDimension,
        height: outerDimension,
        border: `1.5px solid ${color}`,
        borderRadius: "3px",
        backgroundColor: "#FFFFFF",
        flexShrink: 0,
        boxSizing: "border-box",
      }}
    >
      <Box
        component="span"
        sx={{
          width: innerDimension,
          height: innerDimension,
          borderRadius: "50%",
          backgroundColor: color,
        }}
      />
    </Box>
  );

  if (!showTooltip) {
    return badgeElement;
  }

  return (
    <Tooltip title={label} arrow placement="top">
      {badgeElement}
    </Tooltip>
  );
}

export default DietaryBadge;
