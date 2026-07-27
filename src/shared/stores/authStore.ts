import { create } from "zustand";
import { persist } from "zustand/middleware";

export type EcoUser = {
  name: string;
  email: string;
  role: string;
  avatar?: string;
  city: string;
};

type AuthState = {
  token: string | null;
  user: EcoUser;
  login: (email: string, name?: string) => void;
  logout: () => void;
  updateUser: (user: Partial<EcoUser>) => void;
};

const defaultUser: EcoUser = {
  name: "Alex Rivera",
  email: "alex@ecovision.ai",
  role: "Sustainability Lead",
  city: "San Francisco",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: "mock-jwt-session",
      user: defaultUser,
      login: (email, name) => {
        localStorage.setItem("ecovision-token", "mock-jwt-session");
        set({ token: "mock-jwt-session", user: { ...defaultUser, email, name: name || defaultUser.name } });
      },
      logout: () => {
        localStorage.removeItem("ecovision-token");
        set({ token: null });
      },
      updateUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),
    }),
    { name: "ecovision-auth" },
  ),
);