import type { Metadata } from "next";
import { PortalNav } from "@/components/sms-portal/PortalNav";
import { AccountStatusBanner } from "@/components/sms-portal/AccountStatusBanner";
import { requirePortalSession } from "@/lib/sms-portal/session";

export const metadata: Metadata = {
  title: { default: "Espace SMS", template: "%s — Espace SMS" },
  robots: { index: false },
};

// Each page also calls requirePortalSession() itself: layouts don't re-run
// on client navigation, so they can't be the only check.
export default async function SmsPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { account } = await requirePortalSession();

  return (
    <div className="relative min-h-screen">
      <div className="ambient-mesh" aria-hidden="true" />
      <PortalNav
        companyName={account.companyName}
        credits={account.creditBalance}
      />
      <main className="p-margin-mobile md:p-gutter md:ml-64">
        <div className="container-max gap-stack-md flex flex-col">
          <AccountStatusBanner status={account.status} />
          {children}
        </div>
      </main>
    </div>
  );
}
