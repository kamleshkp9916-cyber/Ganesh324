
"use client";

import React, { useMemo, useState, useEffect } from "react";
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

function Field({ label, hint, children, required }: { label: string, hint?: string, children: React.ReactNode, required?: boolean }) {
  return (
    <div className="grid gap-1.5">
      <Label>
        {label}{required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
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
  selfieFile: null,
  selfiePreview: "",
  aadhaarZip: null,
  aadhaarShareCode: "",
  aadhaarPhotoUrl: "",
  faceMatchScore: 0,
  faceMatchStatus: "pending" as "pending" | "passed" | "failed",
  pan: "",
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

  const canSubmit = useMemo(() => {
    const p = seller.fullName && seller.dob && seller.phone && seller.email && seller.selfieFile;
    const a = seller.aadhaarZip && seller.aadhaarShareCode?.length >= 4 && seller.aadhaarPhotoUrl;
    const f = seller.faceMatchStatus === 'passed' && seller.faceMatchScore >= 0.8;
    const k = seller.pan?.length === 10;
    const b = seller.bankName && seller.ifsc && seller.acctName && seller.acctNumber;
    return p && a && f && k && b;
  }, [seller]);

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

  async function runFaceMatch(){
    const score = Math.max(0, Math.min(1, 0.75 + Math.random()*0.25));
    setSeller((s: any)=>({...s, faceMatchScore: score, faceMatchStatus: score>=0.8?'passed':'failed'}));
  }

  function submit() {
    setSubmittedAt(Date.now());
    setTimeout(() => {
        router.push('/seller/verification-pending');
    }, 1500);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 grid gap-5 self-start sticky top-24">
        <SectionCard title="KYC Progress">
          <div className="space-y-4">
            <Step n={1} title="Personal Details" done={step>1} current={step===1} />
            <Step n={2} title="Aadhaar Offline e-KYC" done={step>2} current={step===2} />
            <Step n={3} title="PAN Verification" done={step>3} current={step===3} />
            <Step n={4} title="Bank Details" done={step>4} current={step===4} />
            <Step n={5} title="Business (Optional)" done={step>5} current={step===5} />
            <Step n={6} title="Review & Submit" done={submittedAt !== null} current={step===6} />
          </div>
        </SectionCard>

        <SectionCard title="Store Hours" aside={<Badge variant="outline">24 x 7</Badge>}>
          <div className="flex items-center justify-between">
            <div className="grid">
              <div className="font-medium">Open 24 hours</div>
              <p className="text-xs text-muted-foreground">Your store will appear as open all day</p>
            </div>
            <Switch checked={seller.open24x7} onCheckedChange={(v)=>setSeller((s: any)=>({...s, open24x7:v}))} aria-label="Toggle 24x7 hours" />
          </div>
        </SectionCard>

        {submittedAt && (
          <SectionCard title="Review Status" aside={<Badge variant="warning">Under Review</Badge>}>
            <div className="text-sm text-muted-foreground">Admin will review your details within 24 hours.</div>
            <div className="text-sm">Time remaining: <Countdown to={submittedAt + slaMs} /></div>
          </SectionCard>
        )}
      </div>

      <div className="lg:col-span-2 grid gap-6">
        {step===1 && (
          <SectionCard title="Personal Details">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name (as per Aadhaar)" required>
                <Input value={seller.fullName} onChange={e=>setSeller({...seller, fullName:e.target.value})} placeholder="e.g. RAHUL KUMAR" />
              </Field>
              <Field label="Date of Birth" required>
                <Input type="date" value={seller.dob} onChange={e=>setSeller({...seller, dob:e.target.value})} />
              </Field>
              <Field label="Phone (OTP verified)" required>
                <Input type="tel" placeholder="10-digit mobile" value={seller.phone} onChange={e=>setSeller({...seller, phone:e.target.value})} />
              </Field>
              <Field label="Email" required>
                <Input type="email" placeholder="name@example.com" value={seller.email} onChange={e=>setSeller({...seller, email:e.target.value})} />
              </Field>
              <Field label="Profile Photo (Selfie)" hint="Clear face, no sunglasses" required>
                <Input type="file" accept="image/*" onChange={onSelfie} />
                <div className="flex items-center gap-3 pt-1">
                  {seller.selfiePreview && <Image src={seller.selfiePreview} alt="selfie" width={64} height={64} className="h-16 w-16 rounded-xl object-cover ring-1 ring-border" />}
                  {!seller.selfiePreview && <span className="text-xs text-muted-foreground">No photo selected</span>}
                </div>
              </Field>
            </div>
            <div className="flex justify-end">
              <Button onClick={()=>setStep(2)}>Continue</Button>
            </div>
          </SectionCard>
        )}

        {step===2 && (
          <SectionCard title="Aadhaar Paperless Offline e-KYC" aside={<Badge variant="outline">UIDAI ZIP</Badge>}>
            <p className="text-sm text-muted-foreground">Download your Aadhaar ZIP from UIDAI and upload it here. Use your 4-character share code.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Upload Aadhaar ZIP" required>
                <Input type="file" accept=".zip" onChange={onAadhaarZip} />
                {seller.aadhaarZip && <div className="text-xs text-green-700">{seller.aadhaarZip.name}</div>}
              </Field>
              <Field label="Share Code (password)" required>
                <Input placeholder="4-8 characters" value={seller.aadhaarShareCode} onChange={e=>setSeller({...seller, aadhaarShareCode:e.target.value})} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Aadhaar Photo (parsed)">
                {seller.aadhaarPhotoUrl ? (
                  <Image src={seller.aadhaarPhotoUrl} alt="aadhaar" width={64} height={64} className="h-16 w-16 rounded-xl object-cover ring-1 ring-border" />
                ) : (
                  <Button variant="secondary" onClick={()=>setSeller((s: any)=>({...s, aadhaarPhotoUrl: s.aadhaarPhotoUrl || s.selfiePreview || ''}))}>Fetch from ZIP (demo)</Button>
                )}
              </Field>
              <Field label="Face Match" hint="Selfie must match Aadhaar photo">
                <div className="flex items-center gap-3">
                  <Button onClick={runFaceMatch}>Run Face Match</Button>
                  {seller.faceMatchScore>0 && (
                    <Badge variant={seller.faceMatchStatus==='passed'?'success':'destructive'}>
                      Score {(seller.faceMatchScore*100).toFixed(0)}% {seller.faceMatchStatus==='passed'?'Matched':'Not matched'}
                    </Badge>
                  )}
                </div>
              </Field>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={()=>setStep(1)}>Back</Button>
              <Button onClick={()=>setStep(3)}>Continue</Button>
            </div>
          </SectionCard>
        )}

        {step===3 && (
          <SectionCard title="PAN Verification" aside={<Badge variant="outline">Instant</Badge>}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="PAN Number" required hint="10 characters (ABCDE1234F)">
                <Input maxLength={10} placeholder="ABCDE1234F" value={seller.pan} onChange={e=>setSeller({...seller, pan:e.target.value.toUpperCase()})} />
              </Field>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={()=>setStep(2)}>Back</Button>
              <Button onClick={()=>setStep(4)}>Continue</Button>
            </div>
          </SectionCard>
        )}

        {step===4 && (
          <SectionCard title="Bank Details for Payouts" aside={<Badge variant="outline">Required</Badge>}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Bank Name" required>
                <Input value={seller.bankName} onChange={e=>setSeller({...seller, bankName:e.target.value})} />
              </Field>
              <Field label="IFSC" required>
                <Input value={seller.ifsc} onChange={e=>setSeller({...seller, ifsc:e.target.value.toUpperCase()})} />
              </Field>
              <Field label="Account Holder Name" required>
                <Input value={seller.acctName} onChange={e=>setSeller({...seller, acctName:e.target.value})} />
              </Field>
              <Field label="Account Number" required>
                <Input value={seller.acctNumber} onChange={e=>setSeller({...seller, acctNumber:e.target.value})} />
              </Field>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={()=>setStep(3)}>Back</Button>
              <Button onClick={()=>setStep(5)}>Continue</Button>
            </div>
          </SectionCard>
        )}

        {step===5 && (
          <SectionCard title="Business Details (Optional)">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Seller Type">
                <Select value={seller.sellerType} onValueChange={(v)=>setSeller({...seller, sellerType:v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                </Select>
              </Field>
              {seller.sellerType==="business" && (
                <>
                  <Field label="Shop / Brand Name">
                    <Input value={seller.shopName} onChange={e=>setSeller({...seller, shopName:e.target.value})} />
                  </Field>
                  <Field label="GSTIN">
                    <Input value={seller.gst} onChange={e=>setSeller({...seller, gst:e.target.value.toUpperCase()})} />
                  </Field>
                </>
              )}
              <Field label="Pickup / Business Address">
                <Input value={seller.address} onChange={e=>setSeller({...seller, address:e.target.value})} />
              </Field>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={()=>setStep(4)}>Back</Button>
              <Button onClick={()=>setStep(6)}>Continue</Button>
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
                <li>Face Match: {seller.faceMatchScore>0 ? `${(seller.faceMatchScore*100).toFixed(0)}% (${seller.faceMatchStatus})` : '—'}</li>
                <li>Bank: {seller.bankName} ({seller.ifsc}) • {seller.acctNumber ? '••' + String(seller.acctNumber).slice(-4) : '—'}</li>
                <li>Type: {seller.sellerType}
                  {seller.sellerType==='business' && <> • {seller.shopName || '—'} • GSTIN: {seller.gst || '—'}</>}
                </li>
                <li>Open 24x7: {seller.open24x7? 'Yes':'No'}</li>
              </ul>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">By submitting, you agree to verification of Aadhaar Offline e-KYC and PAN.</p>
              <Button disabled={!canSubmit} onClick={submit}>Submit for Review</Button>
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("seller");
  
  return (
    <div className="min-h-screen bg-muted/40 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto grid gap-6">
        <header className="flex items-center justify-between">
            <Button asChild variant="ghost">
                <Link href="/seller/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
                </Link>
            </Button>
            <h1 className="text-2xl font-bold text-center">Seller Verification</h1>
             <div className="w-48"></div>
        </header>

        <SellerPortal />

        <footer className="text-xs text-muted-foreground text-center pt-4">This is a static preview. Wire it to your backend APIs to enable real verification and approvals.</footer>
      </div>
    </div>
  );
}
