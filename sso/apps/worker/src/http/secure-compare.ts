const textEncoder = new TextEncoder();

async function digest(value: string): Promise<Uint8Array> {
  const hash = await crypto.subtle.digest("SHA-256", textEncoder.encode(value));
  return new Uint8Array(hash);
}

export async function secureCompare(
  candidate: string,
  expected: string,
): Promise<boolean> {
  const [candidateHash, expectedHash] = await Promise.all([
    digest(candidate),
    digest(expected),
  ]);

  let difference = 0;
  for (let index = 0; index < expectedHash.length; index += 1) {
    difference |= candidateHash[index]! ^ expectedHash[index]!;
  }

  return difference === 0;
}
