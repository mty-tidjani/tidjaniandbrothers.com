import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { getCompanySettings } from "@/lib/data/settings";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getCompanySettings();

  return (
    <>
      <div className="ambient-mesh" aria-hidden="true" />
      <Navbar />
      <main className="flex-1 pt-32 pb-24">{children}</main>
      <Footer
        phone={settings.phone}
        email={settings.email}
        address={settings.address}
        facebookUrl={settings.facebookUrl}
      />
    </>
  );
}
