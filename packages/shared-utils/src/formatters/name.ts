export function formatDisplayName(
  name: string | null | undefined,
  email?: string | null
): string {
  if (name && name.trim()) {
    return name.trim();
  }
  if (email) {
    return email.split("@")[0] || email;
  }
  return "사용자";
}

export function getInitials(
  name: string | null | undefined,
  maxLength = 2
): string {
  if (!name || !name.trim()) {
    return "?";
  }

  const trimmed = name.trim();

  // Korean names: use last 2 characters (given name)
  const koreanMatch = trimmed.match(/[\uAC00-\uD7A3]/g);
  if (koreanMatch && koreanMatch.length >= 2) {
    // For Korean names, first char is usually family name
    return trimmed.slice(0, Math.min(maxLength, trimmed.length));
  }

  // English/other names: use first letter of each word
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return parts
      .slice(0, maxLength)
      .map((p) => p[0]!.toUpperCase())
      .join("");
  }

  return trimmed.slice(0, maxLength).toUpperCase();
}
