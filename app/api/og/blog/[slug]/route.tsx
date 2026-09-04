import { ImageResponse } from "next/og";
import { getPublishedBlogPostBySlug } from "@/lib/data/blog";
import { BLOG_CATEGORY_LABELS } from "@/lib/constants";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
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
        <div style={{ display: "flex", fontSize: 28, color: "#bbc9ca" }}>
          Tidjani & Brothers
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
