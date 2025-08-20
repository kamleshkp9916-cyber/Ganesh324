
"use client"

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function SellerVerificationPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
             <div className="absolute top-4 left-4">
                <Button variant="ghost" onClick={() => router.push('/live-selling')} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Button>
            </div>
             <Alert className="max-w-lg">
                <AlertTitle className="text-xl font-bold">Verification in Progress</AlertTitle>
                <AlertDescription>
                    Thank you for submitting your details. Your information is currently under review. This process may take up to 24 hours. We will notify you upon completion.
                </AlertDescription>
            </Alert>
            <Button onClick={() => router.push('/live-selling')} className="mt-6">Explore Live Shopping</Button>
        </div>
    )
}
