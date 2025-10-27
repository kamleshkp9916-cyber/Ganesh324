
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
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import React, { useState, useEffect, useMemo } from "react"
import { getFirestore, collection, query, getDocs, orderBy } from "firebase/firestore"
import { getFirestoreDb } from "@/lib/firebase"

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
  DropdownMenuSubContent
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useDebounce } from "@/hooks/use-debounce";

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
    }
];


export default function AdminOrdersPage() {
  const { user, userData, loading } = useAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { toast } = useToast();

  const fetchOrders = async () => {
    if (!loading && userData?.role === 'admin') {
        setIsLoading(true);
        const db = getFirestoreDb();
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, orderBy("orderDate", "desc"));
        
        try {
            const querySnapshot = await getDocs(q);
            const fetchedOrders: Order[] = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                orderId: doc.id
            } as Order));
            // Combine fetched orders with mock orders
            setOrders([...fetchedOrders, ...mockOrders]);
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast({
                variant: "destructive",
                title: "Error fetching orders",
                description: "Could not retrieve orders from the database. Showing mock data."
            });
            // If fetch fails, still show mock data
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
    return orders.filter(order =>
        order.orderId.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        order.address.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (order.products && order.products.some(p => p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())))
    );
  }, [orders, debouncedSearchTerm]);

  if (loading || isLoading || !userData || userData.role !== 'admin') {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: "Copied!",
        description: `${text} has been copied to your clipboard.`,
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-40">
            <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base"><ShieldCheck className="h-6 w-6" /><span className="sr-only">Admin</span></Link>
                <Link href="/admin/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">Dashboard</Link>
                <Link href="/admin/orders" className="text-foreground transition-colors hover:text-foreground">Orders</Link>
                <Link href="/admin/users" className="text-muted-foreground transition-colors hover:text-foreground">Users</Link>
                <Link href="/admin/inquiries" className="text-muted-foreground transition-colors hover:text-foreground">Inquiries</Link>
                <Link href="/admin/messages" className="text-muted-foreground transition-colors hover:text-foreground">Messages</Link>
                <Link href="/admin/products" className="text-muted-foreground transition-colors hover:text-foreground">Products</Link>
                 <Link href="/admin/live-control" className="text-muted-foreground transition-colors hover:text-foreground">Live Control</Link>
                 <Link href="/admin/settings" className="text-muted-foreground transition-colors hover:text-foreground">Settings</Link>
            </nav>
            <Sheet>
                <SheetTrigger asChild><Button variant="outline" size="icon" className="shrink-0 md:hidden"><Menu className="h-5 w-5" /><span className="sr-only">Menu</span></Button></SheetTrigger>
                <SheetContent side="left">
                    <SheetHeader>
                        <SheetTitle className="sr-only">Admin Navigation Menu</SheetTitle>
                    </SheetHeader>
                    <nav className="grid gap-6 text-lg font-medium">
                        <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-semibold"><ShieldCheck className="h-6 w-6" /><span>Admin Panel</span></Link>
                        <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
                        <Link href="/admin/orders" className="hover:text-foreground">Orders</Link>
                        <Link href="/admin/users" className="text-muted-foreground hover:text-foreground">Users</Link>
                        <Link href="/admin/inquiries" className="text-muted-foreground hover:text-foreground">Inquiries</Link>
                        <Link href="/admin/messages" className="text-muted-foreground hover:text-foreground">Messages</Link>
                        <Link href="/admin/products" className="text-muted-foreground hover:text-foreground">Products</Link>
                         <Link href="/admin/live-control" className="text-muted-foreground hover:text-foreground">Live Control</Link>
                         <Link href="/admin/settings" className="text-muted-foreground hover:text-foreground">Settings</Link>
                    </nav>
                </SheetContent>
            </Sheet>
            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                <form className="ml-auto flex-1 sm:flex-initial" onSubmit={(e) => e.preventDefault()}>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="search" placeholder="Search orders..." className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </form>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="rounded-full">
                            <Avatar className="h-9 w-9"><AvatarImage src={user?.photoURL || 'https://placehold.co/40x40.png'} /><AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback></Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Admin Account</DropdownMenuLabel><DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => router.push('/settings')}>Settings</DropdownMenuItem><DropdownMenuSeparator />
                        <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>All Orders</CardTitle>
                    <CardDescription>Manage and view all customer orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.length > 0 ? filteredOrders.map(order => (
                                <TableRow key={order.orderId}>
                                    <TableCell className="font-medium">{order.orderId}</TableCell>
                                    <TableCell>{order.address.name}</TableCell>
                                    <TableCell>
                                        <Link href={`/product/${order.products[0].key}`} className="hover:underline">
                                            {order.products[0].name}{order.products.length > 1 ? ` + ${order.products.length - 1} more` : ''}
                                        </Link>
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
                                                <DropdownMenuItem onSelect={() => router.push(`/delivery-information/${order.orderId}`)}>View Order Details</DropdownMenuItem>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>Transaction Details</DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent className="p-2 w-72">
                                                        <div className="space-y-2 text-sm">
                                                             <div className="flex items-start gap-2">
                                                                <Hash className="h-4 w-4 mt-0.5 text-muted-foreground"/>
                                                                <div>
                                                                    <p className="font-semibold">Transaction ID</p>
                                                                    <p className="text-muted-foreground font-mono text-xs">{order.transactionId || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-start gap-2">
                                                                <Home className="h-4 w-4 mt-0.5 text-muted-foreground"/>
                                                                <div>
                                                                    <p className="font-semibold">Address</p>
                                                                    <p className="text-muted-foreground">{order.address.village}, {order.address.city}, {order.address.state} - {order.address.pincode}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <CreditCard className="h-4 w-4 text-muted-foreground"/>
                                                                <p><span className="font-semibold">Payment:</span> {order.paymentMethod || 'N/A'} (<Badge variant={order.paymentStatus === 'holding' ? 'warning' : order.paymentStatus === 'released' ? 'success' : 'destructive'} className="text-xs">{order.paymentStatus || 'N/A'}</Badge>)</p>
                                                            </div>
                                                             <div className="flex items-center gap-2">
                                                                <RotateCcw className="h-4 w-4 text-muted-foreground"/>
                                                                <p><span className="font-semibold">Refund:</span> {order.refundStatus || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>
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
    </div>
  );
}

    