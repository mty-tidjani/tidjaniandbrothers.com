import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

const DISALLOW = ["/admin", "/api"];
// Social/AI crawlers fetch og:image URLs directly — this API route serves
// dynamically generated share images, so it needs to stay reachable despite
// the broader /api disallow above.
const ALLOW = ["/", "/api/og"];

// AI crawlers get explicit rules (identical to the wildcard) so intent is
// unambiguous to agents that check for a named entry before falling back
// to "*" — some corporate crawlers are more conservative without one.
const AI_USER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: ALLOW, disallow: DISALLOW },
      ...AI_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: ALLOW,
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
