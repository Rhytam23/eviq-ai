import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "SF Pro Display",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
        display: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
      },
      colors: {
        navy: {
          DEFAULT: "#05070B",
          deep: "#020408",
        },
        orange: {
          DEFAULT: "#FF7A00",
          secondary: "#FFA640",
          glow: "rgba(255, 122, 0, 0.14)",
        },
        shell: {
          50: "#0A1018",
          100: "#101820",
          150: "#15202c",
          200: "#1d2c3f",
        },
        ink: {
          900: "#FFFFFF",
          700: "#E2E8F0",
          500: "#A0AEC0",
          350: "#718096",
        },
      },
      boxShadow: {
        soft: "0 8px 40px rgba(0,0,0,0.55)",
        lift: "0 24px 60px rgba(0,0,0,0.75)",
        glow: "0 0 40px rgba(255,122,0,0.18)",
      },
      animation: {
        "pulse-slow": "pulse 3.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        drift: "drift 22s linear infinite",
        flow: "flow 4s linear infinite",
      },
      keyframes: {
        drift: {
          "0%": { transform: "translateY(0) translateX(0)" },
          "100%": { transform: "translateY(-120px) translateX(12px)" },
        },
        flow: {
          "0%": { strokeDashoffset: "120" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
