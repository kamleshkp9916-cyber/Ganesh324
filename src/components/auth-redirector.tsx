
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingSpinner } from './ui/loading-spinner';

const publicOnlyPaths = ['/signup', '/forgot-password', '/'];
const emailVerificationPath = '/verify-email';

const isPublicAllowedPath = (pathname: string) => {
    const publicAllowedPrefixes = [
        '/live-selling', '/about', '/contact', '/terms-and-conditions', 
        '/privacy-and-security', '/faq', '/product/', '/stream/', 
        '/seller/profile', '/profile'
    ];
    return publicAllowedPrefixes.some(prefix => pathname.startsWith(prefix));
};

export function AuthRedirector() {
  const { user, loading, userData } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
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
        } else if (userData) {
            const { role } = userData;
            
            if (role === 'admin') {
                // If user is an admin, they should only be redirected away from public-only paths.
                if (publicOnlyPaths.includes(pathname) || pathname === emailVerificationPath) {
                    targetPath = '/admin/dashboard';
                }
                // Otherwise, let them stay on any page they are trying to access.
            } 
            else if (role === 'seller') {
                if (publicOnlyPaths.includes(pathname) || pathname === emailVerificationPath || pathname.startsWith('/admin')) {
                    targetPath = '/seller/dashboard';
                }
            } 
            else { // Customer
                 if (pathname.startsWith('/seller/') || pathname.startsWith('/admin/')) {
                    targetPath = '/live-selling';
                } else if (publicOnlyPaths.includes(pathname) || pathname === emailVerificationPath) {
                    targetPath = '/live-selling';
                }
            }
        }
    } 
    else { 
        // --- No user is logged in ---
        const isAllowed = publicOnlyPaths.includes(pathname) || isPublicAllowedPath(pathname);
                                
        if (!isAllowed) {
            targetPath = '/';
        }
    }

    if (targetPath && targetPath !== pathname) {
        router.replace(targetPath);
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
