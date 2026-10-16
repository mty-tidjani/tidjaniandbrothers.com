import crypto from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// Customer sessions for the /sms portal. Independent of Auth.js on purpose:
// the admin area accepts any Auth.js session, so customers must never get one.

const COOKIE_NAME = "tb_sms_session";
const SESSION_DAYS = 30;

export const PORTAL_LOGIN_PATH = "/sms/connexion";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generatePortalToken() {
  const token = crypto.randomBytes(32).toString("base64url");
  return { token, tokenHash: hashToken(token) };
}

export function hashPortalToken(token: string): string {
  return hashToken(token);
}

/** Server Functions only (sets a cookie). */
export async function startPortalSession(userId: string) {
  const { token, tokenHash } = generatePortalToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.smsPortalSession.create({ data: { userId, tokenHash, expiresAt } }),
    prisma.smsPortalUser.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    }),
    // Opportunistic cleanup of this user's expired sessions.
    prisma.smsPortalSession.deleteMany({
      where: { userId, expiresAt: { lt: new Date() } },
    }),
  ]);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Server Functions only (deletes a cookie). */
export async function endPortalSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    await prisma.smsPortalSession.deleteMany({
      where: { tokenHash: hashToken(token) },
    });
  }
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Current portal user + account, or null. Memoised per request, and re-reads
 * the account each time so an admin disabling it locks the customer out on
 * their next page load.
 */
export const getPortalSession = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.smsPortalSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          account: {
            select: {
              id: true,
              companyName: true,
              contactName: true,
              contactEmail: true,
              contactPhone: true,
              status: true,
              creditBalance: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });
  if (!session || session.expiresAt < new Date()) return null;
  if (session.user.account.status === "DISABLED") return null;

  return {
    sessionId: session.id,
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    },
    account: session.user.account,
  };
});

export type PortalSession = NonNullable<
  Awaited<ReturnType<typeof getPortalSession>>
>;

/** For portal pages and Server Functions: redirects to login when signed out. */
export async function requirePortalSession(): Promise<PortalSession> {
  const session = await getPortalSession();
  if (!session) redirect(PORTAL_LOGIN_PATH);
  return session;
}
