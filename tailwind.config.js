/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#64D7BE',
          light: '#8CE2CF',
          dark: '#4CB89F',
          50: '#F0FAF7',
          100: '#D1F3EA',
          200: '#A3E7D6',
          300: '#75DBC2',
          400: '#64D7BE', // Main brand color
          500: '#4CB89F',
          600: '#3A9A85',
          700: '#2B7C6B',
          800: '#1D5E51',
          900: '#0E4037',
        }
      }
    },
  },
  plugins: [],
};