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
    "21.0.8.222",
    "127.0.0.1",
    "localhost",
  ],
};

export default nextConfig;
