import { z } from "zod";

export const teamInviteSchema = z.object({
  email: z.email("Email invalide"),
  role: z.enum(["ADMIN", "EDITOR"]),
});
export type TeamInviteInput = z.infer<typeof teamInviteSchema>;
