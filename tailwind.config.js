/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
 
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0e7ff',
          100: '#d0b3ff',
          200: '#b380ff',
          300: '#954dff',
          400: '#7c1aff',
          500: '#6600e6',
          600: '#5200b3',
          700: '#3d0080',
          800: '#29004d',
          900: '#14001a',
        },
        neon: {
          purple: '#9945FF',
          green: '#14F195',
          blue: '#00C2FF',
          pink: '#FF6B9D',
          yellow: '#FFD93D',
        },
        dark: {
          900: '#0A0A1A',
          800: '#0F0F2A',
          700: '#151538',
          600: '#1C1C4A',
          500: '#25255C',
        },
        glass: {
          white: 'rgba(255, 255, 255, 0.05)',
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.15)',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'gradient': 'gradient 8s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(153, 69, 255, 0.5)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(153, 69, 255, 0.8)' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(153, 69, 255, 0.1), rgba(20, 241, 149, 0.1))',
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(153, 69, 255, 0.5), 0 0 40px rgba(153, 69, 255, 0.2)',
        'neon-green': '0 0 20px rgba(20, 241, 149, 0.5), 0 0 40px rgba(20, 241, 149, 0.2)',
        'neon-blue': '0 0 20px rgba(0, 194, 255, 0.5), 0 0 40px rgba(0, 194, 255, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.2)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}