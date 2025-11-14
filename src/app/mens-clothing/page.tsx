
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is deprecated and has been merged into /app/men/page.tsx
// It now just redirects to the new page to handle old bookmarks.
export default function DeprecatedMensClothingPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/men');
    }, [router]);
    
    return null;
}
