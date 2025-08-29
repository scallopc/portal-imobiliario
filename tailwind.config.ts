import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "serif"],
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      colors: {
        primary: "#E8E8E8",
        secondary: "#F2DDC4",
        "color-text": "#E8E8E8",
        "color-accent": "#A8894D",
        "primary-clean": "#E8E8E8",
        "primary-bg": "#050F17",
        accent: "#A8894D",
        gold: "#A8894D",
        darkBg: "#050F17",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-portal": "linear-gradient(135deg, #050F17 0%, #A8894D 50%, #F2DDC4 100%)",
        "gradient-dark": "linear-gradient(135deg, #050F17 0%, #A8894D 100%)",
        "gradient-warm": "linear-gradient(135deg, #A8894D 0%, #F2DDC4 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
