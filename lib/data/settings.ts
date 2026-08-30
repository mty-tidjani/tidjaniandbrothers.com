import { prisma } from "@/lib/prisma";
import {
  COMPANY_ADDRESS,
  COMPANY_EMAIL,
  COMPANY_FACEBOOK_URL,
  COMPANY_PHONE,
} from "@/lib/constants";

// Falls back to the real launch-day contact details if CompanySettings hasn't
// been seeded yet, so the public site never renders empty contact info.
export async function getCompanySettings() {
  const settings = await prisma.companySettings.findFirst();
  return (
    settings ?? {
      id: "fallback",
      phone: COMPANY_PHONE,
      email: COMPANY_EMAIL,
      address: COMPANY_ADDRESS,
      facebookUrl: COMPANY_FACEBOOK_URL,
      defaultLocale: "fr",
      updatedAt: new Date(),
    }
  );
}
