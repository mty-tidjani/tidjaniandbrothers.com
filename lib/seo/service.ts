import type { Service, WithContext } from "schema-dts";
import { ORGANIZATION_REF } from "@/lib/seo/organization";

export function getServiceJsonLd({
  name,
  description,
}: {
  name: string;
  description: string;
}): WithContext<Service> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: ORGANIZATION_REF,
    areaServed: {
      "@type": "Country",
      name: "Cameroun",
    },
  };
}
