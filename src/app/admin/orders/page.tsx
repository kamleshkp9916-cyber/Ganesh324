
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
import { useAuth } from "@/hooks/use-auth.tsx"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { getStatusFromTimeline } from "@/lib/order-data"
import { useAuthActions } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { updateOrderStatus } from "@/ai/flows/chat-flow"

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

export default function AdminOrdersPage() {
  const { user, userData, loading } = useAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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
            setOrders(fetchedOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast({
                variant: "destructive",
                title: "Error fetching orders",
                description: "Could not retrieve orders from the database."
            });
        } finally {
            setIsLoading(false);
        }
    } else if (!loading) {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, userData]);

  const handleCancelOrder = async (orderId: string) => {
    try {
        await updateOrderStatus(orderId, 'Cancelled by admin');
        toast({
            title: "Order Cancelled",
            description: `Order ${orderId} has been successfully cancelled.`,
        });
        // Refetch orders to show the updated status
        fetchOrders();
    } catch (error) {
        console.error("Error cancelling order:", error);
        toast({
            variant: "destructive",
            title: "Cancellation Failed",
            description: "Could not cancel the order. Please try again.",
        });
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order =>
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.address.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.products && order.products.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [orders, searchTerm]);

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
                <Link href="/admin/products" className="text-muted-foreground transition-colors hover:text-foreground">Products</Link>
            </nav>
            <Sheet>
                <SheetTrigger asChild><Button variant="outline" size="icon" className="shrink-0 md:hidden"><Menu className="h-5 w-5" /><span className="sr-only">Menu</span></Button></SheetTrigger>
                <SheetContent side="left">
                    <nav className="grid gap-6 text-lg font-medium">
                        <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-semibold"><ShieldCheck className="h-6 w-6" /><span>Admin Panel</span></Link>
                        <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
                        <Link href="/admin/orders" className="hover:text-foreground">Orders</Link>
                        <Link href="/admin/users" className="text-muted-foreground hover:text-foreground">Users</Link>
                        <Link href="/admin/inquiries" className="text-muted-foreground hover:text-foreground">Inquiries</Link>
                        <Link href="/admin/products" className="text-muted-foreground hover:text-foreground">Products</Link>
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
                                    <TableCell>{order.products[0].name}{order.products.length > 1 ? ` + ${order.products.length - 1} more` : ''}</TableCell>
                                    <TableCell><Badge variant={getStatusBadgeVariant(getStatusFromTimeline(order.timeline))}>{getStatusFromTimeline(order.timeline)}</Badge></TableCell>
                                    <TableCell className="text-right">₹{order.total.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreVertical className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onSelect={() => router.push(`/delivery-information/${order.orderId}`)}>View Details</DropdownMenuItem>
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
                                    <TableCell colSpan={6} className="h-24 text-center">
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
