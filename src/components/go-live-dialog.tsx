
"use client"

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// This component is now deprecated and acts as a redirect for any remaining usages.
// The new page is at /seller/live/studio
export function GoLiveDialog() {
    const router = useRouter();
    useEffect(() => {
        router.push('/seller/live/studio');
    }, [router]);
    
    return null;
}
