
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Wallet, PanelLeft, Search, Star, X, Filter, ChevronLeft, ChevronRight, Clipboard, ChevronDown, Edit } from 'lucide-react';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EditAddressForm } from '@/components/edit-address-form';


const mockOrders = [
    {
      orderId: "#STREAM5896",
      userId: "USER8432",
      user: { name: "Ganesh Prajapati", avatarUrl: "https://placehold.co/40x40.png", email: "ganesh@example.com" },
      product: { name: "Vintage Camera", imageUrl: "https://placehold.co/60x60.png", hint: "vintage camera" },
      address: { name: "Ganesh Prajapati", village: "Koregaon Park", district: "Pune", city: "Pune", state: "Maharashtra", country: "India", pincode: "411001", phone: "+91 9876543210" },
      dateTime: "27/07/2024 10:30 PM",
      status: "Ongoing",
      transaction: { id: "TRN123456789", amount: "₹12,500.00", method: "Credit Card" },
      deliveryStatus: "In transit to Delhi",
    },
    {
      orderId: "#STREAM5897",
      userId: "USER8433",
      user: { name: "Jane Doe", avatarUrl: "https://placehold.co/40x40.png", email: "jane.doe@example.com" },
      product: { name: "Wireless Headphones", imageUrl: "https://placehold.co/60x60.png", hint: "headphones" },
      address: { name: "Jane Doe", village: "Bandra West", district: "Mumbai", city: "Mumbai", state: "Maharashtra", country: "India", pincode: "400050", phone: "+91 9876543211" },
      dateTime: "26/07/2024 08:15 AM",
      status: "Completed",
      transaction: { id: "TRN123456790", amount: "₹4,999.00", method: "UPI" },
      deliveryStatus: "Delivered",
    },
    {
      orderId: "#STREAM5898",
      userId: "USER8434",
      user: { name: "Alex Smith", avatarUrl: "https://placehold.co/40x40.png", email: "alex.smith@example.com" },
      product: { name: "Leather Backpack", imageUrl: "https://placehold.co/60x60.png", hint: "leather backpack" },
      address: { name: "Alex Smith", village: "Indiranagar", district: "Bengaluru", city: "Bengaluru", state: "Karnataka", country: "India", pincode: "560038", phone: "+91 9876543212" },
      dateTime: "25/07/2024 02:00 PM",
      status: "Completed",
      transaction: { id: "TRN123456791", amount: "₹6,200.00", method: "Net Banking" },
      deliveryStatus: "Delivered",
    },
    {
      orderId: "#STREAM5899",
      userId: "USER8435",
      user: { name: "Emily Brown", avatarUrl: "https://placehold.co/40x40.png", email: "emily.brown@example.com" },
      product: { name: "Smart Watch", imageUrl: "https://placehold.co/60x60.png", hint: "smart watch" },
      address: { name: "Emily Brown", village: "Connaught Place", district: "New Delhi", city: "Delhi", state: "Delhi", country: "India", pincode: "110001", phone: "+91 9876543213" },
      dateTime: "25/07/2024 11:45 AM",
      status: "Cancelled",
      transaction: { id: "TRN123456792", amount: "₹8,750.00", method: "Credit Card" },
      deliveryStatus: "Order cancelled by user",
    },
    {
      orderId: "#STREAM5900",
      userId: "USER8436",
      user: { name: "Chris Wilson", avatarUrl: "https://placehold.co/40x40.png", email: "chris.wilson@example.com" },
      product: { name: "Handcrafted Vase", imageUrl: "https://placehold.co/60x60.png", hint: "ceramic vase" },
      address: { name: "Chris Wilson", village: "T. Nagar", district: "Chennai", city: "Chennai", state: "Tamil Nadu", country: "India", pincode: "600017", phone: "+91 9876543214" },
      dateTime: "24/07/2024 06:30 PM",
      status: "Completed",
      transaction: { id: "TRN123456793", amount: "₹2,100.00", method: "Cash on Delivery" },
      deliveryStatus: "Delivered",
    },
     {
      orderId: "#STREAM5904",
      userId: "USER8437",
      user: { name: "Laura Williams", avatarUrl: "https://placehold.co/40x40.png", email: "laura.w@example.com" },
      product: { name: "Gaming Mouse", imageUrl: "https://placehold.co/60x60.png", hint: "gaming mouse" },
      address: { name: "Laura Williams", village: "Koregaon Park", district: "Pune", city: "Pune", state: "Maharashtra", country: "India", pincode: "411001", phone: "+91 9876543215" },
      dateTime: "28/07/2024 01:00 PM",
      status: "In Progress",
      transaction: { id: "TRN123456794", amount: "₹3,500.00", method: "UPI" },
      deliveryStatus: "Processing order",
    },
    {
      orderId: "#STREAM5905",
      userId: "USER8438",
      user: { name: "Peter Jones", avatarUrl: "https://placehold.co/40x40.png", email: "peter.j@example.com" },
      product: { name: "Designer Sunglasses", imageUrl: "https://placehold.co/60x60.png", hint: "sunglasses" },
      address: { name: "Peter Jones", village: "Calangute", district: "North Goa", city: "Goa", state: "Goa", country: "India", pincode: "403516", phone: "+91 9876543216" },
      dateTime: "28/07/2024 02:30 PM",
      status: "Pending",
      transaction: { id: "TRN123456795", amount: "₹7,800.00", method: "Pending Confirmation" },
      deliveryStatus: "Awaiting payment confirmation",
    },
    {
      orderId: "#STREAM5901",
      userId: "USER8439",
      user: { name: "Sarah Miller", avatarUrl: "https://placehold.co/40x40.png", email: "sarah.m@example.com" },
      product: { name: "Yoga Mat", imageUrl: "https://placehold.co/60x60.png", hint: "yoga mat" },
      address: { name: "Sarah Miller", village: "Banjara Hills", district: "Hyderabad", city: "Hyderabad", state: "Telangana", country: "India", pincode: "500034", phone: "+91 9876543217" },
      dateTime: "23/07/2024 09:00 AM",
      status: "Completed",
      transaction: { id: "TRN123456796", amount: "₹1,500.00", method: "Credit Card" },
      deliveryStatus: "Delivered",
    },
    {
      orderId: "#STREAM5902",
      userId: "USER8440",
      user: { name: "David Garcia", avatarUrl: "https://placehold.co/40x40.png", email: "david.g@example.com" },
      product: { name: "Bluetooth Speaker", imageUrl: "https://placehold.co/60x60.png", hint: "bluetooth speaker" },
      address: { name: "David Garcia", village: "Park Street", district: "Kolkata", city: "Kolkata", state: "West Bengal", country: "India", pincode: "700016", phone: "+91 9876543218" },
      dateTime: "22/07/2024 07:00 PM",
      status: "Ongoing",
      transaction: { id: "TRN123456797", amount: "₹3,200.00", method: "UPI" },
      deliveryStatus: "Out for delivery",
    },
    {
      orderId: "#STREAM5903",
      userId: "USER8441",
      user: { name: "Jessica Rodriguez", avatarUrl: "https://placehold.co/40x40.png", email: "jessica.r@example.com" },
      product: { name: "Coffee Maker", imageUrl: "https://placehold.co/60x60.png", hint: "coffee maker" },
      address: { name: "Jessica Rodriguez", village: "C-Scheme", district: "Jaipur", city: "Jaipur", state: "Rajasthan", country: "India", pincode: "302001", phone: "+91 9876543219" },
      dateTime: "21/07/2024 11:00 AM",
      status: "Cancelled",
      transaction: { id: "TRN123456798", amount: "₹4,500.00", method: "Credit Card" },
      deliveryStatus: "Order cancelled by user",
    },
    {
      orderId: "#STREAM5906",
      userId: "USER8442",
      user: { name: "Michael Chen", avatarUrl: "https://placehold.co/40x40.png", email: "michael.c@example.com" },
      product: { name: "Mechanical Keyboard", imageUrl: "https://placehold.co/60x60.png", hint: "keyboard" },
      address: { name: "Michael Chen", village: "Koramangala", district: "Bengaluru", city: "Bengaluru", state: "Karnataka", country: "India", pincode: "560095", phone: "+91 9876543220" },
      dateTime: "29/07/2024 11:00 AM",
      status: "Pending",
      transaction: { id: "TRN123456799", amount: "₹9,500.00", method: "Pending Confirmation" },
      deliveryStatus: "Awaiting payment confirmation",
    },
    {
      orderId: "#STREAM5907",
      userId: "USER8443",
      user: { name: "Olivia Martinez", avatarUrl: "https://placehold.co/40x40.png", email: "olivia.m@example.com" },
      product: { name: "Portable Projector", imageUrl: "https://placehold.co/60x60.png", hint: "projector" },
      address: { name: "Olivia Martinez", village: "Greater Kailash", district: "New Delhi", city: "Delhi", state: "Delhi", country: "India", pincode: "110048", phone: "+91 9876543221" },
      dateTime: "29/07/2024 03:20 PM",
      status: "In Progress",
      transaction: { id: "TRN123456800", amount: "₹15,000.00", method: "UPI" },
      deliveryStatus: "Processing order",
    }
];

type Order = typeof mockOrders[0];

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isClient, setIsClient] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();
  const [orders, setOrders] = useState(mockOrders);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredOrders = useMemo(() => {
    let currentOrders = orders;
    if (statusFilter !== "all") {
        currentOrders = currentOrders.filter(order => order.status.toLowerCase() === statusFilter);
    }
    if (searchTerm) {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        currentOrders = currentOrders.filter(order =>
            order.orderId.toLowerCase().includes(lowercasedSearchTerm) ||
            order.user.name.toLowerCase().includes(lowercasedSearchTerm) ||
            order.product.name.toLowerCase().includes(lowercasedSearchTerm) ||
            (order.address.village + ", " + order.address.city).toLowerCase().includes(lowercasedSearchTerm)
        );
    }
    return currentOrders;
  }, [statusFilter, searchTerm, orders]);
  
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

  const getStatusBadgeVariant = (status: string): BadgeProps['variant'] => {
    switch (status) {
        case 'Completed':
            return 'success';
        case 'Ongoing':
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

  const handleAddressSave = (orderId: string, data: any) => {
      setOrders(currentOrders => currentOrders.map(o => {
          if (o.orderId === orderId) {
              return {
                  ...o,
                  address: {
                      ...o.address, // keep original phone
                      name: data.name,
                      village: data.village,
                      district: data.district,
                      city: data.city,
                      state: data.state,
                      country: data.country,
                      pincode: data.pincode,
                      phone: data.phone,
                  },
                  user: { ...o.user, name: data.name }
              };
          }
          return o;
      }));
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <div className="flex flex-1 overflow-hidden">
        <aside className={cn(
            "hidden md:flex flex-col w-[20%] border-r bg-sidebar p-4 transition-all duration-300",
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
        <main className="flex-grow p-6 flex flex-col gap-6 overflow-y-auto">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:inline-flex">
                        <PanelLeft />
                    </Button>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 md:h-10 md:w-10">
                             <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'}/>
                             <AvatarFallback>{user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-base md:text-lg">{user.displayName}</h3>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                <Star className="h-6 w-6 fill-current" />
                            </Button>
                            <span className="text-muted-foreground text-sm md:text-base">/ Overview</span>
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
            
            <div className="bg-card p-4 rounded-lg border flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Order list</h3>
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
                                <DropdownMenuRadioItem value="ongoing">Ongoing</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="completed">Completed</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="cancelled">Cancelled</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="in progress">In Progress</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="pending">Pending</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                
                <div className="hidden sm:flex items-center text-sm text-muted-foreground px-4 py-2 border-b">
                    <span className="w-[12%]">Order id</span>
                    <span className="w-[15%]">User</span>
                    <span className="w-[20%]">Product details</span>
                    <span className="w-[15%]">Address</span>
                    <span className="w-[15%]">Date and Time</span>
                    <span className="w-[10%] text-center">Status</span>
                    <span className="w-[13%] text-right">Transaction</span>
                    <span className="w-8"></span>
                </div>

                <div className="space-y-2 mt-2">
                    {paginatedOrders.map((order: Order) => (
                        <Collapsible key={order.orderId} asChild>
                             <div className='border-b last:border-b-0 hover:bg-muted/50 rounded-lg'>
                                <CollapsibleTrigger asChild>
                                   <div className="flex flex-col sm:flex-row items-start sm:items-center text-sm p-4 cursor-pointer group">
                                        <div className="flex justify-between items-center w-full sm:w-[12%] mb-2 sm:mb-0">
                                            <div className="font-medium text-primary">
                                                <span className="sm:hidden font-semibold text-foreground">Order: </span>
                                                {order.orderId}
                                            </div>
                                            <div className="sm:hidden">
                                                <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">{order.status}</Badge>
                                            </div>
                                        </div>
                                        <div className="sm:w-[15%] flex items-center gap-2 mb-2 sm:mb-0">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={order.user.avatarUrl} />
                                                <AvatarFallback>{order.user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span>{order.user.name}</span>
                                        </div>
                                        <div className="sm:w-[20%] flex items-center gap-3 mb-2 sm:mb-0">
                                            <Image src={order.product.imageUrl} alt={order.product.name} width={40} height={40} className="rounded-md" data-ai-hint={order.product.hint} />
                                            <span>{order.product.name}</span>
                                        </div>
                                        <div className="sm:w-[15%] truncate mb-2 sm:mb-0"><span className="sm:hidden font-semibold text-foreground">To: </span>{order.address.village}, {order.address.city}</div>
                                        <div className="sm:w-[15%] mb-2 sm:mb-0"><span className="sm:hidden font-semibold text-foreground">On: </span>{order.dateTime}</div>
                                        <div className="sm:w-[10%] text-left sm:text-center mb-2 sm:mb-0 hidden sm:block">
                                            <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">{order.status}</Badge>
                                        </div>
                                        <div className="sm:w-[13%] sm:text-right font-semibold w-full"><span className="sm:hidden font-normal text-foreground">Amount: </span>{order.transaction.amount}</div>
                                        <div className="sm:w-8 flex justify-end">
                                            <ChevronDown className="h-5 w-5 transition-transform duration-300 group-data-[state=open]:-rotate-180"/>
                                        </div>
                                    </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="bg-muted/50 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                                        <div className="space-y-1">
                                            <p className="font-semibold text-muted-foreground">User Details</p>
                                            <p>{order.user.name}</p>
                                            <p>{order.user.email}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-muted-foreground">User ID: {order.userId}</p>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(order.userId)}>
                                                    <Clipboard className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-semibold text-muted-foreground">Delivery Address</p>
                                            <p>{order.address.name}, {order.address.phone}</p>
                                            <p>{order.address.village}, {order.address.district}</p>
                                            <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                                            {['Pending', 'Cancelled', 'In Progress'].includes(order.status) && (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" className="mt-2">
                                                            <Edit className="h-3 w-3 mr-2"/>
                                                            Edit Address
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-lg h-auto max-h-[85vh] flex flex-col">
                                                        <DialogHeader>
                                                            <DialogTitle>Edit Delivery Address</DialogTitle>
                                                        </DialogHeader>
                                                        <EditAddressForm 
                                                            currentAddress={order.address}
                                                            currentPhone={order.address.phone}
                                                            onSave={(data) => {
                                                                handleAddressSave(order.orderId, data);
                                                                // Potentially close dialog here if EditAddressForm doesn't do it
                                                            }}
                                                            onCancel={() => {
                                                                // Close dialog logic
                                                            }}
                                                        />
                                                    </DialogContent>
                                                </Dialog>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-semibold text-muted-foreground">Transaction Details</p>
                                            <p>Amount: {order.transaction.amount}</p>
                                            <p>Method: {order.transaction.method}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-muted-foreground">ID: {order.transaction.id}</p>
                                                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(order.transaction.id)}>
                                                    <Clipboard className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-semibold text-muted-foreground">Delivery Status</p>
                                            <p>{order.deliveryStatus}</p>
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </div>
                        </Collapsible>
                    ))}
                 {paginatedOrders.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No orders found.</p>
                    </div>
                 )}
                </div>
                {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 mt-auto">
                         <div className="text-sm text-muted-foreground w-1/3 hidden md:block">
                            Showing page {currentPage} of {totalPages}
                        </div>
                        <div className="w-full md:w-1/3">
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
                        <div className="w-1/3 justify-end gap-2 hidden sm:flex">
                            <Button variant="ghost" size="sm">About</Button>
                            <Button variant="ghost" size="sm">Support</Button>
                            <Button variant="ghost" size="sm">Contact us</Button>
                        </div>
                    </div>
                )}
            </div>
        </main>
      </div>
    </div>
  );
}

    