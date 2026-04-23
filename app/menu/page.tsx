// app/menu/page.tsx
"use client";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import AddToCartButton from "@/components/ui/AddToCart";
import { useAddToCartMutation } from "@/features/cart/cartApiService";
import { addToGuestCart, openCart } from "@/features/cart/cartSlice";
import { useGetAllCategoriesQuery } from "@/features/categories/categoriesApiService";
import {
  useGetPaginatedProductsQuery,
  useGetProductsByCategoryPaginatedQuery,
} from "@/features/products/productApiService";
import getDecryptedToken from "@/helpers/decryptToken.helper";
import { Category } from "@/interfaces/category.interface";
import { Product } from "@/interfaces/product.interface";
import { useModal } from "@/lib/ModalProvider";
import { useAppDispatch } from "@/lib/store";
import { MEDIA_BASE_URL } from "@/utils/constants";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Fade from "@mui/material/Fade";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import Rating from "@mui/material/Rating";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const ALL_CATEGORY_ID = "__all__";
const ITEMS_PER_PAGE = 12;

const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating_desc", label: "Highest Rated" },
  { value: "name_asc", label: "Name: A to Z" },
];

const ProductModalDynamic = dynamic(
  () => import("@/components/ui/ProductModal"),
  { loading: () => null, ssr: false }
);

function getImageUrl(product: Product): string {
  const key = product.mainImage?.key ?? product.thumbnail?.key;
  return key
    ? MEDIA_BASE_URL + key
    : "https://placehold.co/400x400?text=Delicious+Bakery";
}

export default function MenuPage() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openModal, closeModal } = useModal();
  const dispatch = useAppDispatch();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(ALL_CATEGORY_ID);

  // ── RTK Query cart mutation ──────────────────────────────────────────────
  const [addToCartMutation] = useAddToCartMutation();

  // Sync category from URL on mount / navigation
  useEffect(() => {
    const param = searchParams.get("categoryId");
    setSelectedCategoryId(param ?? ALL_CATEGORY_ID);
    setCurrentPage(1);
  }, [searchParams]);

  // ── Categories ──────────────────────────────────────────────────────────
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetAllCategoriesQuery(null);

  const categories: Category[] = useMemo(
    () => categoriesData?.data?.filter(Boolean) ?? [],
    [categoriesData]
  );

  const selectedCategory = useMemo(
    () =>
      selectedCategoryId !== ALL_CATEGORY_ID
        ? categories.find((c) => c.id === selectedCategoryId) ?? null
        : null,
    [categories, selectedCategoryId]
  );

  // ── Products — all ──────────────────────────────────────────────────────
  const { data: allProductsData, isLoading: allProductsLoading } =
    useGetPaginatedProductsQuery(
      {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        ...(searchQuery && { search: searchQuery }),
        ...(sortBy !== "default" && parseSortBy(sortBy)),
      },
      { skip: selectedCategoryId !== ALL_CATEGORY_ID }
    );

  // ── Products — by category ──────────────────────────────────────────────
  const { data: categoryProductsData, isLoading: categoryProductsLoading } =
    useGetProductsByCategoryPaginatedQuery(
      {
        id: selectedCategoryId,
        filterDto: {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          ...(searchQuery && { search: searchQuery }),
          ...(sortBy !== "default" && parseSortBy(sortBy)),
        },
      },
      { skip: selectedCategoryId === ALL_CATEGORY_ID }
    );

  const activeData =
    selectedCategoryId === ALL_CATEGORY_ID ? allProductsData : categoryProductsData;

  const displayProducts: Product[] = useMemo(
    () => activeData?.data ?? [],
    [activeData]
  );

  const totalItems = activeData?.meta?.totalItems ?? 0;
  const totalPages = activeData?.meta?.totalPages ?? 1;

  const sortedProducts = useMemo(() => {
    const items = [...displayProducts];
    switch (sortBy) {
      case "price_asc":
        return items.sort((a, b) => Number(a.basePrice) - Number(b.basePrice));
      case "price_desc":
        return items.sort((a, b) => Number(b.basePrice) - Number(a.basePrice));
      case "rating_desc":
        return items.sort((a, b) => Number(b.rating) - Number(a.rating));
      case "name_asc":
        return items.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return items;
    }
  }, [displayProducts, sortBy]);

  const isLoading =
    categoriesLoading ||
    (selectedCategoryId === ALL_CATEGORY_ID
      ? allProductsLoading
      : categoryProductsLoading);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleCategorySelect = useCallback(
    (categoryId: string) => {
      setSelectedCategoryId(categoryId);
      setCurrentPage(1);
      setSearchQuery("");
      if (categoryId === ALL_CATEGORY_ID) {
        router.push("/menu");
        return;
      }
      const cat = categories.find((c) => c.id === categoryId);
      router.push(
        `/menu?categoryId=${categoryId}&categoryName=${encodeURIComponent(cat?.name ?? "")}`
      );
    },
    [categories, router]
  );

  const handlePageChange = useCallback(
    (_: React.ChangeEvent<unknown>, value: number) => {
      setCurrentPage(value);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    []
  );

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent, product: Product) => {
      e.stopPropagation();

      const token = await getDecryptedToken();

      if (token) {
        // Authenticated — use RTK Query mutation (auto-invalidates cache)
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

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero banner ── */}
        <Box
          sx={{
            height: "30vh",
            minHeight: 200,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.background.accent})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Container maxWidth="lg">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "2rem", md: "3rem" },
                  fontFamily: "var(--font-display)",
                  mb: 2,
                }}
              >
                {selectedCategory?.name ?? "Our Complete Menu"}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: theme.palette.text.secondary }}
              >
                {selectedCategory?.description ??
                  "Explore our full collection of artisanal baked goods"}
              </Typography>
            </motion.div>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Grid container spacing={4}>
            {/* ── Sidebar ── */}
            <Grid
              item
              xs={12}
              md={3}
              sx={{ display: { xs: "none", md: "block" } }}
            >
              <Fade in timeout={500}>
                <Box sx={{ position: "sticky", top: 100 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: "var(--font-display)",
                      mb: 3,
                      fontWeight: 600,
                    }}
                  >
                    Categories
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <SidebarButton
                      label="All Items"
                      isSelected={selectedCategoryId === ALL_CATEGORY_ID}
                      color={theme.palette.primary.main}
                      divider={theme.palette.divider}
                      onClick={() => handleCategorySelect(ALL_CATEGORY_ID)}
                    />
                    {categoriesLoading
                      ? Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton
                          key={i}
                          variant="rounded"
                          height={48}
                          sx={{ borderRadius: "12px" }}
                        />
                      ))
                      : categories.map((cat) => (
                        <SidebarButton
                          key={cat.id}
                          label={cat.name}
                          isSelected={selectedCategoryId === cat.id}
                          color={theme.palette.primary.main}
                          divider={theme.palette.divider}
                          iconUrl={
                            cat.categoryImageId
                              ? MEDIA_BASE_URL + cat.categoryImage?.key
                              : undefined
                          }
                          iconAlt={cat.name}
                          onClick={() => handleCategorySelect(cat.id)}
                        />
                      ))}
                  </Box>
                </Box>
              </Fade>
            </Grid>

            {/* ── Main content ── */}
            <Grid item xs={12} md={9}>
              {/* Search + Sort */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mb: 4,
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search menu…"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon
                          sx={{ color: theme.palette.text.secondary }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    flex: 2,
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  }}
                />
                <Box sx={{ minWidth: 200 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Sort by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    {SORT_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Box>

              {/* Mobile category selector */}
              <Box sx={{ display: { xs: "block", md: "none" }, mb: 3 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Select Category"
                  value={selectedCategoryId}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                >
                  <MenuItem value={ALL_CATEGORY_ID}>All Items</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {cat.categoryImageId && cat.categoryImage?.key && (
                          <Image
                            src={MEDIA_BASE_URL + cat.categoryImage.key}
                            alt={cat.name}
                            width={24}
                            height={24}
                          />
                        )}
                        <span>{cat.name}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, mb: 3 }}
              >
                Showing {sortedProducts.length} of {totalItems} items
              </Typography>

              {/* Product grid */}
              <Grid container spacing={3}>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, idx) => (
                    <Grid item xs={12} sm={6} lg={4} key={idx}>
                      <Skeleton
                        variant="rectangular"
                        height={300}
                        sx={{ borderRadius: 2 }}
                      />
                      <Skeleton width="80%" sx={{ mt: 1 }} />
                      <Skeleton width="60%" />
                    </Grid>
                  ))
                  : sortedProducts.map((product, idx) => (
                    <Grid item xs={12} sm={6} lg={4} key={product.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <ProductCard
                          product={product}
                          onAddToCart={handleAddToCart}
                          onClick={() => handleProductClick(product)}
                        />
                      </motion.div>
                    </Grid>
                  ))}
              </Grid>

              {/* Empty state */}
              {!isLoading && sortedProducts.length === 0 && (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <Typography
                    variant="h6"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    No items found
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary, mt: 1 }}
                  >
                    Try adjusting your search or select a different category
                  </Typography>
                </Box>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Box
                  sx={{ display: "flex", justifyContent: "center", mt: 6 }}
                >
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </Container>
      </main>
      <Footer />
    </>
  );
}

// ── parseSortBy helper ────────────────────────────────────────────────────────
function parseSortBy(
  sortBy: string
): { sortBy: string; sortOrder: "asc" | "desc" } {
  switch (sortBy) {
    case "price_asc":
      return { sortBy: "basePrice", sortOrder: "asc" };
    case "price_desc":
      return { sortBy: "basePrice", sortOrder: "desc" };
    case "rating_desc":
      return { sortBy: "rating", sortOrder: "desc" };
    case "name_asc":
      return { sortBy: "name", sortOrder: "asc" };
    default:
      return { sortBy: "createdAt", sortOrder: "desc" };
  }
}

// ── ProductCard ───────────────────────────────────────────────────────────────
interface ProductCardProps {
  product: Product;
  onAddToCart: (e: React.MouseEvent, product: Product) => void;
  onClick: () => void;
}

function ProductCard({ product, onAddToCart, onClick }: ProductCardProps) {
  const theme = useTheme();
  const price = Number(product.basePrice);
  const imageUrl = getImageUrl(product);
  const isOutOfStock = !product.inStock;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        transition: "all 0.3s ease",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "var(--shadow-medium)",
        },
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          position: "relative",
          pt: "75%",
          overflow: "hidden",
          bgcolor: theme.palette.background.accent,
        }}
      >
        <CardMedia
          component="img"
          image={imageUrl}
          alt={product.name}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.5s ease",
            "&:hover": { transform: "scale(1.05)" },
          }}
        />

        <Box
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            display: "flex",
            gap: 0.5,
            flexWrap: "wrap",
          }}
        >
          {product.bestSeller && (
            <Chip
              label="Best Seller"
              size="small"
              sx={{
                bgcolor: theme.palette.warning.main,
                color: "white",
                fontWeight: 700,
                fontSize: "0.6rem",
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
                fontSize: "0.6rem",
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
                fontSize: "0.6rem",
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
            }}
          >
            <Chip label="Out of Stock" sx={{ background: "white" }} />
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            mb: 1,
            flexWrap: "wrap",
          }}
        >
          {product.category?.name && (
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.disabled,
                fontSize: "0.65rem",
              }}
            >
              {product.category.name}
            </Typography>
          )}
          {product.dietaryTags?.slice(0, 2).map((tag) => (
            <Chip
              key={tag}
              label={tag.replace(/_/g, " ")}
              size="small"
              sx={{
                height: 16,
                fontSize: "0.55rem",
                bgcolor: `${theme.palette.success.main}20`,
                color: theme.palette.success.dark,
              }}
            />
          ))}
        </Box>

        <Typography
          variant="h6"
          sx={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
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
            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}
          >
            <Rating
              value={Number(product.rating)}
              precision={0.1}
              size="small"
              readOnly
            />
            <Typography
              variant="caption"
              sx={{ color: theme.palette.text.secondary }}
            >
              ({product.totalReviews} reviews)
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 1.5, mb: 1.5, flexWrap: "wrap" }}>
          {product.weight && (
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.65rem",
              }}
            >
              ⚖ {Number(product.weight)}
              {product.weightUnit}
            </Typography>
          )}
          {product.shelfLife && (
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.65rem",
              }}
            >
              🕐 {product.shelfLife}d shelf life
            </Typography>
          )}
          {product.piecesPerPack && (
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.65rem",
              }}
            >
              📦 {product.piecesPerPack} pcs/pack
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: "1.2rem",
              fontWeight: 700,
              color: theme.palette.primary.main,
            }}
          >
            ₹{price.toFixed(2)}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.disabled, fontSize: "0.65rem" }}
          >
            / {product.baseUnit?.toLowerCase()}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2.5, pt: 0 }}>
        <AddToCartButton item={product} />
      </CardActions>
    </Card>
  );
}

// ── SidebarButton ─────────────────────────────────────────────────────────────
interface SidebarButtonProps {
  label: string;
  isSelected: boolean;
  color: string;
  divider: string;
  iconUrl?: string;
  iconAlt?: string;
  onClick: () => void;
}

function SidebarButton({
  label,
  isSelected,
  color,
  divider,
  iconUrl,
  iconAlt,
  onClick,
}: SidebarButtonProps) {
  return (
    <motion.button
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        background: isSelected ? color : "transparent",
        color: isSelected ? "white" : "inherit",
        border: `1.5px solid ${isSelected ? color : divider}`,
        borderRadius: "12px",
        padding: "12px 16px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        fontFamily: "inherit",
        fontSize: "0.9rem",
        fontWeight: isSelected ? 600 : 500,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {iconUrl && (
          <img
            src={iconUrl}
            alt={iconAlt ?? label}
            style={{
              width: 24,
              height: 24,
              objectFit: "contain",
              filter: isSelected ? "brightness(0) invert(1)" : "none",
            }}
          />
        )}
        <Typography
          variant="body2"
          sx={{
            fontWeight: isSelected ? 600 : 500,
            color: isSelected ? "white" : "inherit",
          }}
        >
          {label}
        </Typography>
      </Box>
    </motion.button>
  );
}