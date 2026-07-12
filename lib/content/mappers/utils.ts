import type { ValueRow } from '@/types/database';

export function sortByOrder<T extends { sort_order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sort_order - b.sort_order);
}

type TagTypeRow = ValueRow & { tag_type: string };
type ListTypeRow = ValueRow & { list_type: string };

export function tagValuesByType(rows: TagTypeRow[], type: string): string[] {
  return sortByOrder(rows.filter((row) => row.tag_type === type)).map((row) => row.value);
}

export function listValuesByType(rows: ListTypeRow[], type: string): string[] {
  return sortByOrder(rows.filter((row) => row.list_type === type)).map((row) => row.value);
}

export function groupByKey<T extends Record<string, string | number>>(rows: T[], key: keyof T): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const bucketKey = String(row[key]);
    const list = map.get(bucketKey) ?? [];
    list.push(row);
    map.set(bucketKey, list);
  }
  return map;
}

export function withFallback(value: string | null | undefined): string {
  return value ?? '';
}
