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
 * DietaryBadge renders the standard Indian food classification symbol (FSSAI 2020):
 * - Green border (#16A34A) with green circular dot for Vegetarian / Vegan / Egg-free
 * - Red border (#DC2626) with red upward equilateral triangle for Non-Vegetarian
 * - Amber border (#D97706) with amber upward equilateral triangle for Contains Egg
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

  const { color, label, shape } = classification;

  const innerContent =
    shape === "triangle" ? (
      <Box
        component="svg"
        viewBox="0 0 10 10"
        aria-hidden="true"
        sx={{
          width: innerDimension,
          height: innerDimension,
          display: "block",
          flexShrink: 0,
        }}
      >
        <polygon points="5,1 9.2,8.8 0.8,8.8" fill={color} />
      </Box>
    ) : (
      <Box
        component="span"
        sx={{
          width: innerDimension,
          height: innerDimension,
          borderRadius: "50%",
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
    );

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
      {innerContent}
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
