import type { User } from "./entities/user";

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  hydrate: () => void;
  setLoading: (loading: boolean) => void;
}

export interface UiState {
  sidebarOpen: boolean;
  searchQuery: string;
  selectedCardIds: string[];
  viewMode: "grid" | "list";
  setSidebarOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCardIds: (ids: string[]) => void;
  toggleCardSelection: (id: string) => void;
  clearSelection: () => void;
  setViewMode: (mode: "grid" | "list") => void;
}

export interface DraftState {
  scanResult: {
    name: string;
    company: string;
    jobTitle: string;
    contacts: Array<{
      type: string;
      value: string;
      label?: string;
    }>;
    address: string;
    website: string;
    imageUrl: string;
  } | null;
  setScanResult: (result: DraftState["scanResult"]) => void;
  clearDraft: () => void;
}
