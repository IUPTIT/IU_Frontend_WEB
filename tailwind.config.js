/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{html,js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#E0E5EC",
        foreground: "#3D4852",
        muted: "#6B7280",
        placeholder: "#A0AEC0",
        accent: {
          DEFAULT: "#6C63FF",
          light: "#8B84FF",
          secondary: "#38B2AC",
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "sans-serif"],
        sans: ['"DM Sans"', "sans-serif"],
      },
      borderRadius: {
        card: "32px",
      },
      boxShadow: {
        // Neumorphism: dual opposing shadows (light top-left, dark bottom-right)
        extruded:
          "9px 9px 16px rgba(163,177,198,0.6), -9px -9px 16px rgba(255,255,255,0.5)",
        "extruded-hover":
          "12px 12px 20px rgba(163,177,198,0.7), -12px -12px 20px rgba(255,255,255,0.6)",
        "extruded-sm":
          "5px 5px 10px rgba(163,177,198,0.6), -5px -5px 10px rgba(255,255,255,0.5)",
        inset:
          "inset 6px 6px 10px rgba(163,177,198,0.6), inset -6px -6px 10px rgba(255,255,255,0.5)",
        "inset-deep":
          "inset 10px 10px 20px rgba(163,177,198,0.7), inset -10px -10px 20px rgba(255,255,255,0.6)",
        "inset-sm":
          "inset 3px 3px 6px rgba(163,177,198,0.6), inset -3px -3px 6px rgba(255,255,255,0.5)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(24px) scale(1.02)" },
          "100%": { opacity: "1", transform: "translateX(0) scale(1)" },
        },
        "arrow-nudge": {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(4px)" },
        },
        "soft-pulse": {
          "0%, 100%": { boxShadow: "0 10px 24px rgba(74, 144, 226, 0.35)" },
          "50%": { boxShadow: "0 14px 32px rgba(74, 144, 226, 0.5)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out both",
        "fade-in": "fade-in 0.5s ease-out both",
        "slide-in-right": "slide-in-right 0.7s ease-out both",
        "arrow-nudge": "arrow-nudge 1s ease-in-out infinite",
        "soft-pulse": "soft-pulse 2.4s ease-in-out infinite",
        shake: "shake 0.4s ease-in-out",
        spin: "spin 0.8s linear infinite",
      },
    },
  },
  plugins: [],
}
