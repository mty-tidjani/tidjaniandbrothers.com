import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.email("Email invalide"),
});
export type NewsletterInput = z.infer<typeof newsletterSchema>;
