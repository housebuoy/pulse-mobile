// Generic client-side search/filter helpers shared by any screen with a
// SearchBar + filter sheet (Records, Book Appointment, ...).

export function matchesQuery(fields: string[], query: string): boolean {
  if (!query.trim()) return true;
  const needle = query.trim().toLowerCase();
  return fields.some((field) => field.toLowerCase().includes(needle));
}

export function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}
