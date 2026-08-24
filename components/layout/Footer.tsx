"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import Image from "next/image";
import Link from "next/link";

// Angels in My Kitchen Foods Pvt Ltd — verified against the legal entity record
// (GET /legal-entity) rather than invented. Keep in sync if the registered
// office ever changes.
const CONTACT = {
  address: "E-42, Defence Colony, Main Market, New Delhi 110024",
  email: "contact@angelsinmykitchen.com",
  phone: "+91 11 4165 5000",
  phoneHref: "tel:+911141655000",
  whatsappNumber: "919478370346", // same number used on the /customize form
};

// Every link here is a real route on this site — no placeholder pages.
const FOOTER_LINKS = {
  Shop: [
    { label: "Home", href: "/" },
    { label: "Menu", href: "/menu" },
    { label: "Cakes", href: "/cakes" },
    { label: "Customize a Cake", href: "/customize" },
  ],
  "My Account": [
    { label: "My Orders", href: "/orders" },
    { label: "My Addresses", href: "/addresses" },
    { label: "My Profile", href: "/profile" },
    { label: "Cart", href: "/cart" },
  ],
};

export default function Footer() {
  const theme = useTheme();
  const whatsappHref = `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(
    "Hello Angels in My Kitchen team, I have a question!"
  )}`;

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
          <Grid size={{ xs: 12, md: 4 }}>
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
                <IconButton
                  aria-label="Instagram"
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
                  <InstagramIcon fontSize="small" />
                </IconButton>
                <IconButton
                  aria-label="Facebook"
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
                  <FacebookIcon fontSize="small" />
                </IconButton>
                <IconButton
                  aria-label="Chat on WhatsApp"
                  component="a"
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: `${theme.palette.primary.contrastText}60`,
                    border: `1px solid rgba(200,149,108,0.2)`,
                    borderRadius: 2,
                    "&:hover": {
                      color: "#25D366",
                      borderColor: "#25D366",
                      background: "#25D36615",
                    },
                    transition: "all 0.25s",
                  }}
                >
                  <WhatsAppIcon fontSize="small" />
                </IconButton>
              </Box>
            </motion.div>
          </Grid>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links], colIdx) => (
            <Grid size={{ xs: 6, md: 2 }} key={heading}>
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
                      key={link.label}
                      component={Link}
                      href={link.href}
                      variant="body2"
                      sx={{
                        color: `${theme.palette.primary.contrastText}60`,
                        textDecoration: "none",
                        transition: "color 0.2s",
                        "&:hover": { color: theme.palette.primary.light },
                      }}
                    >
                      {link.label}
                    </Typography>
                  ))}
                </Box>
              </motion.div>
            </Grid>
          ))}

          {/* Get in touch */}
          <Grid size={{ xs: 12, md: 4 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Typography
                variant="subtitle1"
                sx={{ color: theme.palette.primary.main, mb: 2.5 }}
              >
                Get in Touch
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
                <Box sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
                  <LocationOnOutlinedIcon
                    fontSize="small"
                    sx={{ color: `${theme.palette.primary.contrastText}50`, mt: 0.2 }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: `${theme.palette.primary.contrastText}70`, lineHeight: 1.7 }}
                  >
                    {CONTACT.address}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1.25, alignItems: "center" }}>
                  <EmailOutlinedIcon
                    fontSize="small"
                    sx={{ color: `${theme.palette.primary.contrastText}50` }}
                  />
                  <Typography
                    component="a"
                    href={`mailto:${CONTACT.email}`}
                    variant="body2"
                    sx={{
                      color: `${theme.palette.primary.contrastText}70`,
                      textDecoration: "none",
                      "&:hover": { color: theme.palette.primary.light },
                    }}
                  >
                    {CONTACT.email}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1.25, alignItems: "center" }}>
                  <CallOutlinedIcon
                    fontSize="small"
                    sx={{ color: `${theme.palette.primary.contrastText}50` }}
                  />
                  <Typography
                    component="a"
                    href={CONTACT.phoneHref}
                    variant="body2"
                    sx={{
                      color: `${theme.palette.primary.contrastText}70`,
                      textDecoration: "none",
                      "&:hover": { color: theme.palette.primary.light },
                    }}
                  >
                    {CONTACT.phone}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1.25, alignItems: "center" }}>
                  <WhatsAppIcon fontSize="small" sx={{ color: "#25D366" }} />
                  <Typography
                    component="a"
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body2"
                    sx={{
                      color: `${theme.palette.primary.contrastText}70`,
                      textDecoration: "none",
                      "&:hover": { color: "#25D366" },
                    }}
                  >
                    Chat with us on WhatsApp
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>

        <Divider sx={{ my: 6, borderColor: "rgba(200,149,108,0.15)" }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: `${theme.palette.primary.contrastText}35` }}
          >
            © {new Date().getFullYear()} Angels in My Kitchen. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
