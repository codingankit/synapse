import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@synapse/core"],
  reactCompiler: true,
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
};

export default nextConfig;
