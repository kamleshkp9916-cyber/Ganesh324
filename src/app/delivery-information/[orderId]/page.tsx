
"use client";

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Circle, Truck, Package, PackageCheck, PackageOpen, Home, CalendarDays, XCircle, Hourglass } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth.tsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useEffect, useState, useMemo } from 'react';
import { Footer } from '@/components/footer';
import { useToast } from "@/hooks/use-toast";
import { format, addDays, parse } from 'date-fns';

// Mock data - in a real app, you'd fetch this based on the orderId
const mockOrderData = {
    "#STREAM5896": {
        product: { name: "Vintage Camera", imageUrl: "https://placehold.co/150x150.png", hint: "vintage camera", price: "₹12,500.00" },
        status: "In Transit",
        orderDate: "Jul 27, 2024",
        timeline: [
            { status: "Order Confirmed", date: "Jul 27, 2024", time: "10:31 PM", completed: true },
            { status: "Packed", date: "Jul 28, 2024", time: "09:00 AM", completed: true },
            { status: "Shipped: The package has left the sender's location.", date: "Jul 28, 2024", time: "05:00 PM", completed: true },
            { status: "In Transit: The package is on its way to the recipient.", date: "Jul 29, 2024", time: "Current status", completed: false },
            { status: "Out for Delivery: The package has reached the local delivery hub and is being delivered by the courier.", date: null, time: null, completed: false },
            { status: "Delivered: The package has been successfully delivered to the recipient.", date: null, time: null, completed: false },
        ]
    },
    "#STREAM5897": {
        product: { name: "Wireless Headphones", imageUrl: "https://placehold.co/150x150.png", hint: "headphones", price: "₹4,999.00" },
        status: "Delivered",
        orderDate: "Jul 26, 2024",
        timeline: [
            { status: "Order Confirmed", date: "Jul 26, 2024", time: "08:16 AM", completed: true },
            { status: "Packed", date: "Jul 26, 2024", time: "11:00 AM", completed: true },
            { status: "Shipped: The package has left the sender's location.", date: "Jul 26, 2024", time: "06:00 PM", completed: true },
            { status: "Out for Delivery: The package has reached the local delivery hub and is being delivered by the courier.", date: "Jul 27, 2024", time: "09:00 AM", completed: true },
            { status: "Delivered: The package has been successfully delivered to the recipient.", date: "Jul 27, 2024", time: "11:30 AM", completed: true },
        ]
    },
     "#STREAM5898": {
        product: { name: "Leather Backpack", imageUrl: "https://placehold.co/150x150.png", hint: "leather backpack", price: "₹6,200.00" },
        status: "Delivered",
        orderDate: "Jul 25, 2024",
        timeline: [
            { status: "Order Confirmed", date: "Jul 25, 2024", time: "02:00 PM", completed: true },
            { status: "Delivered: The package has been successfully delivered to the recipient.", date: "Jul 26, 2024", time: "01:00 PM", completed: true },
        ]
    },
    "#STREAM5899": {
        product: { name: "Smart Watch", imageUrl: "https://placehold.co/150x150.png", hint: "smart watch", price: "₹8,750.00" },
        status: "Cancelled",
        orderDate: "Jul 25, 2024",
        timeline: [
            { status: "Order Confirmed", date: "Jul 25, 2024", time: "11:45 AM", completed: true },
            { status: "Cancelled by user", date: "Jul 25, 2024", time: "12:00 PM", completed: true },
        ]
    },
    "#STREAM5910": {
        product: { name: "Gaming Keyboard", imageUrl: "https://placehold.co/150x150.png", hint: "gaming keyboard", price: "₹5,500.00" },
        status: "Undelivered",
        orderDate: "Jul 24, 2024",
        timeline: [
            { status: "Order Confirmed", date: "Jul 24, 2024", time: "10:00 AM", completed: true },
            { status: "Shipped: The package has left the sender's location.", date: "Jul 24, 2024", time: "04:00 PM", completed: true },
            { status: "Out for Delivery: The package has reached the local delivery hub and is being delivered by the courier.", date: "Jul 25, 2024", time: "09:30 AM", completed: true },
            { status: "Failed Delivery Attempt: The courier attempted delivery but was unsuccessful. Address not found.", date: "Jul 25, 2024", time: "02:00 PM", completed: true },
        ]
    },
    "#STREAM5905": {
        product: { name: "Designer Sunglasses", imageUrl: "https://placehold.co/150x150.png", hint: "sunglasses", price: "₹7,800.00" },
        status: "Pending",
        orderDate: "Jul 28, 2024",
        timeline: [
            { status: "Pending", date: "Jul 28, 2024", time: "02:30 PM", completed: false },
            { status: "Order Confirmed", date: null, time: null, completed: false },
            { status: "Shipped: The package has left the sender's location.", date: null, time: null, completed: false },
            { status: "Delivered: The package has been successfully delivered to the recipient.", date: null, time: null, completed: false },
        ]
    },
    "#STREAM5906": {
        product: { name: "Mechanical Keyboard", imageUrl: "https://placehold.co/150x150.png", hint: "keyboard", price: "₹9,500.00" },
        status: "Pending",
        orderDate: "Jul 29, 2024",
        timeline: [
            { status: "Pending", date: "Jul 29, 2024", time: "11:00 AM", completed: false },
            { status: "Order Confirmed", date: null, time: null, completed: false },
            { status: "Shipped: The package has left the sender's location.", date: null, time: null, completed: false },
            { status: "Delivered: The package has been successfully delivered to the recipient.", date: null, time: null, completed: false },
        ]
    }
};

const getStatusIcon = (status: string) => {
    if (status.toLowerCase().includes("pending")) return <Hourglass className="h-5 w-5" />;
    if (status.toLowerCase().includes("confirmed")) return <PackageOpen className="h-5 w-5" />;
    if (status.toLowerCase().includes("packed")) return <Package className="h-5 w-5" />;
    if (status.toLowerCase().includes("dispatch")) return <PackageCheck className="h-5 w-5" />;
    if (status.toLowerCase().includes("shipped")) return <Truck className="h-5 w-5" />;
    if (status.toLowerCase().includes("in transit")) return <Truck className="h-5 w-5" />;
    if (status.toLowerCase().includes("out for delivery")) return <Truck className="h-5 w-5" />;
    if (status.toLowerCase().includes("delivered")) return <Home className="h-5 w-5" />;
    if (status.toLowerCase().includes('cancelled') || status.toLowerCase().includes('undelivered') || status.toLowerCase().includes('failed delivery attempt')) return <XCircle className="h-5 w-5" />;
    return <Circle className="h-5 w-5" />;
};

type Order = (typeof mockOrderData)['#STREAM5896'];

export default function DeliveryInformationPage() {
    const router = useRouter();
    const params = useParams();
    const { user, loading } = useAuth();
    const { toast } = useToast();
    const [isMounted, setIsMounted] = useState(false);

    const orderId = decodeURIComponent(params.orderId as string);
    const order = (mockOrderData as Record<string, Order>)[orderId] || (mockOrderData as any)["#STREAM5896"]; // Fallback for demo
    
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


    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        toast({
            title: "Order Successful!",
            description: `Your order ${orderId} has been placed.`,
        });

        order.timeline.forEach((item, index) => {
            if(item.completed) {
                setTimeout(() => {
                    toast({
                        title: item.status.split(':')[0],
                        description: `Update for order ${orderId}`,
                    })
                }, (index + 1) * 2000);
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted]);

     if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        )
    }
    
    if (!user) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                 <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
                 <p className="text-muted-foreground mb-6">Please log in to view delivery information.</p>
                 <Button onClick={() => router.push('/')}>Go to Login</Button>
            </div>
        );
    }

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
                     {!isMounted ? (
                        <div className="flex items-center justify-center h-96">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <>
                            <CardHeader>
                                <CardTitle className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                                <span>Order ID: {orderId}</span>
                                <span className="text-sm font-medium text-muted-foreground">Status: {order.status}</span>
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
                                     {estimatedDeliveryDate && order.status !== 'Cancelled' && order.status !== 'Delivered' && order.status !== 'Undelivered' && (
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
                                            {order.timeline.map((item: any, index: number) => (
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
                                                        <p className="text-sm text-muted-foreground">
                                                            {item.status.split(':')[1]}
                                                        </p>
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
                        </>
                    )}
                </Card>
            </main>
            <Footer />
        </div>
    );
}
