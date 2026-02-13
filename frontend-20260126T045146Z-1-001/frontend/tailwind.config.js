/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'drop-in': 'drop-in 0.6s ease-out',
        'bounce': 'bounce 0.5s ease-in-out',
      },
      keyframes: {
        'drop-in': {
          '0%': { opacity: '0', transform: 'translateY(-20px) scale(0.9)' },
          '50%': { opacity: '0.5', transform: 'translateY(-10px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'bounce': {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-10px)' },
          '60%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}
