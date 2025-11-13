
"use client";

import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, AlertTriangle, ShieldCheck, UserCheck, ShieldAlert, Image as ImageIcon, ChevronLeft, ChevronRight, User2, Building2, MapPin, Banknote, FileSignature, ClipboardList, Gavel, Loader2, Send } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Image from "next/image";
import { updateUserData, UserData } from "@/lib/follow-data";
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { AdminLayout } from "@/components/admin/admin-layout";

const mockApplications: UserData[] = [
    {
        uid: 'mock-seller-1',
        displayName: 'Retro Finds',
        legalName: 'Retro Finds Co.',
        email: 'retro@example.com',
        phone: '+91 9876543210',
        about: 'Selling unique vintage items from the 70s and 80s.',
        photoURL: 'https://placehold.co/128x128.png?text=R',
        bizType: 'Sole Proprietor',
        regNo: 'U123456789',
        gstin: '27ABCDE1234F1Z5',
        addresses: [{ id: 1, type: 'registered', line1: '123 Vintage Lane', city: 'Mumbai', state: 'Maharashtra', pin: '400001' }],
        pan: 'ABCDE1234F',
        ifsc: 'HDFC0000001',
        accountNo: '123456789012',
        accountName: 'Retro Finds Co.',
        isNipherVerified: true,
        termsAccepted: true,
        verificationStatus: 'pending',
        role: 'seller',
        followers: 120,
        following: 30,
        bio: 'Vintage collectibles and more.',
        location: 'Mumbai, India',
        color: '#ffffff'
    },
    {
        uid: 'mock-seller-2',
        displayName: 'Artisan Crafts',
        legalName: 'Artisan Crafts LLP',
        email: 'artisan@example.com',
        phone: '+91 9876543211',
        about: 'Handmade crafts and home decor items.',
        photoURL: 'https://placehold.co/128x128.png?text=A',
        bizType: 'Partnership',
        regNo: 'LLP98765',
        gstin: '29HIJKL5678G1Z9',
        addresses: [{ id: 1, type: 'registered', line1: '456 Craft Avenue', city: 'Bengaluru', state: 'Karnataka', pin: '560001' }],
        pan: 'GHIJK5678L',
        ifsc: 'ICIC0000002',
        accountNo: '987654321098',
        accountName: 'Artisan Crafts LLP',
        isNipherVerified: false,
        termsAccepted: true,
        verificationStatus: 'pending',
        role: 'seller',
        followers: 450,
        following: 80,
        bio: 'Unique handmade goods.',
        location: 'Bengaluru, India',
        color: '#ffffff'
    },
];


const steps = [
  { key: "basic", label: "Basic Info", icon: <User2 className="w-5 h-5"/> },
  { key: "biz", label: "Business", icon: <Building2 className="w-5 h-5"/> },
  { key: "address", label: "Address", icon: <MapPin className="w-5 h-5"/> },
  { key: "bank", label: "Tax & Bank", icon: <Banknote className="w-5 h-5"/> },
  { key: "kyc", label: "Identity (0DIDit)", icon: <ShieldCheck className="w-5 h-5"/> },
  { key: "policies", label: "Policies & Preview", icon: <ClipboardList className="w-5 h-5"/> },
];

function AdminPanel() {
  const [applications, setApplications] = useState<UserData[]>([]);
  const [currentAppIndex, setCurrentAppIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [finalDecision, setFinalDecision] = useState<string | null>(null);
  const [tab, setTab] = useState("basic");
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    // Use mock data for now
    setApplications(mockApplications);
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleDecision = async (decision: { type: string, reason?: string }) => {
    const application = applications[currentAppIndex];
    if (!application) return;

    let status;
    let toastTitle = "";
    let toastDescription = "";
    
    switch (decision.type) {
      case "APPROVE":
        status = "verified";
        toastTitle = "Application Approved";
        toastDescription = `${application.displayName} is now a verified seller.`;
        break;
      case "REJECT":
        status = "rejected";
        toastTitle = "Application Rejected";
        toastDescription = `The application for ${application.displayName} has been rejected.`;
        break;
      case "FIX":
        status = "needs-resubmission";
        toastTitle = "Fixes Requested";
        toastDescription = `A request for more information has been sent to ${application.displayName}.`;
        break;
      default:
        return;
    }
    
    setFinalDecision(status);
    
    try {
        await updateUserData(application.uid, { 
            verificationStatus: status, 
            rejectionReason: decision.type === 'REJECT' ? reason : undefined,
            resubmissionReason: decision.type === 'FIX' ? reason : undefined,
        });
        toast({ title: toastTitle, description: toastDescription });
    } catch (error) {
        console.error("Error updating user status:", error);
        toast({ variant: 'destructive', title: "Update Failed", description: "Could not update the seller's status." });
        setFinalDecision(null); // Revert UI on failure
    }
  };
  
  const nextApplication = () => {
    setFinalDecision(null);
    setReason('');
    setCurrentAppIndex(prev => (prev + 1) % applications.length);
     if (currentAppIndex >= applications.length - 1) {
        fetchApplications(); // Refresh list when we're at the end
    }
  }

  if (isLoading) {
    return <Card className="rounded-2xl flex items-center justify-center p-12"><LoadingSpinner /></Card>;
  }

  if (applications.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardHeader><CardTitle>Seller Applications</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-center py-12 text-muted-foreground">No applications pending review.</div>
        </CardContent>
      </Card>
    );
  }
  
  const application = applications[currentAppIndex];
  if (!application) {
     return (
      <Card className="rounded-2xl">
        <CardHeader><CardTitle>Seller Applications</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-center py-12 text-muted-foreground">No more applications to review.</div>
           <Button onClick={fetchApplications}>Refresh</Button>
        </CardContent>
      </Card>
    );
  }

  const isNipherVerified = application.isNipherVerified;

  if (finalDecision) {
      return (
           <Card className="rounded-2xl border-green-200 bg-green-50 text-center py-12">
            <CardHeader className="pb-2">
                <Check className="mx-auto h-12 w-12 text-green-600"/>
                <CardTitle>Application {finalDecision.toUpperCase()}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
                <p>The decision has been recorded for {application.displayName}.</p>
                <Button variant="link" onClick={nextApplication}>Review another</Button>
            </CardContent>
          </Card>
      )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
          <Button onClick={() => setCurrentAppIndex(prev => Math.max(0, prev - 1))} disabled={currentAppIndex === 0}>
              <ChevronLeft className="w-4 h-4 mr-2"/> Previous
          </Button>
          <span className="text-sm text-muted-foreground">Viewing {currentAppIndex + 1} of {applications.length}</span>
           <Button onClick={() => setCurrentAppIndex(prev => Math.min(applications.length - 1, prev + 1))} disabled={currentAppIndex === applications.length - 1}>
               Next <ChevronRight className="w-4 h-4 ml-2"/>
          </Button>
      </div>
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Seller Review — {application.displayName || application.legalName || "Untitled"}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">PENDING</Badge>
              {isNipherVerified ? (
                <Badge className="bg-green-600 text-white">0DIDit Verified</Badge>
              ) : (
                <Badge variant="destructive">0DIDit: Needs attention</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Applicant Photo</div>
              <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center overflow-hidden relative">
                  {application.photoURL ? (
                      <Image src={application.photoURL} alt="Seller photo" layout="fill" className="object-cover" />
                  ) : (
                      <ImageIcon className="w-10 h-10 text-muted-foreground"/>
                  )}
              </div>
              <div className="text-sm text-muted-foreground pt-4">Applicant Details</div>
              <div className="text-lg font-semibold">{application.legalName || "—"}</div>
              <div className="text-sm">{application.email} • {application.phone}</div>
              <div className="text-sm">PAN: {application.pan || "—"}</div>
              <div className="text-sm">IFSC: {application.ifsc || "—"}</div>
            </div>
            <div className="lg:col-span-2">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="flex flex-wrap h-auto">
                    {steps.map(s => <TabsTrigger key={s.key} value={s.key}>{s.icon}{s.label}</TabsTrigger>)}
                </TabsList>
                <TabsContent value="basic" className="pt-4 text-sm space-y-2">
                  <div>Legal Name: {application.legalName || "—"}</div>
                  <div>Shop Name: {application.displayName || "—"}</div>
                  <div>About: {application.about || "—"}</div>
                </TabsContent>
                <TabsContent value="biz" className="pt-4 text-sm space-y-2">
                  <div>Type: {application.bizType}</div>
                  <div>Reg No: {application.regNo || "—"}</div>
                  <div>GSTIN: {application.gstin || "—"}</div>
                </TabsContent>
                <TabsContent value="address" className="pt-4 text-sm space-y-2">
                  {application.addresses.map((addr: any) => (
                      <div key={addr.id}>
                          <p className="font-semibold capitalize">{addr.type} Address:</p>
                          <p>{addr.line1}, {addr.city}, {addr.state} - {addr.pin}</p>
                      </div>
                  ))}
                </TabsContent>
                <TabsContent value="bank" className="pt-4 text-sm space-y-2">
                  <div>Account No: {application.accountNo || "—"}</div>
                  <div>IFSC: {application.ifsc || "—"}</div>
                  <div>Account Holder: {application.accountName || "—"}</div>
                  <div>PAN: {application.pan || "—"}</div>
                </TabsContent>
                <TabsContent value="kyc" className="pt-4 text-sm space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <ShieldCheck className="w-4 h-4"/>
                    <span>0DIDit Verification: {isNipherVerified ? "Completed" : "Not Completed"}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Full KYC data from 0DIDit is not stored. Only the verification status is recorded.</div>
                </TabsContent>
                <TabsContent value="policies" className="pt-4 text-sm space-y-3">
                    <div>Auctions: {application.auctionEnabled ? 'Enabled' : 'Disabled'}</div>
                    <div>Terms Accepted: {application.termsAccepted ? 'Yes' : 'No'}</div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="pb-2"><CardTitle>Decision</CardTitle></CardHeader>
        <CardContent className="space-y-3">
            <Textarea placeholder="Reason / notes (required for Fix/Reject)" value={reason} onChange={(e)=>setReason(e.target.value)}/>
             <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={()=>handleDecision({ type: "FIX", reason })} disabled={!reason}><AlertTriangle className="w-4 h-4 mr-2"/>Request Fix</Button>
                    <Button variant="destructive" onClick={()=>handleDecision({ type: "REJECT", reason })} disabled={!reason}><ShieldAlert className="w-4 h-4 mr-2"/>Reject</Button>
                    <Button onClick={()=>handleDecision({ type: "APPROVE" })}><UserCheck className="w-4 h-4 mr-2"/>Approve</Button>
                </div>
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
        return <AdminLayout><div className="flex items-center justify-center flex-1 p-8"><LoadingSpinner /></div></AdminLayout>
    }

    if (!user || userData?.role !== 'admin') {
        router.push('/');
        return null;
    }

  return (
    <AdminLayout>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <AdminPanel />
      </main>
    </AdminLayout>
  );
}
