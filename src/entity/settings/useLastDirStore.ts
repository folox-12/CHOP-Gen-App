import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

type LastDirState = {
  lastDir: string | null;
  setLastDir: (dir: string) => void;
};

export const useLastDirStore = create<LastDirState>()(
  devtools(
    persist(
      (set) => ({
        lastDir: null,
        setLastDir: (dir) => set({ lastDir: dir }),
      }),
      { name: "last-dir-storage" },
    ),
    { name: "LastDirStore" },
  ),
);
