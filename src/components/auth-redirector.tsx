
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingSpinner } from './ui/loading-spinner';

// Define paths that require a user to be logged out.
const publicOnlyPaths = ['/', '/signup', '/forgot-password', '/seller/login', '/seller/register'];

// Define paths that are exclusive to certain user roles.
const protectedPaths = {
    admin: '/admin',
    seller: '/seller/dashboard',
    customer: '/live-selling'
};

const sellerFlowPaths = ['/seller/register', '/seller/verification'];

export function AuthRedirector() {
  const { user, loading, userData } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return; 
    }
    
    if (user && user.emailVerified) {
        if (!userData) return; // Wait for userData to be loaded

        // If user is on a page meant for logged-out users, redirect them.
        if (publicOnlyPaths.includes(pathname)) {
            if (userData.role === 'admin') {
                router.replace(protectedPaths.admin);
            } else if (userData.role === 'seller' && userData.verificationStatus === 'verified') {
                router.replace(protectedPaths.seller);
            } else if (userData.role === 'seller') {
                 router.replace('/seller/verification');
            } else {
                router.replace(protectedPaths.customer);
            }
            return;
        }

        // Handle role-specific logic for users on other pages
        if (userData.role === 'seller') {
            const { verificationStatus } = userData;
            if (verificationStatus === 'pending' || verificationStatus === 'rejected' || verificationStatus === 'needs-resubmission') {
                // This seller MUST be on the verification page.
                if (pathname !== '/seller/verification') {
                    router.replace('/seller/verification');
                }
            } else if (verificationStatus === 'verified') {
                // A verified seller should not be on the initial registration/verification pages.
                if (sellerFlowPaths.includes(pathname)) {
                    router.replace(protectedPaths.seller);
                }
            }
        }
        
    } else if (user && !user.emailVerified) {
        // If user's email is not verified, they must be on the verification page.
        if (pathname !== '/verify-email') {
            router.replace('/verify-email');
        }
    } else { 
        // User is not logged in.
        // If they try to access a page that is NOT public, redirect them to login.
        const isPublicRoute = publicOnlyPaths.includes(pathname) ||
                              pathname.startsWith('/live-selling') ||
                              pathname.startsWith('/product') ||
                              pathname === '/verify-email' || // Allow access for the email link
                              pathname === '/terms-and-conditions' ||
                              pathname === '/privacy-and-security';

        if (!isPublicRoute) {
            router.replace('/');
        }
    }
  }, [user, userData, loading, router, pathname]);

  if (loading) {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <LoadingSpinner />
        </div>
    );
  }

  return null;
}
