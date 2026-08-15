/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#07130f",
          900: "#0c1f18",
          800: "#123028",
          700: "#1a4034",
        },
        fuel: {
          50: "#f3fbf6",
          100: "#d8f3e3",
          300: "#7ad4a3",
          400: "#3fbf7a",
          500: "#1f9d5b",
          600: "#167a47",
          700: "#125f39",
        },
        ember: {
          400: "#f0b429",
          500: "#e09b13",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Sora", "DM Sans", "ui-sans-serif", "sans-serif"],
      },
      boxShadow: {
        card: "0 18px 50px -24px rgba(7, 19, 15, 0.45)",
      },
    },
  },
  plugins: [],
};
