
import Link from 'next/link';
import { OtpForm } from '@/components/auth/otp-form';
import { Logo } from '@/components/logo';
import { ChevronLeft } from 'lucide-react';

export default function OtpPage({ searchParams }: { searchParams: { identifier?: string } }) {
  const identifier = searchParams.identifier || '';

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background p-4">
       <div className="absolute top-4 left-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      <div className="mx-auto grid w-[380px] gap-8">
        <div className="grid gap-4 text-center">
            <div className="flex justify-center">
                <Logo className="h-16 w-16" />
            </div>
            <h1 className="text-3xl font-bold">Verify Your Account</h1>
            <p className="text-balance text-muted-foreground px-4">
                Enter the 6-digit code sent to <span className="font-semibold text-foreground">{identifier || 'your device'}</span>
            </p>
        </div>
        <OtpForm identifier={identifier} />
         <div className="text-center text-sm text-muted-foreground">
            Didn&apos;t receive the code? You can request a new one.
        </div>
      </div>
    </div>
  );
}
