import { createTheme, responsiveFontSizes } from "@mui/material/styles";

// ─────────────────────────────────────────────────────────────────────────────
// BAKERY THEME — Material Theme Builder Colors
// Seed: #FB82A3
// ─────────────────────────────────────────────────────────────────────────────

const PALETTE = {
  primary: {
    main: "#A03A5A",       // primary 40 - main brand color
    light: "#FFB1C3",      // primary 80 - for hover states
    dark: "#63072D",       // primary 20 - for active states
    contrastText: "#FFFFFF",
  },
  secondary: {
    main: "#77555D",       // secondary 40
    light: "#E7BBC4",      // secondary 80
    dark: "#45282F",       // secondary 20
    contrastText: "#FFFFFF",
  },
  tertiary: {
    main: "#7E562D",       // tertiary 40
    light: "#F1BC8A",      // tertiary 80
    dark: "#492903",       // tertiary 20
    contrastText: "#FFFFFF",
  },
  accent: {
    rose: "#FFB1C3",       // primary 80
    cream: "#FFF8F7",      // background
    gold: "#F1BC8A",       // tertiary 80
    sage: "#9A6E43",       // tertiary 50 - warm earthy tone
    lavender: "#CAA1A9",   // secondary 70
  },
  background: {
    default: "#FFF8F7",    // background
    accent: "#FFECEF",     // primary 95 - very light pink
    paper: "#FFFFFF",      // surface container lowest
  },
  text: {
    primary: "#201A1B",    // neutral 10
    secondary: "#655C5D",  // neutral 40
    disabled: "#B3A9AA",   // neutral 70
    hint: "#A03A5A",       // primary 40 for accents
  },
  error: {
    main: "#BA1A1A",       // error
    light: "#FFDAD6",      // error container
    dark: "#93000A",       // on error container
  },
  success: {
    main: "#7E562D",       // using tertiary for success
    light: "#FFDCBE",
    dark: "#492903",
  },
  surface: {
    main: "#FFF8F7",
    variant: "#F3DDE0",    // surface variant
    inverse: "#382E30",    // inverse surface
  },
};

const TYPOGRAPHY = {
  fontFamily: '"Cormorant Garamond", "Georgia", serif',
  displayFont: '"Playfair Display", serif',
  monoFont: '"DM Mono", monospace',
  bodyFont: '"Lato", sans-serif',
};

const SHAPE = {
  borderRadius: 4,
};

const SHADOWS_CUSTOM = {
  soft: "0 4px 24px rgba(0,0,0,0.04)",
  medium: "0 8px 40px rgba(0,0,0,0.08)",
  strong: "0 16px 64px rgba(0,0,0,0.12)",
  glow: "0 0 32px rgba(160,58,90,0.25)",     // primary 40 glow
  warm: "0 8px 24px rgba(120,85,93,0.12)",   // secondary shadow
};

// ─────────────────────────────────────────────────────────────────────────────

let theme = createTheme({
  palette: {
    primary: PALETTE.primary,
    secondary: PALETTE.secondary,
    error: PALETTE.error,
    success: PALETTE.success,
    background: PALETTE.background,
    text: PALETTE.text,
    divider: "#F3DDE0",    // surface variant
    action: {
      hover: "#FFECEF",    // primary 95
      selected: "#FFD9E0", // primary 90
      disabled: "#CFC4C5", // neutral 80
      disabledBackground: "#ECE0E1", // neutral 90
    },
  },
  typography: {
    fontFamily: TYPOGRAPHY.bodyFont,
    h1: {
      fontFamily: TYPOGRAPHY.displayFont,
      fontWeight: 700,
      letterSpacing: "-0.02em",
      lineHeight: 1.1,
      color: PALETTE.text.primary,
    },
    h2: {
      fontFamily: TYPOGRAPHY.displayFont,
      fontWeight: 600,
      letterSpacing: "-0.01em",
      lineHeight: 1.2,
      color: PALETTE.text.primary,
    },
    h3: {
      fontFamily: TYPOGRAPHY.displayFont,
      fontWeight: 600,
      lineHeight: 1.3,
      color: PALETTE.text.primary,
    },
    h4: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontWeight: 600,
      lineHeight: 1.4,
      color: PALETTE.text.primary,
    },
    h5: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontWeight: 500,
      color: PALETTE.text.primary,
    },
    h6: {
      fontFamily: TYPOGRAPHY.fontFamily,
      fontWeight: 500,
      color: PALETTE.text.primary,
    },
    subtitle1: {
      fontFamily: TYPOGRAPHY.bodyFont,
      letterSpacing: "0.15em",
      textTransform: "uppercase" as const,
      fontSize: "0.75rem",
      fontWeight: 600,
      color: PALETTE.primary.main,
    },
    subtitle2: {
      fontFamily: TYPOGRAPHY.bodyFont,
      letterSpacing: "0.1em",
      color: PALETTE.text.secondary,
    },
    body1: {
      fontFamily: TYPOGRAPHY.bodyFont,
      lineHeight: 1.75,
      fontSize: "1rem",
      color: PALETTE.text.primary,
    },
    body2: {
      fontFamily: TYPOGRAPHY.bodyFont,
      lineHeight: 1.65,
      fontSize: "0.9rem",
      color: PALETTE.text.secondary,
    },
    button: {
      fontFamily: TYPOGRAPHY.bodyFont,
      letterSpacing: "0.12em",
      textTransform: "uppercase" as const,
      fontWeight: 600,
      fontSize: "0.8rem",
    },
  },
  shape: SHAPE,
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        *, *::before, *::after { box-sizing: border-box; }

        :root {
          --color-primary: ${PALETTE.primary.main};
          --color-primary-light: ${PALETTE.primary.light};
          --color-primary-dark: ${PALETTE.primary.dark};
          --color-secondary: ${PALETTE.secondary.main};
          --color-secondary-light: ${PALETTE.secondary.light};
          --color-secondary-dark: ${PALETTE.secondary.dark};
          --color-tertiary: ${PALETTE.tertiary.main};
          --color-tertiary-light: ${PALETTE.tertiary.light};
          --color-tertiary-dark: ${PALETTE.tertiary.dark};
          --color-accent-rose: ${PALETTE.accent.rose};
          --color-accent-cream: ${PALETTE.accent.cream};
          --color-accent-gold: ${PALETTE.accent.gold};
          --color-accent-sage: ${PALETTE.accent.sage};
          --color-bg: ${PALETTE.background.default};
          --color-bg-accent: ${PALETTE.background.accent};
          --color-paper: ${PALETTE.background.paper};
          --color-surface-variant: ${PALETTE.surface.variant};
          --color-text: ${PALETTE.text.primary};
          --color-text-secondary: ${PALETTE.text.secondary};
          --color-text-disabled: ${PALETTE.text.disabled};
          --shadow-soft: ${SHADOWS_CUSTOM.soft};
          --shadow-medium: ${SHADOWS_CUSTOM.medium};
          --shadow-strong: ${SHADOWS_CUSTOM.strong};
          --shadow-glow: ${SHADOWS_CUSTOM.glow};
          --shadow-warm: ${SHADOWS_CUSTOM.warm};
          --font-display: ${TYPOGRAPHY.displayFont};
          --font-serif: ${TYPOGRAPHY.fontFamily};
          --font-body: ${TYPOGRAPHY.bodyFont};
          --radius: ${SHAPE.borderRadius}px;
        }

        html { scroll-behavior: smooth; }

        body {
          background-color: ${PALETTE.background.default};
          color: ${PALETTE.text.primary};
          font-family: ${TYPOGRAPHY.bodyFont};
          overflow-x: hidden;
        }

        ::selection {
          background: ${PALETTE.primary.light};
          color: ${PALETTE.primary.dark};
        }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track {
          background: ${PALETTE.background.accent};
        }
        ::-webkit-scrollbar-thumb {
          background: ${PALETTE.primary.main};
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${PALETTE.primary.dark};
        }
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: SHAPE.borderRadius * 2,
          padding: "10px 28px",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${PALETTE.primary.main} 0%, ${PALETTE.primary.dark} 100%)`,
          boxShadow: SHADOWS_CUSTOM.soft,
          "&:hover": {
            boxShadow: SHADOWS_CUSTOM.glow,
            transform: "translateY(-2px)",
          },
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${PALETTE.secondary.main} 0%, ${PALETTE.secondary.dark} 100%)`,
          boxShadow: SHADOWS_CUSTOM.warm,
          "&:hover": {
            boxShadow: SHADOWS_CUSTOM.medium,
            transform: "translateY(-2px)",
          },
        },
        outlined: {
          borderColor: PALETTE.primary.main,
          borderWidth: "1.5px",
          color: PALETTE.primary.main,
          "&:hover": {
            borderWidth: "1.5px",
            background: `${PALETTE.primary.main}08`,
            borderColor: PALETTE.primary.dark,
            color: PALETTE.primary.dark,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: SHADOWS_CUSTOM.soft,
          borderRadius: SHAPE.borderRadius * 3,
          overflow: "hidden",
          background: PALETTE.background.paper,
          transition: "box-shadow 0.3s ease, transform 0.3s ease",
          "&:hover": {
            boxShadow: SHADOWS_CUSTOM.warm,
            transform: "translateY(-4px)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: TYPOGRAPHY.bodyFont,
          letterSpacing: "0.08em",
          fontSize: "0.7rem",
          fontWeight: 600,
        },
        filledPrimary: {
          background: PALETTE.primary.main,
          color: "#FFFFFF",
        },
        outlined: {
          borderColor: PALETTE.primary.main,
          color: PALETTE.primary.main,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: `${PALETTE.primary.light}60`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: `${PALETTE.background.accent}DD`,
          backdropFilter: "blur(10px)",
          boxShadow: SHADOWS_CUSTOM.soft,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: SHADOWS_CUSTOM.soft,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: PALETTE.primary.main,
          textDecoration: "none",
          "&:hover": {
            color: PALETTE.primary.dark,
            textDecoration: "underline",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: PALETTE.primary.main,
          "&:hover": {
            backgroundColor: `${PALETTE.primary.main}10`,
          },
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme, { factor: 1.5 });

export default theme;
export { PALETTE, SHADOWS_CUSTOM, TYPOGRAPHY };
