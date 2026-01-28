import { create } from "zustand";
import { MMKV } from "react-native-mmkv";

const storage = new MMKV({ id: "cardkeeper-draft" });

interface CardDraft {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  address?: string;
  website?: string;
  memo?: string;
  folderId?: string;
  tagIds?: string[];
  imageUrl?: string;
}

interface ScanDraft {
  scanId: string;
  data: CardDraft;
}

interface DraftState {
  newCardDraft: CardDraft | null;
  scanDraft: ScanDraft | null;
  setNewCardDraft: (data: CardDraft) => void;
  clearNewCardDraft: () => void;
  setScanDraft: (draft: ScanDraft) => void;
  clearScanDraft: () => void;
  hasDraft: () => boolean;
}

function loadNewCardDraft(): CardDraft | null {
  try {
    const stored = storage.getString("newCardDraft");
    return stored ? (JSON.parse(stored) as CardDraft) : null;
  } catch {
    return null;
  }
}

function loadScanDraft(): ScanDraft | null {
  try {
    const stored = storage.getString("scanDraft");
    return stored ? (JSON.parse(stored) as ScanDraft) : null;
  } catch {
    return null;
  }
}

export const useDraftStore = create<DraftState>((set, get) => ({
  newCardDraft: loadNewCardDraft(),
  scanDraft: loadScanDraft(),

  setNewCardDraft: (data) => {
    try {
      storage.set("newCardDraft", JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
    set({ newCardDraft: data });
  },

  clearNewCardDraft: () => {
    storage.delete("newCardDraft");
    set({ newCardDraft: null });
  },

  setScanDraft: (draft) => {
    try {
      storage.set("scanDraft", JSON.stringify(draft));
    } catch {
      // Ignore storage errors
    }
    set({ scanDraft: draft });
  },

  clearScanDraft: () => {
    storage.delete("scanDraft");
    set({ scanDraft: null });
  },

  hasDraft: () => get().newCardDraft !== null || get().scanDraft !== null,
}));
