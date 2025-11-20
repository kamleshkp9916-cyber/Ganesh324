

"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

function MessageRedirect() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Construct the new URL for the feed's message tab
        const newUrl = `/feed?tab=messages&${searchParams.toString()}`;
        router.replace(newUrl);
    }, [router, searchParams]);

    // Display a loading state while redirecting
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center gap-4">
            <LoadingSpinner />
            <p className="text-muted-foreground">Redirecting to your messages...</p>
        </div>
    );
}

export default function MessagePage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><LoadingSpinner /></div>}>
            <MessageRedirect />
        </Suspense>
    );
}
