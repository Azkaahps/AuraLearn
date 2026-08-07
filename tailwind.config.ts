import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Rubik', 'var(--font-plus-jakarta-sans)', 'sans-serif'],
        display: ['Space Grotesk', 'Archivo', 'Hubot Sans', 'sans-serif'],
        mono: ['Monaco', 'Menlo', 'Ubuntu Mono', 'monospace'],
      },
      colors: {
        night: "#150f23",
        "ink-deep": "#1f1633",
        "canvas-dark": "#1f1633",
        "canvas-light": "#ffffff",
        "lime-chip": "#c2ef4e",
        "pink-accent": "#fa7faa",
        "violet-link": "#6a5fc1",
        "violet-deep": "#422082",
        "violet-mid": "#79628c",
        "hairline-violet": "#362d59",
        "hairline-cool": "#cfcfdb",
        "hairline-cloud": "#e5e7eb",
        border: "#362d59",
        input: "#362d59",
        ring: "#6a5fc1",
        background: "#1f1633",
        foreground: "#ffffff",
        primary: {
          DEFAULT: "#150f23",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#422082",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#fa7faa",
          foreground: "#150f23",
        },
        muted: {
          DEFAULT: "#362d59",
          foreground: "rgba(255, 255, 255, 0.72)",
        },
        accent: {
          DEFAULT: "#c2ef4e",
          foreground: "#150f23",
        },
        card: {
          DEFAULT: "#1f1633",
          foreground: "#ffffff",
        },
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "12px",
        xxl: "18px",
        '2xl': "18px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
