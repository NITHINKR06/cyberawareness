/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          50: '#f2fbff',
          100: '#d9f6ff',
          200: '#b3ecff',
          300: '#80deff',
          400: '#4dd2ff',
          500: '#1ec8ff',
          600: '#00b2e6',
          700: '#008db3',
          800: '#006a85',
          900: '#004a5e'
        },
        midnight: {
          900: '#0b1020',
          800: '#0f172a',
          700: '#111827',
          600: '#1f2937'
        },
        accent: {
          blue: '#60a5fa',
          purple: '#a78bfa',
          pink: '#f472b6',
          cyan: '#22d3ee',
          lime: '#a3e635'
        }
      },
      boxShadow: {
        neon: '0 0 20px rgba(30, 200, 255, 0.35), 0 0 60px rgba(99, 102, 241, 0.25)',
        glow: '0 0 10px rgba(99, 102, 241, 0.4)'
      },
      borderColor: {
        glass: 'rgba(255,255,255,0.12)'
      },
      backdropBlur: {
        'xs': '2px'
      },
      maxWidth: {
        '8xl': '96rem'
      }
    },
  },
  plugins: [],
};
