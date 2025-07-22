module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: 0, transform: "translateY(40px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 1s ease-out",
        "slide-up": "slide-up 0.8s cubic-bezier(0.4,0,0.2,1)",
      },
      colors: {
        background: {
          DEFAULT: "#F8F9FA",
          card: "#fff",
          gradient1: "#e0e7ff",
          gradient2: "#f3f4f6",
        },
        primary: {
          DEFAULT: "#7C3AED",
          dark: "#581C87",
          light: "#a78bfa",
        },
        secondary: {
          DEFAULT: "#00B4D8",
          light: "#60A5FA",
        },
        success: "#28D17C",
        warning: "#FFD166",
        danger: "#FF4B5C",
        text: {
          DEFAULT: "#23243A",
          secondary: "#B0B3B8",
        },
        border: "#E5E7EB",
      },
    },
  },
  plugins: [],
};
