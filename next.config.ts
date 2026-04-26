/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'randomuser.me',
      'picsum.photos',
      'api.dicebear.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com', // On autorise ce domaine
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;