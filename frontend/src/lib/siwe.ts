export interface SessionData {
  address: string;
  chainId: number;
}

// Simple in-memory nonce store with 10-minute TTL
export const nonces = new Map<string, number>();

export function cleanExpiredNonces(): void {
  const now = Date.now();
  for (const [nonce, expiresAt] of nonces.entries()) {
    if (now > expiresAt) nonces.delete(nonce);
  }
}

export function createSiweMessage(address: string, chainId: number, nonce: string): string {
  const domain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "localhost:3000";
  return `${domain} wants you to sign in with your Ethereum account:\n${address}\n\nI accept the Ekoky Terms of Service.\n\nURI: http://${domain}\nVersion: 1\nChain ID: ${chainId}\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`;
}

export function generateNonce(): string {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}
