"use client";

import { create } from "zustand";
import type { CreateCardInput } from "@cardkeeper/shared-utils";

type PartialCardDraft = Partial<CreateCardInput>;

interface DraftState {
  draft: PartialCardDraft | null;
  setDraft: (data: PartialCardDraft) => void;
  clearDraft: () => void;
  hasDraft: () => boolean;
}

const STORAGE_KEY = "cardkeeper-card-draft";

function loadDraft(): PartialCardDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as PartialCardDraft) : null;
  } catch {
    return null;
  }
}

function saveDraft(data: PartialCardDraft | null): void {
  if (typeof window === "undefined") return;
  try {
    if (data) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export const useDraftStore = create<DraftState>((set, get) => ({
  draft: loadDraft(),
  setDraft: (data) => {
    saveDraft(data);
    set({ draft: data });
  },
  clearDraft: () => {
    saveDraft(null);
    set({ draft: null });
  },
  hasDraft: () => get().draft !== null,
}));
