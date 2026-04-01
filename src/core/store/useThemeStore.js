import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      mode: 'light', // 'light' o 'dark'
      accent: 'white', // Cambiamos el default a 'none' para que empiece neutro
      wallpaper: '',
      
      setMode: (mode) => {
        set({ mode });
        // Inyectamos la clase dark directamente en el html
        if (mode === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      setAccent: (accent) => {
        set({ accent });
        // Inyectamos el atributo de color
        document.documentElement.setAttribute('data-accent', accent);
      },
      setWallpaper: (url) => set({ wallpaper: url }),
    }),
    {
      name: 'midesk-theme-storage',
      // Esto se asegura de pintar la app antes de que React termine de cargar
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.mode === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          if (state.accent) {
            document.documentElement.setAttribute('data-accent', state.accent);
          }
        }
      },
    }
  )
);