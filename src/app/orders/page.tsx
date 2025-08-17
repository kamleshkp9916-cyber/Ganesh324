
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutGrid, Wallet, PanelLeft, Search } from 'lucide-react';
import { Footer } from '@/components/footer';
import Link from 'next/link';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const ongoingOrders = [
    {
      id: '#12548',
      productName: 'Gaming Headset',
      productImage: 'https://placehold.co/80x80.png',
      hint: 'gaming headset',
      quantity: 1,
      price: '₹7,999.00',
      status: 'In Transit',
    },
    {
      id: '#12549',
      productName: 'Mechanical Keyboard',
      productImage: 'https://placehold.co/80x80.png',
      hint: 'mechanical keyboard',
      quantity: 1,
      price: '₹12,999.00',
      status: 'Processing',
    },
];

const completedOrders = [
    {
      id: '#12540',
      productName: 'Vintage Camera',
      productImage: 'https://placehold.co/80x80.png',
      hint: 'vintage camera',
      quantity: 1,
      price: '₹12,500.00',
      status: 'Delivered',
    },
    {
      id: '#12541',
      productName: 'Wireless Headphones',
      productImage: 'https://placehold.co/80x80.png',
      hint: 'wireless headphones',
      quantity: 1,
      price: '₹4,999.00',
      status: 'Delivered',
    },
];

const cancelledOrders = [
    {
      id: '#12535',
      productName: 'Smart Watch',
      productImage: 'https://placehold.co/80x80.png',
      hint: 'smartwatch',
      quantity: 1,
      price: '₹8,750.00',
      status: 'Cancelled',
    },
];

const OrderCard = ({ order }: { order: any }) => {
    const getStatusClass = (status: string) => {
        switch (status) {
            case 'In Transit':
                return 'bg-blue-100 text-blue-800';
            case 'Processing':
                return 'bg-yellow-100 text-yellow-800';
            case 'Delivered':
                return 'bg-green-100 text-green-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-sm">Order ID: {order.id}</span>
                    <Badge className={cn("text-xs font-bold", getStatusClass(order.status))}>{order.status}</Badge>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                        <Image src={order.productImage} alt={order.productName} width={80} height={80} data-ai-hint={order.hint} />
                    </div>
                    <div className="flex-grow">
                        <h4 className="font-semibold">{order.productName}</h4>
                        <p className="text-sm text-muted-foreground">Qty: {order.quantity}</p>
                        <p className="font-bold">{order.price}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button size="sm">Track Order</Button>
                </div>
            </CardContent>
        </Card>
    );
};


export default function OrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
             <p className="text-muted-foreground mb-6">Please log in to view your orders.</p>
             <Button onClick={() => router.push('/')}>Go to Login</Button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 text-foreground flex flex-col">
      <div className="flex flex-1">
        <aside className={cn(
            "hidden md:flex flex-col w-[20%] border-r bg-background p-4 transition-all duration-300",
            !isSidebarOpen && "w-0 p-0 border-none overflow-hidden"
        )}>
            <h2 className="text-destructive font-bold text-2xl mb-8 whitespace-nowrap">StreamCart</h2>
            <nav className="flex flex-col gap-2">
                <Link href="#" className="flex items-center gap-3 p-3 rounded-md bg-primary/10 text-primary font-semibold">
                    <LayoutGrid className="h-5 w-5" />
                    <span className="whitespace-nowrap">Overview</span>
                </Link>
                <Link href="/wallet" className="flex items-center gap-3 p-3 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
                    <Wallet className="h-5 w-5" />
                    <span className="whitespace-nowrap">Wallet</span>
                </Link>
            </nav>
        </aside>
        <main className="flex-grow p-6 flex flex-col gap-6">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden">
                        <PanelLeft />
                    </Button>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'}/>
                            <AvatarFallback>{user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-semibold text-lg">{user.displayName}</h3>
                            <p className="text-sm text-muted-foreground">Welcome Back</p>
                        </div>
                         <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:inline-flex ml-2">
                            <PanelLeft />
                        </Button>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                        <Search className="h-6 w-6" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </div>
            </header>
            
            <div className="flex-grow">
                <Tabs defaultValue="ongoing">
                    <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex bg-background rounded-lg p-1">
                        <TabsTrigger value="ongoing" className="flex-1">
                            Ongoing <Badge className="ml-2 bg-primary/20 text-primary">{ongoingOrders.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="flex-1">
                            Completed <Badge className="ml-2">{completedOrders.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="cancelled" className="flex-1">
                            Cancelled <Badge className="ml-2">{cancelledOrders.length}</Badge>
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="ongoing" className="mt-6 space-y-4">
                        {ongoingOrders.map(order => <OrderCard key={order.id} order={order} />)}
                    </TabsContent>
                    <TabsContent value="completed" className="mt-6 space-y-4">
                        {completedOrders.map(order => <OrderCard key={order.id} order={order} />)}
                    </TabsContent>
                    <TabsContent value="cancelled" className="mt-6 space-y-4">
                        {cancelledOrders.map(order => <OrderCard key={order.id} order={order} />)}
                    </TabsContent>
                </Tabs>
            </div>
        </main>
      </div>
    </div>
  );
}
