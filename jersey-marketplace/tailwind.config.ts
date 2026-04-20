import type { Config } from "tailwindcss";

/*
 * Oase Design System — Tailwind Configuration
 *
 * All colors reference CSS custom properties defined in globals.css.
 * Stored as RGB channels so opacity modifiers (bg-primary/50) work.
 *
 * To change the palette, edit globals.css. To change the scale
 * (sizes, radii, type), edit this file.
 */

function rgb(varName: string) {
  return `rgb(var(--${varName}) / <alpha-value>)`;
}

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },

    // Override the default type scale to match the design spec
    fontSize: {
      xs:   ["0.75rem",    { lineHeight: "1.4" }],    // 12px
      sm:   ["0.8125rem",  { lineHeight: "1.45" }],   // 13px
      base: ["0.9375rem",  { lineHeight: "1.55" }],   // 15px
      lg:   ["1.125rem",   { lineHeight: "1.3" }],    // 18px
      xl:   ["1.375rem",   { lineHeight: "1.25" }],   // 22px
      "2xl": ["1.75rem",   { lineHeight: "1.15" }],   // 28px
      "3xl": ["2.25rem",   { lineHeight: "1.1" }],    // 36px
    },

    // Override border radii to the 4-tier system
    borderRadius: {
      none: "0",
      sm:   "var(--radius-sm)",   // 6px
      md:   "var(--radius-md)",   // 10px
      lg:   "var(--radius-lg)",   // 16px
      pill: "var(--radius-pill)", // 100px
      full: "9999px",             // avatars
    },

    extend: {
      colors: {
        // Semantic (shadcn bridge) — every shadcn component uses these
        border:      rgb("border"),
        input:       rgb("input"),
        ring:        rgb("ring"),
        background:  rgb("background"),
        foreground:  rgb("foreground"),
        primary:     { DEFAULT: rgb("primary"), foreground: rgb("primary-foreground") },
        secondary:   { DEFAULT: rgb("secondary"), foreground: rgb("secondary-foreground") },
        destructive: { DEFAULT: rgb("destructive"), foreground: rgb("destructive-foreground") },
        muted:       { DEFAULT: rgb("muted"), foreground: rgb("muted-foreground") },
        accent:      { DEFAULT: rgb("accent"), foreground: rgb("accent-foreground") },
        popover:     { DEFAULT: rgb("popover"), foreground: rgb("popover-foreground") },
        card:        { DEFAULT: rgb("card"), foreground: rgb("card-foreground") },

        // Design-system-specific tokens
        "bg-raised":    rgb("background-raised"),
        "card-hover":   rgb("card-hover"),
        "border-light": rgb("border-light"),
        "text-secondary": rgb("text-secondary"),
        "text-tertiary":  rgb("text-tertiary"),
        "text-inverse":   rgb("text-inverse"),

        // Green spectrum
        green: {
          50:  rgb("green-50"),
          100: rgb("green-100"),
          200: rgb("green-200"),
          300: rgb("green-300"),
          400: rgb("green-400"),
          500: rgb("green-500"),
          600: rgb("green-600"),
          900: rgb("green-900"),
        },

        // Red spectrum
        red: {
          50:  rgb("red-50"),
          100: rgb("red-100"),
          200: rgb("red-200"),
          300: rgb("red-300"),
          400: rgb("red-400"),
          500: rgb("red-500"),
          600: rgb("red-600"),
          900: rgb("red-900"),
        },

        // Sage (verification section)
        sage: { DEFAULT: rgb("sage"), 900: rgb("sage-900") },
      },

      fontFamily: {
        sans:    ["var(--font-sans)", "DM Sans", "-apple-system", "sans-serif"],
        display: ["var(--font-display)", "Young Serif", "Georgia", "serif"],
      },

      letterSpacing: {
        section: "0.15em",  // uppercase section labels
        badge:   "0.06em",  // badge/pill/price labels
      },

      // 4px-grid spacing is Tailwind's default. Add the odd ones the spec uses.
      spacing: {
        "3.5": "14px",  // card outer margin, action bar padding
        "4.5": "18px",  // verification header icon
        "13":  "52px",  // if needed
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
