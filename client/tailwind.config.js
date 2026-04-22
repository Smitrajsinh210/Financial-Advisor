export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        brand: {
          50: "#eefdf7",
          100: "#d6faea",
          200: "#b0f4d4",
          300: "#7fe8b8",
          400: "#42d393",
          500: "#18b977",
          600: "#0f8f5c",
          700: "#0f714b",
          800: "#10593d",
          900: "#0e4933"
        }
      },
      boxShadow: {
        glow: "0 20px 80px rgba(24, 185, 119, 0.22)"
      },
      backgroundImage: {
        "fintech-grid":
          "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};
