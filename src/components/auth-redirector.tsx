
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
    if (!authReady) {
      return; 
    }

    let targetPath: string | null = null;
    
    if (user) {
        // --- User is LOGGED IN ---
        if (!user.emailVerified && pathname !== emailVerificationPath) {
            targetPath = emailVerificationPath;
        } else if (userData) {
            const { role } = userData;

            if (role === 'admin') {
                if (publicOnlyPaths.includes(pathname) || pathname === emailVerificationPath) {
                    targetPath = '/admin/dashboard';
                }
            } else if (role === 'seller') {
                // If a seller lands on a public-only page (like login/signup) or the KYC page again, send them to their dashboard.
                if (publicOnlyPaths.includes(pathname) || pathname === '/seller/kyc' || pathname === emailVerificationPath) {
                    targetPath = '/seller/dashboard';
                }
            } else { // Customer
                if (pathname.startsWith('/admin/')) {
                    // Customers trying to access admin pages are redirected.
                    targetPath = '/live-selling';
                } else if (sellerPaths.includes(pathname)) {
                    // Customers can't access any specific seller pages.
                    targetPath = '/live-selling';
                } else if (publicOnlyPaths.includes(pathname) || pathname === emailVerificationPath) {
                    targetPath = '/live-selling';
                }
            }
        }
    } else { 
        // --- User is LOGGED OUT ---
        const isProtectedPath = 
            adminPaths.some(p => pathname.startsWith(p)) ||
            (sellerPaths.some(p => pathname.startsWith(p))) ||
            ['/profile', '/orders', '/wishlist', '/cart', '/wallet', '/setting', '/message', '/feed'].includes(pathname);
        
        // Logged-out users should be able to access the KYC page.
        if (isProtectedPath && pathname !== '/seller/kyc') {
             targetPath = `/?redirect=${pathname}`;
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
