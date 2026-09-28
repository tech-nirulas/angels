"use client";

import AddToCartButton from "@/components/ui/AddToCart";
import { Product } from "@/interfaces/product.interface";
import { getImageUrl } from "@/utils/imageUtils";
import { IMAGE_SLOTS } from "@/utils/imageSpec";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";

const CARD_SPEC = IMAGE_SLOTS.productCard;

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  onAddToCart?: (e: React.MouseEvent, product: Product) => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const theme = useTheme();

  const basePrice = Number(product.basePrice);
  const discountedPrice = (product as any).discountedPrice
    ? Number((product as any).discountedPrice)
    : basePrice;
  const hasDiscount = discountedPrice < basePrice;
  const discountPct =
    (product as any).discountPct ||
    (hasDiscount
      ? Math.round(((basePrice - discountedPrice) / basePrice) * 100)
      : null);

  const imageUrl = getImageUrl(product);
  const isOutOfStock = !product.inStock;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        overflow: "hidden",
        transition: "all 0.3s ease",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
        },
      }}
    >
      {/*
        CardActionArea renders a real <button>, so the whole card is reachable
        by keyboard and announced as a button — no role/tabIndex/aria needed.
        It wraps only the media + content: AddToCartButton lives in CardActions
        below and must stay a separate, independently focusable control.
      */}
      <CardActionArea
        onClick={onClick}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "flex-start",
          height: "100%",
          // Keyboard focus needs a visible indicator: the card is a real
          // <button> now, so it must look focused (WCAG 2.4.7). Keyboard only,
          // so it does not fire on mouse click.
          "&.Mui-focused": {
            outline: `3px solid ${theme.palette.primary.main}`,
            outlineOffset: "2px",
          },
        }}
      >
      {/*
        Media Box — fixed 4:3 ratio rather than a fixed pixel height. A fixed
        height with a fluid grid width made the rendered ratio swing from
        1.33:1 to 2.84:1 across breakpoints, so the same image was cropped
        differently on every screen and no single upload ratio could be specified.
      */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 3",
          overflow: "hidden",
          bgcolor: theme.palette.background.accent,
          flexShrink: 0,
          "&:hover img": { transform: "scale(1.05)" },
        }}
      >
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes={CARD_SPEC.sizes}
          quality={CARD_SPEC.quality}
          style={{
            objectFit: "cover",
            objectPosition: "center",
            transition: "transform 0.5s ease",
          }}
        />

        {/* Top-left Badges */}
        <Box
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            zIndex: 2,
          }}
        >
          {hasDiscount && (
            <Chip
              label={
                discountPct
                  ? `${discountPct}% OFF`
                  : `SAVE ₹${(basePrice - discountedPrice).toFixed(0)}`
              }
              size="small"
              color="error"
              sx={{
                fontWeight: 800,
                fontSize: "0.68rem",
                borderRadius: 1.5,
                boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
              }}
            />
          )}
          {product.bestSeller && (
            <Chip
              label="Best Seller"
              size="small"
              sx={{
                bgcolor: theme.palette.warning.main,
                color: "white",
                fontWeight: 700,
                fontSize: "0.62rem",
                height: 20,
              }}
            />
          )}
          {product.newArrival && (
            <Chip
              label="New"
              size="small"
              sx={{
                bgcolor: theme.palette.info.main,
                color: "white",
                fontWeight: 700,
                fontSize: "0.62rem",
                height: 20,
              }}
            />
          )}
          {product.isSeasonal && (
            <Chip
              label="Seasonal"
              size="small"
              sx={{
                bgcolor: theme.palette.success.main,
                color: "white",
                fontWeight: 700,
                fontSize: "0.62rem",
                height: 20,
              }}
            />
          )}
        </Box>

        {isOutOfStock && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 3,
            }}
          >
            <Chip label="Out of Stock" sx={{ background: "white", fontWeight: 700 }} />
          </Box>
        )}
      </Box>

      {/* Content */}
      <CardContent sx={{ flexGrow: 1, p: 2, pb: 1 }}>
        {product.category?.name && (
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.disabled,
              fontSize: "0.65rem",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              display: "block",
              mb: 0.5,
            }}
          >
            {product.category.name}
          </Typography>
        )}

        <Typography
          variant="h6"
          sx={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            mb: 0.5,
            fontSize: "1rem",
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.name}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            mb: 1.5,
            fontSize: "0.75rem",
            lineHeight: 1.4,
            minHeight: "2.2rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.shortDescription || product.description}
        </Typography>

        {Number(product.rating) > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1.5 }}>
            <Rating value={Number(product.rating)} precision={0.1} size="small" readOnly />
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: "0.7rem" }}>
              ({product.totalReviews})
            </Typography>
          </Box>
        )}

        {/* Price Row */}
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
          <Typography
            sx={{
              fontFamily: "var(--font-body)",
              fontSize: "1.1rem",
              fontWeight: 800,
              color: theme.palette.primary.main,
            }}
          >
            ₹{discountedPrice.toFixed(2)}
          </Typography>
          {hasDiscount && (
            <Typography
              sx={{
                fontSize: "0.85rem",
                color: "text.disabled",
                textDecoration: "line-through",
                fontWeight: 500,
              }}
            >
              ₹{basePrice.toFixed(2)}
            </Typography>
          )}
          {product.baseUnit && (
            <Typography variant="caption" sx={{ color: theme.palette.text.disabled, fontSize: "0.65rem" }}>
              / {product.baseUnit.toLowerCase()}
            </Typography>
          )}
        </Box>
      </CardContent>
      </CardActionArea>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <AddToCartButton item={product} />
      </CardActions>
    </Card>
  );
}
