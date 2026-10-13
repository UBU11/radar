import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // ponytail: minimal server external packages list for local-first sqlite wasm
  serverExternalPackages: ["@powersync/web"],
};

export default nextConfig;
