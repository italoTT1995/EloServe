import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TipoTema = 'dark' | 'light';

interface ThemeState {
  tema: TipoTema;
  alternarTema: () => void;
  setTema: (tema: TipoTema) => void;
}

export function aplicarClasseTema(tema: TipoTema) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const body = document.body;

  if (tema === 'light') {
    root.classList.add('theme-light');
    root.classList.remove('theme-dark', 'dark');
    root.setAttribute('data-theme', 'light');
    body.classList.add('theme-light');
    body.classList.remove('theme-dark', 'dark');
  } else {
    root.classList.add('theme-dark', 'dark');
    root.classList.remove('theme-light');
    root.setAttribute('data-theme', 'dark');
    body.classList.add('theme-dark', 'dark');
    body.classList.remove('theme-light');
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      tema: 'dark',
      alternarTema: () => {
        const proximoTema: TipoTema = get().tema === 'dark' ? 'light' : 'dark';
        set({ tema: proximoTema });
        aplicarClasseTema(proximoTema);
      },
      setTema: (tema: TipoTema) => {
        set({ tema });
        aplicarClasseTema(tema);
      },
    }),
    {
      name: 'eloserve_theme_preference',
      onRehydrateStorage: () => (state) => {
        if (state) {
          aplicarClasseTema(state.tema);
        }
      },
    }
  )
);

// Aplica o tema imediatamente ao carregar o script
if (typeof window !== 'undefined') {
  try {
    const salvo = localStorage.getItem('eloserve_theme_preference');
    if (salvo) {
      const parsed = JSON.parse(salvo);
      if (parsed?.state?.tema) {
        aplicarClasseTema(parsed.state.tema);
      }
    }
  } catch (e) {
    // Silencia em caso de parse inicial
  }
}
