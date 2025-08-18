
"use client";

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Circle, Truck, Package, PackageCheck, PackageOpen, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth.tsx';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Link from 'next/link';
import { useEffect, useState } from 'react';


// Mock data - in a real app, you'd fetch this based on the orderId
const mockOrderData = {
    "#STREAM5896": {
        product: { name: "Vintage Camera", imageUrl: "https://placehold.co/150x150.png", hint: "vintage camera", price: "₹12,500.00" },
        status: "On Way",
        timeline: [
            { status: "Order Confirmed", date: "Jul 27, 2024", time: "10:31 PM", completed: true },
            { status: "Your order is being packed", date: "Jul 28, 2024", time: "09:00 AM", completed: true },
            { status: "Product is ready to dispatch", date: "Jul 28, 2024", time: "01:00 PM", completed: true },
            { status: "Product Shipped from Pune", date: "Jul 28, 2024", time: "05:00 PM", completed: true },
            { status: "In transit to Delhi", date: "Jul 29, 2024", time: "Current status", completed: false },
            { status: "Out for Delivery", date: null, time: null, completed: false },
            { status: "Product delivered successfully", date: null, time: null, completed: false },
        ]
    },
    "#STREAM5897": {
        product: { name: "Wireless Headphones", imageUrl: "https://placehold.co/150x150.png", hint: "headphones", price: "₹4,999.00" },
        status: "Completed",
        timeline: [
            { status: "Order Confirmed", date: "Jul 26, 2024", time: "08:16 AM", completed: true },
            { status: "Your order is being packed", date: "Jul 26, 2024", time: "11:00 AM", completed: true },
            { status: "Product is ready to dispatch", date: "Jul 26, 2024", time: "02:00 PM", completed: true },
            { status: "Product Shipped from Mumbai", date: "Jul 26, 2024", time: "06:00 PM", completed: true },
            { status: "Out for Delivery", date: "Jul 27, 2024", time: "09:00 AM", completed: true },
            { status: "Product delivered successfully", date: "Jul 27, 2024", time: "11:30 AM", completed: true },
        ]
    }
    // Add more mock orders as needed
};

const getStatusIcon = (status: string) => {
    if (status.toLowerCase().includes("confirmed")) return <PackageOpen className="h-5 w-5" />;
    if (status.toLowerCase().includes("packed")) return <Package className="h-5 w-5" />;
    if (status.toLowerCase().includes("dispatch")) return <PackageCheck className="h-5 w-5" />;
    if (status.toLowerCase().includes("shipped") || status.toLowerCase().includes("transit")) return <Truck className="h-5 w-5" />;
    if (status.toLowerCase().includes("out for delivery")) return <Truck className="h-5 w-5" />;
    if (status.toLowerCase().includes("delivered")) return <Home className="h-5 w-5" />;
    return <Circle className="h-5 w-5" />;
};


export default function DeliveryInformationPage() {
    const router = useRouter();
    const params = useParams();
    const { user, loading } = useAuth();
    const orderId = decodeURIComponent(params.orderId as string);
    const order = (mockOrderData as any)[orderId] || (mockOrderData as any)["#STREAM5896"]; // Fallback to a default for demo
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
                 <div className="flex items-center gap-1 md:gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="sm:hidden">
                        <ArrowLeft />
                    </Button>
                    {isMounted && !loading && user && (
                    <div className="flex items-center gap-3">
                        <Link href="/live-selling" className="hidden sm:flex items-center gap-3">
                            <Avatar className="h-8 w-8 md:h-10 md:w-10">
                                 <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'}/>
                                 <AvatarFallback>{user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                            </Avatar>
                            <h3 className="font-semibold text-base md:text-lg">{user.displayName}</h3>
                        </Link>
                        <div className="flex items-center gap-2">
                             <Link href="/orders" className="text-muted-foreground text-sm md:text-base hidden sm:inline hover:text-foreground transition-colors">
                                / Orders
                            </Link>
                            <span className="text-muted-foreground text-sm md:text-base hidden sm:block">
                                / Delivery Information
                            </span>
                        </div>
                    </div>
                    )}
                </div>
                <h1 className="text-xl font-bold sm:hidden">
                    Delivery Information
                </h1>
                <div className="w-10 sm:w-0"></div>
            </header>

            <main className="flex-grow p-4 md:p-8">
                <Card className="max-w-4xl mx-auto">
                     {!isMounted || loading ? (
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
                            <CardContent className="grid md:grid-cols-3 gap-8">
                                <div className="md:col-span-1">
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
                                </div>
                                <div className="md:col-span-2">
                                    <h3 className="text-lg font-semibold mb-4">Order Timeline</h3>
                                    <div className="relative">
                                        {/* The vertical line */}
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
                                                            {item.status}
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
        </div>
    );
}
