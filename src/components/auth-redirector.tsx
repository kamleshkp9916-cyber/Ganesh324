
"use client";

import { useEffect } from 'react';
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

  useEffect(() => {
    // Wait until both authentication and user data loading are fully complete.
    if (loading || (user && !userData)) {
      return; 
    }
    
    if (user) {
        // --- User is fully loaded, proceed with redirection logic ---

        if (!user.emailVerified) {
            if (pathname !== emailVerificationPath) {
                router.replace(emailVerificationPath);
            }
            return;
        }

        const { role, verificationStatus } = userData;

        if (role === 'seller') {
            const isVerificationIncomplete = verificationStatus !== 'verified';
            
            if (isVerificationIncomplete) {
                if (pathname !== sellerVerificationPath) {
                    router.replace(sellerVerificationPath);
                }
                return;
            }
            
            if (verificationStatus === 'verified') {
                if (publicOnlyPaths.includes(pathname) || pathname === sellerVerificationPath || pathname === emailVerificationPath) {
                    router.replace('/seller/dashboard');
                }
                return;
            }
        }
        
        else if (role === 'admin') {
             if (publicOnlyPaths.includes(pathname) || pathname === emailVerificationPath || pathname === sellerVerificationPath) {
                router.replace('/admin/dashboard');
            }
        }
        
        else { // This is a 'customer'.
            if (publicOnlyPaths.includes(pathname) || pathname === emailVerificationPath || pathname === sellerVerificationPath || pathname.startsWith('/seller') || pathname.startsWith('/admin')) {
                router.replace('/live-selling');
            }
        }
    } 
    else { 
        // No user is logged in.
        const isPublicAllowed = 
            publicOnlyPaths.includes(pathname) || 
            publicAllowedPaths.includes(pathname) ||
            pathname.startsWith('/product/') ||
            pathname.startsWith('/seller/profile');
                                
        if (!isPublicAllowed) {
            router.replace('/');
        }
    }
  }, [user, userData, loading, router, pathname]);

  // Show a full-screen loader whenever the auth state is loading OR when we have a user
  // but are still waiting for their detailed profile from the database.
  // This is the key fix to prevent the "flash" of incorrect pages.
  if (loading || (user && !userData)) {
    return (
        <div className="w-full h-screen flex items-center justify-center bg-background">
            <LoadingSpinner />
        </div>
    );
  }

  return null;
}
