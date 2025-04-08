/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tetris-blue': '#0341AE',
        'tetris-red': '#DD0000',
        'tetris-cyan': '#00CCCC',
        'tetris-orange': '#FF8C00',
        'tetris-yellow': '#FFCC00',
        'tetris-green': '#00CC00',
        'tetris-purple': '#9900CC',
      },
    },
  },
  plugins: [],
} 
