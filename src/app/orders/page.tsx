
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Wallet, Search, X, Filter, ChevronLeft, ChevronRight, Clipboard, ChevronDown, Edit, ArrowLeft, MoreHorizontal, CalendarClock, Archive } from 'lucide-react';
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
import { Footer } from '@/components/footer';
import { format, addDays, parse } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { allOrderData, getStatusFromTimeline, Order as TimelineOrder } from '@/lib/order-data';


const mockUsers = {
    "USER8432": { name: "Ganesh Prajapati", avatarUrl: "https://placehold.co/40x40.png", email: "ganesh@example.com" },
    "USER8443": { name: "Olivia Martinez", avatarUrl: "https://placehold.co/40x40.png", email: "olivia.m@example.com" },
    "USER8438": { name: "Peter Jones", avatarUrl: "https://placehold.co/40x40.png", email: "peter.j@example.com" },
    "USER8442": { name: "Michael Chen", avatarUrl: "https://placehold.co/40x40.png", email: "michael.c@example.com" },
    "USER8437": { name: "Laura Williams", avatarUrl: "https://placehold.co/40x40.png", email: "laura.w@example.com" },
    "USER8433": { name: "Jane Doe", avatarUrl: "https://placehold.co/40x40.png", email: "jane.doe@example.com" },
    "USER8434": { name: "Alex Smith", avatarUrl: "https://placehold.co/40x40.png", email: "alex.smith@example.com" },
    "USER8435": { name: "Emily Brown", avatarUrl: "https://placehold.co/40x40.png", email: "emily.brown@example.com" },
    "USER8436": { name: "Chris Wilson", avatarUrl: "https://placehold.co/40x40.png", email: "chris.wilson@example.com" },
    "USER8439": { name: "Sarah Miller", avatarUrl: "https://placehold.co/40x40.png", email: "sarah.m@example.com" },
    "USER8440": { name: "David Garcia", avatarUrl: "https://placehold.co/40x40.png", email: "david.g@example.com" },
    "USER8441": { name: "Jessica Rodriguez", avatarUrl: "https://placehold.co/40x40.png", email: "jessica.r@example.com" },
    "USER8450": { name: "Kevin Scott", avatarUrl: "https://placehold.co/40x40.png", email: "kevin.s@example.com" },
};

const userOrderMapping = {
    "#STREAM5896": "USER8432",
    "#STREAM5907": "USER8443",
    "#STREAM5905": "USER8438",
    "#STREAM5906": "USER8442",
    "#STREAM5904": "USER8437",
    "#STREAM5897": "USER8433",
    "#STREAM5898": "USER8434",
    "#STREAM5899": "USER8435",
    "#STREAM5900": "USER8436",
    "#STREAM5901": "USER8439",
    "#STREAM5902": "USER8440",
    "#STREAM5903": "USER8441",
    "#STREAM5910": "USER8450"
};

const fullMockOrders = Object.entries(allOrderData).map(([orderId, orderDetails]) => {
    // @ts-ignore
    const userId = userOrderMapping[orderId];
    // @ts-ignore
    const user = mockUsers[userId];
    const status = getStatusFromTimeline(orderDetails.timeline);
    
    // Attempt to parse date and time from the first timeline entry
    const firstStep = orderDetails.timeline[0];
    let dateTime = orderDetails.orderDate;
    if (firstStep && firstStep.date && firstStep.time) {
        try {
            const parsedDate = parse(`${firstStep.date} ${firstStep.time}`, 'MMM dd, yyyy hh:mm a', new Date());
            dateTime = format(parsedDate, 'dd/MM/yyyy hh:mm a');
        } catch (e) {
            // fallback to orderDate
            dateTime = orderDetails.orderDate;
        }
    }

    return {
        orderId: orderId,
        productId: `prod-${orderId.slice(-3)}`,
        userId: userId,
        user: user,
        product: { 
            id: `prod-${orderId.slice(-3)}`, 
            name: orderDetails.product.name, 
            imageUrl: orderDetails.product.imageUrl.replace('150x150', '60x60'), 
            hint: orderDetails.product.hint 
        },
        address: { name: user.name, village: "Koregaon Park", district: "Pune", city: "Pune", state: "Maharashtra", country: "India", pincode: "411001", phone: "+91 9876543210" },
        dateTime: dateTime,
        status: status,
        transaction: { id: `TRN${orderId.slice(-4)}`, amount: orderDetails.product.price, method: "Credit Card" },
        deliveryStatus: status, // Simplified for this view
        deliveryDate: status === "Delivered" ? orderDetails.timeline[orderDetails.timeline.length - 1].date : null,
    };
});

type Order = (typeof fullMockOrders)[0];


const statusPriority: { [key: string]: number } = {
    "Pending": 1,
    "Shipped": 2,
    "In Transit": 3,
    "Out for Delivery": 4,
    "Delivered": 5,
    "Failed Delivery Attempt": 6,
    "Cancelled by user": 7,
};

function OrderRowSkeleton() {
    return (
        <div className='relative border-b last:border-b-0 p-2 sm:p-4'>
            <div className="flex flex-col md:grid md:grid-cols-[15%_28%_20%_12%_13%_12%] items-start md:items-center text-xs md:text-sm">
                <div className="w-full font-medium mb-2 md:mb-0 flex justify-between items-center">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-16 md:hidden" />
                </div>
                <div className="w-full mb-2 md:mb-0 flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <Skeleton className="h-5 w-full" />
                </div>
                <div className="w-full mb-2 md:mb-0"><Skeleton className="h-5 w-3/4" /></div>
                <div className="w-full mb-2 md:mb-0"><Skeleton className="h-5 w-1/2" /></div>
                <div className="w-full mb-2 md:mb-0 flex md:justify-center"><Skeleton className="h-5 w-20" /></div>
                <div className="w-full mb-2 md:mb-0 hidden md:flex md:justify-center">
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
            </div>
        </div>
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

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
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
    if (user) {
       setTimeout(() => {
         if (user.uid === 'mock-user-id-123') {
           setOrders(fullMockOrders);
         } else {
           setOrders([]);
         }
         setIsLoading(false);
       }, 1500);
    } else {
        setIsLoading(false);
        setOrders([]);
    }
  }, [user]);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
        const priorityA = statusPriority[a.status] || 99;
        const priorityB = statusPriority[b.status] || 99;
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }
        try {
             const dateA = parse(a.dateTime, 'dd/MM/yyyy hh:mm a', new Date());
             const dateB = parse(b.dateTime, 'dd/MM/yyyy hh:mm a', new Date());
             return dateB.getTime() - dateA.getTime();
        } catch {
            return 0;
        }
    });
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let currentOrders = [...sortedOrders];
    if (statusFilter !== "all") {
        currentOrders = currentOrders.filter(order => order.status.toLowerCase().replace(/ /g, '-') === statusFilter);
    }
    if (searchTerm) {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        currentOrders = currentOrders.filter(order =>
            order.orderId.toLowerCase().includes(lowercasedSearchTerm) ||
            order.product.name.toLowerCase().includes(lowercasedSearchTerm) ||
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
    return (
         <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
             <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
             <p className="text-muted-foreground mb-6">Please log in to view your orders.</p>
             <Button onClick={() => router.push('/')}>Go to Login</Button>
        </div>
    );
  }

  const getStatusBadgeVariant = (status: string): BadgeProps['variant'] => {
    switch (status) {
        case 'Delivered':
            return 'success';
        case 'Shipped':
        case 'In Transit':
        case 'Out for Delivery':
            return 'warning';
        case 'Cancelled by user':
        case 'Undelivered':
        case 'Failed Delivery Attempt':
            return 'destructive';
        case 'Pending':
            return 'info';
        default:
            return 'outline';
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
  
  const getDeliveryDateInfo = (order: Order) => {
     try {
        if (order.status === 'Delivered' && order.deliveryDate) {
            const parsedDate = parse(order.deliveryDate, 'dd/MM/yyyy hh:mm a', new Date());
            return { label: 'Delivered on', date: format(parsedDate, 'dd MMM yyyy')};
        }
        if (order.status === 'Cancelled' || order.status === 'Pending') {
            return { label: 'Delivery Status', date: "N/A" };
        }
        const parsedDate = parse(order.dateTime, 'dd/MM/yyyy hh:mm a', new Date());
        const deliveryDate = addDays(parsedDate, 6);
        return { label: 'Est. Delivery', date: format(deliveryDate, 'dd MMM yyyy') };
    } catch {
        return { label: 'Est. Delivery', date: "N/A" };
    }
  }

  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="space-y-2 mt-2 flex-grow">
                {Array.from({ length: 5 }).map((_, index) => <OrderRowSkeleton key={index} />)}
            </div>
        );
    }
    
    if (paginatedOrders.length > 0) {
        return (
            <div className="space-y-2 mt-2 flex-grow">
              {paginatedOrders.map((order: Order) => (
                  <div key={order.orderId} className='relative border-b last:border-b-0 hover:bg-muted/50 rounded-lg cursor-pointer' onClick={() => handleRowClick(order.orderId)}>
                  <div className="flex flex-col md:grid md:grid-cols-[15%_28%_20%_12%_13%_12%] items-start md:items-center text-xs md:text-sm p-2 sm:p-4">
                          <div className="w-full font-medium mb-2 md:mb-0 flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                  <span>{order.orderId}</span>
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {e.stopPropagation(); copyToClipboard(order.orderId)}}>
                                      <Clipboard className="h-3 w-3" />
                                  </Button>
                              </div>
                              <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize md:hidden">{order.status}</Badge>
                          </div>
                          <div className="w-full mb-2 md:mb-0">
                              <Link href={`/product/${order.productId}`} className="flex items-center gap-3 group/product" onClick={(e) => e.stopPropagation()}>
                                  <Image src={order.product.imageUrl} alt={order.product.name} width={40} height={40} className="rounded-md" data-ai-hint={order.product.hint} />
                                  <p className="truncate flex-1 group-hover/product:underline">{order.product.name}</p>
                              </Link>
                          </div>
                          <div className="w-full truncate mb-2 md:mb-0"><span>To: </span>{order.address.village}, {order.address.city}</div>
                          <div className="w-full mb-2 md:mb-0"><span>On: </span>{order.dateTime.split(' ')[0]}</div>
                          <div className="w-full mb-2 md:mb-0 flex md:justify-center">{order.transaction.amount}</div>
                          <div className="w-full mb-2 md:mb-0 hidden md:flex md:justify-center">
                              <div className="flex justify-center w-full">
                                  <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">{order.status}</Badge>
                              </div>
                          </div>
                      </div>
                      <div className="absolute bottom-1 right-1 md:top-1/2 md:-translate-y-1/2 md:right-2">
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                      <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-64" onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenuLabel>Order Details</DropdownMenuLabel>
                                  <DropdownMenuSeparator/>
                                  <div className="p-2 space-y-2 text-sm">
                                      <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 font-semibold text-muted-foreground">
                                                <CalendarClock className="h-4 w-4" />
                                                <span>{getDeliveryDateInfo(order).label}</span>
                                            </div>
                                            <span>{getDeliveryDateInfo(order).date}</span>
                                        </div>
                                      <div className="flex items-center justify-between">
                                          <p className="font-semibold text-muted-foreground">User ID</p>
                                          <div className="flex items-center gap-1">
                                              <span>{order.userId}</span>
                                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(order.userId)}>
                                                  <Clipboard className="h-3 w-3" />
                                              </Button>
                                          </div>
                                      </div>
                                      <div>
                                          <p className="font-semibold text-muted-foreground mb-1">Transaction Details</p>
                                          <div className="flex items-center justify-between">
                                              <p>ID: {order.transaction.id}</p>
                                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(order.transaction.id)}>
                                                  <Clipboard className="h-3 w-3" />
                                              </Button>
                                          </div>
                                          <p>Method: {order.transaction.method}</p>
                                      </div>
                                      <div>
                                          <p className="font-semibold text-muted-foreground mb-1">Delivery Address</p>
                                          <p>{order.address.name}, {order.address.phone}</p>
                                          <p>{order.address.village}, {order.address.district}</p>
                                          <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                                      </div>
                                      <div>
                                          <p className="font-semibold text-muted-foreground">Delivery Status</p>
                                          <p>{order.deliveryStatus}</p>
                                      </div>
                                      <div>
                                          <p className="font-semibold text-muted-foreground">Date & Time</p>
                                          <p className="text-xs text-muted-foreground">{order.dateTime}</p>
                                      </div>
                                  </div>
                                  <DropdownMenuSeparator/>
                              </DropdownMenuContent>
                          </DropdownMenu>
                      </div>
                  </div>
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

    if (orders.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4 flex-grow justify-center">
                <EmptyBoxIcon className="w-16 h-16 text-border" />
                <h3 className="text-xl font-semibold">No Orders Yet</h3>
                <p>Looks like you haven't made any orders. Start shopping to see them here.</p>
                <Button onClick={() => router.push('/live-selling')}>Go Shopping</Button>
            </div>
        );
    }
    
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
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
                          <h3 className="font-semibold text-xs md:text-base whitespace-nowrap">{user.displayName}</h3>
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
      <main className="flex-grow p-4 md:p-6 flex flex-col gap-6 overflow-y-auto">
          <div className="bg-card p-2 sm:p-4 rounded-lg border flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
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
                                    <DropdownMenuRadioItem value="cancelled-by-user">Cancelled</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                   )}
              </div>
              
              <div className="hidden md:grid grid-cols-[15%_28%_20%_12%_13%_12%] items-center text-sm text-muted-foreground px-4 py-2 border-b">
                  <span>Order ID</span>
                  <span>Product details</span>
                  <span>Address</span>
                  <span>Date</span>
                  <span className="text-center">Transaction</span>
                  <span className="text-center">Status</span>
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
          </div>
      </main>
      <Footer />
    </div>
  );
}
