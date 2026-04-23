/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0078D4', dark: '#005A9E', light: '#00BCF2' },
        accent:  { DEFAULT: '#D83B01', light: '#FF6B35' },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'fade-in':  'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float':    'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 },                                    to: { opacity: 1 } },
        slideUp: { from: { transform: 'translateY(20px)', opacity: 0 },     to: { transform: 'translateY(0)', opacity: 1 } },
        scaleIn: { from: { transform: 'scale(0.9)', opacity: 0 },           to: { transform: 'scale(1)', opacity: 1 } },
        float:   { '0%,100%': { transform: 'translateY(0px)' },             '50%': { transform: 'translateY(-8px)' } },
      },
      backgroundImage: {
        'hero-gradient':  'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        'card-gradient':  'linear-gradient(145deg, #1a1a2e, #16213e)',
        'azure-gradient': 'linear-gradient(135deg, #0078D4, #00BCF2)',
      },
    },
  },
  plugins: [],
};