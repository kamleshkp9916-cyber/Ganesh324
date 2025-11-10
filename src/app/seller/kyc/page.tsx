
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Check, AlertTriangle, Upload, ChevronLeft, ChevronRight, ShieldCheck, Building2, User2, MapPin, Banknote, FileSignature, ClipboardList, Eye, UserCheck, ShieldAlert, Gavel, Loader2, Send, Camera, QrCode, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
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
import { useAuthActions } from "@/lib/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

const Section = ({ title, children, icon }: { title: string, children: React.ReactNode, icon: React.ReactNode }) => (
  <Card className="shadow-lg border rounded-2xl">
    <CardHeader className="pb-2">
      <div className="flex items-center gap-2">
        {icon}
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
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
  { key: "policies", label: "Policies & Preview", icon: <ClipboardList className="w-5 h-5"/> },
];

const SELLER_APP_SUBMITTED_KEY = "sellerAppSubmitted";

function SellerWizard({ onSubmit }: { onSubmit: (data: any) => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { handleSellerSignUp } = useAuthActions();
  const [current, setCurrent] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const initialFormState = {
    photoUrl: "",
    legalName: "",
    displayName: "",
    email: user?.email || "",
    phone: "",
    password: "",
    confirmPassword: "",
    emailOtp: "",
    phoneOtp: "",
    emailVerified: false,
    phoneVerified: false,
    categories: [],
    about: "",
    bizType: "Individual",
    regNo: "",
    gstin: "",
    incorporation: "",
    supportEmail: "",
    supportPhone: "",
    regAddr: { line1: "", line2: "", city: "", state: "", pin: "" },
    pickupAddr: { same: true, line1: "", line2: "", city: "", state: "", pin: "" },
    serviceRegions: [],
    pan: "",
    ifsc: "",
    accountNo: "",
    accountName: "",
    auctionEnabled: false,
    termsAccepted: false,
    aadhaarNumber: "",
    aadhaarOtp: "",
  };

  const [form, setForm] = useState(initialFormState);
  
  const [verif, setVerif] = useState<{ state: "IDLE" | "PENDING" | "VERIFIED" | "FAILED", message: string }>({ state: "IDLE", message: "" });
  const [otpSent, setOtpSent] = useState({ email: false, phone: false, aadhaar: false });
  const [isVerifying, setIsVerifying] = useState({ email: false, phone: false, aadhaar: false, face: false });
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const isStep1Valid = useMemo(() => {
    return form.legalName && form.displayName && /.+@.+\..+/.test(form.email) && /^\d{10}$/.test(form.phone) && form.emailVerified && form.phoneVerified && form.photoUrl && form.password.length >= 8 && form.password === form.confirmPassword && !emailError && !phoneError;
  }, [form, emailError, phoneError]);

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
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan) && /^[A-Z]{4}0[A-Z0-9]{6}$/i.test(form.ifsc) && /^\d{9,18}$/.test(form.accountNo) && form.accountName.length >= 3;
  }, [form.pan, form.ifsc, form.accountNo, form.accountName]);


  const isStep5Valid = useMemo(() => {
    return verif.state === "VERIFIED";
  }, [verif.state]);

  const canGoToStep = (stepIndex: number) => {
    switch(stepIndex) {
        case 0: return true;
        case 1: return isStep1Valid;
        case 2: return isStep1Valid && isStep2Valid;
        case 3: return isStep1Valid && isStep2Valid && isStep3Valid;
        case 4: return isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid;
        case 5: return isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid && isStep5Valid;
        default: return true;
    }
  }

  const progress = useMemo(() => Math.round(((current) / (steps.length - 1)) * 100), [current]);

  const setField = (path: string, value: any) => {
    setForm((prev) => {
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
    if (!/.+@.+\..+/.test(form.email)) return;
    const db = getFirestoreDb();
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", form.email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      setEmailError("This email is already registered. Please use a different one.");
    } else {
      setEmailError("");
    }
  }, [form.email]);

  const checkPhoneExists = useCallback(async () => {
    if (!/^\d{10}$/.test(form.phone)) return;
    const db = getFirestoreDb();
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("phone", "==", `+91 ${form.phone}`));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      setPhoneError("This phone number is already registered. Please use a different one.");
    } else {
      setPhoneError("");
    }
  }, [form.phone]);

  const handleSendOtp = (type: 'email' | 'phone' | 'aadhaar') => {
      setOtpSent(prev => ({...prev, [type]: true}));
      toast({ title: `OTP Sent to your ${type}` });
  };

  const handleVerifyOtp = (type: 'email' | 'phone' | 'aadhaar') => {
      const otp = type === 'email' ? form.emailOtp : type === 'phone' ? form.phoneOtp : form.aadhaarOtp;
      if (otp !== '1234') { // Mock OTPs
          toast({ variant: 'destructive', title: `Invalid ${type} OTP` });
          return;
      }
      setIsVerifying(prev => ({...prev, [type]: true }));
      setTimeout(() => {
          if(type !== 'aadhaar') {
            setField(`${type}Verified`, true);
          }
          toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} Verified!` });
          setIsVerifying(prev => ({ ...prev, [type]: false }));
      }, 1000);
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
    setVerif({ state: "PENDING", message: "Generating secure 0DIDit verification link..." });
    const verificationLink = "https://0did.it/verify/mock-session-12345";
    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(verificationLink)}`);
    
    setTimeout(() => {
        setVerif({ state: "VERIFIED", message: "Verification successful on your mobile device. You can now proceed." });
        toast({ title: "Verification Successful!", description: "You can proceed to the next step." });
        setTimeout(() => next(), 1500);
    }, 5000); 
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
    };

    try {
        await handleSellerSignUp(finalData);
        onSubmit({ status: "SUBMITTED", payload: finalData });
    } catch (error) {
        console.error("Seller sign up failed:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <div className="xl:col-span-1 space-y-3">
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
            <Progress value={progress} />
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle>Application Status</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm"><Badge>Draft</Badge></div>
            <div className="text-xs text-muted-foreground">You can submit after finishing KYC and accepting terms.</div>
          </CardContent>
        </Card>
         <div className="text-xs text-muted-foreground p-3 bg-gray-50 rounded-lg">
            <strong>Privacy Note:</strong> We use 0DIDit for secure identity verification. We don't store your personal ID data, only the information necessary for you to use or sell products on the Nipher platform.
        </div>
      </div>

      <div className="xl:col-span-3">
        <AnimatePresence mode="popLayout">
          <motion.div key={current} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            {steps[current].key === "basic" && (
              <Section title="Basic Info" icon={<User2 className="w-5 h-5"/>}>
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
                      <label className="text-sm">Legal name</label>
                      <Input value={form.legalName} onChange={(e)=>setField("legalName", e.target.value)} placeholder="As per ID"/>
                    </div>
                    <div>
                      <label className="text-sm">Shop display name</label>
                      <Input value={form.displayName} onChange={(e)=>setField("displayName", e.target.value)} placeholder="Unique store name"/>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-[1fr,auto] gap-2 items-end">
                      <div>
                        <label className="text-sm">Email</label>
                        <Input value={form.email} onChange={(e) => { setEmailError(''); setField("email", e.target.value); }} onBlur={checkEmailExists} placeholder="you@shop.com" disabled={form.emailVerified} />
                         {emailError && <p className="text-xs text-destructive mt-1">{emailError}</p>}
                      </div>
                      <Button type="button" onClick={() => handleSendOtp('email')} disabled={otpSent.email || form.emailVerified || !!emailError || !/.+@.+\..+/.test(form.email)}>
                          {form.emailVerified ? <Check className="mr-2 h-4 w-4"/> : <Send className="mr-2 h-4 w-4"/>}
                          {form.emailVerified ? 'Verified' : otpSent.email ? 'Resend OTP' : 'Send OTP'}
                      </Button>
                  </div>
                   {otpSent.email && !form.emailVerified && (
                      <div className="flex items-center gap-2">
                          <InputOTP maxLength={4} value={form.emailOtp} onChange={(val) => setField("emailOtp", val)}>
                              <InputOTPGroup>
                                  <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} /><InputOTPSlot index={3} />
                              </InputOTPGroup>
                          </InputOTP>
                          <Button type="button" variant="secondary" onClick={() => handleVerifyOtp('email')} disabled={form.emailOtp.length < 4 || isVerifying.email}>
                            {isVerifying.email && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Verify Email
                          </Button>
                      </div>
                  )}

                  <div className="grid md:grid-cols-[1fr,auto] gap-2 items-end">
                      <div>
                        <label className="text-sm">Phone</label>
                        <Input value={form.phone} onChange={(e) => { setPhoneError(''); setField("phone", e.target.value.replace(/[^0-9]/g, "").slice(0,10)); }} onBlur={checkPhoneExists} placeholder="10‑digit mobile" disabled={form.phoneVerified}/>
                        {phoneError && <p className="text-xs text-destructive mt-1">{phoneError}</p>}
                      </div>
                      <Button type="button" onClick={() => handleSendOtp('phone')} disabled={otpSent.phone || form.phoneVerified || !!phoneError || form.phone.length !== 10}>
                         {form.phoneVerified ? <Check className="mr-2 h-4 w-4"/> : <Send className="mr-2 h-4 w-4"/>}
                         {form.phoneVerified ? 'Verified' : otpSent.phone ? 'Resend OTP' : 'Send OTP'}
                      </Button>
                  </div>
                  {otpSent.phone && !form.phoneVerified && (
                      <div className="flex items-center gap-2">
                          <InputOTP maxLength={4} value={form.phoneOtp} onChange={(val) => setField("phoneOtp", val)}>
                               <InputOTPGroup>
                                  <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} /><InputOTPSlot index={3} />
                              </InputOTPGroup>
                          </InputOTP>
                          <Button type="button" variant="secondary" onClick={() => handleVerifyOtp('phone')} disabled={form.phoneOtp.length < 4 || isVerifying.phone}>
                             {isVerifying.phone && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Verify Phone
                          </Button>
                      </div>
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm">Password</label>
                        <Input type="password" value={form.password} onChange={(e)=>setField("password", e.target.value)} placeholder="Minimum 8 characters"/>
                         {form.password && form.password.length < 8 && <p className="text-xs text-destructive mt-1">Password must be at least 8 characters.</p>}
                      </div>
                       <div>
                        <label className="text-sm">Confirm Password</label>
                        <Input type="password" value={form.confirmPassword} onChange={(e)=>setField("confirmPassword", e.target.value)} placeholder="Re-enter your password"/>
                        {form.confirmPassword && form.password !== form.confirmPassword && <p className="text-xs text-destructive mt-1">Passwords do not match.</p>}
                      </div>
                  </div>

                  <div>
                    <label className="text-sm">About shop</label>
                    <Textarea value={form.about} onChange={(e)=>setField("about", e.target.value)} placeholder="Short bio"/>
                  </div>
                </div>
              </Section>
            )}

            {steps[current].key === "biz" && (
              <Section title="Business Details" icon={<Building2 className="w-5 h-5"/>}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm">Business type</label>
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
                    <label className="text-sm">Support email</label>
                    <Input value={form.supportEmail} onChange={(e)=>setField("supportEmail", e.target.value)} placeholder="support@shop.com"/>
                  </div>
                  <div>
                    <label className="text-sm">Support phone</label>
                    <Input value={form.supportPhone} onChange={(e)=>setField("supportPhone", e.target.value.replace(/[^0-9]/g, "").slice(0,10))} placeholder="For buyers (10-digit)"/>
                  </div>
                </div>
              </Section>
            )}

            {steps[current].key === "addr" && (
              <Section title="Address & Pickup" icon={<MapPin className="w-5 h-5"/>}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="font-medium">Registered address</div>
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
              <Section title="Tax & Bank" icon={<Banknote className="w-5 h-5"/>}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm">PAN</label>
                    <Input value={form.pan} onChange={(e)=>setField("pan", e.target.value.toUpperCase())} placeholder="ABCDE1234F"/>
                  </div>
                  <div>
                    <label className="text-sm">Account holder name</label>
                    <Input value={form.accountName} onChange={(e)=>setField("accountName", e.target.value)} placeholder="Must match legal name"/>
                  </div>
                  <div>
                    <label className="text-sm">Account number</label>
                    <Input value={form.accountNo} onChange={(e)=>setField("accountNo", e.target.value.replace(/[^0-9]/g, ""))} placeholder=""/>
                  </div>
                  <div>
                    <label className="text-sm">IFSC</label>
                    <Input value={form.ifsc} onChange={(e)=>setField("ifsc", e.target.value.toUpperCase())} placeholder="HDFC0000001"/>
                  </div>
                </div>
              </Section>
            )}

            {steps[current].key === "kyc" && (
              <Section title="Identity — 0DIDit" icon={<ShieldCheck className="w-5 h-5"/>}>
                <div className="space-y-4 text-center flex flex-col items-center">
                    {verif.state === 'IDLE' && (
                        <>
                            <div className="p-3 rounded-xl bg-gray-50 text-sm max-w-md mx-auto">
                                Verify your identity using 0DIDit for a secure and fast verification process. You will be prompted to scan a QR code with your phone.
                            </div>
                            <Button onClick={handleGenerateVerification}>Generate Verification Link</Button>
                        </>
                    )}

                    {verif.state === 'PENDING' && (
                        <div className="flex flex-col items-center gap-4">
                            <h3 className="font-semibold">Scan to Verify</h3>
                            <p className="text-sm text-muted-foreground">Scan the QR code with your phone's camera to complete verification on the 0DIDit platform.</p>
                            {qrCodeUrl ? (
                                <Image src={qrCodeUrl} alt="0DIDit Verification QR Code" width={250} height={250} className="rounded-lg border p-2" />
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
                <Section title="Policies & Preview" icon={<FileSignature className="w-5 h-5"/>}>
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-xl text-sm">
                      By enabling auctions you agree to comply with platform rules and local regulations.
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch checked={form.auctionEnabled} onCheckedChange={(v)=>setField("auctionEnabled", v)} />
                      <span>Enable live auctions</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch checked={form.termsAccepted} onCheckedChange={(v)=>setField("termsAccepted", v)} />
                      <span>I accept the Nipher Terms & Policies</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Preview your storefront card with name and bio.</div>
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
                    Submit to Nipher for Review
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
    const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
    
    useEffect(() => {
        setIsClient(true);
        const storedStatus = localStorage.getItem(SELLER_APP_SUBMITTED_KEY);
        if (storedStatus) {
            setSubmissionStatus('pending');
        }
    }, []);
    
    useEffect(() => {
        if (isClient && authReady) {
            if (user && userData?.role === 'seller') {
                router.replace('/seller/dashboard');
            }
        }
    }, [isClient, user, userData, authReady, router]);
    
    const handleSubmission = (data: any) => {
        localStorage.setItem(SELLER_APP_SUBMITTED_KEY, JSON.stringify(data));
        setSubmissionStatus('pending');
    };

    if (!isClient || !authReady) {
        return (
            <div className="min-h-screen p-6 md:p-10 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (submissionStatus === 'pending') {
         return (
             <div className="min-h-screen p-6 md:p-10 flex items-center justify-center">
                <Card className="max-w-md text-center">
                    <CardHeader>
                        <CardTitle>Application Submitted</CardTitle>
                        <CardDescription>Thank you for submitting your application. We are currently reviewing your details.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <p className="text-sm">Estimated review time is <span className="font-bold">24 hours</span>. You will receive an email once your application has been reviewed.</p>
                        <Button asChild className="mt-4"><Link href="/">Back to Login</Link></Button>
                    </CardContent>
                </Card>
            </div>
         );
    }
    
    return (
        <div className="min-h-screen p-6 md:p-10 bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto space-y-6">
                 <div className="flex items-center justify-between">
                  <Button asChild variant="ghost" className="-ml-4">
                    <Link href="/live-selling">
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back to Shopping
                    </Link>
                  </Button>
                </div>
                <div className="text-center">
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Become a Seller</h1>
                    <p className="text-sm text-muted-foreground">Complete the following steps to start selling on Nipher.</p>
                </div>
                <SellerWizard onSubmit={handleSubmission} />
            </div>
        </div>
    );
}

    