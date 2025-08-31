
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingSpinner } from './ui/loading-spinner';

const publicOnlyPaths = ['/', '/signup', '/forgot-password', '/seller/login', '/seller/register'];
const sellerVerificationPath = '/seller/verification';
const emailVerificationPath = '/verify-email';

export function AuthRedirector() {
  const { user, loading, userData } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until authentication status AND user data are fully loaded.
    if (loading) {
      return; 
    }
    
    if (user) {
        // User is authenticated
        if (!user.emailVerified) {
            // --- REDIRECTION FOR UNVERIFIED USERS ---
            // Force them to the verify-email page if they aren't already there.
            if (pathname !== emailVerificationPath) {
                router.replace(emailVerificationPath);
            }
            return; // Stop further processing
        }
        
        // At this point, user is authenticated and email is verified.
        // We MUST have userData to proceed. If not, something is wrong, but we wait.
        if (!userData) {
            return;
        }

        // --- REDIRECTION FOR VERIFIED, LOGGED-IN USERS ---
        if (userData.role === 'seller') {
            const { verificationStatus } = userData;
            
            if (verificationStatus === 'verified') {
                // Verified sellers should be on their dashboard or other app pages,
                // but not on public-only or initial seller flow pages.
                if (publicOnlyPaths.includes(pathname) || pathname === sellerVerificationPath) {
                    router.replace('/seller/dashboard');
                }
            } else {
                // Seller is 'pending', 'rejected', or 'needs-resubmission'.
                // They MUST be on the verification page.
                if (pathname !== sellerVerificationPath) {
                    router.replace(sellerVerificationPath);
                }
            }
        } else if (userData.role === 'admin') {
            // Admin redirection
             if (publicOnlyPaths.includes(pathname) || pathname === sellerVerificationPath) {
                router.replace('/admin/dashboard');
            }
        } else {
            // This is a customer.
            // If they are on a public-only page, redirect to the main app experience.
            if (publicOnlyPaths.includes(pathname)) {
                router.replace('/live-selling');
            }
        }
        
    } else { 
        // --- REDIRECTION FOR LOGGED-OUT USERS ---
        const isProtectedRoute = pathname.startsWith('/admin') ||
                                 pathname.startsWith('/seller/dashboard') ||
                                 pathname === '/profile' ||
                                 pathname === '/orders' ||
                                 pathname === '/cart' ||
                                 pathname === sellerVerificationPath ||
                                 pathname === emailVerificationPath;

        if (isProtectedRoute) {
            router.replace('/');
        }
    }
  }, [user, userData, loading, router, pathname]);


  if (loading) {
    return (
        <div className="w-full h-screen flex items-center justify-center bg-background">
            <LoadingSpinner />
        </div>
    );
  }

  return null;
}
