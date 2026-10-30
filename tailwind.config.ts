import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.ts"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      colors: {
        paper: "#F6F5F0",
        surface: "#FFFFFF",
        ink: "#14181B",
        muted: "#5C666D",
        line: "#E2E0D8",
        brand: "#0B3D2E",
        volt: "#C8F03C",
        ok: "#0F6B3C",
        bad: "#B3321B",
        warn: "#8A5200",
        unknown: "#5F6A71",
      },
    },
  },
  plugins: [],
};
export default config;
