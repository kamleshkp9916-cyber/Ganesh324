'use client';

import { AuthProvider } from '@/hooks/use-auth';
import { AuthRedirector } from '@/components/auth-redirector';
import { TopLoader } from '@/components/top-loader';
import { Toaster } from '@/components/ui/toaster';
import React from 'react';
import { ImpersonationHandler } from '@/components/auth/impersonation-handler';
import { MiniPlayerProvider } from '@/context/MiniPlayerContext';
import { MiniPlayer } from '@/components/mini-player';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MiniPlayerProvider>
        <ImpersonationHandler />
        <AuthRedirector />
        <React.Suspense fallback={<TopLoader />}>{children}</React.Suspense>
        <MiniPlayer />
        <Toaster />
      </MiniPlayerProvider>
    </AuthProvider>
  );
}
