
"use client";

import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getUserData } from '@/lib/follow-data';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
        const userData = getUserData(user.uid);
        if (userData && userData.role === 'seller') {
             router.replace('/seller/dashboard');
        } else {
            router.replace('/live-selling');
        }
    }
  }, [user, loading, router]);


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
          <LoginForm role="customer" />
          <div className="mt-4 space-y-2 text-center text-sm">
            <div>
                Don't have an account?{" "}
                <Link href="/signup" className="font-semibold text-primary underline">
                Sign up
                </Link>
            </div>
             <div className="flex items-center justify-center gap-4">
                Are you a seller?{" "}
                <div className="flex gap-2">
                    <Link href="/seller/login" className="font-semibold text-primary underline">
                        Login
                    </Link>
                    <span>or</span>
                     <Link href="/seller/register" className="font-semibold text-primary underline">
                        Become a Seller
                    </Link>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
