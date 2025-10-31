
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Wallet, Search, X, Filter, ChevronLeft, ChevronRight, Clipboard, ChevronDown, Edit, ArrowLeft, MoreHorizontal, CalendarClock, Archive, UserCircle, Plus, Minus } from 'lucide-react';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { getStatusFromTimeline, Order, ORDERS_KEY } from '@/lib/order-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTransactions, Transaction } from '@/lib/transaction-history';

const statusPriority: { [key: string]: number } = {
    "Pending": 1,
    "Order Confirmed": 2,
    "Packed": 3,
    "Shipped": 4,
    "In Transit": 5,
    "Out for Delivery": 6,
    "Delivered": 7,
    "Failed Delivery Attempt": 8,
    "Return Initiated": 9,
    "Return package picked up": 10,
    "Returned": 11,
    "Cancelled by user": 12,
};

function OrderRowSkeleton() {
    return (
        <Card className="p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 text-sm">
                <div className="w-full md:w-2/5 flex items-center gap-4">
                     <Skeleton className="h-16 w-16 rounded-md" />
                     <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                     </div>
                </div>
                <div className="w-full md:w-1/5"><Skeleton className="h-5 w-24" /></div>
                <div className="w-full md:w-1/5"><Skeleton className="h-5 w-20" /></div>
                <div className="w-full md:w-1/5"><Skeleton className="h-6 w-28 rounded-full" /></div>
            </div>
        </Card>
    );
}

function EmptyBoxIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
    );
}

const EmptyOrders = () => {
  const router = useRouter();
  return (
    <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4 flex-grow justify-center">
        <EmptyBoxIcon className="w-16 h-16 text-border" />
        <h3 className="text-xl font-semibold">No Orders Yet</h3>
        <p className="max-w-xs">Looks like you haven't made any orders. Start shopping to see them here.</p>
        <Button onClick={() => router.push('/live-selling')}>Go Shopping</Button>
    </div>
  );
};


export default function OrdersPage() {
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isClient, setIsClient] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchOrders = () => {
        if (!user) {
            setIsLoading(false);
            return;
        };

        setIsLoading(true);
        try {
            const storedOrders = localStorage.getItem(ORDERS_KEY);
            let allOrders = storedOrders ? JSON.parse(storedOrders) : [];
            const userOrders = allOrders.filter((o: Order) => o.userId === user.uid);
            
            setOrders(userOrders);

            const allTransactions = getTransactions();
            setTransactions(allTransactions);

        } catch (error) {
            console.error("Error fetching orders from local storage:", error);
            toast({
                title: "Error",
                description: "Could not fetch your orders.",
                variant: "destructive"
            })
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (user && isClient) {
       fetchOrders();
    } else if (!user && isClient) {
        setIsLoading(false);
        setOrders([]);
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === ORDERS_KEY || event.key === 'streamcart_transactions') {
        fetchOrders();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);

  }, [user, isClient, toast]);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
        const statusA = getStatusFromTimeline(a.timeline);
        const statusB = getStatusFromTimeline(b.timeline);
        const priorityA = statusPriority[statusA] || 99;
        const priorityB = statusPriority[statusB] || 99;
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }
        try {
             return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
        } catch {
            return 0;
        }
    });
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let currentOrders = [...sortedOrders];
    if (statusFilter !== "all") {
        currentOrders = currentOrders.filter(order => getStatusFromTimeline(order.timeline).toLowerCase().replace(/ /g, '-') === statusFilter);
    }
    if (searchTerm) {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        currentOrders = currentOrders.filter(order =>
            order.orderId.toLowerCase().includes(lowercasedSearchTerm) ||
            order.products.some(p => p.name.toLowerCase().includes(lowercasedSearchTerm)) ||
            (order.address.village + ", " + order.address.city).toLowerCase().includes(lowercasedSearchTerm)
        );
    }
    return currentOrders;
  }, [statusFilter, searchTerm, sortedOrders]);

  const filteredTransactions = useMemo(() => {
      if (!searchTerm) return transactions;
      return transactions.filter(t => 
        t.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, transactions]);
  
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage, itemsPerPage]);

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

  if (!isClient || authLoading) {
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

  const getStatusBadgeVariant = (status: string): BadgeProps['variant'] => {
    switch (status) {
        case 'Delivered': return 'success';
        case 'Shipped': case 'In Transit': case 'Out for Delivery': return 'warning';
        case 'Cancelled by user': case 'Cancelled by admin': case 'Returned': return 'destructive';
        case 'Pending': return 'info';
        default: return 'outline';
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: "Copied!",
        description: `${text} has been copied to your clipboard.`,
    });
  };

  const handleRowClick = (orderId: string) => {
      const encodedOrderId = encodeURIComponent(orderId);
      router.push(`/delivery-information/${encodedOrderId}`);
  }

  const renderOrdersContent = () => {
    if (isLoading) {
        return (
            <div className="space-y-4 flex-grow">
                {Array.from({ length: 5 }).map((_, index) => <OrderRowSkeleton key={index} />)}
            </div>
        );
    }
    
    if (paginatedOrders.length > 0) {
        return (
            <div className="flex-grow space-y-4">
                {paginatedOrders.map((order: Order) => (
                    <Card key={order.orderId} className="hover:bg-muted/50 cursor-pointer" onClick={() => handleRowClick(order.orderId)}>
                        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-[2fr,1.5fr,1fr,1fr,auto] items-center gap-4">
                            {/* Product Info */}
                            <div className="col-span-2 md:col-span-1 flex items-center gap-4">
                                <Image src={order.products[0].imageUrl} alt={order.products[0].name} width={64} height={64} className="rounded-md bg-muted" data-ai-hint={order.products[0].hint} />
                                <div className="flex-1">
                                    <p className="font-semibold text-foreground group-hover:underline">{order.products[0].name}{order.products.length > 1 && ` + ${order.products.length - 1} more`}</p>
                                     <div className="text-xs text-muted-foreground mt-1">
                                        {order.products[0].size && <span>Size: {order.products[0].size}</span>}
                                        {order.products[0].size && order.products[0].color && <span className="mx-1">|</span>}
                                        {order.products[0].color && <span>Color: {order.products[0].color}</span>}
                                        {(order.products[0].quantity && order.products[0].quantity > 1) && <span className="font-semibold"> (x{order.products[0].quantity})</span>}
                                    </div>
                                    <p className="text-muted-foreground text-xs">Order ID: {order.orderId}</p>
                                    <p className="text-muted-foreground text-xs md:hidden">{format(new Date(order.orderDate), "MMM dd, yyyy")}</p>
                                </div>
                            </div>
                            
                            {/* Address Info */}
                             <div className="col-span-2 md:col-span-1">
                                <p className="font-medium text-sm">{order.address.name}</p>
                                <p className="text-xs text-muted-foreground">{order.address.village}, {order.address.city}</p>
                            </div>

                            {/* Price */}
                            <div className="text-left md:text-center">
                                <p className="font-medium md:hidden text-muted-foreground text-xs">Price</p>
                                <p className="font-medium">₹{order.total.toFixed(2)}</p>
                            </div>

                            {/* Status */}
                            <div className="text-left md:text-center">
                                <p className="font-medium md:hidden text-muted-foreground text-xs">Status</p>
                                <Badge variant={getStatusBadgeVariant(getStatusFromTimeline(order.timeline))} className="capitalize w-fit">{getStatusFromTimeline(order.timeline)}</Badge>
                            </div>
                            
                            {/* Actions */}
                            <div className="col-span-2 md:col-span-1 flex justify-end">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onSelect={() => handleRowClick(order.orderId)}>View Details</DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => copyToClipboard(order.orderId)}>Copy Order ID</DropdownMenuItem>
                                        <DropdownMenuItem>Contact Support</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }
    
    if (orders.length === 0) {
      return <EmptyOrders />;
    }

    return (
        <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4 flex-grow justify-center">
            <Search className="w-16 h-16 text-border" />
            <h3 className="text-xl font-semibold">No Matching Orders</h3>
            <p>Try adjusting your search or filter to find what you're looking for.</p>
        </div>
    );
  };

  const renderTransactionsContent = () => (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>A summary of your recent wallet activity.</CardDescription>
      </CardHeader>
      <CardContent>
         <div className="divide-y">
            {filteredTransactions.map(t => {
                 const isRefunded = transactions.some(refund => refund.type === 'Refund' && refund.description.includes(t.transactionId) && refund.status === 'Completed');
                 return (
                    <div key={t.id} className="grid grid-cols-[auto,1fr,auto] items-start gap-x-4 gap-y-2 py-4 md:grid-cols-[auto,1fr,1fr,auto] md:items-center">
                        <Avatar className="h-9 w-9 row-span-2 md:row-span-1">
                            <AvatarImage src={t.avatar} />
                            <AvatarFallback>{t.type.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="col-span-2 md:col-span-1">
                            <p className="font-semibold text-sm">{t.type}</p>
                            <p className="text-xs text-muted-foreground">Via {t.description}</p>
                            <p className="text-xs text-muted-foreground font-mono">ID: {t.transactionId}</p>
                            {t.status === 'Failed' && (
                                <p className={cn("text-xs italic mt-1", isRefunded ? "text-green-600 dark:text-green-500" : "text-amber-600 dark:text-amber-500")}>
                                    {isRefunded ? "Refund completed." : "The refund will reach you shortly."}
                                </p>
                            )}
                        </div>
                         <div className="col-span-3 md:col-span-1 md:text-right">
                             <p className={cn("font-semibold text-base flex items-center gap-1 justify-start md:justify-end", t.amount > 0 ? 'text-green-500' : 'text-foreground')}>
                                {t.amount > 0 ? <Plus className="inline-block h-4 w-4" /> : <Minus className="inline-block h-4 w-4" />}
                                <span>₹{Math.abs(t.amount).toLocaleString('en-IN',{minimumFractionDigits: 2})}</span>
                            </p>
                        </div>
                        <div className="col-span-3 md:col-span-1 text-right">
                             <div className="flex items-center justify-end gap-2">
                                 <p className="text-xs text-muted-foreground">{t.date}, {t.time}</p>
                                 <Badge variant={t.status === 'Completed' ? 'success' : t.status === 'Processing' ? 'warning' : 'destructive'} className="capitalize">{t.status}</Badge>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
        {filteredTransactions.length === 0 && <p className="text-center py-8 text-muted-foreground">No transactions found.</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col min-h-screen bg-muted/40 text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-sm flex items-center justify-between gap-4 p-4 md:p-6 flex-shrink-0">
          <div className={cn("flex items-center gap-1 md:gap-3 flex-1", isSearchExpanded && "hidden md:flex")}>
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="md:inline-flex">
                  <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className={cn("flex items-center gap-2", isSearchExpanded && "hidden md:flex")}>
                  <Avatar className="h-8 w-8 md:h-10 md:w-10">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'}/>
                      <AvatarFallback>{user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-xs md:text-base whitespace-nowrap">{userData?.displayName}</h3>
                  </div>
              </div>
          </div>

          <div className="flex items-center justify-end gap-2 flex-1" ref={searchRef}>
              <div className={cn(
                  "relative flex items-center transition-all duration-300 ease-in-out w-full",
                   isSearchExpanded ? "w-full" : "w-10"
              )}>
                  <Input 
                      placeholder="Search orders or transactions..." 
                      className={cn(
                          "bg-background rounded-full transition-all duration-300 ease-in-out h-10 pl-4 pr-10",
                          isSearchExpanded ? "w-full" : "w-0 p-0 opacity-0"
                      )}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setIsSearchExpanded(true)}
                  />
                  <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-foreground rounded-full hover:bg-accent h-10 w-10 shrink-0"
                      onClick={() => setIsSearchExpanded(p => !p)}
                  >
                  {isSearchExpanded ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                  </Button>
              </div>
          </div>
      </header>
      <main className="flex-grow p-4 md:p-6 flex flex-col gap-6 overflow-y-auto pb-24">
          <Tabs defaultValue="orders" className="w-full">
            <div className="flex justify-between items-center">
                <TabsList>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                </TabsList>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                            <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="pending">Pending</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="shipped">Shipped</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="in-transit">In Transit</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="out-for-delivery">Out for Delivery</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="delivered">Delivered</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="failed-delivery-attempt">Undelivered</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="returned">Returned</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="cancelled-by-user">Cancelled</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <TabsContent value="orders" className="mt-6">
                {renderOrdersContent()}
            </TabsContent>
            <TabsContent value="transactions" className="mt-6">
                {renderTransactionsContent()}
            </TabsContent>
          </Tabs>

          {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 mt-auto flex-wrap gap-4">
                  <div className="text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-left mb-2 sm:mb-0">
                      Showing page {currentPage} of {totalPages}
                  </div>
                  <div className="w-full sm:w-auto mx-auto">
                      <Pagination>
                          <PaginationContent>
                              <PaginationItem>
                                  <Button variant="ghost" size="icon" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                  <ChevronLeft className="h-5 w-5" />
                                  </Button>
                              </PaginationItem>
                              <PaginationItem className="hidden sm:block">
                                  <span className="text-sm font-medium p-2">{currentPage} / {totalPages}</span>
                              </PaginationItem>
                              <PaginationItem>
                              <Button variant="ghost" size="icon" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                                  <ChevronRight className="h-5 w-5" />
                                  </Button>
                              </PaginationItem>
                          </PaginationContent>
                      </Pagination>
                  </div>
                  <div className="w-full sm:w-auto justify-center sm:justify-end gap-2 flex">
                      <Button variant="ghost" size="sm">About</Button>
                      <Button variant="ghost" size="sm">Support</Button>
                      <Button variant="ghost" size="sm">Contact us</Button>
                  </div>
              </div>
          )}
      </main>
    </div>
  );
}
