import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A suíte em navegador não disputa os arquivos gerados pelo servidor de desenvolvimento.
  distDir: process.env.E2E_TEST_RUN === "1" ? ".next-e2e" : ".next",
  experimental: { serverActions: { bodySizeLimit: "3mb" } },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
