"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"


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

const mockApps = [
  { id: "APP-1001", name: "Rahul Kumar", submittedAt: Date.now() - (2*60*60*1000), // 2h ago
    pan:"ABCDE1234F", status: "pending", matchScore: 0.93,
    checks: { aadhaarParsed: true, panValid: true, nameMatch: "Strong", faceScore: 0.93 },
    images: { selfie: "https://picsum.photos/seed/selfie1/120", aadhaar: "https://picsum.photos/seed/aadhaar1/120" }
  },
  { id: "APP-1002", name: "Neha Verma", submittedAt: Date.now() - (23*60*60*1000), // 23h ago
    pan:"PQRSX6789L", status: "pending", matchScore: 0.72,
    checks: { aadhaarParsed: true, panValid: true, nameMatch: "Medium", faceScore: 0.72 },
    images: { selfie: "https://picsum.photos/seed/selfie2/120", aadhaar: "https://picsum.photos/seed/aadhaar2/120" }
  },
];

function AdminKycPage() {
  const [apps, setApps] = useState(mockApps);
  const [selected, setSelected] = useState<any | null>(null);
  const slaMs = 24 * 60 * 60 * 1000;

  function action(id: string, kind: string) {
    setApps(prev => prev.map(a => a.id===id ? { ...a, status: kind } : a));
    if (selected?.id === id) setSelected({ ...selected, status: kind });
  }

  const { user, userData, loading } = useAuth();
  if (loading || !userData || userData.role !== 'admin') {
     return <div className="flex h-screen items-center justify-center"><LoadingSpinner /></div>
  }

  return (
    <div className="grid gap-6 p-4 sm:p-8">
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending KYC Approvals</CardTitle>
            <Badge variant="warning">SLA 24h</Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>SLA Remaining</TableHead>
                  <TableHead>Checks</TableHead>
                  <TableHead>Face</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.id}</TableCell>
                    <TableCell>{a.name}</TableCell>
                    <TableCell><Countdown to={a.submittedAt + slaMs} /></TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={a.checks.aadhaarParsed?"success":"destructive"}>Aadhaar</Badge>
                        <Badge variant={a.checks.panValid?"success":"destructive"}>PAN</Badge>
                        <Badge variant={a.matchScore>0.9?"success":a.matchScore>0.75?"warning":"destructive"}>Name {a.checks.nameMatch}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.checks.faceScore>0.8?"success":a.checks.faceScore>0.6?"warning":"destructive"}>{(a.checks.faceScore*100).toFixed(0)}%</Badge>
                    </TableCell>
                    <TableCell>
                      {a.status === 'pending' && <Badge variant="warning">Pending</Badge>}
                      {a.status === 'approved' && <Badge variant="success">Approved</Badge>}
                      {a.status === 'rejected' && <Badge variant="destructive">Rejected</Badge>}
                      {a.status === 'need-info' && <Badge variant="info">Need Info</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={()=>setSelected(a)}>View</Button>
                        <Button size="sm" variant="success" onClick={()=>action(a.id,'approved')}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={()=>action(a.id,'rejected')}>Reject</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {selected && (
          <DialogContent className="max-w-xl">
             <DialogHeader>
                <DialogTitle>Application {selected.id} • {selected.name}</DialogTitle>
                <DialogDescription>
                    Review the details and documents submitted by the seller.
                </DialogDescription>
             </DialogHeader>
            <div className="grid sm:grid-cols-2 gap-4 text-sm py-4">
              <div className="grid gap-1">
                <h4 className="font-medium">KYC Summary</h4>
                <p>Aadhaar Parsed: {selected.checks.aadhaarParsed? 'Yes':'No'}</p>
                <p>PAN Valid: {selected.checks.panValid? 'Yes':'No'}</p>
                <p>Name Match Score: {(selected.matchScore*100).toFixed(0)}%</p>
                <p>Face Match Score: {(selected.checks.faceScore*100).toFixed(0)}%</p>
                <p>SLA Remaining: <Countdown to={selected.submittedAt + slaMs} /></p>
              </div>
              <div className="grid gap-3">
                <h4 className="font-medium">Images</h4>
                <div className="flex items-center gap-4">
                  <div className="grid place-items-center gap-1">
                    <Image src={selected.images?.selfie} alt="selfie" width={80} height={80} className="h-20 w-20 rounded-xl object-cover ring-1" />
                    <span className="text-xs text-muted-foreground">Selfie</span>
                  </div>
                  <div className="grid place-items-center gap-1">
                    <Image src={selected.images?.aadhaar} alt="aadhaar" width={80} height={80} className="h-20 w-20 rounded-xl object-cover ring-1" />
                    <span className="text-xs text-muted-foreground">Aadhaar</span>
                  </div>
                </div>
                <h4 className="font-medium">Actions</h4>
                <div className="flex gap-2">
                  <Button size="sm" variant="success" onClick={()=>action(selected.id,'approved')}>Approve</Button>
                  <Button size="sm" variant="destructive" onClick={()=>action(selected.id,'rejected')}>Reject</Button>
                  <Button size="sm" variant="outline" onClick={()=>action(selected.id,'need-info')}>Request More Info</Button>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground pt-3">Note: Approval enables the seller account immediately. Rejection will block payouts and listing.</p>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

export default AdminKycPage;
