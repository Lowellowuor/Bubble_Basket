/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: "#FF1E75",
          indigo: "#0E1B4D",
          blue: "#2D8EFF",
          lavender: "#FFEBF2",
          white: "#FFFFFF",
        },
        whatsapp: {
          green: "#25D366",
        },
        mpesa: {
          magenta: "#E41C24",
        },
        text: {
          primary: "#0E1B4D",
          secondary: "#4A5A7A",
          light: "#8A9BB5",
        },
        status: {
          pending: "#FF1E75",
          picked: "#2D8EFF",
          washing: "#7C3AED",
          drying: "#F59E0B",
          ready: "#10B981",
          delivered: "#0E1B4D",
          cancelled: "#EF4444",
        }
      },
      fontFamily: {
        heading: ['"Fredoka One"', "cursive"],
        body: ['"Poppins"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(14, 27, 77, 0.06)",
        softHover: "0 8px 30px rgba(14, 27, 77, 0.10)",
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-out",
        slideUp: "slideUp 0.4s ease-out",
        bounceIn: "bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
}