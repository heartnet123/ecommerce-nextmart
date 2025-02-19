/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: ['127.0.0.1', 'localhost'],
  },
};

module.exports = nextConfig;
