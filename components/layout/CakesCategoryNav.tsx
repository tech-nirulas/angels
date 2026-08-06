"use client";

import { useGetCategoryTreeQuery } from "@/features/categories/categoriesApiService";
import { CategoryWithChildren } from "@/interfaces/category.interface";
import { MEDIA_BASE_URL } from "@/utils/constants";
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
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";

function getCategoryImageUrl(category: CategoryWithChildren): string | null {
  const key = category.categoryImage?.key;
  return key ? `${MEDIA_BASE_URL}${key}` : null;
}

export default function CakesCategoryNav() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [hoveredCategory, setHoveredCategory] = useState<CategoryWithChildren | null>(null);
  const [mobileDrawerCategory, setMobileDrawerCategory] = useState<CategoryWithChildren | null>(null);
  const [popupPos, setPopupPos] = useState<{ left: number; top: number } | null>(null);
  const tabRefs = useRef<Map<string, HTMLElement>>(new Map());
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      // Pull top position up flush against category navbar (eliminating the gap)
      const top = barRect ? barRect.bottom - 30 : tabRect.bottom - 10;
      setPopupPos({ left: tabRect.left, top });
    } else {
      setPopupPos(null);
    }
    setHoveredCategory(cat);
  }, [clearLeaveTimer]);

  const { data: treeData, isLoading } = useGetCategoryTreeQuery(null);

  const categories: CategoryWithChildren[] = useMemo(() => {
    return treeData?.data?.filter((c) => c.isActive) ?? [];
  }, [treeData]);

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
        backgroundColor: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
        transition: "all 0.3s ease",
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 0 } }}>
        {/* Desktop View */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: 1,
            py: 0.5,
            position: "relative",
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
                sx={{ position: "relative" }}
              >
                <Box
                  onClick={() => {
                    if (!hasChildren) {
                      router.push(`/cakes/${cat.slug}`);
                    }
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 2,
                    py: 1.25,
                    cursor: "pointer",
                    borderRadius: 2,
                    fontWeight: isHovered ? 700 : 600,
                    fontSize: "0.85rem",
                    letterSpacing: "0.02em",
                    color: isHovered
                      ? theme.palette.primary.main
                      : theme.palette.text.primary,
                    transition: "all 0.2s ease",
                    backgroundColor: isHovered
                      ? `${theme.palette.primary.main}12`
                      : "transparent",
                    "&:hover": {
                      color: theme.palette.primary.main,
                      backgroundColor: `${theme.palette.primary.main}12`,
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
                      }}
                    />
                  )}
                </Box>
              </Box>
            );
          })}

        </Box>

        {/* Desktop Floating Popup — position: fixed, anchored to hovered tab via getBoundingClientRect */}
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

        {/* Mobile Chip View */}
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            overflowX: "auto",
            py: 1,
            gap: 1,
            "::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
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
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  px: 0.5,
                  py: 2,
                  backgroundColor: `${theme.palette.primary.main}10`,
                  color: theme.palette.primary.dark,
                  border: `1px solid ${theme.palette.primary.main}25`,
                  "&:hover": {
                    backgroundColor: `${theme.palette.primary.main}20`,
                  },
                }}
              />
            );
          })}
        </Box>
      </Container>

      {/* Mobile Drawer for Level-2 Subcategories */}
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
                        <Image src={imageUrl} alt={sub.name} fill style={{ objectFit: "cover" }} />
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
