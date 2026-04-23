"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import PinterestIcon from "@mui/icons-material/Pinterest";
import Image from "next/image";

const FOOTER_LINKS = {
  Bakery: ["Our Story", "Menu", "Seasonal Specials", "Gift Cards"],
  "Custom Orders": ["Wedding Cakes", "Birthday Cakes", "Corporate Events", "Classes"],
  Visit: ["Hours & Location", "Catering", "Wholesale", "Careers"],
};

export default function Footer() {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        background: `linear-gradient(170deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`,
        color: theme.palette.primary.contrastText,
        pt: { xs: 8, md: 12 },
        pb: 4,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.accent?.gold ?? "#d4af6a"}, ${theme.palette.primary.main})`,
        },
      }}
    >
      {/* Decorative circles */}
      <Box
        sx={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          border: `1px solid rgba(200,149,108,0.1)`,
          top: -200,
          right: -100,
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          border: `1px solid rgba(200,149,108,0.08)`,
          bottom: -100,
          left: -80,
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <Grid container spacing={{ xs: 5, md: 8 }}>
          {/* Brand column */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ position: "relative", mb: 2, width: 240, height: 46 }}>
                <Image
                  src="/assets/logo/aimk_header_logo.png"
                  alt="Angels in my Kitchen Logo"
                  fill
                  sizes="240px"
                  style={{ objectFit: "contain" }}
                  loading="eager"
                />
              </Box>
              <Typography
                variant="body2"
                sx={{ color: `${theme.palette.primary.contrastText}70`, lineHeight: 1.9, mb: 4 }}
              >
                Every cake tells a story. We craft moments of joy with the finest
                ingredients, time-honoured recipes, and a generous helping of passion.
              </Typography>

              {/* Social icons */}
              <Box sx={{ display: "flex", gap: 1 }}>
                {[InstagramIcon, FacebookIcon, PinterestIcon].map((Icon, i) => (
                  <IconButton
                    key={i}
                    sx={{
                      color: `${theme.palette.primary.contrastText}60`,
                      border: `1px solid rgba(200,149,108,0.2)`,
                      borderRadius: 2,
                      "&:hover": {
                        color: theme.palette.primary.main,
                        borderColor: theme.palette.primary.main,
                        background: `${theme.palette.primary.main}15`,
                      },
                      transition: "all 0.25s",
                    }}
                  >
                    <Icon fontSize="small" />
                  </IconButton>
                ))}
              </Box>
            </motion.div>
          </Grid>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links], colIdx) => (
            <Grid item xs={6} md={2} key={heading}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 * (colIdx + 1) }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ color: theme.palette.primary.main, mb: 2.5 }}
                >
                  {heading}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                  {links.map((link) => (
                    <Typography
                      key={link}
                      component="a"
                      href="#"
                      variant="body2"
                      sx={{
                        color: `${theme.palette.primary.contrastText}60`,
                        textDecoration: "none",
                        transition: "color 0.2s",
                        "&:hover": { color: theme.palette.primary.light },
                      }}
                    >
                      {link}
                    </Typography>
                  ))}
                </Box>
              </motion.div>
            </Grid>
          ))}

          {/* Newsletter */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Typography
                variant="subtitle1"
                sx={{ color: theme.palette.primary.main, mb: 1 }}
              >
                Stay Sweet
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: `${theme.palette.primary.contrastText}60`, mb: 3, lineHeight: 1.8 }}
              >
                Get seasonal menus, new arrivals, and exclusive recipes delivered to your inbox.
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  placeholder="your@email.com"
                  size="small"
                  sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": {
                      background: "rgba(255,248,240,0.06)",
                      borderRadius: 1,
                      "& fieldset": { borderColor: "rgba(200,149,108,0.25)" },
                      "&:hover fieldset": { borderColor: theme.palette.primary.main },
                      "& input": {
                        color: theme.palette.primary.contrastText,
                        "&::placeholder": { color: "rgba(255,248,240,0.35)" },
                      },
                    },
                  }}
                />
                <Button variant="contained" size="small" sx={{ px: 2.5, whiteSpace: "nowrap" }}>
                  Join
                </Button>
              </Box>

              {/* Contact */}
              <Box sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 1 }}>
                {["12 Rue du Pain, Paris 75004", "hello@lafarine.com", "+33 1 42 77 88 99"].map(
                  (info) => (
                    <Typography
                      key={info}
                      variant="body2"
                      sx={{ color: `${theme.palette.primary.contrastText}55` }}
                    >
                      {info}
                    </Typography>
                  )
                )}
              </Box>
            </motion.div>
          </Grid>
        </Grid>

        <Divider sx={{ my: 6, borderColor: "rgba(200,149,108,0.15)" }} />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: `${theme.palette.primary.contrastText}35` }}
          >
            © {new Date().getFullYear()} La Farine. All rights reserved.
          </Typography>
          <Box sx={{ display: "flex", gap: 3 }}>
            {["Privacy Policy", "Terms of Use", "Cookie Settings"].map((item) => (
              <Typography
                key={item}
                component="a"
                href="#"
                variant="body2"
                sx={{
                  color: `${theme.palette.primary.contrastText}35`,
                  textDecoration: "none",
                  "&:hover": { color: theme.palette.primary.main },
                  transition: "color 0.2s",
                }}
              >
                {item}
              </Typography>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}