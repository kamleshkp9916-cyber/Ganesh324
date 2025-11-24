
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import { Loader2, Shield } from "lucide-react";

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
import { useAuthActions } from "@/hooks/use-auth";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";

const formSchema = z.object({
  firstName: z.string().min(1, { message: "Please enter your first name." }),
  lastName: z.string().min(1, { message: "Please enter your last name." }),
  userId: z.string()
    .min(2, { message: "User ID must be at least 2 characters." })
    .refine((val) => val.startsWith('@'), {
      message: "User ID must start with @.",
    })
    .refine((val) => /^[a-z0-9_.]+$/.test(val.substring(1)), {
      message: "User ID can only contain lowercase letters, numbers, periods and underscores.",
    }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().regex(/^\+91 \d{10}$/, { message: "Please enter a valid 10-digit Indian phone number." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

const navItems = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/revenue", label: "Revenue" },
    { href: "/admin/transactions", label: "Transactions" },
    { href: "/admin/payouts", label: "Payouts" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/kyc", label: "KYC" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/messages", label: "Messages" },
    { href: "/admin/inquiries", label: "Inquiries" },
    { href: "/admin/feed", label: "Feed" },
    { href: "/admin/live-control", label: "Live Control" },
    { href: "/admin/settings", label: "Settings" },
];

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

function BotIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
    )
}

export function SignupForm({ isAdminSignup = false }: { isAdminSignup?: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const { handleCustomerSignUp, handleAdminSignUp, handleGoogleSignIn } = useAuthActions();
  const [blockedPaths, setBlockedPaths] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { firstName: "", lastName: "", userId: "@", email: "", phone: "+91 ", password: "" },
  });

  async function onGoogleSignIn() {
    setIsLoading(true);
    await handleGoogleSignIn();
    setIsLoading(false);
  };
  
  const handlePermissionChange = (path: string, checked: boolean) => {
    setBlockedPaths(prev => 
        checked ? [...prev, path] : prev.filter(p => p !== path)
    );
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (isAdminSignup) {
        await handleAdminSignUp({ ...values, blockedPaths });
      } else {
        await handleCustomerSignUp(values);
      }
      form.reset();
      setBlockedPaths([]);
    } catch (error) {
      // Error is already toasted in the auth action
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                    <Input placeholder="John" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                    <Input placeholder="Doe" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
            <FormItem>
                <FormLabel>User ID</FormLabel>
                <FormControl>
                    <Input 
                        placeholder="@johndoe" 
                        {...field} 
                        disabled={isLoading}
                        onChange={(e) => {
                            let value = e.target.value.toLowerCase();
                            if (!value.startsWith('@')) {
                                value = '@' + value.replace(/@/g, '');
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Id</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                        <Input 
                            placeholder="+91 98765 43210" 
                            {...field}
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
              <FormLabel>Create Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Make a strong password" {...field} disabled={isLoading}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isAdminSignup && (
          <div className="space-y-4 pt-4">
              <Separator />
               <div>
                  <h3 className="text-lg font-medium">Role Permissions</h3>
                  <p className="text-sm text-muted-foreground">
                      Select the navigation items to <strong className="text-destructive">block</strong> for this user. Unchecked items will be accessible.
                  </p>
              </div>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   {navItems.map((item) => (
                      <div key={item.href} className="flex items-center space-x-2">
                        <Checkbox
                          id={item.href}
                          checked={blockedPaths.includes(item.href)}
                          onCheckedChange={(checked) => handlePermissionChange(item.href, !!checked)}
                        />
                        <label
                          htmlFor={item.href}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {item.label}
                        </label>
                      </div>
                    ))}
               </div>
          </div>
        )}
        
        <Button type="submit" className="w-full font-semibold mt-4" disabled={isLoading}>
           {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
        </Button>
        {!isAdminSignup && (
          <>
            <Button variant="outline" className="w-full font-semibold" type="button" onClick={onGoogleSignIn} disabled={isLoading}>
                <GoogleIcon className="mr-2" />
                Get Started With Google
            </Button>
            <div className="text-center text-xs text-muted-foreground">
                By creating an account, you agree to our{" "}
                <Link href="/terms-and-conditions" className="underline hover:text-primary">
                    Terms & Conditions
                </Link>
                .
            </div>
             <div className="mt-4 text-center text-sm flex items-center justify-center gap-2">
                Any Query ?{" "}
                <Link href="/help" className="underline font-semibold text-primary flex items-center gap-1">
                  Get Help <BotIcon className="w-4 h-4" />
                </Link>
            </div>
          </>
        )}
      </form>
    </Form>
  );
}
