"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import SectionLabel from "@/components/ui/SectionLabel";

// Official WhatsApp contact number, same one used on the /customize form.
const WHATSAPP_NUMBER = "919478370346";

const INFO_ITEMS = [
  {
    icon: "📅",
    title: "Advance Booking",
    text: "Custom cakes need at least 48 hours notice. Tiered wedding cakes need 1–2 weeks.",
  },
  {
    icon: "🎨",
    title: "Share Your Vision",
    text: "Reference photos, flavour picks, theme, guest count — our bakers take it from there.",
  },
  {
    icon: "🚚",
    title: "Delivery & Pickup",
    text: "We deliver across Delhi NCR, or you can pick up from our Defence Colony outlet.",
  },
];

/**
 * A compact teaser for the homepage, not a second form. The full custom-cake
 * request flow (image uploads, delivery address, WhatsApp handoff) already
 * lives at /customize — this section's only job is to point people there.
 */
export default function OrderSection() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Box
      id="order"
      component="section"
      sx={{
        py: { xs: 10, md: 16 },
        background: `linear-gradient(160deg, #F5EDE0 0%, ${theme.palette.background.default} 100%)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circle */}
      <Box
        sx={{
          position: "absolute",
          right: -200,
          top: "50%",
          transform: "translateY(-50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          border: `1px solid ${theme.palette.primary.light}25`,
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 6, md: 10 }} component="div" sx={{ alignItems: "center" }}>
          {/* Left: Info */}
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionLabel
              label="Custom Cakes"
              title="Let's Create Something Unforgettable"
              subtitle="Every custom cake begins with a conversation. Tell us your vision — we'll handle the rest."
              center={false}
            />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {INFO_ITEMS.map((item) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      p: 2.5,
                      borderRadius: 3,
                      background: theme.palette.background.paper,
                      boxShadow: "var(--shadow-soft)",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography sx={{ fontSize: "1.5rem", lineHeight: 1, mt: 0.2 }}>
                      {item.icon}
                    </Typography>
                    <Box>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, mb: 0.4, color: theme.palette.text.primary }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary, lineHeight: 1.7 }}
                      >
                        {item.text}
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Grid>

          {/* Right: CTA — the one real custom-cake form lives at /customize */}
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <Box
                sx={{
                  p: { xs: 4, md: 5 },
                  borderRadius: 4,
                  textAlign: "center",
                  background: theme.palette.background.paper,
                  boxShadow: "var(--shadow-medium)",
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                }}
              >
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    mx: "auto",
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark ?? theme.palette.primary.main})`,
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.35)}`,
                  }}
                >
                  <CakeOutlinedIcon sx={{ fontSize: 34, color: "#fff" }} />
                </Box>

                <Typography
                  variant="h5"
                  sx={{ fontFamily: "var(--font-display)", mb: 1.5 }}
                >
                  Design Your Dream Cake
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary, mb: 4, maxWidth: 420, mx: "auto", lineHeight: 1.8 }}
                >
                  From tiered wedding cakes to birthday surprises — upload your inspiration,
                  pick your flavours, and our bakers will bring it to life.
                </Typography>

                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5, justifyContent: "center" }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => router.push("/customize")}
                    sx={{ py: 1.5, px: 4 }}
                  >
                    Start Customizing
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<WhatsAppIcon />}
                    onClick={() =>
                      window.open(
                        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                          "Hello Angels in My Kitchen team, I would like to discuss a custom cake!"
                        )}`,
                        "_blank"
                      )
                    }
                    sx={{
                      py: 1.5,
                      px: 3,
                      borderColor: "#25D366",
                      color: "#1F9E52",
                      "&:hover": { borderColor: "#1F9E52", background: "#25D36612" },
                    }}
                  >
                    Chat on WhatsApp
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
