
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Wallet, PanelLeft, Search, Star, X } from 'lucide-react';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

const allOngoingOrders = [
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

const allCompletedOrders = [
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

const allCancelledOrders = [
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
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const allOrders = useMemo(() => [...allOngoingOrders, ...allCompletedOrders, ...allCancelledOrders], []);

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return allOrders;
    return allOrders.filter(order => 
        order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allOrders]);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);


  if (loading || !user) {
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        )
    }
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
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-destructive">StreamCart</h2>
            </div>
            <nav className="flex flex-col gap-2">
                <Link href="#" className="flex items-center gap-3 p-3 rounded-md bg-primary/10 text-primary font-semibold">
                    <Wallet className="h-5 w-5" />
                    <span>Overview</span>
                </Link>
                <Link href="/wallet" className="flex items-center gap-3 p-3 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
                    <Wallet className="h-5 w-5" />
                    <span>Wallet</span>
                </Link>
            </nav>
        </aside>
        <main className="flex-grow p-6 flex flex-col gap-6">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:inline-flex">
                        <PanelLeft />
                    </Button>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                             <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'}/>
                             <AvatarFallback>{user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{user.displayName}</h3>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                <Star className="h-6 w-6 fill-current" />
                            </Button>
                            <span className="text-muted-foreground text-base">/ Overview</span>
                        </div>
                    </div>
                </div>
                 <div className="flex items-center gap-2" ref={searchRef}>
                    <div className={cn(
                        "relative flex items-center transition-all duration-300 ease-in-out",
                        isSearchExpanded ? "w-64" : "w-10"
                    )}>
                        <Search className={cn("h-5 w-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2", isSearchExpanded && "block")} />
                        <Input 
                            placeholder="Search orders..." 
                            className={cn(
                                "bg-background rounded-full transition-all duration-300 ease-in-out",
                                isSearchExpanded ? "opacity-100 w-full pl-10 pr-4" : "opacity-0 w-0 pl-0 pr-0"
                            )}
                            onFocus={() => setIsSearchExpanded(true)}
                             value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-foreground rounded-full hover:bg-accent absolute right-0 top-1/2 -translate-y-1/2 h-9 w-9"
                            onClick={() => setIsSearchExpanded(p => !p)}
                        >
                            {isSearchExpanded ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            </header>
            
            <div className="flex-grow">
                <h3 className="text-2xl font-bold mb-6">Order list</h3>
                <div className="space-y-4">
                    {filteredOrders.map(order => <OrderCard key={order.id} order={order} />)}
                </div>
            </div>
        </main>
      </div>
    </div>
  );
}
