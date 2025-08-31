
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
    //'/seller/verification', // This is a special case, handled below
    '/seller/profile',
];

const authPaths = ['/', '/signup', '/forgot-password', '/seller/login', '/seller/register'];

export function AuthRedirector() {
  const { user, loading, userData } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until authentication state and user data are fully loaded
    if (loading) {
      return; 
    }

    const isAuthPath = authPaths.includes(pathname);
    const isProtectedPath = protectedPaths.some(p => pathname.startsWith(p));

    if (user) {
       // If user's email is not verified, and they are not on the verify-email page, redirect them.
      if (!user.emailVerified && pathname !== '/verify-email') {
        router.replace('/verify-email');
        return;
      }
      
      // If user is logged in and on an auth page, redirect them to their dashboard/home.
      if (isAuthPath) {
         if (userData?.role === 'seller') {
            // This is the key fix: if a seller is on the homepage but should be on verification, redirect them.
            if(userData.verificationStatus !== 'verified' && pathname === '/') {
                 router.replace('/seller/verification');
            } else if (userData.verificationStatus === 'verified') {
                 router.replace('/seller/dashboard');
            }
        } else if (userData?.role === 'admin') {
            router.replace('/admin/dashboard');
        } else {
            router.replace('/live-selling');
        }
      }
    } else {
      // If user is not logged in and tries to access a protected page, redirect to login.
      if (isProtectedPath) {
        router.replace('/');
      }
    }
  }, [user, userData, loading, router, pathname]);

  // While loading, show a spinner on protected routes to prevent content flash.
  if (loading && protectedPaths.some(p => pathname.startsWith(p))) {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <LoadingSpinner />
        </div>
    );
  }

  return null;
}
