import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  address: string;
  chainId: number;
}

const SESSION_SECRET = process.env.SESSION_SECRET!;
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME!;

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

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore as any, {
    password: SESSION_SECRET,
    cookieName: SESSION_COOKIE_NAME,
  });
  if (!session.address) return null;
  return { address: session.address, chainId: session.chainId };
}

export async function setSession(data: SessionData): Promise<void> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore as any, {
    password: SESSION_SECRET,
    cookieName: SESSION_COOKIE_NAME,
  });
  session.address = data.address;
  session.chainId = data.chainId;
  await session.save();
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore as any, {
    password: SESSION_SECRET,
    cookieName: SESSION_COOKIE_NAME,
  });
  await session.destroy();
}
