/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',  // ← corrigido: era {js,jsx}
  ],
  theme: {
    extend: {
      colors: {
        green: {
          50:  '#e8faea',
          400: '#3ec84a',
          500: '#2dc93a',
          600: '#2aa835',
          700: '#1f8a29',
        },
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm:   ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
