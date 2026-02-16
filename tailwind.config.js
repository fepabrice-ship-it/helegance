/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0a0f1e", // Darkest blue/black
        foreground: "#f8fafc", // White
        primary: {
          DEFAULT: "#3b82f6", // Vivid Blue
          hover: "#2563eb",
        },
        secondary: {
          DEFAULT: "#64748b", // Slate
          hover: "#475569",
        },
        card: {
          DEFAULT: "#1e293b", // Dark Slate Blue
          hover: "#334155",
        },
        input: "#1e293b",
        border: "#334155",
      },
      fontFamily: {
        sans: ['"Outfit"', "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
