export async function computePinHash(pin: string, meetupId: string, salt: string): Promise<string> {
  const payload = `${pin}:${meetupId}:${salt}`;
  const encoder = new TextEncoder();
  const payloadBuffer = encoder.encode(payload);

  const hashBuffer = await crypto.subtle.digest("SHA-256", payloadBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyOfflinePin(
  enteredPin: string,
  meetupId: string,
  salt: string,
  expectedHash: string
): Promise<boolean> {
  const computedHash = await computePinHash(enteredPin, meetupId, salt);
  return computedHash === expectedHash;
}
