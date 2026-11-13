import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#080A0D",
        panel: "#14171C",
        muted: "#9299A3",
        gold: "#C5A46D",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Times New Roman", "serif"],
        sans: ["var(--font-sans)", "Helvetica Neue", "Arial", "sans-serif"],
      },
      letterSpacing: {
        brand: "0.28em",
      },
    },
  },
  plugins: [],
};

export default config;
