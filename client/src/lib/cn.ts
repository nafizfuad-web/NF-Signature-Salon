// NF Signature Salon — Utility to merge Tailwind CSS classes
// Filters out falsy values and joins the rest with a single space.
// Keeps reusable components free of class-name string concatenation logic.

export function cn(...classes: Array<string | undefined | null | false>): string {
  return classes.filter((cls): cls is string => Boolean(cls)).join(' ')
}
