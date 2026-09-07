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

type HeroSlide = {
  image: string;
  alt: string;
  /** Promo code chip — only set when the offer has a real code. */
  code: string | null;
  /** Explicit banner overlay headline — never falls back to offer.title. */
  title: string | null;
  /** Explicit banner overlay subtext — never falls back to offer.description. */
  description: string | null;
  hasTextOverlay: boolean;
  linkType?: string;
  linkCategoryId?: string | number | null;
  linkProductId?: string | number | null;
  linkUrl?: string | null;
};

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
    arrows: false,
  };

  // Extract all active banners from active offers.
  // A banner only qualifies if it carries real uploaded media — offers without
  // usable banner media contribute nothing rather than a synthetic slide.
  const slides: HeroSlide[] = [];
  if (Array.isArray(activeOffers) && activeOffers.length > 0) {
    activeOffers.forEach((offer: any) => {
      if (!Array.isArray(offer.banners)) return;
      offer.banners.forEach((banner: any) => {
        if (!banner.media?.url) return;

        const title =
          typeof banner.headline === "string" && banner.headline.trim()
            ? banner.headline.trim()
            : null;
        const description =
          typeof banner.subtext === "string" && banner.subtext.trim()
            ? banner.subtext.trim()
            : null;
        const code =
          typeof offer.code === "string" && offer.code.trim()
            ? offer.code.trim()
            : null;

        slides.push({
          image: banner.media.url,
          alt: banner.altText || title || offer.title || "Promotional banner",
          code,
          title,
          description,
          hasTextOverlay: Boolean(title || description),
          linkType: banner.linkType,
          linkCategoryId: banner.linkCategoryId,
          linkProductId: banner.linkProductId,
          linkUrl: banner.linkUrl,
        });
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

  const handleSlideClick = (slide: HeroSlide) => {
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
    router.push("/menu");
  };

  return (
    <Box
      sx={{
        width: "100%",
        aspectRatio: HERO_ASPECT_RATIO,
        maxHeight: HERO_MAX_HEIGHT,
        position: "relative",
        // Soften default slick dots so they don't fight designed banner art.
        "& .slick-dots": {
          bottom: { xs: 10, md: 14 },
          zIndex: 2,
        },
        "& .slick-dots li button:before": {
          fontSize: 9,
          color: "#fff",
          opacity: 0.45,
          textShadow: "0 1px 3px rgba(0,0,0,0.45)",
        },
        "& .slick-dots li.slick-active button:before": {
          opacity: 0.95,
          color: "#fff",
        },
      }}
      id="home"
    >
      <Slider {...settings}>
        {slides.map((item, index) => (
          <Box
            key={index}
            role="link"
            tabIndex={0}
            onClick={() => handleSlideClick(item)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSlideClick(item);
              }
            }}
            sx={{
              width: "100%",
              aspectRatio: HERO_ASPECT_RATIO,
              maxHeight: HERO_MAX_HEIGHT,
              position: "relative",
              overflow: "hidden",
              display: "flex !important",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
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
              Image-first: light bottom fade only so CTA + dots stay legible.
              Text-overlay: stronger bottom scrim (~35%) — never a full-bleed wash.
            */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: item.hasTextOverlay
                  ? "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 28%, rgba(0,0,0,0.08) 45%, transparent 62%)"
                  : "linear-gradient(to top, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.08) 22%, transparent 40%)",
              }}
            />

            <Box
              sx={{
                position: "absolute",
                bottom: { xs: "10%", md: "14%" },
                left: "50%",
                transform: "translateX(-50%)",
                width: { xs: "90%", md: "60%" },
                maxWidth: 720,
                textAlign: "center",
                color: "white",
                zIndex: 1,
              }}
            >
              {item.code && (
                <Chip
                  icon={<LocalOfferIcon sx={{ color: "#FFF !important", fontSize: "0.9rem" }} />}
                  label={`Code: ${item.code}`}
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: "white",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    mb: item.hasTextOverlay ? 1.5 : 2,
                    px: 1,
                    py: 0.5,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  }}
                />
              )}

              {item.title && (
                <Typography
                  variant="h2"
                  sx={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: { xs: "1.6rem", sm: "2.1rem", md: "2.75rem" },
                    lineHeight: 1.15,
                    mb: item.description ? 1 : 2,
                    textShadow: "0 2px 12px rgba(0,0,0,0.55)",
                  }}
                >
                  {item.title}
                </Typography>
              )}

              {item.description && (
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: "0.9rem", md: "1.05rem" },
                    opacity: 0.96,
                    maxWidth: 640,
                    mx: "auto",
                    mb: 2.5,
                    display: { xs: "none", sm: "block" },
                    textShadow: "0 1px 6px rgba(0,0,0,0.55)",
                  }}
                >
                  {item.description}
                </Typography>
              )}

              <Button
                variant="contained"
                size="large"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSlideClick(item);
                }}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.25,
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark ?? theme.palette.primary.main})`,
                  boxShadow: "0 4px 18px rgba(0,0,0,0.28)",
                  "&:hover": { transform: "translateY(-2px)" },
                  transition: "all 0.2s ease",
                }}
              >
                Explore Offer
              </Button>
            </Box>
          </Box>
        ))}
      </Slider>
    </Box>
  );
}
