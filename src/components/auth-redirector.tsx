
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

// More specific seller paths to allow public access to register/verification
const protectedSellerPaths = [
    '/seller/dashboard',
    '/seller/orders',
    '/seller/products',
];

const adminPaths = ['/admin'];
const authPaths = ['/', '/signup', '/forgot-password', '/seller/login'];
const publicPaths = ['/live-selling', '/seller/register', '/seller/verification', '/verify-email', '/about', '/contact', '/terms-and-conditions', '/privacy-and-security', '/faq', '/help', '/product'];


export function AuthRedirector() {
  const { user, loading, userData } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until authentication state and user data are fully loaded
    if (loading) {
      return; 
    }
    
    // Determine if the current path is public, allowing access regardless of auth state
    const isPublicPath = publicPaths.some(p => pathname.startsWith(p));
    
    // If the user is logged in
    if (user) {
      // If user's email is not verified, they should only be on the verify-email page
      if (!user.emailVerified && pathname !== '/verify-email') {
        router.replace('/verify-email');
        return;
      }
      
      // If email is verified, proceed with role-based redirection
      if (user.emailVerified) {
          if (userData?.role === 'admin') {
              if (!adminPaths.some(p => pathname.startsWith(p))) {
                  router.replace('/admin/dashboard');
              }
          } else if (userData?.role === 'seller') {
              const status = userData.verificationStatus;
              if (status === 'verified') {
                  // Verified sellers should be on seller pages or public pages, but not auth pages
                   if (authPaths.includes(pathname)) {
                       router.replace('/seller/dashboard');
                   }
              } else if (status === 'pending' || status === 'rejected' || status === 'needs-resubmission') {
                  // Sellers with non-verified status should be on the verification page
                  if (pathname !== '/seller/verification') {
                      router.replace('/seller/verification');
                  }
              }
          } else { // Customer role
              // Customers should be redirected from auth pages to the main app
              if (authPaths.includes(pathname)) {
                  router.replace('/live-selling');
              }
          }
      }

    } else { // If the user is not logged in
        const isProtectedRoute = protectedCustomerPaths.some(p => pathname.startsWith(p)) ||
                                 protectedSellerPaths.some(p => pathname.startsWith(p)) ||
                                 adminPaths.some(p => pathname.startsWith(p));
        
        // If they try to access a protected route, send them to login
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
