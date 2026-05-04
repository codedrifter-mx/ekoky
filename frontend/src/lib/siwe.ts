import { ironSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  address: string;
  chainId: number;
}

const SESSION_SECRET = process.env.SESSION_SECRET!;
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME!;

export function createSiweMessage(address: string, chainId: number, nonce: string): string {
  return `Ekoky wants you to sign in with your Ethereum account:\n${address}\n\nI accept the Ekoky Terms of Service.\n\nURI: http://localhost:3000\nVersion: 1\nChain ID: ${chainId}\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`;
}

export function generateNonce(): string {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const session = ironSession<SessionData>({
    password: SESSION_SECRET,
    cookieName: SESSION_COOKIE_NAME,
    cookie: cookieStore as any,
  });
  if (!session.address) return null;
  return { address: session.address, chainId: session.chainId };
}

export async function setSession(data: SessionData): Promise<void> {
  const cookieStore = await cookies();
  const session = ironSession<SessionData>({
    password: SESSION_SECRET,
    cookieName: SESSION_COOKIE_NAME,
    cookie: cookieStore as any,
  });
  session.address = data.address;
  session.chainId = data.chainId;
  await session.save();
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  const session = ironSession<SessionData>({
    password: SESSION_SECRET,
    cookieName: SESSION_COOKIE_NAME,
    cookie: cookieStore as any,
  });
  session.destroy();
}
