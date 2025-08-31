
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingSpinner } from './ui/loading-spinner';

const protectedPaths = [
    '/profile', 
    '/cart', 
    '/orders', 
    '/wishlist', 
    '/message', 
    '/wallet',
    '/admin',
    '/seller/dashboard',
    '/seller/orders',
    '/seller/products',
    '/seller/verification',
];

const authPaths = ['/', '/signup', '/forgot-password', '/seller/login'];

export function AuthRedirector() {
  const { user, loading, userData } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return; // Wait until the auth state is fully loaded
    }

    const isAuthPath = authPaths.includes(pathname);
    const isProtectedPath = protectedPaths.some(p => pathname.startsWith(p));

    if (user) {
       // If user's email is not verified, and they are not on the verify-email page, redirect them.
      if (!user.emailVerified && pathname !== '/verify-email') {
        router.replace('/verify-email');
        return;
      }
      
      // If user is logged in and on an auth page, redirect them away.
      if (isAuthPath) {
         if (userData?.role === 'seller') {
            router.replace('/seller/dashboard');
        } else {
            router.replace('/live-selling');
        }
      }
    } else {
      // If user is not logged in and tries to access a protected page, redirect to login
      if (isProtectedPath) {
        router.replace('/');
      }
    }
  }, [user, userData, loading, router, pathname]);

  // While loading, show a spinner on protected routes
  if (loading && protectedPaths.some(p => pathname.startsWith(p))) {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <LoadingSpinner />
        </div>
    );
  }

  return null;
}
