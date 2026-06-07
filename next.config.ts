import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/api/products": ["./node_modules/playwright-core/**/*", "./node_modules/playwright/**/*"],
    "/api/cron": ["./node_modules/playwright-core/**/*", "./node_modules/playwright/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
    ],
  },
};

export default nextConfig;
