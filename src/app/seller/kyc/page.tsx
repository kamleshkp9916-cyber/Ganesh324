
"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Check, AlertTriangle, Upload, ChevronLeft, ChevronRight, ShieldCheck, Building2, User2, MapPin, Banknote, FileSignature, ClipboardList, Eye, UserCheck, ShieldAlert, Gavel } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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

// ------------------------------------------------------------
// Seller Wizard
// ------------------------------------------------------------
const steps = [
  { key: "basic", label: "Basic Info", icon: <User2 className="w-5 h-5"/> },
  { key: "biz", label: "Business", icon: <Building2 className="w-5 h-5"/> },
  { key: "addr", label: "Address", icon: <MapPin className="w-5 h-5"/> },
  { key: "bank", label: "Tax & Bank", icon: <Banknote className="w-5 h-5"/> },
  { key: "kyc", label: "Identity (Offline e‑KYC)", icon: <ShieldCheck className="w-5 h-5"/> },
  { key: "policies", label: "Policies & Preview", icon: <ClipboardList className="w-5 h-5"/> },
];

const SELLER_APP_DRAFT_KEY = "sellerAppDraft";
const SELLER_APP_SUBMITTED_KEY = "sellerAppSubmitted";

function SellerWizard({ onSubmit }: { onSubmit: (data: any) => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [current, setCurrent] = useState(0);
  const [form, setForm] = useState({
    legalName: "",
    displayName: "",
    email: user?.email || "",
    phone: "",
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
    aadhaarZip: null,
    shareCode: "",
    selfie: null,
    termsAccepted: false,
  });
  const [verif, setVerif] = useState({ state: "IDLE", message: "" });

  useEffect(() => {
    const draft = localStorage.getItem(SELLER_APP_DRAFT_KEY);
    if (draft) {
      setForm(JSON.parse(draft));
    }
  }, []);

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
      localStorage.setItem(SELLER_APP_DRAFT_KEY, JSON.stringify(clone));
      return clone;
    });
  };

  const next = () => setCurrent((c) => Math.min(c + 1, steps.length - 1));
  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  const canSubmit = form.termsAccepted && verif.state === "VERIFIED";

  const fakeVerifyAadhaar = async () => {
    // purely client-side mock to simulate offline e‑KYC ZIP + share code verification
    if (!form.aadhaarZip || !form.shareCode || form.shareCode.length !== 4) {
      setVerif({ state: "ERROR", message: "Please upload the ZIP and enter the 4‑digit Share Code." });
      return;
    }
    setVerif({ state: "VERIFYING", message: "Verifying UIDAI signature…" });
    setTimeout(() => {
      // Mock rule: if share code ends with even number → VERIFIED else MISMATCH
      const ok = Number(form.shareCode.at(-1)) % 2 === 0;
      setVerif({ state: ok ? "VERIFIED" : "INVALID_SIGNATURE", message: ok ? "Signature valid. Fields parsed." : "Signature invalid. Re‑download from myAadhaar." });
       toast({
        title: ok ? "Aadhaar Verified" : "Verification Failed",
        description: ok ? "Your Aadhaar details were successfully parsed." : "The signature on the file could not be validated.",
        variant: ok ? "default" : "destructive",
      });
    }, 900);
  };

  const submit = () => {
    localStorage.setItem(SELLER_APP_SUBMITTED_KEY, JSON.stringify({ status: "SUBMITTED", payload: form, verif }));
    localStorage.removeItem(SELLER_APP_DRAFT_KEY);
    onSubmit({ status: "SUBMITTED", payload: form, verif });
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
            <div className="flex items-center gap-2 text-sm"><Badge>Draft</Badge><span>Autosaves enabled</span></div>
            <div className="text-xs text-muted-foreground">You can submit after finishing KYC and accepting terms.</div>
          </CardContent>
        </Card>
      </div>

      <div className="xl:col-span-3">
        <AnimatePresence mode="popLayout">
          <motion.div key={current} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            {steps[current].key === "basic" && (
              <Section title="Basic Info" icon={<User2 className="w-5 h-5"/>}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm">Legal name</label>
                    <Input value={form.legalName} onChange={(e)=>setField("legalName", e.target.value)} placeholder="As per ID"/>
                  </div>
                  <div>
                    <label className="text-sm">Shop display name</label>
                    <Input value={form.displayName} onChange={(e)=>setField("displayName", e.target.value)} placeholder="Unique store name"/>
                  </div>
                  <div>
                    <label className="text-sm">Email</label>
                    <Input value={form.email} onChange={(e)=>setField("email", e.target.value)} placeholder="you@shop.com"/>
                  </div>
                  <div>
                    <label className="text-sm">Phone</label>
                    <Input value={form.phone} onChange={(e)=>setField("phone", e.target.value)} placeholder="10‑digit mobile"/>
                  </div>
                  <div className="md:col-span-2">
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
                    <Input value={form.supportPhone} onChange={(e)=>setField("supportPhone", e.target.value)} placeholder="For buyers"/>
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
                      <Input placeholder="PIN" value={form.regAddr.pin} onChange={(e)=>setField("regAddr.pin", e.target.value)}/>
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
                          <Input placeholder="PIN" value={form.pickupAddr.pin} onChange={(e)=>setField("pickupAddr.pin", e.target.value)}/>
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
                    <Input value={form.accountNo} onChange={(e)=>setField("accountNo", e.target.value)} placeholder=""/>
                  </div>
                  <div>
                    <label className="text-sm">IFSC</label>
                    <Input value={form.ifsc} onChange={(e)=>setField("ifsc", e.target.value.toUpperCase())} placeholder="HDFC0000001"/>
                  </div>
                </div>
              </Section>
            )}

            {steps[current].key === "kyc" && (
              <Section title="Identity — Aadhaar Offline e‑KYC" icon={<ShieldCheck className="w-5 h-5"/>}>
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-gray-50 text-sm">
                    Download your <strong>Aadhaar Offline e‑KYC ZIP</strong> from myAadhaar, set a <strong>4‑digit Share Code</strong>, then upload it below.
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm">Upload Aadhaar e‑KYC ZIP</label>
                      <div className="border rounded-xl p-4 flex items-center justify-between">
                        <Input type="file" accept=".zip" onChange={(e)=>setField("aadhaarZip", e.target.files?.[0] || null)} />
                        <Button variant="secondary" className="ml-3"><Upload className="w-4 h-4 mr-2"/>Upload</Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm">4‑digit Share Code</label>
                      <Input value={form.shareCode} maxLength={4} onChange={(e)=>setField("shareCode", e.target.value.replace(/[^0-9]/g, ""))} placeholder="e.g., 1234"/>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={!!form.selfie} onCheckedChange={(v)=>{ if(!v) setField("selfie", null); else setField("selfie", { name: "selfie.jpg"}); }} />
                    <span className="text-sm">Add selfie (optional for face match later)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button onClick={fakeVerifyAadhaar}><ShieldCheck className="w-4 h-4 mr-2"/>Verify e‑KYC</Button>
                    {verif.state === "VERIFYING" && <Badge variant="secondary">Verifying…</Badge>}
                    {verif.state === "VERIFIED" && <Badge className="bg-green-600">Signature valid</Badge>}
                    {verif.state === "INVALID_SIGNATURE" && <Badge variant="destructive">Invalid signature</Badge>}
                    {verif.state === "ERROR" && <Badge variant="destructive">{verif.message}</Badge>}
                  </div>
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
                    <span>I accept the Terms & Policies</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Preview your storefront card with name and bio.</div>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="secondary"><Eye className="w-4 h-4 mr-2"/>Preview</Button>
                      </SheetTrigger>
                      <SheetContent className="w-[500px]">
                        <SheetHeader>
                          <SheetTitle>Storefront Preview</SheetTitle>
                        </SheetHeader>
                        <div className="mt-4 space-y-2">
                          <div className="text-lg font-semibold">{form.displayName || "Your Shop"}</div>
                          <div className="text-sm text-muted-foreground">{form.about || "Tell buyers what you sell"}</div>
                          <div className="mt-3"><Badge>Auctions {form.auctionEnabled ? "On" : "Off"}</Badge></div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </Section>
            )}
             <div className="flex items-center justify-end">
              <div className="flex items-center gap-3">
                {current < steps.length - 1 && (
                  <Button onClick={next}>Next<ChevronRight className="w-4 h-4 ml-2"/></Button>
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
    </div>
  );
}

export default function KYCPage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleSubmission = (data: any) => {
        console.log("Seller Application Submitted:", data);
        router.push('/admin/kyc'); 
    };

    if (loading || !isClient) {
        return <div className="min-h-screen p-6 md:p-10 flex items-center justify-center"><LoadingSpinner /></div>;
    }
    
    // This case handles a logged-out user or a customer.
    // The wizard should be displayed.
    return (
        <div className="min-h-screen p-6 md:p-10 bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto space-y-6">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-4">
                  <ChevronLeft className="w-4 h-4 mr-2"/>Back
                </Button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Become a Seller</h1>
                        <p className="text-sm text-muted-foreground">Complete the following steps to start selling on StreamCart.</p>
                    </div>
                </div>
                <SellerWizard onSubmit={handleSubmission} />
            </div>
        </div>
    );
}
