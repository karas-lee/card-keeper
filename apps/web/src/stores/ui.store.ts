"use client";

import { create } from "zustand";

type ViewMode = "grid" | "list" | "table";

interface UiState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedCardIds: string[];
  toggleCardSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  toggleAllCards: (ids: string[]) => void;
  clearSelection: () => void;
  isSelectionMode: boolean;
  setSelectionMode: (mode: boolean) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  viewMode: "grid",
  setViewMode: (mode) => set({ viewMode: mode }),
  selectedCardIds: [],
  toggleCardSelection: (id) =>
    set((state) => ({
      selectedCardIds: state.selectedCardIds.includes(id)
        ? state.selectedCardIds.filter((i) => i !== id)
        : [...state.selectedCardIds, id],
    })),
  selectAll: (ids) => set({ selectedCardIds: ids }),
  toggleAllCards: (ids) =>
    set((state) => {
      const allSelected = ids.every((id) => state.selectedCardIds.includes(id));
      return { selectedCardIds: allSelected ? [] : ids };
    }),
  clearSelection: () => set({ selectedCardIds: [], isSelectionMode: false }),
  isSelectionMode: false,
  setSelectionMode: (mode) =>
    set({ isSelectionMode: mode, selectedCardIds: [] }),
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
