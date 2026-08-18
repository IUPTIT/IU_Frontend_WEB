/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{html,js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Airy Card SaaS — nền trang (canvas) tách khỏi bề mặt card (surface)
        canvas: "#F4F4FB",
        background: "#FFFFFF", // = surface: card / topbar / sidebar / modal
        surface: "#FFFFFF",
        "surface-2": "#F5F6FB", // chip, header bảng, hover nhẹ
        line: "#EBEBF3", // hairline mảnh
        "line-strong": "#E2E3EF", // divider đậm
        foreground: "#191A2C", // ink chính
        muted: "#6B7086", // chữ phụ
        faint: "#9AA0B4", // caption / chữ mờ
        placeholder: "#A0AEC0",
        accent: {
          DEFAULT: "#7C3AED", // nhấn tím — khớp logo-v2
          light: "#8B84FF",
          secondary: "#38B2AC",
        },
        // Thương hiệu — khớp logo-v2 (tím → magenta)
        brand: {
          DEFAULT: "#7C3AED",
          from: "#6E2CE6",
          to: "#E0348C",
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #6E2CE6 0%, #E0348C 100%)",
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "sans-serif"],
        sans: ['"DM Sans"', "sans-serif"],
        // IU Club Studio — chữ tiêu đề & số liệu KPI khu quản lý
        grotesk: ['"Space Grotesk"', '"Plus Jakarta Sans"', "sans-serif"],
        // Data / mã / ngày / điểm — instrument face
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        // Airy Card SaaS — bóng mềm một chiều, không neumorphism
        soft: "0 2px 8px rgba(26,26,80,0.06), 0 12px 28px -10px rgba(26,26,80,0.10)",
        "soft-sm": "0 1px 2px rgba(26,26,80,0.06), 0 2px 4px rgba(26,26,80,0.04)",
        "soft-lg": "0 8px 20px rgba(26,26,80,0.10), 0 22px 44px -12px rgba(26,26,80,0.16)",
        hairline: "inset 0 0 0 1px #EBEBF3",
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
        // Toast — trượt vào/ra từ mép phải, kèm co chiều cao khi thoát
        "toast-in": {
          "0%": { opacity: "0", transform: "translateX(115%) scale(0.95)" },
          "70%": { opacity: "1" },
          "100%": { opacity: "1", transform: "translateX(0) scale(1)" },
        },
        "toast-out": {
          "0%": {
            opacity: "1",
            transform: "translateX(0) scale(1)",
            maxHeight: "12rem",
            marginBottom: "0.75rem",
          },
          "45%": {
            opacity: "0",
            transform: "translateX(115%) scale(0.95)",
            maxHeight: "12rem",
            marginBottom: "0.75rem",
          },
          "100%": {
            opacity: "0",
            transform: "translateX(115%) scale(0.95)",
            maxHeight: "0px",
            marginBottom: "0px",
          },
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
        "toast-in": "toast-in 0.42s cubic-bezier(0.22, 1, 0.36, 1) both",
        "toast-out": "toast-out 0.44s cubic-bezier(0.4, 0, 0.2, 1) both",
        "arrow-nudge": "arrow-nudge 1s ease-in-out infinite",
        "soft-pulse": "soft-pulse 2.4s ease-in-out infinite",
        shake: "shake 0.4s ease-in-out",
        spin: "spin 0.8s linear infinite",
      },
    },
  },
  plugins: [],
}
