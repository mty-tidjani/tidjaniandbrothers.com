import { readFile } from "node:fs/promises";
import { join } from "node:path";

let cached: string | null = null;

// Used by the next/og ImageResponse routes (icon, apple-icon, opengraph
// images) — those render via Satori, which needs actual image bytes for
// `<img src>`, not a URL it can fetch itself for a local file.
export async function getLogoDataUri(): Promise<string> {
  if (cached) return cached;
  const data = await readFile(
    join(process.cwd(), "public/brand/logo.png"),
    "base64",
  );
  cached = `data:image/png;base64,${data}`;
  return cached;
}
