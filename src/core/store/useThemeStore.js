import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      mode: 'dark', // 'light' o 'dark'
      accent: 'purple', // color por defecto: 'blue', 'purple', 'pink', 'green', 'orange'
      
      setMode: (mode) => set({ mode }),
      setAccent: (accent) => set({ accent }),
    }),
    {
      name: 'midesk-theme-storage', // Nombre en el localStorage
    }
  )
);