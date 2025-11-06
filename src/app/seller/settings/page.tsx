"use client"

import {
  ShieldCheck,
  Menu,
  Banknote,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import React, { useState, useEffect } from "react"
import { format } from "date-fns"
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from "firebase/firestore";

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SellerHeader } from "@/components/seller/seller-header"
import { getFirestoreDb } from "@/lib/firebase"


export default function SellerSettingsPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast()
  
  const [isMounted, setIsMounted] = useState(false);
  const [payoutRequests, setPayoutRequests] = useState<any[]>([]);
  const [isLoadingPayouts, setIsLoadingPayouts] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;

    setIsLoadingPayouts(true);
    const db = getFirestoreDb();
    const q = query(
      collection(db, "payouts"), 
      where("sellerId", "==", user.uid),
      orderBy("requestedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        requestedAt: doc.data().requestedAt.toDate()
      }));
      setPayoutRequests(requests);
      setIsLoadingPayouts(false);
    });

    return () => unsubscribe();
  }, [user]);

  
  if (!isMounted || loading || !userData) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>
  }

  const isSeller = userData?.role === 'seller';

  if (!isSeller) {
      router.replace('/live-selling');
      return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>
  }

  return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <SellerHeader />
            <main className="grid flex-1 items-start gap-8 p-4 sm:px-6 md:p-8">
                 {isSeller && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Banknote /> Payout & KYC Settings</CardTitle>
                            <CardDescription>Manage your payout bank accounts and complete your KYC.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <p className="text-sm text-muted-foreground">
                                Your KYC status is: <Badge variant={userData.kycStatus === 'verified' ? 'success' : 'warning'}>{userData.kycStatus || 'Not Submitted'}</Badge>.
                                You must have verified KYC details to withdraw funds.
                           </p>
                        </CardContent>
                         <CardFooter className="border-t pt-6">
                            <Button asChild>
                                <Link href="/seller/settings/kyc">Manage KYC & Bank Details</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                 )}
                 <Card>
                      <CardHeader>
                          <CardTitle>Payout History</CardTitle>
                          <CardDescription>Review your past and pending withdrawal requests.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead>Date</TableHead>
                                      <TableHead>Amount</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead>Payout Date</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {isLoadingPayouts ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            <LoadingSpinner />
                                        </TableCell>
                                    </TableRow>
                                  ) : payoutRequests.length > 0 ? payoutRequests.map(request => (
                                      <TableRow key={request.id}>
                                          <TableCell>{format(new Date(request.requestedAt), "dd MMM, yyyy")}</TableCell>
                                          <TableCell>₹{request.amount.toFixed(2)}</TableCell>
                                          <TableCell>
                                            <Badge variant={
                                                request.status === 'paid' ? 'success' :
                                                request.status === 'pending' ? 'warning' : 'destructive'
                                            }>
                                                {request.status}
                                            </Badge>
                                          </TableCell>
                                          <TableCell>
                                            {request.status === 'paid' && request.payoutDate ? (
                                                <span className="text-xs text-muted-foreground">
                                                    {format(request.payoutDate.toDate(), "dd MMM, yyyy, p")}
                                                </span>
                                            ) : '-'}
                                          </TableCell>
                                      </TableRow>
                                  )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No payout requests yet.
                                        </TableCell>
                                    </TableRow>
                                  )}
                              </TableBody>
                          </Table>
                      </CardContent>
                  </Card>
            </main>
        </div>
  )
}