import { create } from "zustand";
import { MMKV } from "react-native-mmkv";

const storage = new MMKV({ id: "cardkeeper-ui" });

type CardViewMode = "list" | "grid";
type SortOrder = "asc" | "desc";

interface Filters {
  folderId: string | null;
  tagIds: string[];
  dateRange: { start: string | null; end: string | null };
}

const DEFAULT_FILTERS: Filters = {
  folderId: null,
  tagIds: [],
  dateRange: { start: null, end: null },
};

interface UiState {
  cardViewMode: CardViewMode;
  selectionMode: boolean;
  selectedCardIds: string[];
  searchQuery: string;
  recentSearches: string[];
  filters: Filters;
  sortOrder: SortOrder;
  setCardViewMode: (mode: CardViewMode) => void;
  toggleSelectionMode: () => void;
  toggleCardSelection: (id: string) => void;
  clearSelection: () => void;
  setSearchQuery: (query: string) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
  setSortOrder: (order: SortOrder) => void;
}

function loadPersistedState() {
  const cardViewMode =
    (storage.getString("cardViewMode") as CardViewMode) || "grid";
  const sortOrder =
    (storage.getString("sortOrder") as SortOrder) || "desc";
  let recentSearches: string[] = [];
  try {
    const stored = storage.getString("recentSearches");
    if (stored) recentSearches = JSON.parse(stored);
  } catch {
    // Ignore parse errors
  }
  return { cardViewMode, sortOrder, recentSearches };
}

export const useUiStore = create<UiState>((set) => {
  const persisted = loadPersistedState();

  return {
    cardViewMode: persisted.cardViewMode,
    selectionMode: false,
    selectedCardIds: [],
    searchQuery: "",
    recentSearches: persisted.recentSearches,
    filters: DEFAULT_FILTERS,
    sortOrder: persisted.sortOrder,

    setCardViewMode: (mode) => {
      storage.set("cardViewMode", mode);
      set({ cardViewMode: mode });
    },

    toggleSelectionMode: () =>
      set((state) => ({
        selectionMode: !state.selectionMode,
        selectedCardIds: state.selectionMode ? [] : state.selectedCardIds,
      })),

    toggleCardSelection: (id) =>
      set((state) => ({
        selectedCardIds: state.selectedCardIds.includes(id)
          ? state.selectedCardIds.filter((i) => i !== id)
          : [...state.selectedCardIds, id],
      })),

    clearSelection: () =>
      set({ selectedCardIds: [], selectionMode: false }),

    setSearchQuery: (query) => set({ searchQuery: query }),

    addRecentSearch: (query) =>
      set((state) => {
        const trimmed = query.trim();
        if (!trimmed) return state;
        const filtered = state.recentSearches.filter((s) => s !== trimmed);
        const updated = [trimmed, ...filtered].slice(0, 10);
        storage.set("recentSearches", JSON.stringify(updated));
        return { recentSearches: updated };
      }),

    clearRecentSearches: () => {
      storage.delete("recentSearches");
      set({ recentSearches: [] });
    },

    setFilters: (filters) =>
      set((state) => ({
        filters: { ...state.filters, ...filters },
      })),

    resetFilters: () => set({ filters: DEFAULT_FILTERS }),

    setSortOrder: (order) => {
      storage.set("sortOrder", order);
      set({ sortOrder: order });
    },
  };
});
