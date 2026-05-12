import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData } from "./siwe";

const SESSION_SECRET = process.env.SESSION_SECRET!;
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME!;

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, {
    password: SESSION_SECRET,
    cookieName: SESSION_COOKIE_NAME,
  });
  if (!session.address) return null;
  return { address: session.address, chainId: session.chainId };
}

export async function setSession(data: SessionData): Promise<void> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, {
    password: SESSION_SECRET,
    cookieName: SESSION_COOKIE_NAME,
  });
  session.address = data.address;
  session.chainId = data.chainId;
  await session.save();
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, {
    password: SESSION_SECRET,
    cookieName: SESSION_COOKIE_NAME,
  });
  await session.destroy();
}
