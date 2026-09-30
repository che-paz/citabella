import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        muted: "var(--muted)",
        blush: "var(--blush)",
        rose: {
          DEFAULT: "var(--rose)",
          deep: "var(--rose-deep)",
          soft: "var(--rose-soft)",
        },
        sand: "var(--sand)",
        lp: {
          ink: "#1d1718",
          muted: "#5f5557",
          line: "#eee6e4",
          blush: "#fff4f2",
          coral: "#e8615a",
          "coral-deep": "#c9463f",
          violet: "#6d4bd8",
          "violet-soft": "#f1ecfd",
          wa: "#25d366",
          "wa-deep": "#128c4b",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s ease-out both",
        "fade-in": "fade-in 1s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
