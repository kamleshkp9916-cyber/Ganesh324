
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingSpinner } from './ui/loading-spinner';

const publicOnlyPaths = ['/signup', '/forgot-password', '/seller/login'];
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
                if (publicOnlyPaths.includes(pathname) || pathname === sellerVerificationPath || pathname === '/') {
                    router.replace('/seller/dashboard');
                }
            } else { // 'pending', 'rejected', or 'needs-resubmission'.
                if (pathname !== sellerVerificationPath) {
                    router.replace(sellerVerificationPath);
                }
            }
        } else if (userData.role === 'admin') {
            if (publicOnlyPaths.includes(pathname) || pathname === sellerVerificationPath || pathname === '/') {
                router.replace('/admin/dashboard');
            }
        } else {
            // This is a customer.
            if (publicOnlyPaths.includes(pathname) || pathname === '/') {
                router.replace('/live-selling');
            }
        }
        
    } else { 
        // --- REDIRECTION FOR LOGGED-OUT USERS ---
        // If the user is logged out, they should be redirected to the login page
        // if they try to access any page that isn't public.
        const isPublicPage = publicOnlyPaths.includes(pathname) || pathname === '/' || pathname === '/live-selling';
        
        // Allow access to product and seller profile pages for logged-out users
        const isPublicDetailView = pathname.startsWith('/product/') || pathname.startsWith('/seller/profile');

        if (!isPublicPage && !isPublicDetailView) {
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
