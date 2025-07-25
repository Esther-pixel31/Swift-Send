/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0D6EFD",       // Buttons, headers
        accent: "#3B82F6",        // Hover, links, focus
        bgLight: "#F5F7FA",       // Page background
        cardBg: "#FFFFFF",        // Form containers
        textDark: "#1A1A1A",      // Headings
        textGray: "#6B7280",      // Body/subtext
      },
      borderRadius: {
        '3xl': '1.5rem',          // Card container corners
      },
      boxShadow: {
        'xl-strong': '0 10px 25px rgba(0, 0, 0, 0.1)', // Form card shadows
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'], // Optional: use this in index.css
      },
    },
  },
  plugins: [],
}
