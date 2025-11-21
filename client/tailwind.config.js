/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        twitch: {
          dark: '#0e0e10',
          card: '#18181b',
          brand: '#9146FF',
          'brand-dark': '#772ce8',
          text: '#efeff1',
          muted: '#adadb8',
          accent: '#00f0ff', // Cyan neon para acentos gaming
          success: '#00ff94',
          warning: '#ffb300',
          error: '#ff4f4d',
          surface: '#1f1f23',
          'surface-hover': '#26262c'
        }
      },
      animation: {
        'bounce-in': 'bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
      },
      keyframes: {
        'bounce-in': {
          '0%': { opacity: '0', transform: 'scale(0.3) translateY(20px)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}