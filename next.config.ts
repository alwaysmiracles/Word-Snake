import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-c57fbf98-b3be-4593-ad80-3dc91449f964.space-z.ai",
  ],
};

export default nextConfig;
