
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // This allows requests from the Firebase Studio development environment.
  allowedDevOrigins: ["https://*.cloudworkstations.dev"],
  experimental: {
    webpack: (config) => {
      config.watchOptions.poll = 300;
      // This is the fix for the embla-carousel-react issue.
      // It ensures that the correct module is resolved by webpack.
      config.resolve.alias = {
        ...config.resolve.alias,
        'embla-carousel-react': require.resolve(
          'embla-carousel-react/embla-carousel-react.modern.js'
        ),
      };
      return config;
    },
    developmentServerSniff: false,
  },
  async rewrites() {
    return [
      {
        source: '/api/functions/:path*',
        destination: 'https://us-central1-streamcart-login.cloudfunctions.net/:path*',
      },
    ]
  },
  serverExternalPackages: ['@genkit-ai/google-genai'],
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
        protocol: 'https'
,
        hostname: 'plus.unsplash.com',
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
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
