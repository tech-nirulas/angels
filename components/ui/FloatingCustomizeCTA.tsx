"use client";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Pages where the floating CTA must not appear */
const EXCLUDED_PREFIXES = ["/customize", "/login", "/register", "/forgot-password", "/reset-password", "/verify-otp"];

export default function FloatingCustomizeCTA() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isExcluded = EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (isExcluded || dismissed) return;

    const handleScroll = () => {
      const scrollThreshold = window.innerHeight * 0.4;
      setVisible(window.scrollY > scrollThreshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dismissed, isExcluded]);

  if (isExcluded || dismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <Box
          component={motion.div}
          /**
           * Framer Motion `style` prop is used for the x translation so it
           * composes correctly with the animated `y` value. Using CSS
           * `transform: translateX(-50%)` in sx would conflict with Framer
           * Motion's own transform pipeline, causing off-center rendering.
           */
          style={{
            position: "fixed",
            bottom: 32,
            left: "50%",
            x: "-50%",
            zIndex: 1300,
            width: "auto",
            maxWidth: "92vw",
          }}
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.5, sm: 2 },
              px: { xs: 2, sm: 3 },
              py: 1.25,
              borderRadius: "50px",
              background: "linear-gradient(135deg, #2D1527 0%, #4A1525 50%, #1A0B1A 100%)",
              border: `1.5px solid ${theme.palette.primary.main}60`,
              boxShadow: `0 12px 32px rgba(233, 30, 99, 0.3), 0 4px 12px rgba(0, 0, 0, 0.4)`,
              backdropFilter: "blur(12px)",
              color: "#FFFFFF",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #FF6B8A 0%, #E91E63 100%)",
                boxShadow: "0 0 12px rgba(255, 107, 138, 0.6)",
                flexShrink: 0,
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 20, color: "#FFFFFF" }} />
            </Box>

            <Box sx={{ flex: 1, display: { xs: "none", sm: "block" } }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  letterSpacing: "0.01em",
                  color: "#FFFFFF",
                }}
              >
                Can&apos;t find your dream cake?
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255, 255, 255, 0.75)",
                  fontSize: "0.72rem",
                  display: "block",
                }}
              >
                Design it custom with our bakers ✨
              </Typography>
            </Box>

            <Button
              variant="contained"
              onClick={() => router.push("/customize")}
              sx={{
                borderRadius: "30px",
                px: { xs: 2, sm: 2.5 },
                py: 0.75,
                fontSize: "0.78rem",
                fontWeight: 700,
                textTransform: "none",
                whiteSpace: "nowrap",
                background: "linear-gradient(135deg, #FF6B8A 0%, #E91E63 100%)",
                boxShadow: "0 4px 14px rgba(233, 30, 99, 0.4)",
                "&:hover": {
                  background: "linear-gradient(135deg, #E91E63 0%, #C2185B 100%)",
                  boxShadow: "0 6px 18px rgba(233, 30, 99, 0.6)",
                  transform: "scale(1.02)",
                },
                transition: "all 0.2s ease",
              }}
            >
              Customize Now →
            </Button>

            <IconButton
              size="small"
              onClick={() => setDismissed(true)}
              sx={{
                color: "rgba(255, 255, 255, 0.5)",
                p: 0.5,
                "&:hover": {
                  color: "#FFFFFF",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>
      )}
    </AnimatePresence>
  );
}
