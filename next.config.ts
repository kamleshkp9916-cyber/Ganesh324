
import type {NextConfig} from 'next';

const isDev = process.env.NODE_ENV === 'development';

// Define the Content Security Policy
const ContentSecurityPolicy = `
  script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' *" : ''};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  object-src 'none';
  base-uri 'self';
`;

const nextConfig: NextConfig = {
  // Add headers to the Next.js app
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
          },
        ],
      },
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      }
    ],
  },
  devIndicators: {
    allowedDevOrigins: [
      '6000-firebase-studio-1754976605234.cluster-44kx2eiocbhe2tyk3zoyo3ryuo.cloudworkstations.dev'
    ],
  },
};

export default nextConfig;
