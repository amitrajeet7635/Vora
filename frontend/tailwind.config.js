/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode colors
        light: {
          bg: '#F8FAFC',
          text: '#1E293B',
          accent: '#00C9A7',
          card: '#FFFFFF',
          border: '#E2E8F0',
        },
        // Dark mode colors
        dark: {
          bg: '#0F172A',
          text: '#E2E8F0',
          accent: '#00C9A7',
          card: '#1E293B',
          border: '#334155',
        },
        // Social colors
        google: {
          DEFAULT: '#4285F4',
          hover: '#357ae8',
        },
        facebook: {
          DEFAULT: '#1877F2',
          hover: '#0d65d9',
        },
        // Accent color
        teal: {
          DEFAULT: '#00C9A7',
          hover: '#00b396',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        poppins: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.08)',
        'soft-dark': '0 2px 15px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 20px rgba(0, 201, 167, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
