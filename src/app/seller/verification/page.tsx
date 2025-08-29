
"use client"

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, XCircle, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/hooks/use-auth.tsx";

type VerificationStatus = 'loading' | 'pending' | 'rejected' | 'needs-resubmission' | 'verified' | 'no-details';

export default function SellerVerificationPage() {
    const { userData, loading } = useAuth();
    const router = useRouter();
    const [status, setStatus] = useState<VerificationStatus>('loading');
    const [rejectionReason, setRejectionReason] = useState<string | null>(null);
    const [resubmissionReason, setResubmissionReason] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && userData) {
            const currentStatus = userData.verificationStatus;
            
            if (currentStatus === 'verified') {
                router.replace('/seller/dashboard');
                setStatus('verified');
                return;
            }
            
            setStatus(currentStatus || 'no-details');
            if (currentStatus === 'rejected') {
                setRejectionReason((userData as any).rejectionReason || "No specific reason provided.");
            }
             if (currentStatus === 'needs-resubmission') {
                setResubmissionReason((userData as any).resubmissionReason || "Please review your details carefully.");
            }
        } else if (!loading && !userData) {
            // This might happen if user document isn't created yet or there's an issue.
            // Redirecting to registration seems safest.
            router.replace('/seller/register');
        }
    }, [userData, loading, router]);

    if (loading || status === 'loading' || status === 'verified') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }
    
    if (status === 'no-details') {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
                <p>Could not load seller details. Redirecting...</p>
                {/* Redirecting effect */}
                {useEffect(() => {
                    const timer = setTimeout(() => router.replace('/seller/register'), 2000);
                    return () => clearTimeout(timer);
                }, [router])}
            </div>
        )
    }

    const renderContent = () => {
        switch (status) {
            case 'pending':
                return (
                    <Alert className="max-w-lg">
                        <Clock className="h-4 w-4" />
                        <AlertTitle className="text-xl font-bold">Verification in Progress</AlertTitle>
                        <AlertDescription>
                            Thank you for submitting your details. Your information is currently under review. This process may take up to 24 hours. We will notify you upon completion.
                        </AlertDescription>
                    </Alert>
                );
            case 'rejected':
                return (
                    <Alert variant="destructive" className="max-w-lg">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle className="text-xl font-bold">Application Rejected</AlertTitle>
                        <AlertDescription>
                            We're sorry, but your application to become a seller has been rejected. 
                            <br />
                            <strong>Reason:</strong> {rejectionReason}
                            <br />
                            Please contact support if you have any questions.
                        </AlertDescription>
                    </Alert>
                );
            case 'needs-resubmission':
                return (
                    <Alert variant="destructive" className="max-w-lg">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle className="text-xl font-bold">Action Required</AlertTitle>
                        <AlertDescription>
                           There was an issue with your submission. Please go back to the registration page to correct your details.
                           <br />
                           <strong>Reason:</strong> {resubmissionReason}
                        </AlertDescription>
                    </Alert>
                );
            default:
                return null;
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
             <div className="absolute top-4 left-4">
                <Button 
                    variant="ghost" 
                    onClick={() => {
                         if (status === 'needs-resubmission') {
                            router.push('/seller/register');
                         } else {
                            router.push('/');
                         }
                    }} 
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {status === 'needs-resubmission' ? 'Back to Form' : 'Back to Home'}
                </Button>
            </div>
            {renderContent()}
        </div>
    )
}
