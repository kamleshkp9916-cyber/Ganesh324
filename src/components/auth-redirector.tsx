
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingSpinner } from './ui/loading-spinner';

const publicOnlyPaths = ['/signup', '/forgot-password', '/seller/login', '/seller/register', '/'];
const emailVerificationPath = '/verify-email';
const sellerVerificationPath = '/seller/verification';

export function AuthRedirector() {
  const { user, loading, userData } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. If we are still loading auth state or user data, we must wait.
    // The spinner will be shown, preventing any premature redirects.
    if (loading) {
      return; 
    }
    
    // --- USER IS LOGGED IN ---
    if (user && userData) {
        // 2. Handle Email Verification first. This is the highest priority for a logged-in user.
        if (!user.emailVerified) {
            if (pathname !== emailVerificationPath) {
                router.replace(emailVerificationPath);
            }
            return; // Stop further execution until email is verified
        }

        // 3. Handle Role-Based Redirection now that we know email is verified.
        const { role, verificationStatus } = userData;

        if (role === 'seller') {
            const isVerificationIncomplete = verificationStatus !== 'verified';
            
            // If seller's verification is not complete, they MUST be on the verification page.
            if (isVerificationIncomplete) {
                if (pathname !== sellerVerificationPath) {
                    router.replace(sellerVerificationPath);
                }
                return; // Stop further execution.
            }
            
            // If seller is fully verified, they should not be on any public-only or verification pages.
            if (verificationStatus === 'verified') {
                if (publicOnlyPaths.includes(pathname) || pathname === sellerVerificationPath || pathname === emailVerificationPath) {
                    router.replace('/seller/dashboard');
                }
                return;
            }
        }
        
        else if (role === 'admin') {
             // If admin is on any public-only or verification pages, redirect to their dashboard.
             if (publicOnlyPaths.includes(pathname) || pathname === emailVerificationPath || pathname === sellerVerificationPath) {
                router.replace('/admin/dashboard');
            }
        }
        
        else { // This is a 'customer'.
            // If a customer is on a page they shouldn't be on, redirect to the main app page.
            if (publicOnlyPaths.includes(pathname) || pathname === emailVerificationPath || pathname === sellerVerificationPath || pathname.startsWith('/seller') || pathname.startsWith('/admin')) {
                router.replace('/live-selling');
            }
        }
    } 
    // --- USER IS LOGGED OUT ---
    else { 
        const isPublicAllowed = 
            publicOnlyPaths.includes(pathname) || 
            pathname.startsWith('/product/') ||
            pathname.startsWith('/seller/profile') ||
            pathname === '/live-selling' ||
            pathname === '/about' ||
            pathname === '/contact' ||
            pathname === '/terms-and-conditions' ||
            pathname === '/privacy-and-security' ||
            pathname === '/faq';
                                
        // If a logged-out user tries to access a protected page, send them to the main login page.
        if (!isPublicAllowed) {
            router.replace('/');
        }
    }
  }, [user, userData, loading, router, pathname]);

  // Only show the spinner if the auth state is genuinely loading.
  // Once loaded, this component becomes "invisible" and lets the `useEffect` handle redirection.
  if (loading) {
    return (
        <div className="w-full h-screen flex items-center justify-center bg-background">
            <LoadingSpinner />
        </div>
    );
  }

  return null;
}

    