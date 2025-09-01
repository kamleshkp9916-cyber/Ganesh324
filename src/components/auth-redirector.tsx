
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingSpinner } from './ui/loading-spinner';

const publicOnlyPaths = ['/signup', '/forgot-password', '/'];
const emailVerificationPath = '/verify-email';
const sellerVerificationPath = '/seller/verification';
const publicAllowedPaths = [
    '/live-selling',
    '/about',
    '/contact',
    '/terms-and-conditions',
    '/privacy-and-security',
    '/faq',
];


export function AuthRedirector() {
  const { user, loading, userData } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Wait until all user data is fully loaded to prevent premature decisions.
    if (loading || (user && !userData)) {
      return; 
    }
    
    let targetPath: string | null = null;
    
    if (user) {
        // --- User is logged in, determine where they should be ---

        if (!user.emailVerified) {
            if (pathname !== emailVerificationPath) {
                targetPath = emailVerificationPath;
            }
        } else {
            const { role, verificationStatus } = userData;

            if (role === 'seller') {
                if (verificationStatus !== 'verified') {
                    if (pathname !== sellerVerificationPath) {
                        targetPath = sellerVerificationPath;
                    }
                } else { // Verified seller
                    if (publicOnlyPaths.includes(pathname) || pathname === emailVerificationPath || pathname === sellerVerificationPath) {
                        targetPath = '/seller/dashboard';
                    }
                }
            } else if (role === 'admin') {
                if (publicOnlyPaths.includes(pathname) || pathname === emailVerificationPath || pathname === sellerVerificationPath) {
                    targetPath = '/admin/dashboard';
                }
            } else { // Customer
                 if (publicOnlyPaths.includes(pathname) || pathname === emailVerificationPath || pathname === sellerVerificationPath || pathname.startsWith('/seller') || pathname.startsWith('/admin')) {
                    targetPath = '/live-selling';
                }
            }
        }
    } 
    else { 
        // --- No user is logged in ---
        const isPublicAllowed = 
            publicOnlyPaths.includes(pathname) || 
            publicAllowedPaths.includes(pathname) ||
            pathname.startsWith('/product/') ||
            pathname.startsWith('/stream/') ||
            pathname.startsWith('/seller/profile');
                                
        if (!isPublicAllowed) {
            targetPath = '/';
        }
    }

    // If a redirect is needed, set the flag and perform the redirect.
    if (targetPath && targetPath !== pathname) {
        setIsRedirecting(true);
        router.replace(targetPath);
    } else {
        setIsRedirecting(false);
    }

  }, [user, userData, loading, router, pathname]);

  // This is the key change: Show a full-screen loader if auth is loading,
  // or if a redirect has been initiated. This prevents the "flash".
  if (loading || (user && !userData) || isRedirecting) {
    return (
        <div className="w-full h-screen flex items-center justify-center bg-background">
            <LoadingSpinner />
        </div>
    );
  }

  // If no loading and no redirect, render the children (the actual page).
  return null;
}
