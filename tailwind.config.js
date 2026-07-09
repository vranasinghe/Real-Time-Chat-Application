/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#0E0720",
          surface: "#1B1035",
          gradientTop: "#1A0F3D",
        },
        primary: {
          DEFAULT: "#7C5CFF",
          pressed: "#6A4AE0",
        },
        like: "#FF2E6E",
        online: "#22C55E",
        text: {
          primary: "#FFFFFF",
          secondary: "#9A8FB8",
        },
        frosted: "rgba(255, 255, 255, 0.15)",
      },
      fontFamily: {
        // Display headings — SpaceGrotesk Bold
        display: ["SpaceGrotesk_700Bold", "System"],
        displaySemi: ["SpaceGrotesk_600SemiBold", "System"],
        displayItalic: ["SpaceGrotesk_700Bold", "System"],
        // Body text — Inter
        sans: ["Inter_400Regular", "System"],
        sansMedium: ["Inter_500Medium", "System"],
        sansSemi: ["Inter_600SemiBold", "System"],
        sansBold: ["Inter_700Bold", "System"],
      },
    },
  },
  plugins: [],
}
