import { useState } from "react";
import { useDebounce } from "./use-debounce";

export function useSearch(delay = 300) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, delay);
  return { query, setQuery, debouncedQuery };
}
