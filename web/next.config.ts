import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "i.pravatar.cc",
      "blob.vercel-storage.com",
      "*.blob.vercel-storage.com",
    ],
  },
};

export default nextConfig;
