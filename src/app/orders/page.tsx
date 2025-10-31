
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Wallet, Search, X, Filter, ChevronLeft, ChevronRight, Clipboard, ChevronDown, Edit, ArrowLeft, MoreHorizontal, CalendarClock, Archive, UserCircle } from 'lucide-react';
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
import { format, addDays, parse } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { allOrderData, getStatusFromTimeline } from '@/lib/order-data';
import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';


type Order = {
    orderId: string;
    userId: string;
    products: any[];
    address: any;
    total: number;
    orderDate: string;
    isReturnable: boolean;
    timeline: any[];
};

const mockOrderForDisplay: Order = {
    orderId: "#MOCK123",
    userId: "mockUser",
    products: [{ name: "Sample Product", imageUrl: "https://placehold.co/100x100.png", hint: 'sample', key: 'prod_1' }],
    address: { name: "Your Name", village: "123 Main Street", city: "Your City", state: "Your State", pincode: "000000", phone: "9876543210" },
    total: 999.00,
    orderDate: new Date().toISOString(),
    isReturnable: true,
    timeline: [{ status: "Pending", date: format(new Date(), 'MMM dd, yyyy'), time: format(new Date(), 'p'), completed: true }]
};


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

const SampleOrderCard = () => {
  const router = useRouter();
  return (
    <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4 flex-grow justify-center">
        <EmptyBoxIcon className="w-16 h-16 text-border" />
        <h3 className="text-xl font-semibold">No Orders Yet</h3>
        <p className="max-w-xs">Looks like you haven't made any orders. Start shopping to see them here.</p>
        <div className="w-full max-w-md p-4 opacity-50">
             <Card className="w-full">
                <CardContent className="p-4 grid grid-cols-2 md:grid-cols-[2fr,1.5fr,1fr,1fr,auto] items-center gap-4 text-left">
                    <div className="col-span-2 md:col-span-1 flex items-center gap-4">
                        <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-semibold text-foreground">Sample Product</p>
                            <p className="text-muted-foreground text-xs">Order ID: #SAMPLE123</p>
                            <p className="text-muted-foreground text-xs md:hidden">Sample Date</p>
                        </div>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <p className="font-medium text-sm">Your Name</p>
                        <p className="text-xs text-muted-foreground">Your City, Your State</p>
                    </div>
                    <div className="text-left md:text-center">
                        <p className="font-medium md:hidden text-muted-foreground text-xs">Price</p>
                        <p className="font-medium">₹0.00</p>
                    </div>
                    <div className="text-left md:text-center">
                        <p className="font-medium md:hidden text-muted-foreground text-xs">Status</p>
                        <Badge variant="outline">Pending</Badge>
                    </div>
                    <div className="col-span-2 md:col-span-1 flex justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
        if (!user) {
            setIsLoading(false);
            return;
        };

        setIsLoading(true);
        const db = getFirestoreDb();
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("userId", "==", user.uid), orderBy("orderDate", "desc"));

        try {
            const querySnapshot = await getDocs(q);
            const fetchedOrders: Order[] = [];
            querySnapshot.forEach((doc) => {
                fetchedOrders.push({ ...doc.data(), orderId: doc.id } as Order);
            });
            // Always show the mock order for development/demo purposes
            setOrders([mockOrderForDisplay, ...fetchedOrders]);
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast({
                title: "Error",
                description: "Could not fetch your orders. Showing sample data.",
                variant: "destructive"
            })
            setOrders([mockOrderForDisplay]); // Show mock on error
        } finally {
            setIsLoading(false);
        }
    };
    
    if (user && isClient) {
       fetchOrders();
    } else if (!user && isClient) {
        setIsLoading(false);
        setOrders([mockOrderForDisplay]); // Show mock if not logged in
    }
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

  const renderContent = () => {
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

    if (searchTerm && filteredOrders.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4 flex-grow justify-center">
                <Search className="w-16 h-16 text-border" />
                <h3 className="text-xl font-semibold">No Results Found</h3>
                <p>There is nothing similar to this. Try searching for something else.</p>
                <Button onClick={() => router.push('/live-selling')}>Go Shopping</Button>
            </div>
        );
    }

    return <SampleOrderCard />;
  };

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
                          <Link href="/orders" className="text-muted-foreground text-sm hover:text-foreground transition-colors hidden md:inline">
                              / Orders
                          </Link>
                  </div>
              </div>
          </div>

          <div className="flex items-center justify-end gap-2 flex-1" ref={searchRef}>
              <div className={cn(
                  "relative flex items-center transition-all duration-300 ease-in-out w-full",
                   isSearchExpanded ? "w-full" : "w-10"
              )}>
                  <Input 
                      placeholder="Search orders..." 
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
          <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">Orders</h3>
               {orders.length > 0 && (
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
               )}
          </div>
          
          
          {renderContent()}

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
