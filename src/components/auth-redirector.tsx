
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, usePathname } from 'next/navigation';
import { getUserData } from '@/lib/follow-data';

// This component handles all redirection logic after authentication state changes.
// It should be placed in the root layout to ensure it's always active.
export function AuthRedirector() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't do anything until Firebase has confirmed the auth state
    if (loading) {
      return;
    }
    
    // Paths that don't require any redirection logic
    const openPaths = ['/signup', '/seller/register', '/forgot-password', '/verify-email', '/live-selling'];
    if (openPaths.some(p => pathname.startsWith(p))) {
        return;
    }

    if (user) {
      const userData = getUserData(user.uid);
      const { role, verificationStatus } = userData as any;

      if (role === 'admin') {
        if (!pathname.startsWith('/admin')) {
          router.replace('/admin/dashboard');
        }
      } else if (role === 'seller') {
        if (verificationStatus === 'verified') {
          if (!pathname.startsWith('/seller/dashboard')) {
            router.replace('/seller/dashboard');
          }
        } else {
          if (!pathname.startsWith('/seller/verification')) {
            router.replace('/seller/verification');
          }
        }
      } else { // Customer
        const allowedCustomerPaths = ['/', '/live-selling', '/cart', '/orders', '/profile', '/product', '/stream', '/wishlist', '/message', '/wallet'];
        const isAllowed = allowedCustomerPaths.some(p => pathname.startsWith(p) || pathname === p);
        
        // If they are on the login page, redirect them. Otherwise, let them be.
        if (pathname === '/') {
             router.replace('/live-selling');
        }
      }
    } else {
      // If there's no user and they are on a protected page, redirect to login
      const protectedPaths = ['/admin', '/seller', '/profile', '/cart', '/orders', '/wishlist', '/message', '/wallet'];
      if (protectedPaths.some(p => pathname.startsWith(p))) {
        router.replace('/');
      }
    }
  }, [user, loading, router, pathname]);

  // This component does not render anything
  return null;
}
