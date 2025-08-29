"use client";

import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserData, updateUserData, UserData } from '@/lib/follow-data';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && isMounted && user) {
      // Once auth is loaded and we're on the client, check user data
      const userData = getUserData(user.uid);

      // If it's a new user, their data might not be in localStorage yet.
      // We check for a session storage item created during signup.
      const newUserSessionData = sessionStorage.getItem(`newUser_${user.uid}`);
      if (newUserSessionData) {
          const newUser = JSON.parse(newUserSessionData);
          updateUserData(user.uid, newUser);
          sessionStorage.removeItem(`newUser_${user.uid}`);
      }

      // Now, get the potentially updated user data.
      const finalUserData = getUserData(user.uid, { 
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: 'customer' // Default to customer if no role is set
      });

      // Ensure the latest data is also stored
      updateUserData(user.uid, finalUserData);

      // Perform redirection based on the final user role and status
      if (finalUserData.role === 'admin') {
        router.replace('/admin/dashboard');
      } else if (finalUserData.role === 'seller') {
        const sellerDetails = JSON.parse(localStorage.getItem('sellerDetails') || '{}');
        // @ts-ignore
        if (sellerDetails.verificationStatus === 'verified') {
          router.replace('/seller/dashboard');
        } else {
          router.replace('/seller/verification');
        }
      } else { // Default role is 'customer'
        router.replace('/live-selling');
      }
    }
  }, [user, loading, isMounted, router]);
  
  if (loading || (isMounted && user)) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isMounted) {
     return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-foreground p-8">
        <div className="max-w-md text-center">
            <Logo className="h-24 w-auto mx-auto mb-6" />
            <h1 className="text-4xl font-bold">Welcome to StreamCart</h1>
            <p className="mt-4 text-lg text-muted-foreground">
                Your one-stop shop for live shopping. Discover, engage, and buy in real-time.
            </p>
        </div>
      </div>
      <div className="flex items-center justify-center p-4 relative bg-background">
         <div className="absolute right-4 top-4 z-10">
            <Link href="/live-selling" passHref>
                <Button variant="ghost">
                  Skip <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
        </div>
        <div className="mx-auto w-full max-w-sm space-y-8">
          <div className="grid gap-4 text-center">
             <div className="flex justify-center lg:hidden">
                <Logo className="h-16 w-16" />
             </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Login to Your Account</h2>
            <p className="text-balance text-muted-foreground">
              Enter your credentials to access your account.
            </p>
          </div>
          <LoginForm />
          <div className="mt-4 space-y-2 text-center text-sm">
            <div>
                Don't have an account?{" "}
                <Link href="/signup" className="font-semibold text-primary underline">
                Sign up
                </Link>
            </div>
             <div>
                Want to become a seller?{" "}
                 <Link href="/seller/register" className="font-semibold text-primary underline">
                    Register here
                </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
