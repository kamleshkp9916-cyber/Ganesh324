
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingSpinner } from './ui/loading-spinner';

const publicOnlyPaths = ['/signup', '/forgot-password', '/'];
const emailVerificationPath = '/verify-email';

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
    // If auth state is still loading, wait.
    if (loading) {
      return; 
    }
    
    let targetPath: string | null = null;
    
    if (user) {
        // --- User is logged in ---
        if (!user.emailVerified) {
            if (pathname !== emailVerificationPath) {
                targetPath = emailVerificationPath;
            }
        } else if (userData) { // Make sure we have the role data
            const { role } = userData;
            
            // 1. Admin check (Highest Priority)
            if (role === 'admin') {
                // Admins should only be redirected away from pages meant for non-logged-in users.
                if (publicOnlyPaths.includes(pathname)) {
                    targetPath = '/admin/dashboard';
                }
            } 
            // 2. Seller check
            else if (role === 'seller') {
                 // Verified seller
                if (publicOnlyPaths.includes(pathname) || pathname === emailVerificationPath || pathname.startsWith('/admin')) {
                    targetPath = '/seller/dashboard';
                }
            } 
            // 3. Customer check (Default)
            else { 
                 if (publicOnlyPaths.includes(pathname) || pathname === emailVerificationPath || pathname.startsWith('/seller') || pathname.startsWith('/admin')) {
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
            pathname.startsWith('/seller/profile') ||
            pathname.startsWith('/profile') ||
            pathname === '/seller/kyc';
                                
        if (!isPublicAllowed) {
            targetPath = '/';
        }
    }

    if (targetPath && targetPath !== pathname) {
        router.replace(targetPath);
    }

  }, [user, userData, loading, router, pathname]);

  // Show a spinner ONLY while the initial auth check is happening.
  if (loading) {
    return (
        <div className="w-full h-screen flex items-center justify-center bg-background">
            <LoadingSpinner />
        </div>
    );
  }

  // Once loading is false, render nothing and let the effect handle redirection.
  // This prevents rendering the page content for a split second before redirecting.
  return null;
}
