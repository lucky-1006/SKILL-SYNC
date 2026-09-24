/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@skillsync/shared', 'lucide-react', 'recharts'],
  experimental: {
    // optimize package imports for fast loading
    optimizePackageImports: ['lucide-react', 'recharts']
  },
  images: {
    domains: ['images.unsplash.com', 'avatars.githubusercontent.com']
  }
};

module.exports = nextConfig;
