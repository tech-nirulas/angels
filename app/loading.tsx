"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { keyframes } from "@mui/system";
import { useTheme } from "@mui/material/styles";

// Custom animations
const float = keyframes`
  0% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
  100% {
    transform: translateY(0px) rotate(0deg);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.3;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const fadeInUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

export default function Loading() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.accent} 100%)`,
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* Floating circles */}
        {[...Array(20)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: Math.random() * 100 + 20,
              height: Math.random() * 100 + 20,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${theme.palette.primary.light}15, transparent)`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `${float} ${Math.random() * 5 + 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              pointerEvents: "none",
            }}
          />
        ))}
      </Box>

      {/* Main content */}
      <Box
        sx={{
          textAlign: "center",
          zIndex: 1,
          animation: `${fadeInUp} 0.6s ease-out`,
        }}
      >
        {/* Animated cake/cupcake icon */}
        <Box
          sx={{
            position: "relative",
            width: 120,
            height: 120,
            margin: "0 auto",
            mb: 4,
          }}
        >
          {/* Plate */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 80,
              height: 8,
              borderRadius: "50%",
              background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
              animation: `${pulse} 2s ease-in-out infinite`,
            }}
          />

          {/* Cake base */}
          <Box
            sx={{
              position: "absolute",
              bottom: 8,
              left: "50%",
              transform: "translateX(-50%)",
              width: 60,
              height: 50,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              borderRadius: "8px 8px 4px 4px",
              animation: `${float} 2s ease-in-out infinite`,
            }}
          />

          {/* Cake frosting */}
          <Box
            sx={{
              position: "absolute",
              bottom: 45,
              left: "50%",
              transform: "translateX(-50%)",
              width: 70,
              height: 15,
              background: `linear-gradient(90deg, ${theme.palette.secondary.light}, ${theme.palette.secondary.main})`,
              borderRadius: "20px 20px 8px 8px",
              animation: `${float} 2s ease-in-out infinite`,
            }}
          />

          {/* Cherry on top */}
          <Box
            sx={{
              position: "absolute",
              bottom: 55,
              left: "50%",
              transform: "translateX(-50%)",
              width: 16,
              height: 16,
              background: `radial-gradient(circle, ${theme.palette.accent?.gold || "#E2B87A"}, ${theme.palette.tertiary?.dark || "#492903"})`,
              borderRadius: "50%",
              animation: `${pulse} 1.5s ease-in-out infinite`,
            }}
          />

          {/* Sprinkles */}
          {[...Array(6)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: "absolute",
                width: 4,
                height: 8,
                background: theme.palette.accent?.cream || "#FFF8F7",
                borderRadius: 1,
                top: 40 + Math.random() * 20,
                left: 35 + Math.random() * 30,
                transform: `rotate(${Math.random() * 90}deg)`,
                animation: `${float} ${Math.random() * 1 + 1}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </Box>

        {/* Loading text */}
        <Typography
          variant="h3"
          sx={{
            fontFamily: "var(--font-display)",
            fontSize: { xs: "2rem", md: "2.5rem" },
            fontWeight: 600,
            mb: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: `${shimmer} 3s ease-in-out infinite`,
            backgroundSize: "200% auto",
          }}
        >
          Baking Sweet Moments
        </Typography>

        {/* Animated dots */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 3 }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: theme.palette.primary.main,
                animation: `${pulse} 1.5s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </Box>

        {/* Subtitle */}
        <Typography
          variant="body2"
          sx={{
            mt: 3,
            color: theme.palette.text.secondary,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontSize: "0.7rem",
          }}
        >
          Loading deliciousness...
        </Typography>
      </Box>

      {/* Rotating decorative ring */}
      <Box
        sx={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          border: `2px solid ${theme.palette.primary.light}20`,
          borderTop: `2px solid ${theme.palette.primary.main}`,
          animation: `${rotate} 4s linear infinite`,
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: "50%",
          border: `2px solid ${theme.palette.secondary.light}20`,
          borderBottom: `2px solid ${theme.palette.secondary.main}`,
          animation: `${rotate} 3s linear infinite reverse`,
          pointerEvents: "none",
        }}
      />
    </Box>
  );
}