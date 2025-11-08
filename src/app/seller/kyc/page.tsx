
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, ShieldCheck, CheckCircle2, AlertTriangle, FileText, Upload, Trash2, Camera, User, Building, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuthActions } from "@/lib/auth";
import Image from "next/image";
import SignatureCanvas from 'react-signature-canvas'
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const sellerKycSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  confirmPassword: z.string(),
  businessName: z.string().min(2, "Business name is required."),
  phone: z.string().regex(/^\+91 \d{10}$/, "Please enter a valid 10-digit Indian phone number."),
  accountNumber: z.string().min(9, "Account number is too short").max(18, "Account number is too long"),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format."),
  passportPhoto: z.any().refine(file => file, "Passport photo is required."),
  signature: z.any().refine(sig => sig, "Signature is required."),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});


export default function SellerKycPage() {
    const { user, userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { handleSellerSignUp } = useAuthActions();
    
    const [step, setStep] = useState(1);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const signaturePadRef = useRef<SignatureCanvas>(null);

    const form = useForm<z.infer<typeof sellerKycSchema>>({
        resolver: zodResolver(sellerKycSchema),
        defaultValues: {
            firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
            businessName: '', phone: '+91 ',
            accountNumber: '', ifsc: '',
        },
    });

    useEffect(() => {
        if (!authLoading) {
            if (user) { // Customer upgrading to seller
                form.setValue('firstName', user.displayName?.split(' ')[0] || '');
                form.setValue('lastName', user.displayName?.split(' ').slice(1).join(' ') || '');
                form.setValue('email', user.email || '');
            }
             if (userData?.role === 'seller') {
                router.replace('/seller/dashboard');
            }
        }
    }, [user, userData, authLoading, router, form]);

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
                form.setValue('passportPhoto', { file, preview: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSignatureEnd = () => {
        if (signaturePadRef.current) {
            const dataUrl = signaturePadRef.current.toDataURL();
            form.setValue('signature', dataUrl);
        }
    };
    
    const clearSignature = () => {
        signaturePadRef.current?.clear();
        form.setValue('signature', null);
    };

    async function onSubmit(values: z.infer<typeof sellerKycSchema>) {
        setIsLoading(true);
        try {
            await handleSellerSignUp(values);
        } catch (error) {
            // Toast is handled in auth action
        } finally {
            setIsLoading(false);
        }
    }

    const handleNextStep = async () => {
        let fieldsToValidate: any[] = [];
        if (step === 1) {
            fieldsToValidate = user ? ['firstName', 'lastName', 'email'] : ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
        } else if (step === 2) {
            fieldsToValidate = ['businessName', 'phone', 'accountNumber', 'ifsc'];
        }
        
        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) {
            setStep(prev => prev + 1);
        }
    }
    
    if (authLoading) {
        return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>
    }

    const steps = [
        { num: 1, title: 'Account', icon: <User className="h-5 w-5" /> },
        { num: 2, title: 'Business', icon: <Building className="h-5 w-5" /> },
        { num: 3, title: 'Documents', icon: <FileText className="h-5 w-5" /> },
    ];

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
      <Card className="w-full max-w-2xl my-8">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
          <CardTitle className="text-2xl">Become a Seller</CardTitle>
          <CardDescription>
            Complete the form below to start selling on StreamCart.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="mb-6">
                <div className="flex justify-between items-center px-2">
                    {steps.map((s, index) => (
                        <div key={s.num} className={cn(
                            "flex flex-col items-center z-10",
                             index !== 0 && "flex-1"
                        )}>
                            <div className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                                step > s.num ? "bg-primary text-primary-foreground" :
                                step === s.num ? "bg-primary text-primary-foreground border-2 border-background ring-2 ring-primary" : "bg-muted text-muted-foreground border"
                            )}>
                                {step > s.num ? <CheckCircle2 className="h-5 w-5" /> : s.icon}
                            </div>
                            <p className={cn("text-xs mt-1", step >= s.num ? "font-semibold text-primary" : "text-muted-foreground")}>{s.title}</p>
                             {index > 0 && (
                                <div className="absolute top-5 h-0.5 w-full bg-border -translate-x-1/2 -z-10">
                                    <div className={cn("h-full bg-primary transition-all duration-300", step > s.num ? 'w-full' : 'w-0')} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {step === 1 && (
                    <div className="space-y-6">
                        <h3 className="font-semibold text-lg border-b pb-2">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="firstName" render={({ field }) => (
                                <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} disabled={!!user} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="lastName" render={({ field }) => (
                                <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} disabled={!!user} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} disabled={!!user} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        {!user && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="password" render={({ field }) => (
                                    <FormItem><FormLabel>Create Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                                    <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                        )}
                    </div>
                )}
                
                {step === 2 && (
                    <div className="space-y-6">
                        <h3 className="font-semibold text-lg border-b pb-2">Business Information</h3>
                        <FormField control={form.control} name="businessName" render={({ field }) => (
                            <FormItem><FormLabel>Business/Shop Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>

                        <h3 className="font-semibold text-lg border-b pb-2 pt-4">Bank Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="accountNumber" render={({ field }) => (
                                <FormItem><FormLabel>Bank Account Number</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="ifsc" render={({ field }) => (
                                <FormItem><FormLabel>IFSC Code</FormLabel><FormControl><Input {...field} className="uppercase" /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                    </div>
                )}

                 {step === 3 && (
                    <div className="space-y-6">
                         <h3 className="font-semibold text-lg border-b pb-2">Document Upload</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            <FormField control={form.control} name="passportPhoto" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Passport-size Photo</FormLabel>
                                    <FormControl>
                                        <div className="w-full h-40 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted text-muted-foreground hover:border-primary hover:text-primary cursor-pointer relative" onClick={() => photoInputRef.current?.click()}>
                                            {photoPreview ? (
                                                <Image src={photoPreview} alt="Photo Preview" fill sizes="100vw" className="object-cover rounded-lg" />
                                            ) : (
                                                <div className="text-center"><Camera className="h-8 w-8 mx-auto" /><p className="text-xs mt-1">Click to Upload</p></div>
                                            )}
                                            <Input id="photo-upload" type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload}/>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="signature" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Signature</FormLabel>
                                    <FormControl>
                                    <div className="w-full rounded-lg border border-input bg-background relative">
                                            <SignatureCanvas
                                                ref={signaturePadRef}
                                                penColor='black'
                                                canvasProps={{ className: 'w-full h-40 rounded-lg' }}
                                                onEnd={handleSignatureEnd}
                                            />
                                            <Button type="button" variant="ghost" size="sm" className="absolute bottom-2 right-2" onClick={clearSignature}>Clear</Button>
                                    </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                    </div>
                 )}


              <CardFooter className="px-0 pt-8 flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(prev => prev - 1)} disabled={step === 1}>Back</Button>
                    {step < 3 ? (
                        <Button type="button" onClick={handleNextStep}>Next</Button>
                    ) : (
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit for Verification'}
                        </Button>
                    )}
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground mt-4 max-w-lg">
        By submitting, you agree to our <Link href="/terms-and-conditions" className="underline hover:text-primary">Seller Terms &amp; Conditions</Link>.
      </p>
    </div>
  );
}
 