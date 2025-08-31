
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
];

const adminPaths = ['/admin'];
const authPaths = ['/', '/signup', '/forgot-password', '/seller/login'];

export function AuthRedirector() {
  const { user, loading, userData } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until authentication state and user data are fully loaded
    if (loading) {
      return; 
    }
    
    // If the user is logged in
    if (user) {
      // If user's email is not verified, they must be on the verify-email page.
      if (!user.emailVerified && pathname !== '/verify-email') {
        router.replace('/verify-email');
        return;
      }
      
      // Once email is verified, proceed with role-based redirection.
      if (user.emailVerified && userData) {
          if (userData.role === 'admin') {
              if (!pathname.startsWith('/admin')) {
                  router.replace('/admin/dashboard');
              }
          } else if (userData.role === 'seller') {
              const status = userData.verificationStatus;
              
              if (status === 'verified') {
                  // Verified sellers should be on seller pages or public pages, but not on auth or verification pages.
                   if (authPaths.includes(pathname) || pathname.startsWith('/seller/verification')) {
                       router.replace('/seller/dashboard');
                   }
              } else if (status === 'pending' || status === 'rejected' || status === 'needs-resubmission') {
                  // Sellers with a non-verified status should be locked to the verification/registration flow.
                  if (pathname !== '/seller/verification' && pathname !== '/seller/register') {
                      router.replace('/seller/verification');
                  }
              }
          } else { // Customer role
              // Customers should be redirected from auth pages to the main app.
              if (authPaths.includes(pathname)) {
                  router.replace('/live-selling');
              }
          }
      }

    } else { // If the user is not logged in
        const isProtectedRoute = protectedCustomerPaths.some(p => pathname.startsWith(p)) ||
                                 protectedSellerPaths.some(p => pathname.startsWith(p)) ||
                                 adminPaths.some(p => pathname.startsWith(p));
        
        // If they try to access a protected route, send them to login.
        if (isProtectedRoute) {
            router.replace('/');
        }
    }
  }, [user, userData, loading, router, pathname]);

  // While loading, show a spinner on protected routes to prevent content flash.
  if (loading && !authPaths.includes(pathname)) {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <LoadingSpinner />
        </div>
    );
  }

  return null;
}
