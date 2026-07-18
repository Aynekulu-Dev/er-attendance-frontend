/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#2F5D3A",
          dark: "#24462C",
          light: "#E8F0E9",
        },
        sand: "#E5DFC8",
        ink: "#1F2A24",
        slate: "#5C6B63",
        brick: "#B3452C",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}