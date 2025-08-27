
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Upload, RefreshCw, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth.tsx";
import { useAuthActions } from "@/lib/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Image from 'next/image';
import SignatureCanvas from 'react-signature-canvas';
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";


const sellerFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().regex(/^\+91 \d{10}$/, { message: "Please enter a valid 10-digit Indian phone number." }),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  businessName: z.string().min(2, "Business name must be at least 2 characters."),
  passportPhoto: z.any().refine(file => file?.size <= 5000000, `Max image size is 5MB.`).refine(
    (file) => ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file?.type),
    "Only .jpg, .jpeg, .png and .webp formats are supported."
  ),
  signature: z.string().min(1, "Signature is required."),
  aadhar: z.string().regex(/^\d{12}$/, "Aadhar must be 12 digits."),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN card format."),
  accountNumber: z.string().min(9, "Account number is too short").max(18, "Account number is too long"),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format."),
  aadharOtp: z.string().min(6, "Please enter the 6-digit OTP.").optional(),
}).refine((data) => {
    if (data.password || data.confirmPassword) {
        return data.password === data.confirmPassword;
    }
    return true;
}, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type SellerDetails = z.infer<typeof sellerFormSchema> & { verificationStatus: string; rejectionReason?: string; resubmissionReason?: string };

export default function SellerRegisterPage() {
    const { user, loading: authLoading } = useAuth();
    const { signUpWithEmail } = useAuthActions();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [isMounted, setIsMounted] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const sigPadRef = useRef<SignatureCanvas>(null);
    const [isAadharEntered, setIsAadharEntered] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [sellerDetails, setSellerDetails] = useState<SellerDetails | null>(null);
    const [pageStatus, setPageStatus] = useState<'loading' | 'form' | 'rejected' | 'redirecting'>('loading');

    const form = useForm<z.infer<typeof sellerFormSchema>>({
        resolver: zodResolver(sellerFormSchema),
        defaultValues: {
            businessName: "",
            aadhar: "",
            pan: "",
            accountNumber: "",
            ifsc: "",
            firstName: "",
            lastName: "",
            email: "",
            phone: "+91 ",
            password: "",
            confirmPassword: "",
        },
    });

    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined') {
            const sellerDetailsRaw = localStorage.getItem('sellerDetails');
            if (sellerDetailsRaw) {
                const details = JSON.parse(sellerDetailsRaw);
                setSellerDetails(details);
                
                if (details.verificationStatus === 'verified') {
                    setPageStatus('redirecting');
                    router.replace('/seller/dashboard');
                } else if (details.verificationStatus === 'pending') {
                    setPageStatus('redirecting');
                    router.replace('/seller/verification');
                } else if (details.verificationStatus === 'rejected') {
                    setPageStatus('rejected');
                } else if (details.verificationStatus === 'needs-resubmission') {
                    form.reset(details);
                    if(details.aadhar?.length === 12) setIsAadharEntered(true);
                    setPageStatus('form');
                } else {
                     setPageStatus('form');
                }
            } else {
                 setPageStatus('form');
            }
        }
    }, [router, form]);

    useEffect(() => {
        if(user) {
            form.setValue('email', user.email || '');
            const nameParts = user.displayName?.split(' ') || ['', ''];
            form.setValue('firstName', nameParts[0]);
            form.setValue('lastName', nameParts.slice(1).join(' '));
        }
    }, [user, form]);
    
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue('passportPhoto', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };
    
    const clearSignature = () => {
        sigPadRef.current?.clear();
        form.setValue('signature', '');
    };

    const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
         if (value.length <= 12) {
            form.setValue('aadhar', value);
            setIsAadharEntered(value.length === 12);
        }
    }
    
    const handleOtpVerify = async () => {
        setIsVerifyingOtp(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsOtpVerified(true);
        setIsVerifyingOtp(false);
        toast({ title: "Aadhar Verified Successfully!" });
    }

    async function onSubmit(values: z.infer<typeof sellerFormSchema>) {
        setIsLoading(true);
        
        try {
            // If the user is not logged in, create an account first
            if (!user) {
                if (!values.password) {
                     toast({ variant: "destructive", title: "Password is required for new accounts."});
                     setIsLoading(false);
                     return;
                }
                await signUpWithEmail(values.email, values.password, {
                    firstName: values.firstName,
                    lastName: values.lastName,
                }, true); // Pass true to skip redirection from auth hook
            }

             const sellerData = {
                ...values,
                passportPhoto: values.passportPhoto.name, // Storing only name for mock
                name: `${values.firstName} ${values.lastName}`,
                verificationStatus: 'pending'
            };
            delete (sellerData as any).password;
            delete (sellerData as any).confirmPassword;
            localStorage.setItem('sellerDetails', JSON.stringify(sellerData));
            
            router.push('/seller/verification');
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (!isMounted || pageStatus === 'loading' || pageStatus === 'redirecting') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (pageStatus === 'rejected') {
        return (
             <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
                 <div className="absolute top-4 left-4">
                    <Button variant="ghost" onClick={() => router.push('/live-selling')} className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Live Shopping
                    </Button>
                </div>
                 <Alert variant="destructive" className="max-w-lg">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle className="text-xl font-bold">Application Rejected</AlertTitle>
                    <AlertDescription>
                       We're sorry, but your application to become a seller has been rejected. 
                       {sellerDetails?.rejectionReason && `Reason: ${sellerDetails.rejectionReason}`}
                       <br/>
                       Please contact support for more information.
                    </AlertDescription>
                </Alert>
             </div>
        )
    }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
         <div className="absolute top-4 left-4">
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      <Card className="w-full max-w-2xl my-8">
        <CardHeader>
          <CardTitle className="text-2xl">Become a Seller</CardTitle>
          <CardDescription>
            Please provide your business, identification and bank details to start selling.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {sellerDetails?.verificationStatus === 'needs-resubmission' && (
                 <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Action Required</AlertTitle>
                    <AlertDescription>
                      There was an issue with your previous submission. Please review your details and re-submit.
                      {sellerDetails?.resubmissionReason && <p className="mt-2"><strong>Reason:</strong> {sellerDetails.resubmissionReason}</p>}
                    </AlertDescription>
                </Alert>
            )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <h3 className="text-lg font-medium pt-4 border-t">Personal Details</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John" {...field} />
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
                                    <Input placeholder="Doe" {...field} />
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
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <Input placeholder="name@example.com" {...field} disabled={!!user} />
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
                </div>
                {!user && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Create Password</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                     </div>
                )}


                <h3 className="text-lg font-medium pt-4 border-t">Business Details</h3>
                <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Acme Corp" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="passportPhoto"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Passport-size Photo</FormLabel>
                             <FormControl>
                                <div className="flex items-center gap-4">
                                    <div className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted">
                                        {photoPreview ? (
                                            <Image src={photoPreview} alt="Preview" width={96} height={96} className="object-cover rounded-md" />
                                        ) : (
                                            <Upload className="h-8 w-8 text-muted-foreground" />
                                        )}
                                    </div>
                                    <Button type="button" variant="outline" onClick={() => document.getElementById('photo-upload')?.click()}>
                                        Upload Image
                                    </Button>
                                    <Input id="photo-upload" type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="signature"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Online Signature</FormLabel>
                            <FormControl>
                                <div className="relative rounded-lg border border-input">
                                    <SignatureCanvas 
                                        ref={sigPadRef}
                                        penColor='black'
                                        canvasProps={{className: 'w-full h-32 rounded-md'}} 
                                        onEnd={() => field.onChange(sigPadRef.current?.toDataURL() || '')}
                                    />
                                </div>
                            </FormControl>
                            <div className="flex justify-end">
                                <Button type="button" variant="ghost" size="sm" onClick={clearSignature}>
                                    <RefreshCw className="h-4 w-4 mr-2"/>
                                    Clear
                                </Button>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <h3 className="text-lg font-medium pt-4 border-t">Identification Details</h3>
                <FormField
                    control={form.control}
                    name="aadhar"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Aadhar Card Number</FormLabel>
                        <FormControl>
                            <Input placeholder="XXXX XXXX XXXX" {...field} onChange={handleAadharChange} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <Collapsible open={isAadharEntered}>
                    <CollapsibleContent className="space-y-4 pt-2">
                        <Alert>
                           <CheckCircle2 className="h-4 w-4" />
                           <AlertTitle>OTP Sent!</AlertTitle>
                           <AlertDescription>
                               An OTP has been sent to your Aadhar-linked mobile number.
                           </AlertDescription>
                        </Alert>
                         <FormItem>
                            <FormLabel>Aadhar OTP Verification</FormLabel>
                            <div className="flex items-center gap-4">
                               <FormControl>
                                    <Controller
                                        control={form.control}
                                        name="aadharOtp"
                                        render={({ field }) => (
                                            <InputOTP maxLength={6} {...field} disabled={isVerifyingOtp || isOtpVerified}>
                                                <InputOTPGroup>
                                                    <InputOTPSlot index={0} />
                                                    <InputOTPSlot index={1} />
                                                    <InputOTPSlot index={2} />
                                                    <InputOTPSlot index={3} />
                                                    <InputOTPSlot index={4} />
                                                    <InputOTPSlot index={5} />
                                                </InputOTPGroup>
                                            </InputOTP>
                                        )}
                                    />
                                </FormControl>
                                <Button type="button" onClick={handleOtpVerify} disabled={isVerifyingOtp || isOtpVerified}>
                                    {isVerifyingOtp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isOtpVerified ? "Verified" : "Verify"}
                                </Button>
                            </div>
                            <FormMessage {...form.getFieldState('aadharOtp')} />
                        </FormItem>
                    </CollapsibleContent>
                </Collapsible>
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

              <Button type="submit" className="w-full" disabled={isLoading || !isOtpVerified}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit for Verification'}
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
