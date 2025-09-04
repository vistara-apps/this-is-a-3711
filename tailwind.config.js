/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(0 0% 4%)',
        accent: 'hsl(36 90% 55%)',
        primary: 'hsl(240 86% 55%)',
        surface: 'hsl(0 0% 10%)',
        secondary: 'hsl(200 90% 50%)',
        'text-primary': 'hsl(0 0% 95%)',
        'text-secondary': 'hsl(0 0% 70%)',
      },
      borderRadius: {
        'sm': '6px',
        'md': '12px',
        'lg': '18px',
      },
      spacing: {
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(0,0%,0%,0.2)',
        'focus': '0 0 0 3px hsla(240,86%,55%,0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 400ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}