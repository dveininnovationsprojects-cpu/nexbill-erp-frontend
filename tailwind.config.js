/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warmBeige: "#E8DCCF",
        softCream: "#F8F5F2",
        lightSand: "#EFE7DE",
        darkCharcoal: "#2D2D2D",
        softBrown: "#8B7355",
        warmGray: "#D6D3D1",
        goldAccent: "#C6A969",
      },
    },
  },
  plugins: [],
};