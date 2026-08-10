"use client";

import { useGetActiveOffersQuery } from "@/features/offer/offerApiService";
import { IMAGE_SLOTS } from "@/utils/imageSpec";
import { Box, Button, Chip, Skeleton, Typography, useTheme } from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Slider, { Settings } from "react-slick";

const HERO_SPEC = IMAGE_SLOTS.heroBanner;

/**
 * Deterministic hero container ratio, replacing the previous 65vh/75vh sizing.
 * Viewport-relative heights made the rendered aspect ratio a function of the
 * device, so no single asset ratio could ever be specified to Marketing.
 *
 * Rendered heights (verified against the target devices):
 *   1920x1080 -> 810px    1440x900 -> 608px    1366x768 -> 576px
 *   768x1024  -> 576px     390x844 -> 487px     360x800 -> 450px
 */
const HERO_ASPECT_RATIO = { xs: "4 / 5", sm: "4 / 3", md: "2.37 / 1" } as const;

/** Guard so ultrawide displays (e.g. 3440x1440) don't produce an absurdly tall hero. */
const HERO_MAX_HEIGHT = "80vh";

export default function HeroSection() {
  const theme = useTheme();
  const router = useRouter();

  const {
    data: activeOffersResponse,
    isLoading,
    isError,
  } = useGetActiveOffersQuery();
  const activeOffers = activeOffersResponse?.data || activeOffersResponse || [];

  const settings: Settings = {
    autoplay: true,
    autoplaySpeed: 4500,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: true,
  };

  // Extract all active banners from active offers.
  // A banner only qualifies if it carries real uploaded media — offers without
  // usable banner media contribute nothing rather than a synthetic slide.
  const slides: any[] = [];
  if (Array.isArray(activeOffers) && activeOffers.length > 0) {
    activeOffers.forEach((offer: any) => {
      if (!Array.isArray(offer.banners)) return;
      offer.banners.forEach((banner: any) => {
        if (banner.media?.url) {
          slides.push({
            image: banner.media.url,
            alt: banner.altText || banner.headline || offer.title || "Promotional banner",
            badge: offer.code ? `🎟️ Code: ${offer.code}` : "🔥 Special Campaign",
            title: banner.headline || offer.title,
            description: banner.subtext || offer.description || "Special promotional offer on our gourmet selection.",
            code: offer.code,
            linkType: banner.linkType,
            linkCategoryId: banner.linkCategoryId,
            linkProductId: banner.linkProductId,
            linkUrl: banner.linkUrl,
          });
        }
      });
    });
  }

  // Loading: hold the space with a skeleton at the final ratio so the page
  // below doesn't jump when banners arrive.
  if (isLoading) {
    return (
      <Box
        sx={{
          width: "100%",
          aspectRatio: HERO_ASPECT_RATIO,
          maxHeight: HERO_MAX_HEIGHT,
        }}
        id="home"
      >
        <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
      </Box>
    );
  }

  // Error: the hero is *unavailable*. Deliberately distinct from the
  // loaded-and-empty case below, even though both render nothing — we must not
  // present stale promotional content when the backend cannot confirm what is
  // currently active.
  if (isError) return null;

  // Loaded successfully with zero active banners: intentionally no hero.
  // Returning before the wrapper guarantees no empty container is left behind,
  // so the content below moves up naturally.
  if (slides.length === 0) return null;

  const handleSlideClick = (slide: any) => {
    if (slide.linkUrl) {
      window.open(slide.linkUrl, "_blank");
      return;
    }
    if (slide.linkCategoryId) {
      router.push(`/menu?category=${slide.linkCategoryId}`);
      return;
    }
    if (slide.linkProductId) {
      router.push(`/menu?product=${slide.linkProductId}`);
      return;
    }
    router.push(slide.actionUrl || "/menu");
  };

  return (
    <Box
      sx={{
        width: "100%",
        aspectRatio: HERO_ASPECT_RATIO,
        maxHeight: HERO_MAX_HEIGHT,
        position: "relative",
      }}
      id="home"
    >
      <Slider {...settings}>
        {slides.map((item: any, index: number) => (
          <Box
            key={index}
            sx={{
              width: "100%",
              aspectRatio: HERO_ASPECT_RATIO,
              maxHeight: HERO_MAX_HEIGHT,
              position: "relative",
              overflow: "hidden",
              display: "flex !important",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/*
              Optimized banner. Previously a CSS `background-image`, which
              bypassed next/image entirely — no srcset, no DPR selection, no
              WebP/AVIF conversion, and full-size originals shipped to phones.
            */}
            <Image
              src={item.image}
              alt={item.alt}
              fill
              sizes={HERO_SPEC.sizes}
              quality={HERO_SPEC.quality}
              priority={index === 0}
              style={{ objectFit: "cover", objectPosition: "center" }}
            />

            {/*
              Gradient moved out of the CSS background stack into its own layer
              so the image itself can be optimized. Values unchanged from the
              original to preserve the existing look.
            */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.4) 100%)",
                pointerEvents: "none",
              }}
            />

            <Box
              sx={{
                position: "absolute",
                bottom: { xs: "12%", md: "18%" },
                left: "50%",
                transform: "translateX(-50%)",
                width: { xs: "90%", md: "65%" },
                textAlign: "center",
                color: "white",
              }}
            >
              {item.badge && (
                <Chip
                  icon={<LocalOfferIcon sx={{ color: "#FFF !important", fontSize: "0.9rem" }} />}
                  label={item.badge}
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: "white",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    mb: 1.5,
                    px: 1,
                    py: 0.5,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  }}
                />
              )}

              <Typography
                variant="h2"
                sx={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: { xs: "1.8rem", sm: "2.4rem", md: "3.2rem" },
                  lineHeight: 1.15,
                  mb: 1.5,
                  textShadow: "0 2px 10px rgba(0,0,0,0.6)",
                }}
              >
                {item.title}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: "0.9rem", md: "1.1rem" },
                  opacity: 0.95,
                  maxWidth: 700,
                  mx: "auto",
                  mb: 3,
                  display: { xs: "none", sm: "block" },
                  textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                }}
              >
                {item.description}
              </Typography>

              <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleSlideClick(item)}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.4,
                    fontSize: "1rem",
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark ?? theme.palette.primary.main})`,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    "&:hover": { transform: "translateY(-2px)" },
                    transition: "all 0.2s ease",
                  }}
                >
                  Explore Offer
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push("/customize")}
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 1.4,
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "white",
                    borderColor: "white",
                    backdropFilter: "blur(4px)",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.3)",
                      borderColor: "white",
                    },
                  }}
                >
                  Customize Cake
                </Button>
              </Box>
            </Box>
          </Box>
        ))}
      </Slider>
    </Box>
  );
}