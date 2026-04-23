"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import { useTheme } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import SectionLabel from "@/components/ui/SectionLabel";

const TESTIMONIALS = [
  {
    text: "La Farine created our four-tier wedding cake and it was absolutely breathtaking. Every guest was in awe — and it tasted even better than it looked. A true work of art.",
    name: "Sophie & Julien M.",
    role: "Wedding, June 2024",
    initials: "SJ",
    rating: 5,
  },
  {
    text: "I've been ordering my birthday cake from La Farine for fifteen years. They know my tastes better than I do. The lemon drizzle with elderflower is unmatched anywhere in Paris.",
    name: "Camille Fontaine",
    role: "Regular Customer",
    initials: "CF",
    rating: 5,
  },
  {
    text: "We ordered 200 individual pastry boxes for our company gala. Every single one was immaculate. Our guests were still talking about the croissants weeks later.",
    name: "Antoine Barre",
    role: "Events Manager, Hôtel Bristol",
    initials: "AB",
    rating: 5,
  },
  {
    text: "The pâtisserie class was the highlight of my Paris trip. Chef Marie is patient, funny, and incredibly talented. I went home with skills I actually use every week.",
    name: "Charlotte H.",
    role: "Pâtisserie Class Guest",
    initials: "CH",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const theme = useTheme();
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(1);

  const navigate = (dir: 1 | -1) => {
    setDirection(dir);
    setIdx((prev) => (prev + dir + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const t = TESTIMONIALS[idx];

  return (
    <Box
      id="testimonials"
      component="section"
      sx={{
        py: { xs: 10, md: 16 },
        background: theme.palette.background.default,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle bg pattern */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 40px,
            ${theme.palette.primary.light}08 40px,
            ${theme.palette.primary.light}08 41px
          )`,
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="md" sx={{ position: "relative" }}>
        <SectionLabel
          label="Guest Stories"
          title="What Our Guests Say"
        />

        <Box
          sx={{
            position: "relative",
            textAlign: "center",
            minHeight: 340,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={idx}
              custom={direction}
              variants={{
                enter: (dir: number) => ({
                  x: dir > 0 ? 120 : -120,
                  opacity: 0,
                }),
                center: { x: 0, opacity: 1 },
                exit: (dir: number) => ({
                  x: dir > 0 ? -120 : 120,
                  opacity: 0,
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: "100%" }}
            >
              {/* Quote icon */}
              <FormatQuoteIcon
                sx={{
                  fontSize: 56,
                  color: theme.palette.primary.main,
                  opacity: 0.35,
                  mb: 1,
                  transform: "scaleX(-1)",
                }}
              />

              <Typography
                variant="h5"
                sx={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontWeight: 300,
                  lineHeight: 1.75,
                  color: theme.palette.text.primary,
                  fontSize: { xs: "1.1rem", md: "1.35rem" },
                  maxWidth: 680,
                  mx: "auto",
                  mb: 5,
                }}
              >
                "{t.text}"
              </Typography>

              <Avatar
                sx={{
                  width: 52,
                  height: 52,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  fontFamily: "var(--font-display)",
                  fontSize: "1rem",
                  fontWeight: 600,
                  mx: "auto",
                  mb: 1.5,
                  boxShadow: "var(--shadow-soft)",
                }}
              >
                {t.initials}
              </Avatar>

              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 0.3 }}
              >
                {t.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, fontSize: "0.8rem" }}
              >
                {t.role}
              </Typography>

              {/* Stars */}
              <Box sx={{ mt: 1.5 }}>
                {"★".repeat(t.rating).split("").map((s, i) => (
                  <Box
                    key={i}
                    component="span"
                    sx={{ color: theme.palette.accent?.gold ?? "#d4af6a", fontSize: "1rem" }}
                  >
                    ★
                  </Box>
                ))}
              </Box>
            </motion.div>
          </AnimatePresence>
        </Box>

        {/* Navigation */}
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, mt: 4 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              border: `1px solid ${theme.palette.primary.light}60`,
              borderRadius: 2,
              "&:hover": { background: `${theme.palette.primary.main}12`, borderColor: theme.palette.primary.main },
            }}
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>

          <Box sx={{ display: "flex", gap: 1 }}>
            {TESTIMONIALS.map((_, i) => (
              <Box
                key={i}
                onClick={() => { setDirection(i > idx ? 1 : -1); setIdx(i); }}
                sx={{
                  width: i === idx ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === idx ? theme.palette.primary.main : `${theme.palette.primary.main}30`,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </Box>

          <IconButton
            onClick={() => navigate(1)}
            sx={{
              border: `1px solid ${theme.palette.primary.light}60`,
              borderRadius: 2,
              "&:hover": { background: `${theme.palette.primary.main}12`, borderColor: theme.palette.primary.main },
            }}
          >
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
}