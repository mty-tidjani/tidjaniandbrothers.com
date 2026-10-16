"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  firstIssue,
  isUniqueViolation,
  type ActionState,
} from "@/lib/sms/admin";
import {
  endPortalSession,
  hashPortalToken,
  PORTAL_LOGIN_PATH,
  startPortalSession,
} from "@/lib/sms-portal/session";
import {
  clearLoginFailures,
  isLoginLocked,
  recordLoginFailure,
} from "@/lib/sms-portal/throttle";
import { notifySmsSignup } from "@/lib/notifications/sms";
import {
  portalLoginSchema,
  portalRegisterSchema,
  portalSetPasswordSchema,
} from "@/lib/validation/sms-portal";

// Compared against when the email is unknown, so response time doesn't
// reveal which emails have an account.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

/** Public self-signup. The account starts PENDING until an admin activates it. */
export async function registerPortalAccount(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = portalRegisterSchema.safeParse({
    companyName: formData.get("companyName"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const data = parsed.data;

  const [existingUser, existingAccount] = await Promise.all([
    prisma.smsPortalUser.findUnique({ where: { email: data.email } }),
    prisma.smsAccount.findFirst({
      where: { contactEmail: { equals: data.email, mode: "insensitive" } },
    }),
  ]);
  const emailTaken: ActionState = {
    error:
      "Un compte existe déjà avec cet email. Connectez-vous, ou contactez-nous pour recevoir un lien d'accès.",
  };
  if (existingUser || existingAccount) return emailTaken;

  const passwordHash = await bcrypt.hash(data.password, 12);
  let account;
  try {
    account = await prisma.smsAccount.create({
      data: {
        companyName: data.companyName,
        contactName: data.name,
        contactEmail: data.email,
        contactPhone: data.phone,
        statusEvents: {
          create: { toStatus: "PENDING", reason: "Inscription en ligne" },
        },
        portalUsers: {
          create: { name: data.name, email: data.email, passwordHash },
        },
      },
      include: { portalUsers: { select: { id: true } } },
    });
  } catch (error) {
    // Two signups racing on the same email.
    if (isUniqueViolation(error)) return emailTaken;
    throw error;
  }

  await notifySmsSignup(account);
  await startPortalSession(account.portalUsers[0].id);
  redirect("/sms");
}

export async function loginPortal(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = portalLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  const { email, password } = parsed.data;

  if (isLoginLocked(email)) {
    return {
      error: "Trop de tentatives. Réessayez dans 15 minutes.",
    };
  }

  const user = await prisma.smsPortalUser.findUnique({
    where: { email },
    include: { account: { select: { status: true } } },
  });
  const valid = await bcrypt.compare(
    password,
    user?.passwordHash ?? DUMMY_HASH,
  );
  if (!user || !user.passwordHash || !valid) {
    recordLoginFailure(email);
    return { error: "Email ou mot de passe incorrect." };
  }
  if (user.account.status === "DISABLED") {
    return { error: "Ce compte est désactivé. Contactez-nous." };
  }

  clearLoginFailures(email);
  await startPortalSession(user.id);
  redirect("/sms");
}

export async function logoutPortal() {
  await endPortalSession();
  redirect(PORTAL_LOGIN_PATH);
}

/** First access or reset, from an admin-issued single-use link. */
export async function setPortalPassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = portalSetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const token = await prisma.smsPortalToken.findUnique({
    where: { tokenHash: hashPortalToken(parsed.data.token) },
    include: { user: { include: { account: { select: { status: true } } } } },
  });
  if (!token || token.usedAt || token.expiresAt < new Date()) {
    return {
      error: "Ce lien est invalide ou a expiré. Demandez-nous un nouveau lien.",
    };
  }
  if (token.user.account.status === "DISABLED") {
    return { error: "Ce compte est désactivé. Contactez-nous." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.$transaction([
    prisma.smsPortalUser.update({
      where: { id: token.userId },
      data: { passwordHash },
    }),
    prisma.smsPortalToken.update({
      where: { id: token.id },
      data: { usedAt: new Date() },
    }),
    // A reset logs out every existing session.
    prisma.smsPortalSession.deleteMany({ where: { userId: token.userId } }),
  ]);

  clearLoginFailures(token.user.email);
  await startPortalSession(token.userId);
  redirect("/sms");
}
