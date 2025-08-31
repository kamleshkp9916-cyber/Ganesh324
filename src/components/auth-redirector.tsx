
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
    // Wait until the initial authentication check is complete.
    if (loading) {
      return; 
    }
    
    if (user) {
        // --- 1. Email Verification ---
        // If the user's email is not verified, this is the highest priority.
        // Force them to the verification page no matter what.
        if (!user.emailVerified) {
            if (pathname !== emailVerificationPath) {
                router.replace(emailVerificationPath);
            }
            return;
        }
        
        // --- 2. Wait for User Data ---
        // After email verification, we MUST have their data (role, status, etc.) to proceed.
        // If userData is still loading, do nothing and wait.
        if (!userData) {
            return;
        }

        // --- 3. Role-Based Redirection ---
        // Now that we have the user and their data, we can make a definitive redirection.
        if (userData.role === 'seller') {
            const { verificationStatus } = userData;
            
            // If the seller's status requires them to be on the verification page
            if (['pending', 'rejected', 'needs-resubmission'].includes(verificationStatus || '')) {
                if (pathname !== sellerVerificationPath) {
                    router.replace(sellerVerificationPath);
                }
            } 
            // If the seller is verified, they should be on their dashboard or other app pages
            else if (verificationStatus === 'verified') {
                // If they land on a public-only page or the wrong verification page, send them to their dashboard
                if (publicOnlyPaths.includes(pathname) || pathname === sellerVerificationPath || pathname === '/') {
                    router.replace('/seller/dashboard');
                }
            }
        } else if (userData.role === 'admin') {
            // Admin redirection logic
            if (publicOnlyPaths.includes(pathname) || pathname === sellerVerificationPath || pathname === '/') {
                router.replace('/admin/dashboard');
            }
        } else {
            // This is a customer. Redirect them away from login/signup pages.
            if (publicOnlyPaths.includes(pathname) || pathname === '/') {
                router.replace('/live-selling');
            }
        }
        
    } else { 
        // --- Logged-Out User ---
        // If the user is not logged in, they can only access public pages.
        const isPublicPage = publicOnlyPaths.includes(pathname) || pathname === '/' || pathname === '/live-selling' || pathname.startsWith('/seller/register');
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
