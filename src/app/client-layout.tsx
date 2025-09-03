
'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/hooks/use-auth.tsx';
import { AuthRedirector } from '@/components/auth-redirector';
import { TopLoader } from '@/components/top-loader';
import { Toaster } from '@/components/ui/toaster';
import React from 'react';

export function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <AuthProvider>
                <AuthRedirector />
                <React.Suspense fallback={<TopLoader />}>
                    {children}
                </React.Suspense>
                <Toaster />
            </AuthProvider>
        </ThemeProvider>
    )
}
