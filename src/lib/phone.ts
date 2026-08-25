/**
 * Nepal-friendly E.164 phone parser & normalizer.
 * Supports inputs like:
 * - 9841234567 -> +9779841234567
 * - +9779841234567 -> +9779841234567
 * - 9779841234567 -> +9779841234567
 * - 01-4234567 -> +97714234567
 * - International numbers like +14155552671 -> +14155552671
 */
export function normalizePhoneNumber(rawPhone: string | null | undefined): string | null {
  if (!rawPhone) return null;

  // Trim whitespace
  const trimmed = rawPhone.trim();
  if (!trimmed) return null;

  // Extract digits and leading '+'
  const hasPlus = trimmed.startsWith("+");
  const digitsOnly = trimmed.replace(/\D/g, "");

  if (!digitsOnly) return null;

  // Case 1: Standard Nepal mobile number starting with 98 or 97 (10 digits)
  if (digitsOnly.length === 10 && (digitsOnly.startsWith("98") || digitsOnly.startsWith("97"))) {
    return `+977${digitsOnly}`;
  }

  // Case 2: Full E.164 string starting with 977 (13 digits)
  if (digitsOnly.startsWith("977") && digitsOnly.length === 13) {
    return `+${digitsOnly}`;
  }

  // Case 3: Landline starting with 01 or 1 (e.g. 014234567 -> +97714234567)
  if (digitsOnly.startsWith("01") && digitsOnly.length === 9) {
    return `+977${digitsOnly.substring(1)}`;
  }

  // Case 4: General E.164 with plus prefix
  if (hasPlus) {
    return `+${digitsOnly}`;
  }

  // Default fallback: prepend +977 if 10 digits
  if (digitsOnly.length === 10) {
    return `+977${digitsOnly}`;
  }

  return `+${digitsOnly}`;
}
