
"use client";

import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background p-4 relative">
       <div className="absolute right-4 top-4 z-10">
          <Link href="/live-selling" passHref>
              <Button variant="ghost">Skip</Button>
          </Link>
      </div>

      <div className="mx-auto w-full max-w-[380px] space-y-8">
        <div className="grid gap-4 text-center">
          <div className="flex justify-center">
             <Logo className="h-16 w-16" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome to StreamCart</h2>
          <p className="text-balance text-muted-foreground">
            Enter your credentials to access your account
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
              Want to sell on StreamCart?{" "}
              <Link href="/seller/register" className="font-semibold text-primary underline">
              Become a Seller
              </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
