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
          bg: "#0B0F17",
          panel: "#151C2C",
          border: "#232F48",
          accent: "#3B82F6",
          red: "#EF4444",
          amber: "#F59E0B",
          emerald: "#10B981",
          purple: "#8B5CF6"
        }
      }
    },
  },
  plugins: [],
}
