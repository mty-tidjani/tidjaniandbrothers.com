import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#101415",
          color: "#00c2cb",
          fontSize: 96,
          fontWeight: 700,
        }}
      >
        T&B
      </div>
    ),
    { ...size },
  );
}
