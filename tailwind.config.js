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
        // 🟠 Laranja Primário (#FF6B00): Destaque principal, energia, apetite, botões de ação e acabamentos
        primary: {
          DEFAULT: '#FF6B00',
          hover: '#E66000',
          active: '#CC5500',
          light: '#FFF0E5',
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#FF6B00',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
          950: '#431407',
        },
        // 🟢 Verde Resultados (#10B981): Métricas de sucesso, crescimento, confirmações e status online
        success: {
          DEFAULT: '#10B981',
          hover: '#059669',
          light: '#ECFDF5',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },
        // 🔵 Azul Escuro / Navy (#1E293B e #0F172A): Base tecnológica, sidebar, painéis executivos e estabilidade
        navy: {
          DEFAULT: '#1E293B',
          dark: '#0F172A',
          darker: '#0B0F19',
          light: '#334155',
          card: '#1E293B',
          border: '#334155',
          panel: '#0F172A',
        },
        // ⚪ Off White (#F8FAFC): Fundo no tema claro com respiro e sobriedade
        offwhite: {
          DEFAULT: '#F8FAFC',
          50: '#FFFFFF',
          100: '#F8FAFC',
          200: '#F1F5F9',
          300: '#E2E8F0',
        },
        // Marca Oficial eloGastrô
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
        // Mapeamento das classes Tailwind purple e indigo para a paleta oficial eloGastrô
        // (Garante consistência total no SaaS Master e botões legados)
        purple: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#FF6B00',
          600: '#FF6B00',
          700: '#E66000',
          800: '#C2410C',
          900: '#7C2D12',
          950: '#1E293B',
        },
        indigo: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#FF6B00',
          600: '#FF6B00',
          700: '#E66000',
          800: '#C2410C',
          900: '#7C2D12',
          950: '#0F172A',
        },
        brand: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          500: '#FF6B00',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
          950: '#431407',
        },
        surface: {
          dark: '#0F172A',
          card: '#1E293B',
          border: '#334155',
        }
      },
    },
  },
  plugins: [],
}
