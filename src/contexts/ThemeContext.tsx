/**
 * Theme Provider Component
 *
 * Dynamically applies site settings (fonts, colors, content) to the application.
 * Loads Google Fonts dynamically based on settings.
 */

import { createContext, useContext, useEffect, ReactNode } from "react";
import { useSettings } from "@/lib/store";

// Function to convert hex color to HSL for better integration
function hexToHsl(hex: string): string {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = Number("0x" + hex[1] + hex[1]);
    g = Number("0x" + hex[2] + hex[2]);
    b = Number("0x" + hex[3] + hex[3]);
  } else if (hex.length === 7) {
    r = Number("0x" + hex[1] + hex[2]);
    g = Number("0x" + hex[3] + hex[4]);
    b = Number("0x" + hex[5] + hex[6]);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Function to load Google Fonts dynamically
function loadGoogleFont(fontFamily: string): void {
  const fontId = `google-font-${fontFamily.replace(/\s+/g, "-").toLowerCase()}`;

  // Check if font is already loaded
  if (document.getElementById(fontId)) return;

  const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(" ", "+")}:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap`;

  const link = document.createElement("link");
  link.id = fontId;
  link.href = fontUrl;
  link.rel = "stylesheet";
  document.head.appendChild(link);
}

interface ThemeContextValue {
  settings: ReturnType<typeof useSettings>[0];
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [settings] = useSettings();

  useEffect(() => {
    // Apply CSS variables
    const root = document.documentElement;

    // Typography - with fallback values for undefined
    const headingFont = settings?.headingFont ?? "Inter";
    const bodyFont = settings?.bodyFont ?? "Inter";
    const baseFontSize = settings?.baseFontSize ?? 16;
    const headingScale = settings?.headingScale ?? 1.2;

    root.style.setProperty("--heading-font", `'${headingFont}', serif`);
    root.style.setProperty("--body-font", `'${bodyFont}', sans-serif`);
    root.style.setProperty("--base-font-size", `${baseFontSize}px`);
    root.style.setProperty("--heading-scale", headingScale.toString());

    // Colors (hex format for dynamic variables) - with fallback values
    const primaryColor = settings?.primaryColor ?? "#6366f1";
    const secondaryColor = settings?.secondaryColor ?? "#8b5cf6";
    const accentColor = settings?.accentColor ?? "#f59e0b";

    root.style.setProperty("--dynamic-primary", primaryColor);
    root.style.setProperty("--dynamic-secondary", secondaryColor);
    root.style.setProperty("--dynamic-accent", accentColor);

    // Load Google Fonts
    const uniqueFonts = new Set([headingFont, bodyFont]);
    uniqueFonts.forEach((font) => {
      if (font !== "system-ui") {
        loadGoogleFont(font);
      }
    });
  }, [settings]);

  return (
    <ThemeContext.Provider value={{ settings }}>
      {children}
    </ThemeContext.Provider>
  );
};
