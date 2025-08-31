
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

// More specific paths to avoid overly broad rules
const protectedSellerPaths = [
    '/seller/dashboard',
    '/seller/orders',
    '/seller/products',
];

const adminPaths = ['/admin'];
const authPaths = ['/', '/signup', '/forgot-password', '/seller/login'];
// The verification page is where sellers with certain statuses should be.
const sellerFlowPaths = ['/seller/register', '/seller/verification'];

export function AuthRedirector() {
  const { user, loading, userData } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return; 
    }
    
    if (user) {
      if (!user.emailVerified && pathname !== '/verify-email') {
        router.replace('/verify-email');
        return;
      }
      
      if (user.emailVerified && userData) {
          if (userData.role === 'admin') {
              if (!pathname.startsWith('/admin')) {
                  router.replace('/admin/dashboard');
              }
          } else if (userData.role === 'seller') {
              const status = userData.verificationStatus;
              
              if (status === 'pending' || status === 'rejected' || status === 'needs-resubmission') {
                  // If seller is in any of these states, they should ONLY be on the verification page.
                  if (pathname !== '/seller/verification') {
                      router.replace('/seller/verification');
                  }
              } else if (status === 'verified') {
                   // A verified seller should not be on the auth or initial seller flow pages.
                   if (authPaths.includes(pathname) || sellerFlowPaths.includes(pathname)) {
                       router.replace('/seller/dashboard');
                   }
              }
          } else { // Customer role
              if (authPaths.includes(pathname)) {
                  router.replace('/live-selling');
              }
          }
      }

    } else { // If the user is not logged in
        const isProtectedRoute = protectedCustomerPaths.some(p => pathname.startsWith(p)) ||
                                 protectedSellerPaths.some(p => pathname.startsWith(p)) ||
                                 adminPaths.some(p => pathname.startsWith(p));
        
        if (isProtectedRoute) {
            router.replace('/');
        }
    }
  }, [user, userData, loading, router, pathname]);

  // While loading, show a spinner on protected routes to prevent content flash.
  if (loading && !authPaths.includes(pathname) && !sellerFlowPaths.includes(pathname)) {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <LoadingSpinner />
        </div>
    );
  }

  return null;
}
