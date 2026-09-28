import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        // Phones and tablets, where nothing can hover: anything revealed on
        // hover has to be shown outright instead.
        touch: { raw: "(hover: none)" },
      },
      colors: {
        ivory: "#FAF7F2",
        charcoal: "#1C1C1C",
        gold: "#C9A84C",
        blush: "#E8E0D8",
        near_black: "#242020",
        gold_light: "#D4B86A",
        gold_dark: "#A8882E",
        // Gold that passes AA as text on ivory (about 5.6:1). #C9A84C is for
        // hairlines, icons and text on near-black only.
        gold_ink: "#7A5F1E",
      },
      fontFamily: {
        cormorant: ["var(--font-cormorant)", "Georgia", "serif"],
        jost: ["var(--font-jost)", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.7s ease forwards",
        "scroll-hint": "scrollHint 2.2s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scrollHint: {
          "0%, 100%": { transform: "scaleY(1)", opacity: "0.4" },
          "50%": { transform: "scaleY(0.3)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
