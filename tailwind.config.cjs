module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        salient: {
          blue: '#3b82f6',
          pink: '#ec4899',
          gradientStart: '#3b82f6',
          gradientEnd: '#ec4899',
        },
      },
      backgroundImage: {
        'salient-gradient': 'linear-gradient(90deg, #3b82f6, #ec4899)',
      },
      boxShadow: {
        'salient-soft': '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};