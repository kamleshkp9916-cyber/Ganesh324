
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
    // 1. Wait until all authentication and user data is fully loaded.
    if (loading) {
      return; 
    }
    
    // --- USER IS LOGGED IN ---
    if (user && userData) {
        // 2. Handle Email Verification: This is the highest priority.
        if (!user.emailVerified) {
            if (pathname !== emailVerificationPath) {
                router.replace(emailVerificationPath);
            }
            return;
        }

        // 3. Handle Role-Based Redirection
        const { role, verificationStatus } = userData;

        if (role === 'seller') {
            const isPendingVerification = ['pending', 'rejected', 'needs-resubmission'].includes(verificationStatus || '');
            
            // If seller's verification is pending, they MUST be on the verification page.
            if (isPendingVerification) {
                if (pathname !== sellerVerificationPath) {
                    router.replace(sellerVerificationPath);
                }
                return;
            }
            
            // If seller is verified, they should not be on public-only or verification pages.
            if (verificationStatus === 'verified') {
                if (publicOnlyPaths.includes(pathname) || pathname === sellerVerificationPath || pathname === emailVerificationPath) {
                    router.replace('/seller/dashboard');
                }
                return;
            }
        }
        
        else if (role === 'admin') {
             if (publicOnlyPaths.includes(pathname) || pathname === sellerVerificationPath || pathname === emailVerificationPath) {
                router.replace('/admin/dashboard');
            }
        }
        
        else { // This is a customer
            if (publicOnlyPaths.includes(pathname) || pathname === sellerVerificationPath || pathname.startsWith('/seller')) {
                router.replace('/live-selling');
            }
        }
        
    } 
    // --- USER IS LOGGED OUT ---
    else { 
        const isPublicAllowed = publicOnlyPaths.includes(pathname) || 
                                pathname.startsWith('/product/') ||
                                pathname.startsWith('/seller/profile') ||
                                pathname === '/live-selling' ||
                                pathname === '/about' ||
                                pathname === '/contact' ||
                                pathname === '/terms-and-conditions' ||
                                pathname === '/privacy-and-security' ||
                                pathname === '/faq';
                                
        if (!isPublicAllowed) {
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
