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
          DEFAULT: "#050B14",
          deep: "#02050A",
        },
        orange: {
          DEFAULT: "#00E5FF", // mapped to Electric Cyan for global accent replacement
          secondary: "#00B2CC",
          glow: "rgba(0, 229, 255, 0.14)",
        },
        shell: {
          50: "#0B1624", // secondary surfaces
          100: "#101D2E", // card backgrounds
          150: "#14253B",
          200: "#1C324E",
        },
        ink: {
          900: "#FFFFFF",
          700: "#94A3B8", // updated grey secondary text
          500: "#94A3B8",
          350: "#64748B",
        },
      },
      boxShadow: {
        soft: "0 8px 40px rgba(0,0,0,0.55)",
        lift: "0 24px 60px rgba(0,0,0,0.75)",
        glow: "0 0 40px rgba(0,229,255,0.18)",
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
