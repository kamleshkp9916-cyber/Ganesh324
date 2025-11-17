
"use client"

import {
  ChevronLeft,
  ChevronRight,
  Copy,
  File,
  ListFilter,
  MoreVertical,
  Search,
  ShieldCheck,
  Menu,
  XCircle,
  User,
  Home,
  CreditCard,
  RotateCcw,
  Video,
  Hash,
  Truck,
  PackageOpen,
  Hourglass,
  Package,
  PackageCheck,
  CheckCircle2,
  Circle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import React, { useState, useEffect, useMemo } from "react"
import { getFirestore, collection, query, getDocs, orderBy, where } from "firebase/firestore"
import { format } from "date-fns"

import { Badge, BadgeProps } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { getStatusFromTimeline } from "@/lib/order-data"
import { useAuthActions } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useDebounce } from "@/hooks/use-debounce";
import { AdminLayout } from "@/components/admin/admin-layout"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type Order = {
    orderId: string;
    userId: string;
    products: any[];
    address: any;
    total: number;
    orderDate: string;
    isReturnable: boolean;
    timeline: any[];
    paymentMethod?: string;
    refundStatus?: 'N/A' | 'Completed' | 'Pending';
    type?: 'Live Stream' | 'Listed Product';
    transactionId?: string;
    paymentStatus?: 'holding' | 'released' | 'refunded';
    paymentDetails?: any;
    sellerId?: string;
};

const mockOrders: Order[] = [
    {
        orderId: "#MOCK5896",
        userId: "mockUser1",
        products: [{ name: "Vintage Camera", key: "prod_1" }],
        address: { name: "Ganesh Prajapati", village: "123 Sunshine Apts", city: "Pune", state: "MH", pincode: "411001", phone: "9876543210" },
        total: 12500.00,
        orderDate: "2024-07-27T22:31:00.000Z",
        isReturnable: true,
        timeline: [
            { status: "Order Confirmed", date: "Jul 27, 2024", time: "10:31 PM", completed: true },
            { status: "Packed", date: "Jul 28, 2024", time: "09:00 AM", completed: true },
            { status: "Shipped", date: "Jul 28, 2024", time: "05:00 PM", completed: true },
            { status: "In Transit", date: "Jul 29, 2024", time: "Current status", completed: true },
            { status: "Out for Delivery", date: null, time: null, completed: false },
            { status: "Delivered", date: null, time: null, completed: false },
        ],
        paymentMethod: 'Credit Card',
        refundStatus: 'N/A',
        type: 'Listed Product',
        transactionId: 'txn_1a2b3c4d5e6f',
        paymentStatus: 'holding',
        sellerId: 'fashionfinds-uid',
    },
     {
        orderId: "#MOCK5905",
        userId: "mockUser2",
        products: [{ name: "Designer Sunglasses", key: 'prod_4' }],
        address: { name: "Peter Jones", village: "101 Galaxy Heights", city: "Jaipur", state: "RJ", pincode: "302017", phone: "9876543213" },
        total: 7800.00,
        orderDate: "2024-07-28T14:30:00.000Z",
        isReturnable: true,
        timeline: [
            { status: "Order Confirmed", date: "Jul 28, 2024", time: "02:30 PM", completed: true },
            { status: "Pending", date: null, time: null, completed: false },
        ],
        paymentMethod: 'UPI',
        refundStatus: 'N/A',
        type: 'Live Stream',
        transactionId: 'txn_7g8h9i0j1k2l',
        paymentStatus: 'released',
        sellerId: 'gadgetguru-uid',
    },
    {
        orderId: "#MOCK5903",
        userId: "mockUser3",
        products: [{ name: "Coffee Maker", key: 'prod_5' }],
        address: { name: "Jessica Rodriguez", village: "222 Ocean View", city: "Chennai", state: "TN", pincode: "600090", phone: "9876543214" },
        total: 4500.00,
        orderDate: "2024-07-21T11:00:00.000Z",
        isReturnable: false,
        timeline: [
             { status: "Order Confirmed", date: "Jul 21, 2024", time: "11:00 AM", completed: true },
             { status: "Cancelled by admin", date: "Jul 21, 2024", time: "11:30 AM", completed: true },
        ],
        paymentMethod: 'Net Banking',
        refundStatus: 'Completed',
        type: 'Listed Product',
        transactionId: 'txn_3m4n5o6p7q8r',
        paymentStatus: 'refunded',
        sellerId: 'homehaven-uid',
    }
];

const getStatusIcon = (status: string) => {
    if (status.toLowerCase().includes("pending")) return <Hourglass className="h-5 w-5" />;
    if (status.toLowerCase().includes("confirmed")) return <PackageOpen className="h-5 w-5" />;
    if (status.toLowerCase().includes("packed")) return <Package className="h-5 w-5" />;
    if (status.toLowerCase().includes("dispatch")) return <PackageCheck className="h-5 w-5" />;
    if (status.toLowerCase().includes("shipped")) return <Truck className="h-5 w-5" />;
    if (status.toLowerCase().includes("in transit")) return <Truck className="h-5 w-5" />;
    if (status.toLowerCase().includes("out for delivery")) return <Truck className="h-5 w-5" />;
    if (status.toLowerCase().includes("delivered")) return <Home className="h-5 w-5" />;
    if (status.toLowerCase().includes('cancelled') || status.toLowerCase().includes('undelivered') || status.toLowerCase().includes('failed delivery attempt') || status.toLowerCase().includes('return')) return <XCircle className="h-5 w-5" />;
    return <Circle className="h-5 w-5" />;
};


export default function AdminOrdersPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    if (!loading && userData?.role === 'admin') {
        setIsLoading(true);
        const db = getFirestore();
        const ordersRef = collection(db, "orders");
        let q = query(ordersRef, orderBy("orderDate", "desc"));
        
        try {
            const querySnapshot = await getDocs(q);
            const fetchedOrders: Order[] = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                orderId: doc.id
            } as Order));
            setOrders([...fetchedOrders, ...mockOrders]);
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast({
                variant: "destructive",
                title: "Error fetching orders",
                description: "Could not retrieve orders from the database. Showing mock data."
            });
            setOrders(mockOrders);
        } finally {
            setIsLoading(false);
        }
    } else if (!loading) {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [loading, userData]);

  const handleCancelOrder = async (orderId: string) => {
    if (orderId.startsWith('#MOCK')) {
        toast({
            title: "Demo Action",
            description: "Cancelling mock orders is disabled.",
        });
        return;
    }
    // Logic for cancelling real orders would go here
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
        const status = getStatusFromTimeline(order.timeline);
        const statusMatch = statusFilter === "All" || status === statusFilter;
        const typeMatch = typeFilter === "All" || order.type === typeFilter;
        const searchMatch = debouncedSearchTerm
            ? order.orderId.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
              order.address.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
              (order.products && order.products.some(p => p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())))
            : true;
        return statusMatch && typeMatch && searchMatch;
    });
  }, [orders, debouncedSearchTerm, statusFilter, typeFilter]);


  if (loading || isLoading || !userData || userData?.role !== 'admin') {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>
  }
  
  const getStatusBadgeVariant = (status: string): BadgeProps['variant'] => {
    switch (status) {
        case 'Delivered': return 'success';
        case 'Shipped': case 'In Transit': case 'Out for Delivery': return 'warning';
        case 'Cancelled by user': case 'Cancelled by admin': case 'Returned': return 'destructive';
        case 'Pending': case 'Order Confirmed': return 'info';
        default: return 'outline';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: "Copied!",
        description: `${text} has been copied to your clipboard.`,
    });
  };

  return (
    <AdminLayout>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <CardTitle>All Orders</CardTitle>
                            <CardDescription>Manage and view all customer orders.</CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                             <div className="relative flex-grow">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                type="search"
                                placeholder="Search by Order ID, name..."
                                className="pl-8 w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <ListFilter className="h-4 w-4 mr-2" />
                                        Filter
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                                        <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Pending">Pending</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Order Confirmed">Confirmed</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Shipped">Shipped</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Delivered">Delivered</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Cancelled by admin">Cancelled</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                     <DropdownMenuRadioGroup value={typeFilter} onValueChange={setTypeFilter}>
                                        <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Live Stream">Live Stream</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Listed Product">Listed Product</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Product(s)</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.length > 0 ? filteredOrders.map(order => (
                                <TableRow key={order.orderId}>
                                    <TableCell className="font-medium cursor-pointer hover:underline" onClick={() => setSelectedOrder(order)}>
                                        {order.orderId}
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/admin/users/${order.userId}`} className="hover:underline">
                                            {order.address.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            {order.products.map((p, index) => (
                                                <Link key={`${p.key}-${index}`} href={`/product/${p.key}`} className="hover:underline text-sm">
                                                    {p.name} {p.size && `(${p.size})`} {p.color && `(${p.color})`} {p.quantity > 1 && `x${p.quantity}`}
                                                </Link>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={order.type === 'Live Stream' ? 'destructive' : 'secondary'} className="text-xs">
                                            <div className="flex items-center gap-1">
                                                {order.type === 'Live Stream' && <Video className="h-3 w-3"/>}
                                                {order.type}
                                            </div>
                                        </Badge>
                                    </TableCell>
                                    <TableCell><Badge variant={getStatusBadgeVariant(getStatusFromTimeline(order.timeline))}>{getStatusFromTimeline(order.timeline)}</Badge></TableCell>
                                    <TableCell className="text-right">₹{order.total.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreVertical className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onSelect={() => setSelectedOrder(order)}>View Order Details</DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => copyToClipboard(order.orderId)}>Copy Order ID</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem 
                                                            className="text-destructive focus:bg-destructive/10 focus:text-destructive" 
                                                            onSelect={(e) => e.preventDefault()}
                                                            disabled={getStatusFromTimeline(order.timeline).toLowerCase().includes('cancelled')}
                                                        >
                                                            <XCircle className="mr-2 h-4 w-4" /> Cancel Order
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will cancel the order for the customer. This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Go Back</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleCancelOrder(order.orderId)}>Confirm Cancellation</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No orders found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>1-{filteredOrders.length}</strong> of <strong>{filteredOrders.length}</strong> orders
                    </div>
                </CardFooter>
            </Card>
        </main>
        <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
            <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
                {selectedOrder && (
                     <>
                        <SheetHeader className="mb-4">
                            <SheetTitle>Order Details</SheetTitle>
                            <SheetDescription>
                                Order ID: {selectedOrder.orderId} • Date: {format(new Date(selectedOrder.orderDate), "PP")}
                            </SheetDescription>
                        </SheetHeader>
                        <Separator />
                        <div className="py-4 space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                 <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Buyer Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm">
                                         <Link href={`/admin/users/${selectedOrder.userId}`} className="font-medium hover:underline">{selectedOrder.address.name}</Link>
                                        <address className="not-italic text-muted-foreground">
                                            {selectedOrder.address.village}<br />
                                            {selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.pincode}<br/>
                                            {selectedOrder.address.phone}
                                        </address>
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">Seller Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm">
                                        <Link href={`/admin/users/${selectedOrder.sellerId}`} className="font-medium hover:underline">{selectedOrder.products[0].sellerName || 'N/A'}</Link>
                                    </CardContent>
                                </Card>
                            </div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Delivery Timeline</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-4">
                                        {selectedOrder.timeline.map((item, index) => (
                                            <li key={index} className="flex items-start gap-4">
                                                <div className="flex flex-col items-center">
                                                    <div className={cn("flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-muted", item.completed && "bg-primary text-primary-foreground")}>
                                                        {getStatusIcon(item.status)}
                                                    </div>
                                                    {index < selectedOrder.timeline.length - 1 && (
                                                        <div className="w-0.5 flex-1 bg-border" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{item.status}</p>
                                                    <p className="text-sm text-muted-foreground">{item.date} {item.time}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    </AdminLayout>
  );
}

    