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
          DEFAULT: "#061224",
          deep: "#02050A",
        },
        cyan: {
          DEFAULT: "#4FD1FF",
          glow: "rgba(79, 209, 255, 0.14)",
        },
        shell: {
          50: "#f9fafb",
          100: "#f7f8fa",
          150: "#f2f4f7",
          200: "#e9ecf1",
        },
        ink: {
          900: "#0b1320",
          700: "#3a4556",
          500: "#6b7687",
          350: "#9aa3b2",
        },
      },
      boxShadow: {
        soft: "0 8px 40px rgba(6,18,36,0.06)",
        lift: "0 24px 60px rgba(6,18,36,0.10)",
        glow: "0 0 40px rgba(79,209,255,0.18)",
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
