
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Wallet, PanelLeft, Search, Star, X, Filter } from 'lucide-react';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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


  if (!isClient || loading) {
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
            
            <div className="flex-grow bg-background border p-4">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Order list</h3>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64" align="end">
                            <DropdownMenuLabel>Filter Orders</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <div className="px-2 py-1.5">
                                     <Label htmlFor="orderIdFilter">Order ID</Label>
                                     <Input id="orderIdFilter" placeholder="Search by Order ID..." className="mt-1 h-8" />
                                </div>
                                <div className="px-2 py-1.5">
                                     <Label htmlFor="customerNameFilter">Customer Name</Label>
                                     <Input id="customerNameFilter" placeholder="Search by Name..." className="mt-1 h-8" />
                                </div>
                                 <div className="px-2 py-1.5">
                                     <Label htmlFor="productNameFilter">Product Name</Label>
                                     <Input id="productNameFilter" placeholder="Search by Product..." className="mt-1 h-8" />
                                </div>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                                <DropdownMenuRadioItem value="all">All Statuses</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="ongoing">Ongoing</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="completed">Completed</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="cancelled">Cancelled</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="space-y-4">
                </div>
            </div>
        </main>
      </div>
    </div>
  );
}
