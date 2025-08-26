
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from "@/hooks/use-auth.tsx";

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

const RESEND_COOLDOWN = 60; // seconds
const MAX_ATTEMPTS = 5;

export function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const isSellerLogin = searchParams.get('seller') === 'true';
  const { toast } = useToast();
  const { user } = useAuth();

  const [otpValue, setOtpValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResend = () => {
    console.log("Resending OTP to", email);
    toast({
      title: "OTP Resent",
      description: `A new OTP has been sent to ${email}`,
    });
    setResendCooldown(RESEND_COOLDOWN);
  };
  
  const handleVerify = () => {
    if (otpValue === '123456') { // Mock OTP check
      setIsVerified(true);
      toast({ title: "OTP Verified!", description: "You are now logged in. Redirecting..." });
      
      // Refresh the page after a short delay
      // This allows the auth state to propagate and Next.js router to pick up the logged-in user
      setTimeout(() => {
        router.refresh();
      }, 1500);

    } else {
      setAttempts(attempts + 1);
      if (attempts >= MAX_ATTEMPTS - 1) {
        toast({ variant: "destructive", title: "Too Many Attempts", description: "Please try again later." });
      } else {
        toast({ variant: "destructive", title: "Invalid OTP", description: `Please try again. ${MAX_ATTEMPTS - attempts - 1} attempts remaining.` });
      }
    }
  };
  
   useEffect(() => {
    // This effect runs after a successful verification and subsequent refresh.
    // The `user` object will be available, and we can redirect.
    if (user && isVerified) {
       if (email === "samael.prajapati@example.com") {
             router.push('/admin/dashboard');
        } else if (isSellerLogin) {
            router.push('/seller/dashboard');
        } else {
            router.push('/live-selling');
        }
    }
  }, [user, isVerified, router, email, isSellerLogin]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleVerify)} className="space-y-6">
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>One-Time Password</FormLabel>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  {...field}
                  onComplete={handleVerify}
                  onChange={(value) => {
                    field.onChange(value);
                    setOtpValue(value);
                  }}
                  disabled={isLoading || isVerified}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
            type="button" 
            onClick={handleVerify} 
            className="w-full" 
            disabled={otpValue.length !== 6 || isLoading || isVerified || attempts >= MAX_ATTEMPTS}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : isVerified ? (
            <CheckCircle className="mr-2 h-4 w-4" />
          ) : null}
          {isVerified ? "Verified!" : "Verify Account"}
        </Button>
      </form>
       <div className="mt-4 text-center text-sm">
          Didn&apos;t receive a code?{" "}
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={handleResend}
            disabled={resendCooldown > 0}
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
          </Button>
        </div>
    </Form>
  )
}
