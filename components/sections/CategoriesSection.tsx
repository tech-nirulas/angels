// components/sections/CategoriesSection.tsx (Final Production Version)
"use client";

import { useEffect, useMemo, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import Skeleton from '@mui/material/Skeleton';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import { useRef } from 'react';
import { keyframes } from '@mui/system';

import SectionLabel from '@/components/ui/SectionLabel';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useGetAllCategoriesQuery } from '@/features/categories/categoriesApiService';
import { useToast } from '@/hooks/useToast';
import { Category } from '@/interfaces/category.interface';
import { MEDIA_BASE_URL } from '@/utils/constants';


// Stagger children horizontally for scroll-in feel
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

// Subtle scale+fade — avoids large Y shifts in a horizontal layout
const itemVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 120, damping: 14 },
  },
};

// Shimmer keyframe for skeleton ring — purely decorative, no layout impact
const shimmer = keyframes`
  0%   { opacity: 1 }
  50%  { opacity: 0.5 }
  100% { opacity: 1 }
`;

const CircularCategoryItem = memo(({
  category,
  index,
  onClick,
}: {
  category: Category;
  index: number;
  onClick: (category: Category) => void;
}) => {
  const theme = useTheme();

  // Consistent accent colors keyed by name; falls back to primary for unknown categories
  const accentColor = useMemo(() => {
    const palette: Record<string, string> = {
      'Celebration Cakes': theme.palette.secondary.main,
      'Artisan Pastries': theme.palette.primary.main,
      'Sourdough & Breads': '#D4A574',
    };
    return palette[category.name] ?? theme.palette.primary.light;
  }, [category.name, theme]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') onClick(category);
  }, [category, onClick]);

  // Avatar diameter — fixed so the row height is predictable
  // WITH THIS
  // Increased from 100 → 128 for better visual weight and image clarity
  const AVATAR_SIZE = 190;

  return (
    <motion.div
      variants={itemVariants}
      style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
    >
      <Box
        role="button"
        tabIndex={0}
        aria-label={`Explore ${category.name}`}
        onClick={() => onClick(category)}
        onKeyDown={handleKeyDown}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
          cursor: 'pointer',
          outline: 'none',
          // Keyboard focus ring on the circle itself, not the outer wrapper
          '&:focus-visible .avatar-ring': {
            outline: `3px solid ${accentColor}`,
            outlineOffset: '4px',
          },
        }}
      >
        {/*
          Circle image container
          - NO background fill color — transparent so the image dominates
          - Ring is a single clean border, not a box-shadow stack
          - overflow:hidden does the circle crop; no need for borderRadius on the image itself
        */}
        <Box
          className="avatar-ring"
          sx={{
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            borderRadius: '50%',
            overflow: 'hidden',
            position: 'relative',
            display: "flex",
            flexWrap: "wrap",
            // Clean 2px accent border — subtle, not chunky
            border: `2.5px solid ${accentColor}55`,
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
            // Soft drop shadow for depth — much better than flat circles
            boxShadow: `0 4px 20px ${accentColor}22`,
            bgcolor: theme.palette.action.hover, // neutral fallback, not accent-tinted
            '&:hover': {
              borderColor: accentColor,
              boxShadow: `0 8px 28px ${accentColor}44`,
            },
          }}
        >
          {category.categoryImage?.url ? (
            /*
              IMPORTANT: Do NOT pass `circle` prop here — ImageWithFallback applies
              borderRadius:'50%' inline which conflicts with the parent's overflow:hidden crop.
              The parent Box already handles the circular crop cleanly.
              Do NOT pass objectFit="cover" via circle variant — use explicit prop.
            */
            <ImageWithFallback
              src={MEDIA_BASE_URL + category.categoryImage.key}
              alt={category.name}
              fill
              sizes="(max-width: 7200px) 140px, 170px"
              priority={index < 5}
              objectFit="cover"
              accentColor={accentColor}
            // circle prop intentionally omitted — parent handles the crop
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: `${accentColor}12`,
              }}
            >
              <RestaurantMenuIcon sx={{ fontSize: 48, color: accentColor, opacity: 0.55 }} />
            </Box>
          )}
        </Box>

        {/* Label: slightly larger, better weight, no line-clamp truncation for short names */}
        <Typography
          variant="caption"
          align="center"
          sx={{
            fontWeight: 700,
            fontSize: '0.78rem',
            lineHeight: 1.4,
            maxWidth: AVATAR_SIZE + 8,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: theme.palette.text.primary,
            letterSpacing: '0.02em',
            // Subtle color echo of the category accent
            background: `${theme.palette.text.primary}`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {category.name}
        </Typography>
      </Box>
    </motion.div>
  );
});

CircularCategoryItem.displayName = 'CircularCategoryItem';

// CategoryCard.displayName = 'CategoryCard';

// WITH THIS
/**
 * CircularCategorySkeleton — matches the exact geometry of CircularCategoryItem
 * Inline with the scroll row so layout doesn't shift on data load
 */
const CircularCategorySkeleton = memo(() => (
  <Box
    sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}
    role="presentation"
    aria-hidden="true"
  >
    <Skeleton variant="circular" width={128} height={128} />
    <Skeleton variant="text" width={88} height={16} sx={{ borderRadius: 1 }} />
  </Box>
));

CircularCategorySkeleton.displayName = 'CircularCategorySkeleton';



// Empty State Component
const EmptyState = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 12,
        px: 3,
        borderRadius: 4,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <RestaurantMenuIcon sx={{ fontSize: 80, color: theme.palette.text.disabled, mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        No Categories Available
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Check back soon for our delicious offerings!
      </Typography>
    </Box>
  );
};

// Main Component
export default function CategoriesSection() {
  const theme = useTheme();
  const router = useRouter();
  const toast = useToast();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Fetch categories data
  const { data: categoriesData, error, isLoading } = useGetAllCategoriesQuery();

  // Filter and sort categories (only active ones, by display order)
  const categories = useMemo(() => {
    if (!categoriesData?.data) return [];
    return categoriesData.data
      .filter(category => category?.isActive !== false) // Only active categories
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .slice(0, 6); // Limit to 6 for performance
  }, [categoriesData]);

  // Error handling with toast
  useEffect(() => {
    if (error) {
      toast.showToast(
        "Unable to load categories. Please refresh the page or try again later.",
        "error"
      );
      console.error('Categories fetch error:', error);
    }
  }, [error, toast]);

  // Navigation handler with analytics (optional)
  const handleCategoryClick = useCallback((category: Category) => {
    // Track category click (analytics can be added here)
    console.log('Category selected:', category.name, 'ID:', category.id);

    // Navigate to menu page with category context
    router.push(`/menu?categoryId=${category.id}&categoryName=${encodeURIComponent(category.name)}`);
  }, [router]);

  const handleBrowseAll = useCallback(() => {
    router.push("/menu");
  }, [router]);



  // Loading state

  if (isLoading) {
    return (
      <Box component="section" sx={{ py: { xs: 5, md: 7 }, background: theme.palette.background.accent }}>
        <Container maxWidth="lg">
          <SectionLabel
            label="Explore Our World"
            title="Baked With Love"
            subtitle="From classic favourites to seasonal specials, discover the perfect treat for every moment."
          />
          {/* Mirror the scroll row geometry exactly so skeletons match real items */}
          <Box sx={{ display: 'flex', justifyContent: "center", alignItems: "center", gap: 3, overflowX: 'auto', pb: 1, px: 0.5, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <CircularCategorySkeleton key={i} />
            ))}
          </Box>
        </Container>
      </Box>
    );
  }

  // Empty state
  if (!categories.length) {
    return (
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          background: theme.palette.background.accent,
        }}
      >
        <Container maxWidth="lg">
          <SectionLabel
            label="Explore Our World"
            title="Baked With Love"
            subtitle="From classic favourites to seasonal specials, discover the perfect treat for every moment."
          />
          <EmptyState />
        </Container>
      </Box>
    );
  }

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 5, md: 7 }, // reduced vertical padding — compact as requested
        background: theme.palette.background.accent,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top/bottom gradient rule — visual section separator */}
      {(['top', 'bottom'] as const).map((edge) => (
        <Box
          key={edge}
          sx={{
            position: 'absolute',
            [edge]: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${theme.palette.primary.light}, transparent)`,
          }}
        />
      ))}

      <Container maxWidth="lg">
        {/* Section header fades in once */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <SectionLabel
            label="Explore Our World"
            title="Baked With Love"
            subtitle="From classic favourites to seasonal specials, discover the perfect treat for every moment."
          />
        </motion.div>

        {/*
          Horizontal scroll container
          - overflow-x: auto enables scroll; scrollbar hidden for clean look
          - padding-bottom reserves space for focus rings and shadows
          - scroll-snap makes swipe feel native on mobile
        */}
        <Box sx={{ position: 'relative' }}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            style={{
              display: 'flex',
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 32,           // wider gap suits the larger avatar
              overflowX: 'auto',
              paddingBottom: 16, // enough for the drop shadow to breathe
              paddingTop: 12,
              paddingLeft: 8,
              paddingRight: 8,
              scrollSnapType: 'x proximity', // proximity > mandatory for desktop feel
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >


            <AnimatePresence>
              {categories.map((category, idx) => (
                // scroll-snap-align: center feels most natural on mobile carousels
                <Box key={category.id} sx={{ scrollSnapAlign: 'center' }}>
                  <CircularCategoryItem
                    category={category}
                    index={idx}
                    onClick={handleCategoryClick}
                  />
                </Box>
              ))}
            </AnimatePresence>
          </motion.div>
        </Box>

        {/* Browse All — same logic, tightened spacing */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              variant="outlined"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={handleBrowseAll}
              sx={{
                borderRadius: 3,
                px: { xs: 4, sm: 5 },
                py: { xs: 1.1, sm: 1.4 },
                fontSize: '0.85rem',
                fontWeight: 600,
                borderWidth: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderWidth: 2,
                  '& .MuiButton-endIcon': { transform: 'translateX(4px)' },
                },
                '& .MuiButton-endIcon': { transition: 'transform 0.3s ease' },
              }}
            >
              Browse All Categories
            </Button>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}
