
"use client";

import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function Home() {
  const { loading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // The AuthRedirector will handle moving away from this page if the user is already logged in.
  if (!isMounted || loading) {
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
                <Link href="/seller/kyc" className="font-semibold text-primary underline">
                  Register here
                </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

