
"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, CreditCard, Download, Lock, Coins, Loader2, Bell, ChevronRight, Briefcase, ShoppingBag, BarChart2, Plus, ArrowUp, ArrowDown, Search, Printer, CheckCircle2, Circle, Hourglass, Package, PackageCheck, PackageOpen, Truck, Home, XCircle, AlertTriangle, ShieldCheck, RotateCcw, Star, Edit, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Footer } from '@/components/footer';
import { getTransactions, Transaction, addTransaction } from '@/lib/transaction-history';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Order, saveAllOrders, getStatusFromTimeline, ORDERS_KEY, getOrderById } from '@/lib/order-data';
import { format, addDays, parse, differenceInDays, intervalToDuration, formatDuration, parseISO } from 'date-fns';
import Image from "next/image";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { Timeline } from "@/components/timeline";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { addReview, getUserReviews, updateReview, getReviews, type Review } from '@/lib/review-data';
import { useAuth } from "@/hooks/use-auth";
import { ReviewDialog } from '@/components/delivery-info-client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const cancellationReasons = [
  "Changed my mind",
  "Ordered by mistake",
  "Delivery time is too long",
  "Found a better deal elsewhere",
  "Other"
];

const returnReasons = [
  "Item was defective or damaged",
  "Received the wrong item",
  "The item doesn't match the description or photos",
  "The item doesn't fit properly",
  "No longer need the item",
  "Other"
];

// Mock submit return request API function
function submitReturnRequestMock({ orderId, type, reason, contactPhone, pickup, photos }: any) {
  return new Promise((res) =>
    setTimeout(() => {
      const resp: any = {
        orderId,
        status: "requested",
        type, // 'cancel' or 'return'
        reason,
        pickup: pickup || "dropoff",
        contactPhone: contactPhone || null,
        photos: photos?.map((p: any, i: number) => ({ id: `IMG-${Date.now()}-${i}`, name: p.name })) || [],
        requestedAt: new Date().toISOString(),
      };
      // create a pending refund transaction (refund will be completed after pickup in mock)
      const refundTx = addTransaction({ transactionId: `REF-${orderId}`, type: "Refund", description: `Refund for order ${orderId}`, date: new Date().toISOString(), time: new Date().toLocaleTimeString(), amount: 0, status: "Processing" });
      resp.refundTx = refundTx;
      res(resp);
    }, 900)
  );
}

// Mock: simulate pickup completed by delivery partner — this will mark refund as completed
function simulatePickupComplete(orderId: any) {
    const transactions = getTransactions();
    const txIndex = transactions.findIndex((t) => t.transactionId && t.transactionId.includes(orderId) && t.type === "Refund" && t.status === "Processing");

    if (txIndex !== -1) {
        // This is a simplified update. In a real app, you'd update this through a proper state management or API call.
        const updatedTx = { ...transactions[txIndex], status: 'Completed', amount: Math.round((Math.random() * 100 + 20) * 100) / 100 };
        const newTransactions = [...transactions];
        newTransactions[txIndex] = updatedTx;
        localStorage.setItem('streamcart_transactions', JSON.stringify(newTransactions));
        window.dispatchEvent(new Event('storage'));
        return updatedTx;
    }
    return null;
}

const getStatusIcon = (status: string) => {
    if (!status) return <Circle className="h-5 w-5" />;
    if (status.toLowerCase().includes("pending")) return <Hourglass className="h-5 w-5" />;
    if (status.toLowerCase().includes("confirmed")) return <PackageOpen className="h-5 w-5" />;
    if (status.toLowerCase().includes("packed")) return <Package className="h-5 w-5" />;
    if (status.toLowerCase().includes("dispatch")) return <PackageCheck className="h-5 w-5" />;
    if (status.toLowerCase().includes("shipped")) return <Truck className="h-5 w-5" />;
    if (status.toLowerCase().includes("in transit")) return <Truck className="h-5 w-5" />;
    if (status.toLowerCase().includes("out for delivery")) return <Truck className="h-5 w-5" />;
    if (status.toLowerCase().includes("delivered")) return <Home className="h-5 w-5" />;
    if (status.toLowerCase().includes('cancelled') || status.toLowerCase().includes('undelivered') || status.toLowerCase().includes('failed delivery attempt') || status.toLowerCase().includes('return')) return <XCircle className="h-5 w-5" />;
    return <Circle className="h-5 w-5" />;
};

function OrderDetail({ order, onBack, onRequestReturn, onSimulatePickup }: any) {
    const { user } = useAuth();
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [myReview, setMyReview] = useState<Review | null>(null);

    useEffect(() => {
        if (user && order) {
             const existingReviews = getReviews(order.products[0].key);
             const userReview = existingReviews.find(r => r.userId === user.uid);
             if (userReview) {
                 setMyReview(userReview);
             }
        }
    }, [user, order]);


    const currentStatus = useMemo(() => getStatusFromTimeline(order.timeline), [order.timeline]);
    const isCancelled = currentStatus.toLowerCase().includes('cancelled');

    const timelineToShow = useMemo(() => {
      const timeline = order.timeline;
      const cancelIndex = timeline.findIndex((item: any) => item && item.status && item.status.toLowerCase().includes('cancelled'));
      return cancelIndex > -1 ? timeline.slice(0, cancelIndex + 1) : timeline;
    }, [order.timeline]);
    
    const completedCount = useMemo(() => timelineToShow.filter((s: any) => s.completed).length, [timelineToShow]);
    
    const percent = useMemo(() => {
        if (isCancelled) return 100;
        if (timelineToShow.length <= 1) return 0;
        return Math.round(((completedCount - 1) / (timelineToShow.length - 1)) * 100);
    }, [isCancelled, completedCount, timelineToShow.length]);


    const showReturnButton = useMemo(() => {
        if (!order || currentStatus !== 'Delivered' || order.isReturnable === false || order.returnRequest) {
            return false;
        }
        const deliveredStep = order.timeline.find((step:any) => step.status.startsWith('Delivered'));
        if (!deliveredStep || !deliveredStep.date) {
            return false;
        }
        try {
            const deliveryDate = parse(deliveredStep.date, 'MMM dd, yyyy', new Date());
            const daysSinceDelivery = differenceInDays(new Date(), deliveryDate);
            return daysSinceDelivery <= 7;
        } catch {
            return false;
        }
    }, [currentStatus, order]);
    
    const showReviewButton = currentStatus === 'Delivered';
    
    const showCancelButton = !['Out for Delivery', 'Delivered', 'Return Initiated', 'Return package picked up', 'Returned', 'Cancelled by user'].includes(currentStatus) && !isCancelled;

    const handleReviewSubmit = (review: Review) => {
        if (myReview) {
             updateReview(order.products[0].key, review);
        } else {
             addReview(order.products[0].key, review);
        }
        setMyReview(review);
    };

    return (
        <div>
            <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col gap-4">
                    {order.products.map((product: any, index: number) => (
                        <div key={index} className="flex items-center gap-4">
                            <Link href={`/product/${product.key}`} className="block hover:opacity-80 transition-opacity">
                                <Image src={product.imageUrl} width={80} height={80} className="w-20 h-20 rounded-lg object-cover" alt="product" />
                            </Link>
                            <div>
                                <Link href={`/product/${product.key}`} className="hover:underline">
                                    <div className="text-lg font-semibold text-card-foreground">{product.name}</div>
                                </Link>
                                <div className="text-xs text-muted-foreground space-x-2">
                                    {product.quantity > 1 && <span>Qty: {product.quantity}</span>}
                                    {product.size && <span>Size: {product.size}</span>}
                                    {product.color && <span>Color: {product.color}</span>}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">₹{parseFloat(product.price.replace('₹','').replace(',','')).toFixed(2)}</div>
                            </div>
                        </div>
                    ))}
                    {order.address && (
                        <div className="mt-2 text-xs text-muted-foreground">To: {order.address.name} • {order.address.city} • {order.address.pincode}</div>
                    )}
                    {order.returnRequest && (
                        <div className="text-xs text-amber-500">Request: {order.returnRequest.type} • {order.returnRequest.status}</div>
                    )}
                </div>
                <div className="text-right">
                    <div className="text-sm text-muted-foreground">Progress</div>
                    <div className="text-lg font-semibold text-card-foreground">{percent}%</div>
                    <div className="mt-2 text-xs text-muted-foreground">Placed on {new Date(order.orderDate).toLocaleDateString()}</div>
                </div>
            </div>

            <div className="mb-4">
                <div className="w-full bg-muted rounded-full overflow-hidden h-2">
                    <div className={cn("h-2 rounded-full transition-all", isCancelled ? "bg-destructive" : "bg-primary")} style={{ width: `${percent}%` }} />
                </div>
            </div>

            <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-card-foreground">Delivery Timeline</div>
            </div>
            
            <div className="space-y-4">
                {timelineToShow.map((s: any, idx: number) => (
                    <TimelineStep key={s.key || idx} step={s} index={idx} total={timelineToShow.length} />
                ))}
            </div>

             <div className="mt-6 flex flex-wrap gap-2 justify-end">
                {showCancelButton && (
                    <Button variant="destructive" size="sm" onClick={() => onRequestReturn('cancel')}>Cancel Order</Button>
                )}
                {showReturnButton && (
                    <Button variant="outline" size="sm" onClick={() => onRequestReturn('return')}>Request Return</Button>
                )}
                {showReviewButton && (
                     <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm"><Star className="mr-2 h-4 w-4" /> {myReview ? "Edit Your Review" : "Write a Review"}</Button>
                        </DialogTrigger>
                        <ReviewDialog order={order} user={user} reviewToEdit={myReview || undefined} onReviewSubmit={handleReviewSubmit} closeDialog={() => setIsReviewDialogOpen(false)} />
                    </Dialog>
                )}
                {order.returnRequest?.status === 'requested' && order.returnRequest?.type === 'return' && (
                    <Button size="sm" variant="secondary" onClick={onSimulatePickup}>Simulate Pickup</Button>
                )}
            </div>

            <div className="mt-6 text-xs text-muted-foreground">This timeline shows the journey of your order from confirmation to delivery.</div>
        </div>
    );
}

function TimelineStep({ step, index, total }: any) {
  return (
    <motion.div initial="hidden" animate="enter" variants={{hidden: { opacity: 0, y: -6 }, enter: { opacity: 1, y: 0 }}} className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div className={cn(`w-8 h-8 rounded-full flex items-center justify-center border`, step.completed ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground border-border')}>
          {step.completed ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            getStatusIcon(step.status)
          )}
        </div>
        {index < total - 1 && <div className={`w-px flex-1 bg-border mt-2`} style={{ minHeight: 32 }} />}
      </div>

      <div className="flex-1 pt-0.5">
        <div className="flex items-center justify-between">
          <div className="font-medium text-sm text-card-foreground">{step.label || step.status}</div>
          <div className="text-xs text-muted-foreground">{step.completed ? (step.date ? `${step.date}, ${step.time}`: 'Completed') : "Pending"}</div>
        </div>
        <div className="text-xs text-muted-foreground mt-1">{step.completed ? "Completed" : "Waiting"}</div>
      </div>
    </motion.div>
  );
}

function OrdersPageContent() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [returning, setReturning] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [showReturnConfirm, setShowReturnConfirm] = useState(false);
  const [returnType, setReturnType] = useState<any>(null);
  const [returnPickupOption, setReturnPickupOption] = useState("pickup");
  const [contactPhone, setContactPhone] = useState("");
  const [attachedPhotos, setAttachedPhotos] = useState<any[]>([]);
  const [tab, setTab] = useState("orders"); // 'orders' or 'transactions'
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const fileInputRef = useRef<any>(null);

  const [isCancelFlowOpen, setIsCancelFlowOpen] = useState(false);
  const [cancelStep, setCancelStep] = useState("reason");
  const [cancelReason, setCancelReason] = useState("");
  const [cancelFeedback, setCancelFeedback] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const { toast } = useToast();

  const [ordersPage, setOrdersPage] = useState(1);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const ORDERS_PER_PAGE = 5;
  const TRANSACTIONS_PER_PAGE = 10;
  
  const loadData = useCallback(() => {
    if (typeof window === 'undefined') return;

    const storedOrdersJSON = localStorage.getItem(ORDERS_KEY);
    let allOrders: Order[] = [];
    if (storedOrdersJSON) {
        try {
            const parsed = JSON.parse(storedOrdersJSON);
            if (Array.isArray(parsed) && parsed.length > 0) {
                allOrders = parsed;
            }
        } catch (e) {
           console.error("Could not parse orders from localStorage, using file data.", e);
        }
    }
    
    setOrders(allOrders);
    setTransactions(getTransactions());
}, []);
  
  useEffect(() => {
    setIsClient(true);
    loadData();

    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
    }
  }, [loadData]);


  // Helper: update order in orders state
  function updateOrder(orderId: any, patch: any) {
    const updatedOrders = orders.map((o) => (o.orderId === orderId ? { ...o, ...patch } : o));
    saveAllOrders(updatedOrders);
    setOrders(updatedOrders);
    if (selectedOrder?.orderId === orderId) setSelectedOrder((s:any) => ({ ...s, ...patch }));
  }

  // Called when user confirms a cancel/return
  async function handleSubmitReturn() {
    if (!selectedOrder || !returnType) return;
    setReturning(true);
    try {
        const functionUrl = `https://us-central1-gcp-project-id.cloudfunctions.net/notifyDeliveryPartner`;
        await fetch(functionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: selectedOrder.orderId, status: 'return_initiated' }),
        });

      const resp: any = await submitReturnRequestMock({
        orderId: selectedOrder.orderId,
        type: returnType,
        reason: returnReason,
        contactPhone,
        pickup: returnPickupOption,
        photos: attachedPhotos,
      });
      
      const newTimelineStep = {
        status: returnType === 'cancel' ? 'Cancellation Requested' : 'Return Initiated',
        date: format(new Date(), 'MMM dd, yyyy'),
        time: format(new Date(), 'p'),
        completed: true
      };
      
      updateOrder(selectedOrder.orderId, { returnRequest: resp, timeline: [...selectedOrder.timeline, newTimelineStep] });

      setShowReturnConfirm(false);
      setReturnReason("");
      setReturnType(null);
      setReturnPickupOption("pickup");
      setContactPhone("");
      setAttachedPhotos([]);
      if (fileInputRef.current) fileInputRef.current.value = null;
    } catch (e) {
      console.error(e);
    } finally {
      setReturning(false);
    }
  }

  function handlePhotoAttach(e: any) {
    const files = Array.from(e.target.files || []);
    setAttachedPhotos(files);
  }

  function handleSimulatePickup() {
    if (!selectedOrder) return;
    const tx = simulatePickupComplete(selectedOrder.orderId);
    if (tx) {
        const updatedReturn = { ...(selectedOrder.returnRequest || {}), refundTx: tx, status: "pickup_completed", refundedAt: new Date().toISOString() };
        
        let timelineUpdate = {};
        if (selectedOrder.timeline) {
            const newTimeline = [...selectedOrder.timeline];
            const returnPickedUpIndex = newTimeline.findIndex(item => item.status === 'Return package picked up');
            if (returnPickedUpIndex === -1) {
                newTimeline.push({ status: 'Return package picked up', date: format(new Date(), 'MMM dd, yyyy'), time: format(new Date(), 'p'), completed: true });
                newTimeline.push({ status: 'Refund Completed: The amount has been credited to your original payment method.', date: format(new Date(), 'MMM dd, yyyy'), time: format(new Date(), 'p'), completed: true });
            }
            timelineUpdate = { timeline: newTimeline };
        }

        updateOrder(selectedOrder.orderId, { returnRequest: updatedReturn, ...timelineUpdate });
        toast({ title: "Pickup Simulated", description: `Refund ${tx.status} for transaction ${tx.transactionId}` });
    } else {
        toast({ variant: 'destructive', title: "Error", description: "No pending pickup/refund found for this order." });
    }
}

  async function handleConfirmCancellation(otpValue: string) {
    if (otpValue !== '123456') {
        toast({ title: "Invalid OTP", variant: "destructive" });
        return;
    }
    setIsVerifyingOtp(true);
    try {
        const allOrdersJSON = localStorage.getItem('streamcart_orders');
        let allOrders: Order[] = allOrdersJSON ? JSON.parse(allOrdersJSON) : [];
        
        const orderIndex = allOrders.findIndex((o: Order) => o.orderId === selectedOrder.orderId);

        if (orderIndex !== -1) {
            const updatedOrder: Order = { ...allOrders[orderIndex] };

            if (!updatedOrder.timeline.some(step => step && step.status && step.status.toLowerCase().includes('cancelled'))) {
                updatedOrder.timeline.push({ status: 'Cancelled by user', date: format(new Date(), 'MMM dd, yyyy'), time: format(new Date(), 'p'), completed: true });
                updatedOrder.timeline.push({ status: 'Refund Initiated: The amount will be credited in 5-7 business days.', date: format(new Date(), 'MMM dd, yyyy'), time: format(new Date(), 'p'), completed: false });
            }
            
            allOrders[orderIndex] = updatedOrder;
            
            saveAllOrders(allOrders);
            setOrders(allOrders);
            setSelectedOrder(updatedOrder);

            const functionUrl = `https://us-central1-gcp-project-id.cloudfunctions.net/notifyDeliveryPartner`;
             await fetch(functionUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: selectedOrder.orderId, status: 'cancelled' }),
            });

            addTransaction({
                id: Date.now(),
                transactionId: `REF-${selectedOrder.orderId.replace('#', '')}`,
                type: 'Refund',
                description: `For cancelled order ${selectedOrder.orderId}`,
                date: format(new Date(), 'MMM dd, yyyy'),
                time: format(new Date(), 'p'),
                amount: selectedOrder.total,
                status: 'Processing',
            });
            
            toast({ title: "Order Cancelled & Refund Initiated" });
            setIsCancelFlowOpen(false);
            setCancelStep("reason");
            setCancelReason("");
            setCancelFeedback("");
            setOtp("");
            setOtpSent(false);
        } else {
            throw new Error("Order not found in local storage.");
        }
    } catch (error) {
        console.error("Cancellation error:", error);
        toast({ title: "Cancellation Failed", variant: "destructive" });
    } finally {
        setIsVerifyingOtp(false);
    }
  };

  const paginatedOrders = orders.slice((ordersPage - 1) * ORDERS_PER_PAGE, ordersPage * ORDERS_PER_PAGE);
  const totalOrderPages = Math.ceil(orders.length / ORDERS_PER_PAGE);

  const paginatedTransactions = transactions.slice((transactionsPage - 1) * TRANSACTIONS_PER_PAGE, transactionsPage * TRANSACTIONS_PER_PAGE);
  const totalTransactionPages = Math.ceil(transactions.length / TRANSACTIONS_PER_PAGE);
  
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
       <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">My Orders</h1>
        <div className="w-10"></div>
      </header>
      <main className="flex-grow p-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">View orders, request returns, and see transactions.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setTab("orders")} className={cn(`px-3 py-1 rounded-md text-sm`, tab === 'orders' ? 'bg-primary text-primary-foreground' : 'border border-border')}>Orders</button>
              <button onClick={() => setTab("transactions")} className={cn(`px-3 py-1 rounded-md text-sm`, tab === 'transactions' ? 'bg-primary text-primary-foreground' : 'border border-border')}>Transactions</button>
            </div>
          </header>

          {tab === 'orders' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="bg-card p-4 rounded-2xl shadow-lg">
                  <h2 className="font-medium mb-3 text-card-foreground">Orders</h2>
                  <div className="space-y-3">
                    {!isClient ? (
                        Array.from({ length: 3 }).map((_, i) => (
                           <div key={i} className="flex items-center gap-3 p-3">
                                <Skeleton className="w-14 h-14 rounded-md" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                           </div>
                        ))
                    ) : (
                        paginatedOrders.map((o) => {
                          const status = getStatusFromTimeline(o.timeline);
                          return (
                          <button
                            key={o.orderId}
                            onClick={() => setSelectedOrder(o)}
                            className={cn(`w-full text-left p-3 rounded-xl border flex items-center gap-3 hover:shadow-lg transition`,
                              selectedOrder?.orderId === o.orderId ? "border-primary bg-primary/10" : "border-border"
                            )}
                          >
                            <Image src={o.products[0].imageUrl} alt={o.products[0].name} width={56} height={56} className="w-14 h-14 rounded-md object-cover" />
                            <div className="flex-1 overflow-hidden">
                               <div className="text-sm font-medium text-card-foreground">{o.products[0].name}{o.products.length > 1 ? ` + ${o.products.length - 1} more` : ''}</div>
                               <div className="text-xs text-muted-foreground">{o.orderId} • {isClient ? new Date(o.orderDate).toLocaleString() : ''}</div>
                              <div className="text-xs text-muted-foreground mt-1 truncate">{o.address.name}, {o.address.city}</div>
                            </div>
                          </button>
                        )})
                    )}
                  </div>
                   {totalOrderPages > 1 && (
                        <Pagination className="mt-4">
                            <PaginationContent>
                                <PaginationItem>
                                    <Button variant="outline" onClick={() => setOrdersPage(p => Math.max(1, p - 1))} disabled={ordersPage === 1}>Previous</Button>
                                </PaginationItem>
                                <PaginationItem>
                                    <span className="p-2 text-sm">Page {ordersPage} of {totalOrderPages}</span>
                                </PaginationItem>
                                <PaginationItem>
                                    <Button variant="outline" onClick={() => setOrdersPage(p => Math.min(totalOrderPages, p + 1))} disabled={ordersPage === totalOrderPages}>Next</Button>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="bg-card p-6 rounded-2xl shadow-lg min-h-[300px]">
                  {!selectedOrder ? (
                    <div className="flex flex-col items-center justify-center h-64">
                      <div className="text-muted-foreground">No order selected</div>
                      <div className="text-sm mt-2 text-muted-foreground">Click an order on the left to see its tracking steps.</div>
                    </div>
                  ) : (
                    <OrderDetail
                      order={selectedOrder}
                      onBack={() => setSelectedOrder(null)}
                      onRequestReturn={(type: any) => {
                        if (type === 'cancel') {
                            setIsCancelFlowOpen(true);
                        } else {
                            setReturnType(type);
                            setShowReturnConfirm(true);
                        }
                      }}
                      onSimulatePickup={handleSimulatePickup}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

            {tab === 'transactions' && (
            <div className="bg-card p-6 rounded-2xl shadow-lg">
                <h2 className="text-lg font-medium mb-4 text-card-foreground">Transactions</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-muted-foreground text-left">
                            <tr>
                                <th className="py-2">Txn ID/Order</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Time</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                             {!isClient ? (
                                Array.from({length: 5}).map((_, i) => (
                                    <tr key={i} className="border-t border-border">
                                        <td className="py-4"><Skeleton className="h-5 w-24" /></td>
                                        <td><Skeleton className="h-5 w-16" /></td>
                                        <td><Skeleton className="h-5 w-20" /></td>
                                        <td><Skeleton className="h-5 w-24" /></td>
                                        <td><Skeleton className="h-5 w-28" /></td>
                                        <td className="text-right"><Skeleton className="h-8 w-8 rounded-full" /></td>
                                    </tr>
                                ))
                            ) : (
                                paginatedTransactions.map((t, index) => (
                                    <tr key={`${t.transactionId}-${index}`} className="border-t border-border">
                                        <td className="py-2 font-mono">{t.transactionId}</td>
                                        <td className="capitalize">{t.type}</td>
                                        <td className={cn(t.amount > 0 ? "text-green-500" : "text-foreground")}>
                                            {t.amount > 0 ? '+' : ''}₹{(t.amount ?? 0).toFixed(2)}
                                        </td>
                                        <td>
                                            <Badge variant={t.status === 'Completed' ? 'success' : t.status === 'Processing' ? 'warning' : 'destructive'}>
                                                {t.status}
                                            </Badge>
                                        </td>
                                        <td className="text-xs text-muted-foreground">{new Date(t.date).toLocaleString()}</td>
                                         <td className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Details</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>
                                                        <div className="text-xs space-y-1">
                                                            <p><strong>Payment Method:</strong> {t.paymentMethod || 'N/A'}</p>
                                                            <p><strong>Gateway ID:</strong> {t.gatewayTransactionId || 'N/A'}</p>
                                                        </div>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {totalTransactionPages > 1 && (
                    <Pagination className="mt-4">
                        <PaginationContent>
                            <PaginationItem>
                                <Button variant="outline" onClick={() => setTransactionsPage(p => Math.max(1, p - 1))} disabled={transactionsPage === 1}>Previous</Button>
                            </PaginationItem>
                            <PaginationItem>
                                <span className="p-2 text-sm">Page {transactionsPage} of {totalTransactionPages}</span>
                            </PaginationItem>
                            <PaginationItem>
                                <Button variant="outline" onClick={() => setTransactionsPage(p => Math.min(totalTransactionPages, p + 1))} disabled={transactionsPage === totalTransactionPages}>Next</Button>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
            )}

            <Dialog open={isCancelFlowOpen} onOpenChange={setIsCancelFlowOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Cancel Order</DialogTitle>
                        <DialogDescription>
                           Please complete the following steps to cancel your order.
                        </DialogDescription>
                    </DialogHeader>
                    <Tabs value={cancelStep} onValueChange={setCancelStep} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="reason" disabled={cancelStep !== 'reason'}>Reason</TabsTrigger>
                            <TabsTrigger value="feedback" disabled={!cancelReason}>Feedback</TabsTrigger>
                            <TabsTrigger value="confirm" disabled={!cancelReason}>Confirm</TabsTrigger>
                        </TabsList>
                        <TabsContent value="reason" className="py-4">
                            <RadioGroup value={cancelReason} onValueChange={setCancelReason}>
                                <div className="space-y-2">
                                    {cancellationReasons.map(reason => (
                                        <div key={reason} className="flex items-center space-x-2">
                                            <RadioGroupItem value={reason} id={reason} />
                                            <Label htmlFor={reason}>{reason}</Label>
                                        </div>
                                    ))}
                                </div>
                            </RadioGroup>
                             <Button onClick={() => setCancelStep('feedback')} disabled={!cancelReason} className="mt-4 w-full">Next</Button>
                        </TabsContent>
                        <TabsContent value="feedback" className="py-4">
                             <div className="space-y-2">
                                <Label htmlFor="feedback">Feedback (Optional)</Label>
                                <Textarea id="feedback" value={cancelFeedback} onChange={(e) => setCancelFeedback(e.target.value)} placeholder="Tell us more..." />
                            </div>
                            <Button onClick={() => setCancelStep('confirm')} className="mt-4 w-full">Next</Button>
                        </TabsContent>
                        <TabsContent value="confirm" className="py-4">
                             <div className="flex flex-col items-center gap-4 text-center">
                                <ShieldCheck className="h-12 w-12 text-primary" />
                                {!otpSent ? (
                                    <>
                                        <p>An OTP will be sent to your registered mobile number for verification.</p>
                                        <Button onClick={() => {
                                            toast({ title: "OTP Sent!", description: "A 6-digit code has been sent." });
                                            setOtpSent(true);
                                        }}>Get OTP</Button>
                                    </>
                                ) : (
                                    <>
                                        <p>An OTP has been sent. Please enter it below to confirm cancellation.</p>
                                        <InputOTP
                                            maxLength={6}
                                            value={otp}
                                            onChange={(value) => {
                                                setOtp(value);
                                                if (value.length === 6) {
                                                    handleConfirmCancellation(value);
                                                }
                                            }}
                                        >
                                            <InputOTPGroup>
                                                <InputOTPSlot index={0} />
                                                <InputOTPSlot index={1} />
                                                <InputOTPSlot index={2} />
                                            </InputOTPGroup>
                                            <InputOTPSeparator />
                                            <InputOTPGroup>
                                                <InputOTPSlot index={3} />
                                                <InputOTPSlot index={4} />
                                                <InputOTPSlot index={5} />
                                            </InputOTPGroup>
                                        </InputOTP>
                                        {isVerifyingOtp && <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Verifying...</div>}
                                    </>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

         {showReturnConfirm && selectedOrder && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg">
                <h3 className="text-lg font-semibold text-card-foreground">{returnType === 'cancel' ? 'Cancel order' : 'Request return'}</h3>
                <p className="text-sm text-muted-foreground mt-2">Order <span className="font-medium text-card-foreground">{selectedOrder.orderId}</span> • {selectedOrder.products[0].name}</p>

                 <label className="block text-xs text-muted-foreground mt-4">Reason</label>
                  <select value={returnReason} onChange={(e) => setReturnReason(e.target.value)} className="w-full mt-2 p-2 bg-input border-border rounded-md text-sm">
                      <option value="">-- Select reason --</option>
                      {(returnType === 'cancel' ? cancellationReasons : returnReasons).map(reason => (
                          <option key={reason} value={reason}>{reason}</option>
                      ))}
                  </select>

                <label className="block text-xs text-muted-foreground mt-3">Pickup vs Drop-off</label>
                <div className="flex items-center gap-3 mt-2">
                  <label className="flex items-center gap-2"><input type="radio" checked={returnPickupOption==='pickup'} onChange={() => setReturnPickupOption('pickup')} /> Pickup</label>
                  <label className="flex items-center gap-2"><input type="radio" checked={returnPickupOption==='dropoff'} onChange={() => setReturnPickupOption('dropoff')} /> Drop-off</label>
                </div>

                <label className="block text-xs text-muted-foreground mt-3">Contact phone for pickup (optional)</label>
                <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full mt-2 p-2 bg-input border-border rounded-md text-sm" placeholder="+91 98XXXXXXXX" />

                <label className="block text-xs text-muted-foreground mt-3">Attach photos (optional)</label>
                <input ref={fileInputRef} onChange={handlePhotoAttach} type="file" multiple accept="image/*" className="w-full mt-2 text-sm" />

                <div className="flex items-center gap-3 mt-4 justify-end">
                  <button onClick={() => { setShowReturnConfirm(false); setReturnType(null); }} className="px-3 py-2 rounded-md text-sm border border-border">Cancel</button>
                  <button onClick={handleSubmitReturn} disabled={returning} className="px-3 py-2 rounded-md text-sm bg-primary text-primary-foreground disabled:opacity-60">
                    {returning ? 'Submitting...' : returnType === 'cancel' ? 'Confirm Cancel' : 'Submit Return'}
                  </button>
                </div>

                <div className="mt-3 text-xs text-muted-foreground">Note: In this mock, refunds are created as pending and will be marked successful after a simulated pickup. In production your backend will process pickup and refund flows.</div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer/>
    </div>
  );
}

export default function OrdersPage() {
    return <OrdersPageContent />
}
