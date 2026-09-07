import { ImageResponse } from "next/og";
import { getLogoDataUri } from "@/lib/seo/logo-asset";

export const alt = "Tidjani And Brothers — We build robust IT solutions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoSrc = await getLogoDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#101415",
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 16,
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img src={logoSrc} width={72} height={72} alt="" />
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 72,
            fontWeight: 700,
            color: "#e1e3e4",
            display: "flex",
          }}
        >
          Tidjani And Brothers
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 32,
            color: "#00c2cb",
            display: "flex",
          }}
        >
          Solutions Odoo ERP sur-mesure pour PME camerounaises
        </div>
      </div>
    ),
    { ...size },
  );
}
