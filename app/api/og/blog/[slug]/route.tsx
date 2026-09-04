import { ImageResponse } from "next/og";
import { getPublishedBlogPostBySlug } from "@/lib/data/blog";
import { BLOG_CATEGORY_LABELS } from "@/lib/constants";
import { getLogoDataUri } from "@/lib/seo/logo-asset";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const [post, logoSrc] = await Promise.all([
    getPublishedBlogPostBySlug(slug),
    getLogoDataUri(),
  ]);
  const title = post?.title ?? "Tidjani & Brothers";
  const category = post
    ? (BLOG_CATEGORY_LABELS[post.category] ?? post.category)
    : "Blog";

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
          {category}
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
          {title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* next/image can't run inside next/og's Satori renderer — a plain <img> is the documented pattern here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={38} height={38} alt="" />
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#bbc9ca" }}>
            Tidjani & Brothers
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
