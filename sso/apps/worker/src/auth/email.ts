export function normalizeEmail(value: string): string {
  return value.trim().normalize("NFKC").toLocaleLowerCase("en-US");
}
