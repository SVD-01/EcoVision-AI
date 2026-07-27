import { create } from "zustand";
import { persist } from "zustand/middleware";

type ThemeState = {
  dark: boolean;
  toggleTheme: () => void;
  setDark: (dark: boolean) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      dark: true,
      toggleTheme: () => set((state) => ({ dark: !state.dark })),
      setDark: (dark) => set({ dark }),
    }),
    { name: "ecovision-theme" },
  ),
);