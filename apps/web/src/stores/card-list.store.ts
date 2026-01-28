"use client";

import { create } from "zustand";

interface CardListState {
  hasNextPage: boolean;
  recentlyAddedId: string | null;
  recentlyDeletedIds: string[];
  setHasNextPage: (hasNext: boolean) => void;
  setRecentlyAddedId: (id: string | null) => void;
  addRecentlyDeletedId: (id: string) => void;
  clearRecentlyDeletedIds: () => void;
}

export const useCardListStore = create<CardListState>((set) => ({
  hasNextPage: false,
  recentlyAddedId: null,
  recentlyDeletedIds: [],

  setHasNextPage: (hasNext) => set({ hasNextPage: hasNext }),

  setRecentlyAddedId: (id) => set({ recentlyAddedId: id }),

  addRecentlyDeletedId: (id) =>
    set((state) => ({
      recentlyDeletedIds: [...state.recentlyDeletedIds, id],
    })),

  clearRecentlyDeletedIds: () => set({ recentlyDeletedIds: [] }),
}));
