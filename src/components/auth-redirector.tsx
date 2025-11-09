"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingSpinner } from './ui/loading-spinner';

const publicOnlyPaths = ['/signup', '/forgot-password', '/'];
const emailVerificationPath = '/verify-email';
const adminPaths = ['/admin', '/admin/dashboard', '/admin/orders', '/admin/users', '/admin/products', '/admin/live-control', '/admin/settings', '/admin/messages', '/admin/inquiries', '/admin/edit/privacy', '/admin/edit/terms', '/admin/kyc'];
const sellerPaths = ['/seller/dashboard', '/seller/products', '/seller/orders', '/seller/messages', '/seller/revenue', '/seller/promotions', '/seller/feed', '/seller/settings', '/seller/live/studio', '/seller/settings/kyc'];


const isPublicAllowedPath = (pathname: string) => {
    const publicAllowedPrefixes = [
        '/live-selling', '/about', '/contact', '/terms-and-conditions', 
        '/privacy-and-security', '/faq', '/product/', '/stream/', 
        '/seller/profile', '/profile', '/listed-products', '/women', '/men',
        '/kids', '/home', '/electronics', '/shoes', '/handbags', '/trending', '/sale',
    ];
    // Allow category pages
    if (pathname.startsWith('/[...category]')) return true;

    return publicAllowedPrefixes.some(prefix => pathname.startsWith(prefix));
};

export function AuthRedirector() {
  const { user, loading, userData, authReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until both authentication and user data are confirmed to be loaded
    if (!authReady) {
      return; 
    }

    let targetPath: string | null = null;
    
    if (user) {
        // --- User is logged in ---
        if (!user.emailVerified) {
            if (pathname !== emailVerificationPath) {
                targetPath = emailVerificationPath;
            }
        } else if (userData) {
            const { role } = userData;
            
            if (role === 'admin') {
                if (publicOnlyPaths.includes(pathname) || pathname === emailVerificationPath) {
                    targetPath = '/admin/dashboard';
                }
            } 
            else if (role === 'seller') {
                // Sellers should be redirected away from the initial KYC page to their dashboard.
                if (pathname === '/seller/kyc' || publicOnlyPaths.includes(pathname)) {
                    targetPath = '/seller/dashboard';
                }
            } 
            else { // Customer
                 if (pathname.startsWith('/seller/') && pathname !== '/seller/kyc' && !pathname.startsWith('/seller/profile')) {
                    // If a customer tries to access any seller page EXCEPT kyc or profile, redirect them.
                    targetPath = '/live-selling';
                } else if(pathname.startsWith('/admin/')) {
                    targetPath = '/live-selling';
                } else if (publicOnlyPaths.includes(pathname) || pathname === emailVerificationPath) {
                    targetPath = '/live-selling';
                }
            }
        }
    } 
    else { 
        // --- No user is logged in ---
        // If a non-logged-in user tries to access a protected route, send them to login.
        // The seller KYC page is an exception and should be accessible publicly.
        const isAuthRequiredPath = adminPaths.some(p => pathname.startsWith(p)) || 
            sellerPaths.filter(p => p !== '/seller/kyc').some(p => pathname.startsWith(p)) ||
            ['/profile', '/orders', '/wishlist', '/cart', '/wallet', '/setting', '/message'].includes(pathname);

        if (isAuthRequiredPath) {
             targetPath = '/';
        }
    }

    if (targetPath && targetPath !== pathname) {
        router.replace(targetPath);
    }

  }, [user, userData, authReady, router, pathname]);

  if (!authReady) {
    return (
        <div className="w-full h-screen flex items-center justify-center bg-background">
            <LoadingSpinner />
        </div>
    );
  }

  return null;
}
