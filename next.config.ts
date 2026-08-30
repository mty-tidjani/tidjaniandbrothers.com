import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal, self-contained runtime image for the `app` service in
  // docker-compose.yml (docs/app/api-reference/config/next-config-js/output.md).
  output: "standalone",
};

export default nextConfig;
