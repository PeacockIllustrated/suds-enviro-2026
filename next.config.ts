import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    workerThreads: false,
    cpus: 4,
  },
  // The marketing rebuild was reviewed under /preview before it took over
  // the root routes; keep links shared during review working.
  async redirects() {
    return [
      { source: "/preview", destination: "/", permanent: true },
      { source: "/preview/:path*", destination: "/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
