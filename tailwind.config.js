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
        elogastro: {
          orange: '#FF6B00',
          'orange-hover': '#E66000',
          'orange-light': '#FFF0E5',
          green: '#10B981',
          'green-hover': '#059669',
          'green-light': '#ECFDF5',
          navy: '#1E293B',
          'navy-dark': '#0F172A',
          'navy-light': '#334155',
          offwhite: '#F8FAFC',
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        surface: {
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
        }
      },
    },
  },
  plugins: [],
}
