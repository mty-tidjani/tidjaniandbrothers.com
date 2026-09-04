import { ImageResponse } from "next/og";

export const alt = "Tidjani & Brothers — We build robust IT solutions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
        <div style={{ width: 96, height: 8, background: "#00c2cb" }} />
        <div
          style={{
            marginTop: 40,
            fontSize: 72,
            fontWeight: 700,
            color: "#e1e3e4",
            display: "flex",
          }}
        >
          Tidjani & Brothers
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
