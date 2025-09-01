

"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// This page is deprecated and replaced by /seller/kyc
// It now just redirects to the new KYC page to handle old bookmarks.
export default function DeprecatedSellerRegisterPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/seller/kyc');
    }, [router]);
    
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <LoadingSpinner />
            <p className="mt-4 text-muted-foreground">Redirecting to the new seller verification page...</p>
        </div>
    );
}
