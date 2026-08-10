import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@aimk/permissions", "@aimk/image-spec"],
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Next.js 16 changed the default to `[75]` and silently coerces any `quality`
    // prop outside this allowlist to the nearest permitted value. These three tiers
    // mirror IMAGE_QUALITY in utils/imageSpec.ts — keep them in sync.
    qualities: [75, 85, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8333",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "jf638wt6-8333.inc1.devtunnels.ms",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.angelsinmykitchen.in",
        port: "",
        pathname: "/**",
      },
    ],
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
