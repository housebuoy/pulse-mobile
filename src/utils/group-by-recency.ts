export type RecencyRow<T> = { type: 'item'; item: T } | { type: 'divider'; label: string };

// Sorts newest-first and drops in a single "OLDER RECORDS" divider right
// before the first record from a previous year, if any — used to group
// each Records tab's list the same way.
export function withRecencyDivider<T>(
  items: T[],
  getDate: (item: T) => string,
  label = 'OLDER RECORDS'
): RecencyRow<T>[] {
  const sorted = [...items].sort((a, b) => (getDate(a) < getDate(b) ? 1 : -1));
  if (sorted.length === 0) return [];

  const currentYear = new Date().getFullYear();
  const rows: RecencyRow<T>[] = [];
  let dividerInserted = false;

  for (const item of sorted) {
    const year = new Date(getDate(item)).getFullYear();
    if (!dividerInserted && year < currentYear) {
      rows.push({ type: 'divider', label });
      dividerInserted = true;
    }
    rows.push({ type: 'item', item });
  }

  return rows;
}
