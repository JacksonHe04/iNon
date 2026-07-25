export async function readJsonRecord(
  response: Response,
): Promise<Record<string, unknown>> {
  const value: unknown = await response.json().catch(() => null);
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function readJsonString(
  record: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = record[key];
  return typeof value === 'string' ? value : undefined;
}
