// components/sections/FeaturedSection.tsx
"use client";

import SectionLabel from '@/components/ui/SectionLabel';
import { addToGuestCart, openCart } from '@/features/cart/cartSlice';
import { addToServerCart } from '@/features/cart/cartThunk';
import { useGetFeaturedProductsQuery } from '@/features/products/productApiService';
import getDecryptedToken from '@/helpers/decryptToken.helper';
import { Product } from '@/interfaces/product.interface';
import { useModal } from '@/lib/ModalProvider';
import { useAppDispatch } from '@/lib/store';
import { MEDIA_BASE_URL } from '@/utils/constants';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Rating from '@mui/material/Rating';
import Skeleton from '@mui/material/Skeleton';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import AddToCartButton from '../ui/AddToCart';

const ProductModalDynamic = dynamic(
  () => import("@/components/ui/ProductModal"),
  { loading: () => null, ssr: false }
);

// Helper function to get image URL
function getImageUrl(product: Product): string {
  const key = product.mainImage?.key ?? product.thumbnail?.key;
  return key
    ? MEDIA_BASE_URL + key
    : "https://placehold.co/400x400?text=Featured+Item";
}

// Helper to normalize product for cart
function toCartItem(product: Product) {
  return {
    documentId: product.id,
    name: product.name,
    price: Number(product.basePrice),
    description: product.description ?? "",
    slug: product.slug,
    image: product.mainImage ?? product.thumbnail ?? null,
  };
}

// Product Card Component
const FeaturedProductCard = ({
  product,
  index,
  onAddToCart,
  onProductClick
}: {
  product: Product;
  index: number;
  onAddToCart: (e: React.MouseEvent, product: Product) => void;
  onProductClick: (product: Product) => void;
}) => {
  const theme = useTheme();
  const price = Number(product.basePrice);
  const imageUrl = getImageUrl(product);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -8 }}
      style={{ height: '100%' }}
    >
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          overflow: "hidden",
          cursor: "pointer",
          transition: "all 0.3s ease",
          position: "relative",
          '&:hover': {
            boxShadow: theme.shadows[8],
          },
        }}
        onClick={() => onProductClick(product)}
      >
        {/* Featured Badge */}
        <Chip
          label="Featured"
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 1,
            background: theme.palette.primary.main,
            color: 'white',
            fontWeight: 600,
            fontSize: '0.7rem',
            backdropFilter: 'blur(4px)',
          }}
        />

        {/* Product Image */}
        <Box
          sx={{
            position: "relative",
            height: 240,
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
              '&:hover': {
                transform: "scale(1.08)",
              },
            }}
          />

          {/* Out of stock overlay */}
          {product.inStock === false && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.65)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Chip
                label="Out of Stock"
                size="small"
                sx={{
                  background: "white",
                  fontWeight: 600,
                  height: 28,
                  fontSize: '0.75rem',
                }}
              />
            </Box>
          )}
        </Box>

        {/* Product Info */}
        <CardContent sx={{ p: 2, pb: 1, flexGrow: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              mb: 0.75,
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
              lineHeight: 1.5,
              minHeight: "2.25rem",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.shortDescription || product.description}
          </Typography>

          {/* Rating */}
          {Number(product.rating) > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.5 }}>
              <Rating
                value={Number(product.rating)}
                precision={0.1}
                size="small"
                readOnly
                sx={{ fontSize: "0.875rem" }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.7rem",
                }}
              >
                ({product.totalReviews})
              </Typography>
            </Box>
          )}

          {/* Price */}
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontSize: "1.25rem",
              fontWeight: 700,
              color: theme.palette.primary.main,
            }}
          >
            ₹{price.toFixed(2)}
          </Typography>
        </CardContent>

        {/* Add to Cart Button */}
        <CardActions sx={{ p: 2, pt: 0 }}>
          <AddToCartButton item={product} />
        </CardActions>
      </Card>
    </motion.div>
  );
};

// Loading Skeleton
const LoadingSkeleton = () => (
  <Grid container spacing={3}>
    {Array.from({ length: 4 }).map((_, idx) => (
      <Grid item xs={12} sm={6} md={3} key={`featured-skel-${idx}`}>
        <Skeleton
          variant="rectangular"
          height={280}
          sx={{ borderRadius: 3 }}
        />
        <Skeleton width="80%" sx={{ mt: 1.5 }} />
        <Skeleton width="60%" />
        <Skeleton width="40%" sx={{ mt: 1 }} />
      </Grid>
    ))}
  </Grid>
);

// Main Featured Section Component
export default function FeaturedSection() {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { openModal, closeModal } = useModal();

  // Fetch featured products
  const { data: featuredData, isLoading, error } = useGetFeaturedProductsQuery(null);

  const featuredProducts = useMemo(() => {
    if (!featuredData?.data) return [];
    return featuredData.data.slice(0, 8); // Limit to 8 items (2 rows of 4)
  }, [featuredData]);

  // Handlers
  const handleAddToCart = useCallback(
    async (e: React.MouseEvent, product: Product) => {
      e.stopPropagation();

      const token = await getDecryptedToken();
      const cartItem = {
        productId: product.id,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.shortDescription || '',
          basePrice: Number(product.basePrice),
          inStock: product.inStock,
          mainImage: product.mainImage ?? product.thumbnail,
        },
      };

      if (token) {
        // Authenticated user - add to server cart
        dispatch(addToServerCart({ productId: product.id, quantity: 1 }));
      } else {
        // Guest user - add to local storage
        dispatch(addToGuestCart(cartItem));
      }

      dispatch(openCart());
    },
    [dispatch]
  );

  const handleProductClick = useCallback(
    (product: Product) => {
      const imageUrl = getImageUrl(product);
      openModal({
        title: product.name,
        maxWidth: "md",
        content: (
          <ProductModalDynamic
            product={product}
            onAddToCart={(p) => dispatch(addToCart(toCartItem(product)))}
            onClose={closeModal}
          />
        ),
      });
    },
    [openModal, closeModal, dispatch]
  );

  if (error) {
    console.error('Error fetching featured products:', error);
    return null; // Silently fail if no featured products
  }

  if (isLoading) {
    return (
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          background: theme.palette.background.default,
        }}
      >
        <Container maxWidth="lg">
          <SectionLabel
            label="Chef's Picks"
            title="Featured Delicacies"
            subtitle="Our most loved creations, handcrafted with passion and premium ingredients"
          />
          <LoadingSkeleton />
        </Container>
      </Box>
    );
  }

  if (!featuredProducts.length) {
    return null; // Don't show section if no featured products
  }

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.accent} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <SectionLabel
            label="Chef's Picks"
            title="Featured Delicacies"
            subtitle="Our most loved creations, handcrafted with passion and premium ingredients"
          />
        </motion.div>

        {/* Featured Products Grid - 4 items per row */}
        <Grid container spacing={3}>
          {featuredProducts.map((product, idx) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}  // 4 items per row on large screens
              key={product.id}
            >
              <FeaturedProductCard
                product={product}
                index={idx}
                onAddToCart={handleAddToCart}
                onProductClick={handleProductClick}
              />
            </Grid>
          ))}
        </Grid>

        {/* View All Link (Optional) */}
        {featuredProducts.length >= 4 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/menu?featured=true')}
                sx={{
                  borderRadius: 3,
                  px: 5,
                  py: 1.5,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                View All Featured Items
              </Button>
            </motion.div>
          </Box>
        )}
      </Container>
    </Box>
  );
}