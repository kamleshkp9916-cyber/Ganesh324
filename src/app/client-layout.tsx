
'use client';

import { AuthProvider } from '@/hooks/use-auth.tsx';
import { AuthRedirector } from '@/components/auth-redirector';
import { TopLoader } from '@/components/top-loader';
import { Toaster } from '@/components/ui/toaster';
import React from 'react';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthRedirector />
      <React.Suspense fallback={<TopLoader />}>{children}</React.Suspense>
      <Toaster />
    </AuthProvider>
  );
}
