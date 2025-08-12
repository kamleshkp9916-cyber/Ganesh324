
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation";
import { useState } from "react";

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

const formSchema = z.object({
  otp: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
})

// This is a mock server-side verification function.
// In a real app, you'd call your backend API here.
async function verifyOtpOnServer(otp: string): Promise<{ success: boolean }> {
    console.log(`Verifying OTP: ${otp} on the server...`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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


export function OtpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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
        toast({
            title: "Success!",
            description: "Your OTP has been verified.",
        });
        router.push("/live-selling");
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

  return (
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
            {isLoading ? "Verifying..." : "Proceed"}
        </Button>
      </form>
    </Form>
  )
}
