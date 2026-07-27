import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ScanResult } from "../api/types";

type EcoState = {
  scanHistory: ScanResult[];
  completedChallenges: string[];
  addScan: (scan: ScanResult) => void;
  completeChallenge: (challengeId: string) => void;
  clearHistory: () => void;
};

export const useEcoStore = create<EcoState>()(
  persist(
    (set) => ({
      scanHistory: [],
      completedChallenges: [],
      addScan: (scan) => set((state) => ({ scanHistory: [scan, ...state.scanHistory].slice(0, 20) })),
      completeChallenge: (challengeId) =>
        set((state) => ({ completedChallenges: Array.from(new Set([...state.completedChallenges, challengeId])) })),
      clearHistory: () => set({ scanHistory: [] }),
    }),
    { name: "ecovision-activity" },
  ),
);