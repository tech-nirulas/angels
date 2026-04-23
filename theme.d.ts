import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface TypeBackground {
    accent: string;
  }

  interface Palette {
    accent: {
      rose: string;
      cream: string;
      gold: string;
      sage: string;
      lavender: string;
    };
    tertiary: {
      main: string;
      light: string;
      dark: string;
    };
  }

  interface PaletteOptions {
    accent?: {
      rose?: string;
      cream?: string;
      gold?: string;
      sage?: string;
      lavender?: string;
    };
  }
}
