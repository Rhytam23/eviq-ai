import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
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
        ok: "#13804A",
        bad: "#C23B22",
        warn: "#B26A00",
        unknown: "#7A848A",
      },
    },
  },
  plugins: [],
};
export default config;
