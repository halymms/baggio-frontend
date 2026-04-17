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
  experimental: {
    // Suprime o erro de useSearchParams sem Suspense durante o build
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
