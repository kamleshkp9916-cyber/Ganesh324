
import type {NextConfig} from 'next';

const assetPrefix = process.env.FIREBASE_APP_HOST
  ? `https://${process.env.FIREBASE_APP_HOST}`
  : undefined;

const nextConfig: NextConfig = {
  assetPrefix,
  // This allows requests from the Firebase Studio development environment.
  allowedDevOrigins: ["https://*.cloudworkstations.dev", "https://*.firebase.studio"],
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
    ],
  },
};

export default nextConfig;
