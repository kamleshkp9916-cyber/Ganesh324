
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth.tsx";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const sellerFormSchema = z.object({
  aadhar: z.string().regex(/^\d{12}$/, "Aadhar must be 12 digits."),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN card format."),
  accountNumber: z.string().min(9, "Account number is too short").max(18, "Account number is too long"),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format.")
});

export default function SellerRegisterPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined' && localStorage.getItem('sellerDetails')) {
            toast({
                title: "Already Registered",
                description: "You are already registered as a seller. Redirecting to dashboard.",
            });
            router.push('/seller/dashboard');
        }
    }, [router, toast]);

    const form = useForm<z.infer<typeof sellerFormSchema>>({
        resolver: zodResolver(sellerFormSchema),
        defaultValues: {
            aadhar: "",
            pan: "",
            accountNumber: "",
            ifsc: ""
        },
    });

    function onSubmit(values: z.infer<typeof sellerFormSchema>) {
        setIsLoading(true);
        console.log("Seller registration details:", values);
        
        // Simulate API call
        setTimeout(() => {
            if (typeof window !== 'undefined') {
                localStorage.setItem('sellerDetails', JSON.stringify(values));
            }
            toast({
                title: "Registration Successful!",
                description: "You can now access the seller dashboard.",
            });
            router.push('/seller/dashboard');
            setIsLoading(false);
        }, 1500);
    }

    if (!isMounted || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }
    
    if (!user) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                 <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
                 <p className="text-muted-foreground mb-6">Please log in to register as a seller.</p>
                 <Button onClick={() => router.push('/')}>Go to Login</Button>
            </div>
        );
    }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
         <div className="absolute top-4 left-4">
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Become a Seller</CardTitle>
          <CardDescription>
            Please provide your identification and bank details to start selling.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                 <h3 className="text-lg font-medium pt-4 border-t">Bank Account Details</h3>
                <FormField
                    control={form.control}
                    name="accountNumber"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter your bank account number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="ifsc"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>IFSC Code</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter your bank's IFSC code" {...field} className="uppercase" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground mt-4 max-w-lg">
        By creating a seller account, you agree to our <Link href="/terms-and-conditions" className="underline hover:text-primary">Terms & Conditions</Link> and <Link href="/privacy-and-security" className="underline hover:text-primary">Privacy Policy</Link>. Your information is encrypted and securely stored.
      </p>
    </div>
  );
}
