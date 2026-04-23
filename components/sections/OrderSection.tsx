"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";

const CAKE_TYPES = [
  "Wedding Cake",
  "Birthday Cake",
  "Anniversary Cake",
  "Corporate Event",
  "Custom Design",
  "Other",
];

export default function OrderSection() {
  const theme = useTheme();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
        <Grid container spacing={{ xs: 6, md: 10 }} alignItems="flex-start">
          {/* Left: Info */}
          <Grid item xs={12} md={5}>
            <SectionLabel
              label="Place Your Order"
              title="Let's Create Something Unforgettable"
              subtitle="Every custom cake begins with a conversation. Tell us your vision — we'll handle the rest."
              center={false}
            />

            {/* Info boxes */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                {
                  icon: "📅",
                  title: "Advance Booking",
                  text: "Custom cakes require 2–3 weeks notice. Wedding cakes 3–6 months.",
                },
                {
                  icon: "🎨",
                  title: "Design Consultation",
                  text: "Complimentary 30-minute tasting and design session for orders over €200.",
                },
                {
                  icon: "🚚",
                  title: "Delivery",
                  text: "We deliver across Paris and Île-de-France. White-glove setup available.",
                },
              ].map((item) => (
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

          {/* Right: Form */}
          <Grid item xs={12} md={7}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  p: { xs: 3, md: 5 },
                  borderRadius: 4,
                  background: theme.palette.background.paper,
                  boxShadow: "var(--shadow-medium)",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ fontFamily: "var(--font-display)", mb: 0.5 }}
                >
                  Enquire About a Custom Cake
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary, mb: 4 }}
                >
                  We respond within 24 hours on business days.
                </Typography>

                {submitted ? (
                  <Alert
                    severity="success"
                    sx={{
                      borderRadius: 2,
                      background: `${theme.palette.accent?.sage ?? "#8BAF85"}20`,
                      color: theme.palette.text.primary,
                      "& .MuiAlert-icon": { color: theme.palette.accent?.sage ?? "#8BAF85" },
                    }}
                  >
                    Thank you! We've received your enquiry and will be in touch shortly.
                  </Alert>
                ) : (
                  <Grid container spacing={2.5}>
                    {[
                      { label: "First Name", name: "firstName", xs: 6 },
                      { label: "Last Name", name: "lastName", xs: 6 },
                      { label: "Email Address", name: "email", xs: 12, type: "email" },
                      { label: "Phone", name: "phone", xs: 12, type: "tel" },
                    ].map((f) => (
                      <Grid item xs={f.xs} key={f.name}>
                        <TextField
                          label={f.label}
                          name={f.name}
                          type={f.type || "text"}
                          fullWidth
                          size="small"
                          required
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>
                    ))}

                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        label="Occasion"
                        defaultValue=""
                        fullWidth
                        size="small"
                        required
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      >
                        {CAKE_TYPES.map((t) => (
                          <MenuItem key={t} value={t}>
                            {t}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Date of Event"
                        type="date"
                        fullWidth
                        size="small"
                        required
                        InputLabelProps={{ shrink: true }}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Tell us about your vision"
                        multiline
                        rows={4}
                        fullWidth
                        placeholder="Flavour preferences, design ideas, theme, number of guests..."
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        sx={{ py: 1.5 }}
                      >
                        Send Enquiry
                      </Button>
                    </Grid>
                  </Grid>
                )}
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}