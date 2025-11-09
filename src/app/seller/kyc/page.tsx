
"use client";

import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Loader2, ShieldCheck, CheckCircle2, AlertTriangle, FileText, Upload, Trash2, Camera, User, Building, Banknote, ArrowLeft, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Link from "next/link";
import { useAuthActions } from "@/lib/auth";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { getFirestore, doc, onSnapshot, setDoc, addDoc, collection } from "firebase/firestore";
import { getStorage, ref as sref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirebaseAuth, getFirestoreDb, getFirebaseStorage } from "@/lib/firebase";


function Step({ n, title, done, current }: { n: number, title: string, done?: boolean, current?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`h-7 w-7 shrink-0 rounded-full grid place-items-center text-sm font-semibold ring-2 ${done ? "bg-green-600 text-white ring-green-600" : current ? "bg-primary text-primary-foreground ring-primary" : "bg-muted text-muted-foreground ring-border"}`}>{n}</div>
      <div>
        <div className="font-semibold">{title}</div>
        {done && <div className="text-xs text-green-700">Completed</div>}
        {current && <div className="text-xs text-primary">In progress</div>}
      </div>
    </div>
  );
}

function SectionCard({ title, children, aside }: { title: string, children: React.ReactNode, aside?: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        {aside}
      </CardHeader>
      <CardContent className="grid gap-4">{children}</CardContent>
    </Card>
  );
}

function Field({ label, hint, children, required, error }: { label: string, hint?: string, children: React.ReactNode, required?: boolean, error?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label>
        {label}{required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}

const initialSeller = {
  fullName: "",
  dob: "",
  phone: "",
  email: "",
  selfieFile: null as File|null,
  selfiePreview: "",
  aadhaarZip: null as File|null,
  aadhaarShareCode: "",
  aadhaarPhotoUrl: "",
  faceMatchScore: 0,
  faceMatchStatus: "pending" as "pending" | "passed" | "failed",
  pan: "",
  panName: "",
  panVerified: false,
  bankName: "",
  ifsc: "",
  acctName: "",
  acctNumber: "",
  sellerType: "individual",
  shopName: "",
  gst: "",
  address: "",
  open24x7: true,
};

function SellerKycWizard() {
  const [step, setStep] = useState(1);
  const [seller, setSeller] = useState<any>(initialSeller);
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const isStepValid = useCallback((n:number) => {
    switch(n){
      case 1: return Boolean(seller.fullName && seller.dob && seller.phone && seller.email && seller.selfieFile);
      case 2: return Boolean(seller.aadhaarZip && seller.aadhaarShareCode?.length >= 4);
      case 3: return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(seller.pan || '');
      case 4: return Boolean(seller.bankName && seller.ifsc && seller.acctName && seller.acctNumber);
      case 5: return seller.sellerType === 'business' ? Boolean(seller.shopName && seller.address) : true;
      default: return false;
    }
  }, [seller]);
  
  const onSelfie = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (!f) return setSeller((s: any) => ({ ...s, selfieFile: null, selfiePreview: "" }));
    const url = URL.createObjectURL(f);
    setSeller((s: any) => ({ ...s, selfieFile: f, selfiePreview: url }));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 grid gap-5 self-start sticky top-24">
        <SectionCard title="KYC Progress">
          <div className="space-y-4">
            <Step n={1} title="Personal Details" done={isStepValid(1)} current={step===1} />
            <Step n={2} title="Identity (Aadhaar)" done={isStepValid(2)} current={step===2} />
            <Step n={3} title="Tax & Bank" done={isStepValid(3) && isStepValid(4)} current={step===3} />
            <Step n={4} title="Business & Address" done={isStepValid(5)} current={step===4} />
            <Step n={5} title="Review & Submit" done={submittedAt !== null} current={step===5} />
          </div>
        </SectionCard>
      </div>

      <div className="lg:col-span-2 grid gap-6">
        {step===1 && (
          <SectionCard title="Personal Details">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name (as per ID)" required error={!seller.fullName ? 'Required' : ''}>
                <Input value={seller.fullName} onChange={(e:any)=>setSeller({...seller, fullName:e.target.value})} placeholder="e.g. RAHUL KUMAR" />
              </Field>
              <Field label="Date of Birth" required error={!seller.dob ? 'Required' : ''}>
                <Input type="date" value={seller.dob} onChange={(e:any)=>setSeller({...seller, dob:e.target.value})} />
              </Field>
              <Field label="Contact Phone" required error={!seller.phone ? 'Required' : ''}>
                <Input type="tel" placeholder="10-digit mobile" value={seller.phone} onChange={(e:any)=>setSeller({...seller, phone:e.target.value})} />
              </Field>
              <Field label="Contact Email" required error={!seller.email ? 'Required' : ''}>
                <Input type="email" placeholder="name@example.com" value={seller.email} onChange={(e:any)=>setSeller({...seller, email:e.target.value})} />
              </Field>
              <Field label="Live Selfie Photo" hint="Clear face, no sunglasses" required error={!seller.selfieFile ? 'Upload a selfie' : ''}>
                <Input type="file" accept="image/*" onChange={onSelfie} />
                <div className="flex items-center gap-3 pt-1">
                  {seller.selfiePreview && <Image src={seller.selfiePreview} alt="selfie" width={64} height={64} className="h-16 w-16 rounded-xl object-cover ring-1 ring-border" />}
                  {!seller.selfiePreview && <span className="text-xs text-muted-foreground">No photo selected</span>}
                </div>
              </Field>
            </div>
            <div className="flex justify-end items-center">
              <Button onClick={()=>setStep(2)} disabled={!isStepValid(1)}>Next</Button>
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const { loading: authLoading } = useAuth();

  if (authLoading) {
    return <div className="h-screen w-full flex items-center justify-center"><LoadingSpinner /></div>
  }

  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto grid gap-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">StreamCart • Seller Verification</h1>
        </header>
        <SellerKycWizard />
      </div>
    </div>
  );
}

    