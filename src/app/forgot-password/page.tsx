
import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { Logo } from '@/components/logo';
import { ChevronLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </div>
      <div className="mx-auto grid w-[380px] gap-8">
        <div className="grid gap-4 text-center">
            <div className="flex justify-center">
                <Logo className="h-16 w-16" />
            </div>
            <h1 className="text-3xl font-bold">Forgot Your Password?</h1>
            <p className="text-balance text-muted-foreground px-4">
                No worries! Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
