

"use client"

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, XCircle, AlertTriangle, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/hooks/use-auth.tsx";
import { useAuthActions } from "@/lib/auth";

type VerificationStatus = 'loading' | 'pending' | 'rejected' | 'needs-resubmission' | 'verified' | 'no-details';

export default function SellerVerificationPage() {
    const { user, userData, loading } = useAuth();
    const { signOut } = useAuthActions();
    const router = useRouter();

    useEffect(() => {
        // The AuthRedirector now handles all redirection logic.
        // This page is effectively deprecated for users who are auto-verified.
        // If a user ever lands here, it's likely an edge case or a direct navigation.
        // We can redirect them to the dashboard as they are already verified.
        if (!loading && user && userData?.verificationStatus === 'verified') {
            router.replace('/seller/dashboard');
        }
    }, [user, userData, loading, router]);
    
    // Fallback content for the rare case a user lands here.
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
            <LoadingSpinner />
            <p className="mt-4 text-muted-foreground">Loading your seller dashboard...</p>
        </div>
    )
}
