import { Prisma } from "@prisma/client";

/**
 * Build a raw SQL fragment for PostgreSQL full-text search using tsvector.
 * Returns a Prisma.Sql fragment suitable for use in raw queries.
 */
export function buildSearchQuery(search: string): Prisma.Sql {
  if (!search || search.trim().length === 0) {
    return Prisma.sql`TRUE`;
  }

  const sanitized = search
    .trim()
    .replace(/[^\w\s가-힣]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => `${term}:*`)
    .join(" & ");

  if (!sanitized) {
    return Prisma.sql`TRUE`;
  }

  return Prisma.sql`to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(company, '') || ' ' || coalesce("jobTitle", '')) @@ to_tsquery('simple', ${sanitized})`;
}

/**
 * Build a Prisma where condition for basic LIKE/contains search
 * across name, company, and jobTitle fields.
 */
export function buildSearchCondition(search?: string): object | undefined {
  if (!search || search.trim().length === 0) {
    return undefined;
  }

  const trimmed = search.trim();

  return {
    OR: [
      { name: { contains: trimmed, mode: "insensitive" as const } },
      { company: { contains: trimmed, mode: "insensitive" as const } },
      { jobTitle: { contains: trimmed, mode: "insensitive" as const } },
    ],
  };
}
