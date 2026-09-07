"use client";

import { useGetCategoryTreeQuery } from "@/features/categories/categoriesApiService";
import { CategoryWithChildren } from "@/interfaces/category.interface";
import { MEDIA_BASE_URL } from "@/utils/constants";
import { IMAGE_SLOTS } from "@/utils/imageSpec";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const THUMB_SPEC = IMAGE_SLOTS.thumbnail;

function getCategoryImageUrl(category: CategoryWithChildren): string | null {
  const key = category.categoryImage?.key;
  return key ? `${MEDIA_BASE_URL}${key}` : null;
}

export default function CakesCategoryNav() {
  const theme = useTheme();
  const router = useRouter();
  const [hoveredCategory, setHoveredCategory] = useState<CategoryWithChildren | null>(null);
  const [mobileDrawerCategory, setMobileDrawerCategory] = useState<CategoryWithChildren | null>(null);
  const [popupPos, setPopupPos] = useState<{ left: number; top: number } | null>(null);
  const tabRefs = useRef<Map<string, HTMLElement>>(new Map());
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll-fade state for desktop nav
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const clearLeaveTimer = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    leaveTimerRef.current = setTimeout(() => {
      setHoveredCategory(null);
      setPopupPos(null);
    }, 150);
  }, []);

  const navBarRef = useRef<HTMLDivElement | null>(null);

  const handleTabEnter = useCallback((cat: CategoryWithChildren, el: HTMLElement) => {
    clearLeaveTimer();
    const hasChildren = Boolean(cat.children && cat.children.length > 0);
    if (hasChildren) {
      const tabRect = el.getBoundingClientRect();
      const barRect = navBarRef.current?.getBoundingClientRect();
      // Anchor popup flush to the bottom of the nav bar
      const top = barRect ? barRect.bottom : tabRect.bottom;
      setPopupPos({ left: tabRect.left, top });
    } else {
      setPopupPos(null);
    }
    setHoveredCategory(cat);
  }, [clearLeaveTimer]);

  // Update scroll-fade indicators when the scroll container scrolls or resizes
  const updateScrollIndicators = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const tolerance = 2; // account for sub-pixel rounding
    setCanScrollLeft(el.scrollLeft > tolerance);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - tolerance);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    updateScrollIndicators();
    el.addEventListener("scroll", updateScrollIndicators, { passive: true });
    const ro = new ResizeObserver(updateScrollIndicators);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollIndicators);
      ro.disconnect();
    };
  }, [updateScrollIndicators]);

  // Eligibility (isActive + showInSubNavbar + parent-only + ordering) is decided
  // entirely by the backend in CategoryService.findTree(). This component is
  // presentation only — do not re-apply visibility rules here, or the two would
  // drift. refetchOnFocus/Reconnect let an already-open tab pick up an admin
  // change without a hard reload.
  const { data: treeData, isLoading } = useGetCategoryTreeQuery(null, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const categories: CategoryWithChildren[] = useMemo(
    () => treeData?.data ?? [],
    [treeData]
  );

  if (isLoading || categories.length === 0) {
    return null;
  }

  const handleSubCategoryClick = (slug: string) => {
    setHoveredCategory(null);
    setMobileDrawerCategory(null);
    router.push(`/cakes/${slug}`);
  };

  return (
    <Box
      ref={navBarRef}
      sx={{
        position: "sticky",
        top: { xs: 56, sm: 64 },
        zIndex: 1100,
        // Fully opaque background — prevents hero bleed-through
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: "0 1px 8px rgba(0, 0, 0, 0.06)",
        transition: "box-shadow 0.3s ease",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 0, md: 0 } }}>
        {/* ─── Desktop View ─── */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            position: "relative",
          }}
        >
          {/* Left fade mask */}
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 32,
              background: `linear-gradient(to right, ${theme.palette.background.paper}, transparent)`,
              zIndex: 2,
              pointerEvents: "none",
              opacity: canScrollLeft ? 1 : 0,
              transition: "opacity 0.2s ease",
            }}
          />
          {/* Right fade mask */}
          <Box
            sx={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: 32,
              background: `linear-gradient(to left, ${theme.palette.background.paper}, transparent)`,
              zIndex: 2,
              pointerEvents: "none",
              opacity: canScrollRight ? 1 : 0,
              transition: "opacity 0.2s ease",
            }}
          />

          {/* Scrollable tab row */}
          <Box
            ref={scrollContainerRef}
            sx={{
              display: "flex",
              alignItems: "stretch",
              gap: 0,
              overflowX: "auto",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
              // Smooth scroll for programmatic scrolling
              scrollBehavior: "smooth",
            }}
          >
            {categories.map((cat) => {
              const hasChildren = Boolean(cat.children && cat.children.length > 0);
              const isHovered = hoveredCategory?.id === cat.id;

              return (
                <Box
                  key={cat.id}
                  ref={(el) => {
                    if (el) tabRefs.current.set(cat.id, el as HTMLElement);
                    else tabRefs.current.delete(cat.id);
                  }}
                  onMouseEnter={(e) => handleTabEnter(cat, e.currentTarget)}
                  onMouseLeave={scheduleClose}
                  sx={{
                    position: "relative",
                    flexShrink: 0, // prevent tabs from shrinking
                  }}
                >
                  <Box
                    component="button"
                    onClick={() => {
                      if (!hasChildren) {
                        router.push(`/cakes/${cat.slug}`);
                      }
                    }}
                    sx={{
                      // Reset button defaults
                      border: "none",
                      background: "none",
                      outline: "none",
                      font: "inherit",
                      // Layout
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      px: 2.5,
                      py: 1.5,
                      cursor: "pointer",
                      whiteSpace: "nowrap", // ← prevents label wrapping
                      // Typography
                      fontFamily: theme.typography.fontFamily,
                      fontSize: "0.8rem",
                      fontWeight: isHovered ? 600 : 500,
                      letterSpacing: "0.03em",
                      color: isHovered
                        ? theme.palette.primary.main
                        : theme.palette.text.primary,
                      // Transitions
                      transition: "color 0.2s ease, background-color 0.2s ease",
                      backgroundColor: isHovered
                        ? `${theme.palette.primary.main}08`
                        : "transparent",
                      // Bottom accent underline on hover/active
                      borderBottom: isHovered
                        ? `2px solid ${theme.palette.primary.main}`
                        : "2px solid transparent",
                      "&:hover": {
                        color: theme.palette.primary.main,
                        backgroundColor: `${theme.palette.primary.main}08`,
                        borderBottomColor: theme.palette.primary.main,
                      },
                      "&:focus-visible": {
                        outline: `2px solid ${theme.palette.primary.main}`,
                        outlineOffset: -2,
                        borderRadius: 1,
                      },
                    }}
                  >
                    {cat.name}
                    {hasChildren && (
                      <ExpandMoreIcon
                        sx={{
                          fontSize: 16,
                          transition: "transform 0.2s ease",
                          transform: isHovered ? "rotate(180deg)" : "rotate(0deg)",
                          color: isHovered ? theme.palette.primary.main : "text.secondary",
                          ml: 0.25,
                        }}
                      />
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* ─── Desktop Floating Popup ─── */}
        <AnimatePresence>
          {hoveredCategory && hoveredCategory.children && hoveredCategory.children.length > 0 && popupPos && (
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: -3, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -2, scale: 0.99 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              onMouseEnter={clearLeaveTimer}
              onMouseLeave={scheduleClose}
              sx={{
                position: "fixed",
                top: popupPos.top,
                left: popupPos.left,
                minWidth: 320,
                maxWidth: 480,
                p: 2.5,
                borderRadius: 3,
                backgroundColor: "#FFFFFF",
                border: `1px solid ${theme.palette.primary.light}30`,
                boxShadow: "0 20px 48px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.06)",
                zIndex: 1400,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  mb: 1.5,
                  fontSize: "0.72rem",
                }}
              >
                Explore {hoveredCategory.name}
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {hoveredCategory.children.map((sub) => {
                  const imageUrl = getCategoryImageUrl(sub);

                  return (
                    <Box
                      key={sub.id}
                      onClick={() => handleSubCategoryClick(sub.slug)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        p: 1,
                        borderRadius: 2,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        border: "1px solid transparent",
                        "&:hover": {
                          backgroundColor: `${theme.palette.primary.main}08`,
                          borderColor: `${theme.palette.primary.main}25`,
                          transform: "translateX(3px)",
                        },
                      }}
                    >
                      {imageUrl ? (
                        <Box
                          sx={{
                            position: "relative",
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            overflow: "hidden",
                            flexShrink: 0,
                          }}
                        >
                          <Image
                            src={imageUrl}
                            alt={sub.name}
                            fill
                            sizes="36px"
                            quality={THUMB_SPEC.quality}
                            style={{ objectFit: "cover" }}
                          />
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            backgroundColor: `${theme.palette.primary.main}15`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1rem",
                            flexShrink: 0,
                          }}
                        >
                          🍰
                        </Box>
                      )}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "text.primary", lineHeight: 1.3 }}
                        >
                          {sub.name}
                        </Typography>
                        {sub.description && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "text.secondary",
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {sub.description}
                          </Typography>
                        )}
                      </Box>
                      <ChevronRightIcon sx={{ fontSize: 16, color: "text.disabled", flexShrink: 0 }} />
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </AnimatePresence>

        {/* ─── Mobile: Horizontal Chip Scroller ─── */}
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            overflowX: "auto",
            py: 1.25,
            px: 1.5, // breathing room so first/last chips aren't flush against edges
            gap: 1,
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            // iOS momentum scrolling
            WebkitOverflowScrolling: "touch",
          }}
        >
          {categories.map((cat) => {
            const hasChildren = Boolean(cat.children && cat.children.length > 0);

            return (
              <Chip
                key={cat.id}
                label={cat.name}
                onClick={() => {
                  if (hasChildren) {
                    setMobileDrawerCategory(cat);
                  } else {
                    router.push(`/cakes/${cat.slug}`);
                  }
                }}
                icon={hasChildren ? <ExpandMoreIcon fontSize="small" /> : undefined}
                sx={{
                  flexShrink: 0, // prevent chip from collapsing
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  minHeight: 36, // comfortable touch target
                  px: 1,
                  borderRadius: "18px", // pill shape
                  backgroundColor: `${theme.palette.primary.main}08`,
                  color: theme.palette.text.primary,
                  border: `1px solid ${theme.palette.primary.main}20`,
                  transition: "all 0.15s ease",
                  "&:hover, &:active": {
                    backgroundColor: `${theme.palette.primary.main}18`,
                    borderColor: `${theme.palette.primary.main}40`,
                  },
                }}
              />
            );
          })}
        </Box>
      </Container>

      {/* ─── Mobile Drawer for Level-2 Subcategories ─── */}
      <Drawer
        anchor="bottom"
        open={Boolean(mobileDrawerCategory)}
        onClose={() => setMobileDrawerCategory(null)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            p: 3,
            maxHeight: "75vh",
            backgroundColor: "#FFFFFF",
          },
        }}
      >
        {mobileDrawerCategory && (
          <>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
                pb: 1,
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {mobileDrawerCategory.name}
              </Typography>
              <IconButton onClick={() => setMobileDrawerCategory(null)}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Stack spacing={1}>
              {mobileDrawerCategory.children?.map((sub) => {
                const imageUrl = getCategoryImageUrl(sub);

                return (
                  <Box
                    key={sub.id}
                    onClick={() => handleSubCategoryClick(sub.slug)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: `${theme.palette.primary.main}05`,
                      border: `1px solid ${theme.palette.primary.main}15`,
                      cursor: "pointer",
                      "&:active": {
                        backgroundColor: `${theme.palette.primary.main}15`,
                      },
                    }}
                  >
                    {imageUrl ? (
                      <Box
                        sx={{
                          position: "relative",
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <Image src={imageUrl} alt={sub.name} fill sizes="40px" quality={THUMB_SPEC.quality} style={{ objectFit: "cover" }} />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          backgroundColor: `${theme.palette.primary.main}20`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        🍰
                      </Box>
                    )}
                    <Typography variant="body1" sx={{ fontWeight: 600, flex: 1 }}>
                      {sub.name}
                    </Typography>
                    <ChevronRightIcon sx={{ color: "text.secondary" }} />
                  </Box>
                );
              })}
            </Stack>
          </>
        )}
      </Drawer>
    </Box>
  );
}
