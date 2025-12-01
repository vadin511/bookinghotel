// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tối ưu hình ảnh
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Compression
  compress: true,
  // Tối ưu production
  swcMinify: true,
  // Tối ưu bundle
  experimental: {
    optimizePackageImports: ['@fortawesome/fontawesome-free', 'swiper', 'lucide-react'],
  },
};

module.exports = nextConfig;
