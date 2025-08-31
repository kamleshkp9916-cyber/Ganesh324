
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingSpinner } from './ui/loading-spinner';

const protectedCustomerPaths = [
    '/profile', 
    '/cart', 
    '/orders', 
    '/wishlist', 
    '/message', 
    '/wallet',
];

const protectedSellerPaths = [
    '/seller/dashboard',
    '/seller/orders',
    '/seller/products',
    '/seller/profile',
];

const adminPaths = ['/admin'];
const authPaths = ['/', '/signup', '/forgot-password', '/seller/login'];
const publicSellerPaths = ['/seller/register', '/seller/verification'];


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
    const isProtectedCustomerPath = protectedCustomerPaths.some(p => pathname.startsWith(p));
    const isProtectedSellerPath = protectedSellerPaths.some(p => pathname.startsWith(p));
    const isAdminPath = adminPaths.some(p => pathname.startsWith(p));

    if (user) {
       // If user's email is not verified, and they are not on the verify-email page, redirect them.
      if (!user.emailVerified && pathname !== '/verify-email') {
        router.replace('/verify-email');
        return;
      }
      
      // Handle authenticated users
      if (userData?.role === 'seller') {
          const status = userData.verificationStatus;
          if (status === 'verified') {
              if (pathname !== '/seller/dashboard' && isAuthPath) {
                  router.replace('/seller/dashboard');
              }
          } else if (status === 'pending' || status === 'needs-resubmission' || status === 'rejected') {
              if (pathname !== '/seller/verification') {
                  router.replace('/seller/verification');
              }
          }
      } else if (userData?.role === 'admin') {
          if (!isAdminPath) {
              router.replace('/admin/dashboard');
          }
      } else { // Customer role
          if (isAuthPath) {
              router.replace('/live-selling');
          }
      }

    } else {
      // Handle unauthenticated users
      const isProtectedRoute = isProtectedCustomerPath || isProtectedSellerPath || isAdminPath;
      if (isProtectedRoute) {
        router.replace('/');
      }
    }
  }, [user, userData, loading, router, pathname]);

  // While loading, show a spinner on protected routes to prevent content flash.
  if (loading && (protectedCustomerPaths.some(p => pathname.startsWith(p)) || protectedSellerPaths.some(p => pathname.startsWith(p)))) {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <LoadingSpinner />
        </div>
    );
  }

  return null;
}
