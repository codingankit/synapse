import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@synapse/core"],
  reactCompiler: true,
  experimental: { serverActions: { bodySizeLimit: "10mb" } },
};

export default nextConfig;
