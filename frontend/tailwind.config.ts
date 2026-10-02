import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC", // Clean light neutral background (Slate 50)
        surface: {
          DEFAULT: "#FFFFFF", // Crisp White
          secondary: "#F1F5F9", // Slate 100
          tertiary: "#E2E8F0", // Slate 200
          floating: "#FFFFFF",
        },
        border: {
          subtle: "#E2E8F0", // Light subtle border
          DEFAULT: "#CBD5E1", // Slate 300
          strong: "#94A3B8", // Slate 400
        },
        accent: {
          emerald: "#10B981",
          amber: "#F59E0B",
          critical: "#EF4444",
          purple: "#8B5CF6",
          cyan: "#06B6D4",
          sky: "#0284C7",
        },
        text: {
          primary: "#0F172A", // Slate 900 (crisp high contrast)
          secondary: "#475569", // Slate 600
          muted: "#64748B", // Slate 500
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        "glow-emerald": "0 2px 16px -2px rgba(16, 185, 129, 0.25)",
        "glow-purple": "0 2px 16px -2px rgba(139, 92, 246, 0.25)",
        "glow-amber": "0 2px 16px -2px rgba(245, 158, 11, 0.25)",
        "glow-red": "0 2px 16px -2px rgba(239, 68, 68, 0.25)",
        "subtle": "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        "elevation": "0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2s infinite linear",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
