import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // maplibre-gl uses browser APIs — tell webpack not to process it server-side
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals ?? []), "maplibre-gl"];
    }
    return config;
  },
};

export default nextConfig;
