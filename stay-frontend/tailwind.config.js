/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ptpn: {
          50: '#e6f2dd',
          100: '#d3ecd0',
          200: '#b1d3b9',
          300: '#9ac2a6',
          400: '#88bda4',
          500: '#74aa93',
          600: '#659287', // Primary Brand Color
          700: '#46645d',
          800: '#2b3d39',
          900: '#1b2624',
          950: '#0e1413',
        },
        teal: {
          50: '#e6f2dd',
          100: '#d3ecd0',
          200: '#b1d3b9',
          300: '#9ac2a6',
          400: '#88bda4',
          500: '#74aa93',
          600: '#659287',
          650: '#588177',
          655: '#4f736a',
          700: '#46645d',
          800: '#2b3d39',
          900: '#1b2624',
          950: '#0e1413',
        },
        emerald: {
          50: '#e6f2dd',
          100: '#d3ecd0',
          200: '#b1d3b9',
          300: '#9ac2a6',
          400: '#88bda4',
          500: '#74aa93',
          600: '#659287',
          700: '#46645d',
          800: '#2b3d39',
          900: '#1b2624',
          950: '#0e1413',
        },
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43', // Dark background accent
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
