import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal, self-contained runtime image for the `app` service in
  // docker-compose.yml (docs/app/api-reference/config/next-config-js/output.md).
  output: "standalone",
  // Lets devices on the LAN load dev-only JS chunks/HMR from the printed
  // "Network:" URL — otherwise Next blocks it and client components (Navbar,
  // ThemeToggle) never hydrate (docs/app/api-reference/config/next-config-js/allowedDevOrigins.md).
  allowedDevOrigins: ["192.168.1.100"],
};

export default nextConfig;
