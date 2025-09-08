
'use client';

import { AuthProvider } from '@/hooks/use-auth.tsx';
import { AuthRedirector } from '@/components/auth-redirector';
import { TopLoader } from '@/components/top-loader';
import { Toaster } from '@/components/ui/toaster';
import React from 'react';
import { ImpersonationHandler } from '@/components/auth/impersonation-handler';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ImpersonationHandler />
      <AuthRedirector />
      <React.Suspense fallback={<TopLoader />}>{children}</React.Suspense>
      <Toaster />
    </AuthProvider>
  );
}
