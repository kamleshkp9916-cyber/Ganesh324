
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingSpinner } from './ui/loading-spinner';

const publicOnlyPaths = ['/signup', '/forgot-password', '/'];
const emailVerificationPath = '/verify-email';
const adminPaths = ['/admin', '/admin/dashboard', '/admin/orders', '/admin/users', '/admin/products', '/admin/live-control', '/admin/settings', '/admin/messages', '/admin/inquiries', '/admin/edit/privacy', '/admin/edit/terms'];
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

    // New rule: Always allow access to the seller KYC page, regardless of auth state.
    if (pathname === '/seller/kyc') {
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
                const isAlreadyInSellerArea = sellerPaths.some(p => pathname.startsWith(p));
                const isViewingPublicProfile = pathname.startsWith('/seller/profile');

                 if (!isAlreadyInSellerArea && !isViewingPublicProfile) {
                    targetPath = '/seller/dashboard';
                }
            } 
            else { // Customer
                 if (pathname.startsWith('/seller/') && !pathname.startsWith('/seller/profile')) {
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
        const isAuthRequiredPath = adminPaths.some(p => pathname.startsWith(p)) || sellerPaths.some(p => pathname.startsWith(p))
            || pathname === '/profile' || pathname === '/orders' || pathname === '/wishlist'
            || pathname === '/cart' || pathname === '/wallet' || pathname === '/setting'
            || pathname === '/message';

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
