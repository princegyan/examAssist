/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        primary: '#3B82F6',
        secondary: '#1F2937',
        success: '#10B981',
        error: '#EF4444',
      },
    },
  },
  plugins: [],
}
