
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { updateUserData } from "@/lib/follow-data";
import { useToast } from "@/hooks/use-toast";
import { SellerHeader } from "@/components/seller/seller-header";

function statusVariant(s: string | undefined) {
  switch (s) {
    case "verified":
      return "success";
    case "rejected":
      return "destructive";
    case "pending":
      return "warning";
    default:
      return "outline";
  }
}
function statusLabel(s: string | undefined) {
  return s ? s.toUpperCase() : "NOT SUBMITTED";
}

export default function KycSettingsPage() {
  const { user, userData, loading } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string>("");
  const [ok, setOk] = useState<string>("");

  // Form state
  const [upiId, setUpiId] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [acct, setAcct] = useState("");
  const [holder, setHolder] = useState("");
  const [status, setStatus] = useState<"pending" | "verified" | "rejected" | "">("");

  // Load existing KYC data from userData
  useEffect(() => {
    if (userData) {
      if (userData.upi?.id) setUpiId(userData.upi.id);
      if (userData.bank?.ifsc) setIfsc(userData.bank.ifsc);
      if (userData.bank?.acct) setAcct(userData.bank.acct);
      if (userData.bank?.name) setHolder(userData.bank.name);
      if (userData.kycStatus) setStatus(userData.kycStatus);
    }
  }, [userData]);

  // Validators
  const upiValid = useMemo(() => /.+@.+/.test(upiId.trim()), [upiId]);
  const ifscValid = useMemo(() => /^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifsc.trim()), [ifsc]);
  const acctValid = useMemo(() => /^\d{6,18}$/.test(acct.trim()), [acct]);
  const holderValid = useMemo(() => holder.trim().length >= 3, [holder]);

  const canSave = upiId
    ? upiValid
    : ifsc && acct && holder && ifscValid && acctValid && holderValid;

  const save = async () => {
    if (!user) return setErr("Please sign in to save KYC");
    if (!canSave) return setErr("Fill either a valid UPI ID or complete bank details");

    setSaving(true);
    setErr("");
    setOk("");
    try {
      const payload: any = {
        kycStatus: status || "pending",
        kycType: upiId ? 'upi' : 'bank',
      };
      if (upiId) payload.upi = { id: upiId.trim() };
      if (ifsc || acct || holder)
        payload.bank = { ifsc: ifsc.trim().toUpperCase(), acct: acct.trim(), name: holder.trim() };

      await updateUserData(user.uid, payload);
      
      toast({
        title: "KYC Information Saved",
        description: "Your details have been submitted for verification.",
      });
      setOk("KYC saved. You can request payouts once verified or as per policy.");
    } catch (e: any) {
      setErr(e.message || "Save failed");
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: e.message || "Could not save KYC details.",
      });
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
        <SellerHeader />
        <main className="p-6 max-w-3xl mx-auto space-y-6 w-full">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">KYC Settings</h1>
                <Badge variant={statusVariant(status)}>{statusLabel(status)}</Badge>
            </div>

            <Card>
                <CardHeader>
                <CardTitle className="text-base">UPI (Recommended)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                <Label htmlFor="upi">UPI ID</Label>
                <Input id="upi" placeholder="yourname@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                <p className="text-xs text-muted-foreground">
                    Example: <code>name@oksbi</code> • If you fill UPI, bank details become optional.
                </p>
                {!upiValid && upiId && <div className="text-xs text-destructive">Enter a valid UPI ID</div>}
                </CardContent>
            </Card>

            <div className="relative text-center">
                <Separator />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">OR</span>
            </div>

            <Card>
                <CardHeader>
                <CardTitle className="text-base">Bank Transfer (NEFT/IMPS)</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-3">
                <div>
                    <Label htmlFor="ifsc">IFSC</Label>
                    <Input id="ifsc" placeholder="HDFC0001234" value={ifsc} onChange={(e) => setIfsc(e.target.value)} />
                    {!ifscValid && ifsc && <div className="text-xs text-destructive">Invalid IFSC format</div>}
                </div>
                <div>
                    <Label htmlFor="acct">Account Number</Label>
                    <Input id="acct" placeholder="123456789012" value={acct} onChange={(e) => setAcct(e.target.value)} />
                    {!acctValid && acct && <div className="text-xs text-destructive">6–18 digits</div>}
                </div>
                <div className="sm:col-span-2">
                    <Label htmlFor="holder">Account Holder Name</Label>
                    <Input id="holder" placeholder="Ganesh Prajapati" value={holder} onChange={(e) => setHolder(e.target.value)} />
                    {!holderValid && holder && <div className="text-xs text-destructive">Enter full name</div>}
                </div>
                <div className="sm:col-span-2 text-xs text-muted-foreground">
                    If you don't provide UPI, these bank fields are required for payouts.
                </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                    Admin may change status to <b>verified</b> after review.
                </div>
                <Button onClick={save} disabled={saving || loading || !canSave}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save KYC
                </Button>
                </CardFooter>
            </Card>

            {err && <div className="text-sm text-destructive">{err}</div>}
        </main>
    </div>
  );
}

