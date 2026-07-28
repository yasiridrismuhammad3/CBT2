/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        damale: {
          navy: {
            900: '#060D1A',
            800: '#0A192F',
            700: '#112240',
            600: '#1E3A8A',
            500: '#2563EB',
          },
          gold: {
            600: '#B45309',
            500: '#D97706',
            400: '#F59E0B',
            300: '#FBBF24',
          },
          white: '#F8FAFC'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(10, 25, 47, 0.12)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'gold-glow': '0 0 20px rgba(245, 158, 11, 0.35)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
