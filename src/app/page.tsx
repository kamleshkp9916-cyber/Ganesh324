
import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 bg-white">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-4 text-center">
             <div className="lg:hidden flex justify-center">
                <Image src="/company-logo.png" alt="Company Logo" width={56} height={56} data-ai-hint="logo" />
             </div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome to StreamCart</h1>
            <p className="text-balance text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline font-semibold text-primary">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-primary lg:flex items-center justify-center p-10 relative">
        <div className="absolute inset-0 bg-black/30" />
        <div className="text-center text-primary-foreground relative z-10">
            <Image src="/company-logo.png" alt="Company Logo" width={128} height={128} className="mx-auto" data-ai-hint="logo" />
            <h2 className="mt-6 text-5xl font-black tracking-tighter">Fast. Reliable. Yours.</h2>
            <p className="mt-2 text-lg max-w-sm mx-auto">Your one-stop shop, delivered in a flash. The future of online retail is here.</p>
        </div>
      </div>
    </div>
  );
}
