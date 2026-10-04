import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  typedRoutes: false,
};

export default nextConfig;

// Makes Cloudflare bindings (D1, R2, KV) available during `next dev`.
initOpenNextCloudflareForDev();
