
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingSpinner } from './ui/loading-spinner';
import { updateUserDataOnServer } from '@/lib/firebase-server-utils';

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
  const { user, loading, userData, authReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until both authentication and user data are confirmed to be loaded
    if (!authReady) {
      return; 
    }

    const ensureAdmin = async () => {
        if (user && userData && user.email === 'kamleshkp9916@gmail.com' && userData.role !== 'admin') {
            await updateUserDataOnServer(user.uid, { role: 'admin' });
            // The onSnapshot listener in useAuth should pick this up, but we can force a reload
            // to ensure redirection logic runs with the latest data.
            window.location.reload();
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
    };
    
    ensureAdmin();

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
