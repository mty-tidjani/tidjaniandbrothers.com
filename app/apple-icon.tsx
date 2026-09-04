import { ImageResponse } from "next/og";
import { getLogoDataUri } from "@/lib/seo/logo-asset";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const logoSrc = await getLogoDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <img src={logoSrc} width={150} height={150} alt="" />
      </div>
    ),
    { ...size },
  );
}
