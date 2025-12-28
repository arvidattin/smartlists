/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
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
        "display": ["Inter_400Regular", "System"],
        "display-medium": ["Inter_500Medium", "System"],
        "display-bold": ["Inter_700Bold", "System"],
      },
    },
  },
  plugins: [],
}
