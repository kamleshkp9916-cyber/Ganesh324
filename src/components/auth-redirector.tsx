
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingSpinner } from './ui/loading-spinner';

const publicOnlyPaths = ['/signup', '/forgot-password', '/'];
const emailVerificationPath = '/verify-email';
const sellerVerificationPath = '/seller/verification';
const adminPaths = ['/admin/dashboard', '/admin/orders', '/admin/users', '/admin/inquiries', '/admin/products'];
const sellerPaths = ['/seller/dashboard', '/seller/orders', '/seller/products', '/seller/messages'];

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
    if (loading || (user && !userData)) {
      return; 
    }
    
    let targetPath: string | null = null;
    
    if (user) {
        // --- User is logged in ---
        if (!user.emailVerified) {
            if (pathname !== emailVerificationPath) {
                targetPath = emailVerificationPath;
            }
        } else {
            const { role, verificationStatus } = userData;
            
            // 1. Admin check (Highest Priority)
            if (role === 'admin') {
                if (!pathname.startsWith('/admin')) {
                    targetPath = '/admin/dashboard';
                }
            } 
            // 2. Seller check
            else if (role === 'seller') {
                if (verificationStatus !== 'verified') {
                    if (pathname !== sellerVerificationPath) {
                        targetPath = sellerVerificationPath;
                    }
                } else { // Verified seller
                    if (publicOnlyPaths.includes(pathname) || pathname === emailVerificationPath || pathname === sellerVerificationPath || pathname.startsWith('/admin')) {
                        targetPath = '/seller/dashboard';
                    }
                }
            } 
            // 3. Customer check (Default)
            else { 
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
            pathname.startsWith('/seller/profile') || // Allow viewing seller profiles
            pathname.startsWith('/profile') || // Allow viewing customer profiles
            pathname === '/seller/kyc';
                                
        if (!isPublicAllowed) {
            targetPath = '/';
        }
    }

    if (targetPath && targetPath !== pathname) {
        setIsRedirecting(true);
        router.replace(targetPath);
    } else {
        setIsRedirecting(false);
    }

  }, [user, userData, loading, router, pathname]);

  if (loading || (user && !userData) || isRedirecting) {
    return (
        <div className="w-full h-screen flex items-center justify-center bg-background">
            <LoadingSpinner />
        </div>
    );
  }

  return null;
}
