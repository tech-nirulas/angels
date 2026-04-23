// components/ui/ProductModal.tsx
"use client";

import { Product } from "@/interfaces/product.interface";
import { MEDIA_BASE_URL } from "@/utils/constants";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Rating from "@mui/material/Rating";
import { useTheme } from "@mui/material/styles";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { memo, useState } from "react";

interface ProductModalProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onClose: () => void;
}

function getImageUrl(product: Product): string {
  const key = product.mainImage?.key ?? product.thumbnail?.key;
  return key
    ? MEDIA_BASE_URL + key
    : "https://placehold.co/600x600?text=No+Image";
}

const ProductModal = memo(({ product, onAddToCart, onClose }: ProductModalProps) => {
  const theme = useTheme();
  const [imageError, setImageError] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [galleryIndex, setGalleryIndex] = useState(0);

  if (!product) return null;

  const price = Number(product.basePrice);
  const isOutOfStock = !product.inStock;

  // Build gallery: mainImage first, then gallery items
  const allImages = [
    ...(product.mainImage ? [product.mainImage] : []),
    ...(product.gallery ?? []).filter((g) => g.id !== product.mainImageId),
  ];
  const activeImage = allImages[galleryIndex];
  const activeImageUrl = activeImage?.key
    ? MEDIA_BASE_URL + activeImage.key
    : getImageUrl(product);

  // Nutritional info — stored as JSON, shape may vary
  const nutritional = product.nutritionalInfo as Record<string, string | number> | null;
  const allergens = product.allergenInfo as Record<string, boolean> | null;

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, minHeight: { md: 480 } }}>

      {/* ── Left: image + gallery strip ── */}
      <Box sx={{ flex: "0 0 45%", display: "flex", flexDirection: "column", bgcolor: theme.palette.background.accent }}>
        {/* Main image */}
        <Box sx={{ position: "relative", flex: 1, minHeight: { xs: 280, md: 360 }, overflow: "hidden" }}>
          {!imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeImageUrl}
              alt={activeImage?.alt ?? product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={() => setImageError(true)}
            />
          ) : (
            <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography variant="body2" color="text.secondary">Image not available</Typography>
            </Box>
          )}

          {/* Top-left badge cluster */}
          <Box sx={{ position: "absolute", top: 12, left: 12, display: "flex", flexDirection: "column", gap: 0.5 }}>
            {product.bestSeller && <Chip label="Best Seller" size="small" sx={{ bgcolor: theme.palette.warning.main, color: "white", fontWeight: 700, fontSize: "0.65rem" }} />}
            {product.newArrival && <Chip label="New Arrival" size="small" sx={{ bgcolor: theme.palette.info.main, color: "white", fontWeight: 700, fontSize: "0.65rem" }} />}
            {product.featured && <Chip label="Featured" size="small" sx={{ bgcolor: theme.palette.primary.main, color: "white", fontWeight: 700, fontSize: "0.65rem" }} />}
            {product.isSeasonal && <Chip label="Seasonal" size="small" sx={{ bgcolor: theme.palette.success.main, color: "white", fontWeight: 700, fontSize: "0.65rem" }} />}
          </Box>
        </Box>

        {/* Gallery thumbnails */}
        {allImages.length > 1 && (
          <Box sx={{ display: "flex", gap: 1, p: 1.5, overflowX: "auto" }}>
            {allImages.map((img, i) => (
              <Box
                key={img.id}
                onClick={() => { setGalleryIndex(i); setImageError(false); }}
                sx={{
                  width: 56, height: 56, flexShrink: 0,
                  borderRadius: 1.5, overflow: "hidden",
                  border: `2px solid ${i === galleryIndex ? theme.palette.primary.main : "transparent"}`,
                  cursor: "pointer", opacity: i === galleryIndex ? 1 : 0.6,
                  transition: "all 0.2s",
                }}
              >
                <img
                  src={img.key ? MEDIA_BASE_URL + img.key : ""}
                  alt={img.alt ?? `Image ${i + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* ── Right: content ── */}
      <Box sx={{ flex: 1, p: { xs: 2.5, md: 3.5 }, overflowY: "auto", maxHeight: { md: 560 } }}>

        {/* Category breadcrumb */}
        {product.category?.name && (
          <Typography variant="caption" sx={{ color: theme.palette.text.disabled, letterSpacing: 1, textTransform: "uppercase", fontSize: "0.65rem" }}>
            {product.category.name}
          </Typography>
        )}

        <Typography variant="h4" sx={{ fontFamily: "var(--font-display)", fontWeight: 700, mt: 0.5, mb: 1, lineHeight: 1.2 }}>
          {product.name}
        </Typography>

        {/* SKU */}
        <Typography variant="caption" sx={{ color: theme.palette.text.disabled, display: "block", mb: 1.5 }}>
          SKU: {product.sku}
        </Typography>

        {/* Rating */}
        {Number(product.rating) > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Rating value={Number(product.rating)} precision={0.1} size="small" readOnly />
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {Number(product.rating).toFixed(1)} ({product.totalReviews} reviews)
            </Typography>
          </Box>
        )}

        {/* Price row */}
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, mb: 2 }}>
          <Typography sx={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 800, color: theme.palette.primary.main }}>
            ₹{price.toFixed(2)}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.disabled }}>
            / {product.baseUnit?.toLowerCase()}
          </Typography>
          {product.gstRate && (
            <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
              +{Number(product.gstRate)}% GST
            </Typography>
          )}
        </Box>

        {/* Dietary tags */}
        {product.dietaryTags?.length > 0 && (
          <Box sx={{ display: "flex", gap: 0.75, mb: 2, flexWrap: "wrap" }}>
            {product.dietaryTags.map((tag) => (
              <Chip
                key={tag}
                icon={<LocalOfferIcon sx={{ fontSize: "0.7rem !important" }} />}
                label={tag.replace(/_/g, " ")}
                size="small"
                sx={{ bgcolor: `${theme.palette.success.main}18`, color: theme.palette.success.dark, fontSize: "0.65rem", height: 22 }}
              />
            ))}
          </Box>
        )}

        {/* Out of stock notice */}
        {isOutOfStock && (
          <Chip label="Currently Out of Stock" color="error" sx={{ mb: 2, fontWeight: 600 }} />
        )}

        {/* Stock quantity nudge */}
        {product.inStock && product.stockQuantity <= product.lowStockThreshold && product.stockQuantity > 0 && (
          <Typography variant="caption" sx={{ color: theme.palette.warning.main, fontWeight: 600, display: "block", mb: 1.5 }}>
            ⚠ Only {product.stockQuantity} left in stock!
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        {/* ── Tabs: Details / Nutrition / Storage ── */}
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2, minHeight: 36 }}
          TabIndicatorProps={{ style: { height: 2 } }}>
          <Tab label="Details" sx={{ fontSize: "0.75rem", minHeight: 36, py: 0 }} />
          <Tab label="Nutrition" sx={{ fontSize: "0.75rem", minHeight: 36, py: 0 }} disabled={!nutritional} />
          <Tab label="Storage" sx={{ fontSize: "0.75rem", minHeight: 36, py: 0 }} disabled={!product.storageInstructions} />
        </Tabs>

        {/* Tab: Details */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="body2" sx={{ color: theme.palette.text.primary, lineHeight: 1.7, mb: 2 }}>
              {product.description}
            </Typography>

            {/* Quick facts grid */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              {product.weight && (
                <FactItem label="Weight" value={`${Number(product.weight)}${product.weightUnit}`} />
              )}
              {product.piecesPerPack && (
                <FactItem label="Pieces/Pack" value={String(product.piecesPerPack)} />
              )}
              {product.shelfLife && (
                <FactItem label="Shelf Life" value={`${product.shelfLife} days`} />
              )}
              {product.maxPerOrder && (
                <FactItem label="Max/Order" value={String(product.maxPerOrder)} />
              )}
              {product.preorderEnabled && (
                <FactItem label="Pre-order" value={`${product.preorderLeadDays ?? 2} day lead`} />
              )}
            </Box>

            {/* Allergens */}
            {allergens && Object.keys(allergens).length > 0 && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: `${theme.palette.error.main}10`, borderRadius: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.error.main, display: "block", mb: 0.5 }}>
                  ⚠ Allergen Information
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {Object.entries(allergens)
                    .filter(([, present]) => present)
                    .map(([name]) => name)
                    .join(", ") || "None declared"}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Tab: Nutrition */}
        {activeTab === 1 && nutritional && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            {Object.entries(nutritional).map(([key, val]) => (
              <Box key={key} sx={{ display: "flex", justifyContent: "space-between", py: 0.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textTransform: "capitalize" }}>
                  {key.replace(/([A-Z])/g, " $1")}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{String(val)}</Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Tab: Storage */}
        {activeTab === 2 && product.storageInstructions && (
          <Typography variant="body2" sx={{ color: theme.palette.text.primary, lineHeight: 1.7 }}>
            {product.storageInstructions}
          </Typography>
        )}

        <Divider sx={{ my: 2.5 }} />

        {/* Add to cart */}
        <Box
          component="button"
          onClick={() => !isOutOfStock && onAddToCart(product)}
          disabled={isOutOfStock}
          sx={{
            width: "100%", py: 1.5, borderRadius: 2.5,
            border: "none", cursor: isOutOfStock ? "not-allowed" : "pointer",
            bgcolor: isOutOfStock ? "action.disabledBackground" : "primary.main",
            color: "white", fontWeight: 700, fontSize: "0.95rem",
            fontFamily: "inherit", letterSpacing: 0.5,
            transition: "all 0.2s ease",
            "&:hover:not(:disabled)": { filter: "brightness(0.88)", transform: "translateY(-1px)" },
          }}
        >
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Box>
      </Box>
    </Box>
  );
});

ProductModal.displayName = "ProductModal";
export default ProductModal;

// ── FactItem helper ───────────────────────────────────────────────────────────
function FactItem({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <Box sx={{ p: 1.25, bgcolor: theme.palette.background.accent, borderRadius: 1.5 }}>
      <Typography variant="caption" sx={{ color: theme.palette.text.disabled, display: "block", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.25 }}>
        {value}
      </Typography>
    </Box>
  );
}