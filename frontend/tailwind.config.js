// tailwind.config.js
export default {
  darkMode: 'class', // <-- Enable dark mode via class
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0D6EFD",
        accent: "#3B82F6",
        bgLight: "#F5F7FA",
        cardBg: "#FFFFFF",
        darkBg: "#1E293B", // dark card background
        textDark: "#1A1A1A",
        textGray: "#6B7280",
        darkText: "#E5E7EB",
      },
      borderRadius: {
        '3xl': '1.5rem',
      },
      boxShadow: {
        'xl-strong': '0 10px 25px rgba(0, 0, 0, 0.1)',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
    'slide-in': 'slideIn 0.3s ease-out forwards',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
