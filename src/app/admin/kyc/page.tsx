
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, AlertTriangle, ShieldCheck, UserCheck, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const SELLER_APP_SUBMITTED_KEY = "sellerAppSubmitted";

function AdminPanel() {
  const [application, setApplication] = useState<any | null>(null);
  const [finalDecision, setFinalDecision] = useState<string | null>(null);
  const [tab, setTab] = useState("basic");
  const [reason, setReason] = useState("");

  useEffect(() => {
    const submittedApp = localStorage.getItem(SELLER_APP_SUBMITTED_KEY);
    if (submittedApp) {
      setApplication(JSON.parse(submittedApp));
    }
  }, []);

  const handleDecision = (decision: { type: string, reason?: string }) => {
    if (!application) return;

    let status;
    if (decision.type === "APPROVE") status = "APPROVED";
    if (decision.type === "REJECT") status = "REJECTED";
    if (decision.type === "FIX") status = "NEEDS_FIX";
    
    setFinalDecision(status || null);
    // In a real app, this would update a backend. Here we just show the decision.
  };

  if (!application) {
    return (
      <Card className="rounded-2xl">
        <CardHeader><CardTitle>Seller Applications</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-center py-12 text-muted-foreground">No applications pending review.</div>
        </CardContent>
      </Card>
    );
  }

  const { payload, verif } = application;

  if (finalDecision) {
      return (
           <Card className="rounded-2xl border-green-200 bg-green-50 text-center py-12">
            <CardHeader className="pb-2">
                <Check className="mx-auto h-12 w-12 text-green-600"/>
                <CardTitle>Application {finalDecision}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
                <p>The decision has been recorded for {payload.displayName}.</p>
                <Button variant="link" onClick={() => {
                    setApplication(null);
                    setFinalDecision(null);
                    localStorage.removeItem(SELLER_APP_SUBMITTED_KEY);
                }}>Review another</Button>
            </CardContent>
          </Card>
      )
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Seller Review — {payload.displayName || payload.legalName || "Untitled"}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">SUBMITTED</Badge>
              {verif.state === "VERIFIED" ? (
                <Badge className="bg-green-600">e‑KYC: Signature valid</Badge>
              ) : (
                <Badge variant="destructive">e‑KYC: Needs attention</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Applicant</div>
              <div className="text-lg font-semibold">{payload.legalName || "—"}</div>
              <div className="text-sm">{payload.email} • {payload.phone}</div>
              <div className="text-sm">PAN: {payload.pan || "—"}</div>
              <div className="text-sm">IFSC: {payload.ifsc || "—"}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {verif.state === "VERIFIED" ? <Badge className="bg-green-600">Signature Valid</Badge> : <Badge variant="destructive">Invalid/Unverified</Badge>}
                <Badge variant="secondary">Auctions {payload.auctionEnabled ? "On" : "Off"}</Badge>
              </div>
            </div>
            <div className="lg:col-span-2">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="flex flex-wrap h-auto">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="business">Business</TabsTrigger>
                  <TabsTrigger value="address">Address</TabsTrigger>
                  <TabsTrigger value="bank">Tax & Bank</TabsTrigger>
                  <TabsTrigger value="kyc">Identity/KYC</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="pt-4 text-sm space-y-2">
                  <div>Legal: {payload.legalName || "—"}</div>
                  <div>Shop: {payload.displayName || "—"}</div>
                  <div>About: {payload.about || "—"}</div>
                </TabsContent>
                <TabsContent value="business" className="pt-4 text-sm space-y-2">
                  <div>Type: {payload.bizType}</div>
                  <div>Reg No: {payload.regNo || "—"}</div>
                  <div>GSTIN: {payload.gstin || "—"}</div>
                </TabsContent>
                <TabsContent value="address" className="pt-4 text-sm space-y-2">
                  <div>Registered: {payload.regAddr.line1 || ""} {payload.regAddr.city || ""} {payload.regAddr.state || ""} {payload.regAddr.pin || ""}</div>
                </TabsContent>
                <TabsContent value="bank" className="pt-4 text-sm space-y-2">
                  <div>Account: {payload.accountNo || "—"}</div>
                  <div>IFSC: {payload.ifsc || "—"}</div>
                  <div>Holder: {payload.accountName || "—"}</div>
                </TabsContent>
                <TabsContent value="kyc" className="pt-4 text-sm space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <ShieldCheck className="w-4 h-4"/>
                    <span>UIDAI Signature: {verif.state === "VERIFIED" ? "Valid" : "Invalid/Unknown"}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">(Demo) For production, store only last 4 digits & the reference ID; delete raw ZIP within 24 hours.</div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="pb-2"><CardTitle>Decision</CardTitle></CardHeader>
        <CardContent className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <Input placeholder="Reason / notes (required for Fix/Reject)" value={reason} onChange={(e)=>setReason(e.target.value)} className="md:flex-1"/>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={()=>handleDecision({ type: "FIX", reason })}><AlertTriangle className="w-4 h-4 mr-2"/>Request Fix</Button>
            <Button variant="destructive" onClick={()=>handleDecision({ type: "REJECT", reason })}><ShieldAlert className="w-4 h-4 mr-2"/>Reject</Button>
            <Button onClick={()=>handleDecision({ type: "APPROVE" })}><UserCheck className="w-4 h-4 mr-2"/>Approve</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function AdminKycPage() {
    const { user, userData, loading } = useAuth();
    const router = useRouter();

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>
    }

    if (!user || userData?.role !== 'admin') {
        router.push('/');
        return null;
    }

  return (
    <div className="min-h-screen p-6 md:p-10 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Admin KYC Review</h1>
            <p className="text-sm text-muted-foreground">Review and approve new seller applications.</p>
          </div>
        </div>
        <AdminPanel />
      </div>
    </div>
  );
}

