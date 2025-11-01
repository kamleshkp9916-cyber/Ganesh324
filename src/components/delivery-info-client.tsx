
"use client";

import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Circle, Truck, Package, PackageCheck, PackageOpen, Home, CalendarDays, XCircle, Hourglass, Edit, AlertTriangle, MessageSquare, ShieldCheck, Loader2, RotateCcw, Star, Share2, Upload, Image as ImageIcon, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth.tsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { format, addDays, parse, differenceInDays, intervalToDuration, formatDuration, parseISO } from 'date-fns';
import { getOrderById, Order, getStatusFromTimeline, saveAllOrders } from '@/lib/order-data';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { EditAddressForm } from '@/components/edit-address-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { Badge } from './ui/badge';
import { productDetails } from '@/lib/product-data';
import { addReview, Review, updateReview, getReviews } from '@/lib/review-data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Footer } from './footer';
import { addTransaction } from '@/lib/transaction-history';
import { updateUserData } from '@/lib/follow-data';

export const ReviewDialog = ({ order, onReviewSubmit, closeDialog, user, reviewToEdit }: { order?: Order, onReviewSubmit: (review: any) => void, closeDialog: () => void, user: any, reviewToEdit?: Review }) => {
    const [rating, setRating] = useState(reviewToEdit?.rating || 0);
    const [reviewText, setReviewText] = useState(reviewToEdit?.text || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(reviewToEdit?.imageUrl || null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

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
                imageUrl: imagePreview,
                hint: reviewToEdit?.hint || order?.products[0].hint,
                productInfo: reviewToEdit?.productInfo,
                userId: user.uid,
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
                 <div>
                    <input type="file" ref={imageInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    <Button variant="outline" onClick={() => imageInputRef.current?.click()}>
                        <ImageIcon className="mr-2 h-4 w-4" />
                        {imagePreview ? 'Change' : 'Upload'} Image
                    </Button>
                </div>
                 {imagePreview && (
                    <div className="relative w-32 h-32">
                        <Image src={imagePreview} alt="Review preview" layout="fill" className="rounded-md object-cover" />
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={() => setImagePreview(null)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
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
    const [myReview, setMyReview] = useState<Review | null>(null);
    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

    const fetchOrder = useCallback(async () => {
        const fetchedOrder = await getOrderById(orderId);
        setOrder(fetchedOrder);
    }, [orderId]);

    useEffect(() => {
        setIsMounted(true);
        fetchOrder();
    }, [fetchOrder]);
    
    useEffect(() => {
        if (user && order) {
             const existingReviews = getReviews(order.products[0].key);
             const userReview = existingReviews.find(r => r.userId === user.uid);
             if (userReview) {
                 setMyReview(userReview);
             }
        }
    }, [user, order]);

    const estimatedDeliveryDate = useMemo(() => {
        if (!order || !order.orderDate) return null;
        try {
            const parsedDate = parseISO(order.orderDate);
            const deliveryDate = addDays(parsedDate, 5);
            return format(deliveryDate, 'E, MMM dd, yyyy');
        } catch (error) {
            console.error("Error parsing date:", error);
            return null;
        }
    }, [order]);

    const currentStatus = useMemo(() => order ? getStatusFromTimeline(order.timeline) : "", [order]);

    const isReturnWindowActive = useMemo(() => {
        if (!order || currentStatus !== 'Delivered' || order.isReturnable === false) {
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
    

     const handleConfirmCancellation = async (otpValue: string) => {
        if (otpValue !== '123456') {
            toast({ title: "Invalid OTP", variant: "destructive" });
            return;
        }
        setIsVerifyingOtp(true);
        try {
            const allOrdersJSON = localStorage.getItem('streamcart_orders');
            let allOrders: Order[] = allOrdersJSON ? JSON.parse(allOrdersJSON) : [];
            
            const orderIndex = allOrders.findIndex(o => o.orderId === orderId);

            if (orderIndex !== -1) {
                const updatedOrder = { ...allOrders[orderIndex] };
                updatedOrder.timeline.push({ status: 'Cancelled by user', date: format(new Date(), 'MMM dd, yyyy'), time: format(new Date(), 'p'), completed: true });
                updatedOrder.timeline.push({ status: 'Refund Initiated: The amount will be credited to your original payment method within 5-7 business days.', date: format(new Date(), 'MMM dd, yyyy'), time: format(new Date(), 'p'), completed: false });
                allOrders[orderIndex] = updatedOrder;
                saveAllOrders(allOrders);
                setOrder(updatedOrder);

                addTransaction({
                    id: Date.now(),
                    transactionId: `REF-${order.orderId.replace('#', '')}`,
                    type: 'Refund',
                    description: `For cancelled order ${order.orderId}`,
                    date: format(new Date(), 'MMM dd, yyyy'),
                    time: format(new Date(), 'p'),
                    amount: order.total,
                    status: 'Processing',
                });
                
                toast({ title: "Order Cancelled & Refund Initiated" });
                setIsCancelFlowOpen(false);
                setCancelStep("reason");
                setCancelReason("");
                setCancelFeedback("");
                setOtp("");
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
    
     const handleConfirmReturn = async (otpValue: string) => {
        if (otpValue !== '654321') {
            toast({ title: "Invalid OTP", variant: "destructive" });
            return;
        }
        setIsVerifyingReturnOtp(true);
        try {
            const allOrdersJSON = localStorage.getItem('streamcart_orders');
            let allOrders: Order[] = allOrdersJSON ? JSON.parse(allOrdersJSON) : [];
            
            const orderIndex = allOrders.findIndex(o => o.orderId === orderId);
             if (orderIndex !== -1) {
                const updatedOrder = { ...allOrders[orderIndex] };
                updatedOrder.timeline.push({ status: 'Return Initiated', date: format(new Date(), 'MMM dd, yyyy'), time: format(new Date(), 'p'), completed: true });
                allOrders[orderIndex] = updatedOrder;
                saveAllOrders(allOrders);
                setOrder(updatedOrder);

                toast({ title: "Return Initiated" });
                setIsReturnFlowOpen(false);
                setReturnStep("reason");
                setReturnReason("");
                setReturnFeedback("");
                setReturnOtp("");
            }
        } catch (error) {
            toast({ title: "Return Failed", variant: "destructive" });
        } finally {
            setIsVerifyingReturnOtp(false);
        }
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
        if (!order) return;

        if (myReview) {
             updateReview(order.products[0].key, review);
             toast({
                title: "Review Updated!",
                description: "Thank you for updating your feedback.",
            });
        } else {
             addReview(order.products[0].key, review);
             toast({
                title: "Review Submitted!",
                description: "Thank you for your feedback. It is now visible on the product page.",
            });
        }
        setMyReview(review);
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
    
    const showCancelButton = !['Delivered', 'Return Initiated', 'Return package picked up', 'Returned', 'Cancelled by user'].includes(currentStatus);
    const showEditAddressButton = currentStatus === 'Pending' || currentStatus === 'Order Confirmed';
    const showReturnButton = currentStatus === 'Delivered' && order.isReturnable !== false && isReturnWindowActive;
    const showRefundButton = currentStatus === 'Returned';
    const showReviewButton = currentStatus === 'Delivered';
    
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
                <Card className="max-w-4xl mx-auto bg-background">
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
                                    <Card className="overflow-hidden bg-card/10">
                                        <CardContent className="p-4 flex flex-col items-center text-center">
                                            <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden mb-4 relative">
                                                <Image
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover w-full h-full"
                                                    data-ai-hint={product.hint}
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
                                <Card className="bg-card/10">
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
                                {order.timeline.map((item, index: number) => (
                                    <li key={index} className="flex items-start gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={cn(
                                                "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-1 z-10",
                                                item.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                            )}>
                                                {item.completed ? <CheckCircle2 className="h-5 w-5" /> : getStatusIcon(item.status) }
                                            </div>
                                            {index < order.timeline.length - 1 && (
                                                <div className="w-0.5 h-10 bg-border/50" />
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
                        <CardFooter className="flex flex-wrap items-center justify-end gap-2 border-t border-border/50 pt-6">
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
