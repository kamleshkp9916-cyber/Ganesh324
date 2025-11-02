
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Circle, Truck, Package, PackageCheck, PackageOpen, Home, CalendarDays, XCircle, Hourglass, Edit, AlertTriangle, MessageSquare, ShieldCheck, Loader2, RotateCcw, Star, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth.tsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { format, addDays, parse, differenceInDays, intervalToDuration, formatDuration } from 'date-fns';
import { getOrderById, Order } from '@/lib/order-data';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { EditAddressForm } from '@/components/edit-address-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { Badge } from './ui/badge';
import { addReview, Review } from '@/lib/review-data';
import { Footer } from './footer';
import { addTransaction } from '@/lib/transaction-history';
import { updateUserData } from '@/lib/follow-data';

// This is now a separate component to be used in /app/product/[productId]/reviews/page.tsx
export const ReviewDialog = ({ order, onReviewSubmit, closeDialog, user, reviewToEdit }: { order?: Order, onReviewSubmit: (review: any) => void, closeDialog: () => void, user: any, reviewToEdit?: Review }) => {
    const [rating, setRating] = useState(reviewToEdit?.rating || 0);
    const [reviewText, setReviewText] = useState(reviewToEdit?.text || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = () => {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
             const reviewData = {
                id: reviewToEdit?.id || Date.now(),
                author: user.displayName || 'Anonymous',
                avatar: user.photoURL,
                rating,
                text: reviewText,
                productName: reviewToEdit?.productName || order?.products[0].name,
                productId: reviewToEdit?.productId || order?.products[0].key,
                date: reviewToEdit?.date || new Date().toISOString(),
            };
            onReviewSubmit(reviewData);
            setIsSubmitting(false);
            closeDialog();
        }, 1000);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{reviewToEdit ? 'Edit' : 'Write a'} Review</DialogTitle>
                <DialogDescription>Share your thoughts on the {reviewToEdit?.productName || order?.products[0].name}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={cn(
                                "h-8 w-8 cursor-pointer transition-colors",
                                rating >= star ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                            )}
                            onClick={() => setRating(star)}
                        />
                    ))}
                </div>
                <Textarea
                    placeholder="Tell us what you liked or disliked..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={5}
                />
            </div>
            <DialogFooter>
                 <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSubmit} disabled={rating === 0 || !reviewText.trim() || isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {reviewToEdit ? 'Update' : 'Submit'} Review
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};


export function DeliveryInfoClient({ orderId: encodedOrderId }: { orderId: string }) {
    const router = useRouter();
    const { user, userData, loading } = useAuth();
    const { toast } = useToast();
    const [isMounted, setIsMounted] = useState(false);
    const orderId = useMemo(() => decodeURIComponent(encodedOrderId), [encodedOrderId]);
    
    const [order, setOrder] = useState<Order | null>(null);

    const [isCancelFlowOpen, setIsCancelFlowOpen] = useState(false);
    const [cancelStep, setCancelStep] = useState("reason");
    const [cancelReason, setCancelReason] = useState("");
    const [cancelFeedback, setCancelFeedback] = useState("");
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [otp, setOtp] = useState('');
    
    const [isReturnFlowOpen, setIsReturnFlowOpen] = useState(false);
    const [returnStep, setReturnStep] = useState("reason");
    const [returnReason, setReturnReason] = useState("");
    const [returnFeedback, setReturnFeedback] = useState("");
    const [returnOtp, setReturnOtp] = useState('');
    const [isVerifyingReturnOtp, setIsVerifyingReturnOtp] = useState(false);
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
    const [myReview, setMyReview] = useState<Review | null>(null);

    useEffect(() => {
        setIsMounted(true);
        const fetchOrder = async () => {
            const fetchedOrder = await getOrderById(orderId);
            setOrder(fetchedOrder);
        };
        fetchOrder();
    }, [orderId]);

    const estimatedDeliveryDate = useMemo(() => {
        if (!order) return null;
        const deliveryDate = addDays(new Date(order.orderDate), 5);
        return format(deliveryDate, 'E, MMM dd, yyyy');
    }, [order]);

    const currentStatus = useMemo(() => order ? getStatusFromTimeline(order.timeline) : "", [order]);

    const isReturnWindowActive = useMemo(() => {
        if (!order || currentStatus !== 'Delivered') {
            return false;
        }
        const deliveredStep = order.timeline.find(step => step.status.startsWith('Delivered'));
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

    if (!isMounted || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        )
    }

    if (!user) {
        router.push('/');
        return null;
    }
    
    if (!order) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                 <h2 className="text-2xl font-semibold mb-4">Order Not Found</h2>
                 <p className="text-muted-foreground mb-6">The requested order could not be found.</p>
                 <Button onClick={() => router.push('/orders')}>Back to Orders</Button>
            </div>
        );
    }

    const lastCompletedIndex = order.timeline.slice().reverse().findIndex(item => item.completed);
    const currentStatusIndex = order.timeline.length - 1 - lastCompletedIndex;
    
    const showCancelButton = !['Delivered', 'Return Initiated', 'Return package picked up', 'Returned', 'Cancelled by user'].includes(currentStatus);
    const showEditAddressButton = currentStatus === 'Pending' || currentStatus === 'Order Confirmed';
    const showReturnButton = currentStatus === 'Delivered' && isReturnWindowActive;
    const showRefundButton = currentStatus === 'Returned';
    const showReviewButton = currentStatus === 'Delivered';
    

     const handleConfirmCancellation = async (otpValue: string) => {
        // ... (implementation is in orders page now)
    };

    const handleConfirmReturn = async (otpValue: string) => {
        // ... (implementation is in orders page now)
    };

    const handleAddressSave = (address: any) => {
        toast({
            title: "Address Updated",
            description: "Your delivery address has been successfully updated.",
        });
        setIsAddressDialogOpen(false);
    };
    
    const handleAddressesUpdate = (newAddresses: any[]) => {
      if(user){
        updateUserData(user.uid, { addresses: newAddresses });
      }
    }

    const handleRefundRequest = () => {
        toast({
            title: "Refund Request Submitted",
            description: "Your refund request is being processed. You will be notified shortly.",
        });
    };

    const handleReviewSubmit = (review: Review) => {
        addReview(order.products[0].key, review);
        toast({
            title: "Review Submitted!",
            description: "Thank you for your feedback. It is now visible on the product page.",
        });
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        toast({
            title: "Link Copied!",
            description: "Delivery tracking link copied to clipboard.",
        });
    };

    const handleHelp = () => {
        router.push('/contact');
    };
    
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold">
                    Delivery Information
                </h1>
                <Button variant="ghost" size="icon" onClick={handleShare}>
                    <Share2 className="h-5 w-5" />
                </Button>
            </header>

            <main className="flex-grow p-4 lg:p-8">
                <Card className="max-w-4xl mx-auto">
                     <CardHeader>
                        <CardTitle className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                        <span>Order ID: {orderId}</span>
                        <span className="text-sm font-medium text-muted-foreground">Status: {currentStatus}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 space-y-4">
                            {order.products.map(product => (
                                <Link key={product.key} href={`/product/${product.key}`} className="block hover:opacity-90 transition-opacity">
                                    <Card className="overflow-hidden">
                                        <CardContent className="p-4 flex flex-col items-center text-center">
                                            <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden mb-4 relative">
                                                <Image
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>
                                            <h3 className="font-semibold text-lg">{product.name}</h3>
                                            {(product.size || product.color) && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    {product.size && <Badge variant="outline">Size: {product.size}</Badge>}
                                                    {product.color && <Badge variant="outline">Color: {product.color}</Badge>}
                                                </div>
                                            )}
                                            {product.quantity > 1 && <p className="text-sm text-muted-foreground mt-1">Quantity: {product.quantity}</p>}
                                            <p className="font-bold text-lg mt-1">₹{parseFloat(product.price.replace('₹','').replace(',','')).toFixed(2)}</p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}

                            {estimatedDeliveryDate && !['Cancelled by user', 'Delivered', 'Undelivered', 'Returned', 'Return Initiated', 'Return package picked up'].includes(currentStatus) && (
                                <Card>
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <CalendarDays className="h-8 w-8 text-primary" />
                                        <div>
                                            <p className="font-semibold">Estimated Delivery</p>
                                            <p className="text-sm text-muted-foreground">{estimatedDeliveryDate}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                        <div className="lg:col-span-2">
                            <h3 className="text-lg font-semibold mb-4">Order Timeline</h3>
                            <ul className="space-y-2">
                                {order.timeline.map((item: any, index: number) => (
                                    <li key={index} className="flex items-start gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={cn(
                                                "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-1 z-10",
                                                item.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                            )}>
                                                {item.completed ? <CheckCircle2 className="h-5 w-5" /> : getStatusIcon(item.status) }
                                            </div>
                                            {index < order.timeline.length - 1 && (
                                                <div className="w-0.5 h-10 bg-border" />
                                            )}
                                        </div>
                                        <div className="flex-grow pt-1">
                                            <p className={cn("font-semibold", !item.completed && "text-muted-foreground")}>
                                                {item.status.split(':')[0]}
                                            </p>
                                            {index === currentStatusIndex && item.status.includes(':') && (
                                                <p className="text-sm text-muted-foreground">
                                                    {item.status.split(':').slice(1).join(':').trim()}
                                                </p>
                                            )}
                                            {item.completed && item.date && (
                                                <p className="text-sm text-muted-foreground">
                                                    {item.date} {item.time && `- ${item.time}`}
                                                </p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                    {(showCancelButton || showEditAddressButton || showReturnButton || showRefundButton || showReviewButton) && (
                        <CardFooter className="flex flex-wrap items-center justify-end gap-2 border-t pt-6">
                            {showReviewButton && (
                                <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button><Star className="mr-2 h-4 w-4" /> {myReview ? "Edit Your Review" : "Write a Review"}</Button>
                                    </DialogTrigger>
                                    <ReviewDialog order={order} user={user} reviewToEdit={myReview || undefined} onReviewSubmit={handleReviewSubmit} closeDialog={() => setIsReviewDialogOpen(false)} />
                                </Dialog>
                            )}
                            <Button variant="ghost" onClick={handleHelp}><MessageSquare className="mr-2 h-4 w-4"/> Need Help?</Button>
                            {showEditAddressButton && (
                                <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit Address</Button>
                                    </DialogTrigger>
                                     <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Change Delivery Address</DialogTitle>
                                            <DialogDescription>Select a saved address or add a new one.</DialogDescription>
                                        </DialogHeader>
                                        <EditAddressForm 
                                            onSave={handleAddressSave}
                                            onCancel={() => setIsAddressDialogOpen(false)}
                                            onAddressesUpdate={handleAddressesUpdate}
                                        />
                                    </DialogContent>
                                </Dialog>
                            )}
                            {showCancelButton && (
                                <Dialog open={isCancelFlowOpen} onOpenChange={setIsCancelFlowOpen}>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive"><XCircle className="mr-2 h-4 w-4" /> Cancel Order</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently cancel your order.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Go Back</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => setIsCancelFlowOpen(true)}>Continue</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

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
                                                    <p>An OTP has been sent to your registered mobile number for verification.</p>
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
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </DialogContent>
                                </Dialog>
                            )}
                             {showReturnButton && (
                                <Dialog open={isReturnFlowOpen} onOpenChange={setIsReturnFlowOpen}>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                             <Button variant="outline"><RotateCcw className="mr-2 h-4 w-4" /> Return Product</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Return this product?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                   This will start the return process for this item. Are you sure you want to continue?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Go Back</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => setIsReturnFlowOpen(true)}>Continue</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Return Product</DialogTitle>
                                            <DialogDescription>
                                                Please complete the following steps to return your product.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <Tabs value={returnStep} onValueChange={setReturnStep} className="w-full">
                                            <TabsList className="grid w-full grid-cols-3">
                                                <TabsTrigger value="reason" disabled={returnStep !== 'reason'}>Reason</TabsTrigger>
                                                <TabsTrigger value="feedback" disabled={!returnReason}>Feedback</TabsTrigger>
                                                <TabsTrigger value="confirm" disabled={!returnReason}>Confirm</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="reason" className="py-4">
                                                <RadioGroup value={returnReason} onValueChange={setReturnReason}>
                                                    <div className="space-y-2">
                                                        {returnReasons.map(reason => (
                                                            <div key={reason} className="flex items-center space-x-2">
                                                                <RadioGroupItem value={reason} id={`return-${reason}`} />
                                                                <Label htmlFor={`return-${reason}`}>{reason}</Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </RadioGroup>
                                                <Button onClick={() => setReturnStep('feedback')} disabled={!returnReason} className="mt-4 w-full">Next</Button>
                                            </TabsContent>
                                            <TabsContent value="feedback" className="py-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="return-feedback">Feedback (Optional)</Label>
                                                    <Textarea id="return-feedback" value={returnFeedback} onChange={(e) => setReturnFeedback(e.target.value)} placeholder="Tell us more..." />
                                                </div>
                                                <Button onClick={() => setReturnStep('confirm')} className="mt-4 w-full">Next</Button>
                                            </TabsContent>
                                            <TabsContent value="confirm" className="py-4">
                                                <div className="flex flex-col items-center gap-4 text-center">
                                                    <ShieldCheck className="h-12 w-12 text-primary" />
                                                    <p>An OTP has been sent for verification to confirm your return request.</p>
                                                    <InputOTP
                                                        maxLength={6}
                                                        value={returnOtp}
                                                        onChange={(value) => {
                                                            setReturnOtp(value);
                                                            if (value.length === 6) {
                                                                handleConfirmReturn(value);
                                                            }
                                                        }}
                                                    >
                                                        <InputOTPGroup>
                                                            <InputOTPSlot index={0} />
                                                            <InputOTPSlot index={1} />
                                                            <InputOTPSlot index={2} />
                                                            <InputOTPSlot index={3} />
                                                            <InputOTPSlot index={4} />
                                                            <InputOTPSlot index={5} />
                                                        </InputOTPGroup>
                                                    </InputOTP>
                                                    {isVerifyingReturnOtp && <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Verifying...</div>}
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </DialogContent>
                                </Dialog>
                            )}
                             {showRefundButton && (
                                <Button onClick={handleRefundRequest}>
                                    <AlertTriangle className="mr-2 h-4 w-4" /> Request Refund
                                </Button>
                            )}
                        </CardFooter>
                    )}
                </Card>
            </main>
            <Footer />
        </div>
    );
}

    