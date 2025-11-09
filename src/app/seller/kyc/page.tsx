
      
"use client";

import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Loader2, ShieldCheck, CheckCircle2, AlertTriangle, FileText, Upload, Trash2, Camera, User, Building, Banknote, ArrowLeft } from "lucide-react";
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


async function idToken() {
  const auth = getFirebaseAuth();
  if (!auth.currentUser) throw new Error("Sign in first");
  return auth.currentUser.getIdToken();
}

// -------- Storage helpers --------
async function uploadSelfie(uid: string, file: File): Promise<string> {
  const storage = getFirebaseStorage();
  const r = sref(storage, `selfies/${uid}/${Date.now()}-${file.name}`);
  await uploadBytes(r, file, { contentType: file.type });
  return getDownloadURL(r);
}

async function uploadAadhaarZip(uid: string, appId: string, file: File): Promise<string> {
    const storage = getFirebaseStorage();
    const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucket) throw new Error("Storage bucket not configured in environment variables.");
    const r = sref(storage, `aadhaar_zips/${uid}/${appId}-${Date.now()}.zip`);
    await uploadBytes(r, file, { contentType: "application/zip", customMetadata: { uid, appId } });
    return `gs://${bucket}/${r.fullPath}`;
}


// -------- HTTPS Functions helpers (used for faceMatch & submit) --------
async function submitKycFn(payload:any){ const t=await idToken(); const res=await fetch(`/api/submitKyc`,{method:'POST',headers:{'Content-Type':'application/json', Authorization:`Bearer ${t}`}, body:JSON.stringify(payload)}); if(!res.ok) throw new Error(await res.text()); return res.json(); }
async function faceMatchFn({appId,selfieUrl,aadhaarPhotoUrl}:{appId:string,selfieUrl:string,aadhaarPhotoUrl:string}){ const t=await idToken(); const res=await fetch(`/api/faceMatch`,{method:'POST',headers:{'Content-Type':'application/json', Authorization:`Bearer ${t}`}, body:JSON.stringify({appId,selfieUrl,aadhaarPhotoUrl})}); if(!res.ok) throw new Error(await res.text()); return res.json(); }


// ---------------- Validators (offline) ----------------
const panIsValid = (pan:string) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test((pan||'').toUpperCase());


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


function Countdown({ to }: { to: number }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const remain = Math.max(0, to - now);
  const hh = String(Math.floor(remain/1000/60/60)).padStart(2, '0');
  const mm = String(Math.floor(remain/1000/60)%60).padStart(2, '0');
  const ss = String(Math.floor(remain/1000)%60).padStart(2, '0');
  return <span className="tabular-nums">{hh}:{mm}:{ss}</span>;
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

function SellerPortal() {
  const [step, setStep] = useState(1);
  const [seller, setSeller] = useState<any>(initialSeller);
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const slaMs = 24 * 60 * 60 * 1000; // 24 hours
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [appId,setAppId]=useState("");
  const unsubRef = useRef<any>(null);
  const db = getFirestoreDb();
  const { toast } = useToast();
  const [isProcessingZip, setIsProcessingZip] = useState(false);
  
  // Listen to Firestore doc to auto-get Aadhaar photo when backend parses ZIP
  useEffect(()=>{
    if (!db || !appId) return;
    if (unsubRef.current) { try { unsubRef.current(); } catch {} }
    const dref = doc(db, 'kyc_applications', appId);
    const unsub = onSnapshot(dref, snap => {
      const data:any = snap.data();
      const url = data?.documents?.aadhaarPhotoUrl;
      if (url && url !== seller.aadhaarPhotoUrl) {
        setSeller((s: any)=>({...s, aadhaarPhotoUrl: url }));
        setIsProcessingZip(false); // Stop showing loading state once photo URL is received
      }
    });
    unsubRef.current = unsub;
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[db, appId]);

  const isStepValid = useCallback((n:number) => {
    switch(n){
      case 1: return Boolean(seller.fullName && seller.dob && seller.phone && seller.email && seller.selfieFile);
      case 2: {
        const zipOk = !!(seller.aadhaarZip && (seller.aadhaarShareCode||"").length>=4);
        return zipOk;
      }
      case 3: return panIsValid(seller.pan);
      case 4: return Boolean(seller.bankName && seller.ifsc && seller.acctName && seller.acctNumber);
      case 5: return seller.sellerType === 'business' ? Boolean(seller.shopName && seller.address) : true;
      case 6: return canSubmit;
      default: return false;
    }
  }, [seller]);

  const canSubmit = useMemo(()=> isStepValid(1) && isStepValid(2) && isStepValid(3) && isStepValid(4) && isStepValid(5), [isStepValid]);

  const ensureDraft = useCallback(async () => {
    if (appId) return appId;
    if (!user) {
        toast({ variant: 'destructive', title: 'Authentication Error', description: 'Please sign in first.' });
        throw new Error("User not authenticated");
    }
    // This is a minimal payload to create the draft document in Firestore
    const payload = { 
        personal: { 
            fullName: seller.fullName || user.displayName, 
            email: seller.email || user.email 
        },
        status: 'draft' 
    };
    try {
        const docRef = await addDoc(collection(db, 'kyc_applications'), payload);
        setAppId(docRef.id);
        return docRef.id;
    } catch (error: any) {
        console.error("Error creating draft KYC application:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not create a draft application. Please check your connection and try again.' });
        throw error;
    }
  }, [appId, user, seller, db, toast]);


  function onAadhaarZip(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setSeller((s: any) => ({...s, aadhaarZip: f}));
  }

  function onSelfie(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0] || null;
    if (!f) return setSeller((s: any)=>({...s, selfieFile:null, selfiePreview:""}));
    const url = URL.createObjectURL(f);
    setSeller((s: any)=>({...s, selfieFile:f, selfiePreview:url}));
  }
  
  async function uploadZipToStorage(){
    if (!user) {
        toast({ variant: 'destructive', title: 'Authentication Error', description: 'Please sign in first.' });
        return;
    }
    if (!seller.aadhaarZip) {
        toast({ variant: 'destructive', title: 'Aadhaar ZIP Required', description: 'Please select your Aadhaar ZIP file.' });
        return;
    }
    try {
        setIsProcessingZip(true);
        const id = await ensureDraft();
        await uploadAadhaarZip(user.uid, id, seller.aadhaarZip as File);
        toast({ title: 'ZIP Uploaded', description: 'Your Aadhaar ZIP file is being processed. The photo will appear automatically.' });
    } catch (e: any) {
        console.error("ZIP upload error:", e);
        toast({ variant: 'destructive', title: 'Upload Failed', description: e.message || 'An unexpected error occurred.' });
        setIsProcessingZip(false);
    }
  }

  async function submit() {
    if (!canSubmit) {
      toast({ variant: 'destructive', title: 'Incomplete Form', description: 'Please complete all required steps before submitting.' });
      return;
    }
    const payload={
      personal:{ fullName:seller.fullName, dob:seller.dob, phone:seller.phone, email:seller.email, selfieUrl: seller.selfiePreview },
      documents:{ aadhaarZipPath:null, aadhaarPhotoUrl: seller.aadhaarPhotoUrl, pan: seller.pan },
      bank:{ bankName:seller.bankName, ifsc:seller.ifsc, acctName:seller.acctName, acctNumber:seller.acctNumber },
      business:{ sellerType:seller.sellerType, shopName:seller.shopName, gst:seller.gst, address:seller.address }
    };
    try {
        const { id } = await submitKycFn(payload);
        setAppId(id);
        setSubmittedAt(Date.now());
        toast({ title: 'Application Submitted!', description: 'Your KYC details are now under review.' });
        setTimeout(() => {
            router.push('/seller/dashboard'); // Redirect after successful submission
        }, 1500);
    } catch (e: any) {
        console.error("Submission error:", e);
        toast({ variant: 'destructive', title: 'Submission Failed', description: e.message || 'An unexpected error occurred.' });
    }
  }

  if (authLoading) {
    return <div className="h-screen w-full flex items-center justify-center"><LoadingSpinner /></div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 grid gap-5 self-start sticky top-24">
        <SectionCard title="KYC Progress">
          <div className="space-y-4">
            <Step n={1} title="Personal Details" done={isStepValid(1)} current={step===1} />
            <Step n={2} title="Aadhaar Offline e-KYC" done={isStepValid(2)} current={step===2} />
            <Step n={3} title="PAN Verification" done={isStepValid(3)} current={step===3} />
            <Step n={4} title="Bank Details" done={isStepValid(4)} current={step===4} />
            <Step n={5} title="Business (Optional)" done={isStepValid(5)} current={step===5} />
            <Step n={6} title="Review & Submit" done={submittedAt !== null} current={step===6} />
          </div>
        </SectionCard>
      </div>

      <div className="lg:col-span-2 grid gap-6">
        {step===1 && (
          <SectionCard title="Personal Details">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name (as per Aadhaar)" required error={!seller.fullName ? 'Required' : ''}>
                <Input value={seller.fullName} onChange={(e:any)=>setSeller({...seller, fullName:e.target.value})} placeholder="e.g. RAHUL KUMAR" />
              </Field>
              <Field label="Date of Birth" required error={!seller.dob ? 'Required' : ''}>
                <Input type="date" value={seller.dob} onChange={(e:any)=>setSeller({...seller, dob:e.target.value})} />
              </Field>
              <Field label="Phone (OTP verified)" required error={!seller.phone ? 'Required' : ''}>
                <Input type="tel" placeholder="10-digit mobile" value={seller.phone} onChange={(e:any)=>setSeller({...seller, phone:e.target.value})} />
              </Field>
              <Field label="Email" required error={!seller.email ? 'Required' : ''}>
                <Input type="email" placeholder="name@example.com" value={seller.email} onChange={(e:any)=>setSeller({...seller, email:e.target.value})} />
              </Field>
              <Field label="Profile Photo (Selfie)" hint="Clear face, no sunglasses" required error={!seller.selfieFile ? 'Upload a selfie' : ''}>
                <Input type="file" accept="image/*" onChange={onSelfie} />
                <div className="flex items-center gap-3 pt-1">
                  {seller.selfiePreview && <Image src={seller.selfiePreview} alt="selfie" width={64} height={64} className="h-16 w-16 rounded-xl object-cover ring-1 ring-border" />}
                  {!seller.selfiePreview && <span className="text-xs text-muted-foreground">No photo selected</span>}
                </div>
              </Field>
            </div>
            <div className="flex justify-end items-center">
              <Button onClick={()=>setStep(2)} disabled={!isStepValid(1)}>Continue</Button>
            </div>
          </SectionCard>
        )}

        {step===2 && (
          <SectionCard title="Aadhaar Paperless Offline e-KYC" aside={<Badge>UIDAI ZIP</Badge>}>
            <p className="text-sm text-muted-foreground">Download your Aadhaar ZIP from UIDAI and upload it here along with the 4-digit share code you created.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Upload Aadhaar ZIP" required error={!seller.aadhaarZip ? 'Upload ZIP' : ''}>
                <Input type="file" accept=".zip" onChange={onAadhaarZip} />
                {seller.aadhaarZip && <div className="text-xs text-green-700">{seller.aadhaarZip.name}</div>}
              </Field>
              <Field label="Share Code (password)" required error={!(seller.aadhaarShareCode||'').length ? 'Required' : ((seller.aadhaarShareCode||'').length<4?'Min 4 chars':'')}>
                <Input placeholder="4-8 characters" value={seller.aadhaarShareCode} onChange={(e:any)=>setSeller({...seller, aadhaarShareCode:e.target.value})} />
              </Field>
            </div>
             <Button onClick={uploadZipToStorage} disabled={isProcessingZip || !seller.aadhaarZip || (seller.aadhaarShareCode||'').length < 4}>
                {isProcessingZip && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isProcessingZip ? 'Processing...' : 'Upload ZIP'}
            </Button>
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={()=>setStep(1)}>Back</Button>
              <Button onClick={()=>setStep(3)} disabled={!isStepValid(2)}>Continue</Button>
            </div>
          </SectionCard>
        )}

        {step===3 && (
          <SectionCard title="PAN Verification" aside={<Badge>Offline</Badge>}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="PAN Number" required hint="10 characters (ABCDE1234F)" error={!panIsValid(seller.pan) ? (seller.pan? 'Invalid PAN format':'Enter a valid PAN') : ''}>
                <Input maxLength={10} placeholder="ABCDE1234F" value={seller.pan} onChange={(e:any)=>setSeller({...seller, pan:e.target.value.toUpperCase()})} />
              </Field>
            </div>
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={()=>setStep(2)}>Back</Button>
              <Button onClick={()=>setStep(4)} disabled={!isStepValid(3)}>Continue</Button>
            </div>
          </SectionCard>
        )}

        {step===4 && (
          <SectionCard title="Bank Details for Payouts" aside={<Badge>Required</Badge>}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Bank Name" required error={!seller.bankName ? 'Required' : ''}>
                <Input value={seller.bankName} onChange={(e:any)=>setSeller({...seller, bankName:e.target.value})} />
              </Field>
              <Field label="IFSC" required error={!seller.ifsc ? 'Required' : ''}>
                <Input value={seller.ifsc} onChange={(e:any)=>setSeller({...seller, ifsc:e.target.value.toUpperCase()})} />
              </Field>
              <Field label="Account Holder Name" required error={!seller.acctName ? 'Required' : ''}>
                <Input value={seller.acctName} onChange={(e:any)=>setSeller({...seller, acctName:e.target.value})} />
              </Field>
              <Field label="Account Number" required error={!seller.acctNumber ? 'Required' : ''}>
                <Input value={seller.acctNumber} onChange={(e:any)=>setSeller({...seller, acctNumber:e.target.value})} />
              </Field>
            </div>
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={()=>setStep(3)}>Back</Button>
              <Button onClick={()=>setStep(5)} disabled={!isStepValid(4)}>Continue</Button>
            </div>
          </SectionCard>
        )}

        {step===5 && (
          <SectionCard title="Business Details (Optional)">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Seller Type">
                <Select value={seller.sellerType} onValueChange={(v:string)=>setSeller({...seller, sellerType:v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                </Select>
              </Field>
              {seller.sellerType==="business" && (
                <>
                  <Field label="Shop / Brand Name" error={!seller.shopName ? 'Required for business' : ''}>
                    <Input value={seller.shopName} onChange={(e:any)=>setSeller({...seller, shopName:e.target.value})} />
                  </Field>
                  <Field label="GSTIN">
                    <Input value={seller.gst} onChange={(e:any)=>setSeller({...seller, gst:e.target.value.toUpperCase()})} />
                  </Field>
                </>
              )}
              <Field label="Pickup / Business Address" error={!seller.address && (seller.sellerType==='business'?'Required':'')}>
                <Input value={seller.address} onChange={(e:any)=>setSeller({...seller, address:e.target.value})} />
              </Field>
            </div>
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={()=>setStep(4)}>Back</Button>
              <Button onClick={()=>setStep(6)} disabled={!isStepValid(5)}>Continue</Button>
            </div>
          </SectionCard>
        )}
        
        {step===6 && (
          <SectionCard title="Review & Submit" aside={<Badge variant="default">Final Step</Badge>}>
            <div className="grid gap-2 text-sm">
              <h4 className="font-medium">Summary</h4>
              <ul className="list-disc ml-6 text-muted-foreground">
                <li>Name: <span className="font-medium text-foreground">{seller.fullName || '—'}</span></li>
                <li>DOB: {seller.dob || '—'}</li>
                <li>Phone: {seller.phone || '—'}</li>
                <li>Email: {seller.email || '—'}</li>
                <li>PAN: {seller.pan || '—'}</li>
                <li>Bank: {seller.bankName} ({seller.ifsc}) • {seller.acctNumber ? '••' + String(seller.acctNumber).slice(-4) : '—'}</li>
                <li>Type: {seller.sellerType}
                  {seller.sellerType==='business' && <> • {seller.shopName || '—'} • GSTIN: {seller.gst || '—'}</>}
                </li>
              </ul>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">By submitting, you agree to our terms and conditions.</p>
              <Button disabled={!canSubmit} onClick={submit} variant={canSubmit ? "default" : "secondary"}>Submit for Review</Button>
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto grid gap-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">StreamCart • Seller KYC</h1>
        </header>
        <SellerPortal />
      </div>
    </div>
  );
}

    