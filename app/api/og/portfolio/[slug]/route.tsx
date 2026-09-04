import { ImageResponse } from "next/og";
import { getPublishedCaseStudyBySlug } from "@/lib/data/portfolio";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const study = await getPublishedCaseStudyBySlug(slug);
  const sector = study?.sector ?? "Tidjani & Brothers";
  const result = study?.resultMetric ?? "Étude de cas";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#101415",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            fontWeight: 700,
            color: "#00c2cb",
            textTransform: "uppercase",
            letterSpacing: 4,
          }}
        >
          Étude de cas
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 60,
            fontWeight: 700,
            color: "#e1e3e4",
            lineHeight: 1.15,
          }}
        >
          {sector}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#bbc9ca" }}>
          {result}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
