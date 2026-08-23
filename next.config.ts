import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The Vercel Image Optimization quota on this account is exhausted. With the
    // optimizer on, every image 402s and production renders blank. All artwork
    // here is SVG anyway, so optimization buys nothing.
    unoptimized: true,
  },
  poweredByHeader: false,
};

export default nextConfig;
