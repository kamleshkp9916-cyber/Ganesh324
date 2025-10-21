
"use client";

import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { ChevronLeft } from 'lucide-react';
import { Suspense } from 'react';

function ForgotPasswordContent() {
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
          <h1 className="text-3xl font-bold">Reset Your Password</h1>
          <p className="text-balance text-muted-foreground px-4">
            Enter your email to receive a secure link to reset your password.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}


export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  )
}
