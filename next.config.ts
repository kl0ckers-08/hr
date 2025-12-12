/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.icons8.com",
      },
    ],
  },
  async rewrites() {
    return {
      // beforeFiles rewrites are checked before pages/public files
      // This ensures the HR3 API requests are proxied before Next.js tries to handle them
      beforeFiles: [
        // HR3 API - proxy to Express backend
        {
          source: '/HR3/api/:path*',
          destination: 'http://localhost:5000/api/:path*',
        },
      ],
      afterFiles: [
        // HR3 Frontend - proxy to Vite dev server (after checking for static files)
        {
          source: '/HR3',
          destination: 'http://localhost:5174/HR3/',
        },
        {
          source: '/HR3/:path*',
          destination: 'http://localhost:5174/HR3/:path*',
        },
      ],
      fallback: [],
    };
  },
};

module.exports = nextConfig;
