
"use client";

import { useAuth, useAuthActions } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendEmailVerification, User } from "firebase/auth";

export default function VerifyEmailPage() {
    const { user, userData, loading } = useAuth();
    const { signOut } = useAuthActions();
    const router = useRouter();
    const { toast } = useToast();
    const [isResending, setIsResending] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // If no user is logged in, redirect to login
                router.replace('/');
            } else if (user.emailVerified) {
                // If user is already verified, redirect them based on role
                if (userData?.role === 'seller') {
                    router.replace('/seller/verification');
                } else {
                    router.replace('/live-selling');
                }
            }
        }
    }, [user, userData, loading, router]);

    const handleResendVerification = async () => {
        if (!user) return;
        setIsResending(true);
        try {
            await sendEmailVerification(user);
            toast({
                title: "Email Sent!",
                description: "A new verification email has been sent to your address."
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to send verification email. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setIsResending(false);
        }
    };
    
    const handleContinue = async () => {
        if (!user) return;
        setIsChecking(true);
        const currentUser = user as User; // We know user is not null here
        await currentUser.reload();
        
        // After reload, check the emailVerified status again
        if (currentUser.emailVerified) {
            toast({
                title: "Verification Successful!",
                description: "Redirecting you now...",
            });

            // The useAuth hook will update userData, which might take a moment.
            // We give it a moment to catch up before redirecting.
            // A more robust solution might involve waiting for userData to update.
            setTimeout(() => {
                 if (userData?.role === 'seller') {
                    router.push('/seller/verification');
                } else {
                    router.push('/live-selling');
                }
            }, 500);

        } else {
             toast({
                title: "Email Not Verified",
                description: "Please check your inbox and click the verification link.",
                variant: "destructive",
            });
            setIsChecking(false);
        }
    };
    
    if (loading || !user || user.emailVerified) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                        <MailCheck className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="mt-4">Verify Your Email</CardTitle>
                    <CardDescription>
                        We've sent a verification link to <strong>{user.email}</strong>. Please check your inbox and click the link to activate your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground mb-6">
                        Once verified, click the continue button below.
                    </p>
                    <div className="flex flex-col gap-4">
                        <Button onClick={handleContinue} disabled={isChecking}>
                            {isChecking ? <Loader2 className="h-4 w-4 mr-2"/> : null}
                            Continue to App
                        </Button>
                        <Button variant="outline" onClick={handleResendVerification} disabled={isResending}>
                            {isResending ? <Loader2 className="h-4 w-4 mr-2"/> : null}
                            Resend Verification Email
                        </Button>
                        <Button variant="ghost" onClick={signOut}>
                            Log Out
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
