import { create } from "zustand";
import type { ReactNode } from "react";

interface WorkspaceState {
  isRightPanelOpen: boolean;
  rightPanelContent: ReactNode | null;
  rightPanelTitle: string;
  isCommandPaletteOpen: boolean;
  
  openRightPanel: (title: string, content: ReactNode) => void;
  closeRightPanel: () => void;
  
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  isRightPanelOpen: false,
  rightPanelContent: null,
  rightPanelTitle: "",
  isCommandPaletteOpen: false,

  openRightPanel: (title, content) =>
    set({ isRightPanelOpen: true, rightPanelTitle: title, rightPanelContent: content }),
  closeRightPanel: () =>
    set({ isRightPanelOpen: false }),

  openCommandPalette: () =>
    set({ isCommandPaletteOpen: true }),
  closeCommandPalette: () =>
    set({ isCommandPaletteOpen: false }),
  toggleCommandPalette: () =>
    set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
}));
