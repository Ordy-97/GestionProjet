/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        // Désactiver les règles qui causent des problèmes avec Parse
        '*.node': false,
      },
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        url: false,
        http: false,
        https: false,
        stream: false,
        crypto: false,
        zlib: false,
        path: false,
        os: false,
        process: false,
        buffer: false,
        util: false,
        assert: false,
        querystring: false,
        punycode: false,
        string_decoder: false,
        constants: false,
        xmlhttprequest: false,
      };
    }
    return config;
  },
  images: {
    domains: ['localhost', 'parse-server-back4app.herokuapp.com', 'parsefiles.back4app.com'],
  },
};

module.exports = nextConfig; 