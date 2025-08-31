
"use client"

import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function SellerLoginPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    // The AuthRedirector now handles all post-login redirection.
    // This page's only job is to show the login form.
    // If a user is already logged in, the redirector will move them away from this page.
    
    if (loading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

  return (
    <div className="w-full min-h-screen grid lg:grid-cols-2">
       <div className="flex items-center justify-center p-4 relative bg-background">
         <div className="absolute left-4 top-4 z-10">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
        </div>
        <div className="mx-auto w-full max-w-sm space-y-8">
          <div className="grid gap-4 text-center">
             <div className="flex justify-center">
                <Logo className="h-16 w-16" />
             </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Seller Login</h2>
            <p className="text-balance text-muted-foreground">
              Enter your seller credentials to access your dashboard.
            </p>
          </div>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            Don't have a seller account?{" "}
            <Link href="/seller/register" className="font-semibold text-primary underline">
              Become a Seller
            </Link>
          </div>
        </div>
      </div>
       <div className="hidden lg:flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-foreground p-8">
        <div className="max-w-md text-center">
            <Logo className="h-24 w-auto mx-auto mb-6" />
            <h1 className="text-4xl font-bold">Welcome Back, Seller!</h1>
            <p className="mt-4 text-lg text-muted-foreground">
                Manage your products, engage with customers, and grow your business.
            </p>
        </div>
      </div>
    </div>
  );
}
