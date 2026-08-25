/**
 * Safe, non-destructive email normalization helper.
 * Trims whitespace and converts domain/local part to lowercase.
 */
export function normalizeEmail(rawEmail: string | null | undefined): string | null {
  if (!rawEmail) return null;
  const trimmed = rawEmail.trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@")) return null;
  return trimmed;
}
