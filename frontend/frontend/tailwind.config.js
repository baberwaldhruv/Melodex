/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        reddit: {
          bg: '#0E1113',
          card: '#1A1A1B',
          cardHover: '#272729',
          border: '#343536',
          orange: '#FF4500',
          blue: '#7193FF',
          text: '#D7DADC',
          muted: '#818384',
          sidebar: '#1A1A1B',
        },
        spotify: {
          green: '#1DB954',
          black: '#121212',
          card: '#181818',
        },
      },
    },
  },
  plugins: [],
};