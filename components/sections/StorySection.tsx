"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import SectionLabel from "@/components/ui/SectionLabel";
import { useScrollFadeIn } from "@/hooks/useGsapAnimations";

const MILESTONES = [
  { year: "1987", event: "Founded by Marie & Henri Dupont on Rue du Pain" },
  { year: "1994", event: "First award at the Grand Concours de Pâtisserie" },
  { year: "2008", event: "Opened our école de pâtisserie for enthusiasts" },
  { year: "2019", event: "Named Best Artisan Bakery by Le Monde Gourmand" },
];

export default function StorySection() {
  const theme = useTheme();
  const fadeRef = useScrollFadeIn({ y: 50, duration: 1 });

  return (
    <Box
      id="story"
      component="section"
      sx={{
        py: { xs: 10, md: 18 },
        background: `linear-gradient(150deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Large decorative text */}
      <Typography
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: "var(--font-display)",
          fontSize: { xs: "12vw", md: "9vw" },
          fontWeight: 700,
          fontStyle: "italic",
          color: "rgba(255,248,240,0.02)",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          userSelect: "none",
          lineHeight: 1,
        }}
      >
        Angels in my Kitchen
      </Typography>

      {/* Gold top stripe */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${theme.palette.accent?.gold ?? "#d4af6a"}, transparent)`,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <Grid container spacing={{ xs: 6, md: 10 }} alignItems="center">
          {/* Story text */}
          <Grid item xs={12} md={6}>
            <SectionLabel
              label="Est. 1987"
              title="A Family Tradition Thirty-Five Years in the Making"
              center={false}
              light
            />

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <Typography
                variant="body1"
                sx={{ color: "rgba(255,248,240,0.7)", lineHeight: 1.9, mb: 3 }}
              >
                It began in a tiny kitchen on the left bank of the Seine. Marie Dupont — armed
                with her grandmother's recipe book and a secondhand Hobart mixer — opened La
                Farine's doors at dawn on a crisp January morning in 1987.
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "rgba(255,248,240,0.7)", lineHeight: 1.9, mb: 5 }}
              >
                Today, three generations and countless croissants later, we remain committed
                to the same belief: that baking is an act of love, and every customer deserves
                something extraordinary.
              </Typography>

              <Button
                variant="outlined"
                sx={{
                  color: theme.palette.primary.light,
                  borderColor: `${theme.palette.primary.main}60`,
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    background: `${theme.palette.primary.main}15`,
                  },
                }}
              >
                Meet the Team
              </Button>
            </motion.div>
          </Grid>

          {/* Timeline & values */}
          <Grid item xs={12} md={6}>
            {/* Timeline */}
            <Box sx={{ mb: 6 }}>
              {MILESTONES.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: 3,
                      mb: 3.5,
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                        minWidth: 48,
                        mt: 0.2,
                      }}
                    >
                      {m.year}
                    </Typography>
                    <Box
                      sx={{
                        flex: 1,
                        pl: 3,
                        borderLeft: `2px solid rgba(200,149,108,0.25)`,
                        position: "relative",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          left: -5,
                          top: 6,
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: theme.palette.primary.main,
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255,248,240,0.7)", lineHeight: 1.7 }}
                      >
                        {m.event}
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </Box>

            {/* Value pillars */}
            <Grid container spacing={2}>
              {[
                { icon: "🌾", label: "Local Sourcing", desc: "90% of ingredients sourced within 200km" },
                { icon: "🤲", label: "Hand Crafted", desc: "No machines touch our dough lamination" },
                { icon: "♻️", label: "Zero Waste", desc: "Day-old bread donated to local shelters" },
              ].map((v) => (
                <Grid item xs={12} sm={4} key={v.label}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        background: "rgba(255,248,240,0.05)",
                        border: "1px solid rgba(200,149,108,0.15)",
                        height: "100%",
                      }}
                    >
                      <Typography sx={{ fontSize: "1.6rem", mb: 1 }}>{v.icon}</Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.primary.light, fontWeight: 600, mb: 0.5 }}
                      >
                        {v.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255,248,240,0.5)", fontSize: "0.78rem", lineHeight: 1.6 }}
                      >
                        {v.desc}
                      </Typography>
                    </Box>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}