'use client';

import { AuthRedirector } from '@/components/auth-redirector';
import { TopLoader } from '@/components/top-loader';
import { Toaster } from '@/components/ui/toaster';
import React from 'react';
import { MiniPlayerProvider } from '@/context/MiniPlayerContext';
import { MiniPlayer } from '@/components/mini-player';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <MiniPlayerProvider>
      <AuthRedirector />
      <React.Suspense fallback={<TopLoader />}>{children}</React.Suspense>
      <MiniPlayer />
      <Toaster />
    </MiniPlayerProvider>
  );
}
