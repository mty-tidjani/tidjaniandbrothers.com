import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";

/** Return value of every SMS admin server action used with useActionState. */
export type ActionState = {
  error?: string;
  success?: string;
  /** Only set by issueApiKey: the one and only time the secret is visible. */
  secret?: string;
};

/** SMS administration is super-admin only (Role.ADMIN). */
export async function requireSmsAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export function firstIssue(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Formulaire invalide";
}

export function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}
