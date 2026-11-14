// components/ui/ProductModal.tsx
"use client";

import {
  useAddToCartMutation,
  useGetCartQuery,
  useRemoveFromCartMutation,
  useUpdateCartQuantityMutation,
} from "@/features/cart/cartApiService";
import { addToGuestCart, openCart, updateGuestQuantity } from "@/features/cart/cartSlice";
import DietaryBadge, {
  getDietaryClassification,
  PRIMARY_DIETARY_TAGS,
} from "@/components/common/DietaryBadge";
import { Product } from "@/interfaces/product.interface";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { MEDIA_BASE_URL } from "@/utils/constants";
import { taxInclusive, formatCurrency } from "@/utils/pricing";
import { IMAGE_SLOTS } from "@/utils/imageSpec";
import AddIcon from "@mui/icons-material/Add";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import StarIcon from "@mui/icons-material/Star";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Rating from "@mui/material/Rating";
import Skeleton from "@mui/material/Skeleton";
import { alpha, useTheme } from "@mui/material/styles";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

const GALLERY_SPEC = IMAGE_SLOTS.productGallery;
const THUMB_SPEC = IMAGE_SLOTS.thumbnail;

const PRIMARY_DIETARY_SET = new Set(
  PRIMARY_DIETARY_TAGS.map((t) => t.toLowerCase().trim()),
);

interface ProductModalProps {
  product: Product;
  onAddToCart?: (e: React.MouseEvent, product: Product) => void;
  onClose?: () => void;
}

function getImageUrl(product: Product): string {
  const key = product.mainImage?.key ?? product.thumbnail?.key;
  return key
    ? MEDIA_BASE_URL + key
    : "https://placehold.co/600x600.png?text=No+Image";
}

const ProductModal = memo(({ product, onAddToCart, onClose }: ProductModalProps) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const [imageError, setImageError] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Cart API mutations
  const [addToCartMutation, { isLoading: isAdding }] = useAddToCartMutation();
  const [updateCartQuantity] = useUpdateCartQuantityMutation();
  const [removeFromCart] = useRemoveFromCartMutation();

  // Active user's cart
  const { data: serverCartResponse } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  });
  const serverCart = serverCartResponse?.data ?? [];
  const guestItems = useAppSelector((s) => s.cart.guestItems);

  const quantity = useMemo(() => {
    if (!product?.id) return 0;
    if (isAuthenticated) {
      return serverCart.find((i: any) => i.productId === product.id)?.quantity ?? 0;
    }
    return guestItems.find((i: any) => i.productId === product.id)?.quantity ?? 0;
  }, [isAuthenticated, serverCart, guestItems, product?.id]);

  if (!product) return null;

  const basePrice = Number(product.basePrice);
  const discountedPrice = (product as any).discountedPrice
    ? Number((product as any).discountedPrice)
    : basePrice;
  // Display prices are tax-inclusive (see utils/pricing.ts); the cart payload below
  // must keep sending PRE-TAX values — the backend converts.
  const displayBasePrice = taxInclusive(basePrice, product.gstRate);
  const displayDiscountedPrice = taxInclusive(discountedPrice, product.gstRate);
  const hasDiscount = displayDiscountedPrice < displayBasePrice;
  const discountPct =
    (product as any).discountPct ||
    (hasDiscount
      ? Math.round(((basePrice - discountedPrice) / basePrice) * 100)
      : null);

  const isOutOfStock = !product.inStock;
  const isLowStock =
    product.inStock &&
    product.stockQuantity <= product.lowStockThreshold &&
    product.stockQuantity > 0;

  // Build gallery: mainImage first, then gallery items
  const allImages = [
    ...(product.mainImage ? [product.mainImage] : []),
    ...(product.gallery ?? []).filter((g) => g.id !== product.mainImageId),
  ];
  const activeImage = allImages[galleryIndex];
  const activeImageUrl = activeImage?.key
    ? MEDIA_BASE_URL + activeImage.key
    : getImageUrl(product);

  // Nutritional & allergen info
  const nutritional = product.nutritionalInfo as Record<string, string | number> | null;
  const allergens = product.allergenInfo as Record<string, boolean> | null;
  const declaredAllergens = allergens
    ? Object.entries(allergens).filter(([, present]) => present).map(([name]) => name)
    : [];

  const hasNutrition = Boolean(nutritional && Object.keys(nutritional).length > 0);

  // Dietary classification (FSSAI standard) & lifestyle tags
  const dietaryClassification = getDietaryClassification(
    product.dietaryTags,
    product.allergenInfo
  );

  const lifestyleTags = useMemo(() => {
    return (product.dietaryTags || []).filter(
      (tag) => !PRIMARY_DIETARY_SET.has(String(tag).toLowerCase().trim())
    );
  }, [product.dietaryTags]);

  // ── Variants state ────────────────────────────────────────────────────────
  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;
  const defaultVariant = useMemo(() => {
    if (!hasVariants) return null;
    return (
      variants.find((v) => v.isDefault && v.inStock) ||
      variants.find((v) => v.inStock) ||
      variants[0]
    );
  }, [variants, hasVariants]);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    defaultVariant?.id ?? null
  );

  useEffect(() => {
    setSelectedVariantId(defaultVariant?.id ?? null);
  }, [defaultVariant?.id]);

  const activeVariant = useMemo(() => {
    if (!hasVariants) return null;
    return variants.find((v) => v.id === selectedVariantId) || defaultVariant;
  }, [hasVariants, variants, selectedVariantId, defaultVariant]);

  // ── Modifiers state ───────────────────────────────────────────────────────
  const modifierGroups = useMemo(() => {
    return (product.modifierGroups ?? [])
      .map((pmg) => pmg.modifierGroup)
      .filter((g): g is NonNullable<typeof g> => Boolean(g && g.isActive));
  }, [product.modifierGroups]);
  const hasModifiers = modifierGroups.length > 0;
  const hasVariantsOrModifiers = hasVariants || hasModifiers;

  const initialModifierSelections = useMemo(() => {
    const initial: Record<string, string[]> = {};
    for (const group of modifierGroups) {
      const defaultOpts = (group.options ?? [])
        .filter((o) => o.isDefault && o.inStock)
        .map((o) => o.id);
      if (defaultOpts.length > 0) {
        initial[group.id] = defaultOpts.slice(0, group.maxSelections);
      } else if (group.minSelections > 0 && (group.options ?? []).length > 0) {
        const firstInStock = group.options.find((o) => o.inStock);
        if (firstInStock) {
          initial[group.id] = [firstInStock.id];
        }
      }
    }
    return initial;
  }, [modifierGroups]);

  const [selectedModifierOptionIds, setSelectedModifierOptionIds] =
    useState<Record<string, string[]>>(initialModifierSelections);

  useEffect(() => {
    setSelectedModifierOptionIds(initialModifierSelections);
  }, [initialModifierSelections]);

  const handleToggleModifierOption = (
    groupId: string,
    optionId: string,
    maxSelections: number
  ) => {
    setSelectedModifierOptionIds((prev) => {
      const current = prev[groupId] ?? [];
      if (maxSelections === 1) {
        const group = modifierGroups.find((g) => g.id === groupId);
        if (current.includes(optionId)) {
          return group?.minSelections === 0 ? { ...prev, [groupId]: [] } : prev;
        }
        return { ...prev, [groupId]: [optionId] };
      } else {
        if (current.includes(optionId)) {
          return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
        }
        if (current.length < maxSelections) {
          return { ...prev, [groupId]: [...current, optionId] };
        }
        return prev;
      }
    });
  };

  const modifiersSurcharge = useMemo(() => {
    let sum = 0;
    for (const group of modifierGroups) {
      const selectedIds = selectedModifierOptionIds[group.id] ?? [];
      for (const opt of group.options ?? []) {
        if (selectedIds.includes(opt.id)) {
          sum += Number(opt.price || 0);
        }
      }
    }
    return sum;
  }, [modifierGroups, selectedModifierOptionIds]);

  const missingRequiredGroup = useMemo(() => {
    for (const group of modifierGroups) {
      if (group.minSelections > 0) {
        const count = (selectedModifierOptionIds[group.id] ?? []).length;
        if (count < group.minSelections) {
          return group.displayName || group.name;
        }
      }
    }
    return null;
  }, [modifierGroups, selectedModifierOptionIds]);

  // Selected base price and effective unit price (pre-tax)
  const currentItemBasePrice = activeVariant ? Number(activeVariant.price) : basePrice;
  const currentEffectiveUnitPrice = currentItemBasePrice + modifiersSurcharge;

  // Tax-inclusive display pricing
  const displayCurrentBasePrice = taxInclusive(currentItemBasePrice, product.gstRate);
  const displayCurrentUnitPrice = taxInclusive(currentEffectiveUnitPrice, product.gstRate);

  // Direct, rock-solid add to cart handler
  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (missingRequiredGroup) return;

    const flattenedOptionIds = Object.values(selectedModifierOptionIds).flat();

    const selectedModifiersSnapshot = [];
    for (const group of modifierGroups) {
      const selectedIds = selectedModifierOptionIds[group.id] ?? [];
      for (const opt of group.options ?? []) {
        if (selectedIds.includes(opt.id)) {
          selectedModifiersSnapshot.push({
            groupId: group.id,
            groupName: group.name,
            optionId: opt.id,
            optionName: opt.name,
            price: Number(opt.price || 0),
          });
        }
      }
    }

    if (isAuthenticated) {
      await addToCartMutation({
        productId: product.id,
        quantity: 1,
        variantId: activeVariant?.id || undefined,
        modifierOptionIds: flattenedOptionIds.length > 0 ? flattenedOptionIds : undefined,
      });
    } else {
      dispatch(
        addToGuestCart({
          productId: product.id,
          quantity: 1,
          variantId: activeVariant?.id || null,
          modifierOptionIds: flattenedOptionIds,
          selectedVariant: activeVariant
            ? {
                id: activeVariant.id,
                sku: activeVariant.sku,
                name: activeVariant.name,
                price: Number(activeVariant.price),
              }
            : null,
          selectedModifiers:
            selectedModifiersSnapshot.length > 0 ? selectedModifiersSnapshot : null,
          unitPrice: currentEffectiveUnitPrice,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.shortDescription || "",
            basePrice: Number(product.basePrice),
            gstRate: product.gstRate,
            discountedPrice: hasDiscount ? discountedPrice : undefined,
            discountPct: discountPct ?? null,
            inStock: product.inStock ?? true,
            mainImage: product.mainImage ?? product.thumbnail ?? null,
          },
        })
      );
    }

    dispatch(openCart());

    // NOTE: `onAddToCart` is intentionally not invoked here. This handler
    // already performs the complete add-to-cart flow (auth-aware mutation or
    // guest dispatch, then opening the cart drawer) — every caller's
    // `onAddToCart` prop is a second, independent implementation of that same
    // flow. Calling both added the item twice per click.
  };

  // Quantity increment / decrement handler
  const handleUpdateQty = async (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    const newQty = quantity + delta;

    if (isAuthenticated) {
      setIsUpdating(true);
      try {
        if (newQty <= 0) {
          await removeFromCart(product.id);
        } else {
          await updateCartQuantity({ productId: product.id, quantity: newQty });
        }
      } finally {
        setIsUpdating(false);
      }
    } else {
      dispatch(updateGuestQuantity({ productId: product.id, quantity: newQty }));
    }
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          md: "minmax(0, 430px) minmax(0, 1fr)",
        },
        bgcolor: theme.palette.background.paper,
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      {/* ── Left: Square Image (1:1) + Gallery Strip ── */}
      <Box
        sx={{
          bgcolor: theme.palette.background.accent,
          p: { xs: 2.5, md: 3 },
          display: "flex",
          flexDirection: "column",
          gap: 2,
          minWidth: 0,
          borderRight: { md: `1px solid ${theme.palette.divider}` },
        }}
      >
        {/* Strict 1:1 Square Hero Image Box */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            aspectRatio: "1 / 1",
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: alpha(theme.palette.common.black, 0.03),
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            border: `1px solid ${alpha(theme.palette.common.black, 0.06)}`,
          }}
        >
          {!imageError ? (
            <Image
              src={activeImageUrl}
              alt={activeImage?.alt ?? product.name}
              fill
              sizes={GALLERY_SPEC.sizes}
              quality={GALLERY_SPEC.quality}
              priority
              style={{ objectFit: "cover", objectPosition: "center" }}
              onError={() => setImageError(true)}
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <Typography variant="h3">🥐</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Image not available
              </Typography>
            </Box>
          )}

          {/* Badges Cluster with Glassmorphism */}
          <Box
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 0.75,
              zIndex: 2,
            }}
          >
            {hasDiscount && (
              <Chip
                label={
                  discountPct
                    ? `${discountPct}% OFF`
                    : `SAVE ₹${(displayBasePrice - displayDiscountedPrice).toFixed(0)}`
                }
                size="small"
                color="error"
                sx={{
                  color: "white",
                  fontWeight: 800,
                  fontSize: "0.7rem",
                  boxShadow: "0 2px 8px rgba(220, 38, 38, 0.4)",
                  borderRadius: 1.5,
                }}
              />
            )}
            {product.bestSeller && (
              <BadgeChip label="Best Seller" color={theme.palette.warning.main} />
            )}
            {product.newArrival && (
              <BadgeChip label="New Arrival" color={theme.palette.info.main} />
            )}
            {product.featured && (
              <BadgeChip label="Featured" color={theme.palette.primary.main} />
            )}
            {product.isSeasonal && (
              <BadgeChip label="Seasonal" color={theme.palette.success.main} />
            )}
          </Box>

          {isOutOfStock && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: alpha(theme.palette.common.black, 0.55),
                backdropFilter: "blur(2px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 3,
              }}
            >
              <Chip
                label="Out of Stock"
                sx={{
                  bgcolor: "#fff",
                  color: theme.palette.error.main,
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  px: 1,
                  py: 2,
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                }}
              />
            </Box>
          )}
        </Box>

        {/* Gallery Thumbnails Strip (Square 1:1) */}
        {allImages.length > 1 && (
          <Box
            sx={{
              display: "flex",
              gap: 1.25,
              overflowX: "auto",
              pb: 0.5,
              minWidth: 0,
              "&::-webkit-scrollbar": { height: 4 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
                borderRadius: 2,
              },
            }}
          >
            {allImages.map((img, i) => (
              <Box
                component="button"
                type="button"
                aria-label={`View image ${i + 1} of ${allImages.length}`}
                aria-current={i === galleryIndex}
                key={img.id || i}
                onClick={() => {
                  setGalleryIndex(i);
                  setImageError(false);
                }}
                sx={{
                  width: 58,
                  height: 58,
                  flexShrink: 0,
                  borderRadius: 2,
                  overflow: "hidden",
                  border: `2px solid ${
                    i === galleryIndex ? theme.palette.primary.main : alpha(theme.palette.divider, 0.8)
                  }`,
                  boxShadow:
                    i === galleryIndex
                      ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`
                      : "none",
                  cursor: "pointer",
                  opacity: i === galleryIndex ? 1 : 0.6,
                  transform: i === galleryIndex ? "scale(1.04)" : "scale(1)",
                  transition: "all 0.2s ease",
                  "&:hover": { opacity: 1, transform: "scale(1.04)" },
                }}
              >
                {img.key && (
                  <Image
                    src={MEDIA_BASE_URL + img.key}
                    alt={img.alt ?? `Thumbnail ${i + 1}`}
                    width={58}
                    height={58}
                    sizes="58px"
                    quality={THUMB_SPEC.quality}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* ── Right: Content & Sticky Purchase Bar ── */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          minWidth: 0,
          maxHeight: { md: "80vh" },
        }}
      >
        {/* Scrollable Detail Area */}
        <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 2.5, md: 3.5 }, pb: { xs: 1.5, md: 2 } }}>
          {product.category?.name && (
            <Chip
              label={product.category.name}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.primary.main,
                fontWeight: 800,
                fontSize: "0.68rem",
                letterSpacing: 0.6,
                textTransform: "uppercase",
                borderRadius: 1.5,
                mb: 1,
              }}
            />
          )}

          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, pr: 4 }}>
            <DietaryBadge
              dietaryTags={product.dietaryTags}
              allergenInfo={product.allergenInfo}
              size="medium"
            />
            <Typography
              variant="h4"
              sx={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: { xs: "1.4rem", md: "1.75rem" },
                lineHeight: 1.25,
                color: "#1E293B",
                flex: 1,
              }}
            >
              {product.name}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1, flexWrap: "wrap" }}>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                bgcolor: alpha(theme.palette.text.secondary, 0.08),
                px: 1,
                py: 0.25,
                borderRadius: 1,
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            >
              SKU: {product.sku}
            </Typography>

            {Number(product.rating) > 0 ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                <Rating value={Number(product.rating)} precision={0.1} size="small" readOnly />
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>
                  {Number(product.rating).toFixed(1)}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  ({product.totalReviews} {product.totalReviews === 1 ? "review" : "reviews"})
                </Typography>
              </Box>
            ) : (
              <Typography variant="caption" sx={{ color: "text.disabled", fontStyle: "italic" }}>
                New Product
              </Typography>
            )}
          </Box>

          {/* Dietary Section */}
          {(dietaryClassification || lifestyleTags.length > 0) && (
            <Box sx={{ display: "flex", gap: 0.75, mt: 1.5, flexWrap: "wrap", alignItems: "center" }}>
              {dietaryClassification && (
                <Chip
                  icon={
                    <DietaryBadge
                      dietaryTags={product.dietaryTags}
                      allergenInfo={product.allergenInfo}
                      size="small"
                      showTooltip={false}
                    />
                  }
                  label={
                    dietaryClassification.type === "vegetarian"
                      ? "100% Vegetarian"
                      : dietaryClassification.label
                  }
                  size="small"
                  sx={{
                    bgcolor: alpha(dietaryClassification.color, 0.08),
                    color:
                      dietaryClassification.type === "vegetarian"
                        ? "#15803D"
                        : dietaryClassification.type === "non_vegetarian"
                        ? "#B91C1C"
                        : "#B45309",
                    fontWeight: 800,
                    fontSize: "0.72rem",
                    height: 26,
                    border: `1px solid ${alpha(dietaryClassification.color, 0.3)}`,
                    borderRadius: 1.5,
                    "& .MuiChip-icon": {
                      ml: "6px",
                      mr: "-2px",
                    },
                  }}
                />
              )}
              {lifestyleTags.map((tag) => (
                <Chip
                  key={tag}
                  icon={<LocalOfferIcon sx={{ fontSize: "0.75rem !important" }} />}
                  label={tag.replace(/_/g, " ")}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.06),
                    color: theme.palette.success.dark,
                    fontWeight: 700,
                    fontSize: "0.68rem",
                    height: 26,
                    textTransform: "capitalize",
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                    borderRadius: 1.5,
                  }}
                />
              ))}
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* ── Size / Variant Selection ── */}
          {hasVariants && (
            <Box sx={{ mb: 2.5 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  color: "text.secondary",
                  display: "block",
                  mb: 1,
                }}
              >
                Select Size / Weight
              </Typography>
              <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap" }}>
                {variants.map((v) => {
                  const isSelected = v.id === selectedVariantId;
                  const vPrice = taxInclusive(Number(v.price), product.gstRate);
                  return (
                    <Box
                      key={v.id}
                      component="button"
                      type="button"
                      onClick={() => v.inStock && setSelectedVariantId(v.id)}
                      disabled={!v.inStock}
                      sx={{
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        border: `2px solid ${
                          isSelected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.9)
                        }`,
                        bgcolor: isSelected
                          ? alpha(theme.palette.primary.main, 0.08)
                          : theme.palette.background.paper,
                        color: isSelected ? theme.palette.primary.main : theme.palette.text.primary,
                        cursor: v.inStock ? "pointer" : "not-allowed",
                        opacity: v.inStock ? 1 : 0.5,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 0.25,
                        transition: "all 0.2s ease",
                        boxShadow: isSelected
                          ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`
                          : "none",
                        "&:hover": {
                          borderColor: v.inStock ? theme.palette.primary.main : undefined,
                        },
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 800, fontSize: "0.88rem" }}>
                        {v.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: isSelected ? theme.palette.primary.main : "text.secondary",
                        }}
                      >
                        {v.inStock ? formatCurrency(vPrice) : "Out of stock"}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* ── Modifier Groups / Add-ons ── */}
          {hasModifiers && (
            <Box sx={{ mb: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
              {modifierGroups.map((group) => {
                const selectedIds = selectedModifierOptionIds[group.id] ?? [];
                const isRequired = group.minSelections > 0;
                return (
                  <Box
                    key={group.id}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                      border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1.25,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 800, fontSize: "0.9rem", color: "#1E293B" }}
                        >
                          {group.displayName || group.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.72rem" }}>
                          {group.maxSelections === 1
                            ? "Select 1 option"
                            : `Select up to ${group.maxSelections} options`}
                        </Typography>
                      </Box>
                      <Chip
                        label={isRequired ? "Required" : "Optional"}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.62rem",
                          fontWeight: 800,
                          letterSpacing: 0.5,
                          textTransform: "uppercase",
                          bgcolor: isRequired
                            ? alpha(theme.palette.error.main, 0.1)
                            : alpha(theme.palette.text.secondary, 0.08),
                          color: isRequired ? theme.palette.error.main : theme.palette.text.secondary,
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        gap: 1,
                      }}
                    >
                      {(group.options ?? [])
                        .filter((o) => o.inStock)
                        .map((opt) => {
                          const isChecked = selectedIds.includes(opt.id);
                          const optPrice = Number(opt.price || 0);
                          const displayOptPrice = taxInclusive(optPrice, product.gstRate);
                          return (
                            <Box
                              key={opt.id}
                              component="button"
                              type="button"
                              onClick={() =>
                                handleToggleModifierOption(group.id, opt.id, group.maxSelections)
                              }
                              sx={{
                                p: 1.25,
                                borderRadius: 1.75,
                                border: `1.5px solid ${
                                  isChecked
                                    ? theme.palette.primary.main
                                    : alpha(theme.palette.divider, 0.7)
                                }`,
                                bgcolor: isChecked
                                  ? alpha(theme.palette.primary.main, 0.06)
                                  : theme.palette.background.paper,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                cursor: "pointer",
                                textAlign: "left",
                                transition: "all 0.15s ease",
                                "&:hover": { borderColor: theme.palette.primary.main },
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                                <Box
                                  sx={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: group.maxSelections === 1 ? "50%" : 0.75,
                                    border: `2px solid ${
                                      isChecked
                                        ? theme.palette.primary.main
                                        : theme.palette.text.disabled
                                    }`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}
                                >
                                  {isChecked && (
                                    <Box
                                      sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: group.maxSelections === 1 ? "50%" : 0.5,
                                        bgcolor: theme.palette.primary.main,
                                      }}
                                    />
                                  )}
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600, fontSize: "0.82rem", lineHeight: 1.2 }}
                                >
                                  {opt.name}
                                </Typography>
                              </Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                  color: optPrice > 0 ? theme.palette.primary.main : "text.secondary",
                                  ml: 1,
                                  flexShrink: 0,
                                }}
                              >
                                {optPrice > 0 ? `+${formatCurrency(displayOptPrice)}` : "Free"}
                              </Typography>
                            </Box>
                          );
                        })}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Tab Navigation */}
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons={false}
            sx={{
              minHeight: 40,
              mb: 2.5,
              borderBottom: `1px solid ${theme.palette.divider}`,
              "& .MuiTab-root": {
                fontSize: "0.8rem",
                fontWeight: 700,
                minHeight: 40,
                py: 0.5,
                px: 2,
                textTransform: "none",
                color: "text.secondary",
                "&.Mui-selected": {
                  color: theme.palette.primary.main,
                },
              },
            }}
            slotProps={{ indicator: { style: { height: 3, borderRadius: "3px 3px 0 0" } } }}
          >
            <Tab label="Overview" />
            <Tab label="Nutrition" disabled={!hasNutrition} />
            <Tab label="Storage & Care" disabled={!product.storageInstructions} />
            <Tab label={`Reviews (${product.totalReviews || 0})`} />
          </Tabs>

          {/* Tab 0: Overview */}
          {activeTab === 0 && (
            <Box>
              {product.description && (
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", lineHeight: 1.8, mb: 2.5, fontSize: "0.88rem" }}
                >
                  {product.description}
                </Typography>
              )}

              {/* Facts Grid */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" },
                  gap: 1.25,
                }}
              >
                {(activeVariant?.weight || product.weight) && (
                  <FactItem
                    label="Weight"
                    value={
                      activeVariant?.weight
                        ? `${Number(activeVariant.weight)} ${activeVariant.weightUnit || "g"}`
                        : `${Number(product.weight)} ${product.weightUnit}`
                    }
                  />
                )}
                {product.piecesPerPack && (
                  <FactItem label="Pieces" value={`${product.piecesPerPack} pcs`} />
                )}
                {product.shelfLife && (
                  <FactItem label="Shelf Life" value={`${product.shelfLife} days`} />
                )}
                {product.maxPerOrder && (
                  <FactItem label="Max/Order" value={`${product.maxPerOrder} units`} />
                )}
                {product.preorderEnabled && (
                  <FactItem label="Pre-order" value={`${product.preorderLeadDays ?? 2} day lead`} />
                )}
              </Box>

              {declaredAllergens.length > 0 && (
                <Box
                  sx={{
                    mt: 2.5,
                    p: 2,
                    bgcolor: alpha(theme.palette.error.main, 0.05),
                    borderRadius: 2.5,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.16)}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      color: theme.palette.error.main,
                      display: "block",
                      mb: 0.5,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    ⚠️ Allergen Information
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", textTransform: "capitalize", fontSize: "0.8rem" }}
                  >
                    Contains: <strong>{declaredAllergens.join(", ")}</strong>
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Tab 1: Nutrition */}
          {activeTab === 1 && hasNutrition && (
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  p: 1.25,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 1.5,
                  mb: 1,
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800, color: "primary.main" }}>
                  NUTRIENT
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "primary.main", textAlign: "right" }}>
                  AMOUNT
                </Typography>
              </Box>
              {Object.entries(nutritional!).map(([key, val]) => (
                <Box
                  key={key}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                    px: 1,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", textTransform: "capitalize", fontSize: "0.85rem" }}
                  >
                    {key.replace(/([A-Z])/g, " $1")}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
                    {String(val)}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {/* Tab 2: Storage */}
          {activeTab === 2 && product.storageInstructions && (
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2.5,
                bgcolor: theme.palette.background.accent,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: "primary.main" }}>
                Recommended Storage
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.8 }}>
                {product.storageInstructions}
              </Typography>
            </Box>
          )}

          {/* Tab 3: Reviews */}
          {activeTab === 3 && <ProductReviewsTab productId={product.id} />}
        </Box>

        {/* ── Sticky Purchase Bar ── */}
        <Box
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
            p: { xs: 2, md: 2.5 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            boxShadow: "0 -4px 16px rgba(0,0,0,0.04)",
          }}
        >
          {/* Price breakdown */}
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
              <Typography
                sx={{
                  fontFamily: "var(--font-body)",
                  fontSize: { xs: "1.4rem", md: "1.7rem" },
                  fontWeight: 800,
                  color: theme.palette.primary.main,
                  lineHeight: 1,
                }}
              >
                {formatCurrency(
                  hasVariantsOrModifiers ? displayCurrentUnitPrice : displayDiscountedPrice
                )}
              </Typography>
              {hasDiscount && !hasVariantsOrModifiers && (
                <Typography
                  sx={{
                    fontSize: "0.95rem",
                    color: "text.disabled",
                    textDecoration: "line-through",
                    fontWeight: 600,
                  }}
                >
                  {formatCurrency(displayBasePrice)}
                </Typography>
              )}
            </Box>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.25 }}>
              {hasVariants && activeVariant
                ? `size: ${activeVariant.name}`
                : `per ${product.baseUnit?.toLowerCase() || "item"}`}
              {modifiersSurcharge > 0
                ? ` · incl. ${formatCurrency(taxInclusive(modifiersSurcharge, product.gstRate))} add-ons`
                : product.gstRate
                ? ` · incl. ${Number(product.gstRate)}% GST`
                : ""}
            </Typography>
            {isLowStock && (
              <Typography
                variant="caption"
                sx={{ color: theme.palette.warning.main, fontWeight: 800, display: "block" }}
              >
                🔥 Only {product.stockQuantity} left in stock
              </Typography>
            )}
          </Box>

          {/* Interactive Cart CTA */}
          <Box sx={{ minWidth: { xs: 150, sm: 220 } }}>
            {isOutOfStock ? (
              <Button
                fullWidth
                variant="contained"
                disabled
                sx={{
                  py: 1.25,
                  borderRadius: 2.5,
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  bgcolor: theme.palette.grey[400],
                }}
              >
                Out of Stock
              </Button>
            ) : hasVariantsOrModifiers ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                {quantity > 0 && (
                  <Chip
                    label={`${quantity} in cart`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 800, borderRadius: 1.5, flexShrink: 0, height: 32 }}
                  />
                )}
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  disableElevation
                  startIcon={isAdding ? null : <ShoppingCartOutlinedIcon />}
                  onClick={handleAdd}
                  disabled={isAdding || Boolean(missingRequiredGroup)}
                  sx={{
                    py: 1.25,
                    borderRadius: 2.5,
                    fontWeight: 800,
                    fontSize: "0.92rem",
                    textTransform: "none",
                    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.45)}`,
                    },
                  }}
                >
                  {isAdding ? (
                    <CircularProgress size={22} sx={{ color: "white" }} />
                  ) : missingRequiredGroup ? (
                    `Select ${missingRequiredGroup}`
                  ) : (
                    `Add to Cart • ${formatCurrency(displayCurrentUnitPrice)}`
                  )}
                </Button>
              </Box>
            ) : quantity > 0 ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: `2px solid ${theme.palette.primary.main}`,
                  borderRadius: 2.5,
                  overflow: "hidden",
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  py: 0.25,
                  px: 0.5,
                  opacity: isUpdating ? 0.6 : 1,
                  transition: "opacity 0.2s ease",
                }}
              >
                <IconButton
                  aria-label="Decrease quantity"
                  size="small"
                  onClick={(e) => handleUpdateQty(e, -1)}
                  disabled={isUpdating}
                  sx={{
                    color: theme.palette.primary.main,
                    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.12) },
                  }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "1rem",
                      minWidth: 28,
                      textAlign: "center",
                      color: theme.palette.primary.main,
                    }}
                  >
                    {isUpdating ? <CircularProgress size={14} /> : quantity}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                    in cart
                  </Typography>
                </Box>

                <IconButton
                  aria-label="Increase quantity"
                  size="small"
                  onClick={(e) => handleUpdateQty(e, 1)}
                  disabled={isUpdating}
                  sx={{
                    color: theme.palette.primary.main,
                    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.12) },
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Button
                fullWidth
                variant="contained"
                size="large"
                disableElevation
                startIcon={isAdding ? null : <ShoppingCartOutlinedIcon />}
                onClick={handleAdd}
                disabled={isAdding}
                sx={{
                  py: 1.25,
                  borderRadius: 2.5,
                  fontWeight: 800,
                  fontSize: "0.92rem",
                  textTransform: "none",
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.45)}`,
                  },
                }}
              >
                {isAdding ? <CircularProgress size={22} sx={{ color: "white" }} /> : "Add to Cart"}
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

ProductModal.displayName = "ProductModal";
export default ProductModal;

// ── BadgeChip Helper ──────────────────────────────────────────────────────────
function BadgeChip({ label, color }: { label: string; color: string }) {
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: color,
        color: "white",
        fontWeight: 800,
        fontSize: "0.68rem",
        borderRadius: 1.5,
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
      }}
    />
  );
}

// ── FactItem Helper ───────────────────────────────────────────────────────────
function FactItem({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: 1.5,
        bgcolor: theme.palette.background.accent,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          display: "block",
          fontSize: "0.62rem",
          textTransform: "uppercase",
          letterSpacing: 0.6,
          fontWeight: 700,
        }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 800, mt: 0.25, color: "#1E293B" }}>
        {value}
      </Typography>
    </Box>
  );
}

// ── ProductReviewsTab Helper ──────────────────────────────────────────────────
function ProductReviewsTab({ productId }: { productId: string }) {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [reviewsData, setReviewsData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9090";
        const res = await fetch(`${baseUrl}/review/product/${productId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setReviewsData(data);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Skeleton width="50%" height={28} />
        <Skeleton height={70} sx={{ borderRadius: 2 }} />
        <Skeleton height={70} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  const reviews = reviewsData?.data || [];
  const meta = reviewsData?.meta;
  const avgRating = meta?.averageRating || 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          pb: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
          {avgRating > 0 ? avgRating.toFixed(1) : "N/A"}
        </Typography>
        <Box>
          <Rating value={avgRating} readOnly precision={0.5} size="small" />
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontWeight: 600 }}>
            Based on {meta?.totalItems || 0} verified customer {meta?.totalItems === 1 ? "review" : "reviews"}
          </Typography>
        </Box>
      </Box>

      {reviews.length === 0 ? (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontStyle: "italic", py: 3, textAlign: "center" }}
        >
          No customer reviews yet for this product.
        </Typography>
      ) : (
        reviews.map((rev: any) => {
          const user = rev.customer?.user;
          const name = user ? `${user.firstName} ${user.lastName}`.trim() : "Verified Customer";
          return (
            <Box
              key={rev.id}
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: theme.palette.background.accent,
                border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 0.75,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      bgcolor: theme.palette.primary.main,
                    }}
                  >
                    {name.charAt(0)}
                  </Avatar>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
                    {name}
                  </Typography>
                  {rev.isVerified && (
                    <Chip
                      label="✓ Verified Buyer"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: "0.6rem",
                        bgcolor: "#DCFCE7",
                        color: "#15803D",
                        fontWeight: 800,
                      }}
                    />
                  )}
                </Box>
                <Rating value={rev.rating} readOnly size="small" sx={{ fontSize: "0.9rem" }} />
              </Box>
              {rev.comment && (
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontSize: "0.85rem", mt: 0.5, lineHeight: 1.6 }}
                >
                  {rev.comment}
                </Typography>
              )}
            </Box>
          );
        })
      )}
    </Box>
  );
}
