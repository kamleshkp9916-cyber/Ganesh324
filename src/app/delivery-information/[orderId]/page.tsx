
"use client";

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Circle, Truck, Package, PackageCheck, PackageOpen, Home, CalendarDays, XCircle, Hourglass, Edit, AlertTriangle, MessageSquare, ShieldCheck, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth.tsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useEffect, useState, useMemo } from 'react';
import { Footer } from '@/components/footer';
import { useToast } from "@/hooks/use-toast";
import { format, addDays, parse } from 'date-fns';
import { allOrderData, Order, OrderId, getStatusFromTimeline } from '@/lib/order-data';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { EditAddressForm } from '@/components/edit-address-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';


const getStatusIcon = (status: string) => {
    if (status.toLowerCase().includes("pending")) return <Hourglass className="h-5 w-5" />;
    if (status.toLowerCase().includes("confirmed")) return <PackageOpen className="h-5 w-5" />;
    if (status.toLowerCase().includes("packed")) return <Package className="h-5 w-5" />;
    if (status.toLowerCase().includes("dispatch")) return <PackageCheck className="h-5 w-5" />;
    if (status.toLowerCase().includes("shipped")) return <Truck className="h-5 w-5" />;
    if (status.toLowerCase().includes("in transit")) return <Truck className="h-5 w-5" />;
    if (status.toLowerCase().includes("out for delivery")) return <Truck className="h-5 w-5" />;
    if (status.toLowerCase().includes("delivered")) return <Home className="h-5 w-5" />;
    if (status.toLowerCase().includes('cancelled') || status.toLowerCase().includes('undelivered') || status.toLowerCase().includes('failed delivery attempt') || status.toLowerCase().includes('returned')) return <XCircle className="h-5 w-5" />;
    return <Circle className="h-5 w-5" />;
};

const cancellationReasons = [
    "Changed my mind",
    "Found a better deal elsewhere",
    "Ordered by mistake",
    "Delivery time is too long",
    "Other"
];


export default function DeliveryInformationPage() {
    const router = useRouter();
    const params = useParams();
    const { user, loading } = useAuth();
    const { toast } = useToast();
    const [isMounted, setIsMounted] = useState(false);

    const orderId = decodeURIComponent(params.orderId as string) as OrderId;
    
    // We get the order directly but use a force-rerender state for local updates
    const [_, setForceRerender] = useState(0);
    const order = allOrderData[orderId] || allOrderData["#STREAM5896"];


    const [isCancelFlowOpen, setIsCancelFlowOpen] = useState(false);
    const [cancelStep, setCancelStep] = useState("reason");
    const [cancelReason, setCancelReason] = useState("");
    const [cancelFeedback, setCancelFeedback] = useState("");
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [otp, setOtp] = useState('');


    useEffect(() => {
        setIsMounted(true);
    }, []);
    
    const estimatedDeliveryDate = useMemo(() => {
        if (!order || !order.orderDate) return null;
        try {
            const parsedDate = parse(order.orderDate, 'MMM dd, yyyy', new Date());
            const deliveryDate = addDays(parsedDate, 6);
            return format(deliveryDate, 'E, MMM dd, yyyy');
        } catch (error) {
            console.error("Error parsing date:", error);
            return null;
        }
    }, [order]);


    if (!isMounted || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        )
    }
    
    if (!user) {
        router.push('/');
        return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
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

    const currentStatus = getStatusFromTimeline(order.timeline);
    const lastCompletedIndex = order.timeline.slice().reverse().findIndex(item => item.completed);
    const currentStatusIndex = order.timeline.length - 1 - lastCompletedIndex;


    const handleConfirmCancellation = async (otpValue: string) => {
        if (otpValue !== '123456') {
            toast({
                title: "Invalid OTP",
                description: "The OTP you entered is incorrect. Please try again.",
                variant: "destructive"
            });
            return;
        }

        setIsVerifyingOtp(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // This is where we update the central data source
        allOrderData[orderId].timeline.push({ 
            status: 'Cancelled by user', 
            date: format(new Date(), 'MMM dd, yyyy'), 
            time: format(new Date(), 'hh:mm a'), 
            completed: true 
        });

        // Force a re-render to show the updated timeline
        setForceRerender(val => val + 1);
        
        toast({
            title: "Order Cancelled",
            description: `Order ${orderId} has been cancelled.`,
            variant: "destructive"
        });

        setIsVerifyingOtp(false);
        setIsCancelFlowOpen(false);
        setCancelStep("reason");
        setCancelReason("");
        setCancelFeedback("");
        setOtp("");
    };
    
    const handleAddressSave = (data: any) => {
        toast({
            title: "Address Updated",
            description: "Your delivery address has been successfully updated.",
        });
    }

    const handleRefundRequest = () => {
        toast({
            title: "Refund Request Submitted",
            description: "Your refund request is being processed. You will be notified shortly.",
        });
    }
    
    const showCancelButton = ['Pending', 'Order Confirmed', 'Shipped'].includes(currentStatus);
    const showEditAddressButton = currentStatus === 'Pending' || currentStatus === 'Order Confirmed';
    const showRefundButton = currentStatus === 'Cancelled by user' || currentStatus.includes('Failed Delivery') || currentStatus === 'Returned';


    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold">
                    Delivery Information
                </h1>
                <div className="w-10"></div>
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
                            <Card className="overflow-hidden">
                                <CardContent className="p-4 flex flex-col items-center text-center">
                                    <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden mb-4">
                                        <Image
                                            src={order.product.imageUrl}
                                            alt={order.product.name}
                                            width={200}
                                            height={200}
                                            className="object-cover w-full h-full"
                                            data-ai-hint={order.product.hint}
                                        />
                                    </div>
                                    <h3 className="font-semibold text-lg">{order.product.name}</h3>
                                    <p className="text-primary font-bold">{order.product.price}</p>
                                </CardContent>
                            </Card>
                                {estimatedDeliveryDate && !['Cancelled by user', 'Delivered', 'Undelivered', 'Returned'].includes(currentStatus) && (
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
                            <div className="relative">
                                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border -z-10" />
                                <ul className="space-y-8">
                                    {order.timeline.map((item, index: number) => (
                                        <li key={index} className="flex items-start gap-4">
                                            <div className={cn(
                                                "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-1",
                                                item.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                            )}>
                                                {item.completed ? <CheckCircle2 className="h-5 w-5" /> : getStatusIcon(item.status) }
                                            </div>
                                            <div className="flex-grow">
                                                <p className={cn("font-semibold", !item.completed && "text-muted-foreground")}>
                                                    {item.status.split(':')[0]}
                                                </p>
                                                {index === currentStatusIndex && item.status.includes(':') && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.status.split(':')[1]}
                                                    </p>
                                                )}
                                                {item.date && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.date} {item.time && `- ${item.time}`}
                                                    </p>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                    {(showCancelButton || showEditAddressButton || showRefundButton) && (
                        <CardFooter className="flex flex-wrap justify-end gap-2 border-t pt-6">
                            {showEditAddressButton && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit Address</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Edit Delivery Address</DialogTitle>
                                        </DialogHeader>
                                        <EditAddressForm onSave={handleAddressSave} onCancel={() => {}} />
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

    