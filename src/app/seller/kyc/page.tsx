
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, ShieldCheck, CheckCircle2, AlertTriangle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth.tsx";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { verifyKyc } from "@/ai/flows/kyc-flow";
import { KycInputSchema } from "@/lib/schemas/kyc";

export default function SellerKycPage() {
    const { user, userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof KycInputSchema>>({
        resolver: zodResolver(KycInputSchema),
        defaultValues: {
            userId: "",
            aadhar: "",
            pan: "",
        },
    });

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                // If not logged in, redirect to signup. They will be brought back here.
                router.replace(`/signup?redirect=${encodeURIComponent('/seller/kyc')}`);
            } else if (userData?.role === 'seller') {
                router.replace('/seller/dashboard');
            } else {
                 form.setValue('userId', user.uid);
            }
        }
    }, [user, userData, authLoading, router, form]);


    if (authLoading || !user || userData?.role === 'seller') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    async function onSubmit(values: z.infer<typeof KycInputSchema>) {
        setIsLoading(true);
        try {
            await verifyKyc(values);

            toast({
                title: "Verification Submitted!",
                description: "Your KYC details are being verified. You will be redirected shortly.",
            });
            // The AuthRedirector should pick up the role change and redirect automatically.
            // We'll give it a moment, then force a push if needed.
            setTimeout(() => {
                router.push('/seller/dashboard');
            }, 2000);

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Verification Failed",
                description: error.message || "Could not verify your details. Please check them and try again.",
            });
        } finally {
            setIsLoading(false);
        }
    }
    
  return (
    <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center p-4">
         <div className="absolute top-4 left-4">
          <Button asChild variant="ghost" className="flex items-center gap-2">
            <Link href="/live-selling">
                <ArrowLeft className="h-4 w-4" />
                Back to App
            </Link>
          </Button>
        </div>
      <Card className="w-full max-w-md my-8">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
          <CardTitle className="text-2xl">Seller Verification (KYC)</CardTitle>
          <CardDescription>
            To ensure a secure marketplace, we need to verify your identity.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Alert className="mb-6">
                <FileText className="h-4 w-4" />
                <AlertTitle>Why do we need this?</AlertTitle>
                <AlertDescription>
                    KYC verification is required by law and helps us prevent fraud, ensuring a trustworthy platform for all users. Your data is encrypted and handled securely.
                </AlertDescription>
            </Alert>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <FormField
                    control={form.control}
                    name="aadhar"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Aadhar Card Number</FormLabel>
                        <FormControl>
                            <Input placeholder="XXXX XXXX XXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="pan"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>PAN Card Number</FormLabel>
                        <FormControl>
                            <Input placeholder="ABCDE1234F" {...field} className="uppercase" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit for Verification'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground mt-4 max-w-lg">
        By submitting, you agree to our <Link href="/terms-and-conditions" className="underline hover:text-primary">Seller Terms & Conditions</Link>.
      </p>
    </div>
  );
}
