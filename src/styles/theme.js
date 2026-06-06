import { useState, useEffect } from 'react';

// Percy Design System v2
// Brand color: #10B981 → #059669 (emerald green — money/savings)

export const colors = {
  // Brand (emerald — primary, money, savings, active unified)
  brand:          "#10B981",
  brandDeep:      "#059669",
  primary:        "#34D399",   // accent on dark
  primaryDark:    "#0F9D6B",   // accent on light
  primaryGlow:    "rgba(16,185,129,0.25)",
  primaryBorder:  "rgba(16,185,129,0.45)",

  // Background layers (dark theme)
  bg:             "#0A0A0F",
  surface:        "#13131A",
  surfaceRaised:  "#1A1A24",
  surfaceHover:   "rgba(255,255,255,0.05)",
  fill1:          "rgba(255,255,255,0.06)",
  fill2:          "rgba(255,255,255,0.04)",
  fill3:          "rgba(255,255,255,0.03)",

  // Text
  textPrimary:    "#F0EEF6",
  textSecondary:  "#9CA3AF",
  textMuted:      "#6B7280",

  // Borders
  border:         "rgba(255,255,255,0.08)",
  borderStrong:   "rgba(255,255,255,0.15)",

  // Status (unified with brand green for active)
  active:         "#10B981",
  activeBg:       "rgba(16,185,129,0.14)",
  partial:        "#F59E0B",
  partialBg:      "rgba(245,158,11,0.14)",
  used:           "#94A3B8",
  usedBg:         "rgba(148,163,184,0.16)",
  danger:         "#EF4444",
  dangerBg:       "rgba(239,68,68,0.14)",

  // Semantic
  warning:        "#F59E0B",
  success:        "#10B981",

  // Shadows
  shadowCard:     "0 4px 12px rgba(0,0,0,0.20)",
  shadowRaised:   "0 8px 24px rgba(0,0,0,0.40)",
  shadowGlow:     "0 8px 20px rgba(16,185,129,0.25)",
  shadowThumb:    "0 2px 8px rgba(0,0,0,0.30)",
};

export const statusConfig = {
  active:  { label: "פעיל",   color: colors.active,  bg: colors.activeBg,  dot: colors.active },
  partial: { label: "חלקי",  color: colors.partial, bg: colors.partialBg, dot: colors.partial },
  used:    { label: "נוצל",   color: colors.used,    bg: colors.usedBg,    dot: colors.used },
};

export const gradients = {
  primary: `linear-gradient(135deg, ${colors.brand}, ${colors.brandDeep})`,
  card:    "linear-gradient(145deg, #13131A, #1A1A24)",
};

export const radius = {
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 24,
  pill: 50,
};

export const font = {
  family: "'DM Sans', sans-serif",
};

export const typography = {
  // Display (Bricolage Grotesque) — hero balances, big stats
  displayXL: { fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 46, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.0 },
  displayLg: { fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 31, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.05 },

  // Headings (Bricolage Grotesque)
  h1: { fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 33, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 },
  h2: { fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 23, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.2 },
  h3: { fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 19, fontWeight: 700, lineHeight: 1.25 },
  h4: { fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.3 },

  // Body (DM Sans)
  body:   { fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 400, lineHeight: 1.5 },
  bodySm: { fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 400, lineHeight: 1.5 },
  caption:{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, lineHeight: 1.5 },
  micro:  { fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, lineHeight: 1.4 },

  // Label/eyebrow (uppercase, tracked)
  label:  { fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" },

  // Monospace codes (JetBrains Mono)
  code:   { fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: "0.12em" },
  codeSm: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em" },
};

export const colorsLight = {
  bg:             "#F4F4FA",
  surface:        "#FFFFFF",
  surfaceRaised:  "#FFFFFF",
  surfaceHover:   "rgba(17,17,31,0.04)",
  fill1:          "rgba(17,17,31,0.045)",
  fill2:          "rgba(17,17,31,0.03)",
  fill3:          "rgba(17,17,31,0.02)",
  textPrimary:    "#17171F",
  textSecondary:  "#5A616E",
  textMuted:      "#9096A1",
  border:         "rgba(17,17,31,0.10)",
  borderStrong:   "rgba(17,17,31,0.18)",
  primary:        "#0F9D6B",
  primaryGlow:    "rgba(16,185,129,0.12)",
  primaryBorder:  "rgba(16,185,129,0.40)",
  gradientCard:   "linear-gradient(145deg, #FFFFFF, #F4F4FA)",
  shadowCard:     "0 4px 14px rgba(17,17,31,0.08)",
  shadowRaised:   "0 12px 32px rgba(17,17,31,0.14)",
  shadowGlow:     "0 8px 20px rgba(16,185,129,0.30)",
  shadowThumb:    "0 2px 8px rgba(17,17,31,0.12)",
};

export const breakpoints = {
  mobile: 640,
  tablet: 1024,
};

// Spacing scale (4px base)
export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
};

// Get colors for light or dark theme
export function getThemeColors(isDark = true) {
  if (isDark) return colors;
  return { ...colors, ...colorsLight };
}

// React hook for theme management with localStorage persistence
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = localStorage.getItem('percy-theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    localStorage.setItem('percy-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const isDark = theme === 'dark';

  return { theme, toggleTheme, isDark, themeColors: getThemeColors(isDark) };
}
