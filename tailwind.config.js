/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sapphire: {
          50:  '#f0f5fc',
          100: '#e0ecf9',
          200: '#c6def5',
          300: '#9ec7ee',
          400: '#6ea8e4',
          500: '#478ad8',
          600: '#326ec8',
          700: '#2756b1',
          800: '#234690',
          850: '#1a3773',
          900: '#152d5b',
          950: '#0c1a36',
        },
        amber: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(15, 43, 92, 0.06), 0 1px 4px -1px rgba(15, 43, 92, 0.04)',
        'card-hover': '0 12px 24px -6px rgba(15, 43, 92, 0.12), 0 6px 10px -4px rgba(15, 43, 92, 0.06)',
        'sapphire-glow': '0 8px 24px -4px rgba(21, 62, 117, 0.35)',
        'amber-glow': '0 8px 24px -4px rgba(245, 158, 11, 0.4)',
        'fab': '0 8px 24px -4px rgba(245, 158, 11, 0.45)',
      },
      animation: {
        'slide-up': 'slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.2s ease-out',
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
    },
  },
  plugins: [],
}
