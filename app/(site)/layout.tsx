import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { StickyDevisButton } from "@/components/site/StickyDevisButton";
import { CookieConsent } from "@/components/site/CookieConsent";
import { JsonLd } from "@/components/seo/JsonLd";
import { getOrganizationJsonLd } from "@/lib/seo/organization";
import { getCompanySettings } from "@/lib/data/settings";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getCompanySettings();

  return (
    <>
      <JsonLd data={getOrganizationJsonLd(settings)} />
      <div className="ambient-mesh" aria-hidden="true" />
      <Navbar />
      <main className="flex-1 pt-32 pb-24">{children}</main>
      <Footer
        phone={settings.phone}
        email={settings.email}
        address={settings.address}
        facebookUrl={settings.facebookUrl}
      />
      <StickyDevisButton />
      <CookieConsent />
    </>
  );
}
