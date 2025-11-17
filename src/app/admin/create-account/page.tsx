
"use client";

import Link from 'next/link';
import { SignupForm } from '@/components/auth/signup-form';
import { ChevronLeft, Shield } from 'lucide-react';
import { AdminLayout } from '@/components/admin/admin-layout';

export default function AdminCreateAccountPage() {
  return (
    <AdminLayout>
        <main className="flex-1 flex items-center justify-center p-4">
             <div className="mx-auto grid w-full max-w-lg gap-6">
                <div className="grid gap-2 text-center">
                    <div className="flex justify-center items-center gap-2">
                        <Shield className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold">Create Admin/Executive</h1>
                    </div>
                    <p className="text-balance text-muted-foreground">
                    This form is for creating a new administrator or support executive account.
                    </p>
                </div>
                {/* We can reuse the signup form and pass a prop to tell it to create an admin */}
                <SignupForm isAdminSignup={true} />
            </div>
        </main>
    </AdminLayout>
  );
}
