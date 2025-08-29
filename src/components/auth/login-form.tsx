
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthActions } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { OtpForm } from "./otp-form";

const customerSchema = z.object({
  identifier: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  rememberMe: z.boolean().default(false).optional(),
});

const sellerPasswordSchema = z.object({
    identifier: z.string().regex(/^\+91 \d{10}$/, { message: "Please enter a valid 10-digit Indian phone number." }),
    password: z.string().min(1, { message: "Password is required." }),
    rememberMe: z.boolean().default(false).optional(),
});


function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="24px"
        height="24px"
        {...props}
      >
        <path
          fill="#FFC107"
          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        />
        <path
          fill="#FF3D00"
          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        />
        <path
          fill="#4CAF50"
          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.655-3.373-11.303-8H6.306C9.656,39.663,16.318,44,24,44z"
        />
        <path
          fill="#1976D2"
          d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.089,5.571l6.19,5.238C42.012,35.816,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"
        />
      </svg>
    );
  }

interface LoginFormProps {
    role?: 'customer' | 'seller';
}

export function LoginForm({ role = 'customer' }: LoginFormProps) {
  const router = useRouter();
  const { signInWithGoogle, signInWithEmail, signInWithOtp, validateSellerPassword } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const [step, setStep] = useState<'identifier' | 'otp'>('identifier');
  const [phone, setPhone] = useState("");

  const formSchema = role === 'seller' ? sellerPasswordSchema : customerSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { identifier: role === 'seller' ? "+91 " : "", password: "" },
  });
  
  // Watch for changes in the identifier field
  const identifier = form.watch("identifier");

  // This effect ensures the phone state is updated whenever the form value changes
  useEffect(() => {
    if (role === 'seller') {
      setPhone(identifier);
    }
  }, [identifier, role]);


  async function onCustomerSubmit(values: z.infer<typeof customerSchema>) {
    setIsLoading(true);
    try {
        await signInWithEmail(values.identifier, values.password, role as 'customer');
    } catch (error: any) {
        toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive"
        });
    } finally {
        setIsLoading(false);
    }
  }

  async function onSellerSubmit(values: z.infer<typeof sellerPasswordSchema>) {
      setIsLoading(true);
      try {
        const isValid = await validateSellerPassword(values.identifier, values.password);
        if(isValid) {
            setPhone(values.identifier);
            setStep('otp');
            toast({
                title: "OTP Sent!",
                description: `A one-time password has been sent to ${values.identifier}.`
            });
        }
      } catch (error: any) {
         toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
  }
  
  const handleOtpSuccess = async () => {
    setIsLoading(true);
    try {
      await signInWithOtp(phone);
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  if (role === 'seller' && step === 'otp') {
      return (
        <div className="space-y-4">
             <p className="text-center text-sm text-muted-foreground">
                Enter the OTP sent to {phone}
            </p>
            <OtpForm onVerifySuccess={handleOtpSuccess} />
             <Button variant="link" className="w-full" onClick={() => setStep('identifier')}>
                Change phone number
            </Button>
        </div>
      );
  }

  const CustomerForm = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onCustomerSubmit as any)} className="grid gap-4">
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} disabled={isLoading} className="bg-background"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
               <FormControl>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    // @ts-ignore
                    {...field} 
                    disabled={isLoading} 
                    className="bg-background pr-10"
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
        <div className="flex items-center justify-between gap-4">
            <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                    <Checkbox
                        // @ts-ignore
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="remember-me"
                        disabled={isLoading}
                    />
                    </FormControl>
                    <FormLabel htmlFor="remember-me" className="font-normal cursor-pointer">
                        Remember me
                    </FormLabel>
                </FormItem>
                )}
            />
             <Link href="/forgot-password" className="inline-block text-sm underline text-primary">
                Forgot your password?
            </Link>
        </div>
        <Button 
          type="submit" 
          className="w-full font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <>
              Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
         <Button variant="outline" className="w-full font-semibold" type="button" onClick={() => signInWithGoogle(role)} disabled={isLoading}>
          <GoogleIcon className="mr-2" />
          Sign In With Google
        </Button>
      </form>
    </Form>
  );

  const SellerForm = (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSellerSubmit as any)} className="grid gap-4">
          <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                  <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                          <Input
                              placeholder="+91 98765 43210"
                              {...field}
                              disabled={isLoading}
                              className="bg-background"
                              onChange={(e) => {
                                    let value = e.target.value;
                                    if (!value.startsWith('+91 ')) {
                                        value = '+91 ' + value.replace(/\+91 /g, '').replace(/\D/g, '');
                                    }
                                    if (value.length > 14) {
                                        value = value.substring(0, 14);
                                    }
                                    field.onChange(value);
                                }}
                          />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
              )}
          />
           <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                    <div className="relative">
                    <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        // @ts-ignore
                        {...field} 
                        disabled={isLoading} 
                        className="bg-background pr-10"
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
           <Button 
            type="submit" 
            className="w-full font-semibold"
            disabled={isLoading}
            >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                "Continue"
            )}
            </Button>
        </form>
    </Form>
  );

  return role === 'customer' ? CustomerForm : SellerForm;
}
