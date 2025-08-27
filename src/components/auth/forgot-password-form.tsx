
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { OtpForm } from "./otp-form"
import { useToast } from "@/hooks/use-toast"
import { useAuthActions } from "@/lib/auth"


const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

const passwordSchema = z.object({
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});


type Step = "email" | "otp" | "password";

export function ForgotPasswordForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function handleEmailSubmit(values: z.infer<typeof emailSchema>) {
    setIsLoading(true);
    // In a real app, you would send an OTP here.
    // For now, we'll just simulate it.
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setEmail(values.email);
    setStep("otp");
    router.push(`/forgot-password?email=${encodeURIComponent(values.email)}`);
    toast({ title: "OTP Sent!", description: "A one-time password has been sent to your email." });
    setIsLoading(false);
  }

  const handleOtpSuccess = () => {
    setStep("password");
  };

  async function handlePasswordSubmit(values: z.infer<typeof passwordSchema>) {
      setIsLoading(true);
      // In a real app, you would call your backend to securely reset the password.
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsLoading(false);
      toast({
          title: "Password Reset Successfully!",
          description: "You can now log in with your new password.",
      });
      router.push('/');
  }

  if (step === "otp") {
    return <OtpForm onVerifySuccess={handleOtpSuccess} />;
  }

  if (step === "password") {
    return (
        <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="grid gap-4">
                 <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                            <div className="relative">
                               <Input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="••••••••" 
                                    {...field} 
                                    disabled={isLoading}
                                />
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute inset-y-0 right-0 h-full w-10 text-muted-foreground"
                                    onClick={() => setShowPassword(prev => !prev)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                                </Button>
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                            <div className="relative">
                               <Input 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    placeholder="••••••••" 
                                    {...field} 
                                    disabled={isLoading}
                                />
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute inset-y-0 right-0 h-full w-10 text-muted-foreground"
                                    onClick={() => setShowConfirmPassword(prev => !prev)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                                </Button>
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Reset Password
                </Button>
            </form>
        </Form>
    );
  }

  return (
    <Form {...emailForm}>
      <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="grid gap-4">
        <FormField
          control={emailForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send OTP
        </Button>
      </form>
    </Form>
  )
}
