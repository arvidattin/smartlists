/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#135bec",
        "background-light": "#f6f6f8",
        "background-dark": "#101622",
        "surface-dark": "#1c222e",
        "surface-light": "#ffffff",
      },
      fontFamily: {
        "display": ["System", "sans-serif"] // Using System font for now, ideally Inter if we load it
      },
    },
  },
  plugins: [],
}
