
import Link from 'next/link';
import { SignupForm } from '@/components/auth/signup-form';
import { ChevronLeft } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background p-4 relative">
       <div className="absolute top-4 left-4 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      <div className="mx-auto grid w-[400px] gap-6">
        <div className="grid gap-2 text-center">
            <div className="flex justify-center items-center gap-2">
                <h1 className="text-3xl font-bold">Sign Up</h1>
            </div>
        </div>
        <SignupForm />
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/" className="underline font-semibold text-primary">
            Login Now
          </Link>
        </div>
      </div>
    </div>
  );
}
