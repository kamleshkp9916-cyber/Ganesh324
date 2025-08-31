
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingSpinner } from './ui/loading-spinner';

// Define paths that are accessible only when logged out.
const publicOnlyPaths = ['/', '/signup', '/forgot-password', '/seller/login'];

// Seller-specific flow paths
const sellerFlowPaths = ['/seller/register', '/seller/verification'];

export function AuthRedirector() {
  const { user, loading, userData } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until authentication status and user data are fully loaded.
    if (loading) {
      return; 
    }
    
    if (user) {
        // User is logged in.

        if (!userData) {
            // This case can happen for a brief moment while userData is being fetched.
            // We wait to prevent incorrect redirects.
            return;
        }

        if (user.emailVerified) {
            // --- REDIRECTION FOR VERIFIED USERS ---

            // Handle role-specific logic
            if (userData.role === 'seller') {
                const { verificationStatus } = userData;

                if (verificationStatus === 'verified') {
                    // Verified sellers should be on their dashboard or other app pages,
                    // but not on public-only or initial seller flow pages.
                    if (publicOnlyPaths.includes(pathname) || sellerFlowPaths.includes(pathname)) {
                         router.replace('/seller/dashboard');
                    }
                } else {
                    // Sellers who are pending, rejected, or need resubmission
                    // MUST be on the verification page.
                    if (pathname !== '/seller/verification') {
                        router.replace('/seller/verification');
                    }
                }
            } else if (userData.role === 'admin') {
                 if (publicOnlyPaths.includes(pathname)) {
                    router.replace('/admin/dashboard');
                }
            } else {
                // This is a customer.
                if (publicOnlyPaths.includes(pathname)) {
                    router.replace('/live-selling');
                }
            }
        } else {
            // --- REDIRECTION FOR UNVERIFIED USERS ---
            // User is logged in but email is not verified. Force them to the verify-email page.
            if (pathname !== '/verify-email') {
                router.replace('/verify-email');
            }
        }
        
    } else { 
        // --- REDIRECTION FOR LOGGED-OUT USERS ---
        const isProtectedRoute = pathname.startsWith('/admin') ||
                                 pathname.startsWith('/seller/dashboard') ||
                                 pathname === '/profile' ||
                                 pathname === '/orders' ||
                                 pathname === '/cart';

        if (isProtectedRoute) {
            router.replace('/');
        }
    }
  }, [user, userData, loading, router, pathname]);

  // While loading, show a spinner to prevent page flicker
  if (loading) {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <LoadingSpinner />
        </div>
    );
  }

  // Once loading is complete, the redirect logic will have been executed.
  return null;
}
