
"use client";

import Link from 'next/link';
import { SignupForm } from '@/components/auth/signup-form';
import { ChevronLeft, Shield } from 'lucide-react';

export default function AdminCreateAccountPage() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-background p-4 relative">
       <div className="absolute top-4 left-4 flex items-center gap-4">
          <Link href="/admin/users" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            Back to Users
          </Link>
        </div>
      <div className="mx-auto grid w-[400px] gap-6">
        <div className="grid gap-2 text-center">
            <div className="flex justify-center items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Create Admin Account</h1>
            </div>
             <p className="text-balance text-muted-foreground">
              This form is for creating a new administrator account.
            </p>
        </div>
        {/* We can reuse the signup form and pass a prop to tell it to create an admin */}
        <SignupForm isAdminSignup={true} />
      </div>
    </div>
  );
}
