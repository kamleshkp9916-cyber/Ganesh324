"use client"

import {
  ShieldCheck,
  Menu,
  Banknote,
  Loader2,
  Wallet,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import React, { useState, useEffect, useMemo } from "react"
import { format } from "date-fns"
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, getDocs, runTransaction } from "firebase/firestore";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SellerHeader } from "@/components/seller/seller-header"
import { getFirestoreDb } from "@/lib/firebase"
import { Order, getStatusFromTimeline } from "@/lib/order-data"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


export default function SellerSettingsPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast()
  
  const [isMounted, setIsMounted] = useState(false);
  const [payoutRequests, setPayoutRequests] = useState<any[]>([]);
  const [isLoadingPayouts, setIsLoadingPayouts] = useState(true);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number | string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchSellerOrders = async () => {
    if (!user) return;
    try {
        const db = getFirestoreDb();
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("sellerId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedOrders: Order[] = querySnapshot.docs.map(doc => ({
            ...(doc.data() as Order),
            orderId: doc.id
        }));
        setSellerOrders(fetchedOrders);
    } catch (error) {
        console.error("Error fetching seller orders:", error);
    }
  };

  useEffect(() => {
    if (!user) return;

    setIsLoadingPayouts(true);
    fetchSellerOrders();
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

  const PLATFORM_FEE_RATE = 0.05;

  const revenueData = useMemo(() => {
    const deliveredOrders = sellerOrders.filter(o => getStatusFromTimeline(o.timeline) === 'Delivered');

    let withdrawablePayout = 0;
    const now = new Date();

    deliveredOrders.forEach(order => {
        const deliveryStep = order.timeline.find(step => step.status === 'Delivered');
        if (deliveryStep && deliveryStep.date) {
            try {
                const deliveryDate = new Date(order.orderDate); 
                if (differenceInDays(now, deliveryDate) > 7) {
                    const productTotal = order.products.reduce((prodSum, p) => prodSum + (parseFloat(String(p.price).replace(/[^0-9.-]+/g, '')) * p.quantity), 0);
                    withdrawablePayout += productTotal * (1 - PLATFORM_FEE_RATE);
                }
            } catch(e) {
                console.error("Could not parse order date for payout calculation", e);
            }
        }
    });

    const totalWithdrawn = payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

    return {
      withdrawableBalance: withdrawablePayout - totalWithdrawn,
    };
  }, [sellerOrders, payouts]);


  const handleRequestPayout = async () => {
        if (!user || !userData) return;
        const amount = Number(withdrawAmount);
        if (isNaN(amount) || amount <= 0) {
            toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid amount to withdraw.' });
            return;
        }
        if (amount > revenueData.withdrawableBalance) {
            toast({ variant: 'destructive', title: 'Insufficient Balance', description: 'You cannot withdraw more than your available balance.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const db = getFirestoreDb();
            await addDoc(collection(db, 'payouts'), {
                sellerId: user.uid,
                sellerName: userData.displayName,
                amount: amount,
                status: 'pending',
                requestedAt: serverTimestamp(),
            });
            toast({ title: "Payout Requested", description: `Your request to withdraw ₹${amount} is pending approval.` });
            setIsWithdrawDialogOpen(false);
            setWithdrawAmount("");
        } catch (error) {
            console.error("Error requesting payout:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not submit your payout request.' });
        } finally {
            setIsSubmitting(false);
        }
    };
  
  if (!isMounted || loading || !userData) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>
  }

  const isSeller = userData?.role === 'seller';

  if (!isSeller) {
      router.replace('/live-selling');
      return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>
  }

  return (
        <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <SellerHeader />
            <main className="grid flex-1 items-start gap-8 p-4 sm:px-6 md:p-8">
                 <div className="grid gap-4 md:grid-cols-2">
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
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Wallet /> Withdrawals</CardTitle>
                            <CardDescription>Request a payout of your available earnings.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <p className="text-sm text-muted-foreground">
                                Available for Payout:
                           </p>
                           <p className="text-3xl font-bold">₹{revenueData.withdrawableBalance.toFixed(2)}</p>
                           <p className="text-xs text-muted-foreground mt-1">Funds from delivered orders become available for withdrawal after 7 days.</p>
                        </CardContent>
                         <CardFooter className="border-t pt-6">
                            <DialogTrigger asChild>
                                <Button disabled={userData.kycStatus !== 'verified'}>Request Payout</Button>
                            </DialogTrigger>
                             {userData.kycStatus !== 'verified' && <p className="text-xs text-destructive ml-4">KYC must be verified to request payouts.</p>}
                        </CardFooter>
                    </Card>
                </div>
                 <Card>
                      <CardHeader>
                          <CardTitle>Payout History</CardTitle>
                          <CardDescription>Review your past and pending withdrawal requests.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead>Date Requested</TableHead>
                                      <TableHead>Amount</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead>Date Paid</TableHead>
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
         <DialogContent>
            <DialogHeader>
                <DialogTitle>Request Payout</DialogTitle>
                <DialogDescription>Enter the amount you wish to withdraw from your available balance.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="p-4 rounded-lg border bg-muted">
                    <p className="text-sm text-muted-foreground">Available for Withdrawal</p>
                    <p className="text-2xl font-bold">₹{revenueData.withdrawableBalance.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="amount">Withdrawal Amount</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                        <Input 
                            id="amount" 
                            type="number"
                            placeholder="0.00" 
                            className="pl-6" 
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                        />
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">
                   Funds will be transferred to your verified bank account within 3-5 business days after approval.
                </p>
            </div>
            <DialogFooter>
                 <Button type="button" variant="ghost" onClick={() => setIsWithdrawDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleRequestPayout} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Request
                </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
  