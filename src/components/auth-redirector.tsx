
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, usePathname } from 'next/navigation';

export function AuthRedirector() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return;
    }
    
    const openPaths = ['/signup', '/seller/register', '/forgot-password', '/verify-email', '/live-selling'];
    if (openPaths.some(p => pathname.startsWith(p))) {
        return;
    }

    if (user && userData) {
      const { role, verificationStatus } = userData;

      if (role === 'admin') {
        if (!pathname.startsWith('/admin')) {
          router.replace('/admin/dashboard');
        }
      } else if (role === 'seller') {
        if (verificationStatus === 'verified') {
          if (!pathname.startsWith('/seller/dashboard') && !pathname.startsWith('/seller/products') && !pathname.startsWith('/seller/orders')) {
            router.replace('/seller/dashboard');
          }
        } else {
          if (!pathname.startsWith('/seller/verification')) {
            router.replace('/seller/verification');
          }
        }
      } else { // Customer
        if (pathname === '/') {
             router.replace('/live-selling');
        }
      }
    } else if (!user) {
      const protectedPaths = ['/admin', '/seller', '/profile', '/cart', '/orders', '/wishlist', '/message', '/wallet'];
      if (protectedPaths.some(p => pathname.startsWith(p))) {
        router.replace('/');
      }
    }
  }, [user, userData, loading, router, pathname]);

  return null;
}
