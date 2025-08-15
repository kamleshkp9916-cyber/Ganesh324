
"use client";

import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

function SplashScreen() {
    return (
        <div className="relative flex h-full w-full flex-col items-center justify-center bg-primary p-10 text-primary-foreground">
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 flex flex-col items-center text-center">
                <h1 className="text-5xl font-black tracking-tighter">
                    Fast. Reliable. Yours.
                </h1>
                <p className="mt-2 max-w-sm text-lg">
                    Your one-stop shop, delivered in a flash. The future of online retail is here.
                </p>
            </div>
        </div>
    );
}

export default function Home() {
  return (
    <div className="relative min-h-screen w-full lg:grid lg:grid-cols-2">
       <div className="absolute right-4 top-4 z-10">
          <Link href="/live-selling" passHref>
              <Button variant="ghost">Skip</Button>
          </Link>
      </div>

      <div className="flex flex-col items-center justify-center p-6 lg:p-12" style={{ background: 'radial-gradient(ellipse at top, hsl(var(--primary) / 0.1), transparent 70%)' }}>
        <div className="mx-auto w-full max-w-[380px] space-y-8">
          <div className="grid gap-4 text-center">
            <div className="flex justify-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-primary">StreamCart</h1>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome to StreamCart</h2>
            <p className="text-balance text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>
          <LoginForm />
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-primary underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      
      <div className="hidden lg:flex">
         <SplashScreen />
      </div>
    </div>
  );
}
