"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import BrushOutlinedIcon from "@mui/icons-material/BrushOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import SectionLabel from "@/components/ui/SectionLabel";

// Official WhatsApp contact number, same one used on the /customize form.
const WHATSAPP_NUMBER = "919478370346";

const INFO_ITEMS = [
  {
    icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 26, color: "#D97706" }} />,
    bg: "rgba(217, 119, 6, 0.08)",
    border: "rgba(217, 119, 6, 0.2)",
    title: "Advance Booking",
    text: "Custom cakes need at least 48 hours notice. Tiered wedding cakes need 1–2 weeks.",
  },
  {
    icon: <BrushOutlinedIcon sx={{ fontSize: 26, color: "#9333EA" }} />,
    bg: "rgba(147, 51, 234, 0.08)",
    border: "rgba(147, 51, 234, 0.2)",
    title: "Share Your Vision",
    text: "Reference photos, flavour picks, theme, guest count — our master bakers take it from there.",
  },
  {
    icon: <LocalShippingOutlinedIcon sx={{ fontSize: 26, color: "#059669" }} />,
    bg: "rgba(5, 150, 105, 0.08)",
    border: "rgba(5, 150, 105, 0.2)",
    title: "Delivery & Pickup",
    text: "We deliver across Delhi NCR, or you can pick up from your nearby outlet.",
  },
];

const PERKS = [
  "Direct WhatsApp Discussion",
  "Custom Tiered & Theme Cakes",
  "Eggless & Gourmet Options",
];

export default function OrderSection() {
  const theme = useTheme();
  const router = useRouter();

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello Angels in My Kitchen team, I would like to discuss a custom cake order!"
  )}`;

  return (
    <Box
      id="order"
      component="section"
      sx={{
        py: { xs: 10, md: 16 },
        background: `radial-gradient(ellipse at 80% 20%, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 60%), linear-gradient(175deg, #FBF8F5 0%, #F5EDE4 100%)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative ambient blur spheres */}
      <Box
        sx={{
          position: "absolute",
          right: { xs: -120, md: -60 },
          top: "15%",
          width: { xs: 300, md: 500 },
          height: { xs: 300, md: 500 },
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.12)} 0%, transparent 70%)`,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          left: { xs: -100, md: -80 },
          bottom: "10%",
          width: { xs: 260, md: 420 },
          height: { xs: 260, md: 420 },
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%)`,
          filter: "blur(45px)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={{ xs: 5, md: 8 }} sx={{ alignItems: "center" }}>
          {/* Left: Section details and feature cards */}
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionLabel
              label="Bespoke Confections"
              title="Let's Create Something Unforgettable"
              subtitle="Every custom cake begins with a conversation. Tell us your vision, share inspiration photos, or chat directly with our chef bakers."
              center={false}
            />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.2 }}>
              {INFO_ITEMS.map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -25 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.12 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2.5,
                      p: 2.5,
                      borderRadius: 3.5,
                      background: "rgba(255, 255, 255, 0.85)",
                      backdropFilter: "blur(12px)",
                      border: `1px solid ${alpha("#E6D7CC", 0.8)}`,
                      boxShadow: "0 4px 20px rgba(74, 59, 50, 0.04)",
                      alignItems: "flex-start",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateX(6px)",
                        boxShadow: "0 8px 30px rgba(74, 59, 50, 0.08)",
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.25,
                        borderRadius: 2.5,
                        bgcolor: item.bg,
                        border: `1px solid ${item.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        mt: 0.2,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          mb: 0.4,
                          color: "#2B1810",
                          fontFamily: "var(--font-display)",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#665348", lineHeight: 1.65, fontSize: "0.93rem" }}
                      >
                        {item.text}
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Grid>

          {/* Right: Premium CTA Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <Box
                sx={{
                  p: { xs: 3.5, sm: 5 },
                  borderRadius: 4.5,
                  textAlign: "center",
                  background: "linear-gradient(145deg, #FFFFFF 0%, #FAF6F1 100%)",
                  boxShadow: "0 20px 50px rgba(74, 59, 50, 0.09)",
                  border: `1.5px solid ${alpha(theme.palette.primary.main, 0.16)}`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Subtle top shimmer banner */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 5,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, #F59E0B, #25D366)`,
                  }}
                />

                <Chip
                  icon={<AutoAwesomeOutlinedIcon sx={{ fontSize: 16, color: "#D97706 !important" }} />}
                  label="Fast & Personalized"
                  size="small"
                  sx={{
                    mb: 2.5,
                    bgcolor: "rgba(217, 119, 6, 0.1)",
                    color: "#B45309",
                    fontWeight: 700,
                    borderRadius: 2,
                  }}
                />

                <Box
                  sx={{
                    width: 76,
                    height: 76,
                    borderRadius: "50%",
                    mx: "auto",
                    mb: 2.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, #9A3412)`,
                    boxShadow: `0 10px 28px ${alpha(theme.palette.primary.main, 0.35)}`,
                  }}
                >
                  <CakeOutlinedIcon sx={{ fontSize: 38, color: "#fff" }} />
                </Box>

                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: { xs: "1.65rem", sm: "2rem" },
                    color: "#2B1810",
                    mb: 1.2,
                  }}
                >
                  Design Your Dream Cake
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#665348",
                    mb: 3,
                    maxWidth: 440,
                    mx: "auto",
                    lineHeight: 1.75,
                    fontSize: "0.95rem",
                  }}
                >
                  Connect directly on WhatsApp with our team to share reference photos and flavor ideas, or fill out our detailed custom order form.
                </Typography>

                {/* Perk Pills */}
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: 1,
                    mb: 3.5,
                  }}
                >
                  {PERKS.map((perk) => (
                    <Box
                      key={perk}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.6,
                        px: 1.4,
                        py: 0.5,
                        borderRadius: 2,
                        bgcolor: "rgba(0, 0, 0, 0.03)",
                        border: "1px solid rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      <CheckCircleOutlinedIcon sx={{ fontSize: 15, color: "#059669" }} />
                      <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#4A3B32" }}>
                        {perk}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Action Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 1.5,
                    justifyContent: "center",
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<WhatsAppIcon />}
                    onClick={() => window.open(whatsappUrl, "_blank")}
                    sx={{
                      py: 1.5,
                      px: 3.5,
                      bgcolor: "#25D366",
                      color: "#FFFFFF",
                      fontWeight: 800,
                      boxShadow: "0 6px 20px rgba(37, 211, 102, 0.35)",
                      "&:hover": {
                        bgcolor: "#1EBE57",
                        boxShadow: "0 8px 24px rgba(37, 211, 102, 0.45)",
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    Chat on WhatsApp
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => router.push("/customize")}
                    sx={{
                      py: 1.5,
                      px: 3,
                      borderColor: alpha(theme.palette.primary.main, 0.4),
                      color: theme.palette.primary.main,
                      fontWeight: 700,
                      "&:hover": {
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    Custom Form
                  </Button>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

