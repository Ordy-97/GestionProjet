import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        xmlhttprequest: false,
        stream: false,
        crypto: false,
        http: false,
        https: false,
        path: false,
        os: false,
        zlib: false,
      };
    }
    return config;
  },
  images: {
    domains: ['localhost', 'parse-server-back4app.herokuapp.com', 'parsefiles.back4app.com'],
  },
};

export default nextConfig;
