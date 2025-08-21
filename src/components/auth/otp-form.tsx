
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp"
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  otp: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
})

const MAX_ATTEMPTS = 3;
const BLOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const ADMIN_EMAIL = "samael.prajapati@example.com";

// This is a mock server-side verification function.
// In a real app, you'd call your backend API here.
async function verifyOtpOnServer(otp: string): Promise<{ success: boolean }> {
    console.log(`Verifying OTP: ${otp} on the server...`);
    // We are removing the timeout to make it faster
    // await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real application, you would have your logic to verify the OTP.
    // For this demo, we'll accept '123456' as the correct OTP.
    if (otp === "123456") {
        console.log("OTP verification successful.");
        return { success: true };
    } else {
        console.log("OTP verification failed.");
        return { success: false };
    }
}


export function OtpForm({ identifier }: { identifier?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  const getStorageKey = (key: string) => identifier ? `${key}_${identifier}` : null;

  useEffect(() => {
    const attemptsKey = getStorageKey('otp_attempts');
    const blockUntilKey = getStorageKey('otp_block_until');

    if (!attemptsKey || !blockUntilKey) return;
    
    const now = Date.now();
    const blockUntil = parseInt(localStorage.getItem(blockUntilKey) || '0', 10);

    if (blockUntil > now) {
        setIsBlocked(true);
        return;
    } else {
        localStorage.removeItem(blockUntilKey);
        localStorage.removeItem(attemptsKey);
    }
    
    const attempts = parseInt(localStorage.getItem(attemptsKey) || '0', 10);
    setResendAttempts(attempts);
    
    if (attempts >= MAX_ATTEMPTS) {
        setIsBlocked(true);
    }
  }, [identifier]);
  

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && !isBlocked) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, isBlocked]);

  const handleResendOtp = async () => {
    const attemptsKey = getStorageKey('otp_attempts');
    const blockUntilKey = getStorageKey('otp_block_until');
    if (!attemptsKey || !blockUntilKey || isBlocked) return;

    const currentAttempts = resendAttempts + 1;
    setResendAttempts(currentAttempts);
    localStorage.setItem(attemptsKey, currentAttempts.toString());
    
    if (currentAttempts >= MAX_ATTEMPTS) {
        const blockUntil = Date.now() + BLOCK_DURATION_MS;
        localStorage.setItem(blockUntilKey, blockUntil.toString());
        setIsBlocked(true);
        toast({
            title: "Too Many Attempts",
            description: "You have exceeded the maximum number of OTP requests. Please try again after 24 hours.",
            variant: "destructive",
        });
        return;
    }
    
    setIsResendDisabled(true);
    setCountdown(60);
    console.log("Simulating OTP resend...");
    await new Promise(resolve => setTimeout(resolve, 500));
    toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your device.",
    });
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const { success } = await verifyOtpOnServer(values.otp);

      if (success) {
        const attemptsKey = getStorageKey('otp_attempts');
        if (attemptsKey) localStorage.removeItem(attemptsKey);
        
        toast({
            title: "Success!",
            description: "Your OTP has been verified.",
        });

        if (identifier === ADMIN_EMAIL) {
            window.location.href = "/admin/dashboard";
            return;
        }

        const sellerDetails = localStorage.getItem('sellerDetails');
        const isSellerLogin = sessionStorage.getItem('isSellerLogin') === 'true';

        if (sellerDetails && isSellerLogin) {
            window.location.href = "/seller/dashboard";
        } else {
             window.location.href = "/live-selling";
        }

      } else {
         toast({
            title: "Error",
            description: "Invalid OTP. Please try again.",
            variant: "destructive",
        });
      }
    } catch (error) {
       toast({
            title: "Error",
            description: "Something went wrong during verification.",
            variant: "destructive",
        });
        console.error("OTP verification error:", error);
    } finally {
        setIsLoading(false);
    }
  }

  if (isBlocked) {
    return (
        <Alert variant="destructive">
            <AlertTitle>Account Locked</AlertTitle>
            <AlertDescription>
                You have made too many OTP requests. For your security, this feature has been locked. Please try again after 24 hours.
            </AlertDescription>
        </Alert>
    );
  }

  return (
    <div className="grid gap-6">
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
            <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                <FormControl>
                    <InputOTP maxLength={6} {...field} disabled={isLoading} >
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

            <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
                {isLoading ? "Proceeding..." : "Proceed"}
            </Button>
        </form>
        </Form>
         <div className="text-center text-sm">
            <Button
                variant="link"
                onClick={handleResendOtp}
                disabled={isResendDisabled || resendAttempts >= MAX_ATTEMPTS}
                className="p-0 h-auto"
            >
                Resend OTP
            </Button>
            {isResendDisabled && countdown > 0 ? (
                <span className="text-muted-foreground ml-2">(in {countdown}s)</span>
            ) : resendAttempts < MAX_ATTEMPTS ? (
                 <span className="text-muted-foreground ml-2">({MAX_ATTEMPTS - resendAttempts} left)</span>
            ) : null}
        </div>
    </div>
  )
}
