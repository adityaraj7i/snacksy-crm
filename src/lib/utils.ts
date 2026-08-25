import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyNPR(amountInPaisaOrRupees: number): string {
  // Stored as integer paisa (1 NPR = 100 paisa)
  const rupees = amountInPaisaOrRupees / 100;
  const formattedNumber = new Intl.NumberFormat("en-NP", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
  return `रू ${formattedNumber}`;
}

export function formatNepalPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("977")) {
    return `+${cleaned}`;
  }
  if (cleaned.length === 10 && (cleaned.startsWith("98") || cleaned.startsWith("97"))) {
    return `+977${cleaned}`;
  }
  return phone;
}
