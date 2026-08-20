"use client";

import ProductCard from "@/components/ui/ProductCard";
import AddToCartButton from "@/components/ui/AddToCart";
import { useAddToCartMutation } from "@/features/cart/cartApiService";
import { addToGuestCart, openCart } from "@/features/cart/cartSlice";
import { useGetCategoryBySlugQuery } from "@/features/categories/categoriesApiService";
import { useGetProductsByCategorySlugPaginatedQuery } from "@/features/products/productApiService";
import getDecryptedToken from "@/helpers/decryptToken.helper";
import { Product } from "@/interfaces/product.interface";
import { useModal } from "@/lib/ModalProvider";
import { useAppDispatch } from "@/lib/store";
import { MEDIA_BASE_URL } from "@/utils/constants";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import Rating from "@mui/material/Rating";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { use } from "react";
import { useCallback, useMemo, useState } from "react";

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
    : "https://placehold.co/1200x900.png?text=Delicious+Bakery";
}

export default function CategoryCakesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const theme = useTheme();
  const { openModal, closeModal } = useModal();
  const dispatch = useAppDispatch();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const [addToCartMutation] = useAddToCartMutation();

  const { data: catData, isLoading: catLoading } = useGetCategoryBySlugQuery({ slug });
  const category = catData?.data;

  const parseSortBy = (val: string) => {
    switch (val) {
      case "price_asc":
        return { sortBy: "basePrice", sortOrder: "asc" };
      case "price_desc":
        return { sortBy: "basePrice", sortOrder: "desc" };
      case "rating_desc":
        return { sortBy: "rating", sortOrder: "desc" };
      case "name_asc":
        return { sortBy: "name", sortOrder: "asc" };
      default:
        return {};
    }
  };

  const { data: productsData, isLoading: productsLoading } =
    useGetProductsByCategorySlugPaginatedQuery({
      slug,
      filterDto: {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        isActive: true,
        ...(searchQuery && { search: searchQuery }),
        ...(sortBy !== "default" && parseSortBy(sortBy)),
      },
    });

  const displayProducts: Product[] = useMemo(
    () => productsData?.data ?? [],
    [productsData]
  );

  const totalPages = productsData?.meta?.totalPages ?? 1;

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
        await addToCartMutation({ productId: product.id, quantity: 1 });
      } else {
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
        // No title: the modal renders the product name itself, and an empty
        // DialogTitle bar would just duplicate it above a full-bleed image.
        maxWidth: "md",
        disableContentPadding: true,
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
    <Box sx={{ pb: 10 }}>
      {/* Category Header */}
      <Box
        sx={{
          py: { xs: 4, md: 6 },
          background: `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.background.default})`,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="lg">
          <Breadcrumbs
            separator={<ChevronRightIcon fontSize="small" />}
            sx={{ mb: 2, fontSize: "0.85rem" }}
          >
            <Link href="/" style={{ color: theme.palette.text.secondary, textDecoration: "none" }}>
              Home
            </Link>
            <Link href="/cakes" style={{ color: theme.palette.text.secondary, textDecoration: "none" }}>
              Cakes
            </Link>
            {category?.parent && (
              <Link
                href={`/cakes/${category.parent.slug}`}
                style={{ color: theme.palette.text.secondary, textDecoration: "none" }}
              >
                {category.parent.name}
              </Link>
            )}
            <Typography color="text.primary" sx={{ fontWeight: 600 }}>
              {catLoading ? "Loading..." : category?.name ?? slug}
            </Typography>
          </Breadcrumbs>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                // fontFamily removed: variant="h3" already resolves to the theme
                // display font, so hardcoding the family here only risked drift.
                color: theme.palette.text.primary,
                mb: 1,
              }}
            >
              {category?.name ?? slug}
            </Typography>
            {category?.description && (
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700 }}>
                {category.description}
              </Typography>
            )}
          </motion.div>
        </Container>
      </Box>

      {/* Catalog Controls */}
      <Container maxWidth="lg" sx={{ pt: 4, pb: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            alignItems: "center",
            justifyContent: "space-between",
            mb: 4,
          }}
        >
          <TextField
            placeholder="Search in this category..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            size="small"
            sx={{ width: { xs: "100%", sm: 300 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            select
            label="Sort By"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            size="small"
            sx={{ width: { xs: "100%", sm: 200 } }}
          >
            {SORT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Products Grid */}
        {productsLoading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
                <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 3 }} />
                <Skeleton height={28} sx={{ mt: 1 }} />
                <Skeleton width="60%" height={20} />
              </Grid>
            ))}
          </Grid>
        ) : displayProducts.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No cakes found in this category.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {displayProducts.map((product) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
                <ProductCard
                  product={product}
                  onClick={() => handleProductClick(product)}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}
