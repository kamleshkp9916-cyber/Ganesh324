
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

const mockOrders = [
    {
      orderId: "#STREAM5896",
      productId: "prod-001",
      userId: "USER8432",
      user: { name: "Ganesh Prajapati", avatarUrl: "https://placehold.co/40x40.png", email: "ganesh@example.com" },
      product: { id: "prod-001", name: "Vintage Camera", imageUrl: "https://placehold.co/60x60.png", hint: "vintage camera" },
      address: { name: "Ganesh Prajapati", village: "Koregaon Park", district: "Pune", city: "Pune", state: "Maharashtra", country: "India", pincode: "411001", phone: "+91 9876543210" },
      dateTime: "27/07/2024 10:30 PM",
      status: "On Way",
      transaction: { id: "TRN123456789", amount: "₹12,500.00", method: "Credit Card" },
      deliveryStatus: "In transit to Delhi",
      deliveryDate: null
    },
    {
      orderId: "#STREAM5907",
      productId: "prod-012",
      userId: "USER8443",
      user: { name: "Olivia Martinez", avatarUrl: "https://placehold.co/40x40.png", email: "olivia.m@example.com" },
      product: { id: "prod-012", name: "Portable Projector", imageUrl: "https://placehold.co/60x60.png", hint: "projector" },
      address: { name: "Olivia Martinez", village: "Greater Kailash", district: "New Delhi", city: "Delhi", state: "Delhi", country: "India", pincode: "110048", phone: "+91 9876543221" },
      dateTime: "29/07/2024 03:20 PM",
      status: "In Progress",
      transaction: { id: "TRN123456800", amount: "₹15,000.00", method: "UPI" },
      deliveryStatus: "Processing order",
      deliveryDate: null
    },
    {
      orderId: "#STREAM5905",
      productId: "prod-007",
      userId: "USER8438",
      user: { name: "Peter Jones", avatarUrl: "https://placehold.co/40x40.png", email: "peter.j@example.com" },
      product: { id: "prod-007", name: "Designer Sunglasses", imageUrl: "https://placehold.co/60x60.png", hint: "sunglasses" },
      address: { name: "Peter Jones", village: "Calangute", district: "North Goa", city: "Goa", state: "Goa", country: "India", pincode: "403516", phone: "+91 9876543216" },
      dateTime: "28/07/2024 02:30 PM",
      status: "Pending",
      transaction: { id: "TRN123456795", amount: "₹7,800.00", method: "Pending Confirmation" },
      deliveryStatus: "Awaiting payment confirmation",
      deliveryDate: null
    },
    {
      orderId: "#STREAM5906",
      productId: "prod-011",
      userId: "USER8442",
      user: { name: "Michael Chen", avatarUrl: "https://placehold.co/40x40.png", email: "michael.c@example.com" },
      product: { id: "prod-011", name: "Mechanical Keyboard", imageUrl: "https://placehold.co/60x60.png", hint: "keyboard" },
      address: { name: "Michael Chen", village: "Koramangala", district: "Bengaluru", city: "Bengaluru", state: "Karnataka", country: "India", pincode: "560095", phone: "+91 9876543220" },
      dateTime: "29/07/2024 11:00 AM",
      status: "Pending",
      transaction: { id: "TRN123456799", amount: "₹9,500.00", method: "Pending Confirmation" },
      deliveryStatus: "Awaiting payment confirmation",
      deliveryDate: null
    },
     {
      orderId: "#STREAM5904",
      productId: "prod-006",
      userId: "USER8437",
      user: { name: "Laura Williams", avatarUrl: "https://placehold.co/40x40.png", email: "laura.w@example.com" },
      product: { id: "prod-006", name: "Gaming Mouse", imageUrl: "https://placehold.co/60x60.png", hint: "gaming mouse" },
      address: { name: "Laura Williams", village: "Koregaon Park", district: "Pune", city: "Pune", state: "Maharashtra", country: "India", pincode: "411001", phone: "+91 9876543215" },
      dateTime: "28/07/2024 01:00 PM",
      status: "In Progress",
      transaction: { id: "TRN123456794", amount: "₹3,500.00", method: "UPI" },
      deliveryStatus: "Processing order",
      deliveryDate: null
    },
    {
      orderId: "#STREAM5897",
      productId: "prod-002",
      userId: "USER8433",
      user: { name: "Jane Doe", avatarUrl: "https://placehold.co/40x40.png", email: "jane.doe@example.com" },
      product: { id: "prod-002", name: "Wireless Headphones", imageUrl: "https://placehold.co/60x60.png", hint: "headphones" },
      address: { name: "Jane Doe", village: "Bandra West", district: "Mumbai", city: "Mumbai", state: "Maharashtra", country: "India", pincode: "400050", phone: "+91 9876543211" },
      dateTime: "26/07/2024 08:15 AM",
      status: "Completed",
      transaction: { id: "TRN123456790", amount: "₹4,999.00", method: "UPI" },
      deliveryStatus: "Delivered",
      deliveryDate: "27/07/2024 11:30 AM"
    },
    {
      orderId: "#STREAM5898",
      productId: "prod-003",
      userId: "USER8434",
      user: { name: "Alex Smith", avatarUrl: "https://placehold.co/40x40.png", email: "alex.smith@example.com" },
      product: { id: "prod-003", name: "Leather Backpack", imageUrl: "https://placehold.co/60x60.png", hint: "leather backpack" },
      address: { name: "Alex Smith", village: "Indiranagar", district: "Bengaluru", city: "Bengaluru", state: "Karnataka", country: "India", pincode: "560038", phone: "+91 9876543212" },
      dateTime: "25/07/2024 02:00 PM",
      status: "Completed",
      transaction: { id: "TRN123456791", amount: "₹6,200.00", method: "Net Banking" },
      deliveryStatus: "Delivered",
      deliveryDate: "26/07/2024 01:00 PM"
    },
    {
      orderId: "#STREAM5899",
      productId: "prod-004",
      userId: "USER8435",
      user: { name: "Emily Brown", avatarUrl: "https://placehold.co/40x40.png", email: "emily.brown@example.com" },
      product: { id: "prod-004", name: "Smart Watch", imageUrl: "https://placehold.co/60x60.png", hint: "smart watch" },
      address: { name: "Emily Brown", village: "Connaught Place", district: "New Delhi", city: "Delhi", state: "Delhi", country: "India", pincode: "110001", phone: "+91 9876543213" },
      dateTime: "25/07/2024 11:45 AM",
      status: "Cancelled",
      transaction: { id: "TRN123456792", amount: "₹8,750.00", method: "Credit Card" },
      deliveryStatus: "Cancelled by user",
      deliveryDate: null
    },
    {
      orderId: "#STREAM5900",
      productId: "prod-005",
      userId: "USER8436",
      user: { name: "Chris Wilson", avatarUrl: "https://placehold.co/40x40.png", email: "chris.wilson@example.com" },
      product: { id: "prod-005", name: "Handcrafted Vase", imageUrl: "https://placehold.co/60x60.png", hint: "ceramic vase" },
      address: { name: "Chris Wilson", village: "T. Nagar", district: "Chennai", city: "Chennai", state: "Tamil Nadu", country: "India", pincode: "600017", phone: "+91 9876543214" },
      dateTime: "24/07/2024 06:30 PM",
      status: "Completed",
      transaction: { id: "TRN123456793", amount: "₹2,100.00", method: "Cash on Delivery" },
      deliveryStatus: "Delivered",
      deliveryDate: "25/07/2024 07:00 PM"
    },
    {
      orderId: "#STREAM5901",
      productId: "prod-008",
      userId: "USER8439",
      user: { name: "Sarah Miller", avatarUrl: "https://placehold.co/40x40.png", email: "sarah.m@example.com" },
      product: { id: "prod-008", name: "Yoga Mat", imageUrl: "https://placehold.co/60x60.png", hint: "yoga mat" },
      address: { name: "Sarah Miller", village: "Banjara Hills", district: "Hyderabad", city: "Hyderabad", state: "Telangana", country: "India", pincode: "500034", phone: "+91 9876543217" },
      dateTime: "23/07/2024 09:00 AM",
      status: "Completed",
      transaction: { id: "TRN123456796", amount: "₹1,500.00", method: "Credit Card" },
      deliveryStatus: "Delivered",
      deliveryDate: "24/07/2024 10:00 AM"
    },
    {
      orderId: "#STREAM5902",
      productId: "prod-009",
      userId: "USER8440",
      user: { name: "David Garcia", avatarUrl: "https://placehold.co/40x40.png", email: "david.g@example.com" },
      product: { id: "prod-009", name: "Bluetooth Speaker", imageUrl: "https://placehold.co/60x60.png", hint: "bluetooth speaker" },
      address: { name: "David Garcia", village: "Park Street", district: "Kolkata", city: "Kolkata", state: "West Bengal", country: "India", pincode: "700016", phone: "+91 9876543218" },
      dateTime: "22/07/2024 07:00 PM",
      status: "On Way",
      transaction: { id: "TRN123456797", amount: "₹3,200.00", method: "UPI" },
      deliveryStatus: "Out for delivery",
      deliveryDate: null
    },
    {
      orderId: "#STREAM5903",
      productId: "prod-010",
      userId: "USER8441",
      user: { name: "Jessica Rodriguez", avatarUrl: "https://placehold.co/40x40.png", email: "jessica.r@example.com" },
      product: { id: "prod-010", name: "Coffee Maker", imageUrl: "https://placehold.co/60x60.png", hint: "coffee maker" },
      address: { name: "Jessica Rodriguez", village: "C-Scheme", district: "Jaipur", city: "Jaipur", state: "Rajasthan", country: "India", pincode: "302001", phone: "+91 9876543219" },
      dateTime: "21/07/2024 11:00 AM",
      status: "Cancelled",
      transaction: { id: "TRN123456798", amount: "₹4,500.00", method: "Credit Card" },
      deliveryStatus: "Cancelled by seller",
      deliveryDate: null
    }
];

type Order = typeof mockOrders[0];

const statusPriority: { [key: string]: number } = {
    "On Way": 1,
    "Pending": 2,
    "In Progress": 3,
    "Completed": 4,
    "Cancelled": 5,
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
      // In a real app, you'd fetch orders for the logged-in user.
      // Here, we'll just show the mock orders if it's the mock user.
       setTimeout(() => {
         if (user.uid === 'mock-user-id-123') {
           setOrders(mockOrders);
         } else {
           setOrders([]); // No orders for other users
         }
         setIsLoading(false);
       }, 1500); // Simulate network delay
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
        const dateA = new Date(a.dateTime.split(' ')[0].split('/').reverse().join('-') + 'T' + a.dateTime.split(' ')[1].replace(' ', ''));
        const dateB = new Date(b.dateTime.split(' ')[0].split('/').reverse().join('-') + 'T' + b.dateTime.split(' ')[1].replace(' ', ''));
        return dateB.getTime() - dateA.getTime();
    });
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let currentOrders = [...sortedOrders];
    if (statusFilter !== "all") {
        currentOrders = currentOrders.filter(order => order.status.toLowerCase().replace(' ', '-') === statusFilter);
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
        case 'Completed':
            return 'success';
        case 'On Way':
            return 'warning';
        case 'Cancelled':
            return 'destructive';
        case 'Pending':
            return 'info';
        case 'In Progress':
            return 'purple';
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
        if (order.status === 'Completed' && order.deliveryDate) {
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
                                    <DropdownMenuRadioItem value="on-way">On Way</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="completed">Completed</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="cancelled">Cancelled</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="in-progress">In Progress</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="pending">Pending</DropdownMenuRadioItem>
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
