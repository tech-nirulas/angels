"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";

interface SectionLabelProps {
  label: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  light?: boolean;
}

export default function SectionLabel({
  label,
  title,
  subtitle,
  center = true,
  light = false,
}: SectionLabelProps) {
  const theme = useTheme();

  return (
    <Box sx={{ textAlign: center ? "center" : "left", mb: { xs: 5, md: 8 } }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            color: theme.palette.primary.main,
            mb: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            justifyContent: center ? "center" : "flex-start",
            "&::before, &::after": {
              content: '""',
              display: "block",
              height: "1px",
              width: 32,
              background: theme.palette.primary.main,
              opacity: 0.6,
            },
          }}
        >
          {label}
        </Typography>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        <Typography
          variant="h2"
          sx={{
            color: light ? "white" : theme.palette.text.primary,
            mb: subtitle ? 2.5 : 0,
            fontSize: { xs: "2rem", md: "2.8rem", lg: "3.4rem" },
          }}
        >
          {title}
        </Typography>
      </motion.div>

      {subtitle && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <Typography
            variant="body1"
            sx={{
              color: light
                ? "rgba(255,248,240,0.75)"
                : theme.palette.text.secondary,
              maxWidth: 560,
              mx: center ? "auto" : 0,
              lineHeight: 1.8,
            }}
          >
            {subtitle}
          </Typography>
        </motion.div>
      )}
    </Box>
  );
}