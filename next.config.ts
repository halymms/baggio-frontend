import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint warnings/errors não quebram o build de produção
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Erros de TypeScript não quebram o build de produção
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
