// components/sections/MenuSection.tsx
"use client";

import SectionLabel from "@/components/ui/SectionLabel";
import { useAddToCartMutation } from "@/features/cart/cartApiService";
import { addToGuestCart, openCart } from "@/features/cart/cartSlice";
import { useGetAllCategoriesPaginatedQuery } from "@/features/categories/categoriesApiService";
import {
  useGetPaginatedProductsQuery,
  useGetProductsByCategoryPaginatedQuery,
} from "@/features/products/productApiService";
import getDecryptedToken from "@/helpers/decryptToken.helper";
import { Product } from "@/interfaces/product.interface";
import { useModal } from "@/lib/ModalProvider";
import { useAppDispatch } from "@/lib/store";
import { MEDIA_BASE_URL } from "@/utils/constants";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Rating from "@mui/material/Rating";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import AddToCartButton from "../ui/AddToCart";

const ProductModalDynamic = dynamic(
  () => import("@/components/ui/ProductModal"),
  { loading: () => null, ssr: false }
);

const ALL_ID = "__all__";
const PREVIEW_LIMIT = 8;

function getImageUrl(product: Product): string {
  const key = product.mainImage?.key ?? product.thumbnail?.key;
  return key
    ? MEDIA_BASE_URL + key
    : "https://placehold.co/400x400?text=Delicious+Bakery";
}

export default function MenuSection() {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { openModal, closeModal } = useModal();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(ALL_ID);

  // ── RTK Query cart mutation ──────────────────────────────────────────────
  const [addToCartMutation] = useAddToCartMutation();

  // ── Categories ────────────────────────────────────────────────────────────
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetAllCategoriesPaginatedQuery({ limit: 4, page: 1 });

  const categories = useMemo(
    () => categoriesData?.data?.filter(Boolean) ?? [],
    [categoriesData]
  );

  // ── Products — all ────────────────────────────────────────────────────────
  const { data: allProductsData, isLoading: allProductsLoading } =
    useGetPaginatedProductsQuery(
      { page: 1, limit: PREVIEW_LIMIT },
      { skip: selectedCategoryId !== ALL_ID }
    );

  // ── Products — by category ────────────────────────────────────────────────
  const { data: categoryProductsData, isLoading: categoryProductsLoading } =
    useGetProductsByCategoryPaginatedQuery(
      { id: selectedCategoryId, filterDto: { page: 1, limit: PREVIEW_LIMIT } },
      { skip: selectedCategoryId === ALL_ID }
    );

  const displayProducts: Product[] = useMemo(() => {
    if (selectedCategoryId === ALL_ID) return allProductsData?.data ?? [];
    return categoryProductsData?.data ?? [];
  }, [selectedCategoryId, allProductsData, categoryProductsData]);

  const isLoading =
    isCategoriesLoading ||
    (selectedCategoryId === ALL_ID ? allProductsLoading : categoryProductsLoading);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddToCart = useCallback(
    async (e: React.MouseEvent, product: Product) => {
      e.stopPropagation();

      const token = await getDecryptedToken();

      if (token) {
        // Authenticated — RTK Query mutation
        await addToCartMutation({ productId: product.id, quantity: 1 });
      } else {
        // Guest — local Redux + localStorage
        dispatch(
          addToGuestCart({
            productId: product.id,
            product: {
              id: product.id,
              name: product.name,
              slug: product.slug,
              description: product.shortDescription || "",
              basePrice: Number(product.basePrice),
              inStock: product.inStock,
              mainImage: product.mainImage ?? product.thumbnail,
            },
          })
        );
      }

      dispatch(openCart());
    },
    [dispatch, addToCartMutation]
  );

  const handleProductClick = useCallback(
    (product: Product) => {
      openModal({
        title: product.name,
        maxWidth: "md",
        content: (
          <ProductModalDynamic
            product={product}
            onAddToCart={handleAddToCart}
            onClose={closeModal}
          />
        ),
      });
    },
    [openModal, closeModal, handleAddToCart]
  );

  const handleBrowseCategory = (categoryId: string, categoryName: string) => {
    router.push(
      `/menu?categoryId=${categoryId}&categoryName=${encodeURIComponent(categoryName)}`
    );
  };

  return (
    <Box
      id="menu"
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, #F5EDE0 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <SectionLabel
          label="À La Carte"
          title="Our Menu"
          subtitle="Baked fresh every morning. Seasonal ingredients sourced from trusted farms and markets."
        />

        {/* ── Category filter chips ── */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 5,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <CategoryChip
            label="All"
            isSelected={selectedCategoryId === ALL_ID}
            color={theme.palette.primary.main}
            onClick={() => setSelectedCategoryId(ALL_ID)}
          />

          {isCategoriesLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  width={100}
                  height={32}
                  sx={{ borderRadius: 2 }}
                />
              ))
            : categories.map((cat) =>
                cat ? (
                  <CategoryChip
                    key={cat.id}
                    label={cat.name}
                    isSelected={selectedCategoryId === cat.id}
                    color={theme.palette.primary.main}
                    iconUrl={
                      cat.categoryImageId
                        ? MEDIA_BASE_URL + cat?.categoryImage?.key
                        : undefined
                    }
                    onClick={() => setSelectedCategoryId(cat.id)}
                  />
                ) : null
              )}
        </Box>

        {/* ── Product grid ── */}
        <Grid container spacing={2.5}>
          <AnimatePresence mode="wait">
            {isLoading
              ? Array.from({ length: PREVIEW_LIMIT }).map((_, idx) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={`skel-${idx}`}>
                    <Skeleton
                      variant="rectangular"
                      height={280}
                      sx={{ borderRadius: 2.5 }}
                    />
                    <Skeleton width="75%" sx={{ mt: 1 }} />
                    <Skeleton width="50%" />
                  </Grid>
                ))
              : displayProducts.map((product, idx) => {
                  const price = Number(product.basePrice);
                  const imageUrl = getImageUrl(product);

                  return (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: idx * 0.04, duration: 0.35 }}
                      >
                        <Card
                          sx={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            borderRadius: 2.5,
                            overflow: "hidden",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: "var(--shadow-medium)",
                            },
                          }}
                          onClick={() => handleProductClick(product)}
                        >
                          {/* Image */}
                          <Box
                            sx={{
                              position: "relative",
                              height: 180,
                              overflow: "hidden",
                              bgcolor: theme.palette.background.accent,
                              flexShrink: 0,
                            }}
                          >
                            <CardMedia
                              component="img"
                              image={imageUrl}
                              alt={product.name}
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                transition: "transform 0.5s ease",
                                "&:hover": { transform: "scale(1.05)" },
                              }}
                            />

                            {product.inStock === false && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  inset: 0,
                                  background: "rgba(0,0,0,0.55)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Chip
                                  label="Out of Stock"
                                  size="small"
                                  sx={{ background: "white", height: 24 }}
                                />
                              </Box>
                            )}
                          </Box>

                          {/* Content */}
                          <CardContent
                            sx={{ p: 1.5, pb: 1, flexGrow: 1 }}
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                fontFamily: "var(--font-display)",
                                fontWeight: 600,
                                mb: 0.5,
                                fontSize: "0.95rem",
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
                                mb: 1,
                                fontSize: "0.7rem",
                                lineHeight: 1.4,
                                minHeight: "2.5rem",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {product.shortDescription || product.description}
                            </Typography>

                            {Number(product.rating) > 0 && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  mb: 1,
                                }}
                              >
                                <Rating
                                  value={Number(product.rating)}
                                  precision={0.1}
                                  size="small"
                                  readOnly
                                  sx={{ fontSize: "0.8rem" }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: theme.palette.text.secondary,
                                    fontSize: "0.65rem",
                                  }}
                                >
                                  ({product.totalReviews})
                                </Typography>
                              </Box>
                            )}

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontFamily: "var(--font-display)",
                                  fontSize: "1rem",
                                  fontWeight: 700,
                                  color: theme.palette.primary.main,
                                }}
                              >
                                ₹{price.toFixed(2)}
                              </Typography>
                            </Box>
                          </CardContent>

                          <CardActions sx={{ p: 1.5, pt: 0 }}>
                            <AddToCartButton item={product} />
                          </CardActions>
                        </Card>
                      </motion.div>
                    </Grid>
                  );
                })}
          </AnimatePresence>
        </Grid>

        {/* Empty state */}
        {!isLoading && displayProducts.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.secondary }}
            >
              No items found in this category yet.
            </Typography>
          </Box>
        )}

        {/* ── Bottom CTAs ── */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            mt: 6,
            flexWrap: "wrap",
          }}
        >
          {selectedCategoryId !== ALL_ID &&
            (() => {
              const cat = categories.find((c) => c?.id === selectedCategoryId);
              return cat ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    variant="outlined"
                    size="medium"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => handleBrowseCategory(cat.id, cat.name)}
                    sx={{
                      borderRadius: 3,
                      px: 3.5,
                      py: 1,
                      fontSize: "0.8rem",
                      borderColor: cat.color,
                      color: cat.color,
                      "&:hover": {
                        borderColor: cat.color,
                        background: `${cat.color}10`,
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    See All {cat.name}
                  </Button>
                </motion.div>
              ) : null;
            })()}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button
              variant="outlined"
              size="medium"
              endIcon={<ArrowForwardIcon />}
              onClick={() => router.push("/menu")}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1,
                fontSize: "0.8rem",
                "&:hover": { transform: "translateY(-2px)" },
              }}
            >
              Browse Full Menu
            </Button>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}

// ── CategoryChip ──────────────────────────────────────────────────────────────
interface CategoryChipProps {
  label: string;
  isSelected: boolean;
  color: string;
  iconUrl?: string;
  onClick: () => void;
}

function CategoryChip({
  label,
  isSelected,
  color,
  iconUrl,
  onClick,
}: CategoryChipProps) {
  const theme = useTheme();
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 16px",
        borderRadius: 8,
        border: `1px solid ${isSelected ? color : theme.palette.primary.light}`,
        background: isSelected ? color : "transparent",
        color: isSelected ? "white" : theme.palette.text.primary,
        cursor: "pointer",
        fontSize: "0.75rem",
        fontWeight: 600,
        fontFamily: "inherit",
        transition: "all 0.2s ease",
      }}
    >
      {iconUrl && (
        <Image
          src={iconUrl}
          alt={label}
          style={{
            objectFit: "contain",
            filter: isSelected ? "brightness(0) invert(1)" : "none",
          }}
          width={18}
          height={18}
        />
      )}
      {label}
    </motion.button>
  );
}