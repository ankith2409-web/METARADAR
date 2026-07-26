/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        radar: {
          bg: "#0A0B0D",
          surface1: "#131417",
          surface2: "#1A1B1F",
          surface3: "#212226",
          border: "#262830",
          accent: "#3B82F6",
          teal: "#14B8A6",
          amber: "#F59E0B",
          orange: "#F97316",
          red: "#EF4444",
          purple: "#A855F7",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
