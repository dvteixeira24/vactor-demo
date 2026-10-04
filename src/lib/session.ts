import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAuth } from "@/auth";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

export type Session = {
  user: SessionUser;
  session: { id: string; expiresAt: Date };
} | null;

/** Reads the current session from request cookies. Returns null when signed out. */
export async function getSession(): Promise<Session> {
  const auth = await createAuth();
  const result = await auth.api.getSession({ headers: await headers() });
  if (!result?.user) return null;
  return result as Session;
}

/** Returns the signed-in user or redirects to /login. */
export async function requireUser(callbackUrl = "/dashboard"): Promise<SessionUser> {
  const session = await getSession();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return session.user;
}
