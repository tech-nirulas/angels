"use client";

import React from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { SxProps, Theme } from "@mui/material/styles";
import {
  getDietaryClassification,
  DietaryClassification,
  DietaryType,
  PRIMARY_DIETARY_TAGS,
} from "@/utils/dietary";

export { getDietaryClassification, PRIMARY_DIETARY_TAGS };
export type { DietaryClassification, DietaryType };

export interface DietaryBadgeProps {
  dietaryTags?: string[] | null;
  allergenInfo?: any;
  size?: "small" | "medium";
  className?: string;
  showTooltip?: boolean;
  sx?: SxProps<Theme>;
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
  sx,
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
        ...sx,
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
