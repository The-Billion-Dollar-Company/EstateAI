import { create } from 'zustand';

interface UiState {
  theme: 'light' | 'dark';
  isMobileNavOpen: boolean;
  toggleTheme: () => void;
  setMobileNavOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'light',
  isMobileNavOpen: false,
  toggleTheme: () =>
    set((state) => {
      const theme = state.theme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', theme === 'dark');
      return { theme };
    }),
  setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),
}));
