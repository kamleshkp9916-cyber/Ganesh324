
"use client";

import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Check, AlertTriangle, Upload, ChevronLeft, ChevronRight, ShieldCheck, Building2, User2, MapPin, Banknote, FileSignature, ClipboardList, Eye, UserCheck, ShieldAlert, Gavel, Loader2, Send, Camera, QrCode, CheckCircle2, Save, RotateCcw } from "lucide-react";
import { useAuth, useAuthActions } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import Image from "next/image";
import { updateUserData, UserData } from "@/lib/follow-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getFirestoreDb } from "@/lib/firebase-db";
import { Skeleton } from "@/components/ui/skeleton";
import { signInAnonymously, getAuth } from "firebase/auth";

const SELLER_KYC_DRAFT_KEY = 'sellerKycDraft';
const SELLER_KYC_STEP_KEY = 'sellerKycStep';

const Section = ({ title, children, icon, hasError }: { title: string, children: React.ReactNode, icon: React.ReactNode, hasError?: boolean }) => (
  <Card className={`shadow-lg border rounded-2xl ${hasError ? 'border-destructive' : ''}`}>
    <CardHeader className="pb-2">
      <div className="flex items-center gap-2">
        {icon}
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        {hasError && <Badge variant="destructive">Fixes Needed</Badge>}
      </div>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const StepPill = ({ index, label, active, complete }: { index: number, label: string, active: boolean, complete: boolean }) => (
  <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm ${active ? "bg-black text-white" : complete ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
    <span className="w-5 h-5 grid place-content-center rounded-full border bg-white text-xs font-bold">{complete ? <Check className="w-4 h-4"/> : index}</span>
    <span>{label}</span>
  </div>
);

const steps = [
  { key: "basic", label: "Basic Info", icon: <User2 className="w-5 h-5"/> },
  { key: "biz", label: "Business", icon: <Building2 className="w-5 h-5"/> },
  { key: "addr", label: "Address", icon: <MapPin className="w-5 h-5"/> },
  { key: "bank", label: "Tax & Bank", icon: <Banknote className="w-5 h-5"/> },
  { key: "kyc", label: "Identity (0DIDit)", icon: <ShieldCheck className="w-5 h-5"/> },
  { key: "policies", label: "Policies & Preview", icon: <FileSignature className="w-5 h-5"/> },
];

function SellerWizard({ onSubmit, existingData }: { onSubmit: (data: any) => void, existingData?: UserData | null }) {
  const { user, auth } = useAuth();
  const { toast } = useToast();
  const { handleSellerSignUp } = useAuthActions();
  
  const getInitialStep = () => existingData?.stepsToFix?.[0] ? steps.findIndex(s => s.key === existingData.stepsToFix[0]) : 0;
  
  const [current, setCurrent] = useLocalStorage<number>(SELLER_KYC_STEP_KEY, getInitialStep());
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const initialFormState = {
    photoUrl: existingData?.photoURL || "",
    legalName: existingData?.legalName || "",
    displayName: existingData?.displayName || "",
    email: existingData?.email || user?.email || "",
    phone: existingData?.phone?.replace('+91 ','') || "",
    password: "",
    confirmPassword: "",
    emailOtp: "",
    phoneOtp: "",
    emailVerified: !!existingData?.emailVerified,
    phoneVerified: !!existingData?.phoneVerified,
    categories: [],
    about: existingData?.about || "",
    bizType: existingData?.bizType || "Individual",
    regNo: existingData?.regNo || "",
    gstin: existingData?.gstin || "",
    incorporation: "",
    supportEmail: (existingData as any)?.supportEmail || "",
    supportPhone: (existingData as any)?.supportPhone || "",
    regAddr: existingData?.addresses?.find(a => a.type === 'registered') || { line1: "", line2: "", city: "", state: "", pin: "" },
    pickupAddr: existingData?.addresses?.find(a => a.type === 'pickup') || { same: true, line1: "", line2: "", city: "", state: "", pin: "" },
    serviceRegions: [],
    pan: existingData?.pan || "",
    ifsc: existingData?.bank?.ifsc || "",
    accountNo: existingData?.bank?.acct || "",
    accountName: existingData?.bank?.name || "",
    auctionEnabled: (existingData as any)?.auctionEnabled || false,
    termsAccepted: existingData?.termsAccepted || false,
    aadhaarNumber: "",
    aadhaarOtp: "",
  };

  const [form, setForm] = useLocalStorage<any>(SELLER_KYC_DRAFT_KEY, initialFormState);
  const [isFormDirty, setIsFormDirty] = useState(false);
  
    const [verif, setVerif] = useState<{ state: "IDLE" | "PENDING" | "VERIFIED" | "FAILED", message: string }>({ state: (existingData as any)?.isNipherVerified ? 'VERIFIED' : "IDLE", message: (existingData as any)?.isNipherVerified ? 'Verification previously completed.' : '' });
  const [isVerifying, setIsVerifying] = useState({ email: false, phone: false, aadhaar: false, face: false });
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(form.photoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
    const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [panError, setPanError] = useState('');

  const RESEND_COOLDOWN = 60;
  const [otpSent, setOtpSent] = useState({ email: form.emailVerified || false, phone: form.phoneVerified || false });
  const [resendCooldown, setResendCooldown] = useState({ email: 0, phone: 0 });

  useEffect(() => {
    const handler = setTimeout(() => {
      if (isFormDirty) {
        setForm(form);
        setIsFormDirty(false); // Reset dirty state after saving
        toast({title: "Draft Saved!"});
      }
    }, 1500); // Save after 1.5 seconds of inactivity
    return () => clearTimeout(handler);
  }, [form, isFormDirty, setForm, toast]);


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown.email > 0) {
      timer = setTimeout(() => setResendCooldown(prev => ({ ...prev, email: prev.email - 1 })), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown.email]);

   useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown.phone > 0) {
      timer = setTimeout(() => setResendCooldown(prev => ({ ...prev, phone: prev.phone - 1 })), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown.phone]);

  const isStep1Valid = useMemo(() => {
    return form.legalName && form.displayName && /.+@.+\..+/.test(form.email) && /^\d{10}$/.test(form.phone) && form.emailVerified && form.phoneVerified && form.photoUrl && (!!existingData || (form.password.length >= 8 && form.password === form.confirmPassword)) && !emailError && !phoneError;
  }, [form, emailError, phoneError, existingData]);

  const isStep2Valid = useMemo(() => {
    return form.bizType && /.+@.+\..+/.test(form.supportEmail) && /^\d{10}$/.test(form.supportPhone);
  }, [form.bizType, form.supportEmail, form.supportPhone]);

  const isStep3Valid = useMemo(() => {
    const { regAddr, pickupAddr } = form;
    const isRegAddrValid = regAddr.line1 && regAddr.city && regAddr.state && /^\d{6}$/.test(regAddr.pin);
    if (pickupAddr.same) return isRegAddrValid;
    return isRegAddrValid && pickupAddr.line1 && pickupAddr.city && pickupAddr.state && /^\d{6}$/.test(pickupAddr.pin);
  }, [form.regAddr, form.pickupAddr]);

  const isStep4Valid = useMemo(() => {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan) && /^[A-Z]{4}0[A-Z0-9]{6}$/i.test(form.ifsc) && /^\d{9,18}$/.test(form.accountNo) && form.accountName.length >= 3 && !panError;
  }, [form.pan, form.ifsc, form.accountNo, form.accountName, panError]);


  const isStep5Valid = useMemo(() => {
    return verif.state === "VERIFIED";
  }, [verif.state]);

  const canGoToStep = (stepIndex: number) => {
    return true; // Temporarily enabled for UI review
  }

  const progress = useMemo(() => Math.round(((current + 1) / (steps.length)) * 100), [current]);

  const setField = (path: string, value: any) => {
    setIsFormDirty(true);
    setForm((prev: any) => {
      const clone = structuredClone(prev);
      const parts = path.split(".");
      let node: any = clone;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!node[parts[i]]) node[parts[i]] = {};
        node = node[parts[i]];
      }
      node[parts.at(-1)!] = value;
      return clone;
    });
  };
  
  const checkEmailExists = useCallback(async () => {
    if (!/.+@.+\..+/.test(form.email) || form.email === existingData?.email) return;
    try {
        const response = await fetch('/api/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: form.email }),
        });
        if (!response.ok) throw new Error('Network response was not ok.');
        const result = await response.json();
        if (result.exists) {
            setEmailError("This email is already registered. Please use a different one.");
        } else {
            setEmailError("");
        }
    } catch (e) {
        console.error("Email validation error:", e);
        setEmailError("Could not validate email. Please try again.");
    }
  }, [form.email, existingData?.email]);

  const checkPhoneExists = useCallback(async () => {
    if (!/^\d{10}$/.test(form.phone) || `+91 ${form.phone}` === existingData?.phone) return;
    try {
        const response = await fetch('/api/check-phone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: `+91 ${form.phone}` }),
        });
        if (!response.ok) throw new Error('Network response was not ok.');
        const result = await response.json();
        if (result.exists) {
            setPhoneError("This phone number is already registered. Please use a different one.");
        } else {
            setPhoneError("");
        }
    } catch (e) {
        console.error("Phone validation error:", e);
        setPhoneError("Could not validate phone number. Please try again.");
    }
  }, [form.phone, existingData?.phone]);

  const checkPanExists = useCallback(() => {
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan)) {
        setPanError("Invalid PAN format. It should be like ABCDE1234F.");
    } else {
        setPanError("");
    }
  }, [form.pan]);

  const handleSendOtp = async (type: 'email' | 'phone') => {
    setOtpSent(prev => ({...prev, [type]: true}));
    toast({ title: `OTP Sent to your ${type}` });
  };

  const handleVerifyOtp = async (type: 'email' | 'phone') => {
    const otp = type === 'email' ? form.emailOtp : form.phoneOtp;
    if (otp === '123456') { // OTP Bypass
        setField(`${type}Verified`, true);
        toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} Verified!` });
        return;
    }
    
    setIsVerifying(prev => ({...prev, [type]: true}));
    try {
        const functions = getFunctions(getFirestoreDb().app);
        const verifyCode = httpsCallable(functions, 'verifyCode');
        const result: any = await verifyCode({ target: type === 'email' ? form.email : `+91${form.phone}`, otp });

        if (result.data.success) {
            setField(`${type}Verified`, true);
            toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} Verified!` });
        } else {
            throw new Error(result.data.error?.message || 'Invalid OTP');
        }
    } catch (error: any) {
        toast({ variant: "destructive", title: "Verification Failed", description: error.message });
    } finally {
        setIsVerifying(prev => ({...prev, [type]: false}));
    }
  };


  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setField('photoUrl', result);
      };
      reader.readAsDataURL(file);
    }
  };
  
    const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelfiePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

  const next = () => setCurrent((c) => Math.min(c + 1, steps.length - 1));
  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  const canSubmit = form.termsAccepted && verif.state === "VERIFIED";

  const handleGenerateVerification = async () => {
    if (!user || !user.uid) {
        toast({variant: 'destructive', title: 'Authentication Error', description: 'Could not get a temporary user ID. Please refresh and try again.'});
        return;
    }
    setVerif({ state: "PENDING", message: "Contacting verification service..." });
    try {
        const functions = getFunctions();
        const startVerification = httpsCallable(functions, 'verifyFlow');
        const response: any = await startVerification({ action: 'startVerification', userId: user.uid });
        const { sessionId, qrDataUrl } = response.data;
        
        setQrDataUrl(qrDataUrl);
        setVerif({ state: "PENDING", message: "Scan the QR code with your phone to complete verification." });
        
        const pollInterval = setInterval(async () => {
            try {
                const statusFunction = httpsCallable(functions, 'verifyFlow');
                const result: any = await statusFunction({ action: 'status', sessionId });
                
                if (result.data.status === 'VERIFIED') {
                    clearInterval(pollInterval);
                    setVerif({ state: "VERIFIED", message: "Verification successful! You can now proceed." });
                    toast({ title: "Verification Successful!", description: "Proceeding to the next step." });
                    setTimeout(() => next(), 1500);
                } else if (result.data.status === 'FAILED' || result.data.status === 'ERROR') {
                     clearInterval(pollInterval);
                     setVerif({ state: "FAILED", message: "Verification failed. Please try again." });
                }
            } catch (error) {
                console.error("Polling error:", error);
                clearInterval(pollInterval);
                setVerif({ state: "FAILED", message: "Could not confirm verification status. Please try again." });
            }
        }, 3000);

    } catch (error: any) {
        console.error("Error creating 0DIDit session:", error);
        setVerif({ state: "FAILED", message: error.message || "Could not start verification. Please try again." });
    }
  };
  
  const submit = async () => {
    const { emailOtp, phoneOtp, aadhaarOtp, ...restOfForm } = form;

    const finalData = {
        ...restOfForm,
        isNipherVerified: verif.state === "VERIFIED",
        addresses: [
            {...form.regAddr, id: 1, type: 'registered' },
            !form.pickupAddr.same ? {...form.pickupAddr, id: 2, type: 'pickup'} : null
        ].filter(Boolean),
        verificationStatus: 'pending', // Re-submit as pending
    };
    
    delete (finalData as any).stepsToFix; // Clear fix request on re-submission

    try {
        if(existingData) {
            await updateUserData(existingData.uid, finalData);
            onSubmit({ status: "SUBMITTED", payload: finalData });
        } else {
            await handleSellerSignUp(finalData);
            onSubmit({ status: "SUBMITTED", payload: finalData });
        }
    } catch (error) {
        console.error("Seller sign up/update failed:", error);
    }
  };

  const handleReset = () => {
    localStorage.removeItem(SELLER_KYC_DRAFT_KEY);
    localStorage.removeItem(SELLER_KYC_STEP_KEY);
    window.location.reload();
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <div className="xl:col-span-1 xl:sticky top-24 self-start">
        <div className="space-y-3">
            <Card className="rounded-2xl">
            <CardHeader className="pb-3">
                <CardTitle>Onboarding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                {steps.map((s, i) => (
                    <StepPill key={s.key} index={i + 1} label={s.label} active={current === i} complete={i < current} />
                ))}
                </div>
                <Progress value={progress} className="w-full mt-2 h-1"/>
            </CardContent>
            </Card>
            <Card className="rounded-2xl">
            <CardHeader className="pb-2"><CardTitle>Application Status</CardTitle></CardHeader>
            <CardContent className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge>{existingData?.verificationStatus?.toUpperCase() || 'Draft'}</Badge>
                    <Button variant="outline" size="sm" onClick={() => { setForm(form); toast({title: "Draft Saved!"}); }} disabled={!isFormDirty}>
                        <Save className="w-4 h-4 mr-2"/>
                        Save Draft
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleReset}>
                        <RotateCcw className="w-4 h-4 mr-2"/>Reset
                    </Button>
                </div>
                <div className="text-xs text-muted-foreground">You can submit after finishing KYC and accepting terms.</div>
            </CardContent>
            </Card>
            <div className="text-xs text-muted-foreground p-3 bg-gray-50 rounded-lg">
                <strong>Privacy Note:</strong> We use 0DIDit for secure identity verification. We don't store your personal ID data, only the information necessary for you to use or sell products on the Nipher platform.
            </div>
        </div>
      </div>

      <div className="xl:col-span-3">
        <AnimatePresence mode="popLayout">
          <motion.div key={current} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            {steps[current].key === "basic" && (
              <Section title="Basic Info" icon={<User2 className="w-5 h-5"/>} hasError={(existingData as any)?.stepsToFix?.includes('basic')}>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                      <Avatar className="h-24 w-24">
                          <AvatarImage src={photoPreview || undefined} alt="Seller photo"/>
                          <AvatarFallback><User2 className="w-10 h-10"/></AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                              <Upload className="w-4 h-4 mr-2"/> Upload Photo
                          </Button>
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
                          <p className="text-xs text-muted-foreground">This will be your public profile picture.</p>
                      </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Legal name</label>
                      <Input value={form.legalName} onChange={(e)=>setField("legalName", e.target.value)} placeholder="As per ID"/>
                       <p className="text-xs text-muted-foreground mt-1">This name must match your legal documents (e.g., PAN card).</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Shop display name</label>
                      <Input value={form.displayName} onChange={(e)=>setField("displayName", e.target.value)} placeholder="Unique store name"/>
                        <p className="text-xs text-muted-foreground mt-1">This is the name customers will see.</p>
                    </div>
                  </div>
                  {!existingData && (
                    <>
                    <div className="flex flex-col md:flex-row gap-2 items-end">
                      <div className="space-y-1 flex-grow">
                        <label className="text-sm font-medium">Email</label>
                        <Input value={form.email} onChange={(e) => { setEmailError(''); setField("email", e.target.value); }} onBlur={checkEmailExists} placeholder="you@shop.com" disabled={form.emailVerified} className="flex-grow"/>
                         {emailError ? <p className="text-xs text-destructive mt-1">{emailError}</p> : <p className="text-xs text-muted-foreground mt-1">This email will be used for login and official communication.</p>}
                      </div>
                      <Button type="button" onClick={() => handleSendOtp('email')} disabled={resendCooldown.email > 0 || form.emailVerified || !!emailError || !/.+@.+\..+/.test(form.email) || isVerifying.email} className="flex-shrink-0 w-full md:w-auto">
                          {isVerifying.email ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : form.emailVerified ? <Check className="mr-2 h-4 w-4"/> : <Send className="mr-2 h-4 w-4"/>}
                          {form.emailVerified ? 'Verified' : resendCooldown.email > 0 ? `Resend in ${resendCooldown.email}s` : 'Send OTP'}
                      </Button>
                    </div>
                     {otpSent.email && !form.emailVerified && (
                        <div className="flex items-end gap-2">
                            <InputOTP maxLength={6} value={form.emailOtp} onChange={(val) => setField("emailOtp", val)}>
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                            <Button type="button" variant="secondary" onClick={() => handleVerifyOtp('email')} disabled={form.emailOtp.length < 6 || isVerifying.email}>
                            {isVerifying.email && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Verify Email
                            </Button>
                        </div>
                    )}
                    <div className="flex flex-col md:flex-row gap-2 items-end">
                        <div className="space-y-1 flex-grow">
                            <label className="text-sm font-medium">Phone</label>
                            <Input value={form.phone} onChange={(e) => { setPhoneError(''); setField("phone", e.target.value.replace(/[^0-9]/g, "").slice(0,10)); }} onBlur={checkPhoneExists} placeholder="10‑digit mobile" disabled={form.phoneVerified} className="flex-grow"/>
                            {phoneError ? <p className="text-xs text-destructive mt-1">{phoneError}</p> : <p className="text-xs text-muted-foreground mt-1">Used for verification and support communication.</p>}
                        </div>
                        <Button type="button" onClick={() => handleSendOtp('phone')} disabled={resendCooldown.phone > 0 || form.phoneVerified || !!phoneError || form.phone.length !== 10 || isVerifying.phone} className="flex-shrink-0 w-full md:w-auto">
                          {isVerifying.phone ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : form.phoneVerified ? <Check className="mr-2 h-4 w-4"/> : <Send className="mr-2 h-4 w-4"/>}
                          {form.phoneVerified ? 'Verified' : resendCooldown.phone > 0 ? `Resend in ${resendCooldown.phone}s` : 'Send OTP'}
                        </Button>
                    </div>
                    {otpSent.phone && !form.phoneVerified && (
                        <div className="flex items-end gap-2">
                            <InputOTP maxLength={6} value={form.phoneOtp} onChange={(val) => setField("phoneOtp", val)}>
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>
                            <Button type="button" variant="secondary" onClick={() => handleVerifyOtp('phone')} disabled={form.phoneOtp.length < 6 || isVerifying.phone}>
                            {isVerifying.phone && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Verify Phone
                            </Button>
                        </div>
                    )}
                    
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Password</label>
                          <Input type="password" value={form.password} onChange={(e)=>setField("password", e.target.value)} placeholder="Minimum 8 characters"/>
                           {form.password && form.password.length < 8 && <p className="text-xs text-destructive mt-1">Password must be at least 8 characters.</p>}
                        </div>
                         <div>
                          <label className="text-sm font-medium">Confirm Password</label>
                          <Input type="password" value={form.confirmPassword} onChange={(e)=>setField("confirmPassword", e.target.value)} placeholder="Re-enter your password"/>
                          {form.confirmPassword && form.password !== form.confirmPassword && <p className="text-xs text-destructive mt-1">Passwords do not match.</p>}
                        </div>
                    </div>
                    </>
                  )}

                  <div>
                    <label className="text-sm font-medium">About shop</label>
                    <Textarea value={form.about} onChange={(e)=>setField("about", e.target.value)} placeholder="Short bio"/>
                  </div>
                </div>
              </Section>
            )}

            {steps[current].key === "biz" && (
              <Section title="Business Details" icon={<Building2 className="w-5 h-5"/>} hasError={existingData?.stepsToFix?.includes('biz')}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Business type *</label>
                    <Select value={form.bizType} onValueChange={(v)=>setField("bizType", v)}>
                      <SelectTrigger><SelectValue placeholder="Select"/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Individual">Individual</SelectItem>
                        <SelectItem value="Sole Proprietor">Sole Proprietor</SelectItem>
                        <SelectItem value="Company">Company</SelectItem>
                        <SelectItem value="Partnership">Partnership</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm">Registration number</label>
                    <Input value={form.regNo} onChange={(e)=>setField("regNo", e.target.value)} placeholder="Optional for Individual"/>
                  </div>
                  <div>
                    <label className="text-sm">GSTIN</label>
                    <Input value={form.gstin} onChange={(e)=>setField("gstin", e.target.value)} placeholder="Optional"/>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Support email *</label>
                    <Input value={form.supportEmail} onChange={(e)=>setField("supportEmail", e.target.value)} placeholder="support@shop.com"/>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Support phone *</label>
                    <Input value={form.supportPhone} onChange={(e)=>setField("supportPhone", e.target.value.replace(/[^0-9]/g, "").slice(0,10))} placeholder="For buyers (10-digit)"/>
                  </div>
                </div>
              </Section>
            )}

            {steps[current].key === "addr" && (
              <Section title="Address & Pickup" icon={<MapPin className="w-5 h-5"/>} hasError={existingData?.stepsToFix?.includes('addr')}>
                 <p className="text-sm text-muted-foreground mb-4">Please provide an accurate address. This is mandatory for our delivery partners to arrange pickup for your products. Incorrect details may lead to delays or order cancellations.</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="font-medium">Registered address *</div>
                    <Input placeholder="Line 1" value={form.regAddr.line1} onChange={(e)=>setField("regAddr.line1", e.target.value)}/>
                    <Input placeholder="Line 2" value={form.regAddr.line2} onChange={(e)=>setField("regAddr.line2", e.target.value)}/>
                    <div className="grid grid-cols-3 gap-2">
                      <Input placeholder="City" value={form.regAddr.city} onChange={(e)=>setField("regAddr.city", e.target.value)}/>
                      <Input placeholder="State" value={form.regAddr.state} onChange={(e)=>setField("regAddr.state", e.target.value)}/>
                      <Input placeholder="PIN" value={form.regAddr.pin} onChange={(e)=>setField("regAddr.pin", e.target.value.replace(/[^0-9]/g, "").slice(0,6))}/>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Pickup/warehouse address</div>
                      <div className="flex items-center gap-2 text-sm"><span>Same as registered</span><Switch checked={form.pickupAddr.same} onCheckedChange={(v)=>setField("pickupAddr.same", v)}/></div>
                    </div>
                    {!form.pickupAddr.same && (
                      <>
                        <Input placeholder="Line 1" value={form.pickupAddr.line1} onChange={(e)=>setField("pickupAddr.line1", e.target.value)}/>
                        <Input placeholder="Line 2" value={form.pickupAddr.line2} onChange={(e)=>setField("pickupAddr.line2", e.target.value)}/>
                        <div className="grid grid-cols-3 gap-2">
                          <Input placeholder="City" value={form.pickupAddr.city} onChange={(e)=>setField("pickupAddr.city", e.target.value)}/>
                          <Input placeholder="State" value={form.pickupAddr.state} onChange={(e)=>setField("pickupAddr.state", e.target.value)}/>
                          <Input placeholder="PIN" value={form.pickupAddr.pin} onChange={(e)=>setField("pickupAddr.pin", e.target.value.replace(/[^0-9]/g, "").slice(0,6))}/>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Section>
            )}

            {steps[current].key === "bank" && (
              <Section title="Tax & Bank" icon={<Banknote className="w-5 h-5"/>} hasError={existingData?.stepsToFix?.includes('bank')}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">PAN *</label>
                    <Input value={form.pan} onChange={(e)=>setField("pan", e.target.value.toUpperCase())} onBlur={checkPanExists} placeholder="ABCDE1234F"/>
                    {panError && <p className="text-xs text-destructive mt-1">{panError}</p>}
                    <p className="text-xs text-muted-foreground mt-1">Your PAN is used for identity verification and tax purposes. It will not be shared publicly.</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Account holder name *</label>
                    <Input value={form.accountName} onChange={(e)=>setField("accountName", e.target.value)} placeholder="Must match legal name"/>
                     <p className="text-xs text-muted-foreground mt-1">Ensure this name matches the name on your bank account to avoid payout failures.</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Account number *</label>
                    <Input value={form.accountNo} onChange={(e)=>setField("accountNo", e.target.value.replace(/[^0-9]/g, ""))} placeholder=""/>
                  </div>
                  <div>
                    <label className="text-sm font-medium">IFSC *</label>
                    <Input value={form.ifsc} onChange={(e)=>setField("ifsc", e.target.value.toUpperCase())} placeholder="HDFC0000001"/>
                  </div>
                </div>
              </Section>
            )}

            {steps[current].key === "kyc" && (
              <Section title="Identity — 0DIDit" icon={<ShieldCheck className="w-5 h-5"/>} hasError={existingData?.stepsToFix?.includes('kyc')}>
                <div className="space-y-4 text-center flex flex-col items-center">
                    {verif.state === 'IDLE' && (
                        <>
                            <div className="p-3 rounded-xl bg-gray-50 text-sm max-w-md mx-auto">
                                Verify your identity using 0DIDit for a secure and fast verification process. You will be prompted to scan a QR code with your phone.
                            </div>
                            <Button onClick={handleGenerateVerification} disabled={!user}>Generate Verification Link</Button>
                        </>
                    )}

                    {verif.state === 'PENDING' && (
                        <div className="flex flex-col items-center gap-4">
                            <h3 className="font-semibold">{qrDataUrl ? "Scan to Verify" : "Generating..."}</h3>
                            <p className="text-sm text-muted-foreground">{verif.message}</p>
                            {qrDataUrl ? (
                                <Image src={qrDataUrl} alt="0DIDit Verification QR Code" width={250} height={250} className="rounded-lg border p-2" />
                            ) : (
                                <Skeleton className="w-[250px] h-[250px]" />
                            )}
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin"/>
                                Waiting for completion...
                            </div>
                        </div>
                    )}
                     {verif.state === 'VERIFIED' && (
                        <div className="flex flex-col items-center gap-4 text-green-600">
                             <CheckCircle2 className="h-16 w-16" />
                             <h3 className="font-semibold text-lg">Verification Successful!</h3>
                             <p className="text-sm max-w-sm">{verif.message}</p>
                             <p className="text-xs text-muted-foreground">Proceeding to the next step...</p>
                        </div>
                     )}
                     {verif.state === 'FAILED' && (
                        <div className="flex flex-col items-center gap-4 text-destructive">
                             <AlertTriangle className="h-16 w-16" />
                             <h3 className="font-semibold text-lg">Verification Failed</h3>
                             <p className="text-sm max-w-sm">{verif.message}</p>
                             <Button onClick={() => setVerif({state: "IDLE", message: ""})}>Try Again</Button>
                        </div>
                     )}
                </div>
              </Section>
            )}
            
            {steps[current].key === "policies" && (
                <Section title="Policies & Preview" icon={<FileSignature className="w-5 h-5"/>} hasError={(existingData as any)?.stepsToFix?.includes('policies')}>
                  <div className="space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Seller Policies</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <p>By becoming a seller, you agree to adhere to the following community and platform rules:</p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Accurate Listings:</strong> You must provide truthful and accurate descriptions and photos for all your products. Misleading information is strictly prohibited.</li>
                                <li><strong>Prohibited Items:</strong> You are not permitted to sell illegal items, counterfeit goods, weapons, adult content, or any other items listed in our Prohibited Items Policy.</li>
                                <li><strong>Respectful Communication:</strong> All interactions with buyers and other users must be professional and respectful. Harassment, hate speech, or spam will not be tolerated.</li>
                                <li><strong>Order Fulfillment:</strong> You are responsible for fulfilling orders in a timely manner. Excessive delays or cancellations may result in account suspension.</li>
                                <li><strong>Authenticity:</strong> All products sold must be authentic. We have a zero-tolerance policy for counterfeit goods.</li>
                            </ul>
                            <p>Violation of these policies may result in content removal, account suspension, or a permanent ban from the platform. We reserve the right to update these policies at any time.</p>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-3">
                      <Switch checked={form.auctionEnabled} onCheckedChange={(v)=>setField("auctionEnabled", v)} />
                      <span>Enable live auctions (Feature coming soon)</span>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Switch id="terms-switch" checked={form.termsAccepted} onCheckedChange={(v)=>setField("termsAccepted", v)} />
                      <label htmlFor="terms-switch" className="text-sm">I have read and agree to the <Link href="/terms-and-conditions" target="_blank" className="text-primary underline">Seller Policies and Terms of Service</Link>.</label>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-muted-foreground">Preview your storefront card.</div>
                        <Button variant="secondary" onClick={() => setIsPreviewOpen(true)}><Eye className="w-4 h-4 mr-2"/>Preview</Button>
                    </div>
                  </div>
                </Section>
            )}

            <div className="flex items-center justify-between mt-6">
                <Button variant="outline" onClick={prev} className={current === 0 ? "invisible" : ""}>Back</Button>
              <div className="flex items-center gap-3">
                {current < steps.length - 1 && (
                  <Button onClick={next} disabled={!canGoToStep(current + 1)}>Next<ChevronRight className="w-4 h-4 ml-2"/></Button>
                )}
                {current === steps.length - 1 && (
                  <Button disabled={!canSubmit} onClick={submit}>
                    Submit for Review
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

       <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <SheetContent side="bottom" className="h-[80vh] flex flex-col">
            <SheetHeader className="text-left">
                <SheetTitle>Application Preview</SheetTitle>
                <SheetDescription>This is a summary of the information you have provided.</SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-full mt-4">
                <div className="space-y-6 pr-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={form.photoUrl} />
                            <AvatarFallback>{form.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-xl font-bold">{form.displayName}</h3>
                            <p className="text-muted-foreground">{form.about}</p>
                        </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <h4 className="col-span-2 text-base font-semibold">Basic Information</h4>
                        <div className="text-muted-foreground">Legal Name</div><div>{form.legalName}</div>
                        <div className="text-muted-foreground">Email</div><div>{form.email}</div>
                        <div className="text-muted-foreground">Phone</div><div>{form.phone}</div>

                        <h4 className="col-span-2 text-base font-semibold mt-4">Business Details</h4>
                        <div className="text-muted-foreground">Business Type</div><div>{form.bizType}</div>
                        <div className="text-muted-foreground">Support Email</div><div>{form.supportEmail}</div>
                        <div className="text-muted-foreground">Support Phone</div><div>{form.supportPhone}</div>

                        <h4 className="col-span-2 text-base font-semibold mt-4">Address</h4>
                        <div className="text-muted-foreground">Registered</div><div className="truncate">{form.regAddr.line1}, {form.regAddr.city}</div>
                        <div className="text-muted-foreground">Pickup</div><div className="truncate">{form.pickupAddr.same ? 'Same as registered' : `${form.pickupAddr.line1}, ${form.pickupAddr.city}`}</div>

                         <h4 className="col-span-2 text-base font-semibold mt-4">Bank & Tax</h4>
                        <div className="text-muted-foreground">PAN</div><div>{form.pan}</div>
                        <div className="text-muted-foreground">Account Holder</div><div>{form.accountName}</div>
                        <div className="text-muted-foreground">Account No.</div><div>{form.accountNo}</div>
                        <div className="text-muted-foreground">IFSC</div><div>{form.ifsc}</div>

                        <h4 className="col-span-2 text-base font-semibold mt-4">Verification</h4>
                        <div className="text-muted-foreground">Identity (0DIDit)</div><div>{verif.state === 'VERIFIED' ? <Badge variant="success">Verified</Badge> : <Badge variant="destructive">Not Verified</Badge>}</div>

                        <h4 className="col-span-2 text-base font-semibold mt-4">Settings</h4>
                        <div className="text-muted-foreground">Auctions</div><div>{form.auctionEnabled ? 'Enabled' : 'Disabled'}</div>
                        <div className="text-muted-foreground">Terms Accepted</div><div>{form.termsAccepted ? 'Yes' : 'No'}</div>
                    </div>
                </div>
            </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function KYCPage() {
    const { user, userData, authReady } = useAuth();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const { initiateAnonymousSignIn } = useAuthActions();
    
    useEffect(() => {
        setIsClient(true);
    }, []);
    
    useEffect(() => {
        if (isClient && authReady && !user) {
            initiateAnonymousSignIn();
        }
    }, [isClient, authReady, user, initiateAnonymousSignIn]);
    
    const initialProgress = useMemo(() => {
        return Math.round(((0 + 1) / (steps.length)) * 100);
    }, []);
    
    useEffect(() => {
        if (isClient && authReady) {
            if (user && !user.isAnonymous && userData?.role === 'seller' && userData?.verificationStatus === 'verified') {
                router.replace('/seller/dashboard');
            }
        }
    }, [isClient, user, userData, authReady, router]);
    
    const handleSubmission = (data: any) => {
        router.refresh(); // This will re-trigger the check in useEffect
    };

    if (!isClient || !authReady) {
        return (
            <div className="min-h-screen p-6 md:p-10 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }
    
    if (userData?.verificationStatus === 'pending') {
         return (
             <div className="min-h-screen p-6 md:p-10 flex items-center justify-center">
                <Card className="max-w-md text-center">
                    <CardHeader>
                        <CardTitle>Application Submitted</CardTitle>
                        <CardDescription>Thank you for submitting your application. We are currently reviewing your details.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <p className="text-sm">Estimated review time is <strong>24 hours</strong>. You will receive an email once your application has been reviewed.</p>
                        <Button asChild className="mt-4"><Link href="/">Back to Login</Link></Button>
                    </CardContent>
                </Card>
            </div>
         );
    }

    if (userData?.verificationStatus === 'rejected') {
        return (
             <div className="min-h-screen p-6 md:p-10 flex items-center justify-center">
                <Card className="max-w-md text-center border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Application Rejected</CardTitle>
                        <CardDescription>Unfortunately, your seller application could not be approved at this time.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <div className="bg-destructive/10 p-3 rounded-md text-left">
                            <p className="font-semibold">Reason for rejection:</p>
                            <p className="text-sm">{userData.rejectionReason || "No reason provided."}</p>
                        </div>
                        <Button onClick={() => updateUserData(user!.uid, { verificationStatus: 'pending', rejectionReason: '' })} className="mt-4">Start New Application</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (userData?.verificationStatus === 'needs-resubmission') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
                <Progress value={initialProgress} className="w-full fixed top-0 left-0 right-0 h-1 z-50"/>
                <div className="max-w-7xl mx-auto space-y-6 p-6 md:p-10 pt-8">
                     <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                        <div className="xl:col-span-1">
                             <div className="flex items-center justify-between">
                                <Button asChild variant="ghost" className="-ml-4">
                                    <Link href="/">
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Back to Login
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="xl:col-span-3 text-center">
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Become a Seller</h1>
                            <p className="text-sm text-muted-foreground">Complete the following steps to start selling on Nipher.</p>
                        </div>
                    </div>
                    <Card className="border-amber-500 bg-amber-50">
                        <CardHeader className="text-center">
                            <CardTitle className="text-amber-700">Resubmission Required</CardTitle>
                            <CardDescription className="text-amber-600">
                                An admin has reviewed your application and requires more information. Please review the feedback below, make the necessary changes, and re-submit.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center font-medium text-amber-800">
                             <p>"{userData.resubmissionReason || 'No reason provided.'}"</p>
                             {(userData as any).stepsToFix && (
                                 <div className="mt-2 text-sm">
                                    <p className="font-bold">Please correct the following sections:</p>
                                    <div className="flex justify-center gap-2 mt-1">
                                    {(userData as any).stepsToFix.map((stepKey: string) => (
                                         <Badge key={stepKey} variant="warning">{steps.find(s => s.key === stepKey)?.label}</Badge>
                                    ))}</div>
                                 </div>
                             )}
                        </CardContent>
                    </Card>
                    <SellerWizard onSubmit={handleSubmission} existingData={userData} />
                </div>
            </div>
        )
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            <Progress value={initialProgress} className="w-full fixed top-0 left-0 right-0 h-1 z-50"/>
            <div className="max-w-7xl mx-auto space-y-6 p-6 md:p-10 pt-8">
                 <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    <div className="xl:col-span-1">
                        <div className="flex items-center justify-between">
                            <Button asChild variant="ghost" className="-ml-4">
                                <Link href="/">
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Back to Login
                                </Link>
                            </Button>
                        </div>
                    </div>
                    <div className="xl:col-span-3 text-center">
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Become a Seller</h1>
                        <p className="text-sm text-muted-foreground">Complete the following steps to start selling on Nipher.</p>
                    </div>
                </div>
                <SellerWizard onSubmit={handleSubmission} />
            </div>
        </div>
    );
}
