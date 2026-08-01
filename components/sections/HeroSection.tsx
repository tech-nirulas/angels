"use client";

import { useGetActiveOffersQuery } from "@/features/offer/offerApiService";
import { Box, Button, Chip, Typography, useTheme } from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { useRouter } from "next/navigation";
import Slider, { Settings } from "react-slick";

export default function HeroSection() {
  const theme = useTheme();
  const router = useRouter();

  const { data: activeOffersResponse } = useGetActiveOffersQuery();
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

  const defaultSlides = [
    {
      image: "/assets/hero_section/Big boy.jpg",
      badge: "⭐ Bestseller",
      title: "Handcrafted Belgian Truffle & Gourmet Cakes",
      description: "Baked fresh every morning using 100% real butter, Belgian couverture chocolate, and fresh cream.",
      code: "ANGELS10",
      actionUrl: "/menu",
    },
    {
      image: "/assets/hero_section/Jus Chkn.jpg",
      badge: "🥐 Fresh Baked Daily",
      title: "Artisanal Breads & Savory Bakery Delights",
      description: "Golden flaky French butter croissants, smoky paneer puffs, and wholesome sourdough rolls.",
      code: "WELCOME50",
      actionUrl: "/menu",
    },
  ];

  // Extract all active banners from active offers
  const dynamicBannerSlides: any[] = [];
  if (Array.isArray(activeOffers) && activeOffers.length > 0) {
    activeOffers.forEach((offer: any) => {
      if (Array.isArray(offer.banners) && offer.banners.length > 0) {
        offer.banners.forEach((banner: any) => {
          if (banner.media?.url) {
            dynamicBannerSlides.push({
              image: banner.media.url,
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
      } else {
        // Fallback for offers without uploaded banner media
        dynamicBannerSlides.push({
          image: defaultSlides[dynamicBannerSlides.length % defaultSlides.length].image,
          badge: offer.code ? `🎟️ Code: ${offer.code}` : "🔥 Special Campaign",
          title: offer.title,
          description: offer.description || "Limited time promotional offer on your favorite bakery items.",
          code: offer.code,
          actionUrl: "/menu",
        });
      }
    });
  }

  const slides = dynamicBannerSlides.length > 0 ? dynamicBannerSlides : defaultSlides;

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
    <Box sx={{ width: "100%", height: { xs: "65vh", md: "75vh" }, position: "relative" }} id="home">
      <Slider {...settings}>
        {slides.map((item: any, index: number) => (
          <Box
            key={index}
            sx={{
              width: "100%",
              height: { xs: "65vh", md: "75vh" },
              backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.4) 100%), url('${item.image}')`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              position: "relative",
              display: "flex !important",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
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